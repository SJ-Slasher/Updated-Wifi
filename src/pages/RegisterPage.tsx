import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wifi, User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { sendOtp, verifyOtpAndSetPassword } from "@/lib/auth";
import heroBg from "@/assets/hero-bg.jpg";

type Step = "email" | "otp" | "password";

export default function RegisterPage() {
  const { user, authLoading, addToast, setUser } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { addToast("error", "Please enter your full name"); return; }
    setLoading(true);
    try {
      await sendOtp(email);
      setStep("otp");
      addToast("success", `OTP sent to ${email}`);
    } catch (err: any) {
      addToast("error", err?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) { addToast("error", "Please enter the 4-digit OTP"); return; }
    if (password.length < 6) { addToast("error", "Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const u = await verifyOtpAndSetPassword(email, otp, password, name);
      setUser(u);
      addToast("success", "Welcome to WiFiHub Nepal! 🎉");
      navigate("/");
    } catch (err: any) {
      addToast("error", err?.message || "Verification failed. Check the OTP and try again.");
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={28} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
              <Wifi size={20} className="text-navy-900" />
            </div>
            <div>
              <div className="font-bold text-lg gradient-text">WiFiHub Nepal</div>
              <div className="text-xs text-muted-foreground">Create your account</div>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {["Email", "Verify", "Password"].map((label, i) => {
              const idx = step === "email" ? 0 : step === "otp" ? 1 : 2;
              return (
                <React.Fragment key={label}>
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${i <= idx ? "text-cyan-400" : "text-muted-foreground"}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${i < idx ? "bg-green-500 text-white" : i === idx ? "bg-cyan-500 text-navy-900" : "bg-white/10"}`}>
                      {i < idx ? "✓" : i + 1}
                    </div>
                    <span>{label}</span>
                  </div>
                  {i < 2 && <div className="flex-1 h-px bg-border" />}
                </React.Fragment>
              );
            })}
          </div>

          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Ramesh Shrestha"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3 text-xs text-muted-foreground">
                🎁 Get <span className="text-cyan-400 font-medium">10 reputation points</span> just for joining!
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Send OTP</span> <ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {(step === "otp" || step === "password") && (
            <form onSubmit={handleVerifyAndRegister} className="space-y-4 animate-fade-in">
              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3 text-xs text-muted-foreground flex items-center gap-2">
                <Mail size={12} className="text-cyan-400 flex-shrink-0" />
                OTP sent to <span className="text-foreground font-medium">{email}</span>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">4-Digit OTP</label>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ""));
                      if (e.target.value.length >= 4) setStep("password");
                    }}
                    className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {step === "password" && (
                <div className="animate-fade-in">
                  <label className="block text-sm text-muted-foreground mb-1.5">Create Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPwd ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                      required
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || step !== "password"}
                className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Create Account</span> <ArrowRight size={16} /></>}
              </button>

              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(""); setPassword(""); }}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                ← Change email
              </button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right: Hero Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img src={heroBg} alt="WiFiHub Nepal" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/80" />
        <div className="absolute bottom-8 left-8">
          <h2 className="text-2xl font-bold mb-2 text-white">Join the Community</h2>
          <p className="text-sm text-white/70">Share WiFi. Earn reputation. Help Nepal.</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {["📡 Share WiFi", "✅ Verify Networks", "🏆 Earn Badges"].map((item) => (
              <div key={item} className="text-xs text-white/60 bg-white/10 rounded-full px-3 py-1.5">{item}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
