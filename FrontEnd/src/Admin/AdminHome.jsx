import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  BarChart3,
  Settings,
  Lock,
  ArrowRight,
  Activity,
  Sparkles,
  LogIn,
  UserPlus
} from "lucide-react";
import "./AdminHome.css";

function AdminHome() {
  const navigate = useNavigate();

  return (
    <div className="admin-home-page">
      {/* Decorative Blobs */}
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Admin Navigation */}
      <nav className="admin-navbar">
        <div className="admin-navbar-container">
          <div className="admin-logo" onClick={() => navigate("/adminHome")}>
            <Activity className="admin-logo-icon" />
            <h2>HabitFlow</h2>
            <span className="admin-logo-badge">Admin</span>
             
          </div>

          <div className="admin-nav-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/adminLogin")}
            >
              <LogIn size={18} />
              <span>Login</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/adminRegister")}
            >
              <UserPlus size={18} />
              <span>Get Started</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/")}
            >
              <LogIn size={18} />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="admin-hero-section">
        <div className="admin-hero-container">
          <div className="admin-hero-badge">
            <Sparkles size={16} className="admin-hero-badge-icon" />
            <span>Admin Control Center</span>
          </div>
          <h1 className="admin-hero-title">
            Manage & Monitor, <br />
            <span className="gradient-text">Your Entire Platform</span>
          </h1>
          <p className="admin-hero-description">
            Oversee user activity, monitor habit completions across the platform,
            manage accounts, and ensure the HabitFlow ecosystem runs smoothly —
            all from a single powerful admin dashboard.
          </p>
          <div className="admin-hero-ctas">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate("/adminRegister")}
            >
              Create Admin Account
              <ArrowRight size={18} />
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => navigate("/adminLogin")}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="admin-features-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Built for Administrators</h2>
          <p className="admin-section-subtitle">
            HabitFlow's admin portal provides the tools you need to manage users,
            track platform health, and maintain security.
          </p>
        </div>

        <div className="admin-features-grid">
          <div className="glass-card admin-feature-card">
            <div className="feature-icon-wrapper primary-glow">
              <Users className="feature-icon" />
            </div>
            <h3>User Management</h3>
            <p>
              View, manage, and oversee all registered users on the platform.
              Monitor account activity and manage user access levels with ease.
            </p>
          </div>

          <div className="glass-card admin-feature-card">
            <div className="feature-icon-wrapper secondary-glow">
              <BarChart3 className="feature-icon" />
            </div>
            <h3>Platform Analytics</h3>
            <p>
              Access real-time analytics on habit completion rates, user engagement
              metrics, and platform growth trends across all accounts.
            </p>
          </div>

          <div className="glass-card admin-feature-card">
            <div className="feature-icon-wrapper success-glow">
              <Settings className="feature-icon" />
            </div>
            <h3>System Configuration</h3>
            <p>
              Configure application settings, manage system preferences, and
              fine-tune the platform to deliver the best user experience.
            </p>
          </div>

          <div className="glass-card admin-feature-card">
            <div className="feature-icon-wrapper danger-glow">
              <Lock className="feature-icon" />
            </div>
            <h3>Security Controls</h3>
            <p>
              Enforce security policies, manage authentication protocols, and
              protect user data with enterprise-grade security features.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="admin-cta-section">
        <div className="glass-card admin-cta-banner">
          <ShieldCheck size={48} style={{ color: "var(--primary)", marginBottom: "0.5rem" }} />
          <h2>Ready to Take Control?</h2>
          <p>
            Set up your admin account in under a minute and gain full access to
            user management, analytics, and platform configuration tools.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/adminRegister")}
          >
            Register as Admin
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="admin-footer">
        <p>&copy; {new Date().getFullYear()} HabitFlow Admin. Platform management made effortless.</p>
      </footer>
    </div>
  );
}

export default AdminHome;