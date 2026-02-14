import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post("https://healthcare-ai-backend-re4u.onrender.com/register", {
        username,
        password,
      });

      alert("Registration successful!");
      navigate("/");
    } catch (error) {
      console.log(error);
      alert("Registration failed: " + (error.response?.data?.detail || "Unknown error"));
    }
  };

  return (
    <div>
      <h2>Register</h2>

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

      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;
