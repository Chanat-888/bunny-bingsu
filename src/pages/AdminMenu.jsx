// Updated AdminMenu.jsx with Firestore saving and editing
import { useState, useEffect } from "react";
import styles from "./AdminMenu.module.css";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
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

  const menuCollection = collection(db, "menu");

  useEffect(() => {
    const unsubscribe = onSnapshot(menuCollection, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenu(items);
    });
    return () => unsubscribe();
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
  };

  const handleAddOrUpdateItem = async () => {
    if (!name || !price || !image) return;
    const itemData = {
      name,
      price: parseFloat(price),
      image,
      toppings,
      available: true
    };

    try {
      if (editingId) {
        const ref = doc(db, "menu", editingId);
        await updateDoc(ref, itemData);
      } else {
        await addDoc(menuCollection, itemData);
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
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "menu", id));
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
        <div className={styles.toppingsSection}>
          <input
            type="text"
            placeholder="Add Topping"
            value={toppingInput}
            onChange={(e) => setToppingInput(e.target.value)}
          />
          <button onClick={handleAddTopping}>+ Add Topping</button>
        </div>
        <div className={styles.toppingsList}>
          {toppings.map((top, i) => (
            <span key={i}>{top}</span>
          ))}
        </div>
        <button onClick={handleAddOrUpdateItem}>
          {editingId ? "Update Item" : "Add Menu Item"}
        </button>
      </div>

      <div className={styles.menuList}>
        {menu.map((item, index) => (
          <div key={index} className={styles.card}>
            <img src={item.image} alt={item.name} />
            <h3>{item.name}</h3>
            <p>${item.price}</p>
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
