import React, { useState, useEffect } from 'react'
import './nav.css'
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, LogOut, User, LogIn, Menu, X, ShieldCheck } from 'lucide-react';

function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedAdminToken = localStorage.getItem("adminToken");
    setToken(storedToken);
    setAdminToken(storedAdminToken);
  }, [location.pathname]);

  const handleLogout = () => {
    if (adminToken) {
      localStorage.removeItem("adminToken");
      setAdminToken(null);
      navigate("/adminHome");
    } else {
      localStorage.removeItem("token");
      setToken(null);
      navigate("/home");
    }
  };

  const isNavAdmin = Boolean(adminToken || location.pathname.startsWith("/admin"));

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo" onClick={() => navigate(adminToken ? "/adminProfile" : "/")}>
          <Activity className="logo-icon" />
          <h2>HabitFlow</h2>
          {isNavAdmin && (
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                color: 'white',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                marginLeft: '0.25rem'
              }}
            >
              Admin
            </span>
          )}
        </div>

        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-menu-wrapper ${menuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
          </ul>

          <div className="nav-buttons">
            {adminToken ? (
              <>
                <button className="btn btn-secondary nav-profile-btn" onClick={() => { navigate("/adminProfile"); setMenuOpen(false); }}>
                  <ShieldCheck size={18} />
                  <span>Admin Dashboard</span>
                </button>
                <button className="btn btn-danger nav-logout-btn" onClick={handleLogout}>
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : token ? (
              <>
                 <button className="btn btn-secondary nav-profile-btn" onClick={() => { navigate("/profile"); setMenuOpen(false); }}>
                  <User size={18} />
                  <span>Dashboard</span>
                </button>
                <button className="btn btn-danger nav-logout-btn" onClick={handleLogout}>
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : isNavAdmin ? (
              <>
                <button className="btn btn-secondary login-btn" onClick={() => { navigate("/adminLogin"); setMenuOpen(false); }}>
                  <LogIn size={18} />
                  <span>Admin Login</span>
                </button>
                <button className="btn btn-primary getstarted-btn" onClick={() => { navigate("/adminRegister"); setMenuOpen(false); }}>
                  Get Started
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary login-btn" onClick={() => { navigate("/login"); setMenuOpen(false); }}>
                  <LogIn size={18} />
                  <span>Login</span>
                </button>
                <button className="btn btn-primary getstarted-btn" onClick={() => { navigate("/register"); setMenuOpen(false); }}>
                  Get Started
                </button>
                  <button className="btn btn-secondary login-btn" onClick={() => { navigate("/"); setMenuOpen(false); }}>
                  <LogIn size={18} />
                  <span>Back to Home</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Nav
