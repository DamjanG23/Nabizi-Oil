#include <iostream>
#include <windows.h>
#include <fcntl.h>
#include <io.h>
#include <string>

// Crash handler function...
LONG WINAPI MyUnhandledExceptionFilter(struct _EXCEPTION_POINTERS* ExceptionInfo) {
    DWORD exceptionCode = ExceptionInfo->ExceptionRecord->ExceptionCode;
    std::wcout << L"{\"success\": false, \"error\": \"CRITICAL_CRASH: Unhandled exception caught!\", \"exception_code\": " << exceptionCode << L"}" << std::endl;
    return EXCEPTION_EXECUTE_HANDLER;
}

// --- Function Pointer Typedefs ---
typedef int (__stdcall *HD_GetSDKLastError)();
typedef int (__stdcall *HD_CreateScreen)(int, int, int, int, int, void*, int);
typedef int (__stdcall *HD_AddProgram)(void*, int, int, void*, int);
typedef int (__stdcall *HD_AddArea)(int, int, int, int, int, void*, int, int, void*, int);
typedef int (__stdcall *HD_AddSimpleTextAreaItem)(int, void*, int, int, int, void*, int, int, int, int, int, void*, int);
typedef int (__stdcall *HD_SendScreen)(int, void*, void*, void*, int); // New typedef

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
    HD_AddSimpleTextAreaItem Hd_AddSimpleTextAreaItem_ptr = (HD_AddSimpleTextAreaItem)GetProcAddress(hDll, "Hd_AddSimpleTextAreaItem");
    HD_SendScreen Hd_SendScreen_ptr = (HD_SendScreen)GetProcAddress(hDll, "Hd_SendScreen"); // Get new pointer

    if (!Hd_GetSDKLastError_ptr || !Hd_CreateScreen_ptr || !Hd_AddProgram_ptr || !Hd_AddArea_ptr || !Hd_AddSimpleTextAreaItem_ptr || !Hd_SendScreen_ptr) { // Added check
        std::wcout << L"{\"success\": false, \"error\": \"Failed to get one or more function pointers.\"}" << std::endl;
        FreeLibrary(hDll);
        return 1;
    }
    
    // --- 3, 4, 5, 6: Build the screen layout (Unchanged) ---
    int nWidth = 32, nHeight = 16, nColor = 0, nGray = 1, nCardType = 58;
    if (Hd_CreateScreen_ptr(nWidth, nHeight, nColor, nGray, nCardType, nullptr, 0) != 0) { /*...*/ return 1; }
    int nProgramID = Hd_AddProgram_ptr(nullptr, 0, 0, nullptr, 0);
    if (nProgramID == -1) { /*...*/ return 1; }
    int nAreaID = Hd_AddArea_ptr(nProgramID, 0, 0, nWidth, nHeight, nullptr, 0, 5, nullptr, 0);
    if (nAreaID == -1) { /*...*/ return 1; }
    int nAreaItemID = Hd_AddSimpleTextAreaItem_ptr(nAreaID, L"Hello", 255, 0, 0x0004, L"Arial", 12, 0, 25, 0, 3, nullptr, 0);
    if (nAreaItemID == -1) { /*...*/ return 1; }
    std::wcout << L"{\"status\": \"Screen layout created successfully in memory.\"}" << std::endl;

    // --- 7. Call Hd_SendScreen ---
    int nSendType = 0; // 0 for TCP/IP communication.
    wchar_t* pSendParams = L"192.168.50.200"; // The IP from your config.
    
    int nRe = Hd_SendScreen_ptr(nSendType, pSendParams, nullptr, nullptr, 0);

    if (nRe != 0) {
        int nErrorCode = Hd_GetSDKLastError_ptr();
        std::wcout << L"{\"success\": false, \"error\": \"Hd_SendScreen failed!\", \"sdk_error_code\": " << nErrorCode << L"}" << std::endl;
        FreeLibrary(hDll);
        return 1;
    }

    // --- 8. Report Final Success ---
    std::wcout << L"{\"success\": true, \"message\": \"Screen data sent successfully to " << pSendParams << L".\"}" << std::endl;

    // --- 9. Clean up ---
    FreeLibrary(hDll);
    return 0;
}