import { useEffect, useState } from "react";
import styles from "./AdminOrders.module.css";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "firebase/firestore";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sorted = [...fetched].sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      setOrders(sorted);
    });
    return () => unsubscribe();
  }, []);

  const total = orders.reduce((sum, o) => {
    if (!o.served) return sum;
    return (
      sum + o.items.reduce((s, i) => s + i.price * i.quantity, 0)
    );
  }, 0);

  const handleServe = async (id) => {
    await updateDoc(doc(db, "orders", id), { served: true });
  };

  const handlePaid = async (id) => {
    await updateDoc(doc(db, "orders", id), { paid: true });
  };

  const handleClear = async () => {
    const servedOrders = orders.filter((o) => o.served);
    for (const order of servedOrders) {
      await deleteDoc(doc(db, "orders", order.id));
    }
  };

  return (
    <div className={styles.page}>
      <h1>Admin Orders</h1>
      <p>Total Sales: ${total.toFixed(2)}</p>
      <button className={styles.clearButton} onClick={handleClear}>Clear History</button>

      <div className={styles.ordersList}>
        {orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <h3>Table: {order.table}</h3>
            <p>Status: {order.status}</p>
            <p>Time: {order.createdAt?.toDate().toLocaleString()}</p>
            <ul>
              {order.items.map((item, idx) => (
                <li key={idx}>
                  {item.name} x{item.quantity}
                  {item.sauces?.length > 0 && (
                    <div style={{ fontSize: "0.9rem", color: "#555", marginLeft: "1rem" }}>
                      Sauces: {item.sauces.join(", ")}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {!order.served && (
              <button className={styles.serveButton} onClick={() => handleServe(order.id)}>
                Mark as Served
              </button>
            )}

            {order.paid ? (
              <p style={{ color: "green", fontWeight: "bold" }}>✅ Paid</p>
            ) : (
              <button onClick={() => handlePaid(order.id)} style={{ backgroundColor: "#28a745", color: "#fff", padding: "0.4rem 1rem", border: "none", borderRadius: "6px", marginTop: "0.5rem" }}>
                Mark as Paid
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
