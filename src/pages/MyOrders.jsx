import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { Link, useLocation } from "react-router-dom";
import styles from "./MyOrders.module.css"; // แนะนำเพิ่มไฟล์เล็ก ๆ สำหรับสไตล์

function getCustomerKey() {
  return localStorage.getItem("customerKey") || "";
}

function useQueryParam(name) {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search).get(name), [search]);
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const highlight = useQueryParam("highlight");
  const customerKey = getCustomerKey();


  useEffect(() => {
    if (!customerKey) {
      setLoading(false);
      setOrders([]);
      return;
    }

    const q = query(
      collection(db, "orders"),
      where("customerKey", "==", customerKey),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(rows);
      setLoading(false);
    });

    return () => unsub();
  }, [customerKey]);

  if (!customerKey) {
    return (
      <div className={styles.page}>
        <Link to="/" className={styles.backButton}>← Back to Menu</Link>
        <h1 className={styles.title}>My Orders</h1>
        <p>ยังไม่มีคำสั่งซื้อในอุปกรณ์นี้</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.backButton}>← Back to Menu</Link>
      <h1 className={styles.title}>My Orders</h1>

      {loading ? (
        <p>Loading…</p>
      ) : orders.length === 0 ? (
        <p>ยังไม่มีคำสั่งซื้อ</p>
      ) : (
        <div className={styles.list}>
          {orders.map((o) => {
            const isHighlight = highlight === o.id;
            const created =
              o.createdAt?.toDate ? o.createdAt.toDate() : new Date();
            const total =
              typeof o.total === "number"
                ? o.total
                : (o.items || []).reduce(
                    (sum: number, item: any) =>
                      sum +
                      item.quantity *
                        (item.price + (item.extraPrice || 0) + (item.cheesePrice || 0)),
                    0
                  );

            return (
              <div
                key={o.id}
                className={`${styles.card} ${isHighlight ? styles.highlight : ""}`}
              >
                <div className={styles.headerRow}>
                  <div>
                    <div className={styles.orderId}>Order #{o.id.slice(-6)}</div>
                    <div className={styles.subtle}>
                      {created.toLocaleString()}
                    </div>
                  </div>
                  <div className={styles.status}>
                    <span className={`${styles.badge} ${styles[`st_${o.status}`] || ""}`}>
                      {o.status || "pending"}
                    </span>
                    {o.served ? <span className={styles.badge}>served</span> : null}
                  </div>
                </div>

                <div className={styles.meta}>
                  <div>Table: <strong>{o.table || "No table"}</strong></div>
                  <div>Total: <strong>฿{total.toFixed(2)}</strong></div>
                </div>

                <div className={styles.items}>
                  {(o.items || []).map((it: any, idx: number) => (
                    <div key={idx} className={styles.itemRow}>
                      <div>
                        <strong>{it.name}</strong> x{it.quantity}
                        {(it.sauces || []).length > 0 && (
                          <div className={styles.addonRow}>Sauces: {it.sauces.join(", ")}</div>
                        )}
                        {(it.flavors || []).length > 0 && (
                          <div className={styles.addonRow}>Flavors: {it.flavors.join(", ")}</div>
                        )}
                        {(it.cheeses || []).length > 0 && (
                          <div className={styles.addonRow}>
                            Cheeses:{" "}
                            {it.cheeses.map((c: any) => `${c.name} (+$${c.price})`).join(", ")}
                          </div>
                        )}
                        {(it.toppings || []).length > 0 && (
                          <div className={styles.addonRow}>
                            Toppings: {it.toppings.join(", ")}
                          </div>
                        )}
                        {(it.extras || []).length > 0 && (
                          <div className={styles.addonRow}>
                            Extras: {it.extras.map((ex: any) => `${ex.name} (+$${ex.price})`).join(", ")}
                          </div>
                        )}
                      </div>
                      <div className={styles.price}>
                        ฿{(
                          it.quantity *
                          (it.price + (it.extraPrice || 0) + (it.cheesePrice || 0))
                        ).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
