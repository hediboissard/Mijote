import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          style={{ display: "block" }}
        >
          <path
            d="M12 2c1.5 2 4 5 4 8 0 4-2 7-4 9-2-2-4-5-4-9 0-3 2.5-6 4-8z"
            fill="#2d6a4f"
          />
          <rect
            x="10.5"
            y="15"
            width="2.5"
            height="6"
            rx="0.5"
            fill="#2d6a4f"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
