import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Grid,
  Users,
  ListCheck,
  BarChart3,
  UserCog,
  LogOut,
  Mail,
  User,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Search,
  Filter,
  Trash2,
  Ban,
  UserCheck,
  Eye,
  X,
  FileText,
  AlertTriangle
} from "lucide-react";
import Nav from "../components/Nav";
import "./adminProfile.css";

function AdminProfile() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, manageUsers, habitManagement, Reports&analytics, settings

  // Clock state
  const [currentTime, setCurrentTime] = useState("");

  // Settings form states
  const [settingsData, setSettingsData] = useState({
    adminName: "",
    email: "",
    password: ""
  });
  const [settingsStatus, setSettingsStatus] = useState({ type: "", message: "" });
  const [settingsSubmitting, setSettingsSubmitting] = useState(false);

  // System Data State (Live database state)
  const [usersList, setUsersList] = useState([]);

  // Selected User Modal State
  const [selectedUser, setSelectedUser] = useState(null);

  // Habit Management Filter & Search State
  const [habitSearch, setHabitSearch] = useState("");
  const [habitCategoryFilter, setHabitCategoryFilter] = useState("all");

  // Emails Module State
  const [emailForm, setEmailForm] = useState({
    recipientUserId: "",
    to: "",
    subject: "",
    message: "",
    includeStats: true,
    activitySummary: ""
  });
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ type: "", message: "", previewUrl: null });
  const [sentEmailsLog, setSentEmailsLog] = useState([]);

  // Notifications
  const [actionAlert, setActionAlert] = useState(null);

  const showNotification = (msg, type = "success") => {
    setActionAlert({ msg, type });
    setTimeout(() => setActionAlert(null), 3500);
  };

  // Time Ticker
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      };
      setCurrentTime(now.toLocaleString("en-US", options));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch registered users and exact habits from MongoDB database
  const fetchUsersData = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;
    try {
      const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      const res = await axios.get("http://localhost:3000/Admin/users", {
        headers: { authorization: authHeader }
      });
      if (res.data && res.data.users) {
        const mappedUsers = res.data.users.map(u => ({
          ...u,
          id: u._id || u.id,
          status: u.status || "active",
          habits: u.habits || []
        }));
        setUsersList(mappedUsers);
      }
    } catch (err) {
      console.warn("Error fetching users list:", err);
    }
  };

  // Re-fetch database user habits when changing tabs
  useEffect(() => {
    if (activeTab === "manageUsers" || activeTab === "habitManagement" || activeTab === "dashboard") {
      fetchUsersData();
    }
  }, [activeTab]);

  // Fetch Admin Profile info from backend
  useEffect(() => {
    const getProfile = async () => {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        navigate("/adminLogin");
        return;
      }

      try {
        const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        const response = await axios.get("http://localhost:3000/Admin/profile", {
          headers: {
            authorization: authHeader
          }
        });

        if (response.data && response.data.admin) {
          setAdmin(response.data.admin);
          setSettingsData({
            adminName: response.data.admin.adminName || "",
            email: response.data.admin.email || "",
            password: ""
          });
        }
        await fetchUsersData();
      } catch (error) {
        console.warn("Admin session expired or invalid. Navigating to login.");
        localStorage.removeItem("adminToken");
        navigate("/adminLogin", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate]);

  // Calculations for Application Overview Data
  const totalusers = usersList.length;
  const activeUsers = usersList.filter(u => u.status === "active").length;
  
  // Extract all habits across all users
  const allHabitsList = usersList.flatMap(u => 
    (u.habits || []).map(h => ({
      ...h,
      userId: u.id || u._id,
      userName: u.userName,
      userEmail: u.email
    }))
  );

  const totalHabits = allHabitsList.length;
  const habitsCompletedToday = allHabitsList.filter(h => h.completed).length;
  const pendingReports = usersList.filter(u => u.status === "blocked").length + allHabitsList.filter(h => h.flagged).length;

  // Manage Users Actions (Block / Unblock toggle with backend sync)
  const handleToggleBlockUser = async (userId) => {
    const targetUser = usersList.find(u => u.id === userId || u._id === userId);
    const newStatus = targetUser && targetUser.status === "active" ? "blocked" : "active";

    setUsersList(prev => prev.map(u => {
      if (u.id === userId || u._id === userId) {
        return { ...u, status: newStatus };
      }
      return u;
    }));

    if (selectedUser && (selectedUser.id === userId || selectedUser._id === userId)) {
      setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
    }

    try {
      const token = localStorage.getItem("adminToken");
      const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      await axios.patch(`http://localhost:3000/Admin/users/${userId}/status`, 
        { status: newStatus },
        { headers: { authorization: authHeader } }
      );
      showNotification(
        `User ${targetUser ? targetUser.userName : ""} has been ${newStatus === "blocked" ? "blocked" : "unblocked"}.`,
        newStatus === "blocked" ? "warning" : "success"
      );
    } catch (err) {
      console.error(err);
      fetchUsersData();
    }
  };

  // Delete user action with backend sync
  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}" for inappropriate behavior/habit?`)) {
      setUsersList(prev => prev.filter(u => u.id !== userId && u._id !== userId));
      if (selectedUser && (selectedUser.id === userId || selectedUser._id === userId)) {
        setSelectedUser(null);
      }

      try {
        const token = localStorage.getItem("adminToken");
        const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        await axios.delete(`http://localhost:3000/Admin/users/${userId}`, {
          headers: { authorization: authHeader }
        });
        showNotification(`User ${userName} deleted.`, "danger");
      } catch (err) {
        console.error(err);
        fetchUsersData();
      }
    }
  };

  // Habit Management Actions (Delete habit with backend sync)
  const handleDeleteHabit = async (habitId, habitName, userId) => {
    if (window.confirm(`Delete inappropriate habit "${habitName}"?`)) {
      setUsersList(prev => prev.map(u => ({
        ...u,
        habits: (u.habits || []).filter(h => h.id !== habitId && h._id !== habitId)
      })));

      try {
        const token = localStorage.getItem("adminToken");
        const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        if (userId) {
          await axios.delete(`http://localhost:3000/Admin/users/${userId}/habits/${habitId}`, {
            headers: { authorization: authHeader }
          });
        }
        showNotification(`Habit "${habitName}" deleted.`, "danger");
      } catch (err) {
        console.error(err);
        fetchUsersData();
      }
    }
  };

  // Open email tab pre-filled for selected user
  const handleOpenEmailForUser = (u) => {
    const userHabits = u.habits || [];
    const doneH = userHabits.filter(h => h.completed || h.done).length;
    const summaryStr = `User: ${u.userName} | Total Habits: ${userHabits.length} | Completed Today: ${doneH}`;
    setEmailForm({
      recipientUserId: u.id || u._id,
      to: u.email,
      subject: `HabitFlow Activity Update for ${u.userName}`,
      message: `Hi ${u.userName},\n\nHere is your latest habit activity breakdown from the HabitFlow admin team. Keep up your amazing efforts!`,
      includeStats: true,
      activitySummary: summaryStr
    });
    setEmailStatus({ type: "", message: "", previewUrl: null });
    setActiveTab("emails");
  };

  // Apply quick email template presets
  const handleApplyTemplate = (templateType) => {
    const targetUser = usersList.find(u => u.email === emailForm.to || u.id === emailForm.recipientUserId || u._id === emailForm.recipientUserId);
    const userName = targetUser ? targetUser.userName : "User";

    if (templateType === "activity") {
      setEmailForm(prev => ({
        ...prev,
        subject: `📊 Your HabitFlow Weekly Activity Report - ${userName}`,
        message: `Hello ${userName},\n\nWe wanted to share your latest habit activity snapshot on HabitFlow!\n\nBuilding daily routines is key to long-term success. Check your activity breakdown below and keep pushing towards your goals!\n\nBest regards,\nHabitFlow Admin Team`
      }));
    } else if (templateType === "streak") {
      setEmailForm(prev => ({
        ...prev,
        subject: `🔥 Outstanding Habit Streak Boost for ${userName}!`,
        message: `Hi ${userName},\n\nCongratulations on keeping your habit momentum going! Our team noticed your dedication on HabitFlow.\n\nKeep hitting those daily checkmarks to build unstoppable habits!\n\nCheers,\nHabitFlow Admin Team`
      }));
    } else if (templateType === "notice") {
      setEmailForm(prev => ({
        ...prev,
        subject: `⚠️ Important Notice Regarding Your HabitFlow Account`,
        message: `Dear ${userName},\n\nThis is an administrative update regarding your account status or logged habits on HabitFlow.\n\nPlease review your account settings and logged activities. If you have any questions, reply to this message.\n\nRegards,\nHabitFlow Admin Team`
      }));
    }
  };

  // Send Email handler using Nodemailer API
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setEmailStatus({ type: "", message: "", previewUrl: null });

    if (!emailForm.to || !emailForm.subject || !emailForm.message) {
      setEmailStatus({
        type: "error",
        message: "Recipient email, subject, and message content are required."
      });
      return;
    }

    setEmailSending(true);
    const token = localStorage.getItem("adminToken");

    try {
      const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

      let summaryText = "";
      if (emailForm.includeStats) {
        const targetUser = usersList.find(u => u.email === emailForm.to || u.id === emailForm.recipientUserId || u._id === emailForm.recipientUserId);
        if (targetUser) {
          const habits = targetUser.habits || [];
          const completed = habits.filter(h => h.completed || h.done).length;
          summaryText = `Account Status: ${targetUser.status || 'Active'}\nTotal Logged Habits: ${habits.length}\nCompleted Today: ${completed} habit(s)\nHabits Breakdown:\n` +
            habits.map(h => `  • ${h.name} (${h.category}) - ${h.completed || h.done ? 'Completed' : 'Pending'}`).join('\n');
        } else if (emailForm.activitySummary) {
          summaryText = emailForm.activitySummary;
        }
      }

      const response = await axios.post(
        "http://localhost:3000/Admin/send-email",
        {
          to: emailForm.to,
          subject: emailForm.subject,
          message: emailForm.message,
          activitySummary: summaryText
        },
        {
          headers: {
            authorization: authHeader
          }
        }
      );

      setEmailStatus({
        type: "success",
        message: response.data.message || `Email sent successfully to ${emailForm.to}`,
        previewUrl: response.data.previewUrl
      });

      setSentEmailsLog(prev => [
        {
          id: Date.now(),
          to: emailForm.to,
          subject: emailForm.subject,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          previewUrl: response.data.previewUrl
        },
        ...prev
      ]);

      showNotification(`Email sent to ${emailForm.to}`, "success");
    } catch (err) {
      console.error(err);
      setEmailStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to send email via Nodemailer."
      });
    } finally {
      setEmailSending(false);
    }
  };

  // Settings update handler (updates adminName, email, password in database)
  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setSettingsStatus({ type: "", message: "" });

    if (!settingsData.adminName || !settingsData.email) {
      setSettingsStatus({
        type: "error",
        message: "Admin name and email are required."
      });
      return;
    }

    setSettingsSubmitting(true);
    const token = localStorage.getItem("adminToken");

    try {
      const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      const response = await axios.put(
        "http://localhost:3000/Admin/profile",
        settingsData,
        {
          headers: {
            authorization: authHeader
          }
        }
      );

      setAdmin(response.data.admin);
      setSettingsData((prev) => ({ ...prev, password: "" }));
      setSettingsStatus({
        type: "success",
        message: "Admin details updated successfully!"
      });
    } catch (err) {
      console.error(err);
      setSettingsStatus({
        type: "error",
        message:
          err.response?.data?.message || "Failed to update admin details."
      });
    } finally {
      setSettingsSubmitting(false);
    }
  };

  // Logout handler returns to adminhome page
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/adminHome");
  };

  const adminInitial = admin.adminName
    ? admin.adminName.charAt(0)
    : admin.email
    ? admin.email.charAt(0)
    : "A";

  // Filtered habits for Habit Management tab
  const filteredHabits = allHabitsList.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(habitSearch.toLowerCase()) || 
                          h.userName.toLowerCase().includes(habitSearch.toLowerCase());
    const matchesCategory = habitCategoryFilter === "all" || h.category === habitCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="admin-tab-content">
            {/* Dashboard Greeting Header */}
            <div className="admin-greeting-wrapper">
              <h1 className="admin-greeting-text">
                Welcome,{" "}
                <span className="gradient-text">
                  {admin.adminName || "Admin"}
                </span>
                !
                <span
                  className="wave-emoji"
                  role="img"
                  aria-label="waving hand"
                >
                  👋
                </span>
              </h1>
              <p className="admin-greeting-subtitle">
                Overview of the entire application
              </p>
              <div className="admin-greeting-time">
                <Clock size={16} />
                <span>{currentTime}</span>
              </div>
            </div>

            {/* Application Overview Data Cards */}
            <div className="admin-stats-grid">
              {/* Total Users */}
              <div className="glass-card admin-stat-card">
                <div
                  className="admin-stat-icon-wrap"
                  style={{
                    background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)"
                  }}
                >
                  <Users />
                </div>
                <span className="admin-stat-value">{totalusers}</span>
                <span className="admin-stat-label">Total Users</span>
              </div>

              {/* Active Users */}
              <div className="glass-card admin-stat-card">
                <div
                  className="admin-stat-icon-wrap"
                  style={{
                    background: "linear-gradient(135deg, var(--success) 0%, #34d399 100%)"
                  }}
                >
                  <UserCheck />
                </div>
                <span className="admin-stat-value success">{activeUsers}</span>
                <span className="admin-stat-label">Active Users</span>
              </div>

              {/* Total Habits */}
              <div className="glass-card admin-stat-card">
                <div
                  className="admin-stat-icon-wrap"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
                  }}
                >
                  <ListCheck />
                </div>
                <span className="admin-stat-value warning">{totalHabits}</span>
                <span className="admin-stat-label">Total Habits</span>
              </div>

              {/* Habits Completed Today */}
              <div className="glass-card admin-stat-card">
                <div
                  className="admin-stat-icon-wrap"
                  style={{
                    background: "linear-gradient(135deg, var(--secondary) 0%, #d946ef 100%)"
                  }}
                >
                  <CheckCircle2 />
                </div>
                <span className="admin-stat-value secondary">{habitsCompletedToday}</span>
                <span className="admin-stat-label">Habits Completed Today</span>
              </div>

              {/* Pending Reports */}
              <div className="glass-card admin-stat-card">
                <div
                  className="admin-stat-icon-wrap"
                  style={{
                    background: "linear-gradient(135deg, var(--danger) 0%, #f43f5e 100%)"
                  }}
                >
                  <AlertTriangle />
                </div>
                <span className="admin-stat-value" style={{ color: "var(--danger)" }}>{pendingReports}</span>
                <span className="admin-stat-label">Pending Reports</span>
              </div>
            </div>

            {/* Shortcuts block */}
            <div className="glass-card admin-info-card" style={{ marginTop: "1.5rem" }}>
              <div className="admin-info-header">
                <div>
                  <h2 style={{ fontSize: "1.3rem" }}>Quick Management Shortcuts</h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Access administration modules directly
                  </p>
                </div>
              </div>

              <div className="admin-quick-actions">
                <div
                  className="glass-card admin-action-item"
                  onClick={() => setActiveTab("manageUsers")}
                >
                  <div
                    className="admin-action-icon"
                    style={{
                      background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)"
                    }}
                  >
                    <Users />
                  </div>
                  <div className="admin-action-info">
                    <h4>Manage Users ({totalusers})</h4>
                    <p>View user details, block/unblock, delete users</p>
                  </div>
                </div>

                <div
                  className="glass-card admin-action-item"
                  onClick={() => setActiveTab("habitManagement")}
                >
                  <div
                    className="admin-action-icon"
                    style={{
                      background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
                    }}
                  >
                    <ListCheck />
                  </div>
                  <div className="admin-action-info">
                    <h4>Habit Management ({totalHabits})</h4>
                    <p>Search, filter categories, delete habits</p>
                  </div>
                </div>

                <div
                  className="glass-card admin-action-item"
                  onClick={() => setActiveTab("Reports&analytics")}
                >
                  <div
                    className="admin-action-icon"
                    style={{
                      background: "linear-gradient(135deg, var(--success) 0%, #34d399 100%)"
                    }}
                  >
                    <BarChart3 />
                  </div>
                  <div className="admin-action-info">
                    <h4>Reports & Analytics</h4>
                    <p>View short report and overall activity charts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "manageUsers":
        return (
          <div className="admin-tab-content">
            <div className="glass-card admin-info-card">
              <div className="admin-info-header">
                <div>
                  <h2 style={{ fontSize: "1.4rem" }}>Manage Users</h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    View all users, inspect user details (name, age, email, total habits, completed habits), block/unblock users, or delete users for inappropriate behavior.
                  </p>
                </div>
              </div>

              {/* Users Table */}
              <div className="admin-users-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Users</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                          No registered users found in database.
                        </td>
                      </tr>
                    ) : (
                      usersList.map((u) => {
                        const userId = u.id || u._id;
                        return (
                          <tr key={userId} className={u.status === "blocked" ? "row-blocked" : ""}>
                            <td>
                              <div className="table-user-info">
                                <div className="table-avatar">
                                  {(u.userName || u.email || "U").charAt(0).toUpperCase()}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span className="table-user-name">{u.userName}</span>
                                  <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{u.email}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge ${u.status || "active"}`}>
                                {u.status === "active" || !u.status ? "Active" : "Blocked"}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions">
                                {/* View remaining user details (Eye icon) */}
                                <button
                                  className="action-btn view-btn"
                                  onClick={() => setSelectedUser(u)}
                                  title="View Remaining User Details"
                                >
                                  <Eye size={16} />
                                </button>

                                {/* Block / Unblock user */}
                                <button
                                  className={`action-btn ${u.status === "active" ? "block-btn" : "unblock-btn"}`}
                                  onClick={() => handleToggleBlockUser(userId)}
                                  title={u.status === "active" ? "Block User" : "Unblock User"}
                                >
                                  {u.status === "active" ? <Ban size={16} /> : <UserCheck size={16} />}
                                </button>

                                {/* Delete user */}
                                <button
                                  className="action-btn delete-btn"
                                  onClick={() => handleDeleteUser(userId, u.userName)}
                                  title="Delete User for Inappropriate Behaviour/Habit"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "habitManagement":
        return (
          <div className="admin-tab-content">
            <div className="glass-card admin-info-card">
              <div className="admin-info-header">
                <div>
                  <h2 style={{ fontSize: "1.4rem" }}>Habit Management</h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    View all habits, search habits, filter by category, and delete inappropriate habits
                  </p>
                </div>
              </div>

              {/* Controls bar: Search & Category filter */}
              <div className="admin-controls-bar">
                <div className="search-box">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Search habits or owner name..."
                    value={habitSearch}
                    onChange={(e) => setHabitSearch(e.target.value)}
                  />
                </div>

                <div className="filter-box">
                  <Filter size={16} className="filter-icon" />
                  <select
                    className="category-select"
                    value={habitCategoryFilter}
                    onChange={(e) => setHabitCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="health">🏥 Health</option>
                    <option value="fitness">💪 Fitness</option>
                    <option value="mind">🧠 Mind</option>
                    <option value="work">💼 Work</option>
                  </select>
                </div>
              </div>

              {/* Habits Grid */}
              <div className="admin-habits-grid">
                {filteredHabits.length === 0 ? (
                  <div className="no-habits-state">
                    <p>No habits match your search or category filter.</p>
                  </div>
                ) : (
                  filteredHabits.map((h, idx) => {
                    const habitId = h.id || h._id || `h_idx_${idx}`;
                    return (
                      <div key={habitId} className={`glass-card habit-admin-card ${h.flagged ? "flagged-card" : ""}`}>
                        <div className="habit-admin-header">
                          <span className={`habit-tag tag-${h.category || "health"}`}>
                            {h.category || "health"}
                          </span>
                          {h.flagged && (
                            <span className="flagged-badge">
                              <AlertTriangle size={12} /> Flagged
                            </span>
                          )}
                          <button
                            className="delete-habit-btn"
                            onClick={() => handleDeleteHabit(habitId, h.name, h.userId)}
                            title="Delete Inappropriate Habit"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                      <h3 className="habit-admin-title">{h.name}</h3>

                      <div className="habit-admin-footer">
                        <div className="habit-owner-info">
                          <User size={14} />
                          <span>{h.userName || "User"}</span>
                        </div>
                        <div className="habit-status-info">
                          <span className={`status-dot ${h.completed || h.done ? "done" : "pending"}`}></span>
                          <span>{h.completed || h.done ? "Completed Today" : "Pending"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
                )}
              </div>
            </div>
          </div>
        );

      case "Reports&analytics":
        return (
          <div className="admin-tab-content">
            <div className="glass-card admin-info-card">
              <div className="admin-info-header">
                <div>
                  <h2 style={{ fontSize: "1.4rem" }}>Reports & Analytics</h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Short report and overall analytics based on current activities
                  </p>
                </div>
              </div>

              {/* Analytics Summaries */}
              <div className="analytics-overview-grid">
                <div className="glass-card analytics-card">
                  <div className="analytics-card-header">
                    <h4>Activity Distribution by Category</h4>
                    <span className="trend-pill positive">+14.2% active</span>
                  </div>
                  <div className="analytics-bar-group">
                    <div className="bar-item">
                      <div className="bar-label"><span>Health</span><span>42%</span></div>
                      <div className="bar-track"><div className="bar-fill" style={{ width: "42%", background: "var(--success)" }}></div></div>
                    </div>
                    <div className="bar-item">
                      <div className="bar-label"><span>Fitness</span><span>30%</span></div>
                      <div className="bar-track"><div className="bar-fill" style={{ width: "30%", background: "var(--primary)" }}></div></div>
                    </div>
                    <div className="bar-item">
                      <div className="bar-label"><span>Mind</span><span>18%</span></div>
                      <div className="bar-track"><div className="bar-fill" style={{ width: "18%", background: "var(--secondary)" }}></div></div>
                    </div>
                    <div className="bar-item">
                      <div className="bar-label"><span>Work</span><span>10%</span></div>
                      <div className="bar-track"><div className="bar-fill" style={{ width: "10%", background: "#f59e0b" }}></div></div>
                    </div>
                  </div>
                </div>

                <div className="glass-card analytics-card">
                  <div className="analytics-card-header">
                    <h4>Overall Activity Metrics</h4>
                    <span className="trend-pill warning">{pendingReports} Pending Report(s)</span>
                  </div>
                  <div className="analytics-metrics-list">
                    <div className="metric-row">
                      <span className="metric-name">Active Users Ratio</span>
                      <span className="metric-val">{activeUsers} / {totalusers}</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-name">Blocked Users</span>
                      <span className="metric-val" style={{ color: "var(--danger)" }}>
                        {usersList.filter(u => u.status === "blocked").length}
                      </span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-name">Inappropriate Flagged Items</span>
                      <span className="metric-val" style={{ color: "#f59e0b" }}>
                        {allHabitsList.filter(h => h.flagged).length}
                      </span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-name">Habits Completion Efficiency</span>
                      <span className="metric-val" style={{ color: "var(--success)" }}>
                        {totalHabits > 0 ? Math.round((habitsCompletedToday / totalHabits) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Short Report */}
              <div className="admin-summary-report-box">
                <h4><FileText size={18} /> Short System Report</h4>
                <p>
                  Based on current activities: The platform holds <strong>{totalusers} total users</strong> with <strong>{activeUsers} active accounts</strong>. Users have logged a total of <strong>{totalHabits} habits</strong> with a daily completion count of <strong>{habitsCompletedToday} completed habits today</strong>. Currently, <strong>{pendingReports} report(s)</strong> require administrative attention.
                </p>
              </div>
            </div>
          </div>
        );

      case "emails":
        return (
          <div className="admin-tab-content">
            <div className="glass-card admin-info-card">
              <div className="admin-info-header">
                <div>
                  <h2 style={{ fontSize: "1.4rem" }}>Email Dispatcher & User Communications</h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Send activity notifications, streak boosts, and official updates from your registered admin email ({admin.email || "admin@habitflow.com"}) using Nodemailer.
                  </p>
                </div>
              </div>

              {/* Quick Template Presets Bar */}
              <div style={{ marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>
                  Quick Template Presets:
                </span>
                <div className="email-presets-bar">
                  <button
                    type="button"
                    className="email-preset-btn"
                    onClick={() => handleApplyTemplate("activity")}
                  >
                    📊 Activity Report
                  </button>
                  <button
                    type="button"
                    className="email-preset-btn"
                    onClick={() => handleApplyTemplate("streak")}
                  >
                    🔥 Streak Boost
                  </button>
                  <button
                    type="button"
                    className="email-preset-btn"
                    onClick={() => handleApplyTemplate("notice")}
                  >
                    ⚠️ Account Notice
                  </button>
                </div>
              </div>

              {/* Status Alert */}
              {emailStatus.message && (
                <div className={`admin-status-alert ${emailStatus.type}`} style={{ marginBottom: "1.5rem" }}>
                  {emailStatus.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{emailStatus.message}</span>
                    {emailStatus.previewUrl && (
                      <a
                        href={emailStatus.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--primary)", textDecoration: "underline", fontSize: "0.85rem", marginTop: "4px" }}
                      >
                        🔗 View Ethereal Email Preview
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Email Form */}
              <form onSubmit={handleSendEmail} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div className="email-form-grid">
                  {/* Select Registered User */}
                  <div className="admin-settings-group">
                    <label className="form-label">Select Registered User</label>
                    <div className="input-wrapper">
                      <User size={18} className="input-icon" />
                      <select
                        className="form-control"
                        value={emailForm.recipientUserId}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const u = usersList.find(usr => (usr.id || usr._id) === selectedId);
                          if (u) {
                            const doneH = (u.habits || []).filter(h => h.completed || h.done).length;
                            setEmailForm(prev => ({
                              ...prev,
                              recipientUserId: selectedId,
                              to: u.email,
                              subject: prev.subject || `HabitFlow Update for ${u.userName}`,
                              activitySummary: `User: ${u.userName} | Total Habits: ${(u.habits || []).length} | Completed Today: ${doneH}`
                            }));
                          } else {
                            setEmailForm(prev => ({ ...prev, recipientUserId: "" }));
                          }
                        }}
                      >
                        <option value="">-- Choose User (or type custom email below) --</option>
                        {usersList.map(u => (
                          <option key={u.id || u._id} value={u.id || u._id}>
                            {u.userName} ({u.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Recipient To Email */}
                  <div className="admin-settings-group">
                    <label className="form-label">Recipient Email (To)</label>
                    <div className="input-wrapper">
                      <Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        className="form-control"
                        placeholder="user@example.com"
                        value={emailForm.to}
                        onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                        required
                        disabled={emailSending}
                      />
                    </div>
                  </div>

                  {/* Subject Line */}
                  <div className="admin-settings-group full-width">
                    <label className="form-label">Subject Line</label>
                    <div className="input-wrapper">
                      <FileText size={18} className="input-icon" />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter email subject line..."
                        value={emailForm.subject}
                        onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                        required
                        disabled={emailSending}
                      />
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="admin-settings-group full-width">
                    <label className="form-label">Message Content</label>
                    <textarea
                      className="form-control"
                      rows={5}
                      placeholder="Write your email body content here..."
                      value={emailForm.message}
                      onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                      required
                      disabled={emailSending}
                      style={{ padding: "0.85rem", borderRadius: "12px", resize: "vertical" }}
                    />
                  </div>

                  {/* Include Activity Stats Checkbox */}
                  <div className="admin-settings-group full-width" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="checkbox"
                      id="includeStatsToggle"
                      checked={emailForm.includeStats}
                      onChange={(e) => setEmailForm({ ...emailForm, includeStats: e.target.checked })}
                    />
                    <label htmlFor="includeStatsToggle" style={{ fontSize: "0.9rem", color: "var(--text-heading)", cursor: "pointer" }}>
                      Automatically attach user's live habit activity breakdown in email HTML
                    </label>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={emailSending}
                    style={{ minWidth: "160px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                  >
                    {emailSending ? (
                      <>
                        <Loader2 size={18} className="spinner" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <Mail size={18} />
                        <span>Send Email</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Sent Emails History Log */}
              {sentEmailsLog.length > 0 && (
                <div className="sent-log-container">
                  <h4 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Recent Sent Email Log</h4>
                  {sentEmailsLog.map(item => (
                    <div key={item.id} className="sent-log-item">
                      <div>
                        <strong>To: {item.to}</strong> — <span style={{ color: "var(--text-muted)" }}>{item.subject}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.timestamp}</span>
                        {item.previewUrl && (
                          <a href={item.previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", fontSize: "0.8rem" }}>
                            Preview ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="admin-tab-content">
            <div className="glass-card admin-info-card">
              <div className="admin-settings-header">
                <div style={{ position: "relative" }}>
                  <div className="admin-avatar" style={{ width: 96, height: 96, fontSize: "2.5rem" }}>
                    {adminInitial}
                  </div>
                </div>
                <div className="admin-settings-info" style={{ textAlign: "left" }}>
                  <h3>Admin Profile Settings</h3>
                  <p>Update admin details: admin name, email, and password</p>
                </div>
              </div>

              {/* Status alerts */}
              {settingsStatus.message && (
                <div className={`admin-status-alert ${settingsStatus.type}`}>
                  {settingsStatus.type === "success" ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <AlertCircle size={18} />
                  )}
                  <span>{settingsStatus.message}</span>
                </div>
              )}

              {/* Settings Form */}
              <form
                onSubmit={handleSettingsUpdate}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem"
                }}
              >
                <div className="admin-settings-grid">
                  {/* Admin Name */}
                  <div className="admin-settings-group">
                    <label className="form-label" htmlFor="admin-settings-name">
                      Admin Name
                    </label>
                    <div className="input-wrapper">
                      <User size={18} className="input-icon" />
                      <input
                        id="admin-settings-name"
                        type="text"
                        className="form-control"
                        placeholder="Admin Name"
                        value={settingsData.adminName}
                        onChange={(e) =>
                          setSettingsData({
                            ...settingsData,
                            adminName: e.target.value
                          })
                        }
                        disabled={settingsSubmitting}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="admin-settings-group">
                    <label className="form-label" htmlFor="admin-settings-email">
                      Email Address
                    </label>
                    <div className="input-wrapper">
                      <Mail size={18} className="input-icon" />
                      <input
                        id="admin-settings-email"
                        type="email"
                        className="form-control"
                        placeholder="admin@example.com"
                        value={settingsData.email}
                        onChange={(e) =>
                          setSettingsData({
                            ...settingsData,
                            email: e.target.value
                          })
                        }
                        disabled={settingsSubmitting}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="admin-settings-group full-width">
                    <label
                      className="form-label"
                      htmlFor="admin-settings-password"
                    >
                      Password (leave empty to keep current)
                    </label>
                    <div className="input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input
                        id="admin-settings-password"
                        type="password"
                        className="form-control"
                        placeholder="Enter new password to change"
                        value={settingsData.password}
                        onChange={(e) =>
                          setSettingsData({
                            ...settingsData,
                            password: e.target.value
                          })
                        }
                        disabled={settingsSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "1rem"
                  }}
                >
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={settingsSubmitting}
                    style={{ minWidth: "150px" }}
                  >
                    {settingsSubmitting ? (
                      <>
                        <Loader2 size={18} className="spinner" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="admin-profile-page">
        <Nav />
        <div className="admin-loading-wrapper">
          <Loader2
            size={40}
            className="spinner"
            style={{ color: "var(--primary)" }}
          />
          <p>Loading admin profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-profile-page">
      {/* Decorative Background Blobs */}
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Action Notification Banner */}
      {actionAlert && (
        <div className={`admin-toast-notification ${actionAlert.type}`}>
          <AlertCircle size={18} />
          <span>{actionAlert.msg}</span>
        </div>
      )}

      {/* Top Nav Bar (Same structural navbar as user profile) */}
      <Nav />

      <div className="admin-profile-container">
        <div className="admin-profile-grid">
          {/* Nav-Side-Bar Container (Same structural design as user profile) */}
          <div className="admin-sidebar">
            <div className="glass-card sidebar-card">
              
              {/* Admin Profile Header */}
              <div className="admin-user-card">
                <div className="admin-avatar">{adminInitial}</div>
                <h3 className="admin-user-name">
                  {admin.adminName || "Admin"}
                </h3>
                <span className="admin-user-email">
                  {admin.email || "admin@habitflow.com"}
                </span>
              </div>

              {/* Nav-Side-Bar List of Items acting as Buttons/Cards */}
              <ul className="sidebar-nav-list">
                <li
                  className={`sidebar-nav-item ${
                    activeTab === "dashboard" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("dashboard");
                    setSettingsStatus({ type: "", message: "" });
                  }}
                >
                  <Grid className="sidebar-nav-icon" />
                  <span>Dashboard</span>
                </li>

                <li
                  className={`sidebar-nav-item ${
                    activeTab === "manageUsers" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("manageUsers");
                    setSettingsStatus({ type: "", message: "" });
                  }}
                >
                  <Users className="sidebar-nav-icon" />
                  <span>Manage Users</span>
                </li>

                <li
                  className={`sidebar-nav-item ${
                    activeTab === "habitManagement" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("habitManagement");
                    setSettingsStatus({ type: "", message: "" });
                  }}
                >
                  <ListCheck className="sidebar-nav-icon" />
                  <span>Habit Management</span>
                </li>

                <li
                  className={`sidebar-nav-item ${
                    activeTab === "Reports&analytics" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("Reports&analytics");
                    setSettingsStatus({ type: "", message: "" });
                  }}
                >
                  <BarChart3 className="sidebar-nav-icon" />
                  <span>Reports & Analytics</span>
                </li>

                <li
                  className={`sidebar-nav-item ${
                    activeTab === "emails" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("emails");
                    setSettingsStatus({ type: "", message: "" });
                  }}
                >
                  <Mail className="sidebar-nav-icon" />
                  <span>Emails</span>
                </li>

                <li
                  className={`sidebar-nav-item ${
                    activeTab === "settings" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("settings");
                    setSettingsStatus({ type: "", message: "" });
                  }}
                >
                  <UserCog className="sidebar-nav-icon" />
                  <span>Settings</span>
                </li>
              </ul>

              {/* Logout Card/Button -> Returns to adminHome page */}
              <button
                className="btn btn-danger nav-logout-card-btn"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Main Viewport */}
          <div className="admin-main-pane">{renderTabContent()}</div>
        </div>
      </div>

      {/* Selected User Details Modal */}
      {selectedUser && (
        <div className="modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="glass-card modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="modal-close-btn" onClick={() => setSelectedUser(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="user-detail-row">
                <div className="modal-avatar">{(selectedUser.userName || selectedUser.email || "U").charAt(0).toUpperCase()}</div>
                <div>
                  <h4 style={{ fontSize: "1.2rem", margin: 0 }}>{selectedUser.userName}</h4>
                  <span className={`status-badge ${selectedUser.status || "active"}`}>
                    {selectedUser.status === "active" || !selectedUser.status ? "Active" : "Blocked"}
                  </span>
                </div>
              </div>

              <div className="user-info-grid">
                <div className="info-field">
                  <span className="info-label">Name</span>
                  <span className="info-val">{selectedUser.userName}</span>
                </div>
                <div className="info-field">
                  <span className="info-label">Age</span>
                  <span className="info-val">{selectedUser.age || "N/A"}</span>
                </div>
                <div className="info-field" style={{ gridColumn: "span 2" }}>
                  <span className="info-label">Email</span>
                  <span className="info-val">{selectedUser.email}</span>
                </div>
                <div className="info-field">
                  <span className="info-label">Total Habits</span>
                  <span className="info-val">{(selectedUser.habits || []).length}</span>
                </div>
                <div className="info-field">
                  <span className="info-label">Completed Habits</span>
                  <span className="info-val" style={{ color: "var(--success)" }}>
                    {(selectedUser.habits || []).filter(h => h.completed || h.done).length} / {(selectedUser.habits || []).length}
                  </span>
                </div>
              </div>

              <h4 style={{ marginTop: "1.5rem", marginBottom: "0.75rem", fontSize: "1rem" }}>
                User Habits List
              </h4>

              <div className="modal-habits-list">
                {(!selectedUser.habits || selectedUser.habits.length === 0) ? (
                  <div style={{ padding: "1.25rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    No habits created yet by this user.
                  </div>
                ) : (
                  (selectedUser.habits || []).map((h, idx) => (
                    <div key={h.id || h._id || idx} className="modal-habit-item">
                      <div>
                        <span className="modal-habit-name">{h.name}</span>
                        <span className={`habit-tag tag-${h.category || "health"}`} style={{ marginLeft: "0.5rem" }}>
                          {h.category || "health"}
                        </span>
                        {h.streak !== undefined && h.streak > 0 && (
                          <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", color: "#f59e0b" }}>
                            🔥 {h.streak} day streak
                          </span>
                        )}
                      </div>
                      <span className={`status-dot ${h.completed || h.done ? "done" : "pending"}`}>
                        {h.completed || h.done ? "Completed" : "Pending"}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="modal-actions-bar">
                <button
                  className="btn btn-primary"
                  onClick={() => handleOpenEmailForUser(selectedUser)}
                >
                  <Mail size={16} />
                  <span>Send Email</span>
                </button>

                <button
                  className={`btn ${selectedUser.status === "active" || !selectedUser.status ? "btn-danger" : "btn-primary"}`}
                  onClick={() => handleToggleBlockUser(selectedUser.id || selectedUser._id)}
                >
                  {selectedUser.status === "active" || !selectedUser.status ? <Ban size={16} /> : <UserCheck size={16} />}
                  <span>{selectedUser.status === "active" || !selectedUser.status ? "Block User" : "Unblock User"}</span>
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => handleDeleteUser(selectedUser.id || selectedUser._id, selectedUser.userName)}
                  style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
                >
                  <Trash2 size={16} />
                  <span>Delete User</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProfile;