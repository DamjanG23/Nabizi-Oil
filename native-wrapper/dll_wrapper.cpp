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

// ------------------------------ Maps string-based card types to integer codes ------------------------------ //
int mapCardType(const std::string& typeStr) {
    if (typeStr == "E63") return 47;
    if (typeStr == "E62") return 58;
    return 0;
}

// ------------------------------ Catches crashes and prints JSON-formatted error ------------------------------ //
LONG WINAPI MyUnhandledExceptionFilter(struct _EXCEPTION_POINTERS* ExceptionInfo) {
    DWORD exceptionCode = ExceptionInfo->ExceptionRecord->ExceptionCode;
    std::wcout << L"{\"success\": false, \"error\": \"CRITICAL_CRASH: Unhandled exception caught!\", \"exception_code\": "
               << exceptionCode << L"}" << std::endl;
    return EXCEPTION_EXECUTE_HANDLER;
}

// ------------------------------ Typedefs for DLL function pointers - loaded dynamically ------------------------------ //
typedef int (__stdcall *HD_GetSDKLastError)();
typedef int (__stdcall *HD_CreateScreen)(int, int, int, int, int, void*, int);
typedef int (__stdcall *HD_AddProgram)(void*, int, int, void*, int);
typedef int (__stdcall *HD_AddArea)(int, int, int, int, int, void*, int, int, void*, int);
typedef int (__stdcall *HD_AddSimpleTextAreaItem)(int, void*, int, int, int, void*, int, int, int, int, int, void*, int);
typedef int (__stdcall *HD_SendScreen)(int, void*, void*, void*, int);
typedef int (__stdcall *HD_Cmd_AdjustTime)(int, void*, void*);

