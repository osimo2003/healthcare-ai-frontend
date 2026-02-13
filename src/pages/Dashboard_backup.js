import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();

  const alertedAppointments = useRef(new Set());
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

  const medicalSound = new Audio("/medical-alert.mp3");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      fetchAppointments();
    }
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkReminders();
    }, 10000);

    return () => clearInterval(interval);
  }, [appointments]);

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://127.0.0.1:8000/appointments", {
      headers: { Authorization: `Bearer ${token}` }
    });

    setAppointments(res.data);
  };

  const createAppointment = async () => {
    const token = localStorage.getItem("token");

    await axios.post(
      "http://127.0.0.1:8000/appointments",
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

        medicalSound.play().catch(() => {
          console.log("Audio blocked by browser");
        });

        alert(`Reminder: ${appt.title} is happening now!`);
      }
    });
  };

  const sendMessage = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      "http://127.0.0.1:8000/chat",
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

  return (
    <div style={{
      fontSize: largeText ? "22px" : "16px",
      backgroundColor: highContrast ? "black" : "white",
      color: highContrast ? "white" : "black",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <h2>Healthcare Dashboard</h2>

      <button onClick={() => setLargeText(!largeText)}>Toggle Large Text</button>
      <button onClick={() => setHighContrast(!highContrast)}>Toggle High Contrast</button>

      <br /><br />
      <button onClick={handleLogout}>Logout</button>

      <hr />

      <h3>Ask a Healthcare Question</h3>
      <textarea rows="4" cols="50" value={message}
        onChange={(e) => setMessage(e.target.value)} />

      <br /><br />
      <button onClick={sendMessage}>Send</button>

      <hr />

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

      <h3>Appointment Reminder</h3>

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

      <hr />

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
