"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Send, CheckCircle2, AlertCircle, Clock, ShieldCheck, Sparkles, MessageSquare } from "lucide-react";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
  _bot_hp: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactClient() {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    subject: "General",
    message: "",
    _bot_hp: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.subject) {
      newErrors.subject = "Please choose a subject.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required.";
    } else if (formData.message.trim().length < 20) {
      newErrors.message = `Please write at least 20 characters (current: ${formData.message.trim().length}).`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setServerError(data.error || "Something went wrong. Please try again.");
      } else {
        setServerSuccess(data.message || "Thanks! We will get back to you within 48 hours.");
        setFormData({
          name: "",
          email: "",
          subject: "General",
          message: "",
          _bot_hp: "",
        });
        setErrors({});
      }
    } catch {
      setServerError("Network failure. Please check your connection and retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] pt-28 pb-32 relative overflow-hidden">
      {/* Background radial glows */}
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none opacity-20 blur-[130px]"
        style={{
          background: "radial-gradient(circle, #6c5ce7 0%, #00d2ff 60%, transparent 80%)",
        }}
      />
      <div className="absolute inset-0 dot-bg opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
            <span className="text-[var(--accent-cyan)] uppercase tracking-wider">Transmission Protocol</span>
          </div>
          <h1
            className="text-4xl sm:text-6xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Get in touch with <span className="gradient-text">CORELX.</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            Direct channels for creators, partners, campuses, and press. Every transmission is routed directly to the core engineering and product team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Form Column (7 cols) */}
          <div className="lg:col-span-7">
            <div
              className="rounded-2xl p-7 sm:p-10 border border-[var(--glass-border)] relative"
              style={{
                background: "var(--glass-card-bg)",
                backdropFilter: "blur(24px)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <h2
                className="text-2xl font-bold mb-6 text-[var(--text-primary)] flex items-center gap-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <MessageSquare className="w-5 h-5 text-[var(--accent-cyan)]" />
                Send a Message
              </h2>

              <AnimatePresence>
                {serverSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 rounded-xl border border-[#00cec9]/40 bg-[#00cec9]/10 text-sm flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#00cec9] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">Transmission Delivered</p>
                      <p className="text-[var(--text-secondary)] text-xs mt-0.5">{serverSuccess}</p>
                    </div>
                  </motion.div>
                )}

                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 rounded-xl border border-[var(--accent-magenta)]/40 bg-[var(--accent-magenta)]/10 text-sm flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-[var(--accent-magenta)] flex-shrink-0 mt-0.5" />
                    <p className="text-[var(--text-primary)] text-xs">{serverError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Honeypot field (hidden from real users) */}
                <input
                  type="text"
                  name="_bot_hp"
                  value={formData._bot_hp}
                  onChange={(e) => setFormData({ ...formData, _bot_hp: e.target.value })}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
                      Your Name <span className="text-[var(--accent-cyan)]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Devika Sharma"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: undefined });
                      }}
                      className={`w-full bg-[var(--bg-deep)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                        errors.name
                          ? "border-[var(--accent-magenta)] focus:ring-1 focus:ring-[var(--accent-magenta)]"
                          : "border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-[var(--accent-magenta)] mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email field */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
                      Email Address <span className="text-[var(--accent-cyan)]">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="devika@campus.edu"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      className={`w-full bg-[var(--bg-deep)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                        errors.email
                          ? "border-[var(--accent-magenta)] focus:ring-1 focus:ring-[var(--accent-magenta)]"
                          : "border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-[var(--accent-magenta)] mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Subject selector */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
                    Inquiry Subject <span className="text-[var(--accent-cyan)]">*</span>
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                  >
                    <option value="General">General Inquiry</option>
                    <option value="Partnerships">Campus & Brand Partnerships</option>
                    <option value="Press">Press & Media</option>
                    <option value="Support">Creator Support & SafeMode Assistance</option>
                    <option value="Careers">Careers & Collabs</option>
                  </select>
                </div>

                {/* Message field */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                      Message <span className="text-[var(--accent-cyan)]">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">
                      {formData.message.trim().length}/20 min chars
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    placeholder="Tell us what you are building, how we can collaborate, or what you need assistance with..."
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: undefined });
                    }}
                    className={`w-full bg-[var(--bg-deep)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border rounded-xl p-4 text-sm focus:outline-none transition-all resize-none ${
                      errors.message
                        ? "border-[var(--accent-magenta)] focus:ring-1 focus:ring-[var(--accent-magenta)]"
                        : "border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]"
                    }`}
                  />
                  {errors.message && (
                    <p className="text-xs text-[var(--accent-magenta)] mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl font-medium text-sm text-[var(--text-primary)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #6c5ce7, #00d2ff)",
                    boxShadow: "0 0 20px rgba(108,92,231,0.35)",
                  }}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Encrypting & Transmitting...
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Transmit Transmission
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Direct channels & info sidebar (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct Email Cards */}
            <div
              className="rounded-2xl p-6 sm:p-7 border border-[var(--glass-border)]"
              style={{ background: "var(--glass-card-bg)" }}
            >
              <h3
                className="text-lg font-bold mb-4 text-[var(--text-primary)] flex items-center gap-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <Mail className="w-4 h-4 text-[var(--accent-cyan)]" />
                Direct Routing Inboxes
              </h3>

              <div className="space-y-4">
                <a
                  href="mailto:support@corelx.app"
                  className="block p-3.5 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] bg-[var(--bg-surface)] transition-all group"
                >
                  <p className="text-xs text-[var(--accent-cyan)] font-mono uppercase tracking-wider mb-0.5">
                    Creator Support & SafeMode
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                    support@corelx.app
                  </p>
                </a>

                <a
                  href="mailto:partners@corelx.app"
                  className="block p-3.5 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] bg-[var(--bg-surface)] transition-all group"
                >
                  <p className="text-xs text-[var(--accent-primary)] font-mono uppercase tracking-wider mb-0.5">
                    Campus Clubs & Partners
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                    partners@corelx.app
                  </p>
                </a>

                <a
                  href="mailto:press@corelx.app"
                  className="block p-3.5 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] bg-[var(--bg-surface)] transition-all group"
                >
                  <p className="text-xs text-[#fd79a8] font-mono uppercase tracking-wider mb-0.5">
                    Press & Media Queries
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#fd79a8] transition-colors">
                    press@corelx.app
                  </p>
                </a>
              </div>
            </div>

            {/* SLA / Response time guarantee */}
            <div
              className="rounded-2xl p-6 border border-[var(--glass-border)]"
              style={{ background: "rgba(10, 10, 30, 0.6)" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--bg-frosted)] border border-[var(--border-subtle)] flex items-center justify-center flex-shrink-0 text-[var(--accent-cyan)]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Response SLA</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    We respond within <strong className="text-[var(--text-primary)]">48 hours</strong> to all creator and partner inquiries. Critical security or SafeMode flags are escalated immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Verified Infrastructure */}
            <div
              className="rounded-2xl p-6 border border-[var(--glass-border)]"
              style={{ background: "rgba(10, 10, 30, 0.6)" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--bg-frosted)] border border-[var(--border-subtle)] flex items-center justify-center flex-shrink-0 text-[#00cec9]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Privacy First</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    Your contact information is strictly handled according to our privacy policy. We never sell contact leads or transmit your identity to advertisers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
