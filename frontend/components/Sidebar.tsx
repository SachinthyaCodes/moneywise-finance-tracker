import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/sidebar.module.css";
import { 
  FaHome, 
  FaLightbulb, 
  FaRobot, 
  FaEnvelope, 
  FaInfoCircle 
} from "react-icons/fa";

const Sidebar = () => {
  const router = useRouter();

  const navItems = [
    { path: "/", label: "Home", icon: <FaHome /> },
    { path: "/ai-suggestions", label: "AI Suggestions", icon: <FaLightbulb /> },
    { path: "/chatbot", label: "Chatbot", icon: <FaRobot /> },
    { path: "/contact", label: "Contact Us", icon: <FaEnvelope /> },
    { path: "/about", label: "About Us", icon: <FaInfoCircle /> },
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
    </div>
  );
};

export default Sidebar;