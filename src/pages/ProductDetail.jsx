import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./ProductDetail.module.css";
import { useCart } from "../context/CartContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      const docRef = doc(db, "menu", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.error("Product not found");
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <p>Loading product...</p>;

  const toggleTopping = (topping) => {
    setSelectedToppings((prev) =>
      prev.includes(topping)
        ? prev.filter((t) => t !== topping)
        : [...prev, topping]
    );
  };

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      toppings: selectedToppings,
    };
    addToCart(cartItem);
    alert("Added to cart!");
  };

  return (
    <div className={styles.page}>
      <img src={product.image} alt={product.name} className={styles.image} />
      <h1 className={styles.name}>{product.name}</h1>
      <p className={styles.price}>${product.price.toFixed(2)}</p>

      <div className={styles.section}>
        <label>Quantity:</label>
        <input
          type="number"
          value={quantity}
          min="1"
          onChange={(e) => setQuantity(Number(e.target.value))}
          className={styles.input}
        />
      </div>

      {product.toppings && product.toppings.length > 0 && (
        <div className={styles.section}>
          <label>Toppings:</label>
          <div className={styles.toppings}>
            {product.toppings.map((topping) => (
              <button
                key={topping}
                className={`${styles.topping} ${
                  selectedToppings.includes(topping) ? styles.selected : ""
                }`}
                onClick={() => toggleTopping(topping)}
              >
                {topping}
              </button>
            ))}
          </div>
        </div>
      )}

      <button className={styles.addButton} onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
}
