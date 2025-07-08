// Updated AdminOrders.jsx with UI styling for order cards
import { useEffect, useState } from "react";
import styles from "./AdminOrders.module.css";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  getDocs
} from "firebase/firestore";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const orderData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(orderData);
    });

    return () => unsubscribe();
  }, []);

  const toggleServed = async (id, current) => {
    await updateDoc(doc(db, "orders", id), { served: !current });
  };

  const clearOrders = async () => {
    const snapshot = await getDocs(collection(db, "orders"));
    const batch = snapshot.docs.map((docSnap) => deleteDoc(doc(db, "orders", docSnap.id)));
    await Promise.all(batch);
  };

  const total = orders.reduce((sum, order) => {
    return (
      sum +
      order.items.reduce((s, item) => s + item.price * item.quantity, 0)
    );
  }, 0);

  return (
    <div className={styles.page}>
      <h1>Admin Orders</h1>
      <div className={styles.summary}>
        <p>Total Sales: ${total.toFixed(2)}</p>
        <button className={styles.clearButton} onClick={clearOrders}>Clear History</button>
      </div>

      {orders.map((order) => (
        <div key={order.id} className={styles.card}>
          <h3>Table: {order.table}</h3>
          <p>Status: {order.status}</p>
          <p>Time: {new Date(order.createdAt?.seconds * 1000).toLocaleString()}</p>
          <ul>
            {order.items.map((item, idx) => (
              <li key={idx}>
                {item.name} x{item.quantity}
                {item.toppings?.length > 0 && (
                  <span> (Toppings: {item.toppings.join(", ")})</span>
                )}
              </li>
            ))}
          </ul>
          <button onClick={() => toggleServed(order.id, order.served)}>
            Mark as {order.served ? "Not Served" : "Served"}
          </button>
        </div>
      ))}
    </div>
  );
}
