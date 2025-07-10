import { SideDrawer } from "./components/mainViewComponents/SideDrawer";

interface MainViewProps {
  isMatchLoaded: boolean;
}

export default function MainView({ isMatchLoaded }: MainViewProps) {
  return (
    <div>
      <SideDrawer isMatchLoaded={isMatchLoaded} />
      <div>
        {isMatchLoaded
          ? ""
          : "///////////////////////////////// Please Load/Start a Match!"}
      </div>
    </div>
  );
}
