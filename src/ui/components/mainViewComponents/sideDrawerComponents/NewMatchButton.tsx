import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useState } from "react";

export function NewMatchButton() {
  const [isNewMatchNameDialogOpen, setIsNewMatchDialogOpen] = useState(false);
  const [matchName, setMatchName] = useState("");

  const handleCreateNewMatch = () => {
    console.log(`Match with name "${matchName}" was requested...`);
    window.electron.createNewMatch(matchName);
    setIsNewMatchDialogOpen(false);
    setMatchName("");
  };

  return (
    <>
      <Button onClick={() => setIsNewMatchDialogOpen(true)}> New Match </Button>

      <Dialog
        open={isNewMatchNameDialogOpen}
        onClose={() => setIsNewMatchDialogOpen(false)}
      >
        <DialogTitle>Name Your Match</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Match Name"
            fullWidth
            variant="outlined"
            value={matchName}
            onChange={(e) => setMatchName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewMatchDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateNewMatch}
            disabled={matchName.trim().length === 0}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
