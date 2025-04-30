import Link from "next/link";
import Image from "next/image";
import Sidebar from "../components/Sidebar";
import styles from "../styles/home.module.css";
import { 
  FaChartLine, 
  FaPiggyBank, 
  FaWallet, 
  FaChartPie, 
  FaShieldAlt,
  FaArrowUp,
  FaArrowDown,
  FaDollarSign
} from "react-icons/fa";

const Home = () => {
  const stats = [
    { title: "Total Balance", value: "$25,000", icon: <FaWallet />, trend: "+12%", trendUp: true },
    { title: "Monthly Savings", value: "$3,500", icon: <FaPiggyBank />, trend: "+8%", trendUp: true },
    { title: "Investment Returns", value: "$1,200", icon: <FaChartLine />, trend: "-2%", trendUp: false },
    { title: "Expenses", value: "$4,800", icon: <FaChartPie />, trend: "+5%", trendUp: false },
  ];

  const features = [
    {
      title: "Smart Budgeting",
      description: "AI-powered budget recommendations based on your spending patterns",
      icon: <FaChartPie />,
    },
    {
      title: "Investment Insights",
      description: "Get personalized investment suggestions from our AI",
      icon: <FaChartLine />,
    },
    {
      title: "Secure Banking",
      description: "Bank-grade security to protect your financial data",
      icon: <FaShieldAlt />,
    },
    {
      title: "Savings Goals",
      description: "Set and track your savings goals with smart notifications",
      icon: <FaPiggyBank />,
    },
  ];

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.mainContainer}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroVideoContainer}>
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className={styles.heroVideo}
              poster="/media/hero-poster.jpg"
              controls={false}
              preload="auto"
            >
              <source src="/media/Hero-video.mp4" type="video/mp4" />
              <source src="/media/Hero-video.webm" type="video/webm" />
              <img src="/media/hero-poster.jpg" alt="Hero background" className={styles.heroFallbackImage} />
              Your browser does not support the video tag.
            </video>
            <div className={styles.heroOverlay}></div>
          </div>
          <div className={styles.container}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                Take Control of Your Finances with MoneyWise
              </h1>
              <p className={styles.heroSubtitle}>
                Your all-in-one solution for smart budgeting, expense tracking, and financial goals
              </p>
              <Link href="/register" className={styles.buttonSecondary}>
                Get Started Free
                <span className={styles.buttonArrow}>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.featuresSection}>
          <div className={styles.container}>
            <h2 className={styles.featuresTitle}>
              Powerful Features for Your Financial Success
            </h2>
            
            <div className={styles.featuresGrid}>
              {/* Smart Budget Analyzer */}
              <div className={styles.featureCard}>
                <div className={styles.featureImageContainer}>
                  <img
                    src="/media/Ai-insight.jpg"
                    alt="Smart Budget Analyzer"
                    className={styles.featureImage}
                  />
                </div>
                <h3 className={styles.featureTitle}>Smart Budget Analyzer</h3>
                <p className={styles.featureDescription}>AI-powered insights to optimize your spending and savings patterns</p>
              </div>

              {/* Recurring Bills Manager */}
              <div className={styles.featureCard}>
                <div className={styles.featureImageContainer}>
                  <img
                    src="/media/bill.jpg"
                    alt="Recurring Bills Manager"
                    className={styles.featureImage}
                  />
                </div>
                <h3 className={styles.featureTitle}>Recurring Bills Manager</h3>
                <p className={styles.featureDescription}>Never miss a payment with smart subscription tracking</p>
              </div>

              {/* Income Tracking */}
              <div className={styles.featureCard}>
                <div className={styles.featureImageContainer}>
                  <img
                    src="/media/income.jpg"
                    alt="Income Tracking"
                    className={styles.featureImage}
                  />
                </div>
                <h3 className={styles.featureTitle}>Income Tracking</h3>
                <p className={styles.featureDescription}>Track your income and set achievable financial goals</p>
              </div>

              {/* Expense Management */}
              <div className={styles.featureCard}>
                <div className={styles.featureImageContainer}>
                  <img
                    src="/media/expenses.jpg"
                    alt="Expense Management"
                    className={styles.featureImage}
                  />
                </div>
                <h3 className={styles.featureTitle}>Expense Management</h3>
                <p className={styles.featureDescription}>Comprehensive expense tracking with detailed analytics</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>
                Ready to Transform Your Financial Life?
              </h2>
              <p className={styles.ctaSubtitle}>
                Join thousands of users who are already managing their finances smarter with MoneyWise
              </p>
              <Link href="/register" className={styles.buttonPrimary}>
                Start Your Free Trial
                <span className={styles.buttonArrow}>→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
