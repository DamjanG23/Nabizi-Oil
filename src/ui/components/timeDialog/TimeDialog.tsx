import { useState, useEffect } from "react";
import "./timeDialog.css";

interface TimeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentTime: string;
}

export function TimeDialog({ isOpen, onClose, currentTime }: TimeDialogProps) {
  const [time, setTime] = useState(currentTime);

  useEffect(() => {
    if (isOpen) {
      setTime(currentTime || "09:00");
    }
  }, [isOpen, currentTime]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <h2>Select Update Time</h2>
        <p>Choose the time of day for the regular update.</p>

        <input
          type="time"
          className="time-input"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <div className="dialog-actions">
          <button className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button-primary">Save</button>
        </div>
      </div>
    </div>
  );
}
