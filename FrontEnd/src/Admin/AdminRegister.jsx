import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  User,
  Mail,
  Lock,
  UserPlus,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Activity,
  Eye,
  EyeOff,
  ShieldCheck
} from "lucide-react";
import "../User/auth.css";
import "./adminAuth.css";

function AdminRegister() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Validation Schema
  const validationSchema = Yup.object({
    adminName: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .required("Admin name is required"),

    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),

    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  // Formik
  const formik = useFormik({
    initialValues: {
      adminName: "",
      email: "",
      password: "",
    },

    validationSchema,

    onSubmit: async (values, { setSubmitting }) => {
      setServerError(null);
      try {
        const response = await axios.post(
          "http://localhost:3000/Admin/register",
          values
        );

        navigate("/adminLogin");
      } catch (error) {
        console.log(error);
        setServerError(
          error.response?.data?.message ||
          "Failed to create admin account. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="auth-page">
      {/* Decorative Blobs */}
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Back Button */}
      <button className="auth-back-btn" onClick={() => navigate("/adminHome")}>
        <ArrowLeft size={16} />
        <span>Back to Admin Home</span>
      </button>

      <div className="auth-container">
        <div className="glass-card auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo" onClick={() => navigate("/adminHome")}>
              <Activity className="auth-logo-icon" />
              <h2>HabitFlow</h2>
            </div>
            <div className="admin-role-badge">
              <ShieldCheck size={14} />
              <span>Admin Portal</span>
            </div>
            <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>
              Create Admin Account
            </h1>
            <p className="auth-subtitle">
              Set up your admin credentials to manage the platform
            </p>
          </div>

          {/* API Error Banner */}
          {serverError && (
            <div className="auth-error-banner">
              <AlertCircle size={18} className="auth-error-icon" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={formik.handleSubmit}>
            {/* Admin Name Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="admin-name">
                Admin Name
              </label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="admin-name"
                  name="adminName"
                  type="text"
                  className="form-control"
                  placeholder="John Admin"
                  value={formik.values.adminName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={formik.isSubmitting}
                />
              </div>
              {formik.touched.adminName && formik.errors.adminName && (
                <div className="error-text">
                  <AlertCircle size={14} />
                  <span>{formik.errors.adminName}</span>
                </div>
              )}
            </div>

            {/* Email Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="admin-email">
                Email Address
              </label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="admin-email"
                  name="email"
                  type="text"
                  className="form-control"
                  placeholder="admin@example.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={formik.isSubmitting}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <div className="error-text">
                  <AlertCircle size={14} />
                  <span>{formik.errors.email}</span>
                </div>
              )}
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="admin-password">
                Password
              </label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Min 6 characters"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={formik.isSubmitting}
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "1rem",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: 0
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="error-text">
                  <AlertCircle size={14} />
                  <span>{formik.errors.password}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Create Admin Account</span>
                </>
              )}
            </button>
          </form>

          {/* Redirect */}
          <div className="auth-footer">
            <p>
              Already have an admin account?{" "}
              <span
                className="auth-link"
                onClick={() => navigate("/adminLogin")}
              >
                Sign In
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;