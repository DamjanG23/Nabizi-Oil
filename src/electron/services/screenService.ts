import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Spawns the C++ wrapper, sends a JSON payload to it, and waits for its response.
 * @param jsonPayload The full configuration and data as a JSON string.
 * @returns A promise that resolves with the wrapper's success status.
 */
function sendPayloadToWrapper(jsonPayload: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const wrapperPath = path.join(
      __dirname,
      "../../native-wrapper/dll_wrapper.exe"
    );

    console.log("Spawning wrapper with payload...");

    const process = spawn(wrapperPath);
    let output = "";
    let errorOutput = "";

    // Set encodings for reading stdout (UTF-16) and stderr (standard)
    process.stdout.setEncoding("utf16le");
    process.stderr.setEncoding("utf8");

    process.stdout.on("data", (data) => {
      output += data;
    });

    process.stderr.on("data", (data) => {
      errorOutput += data;
    });

    process.on("close", (code) => {
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

    process.on("error", (err) => {
      reject(err);
    });

    process.stdin.write(jsonPayload + "\n");
    process.stdin.end();
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
