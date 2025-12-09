import React, { useState } from "react";
import "./login.css";

function Login() {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // State for login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // State for sign up
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");

  // State for forgot password
  const [forgotEmail, setForgotEmail] = useState("");

  const API_URL = "http://3.142.171.217:5000";  // update to your backend URL in production

  //------------------- LOGIN --------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword })
    });

    const data = await res.json();
    if (data.message === "Login successful") {
      
      localStorage.setItem("cineGenomeUser", JSON.stringify(data));  // Save user info locally
      // Redirect to browse page
      window.location.href = "/browse";
    } else {
      alert(data.message);
    }
    localStorage.setItem("cineGenomeUser", JSON.stringify({
      userId: data.userId,
      name: data.name,
      email: data.email
  }));
  };

  //------------------- SIGN UP --------------------
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (signUpPassword !== signUpConfirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const res = await fetch(`${API_URL}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword
      })
    });

    const data = await res.json();
    if (data.message === "User registered successfully!") {
      alert("Sign up successful! Please login now.");
      setShowSignUp(false);  // Close modal
      setLoginEmail(signUpEmail);  // Pre-fill login email
    } else {
      alert(data.message);
    }
  };


  //------------------- FORGOT PASSWORD --------------------
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail })
    });

    const data = await res.json();
    alert(data.message);
    if (data.success) setShowForgotPassword(false);
  };

  return (
    <div className="login-container">
      <nav className="navbar">
        <h2 className="logo">CineGenome</h2>
        <div className="nav-links">
          <a href="#" onClick={() => setShowSignUp(true)}>Sign Up</a>
          <a href="#" className="active">Log In</a>
        </div>
      </nav>

      <div className="login-box">
        <h2>Explore CineGenome, find your perfect movie match!</h2>
        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input 
            type="email" 
            value={loginEmail} 
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="Enter your email" 
            required 
          />

          <label>Password</label>
          <input 
            type="password" 
            value={loginPassword} 
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="Enter your password" 
            required 
          />

          <button type="submit" className="login-btn">Log In</button>
        </form>

        <a href="#" className="forgot-password" onClick={() => setShowForgotPassword(true)}>Forgot password?</a>

        <p>Don't have a CineGenome account? <a href="#" onClick={() => setShowSignUp(true)}>Sign Up</a></p>
      </div>

      {/* ---------------- Sign Up Modal ---------------- */}
      {showSignUp && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowSignUp(false)}>&times;</span>
            <h2>Sign Up</h2>
            <form onSubmit={handleSignUp}>
              <label>Name</label>
              <input 
                type="text" 
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                placeholder="Enter your name" 
                required 
              />
              <label>Email</label>
              <input 
                type="email" 
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder="Enter your email" 
                required 
              />
              <label>Password</label>
              <input 
                type="password" 
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                placeholder="Enter your password" 
                required 
              />
              <label>Confirm Password</label>
              <input 
                type="password" 
                value={signUpConfirmPassword}
                onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                placeholder="Confirm your password" 
                required 
              />

              <button type="submit" className="modal-btn">Sign Up</button>
              <button type="button" className="modal-btn1" onClick={() => setShowSignUp(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- Forgot Password Modal ---------------- */}
      {showForgotPassword && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowForgotPassword(false)}>&times;</span>
            <h2>Reset Password</h2>
            <p>Enter your email to receive a password reset link.</p>
            <form onSubmit={handleForgotPassword}>
              <label>Email</label>
              <input 
                type="email" 
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter your email" 
                required 
              />
              <button type="submit" className="modal-btn">Send Reset Link</button>
              <button type="button" className="modal-btn1" onClick={() => setShowForgotPassword(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
