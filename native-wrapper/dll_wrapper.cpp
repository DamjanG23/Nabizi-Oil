#include <iostream>
#include <windows.h>
#include <fcntl.h>
#include <io.h>

// Crash handler function... (remains the same)
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

int main() {
    SetUnhandledExceptionFilter(MyUnhandledExceptionFilter);
    _setmode(_fileno(stdout), _O_U16TEXT);

    // --- The rest of the code remains identical to the last step ---

    // 1. Load DLL
    HINSTANCE hDll = LoadLibraryW(L"HDSdk.dll");
    if (!hDll) { /* ... */ return 1; }

    // 2. Get Function Pointers
    HD_GetSDKLastError Hd_GetSDKLastError_ptr = (HD_GetSDKLastError)GetProcAddress(hDll, "Hd_GetSDKLastError");
    HD_CreateScreen Hd_CreateScreen_ptr = (HD_CreateScreen)GetProcAddress(hDll, "Hd_CreateScreen");
    HD_AddProgram Hd_AddProgram_ptr = (HD_AddProgram)GetProcAddress(hDll, "Hd_AddProgram");
    HD_AddArea Hd_AddArea_ptr = (HD_AddArea)GetProcAddress(hDll, "Hd_AddArea");
    if (!Hd_GetSDKLastError_ptr || !Hd_CreateScreen_ptr || !Hd_AddProgram_ptr || !Hd_AddArea_ptr) { /* ... */ return 1; }
    
    // 3. Call Hd_CreateScreen
    int nWidth = 32;
    int nHeight = 16;
    int nColor = 0;
    int nGray = 1;
    int nCardType = 58;
    int nRe = Hd_CreateScreen_ptr(nWidth, nHeight, nColor, nGray, nCardType, nullptr, 0);
    if (nRe != 0) { /* ... */ return 1; }
    std::wcout << L"{\"status\": \"Hd_CreateScreen OK.\"}" << std::endl;

    // 4. Call Hd_AddProgram
    int nProgramID = Hd_AddProgram_ptr(nullptr, 0, 0, nullptr, 0);
    if (nProgramID == -1) { /* ... */ return 1; }
    std::wcout << L"{\"status\": \"Hd_AddProgram OK.\", \"program_id\": " << nProgramID << L"}" << std::endl;

    // 5. Call Hd_AddArea (with the same parameters as last time)
    int nBorderSpeed = 5; 
    int nAreaID = Hd_AddArea_ptr(nProgramID, 0, 0, nWidth, nHeight, nullptr, 0, nBorderSpeed, nullptr, 0);

    if (nAreaID == -1) {
        int nErrorCode = Hd_GetSDKLastError_ptr();
        std::wcout << L"{\"success\": false, \"error\": \"Hd_AddArea failed!\", \"sdk_error_code\": " << nErrorCode << L"}" << std::endl;
        FreeLibrary(hDll);
        return 1;
    }

    // 6. Report Success
    std::wcout << L"{\"success\": true, \"message\": \"Hd_AddArea executed successfully.\", \"area_id\": " << nAreaID << L"}" << std::endl;

    // 7. Clean up
    FreeLibrary(hDll);
    return 0;
}