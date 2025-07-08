// src/pages/MenuPage.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useCart } from "../context/CartContext";
import styles from "./MenuPage.module.css";
import { FiShoppingCart } from "react-icons/fi";

export default function MenuPage() {
  const [menu, setMenu] = useState([]);
  const { cart, addToCart } = useCart();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const snapshot = await getDocs(collection(db, "menu"));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMenu(data);
      } catch (error) {
        console.error("Failed to load menu:", error);
      }
    };

    fetchMenu();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.cartSummary}>
        <Link to="/checkout" className={styles.cartLink}>
          <FiShoppingCart size={24} />
          <span className={styles.cartCount}>{itemCount}</span>
        </Link>
      </div>

      <h1 className={styles.title}>Menu</h1>

      <div className={styles.grid}>
        {menu.map((item) => (
          <div key={item.id} className={styles.card}>
            <img src={item.image} alt={item.name} />
            <h3>{item.name}</h3>
            <p>${item.price}</p>
            <button
              disabled={!item.available}
              className={item.available ? styles.addButton : styles.disabledButton}
              onClick={() => navigate(`/product/${item.id}`)}
            >
              {item.available ? "Add to Cart" : "Unavailable"}
            </button>
          </div>
        ))}
      </div>

      <div className={styles.checkoutWrapper}>
        <Link to="/checkout" className={styles.checkoutButton}>
          Go to Checkout
        </Link>
      </div>
    </div>
  );
}
