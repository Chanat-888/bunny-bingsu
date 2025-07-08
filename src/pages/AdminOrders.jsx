import { useEffect, useState } from "react";
import styles from "./AdminOrders.module.css";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("orders");
    if (stored) {
      setOrders(JSON.parse(stored));
    }
  }, []);

  const markAsCompleted = (id) => {
    const updated = orders.map((order) =>
      order.id === id ? { ...order, status: "completed" } : order
    );
    setOrders(updated);
    localStorage.setItem("orders", JSON.stringify(updated));
  };

  const toggleServed = (id) => {
    const updated = orders.map((order) =>
      order.id === id ? { ...order, served: !order.served } : order
    );
    setOrders(updated);
    localStorage.setItem("orders", JSON.stringify(updated));
  };

  const clearAllOrders = () => {
    if (window.confirm("Are you sure you want to clear all order history?")) {
      localStorage.removeItem("orders");
      setOrders([]);
    }
  };

  const getTotalRevenue = () => {
    return orders.reduce((sum, order) => {
      const orderTotal = order.items.reduce(
        (orderSum, item) => orderSum + item.price * item.quantity,
        0
      );
      return sum + orderTotal;
    }, 0);
  };

  return (
    <div className={styles.page}>
      <h1>Order History</h1>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <>
          <button onClick={clearAllOrders} className={styles.clearButton}>
            🗑 Clear Order History
          </button>

          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <h3>🪑 Table {order.table}</h3>
              <p>🕒 {new Date(order.createdAt).toLocaleString()}</p>
              <ul>
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.quantity} × {item.name}
                    {item.toppings?.length > 0 && (
                      <span> with {item.toppings.join(", ")}</span>
                    )}
                  </li>
                ))}
              </ul>
              <p>Status: {order.status}</p>
              {order.status !== "completed" && (
                <button onClick={() => markAsCompleted(order.id)}>
                  Mark as Completed
                </button>
              )}
              <p>Served: {order.served ? "✅ Yes" : "❌ No"}</p>
              <button onClick={() => toggleServed(order.id)}>
                Mark as {order.served ? "Not Served" : "Served"}
              </button>
            </div>
          ))}

          <div className={styles.revenueBox}>
            <h2>Total Revenue: ฿{getTotalRevenue().toFixed(2)}</h2>
          </div>
        </>
      )}
    </div>
  );
}
