import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();

  // =========================
  // STATES
  // =========================

  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState([]);
  const [confidence, setConfidence] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);

  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const [appointmentTitle, setAppointmentTitle] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [recurring, setRecurring] = useState("none");
  const [appointments, setAppointments] = useState([]);

  const alertedAppointments = useRef(new Set());
  const audioRef = useRef(null);

  // =========================
  // AUDIO INITIALIZATION
  // =========================

  useEffect(() => {
    audioRef.current = new Audio("/medical-alert.mp3");

    // Unlock audio on first click
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

  const playMedicalBeep = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.log("Audio blocked:", err);
      });
    }
  };

  // =========================
  // PROTECTION & LOAD
  // =========================

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      fetchAppointments();
    }
  }, [navigate]);

  // =========================
  // REMINDER CHECK
  // =========================

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

        playMedicalBeep();
        alert(`Reminder: ${appt.title} is happening now!`);
      }
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      checkReminders();
    }, 10000);

    return () => clearInterval(interval);
  }, [appointments]);

  // =========================
  // API FUNCTIONS
  // =========================

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "https://your-backend-url.onrender.com/appointments",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setAppointments(res.data);
  };

  const createAppointment = async () => {
    const token = localStorage.getItem("token");

    await axios.post(
      "https://your-backend-url.onrender.com/appointments",
      {
        title: appointmentTitle,
        appointment_time: appointmentTime,
        recurring: recurring
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    alert("Appointment saved!");
    setAppointmentTitle("");
    setAppointmentTime("");
    fetchAppointments();
  };

  const sendMessage = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      "https://your-backend-url.onrender.com/chat",
      { message },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setResponse(res.data.response);
    setSources(res.data.sources || []);
    setConfidence(res.data.confidence || "");
    setIsEmergency(res.data.emergency || false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // =========================
  // UI
  // =========================

  return (
    <div
      style={{
        fontSize: largeText ? "22px" : "16px",
        backgroundColor: highContrast ? "#111" : "#f5f5f5",
        color: highContrast ? "white" : "#222",
        minHeight: "100vh",
        padding: "30px",
        fontFamily: "Arial"
      }}
    >
      <h1>Osimo Healthcare Assistant</h1>

      <button onClick={() => setLargeText(!largeText)}>
        Toggle Large Text
      </button>

      <button onClick={() => setHighContrast(!highContrast)}>
        Toggle High Contrast
      </button>

      <button onClick={handleLogout} style={{ marginLeft: "10px" }}>
        Logout
      </button>

      <hr />

      {/* QUICK ACCESS BUTTONS */}
      <h2>Quick Healthcare Options</h2>

      <div style={{ display: "grid", gap: "15px", maxWidth: "500px" }}>
        <button onClick={() => setMessage("I want help booking a GP appointment")} style={{ padding: "15px", fontSize: "18px" }}>
          📅 Book GP Appointment
        </button>

        <button onClick={() => setMessage("What should I do if I have chest pain?")} style={{ padding: "15px", fontSize: "18px" }}>
          🚨 Emergency Guidance
        </button>

        <button onClick={() => setMessage("Explain high blood pressure in simple terms")} style={{ padding: "15px", fontSize: "18px" }}>
          🩺 Understand a Condition
        </button>

        <button onClick={() => setMessage("How do I use the NHS app?")} style={{ padding: "15px", fontSize: "18px" }}>
          📱 NHS App Help
        </button>
      </div>

      <hr />

      {/* CHAT AREA */}
      <h2>Ask a Question</h2>

      <textarea
        rows="4"
        style={{ width: "100%", padding: "10px" }}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <br /><br />
      <button onClick={sendMessage} style={{ padding: "10px 20px" }}>
        Send
      </button>

      <hr />

      {/* RESPONSE */}
      {isEmergency && (
        <div style={{ color: "red", fontWeight: "bold" }}>
          ⚠️ Emergency Warning: Seek immediate medical attention.
        </div>
      )}

      <p>{response}</p>

      {confidence && (
        <p><strong>Confidence:</strong> {confidence}</p>
      )}

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

      <hr />

      {/* APPOINTMENT SECTION */}
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

      <button onClick={createAppointment}>
        Save Appointment
      </button>

      <h3>Your Appointments</h3>

      <ul>
        {appointments.map((appt) => (
          <li key={appt.id}>
            <strong>{appt.title}</strong> —
            {new Date(appt.appointment_time).toLocaleString()}
            ({appt.recurring})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
