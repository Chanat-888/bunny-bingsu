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

  const storedTable = localStorage.getItem("tableNumber") || "No table";
  const [tableNumber, setTableNumber] = useState(storedTable);

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
    const customerKey = ensureCustomerKey();

    const order = {
      table: tableNumber,
      items: cart,
      total: Number(total),
      createdAt: Timestamp.now(),
      status: "pending",
      served: false,
      customerKey,
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
          {/* ✅ ปุ่มดูคำสั่งซื้อของฉัน เมื่อไม่มีของในตะกร้า */}
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

          {/* แสดงเลขโต๊ะแบบอ่านอย่างเดียว */}
          <div className={styles.tableRow}>
            <label className={styles.tableLabel}>Table:</label>
            <span className={styles.input}>{tableNumber}</span>
          </div>

          <button
            className={styles.button}
            onClick={handleCheckout}
            title={tableNumber === "No table" ? "สั่งแบบไม่มีเลขโต๊ะ" : undefined}
          >
            กดสั่ง
          </button>

          {/* ✅ ปุ่มดูคำสั่งซื้อของฉัน ตอนที่ตะกร้าไม่ว่าง */}
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <Link to="/my-orders">ดูคำสั่งซื้อของฉัน</Link>
          </div>
        </>
      )}
    </div>
  );
}
