import { BrowserWindow, dialog } from "electron";
import { ipcWebContentsSend } from "../utils/util.js";
import fs from "fs";
import path from "path";
import { app } from "electron";

const CONFIG_PATH_FILE = path.join(app.getPath("userData"), "config-path.json");

export function getConfig() {
  const config = "match config 123";
  return { config };
}

export function createNewMatch(matchName: string) {
  const newMatch: Match = { matchName: matchName };

  console.log("Match ?saved? on back end:", newMatch);
}

export function loadConfig(window: BrowserWindow): void {
  const config: Config = { gasStationLogo: "nabizilogo.png" };
  console.log("Demo config loaded..." + JSON.stringify(config, null, 2));

  const demoFuelList: FuelItem[] = [
    { id: 1, name: "Gasoline", price: 3.45 },
    { id: 2, name: "Diesel", price: 3.89 },
    { id: 3, name: "Premium", price: 3.75 },
    { id: 4, name: "E85", price: 2.95 },
    { id: 5, name: "Kerosene", price: 4.2 },
  ];

  ipcWebContentsSend("onFuelItemsLoaded", window.webContents, demoFuelList);
}

export function saveConfigPath(
  configPath: string,
  window: BrowserWindow
): void {
  const data: ConfigPathData = { configPath };

  fs.writeFileSync(CONFIG_PATH_FILE, JSON.stringify(data, null, 2));

  ipcWebContentsSend("onConfigPathChanged", window.webContents, configPath);
}

export function getConfigPath(): string | null {
  if (!fs.existsSync(CONFIG_PATH_FILE)) return null;

  try {
    const data: ConfigPathData = JSON.parse(
      fs.readFileSync(CONFIG_PATH_FILE, "utf-8")
    );
    return data.configPath || null;
  } catch (error) {
    console.error("Failed to parse config path file:", error);
    return null;
  }
}

export async function selectConfigPath(
  mainWindow: BrowserWindow
): Promise<string | null> {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Select Config Folder",
    properties: ["openDirectory"],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const selectedPath = result.filePaths[0];
  saveConfigPath(selectedPath, mainWindow);
  return selectedPath;
}

export function setConfigPathToDefault(mainWindow: BrowserWindow): string {
  const exePath = app.getPath("exe");
  const exeDir = path.dirname(exePath);

  saveConfigPath(exeDir, mainWindow);
  return exeDir;
}

export function initiateConfigPathIfUnavailable(window: BrowserWindow): void {
  const existingPath = getConfigPath();

  if (!existingPath) {
    setConfigPathToDefault(window);
  }
}

//--------------------------------------------------------------------------

export async function readConfigFromDirectory(directoryPath: string) {
  try {
    // Read all files in the directory
    const files = await fs.promises.readdir(directoryPath);

    // Find the first .ini file
    const iniFile = files.find(
      (file) => path.extname(file).toLowerCase() === ".ini"
    );

    if (!iniFile) {
      throw new Error("No .ini file found in the directory");
    }

    // Read the .ini file content
    const filePath = path.join(directoryPath, iniFile);
    const content = await fs.promises.readFile(filePath, "utf8");

    // Parse the content
    const config = parseIniContent(content);

    return config;
  } catch {
    throw new Error(`Error reading config...`);
    const emptyConfig: Config = {};
    return emptyConfig;
  }
}

function parseIniContent(content: string) {
  const config: Config = {};
  const lines = content.split("\n");

  // Store fuel names temporarily
  const fuelNames = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (
      !trimmedLine ||
      trimmedLine.startsWith("#") ||
      trimmedLine.startsWith(";")
    ) {
      continue;
    }

    // Split by '=' and clean up the key-value pair
    const [key, ...valueParts] = trimmedLine.split("=");
    if (!key || valueParts.length === 0) continue;

    const cleanKey = key.trim();
    let value = valueParts.join("=").trim();

    // Remove quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Map ini keys to Config properties
    switch (cleanKey) {
      case "DisplayIPAddress":
        config.displayIpAddress = value;
        break;
      case "GasStationLogo":
        config.gasStationLogo = value;
        break;
      case "NumberOfFuelTypes":
        config.numberOfFuelTypes = parseInt(value, 10);
        break;
      case "TimeDisplayIPAddress":
        config.timeDisplayIpAddress = value;
        break;
      case "AdjustTime":
        config.adjustTime = value;
        break;
      default:
        // Handle fuel names (Fuel1Name, Fuel2Name, etc.)
        if (cleanKey.startsWith("Fuel") && cleanKey.endsWith("Name")) {
          fuelNames.push(value);
        }
        break;
    }
  }

  // Add fuel names array if we found any
  if (fuelNames.length > 0) {
    config.fuelNames = fuelNames;
  }

  return config;
}

export function getLogoBase64(
  directoryPath: string | null,
  logoFileName: string | undefined
) {
  try {
    // Step 0: Check if parameters are provided
    if (!directoryPath || !logoFileName) {
      console.log("Directory path and logo filename are required");
      return null;
    }

    // Step 1: Combine the directory path and filename to get the full file path
    const fullPath = path.join(directoryPath, logoFileName);

    // Step 2: Check if the file exists
    if (!fs.existsSync(fullPath)) {
      console.log(`Logo file not found at: ${fullPath}`);
      return null;
    }

    // Step 3: Read the file as binary data
    const fileBuffer = fs.readFileSync(fullPath);

    // Step 4: Get the file extension to determine the MIME type
    const fileExtension = path.extname(logoFileName).toLowerCase();

    // Step 5: Determine the correct MIME type based on file extension
    let mimeType;
    switch (fileExtension) {
      case ".png":
        mimeType = "image/png";
        break;
      case ".jpg":
      case ".jpeg":
        mimeType = "image/jpeg";
        break;
      case ".gif":
        mimeType = "image/gif";
        break;
      case ".svg":
        mimeType = "image/svg+xml";
        break;
      case ".webp":
        mimeType = "image/webp";
        break;
      default:
        console.log(`Unsupported file type: ${fileExtension}`);
        return null;
    }

    // Step 6: Convert the file buffer to base64 string
    const base64String = fileBuffer.toString("base64");

    // Step 7: Return the complete data URL
    return `data:${mimeType};base64,${base64String}`;
  } catch {
    // Step 8: Handle any errors that might occur
    console.error("Error reading logo file:");
    return null;
  }
}

export function getFuelItems(config: Config): string[] {
  return config.fuelNames ? config.fuelNames : [];
}

export function sendDataToScreen(fuelItems: FuelItem[]): void {
  console.log(
    "Demo send Data to screen... " + JSON.stringify(fuelItems, null, 2)
  );
}
