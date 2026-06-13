"use client";
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a14",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>3D scene failed to load</h1>
      <p style={{ color: "#a8a29e", marginBottom: "1.5rem", maxWidth: 600 }}>
        {error?.message || "An error occurred while loading the 3D scene. This is usually a missing or slow texture from Wikimedia Commons."}
      </p>
      <button
        onClick={() => {
          try { reset?.(); } catch {}
          if (typeof window !== "undefined") window.location.href = "/";
        }}
        style={{
          background: "#d4af37",
          color: "#0a0a14",
          padding: "0.75rem 1.5rem",
          border: "none",
          borderRadius: "0.5rem",
          fontSize: "1rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        ← Back to Timeline
      </button>
    </div>
  );
}
