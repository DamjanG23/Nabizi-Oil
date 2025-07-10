import { Button, Divider, Drawer } from "@mui/material";
import { useEffect, useState } from "react";
import { ТoggleScoreboardVisibilityButton } from "./sideDrawerComponents/ТoggleScoreboardVisibilityButton";
import { ToggleScoreboardFullscreenButton } from "./sideDrawerComponents/ToggleScoreboardFullscreenButton";
import { ToggleMainFullscreenButton } from "./sideDrawerComponents/ToggleMainFullscreenButton";
import { NewMatchButton } from "./sideDrawerComponents/NewMatchButton";

interface SideDrawerProps {
  isMatchLoaded: boolean;
}

export function SideDrawer({ isMatchLoaded }: SideDrawerProps) {
  const [scoreboardVisibility, setScoreboardVisibility] = useState(false);

  useEffect(() => {
    window.electron.getIsScoreboardOpen().then(setScoreboardVisibility);
  }, []);

  useEffect(() => {
    const unsubscribe = window.electron.onScoreboardWindowClosed(() => {
      setScoreboardVisibility(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = window.electron.onScoreboardWindowOpened(() => {
      setScoreboardVisibility(true);
    });

    return unsubscribe;
  }, []);

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
      }}
    >
      <ТoggleScoreboardVisibilityButton
        scoreboardVisibility={scoreboardVisibility}
      />

      <ToggleScoreboardFullscreenButton
        scoreboardVisibility={scoreboardVisibility}
      />

      <ToggleMainFullscreenButton />

      <Divider />

      {/*--------------- Implement these buttons -----------------*/}

      <Button disabled={isMatchLoaded ? false : true}> Config </Button>

      <Button disabled={isMatchLoaded ? false : true}> Teams </Button>

      <Button disabled={isMatchLoaded ? false : true}> Score </Button>

      {/*----------------------------------------------------------*/}

      <Divider />

      <NewMatchButton />

      <Button> Load Match </Button>

      <Button disabled={isMatchLoaded ? false : true}> Close Match </Button>
    </Drawer>
  );
}
