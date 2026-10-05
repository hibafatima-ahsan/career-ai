import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000/api";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [internships, setInternships] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });

  const [internship, setInternship] = useState({
    title: "",
    description: "",
    skills: "",
    location: "",
    stipend: "",
    duration: ""
  });

  const [message, setMessage] = useState("");
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [careerQuestion, setCareerQuestion] = useState("");
  const [careerResult, setCareerResult] = useState(null);
  useEffect(() => {
    if (page === "dashboard") {
      loadInternships();
    }
  }, [page]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleInternshipChange = (e) => {
    setInternship({
      ...internship,
      [e.target.name]: e.target.value
    });
  };

  const register = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API}/auth/register`,
        form
      );

      setMessage(response.data.message);
      setPage("login");
    } catch (error) {
      setMessage(error.response?.data?.error || "Registration failed");
    }
  };

  const login = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API}/auth/login`,
        {
          email: form.email,
          password: form.password
        }
      );

      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      setPage("dashboard");
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.error || "Login failed");
    }
  };

  const loadInternships = async () => {
    try {
      const response = await axios.get(
        `${API}/internships/`
      );

      setInternships(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const addInternship = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API}/internships/`,
        internship,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage("Internship added successfully!");

      setInternship({
        title: "",
        description: "",
        skills: "",
        location: "",
        stipend: "",
        duration: ""
      });

      loadInternships();
    } catch (error) {
      setMessage(
        error.response?.data?.error || "Could not add internship"
      );
    }
  };
const askCareerAI = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${API}/ai/ask`,
      {
        question: question
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setAiAnswer(response.data.answer);
  } catch (error) {
    setAiAnswer(
      error.response?.data?.error ||
      "AI assistant could not respond."
    );
  }
  const getCareerRecommendation = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${API}/ai/career-recommendation`,
      {
        question: careerQuestion
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setCareerResult(response.data);
  } catch (error) {
    console.error(error);
    setCareerResult({
      error:
        error.response?.data?.error ||
        "Could not generate career recommendation."
    });
  }
};
};
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setPage("login");
  };

  if (page === "login") {
    return (
      <div className="container">
        <h1>CareerAI</h1>
        <p>Smart Internship & Career Assistant</p>

        <h2>Login</h2>

        <form onSubmit={login}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit">Login</button>
        </form>

        <p>{message}</p>

        <button onClick={() => setPage("register")}>
          Create Account
        </button>
      </div>
    );
  }

  if (page === "register") {
    return (
      <div className="container">
        <h1>CareerAI</h1>

        <h2>Create Account</h2>

        <form onSubmit={register}>
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="student">Student</option>
            <option value="company">Company</option>
          </select>

          <button type="submit">Register</button>
        </form>

        <p>{message}</p>

        <button onClick={() => setPage("login")}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header>
        <h1>CareerAI Dashboard</h1>

        <div>
          <span>
            Welcome, {user?.name} ({user?.role})
          </span>

          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <hr />

      <h2>Available Internships</h2>

      {internships.length === 0 ? (
        <p>No internships available yet.</p>
      ) : (
        internships.map((item) => (
          <div className="card" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p><b>Skills:</b> {item.skills}</p>
            <p><b>Location:</b> {item.location}</p>
            <p><b>Stipend:</b> {item.stipend}</p>
            <p><b>Duration:</b> {item.duration}</p>
          </div>
        ))
      )}

      {user?.role === "company" && (
        <>
          <hr />

          <h2>Add Internship</h2>

          <form onSubmit={addInternship}>
            <input
              name="title"
              placeholder="Internship Title"
              value={internship.title}
              onChange={handleInternshipChange}
              required
            />

            <textarea
              name="description"
              placeholder="Description"
              value={internship.description}
              onChange={handleInternshipChange}
            />

            <input
              name="skills"
              placeholder="Skills"
              value={internship.skills}
              onChange={handleInternshipChange}
            />

            <input
              name="location"
              placeholder="Location"
              value={internship.location}
              onChange={handleInternshipChange}
            />

            <input
              name="stipend"
              placeholder="Stipend"
              value={internship.stipend}
              onChange={handleInternshipChange}
            />

            <input
              name="duration"
              placeholder="Duration"
              value={internship.duration}
              onChange={handleInternshipChange}
            />

            <button type="submit">
              Add Internship
            </button>
          </form>

          <p>{message}</p>
        </>
      )}

      {user?.role === "student" && (
        <>
          <hr />

          <h2>🤖 AI Career Assistant</h2>

          <p>
            Get personalized internship and career recommendations
            based on your skills and profile.
          </p>

           <div>
  <textarea
    placeholder="Ask CareerAI anything..."
    value={question}
    onChange={(e) => setQuestion(e.target.value)}
    rows="4"
    cols="50"
  />

  <br />

  <button onClick={askCareerAI}>
    Ask CareerAI
  </button>

  {aiAnswer && (
    <div className="card">
      <h3>CareerAI Response</h3>
      <p>{aiAnswer}</p>
    </div>
  )}
</div>
        </>
      )}
    </div>
  );
}

export default App;