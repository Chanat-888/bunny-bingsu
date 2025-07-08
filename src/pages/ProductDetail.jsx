import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import styles from "./ProductDetail.module.css";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const ref = doc(db, "menu", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });
        } else {
          console.error("Product not found");
        }
      } catch (err) {
        console.error("Failed to load product:", err);
      }
    };

    fetchProduct();
  }, [id]);

  const toggleTopping = (topping) => {
    if (selectedToppings.includes(topping)) {
      setSelectedToppings(selectedToppings.filter(t => t !== topping));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const handleAdd = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        toppings: selectedToppings
      });
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.backButton}>← Back to Menu</Link>

      <div className={styles.container}>
        <img src={product.image} alt={product.name} className={styles.image} />
        <div className={styles.info}>
          <h1>{product.name}</h1>
          <p>${product.price}</p>

          {product.toppings?.length > 0 && (
            <div className={styles.toppings}>
              <h4>Choose Toppings:</h4>
              <div className={styles.toppingButtons}>
                {product.toppings.map((top, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.toppingButton} ${
                      selectedToppings.includes(top) ? styles.selected : ""
                    }`}
                    onClick={() => toggleTopping(top)}
                  >
                    {top}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.controls}>
            <label>
              Quantity:
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </label>
            <button onClick={handleAdd}>Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}
