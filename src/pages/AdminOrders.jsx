// AdminOrders.jsx with live updates, served toggle, total sales, and clear history
import { useEffect, useState } from "react";
import styles from "./AdminOrders.module.css";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs
} from "firebase/firestore";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(fetched);
    });
    return () => unsub();
  }, []);

  const handleToggleServed = async (id, served) => {
    await updateDoc(doc(db, "orders", id), { served: !served });
  };

  const handleClearHistory = async () => {
    const snapshot = await getDocs(collection(db, "orders"));
    snapshot.forEach((docSnap) => {
      deleteDoc(doc(db, "orders", docSnap.id));
    });
  };

  const totalSales = orders.reduce((sum, order) => {
    const orderTotal = order.items.reduce(
      (sub, item) => sub + item.price * item.quantity,
      0
    );
    return sum + orderTotal;
  }, 0);

  return (
    <div className={styles.page}>
      <h1>Admin Orders</h1>

      <div className={styles.actions}>
        <button className={styles.clear} onClick={handleClearHistory}>
          Clear Order History
        </button>
        <div className={styles.total}>Total Sales: ${totalSales.toFixed(2)}</div>
      </div>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className={styles.list}>
          {orders.map((order) => (
            <div key={order.id} className={styles.card}>
              <h3>Table: {order.table}</h3>
              <p>Status: {order.served ? "✅ Served" : "⌛ Pending"}</p>
              <ul>
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.name} x{item.quantity}
                    {item.toppings?.length > 0 && (
                      <div className={styles.toppings}>
                        Toppings: {item.toppings.join(", ")}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <button
                className={styles.toggle}
                onClick={() => handleToggleServed(order.id, order.served)}
              >
                Mark as {order.served ? "Not Served" : "Served"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
