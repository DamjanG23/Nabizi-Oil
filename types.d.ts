type Match = {
  matchName: string;
};

type MatchConfig = {
  config: string;
};

type EventPayloadMaping = {
  getConfig: MatchConfig;
  createNewMatch: string;
  onMatchCreated: Match;
};

type UnsubscribeFunction = () => void;

interface Window {
  electron: {
    getConfig: () => Promise<MatchConfig>;

    createNewMatch: (matchName: string) => void;

    onMatchCreated: (
      callback: (currentMatch: Match) => void
    ) => UnsubscribeFunction;
  };
}
