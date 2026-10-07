import { useEffect, useState } from "react";

function VerifyEmail() {
  const [message, setMessage] = useState("Verifying your email...");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setMessage("Verification token is missing.");
      return;
    }

    fetch(
      `https://hibafatima.pythonanywhere.com/api/auth/verify-email?token=${encodeURIComponent(token)}`
    )
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Verification failed");
        }

        setSuccess(true);
        setMessage(data.message);
      })
      .catch((error) => {
        setMessage(error.message);
      });
  }, []);

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>
        {success ? "Email Verified!" : "Email Verification"}
      </h1>

      <p>{message}</p>

      {success && (
        <button
          onClick={() => {
            window.location.href = "/";
          }}
        >
          Go to CareerAI
        </button>
      )}
    </div>
  );
}

export default VerifyEmail;