import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();

  // ========================
  // STATE
  // ========================

  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState([]);
  const [confidence, setConfidence] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [appointmentTitle, setAppointmentTitle] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [recurring, setRecurring] = useState("none");

  const [showReminder, setShowReminder] = useState(false);
  const [currentReminder, setCurrentReminder] = useState(null);

  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const alertedAppointments = useRef(new Set());
  const audioRef = useRef(null);

  const API = "https://healthcare-ai-backend-re4u.onrender.com";

  // ========================
  // AUDIO INIT
  // ========================

  useEffect(() => {
    audioRef.current = new Audio("/medical-alert.mp3");

    const unlockAudio = () => {
      audioRef.current.play().then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }).catch(() => {});
    };

    window.addEventListener("click", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("click", unlockAudio);
    };
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  // ========================
  // AUTH CHECK
  // ========================

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
    else fetchAppointments();
  }, [navigate]);

  // ========================
  // REMINDER CHECK
  // ========================

  const checkReminders = () => {
    const now = new Date();

    appointments.forEach((appt) => {
      const apptTime = new Date(appt.appointment_time);
      const diff = apptTime - now;

      if (
        Math.abs(diff) < 120000 &&
        !alertedAppointments.current.has(appt.id)
      ) {
        alertedAppointments.current.add(appt.id);
        setCurrentReminder(appt);
        setShowReminder(true);
        playSound();
      }
    });
  };

  useEffect(() => {
    const interval = setInterval(checkReminders, 10000);
    return () => clearInterval(interval);
  }, [appointments]);

  // ========================
  // API CALLS
  // ========================

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(`${API}/appointments`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setAppointments(res.data);
  };

  const createAppointment = async () => {
    const token = localStorage.getItem("token");

    await axios.post(
      `${API}/appointments`,
      {
        title: appointmentTitle,
        appointment_time: appointmentTime,
        recurring
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setAppointmentTitle("");
    setAppointmentTime("");
    fetchAppointments();
  };

  const deleteAppointment = async (id) => {
    const token = localStorage.getItem("token");

    await axios.delete(`${API}/appointments/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    fetchAppointments();
  };

  const sendMessage = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      `${API}/chat`,
      { message },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setResponse(res.data.response);
    setSources(res.data.sources || []);
    setConfidence(res.data.confidence || "");
    setIsEmergency(res.data.emergency || false);
  };

  const snoozeReminder = () => {
    if (!currentReminder) return;

    const newTime = new Date();
    newTime.setMinutes(newTime.getMinutes() + 5);

    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === currentReminder.id
          ? { ...appt, appointment_time: newTime.toISOString() }
          : appt
      )
    );

    setShowReminder(false);
  };

  const stopReminder = () => {
    setShowReminder(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // ========================
  // STYLES
  // ========================

  const cardStyle = {
    backgroundColor: highContrast ? "#222" : "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginBottom: "20px"
  };

  const modalOverlay = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  };

  const modalBox = {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    textAlign: "center",
    width: "90%",
    maxWidth: "350px"
  };

  // ========================
  // UI
  // ========================

  return (
    <div
      style={{
        fontSize: largeText ? "22px" : "16px",
        backgroundColor: highContrast ? "#111" : "#eef2f7",
        color: highContrast ? "white" : "#222",
        minHeight: "100vh",
        padding: "20px"
      }}
    >
      <h1>Accessible Healthcare Assistant</h1>

      <button onClick={() => setLargeText(!largeText)}>Large Text</button>
      <button onClick={() => setHighContrast(!highContrast)}>High Contrast</button>
      <button onClick={handleLogout} style={{ marginLeft: "10px" }}>Logout</button>

      {/* QUICK ACTIONS */}
      <div style={cardStyle}>
        <h2>Quick Healthcare Options</h2>
        <button onClick={() => setMessage("I need help booking a GP appointment")} style={{ margin: "5px" }}>📅 Book GP</button>
        <button onClick={() => setMessage("What should I do if I have chest pain?")} style={{ margin: "5px" }}>🚨 Emergency</button>
        <button onClick={() => setMessage("Explain high blood pressure in simple terms")} style={{ margin: "5px" }}>🩺 Condition</button>
      </div>

      {/* CHAT */}
      <div style={cardStyle}>
        <h2>Ask a Question</h2>
        <textarea
          aria-label="Healthcare question input"
          rows="4"
          style={{ width: "100%" }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <br /><br />
        <button onClick={sendMessage}>Send</button>

        {isEmergency && (
          <div style={{ color: "red", fontWeight: "bold", marginTop: "10px" }}>
            ⚠️ Emergency Warning
          </div>
        )}

        <p>{response}</p>
        {confidence && <p><strong>Confidence:</strong> {confidence}</p>}

        {sources.length > 0 && (
          <div>
            <h3>Sources</h3>
            {sources.map((s, i) => (
              <details key={i}>
                <summary><strong>{s.title}</strong></summary>
                <p>{s.content}</p>
              </details>
            ))}
          </div>
        )}
      </div>

      {/* APPOINTMENTS */}
      <div style={cardStyle}>
        <h2>Appointment Reminder</h2>

        <input
          type="text"
          placeholder="Appointment Title"
          value={appointmentTitle}
          onChange={(e) => setAppointmentTitle(e.target.value)}
        />

        <br /><br />

        <input
          type="datetime-local"
          value={appointmentTime}
          onChange={(e) => setAppointmentTime(e.target.value)}
        />

        <br /><br />

        <select value={recurring} onChange={(e) => setRecurring(e.target.value)}>
          <option value="none">No Repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>

        <br /><br />

        <button onClick={createAppointment}>Save Appointment</button>

        <ul>
          {appointments.map((appt) => (
            <li key={appt.id} style={{ marginBottom: "10px" }}>
              <strong>{appt.title}</strong> —
              {new Date(appt.appointment_time).toLocaleString()}
              ({appt.recurring})
              <button
                onClick={() => deleteAppointment(appt.id)}
                style={{ marginLeft: "10px", backgroundColor: "#d9534f", color: "white" }}
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* MODAL REMINDER */}
      {showReminder && currentReminder && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2>⏰ Appointment Reminder</h2>
            <p><strong>{currentReminder.title}</strong></p>
            <p>{new Date(currentReminder.appointment_time).toLocaleString()}</p>

            <button onClick={snoozeReminder}>Snooze 5 min</button>
            <button onClick={stopReminder} style={{ marginLeft: "10px" }}>Stop</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
