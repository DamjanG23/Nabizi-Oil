import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

export type FuelItem = {
  id: number;
  name: string;
  price: number;
};

export async function createScreen(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // Fix for ES modules - get current directory
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Path to your compiled wrapper
    const wrapperPath = path.join(
      __dirname,
      "../../native-wrapper/dll_wrapper.exe"
    );

    console.log("Trying to run wrapper at:", wrapperPath); // Debug log

    const process = spawn(wrapperPath);
    let output = "";

    // Collect output from the C++ program
    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.on("close", () => {
      try {
        const result = JSON.parse(output.trim());
        if (result.success) {
          console.log("Screen created:", result.message);
          resolve(true);
        } else {
          console.error("Screen creation failed:", result.error);
          resolve(false);
        }
      } catch {
        reject(new Error("Failed to parse wrapper output: " + output));
      }
    });

    process.on("error", (err) => {
      console.error("Process error:", err);
      reject(err);
    });
  });
}

export async function sendDataToScreen(fuelItems: FuelItem[]): Promise<void> {
  console.log(
    "Attempting to send data to screen...",
    JSON.stringify(fuelItems, null, 2)
  );

  try {
    const success = await createScreen();
    if (success) {
      console.log("✅ Screen connection successful!");
      // We'll add the fuel data sending in the next step
    } else {
      console.log("❌ Screen connection failed");
    }
  } catch (error) {
    console.error("Error connecting to screen:", error);
  }
}
