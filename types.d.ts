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
};

type FuelItem = {
  id: number;
  name: string;
  price: number;
};

type EventPayloadMaping = {
  getConfig: MatchConfig;
  createNewMatch: string;

  onFuelItemsLoaded: FuelItem[];
  loadConfig: void;
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
  };
}
