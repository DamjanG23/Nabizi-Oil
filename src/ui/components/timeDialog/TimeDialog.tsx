// import { useState, useEffect } from "react";
import "./timeDialog.css";

interface TimeDialogProps {
  setIsTimeDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function TimeDialog({ setIsTimeDialogOpen }: TimeDialogProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <h3>Set Regular Update Time</h3>
        <div className="dialog-buttons">
          <button onClick={() => setIsTimeDialogOpen(false)}>Done</button>
        </div>
      </div>
    </div>
  );
}
