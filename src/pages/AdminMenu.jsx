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
  const [sauceInput, setSauceInput] = useState("");
  const [sauces, setSauces] = useState([]);
  const [flavorInput, setFlavorInput] = useState("");
  const [flavors, setFlavors] = useState([]);
  const [extraName, setExtraName] = useState("");
  const [extraPrice, setExtraPrice] = useState("");
  const [extras, setExtras] = useState([]);
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

  const handleAddSauce = () => {
    if (sauceInput.trim()) {
      setSauces([...sauces, sauceInput.trim()]);
      setSauceInput("");
    }
  };

  const handleAddFlavor = () => {
    if (flavorInput.trim()) {
      setFlavors([...flavors, flavorInput.trim()]);
      setFlavorInput("");
    }
  };

  const handleAddExtra = () => {
    if (extraName.trim() && extraPrice.trim()) {
      setExtras([...extras, { name: extraName.trim(), price: parseFloat(extraPrice) }]);
      setExtraName("");
      setExtraPrice("");
    }
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setImage("");
    setSauces([]);
    setFlavors([]);
    setExtras([]);
    setSauceInput("");
    setFlavorInput("");
    setExtraName("");
    setExtraPrice("");
    setEditingId(null);
    setMode("");
  };

  const handleAddOrUpdateItem = async () => {
    if (!name || !price || !image || !mode) return;

    const itemData = {
      name,
      price: parseFloat(price),
      image,
      sauces,
      flavors,
      extras,
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
    setFlavors(item.flavors || []);
    setExtras(item.extras || []);
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

  const showFlavorInput = mode === "คู่หู" || mode === "ทวิสเตอร์";
  const showExtraInput = mode === "น้ำผลไม้ปั่น";

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

        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="">Select Category</option>
          {modes.map((m, i) => (
            <option key={i} value={m}>{m}</option>
          ))}
        </select>

        {/* Sauce */}
        <div className={styles.toppingsSection}>
          <input
            type="text"
            placeholder="Add Sauce"
            value={sauceInput}
            onChange={(e) => setSauceInput(e.target.value)}
          />
          <button className={styles.addToppingButton} onClick={handleAddSauce}>
            + Add Sauce
          </button>
        </div>

        {/* Flavor */}
        {showFlavorInput && (
          <div className={styles.toppingsSection}>
            <input
              type="text"
              placeholder="Add Flavor"
              value={flavorInput}
              onChange={(e) => setFlavorInput(e.target.value)}
            />
            <button className={styles.addToppingButton} onClick={handleAddFlavor}>
              + Add Flavor
            </button>
          </div>
        )}

        {/* Extra */}
        {showExtraInput && (
          <div className={styles.toppingsSection}>
            <input
              type="text"
              placeholder="Extra Name"
              value={extraName}
              onChange={(e) => setExtraName(e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Extra Price"
              value={extraPrice}
              onChange={(e) => setExtraPrice(e.target.value)}
            />
            <button className={styles.addToppingButton} onClick={handleAddExtra}>
              + Add Extra
            </button>
          </div>
        )}

        <div className={styles.toppingsList}>
          {sauces.map((s, i) => <span key={i}>{s}</span>)}
          {flavors.map((f, i) => <span key={i}>Flavor: {f}</span>)}
          {extras.map((e, i) => (
            <span key={i}>Extra: {e.name} (+${e.price.toFixed(2)})</span>
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
            {item.flavors && <p>Flavor: {item.flavors.join(", ")}</p>}
            {item.extras && item.extras.length > 0 && (
              <p>
                Extras:{" "}
                {item.extras.map((ex, i) => `${ex.name} ($${ex.price})`).join(", ")}
              </p>
            )}
            <p>Status: {item.available ? "✅ Available" : "❌ Unavailable"}</p>
            <button onClick={() => handleEdit(item)}>Edit</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
