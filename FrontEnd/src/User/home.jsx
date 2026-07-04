import React, { useState } from 'react'
import Nav from '../components/Nav'
import { useNavigate } from 'react-router-dom'
import { 
  Flame, 
  Sparkles, 
  Check, 
  Calendar, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react'
import './home.css'

function Home() {
  const navigate = useNavigate()

  // State for the interactive demo widget
  const [demoHabits, setDemoHabits] = useState([
    { id: 1, name: 'Drink 3L of Water', done: true, streak: 8, category: 'health' },
    { id: 2, name: 'Read for 20 Minutes', done: false, streak: 14, category: 'mind' },
    { id: 3, name: 'Morning Stretch', done: false, streak: 5, category: 'fitness' },
    { id: 4, name: 'Write Code', done: true, streak: 21, category: 'work' },
  ])

  const toggleDemoHabit = (id) => {
    setDemoHabits(demoHabits.map(habit => {
      if (habit.id === id) {
        const newDone = !habit.done;
        return {
          ...habit,
          done: newDone,
          streak: newDone ? habit.streak + 1 : habit.streak - 1
        }
      }
      return habit;
    }))
  }

  // Calculate stats for the demo
  const completedCount = demoHabits.filter(h => h.done).length
  const totalCount = demoHabits.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  return (
    <div className="home-page">
      {/* Dynamic Blobs */}
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <Nav />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-badge">
            <Sparkles size={16} className="hero-badge-icon" />
            <span>Habit Tracking Redefined</span>
          </div>
          <h1 className="hero-title">
            Transform Your Life, <br />
            <span className="gradient-text">One Habit at a Time</span>
          </h1>
          <p className="hero-description">
            Build consistent routines, monitor daily progress, and stay motivated with interactive streaks and advanced completion metrics. Start your journey to self-improvement today.
          </p>
          <div className="hero-ctas">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Start Tracking Free
              <ArrowRight size={18} />
            </button>
            <a href="#live-demo" className="btn btn-secondary btn-lg">
              Try Demo
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="live-demo" className="demo-section">
        <div className="section-header">
          <h2 className="section-title">See It in Action</h2>
          <p className="section-subtitle">Interact with our demo widget below. Tick habits to update progress metrics and daily streaks instantly.</p>
        </div>

        <div className="demo-container">
          <div className="glass-card habit-demo-widget">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Today's Habits</h3>
                <span className="date-badge">Demo Mode</span>
              </div>
              <div className="progress-display">
                <div className="progress-text">
                  <span className="progress-number">{progressPercent}%</span>
                  <span className="progress-label">Done</span>
                </div>
                <svg className="progress-ring" width="60" height="60">
                  <circle
                    className="progress-ring-circle-bg"
                    stroke="var(--border)"
                    strokeWidth="5"
                    fill="transparent"
                    r="24"
                    cx="30"
                    cy="30"
                  />
                  <circle
                    className="progress-ring-circle"
                    stroke="var(--success)"
                    strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - progressPercent / 100)}`}
                    strokeLinecap="round"
                    fill="transparent"
                    r="24"
                    cx="30"
                    cy="30"
                  />
                </svg>
              </div>
            </div>

            <div className="demo-habit-list-container">
              {demoHabits.map((habit, index) => (
                <div 
                  key={habit.id} 
                  className={`demo-habit-item ${habit.done ? 'completed' : ''}`}
                  onClick={() => toggleDemoHabit(habit.id)}
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="demo-habit-left">
                    <div className={`demo-checkbox ${habit.done ? 'checked' : ''}`}>
                      {habit.done && <Check size={14} className="check-icon" />}
                    </div>
                    <div className="demo-habit-info">
                      <span className="demo-habit-title">{habit.name}</span>
                      <div className="demo-habit-details">
                        <span className={`demo-habit-tag tag-${habit.category}`}>
                          {habit.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="demo-habit-right">
                    <div className="demo-streak-badge">
                      <Flame size={14} className="streak-flame" />
                      <span>{habit.streak}d</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="widget-footer">
              <span className="widget-hint">👉 Click any habit to toggle completion state!</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Designed for Consistency</h2>
          <p className="section-subtitle">HabitFlow comes loaded with features to keep you accountable and consistent every single day.</p>
        </div>

        <div className="features-grid">
          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper primary-glow">
              <Flame className="feature-icon" />
            </div>
            <h3>Streak Tracking</h3>
            <p>Maintain daily streaks and stay motivated through continuous feedback. Watch your streak fire burn brighter every day!</p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper secondary-glow">
              <BarChart3 className="feature-icon" />
            </div>
            <h3>Rich Analytics</h3>
            <p>Understand your performance with visual charts. Monitor completion rates, streak trends, and task distributions.</p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper success-glow">
              <Calendar className="feature-icon" />
            </div>
            <h3>Flexible Routines</h3>
            <p>Configure daily, weekly, or specific custom day intervals to align tracking with your actual schedule and lifestyle.</p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper danger-glow">
              <ShieldCheck className="feature-icon" />
            </div>
            <h3>Secure & Responsive</h3>
            <p>Your habit logs are secured and responsive on any device—be it a tablet, mobile viewport, or large desktop monitor.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="cta-banner-section">
        <div className="glass-card cta-banner">
          <h2>Ready to Build a Better Version of Yourself?</h2>
          <p>Join thousands of users tracking habits, establishing routines, and hitting streaks. Free setup takes less than a minute.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
            Create Your Account Now
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} HabitFlow. Designed to build positive habits.</p>
      </footer>
    </div>
  )
}

export default Home
