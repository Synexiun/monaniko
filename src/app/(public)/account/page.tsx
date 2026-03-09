"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";

type AuthMode = "login" | "register";

export default function AccountPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder — login logic
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder — registration logic
  };

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative py-32 md:py-40 bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/95" />
        <div className="relative z-10 container-gallery text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6"
          >
            My Account
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl text-white font-medium tracking-[-0.02em]"
          >
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed"
          >
            {mode === "login"
              ? "Sign in to access your collection, order history, and exclusive content."
              : "Join our community of art lovers and collectors."}
          </motion.p>
        </div>
      </section>

      {/* ─── Auth Form ────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery max-w-md mx-auto">
          {/* Toggle Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex mb-10"
          >
            <button
              onClick={() => setMode("login")}
              className={`flex-1 text-center py-3 text-[12px] tracking-[0.15em] uppercase transition-all duration-300 border-b-2 ${
                mode === "login"
                  ? "border-gold text-black font-medium"
                  : "border-warm-gray text-charcoal-light hover:text-black"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 text-center py-3 text-[12px] tracking-[0.15em] uppercase transition-all duration-300 border-b-2 ${
                mode === "register"
                  ? "border-gold text-black font-medium"
                  : "border-warm-gray text-charcoal-light hover:text-black"
              }`}
            >
              Register
            </button>
          </motion.div>

          {/* Login Form */}
          {mode === "login" && (
            <motion.form
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleLogin}
              className="space-y-6"
            >
              <div>
                <label className="block text-[11px] tracking-[0.15em] uppercase text-charcoal-light mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  className="w-full bg-white border border-warm-gray px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-[11px] tracking-[0.15em] uppercase text-charcoal-light mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  className="w-full bg-white border border-warm-gray px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                  placeholder="Enter your password"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border-warm-gray text-gold focus:ring-gold accent-gold"
                  />
                  <span className="text-sm text-charcoal-light">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-gold hover:text-gold-dark transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full"
              >
                Sign In
              </Button>
            </motion.form>
          )}

          {/* Register Form */}
          {mode === "register" && (
            <motion.form
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleRegister}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] tracking-[0.15em] uppercase text-charcoal-light mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={registerData.firstName}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full bg-white border border-warm-gray px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-[11px] tracking-[0.15em] uppercase text-charcoal-light mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={registerData.lastName}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full bg-white border border-warm-gray px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] tracking-[0.15em] uppercase text-charcoal-light mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      email: e.target.value,
                    })
                  }
                  className="w-full bg-white border border-warm-gray px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-[11px] tracking-[0.15em] uppercase text-charcoal-light mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  className="w-full bg-white border border-warm-gray px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                  placeholder="Create a password"
                />
              </div>
              <div>
                <label className="block text-[11px] tracking-[0.15em] uppercase text-charcoal-light mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full bg-white border border-warm-gray px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                  placeholder="Confirm your password"
                />
              </div>
              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full"
              >
                Create Account
              </Button>
              <p className="text-[12px] text-charcoal-light text-center leading-relaxed">
                By creating an account, you agree to our{" "}
                <Link
                  href="/policies#privacy-policy"
                  className="text-gold hover:text-gold-dark transition-colors"
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/policies"
                  className="text-gold hover:text-gold-dark transition-colors"
                >
                  Terms of Service
                </Link>
                .
              </p>
            </motion.form>
          )}
        </div>
      </section>

      {/* ─── Coming Soon Features ─────────────────────────── */}
      <section className="py-24 md:py-32 bg-cream-dark">
        <div className="container-gallery">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block bg-gold/10 text-gold text-[10px] tracking-[0.15em] uppercase px-4 py-1.5 mb-6">
                Coming Soon
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-black font-medium mb-4">
                Your Personal Art Space
              </h2>
              <div className="divider-gold mx-auto mb-8" />
              <p className="text-charcoal-light max-w-lg mx-auto leading-relaxed mb-12">
                We are building an exclusive collector experience. Soon you will
                be able to manage your collection, track orders, and access
                members-only content.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  {
                    title: "Collection Tracker",
                    description:
                      "View your acquired artworks, certificates, and provenance documents in one place.",
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    ),
                  },
                  {
                    title: "Order History",
                    description:
                      "Track past purchases, shipping status, and download invoices anytime.",
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    ),
                  },
                  {
                    title: "VIP Access",
                    description:
                      "Early access to new works, exclusive previews, and members-only events.",
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ),
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="bg-white p-6 md:p-8 text-center"
                  >
                    <div className="text-gold mb-4 flex justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="font-serif text-base text-black mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-charcoal-light leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <p className="text-sm text-charcoal-light mb-4">
                  Want to be notified when full account features launch?
                </p>
                <Link href="/contact">
                  <Button variant="outline">Join the Waitlist</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
