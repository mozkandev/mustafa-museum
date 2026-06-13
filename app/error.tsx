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
      {error?.message && (
        <pre
          style={{
            background: "#1a1a2e",
            color: "#fca5a5",
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            fontSize: "0.85rem",
            maxWidth: 900,
            overflow: "auto",
            marginBottom: "1.5rem",
            textAlign: "left",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {error.message}
          {error.stack ? "\n\nSTACK:\n" + error.stack : ""}
          {error.digest ? "\n\nDIGEST: " + error.digest : ""}
        </pre>
      )}
      <div style={{ display: "flex", gap: "1rem" }}>
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
    </div>
  );
}
