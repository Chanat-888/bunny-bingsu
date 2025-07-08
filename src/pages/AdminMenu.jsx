import { useState, useEffect } from "react";
import styles from "./AdminMenu.module.css";

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    image: "",
    toppings: "",
    ready: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem("menu");
    if (stored) {
      setMenuItems(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("menu", JSON.stringify(menuItems));
  }, [menuItems]);

  const handleChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    const toppingsArray = newItem.toppings
      ? newItem.toppings.split(",").map((t) => t.trim())
      : [];

    const item = {
      id: Date.now(),
      name: newItem.name,
      price: parseFloat(newItem.price),
      image: newItem.image,
      toppings: toppingsArray,
      ready: true,
    };

    setMenuItems([...menuItems, item]);
    setNewItem({ name: "", price: "", image: "", toppings: "", ready: true });
  };

  const toggleReady = (id) => {
    const updated = menuItems.map((item) =>
      item.id === id ? { ...item, ready: !item.ready } : item
    );
    setMenuItems(updated);
  };

  const handleDelete = (id) => {
    const updated = menuItems.filter((item) => item.id !== id);
    setMenuItems(updated);
  };

  return (
    <div className={styles.page}>
      <h1>Admin Menu Management</h1>

      <div className={styles.form}>
        <input
          name="name"
          value={newItem.name}
          onChange={handleChange}
          placeholder="Item name"
        />
        <input
          name="price"
          value={newItem.price}
          onChange={handleChange}
          placeholder="Price"
          type="number"
        />
        <input
          name="image"
          value={newItem.image}
          onChange={handleChange}
          placeholder="Image URL"
        />
        <input
          name="toppings"
          value={newItem.toppings}
          onChange={handleChange}
          placeholder="Toppings (comma-separated)"
        />
        <button onClick={handleAdd}>Add Menu Item</button>
      </div>

      <div className={styles.list}>
        {menuItems.map((item) => (
          <div key={item.id} className={styles.item}>
            <img src={item.image} alt={item.name} />
            <div>
              <strong>{item.name}</strong> - ${item.price.toFixed(2)}
              <p>Status: {item.ready ? "✅ Ready" : "❌ Not Ready"}</p>
              {item.toppings.length > 0 && (
                <p>Toppings: {item.toppings.join(", ")}</p>
              )}
            </div>
            <div className={styles.actions}>
              <button onClick={() => toggleReady(item.id)}>
                {item.ready ? "Mark Not Ready" : "Mark Ready"}
              </button>
              <button onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
