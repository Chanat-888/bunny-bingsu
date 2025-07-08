import { useEffect, useState } from "react";
import styles from "./AdminOrders.module.css";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from "firebase/firestore";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, []);

  const toggleServed = async (order) => {
    const ref = doc(db, "orders", order.id);
    await updateDoc(ref, { served: !order.served });
  };

  const markAsCompleted = async (order) => {
    const ref = doc(db, "orders", order.id);
    await updateDoc(ref, { status: "completed" });
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
            <p>🕒 {order.createdAt?.toDate().toLocaleString()}</p>
            <ul>
              {order.items.map((item, i) => (
                <li key={i}>
                  {item.quantity} × {item.name}
                  {item.toppings?.length > 0 && (
                    <span> with {item.toppings.join(", ")}</span>
                  )}
                </li>
              ))}
            </ul>
            <p>Status: {order.status}</p>
            <p>Served: {order.served ? "✅ Yes" : "❌ No"}</p>

            <button onClick={() => toggleServed(order)}>
              Mark as {order.served ? "Not Served" : "Served"}
            </button>

            {order.status !== "completed" && (
              <button onClick={() => markAsCompleted(order)}>Mark as Completed</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
