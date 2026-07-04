import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { 
  Mail, 
  Lock, 
  LogIn, 
  ArrowLeft, 
  AlertCircle, 
  Loader2, 
  Activity,
  Eye,
  EyeOff
} from 'lucide-react'
import './auth.css'

function Login() {
  const navigate = useNavigate()

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  })
  
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:3000/User/login", loginData);
      
      // Save token and redirect
      localStorage.setItem("token", response.data.token);
      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        "Failed to log in. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Decorative Blobs */}
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      {/* Back Button */}
      <button className="auth-back-btn" onClick={() => navigate("/")}>
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </button>

      <div className="auth-container">
        <div className="glass-card auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo" onClick={() => navigate("/")}>
              <Activity className="auth-logo-icon" />
              <h2>HabitFlow</h2>
            </div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Welcome Back</h1>
            <p className="auth-subtitle">Log in to check today's habit completions</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="auth-error-banner">
              <AlertCircle size={18} className="auth-error-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="email-input"
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="password-input">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  disabled={loading}
                  required
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Redirect */}
          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <span className="auth-link" onClick={() => navigate("/register")}>
                Sign Up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login