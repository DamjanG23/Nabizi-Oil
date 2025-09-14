import { useEffect, useState } from "react";
import "./styles/App.css";
import { LogoSelection } from "./components/logoSelection/LogoSelection";
import { BottomSection } from "./components/BottomSection";
import { FuelItemsList } from "./components/fuelItemsList/FuelItemsList";

function App() {
  const [fuelList, setFuelList] = useState<FuelItem[]>([]);

  useEffect(() => {
    async function loadFuelItems() {
      try {
        const fuelItems = await window.electron.getFuelItems();
        setFuelList(fuelItems);
      } catch (error) {
        console.error("Failed to load fuel items:", error);
      }
    }
    loadFuelItems();
  }, []);

  return (
    <div className="app-container">
      <LogoSelection></LogoSelection>
      <FuelItemsList
        fuelList={fuelList}
        setFuelList={setFuelList}
      ></FuelItemsList>
      <BottomSection fuelList={fuelList} />
    </div>
  );
}

export default App;
