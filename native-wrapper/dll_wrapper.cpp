#include <iostream>
#include <string>
#include <vector>
#include <windows.h>
#include <fcntl.h>
#include <io.h>
#include <sstream> // Required for std::wstringstream
#include <iomanip> // Required for std::fixed and std::setprecision

// Include the single-header JSON library
#include "json.hpp"

// Use the nlohmann namespace for convenience
using json = nlohmann::json;

// --- Helper function to convert string card type to int ---
int mapCardType(const std::string& typeStr) {
    if (typeStr == "E63") return 47;
    if (typeStr == "E62") return 58;
    // Add other mappings as needed
    return 0; // Default/unknown type
}

// --- Crash handler and Typedefs ---
LONG WINAPI MyUnhandledExceptionFilter(struct _EXCEPTION_POINTERS* ExceptionInfo) {
    DWORD exceptionCode = ExceptionInfo->ExceptionRecord->ExceptionCode;
    std::wcout << L"{\"success\": false, \"error\": \"CRITICAL_CRASH: Unhandled exception caught!\", \"exception_code\": " << exceptionCode << L"}" << std::endl;
    return EXCEPTION_EXECUTE_HANDLER;
}
typedef int (__stdcall *HD_GetSDKLastError)();
typedef int (__stdcall *HD_CreateScreen)(int, int, int, int, int, void*, int);
typedef int (__stdcall *HD_AddProgram)(void*, int, int, void*, int);
typedef int (__stdcall *HD_AddArea)(int, int, int, int, int, void*, int, int, void*, int);
typedef int (__stdcall *HD_AddSimpleTextAreaItem)(int, void*, int, int, int, void*, int, int, int, int, int, void*, int);
typedef int (__stdcall *HD_SendScreen)(int, void*, void*, void*, int);

// --- Main Application ---
int main() {
    SetUnhandledExceptionFilter(MyUnhandledExceptionFilter);
    _setmode(_fileno(stdout), _O_U16TEXT);

    // 1. Read JSON from stdin
    std::string json_line;
    std::getline(std::cin, json_line);
    if (json_line.empty()) {
        std::wcout << L"{\"success\": false, \"error\": \"No JSON input received.\"}" << std::endl;
        return 1;
    }

    // 2. Parse JSON
    json data;
    try {
        data = json::parse(json_line);
    } catch (json::parse_error& e) {
        std::string err = e.what();
        std::wcout << L"{\"success\": false, \"error\": \"JSON parse error\", \"details\": \"" << std::wstring(err.begin(), err.end()) << L"\"}" << std::endl;
        return 1;
    }

    // 3. Extract data and run DLL logic
    try {
        // Extract config data
        auto& config = data["config"];
        std::string ip_address_str = config["displayIpAddress"];
        int nWidth = config["screenWidth"];
        int nHeight = config["screenHeight"];
        std::string cardType_str = config["cardType"];
        std::string fontName_str = config["fontName"];
        int nFontHeight = config["fontHeight"];

        // Extract fuel data
        auto& fuelItems = data["fuelItems"];
        if (fuelItems.empty()) {
            throw std::runtime_error("FuelItems array is empty.");
        }
        auto& firstFuelItem = fuelItems[0];
        std::string fuel_name_str = firstFuelItem["name"];
        double fuel_price = firstFuelItem["price"];

        // Convert strings to wide strings for the DLL
        std::wstring ip_address_ws(ip_address_str.begin(), ip_address_str.end());
        std::wstring fontName_ws(fontName_str.begin(), fontName_str.end());
        
        std::wstringstream ss;
        ss << std::wstring(fuel_name_str.begin(), fuel_name_str.end()) << L": " << std::fixed << std::setprecision(3) << fuel_price;
        std::wstring displayText = ss.str();

        int nCardType = mapCardType(cardType_str);

        // --- DLL Call Sequence ---
        HINSTANCE hDll = LoadLibraryW(L"HDSdk.dll");
        if (!hDll) { throw std::runtime_error("Failed to load HDSdk.dll"); }

        HD_GetSDKLastError Hd_GetSDKLastError_ptr = (HD_GetSDKLastError)GetProcAddress(hDll, "Hd_GetSDKLastError");
        HD_CreateScreen Hd_CreateScreen_ptr = (HD_CreateScreen)GetProcAddress(hDll, "Hd_CreateScreen");
        HD_AddProgram Hd_AddProgram_ptr = (HD_AddProgram)GetProcAddress(hDll, "Hd_AddProgram");
        HD_AddArea Hd_AddArea_ptr = (HD_AddArea)GetProcAddress(hDll, "Hd_AddArea");
        HD_AddSimpleTextAreaItem Hd_AddSimpleTextAreaItem_ptr = (HD_AddSimpleTextAreaItem)GetProcAddress(hDll, "Hd_AddSimpleTextAreaItem");
        HD_SendScreen Hd_SendScreen_ptr = (HD_SendScreen)GetProcAddress(hDll, "Hd_SendScreen");

        if (!Hd_GetSDKLastError_ptr || !Hd_CreateScreen_ptr || !Hd_AddProgram_ptr || !Hd_AddArea_ptr || !Hd_AddSimpleTextAreaItem_ptr || !Hd_SendScreen_ptr) {
            throw std::runtime_error("Failed to get one or more function pointers.");
        }

        // --- Call sequence with improved error handling ---
        if (Hd_CreateScreen_ptr(nWidth, nHeight, 0, 1, nCardType, nullptr, 0) != 0) {
            throw std::runtime_error("Hd_CreateScreen failed with code: " + std::to_string(Hd_GetSDKLastError_ptr()));
        }

        int nProgramID = Hd_AddProgram_ptr(nullptr, 0, 0, nullptr, 0);
        if (nProgramID == -1) {
            throw std::runtime_error("Hd_AddProgram failed with code: " + std::to_string(Hd_GetSDKLastError_ptr()));
        }

        int nAreaID = Hd_AddArea_ptr(nProgramID, 0, 0, nWidth, nHeight, nullptr, 0, 5, nullptr, 0);
        if (nAreaID == -1) {
            throw std::runtime_error("Hd_AddArea failed with code: " + std::to_string(Hd_GetSDKLastError_ptr()));
        }
        
        int nAreaItemID = Hd_AddSimpleTextAreaItem_ptr(nAreaID, (void*)displayText.c_str(), 255, 0, 0x0004, (void*)fontName_ws.c_str(), nFontHeight, 0, 25, 0, 65535, nullptr, 0);
        if (nAreaItemID == -1) {
            throw std::runtime_error("Hd_AddSimpleTextAreaItem failed with code: " + std::to_string(Hd_GetSDKLastError_ptr()));
        }

        if (Hd_SendScreen_ptr(0, (void*)ip_address_ws.c_str(), nullptr, nullptr, 0) != 0) {
            int errorCode = Hd_GetSDKLastError_ptr();
            std::string errorMsg = "Hd_SendScreen failed with code: " + std::to_string(errorCode);
            if (errorCode == 13) {
                errorMsg += ". HINT: This is a timeout error. Check if the device is powered on, connected to the network, and that the IP address is correct. Also check for firewalls.";
            }
            throw std::runtime_error(errorMsg);
        }

        FreeLibrary(hDll);
        std::wcout << L"{\"success\": true, \"message\": \"Screen data sent successfully.\"}" << std::endl;

    } catch (const std::exception& e) {
        std::string err = e.what();
        std::wcout << L"{\"success\": false, \"error\": \"" << std::wstring(err.begin(), err.end()) << L"\"}" << std::endl;
        return 1;
    }

    return 0;
}