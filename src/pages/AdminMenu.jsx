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
  const [toppingInput, setToppingInput] = useState("");
  const [toppings, setToppings] = useState([]);
  const [cheeseName, setCheeseName] = useState("");
  const [cheeses, setCheeses] = useState([]);
  const [cheesePrice, setCheesePrice] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [descriptions, setDescriptions] = useState([]);

  const menuCollection = collection(db, "menu");

  const modes = [
    "บิงซูสายไหม", "ขนมปังปิ้ง", "ทวิสเตอร์", "คู่หู",
    "น้ำผลไม้สกัด", "น้ำผลไม้ปั่น", "Smoothie", "เฟรนช์ฟรายส์",
    "น้ำอัดลม", "ท็อปปิ้ง", "สมูทตี้",
    "เค้ก",
    "สปาเก็ตตี้" // 👈 Added new mode
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

  const handleAddDescription = () => {
    if (descriptionInput.trim()) {
      setDescriptions([...descriptions, descriptionInput.trim()]);
      setDescriptionInput("");
    }
  };

  const handleAddFlavor = () => {
    if (flavorInput.trim()) {
      setFlavors([...flavors, flavorInput.trim()]);
      setFlavorInput("");
    }
  };

  const handleAddTopping = () => {
    if (toppingInput.trim()) {
      setToppings([...toppings, toppingInput.trim()]);
      setToppingInput("");
    }
  };

  const handleAddCheese = () => {
    if (cheeseName.trim() && cheesePrice.trim()) {
      setCheeses([...cheeses, { name: cheeseName.trim(), price: parseFloat(cheesePrice) }]);
      setCheeseName("");
      setCheesePrice("");
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
    setToppingInput("");
    setToppings([]);
    setCheeseName("");
    setCheeses([]);
    setCheesePrice("");
    setDescriptionInput("");
    setDescriptions([]);
  };

  const handleAddOrUpdateItem = async () => {
    if (!name || !price || !image || !mode) return;

    const itemData = {
      name,
      price: parseFloat(price),
      image,
      sauces,
      flavors,
      toppings,
      cheeses,
      extras,
      descriptions,
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
    setToppings(item.toppings || []);
    setCheeses(item.cheeses || []);
    setDescriptions(item.descriptions || []);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "menu", id));
      setMenu(menu.filter(item => item.id !== id));
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  // 🔹 NEW: toggle availability without changing other functions
  const toggleAvailability = async (item) => {
    try {
      const ref = doc(db, "menu", item.id);
      const next = !item.available;
      await updateDoc(ref, { available: next });
      setMenu(prev =>
        prev.map(m => (m.id === item.id ? { ...m, available: next } : m))
      );
    } catch (err) {
      console.error("Failed to toggle availability:", err);
    }
  };

  const showFlavorInput = mode === "คู่หู" || mode === "ทวิสเตอร์" || mode === "เฟรนช์ฟรายส์";
  const showExtraInput = mode === "น้ำผลไม้ปั่น" || mode === "สมูทตี้";
  const showToppingInput = mode === "ทวิสเตอร์";
  const showCheeseInput = mode === "เฟรนช์ฟรายส์";
  // Added check for "สปาเก็ตตี้" for Sauce and Description, hidden for Flavor/Extra/Topping/Cheese
  const showSauceInput = mode !== "เค้ก" && mode !== "น้ำอัดลม" && mode !== "ท็อปปิ้ง";
  const showDescriptionInput = mode === "สปาเก็ตตี้";

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
        {showSauceInput && (
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
        )}

        {/* Description */}
        {showDescriptionInput && (
          <div className={styles.toppingsSection}>
            <input
              type="text"
              placeholder="Add Description"
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
            />
            <button className={styles.addToppingButton} onClick={handleAddDescription}>
              + Add Description
            </button>
          </div>
        )}

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

        {/* Cheese */}
        {showCheeseInput && (
          <div className={styles.toppingsSection}>
            <input
              type="text"
              placeholder="Cheese Name"
              value={cheeseName}
              onChange={(e) => setCheeseName(e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Cheese Price"
              value={cheesePrice}
              onChange={(e) => setCheesePrice(e.target.value)}
            />
            <button className={styles.addToppingButton} onClick={handleAddCheese}>
              + Add Cheese
            </button>
          </div>
        )}

        {/* Topping */}
        {showToppingInput && (
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
          {toppings.map((t, i) => <span key={i}>Topping: {t}</span>)}
          {descriptions.map((d, i) => <span key={i}>Description: {d}</span>)}
          {cheeses.map((e, i) => (
            <span key={i}>Cheese: {e.name} (+฿{e.price.toFixed(2)})</span>
          ))}
          {extras.map((e, i) => (
            <span key={i}>Extra: {e.name} (+฿{e.price.toFixed(2)})</span>
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
            <p>฿{item.price}</p>
            <p>Mode: {item.mode}</p>
            <p>Sauce: {item.sauces?.join(", ") || "None"}</p>
            <p>Description: {item.descriptions?.join(", ") || "None"}</p>
            {item.flavors && <p>Flavor: {item.flavors.join(", ")}</p>}
            {item.toppings && <p>Topping: {item.toppings.join(", ")}</p>}
            {item.cheeses && item.cheeses.length > 0 && (
              <p>
                Cheeses: {item.cheeses.map((c) => `${c.name} ($${c.price})`).join(", ")}
              </p>
            )}
            {item.extras && item.extras.length > 0 && (
              <p>
                Extras: {item.extras.map((ex) => `${ex.name} ($${ex.price})`).join(", ")}
              </p>
            )}
            <p>Status: {item.available ? "✅ Available" : "❌ Unavailable"}</p>

            {/* 🔹 NEW: Toggle button */}
            <button onClick={() => toggleAvailability(item)}>
              {item.available ? "Set Unavailable" : "Set Available"}
            </button>

            <button onClick={() => handleEdit(item)}>Edit</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}