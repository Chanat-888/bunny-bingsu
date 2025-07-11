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
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [selectedFlavor, setSelectedFlavor] = useState([]);
  const [selectedTopping, setSelectedTopping] = useState([]);
  const [selectedCheese, setSelectedCheese] = useState([]);

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

  const toggleExtra = (extra) => {
    const found = selectedExtras.find(e => e.name === extra.name);
    if (found) {
      setSelectedExtras(selectedExtras.filter(e => e.name !== extra.name));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const toggleFlavor = (flavor) => {
    if (selectedFlavor.includes(flavor)) {
      setSelectedFlavor(selectedFlavor.filter(f => f !== flavor));
    } else {
      setSelectedFlavor([...selectedFlavor, flavor]);
    }
  };

  const toggleCheese = (cheese) => {
    const found = selectedCheese.find(c => c.name === cheese.name);
    if (found) {
      setSelectedCheese(selectedCheese.filter(c => c.name !== cheese.name));
    } else {
      setSelectedCheese([...selectedCheese, cheese]);
    }
  };

  const toggleTopping = (topping) => {
    if (selectedTopping.includes(topping)) {
      setSelectedTopping(selectedTopping.filter(t => t !== topping));
    } else {
      setSelectedTopping([...selectedTopping, topping]);
    }
  };

  const handleAdd = () => {
    if (product) {
      const extraTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
      const cheeseTotal = selectedCheese.reduce((sum, c) => sum + c.price, 0);
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        sauces: selectedSauce,
        extras: selectedExtras,
        extraPrice: extraTotal,
        flavors: selectedFlavor,
        toppings: selectedTopping,
        cheeses: selectedCheese,
        cheesePrice: cheeseTotal,
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
              <h4>Description</h4>
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

          {product.extras?.length > 0 && (
            <div className={styles.sauces}>
              <h4>Choose Extras:</h4>
              <div className={styles.sauceButtons}>
                {product.extras.map((extra, i) => {
                  const selected = selectedExtras.find(e => e.name === extra.name);
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`${styles.sauceButton} ${
                        selected ? styles.selected : ""
                      }`}
                      onClick={() => toggleExtra(extra)}
                    >
                      {extra.name} (+${extra.price})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {product.flavors?.length > 0 && (
            <div className={styles.sauces}>
              <h4>Choose Flavor:</h4>
              <div className={styles.sauceButtons}>
                {product.flavors.map((flavor, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.sauceButton} ${selectedFlavor.includes(flavor) ? styles.selected : ""}`}
                    onClick={() => toggleFlavor(flavor)}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.cheeses?.length > 0 && (
            <div className={styles.sauces}>
              <h4>Choose Cheese:</h4>
              <div className={styles.sauceButtons}>
                {product.cheeses.map((cheese, i) => {
                  const selected = selectedCheese.find(c => c.name === cheese.name);
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`${styles.sauceButton} ${
                        selected ? styles.selected : ""
                      }`}
                      onClick={() => toggleCheese(cheese)}
                    >
                      {cheese.name} (+${cheese.price})
                    </button>
                  );
                })}
              </div>
            </div>
          )}


          {product.toppings?.length > 0 && (
            <div className={styles.sauces}>
              <h4>Choose Topping:</h4>
              <div className={styles.sauceButtons}>
                {product.toppings.map((topping, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.sauceButton} ${selectedTopping.includes(topping) ? styles.selected : ""}`}
                    onClick={() => toggleTopping(topping)}
                  >
                    {topping}
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
            <button
  onClick={() => {
    handleAdd();
    window.location.href = "/";
  }}
>
  Add to Cart
</button>

          </div>
        </div>
      </div>
    </div>
  );
}
