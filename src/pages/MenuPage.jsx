import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import styles from "./MenuPage.module.css";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useCart } from "../context/CartContext";
import { FiShoppingCart } from "react-icons/fi";
import React from "react";

export default function MenuPage() {
  const [groupedMenu, setGroupedMenu] = useState({});
  const { cart, addToCart } = useCart();
  const [popupVisible, setPopupVisible] = useState(false);
  const sectionRefs = useRef({}); // holds refs for each mode

  // 🔹 custom order for modes
  const MODE_ORDER = ["เค้ก", "ขนมปังปิ้ง", "บิงซูสายไหม", "ท็อปปิ้ง", "ทวิสเตอร์", "คู่หู" , "น้ำผลไม้ปั่น" , "Smoothie" , "น้ำผลไม้สกัด" ,  "น้ำอัดลม" , "เฟรนช์ฟรายส์"];

  const orderIndex = (m) => {
    const i = MODE_ORDER.indexOf(m);
    return i === -1 ? MODE_ORDER.length + m.localeCompare("") : i;
  };

  const orderedModes = (group) =>
    Object.keys(group).sort((a, b) => {
      const ai = orderIndex(a);
      const bi = orderIndex(b);
      return ai === bi ? a.localeCompare(b, "th") : ai - bi;
    });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "menu"), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const grouped = {};
      items
        .filter((item) => item.available)
        .forEach((item) => {
          const mode = item.mode || "Other";
          if (!grouped[mode]) grouped[mode] = [];
          grouped[mode].push(item);
        });

      setGroupedMenu(grouped);

      // Initialize refs after grouping
      const refs = {};
      orderedModes(grouped).forEach((mode) => {
        refs[mode] = refs[mode] || React.createRef();
      });
      sectionRefs.current = refs;
    });

    return () => unsub();
  }, []);

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const scrollToMode = (mode) => {
    const section = sectionRefs.current[mode];
    if (section && section.current) {
      section.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const showAddedPopup = () => {
    setPopupVisible(true);
    setTimeout(() => setPopupVisible(false), 1500); // hide after 1.5 sec
  };

  return (
    <div className={styles.page}>
      <div className={styles.cartSummary}>
        <Link to="/checkout" className={styles.cartLink}>
          <FiShoppingCart size={24} />
          <span className={styles.cartCount}>{itemCount}</span>
        </Link>
      </div>

      <h1 className={styles.title}>Menu</h1>

      {popupVisible && (
        <div className={styles.popup}>
          ✅ Added to cart!
        </div>
      )}

      {/* ▶️ Buttons to scroll to each mode */}
      <div className={styles.modeNav}>
        {orderedModes(groupedMenu).map((mode) => (
          <button
            key={mode}
            className={styles.modeButton}
            onClick={() => scrollToMode(mode)}
          >
            {mode}
          </button>
        ))}
      </div>

      {orderedModes(groupedMenu).map((mode) => (
        <div key={mode} ref={sectionRefs.current[mode]} className={styles.section}>
          <h2 className={styles.modeTitle}>{mode}</h2>
          <div className={styles.grid}>
            {["ท็อปปิ้ง", "น้ำอัดลม", "เค้ก"].includes(mode) ? ( // ← added "เค้ก"
              groupedMenu[mode].map((item) => (
                <div key={item.id} className={styles.cardWrapper}>
                  <ProductCard {...item} />
                  <button
                    className={styles.quickAddButton}
                    onClick={() => {
                      addToCart({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: 1,
                        sauces: [],
                        extras: [],
                        extraPrice: 0,
                        flavors: [],
                        toppings: [],
                        cheeses: [],
                        cheesePrice: 0,
                        description: [],
                        mode: item.mode,
                      });
                      showAddedPopup(); // 👈 show confirmation
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              ))
            ) : (
              groupedMenu[mode].map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className={styles.link}
                >
                  <ProductCard {...item} />
                </Link>
              ))
            )}
          </div>
        </div>
      ))}

      <div className={styles.checkoutWrapper}>
        <Link to="/checkout" className={styles.checkoutButton}>
          Go to Checkout
        </Link>
      </div>
    </div>
  );
}
