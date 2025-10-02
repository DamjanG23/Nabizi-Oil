import { exec } from "child_process";
import { app } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function isUpdateSchedulerActive(
  taskName: string = "autoUpdaterTask"
): Promise<boolean> {
  const platform = process.platform;

  try {
    if (platform === "win32") {
      const { exec } = await import("child_process");
      return new Promise((resolve) => {
        exec(`schtasks /Query /TN "${taskName}"`, (err, stdout) => {
          if (err) return resolve(false);
          resolve(stdout.includes(taskName));
        });
      });
    } else {
      return false; // unsupported OS
    }
  } catch {
    return false;
  }
}

function getAppExePath(): string {
  if (app.isPackaged) {
    return process.execPath;
  } else {
    return path.join(
      __dirname,
      "../../dist/win-unpacked/gas-station-totem.exe"
    );
  }
}

export async function createScheduledTask(
  time: string,
  taskName: string = "autoUpdaterTask"
): Promise<boolean> {
  const platform = process.platform;
  const exePath = getAppExePath();
  console.log("Executable Path:", exePath);

  try {
    if (platform === "win32") {
      const createCmd = `schtasks /Create /SC DAILY /TN "${taskName}" /TR "\\"${exePath}\\" --screenAutoUpdate" /ST ${time} /F`;

      return new Promise((resolve) => {
        exec(createCmd, (err, stdout, stderr) => {
          if (err) {
            console.error("Error creating Windows task:", stderr);
            return resolve(false);
          }
          console.log("Windows Task Scheduler created:", stdout);
          resolve(true);
        });
      });
    } else {
      console.warn("Scheduler creation not supported on this OS.");
      return false;
    }
  } catch (error) {
    console.error("Error creating scheduled task:", error);
    return false;
  }
}

export async function removeScheduledTask(
  taskName: string = "autoUpdaterTask"
): Promise<boolean> {
  const platform = process.platform;

  try {
    if (platform === "win32") {
      const deleteCmd = `schtasks /Delete /TN "${taskName}" /F`;
      return new Promise((resolve) => {
        exec(deleteCmd, (err, stdout, stderr) => {
          if (err) {
            console.error("Error deleting Windows task:", stderr);
            return resolve(false);
          }
          console.log("Windows task deleted:", stdout);
          resolve(true);
        });
      });
    } else {
      console.warn("Scheduler removal not supported on this OS.");
      return false;
    }
  } catch (error) {
    console.error("Error removing scheduled task:", error);
    return false;
  }
}
