interface SettingsDrawerProps {
  drawerRef: React.RefObject<HTMLDivElement | null>;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SettingsDrawer({
  drawerRef,
  setIsDialogOpen,
  setIsDrawerOpen,
}: SettingsDrawerProps) {
  return (
    <div className="settings-drawer" ref={drawerRef}>
      <h2>Settings</h2>
      <button
        className="config-location-button"
        onClick={() => {
          setIsDialogOpen(true);
          setIsDrawerOpen(false);
        }}
      >
        Config Location
      </button>
    </div>
  );
}
