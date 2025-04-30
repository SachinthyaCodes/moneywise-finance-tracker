import Link from "next/link";
import styles from "../styles/navbar.module.css";

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <h1>MoneyWise</h1>
      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/ai-suggestions">AI Suggestions</Link></li>
        <li><Link href="/chatbot">Chatbot</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
