import { useEffect, useState } from "react";
import "./styles/App.css";
import { LogoSelection } from "./components/LogoSelection";
import { BottomSection } from "./components/BottomSection";

function App() {
  const [fuelList, setFuelList] = useState<FuelItem[]>([]);

  useEffect(() => {
    const loadFuelItems = async () => {
      try {
        const fuelNames = await window.electron.getFuelItems();
        // Convert string[] to FuelItem[] with generated IDs and default prices
        const fuelItems: FuelItem[] = fuelNames.map((name, index) => ({
          id: index + 1,
          name: name,
          price: 0,
        }));
        setFuelList(fuelItems);
      } catch (error) {
        console.error("Failed to load fuel items:", error);
      }
    };

    loadFuelItems();
  }, []);

  // Function to handle changes in fuel name
  const handleNameChange = (id: number, newName: string) => {
    setFuelList((prevList) =>
      prevList.map((item) =>
        item.id === id ? { ...item, name: newName } : item
      )
    );
  };

  // Function to handle changes in fuel price
  const handlePriceChange = (id: number, newPrice: string) => {
    const price = parseFloat(newPrice) || 0;
    setFuelList((prevList) =>
      prevList.map((item) =>
        item.id === id ? { ...item, price: price } : item
      )
    );
  };

  return (
    <div className="app-container">
      <LogoSelection></LogoSelection>

      {/* Scrollable list of fuel items */}
      <div className="fuel-list-container">
        <div className="fuel-list">
          {fuelList.map((item) => (
            <div key={item.id} className="fuel-item">
              <input
                type="text"
                className="fuel-name-input"
                value={item.name}
                onChange={(e) => handleNameChange(item.id, e.target.value)}
                placeholder="Fuel Name"
                disabled
              />
              <input
                type="number"
                className="fuel-price-input"
                value={item.price}
                onChange={(e) => handlePriceChange(item.id, e.target.value)}
                placeholder="Price"
                step="0.01"
                min="0"
              />
            </div>
          ))}
        </div>
      </div>

      <BottomSection fuelList={fuelList} />
    </div>
  );
}

export default App;
