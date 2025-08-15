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
  const [selectedDescription, setSelectedDescription] = useState([]);

  // NEW: separate sauces for "คู่หู"
  const [selectedBingsuSauce, setSelectedBingsuSauce] = useState(null);
  const [selectedBreadSauce, setSelectedBreadSauce] = useState(null);

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
    if (!product) return;

    const mode = product.mode;

    if (mode === "บิงซูสายไหม" || mode === "ขนมปังปิ้ง") {
      if (selectedSauce.includes(sauce)) {
        setSelectedSauce([]);
      } else {
        setSelectedSauce([sauce]);
      }

    } else if (mode === "คู่หู" || mode === "ทวิสเตอร์") {
      if (selectedSauce.includes(sauce)) {
        setSelectedSauce(selectedSauce.filter(s => s !== sauce));
      } else if (selectedSauce.length < 2) {
        setSelectedSauce([...selectedSauce, sauce]);
      }

    } else {
      if (selectedSauce.includes(sauce)) {
        setSelectedSauce(selectedSauce.filter(s => s !== sauce));
      } else {
        setSelectedSauce([...selectedSauce, sauce]);
      }
    }
  };

  const toggleDescription = (description) => {
    if (selectedDescription.includes(description)) {
      setSelectedDescription(selectedDescription.filter(d => d !== description));
    } else {
      setSelectedDescription([...selectedDescription, description]);
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
    if (!product) return;

    const mode = product.mode;

    if (mode === "คู่หู" || mode === "ทวิสเตอร์") {
      // Only one flavor allowed
      if (selectedFlavor.includes(flavor)) {
        setSelectedFlavor([]);
      } else {
        setSelectedFlavor([flavor]);
      }
    } else {
      // Default: allow multiple
      if (selectedFlavor.includes(flavor)) {
        setSelectedFlavor(selectedFlavor.filter(f => f !== flavor));
      } else {
        setSelectedFlavor([...selectedFlavor, flavor]);
      }
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
  if (!product) return;

  const mode = product.mode;

  if (selectedTopping.includes(topping)) {
    setSelectedTopping(selectedTopping.filter(t => t !== topping));
  } else {
    if (mode === "ทวิสเตอร์" && selectedTopping.length >= 3) {
      return; // do nothing if already picked 3
    }
    setSelectedTopping([...selectedTopping, topping]);
  }
};


  // NEW: helpers for คู่หู sauce pickers (single choice each)
  const toggleBingsuSauce = (sauce) => {
    setSelectedBingsuSauce(prev => (prev === sauce ? null : sauce));
  };
  const toggleBreadSauce = (sauce) => {
    setSelectedBreadSauce(prev => (prev === sauce ? null : sauce));
  };

  const handleAdd = () => {
  if (!product) return;

  // Validation checks
  if (product.sauces?.length > 0) {
    if (product.mode === "คู่หู") {
      if (!selectedBingsuSauce) {
        alert("เลือกซอสบิงซูก่อนกดสั่ง");
        return;
      }
      if (!selectedBreadSauce) {
        alert("เลือกซอสขนมปังก่อนกดสั่ง");
        return;
      }
    } else if (selectedSauce.length === 0) {
      alert("เลือกซอสก่อนกดสั่ง");
      return;
    }
  }

  if (product.flavors?.length > 0 && selectedFlavor.length === 0) {
    alert("เลือกรสชาติ ก่อนกดสั่ง");
    return;
  }

  if (product.toppings?.length > 0 && selectedTopping.length === 0) {
    alert("เลือกท็อปปิ้ง ก่อนกดสั่ง");
    return;
  }

  if (product.cheeses?.length > 0 && selectedCheese.length === 0) {
    alert("เลือกชีส ก่อนกดสั่ง");
    return;
  }

  const extraTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const cheeseTotal = selectedCheese.reduce((sum, c) => sum + c.price, 0);

  const saucesForCart =
    product.mode === "คู่หู"
      ? [
          selectedBingsuSauce ? `Bingsu: ${selectedBingsuSauce}` : null,
          selectedBreadSauce ? `Bread: ${selectedBreadSauce}` : null,
        ].filter(Boolean)
      : selectedSauce;

  addToCart({
    id: product.id,
    name: product.name,
    price: product.price,
    quantity,
    sauces: saucesForCart,
    extras: selectedExtras,
    extraPrice: extraTotal,
    flavors: selectedFlavor,
    toppings: selectedTopping,
    cheeses: selectedCheese,
    cheesePrice: cheeseTotal,
    description: selectedDescription,
    mode: product.mode
  });

  // ✅ Redirect only if everything is valid
  window.location.href = "/";
};



  if (!product) return <p>Loading...</p>;

  const isKuhu = product.mode === "คู่หู";

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.backButton}>← Back to Menu</Link>

      <div className={styles.container}>
        <img src={product.image} alt={product.name} className={styles.image} />
        <div className={styles.info}>
          <h1>{product.name}</h1>
          <p>฿{product.price}</p>
          <p style={{ fontStyle: "italic", color: "gray" }}>หมวด: {product.mode}</p>

          {/* existing components remain unchanged */}

          {product.descriptions?.length > 0 && (
            <div className={styles.sauces}>
              <h4>Description</h4>
              <div className={styles.dauceButtons}>
                {product.descriptions.map((description, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.description} ${
                      selectedDescription.includes(description) ? styles.description : ""
                    }`}
                    onClick={() => toggleDescription(description)}
                  >
                    {description}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* NEW: For "คู่หู", show two separate sauce pickers */}
          {isKuhu && product.sauces?.length > 0 && (
            <>
              <div className={styles.sauces}>
                <h4>Choose Bingsu Sauce:</h4>
                <div className={styles.sauceButtons}>
                  {product.sauces.map((sauce, i) => (
                    <button
                      key={`b-${i}`}
                      type="button"
                      className={`${styles.sauceButton} ${
                        selectedBingsuSauce === sauce ? styles.selected : ""
                      }`}
                      onClick={() => toggleBingsuSauce(sauce)}
                    >
                      {sauce}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.sauces}>
                <h4>Choose Bread Sauce:</h4>
                <div className={styles.sauceButtons}>
                  {product.sauces.map((sauce, i) => (
                    <button
                      key={`br-${i}`}
                      type="button"
                      className={`${styles.sauceButton} ${
                        selectedBreadSauce === sauce ? styles.selected : ""
                      }`}
                      onClick={() => toggleBreadSauce(sauce)}
                    >
                      {sauce}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Original sauce block — shown for all other modes */}
          {!isKuhu && product.sauces?.length > 0 && (
            <div className={styles.sauces}>
              <h4>Choose Sauce :</h4>
              <div className={styles.sauceButtons}>
                {product.sauces.map((sauce, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.sauceButton} ${
                      selectedSauce.includes(sauce) ? styles.selected : ""
                    }`}
                    onClick={() => toggleSauce(sauce)}
onTouchEnd={(e) => {
  e.preventDefault(); // prevent ghost click delay
  toggleSauce(sauce);
}}

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
                      {extra.name} (+฿{extra.price})
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
                      {cheese.name} (+฿{cheese.price})
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
  className={styles.addToCartButton}
  onClick={handleAdd}
>
  Add to Cart
</button>

          </div>
        </div>
      </div>
    </div>
  );
}
