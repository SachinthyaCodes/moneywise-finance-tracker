import Link from "next/link";
import Sidebar from '../components/Sidebar';

export default function Home() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-video-container">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="hero-video"
              poster="/media/hero-poster.jpg"
              controls={false}
              preload="auto"
            >
              <source src="/media/Hero-video.mp4" type="video/mp4" />
              <source src="/media/Hero-video.webm" type="video/webm" />
              <img src="/media/hero-poster.jpg" alt="Hero background" className="hero-fallback-image" />
              Your browser does not support the video tag.
            </video>
            <div className="hero-overlay"></div>
          </div>
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">
                Take Control of Your Finances with MoneyWise
              </h1>
              <p className="hero-subtitle">
                Your all-in-one solution for smart budgeting, expense tracking, and financial goals
              </p>
              <Link href="/register" className="button button-secondary">
                Get Started Free
                <span className="button-arrow">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <h2 className="features-title">
              Powerful Features for Your Financial Success
            </h2>
            
            <div className="features-grid">
              {/* Smart Budget Analyzer */}
              <div className="feature-card">
                <div className="feature-image-container">
                  <img
                    src="/media/Ai-insight.jpg"
                    alt="Smart Budget Analyzer"
                    className="feature-image"
                  />
                </div>
                <h3 className="feature-title">Smart Budget Analyzer</h3>
                <p className="feature-description">AI-powered insights to optimize your spending and savings patterns</p>
              </div>

              {/* Recurring Bills Manager */}
              <div className="feature-card">
                <div className="feature-image-container">
                  <img
                    src="/media/bill.jpg"
                    alt="Recurring Bills Manager"
                    className="feature-image"
                  />
                </div>
                <h3 className="feature-title">Recurring Bills Manager</h3>
                <p className="feature-description">Never miss a payment with smart subscription tracking</p>
              </div>

              {/* Income Tracking */}
              <div className="feature-card">
                <div className="feature-image-container">
                  <img
                    src="/media/income.jpg"
                    alt="Income Tracking"
                    className="feature-image"
                  />
                </div>
                <h3 className="feature-title">Income Tracking</h3>
                <p className="feature-description">Track your income and set achievable financial goals</p>
              </div>

              {/* Expense Management */}
              <div className="feature-card">
                <div className="feature-image-container">
                  <img
                    src="/media/expenses.jpg"
                    alt="Expense Management"
                    className="feature-image"
                  />
                </div>
                <h3 className="feature-title">Expense Management</h3>
                <p className="feature-description">Comprehensive expense tracking with detailed analytics</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">
                Ready to Transform Your Financial Life?
              </h2>
              <p className="cta-subtitle">
                Join thousands of users who are already managing their finances smarter with MoneyWise
              </p>
              <Link href="/register" className="button button-primary">
                Start Your Free Trial
                <span className="button-arrow">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
