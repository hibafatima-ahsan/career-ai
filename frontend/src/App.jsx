import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

const API = "https://hibafatima.pythonanywhere.com/api";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [internships, setInternships] = useState([]);

  const [internshipForm, setInternshipForm] = useState({
    title: "",
    description: "",
    skills: "",
    location: "",
    stipend: "",
    duration: "",
  });

  // ==========================================
  // AI CHAT
  // ==========================================

  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [currentConversationId, setCurrentConversationId] =
    useState(null);

  const [chatMessages, setChatMessages] = useState([]);

  // ==========================================
  // CAREER RECOMMENDATION
  // ==========================================

  const [careerQuestion, setCareerQuestion] = useState("");
  const [careerResult, setCareerResult] = useState(null);
  const [careerLoading, setCareerLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [adminStats, setAdminStats] = useState(null);

  // ==========================================
  // EMAIL VERIFICATION
  // ==========================================

  const currentPath = window.location.pathname;

  const verificationToken = new URLSearchParams(
    window.location.search
  ).get("token");

  const isVerificationPage =
    currentPath === "/verify-email" || Boolean(verificationToken);

  const [verificationMessage, setVerificationMessage] = useState(
    "Verifying your email..."
  );

  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const [verificationLoading, setVerificationLoading] = useState(
    isVerificationPage
  );

  useEffect(() => {
    if (!isVerificationPage) {
      return;
    }

    if (!verificationToken) {
      setVerificationLoading(false);
      setVerificationSuccess(false);
      setVerificationMessage(
        "Verification token is missing. Please use the verification link sent to your email."
      );
      return;
    }

    let cancelled = false;

    const verifyEmail = async () => {
      try {
        setVerificationLoading(true);
        setVerificationMessage("Verifying your email...");
        setVerificationSuccess(false);

        const verificationUrl =
          `${API}/auth/verify-email?token=${encodeURIComponent(
            verificationToken
          )}`;

        const response = await fetch(verificationUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setVerificationSuccess(false);
          setVerificationMessage(
            data.error || "Email verification failed."
          );
          return;
        }

        setVerificationSuccess(true);
        setVerificationMessage(
          data.message || "Email verified successfully."
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Email verification error:", error);

        setVerificationSuccess(false);
        setVerificationMessage(
          "Could not connect to the CareerAI server. Please try again."
        );
      } finally {
        if (!cancelled) {
          setVerificationLoading(false);
        }
      }
    };

    verifyEmail();

    return () => {
      cancelled = true;
    };
  }, [isVerificationPage, verificationToken]);

  // ==========================================
  // LOAD INTERNSHIPS
  // ==========================================

  const loadInternships = async () => {
    try {
      const response = await fetch(`${API}/internships/`);
      const data = await response.json();

      if (response.ok) {
        setInternships(data);
      }
    } catch (error) {
      console.error("Internship loading error:", error);
    }
  };

  // ==========================================
  // LOAD LATEST CHAT
  // ==========================================

  const loadLatestChat = async (authToken = token) => {
    if (!authToken) {
      return;
    }

    try {
      const conversationResponse = await fetch(
        `${API}/chat/conversations`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const conversations = await conversationResponse.json();

      if (!conversationResponse.ok) {
        console.error(
          "Could not load conversations:",
          conversations
        );
        return;
      }

      if (!conversations.length) {
        setCurrentConversationId(null);
        setChatMessages([]);
        return;
      }

      const latestConversation = conversations[0];

      setCurrentConversationId(latestConversation.id);

      const messagesResponse = await fetch(
        `${API}/chat/conversations/${latestConversation.id}/messages`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const messages = await messagesResponse.json();

      if (!messagesResponse.ok) {
        console.error(
          "Could not load chat messages:",
          messages
        );
        return;
      }

      setChatMessages(
        messages.map((item) => ({
          role: item.role,
          content: item.content,
        }))
      );
    } catch (error) {
      console.error("Chat loading error:", error);
    }
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const register = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Registration failed");
        return;
      }

      setMessage(
        "Account created successfully. Please check your email (including Spam) and verify your account before logging in."
      );

      setForm({
        name: "",
        email: "",
        password: "",
        role: "student",
      });

      setPage("login");
    } catch (error) {
      console.error(error);
      setMessage("Backend connection failed.");
    }
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);

      setToken(data.token);
      setUser(data.user);
      setPage("dashboard");

      setForm({
        name: "",
        email: "",
        password: "",
        role: "student",
      });

      loadInternships();

      // Load latest saved chat
      loadLatestChat(data.token);

      if (data.user.role === "admin") {
        loadAdminStats(data.token);
      }
    } catch (error) {
      console.error(error);
      setMessage("Backend connection failed.");
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
    setPage("login");

    setAiAnswer("");
    setAiQuestion("");

    setChatMessages([]);
    setCurrentConversationId(null);

    setCareerResult(null);
    setCareerQuestion("");
  };

  // ==========================================
  // ADD INTERNSHIP
  // ==========================================

  const addInternship = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/internships/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(internshipForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not create internship");
        return;
      }

      setMessage("Internship published successfully.");

      setInternshipForm({
        title: "",
        description: "",
        skills: "",
        location: "",
        stipend: "",
        duration: "",
      });

      loadInternships();
    } catch (error) {
      console.error(error);
      setMessage("Backend connection failed.");
    }
  };

  // ==========================================
  // DELETE INTERNSHIP
  // ==========================================

  const deleteInternship = async (id) => {
    try {
      const response = await fetch(`${API}/internships/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage("Internship removed.");
        loadInternships();
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not delete internship.");
    }
  };

  // ==========================================
  // AI ASSISTANT
  // ==========================================

  const askCareerAI = async () => {
    const question = aiQuestion.trim();

    if (!question || aiLoading) {
      return;
    }

    setAiLoading(true);

    // Immediately show user message
    setChatMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: question,
      },
    ]);

    setAiQuestion("");

    try {
      const response = await fetch(`${API}/ai/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question,
          conversation_id: currentConversationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "AI request failed.",
          },
        ]);

        return;
      }

      // Store conversation ID
      if (data.conversation_id) {
        setCurrentConversationId(data.conversation_id);
      }

      const answer =
        data.answer ||
        data.response ||
        "No answer received.";

      // Show AI response
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: answer,
        },
      ]);

      setAiAnswer(answer);
    } catch (error) {
      console.error("AI error:", error);

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Could not connect to CareerAI.",
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // ==========================================
  // CAREER RECOMMENDATION
  // ==========================================

  const getCareerRecommendation = async () => {
    if (!careerQuestion.trim()) {
      return;
    }

    setCareerLoading(true);
    setCareerResult(null);

    try {
      const response = await fetch(
        `${API}/ai/career-recommendation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question: careerQuestion,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Recommendation failed.");
        return;
      }

      setCareerResult(data);
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to CareerAI.");
    } finally {
      setCareerLoading(false);
    }
  };

  // ==========================================
  // ADMIN STATS
  // ==========================================

  const loadAdminStats = async (authToken = token) => {
    try {
      const response = await fetch(`${API}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setAdminStats(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ==========================================
  // LOAD DATA WHEN LOGGED IN
  // ==========================================

  useEffect(() => {
    if (token && !isVerificationPage) {
      loadInternships();
      loadLatestChat(token);
    }
  }, [token, isVerificationPage]);

  // ==========================================
  // EMAIL VERIFICATION SCREEN
  // ==========================================

  if (isVerificationPage) {
    return (
      <div className="auth-page">
        <div className="auth-glow glow-one"></div>
        <div className="auth-glow glow-two"></div>

        <div className="auth-brand">
          <div className="brand-symbol">✦</div>

          <span>
            Career<span>AI</span>
          </span>
        </div>

        <div className="auth-layout">
          <div className="auth-intro">
            <div className="mini-badge">
              <span className="pulse-dot"></span>
              EMAIL VERIFICATION
            </div>

            <h1>
              Verify your
              <br />
              <span>CareerAI account.</span>
            </h1>

            <p>
              Confirm your email address to activate your CareerAI
              account and access personalized career guidance.
            </p>

            <div className="intro-features">
              <div>
                <strong>01</strong>
                <span>Secure Account</span>
              </div>

              <div>
                <strong>02</strong>
                <span>Verified Email</span>
              </div>

              <div>
                <strong>03</strong>
                <span>Access CareerAI</span>
              </div>
            </div>
          </div>

          <div className="auth-card">
            <div className="auth-card-top">
              <div>
                <span className="eyebrow">
                  {verificationLoading
                    ? "VERIFYING ACCOUNT"
                    : verificationSuccess
                    ? "VERIFICATION COMPLETE"
                    : "VERIFICATION FAILED"}
                </span>

                <h2>
                  {verificationLoading
                    ? "Please wait..."
                    : verificationSuccess
                    ? "Email verified!"
                    : "Verification failed"}
                </h2>
              </div>

              <div className="auth-orb">
                {verificationLoading
                  ? "✦"
                  : verificationSuccess
                  ? "✓"
                  : "!"}
              </div>
            </div>

            <div className="message-box">
              {verificationMessage}
            </div>

            {verificationSuccess && (
              <button
                className="primary-button"
                type="button"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                Go to CareerAI <span>→</span>
              </button>
            )}

            {!verificationSuccess && !verificationLoading && (
              <button
                className="primary-button"
                type="button"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                Back to CareerAI <span>→</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTH SCREEN
  // ==========================================

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-glow glow-one"></div>
        <div className="auth-glow glow-two"></div>

        <div className="auth-brand">
          <div className="brand-symbol">✦</div>

          <span>
            Career<span>AI</span>
          </span>
        </div>

        <div className="auth-layout">
          <div className="auth-intro">
            <div className="mini-badge">
              <span className="pulse-dot"></span>
              AI-POWERED CAREER PLATFORM
            </div>

            <h1>
              Your career.
              <br />
              <span>Intelligently guided.</span>
            </h1>

            <p>
              Discover internships, understand your skills and build
              a smarter career path with your personal AI career
              assistant.
            </p>

            <div className="intro-features">
              <div>
                <strong>01</strong>
                <span>Smart Internship Discovery</span>
              </div>

              <div>
                <strong>02</strong>
                <span>AI Career Recommendations</span>
              </div>

              <div>
                <strong>03</strong>
                <span>Personalized Guidance</span>
              </div>
            </div>
          </div>

          <div className="auth-card">
            <div className="auth-card-top">
              <div>
                <span className="eyebrow">
                  {page === "login"
                    ? "WELCOME BACK"
                    : "GET STARTED"}
                </span>

                <h2>
                  {page === "login"
                    ? "Enter your career space"
                    : "Create your account"}
                </h2>
              </div>

              <div className="auth-orb">✦</div>
            </div>

            {message && (
              <div className="message-box">
                {message}
              </div>
            )}

            {page === "login" ? (
              <form onSubmit={login}>
                <label>Email</label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  required
                />

                <label>Password</label>

                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  required
                />

                <button
                  className="primary-button"
                  type="submit"
                >
                  Enter CareerAI <span>→</span>
                </button>

                <p className="switch-text">
                  Don't have an account?

                  <button
                    type="button"
                    onClick={() => {
                      setPage("register");
                      setMessage("");
                    }}
                  >
                    Create one
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={register}>
                <label>Full Name</label>

                <input
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  required
                />

                <label>Email</label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  required
                />

                <label>Password</label>

                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  required
                />

                <label>Account Type</label>

                <div className="role-selector">
                  <button
                    type="button"
                    className={
                      form.role === "student"
                        ? "role active"
                        : "role"
                    }
                    onClick={() =>
                      setForm({
                        ...form,
                        role: "student",
                      })
                    }
                  >
                    🎓 Student
                  </button>

                  <button
                    type="button"
                    className={
                      form.role === "company"
                        ? "role active"
                        : "role"
                    }
                    onClick={() =>
                      setForm({
                        ...form,
                        role: "company",
                      })
                    }
                  >
                    🏢 Company
                  </button>
                </div>

                <button
                  className="primary-button"
                  type="submit"
                >
                  Create Account <span>→</span>
                </button>

                <p className="switch-text">
                  Already have an account?

                  <button
                    type="button"
                    onClick={() => {
                      setPage("login");
                      setMessage("");
                    }}
                  >
                    Login
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <div className="app-shell">
      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="brand-symbol small">✦</div>

          <span>
            Career<span>AI</span>
          </span>
        </div>

        <div className="sidebar-profile">
          <div className="avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{user.name}</strong>
            <small>{user.role}</small>
          </div>
        </div>

        <nav>
          <button className="nav-item active">
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={loadInternships}
          >
            <span>◈</span>
            Internships
          </button>

          {user.role === "student" && (
            <button className="nav-item">
              <span>◎</span>
              My Career
            </button>
          )}

          {user.role === "company" && (
            <button className="nav-item">
              <span>＋</span>
              Post Internship
            </button>
          )}

          {user.role === "admin" && (
            <button
              className="nav-item"
              onClick={() => loadAdminStats()}
            >
              <span>▣</span>
              Admin
            </button>
          )}
        </nav>

        <div className="sidebar-bottom">

          <div className="ai-status">
            <span className="pulse-dot"></span>

            <div>
              <strong>AI Online</strong>
              <small>CareerAI model</small>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            ↪ Logout
          </button>

        </div>
      </aside>

      <main className="main-content">

        <header className="topbar">

          <div>
            <span className="eyebrow">
              CAREER COMMAND CENTER
            </span>

            <h1>
              Good to see you{" "}
              <span>
                {user.name?.split(" ")[0]}.
              </span>
            </h1>
          </div>

          <div className="topbar-right">

            <div className="online-indicator">
              <span></span>
              AI Ready
            </div>

            <div className="top-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>

          </div>
        </header>

        {message && (
          <div className="dashboard-message">
            {message}
          </div>
        )}

        {/* ==========================================
            HERO
        ========================================== */}

        <section className="dashboard-hero">

          <div className="hero-content">

            <div className="mini-badge">
              <span className="pulse-dot"></span>
              PERSONALIZED FOR YOU
            </div>

            <h2>
              Build the career
              <br />
              <span>you actually want.</span>
            </h2>

            <p>
              Explore opportunities, ask your AI assistant and
              discover the skills you should build next.
            </p>

            <div className="hero-actions">

              <button
                onClick={() =>
                  document
                    .getElementById("ai-section")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
                className="hero-button"
              >
                Talk to CareerAI →
              </button>

              <button
                onClick={() =>
                  document
                    .getElementById("internships")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
                className="hero-secondary"
              >
                Explore internships
              </button>

            </div>
          </div>

          <div className="hero-visual">

            <div className="ai-orbit orbit-one"></div>
            <div className="ai-orbit orbit-two"></div>

            <div className="ai-core">
              <span>✦</span>
              <small>AI</small>
            </div>

            <div className="floating-chip chip-one">
              <span>✦</span> Skills
            </div>

            <div className="floating-chip chip-two">
              <span>✓</span> Career Match
            </div>

          </div>

        </section>

        {/* ==========================================
            QUICK STATS
        ========================================== */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon purple">
              ◈
            </div>

            <div>
              <small>OPPORTUNITIES</small>
              <strong>{internships.length}</strong>
              <p>Available internships</p>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon green">
              ✦
            </div>

            <div>
              <small>AI STATUS</small>
              <strong>Ready</strong>
              <p>Career assistant online</p>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon purple">
              ◎
            </div>

            <div>
              <small>YOUR ROLE</small>

              <strong>
                {user.role.charAt(0).toUpperCase() +
                  user.role.slice(1)}
              </strong>

              <p>Active account</p>
            </div>

          </div>

        </section>

        {/* ==========================================
            STUDENT AI
        ========================================== */}

        {user.role === "student" && (
          <>

            <section
              id="ai-section"
              className="section-block"
            >

              <div className="section-heading">

                <div>

                  <span className="eyebrow">
                    YOUR AI CAREER ASSISTANT
                  </span>

                  <h2>
                    Ask anything about your career.
                  </h2>

                </div>

                <div className="section-number">
                  01
                </div>

              </div>

              <div className="ai-panel">

                {/* AI INFORMATION */}

                <div className="ai-panel-left">

                  <div className="large-ai-icon">
                    ✦
                  </div>

                  <h3>
                    Meet your
                    <br />
                    <span>career copilot.</span>
                  </h3>

                  <p>
                    Ask about technologies, projects,
                    internships, interview preparation or
                    career paths.
                  </p>

                  <div className="ai-tags">
                    <span>Career advice</span>
                    <span>Skills</span>
                    <span>Projects</span>
                  </div>

                </div>

                {/* AI CHAT */}

                <div className="ai-chat">

                  {chatMessages.length === 0 && (
                    <div className="chat-message ai">

                      <div className="chat-avatar">
                        ✦
                      </div>

                      <div>

                        <small>
                          CareerAI
                        </small>

                        <p>
                          Hi{" "}
                          {user.name?.split(" ")[0]}!
                          What would you like to work on
                          today?
                        </p>

                      </div>

                    </div>
                  )}

                  {chatMessages.map((chat, index) => (

                    <div
                      key={index}
                      className={`chat-message ${
                        chat.role === "user"
                          ? "user"
                          : "ai"
                      }`}
                    >

                      <div className="chat-avatar">

                        {chat.role === "user"
                          ? user.name
                              ?.charAt(0)
                              .toUpperCase()
                          : "✦"}

                      </div>

                      <div>

                        <small>
                          {chat.role === "user"
                            ? "You"
                            : "CareerAI"}
                        </small>

                         <div className="ai-response-content">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {chat.content}
  </ReactMarkdown>
</div>

                      </div>

                    </div>

                  ))}

                  <div className="ai-input-area">

                    <input
                      type="text"
                      placeholder="Ask your career question..."
                      value={aiQuestion}
                      onChange={(e) =>
                        setAiQuestion(e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          askCareerAI();
                        }
                      }}
                    />

                    <button
                      onClick={askCareerAI}
                      disabled={aiLoading}
                    >
                      {aiLoading ? "..." : "↑"}
                    </button>

                  </div>

                  {aiLoading && (
                    <div className="processing">

                      <span className="processing-dot"></span>

                      CareerAI is thinking...

                    </div>
                  )}

                </div>

              </div>

            </section>

            {/* ==========================================
                CAREER RECOMMENDATION
            ========================================== */}

            <section className="section-block">

              <div className="section-heading">

                <div>

                  <span className="eyebrow">
                    SMART CAREER PATH
                  </span>

                  <h2>
                    Discover what you should do next.
                  </h2>

                </div>

                <div className="section-number">
                  02
                </div>

              </div>

              <div className="recommendation-panel">

                <div className="recommendation-input">

                  <div className="recommendation-icon">
                    ◎
                  </div>

                  <div className="recommendation-copy">

                    <h3>
                      Tell CareerAI about your skills.
                    </h3>

                    <p>
                      Example: "I know Python, Flask,
                      React and SQL."
                    </p>

                  </div>

                  <textarea
                    placeholder="Describe your current skills, interests or career goal..."
                    value={careerQuestion}
                    onChange={(e) =>
                      setCareerQuestion(
                        e.target.value
                      )
                    }
                  />

                  <button
                    onClick={getCareerRecommendation}
                    disabled={careerLoading}
                    className="green-button"
                  >
                    {careerLoading
                      ? "Analyzing..."
                      : "Generate Career Path →"}
                  </button>

                </div>

                {careerResult && (

                  <div className="recommendation-result">

                    <div className="result-header">

                      <div>

                        <span className="eyebrow">
                          AI ANALYSIS COMPLETE
                        </span>

                        <h3>
                          Your recommended direction
                        </h3>

                      </div>

                      <div className="success-icon">
                        ✓
                      </div>

                    </div>

                    <div className="skills-result">

                      <span>
                        Detected Skills
                      </span>

                      <strong>
                        {careerResult.skills}
                      </strong>

                    </div>

                    <div className="recommendation-text">

                      <span>
                        CAREER RECOMMENDATION
                      </span>

                      <p>
                        {careerResult.recommendation}
                      </p>

                    </div>

                  </div>

                )}

              </div>

            </section>

          </>
        )}

        {/* ==========================================
            COMPANY
        ========================================== */}

        {user.role === "company" && (

          <section className="section-block">

            <div className="section-heading">

              <div>

                <span className="eyebrow">
                  COMPANY WORKSPACE
                </span>

                <h2>
                  Find your next intern.
                </h2>

              </div>

            </div>

            <div className="company-layout">

              <form
                className="internship-form"
                onSubmit={addInternship}
              >

                <h3>
                  Publish an internship
                </h3>

                <p>
                  Create an opportunity and connect with
                  talented students.
                </p>

                <input
                  placeholder="Internship title"
                  value={internshipForm.title}
                  onChange={(e) =>
                    setInternshipForm({
                      ...internshipForm,
                      title: e.target.value,
                    })
                  }
                  required
                />

                <textarea
                  placeholder="Description"
                  value={internshipForm.description}
                  onChange={(e) =>
                    setInternshipForm({
                      ...internshipForm,
                      description: e.target.value,
                    })
                  }
                />

                <input
                  placeholder="Required skills e.g. Python, React"
                  value={internshipForm.skills}
                  onChange={(e) =>
                    setInternshipForm({
                      ...internshipForm,
                      skills: e.target.value,
                    })
                  }
                />

                <div className="form-row">

                  <input
                    placeholder="Location"
                    value={internshipForm.location}
                    onChange={(e) =>
                      setInternshipForm({
                        ...internshipForm,
                        location: e.target.value,
                      })
                    }
                  />

                  <input
                    placeholder="Stipend"
                    value={internshipForm.stipend}
                    onChange={(e) =>
                      setInternshipForm({
                        ...internshipForm,
                        stipend: e.target.value,
                      })
                    }
                  />

                </div>

                <input
                  placeholder="Duration e.g. 3 months"
                  value={internshipForm.duration}
                  onChange={(e) =>
                    setInternshipForm({
                      ...internshipForm,
                      duration: e.target.value,
                    })
                  }
                />

                <button
                  className="green-button"
                  type="submit"
                >
                  Publish Internship →
                </button>

              </form>

            </div>

          </section>

        )}

        {/* ==========================================
            ADMIN
        ========================================== */}

        {user.role === "admin" && (

          <section className="section-block">

            <div className="section-heading">

              <div>

                <span className="eyebrow">
                  ADMIN CONTROL CENTER
                </span>

                <h2>
                  Platform overview.
                </h2>

              </div>

            </div>

            <div className="admin-grid">

              <div className="admin-stat">

                <span>USERS</span>

                <strong>
                  {adminStats?.total_users ?? "—"}
                </strong>

                <small>
                  Total registered users
                </small>

              </div>

              <div className="admin-stat">

                <span>STUDENTS</span>

                <strong>
                  {adminStats?.students ?? "—"}
                </strong>

                <small>
                  Student accounts
                </small>

              </div>

              <div className="admin-stat">

                <span>COMPANIES</span>

                <strong>
                  {adminStats?.companies ?? "—"}
                </strong>

                <small>
                  Company accounts
                </small>

              </div>

              <div className="admin-stat green-admin">

                <span>INTERNSHIPS</span>

                <strong>
                  {adminStats?.total_internships ??
                    internships.length}
                </strong>

                <small>
                  Published opportunities
                </small>

              </div>

            </div>

          </section>

        )}

        {/* ==========================================
            INTERNSHIPS
        ========================================== */}

        <section
          id="internships"
          className="section-block"
        >

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                OPPORTUNITY BOARD
              </span>

              <h2>
                Internships worth exploring.
              </h2>

            </div>

            <div className="section-number">
              03
            </div>

          </div>

          {internships.length === 0 ? (

            <div className="empty-state">

              <div>
                ◈
              </div>

              <h3>
                No internships yet
              </h3>

              <p>
                New opportunities will appear here when
                companies publish them.
              </p>

            </div>

          ) : (

            <div className="internship-grid">

              {internships.map((internship) => (

                <div
                  className="internship-card"
                  key={internship.id}
                >

                  <div className="card-top">

                    <div className="company-mark">

                      {internship.title
                        ?.charAt(0)
                        .toUpperCase() || "I"}

                    </div>

                    <span className="open-badge">
                      OPEN
                    </span>

                  </div>

                  <h3>
                    {internship.title}
                  </h3>

                  <p className="internship-description">
                    {internship.description ||
                      "Explore this exciting internship opportunity."}
                  </p>

                  <div className="skill-tags">

                    {(internship.skills || "General")
                      .split(",")
                      .slice(0, 4)
                      .map((skill, index) => (

                        <span key={index}>
                          {skill.trim()}
                        </span>

                      ))}

                  </div>

                  <div className="internship-meta">

                    <span>
                      ⌖{" "}
                      {internship.location ||
                        "Remote"}
                    </span>

                    <span>
                      ◷{" "}
                      {internship.duration ||
                        "Flexible"}
                    </span>

                    <span>
                      ₨{" "}
                      {internship.stipend ||
                        "Not specified"}
                    </span>

                  </div>

                  {(user.role === "company" ||
                    user.role === "admin") && (

                    <button
                      className="delete-button"
                      onClick={() =>
                        deleteInternship(
                          internship.id
                        )
                      }
                    >
                      Remove internship
                    </button>

                  )}

                </div>

              ))}

            </div>

          )}

        </section>

        {/* ==========================================
            FOOTER
        ========================================== */}

        <footer>

          <div className="footer-logo">
            ✦ CareerAI
          </div>

          <p>
            Intelligent career guidance powered by AI.
          </p>

          <span>
            CareerAI • 2026
          </span>

        </footer>

      </main>
    </div>
  );
}

export default App;