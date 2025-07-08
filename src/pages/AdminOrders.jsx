import { useEffect, useState } from "react";
import styles from "./AdminOrders.module.css";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const ordersFromDb = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersFromDb);
    });

    return () => unsubscribe();
  }, []);

  const markAsCompleted = async (id) => {
    await updateDoc(doc(db, "orders", id), {
      status: "completed",
    });
  };

  const toggleServed = async (id, current) => {
    await updateDoc(doc(db, "orders", id), {
      served: !current,
    });
  };

  const getTotal = (items) => {
    return items
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);
  };

  return (
    <div className={styles.page}>
      <h1>Customer Orders</h1>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <h3>🪑 Table {order.table}</h3>
            <p>🕒 {order.createdAt?.toDate?.().toLocaleString?.() || "Time not available"}</p>
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
            <p><strong>Total:</strong> ${getTotal(order.items)}</p>
            <p>Status: {order.status}</p>
            <p>Served: {order.served ? "✅ Yes" : "❌ No"}</p>

            <div className={styles.actions}>
              {order.status !== "completed" && (
                <button onClick={() => markAsCompleted(order.id)}>
                  Mark as Completed
                </button>
              )}
              <button onClick={() => toggleServed(order.id, order.served)}>
                Mark as {order.served ? "Not Served" : "Served"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
