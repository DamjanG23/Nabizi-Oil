import { useState } from "react";
import "./styles/App.css";

// Define the type for our fuel items
interface FuelItem {
  id: number;
  name: string;
  price: number;
}

// Demo array of fuel items (you can replace this with your actual data)
const demoFuelList: FuelItem[] = [
  { id: 1, name: "Gasoline", price: 3.45 },
  { id: 2, name: "Diesel", price: 3.89 },
  { id: 3, name: "Premium", price: 3.75 },
  { id: 4, name: "E85", price: 2.95 },
  { id: 5, name: "Kerosene", price: 4.2 },
  { id: 6, name: "Gasoline", price: 3.45 },
  { id: 7, name: "Diesel", price: 3.89 },
  { id: 8, name: "Premium", price: 3.75 },
  { id: 9, name: "E85", price: 2.95 },
  { id: 10, name: "Kerosene", price: 4.2 },
];

function App() {
  //const [currentMatch, setCurrentMatch] = useState<Match | null>(null);

  // useEffect(() => {
  //   const unsubscribe = window.electron.onMatchCreated((currentMatch) => {
  //     console.log(
  //       `Match with name "${currentMatch.matchName}" was saved to backend...`
  //     );
  //     setCurrentMatch(currentMatch);
  //   });

  //   return unsubscribe;
  // }, []);

  const [fuelList, setFuelList] = useState<FuelItem[]>(demoFuelList);

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

  // Function to handle send button click
  const handleSend = () => {
    console.log("Fuel data to send:", fuelList);
    // Here you would typically send the data to your electron backend
    // For now, we'll just log it to console
    alert("Data ready to send! Check console for details.");
  };

  return (
    <div className="app-container">
      {/* Logo section at the top */}
      <div className="logo-section">
        <div className="logo">FUEL MANAGER</div>
      </div>

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

      {/* Send button at the bottom */}
      <div className="send-section">
        <button className="send-button" onClick={handleSend}>
          Send Data
        </button>
      </div>
    </div>
  );
}

export default App;
