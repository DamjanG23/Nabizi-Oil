import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { app } from "electron";

type Config = {
  displayIpAddress?: string;
};

function sendPayloadToWrapper(jsonPayload: string): Promise<string> {
  return new Promise((resolve, reject) => {
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

    const childProcess = spawn(wrapperPath);
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
          resolve(output);
        } else {
          console.error(
            "❌ Wrapper error:",
            result.error,
            "Details:",
            result.details || "N/A"
          );
          resolve(output);
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

export async function sendDataToScreen(
  fuelItems: FuelItem[],
  config: Config
): Promise<string> {
  if (!config.displayIpAddress) {
    console.error("❌ No displayIpAddress provided in config.");
    return "";
  }

  const payload = {
    config: config,
    fuelItems: fuelItems,
  };

  const jsonPayload = JSON.stringify(payload);

  try {
    const output = await sendPayloadToWrapper(jsonPayload);
    return output;
  } catch (error) {
    console.error("Error calling screen sender:", error);
    return "Error calling screen sender:" + error;
  }
}
