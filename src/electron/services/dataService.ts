import { BrowserWindow, dialog } from "electron";
import { ipcWebContentsSend } from "../utils/util.js";
import fs from "fs";
import path from "path";
import { app } from "electron";

const jsonDataPath = path.join(app.getPath("userData"), "jsonData");

if (!fs.existsSync(jsonDataPath)) {
  fs.mkdirSync(jsonDataPath, { recursive: true });
}

const CONFIG_PATH_FILE = path.join(jsonDataPath, "config-path.json");
const SAVED_FUEL_ITEMS = path.join(jsonDataPath, "saved-fuel-items.json");

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

// ----------------------------------------------------------------------------------------- //

export function saveConfigPath(configPath: string): void {
  const data: ConfigPathData = { configPath };

  fs.writeFileSync(CONFIG_PATH_FILE, JSON.stringify(data, null, 2));

  // ipcWebContentsSend("onConfigPathChanged", window.webContents, configPath);
  app.relaunch();
  app.exit();
}

export function getConfigPath(launchDirectory: string = process.cwd()): string {
  if (!fs.existsSync(CONFIG_PATH_FILE)) {
    saveConfigPath(launchDirectory);
    return launchDirectory;
  }

  try {
    const data: ConfigPathData = JSON.parse(
      fs.readFileSync(CONFIG_PATH_FILE, "utf-8")
    );
    return data.configPath;
  } catch (error) {
    console.error(
      "Failed to parse config path file, returning default launch dir path:",
      error
    );
    return launchDirectory;
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
  saveConfigPath(selectedPath);
  return selectedPath;
}

export function setConfigPathToDefault(
  mainWindow: BrowserWindow,
  launchDirectory: string
): string {
  saveConfigPath(launchDirectory);
  return launchDirectory;
}

//--------------------------------------------------------------------------

export async function readConfigFromDirectory(
  directoryPath: string
): Promise<Config> {
  try {
    const files = await fs.promises.readdir(directoryPath);

    const iniFile = files.find(
      (file) => path.extname(file).toLowerCase() === ".ini"
    );

    if (!iniFile) {
      console.warn("No .ini file found. Using default empty configuration.");
      const emptyConfig: Config = {};
      return emptyConfig;
    }

    const filePath = path.join(directoryPath, iniFile);
    const content = await fs.promises.readFile(filePath, "utf8");
    const config = parseIniContent(content);

    return config;
  } catch (error) {
    console.error(
      "Error reading config, falling back to default empty configuration:",
      error
    );
    const emptyConfig: Config = {};
    return emptyConfig;
  }
}

function parseIniContent(content: string): Config {
  const config: Config = {};
  const lines = content.split("\n");

  // Store fuel names temporarily
  const fuelNames: string[] = [];

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

    // --- New Change: Handle inline comments (like ';') ---
    // This will strip out comments that appear after a value.
    if (value.includes(";")) {
      value = value.split(";")[0].trim();
    }

    // Remove quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Map ini keys to Config properties
    switch (cleanKey) {
      // --- Existing Cases ---
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

      // --- New Cases for the added fields ---
      case "ScreenWidth":
        config.screenWidth = parseInt(value, 10);
        break;
      case "ScreenHeight":
        config.screenHeight = parseInt(value, 10);
        break;
      case "CardType":
        config.cardType = value;
        break;
      case "RowColumn":
        config.rowColumn = value;
        break;
      case "DoubleSided":
        config.doubleSided = value;
        break;
      case "FontName":
        config.fontName = value;
        break;
      case "FontHeight":
        config.fontHeight = parseInt(value, 10);
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

export function getFuelItems(fuelItems: FuelItem[]): FuelItem[] {
  return fuelItems;
}

// -----------------------------------------------------------------------------

export function saveFuelItems(fuelItems: FuelItem[] = []) {
  fs.writeFileSync(SAVED_FUEL_ITEMS, JSON.stringify(fuelItems, null, 2));
}

export function getSavedFuelItems() {
  if (!fs.existsSync(SAVED_FUEL_ITEMS)) {
    saveFuelItems();
    return [];
  }

  try {
    const fuelItems: FuelItem[] = JSON.parse(
      fs.readFileSync(SAVED_FUEL_ITEMS, "utf-8")
    );
    return fuelItems;
  } catch (error) {
    console.error(
      "Failed to parse savedFuelItems, returning empty array:",
      error
    );
    return [];
  }
}

export function createCurrentFuelItems(
  savedFuelItems: FuelItem[],
  fuelItemsOrder?: string[]
): FuelItem[] {
  if (!fuelItemsOrder || fuelItemsOrder.length === 0) {
    return [];
  }

  const savedItemsMap = new Map(
    savedFuelItems.map((item) => [item.name, item])
  );

  let nextId =
    savedFuelItems.reduce((maxId, item) => Math.max(item.id, maxId), 0) + 1;

  const currentFuelItems = fuelItemsOrder.map((fuelName): FuelItem => {
    const existingItem = savedItemsMap.get(fuelName);

    if (existingItem) {
      return existingItem;
    }

    const newItem: FuelItem = {
      id: nextId,
      name: fuelName,
      price: 0,
    };

    nextId++;
    return newItem;
  });

  return currentFuelItems;
}

// -------------------------------- REGULAR UPDATE ---------------------------------------------

const REGULAR_UPDATE = path.join(jsonDataPath, "regular-update.json");

const defaultRegularUpdateData: RegularUpdateData = {
  isRegularUpdateEnabled: false,
  regularUpdateTime: "00:00",
};

export function saveRegularUpdateData(
  isRegularUpdateEnabled: boolean = false,
  regularUpdateTime: string = "00:00"
): RegularUpdateData {
  const data: RegularUpdateData = { isRegularUpdateEnabled, regularUpdateTime };

  fs.writeFileSync(REGULAR_UPDATE, JSON.stringify(data, null, 2));

  return data;
}

export function getRegularUpdateData(): RegularUpdateData {
  if (!fs.existsSync(REGULAR_UPDATE)) {
    const regularUpdateDataSaved = saveRegularUpdateData();
    return regularUpdateDataSaved;
  }

  try {
    const regularUpdateData: RegularUpdateData = JSON.parse(
      fs.readFileSync(REGULAR_UPDATE, "utf-8")
    );
    return regularUpdateData;
  } catch (error) {
    console.error(
      "Failed to parse regularUpdateData, returning default:",
      error
    );
    return defaultRegularUpdateData;
  }
}

export function getIsRegularUpdateEnabled(): boolean {
  if (!fs.existsSync(REGULAR_UPDATE)) {
    saveRegularUpdateData();
    return false;
  }

  try {
    const regularUpdateData: RegularUpdateData = JSON.parse(
      fs.readFileSync(REGULAR_UPDATE, "utf-8")
    );
    return regularUpdateData.isRegularUpdateEnabled;
  } catch (error) {
    console.error(
      "Failed to parse regularUpdateData, returning default false:",
      error
    );
    return false;
  }
}

export function getRegularUpdateTime(): string {
  if (!fs.existsSync(REGULAR_UPDATE)) {
    saveRegularUpdateData();
    return "00:00";
  }

  try {
    const regularUpdateData: RegularUpdateData = JSON.parse(
      fs.readFileSync(REGULAR_UPDATE, "utf-8")
    );
    return regularUpdateData.regularUpdateTime;
  } catch (error) {
    console.error(
      "Failed to parse regularUpdateData, returning default time:",
      error
    );
    return "00:00";
  }
}

export function setIsRegularUpdateEnabled(
  isRegularUpdateEnabled: boolean = false
): RegularUpdateData {
  const currentRegularUpdateTime: string = getRegularUpdateTime();
  const data: RegularUpdateData = {
    isRegularUpdateEnabled,
    regularUpdateTime: currentRegularUpdateTime,
  };

  fs.writeFileSync(REGULAR_UPDATE, JSON.stringify(data, null, 2));

  return data;
}

export function toggleRegularUpdate(): RegularUpdateData {
  const currentRegularUpdateData: RegularUpdateData = getRegularUpdateData();

  const data: RegularUpdateData = {
    isRegularUpdateEnabled: !currentRegularUpdateData.isRegularUpdateEnabled,
    regularUpdateTime: currentRegularUpdateData.regularUpdateTime,
  };

  fs.writeFileSync(REGULAR_UPDATE, JSON.stringify(data, null, 2));

  return data;
}

export function setRegularUpdateTime(
  regularUpdateTime: string = "00:00"
): RegularUpdateData {
  const currentIsRegularUpdateEnabled: boolean = getIsRegularUpdateEnabled();
  const data: RegularUpdateData = {
    isRegularUpdateEnabled: currentIsRegularUpdateEnabled,
    regularUpdateTime,
  };

  fs.writeFileSync(REGULAR_UPDATE, JSON.stringify(data, null, 2));

  return data;
}

export function sendRegularUpdateData(
  regularUpdateData: RegularUpdateData,
  window: BrowserWindow
): void {
  ipcWebContentsSend(
    "regularUpdateData",
    window.webContents,
    regularUpdateData
  );
}
