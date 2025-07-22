#include <iostream>
#include <string>
#include <windows.h>
#include <vector>
#include <fcntl.h>
#include <io.h>

// --- Function Pointer Typedefs ---
typedef int (*HD_CreateScreen)(int, int, int, int, int, void*, int);
typedef int (*HD_AddProgram)(void*, int, int, void*, int);
typedef int (*HD_AddArea)(int, int, int, int, int, void*, int, int, void*, int);
typedef int (*HD_AddSimpleTextAreaItem)(int, void*, int, int, int, void*, int, int, int, int, int, void*, int);
typedef int (*HD_SendScreen)(int, void*, void*, void*, int);
typedef int (*HD_GetSDKLastError)(); 
typedef int (*HD_GetColor)(int, int, int);

// Helper function to convert a standard string (UTF-8) to a wide string (UTF-16)
wchar_t* stringToWide(const std::string& str) {
    int size_needed = MultiByteToWideChar(CP_UTF8, 0, &str[0], (int)str.size(), NULL, 0);
    wchar_t* wstr = new wchar_t[size_needed + 1];
    MultiByteToWideChar(CP_UTF8, 0, &str[0], (int)str.size(), wstr, size_needed);
    wstr[size_needed] = L'\0';
    return wstr;
}

int main() {
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
    HD_AddSimpleTextAreaItem Hd_AddSimpleTextAreaItem_ptr = (HD_AddSimpleTextAreaItem)GetProcAddress(hDll, "Hd_AddSimpleTextAreaItem");
    HD_SendScreen Hd_SendScreen_ptr = (HD_SendScreen)GetProcAddress(hDll, "Hd_SendScreen");
    HD_GetSDKLastError Hd_GetSDKLastError_ptr = (HD_GetSDKLastError)GetProcAddress(hDll, "Hd_GetSDKLastError");
    HD_GetColor Hd_GetColor_ptr = (HD_GetColor)GetProcAddress(hDll, "Hd_GetColor");

    if (!Hd_CreateScreen_ptr || !Hd_AddProgram_ptr || !Hd_AddArea_ptr || !Hd_AddSimpleTextAreaItem_ptr || !Hd_SendScreen_ptr || !Hd_GetSDKLastError_ptr || !Hd_GetColor_ptr) {
        std::wcout << L"{\"success\": false, \"error\": \"Failed to get one or more function pointers from DLL\"}" << std::endl;
        FreeLibrary(hDll);
        return 1;
    }
    
    // --- 3. Read IP Address from Node.js ---
    std::string ipAddress;
    std::cin >> ipAddress;
    
    wchar_t* pSendParams = stringToWide(ipAddress);

    // --- 4. Call the DLL functions with logging ---
    int nErrorCode = 0;
    int nRe = -1;

    int nWidth = 64;
    int nHeight = 32;
    int nColor = 1;
    int nCardType = 0;
    
    std::wcout << L"Calling Hd_CreateScreen..." << std::endl;
    nRe = Hd_CreateScreen_ptr(nWidth, nHeight, nColor, 1, nCardType, nullptr, 0);
    if (nRe != 0) {
        nErrorCode = Hd_GetSDKLastError_ptr();
        std::wcout << L"{\"success\": false, \"error\": \"Hd_CreateScreen failed with code: " << nErrorCode << L"\"}" << std::endl;
        delete[] pSendParams;
        FreeLibrary(hDll);
        return 1;
    }
    std::wcout << L"Hd_CreateScreen OK." << std::endl;

    std::wcout << L"Calling Hd_AddProgram..." << std::endl;
    int nProgramID = Hd_AddProgram_ptr(nullptr, 0, 0, nullptr, 0);
    if (nProgramID == -1) {
        nErrorCode = Hd_GetSDKLastError_ptr();
        std::wcout << L"{\"success\": false, \"error\": \"Hd_AddProgram failed with code: " << nErrorCode << L"\"}" << std::endl;
        delete[] pSendParams;
        FreeLibrary(hDll);
        return 1;
    }
    std::wcout << L"Hd_AddProgram OK." << std::endl;

    std::wcout << L"Calling Hd_AddArea..." << std::endl;
    int nAreaID = Hd_AddArea_ptr(nProgramID, 0, 0, nWidth, nHeight, nullptr, 0, 0, nullptr, 0);
    if (nAreaID == -1) {
        nErrorCode = Hd_GetSDKLastError_ptr();
        std::wcout << L"{\"success\": false, \"error\": \"Hd_AddArea failed with code: " << nErrorCode << L"\"}" << std::endl;
        delete[] pSendParams;
        FreeLibrary(hDll);
        return 1;
    }
    std::wcout << L"Hd_AddArea OK." << std::endl;

    wchar_t* pText = stringToWide("Hello");
    wchar_t* pFontName = stringToWide("Arial");

    std::wcout << L"Calling Hd_GetColor..." << std::endl;
    int nTextColor = Hd_GetColor_ptr(255, 0, 0);
    std::wcout << L"Hd_GetColor OK." << std::endl;

    std::wcout << L"Calling Hd_AddSimpleTextAreaItem..." << std::endl;
    int nAreaItemID = Hd_AddSimpleTextAreaItem_ptr(nAreaID, pText, nTextColor, 0, 4, pFontName, 16, 30, 201, 3, 3, nullptr, 0);
    if (nAreaItemID == -1) {
        nErrorCode = Hd_GetSDKLastError_ptr();
        std::wcout << L"{\"success\": false, \"error\": \"Hd_AddSimpleTextAreaItem failed with code: " << nErrorCode << L"\"}" << std::endl;
        delete[] pText;
        delete[] pFontName;
        delete[] pSendParams;
        FreeLibrary(hDll);
        return 1;
    }
    std::wcout << L"Hd_AddSimpleTextAreaItem OK." << std::endl;

    delete[] pText;
    delete[] pFontName;

    std::wcout << L"Calling Hd_SendScreen..." << std::endl;
    int nSendType = 0;
    nRe = Hd_SendScreen_ptr(nSendType, pSendParams, nullptr, nullptr, 0);
    if (nRe != 0) {
        nErrorCode = Hd_GetSDKLastError_ptr();
        std::wcout << L"{\"success\": false, \"error\": \"Hd_SendScreen failed with code: " << nErrorCode << L"\"}" << std::endl;
        delete[] pSendParams;
        FreeLibrary(hDll);
        return 1;
    }
    std::wcout << L"Hd_SendScreen OK." << std::endl;

    // --- 5. Clean Up and Report Success ---
    delete[] pSendParams;
    FreeLibrary(hDll);

    std::wcout << L"{\"success\": true, \"message\": \"Screen data sent successfully.\"}" << std::endl;

    return 0;
}