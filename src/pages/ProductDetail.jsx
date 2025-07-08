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
  const [selectedSauce, setSelectedSauce] = useState([]);

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

  const toggleSauce = (sauce) => {
    if (selectedSauce.includes(sauce)) {
      setSelectedSauce(selectedSauce.filter(s => s !== sauce));
    } else {
      setSelectedSauce([...selectedSauce, sauce]);
    }
  };

  const handleAdd = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        sauce: selectedSauce
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

          {product.sauces?.length > 0 && (
            <div className={styles.sauces}>
              <h4>Choose Sauce:</h4>
              <div className={styles.sauceButtons}>
                {product.sauces.map((sauce, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.sauceButton} ${
                      selectedSauce.includes(sauce) ? styles.selected : ""
                    }`}
                    onClick={() => toggleSauce(sauce)}
                  >
                    {sauce}
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
