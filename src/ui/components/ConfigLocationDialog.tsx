import { useEffect, useState } from "react";

interface ConfigLocationDialogProps {
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ConfigLocationDialog({
  setIsDialogOpen,
}: ConfigLocationDialogProps) {
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfigPath = async () => {
      const path = await window.electron.getConfigPath();
      setCurrentLocation(path);
    };

    fetchConfigPath();
  }, []);

  useEffect(() => {
    const unsubscribe = window.electron.onConfigPathChanged((configPath) => {
      setCurrentLocation(configPath);
    });

    return unsubscribe;
  }, []);

  function handleInputClick() {
    window.electron.selectConfigPath();
  }

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <h3>Set Config Location</h3>
        <div className="clickable-input" onClick={handleInputClick}>
          {currentLocation || "No config path set"}
        </div>
        <div className="dialog-buttons">
          <button onClick={() => window.electron.setConfigPathToDefault()}>
            Reset to Default
          </button>
          <button onClick={() => setIsDialogOpen(false)}>Done</button>
        </div>
      </div>
    </div>
  );
}
