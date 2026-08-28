import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function BrandLogo({ className = "", size = "md" }: BrandLogoProps) {
  const imageHeights = {
    sm: "h-8",
    md: "h-10 sm:h-11",
    lg: "h-12 sm:h-13",
    xl: "h-14 sm:h-16",
  };

  return (
    <Link
      href="/"
      className={`inline-flex items-center transition-opacity hover:opacity-90 ${className}`}
      aria-label="D-One Studio"
    >
      <img
        src="/images/logo.png"
        alt="D-One Studio"
        className={`${imageHeights[size]} w-auto object-contain max-w-[220px]`}
      />
    </Link>
  );
}
