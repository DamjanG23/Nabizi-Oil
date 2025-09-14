import React, { useState, useEffect } from "react";
import "./timeDialog.css"; // We'll create this file next

interface TimeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentTime: string;
}

function TimeDialog({ isOpen, onClose, currentTime }: TimeDialogProps) {
  // State to hold the time value from the input, initialized with the current time
  const [time, setTime] = useState(currentTime || "09:00");

  // This effect ensures the dialog's time resets to the currently saved
  // time each time it is opened.
  useEffect(() => {
    if (isOpen) {
      setTime(currentTime || "09:00");
    }
  }, [isOpen, currentTime]);

  // Don't render anything if the dialog isn't supposed to be open
  if (!isOpen) {
    return null;
  }

  return (
    // The overlay covers the whole screen. Clicking it closes the dialog.
    <div className="dialog-overlay" onClick={onClose}>
      {/* stopPropagation prevents a click inside the dialog from closing it */}
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
          <button className="button-primary" /*onClick={handleSave}*/>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default TimeDialog;
