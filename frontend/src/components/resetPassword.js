import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./resetPassword.css"; // Optional styling

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // Parse token and email from URL
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email');
  const token = queryParams.get('token');  // (Not used for now, but you can use in future)

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const API_URL = "http://3.142.171.217:5000";

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const res = await fetch(`${API_URL}/api/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      navigate("/"); // After successful reset, redirect to login page
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Your Password</h2>
      <form onSubmit={handleResetPassword}>
        <label>New Password</label>
        <input 
          type="password" 
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <label>Confirm New Password</label>
        <input 
          type="password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" className="reset-btn">Reset Password</button>
      </form>
    </div>
  );
}

export default ResetPassword;
