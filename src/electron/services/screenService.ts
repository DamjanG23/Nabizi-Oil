import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

export async function createScreenAndSend(ipAddress: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const wrapperPath = path.join(
      __dirname,
      "../../native-wrapper/dll_wrapper.exe"
    );

    console.log("Sending to IP:", ipAddress);

    const process = spawn(wrapperPath);
    let output = "";

    // THIS LINE IS ESSENTIAL
    process.stdout.setEncoding("utf16le");

    process.stdout.on("data", (data) => {
      output += data;
    });

    process.on("close", () => {
      try {
        const result = JSON.parse(output.trim());
        if (result.success) {
          console.log("✅", result.message);
          resolve(true);
        } else {
          // This will now work correctly
          console.error("❌", result.error);
          resolve(false);
        }
      } catch {
        // The parsing error should be gone, but we keep this for safety
        reject(new Error("Failed to parse wrapper output: " + output));
      }
    });

    process.on("error", (err) => {
      reject(err);
    });

    // We still send the IP address as before
    process.stdin.write(ipAddress + "\n");
    process.stdin.end();
  });
}

export async function sendDataToScreen(
  fuelItems: FuelItem[],
  config: Config
): Promise<void> {
  if (!config.displayIpAddress) {
    console.error("❌ No displayIpAddress provided");
    return;
  }

  try {
    await createScreenAndSend(config.displayIpAddress);
    // Result will be logged by the service
  } catch (error) {
    console.error("Error:", error);
  }
}
