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
  const [toppingInput, setToppingInput] = useState("");
  const [toppings, setToppings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [mode, setMode] = useState("");

  const menuCollection = collection(db, "menu");

  const modes = [
    "บิงซูสายไหม", "ขนมปังปิ้ง", "ทวิสเตอร์", "คู่หู",
    "น้ำผลไม้สกัด", "น้ำผลไม้ปั่น", "Smoothie", "เฟรนช์ฟรายส์",
    "น้ำอัดลม", "ท็อปปิ้ง"
  ];

  useEffect(() => {
    const fetchMenu = async () => {
      const snapshot = await getDocs(menuCollection);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    setToppings([]);
    setToppingInput("");
    setEditingId(null);
    setMode("");
  };

  const handleAddOrUpdateItem = async () => {
    if (!name || !price || !image || !mode) return;

    const itemData = {
      name,
      price: parseFloat(price),
      image,
      toppings,
      available: true,
      mode
    };

    try {
      if (editingId) {
        const ref = doc(db, "menu", editingId);
        await updateDoc(ref, itemData);
        setMenu(menu.map(item => item.id === editingId ? { id: editingId, ...itemData } : item));
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
    setToppings(item.toppings || []);
    setMode(item.mode || "");
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "menu", id));
      setMenu(menu.filter(item => item.id !== id));
    } catch (error) {
      console.error("Failed to delete:", error);
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

        {/* Mode dropdown */}
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="">Select Category</option>
          {modes.map((m, i) => (
            <option key={i} value={m}>{m}</option>
          ))}
        </select>

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
            <p>Mode: {item.mode}</p>
            <p>Toppings: {item.toppings?.join(", ") || "None"}</p>
            <p>Status: {item.available ? "✅ Available" : "❌ Unavailable"}</p>
            <button onClick={() => handleEdit(item)}>Edit</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
