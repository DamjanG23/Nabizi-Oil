import { useEffect, useRef, useState } from "react";
import { SettingsDrawer } from "../settingsDrawer/SettingsDrawer";
import { ConfigLocationDialog } from "../configLocationDialog/ConfigLocationDialog";
import "./bottomSection.css";
import { TimeDialog } from "../timeDialog/TimeDialog";

interface BottomSectionProps {
  fuelList: FuelItem[];
}

export function BottomSection({ fuelList }: BottomSectionProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfigLocationDialogOpen, setIsConfigLocationDialogOpen] =
    useState(false);
  const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  function handleSend() {
    console.log("Fuel data to send:", fuelList);
    alert("Data ready to save and send to screen!");
    window.electron.sendDataToScreen(fuelList);
  }

  function handleSave() {
    console.log("Fuel data to save:", fuelList);
    alert("Data ready to save!");
    window.electron.saveFuelItems(fuelList);
  }

  function handleClickOutside(event: MouseEvent) {
    if (
      drawerRef.current &&
      !drawerRef.current.contains(event.target as Node)
    ) {
      setIsDrawerOpen(false);
    }
  }

  useEffect(() => {
    if (isDrawerOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDrawerOpen]);

  return (
    <>
      <div className="send-section">
        <button className="send-button" onClick={handleSave}>
          Save
        </button>
        <button className="send-button" onClick={handleSend}>
          Save & Send
        </button>
        <button
          className="settings-button"
          onClick={() => setIsDrawerOpen(true)}
        >
          ⚙️
        </button>
      </div>

      {isDrawerOpen && (
        <SettingsDrawer
          drawerRef={drawerRef}
          setIsConfigLocationDialogOpen={setIsConfigLocationDialogOpen}
          setIsTimeDialogOpen={setIsTimeDialogOpen}
          setIsDrawerOpen={setIsDrawerOpen}
        />
      )}

      {isConfigLocationDialogOpen && (
        <ConfigLocationDialog setIsDialogOpen={setIsConfigLocationDialogOpen} />
      )}

      {isTimeDialogOpen && (
        <TimeDialog setIsTimeDialogOpen={setIsTimeDialogOpen} />
      )}
    </>
  );
}
