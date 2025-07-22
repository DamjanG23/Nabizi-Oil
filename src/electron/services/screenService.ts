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

    console.log("Spawning wrapper for IP:", ipAddress);

    const process = spawn(wrapperPath);
    let output = "";

    // THIS LINE IS ESSENTIAL for reading the UTF-16 output from the C++ app
    process.stdout.setEncoding("utf16le");

    process.stdout.on("data", (data) => {
      output += data;
    });

    process.on("close", (code) => {
      // It's good practice to check the exit code
      if (code !== 0) {
        reject(
          new Error(
            `Wrapper process exited with code ${code}. Output: ${output}`
          )
        );
        return;
      }
      try {
        const result = JSON.parse(output.trim());
        if (result.success) {
          console.log("✅ Wrapper success:", result.message);
          resolve(true);
        } else {
          console.error("❌ Wrapper error:", result.error);
          resolve(false);
        }
      } catch {
        reject(new Error("Failed to parse wrapper JSON output: " + output));
      }
    });

    process.on("error", (err) => {
      reject(err);
    });

    // Send the IP address to the C++ process's standard input
    process.stdin.write(ipAddress + "\n");
    process.stdin.end();
  });
}

export async function sendDataToScreen(
  fuelItems: FuelItem[],
  config: Config
): Promise<void> {
  if (!config.displayIpAddress) {
    console.error("❌ No displayIpAddress provided in config.");
    return;
  }

  try {
    await createScreenAndSend(config.displayIpAddress);
    // Result is logged by createScreenAndSend
  } catch (error) {
    console.error("Error calling screen sender:", error);
  }
}
