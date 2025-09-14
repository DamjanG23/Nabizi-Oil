import "./fuelItemsList.css";

interface FuelItemsListProps {
  fuelList: FuelItem[];
  setFuelList: (value: React.SetStateAction<FuelItem[]>) => void;
}

export function FuelItemsList({ fuelList, setFuelList }: FuelItemsListProps) {
  const handleNameChange = (id: number, newName: string) => {
    setFuelList((prevList) =>
      prevList.map((item) =>
        item.id === id ? { ...item, name: newName } : item
      )
    );
  };

  const handlePriceChange = (id: number, newPrice: string) => {
    const price = parseFloat(newPrice) || 0;
    setFuelList((prevList) =>
      prevList.map((item) =>
        item.id === id ? { ...item, price: price } : item
      )
    );
  };

  return (
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
  );
}
