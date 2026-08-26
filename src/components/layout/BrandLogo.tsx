import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BrandLogo({ className = "", size = "md" }: BrandLogoProps) {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const titleSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 group transition-transform hover:scale-[1.02] ${className}`}
    >
      {/* Stylized D-One Geometric Poly Icon */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(234,179,8,0.35)]"
        >
          {/* Outer Triangle Facet */}
          <polygon
            points="6,6 38,22 6,38"
            fill="url(#dOneGoldGrad)"
            stroke="url(#dOneEmeraldStroke)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Inner Facet / Cut */}
          <polygon
            points="14,14 30,22 14,30"
            fill="#080b0e"
            stroke="url(#dOneGoldGrad)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Center Gem Sparkle */}
          <polygon points="17,17 25,22 17,27" fill="url(#dOneEmeraldFill)" />
          <defs>
            <linearGradient id="dOneGoldGrad" x1="6" y1="6" x2="38" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fbbf24" />
              <stop offset="0.5" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="dOneEmeraldStroke" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22c55e" />
              <stop offset="1" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="dOneEmeraldFill" x1="17" y1="17" x2="25" y2="27" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4ade80" />
              <stop offset="1" stopColor="#16a34a" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-none">
        <div className={`font-black tracking-tight text-white flex items-center gap-0.5 ${titleSizes[size]}`}>
          <span>D</span>
          <span className="text-amber-400 font-black">-</span>
          <span className="text-white">ONE</span>
        </div>
        <span className="text-[9px] sm:text-[10px] font-extrabold tracking-[0.28em] uppercase text-emerald-400 mt-0.5">
          STUDIO EVENTS
        </span>
      </div>
    </Link>
  );
}
