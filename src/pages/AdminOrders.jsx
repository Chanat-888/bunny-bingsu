import { useEffect, useState } from "react";
import styles from "./AdminOrders.module.css";
import { db } from "../firebase";
import {
  collection,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

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
      sum +
      o.items.reduce((s, i) => {
        const extras = i.extras || [];
        const cheeses = i.cheeses || [];
        const extrasTotal = extras.reduce((eSum, ex) => eSum + (ex.price || 0), 0);
        const cheesesTotal = cheeses.reduce((cSum, ch) => cSum + (ch.price || 0), 0);
        return s + (i.price + extrasTotal + cheesesTotal) * i.quantity;
      }, 0)
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

  const handleClearSelectedDate = async () => {
    const targetOrders = groupedOrders[activeDate]?.filter((o) => o.served) || [];
    for (const order of targetOrders) {
      await deleteDoc(doc(db, "orders", order.id));
    }
  };

  const groupedOrders = orders.reduce((groups, order) => {
    const dateKey = order.createdAt?.toDate().toLocaleDateString() || "Unknown Date";
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(order);
    return groups;
  }, {});

  const dates = Object.keys(groupedOrders).sort((a, b) => new Date(b) - new Date(a));
  const activeDate = selectedDate || dates[0];

  const dailyTotal = (groupedOrders[activeDate] || []).reduce((sum, o) => {
    if (!o.served) return sum;
    return (
      sum +
      o.items.reduce((s, i) => {
        const extras = i.extras || [];
        const cheeses = i.cheeses || [];
        const extrasTotal = extras.reduce((eSum, ex) => eSum + (ex.price || 0), 0);
        const cheesesTotal = cheeses.reduce((cSum, ch) => cSum + (ch.price || 0), 0);
        return s + (i.price + extrasTotal + cheesesTotal) * i.quantity;
      }, 0)
    );
  }, 0);

  return (
    <div className={styles.page}>
      <h1>Admin Orders</h1>
      <p>Total Sales (All Time): ฿{total.toFixed(2)}</p>
      <p>Total Sales ({activeDate}): ฿{dailyTotal.toFixed(2)}</p>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <button className={styles.clearButton} onClick={handleClear}>
          Clear All History
        </button>
        <button
          className={styles.clearButton}
          style={{ backgroundColor: "#dc3545" }}
          onClick={handleClearSelectedDate}
        >
          Clear {activeDate} History
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        {dates.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDate(d)}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: d === activeDate ? "#007bff" : "#ccc",
              color: "white",
              cursor: "pointer",
            }}
          >
            {d}
          </button>
        ))}
      </div>

      <div className={styles.ordersList}>
        {(groupedOrders[activeDate] || []).map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <h3>Table: {order.table}</h3>
            <p>Status: {order.status}</p>
            <p>Time: {order.createdAt?.toDate().toLocaleString()}</p>

            <ul>
              {order.items.map((item, idx) => (
                <li key={idx}>
                  {item.name} x{item.quantity}
                  {item.sauces?.length > 0 && (
                    <span style={{ fontSize: "0.9rem", color: "#555", marginLeft: "1rem" }}>
                      Sauces: {item.sauces.join(", ")}
                    </span>
                  )}
                  {item.flavors?.length > 0 && (
                    <span style={{ fontSize: "0.9rem", color: "#555", marginLeft: "1rem" }}>
                      Flavors: {item.flavors.join(", ")}
                    </span>
                  )}
                  {item.toppings?.length > 0 && (
                    <span style={{ fontSize: "0.9rem", color: "#555", marginLeft: "1rem" }}>
                      Toppings: {item.toppings.join(", ")}
                    </span>
                  )}
                  {item.extras?.length > 0 && (
                    <span style={{ fontSize: "0.9rem", color: "#555", marginLeft: "1rem" }}>
                      Extras: {item.extras.map((ex) => `${ex.name} (+$${ex.price})`).join(", ")}
                    </span>
                  )}
                  {item.cheeses?.length > 0 && (
                    <span style={{ fontSize: "0.9rem", color: "#555", marginLeft: "1rem" }}>
                      Cheeses: {item.cheeses.map((ch) => `${ch.name} (+$${ch.price})`).join(", ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <p className={styles.orderTotal}>
              Order Total: ฿
              {order.items.reduce((sum, item) => {
                const extras = item.extras || [];
                const cheeses = item.cheeses || [];
                const extrasTotal = extras.reduce((eSum, ex) => eSum + (ex.price || 0), 0);
                const cheesesTotal = cheeses.reduce((cSum, ch) => cSum + (ch.price || 0), 0);
                return sum + (item.price + extrasTotal + cheesesTotal) * item.quantity;
              }, 0).toFixed(2)}
            </p>

            {!order.served && (
              <button className={styles.serveButton} onClick={() => handleServe(order.id)}>
                Mark as Served
              </button>
            )}

            {order.paid ? (
              <p style={{ color: "green", fontWeight: "bold" }}>✅ Paid</p>
            ) : (
              <button
                onClick={() => handlePaid(order.id)}
                style={{
                  backgroundColor: "#28a745",
                  color: "#fff",
                  padding: "0.4rem 1rem",
                  border: "none",
                  borderRadius: "6px",
                  marginTop: "0.5rem",
                }}
              >
                Mark as Paid
              </button>
            )}

            {/* New Buttons */}
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
              <button
                onClick={async () => {
                  const confirmDelete = window.confirm("Are you sure you want to delete this order?");
                  if (confirmDelete) {
                    await deleteDoc(doc(db, "orders", order.id));
                  }
                }}
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  padding: "0.3rem 0.7rem",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                Delete Order
              </button>

              <button
                onClick={async () => {
                  const newTable = prompt("Enter new table number:", order.table);
                  if (newTable && newTable.trim() !== "") {
                    await updateDoc(doc(db, "orders", order.id), { table: newTable.trim() });
                  }
                }}
                style={{
                  backgroundColor: "#ffc107",
                  color: "#000",
                  padding: "0.3rem 0.7rem",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                Change Table
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
