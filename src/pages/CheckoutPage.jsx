import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import styles from "./CheckoutPage.module.css";
import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

// สร้าง/อ่าน customerKey ไว้ผูกกับอุปกรณ์นี้
function ensureCustomerKey() {
  let key = localStorage.getItem("customerKey");
  if (!key) {
    key = `ck_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem("customerKey", key);
  }
  return key;
}

export default function CheckoutPage() {
  const { cart, clearCart, setCart } = useCart();
  const navigate = useNavigate();

  const storedTable = localStorage.getItem("tableNumber") || "";
  const [tableNumber, setTableNumber] = useState(storedTable);

  // ✅ New State for Order Type (Default to dine-in)
  const [orderType, setOrderType] = useState("dine-in");

  // ✅ state for popup
  const [showPopup, setShowPopup] = useState(false);

  const handleRemove = (indexToRemove) => {
    const updated = [...cart];
    updated.splice(indexToRemove, 1);
    setCart(updated);
  };

  const total = cart
    .reduce(
      (sum, item) =>
        sum +
        item.quantity *
          (item.price + (item.extraPrice || 0) + (item.cheesePrice || 0)),
      0
    )
    .toFixed(2);

  const handleCheckout = async () => {
    if (!tableNumber || tableNumber.trim() === "") {
      setShowPopup(true); // ✅ show popup instead of alert
      return;
    }

    const customerKey = ensureCustomerKey();

    // ✅ Order object now includes orderType
    const order = {
      table: tableNumber,
      items: cart,
      total: Number(total),
      createdAt: Timestamp.now(),
      status: "pending",
      served: false,
      customerKey,
      orderType, // 🛍️ "dine-in" or "takeaway"
    };

    try {
      const docRef = await addDoc(collection(db, "orders"), order);
      clearCart();
      navigate(`/my-orders?highlight=${docRef.id}`);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Try again.");
    }
  };

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.backButton}>← Back to Menu</Link>
      <h1 className={styles.title}>Checkout</h1>

      {cart.length === 0 ? (
        <>
          <p>ตะกร้าของคุณว่าง</p>
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <Link to="/my-orders" className={styles.button}>
              ดูคำสั่งซื้อของฉัน
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className={styles.list}>
            {cart.map((item, index) => (
              <div key={index} className={styles.item}>
                <div>
                  <strong>{item.name}</strong> x{item.quantity}
                  {(item.sauces || []).length > 0 && (
                    <div>Sauces: {item.sauces.join(", ")}</div>
                  )}
                  {(item.flavors || []).length > 0 && (
                    <div>Flavors: {item.flavors.join(", ")}</div>
                  )}
                  {(item.cheeses || []).length > 0 && (
                    <div>
                      Cheeses:{" "}
                      {item.cheeses
                        .map((cheese) => `${cheese.name} (+$${cheese.price})`)
                        .join(", ")}
                    </div>
                  )}
                  {(item.toppings || []).length > 0 && (
                    <div>Toppings: {item.toppings.join(", ")}</div>
                  )}
                  {(item.extras || []).length > 0 && (
                    <div>
                      Extras:{" "}
                      {item.extras
                        .map((ex) => `${ex.name} (+$${ex.price})`)
                        .join(", ")}
                    </div>
                  )}
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemove(index)}
                  >
                    Remove
                  </button>
                </div>
                <div>
                  ฿{(
                    item.quantity *
                    (item.price + (item.extraPrice || 0) + (item.cheesePrice || 0))
                  ).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.total}>
            <span>Total:</span>
            <strong>฿{total}</strong>
          </div>

          {/* ✅ UI Section: Order Type Selection */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "1.5rem" }}>
            <button
              type="button"
              onClick={() => setOrderType("dine-in")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "8px",
                border: "2px solid #28a745",
                backgroundColor: orderType === "dine-in" ? "#28a745" : "#fff",
                color: orderType === "dine-in" ? "#fff" : "#28a745",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "0.2s"
              }}
            >
              🍽️ ทานที่นี่
            </button>
            <button
              type="button"
              onClick={() => setOrderType("takeaway")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "8px",
                border: "2px solid #ffc107",
                backgroundColor: orderType === "takeaway" ? "#ffc107" : "#fff",
                color: orderType === "takeaway" ? "#000" : "#ffc107",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "0.2s"
              }}
            >
              🛍️ กลับบ้าน
            </button>
          </div>

          <div className={styles.tableRow}>
            <label className={styles.tableLabel}>Table:</label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => {
                setTableNumber(e.target.value);
                localStorage.setItem("tableNumber", e.target.value);
              }}
              placeholder="Enter your table number"
              className={styles.input}
            />
          </div>

          <button
            className={styles.button}
            onClick={handleCheckout}
            disabled={!cart.length}
          >
            กดสั่ง
          </button>

          <div style={{ marginTop: 12, textAlign: "center" }}>
            <Link to="/my-orders">ดูคำสั่งซื้อของฉัน</Link>
          </div>
        </>
      )}

      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupBox}>
            <p>กรุณาใส่หมายเลขโต๊ะ</p>
            <button
              className={styles.button}
              onClick={() => setShowPopup(false)}
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}