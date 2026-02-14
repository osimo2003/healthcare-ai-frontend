import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("https://healthcare-ai-backend-re4u.onrender.com/login", {
        username,
        password,
      });

      const token = response.data.access_token;

      // Store token
      localStorage.setItem("token", token);

      alert("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      alert("Login failed: " + (error.response?.data?.detail || "Unknown error"));
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <label>Username:</label>
      <br />
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br /><br />

      <label>Password:</label>
      <br />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={handleLogin}>Login</button>

      <p>
        Don’t have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;
