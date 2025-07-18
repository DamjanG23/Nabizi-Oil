import { useEffect, useRef, useState } from "react";
import { SettingsDrawer } from "./SettingsDrawer";
import { ConfigLocationDialog } from "./ConfigLocationDialog";

interface BottomSectionProps {
  fuelList: FuelItem[];
}

export function BottomSection({ fuelList }: BottomSectionProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    console.log("Fuel data to send:", fuelList);
    alert("Data ready to send! Check console for details.");
    window.electron.sendDataToScreen(fuelList);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      drawerRef.current &&
      !drawerRef.current.contains(event.target as Node)
    ) {
      setIsDrawerOpen(false);
    }
  };

  useEffect(() => {
    if (isDrawerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDrawerOpen]);

  return (
    <>
      <div className="send-section">
        <button className="send-button" onClick={handleSend}>
          Send Data
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
          setIsDialogOpen={setIsDialogOpen}
          setIsDrawerOpen={setIsDrawerOpen}
        />
      )}

      {isDialogOpen && (
        <ConfigLocationDialog setIsDialogOpen={setIsDialogOpen} />
      )}
    </>
  );
}
