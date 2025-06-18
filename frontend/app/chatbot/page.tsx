"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './chatbot.module.css';
import { FiSend, FiMessageSquare, FiDollarSign, FiPieChart, FiTrendingUp, FiHelpCircle, FiTrash2, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { Toaster } from 'react-hot-toast';
import { showErrorToast, toastStyles } from '../utils/toastConfig';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

const SUGGESTIONS = [
  {
    question: "How can I start saving money?",
    icon: FiDollarSign,
    category: "Savings"
  },
  {
    question: "What's the best way to create a budget?",
    icon: FiPieChart,
    category: "Budgeting"
  },
  {
    question: "How should I invest my savings?",
    icon: FiTrendingUp,
    category: "Investments"
  },
  {
    question: "Tips for reducing monthly expenses",
    icon: FiAlertCircle,
    category: "Expenses"
  },
  {
    question: "How to plan for retirement?",
    icon: FiCheckCircle,
    category: "Planning"
  }
];

const getEmojiForMessage = (content: string): string => {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('budget') || lowerContent.includes('saving')) return '💰';
  if (lowerContent.includes('invest') || lowerContent.includes('stock')) return '📈';
  if (lowerContent.includes('debt') || lowerContent.includes('loan')) return '🏦';
  if (lowerContent.includes('retirement') || lowerContent.includes('future')) return '🎯';
  if (lowerContent.includes('expense') || lowerContent.includes('spend')) return '💸';
  if (lowerContent.includes('emergency') || lowerContent.includes('crisis')) return '🚨';
  if (lowerContent.includes('tax') || lowerContent.includes('deduction')) return '📝';
  if (lowerContent.includes('insurance') || lowerContent.includes('protect')) return '🛡️';
  return '💡';
};

const ChatbotPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a financial advisor AI assistant. Please provide helpful financial advice for the following question: ${input}`
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get response from AI');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I could not generate a response at this time.'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      showErrorToast('Failed to get response from AI. Please try again.');
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const formatMessage = (content: string) => {
    // Add emoji based on content
    const emoji = getEmojiForMessage(content);
    
    // Format bold text
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Format lists with better structure
    content = content.replace(/\n(\d+)\.\s+(.*?)(?=\n\d+\.|\n\n|$)/g, '<div class="numbered-list-item"><span class="number">$1.</span><span class="content">$2</span></div>');
    
    // Format bullet points
    content = content.replace(/\n\*\s+(.*?)(?=\n\*|\n\n|$)/g, '<div class="bullet-list-item"><span class="bullet">•</span><span class="content">$1</span></div>');
    
    // Format paragraphs with better spacing
    content = content.split('\n\n').map(p => {
      if (p.trim().startsWith('<div class="')) {
        return p; // Don't wrap list items in paragraphs
      }
      return `<p>${p}</p>`;
    }).join('');
    
    // Format headers
    content = content.replace(/^(.*?):$/gm, '<h3 class="section-header">$1</h3>');
    
    // Add emoji to the start of the message
    return `<div class="message-emoji">${emoji}</div><div class="formatted-content">${content}</div>`;
  };

  return (
    <div className={styles.chatbotPage}>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 5000,
          style: toastStyles.style,
          success: {
            style: { ...toastStyles.style, background: '#10B981' }
          },
          error: {
            style: { ...toastStyles.style, background: '#EF4444' }
          },
        }}
      />
      <div className={styles.chatbotHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.chatbotTitle}>Smart Financial Chatbot</h1>
            <p className={styles.chatbotSubtitle}>Get instant financial advice and insights</p>
          </div>
          <div className={styles.headerIcons}>
            {messages.length > 0 && (
              <button onClick={clearChat} className={styles.clearButton}>
                <span className={styles.clearIcon}>
                  <FiTrash2 />
                </span>
                Clear Chat
              </button>
            )}
            <div className={styles.iconTooltip}>
              <span className={styles.helpIcon}>
                <FiHelpCircle />
              </span>
              <span className={styles.tooltip}>Click on suggestions to get started</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.chatContainer}>
        <div className={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div className={styles.welcomeMessage}>
              <div className={styles.welcomeIconContainer}>
                <span className={styles.welcomeIcon}>
                  <FiMessageSquare />
                </span>
              </div>
              <h2>Welcome to your Financial Assistant! 👋</h2>
              <p>Ask me anything about personal finance, budgeting, investments, or financial planning.</p>
              
              <div className={styles.suggestionsContainer}>
                <h3>Popular Questions 💭</h3>
                <div className={styles.suggestionsGrid}>
                  {SUGGESTIONS.map((suggestion, index) => (
                    <button
                      key={index}
                      className={styles.suggestionButton}
                      onClick={() => handleSuggestionClick(suggestion.question)}
                    >
                      <div className={styles.suggestionContent}>
                        <span className={styles.suggestionIcon}>
                          <suggestion.icon />
                        </span>
                        <div className={styles.suggestionText}>
                          <span className={styles.suggestionCategory}>{suggestion.category}</span>
                          <span className={styles.suggestionQuestion}>{suggestion.question}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`${styles.message} ${
                  message.role === 'user' ? styles.userMessage : styles.assistantMessage
                }`}
              >
                <div className={styles.messageHeader}>
                  <span className={styles.messageRole}>
                    {message.role === 'user' ? 'You' : 'Financial Assistant'}
                  </span>
                  {message.timestamp && (
                    <span className={styles.messageTimestamp}>{message.timestamp}</span>
                  )}
                </div>
                <div 
                  className={styles.messageContent}
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                />
              </div>
            ))
          )}
          {isLoading && (
            <div className={styles.loadingMessage}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className={styles.inputContainer}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about finance... 💭"
            className={styles.input}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={isLoading || !input.trim()}
          >
            <span className={styles.sendIcon}>
              <FiSend />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotPage; 