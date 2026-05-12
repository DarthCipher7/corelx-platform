"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "cyber" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantClass = {
  primary: "btn-primary",
  ghost: "btn-ghost",
  cyber: "btn-cyber",
  danger:
    "inline-flex items-center gap-2 px-6 py-3 rounded-full bg-transparent border border-red-500/40 text-red-400 text-sm font-medium hover:bg-red-500/10 hover:border-red-500/70 transition-all duration-200",
};

const sizeClass = {
  sm: "!py-2 !px-4 !text-xs",
  md: "",
  lg: "!py-4 !px-8 !text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  className,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={cn(variantClass[variant], sizeClass[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        icon
      )}
      {children}
      {iconRight}
    </motion.button>
  );
}
