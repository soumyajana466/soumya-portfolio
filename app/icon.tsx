import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
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
          background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 50%, #6366f1 100%)",
          borderRadius: "50%",
          color: "#ffffff",
          fontSize: 15,
          fontWeight: 800,
          fontFamily: "sans-serif",
          letterSpacing: "-0.5px",
        }}
      >
        SJ
      </div>
    ),
    { ...size }
  );
}
