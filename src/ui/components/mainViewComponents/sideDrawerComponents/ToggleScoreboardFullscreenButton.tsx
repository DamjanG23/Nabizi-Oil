import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

interface ТoggleScoreboardFullscreenButtonProps {
  scoreboardVisibility: boolean;
}

export function ToggleScoreboardFullscreenButton({
  scoreboardVisibility,
}: ТoggleScoreboardFullscreenButtonProps) {
  const [isScoreboardFullScreen, setIsScoreboardFullScreen] = useState(false);

  useEffect(() => {
    const unsubscribe = window.electron.onScoreboardFullscreenChange(
      (isFullScreen) => {
        setIsScoreboardFullScreen(isFullScreen);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <Button
      //variant="outlined"
      disabled={scoreboardVisibility ? false : true}
      color={isScoreboardFullScreen ? "error" : "success"}
      onClick={window.electron.toggleScoreboardFullscreen}
      startIcon={
        isScoreboardFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />
      }
    >
      FS Scoreboard
    </Button>
  );
}
