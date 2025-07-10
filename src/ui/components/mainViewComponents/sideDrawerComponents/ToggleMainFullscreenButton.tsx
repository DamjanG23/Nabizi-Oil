import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

export function ToggleMainFullscreenButton() {
  const [isMainFullScreen, setIsMainFullScreen] = useState(false);

  useEffect(() => {
    const unsubscribe = window.electron.onMainFullscreenChange(
      (isFullScreen) => {
        setIsMainFullScreen(isFullScreen);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <Button
      //variant="outlined"
      color={isMainFullScreen ? "error" : "success"}
      startIcon={isMainFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
      onClick={window.electron.toggleMainFullscreen}
    >
      FS Main Window
    </Button>
  );
}
