import { useEffect, useRef, useState } from "react";
import styles from "./AdminOrders.module.css";
import { db } from "../firebase";
import {
  collection,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  addDoc,
} from "firebase/firestore";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  // --- Sound controls (no changes to your old functions) ---
  const [soundEnabled, setSoundEnabled] = useState(false);
  const soundEnabledRef = useRef(false);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const audioCtxRef = useRef(null);
  const initializedSnapshotRef = useRef(false);

  const enableSound = async () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      await ctx.resume();
      audioCtxRef.current = ctx;
      setSoundEnabled(true);
      playBeep();
    } catch (e) {
      console.error("Unable to enable sound:", e);
    }
  };

  const disableSound = async () => {
    setSoundEnabled(false);
    try {
      await audioCtxRef.current?.close();
    } catch (_) {}
    audioCtxRef.current = null;
  };

  const playBeep = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const ringOnce = (startAt) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200, startAt);
      osc.frequency.exponentialRampToValueAtTime(650, startAt + 0.25);

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.25, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startAt);
      osc.stop(startAt + 0.4);
    };

    const now = ctx.currentTime;
    ringOnce(now);
    ringOnce(now + 0.5);
  };

  useEffect(() => {
    return () => {
      disableSound();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const fetched = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const sorted = [...fetched].sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      const hadAddition = snapshot.docChanges().some((c) => c.type === "added");

      if (!initializedSnapshotRef.current) {
        initializedSnapshotRef.current = true;
      } else if (hadAddition && soundEnabledRef.current) {
        playBeep();
      }

      setOrders(sorted);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    // ✅ Merge unpaid orders for a specific table
  const handleMergeSameTable = async () => {
    const tableNumber = prompt("Enter the table number to merge unpaid orders for:");
    if (!tableNumber) return;

    const tableOrders = orders.filter(
      (o) => o.table === tableNumber && !o.paid
    );

    if (tableOrders.length < 2) {
      alert(`No multiple unpaid orders found for table ${tableNumber}.`);
      return;
    }

    const [main, ...others] = tableOrders;
    const mergedItems = [...main.items];

    others.forEach((o) => {
      mergedItems.push(...o.items);
    });

    // Update main order
    await updateDoc(doc(db, "orders", main.id), { items: mergedItems });

    // Delete merged orders
    for (const o of others) {
      await deleteDoc(doc(db, "orders", o.id));
    }

    alert(`Merged unpaid orders for table ${tableNumber} successfully!`);
  };


  const groupedOrders = orders.reduce((groups, order) => {
    const dateKey = order.createdAt?.toDate().toLocaleDateString() || "Unknown Date";
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(order);
    return groups;
  }, {});

  const dates = Object.keys(groupedOrders).sort((a, b) => new Date(b) - new Date(a));
  const activeDate = selectedDate || dates[0];

  // ✅ Daily total now counts only paid orders
  const dailyTotal = (groupedOrders[activeDate] || []).reduce((sum, o) => {
    if (!o.paid) return sum;
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

      {/* Sound toggle UI */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.75rem" }}>
        <button
          onClick={soundEnabled ? disableSound : enableSound}
          style={{
            backgroundColor: soundEnabled ? "#28a745" : "#6c757d",
            color: "#fff",
            padding: "0.4rem 0.9rem",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {soundEnabled ? "🔔 Sound On" : "🔕 Enable Sound"}
        </button>
        <span style={{ fontSize: "0.9rem", color: "#555" }}>
          Plays a ding when a new order arrives.
        </span>
      </div>

      {/* Removed Total Sales (All Time) */}
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
        <button
          className={styles.clearButton}
          style={{ backgroundColor: "#17a2b8" }}
          onClick={handleMergeSameTable}
        >
          Merge Same Table (Unpaid)
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
              {order.items
                .reduce((sum, item) => {
                  const extras = item.extras || [];
                  const cheeses = item.cheeses || [];
                  const extrasTotal = extras.reduce((eSum, ex) => eSum + (ex.price || 0), 0);
                  const cheesesTotal = cheeses.reduce((cSum, ch) => cSum + (ch.price || 0), 0);
                  return sum + (item.price + extrasTotal + cheesesTotal) * item.quantity;
                }, 0)
                .toFixed(2)}
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
