import React from "react";
import { useNavigate } from "react-router-dom";
import "./Frontpage.css";

function Frontpage() {
  const navigate = useNavigate();

  return (
    <div className="frontpage-container">

      <div className="frontpage-card">

        <h1 className="title">HABIT TRACKER</h1>

        <p className="subtitle">
          Choose how you want to continue
        </p>

        <div className="card-container">

          <div
            className="role-card"
            onClick={() => navigate("/home")}
          >
            <div className="icon">👤</div>

            <h2>USER</h2>

            <p>
              Track your habits, monitor progress,
              and achieve your goals.
            </p>
          </div>

          <div
            className="role-card"
            onClick={() => navigate("/adminHome")}
          >
            <div className="icon">🛡️</div>

            <h2>ADMIN</h2>

            <p>
              Manage users, monitor activity,
              and administer the application.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Frontpage;