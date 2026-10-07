import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

const API = "https://hibafatima.pythonanywhere.com/api";

/* =========================================================
   HELPERS
========================================================= */

const formatAIResponse = (text = "") => {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/^\s*\*\*([^*\n]+)\*\*\s*$/gm, "### $1")
    .trim();
};

const formatDate = (date) => {
  if (!date) return "";

  try {
    return new Date(date).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

/* =========================================================
   MARKDOWN COMPONENTS
========================================================= */

const markdownComponents = {
  h1: ({ children }) => (
    <h3 className="ai-md-heading">{children}</h3>
  ),

  h2: ({ children }) => (
    <h3 className="ai-md-heading">{children}</h3>
  ),

  h3: ({ children }) => (
    <h4 className="ai-md-subheading">{children}</h4>
  ),

  p: ({ children }) => (
    <p className="ai-md-paragraph">{children}</p>
  ),

  ul: ({ children }) => (
    <ul className="ai-md-list">{children}</ul>
  ),

  ol: ({ children }) => (
    <ol className="ai-md-list">{children}</ol>
  ),

  li: ({ children }) => (
    <li className="ai-md-list-item">{children}</li>
  ),

  strong: ({ children }) => (
    <strong className="ai-md-bold">{children}</strong>
  ),

  blockquote: ({ children }) => (
    <blockquote className="ai-md-quote">{children}</blockquote>
  ),

  code: ({ inline, children }) =>
    inline ? (
      <code className="ai-inline-code">{children}</code>
    ) : (
      <pre className="ai-code-block">
        <code>{children}</code>
      </pre>
    ),

  table: ({ children }) => (
    <div className="ai-table-wrapper">
      <table className="ai-table">{children}</table>
    </div>
  ),

  th: ({ children }) => (
    <th className="ai-table-header">{children}</th>
  ),

  td: ({ children }) => (
    <td className="ai-table-cell">{children}</td>
  ),

  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="ai-link"
    >
      {children}
    </a>
  ),
};

/* =========================================================
   APP
========================================================= */

function App() {
  /* =======================================================
     AUTH / GENERAL STATE
  ======================================================= */

  const [page, setPage] = useState("auth");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [message, setMessage] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  /* =======================================================
     NAVIGATION / PROFILE
  ======================================================= */

  const [activeSection, setActiveSection] = useState("dashboard");
  const [showProfile, setShowProfile] = useState(false);

  /* =======================================================
     INTERNSHIPS
  ======================================================= */

  const [internships, setInternships] = useState([]);

  const [internshipForm, setInternshipForm] = useState({
    company_name: "",
    title: "",
    location: "",
    description: "",
    requirements: "",
    skills: "",
    duration: "",
    stipend: "",
    deadline: "",
  });

  /* =======================================================
     AI CHAT
  ======================================================= */

  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [currentConversationId, setCurrentConversationId] =
    useState(null);

  const [chatMessages, setChatMessages] = useState([]);

  const [conversations, setConversations] = useState([]);
  const [chatListLoading, setChatListLoading] = useState(false);
  const [conversationLoading, setConversationLoading] =
    useState(false);

  /* =======================================================
     CAREER RECOMMENDATION
  ======================================================= */

  const [careerQuestion, setCareerQuestion] = useState("");
  const [careerResult, setCareerResult] = useState(null);
  const [careerLoading, setCareerLoading] = useState(false);

  /* =======================================================
     ADMIN
  ======================================================= */

  const [adminStats, setAdminStats] = useState({
    users: 0,
    internships: 0,
  });

  /* =======================================================
     EMAIL VERIFICATION
  ======================================================= */

  const [isVerificationPage, setIsVerificationPage] =
    useState(false);

  const [verificationStatus, setVerificationStatus] =
    useState("loading");

  const [verificationMessage, setVerificationMessage] =
    useState("");

  /* =======================================================
     SECTION NAVIGATION
  ======================================================= */

  const scrollToSection = (sectionId, sectionName) => {
    setActiveSection(sectionName);

    setTimeout(() => {
      const element = document.getElementById(sectionId);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 50);
  };

  /* =======================================================
     INTERNSHIPS
  ======================================================= */

  const loadInternships = async () => {
    try {
      const response = await fetch(`${API}/internships`);

      const data = await response.json();

      if (response.ok) {
        setInternships(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Internship loading error:", error);
    }
  };

  /* =======================================================
     CHAT: LOAD ALL CONVERSATIONS
  ======================================================= */

  const loadConversations = async (authToken = token) => {
    if (!authToken) return [];

    setChatListLoading(true);

    try {
      const response = await fetch(
        `${API}/chat/conversations`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Conversation loading failed:", data);
        return [];
      }

      const list = Array.isArray(data) ? data : [];

      setConversations(list);

      return list;
    } catch (error) {
      console.error("Conversation loading error:", error);
      return [];
    } finally {
      setChatListLoading(false);
    }
  };

  /* =======================================================
     CHAT: LOAD SINGLE CONVERSATION
  ======================================================= */

  const loadConversationMessages = async (
    conversationId,
    authToken = token
  ) => {
    if (!conversationId || !authToken) return;

    setConversationLoading(true);

    try {
      const response = await fetch(
        `${API}/chat/conversations/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Messages loading failed:", data);
        return;
      }

      setCurrentConversationId(conversationId);
      setChatMessages(Array.isArray(data) ? data : []);
      setAiAnswer("");
    } catch (error) {
      console.error("Messages loading error:", error);
    } finally {
      setConversationLoading(false);
    }
  };

  /* =======================================================
     CHAT: LOAD LATEST CHAT
  ======================================================= */

  const loadLatestChat = async (authToken = token) => {
    const list = await loadConversations(authToken);

    if (!list.length) {
      setCurrentConversationId(null);
      setChatMessages([]);
      return;
    }

    const latest = list[0];

    await loadConversationMessages(latest.id, authToken);
  };

  /* =======================================================
     CHAT: NEW CHAT
  ======================================================= */

  const startNewChat = () => {
    setCurrentConversationId(null);
    setChatMessages([]);
    setAiQuestion("");
    setAiAnswer("");

    scrollToSection("ai-section", "career");
  };

  /* =======================================================
     CHAT: SELECT CHAT
  ======================================================= */

  const selectConversation = async (conversationId) => {
    setActiveSection("career");

    await loadConversationMessages(
      conversationId,
      token
    );

    setTimeout(() => {
      const element = document.getElementById("ai-section");

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 50);
  };

  /* =======================================================
     CHAT: DELETE CHAT
  ======================================================= */

  const deleteConversation = async (
    conversationId,
    event
  ) => {
    event?.stopPropagation();

    if (!token || !conversationId) return;

    const confirmed = window.confirm(
      "Delete this conversation?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API}/chat/conversations/${conversationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || "Could not delete conversation"
        );
        return;
      }

      const remaining = conversations.filter(
        (conversation) =>
          conversation.id !== conversationId
      );

      setConversations(remaining);

      if (currentConversationId === conversationId) {
        if (remaining.length > 0) {
          await loadConversationMessages(
            remaining[0].id,
            token
          );
        } else {
          setCurrentConversationId(null);
          setChatMessages([]);
          setAiQuestion("");
          setAiAnswer("");
        }
      }
    } catch (error) {
      console.error("Delete conversation error:", error);

      setMessage("Could not delete conversation");
    }
  };

  /* =======================================================
     REGISTER
  ======================================================= */

   const register = async (e) => {
  e.preventDefault();

  setMessage("");

  // ============================================
  // EMAIL VALIDATION
  // ============================================

  const email = form.email.trim();

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!emailRegex.test(email)) {
    setMessage("Please enter a valid email address.");
    return;
  }

  // ============================================
  // PASSWORD VALIDATION
  // ============================================

  if (form.password.length < 6) {
    setMessage(
      "Password must be at least 6 characters long."
    );
    return;
  }

  // ============================================
  // REGISTER USER
  // ============================================

  try {
    const response = await fetch(
      `${API}/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          email: email,
        }),
      }
    );

    const data = await response.json();

    // ============================================
    // BACKEND ERROR
    // ============================================

    if (!response.ok) {
      setMessage(
        data.error || "Registration failed."
      );
      return;
    }

    // ============================================
    // SUCCESS
    // ============================================

    setMessage(
      data.message ||
        "Registration successful. Please verify your email."
    );

    // Clear form
    setForm({
      name: "",
      email: "",
      password: "",
      role: "student",
    });

    // Switch back to login
    setIsRegister(false);

  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    setMessage(
      "Unable to connect to the server."
    );
  }
};
  /* =======================================================
     LOGIN
  ======================================================= */

  const login = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      const response = await fetch(
        `${API}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || "Login failed"
        );
        return;
      }

      setToken(data.token);
      setUser(data.user);
      setPage("dashboard");

      setForm({
        name: "",
        email: "",
        password: "",
        role: "student",
      });

      setMessage("");

      await loadInternships();

      if (data.user.role === "admin") {
        await loadAdminStats(data.token);
      }
    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        "Unable to connect to the server."
      );
    }
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = () => {
    setToken("");
    setUser(null);
    setPage("auth");

    setChatMessages([]);
    setConversations([]);
    setCurrentConversationId(null);

    setCareerResult(null);
    setAiAnswer("");
    setAiQuestion("");

    setShowProfile(false);
    setActiveSection("dashboard");
  };

  /* =======================================================
     ADD INTERNSHIP
  ======================================================= */

  const addInternship = async (e) => {
  e.preventDefault();

  if (!token) {
    setMessage("Please login first.");
    return;
  }

  try {
    const internshipData = {
      company_name: internshipForm.company_name,
      title: internshipForm.title,
      location: internshipForm.location,
      description: internshipForm.description,
      requirements: internshipForm.requirements,
      skills: internshipForm.skills,
      duration: internshipForm.duration,
      stipend: internshipForm.stipend,
      deadline: internshipForm.deadline,
    };

    const response = await fetch(
      `${API}/internships`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(internshipData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        data.error || "Could not add internship"
      );
      console.error("Internship error:", data);
      return;
    }

    setMessage("Internship posted successfully.");

    setInternshipForm({
      company_name: "",
      title: "",
      location: "",
      description: "",
      requirements: "",
      skills: "",
      duration: "",
      stipend: "",
      deadline: "",
    });

    await loadInternships();

  } catch (error) {

    console.error("Add internship error:", error);

    setMessage(
      error.message || "Could not post internship."
    );
  }
};
  /* =======================================================
     DELETE INTERNSHIP
  ======================================================= */

  const deleteInternship = async (id) => {
    if (!token) return;

    const confirmed = window.confirm(
      "Delete this internship?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API}/internships/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || "Could not delete internship"
        );
        return;
      }

      setMessage("Internship deleted.");

      await loadInternships();
    } catch (error) {
      console.error(
        "Delete internship error:",
        error
      );

      setMessage("Could not delete internship.");
    }
  };

  /* =======================================================
     ASK CAREER AI
  ======================================================= */

  const askCareerAI = async (e) => {
    e?.preventDefault();

    const question = aiQuestion.trim();

    if (!question) return;

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    setAiLoading(true);
    setAiAnswer("");
    setMessage("");

    const temporaryUserMessage = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: question,
      created_at: new Date().toISOString(),
    };

    setChatMessages((prev) => [
      ...prev,
      temporaryUserMessage,
    ]);

    setAiQuestion("");

    try {
      const response = await fetch(
        `${API}/ai/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question,
            conversation_id:
              currentConversationId || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            "AI response could not be generated."
        );
        return;
      }

      setCurrentConversationId(
        data.conversation_id
      );

      setAiAnswer(data.answer || "");

      const assistantMessage = {
        id: `temp-ai-${Date.now()}`,
        role: "assistant",
        content: data.answer || "",
        created_at: new Date().toISOString(),
      };

      setChatMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);

      await loadConversations(token);
    } catch (error) {
      console.error("AI request error:", error);

      setMessage(
        "Unable to get an AI response."
      );
    } finally {
      setAiLoading(false);

      await loadConversations(token);
    }
  };

  /* =======================================================
     CAREER RECOMMENDATION
  ======================================================= */

  const getCareerRecommendation = async (e) => {
    e?.preventDefault();

    const question = careerQuestion.trim();

    if (!question) return;

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    setCareerLoading(true);
    setCareerResult(null);
    setMessage("");

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
            question,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            "Could not generate recommendation."
        );
        return;
      }

      setCareerResult(data);
    } catch (error) {
      console.error(
        "Career recommendation error:",
        error
      );

      setMessage(
        "Could not generate career recommendation."
      );
    } finally {
      setCareerLoading(false);
    }
  };

  /* =======================================================
     ADMIN STATS
  ======================================================= */

  const loadAdminStats = async (
    authToken = token
  ) => {
    if (!authToken) return;

    try {
      const usersResponse = await fetch(
        `${API}/test-db`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (usersResponse.ok) {
        const usersData =
          await usersResponse.json();

        setAdminStats((prev) => ({
          ...prev,
          users: Array.isArray(usersData.users)
            ? usersData.users.length
            : 0,
        }));
      }

      setAdminStats((prev) => ({
        ...prev,
        internships: internships.length,
      }));
    } catch (error) {
      console.error(
        "Admin stats error:",
        error
      );
    }
  };

  /* =======================================================
     EMAIL VERIFICATION
  ======================================================= */

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const verificationToken =
      params.get("token");

    if (
      window.location.pathname ===
        "/verify-email" &&
      verificationToken
    ) {
      setIsVerificationPage(true);

      const verifyEmail = async () => {
        try {
          const response = await fetch(
            `${API}/auth/verify-email?token=${encodeURIComponent(
              verificationToken
            )}`
          );

          const data = await response.json();

          if (response.ok) {
            setVerificationStatus(
              "success"
            );

            setVerificationMessage(
              data.message ||
                "Email verified successfully."
            );
          } else {
            setVerificationStatus(
              "error"
            );

            setVerificationMessage(
              data.error ||
                "Email verification failed."
            );
          }
        } catch (error) {
          console.error(
            "Verification error:",
            error
          );

          setVerificationStatus("error");

          setVerificationMessage(
            "Unable to verify email."
          );
        }
      };

      verifyEmail();
    }
  }, []);

  /* =======================================================
     LOAD DATA AFTER LOGIN
  ======================================================= */

  useEffect(() => {
    if (!token || !user) return;

    loadInternships();
    loadLatestChat(token);

    if (user.role === "admin") {
      loadAdminStats(token);
    }
  }, [token, user]);

  /* =======================================================
     VERIFICATION PAGE
  ======================================================= */

  if (isVerificationPage) {
    return (
      <div className="verification-page">
        <div className="verification-card">
          <div className="verification-logo">
            Career<span>AI</span>
          </div>

          {verificationStatus === "loading" && (
            <>
              <div className="verification-icon">
                ⏳
              </div>

              <h1>Verifying Email</h1>

              <p>
                Please wait while we verify
                your email address.
              </p>
            </>
          )}

          {verificationStatus === "success" && (
            <>
              <div className="verification-icon success">
                ✓
              </div>

              <h1>Email Verified!</h1>

              <p>
                {verificationMessage}
              </p>

              <button
                className="primary-button"
                onClick={() => {
                  window.history.replaceState(
                    {},
                    "",
                    "/"
                  );

                  setIsVerificationPage(false);
                  setPage("auth");
                }}
              >
                Continue to Login
              </button>
            </>
          )}

          {verificationStatus === "error" && (
            <>
              <div className="verification-icon error">
                !
              </div>

              <h1>Verification Failed</h1>

              <p>
                {verificationMessage}
              </p>

              <button
                className="primary-button"
                onClick={() => {
                  window.history.replaceState(
                    {},
                    "",
                    "/"
                  );

                  setIsVerificationPage(false);
                  setPage("auth");
                }}
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  /* =======================================================
     AUTH PAGE
  ======================================================= */

  if (!user || page === "auth") {
    return (
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-brand">
            Career<span>AI</span>
          </div>

          <div className="auth-hero">
            <div className="auth-badge">
              AI-POWERED CAREER ASSISTANT
            </div>

            <h1>
              Build Your
              <br />
              <span>Future With AI.</span>
            </h1>

            <p>
              Discover internships, get
              personalized career guidance,
              and build the skills you need
              for your future.
            </p>

            <div className="auth-features">
              <div className="auth-feature">
                <span>✓</span>
                AI Career Guidance
              </div>

              <div className="auth-feature">
                <span>✓</span>
                Smart Internship Discovery
              </div>

              <div className="auth-feature">
                <span>✓</span>
                Personalized Recommendations
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="mobile-auth-logo">
              Career<span>AI</span>
            </div>

            <div className="auth-card-header">
              <h2>
                {isRegister
                  ? "Create Account"
                  : "Welcome Back"}
              </h2>

              <p>
                {isRegister
                  ? "Start your career journey with CareerAI."
                  : "Sign in to continue your career journey."}
              </p>
            </div>

            {message && (
              <div className="alert-message">
                {message}
              </div>
            )}

            <form
              onSubmit={
                isRegister
                  ? register
                  : login
              }
              className="auth-form"
            >
              {isRegister && (
                <div className="form-group">
                  <label>Full Name</label>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Email Address</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {isRegister && (
                <div className="form-group">
                  <label>Account Type</label>

                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        role: e.target.value,
                      })
                    }
                  >
                    <option value="student">
                      Student
                    </option>

                    <option value="company">
                      Company
                    </option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="primary-button auth-submit"
              >
                {isRegister
                  ? "Create Account"
                  : "Login"}
              </button>
            </form>

            <div className="auth-switch">
              {isRegister
                ? "Already have an account?"
                : "Don't have an account?"}

              <button
                type="button"
                onClick={() => {
                  setIsRegister(
                    !isRegister
                  );
                  setMessage("");
                }}
              >
                {isRegister
                  ? "Login"
                  : "Register"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     DASHBOARD
  ======================================================= */

  return (
    <div className="app-shell">
      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside className="sidebar">
        <div className="sidebar-logo">
          Career<span>AI</span>
        </div>

        <div className="sidebar-user">
          <button
            className="sidebar-profile-button"
            onClick={() =>
              setShowProfile(true)
            }
          >
            <div className="user-avatar">
              {user.name
                ? user.name
                    .charAt(0)
                    .toUpperCase()
                : "U"}
            </div>

            <div className="sidebar-user-info">
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>

            <span className="profile-arrow">
              ›
            </span>
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${
              activeSection === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              scrollToSection(
                "dashboard-section",
                "dashboard"
              )
            }
          >
            <span className="nav-icon">
              ⌂
            </span>
            Dashboard
          </button>

          <button
            className={`nav-item ${
              activeSection === "internships"
                ? "active"
                : ""
            }`}
            onClick={() =>
              scrollToSection(
                "internships-section",
                "internships"
              )
            }
          >
            <span className="nav-icon">
              ▣
            </span>
            Internships
          </button>

          {user.role === "student" && (
            <button
              className={`nav-item ${
                activeSection === "career"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                scrollToSection(
                  "ai-section",
                  "career"
                )
              }
            >
              <span className="nav-icon">
                ✦
              </span>
              My Career
            </button>
          )}

          {user.role === "company" && (
            <button
              className={`nav-item ${
                activeSection === "post"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                scrollToSection(
                  "company-section",
                  "post"
                )
              }
            >
              <span className="nav-icon">
                +
              </span>
              Post Internship
            </button>
          )}

          {user.role === "admin" && (
            <button
              className={`nav-item ${
                activeSection === "admin"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                scrollToSection(
                  "admin-section",
                  "admin"
                )
              }
            >
              <span className="nav-icon">
                ⚙
              </span>
              Admin
            </button>
          )}
        </nav>

        {/* =================================================
            CHAT HISTORY
        ================================================= */}

        {user.role === "student" && (
          <div className="chat-history-sidebar">
            <div className="chat-history-header">
              <span>CHAT HISTORY</span>

              <button
                className="new-chat-icon"
                onClick={startNewChat}
                title="New Chat"
              >
                +
              </button>
            </div>

            <button
              className="new-chat-button"
              onClick={startNewChat}
            >
              <span>＋</span>
              New Chat
            </button>

            <div className="chat-history-list">
              {chatListLoading &&
                conversations.length === 0 && (
                  <div className="chat-history-empty">
                    Loading chats...
                  </div>
                )}

              {!chatListLoading &&
                conversations.length === 0 && (
                  <div className="chat-history-empty">
                    No previous chats yet.
                  </div>
                )}

              {conversations.map(
                (conversation) => (
                  <div
                    key={conversation.id}
                    className={`chat-history-item ${
                      currentConversationId ===
                      conversation.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      selectConversation(
                        conversation.id
                      )
                    }
                  >
                    <div className="chat-history-item-main">
                      <span className="chat-history-title">
                        {conversation.title ||
                          "New Career Chat"}
                      </span>

                      <span className="chat-history-date">
                        {formatDate(
                          conversation.updated_at ||
                            conversation.created_at
                        )}
                      </span>
                    </div>

                    <button
                      className="chat-delete-button"
                      onClick={(e) =>
                        deleteConversation(
                          conversation.id,
                          e
                        )
                      }
                      title="Delete chat"
                    >
                      ×
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        <div className="sidebar-bottom">
          <button
            className="logout-button"
            onClick={logout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="main-content">
        {/* =================================================
            TOPBAR
        ================================================= */}

        <header className="topbar">
          <div>
            <span className="topbar-label">
              CAREER ASSISTANT
            </span>

            <h2>
              Hello, {user.name?.split(" ")[0]}
              !
            </h2>
          </div>

          <button
            className="topbar-profile"
            onClick={() =>
              setShowProfile(true)
            }
          >
            <div className="topbar-avatar">
              {user.name
                ? user.name
                    .charAt(0)
                    .toUpperCase()
                : "U"}
            </div>
          </button>
        </header>

        {message && (
          <div className="global-message">
            {message}
            <button
              onClick={() => setMessage("")}
            >
              ×
            </button>
          </div>
        )}

        {/* =================================================
            HERO / DASHBOARD
        ================================================= */}

        <section
          id="dashboard-section"
          className="dashboard-section"
        >
          <div className="hero-card">
            <div className="hero-content">
              <span className="hero-badge">
                AI-POWERED CAREER PLATFORM
              </span>

              <h1>
                Find Internships.
                <br />
                <span>
                  Build Your Future.
                </span>
              </h1>

              <p>
                CareerAI helps you discover
                opportunities, understand your
                career path, and develop the
                skills employers need.
              </p>

              {user.role === "student" && (
                <button
                  className="hero-button"
                  onClick={() =>
                    scrollToSection(
                      "ai-section",
                      "career"
                    )
                  }
                >
                  Ask CareerAI
                  <span>→</span>
                </button>
              )}
            </div>

            <div className="hero-visual">
              <div className="hero-orbit orbit-one"></div>
              <div className="hero-orbit orbit-two"></div>

              <div className="hero-ai-circle">
                <span>✦</span>
              </div>
            </div>
          </div>

          {/* =================================================
              STATS
          ================================================= */}

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon purple">
                ✦
              </div>

              <div>
                <span>AI Assistant</span>
                <strong>24/7</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                ▣
              </div>

              <div>
                <span>Internships</span>
                <strong>
                  {internships.length}
                </strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue">
                ◎
              </div>

              <div>
                <span>Career Support</span>
                <strong>Smart</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                ✓
              </div>

              <div>
                <span>Account</span>
                <strong>Active</strong>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            STUDENT AI SECTION
        ================================================= */}

        {user.role === "student" && (
          <section
            id="ai-section"
            className="content-section"
          >
            <div className="section-header">
              <div>
                <span className="section-label">
                  AI CAREER ASSISTANT
                </span>

                <h2>
                  Your Personal Career AI
                </h2>

                <p>
                  Ask questions about careers,
                  internships, skills, projects,
                  interviews, and learning paths.
                </p>
              </div>

              <button
                className="secondary-button"
                onClick={startNewChat}
              >
                ＋ New Chat
              </button>
            </div>

            <div className="ai-chat-card">
              <div className="ai-chat-header">
                <div className="ai-status">
                  <div className="ai-status-dot"></div>

                  <div>
                    <strong>
                      CareerAI Assistant
                    </strong>

                    <span>
                      AI career guidance
                    </span>
                  </div>
                </div>

                {currentConversationId && (
                  <span className="conversation-status">
                    Conversation saved
                  </span>
                )}
              </div>

              <div className="chat-messages">
                {conversationLoading && (
                  <div className="chat-loading">
                    Loading conversation...
                  </div>
                )}

                {!conversationLoading &&
                  chatMessages.length === 0 && (
                    <div className="empty-chat">
                      <div className="empty-chat-icon">
                        ✦
                      </div>

                      <h3>
                        Start a conversation
                      </h3>

                      <p>
                        Ask CareerAI anything
                        about your career.
                      </p>

                      <div className="suggestion-grid">
                        <button
                          onClick={() =>
                            setAiQuestion(
                              "What skills should I learn to become a software engineer?"
                            )
                          }
                        >
                          Skills for software
                          engineering
                        </button>

                        <button
                          onClick={() =>
                            setAiQuestion(
                              "How can I prepare for a software engineering internship?"
                            )
                          }
                        >
                          Internship preparation
                        </button>

                        <button
                          onClick={() =>
                            setAiQuestion(
                              "Which AI and machine learning projects should I build?"
                            )
                          }
                        >
                          AI/ML project ideas
                        </button>

                        <button
                          onClick={() =>
                            setAiQuestion(
                              "How should I prepare for a technical interview?"
                            )
                          }
                        >
                          Interview preparation
                        </button>
                      </div>
                    </div>
                  )}

                {chatMessages.map(
                  (chat, index) => (
                    <div
                      key={
                        chat.id ||
                        `${chat.role}-${index}`
                      }
                      className={`chat-message ${
                        chat.role === "user"
                          ? "user-message"
                          : "assistant-message"
                      }`}
                    >
                      <div className="message-avatar">
                        {chat.role === "user"
                          ? user.name
                              ?.charAt(0)
                              .toUpperCase() ||
                            "U"
                          : "✦"}
                      </div>

                      <div className="message-body">
                        <div className="message-name">
                          {chat.role === "user"
                            ? "You"
                            : "CareerAI"}
                        </div>

                        {chat.role === "user" ? (
                          <div className="user-message-content">
                            {chat.content}
                          </div>
                        ) : (
                          <div className="ai-response-content">
                            <ReactMarkdown
                              remarkPlugins={[
                                remarkGfm,
                              ]}
                              components={
                                markdownComponents
                              }
                            >
                              {formatAIResponse(
                                chat.content
                              )}
                            </ReactMarkdown>
                          </div>
                        )}

                        {chat.created_at && (
                          <div className="message-time">
                            {new Date(
                              chat.created_at
                            ).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute:
                                  "2-digit",
                              }
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}

                {aiLoading && (
                  <div className="chat-message assistant-message">
                    <div className="message-avatar">
                      ✦
                    </div>

                    <div className="message-body">
                      <div className="message-name">
                        CareerAI
                      </div>

                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form
                className="ai-input-area"
                onSubmit={askCareerAI}
              >
                <textarea
                  value={aiQuestion}
                  onChange={(e) =>
                    setAiQuestion(
                      e.target.value
                    )
                  }
                  placeholder="Ask CareerAI a question..."
                  rows="2"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey
                    ) {
                      e.preventDefault();
                      askCareerAI();
                    }
                  }}
                />

                <button
                  type="submit"
                  className="send-button"
                  disabled={
                    aiLoading ||
                    !aiQuestion.trim()
                  }
                >
                  {aiLoading ? "..." : "↑"}
                </button>
              </form>

              <div className="ai-input-hint">
                Press Enter to send • Shift +
                Enter for a new line
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            CAREER RECOMMENDATION
        ================================================= */}

        {user.role === "student" && (
          <section className="content-section">
            <div className="section-header">
              <div>
                <span className="section-label">
                  PERSONALIZED GUIDANCE
                </span>

                <h2>
                  Career Recommendation
                </h2>

                <p>
                  Describe your interests and
                  goals to get a personalized
                  career direction.
                </p>
              </div>
            </div>

            <div className="recommendation-card">
              <form
                className="recommendation-form"
                onSubmit={
                  getCareerRecommendation
                }
              >
                <textarea
                  value={careerQuestion}
                  onChange={(e) =>
                    setCareerQuestion(
                      e.target.value
                    )
                  }
                  placeholder="Example: I enjoy Python, AI, web development and databases. What career path should I follow?"
                  rows="4"
                />

                <button
                  type="submit"
                  className="primary-button"
                  disabled={careerLoading}
                >
                  {careerLoading
                    ? "Analyzing..."
                    : "Get Recommendation →"}
                </button>
              </form>

              {careerResult && (
                <div className="career-result">
                  <div className="career-result-header">
                    <span>
                      AI RECOMMENDATION
                    </span>
                  </div>

                  <div className="career-result-content">
                    {typeof careerResult ===
                    "string" ? (
                      <ReactMarkdown
                        remarkPlugins={[
                          remarkGfm,
                        ]}
                        components={
                          markdownComponents
                        }
                      >
                        {formatAIResponse(
                          careerResult
                        )}
                      </ReactMarkdown>
                    ) : (
                      Object.entries(
                        careerResult
                      ).map(
                        ([key, value]) => (
                          <div
                            className="career-result-item"
                            key={key}
                          >
                            <h4>
                              {key
                                .replace(
                                  /_/g,
                                  " "
                                )
                                .replace(
                                  /\b\w/g,
                                  (letter) =>
                                    letter.toUpperCase()
                                )}
                            </h4>

                            <div>
                              {typeof value ===
                              "string" ? (
                                <ReactMarkdown
                                  remarkPlugins={[
                                    remarkGfm,
                                  ]}
                                  components={
                                    markdownComponents
                                  }
                                >
                                  {formatAIResponse(
                                    value
                                  )}
                                </ReactMarkdown>
                              ) : (
                                <pre>
                                  {JSON.stringify(
                                    value,
                                    null,
                                    2
                                  )}
                                </pre>
                              )}
                            </div>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* =================================================
            COMPANY WORKSPACE
        ================================================= */}

        {user.role === "company" && (
          <section
            id="company-section"
            className="content-section"
          >
            <div className="section-header">
              <div>
                <span className="section-label">
                  COMPANY WORKSPACE
                </span>

                <h2>
                  Post an Internship
                </h2>

                <p>
                  Publish opportunities for
                  students on CareerAI.
                </p>
              </div>
            </div>

            <div className="company-card">
              <form
                className="internship-form"
                onSubmit={addInternship}
              >
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Company Name
                    </label>

                    <input
                      type="text"
                      value={
                        internshipForm.company_name
                      }
                      onChange={(e) =>
                        setInternshipForm({
                          ...internshipForm,
                          company_name:
                            e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Internship Title
                    </label>

                    <input
                      type="text"
                      value={
                        internshipForm.title
                      }
                      onChange={(e) =>
                        setInternshipForm({
                          ...internshipForm,
                          title:
                            e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Location
                    </label>

                    <input
                      type="text"
                      value={
                        internshipForm.location
                      }
                      onChange={(e) =>
                        setInternshipForm({
                          ...internshipForm,
                          location:
                            e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Duration
                    </label>

                    <input
                      type="text"
                      placeholder="e.g. 3 months"
                      value={
                        internshipForm.duration
                      }
                      onChange={(e) =>
                        setInternshipForm({
                          ...internshipForm,
                          duration:
                            e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Stipend
                    </label>

                    <input
                      type="text"
                      placeholder="e.g. PKR 25,000"
                      value={
                        internshipForm.stipend
                      }
                      onChange={(e) =>
                        setInternshipForm({
                          ...internshipForm,
                          stipend:
                            e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Application Deadline
                    </label>

                    <input
                      type="date"
                      value={
                        internshipForm.deadline
                      }
                      onChange={(e) =>
                        setInternshipForm({
                          ...internshipForm,
                          deadline:
                            e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Required Skills
                  </label>

                  <input
                    type="text"
                    placeholder="Python, React, SQL..."
                    value={
                      internshipForm.skills
                    }
                    onChange={(e) =>
                      setInternshipForm({
                        ...internshipForm,
                        skills:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Requirements
                  </label>

                  <textarea
                    rows="4"
                    value={
                      internshipForm.requirements
                    }
                    onChange={(e) =>
                      setInternshipForm({
                        ...internshipForm,
                        requirements:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Description
                  </label>

                  <textarea
                    rows="5"
                    value={
                      internshipForm.description
                    }
                    onChange={(e) =>
                      setInternshipForm({
                        ...internshipForm,
                        description:
                          e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Publish Internship →
                </button>
              </form>
            </div>
          </section>
        )}

        {/* =================================================
            ADMIN
        ================================================= */}

        {user.role === "admin" && (
          <section
            id="admin-section"
            className="content-section"
          >
            <div className="section-header">
              <div>
                <span className="section-label">
                  ADMINISTRATION
                </span>

                <h2>
                  CareerAI Administration
                </h2>

                <p>
                  Monitor users and internship
                  activity.
                </p>
              </div>

              <button
                className="secondary-button"
                onClick={() =>
                  loadAdminStats(token)
                }
              >
                Refresh
              </button>
            </div>

            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <span>Total Users</span>

                <strong>
                  {adminStats.users}
                </strong>
              </div>

              <div className="admin-stat-card">
                <span>
                  Total Internships
                </span>

                <strong>
                  {internships.length}
                </strong>
              </div>

              <div className="admin-stat-card">
                <span>
                  Platform Status
                </span>

                <strong className="online-text">
                  Online
                </strong>
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            INTERNSHIPS
        ================================================= */}

        <section
          id="internships-section"
          className="content-section"
        >
          <div className="section-header">
            <div>
              <span className="section-label">
                OPPORTUNITIES
              </span>

              <h2>
                Available Internships
              </h2>

              <p>
                Explore available internship
                opportunities.
              </p>
            </div>

            <button
              className="secondary-button"
              onClick={loadInternships}
            >
              Refresh
            </button>
          </div>

          {internships.length === 0 ? (
            <div className="empty-internships">
              <div className="empty-icon">
                ▣
              </div>

              <h3>
                No internships available
              </h3>

              <p>
                New opportunities will appear
                here when companies post them.
              </p>
            </div>
          ) : (
            <div className="internship-grid">
              {internships.map(
                (internship) => (
                  <div
                    className="internship-card"
                    key={internship.id}
                  >
                    <div className="internship-card-top">
                      <div className="company-logo">
                        {(
                          internship.company_name ||
                          "C"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      {internship.deadline && (
                        <span className="deadline-badge">
                          Deadline:{" "}
                          {formatDate(
                            internship.deadline
                          )}
                        </span>
                      )}
                    </div>

                    <h3>
                      {internship.title}
                    </h3>

                    <div className="company-name">
                      {internship.company_name ||
                        "Company"}
                    </div>

                    <div className="internship-meta">
                      {internship.location && (
                        <span>
                          📍{" "}
                          {internship.location}
                        </span>
                      )}

                      {internship.duration && (
                        <span>
                          ◷{" "}
                          {internship.duration}
                        </span>
                      )}
                    </div>

                    {internship.description && (
                      <p>
                        {internship.description}
                      </p>
                    )}

                    {internship.skills && (
                      <div className="skill-tags">
                        {String(
                          internship.skills
                        )
                          .split(",")
                          .map(
                            (
                              skill,
                              index
                            ) => (
                              <span
                                key={index}
                              >
                                {skill.trim()}
                              </span>
                            )
                          )}
                      </div>
                    )}

                    {internship.stipend && (
                      <div className="stipend">
                        <span>
                          Stipend
                        </span>

                        <strong>
                          {internship.stipend}
                        </strong>
                      </div>
                    )}

                    {user.role ===
                      "admin" && (
                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteInternship(
                            internship.id
                          )
                        }
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="footer">
          <div>
            <strong>
              Career<span>AI</span>
            </strong>

            <p>
              Smart Internship & Career
              Assistant
            </p>
          </div>

          <span>
            © 2026 CareerAI. All rights
            reserved.
          </span>
        </footer>
      </main>

      {/* ===================================================
          PROFILE MODAL
      =================================================== */}

      {showProfile && (
        <div
          className="profile-overlay"
          onClick={() =>
            setShowProfile(false)
          }
        >
          <div
            className="profile-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className="profile-close"
              onClick={() =>
                setShowProfile(false)
              }
            >
              ×
            </button>

            <div className="profile-modal-avatar">
              {user.name
                ? user.name
                    .charAt(0)
                    .toUpperCase()
                : "U"}
            </div>

            <h2>{user.name}</h2>

            <p className="profile-role">
              {user.role}
            </p>

            <div className="profile-details">
              <div className="profile-detail">
                <span>
                  Full Name
                </span>

                <strong>
                  {user.name}
                </strong>
              </div>

              <div className="profile-detail">
                <span>
                  Email Address
                </span>

                <strong>
                  {user.email}
                </strong>
              </div>

              <div className="profile-detail">
                <span>
                  Account Type
                </span>

                <strong>
                  {user.role}
                </strong>
              </div>

              <div className="profile-detail">
                <span>
                  User ID
                </span>

                <strong>
                  #{user.id}
                </strong>
              </div>
            </div>

            <button
              className="profile-close-button"
              onClick={() =>
                setShowProfile(false)
              }
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;