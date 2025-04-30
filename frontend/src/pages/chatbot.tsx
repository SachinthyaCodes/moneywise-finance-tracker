import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { sendChatMessage } from "../utils/api";
import styles from "../styles/chatbot.module.css";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ text: string; sender: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const processMessage = (text: string) => {
    return text.split('**').map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index}>{part}</strong>;
      }
      return part;
    });
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Add user message immediately
    setChat(prev => [...prev, { text: message, sender: "user" }]);
    setMessage("");
    setIsTyping(true);

    try {
      const response = await sendChatMessage(message);
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setChat(prev => [...prev, { text: response.reply, sender: "bot" }]);
    } catch (error) {
      setChat(prev => [...prev, { text: "Sorry, I encountered an error. Please try again.", sender: "bot" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.mainContent}>
        <h2 className={styles.heading}>Chat with MoneyWise AI</h2>
        <div className={styles.chatbox}>
          <div className={styles.chatMessages}>
            {chat.map((msg, index) => (
              <div key={index} className={msg.sender === "user" ? styles.user : styles.bot}>
                {processMessage(msg.text)}
              </div>
            ))}
            {isTyping && (
              <div className={styles.typingIndicator}>
                <div className={styles.typingDot}></div>
                <div className={styles.typingDot}></div>
                <div className={styles.typingDot}></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className={styles.inputContainer}>
            <input
              type="text"
              className={styles.inputField}
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isTyping}
            />
            <button 
              className={styles.sendButton} 
              onClick={handleSendMessage}
              disabled={isTyping || !message.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;
