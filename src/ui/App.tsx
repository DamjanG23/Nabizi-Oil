// import { useEffect } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/App.css";
import MainView from "./MainView";
import ScoreboardView from "./ScoreboardView";
import { useEffect, useState } from "react";

function App() {
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const isMatchLoaded = currentMatch === null ? false : true;

  useEffect(() => {
    const unsubscribe = window.electron.onMatchCreated((currentMatch) => {
      console.log(
        `Match with name "${currentMatch.matchName}" was saved to backend...`
      );
      setCurrentMatch(currentMatch);
    });

    return unsubscribe;
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainView isMatchLoaded={isMatchLoaded} />} />
        <Route path="/scoreboard" element={<ScoreboardView />} />
      </Routes>
    </Router>
  );
}

export default App;
