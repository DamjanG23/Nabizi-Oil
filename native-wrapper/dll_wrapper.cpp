#include <iostream>
#include <string>
#include <windows.h>
#include <vector>
#include <fcntl.h>
#include <io.h>

// --- Crash Handler Function ---
// This function will be called by Windows if a critical, unhandled error occurs.
LONG WINAPI MyUnhandledExceptionFilter(struct _EXCEPTION_POINTERS *ExceptionInfo) {
    // We get the specific error code (e.g., 0xC0000005 for Access Violation)
    DWORD exceptionCode = ExceptionInfo->ExceptionRecord->ExceptionCode;
    
    // Print a clear JSON error message.
    std::wcout << L"{\"success\": false, \"error\": \"CRITICAL: Unhandled exception caught!\", \"exception_code\": " << exceptionCode << L"}" << std::endl;

    // We've "handled" it by logging. Now, let the program terminate.
    return EXCEPTION_EXECUTE_HANDLER;
}


// --- Function Pointer Typedefs ---
typedef int (*HD_CreateScreen)(int, int, int, int, int, void*, int);
typedef int (*HD_AddProgram)(void*, int, int, void*, int);
typedef int (*HD_AddArea)(int, int, int, int, int, void*, int, int, void*, int);
typedef int (*HD_SendScreen)(int, void*, void*, void*, int);
typedef int (*HD_GetSDKLastError)(); 

// We no longer need the stringToWide helper function for this test.

int main() {
    // --- SET UP THE CRASH HANDLER AT THE VERY BEGINNING ---
    SetUnhandledExceptionFilter(MyUnhandledExceptionFilter);

    _setmode(_fileno(stdout), _O_U16TEXT);

    // --- 1. Load the DLL ---
    HINSTANCE hDll = LoadLibraryW(L"HDSdk.dll");
    if (!hDll) {
        std::wcout << L"{\"success\": false, \"error\": \"Failed to load HDSdk.dll\"}" << std::endl;
        return 1;
    }

    // --- 2. Load Function Pointers ---
    HD_CreateScreen Hd_CreateScreen_ptr = (HD_CreateScreen)GetProcAddress(hDll, "Hd_CreateScreen");
    HD_AddProgram Hd_AddProgram_ptr = (HD_AddProgram)GetProcAddress(hDll, "Hd_AddProgram");
    HD_AddArea Hd_AddArea_ptr = (HD_AddArea)GetProcAddress(hDll, "Hd_AddArea");
    HD_SendScreen Hd_SendScreen_ptr = (HD_SendScreen)GetProcAddress(hDll, "Hd_SendScreen");
    HD_GetSDKLastError Hd_GetSDKLastError_ptr = (HD_GetSDKLastError)GetProcAddress(hDll, "Hd_GetSDKLastError");

    if (!Hd_CreateScreen_ptr || !Hd_AddProgram_ptr || !Hd_AddArea_ptr || !Hd_SendScreen_ptr || !Hd_GetSDKLastError_ptr) {
        std::wcout << L"{\"success\": false, \"error\": \"Failed to get one or more function pointers from DLL\"}" << std::endl;
        FreeLibrary(hDll);
        return 1;
    }
    
    // --- 3. Use a hardcoded IP address, exactly like the C demo ---
    // This eliminates any errors from reading input or converting the string.
    wchar_t* pSendParams = L"192.168.1.30";

    // --- 4. Call the DLL functions ---
    int nErrorCode = 0;
    int nRe = -1;

    int nWidth = 64;
    int nHeight = 32;
    int nColor = 1;
    int nCardType = 47; // E63
    
    std::wcout << L"Calling Hd_CreateScreen..." << std::endl;
    nRe = Hd_CreateScreen_ptr(nWidth, nHeight, nColor, 1, nCardType, nullptr, 0);
    if (nRe != 0) { /* Error Handling */ return 1; }
    std::wcout << L"Hd_CreateScreen OK." << std::endl;

    std::wcout << L"Calling Hd_AddProgram..." << std::endl;
    // --- REVERTING TO C# DEMO PARAMETERS ---
    // Using 0 for border speed as this was the last version that worked past this point.
    int nProgramID = Hd_AddProgram_ptr(nullptr, 0, 0, nullptr, 0);
    if (nProgramID == -1) { /* Error Handling */ return 1; }
    std::wcout << L"Hd_AddProgram OK." << std::endl;

    std::wcout << L"Calling Hd_AddArea..." << std::endl;
    // --- REVERTING TO C# DEMO PARAMETERS ---
    // Using 0 for border speed to match the last working configuration.
    int nAreaID = Hd_AddArea_ptr(nProgramID, 0, 0, nWidth, nHeight, nullptr, 0, 0, nullptr, 0);
    if (nAreaID == -1) { /* Error Handling */ return 1; }
    std::wcout << L"Hd_AddArea OK." << std::endl;

    // --- SENDING THE SCREEN NOW ---
    std::wcout << L"Calling Hd_SendScreen with hardcoded UTF-16 string..." << std::endl;
    int nSendType = 0;

    nRe = Hd_SendScreen_ptr(nSendType, (void*)pSendParams, nullptr, nullptr, 0);

    // This code will only be reached if the function does NOT crash.
    if (nRe != 0) {
        nErrorCode = Hd_GetSDKLastError_ptr();
        std::wcout << L"{\"success\": false, \"error\": \"Hd_SendScreen failed with code: " << nErrorCode << L"\"}" << std::endl;
        FreeLibrary(hDll);
        return 1;
    }
    std::wcout << L"Hd_SendScreen OK." << std::endl;


    // --- 5. Clean Up and Report Success ---
    FreeLibrary(hDll);

    std::wcout << L"{\"success\": true, \"message\": \"Blank screen area sent successfully.\"}" << std::endl;

    return 0;
}