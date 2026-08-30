type WrapLogoProps = {
  className?: string
}

export function WrapLogo({ className }: WrapLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse cx="32" cy="36" rx="26" ry="18" fill="#c98d63" />
      <ellipse cx="32" cy="34" rx="22" ry="14" fill="#e8c39a" />
      <path
        d="M12 34c6-8 14-12 20-12s14 4 20 12"
        stroke="#8f5a38"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M16 38c5 6 12 9 16 9s11-3 16-9"
        stroke="#8f5a38"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path d="M22 28c4-2 8-2 12 0" stroke="#6b8f3d" strokeWidth="3" strokeLinecap="round" />
      <path d="M28 31c3-1 6-1 9 1" stroke="#c4452d" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="38" cy="29" r="2.2" fill="#d4a017" />
    </svg>
  )
}
