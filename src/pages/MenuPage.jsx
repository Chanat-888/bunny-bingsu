import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { FiShoppingCart } from "react-icons/fi";
import styles from "./MenuPage.module.css";

export default function MenuPage() {
  const { cart } = useCart();
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("menu");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Show only items that are "ready"
      const readyItems = parsed.filter((item) => item.ready);
      setProducts(readyItems);
    }
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
        {products.map((item) => (
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
