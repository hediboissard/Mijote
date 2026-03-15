import Link from "next/link";

interface Props {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  asLink?: boolean;
}

export default function MijoteLogo({
  size = "md",
  showText = true,
  asLink = false,
}: Props) {
  const sizes = { sm: 20, md: 24, lg: 28 };
  const iconSize = sizes[size];
  const textSizes = { sm: "text-sm", md: "text-lg", lg: "text-xl" };

  const icon = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      className="flex-shrink-0 self-center"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <path
        d="M12 2c1.5 2 4 5 4 8 0 4-2 7-4 9-2-2-4-5-4-9 0-3 2.5-6 4-8z"
        fill="#2d6a4f"
      />
      <rect x="10.5" y="15" width="2.5" height="6" rx="0.5" fill="#2d6a4f" />
    </svg>
  );

  const content = (
    <span
      className="inline-flex items-center justify-center gap-2 font-semibold leading-none text-[#2d6a4f]"
      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
    >
      {icon}
      {showText && <span className={`${textSizes[size]} self-center`} style={{ lineHeight: 1 }}>Mijoté</span>}
    </span>
  );

  if (asLink) {
    return (
      <Link href="/" className="inline-flex items-center hover:opacity-90 transition">
        {content}
      </Link>
    );
  }

  return content;
}
