import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/sidebar.module.css";
import { 
  FaHome, 
  FaChartLine,
  FaPiggyBank,
  FaWallet,
  FaChartPie,
  FaShieldAlt,
  FaRobot,
  FaEnvelope,
  FaInfoCircle,
  FaSignOutAlt
} from "react-icons/fa";

const Sidebar = () => {
  const router = useRouter();

  const navItems = [
    { path: "/", label: "Home", icon: <FaHome /> },
    { path: "/#dashboard", label: "Dashboard", icon: <FaChartLine /> },
    { path: "/#transactions", label: "Transactions", icon: <FaWallet /> },
    { path: "/#budget", label: "Budget", icon: <FaChartPie /> },
    { path: "/#savings", label: "Savings", icon: <FaPiggyBank /> },
    { path: "/ai-suggestions", label: "AI Suggestions", icon: <FaRobot /> },
    { path: "/#security", label: "Security", icon: <FaShieldAlt /> },
    { path: "/#contact", label: "Contact Us", icon: <FaEnvelope /> },
    { path: "/#about", label: "About Us", icon: <FaInfoCircle /> },
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <h1>MoneyWise</h1>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`${styles.navItem} ${router.pathname === item.path ? styles.active : ''}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className={styles.footer}>
        <button className={styles.logoutButton}>
          <FaSignOutAlt className={styles.icon} />
          <span className={styles.label}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 