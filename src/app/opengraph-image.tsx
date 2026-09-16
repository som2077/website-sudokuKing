import { ImageResponse } from "next/og";

export const alt = "Sudoku King — Play Sudoku and learn solving techniques";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #fff7ed 0%, #ede9fe 52%, #dbeafe 100%)",
          color: "#0f172a",
          display: "flex",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: "720px" }}>
          <div style={{ color: "#a16207", display: "flex", fontSize: 32, fontWeight: 700 }}>
            SUDOKU KING
          </div>
          <div style={{ display: "flex", fontSize: 78, fontWeight: 800, letterSpacing: "-4px", lineHeight: 1.02, marginTop: 26 }}>
            Play. Learn. Master Sudoku.
          </div>
          <div style={{ color: "#475569", display: "flex", fontSize: 32, lineHeight: 1.3, marginTop: 30 }}>
            Daily puzzles, smart hints, and step-by-step solving guides.
          </div>
        </div>
        <div
          style={{
            alignItems: "center",
            background: "#ffffff",
            border: "14px solid #0f172a",
            borderRadius: 36,
            display: "flex",
            fontSize: 68,
            fontWeight: 800,
            height: 330,
            justifyContent: "center",
            width: 330,
          }}
        >
          9×9
        </div>
      </div>
    ),
    size,
  );
}
