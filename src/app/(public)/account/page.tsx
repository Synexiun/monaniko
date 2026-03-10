"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import Button from "@/components/ui/Button";

type AuthMode = "login" | "register";

const inputClass =
  "w-full bg-white border border-warm-gray px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors";
const labelClass =
  "block text-[11px] tracking-[0.15em] uppercase text-charcoal-light mb-2";

export default function AccountPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginData.email, password: loginData.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setUser(data);
      router.push("/account/orders");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (registerData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          email: registerData.email,
          password: registerData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setUser(data);
      router.push("/account/orders");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/artworks/artwork-1.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 container-gallery text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6"
          >
            My Account
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-light tracking-[-0.02em]"
          >
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed"
          >
            {mode === "login"
              ? "Sign in to access your order history, wishlist, and exclusive content."
              : "Join our community of art lovers and collectors."}
          </motion.p>
        </div>
      </section>

      {/* ─── Auth Form ────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery max-w-md mx-auto">
          {/* Toggle Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="flex mb-10"
          >
            {(["login", "register"] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 text-center py-3 text-[12px] tracking-[0.15em] uppercase transition-all duration-300 border-b-2 ${
                  mode === m
                    ? "border-gold text-black font-medium"
                    : "border-warm-gray text-charcoal-light hover:text-black"
                }`}
              >
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm mb-6"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Login Form */}
          {mode === "login" && (
            <motion.form key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              onSubmit={handleLogin} className="space-y-6"
            >
              <div>
                <label className={labelClass}>Email Address</label>
                <input type="email" required value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className={inputClass} placeholder="your@email.com" autoComplete="email" />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <input type="password" required value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className={inputClass} placeholder="Enter your password" autoComplete="current-password" />
              </div>
              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Signing in…</> : "Sign In"}
              </Button>
              <p className="text-center text-sm text-charcoal-light">
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => { setMode("register"); setError(""); }}
                  className="text-gold hover:text-gold-dark transition-colors">
                  Register here
                </button>
              </p>
            </motion.form>
          )}

          {/* Register Form */}
          {mode === "register" && (
            <motion.form key="register" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              onSubmit={handleRegister} className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input type="text" required value={registerData.firstName}
                    onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                    className={inputClass} placeholder="First name" autoComplete="given-name" />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input type="text" required value={registerData.lastName}
                    onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                    className={inputClass} placeholder="Last name" autoComplete="family-name" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input type="email" required value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className={inputClass} placeholder="your@email.com" autoComplete="email" />
              </div>
              <div>
                <label className={labelClass}>Password <span className="text-charcoal-light/60 normal-case tracking-normal">(min. 8 characters)</span></label>
                <input type="password" required value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className={inputClass} placeholder="Create a password" autoComplete="new-password" />
              </div>
              <div>
                <label className={labelClass}>Confirm Password</label>
                <input type="password" required value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  className={inputClass} placeholder="Confirm your password" autoComplete="new-password" />
              </div>
              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Creating account…</> : "Create Account"}
              </Button>
              <p className="text-[12px] text-charcoal-light text-center leading-relaxed">
                By creating an account, you agree to our{" "}
                <Link href="/policies#privacy-policy" className="text-gold hover:text-gold-dark transition-colors">Privacy Policy</Link>
                {" "}and{" "}
                <Link href="/policies" className="text-gold hover:text-gold-dark transition-colors">Terms of Service</Link>.
              </p>
            </motion.form>
          )}
        </div>
      </section>
    </>
  );
}
