#include <iostream>
#include <windows.h>
#include <fcntl.h>
#include <io.h>
#include <string> // Added for clarity with strings

// Crash handler function...
LONG WINAPI MyUnhandledExceptionFilter(struct _EXCEPTION_POINTERS* ExceptionInfo) {
    DWORD exceptionCode = ExceptionInfo->ExceptionRecord->ExceptionCode;
    std::wcout << L"{\"success\": false, \"error\": \"CRITICAL_CRASH: Unhandled exception caught!\", \"exception_code\": " << exceptionCode << L"}" << std::endl;
    return EXCEPTION_EXECUTE_HANDLER;
}

// --- Function Pointer Typedefs with corrected calling convention ---
typedef int (__stdcall *HD_GetSDKLastError)();
typedef int (__stdcall *HD_CreateScreen)(int, int, int, int, int, void*, int);
typedef int (__stdcall *HD_AddProgram)(void*, int, int, void*, int);
typedef int (__stdcall *HD_AddArea)(int, int, int, int, int, void*, int, int, void*, int);
typedef int (__stdcall *HD_AddSimpleTextAreaItem)(int, void*, int, int, int, void*, int, int, int, int, int, void*, int); // New typedef

int main() {
    SetUnhandledExceptionFilter(MyUnhandledExceptionFilter);
    _setmode(_fileno(stdout), _O_U16TEXT);

    // --- 1. Load DLL & 2. Get Function Pointers ---
    HINSTANCE hDll = LoadLibraryW(L"HDSdk.dll");
    if (!hDll) { /*...*/ return 1; }
    HD_GetSDKLastError Hd_GetSDKLastError_ptr = (HD_GetSDKLastError)GetProcAddress(hDll, "Hd_GetSDKLastError");
    HD_CreateScreen Hd_CreateScreen_ptr = (HD_CreateScreen)GetProcAddress(hDll, "Hd_CreateScreen");
    HD_AddProgram Hd_AddProgram_ptr = (HD_AddProgram)GetProcAddress(hDll, "Hd_AddProgram");
    HD_AddArea Hd_AddArea_ptr = (HD_AddArea)GetProcAddress(hDll, "Hd_AddArea");
    HD_AddSimpleTextAreaItem Hd_AddSimpleTextAreaItem_ptr = (HD_AddSimpleTextAreaItem)GetProcAddress(hDll, "Hd_AddSimpleTextAreaItem"); // Get new pointer

    if (!Hd_GetSDKLastError_ptr || !Hd_CreateScreen_ptr || !Hd_AddProgram_ptr || !Hd_AddArea_ptr || !Hd_AddSimpleTextAreaItem_ptr) { // Added check
        std::wcout << L"{\"success\": false, \"error\": \"Failed to get one or more function pointers.\"}" << std::endl;
        FreeLibrary(hDll);
        return 1;
    }
    
    // --- 3. CreateScreen, 4. AddProgram, 5. AddArea (Unchanged) ---
    int nWidth = 32, nHeight = 16, nColor = 0, nGray = 1, nCardType = 58;
    if (Hd_CreateScreen_ptr(nWidth, nHeight, nColor, nGray, nCardType, nullptr, 0) != 0) { /*...*/ return 1; }
    std::wcout << L"{\"status\": \"Hd_CreateScreen OK.\"}" << std::endl;

    int nProgramID = Hd_AddProgram_ptr(nullptr, 0, 0, nullptr, 0);
    if (nProgramID == -1) { /*...*/ return 1; }
    std::wcout << L"{\"status\": \"Hd_AddProgram OK.\", \"program_id\": " << nProgramID << L"}" << std::endl;

    int nAreaID = Hd_AddArea_ptr(nProgramID, 0, 0, nWidth, nHeight, nullptr, 0, 5, nullptr, 0);
    if (nAreaID == -1) { /*...*/ return 1; }
    std::wcout << L"{\"status\": \"Hd_AddArea OK.\", \"area_id\": " << nAreaID << L"}" << std::endl;


    // --- 6. Call Hd_AddSimpleTextAreaItem ---
    wchar_t* pText = L"Hello";                      // Text to display. Must be wide char.
    int nTextColor = 255;                          // Simple red color.
    int nBackGroupColor = 0;                       // Black background.
    int nStyle = 0x0004;                           // Center horizontally and vertically.
    wchar_t* pFontName = L"Arial";                 // A safe, common font.
    int nFontHeight = 12;                          // A font size that fits on the 16px high screen.
    int nShowEffect = 0;                           // Static (no animation).
    int nShowSpeed = 25;                           // Default speed.
    int nClearType = 0;                            // Immediately clear.
    int nStayTime = 3;                             // Stay for 3 seconds.

    int nAreaItemID = Hd_AddSimpleTextAreaItem_ptr(nAreaID, pText, nTextColor, nBackGroupColor, nStyle, pFontName, nFontHeight, nShowEffect, nShowSpeed, nClearType, nStayTime, nullptr, 0);

    if (nAreaItemID == -1) {
        int nErrorCode = Hd_GetSDKLastError_ptr();
        std::wcout << L"{\"success\": false, \"error\": \"Hd_AddSimpleTextAreaItem failed!\", \"sdk_error_code\": " << nErrorCode << L"}" << std::endl;
        FreeLibrary(hDll);
        return 1;
    }

    // --- 7. Report Success ---
    std::wcout << L"{\"success\": true, \"message\": \"Hd_AddSimpleTextAreaItem executed successfully.\", \"area_item_id\": " << nAreaItemID << L"}" << std::endl;

    // --- 8. Clean up ---
    FreeLibrary(hDll);
    return 0;
}