import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wifi, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { signInWithPassword } from "@/lib/auth";
import heroBg from "@/assets/hero-bg.jpg";

export default function LoginPage() {
  const { user, authLoading, addToast, setUser } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await signInWithPassword(email, password);
      setUser(u);
      addToast("success", `Welcome back, ${u.full_name}! 👋`);
      navigate("/");
    } catch (err: any) {
      addToast("error", err?.message || "Invalid email or password");
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
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
              <Wifi size={20} className="text-navy-900" />
            </div>
            <div>
              <div className="font-bold text-lg gradient-text">WiFiHub Nepal</div>
              <div className="text-xs text-muted-foreground">Sign in to your account</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  required
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading
                ? <Loader2 size={16} className="animate-spin" />
                : <><span>Sign In</span> <ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            No account?{" "}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Create one free
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-3">
            An OTP will be sent to verify your email on registration.
          </p>
        </div>
      </div>

      {/* Right: Hero Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img src={heroBg} alt="WiFiHub Nepal" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/80" />
        <div className="absolute bottom-8 left-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Connect to Nepal's WiFi</h2>
          <p className="text-sm text-white/70">Community-powered WiFi sharing platform</p>
        </div>
      </div>
    </div>
  );
}
