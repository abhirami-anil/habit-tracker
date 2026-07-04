import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Flame, 
  Plus, 
  Trash2, 
  Pencil,
  Check, 
  X,
  Save,
  Loader2,
  Grid,
  ListTodo,
  CalendarDays,
  Brain,
  UserCog,
  LogOut,
  Mail,
  User,
  Calendar,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  TrendingUp,
  Award,
  Send,
  Bot
} from "lucide-react";
import Nav from "../components/Nav";
import "./profile.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, habits, weekly, insights, settings

  // Habits states
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState({ name: "", category: "health" });
  const [habitError, setHabitError] = useState("");

  // Clock state
  const [currentTime, setCurrentTime] = useState("");

  // Profile Settings form states
  const [settingsData, setSettingsData] = useState({
    userName: "",
    email: "",
    age: "",
    password: ""
  });
  const [settingsStatus, setSettingsStatus] = useState({ type: "", message: "" });
  const [settingsSubmitting, setSettingsSubmitting] = useState(false);

  // Habit edit states
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editHabitData, setEditHabitData] = useState({ name: "", category: "health" });

  // Habit completion pop animation
  const [poppingHabitId, setPoppingHabitId] = useState(null);
  const [popBursts, setPopBursts] = useState([]);

  // AI assistant states
  const [aiMessages, setAiMessages] = useState([
    { role: "ai", text: "Hi! I'm your HabitFlow AI assistant. Ask me about your habits, streaks, or get personalized suggestions!" }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiChatRef = useRef(null);

  // Time ticker hook
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setCurrentTime(now.toLocaleString('en-US', options));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Get Profile info from backend
  useEffect(() => {
    const getProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:3000/User/profile", {
          headers: {
            authorization: token,
          },
        });

        setUser(response.data.user);
        setSettingsData({
          userName: response.data.user.userName || "",
          email: response.data.user.email || "",
          age: response.data.user.age || "",
          password: ""
        });
        setLoading(false);

        // Retrieve habits unique to user
        const userEmail = response.data.user.email;
        const storedHabits = localStorage.getItem(`habits_${userEmail}`);
        if (storedHabits) {
          setHabits(JSON.parse(storedHabits));
        } else {
          // Pre-populate with default routines
          const defaultHabits = [
            { id: 1, name: "Drink 3L of Water", done: false, streak: 5, category: "health" },
            { id: 2, name: "Gym Workout Routine", done: false, streak: 3, category: "fitness" },
            { id: 3, name: "Read 10 Pages of Book", done: false, streak: 8, category: "mind" },
            { id: 4, name: "Write Clean React Code", done: false, streak: 12, category: "work" }
          ];
          setHabits(defaultHabits);
          localStorage.setItem(`habits_${userEmail}`, JSON.stringify(defaultHabits));
        }
      } catch (error) {
        console.error("Session fetch failed:", error);
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    getProfile();
  }, [navigate]);

  // Sync state to local storage
  const saveHabits = (updatedHabits) => {
    setHabits(updatedHabits);
    if (user.email) {
      localStorage.setItem(`habits_${user.email}`, JSON.stringify(updatedHabits));
    }
  };

  // Toggle habit completions with pop animation
  const handleToggleHabit = (id, event) => {
    const habit = habits.find(h => h.id === id);
    const willComplete = habit && !habit.done;

    if (willComplete) {
      setPoppingHabitId(id);
      setTimeout(() => setPoppingHabitId(null), 400);

      if (event?.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect();
        const burst = {
          id: Date.now(),
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
        setPopBursts(prev => [...prev, burst]);
        setTimeout(() => {
          setPopBursts(prev => prev.filter(b => b.id !== burst.id));
        }, 700);
      }
    }

    const updated = habits.map(h => {
      if (h.id === id) {
        const newDone = !h.done;
        return {
          ...h,
          done: newDone,
          streak: newDone ? h.streak + 1 : Math.max(0, h.streak - 1)
        };
      }
      return h;
    });
    saveHabits(updated);
  };

  const getDashboardMotivation = () => {
    const hour = new Date().getHours();
    if (totalHabits === 0) {
      return "Start your journey today — add your first habit and build momentum!";
    }
    if (progressPercent === 100) {
      return "Incredible work! You've crushed every habit today. Keep this energy going!";
    }
    if (progressPercent >= 50) {
      return "You're more than halfway there — finish strong and lock in your streaks!";
    }
    if (hour < 12) {
      return "Good morning! A great day starts with small wins — tackle one habit at a time.";
    }
    if (hour < 17) {
      return "You've got this! Every checkmark brings you closer to your best self.";
    }
    return "The day isn't over yet — even one completed habit is a victory worth celebrating.";
  };

  const generateAiResponse = (question) => {
    const q = question.toLowerCase();
    if (q.includes("streak") || q.includes("consistent")) {
      return `Your highest streak is ${highestStreak} days! To improve consistency, try habit stacking — link a new habit to one you already do daily. Completing habits at the same time each day also strengthens neural pathways.`;
    }
    if (q.includes("suggest") || q.includes("new habit") || q.includes("add")) {
      const suggestions = [];
      const categories = habits.map(h => h.category);
      if (!categories.includes("mind")) suggestions.push("📚 Read for 15 minutes");
      if (!categories.includes("fitness")) suggestions.push("🏃 Take a 20-minute walk");
      if (!categories.includes("health")) suggestions.push("💧 Drink a glass of water after waking");
      suggestions.push("🧘 5-minute meditation", "📝 Journal one gratitude");
      return `Based on your current routines, here are some habits to consider:\n\n${suggestions.slice(0, 4).map(s => `• ${s}`).join("\n")}\n\nStart with just one — small habits compound into big changes!`;
    }
    if (q.includes("motivat") || q.includes("give up") || q.includes("hard")) {
      return "Remember: missing one day doesn't erase your progress. Research shows it takes an average of 66 days to form a habit. Focus on showing up — even 80% consistency beats perfect-then-quit every time. You've already proven you can do this!";
    }
    if (q.includes("progress") || q.includes("today") || q.includes("how am i")) {
      return `Today's snapshot: ${completedHabits}/${totalHabits} habits completed (${progressPercent}%). ${progressPercent === 100 ? "Perfect day — you're on fire! 🔥" : progressPercent >= 50 ? "Solid progress — push for a perfect finish!" : "Plenty of time left — pick one habit and start now!"}`;
    }
    if (q.includes("best") || q.includes("tip") || q.includes("advice")) {
      return "Top tips from habit science:\n\n• Start absurdly small (2-minute rule)\n• Track visually — seeing progress motivates\n• Never miss twice in a row\n• Celebrate small wins to release dopamine\n• Review your 'why' when motivation dips";
    }
    return `Great question! With ${totalHabits} active habits and a ${progressPercent}% completion rate today, you're building real momentum. Try asking about streaks, new habit suggestions, or tips for staying consistent!`;
  };

  const handleAiSend = (text) => {
    const message = (text || aiInput).trim();
    if (!message || aiLoading) return;

    setAiMessages(prev => [...prev, { role: "user", text: message }]);
    setAiInput("");
    setAiLoading(true);

    setTimeout(() => {
      setAiMessages(prev => [...prev, { role: "ai", text: generateAiResponse(message) }]);
      setAiLoading(false);
    }, 800 + Math.random() * 600);
  };

  useEffect(() => {
    if (aiChatRef.current) {
      aiChatRef.current.scrollTop = aiChatRef.current.scrollHeight;
    }
  }, [aiMessages, aiLoading]);

  const aiSuggestions = [
    "How can I improve my streaks?",
    "Suggest new habits for me",
    "How am I doing today?",
    "Give me motivation tips"
  ];

  const renderPopBursts = () => (
    popBursts.map(burst => (
      <div
        key={burst.id}
        className="pop-burst-container"
        style={{ left: burst.x, top: burst.y }}
      >
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * 360;
          const rad = (angle * Math.PI) / 180;
          const dist = 40 + Math.random() * 20;
          return (
            <span
              key={i}
              className="pop-particle"
              style={{
                '--dx': `${Math.cos(rad) * dist}px`,
                '--dy': `${Math.sin(rad) * dist}px`,
                background: ['#10b981', '#6366f1', '#a855f7', '#f59e0b'][i % 4],
              }}
            />
          );
        })}
      </div>
    ))
  );

  const renderHabitItem = (habit, showDelete = false) => {
    const isEditing = editingHabitId === habit.id;

    if (isEditing) {
      return (
        <div key={habit.id} className="habit-item habit-edit-mode">
          <div className="habit-edit-form">
            <input
              type="text"
              className="habit-edit-input"
              value={editHabitData.name}
              onChange={(e) => setEditHabitData({ ...editHabitData, name: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(habit.id); if (e.key === 'Escape') handleCancelEdit(); }}
              autoFocus
            />
            <select
              className="habit-edit-select"
              value={editHabitData.category}
              onChange={(e) => setEditHabitData({ ...editHabitData, category: e.target.value })}
            >
              <option value="health">🏥 Health</option>
              <option value="fitness">💪 Fitness</option>
              <option value="mind">🧠 Mind</option>
              <option value="work">💼 Work</option>
            </select>
            <div className="habit-edit-actions">
              <button className="edit-save-btn" onClick={() => handleSaveEdit(habit.id)} aria-label="Save edit">
                <Save size={16} />
              </button>
              <button className="edit-cancel-btn" onClick={handleCancelEdit} aria-label="Cancel edit">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={habit.id}
        className={`habit-item ${habit.done ? "completed" : ""} ${poppingHabitId === habit.id ? "just-completed" : ""}`}
      >
        <div className="habit-left">
          <div
            className={`habit-checkbox ${habit.done ? "checked" : ""} ${poppingHabitId === habit.id ? "just-checked" : ""}`}
            onClick={(e) => handleToggleHabit(habit.id, e)}
            role="checkbox"
            aria-checked={habit.done}
          >
            {habit.done && <Check size={14} className="check-icon" />}
          </div>
          <div className="habit-info">
            <span className="habit-title-text">{habit.name}</span>
            <div className="habit-details-row">
              <span className={`habit-tag tag-${habit.category}`}>
                {habit.category}
              </span>
            </div>
          </div>
        </div>

        <div className="habit-right">
          <div className="habit-streak-badge">
            <Flame size={14} className="streak-flame" />
            <span>{habit.streak}d</span>
          </div>
          {showDelete && (
            <button
              className="delete-habit-btn"
              onClick={() => handleDeleteHabit(habit.id)}
              aria-label="Delete habit"
            >
              <Trash2 size={16} />
            </button>
          )}
          {showDelete && (
            <button
              className="edit-habit-btn"
              onClick={() => handleStartEdit(habit)}
              aria-label="Edit habit"
            >
              <Pencil size={16} />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Create customized habits
  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabit.name.trim()) {
      setHabitError("Habit name cannot be empty.");
      return;
    }
    setHabitError("");
    const newEntry = {
      id: Date.now(),
      name: newHabit.name.trim(),
      done: false,
      streak: 0,
      category: newHabit.category
    };
    const updated = [...habits, newEntry];
    saveHabits(updated);
    setNewHabit({ name: "", category: "health" });
  };

  // Delete habit
  const handleDeleteHabit = (id) => {
    const updated = habits.filter(h => h.id !== id);
    saveHabits(updated);
    if (editingHabitId === id) {
      setEditingHabitId(null);
    }
  };

  // Start editing a habit
  const handleStartEdit = (habit) => {
    setEditingHabitId(habit.id);
    setEditHabitData({ name: habit.name, category: habit.category });
  };

  // Save edited habit
  const handleSaveEdit = (id) => {
    if (!editHabitData.name.trim()) return;
    const updated = habits.map(h => {
      if (h.id === id) {
        return { ...h, name: editHabitData.name.trim(), category: editHabitData.category };
      }
      return h;
    });
    saveHabits(updated);
    setEditingHabitId(null);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingHabitId(null);
    setEditHabitData({ name: "", category: "health" });
  };

  // Update profile details inside DB
  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setSettingsStatus({ type: "", message: "" });

    if (!settingsData.userName || !settingsData.email || !settingsData.age) {
      setSettingsStatus({ type: "error", message: "All fields except password are required." });
      return;
    }

    setSettingsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        "http://localhost:3000/User/profile",
        settingsData,
        {
          headers: {
            authorization: token,
          },
        }
      );

      // Update user details state
      setUser(response.data.user);
      setSettingsData(prev => ({ ...prev, password: "" }));
      setSettingsStatus({ type: "success", message: "Profile details updated successfully!" });
    } catch (err) {
      console.error(err);
      setSettingsStatus({ 
        type: "error", 
        message: err.response?.data?.message || "Failed to update profile settings details." 
      });
    } finally {
      setSettingsSubmitting(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Metrics calculators
  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => h.done).length;
  const progressPercent = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
  const highestStreak = totalHabits > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0;
  const userInitial = user.userName ? user.userName.charAt(0) : (user.email ? user.email.charAt(0) : "U");

  // Render sub-views depending on activeTab
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="tab-content-pane">
            {/* Top Center Greeting Message */}
            <div className="dashboard-greeting-wrapper">
              <h1 className="greeting-text">
                Hey, <span className="gradient-text">{user.userName || "User"}</span>!
                <span className="wave-emoji" role="img" aria-label="waving hand">👋</span>
              </h1>
              <p className="dashboard-motivation-text">{getDashboardMotivation()}</p>
              <div className="greeting-time-stamp">
                <Clock size={16} />
                <span>{currentTime}</span>
              </div>
            </div>

            {/* Existing Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Daily Progress Tracker */}
              <div className="glass-card progress-card">
                <div className="progress-info">
                  <div>
                    <h2 style={{ fontSize: '1.25rem' }}>Daily Progress</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tick off tasks to secure daily streaks</p>
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>
                    {completedHabits}/{totalHabits} Completed
                  </span>
                </div>
                <div className="progress-bar-wrapper">
                  <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              {/* Quick Today Checklist */}
              <div className="glass-card habits-card">
                <div className="habits-card-header">
                  <div>
                    <h2 style={{ fontSize: '1.3rem' }}>Today's Tasks</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Complete your active routines</p>
                  </div>
                </div>

                <div className="habit-list-container">
                  {habits.length === 0 ? (
                    <div className="no-habits-state">
                      <p>No habits active. Add some habits in the 'Habits' section!</p>
                    </div>
                  ) : (
                    habits.map((habit) => renderHabitItem(habit))
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "habits":
        return (
          <div className="tab-content-pane">
            <div className="glass-card habits-card">
               

              {/* Create Custom Habit — at top */}
              <div className="add-habit-box add-habit-box-top">
                <h3 style={{ fontSize: '1.1rem', textAlign: 'left', marginBottom: '0.25rem' }}>Create Custom Habit</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'left', marginBottom: '1rem' }}>Enter habit title and categorize to start tracking</p>
                {habitError && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'left', marginBottom: '0.5rem' }}>{habitError}</p>}
                
                <form onSubmit={handleAddHabit} className="add-habit-fields">
                  <input
                    type="text"
                    placeholder="E.g., Read a book, Drink water, Gym..."
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  />
                  <select
                    value={newHabit.category}
                    onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
                    style={{ maxWidth: '150px' }}
                  >
                    <option value="health">🏥 Health</option>
                    <option value="fitness">💪 Fitness</option>
                    <option value="mind">🧠 Mind</option>
                    <option value="work">💼 Work</option>
                  </select>
                  <button type="submit" className="btn btn-primary">
                    <Plus size={16} />
                    <span>Create</span>
                  </button>
                </form>
              </div>

              <div className="habits-card-header">
              <div>
                  <h2 style={{ fontSize: '1.4rem' }}>Manage Routines</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Create, track, or delete your custom habits</p>
                </div>
              </div>

              {/* Habits list */}
              <div className="habit-list-container">
                {habits.length === 0 ? (
                  <div className="no-habits-state">
                    <p>No habits configured. Create your first habit above.</p>
                  </div>
                ) : (
                  habits.map((habit) => renderHabitItem(habit, true))
                )}
              </div>
            </div>
          </div>
        );

      case "weekly":
        // Mock dates and completion records for the weekly chart
        const getMockWeekData = () => {
          const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const data = [];
          const now = new Date();
          
          for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const isToday = i === 0;
            const completion = isToday 
              ? progressPercent 
              : Math.min(100, Math.max(0, Math.round((Math.sin(d.getDate()) * 25) + 70))); // Semi-randomized mock percentage
              
            data.push({
              dayName: days[d.getDay()],
              dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              isToday,
              completion
            });
          }
          return data;
        };

        const weekData = getMockWeekData();
        const averageWeeklyCompletion = Math.round(weekData.reduce((acc, curr) => acc + curr.completion, 0) / 7);

        // Generate dynamic weekly summary paragraph (80-120 words)
        const generateWeeklySummary = () => {
          const perfectDays = weekData.filter(d => d.completion === 100).length;
          const bestDay = weekData.reduce((a, b) => a.completion >= b.completion ? a : b);
          const worstDay = weekData.reduce((a, b) => a.completion <= b.completion ? a : b);
          const aboveFifty = weekData.filter(d => d.completion >= 50).length;
          const totalActive = totalHabits;
          const topStreak = highestStreak;

          let summary = `Over the past seven days, you maintained an average completion rate of ${averageWeeklyCompletion}% across ${totalActive} active habit${totalActive !== 1 ? 's' : ''}. `;
          summary += `Your strongest performance was on ${bestDay.dayName} with ${bestDay.completion}% completion, `;
          summary += `while ${worstDay.dayName} was your lowest at ${worstDay.completion}%. `;
          summary += `You achieved ${perfectDays} perfect day${perfectDays !== 1 ? 's' : ''} this week and stayed above 50% on ${aboveFifty} out of 7 days. `;
          summary += `Your current top streak stands at ${topStreak} day${topStreak !== 1 ? 's' : ''}. `;

          if (averageWeeklyCompletion >= 80) {
            summary += `Outstanding consistency — you are building powerful routines that will serve you well long-term. Keep pushing for those perfect days!`;
          } else if (averageWeeklyCompletion >= 50) {
            summary += `Solid effort this week with room to grow. Focus on completing your remaining habits during the afternoon to boost your daily scores even higher.`;
          } else {
            summary += `This week had its challenges, but every small step counts. Try starting each morning with your easiest habit to build momentum throughout the day.`;
          }

          return summary;
        };

        const weeklySummaryText = generateWeeklySummary();

        return (
          <div className="tab-content-pane">
            <div className="glass-card habits-card">
              <div className="habits-card-header">
                <div>
                  <h2 style={{ fontSize: '1.4rem' }}>Weekly Progress Report</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Completion rates for the last 7 days</p>
                </div>
              </div>

              {/* Progress columns grid */}
              <div className="weekly-report-grid">
                {weekData.map((day, index) => {
                  const strokeWidth = 5;
                  const radius = 24;
                  const circ = 2 * Math.PI * radius;
                  const strokeOffset = circ * (1 - day.completion / 100);

                  return (
                    <div 
                      key={index} 
                      className={`glass-card weekly-day-card ${day.isToday ? "active" : ""}`}
                      style={{ border: day.isToday ? '1px solid var(--accent-border)' : '1px solid var(--border)' }}
                    >
                      <span className="weekly-day-name" style={{ color: day.isToday ? 'var(--primary)' : 'inherit' }}>
                        {day.dayName.substring(0, 3)}
                      </span>
                      <span className="weekly-day-date">{day.dateStr}</span>
                      
                      <div className="weekly-progress-circle">
                        <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
                          <circle
                            stroke="var(--border)"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            r={radius}
                            cx="30"
                            cy="30"
                          />
                          <circle
                            stroke={day.completion >= 80 ? "var(--success)" : "var(--primary)"}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${circ}`}
                            strokeDashoffset={`${strokeOffset}`}
                            strokeLinecap="round"
                            fill="transparent"
                            r={radius}
                            cx="30"
                            cy="30"
                          />
                        </svg>
                        <span className="weekly-progress-percentage">{day.completion}%</span>
                      </div>
                      <span className="weekly-day-stats">
                        {day.completion === 100 ? "Perfect" : (day.completion >= 50 ? "Solid" : "Pending")}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Summary card block */}
              <div className="weekly-summary-row">
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)' }}>Weekly Summary</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Average completions and goal scores</p>
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {averageWeeklyCompletion}%
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Avg Completion
                    </p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>
                      {weekData.filter(d => d.completion === 100).length}/7
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Perfect Days
                    </p>
                  </div>
                </div>
              </div>

              {/* Weekly Summary Paragraph */}
              <div className="weekly-summary-paragraph-wrapper">
                <p className="weekly-summary-paragraph">{weeklySummaryText}</p>
              </div>
            </div>
          </div>
        );

      case "insights":
        // Generates motivation prompts
        const getMotivationMessage = () => {
          if (totalHabits === 0) {
            return "Set up your routines in the 'Habits' section so our insight compiler can build performance cards for you!";
          }
          if (progressPercent === 100) {
            return "Phenomenal effort today! You checked off every single habit. Keep this streak hot to secure new consistency levels!";
          }
          if (progressPercent >= 50) {
            return "Great momentum! You are over halfway finished with today's habits. Complete the remaining items to hit a perfect daily score.";
          }
          return "Start checking today's routines. Even checking off one habit maintains consistent brain training and protects streaks.";
        };

        return (
          <div className="tab-content-pane insights-tab-pane">
            <div className="glass-card habits-card">
              <div className="habits-card-header">
                <div>
                  <h2 style={{ fontSize: '1.4rem' }}>Habit Insights & Coaching</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Analytics compile based on check-in consistency</p>
                </div>
              </div>

              {/* Interactive insights cards grid */}
              <div className="insights-row">
                <div className="glass-card insight-item-card">
                  <div className="insight-icon-container" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <Flame size={24} fill="#f59e0b" />
                  </div>
                  <div className="insight-details" style={{ textAlign: 'left' }}>
                    <h4>Streak Highlights</h4>
                    <p>Your highest active streak is <strong>{highestStreak} days</strong>. Retain consistency to secure milestone trophies!</p>
                  </div>
                </div>

                <div className="glass-card insight-item-card">
                  <div className="insight-icon-container" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                    <TrendingUp size={24} />
                  </div>
                  <div className="insight-details" style={{ textAlign: 'left' }}>
                    <h4>Consistency index</h4>
                    <p>You have logged completions for <strong>{completedHabits} habits</strong> today. Keep checking items regularly.</p>
                  </div>
                </div>

                <div className="glass-card insight-item-card" style={{ gridColumn: 'span 2' }}>
                  <div className="insight-icon-container" style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--secondary)' }}>
                    <Award size={24} />
                  </div>
                  <div className="insight-details" style={{ textAlign: 'left' }}>
                    <h4>Routines Strength</h4>
                    <p>Building positive habits trains brain pathways. Your focus is primary in <strong>Health & Fitness</strong> categories, representing strong physical wellness goals.</p>
                  </div>
                </div>
              </div>

              {/* Coach message banner */}
              <div className="glass-card insights-coach-card">
                <div className="coach-header">
                  <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                  <span className="coach-badge">Motivate Coach</span>
                </div>
                <p className="coach-message">"{getMotivationMessage()}"</p>
              </div>
            </div>

            {/* AI Assistant */}
            <div className="glass-card gemini-assistant-card">
              <div className="gemini-header">
                <Sparkles size={22} className="gemini-logo-icon" />
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>HabitFlow AI Assistant</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ask questions, get suggestions, and stay motivated</p>
                </div>
              </div>

              <div className="gemini-suggestions">
                {aiSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    className="gemini-suggest-btn"
                    onClick={() => handleAiSend(suggestion)}
                    disabled={aiLoading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <div className="gemini-chat-history" ref={aiChatRef}>
                {aiMessages.map((msg, idx) => (
                  <div key={idx} className={`gemini-msg ${msg.role}`}>
                    <div className={`gemini-avatar ${msg.role === 'user' ? 'user' : ''}`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className="gemini-msg-bubble">{msg.text}</div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="gemini-msg ai">
                    <div className="gemini-avatar"><Bot size={16} /></div>
                    <div className="gemini-shimmer">
                      <Loader2 size={14} className="spinner" />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              <form
                className="gemini-input-form"
                onSubmit={(e) => { e.preventDefault(); handleAiSend(); }}
              >
                <div className="gemini-input-wrapper">
                  <input
                    type="text"
                    className="gemini-input-field"
                    placeholder="Ask me anything about your habits..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    disabled={aiLoading}
                  />
                  <button type="submit" className="gemini-send-btn" disabled={aiLoading || !aiInput.trim()}>
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="tab-content-pane">
            <div className="glass-card habits-card" style={{ textCombineUpright: 'none' }}>
              <div className="settings-header">
                <div className="settings-avatar-wrap">
                  <div className="avatar-large">{userInitial}</div>
                </div>
                <div className="settings-user-info" style={{ textAlign: 'left' }}>
                  <h3>Profile</h3>
                  <p>Update account details stored inside the secure database</p>
                </div>
              </div>

              {/* Status alerts */}
              {settingsStatus.message && (
                <div className={`settings-alert ${settingsStatus.type}`}>
                  {settingsStatus.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span>{settingsStatus.message}</span>
                </div>
              )}

              {/* Settings Form */}
              <form onSubmit={handleSettingsUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="settings-form-grid">
                  {/* Full Name field */}
                  <div className="settings-form-group">
                    <label className="form-label" htmlFor="settings-name">Full Name</label>
                    <div className="input-wrapper">
                      <User size={18} className="input-icon" />
                      <input
                        id="settings-name"
                        type="text"
                        className="form-control"
                        placeholder="John Doe"
                        value={settingsData.userName}
                        onChange={(e) => setSettingsData({ ...settingsData, userName: e.target.value })}
                        disabled={settingsSubmitting}
                        required
                      />
                    </div>
                  </div>

                  {/* Age field */}
                  <div className="settings-form-group">
                    <label className="form-label" htmlFor="settings-age">Age</label>
                    <div className="input-wrapper">
                      <Calendar size={18} className="input-icon" />
                      <input
                        id="settings-age"
                        type="number"
                        className="form-control"
                        placeholder="Must be 18+"
                        value={settingsData.age}
                        onChange={(e) => setSettingsData({ ...settingsData, age: e.target.value })}
                        disabled={settingsSubmitting}
                        required
                      />
                    </div>
                  </div>

                  {/* Email address field */}
                  <div className="settings-form-group full-width">
                    <label className="form-label" htmlFor="settings-email">Email Address</label>
                    <div className="input-wrapper">
                      <Mail size={18} className="input-icon" />
                      <input
                        id="settings-email"
                        type="email"
                        className="form-control"
                        placeholder="name@example.com"
                        value={settingsData.email}
                        onChange={(e) => setSettingsData({ ...settingsData, email: e.target.value })}
                        disabled={settingsSubmitting}
                        required
                      />
                    </div>
                  </div>

                  {/* Password update field */}
                  <div className="settings-form-group full-width">
                    <label className="form-label" htmlFor="settings-password">New Password (leave empty to keep current)</label>
                    <div className="input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input
                        id="settings-password"
                        type="password"
                        className="form-control"
                        placeholder="Min 6 characters if changing"
                        value={settingsData.password}
                        onChange={(e) => setSettingsData({ ...settingsData, password: e.target.value })}
                        disabled={settingsSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={settingsSubmitting}
                    style={{ minWidth: '150px' }}
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
      <div className="profile-page">
        <Nav />
        <div className="loading-wrapper">
          <Loader2 size={40} className="spinner" style={{ color: 'var(--primary)' }} />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {renderPopBursts()}

      {/* Decorative Blobs */}
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <Nav />

      <div className="profile-container">
        <div className="profile-grid">
          
          {/* Left Sidebar Navigation Card */}
          <div className="profile-sidebar">
            <div className="glass-card sidebar-card">
              
              {/* Navigation Menu */}
              <ul className="sidebar-nav-list">
                <li 
                  className={`sidebar-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
                  onClick={() => { setActiveTab("dashboard"); setSettingsStatus({ type: "", message: "" }); }}
                >
                  <Grid className="sidebar-nav-icon" />
                  <span>Dashboard</span>
                </li>

                <li 
                  className={`sidebar-nav-item ${activeTab === "habits" ? "active" : ""}`}
                  onClick={() => { setActiveTab("habits"); setSettingsStatus({ type: "", message: "" }); }}
                >
                  <ListTodo className="sidebar-nav-icon" />
                  <span>Habits</span>
                </li>

                <li 
                  className={`sidebar-nav-item ${activeTab === "weekly" ? "active" : ""}`}
                  onClick={() => { setActiveTab("weekly"); setSettingsStatus({ type: "", message: "" }); }}
                >
                  <CalendarDays className="sidebar-nav-icon" />
                  <span>Weekly Report</span>
                </li>

                <li 
                  className={`sidebar-nav-item ${activeTab === "insights" ? "active" : ""}`}
                  onClick={() => { setActiveTab("insights"); setSettingsStatus({ type: "", message: "" }); }}
                >
                  <Brain className="sidebar-nav-icon" />
                  <span>Insights</span>
                </li>

                <li 
                  className={`sidebar-nav-item ${activeTab === "settings" ? "active" : ""}`}
                  onClick={() => { setActiveTab("settings"); setSettingsStatus({ type: "", message: "" }); }}
                >
                  <UserCog className="sidebar-nav-icon" />
                  <span>Settings</span>
                </li>
              </ul>

              {/* Sidebar Logout Action */}
              <button 
                className="btn btn-secondary nav-profile-btn" 
                onClick={handleLogout}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Right Pane Dynamic Viewports */}
          <div className="main-viewport-pane">
            {renderTabContent()}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;