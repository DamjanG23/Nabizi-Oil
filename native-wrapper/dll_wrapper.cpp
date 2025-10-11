#include <iostream>
#include <string>
#include <vector>
#include <windows.h>
#include <fcntl.h>
#include <io.h>
#include <sstream>
#include <iomanip>
#include "json.hpp"

using json = nlohmann::json;

int mapCardType(const std::string& typeStr) {
    if (typeStr == "E63") return 47;
    if (typeStr == "E62") return 58;
    return 0;
}

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

    // Debug: Output the raw JSON line received from stdin
    std::wstring json_input_ws(json_line.begin(), json_line.end());
    std::wcout << L"[DEBUG] Received JSON input: " << json_input_ws << std::endl;

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
        std::wcout << L"[DEBUG] Starting DLL interaction logic..." << std::endl;

        // Extract configuration
        auto& config = data["config"];
        std::wcout << L"[DEBUG] Config section found." << std::endl;

        std::string ip_address_str = config["displayIpAddress"];
        std::string cardType_str = config["cardType"];
        std::string fontName_str = config["fontName"];

        std::string rowColumn_str = config.value("rowColumn", "R");
        std::string doubleSided_str = config.value("doubleSided", "N");
        bool isDoubleSided = (doubleSided_str == "Y" || doubleSided_str == "y");

        int nWidth = config["screenWidth"];
        int nHeight = config["screenHeight"];
        int nFontHeight = config["fontHeight"];

        std::wcout << L"[DEBUG] Config parsed: IP=" << std::wstring(ip_address_str.begin(), ip_address_str.end())
                << L", CardType=" << std::wstring(cardType_str.begin(), cardType_str.end())
                << L", Font=" << std::wstring(fontName_str.begin(), fontName_str.end())
                << L", FontHeight=" << nFontHeight
                << L", Layout=" << std::wstring(rowColumn_str.begin(), rowColumn_str.end())
                << L", DoubleSided=" << (isDoubleSided ? L"true" : L"false")
                << L", Width=" << nWidth
                << L", Height=" << nHeight << std::endl;

        // Extract fuel data
        auto& fuelItems = data["fuelItems"];
        std::wcout << L"[DEBUG] fuelItems count: " << fuelItems.size() << std::endl;
        if (fuelItems.empty()) {
            throw std::runtime_error("FuelItems array is empty.");
        }

        // Convert strings to wide strings for DLL use
        std::wstring ip_address_ws(ip_address_str.begin(), ip_address_str.end());
        std::wstring fontName_ws(fontName_str.begin(), fontName_str.end());
        int nCardType = mapCardType(cardType_str);
        std::wcout << L"[DEBUG] Converted strings to wide format. CardType mapped to: " << nCardType << std::endl;

        // Load DLL
        std::wcout << L"[DEBUG] Attempting to load HDSdk.dll..." << std::endl;
        HINSTANCE hDll = LoadLibraryW(L"HDSdk.dll");
        if (!hDll) { throw std::runtime_error("Failed to load HDSdk.dll"); }
        std::wcout << L"[DEBUG] HDSdk.dll loaded successfully. Handle: " << hDll << std::endl;

        // Get function pointers
        std::wcout << L"[DEBUG] Resolving function pointers..." << std::endl;
        HD_GetSDKLastError Hd_GetSDKLastError_ptr = (HD_GetSDKLastError)GetProcAddress(hDll, "Hd_GetSDKLastError");
        HD_CreateScreen Hd_CreateScreen_ptr = (HD_CreateScreen)GetProcAddress(hDll, "Hd_CreateScreen");
        HD_AddProgram Hd_AddProgram_ptr = (HD_AddProgram)GetProcAddress(hDll, "Hd_AddProgram");
        HD_AddArea Hd_AddArea_ptr = (HD_AddArea)GetProcAddress(hDll, "Hd_AddArea");
        HD_AddSimpleTextAreaItem Hd_AddSimpleTextAreaItem_ptr = (HD_AddSimpleTextAreaItem)GetProcAddress(hDll, "Hd_AddSimpleTextAreaItem");
        HD_SendScreen Hd_SendScreen_ptr = (HD_SendScreen)GetProcAddress(hDll, "Hd_SendScreen");

        std::wcout << L"[DEBUG] Function pointers resolved:" << std::endl;
        std::wcout << L"  Hd_GetSDKLastError_ptr=" << (void*)Hd_GetSDKLastError_ptr << std::endl;
        std::wcout << L"  Hd_CreateScreen_ptr=" << (void*)Hd_CreateScreen_ptr << std::endl;
        std::wcout << L"  Hd_AddProgram_ptr=" << (void*)Hd_AddProgram_ptr << std::endl;
        std::wcout << L"  Hd_AddArea_ptr=" << (void*)Hd_AddArea_ptr << std::endl;
        std::wcout << L"  Hd_AddSimpleTextAreaItem_ptr=" << (void*)Hd_AddSimpleTextAreaItem_ptr << std::endl;
        std::wcout << L"  Hd_SendScreen_ptr=" << (void*)Hd_SendScreen_ptr << std::endl;

        if (!Hd_GetSDKLastError_ptr || !Hd_CreateScreen_ptr || !Hd_AddProgram_ptr ||
            !Hd_AddArea_ptr || !Hd_AddSimpleTextAreaItem_ptr || !Hd_SendScreen_ptr) {
            throw std::runtime_error("Failed to get one or more function pointers.");
        }
        std::wcout << L"[DEBUG] All required function pointers successfully retrieved." << std::endl;

        // Determine layout
        int totalWidth, totalHeight;
        if (rowColumn_str == "C") {
            totalWidth = nWidth;
            totalHeight = nHeight * static_cast<int>(fuelItems.size());
            if (isDoubleSided) {
                totalHeight *= 2;
                std::wcout << L"[LOG] Double-sided (Column layout): Doubling total height to " << totalHeight << std::endl;
            }
            std::wcout << L"[LOG] Layout: Column. Total Screen Size: " << totalWidth << L"x" << totalHeight << std::endl;
        } else {
            totalWidth = nWidth * static_cast<int>(fuelItems.size());
            totalHeight = nHeight;
            if (isDoubleSided) {
                totalWidth *= 2;
                std::wcout << L"[LOG] Double-sided (Row layout): Doubling total width to " << totalWidth << std::endl;
            }
            std::wcout << L"[LOG] Layout: Row. Total Screen Size: " << totalWidth << L"x" << totalHeight << std::endl;
        }

        std::wcout << L"[DEBUG] Calling Hd_CreateScreen..." << std::endl;
        if (Hd_CreateScreen_ptr(totalWidth, totalHeight, 0, 1, nCardType, nullptr, 0) != 0) {
            throw std::runtime_error("Hd_CreateScreen failed with code: " + std::to_string(Hd_GetSDKLastError_ptr()));
        }
        std::wcout << L"[LOG] Hd_CreateScreen OK." << std::endl;

        std::wcout << L"[DEBUG] Calling Hd_AddProgram..." << std::endl;
        int nProgramID = Hd_AddProgram_ptr(nullptr, 0, 0, nullptr, 0);
        if (nProgramID == -1) {
            throw std::runtime_error("Hd_AddProgram failed with code: " + std::to_string(Hd_GetSDKLastError_ptr()));
        }
        std::wcout << L"[LOG] Hd_AddProgram OK. Program ID: " << nProgramID << std::endl;

        // Loop for each fuel item
        int originalFuelCount = static_cast<int>(fuelItems.size());
        int totalPasses = isDoubleSided ? 2 : 1;

        for (int pass = 0; pass < totalPasses; ++pass) {
            for (int i = 0; i < originalFuelCount; ++i) {
                auto& item = fuelItems[i];
                int index = i + pass * originalFuelCount; // Correct X/Y offset for second pass

                int currentX, currentY;
                if (rowColumn_str == "C") {
                    currentX = 0;
                    currentY = index * nHeight;
                } else {
                    currentX = index * nWidth;
                    currentY = 0;
                }

                std::wcout << L"[LOG] Creating Area " << index << " at (X=" << currentX << ", Y=" << currentY << ")" << std::endl;

                int nAreaID = Hd_AddArea_ptr(nProgramID, currentX, currentY, nWidth, nHeight, nullptr, 0, 5, nullptr, 0);
                if (nAreaID == -1) {
                    throw std::runtime_error("Hd_AddArea for item " + std::to_string(index) + " failed with code: " + std::to_string(Hd_GetSDKLastError_ptr()));
                }
                std::wcout << L"[LOG] Hd_AddArea OK. Area ID: " << nAreaID << std::endl;

                double fuel_price = item["price"];
                std::wstringstream ss;
                ss << std::fixed << std::setprecision(2) << fuel_price;
                std::wstring displayText = ss.str();

                int nAreaItemID = Hd_AddSimpleTextAreaItem_ptr(
                    nAreaID, (void*)displayText.c_str(), 255, 0, 0x0004,
                    (void*)fontName_ws.c_str(), nFontHeight, 0, 25, 0, 65535, nullptr, 0);

                if (nAreaItemID == -1) {
                    throw std::runtime_error("Hd_AddSimpleTextAreaItem for item " + std::to_string(index) +
                                            " failed with code: " + std::to_string(Hd_GetSDKLastError_ptr()));
                }
                std::wcout << L"[LOG] Hd_AddSimpleTextAreaItem OK. Item ID: " << nAreaItemID
                        << " Text: " << displayText << std::endl;
            }
        }

        std::wcout << L"[DEBUG] Preparing to send screen data to device..." << std::endl;
        std::wcout << L"[LOG] Attempting to send to screen at " << ip_address_ws << L"..." << std::endl;
        if (Hd_SendScreen_ptr(0, (void*)ip_address_ws.c_str(), nullptr, nullptr, 0) != 0) {
            int errorCode = Hd_GetSDKLastError_ptr();
            std::string errorMsg = "Hd_SendScreen failed with code: " + std::to_string(errorCode);
            if (errorCode == 13) {
                errorMsg += ". HINT: This is a timeout error. Check if the device is powered on, connected to the network, and that the IP address is correct. Also check for firewalls.";
            }
            throw std::runtime_error(errorMsg);
        }
        std::wcout << L"[LOG] Hd_SendScreen appears to have succeeded." << std::endl;

        std::wcout << L"[DEBUG] Freeing DLL library..." << std::endl;
        FreeLibrary(hDll);
        std::wcout << L"[DEBUG] DLL successfully unloaded." << std::endl;

        // Final output for Electron
        std::wcout << L"{\"success\": true, \"message\": \"Screen data sent successfully.\"}" << std::endl;
        std::wcout << L"[DEBUG] Try block completed successfully." << std::endl;

    } catch (const std::exception& e) {
        std::string err = e.what();
        std::wcout << L"{\"success\": false, \"error\": \"" << std::wstring(err.begin(), err.end()) << L"\"}" << std::endl;
        return 1;
    }


    return 0;
}