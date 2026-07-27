"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/** Inline SVG mark — avoids Next/Image SVG breakage in production. */
export function KeraLogoMark({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 220"
      fill="none"
      role="img"
      aria-hidden
      width={size}
      height={Math.round(size * 1.1)}
      className={cn("shrink-0 drop-shadow-sm", className)}
    >
      <defs>
        <linearGradient id={`${uid}-blue-light`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5B9BD5" />
          <stop offset="100%" stopColor="#2E75B6" />
        </linearGradient>
        <linearGradient id={`${uid}-blue-mid`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3A6FA5" />
          <stop offset="100%" stopColor="#1B4F8A" />
        </linearGradient>
        <linearGradient id={`${uid}-blue-dark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2A5F8F" />
          <stop offset="100%" stopColor="#153D6B" />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B8860B" />
          <stop offset="35%" stopColor="#FFD700" />
          <stop offset="65%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1B365D" floodOpacity="0.1" />
        </filter>
      </defs>

      <g filter={`url(#${uid}-shadow)`}>
        <path
          d="M28 178 C55 196, 145 196, 172 178"
          stroke={`url(#${uid}-gold)`}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <polygon points="100,24 88,44 112,44" fill={`url(#${uid}-blue-light)`} />
        <polygon points="88,44 76,64 100,64" fill={`url(#${uid}-blue-dark)`} />
        <polygon points="88,44 100,64 112,44" fill={`url(#${uid}-blue-light)`} />
        <polygon points="112,44 100,64 124,64" fill={`url(#${uid}-blue-dark)`} />
        <polygon points="76,64 64,84 88,84" fill={`url(#${uid}-blue-dark)`} />
        <polygon points="76,64 88,84 100,64" fill={`url(#${uid}-blue-mid)`} />
        <polygon points="100,64 88,84 112,84" fill={`url(#${uid}-blue-light)`} />
        <polygon points="112,84 100,64 124,64" fill={`url(#${uid}-blue-dark)`} />
        <polygon points="124,64 112,84 136,84" fill={`url(#${uid}-blue-dark)`} />
        <polygon points="64,84 52,104 76,104" fill={`url(#${uid}-blue-dark)`} />
        <polygon points="64,84 76,104 88,84" fill={`url(#${uid}-blue-mid)`} />
        <polygon points="88,84 76,104 100,104" fill={`url(#${uid}-blue-light)`} />
        <polygon points="100,104 88,84 112,84" fill={`url(#${uid}-blue-mid)`} />
        <polygon points="112,84 100,104 124,104" fill={`url(#${uid}-blue-light)`} />
        <polygon points="124,104 112,84 136,84" fill={`url(#${uid}-blue-mid)`} />
        <polygon points="136,84 124,104 148,104" fill={`url(#${uid}-blue-dark)`} />
        <polygon points="52,104 40,124 64,124" fill={`url(#${uid}-blue-dark)`} />
        <polygon points="52,104 64,124 76,104" fill={`url(#${uid}-blue-mid)`} />
        <polygon points="76,104 64,124 88,124" fill={`url(#${uid}-blue-light)`} />
        <polygon points="88,124 76,104 100,104" fill={`url(#${uid}-blue-mid)`} />
        <polygon points="100,104 88,124 112,124" fill={`url(#${uid}-blue-light)`} />
        <polygon points="112,124 100,104 124,104" fill={`url(#${uid}-blue-mid)`} />
        <polygon points="124,104 112,124 136,124" fill={`url(#${uid}-blue-light)`} />
        <polygon points="136,124 124,104 148,104" fill={`url(#${uid}-blue-mid)`} />
        <polygon points="148,104 136,124 160,124" fill={`url(#${uid}-blue-dark)`} />
        <polygon points="64,124 52,144 76,144" fill={`url(#${uid}-blue-dark)`} />
        <polygon points="76,144 64,124 88,124" fill={`url(#${uid}-blue-mid)`} />
        <polygon points="88,124 76,144 100,144" fill={`url(#${uid}-blue-light)`} />
        <polygon points="100,144 88,124 112,124" fill={`url(#${uid}-blue-mid)`} />
        <polygon points="112,124 100,144 124,144" fill={`url(#${uid}-blue-light)`} />
        <polygon points="124,144 112,124 136,124" fill={`url(#${uid}-blue-mid)`} />
        <polygon points="136,124 124,144 148,144" fill={`url(#${uid}-blue-dark)`} />
        <g stroke="#FFFFFF" strokeWidth="1.2" strokeLinejoin="round" opacity="0.85" fill="none">
          <polygon points="100,24 88,44 112,44" />
          <polygon points="88,44 76,64 100,64 112,44" />
          <polygon points="100,64 112,44 124,64 112,84 100,64" />
          <polygon points="76,64 64,84 88,84 100,64 76,64" />
          <polygon points="112,84 100,64 124,64 136,84 124,104 112,84" />
          <polygon points="64,84 52,104 76,104 88,84 64,84" />
          <polygon points="88,84 76,104 100,104 112,84 88,84" />
          <polygon points="112,84 100,104 124,104 136,84 112,84" />
          <polygon points="52,104 40,124 64,124 76,104 52,104" />
          <polygon points="76,104 64,124 88,124 100,104 76,104" />
          <polygon points="100,104 88,124 112,124 124,104 100,104" />
          <polygon points="124,104 112,124 136,124 148,104 124,104" />
          <polygon points="64,124 52,144 76,144 88,124 64,124" />
          <polygon points="88,124 76,144 100,144 112,124 88,124" />
          <polygon points="112,124 100,144 124,144 136,124 112,124" />
          <polygon points="124,144 112,124 136,124 148,144 124,144" />
        </g>
      </g>
    </svg>
  );
}
