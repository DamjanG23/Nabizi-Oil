#include <iostream>
#include <windows.h>
#include <string>
#include <io.h>      // Required for _setmode
#include <fcntl.h>   // Required for _O_U16TEXT

// Define the function types from your DLL
typedef int (*Hd_CreateScreenFunc)(int nWidth, int nHeight, int nColor, int nGray, int nCardType, void *pExParamsBuf, int nBufSize);
typedef int (*Hd_SendScreenFunc)(int nSendType, void *pStrParams, void *pDeviceGUID, void *pExParamsBuf, int nBufSize);
typedef int (*Hd_AddAreaFunc)(int nProgramID, int nX, int nY, int nWidth, int nHeight, void *pBoderImgPath, int nBorderEffect, int nBorderSpeed, void *pExParamsBuf, int nBufSize);
typedef int (*Hd_AddSimpleTextAreaItemFunc)(int nAreaID, void *pText, int nTextColor, int nBackGroupColor, int nStyle, void *pFontName, int nFontHeight, int nShowEffect, int nShowSpeed, int nClearType, int nStayTime, void *pExParamsBuf, int nBufSize);

// Helper for colors
#define HD_RED RGB(255, 0, 0)
#define HD_BLACK RGB(0, 0, 0)

int main() {
    // Set console mode to handle UTF-16 I/O correctly
    _setmode(_fileno(stdout), _O_U16TEXT);
    _setmode(_fileno(stdin), _O_U16TEXT);

    try {
        // Use wstring for UTF-16
        std::wstring ipAddress;
        if (!std::getline(std::wcin, ipAddress)) {
            std::wcout << L"{\"success\": false, \"error\": \"No input received\"}" << std::endl;
            return 1;
        }
        
        // Use LoadLibraryW for wide character support
        HMODULE hDll = LoadLibraryW(L"HDSDK.dll");
        if (!hDll) {
            std::wcout << L"{\"success\": false, \"error\": \"Failed to load HDSDK.dll\"}" << std::endl;
            return 1;
        }

        // GetProcAddress still uses standard char* for function names
        Hd_CreateScreenFunc createScreen = (Hd_CreateScreenFunc)GetProcAddress(hDll, "Hd_CreateScreen");
        Hd_SendScreenFunc sendScreen = (Hd_SendScreenFunc)GetProcAddress(hDll, "Hd_SendScreen");
        Hd_AddAreaFunc addArea = (Hd_AddAreaFunc)GetProcAddress(hDll, "Hd_AddArea");
        Hd_AddSimpleTextAreaItemFunc addSimpleText = (Hd_AddSimpleTextAreaItemFunc)GetProcAddress(hDll, "Hd_AddSimpleTextAreaItem");

        if (!createScreen || !sendScreen || !addArea || !addSimpleText) {
             std::wcout << L"{\"success\": false, \"error\": \"Failed to find one or more required functions in DLL\"}" << std::endl;
            FreeLibrary(hDll);
            return 1;
        }

        // 1. Create screen
        // --- MODIFIED LINE: Using a specific card type (A40 = 20) instead of default 0 ---
        int createResult = createScreen(320, 240, 2, 1, 20, 0, 0);
        if (createResult != 0) {
            std::wcout << L"{\"success\": false, \"error\": \"Failed to create screen, code: " << createResult << L"\"}" << std::endl;
            FreeLibrary(hDll);
            return 1;
        }

        // Add a small delay for the hardware to initialize
        Sleep(100);

        // 2. Add an area
        int areaId = addArea(0, 0, 0, 320, 240, 0, 0, 0, 0, 0);
        if (areaId == -1) {
            std::wcout << L"{\"success\": false, \"error\": \"Failed to add area.\"}" << std::endl;
            FreeLibrary(hDll);
            return 1;
        }

        // 3. Add text using the correct function and wide strings (L"...")
        int textResult = addSimpleText(
            areaId,
            (void*)L"Test OK",       // Text (as wide string)
            HD_RED,                 // Text color
            HD_BLACK,               // Background color
            0x0004,                 // Style (Align horizontal and vertical center)
            (void*)L"Arial",        // Font name (as wide string)
            16,                     // Font height
            1,                      // Show effect (static)
            25,                     // Show speed
            0,                      // Clear type
            3,                      // Stay time (3 seconds)
            0, 0
        );

        if (textResult != 0) {
             std::wcout << L"{\"success\": false, \"error\": \"Failed to add simple text item.\"}" << std::endl;
            FreeLibrary(hDll);
            return 1;
        }

        // 4. Send to screen
        std::wstring sendParams = L"IP=" + ipAddress;
        int sendResult = sendScreen(0, (void*)sendParams.c_str(), 0, 0, 0);

        if (sendResult != 0) {
            std::wcout << L"{\"success\": false, \"error\": \"Failed to send to screen, code: " << sendResult << L"\"}" << std::endl;
            FreeLibrary(hDll);
            return 1;
        }

        std::wcout << L"{\"success\": true, \"message\": \"Screen data sent successfully to " << ipAddress << L"\"}" << std::endl;
        
        FreeLibrary(hDll);
        return 0;
        
    } catch (...) {
        std::wcout << L"{\"success\": false, \"error\": \"Unexpected error occurred\"}" << std::endl;
        return 1;
    }
}