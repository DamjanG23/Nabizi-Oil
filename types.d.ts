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
  decimalFontHeight?: number;
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
  // ------------------------------ CONFIG PATH ------------------------------ //
  getConfigPath: string | null;
  selectConfigPath: void;
  onConfigPathChanged: string;
  setConfigPathToDefault: void;

  // ------------------------------ CONFIG DATA ------------------------------ //

  getLogoBase64: string | null;

  // ------------------------------ FUEL ITEMS ------------------------------ //

  getFuelItems: FuelItem[];
  saveFuelItems: FuelItem[];

  // ------------------------------ SCREEN DATA ------------------------------ //

  sendDataToScreen: FuelItem[];

  // ------------------------------ REGULAR UPDATE ------------------------------ //
  regularUpdateData: RegularUpdateData;
  getRegularUpdateData: RegularUpdateData;
  toggleRegularUpdate: void;
  setRegularUpdateTime: string;
};

type UnsubscribeFunction = () => void;

interface Window {
  electron: {
    // ------------------------------ CONFIG PATH ------------------------------ //
    getConfigPath: () => Promise<string | null>;

    selectConfigPath: () => Promise<void>;

    onConfigPathChanged: (
      callback: (congifPath: string) => void
    ) => UnsubscribeFunction;

    setConfigPathToDefault: () => Promise<void>;

    // ------------------------------ CONFIG DATA ------------------------------ //

    getLogoBase64: () => Promise<string | null>;

    // ------------------------------ FUEL ITEMS ------------------------------ //

    getFuelItems: () => Promise<FuelItem[]>;

    saveFuelItems: (fuelItems: FuelItem[]) => void;

    // ------------------------------ SCREEN DATA ------------------------------ //

    sendDataToScreen: (fuelItems: FuelItem[]) => void;

    // ------------------------------ REGULAR UPDATE ------------------------------ //
    regularUpdateData: (
      callback: (regularUpdateData: RegularUpdateData) => void
    ) => UnsubscribeFunction;

    getRegularUpdateData: () => Promise<RegularUpdateData>;

    toggleRegularUpdate: () => Promise<void>;

    setRegularUpdateTime: (regularUpdateTime: strign) => void;
  };
}
