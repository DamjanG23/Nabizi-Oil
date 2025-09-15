import { useState } from "react";
import "./timeDialog.css";

interface TimeDialogProps {
  setIsTimeDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function TimeDialog({ setIsTimeDialogOpen }: TimeDialogProps) {
  const [hour, setHour] = useState<string>("00");
  const [minute, setMinute] = useState<string>("00");

  const handleSave = () => {
    const formattedHour = hour.padStart(2, "0");
    const formattedMinute = minute.padStart(2, "0");

    const selectedTime = `${formattedHour}:${formattedMinute}`;

    window.electron.setRegularUpdateTime(selectedTime);

    setIsTimeDialogOpen(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <h3>Set Regular Update Time</h3>

        <div className="time-input-container">
          <input
            type="number"
            min="0"
            max="23"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="time-input"
            aria-label="Hour"
          />
          <span className="time-separator">:</span>
          <input
            type="number"
            min="0"
            max="59"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="time-input"
            aria-label="Minute"
          />
        </div>

        <div className="dialog-buttons">
          <button
            onClick={() => setIsTimeDialogOpen(false)}
            className="button-secondary"
          >
            Cancel
          </button>
          <button onClick={handleSave} className="button-primary">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
