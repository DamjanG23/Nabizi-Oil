import { Button } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";

interface ТoggleScoreboardVisibilityButtonProps {
  scoreboardVisibility: boolean;
}

export function ТoggleScoreboardVisibilityButton({
  scoreboardVisibility,
}: ТoggleScoreboardVisibilityButtonProps) {
  return (
    <Button
      //variant="outlined"
      color={scoreboardVisibility ? "error" : "success"}
      onClick={
        scoreboardVisibility
          ? window.electron.closeScoreboardWindow
          : window.electron.showScoreboardWindow
      }
      startIcon={scoreboardVisibility ? <CloseIcon /> : <VisibilityIcon />}
    >
      {scoreboardVisibility ? "Close Scoreboard" : "Open Scoreboard"}
    </Button>
  );
}
