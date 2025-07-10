import { app, BrowserWindow } from "electron";
import { ipcWebContentsSend } from "../utils/util.js";
import { join } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";

//const POOLING_INTERVAL = 1000;

// export function getMatchSeconds(window: BrowserWindow) {
//   let seconds = 0;

//   setInterval(async () => {
//     seconds++;
//     ipcWebContentsSend("getMatchSeconds", window.webContents, { seconds });
//   }, POOLING_INTERVAL);
// }

export function getScoreboardState() {
  const scoreboardState: string = "scoreboardState 123";
  const teamAName: string = "Rabotnicki";
  const teamBName: string = "Strumica";
  return { scoreboardState, teamAName, teamBName };
}

export function getConfig() {
  const config = "match config 123";
  return { config };
}

export function createNewMatch(matchName: string, window: BrowserWindow) {
  const newMatch: Match = { matchName: matchName };

  // Get the app's data directory
  const dataPath = join(app.getPath("userData"), "matches.json");

  // Read existing matches
  let existingMatches: Match[] = [];
  if (existsSync(dataPath)) {
    const data = readFileSync(dataPath, "utf8");
    existingMatches = JSON.parse(data);
  }

  // Add new match
  existingMatches.push(newMatch);

  // Save back to file
  writeFileSync(dataPath, JSON.stringify(existingMatches, null, 2));

  console.log("Match saved on back end:", newMatch);

  ipcWebContentsSend("onMatchCreated", window.webContents, newMatch);
}
