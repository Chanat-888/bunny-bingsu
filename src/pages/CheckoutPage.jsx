import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import styles from "./CheckoutPage.module.css";
import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function CheckoutPage() {
  const { cart, clearCart, setCart } = useCart();
  const navigate = useNavigate();

  // ✅ ถ้าไม่มีค่าใน localStorage ให้ใช้ "No table" แทน
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
          (item.price + (item.extraPrice || 0)),
      0
    )
    .toFixed(2);

  // ❗ฟังก์ชันเดิม: ไม่แก้ไข
  const handleCheckout = async () => {
    const order = {
      table: tableNumber, // จะเป็น "No table" ถ้าไม่มีเลขโต๊ะ
      items: cart,
      createdAt: Timestamp.now(),
      status: "pending",
      served: false
    };

    try {
      await addDoc(collection(db, "orders"), order);
      clearCart();
      alert("Order placed!");
      navigate("/");
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
        <p>Your cart is empty.</p>
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

          {/* 🔒 แสดงเลขโต๊ะแบบอ่านอย่างเดียว */}
          <div className={styles.tableRow}>
            <label className={styles.tableLabel}>Table:</label>
            <span className={styles.input}>
              {tableNumber}
            </span>
          </div>

          {/* ✅ ปุ่มสั่งซื้อกดได้เสมอ (เอา disabled ออก) */}
          <button
            className={styles.button}
            onClick={handleCheckout}
            title={tableNumber === "No table" ? "สั่งแบบไม่มีเลขโต๊ะ" : undefined}
          >
            กดสั่ง
          </button>
        </>
      )}
    </div>
  );
}
