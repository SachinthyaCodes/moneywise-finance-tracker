import { FaTimes } from "react-icons/fa";
import styles from "../styles/popup.module.css";

interface PopupProps {
  message: string;
  onClose: () => void;
}

const Popup = ({ message, onClose }: PopupProps) => {
  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        <div className={styles.message}>{message}</div>
      </div>
    </div>
  );
};

export default Popup; 