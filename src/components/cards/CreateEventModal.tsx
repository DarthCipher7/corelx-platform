"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Button from "@/components/ui/Button";
import TrustTierBadge from "@/components/ui/TrustTierBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category =
  | "sports"
  | "music"
  | "academic"
  | "social"
  | "hackathon"
  | "misc";
type TrustTier = "open" | "checked" | "guarded";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: {
  id: Category;
  emoji: string;
  label: string;
}[] = [
  { id: "sports", emoji: "🏃", label: "Sports" },
  { id: "music", emoji: "🎵", label: "Music" },
  { id: "academic", emoji: "📚", label: "Academic" },
  { id: "social", emoji: "🎉", label: "Social" },
  { id: "hackathon", emoji: "💡", label: "Hackathon" },
  { id: "misc", emoji: "✨", label: "Misc" },
];

const TRUST_TIERS: {
  id: TrustTier;
  icon: string;
  title: string;
  subtitle: string;
  detail: string;
  color: string;
  borderColor: string;
  bgColor: string;
  recommended?: boolean;
}[] = [
  {
    id: "open",
    icon: "🔓",
    title: "Open",
    subtitle: "Anyone on campus can join instantly",
    detail: "Best for casual hangouts, jamming sessions, game nights",
    color: "#00b894",
    borderColor: "rgba(0,184,148,0.5)",
    bgColor: "rgba(0,184,148,0.08)",
  },
  {
    id: "checked",
    icon: "🛡️",
    title: "Checked",
    subtitle: "Campus location verified at join time",
    detail:
      "One-time GPS ping confirms they're on campus. Nothing stored.",
    color: "#00d2ff",
    borderColor: "rgba(0,210,255,0.5)",
    bgColor: "rgba(0,210,255,0.08)",
    recommended: true,
  },
  {
    id: "guarded",
    icon: "🔒",
    title: "Guarded",
    subtitle: "You approve each person manually",
    detail:
      "For sensitive events — small groups, women-only spaces, mental health circles",
    color: "#a29bfe",
    borderColor: "rgba(108,92,231,0.5)",
    bgColor: "rgba(108,92,231,0.08)",
  },
];

const TOTAL_STEPS = 5;

// ─── Step Slide Variants ──────────────────────────────────────────────────────

function getVariants(direction: 1 | -1) {
  return {
    enter: {
      x: direction * 60,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" as const },
    },
    exit: {
      x: direction * -60,
      opacity: 0,
      transition: { duration: 0.22, ease: "easeIn" as const },
    },
  };
}

