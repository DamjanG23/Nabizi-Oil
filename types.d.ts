type Match = {
  matchName: string;
};

type MatchConfig = {
  config: string;
};

// --------------------------------------------

type Config = {
  displayIpAddress?: string;
  gasStationLogo?: string;
  numberOfFuelTypes?: number;
  fuelNames?: string[];
  timeDisplayIpAddress?: string;
  adjustTime?: string;

  screenWidth?: number;
  screenHeight?: number;
  cardType?: string;
  rowColumn?: string;
  doubleSided?: string;
  fontName?: string;
  fontHeight?: number;
};

type FuelItem = {
  id: number;
  name: string;
  price: number;
};

type ConfigPathData = {
  configPath: string;
};

type RegularUpdateData = {
  isRegularUpdateEnabled: boolean;
  regularUpdateTime: string;
};

type EventPayloadMaping = {
  getConfig: MatchConfig;
  createNewMatch: string;

  // ------------------------------------

  onFuelItemsLoaded: FuelItem[];
  loadConfig: void;
  getConfigPath: string | null;
  selectConfigPath: void;
  onConfigPathChanged: string;
  setConfigPathToDefault: void;
  getLogoBase64: string | null;
  getFuelItems: FuelItem[];
  sendDataToScreen: FuelItem[];
  saveFuelItems: FuelItem[];
  regularUpdateData: RegularUpdateData;

  // REGULAR UPDATE ----------------------------------
  getRegularUpdateData: RegularUpdateData;
  toggleRegularUpdate: void;
};

type UnsubscribeFunction = () => void;

interface Window {
  electron: {
    getConfig: () => Promise<MatchConfig>;

    createNewMatch: (matchName: string) => void;

    // Real Functions ----------------------------------------------------------------------------
    onFuelItemsLoaded: (
      callback: (fuelItems: FuelItem[]) => void
    ) => UnsubscribeFunction;

    loadConfig: () => Promise<void>;

    getConfigPath: () => Promise<string | null>;

    selectConfigPath: () => Promise<void>;

    onConfigPathChanged: (
      callback: (congifPath: string) => void
    ) => UnsubscribeFunction;

    setConfigPathToDefault: () => Promise<void>;

    getLogoBase64: () => Promise<string | null>;

    getFuelItems: () => Promise<FuelItem[]>;

    sendDataToScreen: (fuelItems: FuelItem[]) => void;

    saveFuelItems: (fuelItems: FuelItem[]) => void;

    // Regular Update Data ---------------------------------------
    regularUpdateData: (
      callback: (regularUpdateData: RegularUpdateData) => void
    ) => UnsubscribeFunction;

    getRegularUpdateData: () => Promise<RegularUpdateData>;

    toggleRegularUpdate: () => Promise<void>;
  };
}
