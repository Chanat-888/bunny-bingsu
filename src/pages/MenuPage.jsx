import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import styles from "./MenuPage.module.css";
import { useCart } from "../context/CartContext";
import { FiShoppingCart } from "react-icons/fi";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function MenuPage() {
  const { cart } = useCart();
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const [menu, setMenu] = useState([]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const snapshot = await getDocs(collection(db, "menu"));
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMenu(items.filter(item => item.available)); // only show available items
      } catch (error) {
        console.error("Failed to fetch menu:", error);
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
