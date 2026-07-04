import React, { useState, useEffect } from 'react'
import './nav.css'
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, LogOut, User, LogIn, Menu, X } from 'lucide-react';

function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo" onClick={() => navigate("/")}>
          <Activity className="logo-icon" />
          <h2>HabitFlow</h2>
        </div>

        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-menu-wrapper ${menuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
             
             
          </ul>

          <div className="nav-buttons">
            {token ? (
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
            ) : (
              <>
                <button className="btn btn-secondary login-btn" onClick={() => { navigate("/login"); setMenuOpen(false); }}>
                  <LogIn size={18} />
                  <span>Login</span>
                </button>
                <button className="btn btn-primary getstarted-btn" onClick={() => { navigate("/register"); setMenuOpen(false); }}>
                  Get Started
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
