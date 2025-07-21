#include <iostream>
#include <windows.h>
#include <string>

// Define the function types from your DLL
typedef int (*Hd_CreateScreenFunc)(int nWidth, int nHeight, int nColor, int nGray, int nCardType, void *pExParamsBuf, int nBufSize);

int main() {
    // Step 1: Try to load your DLL (using LoadLibraryA for ANSI strings)
    HMODULE hDll = LoadLibraryA("HDSDK.dll");  // Changed to LoadLibraryA and removed L""
    if (!hDll) {
        std::cout << "{\"success\": false, \"error\": \"Failed to load DLL\"}" << std::endl;
        return 1;
    }

    // Step 2: Get the CreateScreen function
    Hd_CreateScreenFunc createScreen = (Hd_CreateScreenFunc)GetProcAddress(hDll, "Hd_CreateScreen");
    if (!createScreen) {
        std::cout << "{\"success\": false, \"error\": \"CreateScreen function not found\"}" << std::endl;
        FreeLibrary(hDll);
        return 1;
    }

    // Step 3: Try to create a screen (dummy values for now)
    int result = createScreen(
        320,    // width in pixels
        240,    // height in pixels  
        2,      // color (2 = tricolor)
        1,      // gray levels (1 = default)
        0,      // card type (0 = default)
        0,      // no extra params
        0       // no extra params size
    );

    // Step 4: Send result back to Node.js
    if (result == 0) {
        std::cout << "{\"success\": true, \"message\": \"Screen created successfully\"}" << std::endl;
    } else {
        std::cout << "{\"success\": false, \"error\": \"Failed to create screen, code: " << result << "\"}" << std::endl;
    }

    // Clean up
    FreeLibrary(hDll);
    return 0;
}