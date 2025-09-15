import { useEffect, useState } from "react";
import "./settingsDrawer.css";

interface SettingsDrawerProps {
  drawerRef: React.RefObject<HTMLDivElement | null>;
  setIsConfigLocationDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTimeDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SettingsDrawer({
  drawerRef,
  setIsConfigLocationDialogOpen,
  setIsTimeDialogOpen,
  setIsDrawerOpen,
}: SettingsDrawerProps) {
  const [regularUpdateData, setRegularUpdateData] = useState<RegularUpdateData>(
    { isRegularUpdateEnabled: true, regularUpdateTime: "00:00" }
  );

  useEffect(() => {
    const fetchRegularUpdateData = async () => {
      const data = await window.electron.getRegularUpdateData();
      setRegularUpdateData(data);
    };

    fetchRegularUpdateData();
  }, []);

  useEffect(() => {
    const unsubscribe = window.electron.regularUpdateData(
      (regularUpdateData) => {
        setRegularUpdateData(regularUpdateData);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <>
      <div className="settings-drawer" ref={drawerRef}>
        <h2>Settings</h2>
        <button
          className="config-location-button"
          onClick={() => {
            setIsConfigLocationDialogOpen(true);
            setIsDrawerOpen(false);
          }}
        >
          Config Location
        </button>

        <div className="setting-option">
          <label htmlFor="regular-update-toggle">Regular Update</label>
          <label className="toggle-switch">
            <input
              id="regular-update-toggle"
              type="checkbox"
              checked={regularUpdateData?.isRegularUpdateEnabled}
              onChange={() => window.electron.toggleRegularUpdate()}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-option">
          <label>
            Update Time (
            {regularUpdateData.isRegularUpdateEnabled
              ? regularUpdateData.regularUpdateTime
              : "--:--"}
            )
          </label>
          <button
            className="config-time-button"
            disabled={!regularUpdateData?.isRegularUpdateEnabled}
            onClick={() => {
              setIsTimeDialogOpen(true);
              setIsDrawerOpen(false);
            }}
          >
            Set Time
          </button>
        </div>
      </div>
    </>
  );
}