// ------------------------------ Main Cpp Application ------------------------------ //
int main() {
    // ---------- Global handler to catch any unhandled exceptions ---------- //
    SetUnhandledExceptionFilter(MyUnhandledExceptionFilter);

    // ---------- Set console output mode to UTF-16, for JSON output ---------- //
    _setmode(_fileno(stdout), _O_U16TEXT);

    std::wcout << L"\n" << std::endl;
    std::wcout << L"====================================================================" << std::endl;
    std::wcout << L"          LED DISPLAY CONTROLLER - C++ WRAPPER v1.0                " << std::endl;
    std::wcout << L"====================================================================" << std::endl;

    // ---------- Read JSON input (piped from electron) ---------- //
    std::wcout << L"\n[INPUT] Reading JSON payload from stdin..." << std::endl;
    std::string json_line;
    std::getline(std::cin, json_line);
    if (json_line.empty()) {
        std::wcout << L"[INPUT] [X] ERROR: No JSON input received" << std::endl;
        std::wcout << L"{\"success\": false, \"error\": \"No JSON input received.\"}" << std::endl;
        return 1;
    }
    std::wcout << L"[INPUT] [OK] JSON received (" << json_line.length() << L" bytes)" << std::endl;

    // ---------- Parse JSON string into structured data ---------- //
    std::wcout << L"[INPUT] Parsing JSON data..." << std::endl;
    json data;
    try {
        data = json::parse(json_line);
        std::wcout << L"[INPUT] [OK] JSON parsed successfully" << std::endl;
    } catch (json::parse_error& e) {
        // If parsing fails, report error details
        std::string err = e.what();
        std::wcout << L"[INPUT] [X] JSON parse failed: " << std::wstring(err.begin(), err.end()) << std::endl;
        std::wcout << L"{\"success\": false, \"error\": \"JSON parse error\", \"details\": \""
                   << std::wstring(err.begin(), err.end()) << L"\"}" << std::endl;
        return 1;
    }

    // ------------------------------ Extract configuration and interact with DLL ------------------------------ //
    try {
        std::wcout << L"\n====================================================================" << std::endl;
        std::wcout << L"                  CONFIGURATION EXTRACTION                          " << std::endl;
        std::wcout << L"====================================================================" << std::endl;

        // ---------- Get "config" section from parsed JSON ---------- //
        auto& config = data["config"];
        std::wcout << L"[CONFIG] Extracting configuration parameters..." << std::endl;

        // ---------- Extract individual configuration parameters ---------- //
        std::string ip_address_str = config["displayIpAddress"];
        std::string cardType_str = config["cardType"];
        std::string fontName_str = config["fontName"];

        // ---------- Optional parameters with default values ---------- //
        std::string rowColumn_str = config.value("rowColumn", "R");
        std::string doubleSided_str = config.value("doubleSided", "N");
        bool isDoubleSided = (doubleSided_str == "Y" || doubleSided_str == "y");
        
        // ---------- Time display parameters ---------- //
        std::string timeDisplayIpAddress_str = config.value("timeDisplayIpAddress", "");
        std::string adjustTime_str = config.value("adjustTime", "N");

        // ---------- Screen dimensions and font settings ---------- //
        int nWidth = config["screenWidth"];
        int nHeight = config["screenHeight"];
        int nFontHeight = config["fontHeight"];
        int nDecimalFontHeight = config.value("decimalFontHeight", nFontHeight);

        // ---------- Convert strings to wide strings for DLL function compatibility ---------- //
        std::wstring ip_address_ws(ip_address_str.begin(), ip_address_str.end());
        std::wstring fontName_ws(fontName_str.begin(), fontName_str.end());
        int nCardType = mapCardType(cardType_str);

        // ---------- Log parsed configuration details ---------- //
        std::wcout << L"[CONFIG] [OK] Configuration loaded:" << std::endl;
        std::wcout << L"         Display IP: " << ip_address_ws << std::endl;
        std::wcout << L"         Card Type: " << std::wstring(cardType_str.begin(), cardType_str.end()) << L" (Code: " << nCardType << L")" << std::endl;
        std::wcout << L"         Screen Size: " << nWidth << L"x" << nHeight << L" pixels" << std::endl;
        std::wcout << L"         Layout: " << std::wstring(rowColumn_str.begin(), rowColumn_str.end()) 
                   << L" (Double-sided: " << (isDoubleSided ? L"Yes" : L"No") << L")" << std::endl;
        std::wcout << L"         Font: " << fontName_ws << L" (Height: " << nFontHeight 
                   << L", Decimal: " << nDecimalFontHeight << L")" << std::endl;
        if (!timeDisplayIpAddress_str.empty()) {
            std::wcout << L"         Time Display IP: " << std::wstring(timeDisplayIpAddress_str.begin(), timeDisplayIpAddress_str.end()) 
                       << L" (Adjust: " << std::wstring(adjustTime_str.begin(), adjustTime_str.end()) << L")" << std::endl;
        }

        // ---------- Extract array of fuel items ---------- //
        auto& fuelItems = data["fuelItems"];
        std::wcout << L"[CONFIG] Fuel items count: " << fuelItems.size() << std::endl;
        if (fuelItems.empty()) {
            throw std::runtime_error("FuelItems array is empty.");
        }
        std::wcout << L"[CONFIG] [OK] All parameters validated" << std::endl;

        // ---------- Load the external DLL (HDSdk.dll) ---------- //
        std::wcout << L"\n====================================================================" << std::endl;
        std::wcout << L"                     DLL INITIALIZATION                             " << std::endl;
        std::wcout << L"====================================================================" << std::endl;
        
        std::wcout << L"[DLL] Loading HDSdk.dll..." << std::endl;
        HINSTANCE hDll = LoadLibraryW(L"HDSdk.dll");
        if (!hDll) { throw std::runtime_error("Failed to load HDSdk.dll"); }
        std::wcout << L"[DLL] [OK] HDSdk.dll loaded successfully" << std::endl;

        // ---------- Retrieve function addresses from the DLL ---------- //
        std::wcout << L"[DLL] Resolving function pointers..." << std::endl;
        HD_GetSDKLastError Hd_GetSDKLastError_ptr = (HD_GetSDKLastError)GetProcAddress(hDll, "Hd_GetSDKLastError");
        HD_CreateScreen Hd_CreateScreen_ptr = (HD_CreateScreen)GetProcAddress(hDll, "Hd_CreateScreen");
        HD_AddProgram Hd_AddProgram_ptr = (HD_AddProgram)GetProcAddress(hDll, "Hd_AddProgram");
        HD_AddArea Hd_AddArea_ptr = (HD_AddArea)GetProcAddress(hDll, "Hd_AddArea");
        HD_AddSimpleTextAreaItem Hd_AddSimpleTextAreaItem_ptr = (HD_AddSimpleTextAreaItem)GetProcAddress(hDll, "Hd_AddSimpleTextAreaItem");
        HD_SendScreen Hd_SendScreen_ptr = (HD_SendScreen)GetProcAddress(hDll, "Hd_SendScreen");
        HD_Cmd_AdjustTime Cmd_AdjustTime_ptr = (HD_Cmd_AdjustTime)GetProcAddress(hDll, "Cmd_AdjustTime");

        // ---------- Ensure all required functions were found ---------- //
        if (!Hd_GetSDKLastError_ptr || !Hd_CreateScreen_ptr || !Hd_AddProgram_ptr ||
            !Hd_AddArea_ptr || !Hd_AddSimpleTextAreaItem_ptr || !Hd_SendScreen_ptr) {
            throw std::runtime_error("Failed to get one or more required function pointers.");
        }
        
        std::wcout << L"[DLL] [OK] Required functions resolved:" << std::endl;
        std::wcout << L"      - Hd_GetSDKLastError" << std::endl;
        std::wcout << L"      - Hd_CreateScreen" << std::endl;
        std::wcout << L"      - Hd_AddProgram" << std::endl;
        std::wcout << L"      - Hd_AddArea" << std::endl;
        std::wcout << L"      - Hd_AddSimpleTextAreaItem" << std::endl;
        std::wcout << L"      - Hd_SendScreen" << std::endl;
        
        // ---------- Check optional function pointers ---------- //
        if (!Cmd_AdjustTime_ptr) {
            std::wcout << L"[DLL] [!] Optional function Cmd_AdjustTime not available (time adjustment disabled)" << std::endl;
        } else {
            std::wcout << L"[DLL] [OK] Optional function Cmd_AdjustTime available" << std::endl;
        }

        // ---------- Determine total layout size based on orientation and double-sidedness ---------- //
        std::wcout << L"\n====================================================================" << std::endl;
        std::wcout << L"                      LAYOUT CALCULATION                            " << std::endl;
        std::wcout << L"====================================================================" << std::endl;
        
        int totalWidth, totalHeight;
        std::wcout << L"[LAYOUT] Calculating screen dimensions..." << std::endl;
        std::wcout << L"[LAYOUT] Base module: " << nWidth << L"x" << nHeight << L" pixels" << std::endl;
        std::wcout << L"[LAYOUT] Number of fuel items: " << fuelItems.size() << std::endl;
        std::wcout << L"[LAYOUT] Orientation: " << (rowColumn_str == "C" ? L"Column (vertical)" : L"Row (horizontal)") << std::endl;
        
        if (rowColumn_str == "C") {
            totalWidth = nWidth;
            totalHeight = nHeight * static_cast<int>(fuelItems.size());
            if (isDoubleSided) {
                totalHeight *= 2;
                std::wcout << L"[LAYOUT] Double-sided enabled - doubling height" << std::endl;
            }
        } else {
            totalWidth = nWidth * static_cast<int>(fuelItems.size());
            totalHeight = nHeight;
            if (isDoubleSided) {
                totalWidth *= 2;
                std::wcout << L"[LAYOUT] Double-sided enabled - doubling width" << std::endl;
            }
        }
        
        std::wcout << L"[LAYOUT] [OK] Total screen size: " << totalWidth << L"x" << totalHeight << L" pixels" << std::endl;

        // ---------- Create the screen in memory using DLL ---------- //
        std::wcout << L"\n====================================================================" << std::endl;
        std::wcout << L"                      SCREEN CREATION                               " << std::endl;
        std::wcout << L"====================================================================" << std::endl;
        
        std::wcout << L"[SCREEN] Creating screen buffer: " << totalWidth << L"x" << totalHeight << L" pixels" << std::endl;
        if (Hd_CreateScreen_ptr(totalWidth, totalHeight, 0, 1, nCardType, nullptr, 0) != 0) {
            throw std::runtime_error("Hd_CreateScreen failed with code: " + std::to_string(Hd_GetSDKLastError_ptr()));
        }
        std::wcout << L"[SCREEN] [OK] Screen buffer created successfully" << std::endl;

        // ---------- Add a program to the screen ---------- //
        std::wcout << L"[SCREEN] Creating program container..." << std::endl;
        int nProgramID = Hd_AddProgram_ptr(nullptr, 0, 0, nullptr, 0);
        if (nProgramID == -1) {
            throw std::runtime_error("Hd_AddProgram failed with code: " + std::to_string(Hd_GetSDKLastError_ptr()));
        }
        std::wcout << L"[SCREEN] [OK] Program created (ID: " << nProgramID << L")" << std::endl;

        // ---------- Loop through all fuel items (and possibly twice if double-sided) ---------- //
        std::wcout << L"\n====================================================================" << std::endl;
        std::wcout << L"                   ADDING CONTENT TO SCREEN                         " << std::endl;
        std::wcout << L"====================================================================" << std::endl;
        
        int originalFuelCount = static_cast<int>(fuelItems.size());
        int totalPasses = isDoubleSided ? 2 : 1;
        std::wcout << L"[CONTENT] Adding " << originalFuelCount << L" fuel item(s)" 
                   << (isDoubleSided ? L" × 2 sides" : L"") << std::endl;

        for (int pass = 0; pass < totalPasses; ++pass) {
            for (int i = 0; i < originalFuelCount; ++i) {
                auto& item = fuelItems[i];
                int index = i + pass * originalFuelCount; // Adjust index for second side

                // ---------- Determine coordinates for this fuel item area ---------- //
                int currentX, currentY;
                if (rowColumn_str == "C") {
                    currentX = 0;
                    currentY = index * nHeight;
                } else {
                    currentX = index * nWidth;
                    currentY = 0;
                }

                std::wcout << L"\n[AREA " << index << L"] Creating area at position (X=" << currentX << L", Y=" << currentY << L")" << std::endl;

                // ---------- Add area to the screen ---------- //
                int nAreaID = Hd_AddArea_ptr(nProgramID, currentX, currentY, nWidth, nHeight, nullptr, 0, 5, nullptr, 0);
                if (nAreaID == -1) {
                    throw std::runtime_error("Hd_AddArea for item " + std::to_string(index) +
                                             " failed with code: " + std::to_string(Hd_GetSDKLastError_ptr()));
                }
                std::wcout << L"[AREA " << index << L"] [OK] Hd_AddArea SUCCESS (Area ID: " << nAreaID << L")" << std::endl;

                // ---------- Format fuel price and split into integer and decimal parts ---------- //
                double fuel_price = item["price"];
                std::wstringstream ss;
                ss << std::fixed << std::setprecision(2) << fuel_price;
                std::wstring fullPriceText = ss.str();

                // Split price into integer and decimal parts (e.g., "3.50" -> "3" and ".50")
                size_t dotPos = fullPriceText.find(L'.');
                std::wstring integerPart;
                std::wstring decimalPart;
                
                if (dotPos != std::wstring::npos) {
                    integerPart = fullPriceText.substr(0, dotPos);
                    decimalPart = fullPriceText.substr(dotPos); // includes the dot
                } else {
                    // No decimal point found (shouldn't happen with precision(2), but just in case)
                    integerPart = fullPriceText;
                    decimalPart = L".00";
                }

                std::wcout << L"[AREA " << index << L"] Price: " << fullPriceText 
                           << L" (split into '" << integerPart << L"' + '" << decimalPart << L"')" << std::endl;

                // ---------- Add integer part with regular font height ---------- //
                std::wcout << L"[AREA " << index << L"] Adding integer part '" << integerPart 
                           << L"' (font size: " << nFontHeight << L", position: X=0)" << std::endl;
                
                int nIntegerItemID = Hd_AddSimpleTextAreaItem_ptr(
                    nAreaID, (void*)integerPart.c_str(), 255, 0, 0x0004,
                    (void*)fontName_ws.c_str(), nFontHeight, 0, 25, 0, 65535, nullptr, 0);

                if (nIntegerItemID == -1) {
                    throw std::runtime_error("Hd_AddSimpleTextAreaItem (integer) for item " + std::to_string(index) +
                                             " failed with code: " + std::to_string(Hd_GetSDKLastError_ptr()));
                }
                std::wcout << L"[AREA " << index << L"] [OK] Integer text SUCCESS (Item ID: " << nIntegerItemID << L")" << std::endl;

                // ---------- Calculate X position for decimal part ---------- //
                // Estimate character width: approximately 0.6 * font height for most monospace-ish fonts
                // Adjust this multiplier if needed based on your specific font
                double charWidthRatio = 0.6;
                int estimatedIntegerWidth = static_cast<int>(integerPart.length() * nFontHeight * charWidthRatio);

                // ---------- Add decimal part with smaller font height ---------- //
                std::wcout << L"[AREA " << index << L"] Adding decimal part '" << decimalPart 
                           << L"' (font size: " << nDecimalFontHeight 
                           << L", position: X=" << estimatedIntegerWidth << L")" << std::endl;
                
                int nDecimalItemID = Hd_AddSimpleTextAreaItem_ptr(
                    nAreaID, (void*)decimalPart.c_str(), 255, estimatedIntegerWidth, 0x0004,
                    (void*)fontName_ws.c_str(), nDecimalFontHeight, 0, 25, 0, 65535, nullptr, 0);

                if (nDecimalItemID == -1) {
                    throw std::runtime_error("Hd_AddSimpleTextAreaItem (decimal) for item " + std::to_string(index) +
                                             " failed with code: " + std::to_string(Hd_GetSDKLastError_ptr()));
                }
                std::wcout << L"[AREA " << index << L"] [OK] Decimal text SUCCESS (Item ID: " << nDecimalItemID << L")" << std::endl;
            }
        }

        // ------------------------------ Send final screen data to the LED display device ------------------------------ //
        std::wcout << L"\n====================================================================" << std::endl;
        std::wcout << L"                    SENDING TO DISPLAY                              " << std::endl;
        std::wcout << L"====================================================================" << std::endl;
        
        std::wcout << L"[SEND] Target display: " << ip_address_ws << std::endl;
        std::wcout << L"[SEND] Transmitting screen data..." << std::endl;
        bool sendScreenSuccess = false;
        if (Hd_SendScreen_ptr(0, (void*)ip_address_ws.c_str(), nullptr, nullptr, 0) != 0) {
            // If sending fails, log error code and possible hint but continue execution
            int errorCode = Hd_GetSDKLastError_ptr();
            std::wcout << L"[SEND] [X] FAILED (Error code: " << errorCode << L")";
            if (errorCode == 13) {
                std::wcout << L"\n[SEND] [!] HINT: Timeout error - check device power, network, IP address, firewall";
            }
            std::wcout << std::endl;
            sendScreenSuccess = false;
        } else {
            std::wcout << L"[SEND] [OK] SUCCESS - Screen data transmitted to display" << std::endl;
            sendScreenSuccess = true;
        }

        // ------------------------------ Adjust time on time display if requested ------------------------------ //
        bool adjustTimeSuccess = false;
        if (adjustTime_str == "Y" || adjustTime_str == "y") {
            std::wcout << L"\n====================================================================" << std::endl;
            std::wcout << L"                    TIME SYNCHRONIZATION                            " << std::endl;
            std::wcout << L"====================================================================" << std::endl;
            
            if (!Cmd_AdjustTime_ptr) {
                std::wcout << L"[TIME] [X] SKIPPED - Function not available in DLL" << std::endl;
            } else if (timeDisplayIpAddress_str.empty()) {
                std::wcout << L"[TIME] [X] SKIPPED - No time display IP configured" << std::endl;
            } else {
                // Convert time display IP to wide string
                std::wstring timeDisplayIp_ws(timeDisplayIpAddress_str.begin(), timeDisplayIpAddress_str.end());
                std::wcout << L"[TIME] Target display: " << timeDisplayIp_ws << std::endl;
                std::wcout << L"[TIME] Synchronizing with system time..." << std::endl;
                
                if (Cmd_AdjustTime_ptr(0, (void*)timeDisplayIp_ws.c_str(), nullptr) != 0) {
                    // If time adjustment fails, log error but don't throw (non-critical)
                    int errorCode = Hd_GetSDKLastError_ptr();
                    std::wcout << L"[TIME] [X] FAILED (Error code: " << errorCode << L")";
                    if (errorCode == 13) {
                        std::wcout << L"\n[TIME] [!] HINT: Timeout - check power, network, IP address";
                    }
                    std::wcout << std::endl;
                    adjustTimeSuccess = false;
                } else {
                    std::wcout << L"[TIME] [OK] SUCCESS - Time display synchronized" << std::endl;
                    adjustTimeSuccess = true;
                }
            }
        } else {
            adjustTimeSuccess = true; // Not requested, so count as "success"
        }

        // ---------- Unload DLL from memory ---------- //
        FreeLibrary(hDll);

        // ---------- Output final status message in JSON format ---------- //
        std::wcout << L"\n====================================================================" << std::endl;
        std::wcout << L"                        FINAL SUMMARY                               " << std::endl;
        std::wcout << L"====================================================================" << std::endl;
        std::wcout << L"  Screen Send:     " << (sendScreenSuccess ? L"[OK] SUCCESS" : L"[X] FAILED") << std::endl;
        std::wcout << L"  Time Adjust:     " << (adjustTimeSuccess ? L"[OK] SUCCESS" : L"[X] FAILED") << std::endl;
        std::wcout << L"====================================================================\n" << std::endl;
        
        if (sendScreenSuccess && adjustTimeSuccess) {
            std::wcout << L"{\"success\": true, \"message\": \"Screen data sent and time adjusted successfully.\", \"sendScreen\": true, \"adjustTime\": true}" << std::endl;
        } else if (sendScreenSuccess && !adjustTimeSuccess) {
            std::wcout << L"{\"success\": true, \"message\": \"Screen data sent successfully, but time adjustment failed.\", \"sendScreen\": true, \"adjustTime\": false}" << std::endl;
        } else if (!sendScreenSuccess && adjustTimeSuccess) {
            std::wcout << L"{\"success\": true, \"message\": \"Screen send failed, but time adjustment succeeded.\", \"sendScreen\": false, \"adjustTime\": true}" << std::endl;
        } else {
            std::wcout << L"{\"success\": false, \"message\": \"Both screen send and time adjustment failed.\", \"sendScreen\": false, \"adjustTime\": false}" << std::endl;
        }

    } catch (const std::exception& e) {
        // ---------- Catch and report any exceptions during processing ---------- //
        std::string err = e.what();
        std::wcout << L"{\"success\": false, \"error\": \"" << std::wstring(err.begin(), err.end()) << L"\"}" << std::endl;
        return 1;
    }

    // Exit successfully
    return 0;
}