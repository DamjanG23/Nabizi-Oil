import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
// Import the 'app' module from Electron
import { app } from "electron";

// NOTE: Make sure you have your type definitions for FuelItem and Config here
// For example:
type Config = {
  displayIpAddress?: string;
  // ... other config properties
};

type FuelItem = {
  id: number;
  name: string;
  price: number;
};

/**
 * Spawns the C++ wrapper, sends a JSON payload to it, and waits for its response.
 * @param jsonPayload The full configuration and data as a JSON string.
 * @returns A promise that resolves with the wrapper's success status.
 */
function sendPayloadToWrapper(jsonPayload: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // --- Dynamic path for the wrapper executable ---

    // app.isPackaged is true when the app is running from a packaged file (e.g., an .exe)
    const isProduction = app.isPackaged;
    let wrapperPath;

    if (isProduction) {
      // In production, the executable is in the 'resources' folder next to the app's executable.
      // process.resourcesPath correctly points to this folder.
      wrapperPath = path.join(
        process.resourcesPath,
        "native-wrapper/dll_wrapper.exe"
      );
    } else {
      // In development, use the relative path from your source code structure.
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      wrapperPath = path.join(
        __dirname,
        "../../native-wrapper/dll_wrapper.exe"
      );
    }

    console.log(
      `Running in ${isProduction ? "production" : "development"} mode.`
    );
    console.log(`Attempting to spawn wrapper at: ${wrapperPath}`);

    console.log("Spawning wrapper with payload...");

    // --- CHANGE START: Renamed 'process' to 'childProcess' to avoid conflict ---
    const childProcess = spawn(wrapperPath);
    // --- CHANGE END ---
    let output = "";
    let errorOutput = "";

    // Set encodings for reading stdout (UTF-16) and stderr (standard)
    childProcess.stdout.setEncoding("utf16le");
    childProcess.stderr.setEncoding("utf8");

    childProcess.stdout.on("data", (data) => {
      output += data;
    });

    childProcess.stderr.on("data", (data) => {
      errorOutput += data;
    });

    childProcess.on("close", (code) => {
      console.log("--- Raw C++ Output ---\n", output);

      if (code !== 0) {
        reject(
          new Error(
            `Wrapper process exited with code ${code}. \nOutput: ${output} \nError: ${errorOutput}`
          )
        );
        return;
      }
      try {
        const jsonResponses = output
          .trim()
          .split("\n")
          .filter((s) => s.startsWith("{"));
        const lastResponse = jsonResponses[jsonResponses.length - 1];
        const result = JSON.parse(lastResponse);

        if (result.success) {
          console.log("✅ Wrapper success:", result.message);
          resolve(true);
        } else {
          console.error(
            "❌ Wrapper error:",
            result.error,
            "Details:",
            result.details || "N/A"
          );
          resolve(false);
        }
      } catch {
        reject(
          new Error(
            "Failed to parse wrapper JSON output. Raw output: " + output
          )
        );
      }
    });

    childProcess.on("error", (err) => {
      reject(err);
    });

    childProcess.stdin.write(jsonPayload + "\n");
    childProcess.stdin.end();
  });
}

/**
 * The main function to prepare and send data to the screen.
 * @param fuelItems An array of fuel items.
 * @param config The application configuration.
 */
export async function sendDataToScreen(
  fuelItems: FuelItem[],
  config: Config
): Promise<void> {
  if (!config.displayIpAddress) {
    console.error("❌ No displayIpAddress provided in config.");
    return;
  }

  const payload = {
    config: config,
    fuelItems: fuelItems,
  };

  const jsonPayload = JSON.stringify(payload);

  try {
    await sendPayloadToWrapper(jsonPayload);
  } catch (error) {
    console.error("Error calling screen sender:", error);
  }
}
