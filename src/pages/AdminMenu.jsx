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

// ...[imports remain the same]

export default function AdminMenu() {
  const [menu, setMenu] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [sauceInput, setSauceInput] = useState("");
  const [sauces, setSauces] = useState([]);
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
    const items = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        sauces: data.sauces || [] // ✅ backfill if missing
      };
    });
    setMenu(items);
  };
  fetchMenu();
}, []);


  const handleAddSauce = () => {
    if (sauceInput.trim()) {
      setSauces([...sauces, sauceInput.trim()]);
      setSauceInput("");
    }
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setImage("");
    setSauces([]);
    setSauceInput("");
    setEditingId(null);
    setMode("");
  };

  const handleAddOrUpdateItem = async () => {
    if (!name || !price || !image || !mode) return;

    const itemData = {
      name,
      price: parseFloat(price),
      image,
      sauces: sauces.length > 0 ? sauces : [],
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
    setSauces(item.sauces || []);
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

  const toggleAvailability = async (item) => {
    try {
      const ref = doc(db, "menu", item.id);
      await updateDoc(ref, { available: !item.available });
      setMenu(menu.map(m => m.id === item.id ? { ...m, available: !m.available } : m));
    } catch (error) {
      console.error("Failed to toggle availability:", error);
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

        <div className={styles.saucesSection}>
          <input
            type="text"
            placeholder="Add Sauce"
            value={sauceInput}
            onChange={(e) => setSauceInput(e.target.value)}
          />
          <button className={styles.addSauceButton} onClick={handleAddSauce}>
            + Add Sauce
          </button>
        </div>

        <div className={styles.saucesList}>
          {sauces.map((sauce, i) => (
            <span key={i}>{sauce}</span>
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
            <p>Sauce: {item.sauces?.join(", ") || "None"}</p>
            <p>Status: {item.available ? "✅ Available" : "❌ Unavailable"}</p>
            <button onClick={() => handleEdit(item)}>Edit</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
            <button onClick={() => toggleAvailability(item)}>
              {item.available ? "Mark Unavailable" : "Mark Available"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
