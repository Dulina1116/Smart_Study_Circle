import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveAuth } from "../utils/authUtils";

export default function Verify() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef([]);

  const email = localStorage.getItem("tempEmail") || "your@university.edu";

  // ── Countdown Timer ───────────────────────
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── OTP Input Handler ─────────────────────
  const handleInput = (val, idx) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    setError("");
    if (val && idx < 5) inputs.current[idx + 1].focus();
  };

  // ── Backspace ─────────────────────────────
  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1].focus();
      const newOtp = [...otp];
      newOtp[idx - 1] = "";
      setOtp(newOtp);
    }
  };

  // ── Paste ─────────────────────────────────
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((ch, i) => {
      newOtp[i] = ch;
    });
    setOtp(newOtp);
    const next = pasted.length < 6 ? pasted.length : 5;
    inputs.current[next].focus();
  };

  // ── Verify ────────────────────────────────
  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("⚠ Please enter all 6 digits.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Save auth and redirect based on role
      saveAuth(data.token, data.user);
      localStorage.removeItem("tempEmail");

      setSuccess(true);
      await new Promise((r) => setTimeout(r, 1800));
      if (data.user?.role === "lecturer") {
        navigate("/dashboard/lecturer", { replace: true });
      } else {
        navigate("/interests", { replace: true });
      }
    } catch (err) {
      setError("⚠ " + err.message);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Resend ────────────────────────────────
  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setCountdown(60);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
    } catch (err) {
      setError("⚠ " + err.message);
    }
    inputs.current[0].focus();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
      {/* Card */}
      <div
        className="w-full max-w-[420px] mx-4 flex flex-col items-center
        rounded-3xl px-10 py-12 bg-white border border-gray-200
        shadow-[0_8px_40px_rgba(0,184,169,0.12)]"
      >
        {/* Shield Icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
          style={{
            background: "linear-gradient(135deg, #00b8a9, #007a6e)",
            boxShadow: "0 0 0 8px rgba(0,184,169,0.12)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>

        <h2 className="text-2xl font-extrabold text-[#1a1a2e] mb-3 font-head">
          Verify Your Email
        </h2>

        <p className="text-sm text-center leading-relaxed text-gray-500 mb-8">
          Enter the 6-digit verification code sent to{" "}
          <span className="font-semibold text-[#00b8a9]">{email}</span>
        </p>

        {/* OTP Inputs */}
        <div className="flex gap-3 mb-2">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onPaste={handlePaste}
              className={`w-12 h-14 text-center text-xl font-bold rounded-xl
                border-2 outline-none transition-all duration-200 text-[#1a1a2e]
                bg-[#f8f9fa] ${
                  error
                    ? "border-red-400 bg-red-50"
                    : digit
                      ? "border-[#00b8a9] bg-[#e0f7f5] scale-105"
                      : "border-gray-200 focus:border-[#00b8a9] focus:bg-[#e0f7f5] focus:scale-105"
                }`}
            />
          ))}
        </div>

        {/* Success */}
        {success && (
          <div
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl
            bg-[#e0f7f5] border border-[#00b8a9] mt-4"
          >
            <span className="text-xl">🎉</span>
            <div>
              <p className="text-sm font-bold text-[#007a6e]">
                Email Verified!
              </p>
              <p className="text-xs text-[#00b8a9]">Redirecting you now...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-500 text-xs font-medium text-center mt-2 mb-2">
            {error}
          </p>
        )}

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-sm text-white
            flex items-center justify-center gap-2 mt-5 mb-5
            transition-all duration-200 hover:-translate-y-0.5
            hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #00b8a9, #007a6e)" }}
        >
          {loading ? (
            "⏳ Verifying..."
          ) : (
            <>
              Verify Email <span>→</span>
            </>
          )}
        </button>

        {/* Resend */}
        <p className="text-sm text-center text-gray-400">
          Didn't receive the code?{" "}
          <button
            onClick={handleResend}
            disabled={!canResend}
            className={`font-bold ml-1 transition-all ${
              canResend
                ? "text-[#00b8a9] hover:underline cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
            }`}
          >
            Resend Code
          </button>
        </p>

        {/* Timer */}
        {!canResend && (
          <p className="text-xs mt-2 text-gray-400">
            Resend available in{" "}
            <span className="text-[#00b8a9] font-semibold">{countdown}s</span>
          </p>
        )}
      </div>
    </div>
  );
}
