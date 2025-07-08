import { useState, useEffect } from "react";
import styles from "./AdminMenu.module.css";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

export default function AdminMenu() {
  const [menu, setMenu] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [mode, setMode] = useState(""); // 🆕 mode/category
  const [toppingInput, setToppingInput] = useState("");
  const [toppings, setToppings] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const menuCollection = collection(db, "menu");

  useEffect(() => {
    const fetchMenu = async () => {
      const snapshot = await getDocs(menuCollection);
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMenu(items);
    };
    fetchMenu();
  }, []);

  const handleAddTopping = () => {
    if (toppingInput.trim()) {
      setToppings([...toppings, toppingInput.trim()]);
      setToppingInput("");
    }
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setImage("");
    setMode(""); // reset mode too
    setToppings([]);
    setToppingInput("");
    setEditingId(null);
  };

  const handleAddOrUpdateItem = async () => {
    if (!name || !price || !image || !mode) return;
    const itemData = {
      name,
      price: parseFloat(price),
      image,
      mode,
      toppings,
      available: true
    };

    try {
      if (editingId) {
        const ref = doc(db, "menu", editingId);
        await updateDoc(ref, itemData);
        setMenu(menu.map((item) => (item.id === editingId ? { id: editingId, ...itemData } : item)));
      } else {
        const docRef = await addDoc(menuCollection, itemData);
        setMenu([...menu, { id: docRef.id, ...itemData }]);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleEdit = (item) => {
    setName(item.name);
    setPrice(item.price);
    setImage(item.image);
    setMode(item.mode || ""); // load mode
    setToppings(item.toppings || []);
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "menu", id));
      setMenu(menu.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const toggleAvailability = async (item) => {
    const newAvailability = !item.available;
    try {
      await updateDoc(doc(db, "menu", item.id), { available: newAvailability });
      setMenu(menu.map((m) =>
        m.id === item.id ? { ...m, available: newAvailability } : m
      ));
    } catch (err) {
      console.error("Failed to toggle availability:", err);
    }
  };

  return (
    <div className={styles.page}>
      <h1>Admin Menu</h1>

      <div className={styles.form}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          type="text"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category (e.g. Ice-cream, Sweets)"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        />
        <div className={styles.toppingsSection}>
          <input
            type="text"
            placeholder="Add Topping"
            value={toppingInput}
            onChange={(e) => setToppingInput(e.target.value)}
          />
          <button className={styles.addToppingButton} onClick={handleAddTopping}>
            + Add Topping
          </button>
        </div>
        <div className={styles.toppingsList}>
          {toppings.map((top, i) => (
            <span key={i}>{top}</span>
          ))}
        </div>
        <button className={styles.saveButton} onClick={handleAddOrUpdateItem}>
          {editingId ? "Update Item" : "Add Menu Item"}
        </button>
      </div>

      <div className={styles.menuList}>
        {menu.map((item, index) => (
          <div key={index} className={styles.card}>
            <img src={item.image} alt={item.name} />
            <h3>{item.name}</h3>
            <p>${item.price}</p>
            <p>Category: {item.mode || "N/A"}</p>
            <p>Toppings: {item.toppings?.join(", ") || "None"}</p>
            <p>Status: {item.available ? "✅ Available" : "❌ Unavailable"}</p>
            <button onClick={() => handleEdit(item)}>Edit</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
            <button onClick={() => toggleAvailability(item)}>
              {item.available ? "Mark as Unavailable" : "Mark as Available"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
