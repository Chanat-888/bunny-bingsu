import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import styles from "./MenuPage.module.css";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useCart } from "../context/CartContext";
import { FiShoppingCart } from "react-icons/fi";

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const { cart } = useCart();

  // 🟢 Real-time listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "menu"), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenuItems(items.filter(item => item.available));
    });

    return () => unsub(); // clean up listener
  }, []);

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

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
        {menuItems.map((item) => (
          <Link key={item.id} to={`/product/${item.id}`} className={styles.link}>
            <ProductCard {...item} />
          </Link>
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
