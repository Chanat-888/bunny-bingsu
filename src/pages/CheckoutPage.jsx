import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import styles from "./CheckoutPage.module.css";
import { useState } from "react";

export default function CheckoutPage() {
  const { cart, clearCart, setCart } = useCart();
  const navigate = useNavigate();
  const storedTable = localStorage.getItem("tableNumber") || "";
  const [tableNumber, setTableNumber] = useState(storedTable);



  const handleRemove = (indexToRemove) => {
    const updated = [...cart];
    updated.splice(indexToRemove, 1);
    setCart(updated);
  };

  const total = cart
    .reduce((sum, item) => sum + item.quantity * item.price, 0)
    .toFixed(2);

  const handleCheckout = () => {
    if (!tableNumber) {
      alert("Please enter table number");
      return;
    }

    const order = {
      id: Date.now(),
      table: tableNumber,
      items: cart,
      createdAt: new Date().toISOString(),
      status: "completed",
    };

    const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
    existingOrders.push(order);
    localStorage.setItem("orders", JSON.stringify(existingOrders));

    clearCart();
    alert("Order placed!");
    navigate("/");
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
                  {item.toppings.length > 0 && (
                    <div className={styles.toppings}>
                      Toppings: {item.toppings.join(", ")}
                    </div>
                  )}
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemove(index)}
                  >
                    Remove
                  </button>
                </div>
                <div>${(item.quantity * item.price).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className={styles.total}>
            <span>Total:</span>
            <strong>${total}</strong>
          </div>

          <div className={styles.tableRow}>
  <label className={styles.tableLabel}>Table:</label>
  <input
    type="text"
    value={tableNumber}
    onChange={(e) => setTableNumber(e.target.value)}
    className={styles.input}
  />
</div>

          <button className={styles.button} onClick={handleCheckout}>
            Place Order
          </button>
        </>
      )}
    </div>
  );
}
