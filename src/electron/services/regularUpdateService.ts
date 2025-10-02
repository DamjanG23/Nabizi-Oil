import { exec } from "child_process";
import * as fs from "fs/promises";

export async function isUpdateSchedulerActive(
  taskName: string = "autoUpdaterTask"
): Promise<boolean> {
  const platform = process.platform;

  try {
    if (platform === "win32") {
      // Windows: use schtasks to query Task Scheduler
      const { exec } = await import("child_process");
      return new Promise((resolve) => {
        exec(`schtasks /Query /TN "${taskName}"`, (err, stdout) => {
          if (err) return resolve(false);
          resolve(stdout.includes(taskName));
        });
      });
    } else if (platform === "linux") {
      // Linux: check cron jobs
      const { exec } = await import("child_process");
      return new Promise((resolve) => {
        exec(`crontab -l | grep "${taskName}"`, (err, stdout) => {
          if (err) return resolve(false);
          resolve(stdout.includes(taskName));
        });
      });
    } else if (platform === "darwin") {
      // macOS: check launchd jobs
      const { exec } = await import("child_process");
      return new Promise((resolve) => {
        exec(`launchctl list | grep "${taskName}"`, (err, stdout) => {
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

export async function createScheduledTask(
  time: string,
  exePath: string,
  taskName: string = "autoUpdaterTask"
): Promise<boolean> {
  const platform = process.platform;

  // Normalize exe path + flag
  const commandToRun = `"${exePath}" screenAutoUpdate`;

  try {
    if (platform === "win32") {
      const createCmd = `schtasks /Create /SC DAILY /TN "${taskName}" /TR "\\"${exePath}\\" screenAutoUpdate" /ST ${time} /F`;

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
    } else if (platform === "linux") {
      const [hh, mm] = time.split(":");
      const cronJob = `${mm} ${hh} * * * ${commandToRun}\n`;

      const createCmd = `(crontab -l 2>/dev/null; echo "${cronJob}") | crontab -`;
      return new Promise((resolve) => {
        exec(createCmd, (err, stdout, stderr) => {
          if (err) {
            console.error("Error creating Linux cron job:", stderr);
            return resolve(false);
          }
          console.log("Linux cron job created.");
          resolve(true);
        });
      });
    } else if (platform === "darwin") {
      const [hh, mm] = time.split(":");
      const plistPath = `${process.env.HOME}/Library/LaunchAgents/${taskName}.plist`;
      const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
 "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${taskName}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${exePath}</string>
    <string>screenAutoUpdate</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>${parseInt(hh)}</integer>
    <key>Minute</key>
    <integer>${parseInt(mm)}</integer>
  </dict>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>`;

      const fs = await import("fs/promises");
      await fs.writeFile(plistPath, plistContent, "utf8");

      return new Promise((resolve) => {
        exec(`launchctl load ${plistPath}`, (err, stdout, stderr) => {
          if (err) {
            console.error("Error loading macOS launchd job:", stderr);
            return resolve(false);
          }
          console.log("macOS launchd job created:", stdout);
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
  taskName: string = "autoUpdaterTask",
  exePath?: string
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
    } else if (platform === "linux") {
      if (!exePath) {
        console.warn("exePath required to clean up cron job on Linux.");
        return false;
      }
      const filterCmd = `crontab -l 2>/dev/null | grep -v "${exePath}" | crontab -`;
      return new Promise((resolve) => {
        exec(filterCmd, (err, stdout, stderr) => {
          if (err) {
            console.error("Error removing Linux cron job:", stderr);
            return resolve(false);
          }
          console.log("Linux cron job removed.");
          resolve(true);
        });
      });
    } else if (platform === "darwin") {
      const plistPath = `${process.env.HOME}/Library/LaunchAgents/${taskName}.plist`;

      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve) => {
        exec(`launchctl unload ${plistPath}`, async (err, stdout, stderr) => {
          if (err) {
            console.error("Error unloading macOS launchd job:", stderr);
            return resolve(false);
          }
          try {
            await fs.unlink(plistPath);
            console.log("macOS launchd job removed:", stdout);
            resolve(true);
          } catch (fsErr) {
            console.error("Error removing plist file:", fsErr);
            resolve(false);
          }
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
