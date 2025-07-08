import { Link } from "react-router-dom";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Welcome, Admin</h1>
      <div className={styles.nav}>
        <Link to="/admin/menu" className={styles.link}>Manage Menu</Link>
        <Link to="/admin/orders" className={styles.link}>View Orders</Link>
        <Link to="/admin/customers" className={styles.link}>Customers</Link>
      </div>
    </div>
  );
}