// ─── Input styling ────────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-[var(--bg-frosted)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-3 text-[var(--text-primary)] outline-none transition-all duration-200 placeholder:text-[var(--text-muted)] text-sm";

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateEventModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
}: CreateEventModalProps) {
  // Navigation state
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Form state
  const [category, setCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [locationName, setLocationName] = useState("");
  const [hasLimit, setHasLimit] = useState(false);
  const [maxHeadcount, setMaxHeadcount] = useState(10);
  const [selectedTier, setSelectedTier] = useState<TrustTier>("checked");
  const [requireFace, setRequireFace] = useState(false);
  const [requireMutual, setRequireMutual] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Today's date string ────────────────────────────────────────────────────
  const todayStr = new Date().toISOString().split("T")[0];

  // ─── Navigation ─────────────────────────────────────────────────────────────

  function goNext() {
    if (!canProceed()) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  function canProceed(): boolean {
    switch (step) {
      case 1:
        return category !== null;
      case 2:
        return title.trim().length > 0;
      case 3:
        return date !== "" && startTime !== "" && endTime !== "";
      case 4:
        return !hasLimit || maxHeadcount >= 2;
      default:
        return true;
    }
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!category) return;
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase
        .from("events")
        .insert({
          organiser_id: userId,
          title: title.trim(),
          description: description.trim() || null,
          category,
          trust_tier: selectedTier,
          location_name: locationName.trim() || null,
          starts_at: new Date(`${date}T${startTime}`).toISOString(),
          ends_at: new Date(`${date}T${endTime}`).toISOString(),
          max_headcount: hasLimit ? maxHeadcount : null,
          require_mutual: requireMutual,
          require_face: requireFace,
        });

      if (insertError) throw insertError;
      onSuccess();
      onClose();
      resetForm();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setStep(1);
    setDirection(1);
    setCategory(null);
    setTitle("");
    setDescription("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setLocationName("");
    setHasLimit(false);
    setMaxHeadcount(10);
    setSelectedTier("checked");
    setRequireFace(false);
    setRequireMutual(false);
    setError(null);
  }

  function handleClose() {
    if (submitting) return;
    onClose();
    resetForm();
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal card */}
          <motion.div
            key="modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-lg mx-4 pointer-events-auto"
              initial={{ scale: 0.94, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 16, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="relative rounded-3xl p-6 shadow-2xl overflow-hidden"
                style={{
                  background: "var(--bg-deep)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                {/* Subtle glow top-right */}
                <div
                  className="pointer-events-none absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(108,92,231,0.5) 0%, transparent 70%)",
                  }}
                />

                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-frosted)] transition-all duration-150 z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Progress dots */}
                <ProgressDots current={step} total={TOTAL_STEPS} />

                {/* Step content */}
                <div className="min-h-[340px] mt-6 relative overflow-hidden">
                  <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.div
                      key={step}
                      custom={direction}
                      variants={getVariants(direction)}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="w-full"
                    >
                      {step === 1 && (
                        <StepCategory
                          selected={category}
                          onSelect={setCategory}
                        />
                      )}
                      {step === 2 && (
                        <StepTitleDescription
                          title={title}
                          setTitle={setTitle}
                          description={description}
                          setDescription={setDescription}
                        />
                      )}
                      {step === 3 && (
                        <StepTimeLocation
                          date={date}
                          setDate={setDate}
                          startTime={startTime}
                          setStartTime={setStartTime}
                          endTime={endTime}
                          setEndTime={setEndTime}
                          locationName={locationName}
                          setLocationName={setLocationName}
                          todayStr={todayStr}
                        />
                      )}
                      {step === 4 && (
                        <StepHeadcount
                          hasLimit={hasLimit}
                          setHasLimit={setHasLimit}
                          maxHeadcount={maxHeadcount}
                          setMaxHeadcount={setMaxHeadcount}
                        />
                      )}
                      {step === 5 && (
                        <StepTrustTier
                          selected={selectedTier}
                          onSelect={setSelectedTier}
                          requireFace={requireFace}
                          setRequireFace={setRequireFace}
                          requireMutual={requireMutual}
                          setRequireMutual={setRequireMutual}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Error message */}
                {error && (
                  <p className="mt-3 text-xs text-red-400 text-center">
                    {error}
                  </p>
                )}

                {/* Bottom navigation */}
                <div className="mt-6 flex items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goBack}
                    disabled={step === 1 || submitting}
                    icon={<ChevronLeft className="w-4 h-4" />}
                    className="opacity-70 disabled:opacity-30"
                  >
                    Back
                  </Button>

                  {step < TOTAL_STEPS ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={goNext}
                      disabled={!canProceed()}
                      iconRight={<ChevronRight className="w-4 h-4" />}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSubmit}
                      loading={submitting}
                      disabled={submitting}
                    >
                      {submitting ? "Posting…" : "Post Event"}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Progress Dots ────────────────────────────────────────────────────────────

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      {Array.from({ length: total }).map((_, i) => {
        const active = i + 1 === current;
        const done = i + 1 < current;
        return (
          <motion.div
            key={i}
            className="rounded-full flex items-center justify-center"
            animate={{
              width: active ? 28 : 8,
              background: done
                ? "var(--accent-primary)"
                : active
                ? "var(--accent-primary)"
                : "rgba(255,255,255,0.12)",
            }}
            style={{ height: 8 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {done && (
              <Check
                className="w-2.5 h-2.5 text-white"
                strokeWidth={3}
              />
            )}
          </motion.div>
        );
      })}
      <span className="ml-auto text-[11px] font-mono text-[var(--text-muted)]">
        {current} / {total}
      </span>
    </div>
  );
}

// ─── Step 1: Category ─────────────────────────────────────────────────────────

function StepCategory({
  selected,
  onSelect,
}: {
  selected: Category | null;
  onSelect: (c: Category) => void;
}) {
  return (
    <div>
      <StepHeader>What kind of event?</StepHeader>
      <div className="grid grid-cols-3 gap-3 mt-5">
        {CATEGORIES.map((cat) => {
          const isSelected = selected === cat.id;
          return (
            <motion.button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className="relative flex flex-col items-center justify-center gap-2 rounded-2xl p-4 border transition-all duration-200 cursor-pointer select-none"
              style={{
                background: isSelected
                  ? "rgba(108,92,231,0.12)"
                  : "var(--bg-deep)",
                border: isSelected
                  ? "1.5px solid var(--accent-primary)"
                  : "1.5px solid var(--glass-border)",
                boxShadow: isSelected
                  ? "0 0 16px rgba(108,92,231,0.25), inset 0 0 12px rgba(108,92,231,0.07)"
                  : "none",
              }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              {isSelected && (
                <motion.div
                  layoutId="category-glow"
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 30%, rgba(108,92,231,0.18) 0%, transparent 70%)",
                  }}
                  transition={{ duration: 0.2 }}
                />
              )}
              <span className="text-3xl leading-none">{cat.emoji}</span>
              <span
                className="text-xs font-medium"
                style={{
                  color: isSelected
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                }}
              >
                {cat.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2: Title & Description ─────────────────────────────────────────────

function StepTitleDescription({
  title,
  setTitle,
  description,
  setDescription,
}: {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <StepHeader>Give it a name</StepHeader>

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
          Event title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          className={inputCls}
          placeholder="e.g. Midnight Chess Blitz, Open Mic Vol.3…"
          maxLength={80}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end mt-1">
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            {title.length} / 80
          </span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
          Description{" "}
          <span className="text-[var(--text-muted)]">(optional)</span>
        </label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={4}
          placeholder="What's this event about? Who's it for?"
          maxLength={300}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex justify-end mt-1">
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            {description.length} / 300
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Time & Location ──────────────────────────────────────────────────

function StepTimeLocation({
  date,
  setDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  locationName,
  setLocationName,
  todayStr,
}: {
  date: string;
  setDate: (v: string) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;
  locationName: string;
  setLocationName: (v: string) => void;
  todayStr: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <StepHeader>When and where?</StepHeader>

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
          Date <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          className={inputCls}
          min={todayStr}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ colorScheme: "dark" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            Start time <span className="text-red-400">*</span>
          </label>
          <input
            type="time"
            className={inputCls}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{ colorScheme: "dark" }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            End time <span className="text-red-400">*</span>
          </label>
          <input
            type="time"
            className={inputCls}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={{ colorScheme: "dark" }}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
          Location{" "}
          <span className="text-[var(--text-muted)]">(optional)</span>
        </label>
        <input
          type="text"
          className={inputCls}
          placeholder="e.g. Main Quad, LT-5, Library Terrace…"
          maxLength={80}
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
        />
      </div>
    </div>
  );
}

// ─── Step 4: Headcount ────────────────────────────────────────────────────────

function StepHeadcount({
  hasLimit,
  setHasLimit,
  maxHeadcount,
  setMaxHeadcount,
}: {
  hasLimit: boolean;
  setHasLimit: (v: boolean) => void;
  maxHeadcount: number;
  setMaxHeadcount: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <StepHeader>How many people?</StepHeader>

      {/* Toggle */}
      <div
        className="flex rounded-xl overflow-hidden border"
        style={{ borderColor: "var(--glass-border)" }}
      >
        {[
          { label: "Open to all", value: false },
          { label: "Set a limit", value: true },
        ].map(({ label, value }) => (
          <button
            key={label}
            onClick={() => setHasLimit(value)}
            className="flex-1 py-2.5 text-sm font-medium transition-all duration-200"
            style={{
              background:
                hasLimit === value
                  ? "rgba(108,92,231,0.18)"
                  : "transparent",
              color:
                hasLimit === value
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              borderRight:
                value === false ? "1px solid var(--glass-border)" : "none",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Limit input */}
      <AnimatePresence>
        {hasLimit && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Max attendees
            </label>
            <input
              type="number"
              className={inputCls}
              min={2}
              max={10000}
              value={maxHeadcount}
              onChange={(e) =>
                setMaxHeadcount(Math.max(2, parseInt(e.target.value) || 2))
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview */}
      <div
        className="rounded-xl px-4 py-3 text-sm text-center"
        style={{
          background: "var(--bg-frosted)",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-secondary)",
        }}
      >
        {hasLimit ? (
          <span>
            You{" "}
            <span className="text-[var(--text-primary)] font-semibold">+</span>{" "}
            up to{" "}
            <span className="text-[var(--accent-primary)] font-bold font-mono">
              {maxHeadcount - 1}
            </span>{" "}
            others
          </span>
        ) : (
          <span>Open to everyone on campus — no cap 🚀</span>
        )}
      </div>
    </div>
  );
}

// ─── Step 5: Trust Tier ───────────────────────────────────────────────────────

function StepTrustTier({
  selected,
  onSelect,
  requireFace,
  setRequireFace,
  requireMutual,
  setRequireMutual,
}: {
  selected: TrustTier;
  onSelect: (t: TrustTier) => void;
  requireFace: boolean;
  setRequireFace: (v: boolean) => void;
  requireMutual: boolean;
  setRequireMutual: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <StepHeader>Who can join?</StepHeader>

      {TRUST_TIERS.map((tier) => {
        const isSelected = selected === tier.id;
        return (
          <motion.button
            key={tier.id}
            onClick={() => onSelect(tier.id)}
            className="w-full text-left rounded-2xl p-4 border transition-all duration-200 cursor-pointer"
            style={{
              background: isSelected ? tier.bgColor : "var(--bg-frosted)",
              border: isSelected
                ? `1.5px solid ${tier.borderColor}`
                : "1.5px solid var(--glass-border)",
              boxShadow: isSelected
                ? `0 0 18px ${tier.borderColor.replace("0.5", "0.18")}`
                : "none",
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.12 }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-tight mt-0.5">{tier.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="font-semibold text-sm"
                    style={{ color: isSelected ? tier.color : "var(--text-primary)" }}
                  >
                    {tier.title}
                  </span>
                  {tier.recommended && (
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded-full border"
                      style={{
                        color: tier.color,
                        borderColor: tier.borderColor,
                        background: tier.bgColor,
                      }}
                    >
                      Recommended
                    </span>
                  )}
                  <TrustTierBadge tier={tier.id} size="sm" />
                </div>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {tier.subtitle}
                </p>
                <p
                  className="text-[11px] mt-1 leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  {tier.detail}
                </p>
              </div>
            </div>

            {/* Guarded extra options */}
            <AnimatePresence>
              {isSelected && tier.id === "guarded" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="mt-3 pt-3 flex flex-col gap-2"
                    style={{
                      borderTop: "1px solid rgba(108,92,231,0.2)",
                    }}
                  >
                    <CheckboxRow
                      id="require_face"
                      label="Require face liveness check"
                      checked={requireFace}
                      onChange={setRequireFace}
                    />
                    <CheckboxRow
                      id="require_mutual"
                      label="Require prior shared event (mutual connection)"
                      checked={requireMutual}
                      onChange={setRequireMutual}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-lg font-semibold"
      style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
    >
      {children}
    </h2>
  );
}

function CheckboxRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2.5 cursor-pointer group"
    >
      <div
        className="relative w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all duration-150"
        style={{
          background: checked ? "var(--accent-primary)" : "transparent",
          borderColor: checked
            ? "var(--accent-primary)"
            : "rgba(108,92,231,0.3)",
        }}
      >
        <input
          id={id}
          type="checkbox"
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
        {label}
      </span>
    </label>
  );
}
