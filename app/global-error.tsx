"use client";

// Global error boundary for the app router.
// Catches any client-side render failure and shows a recovery screen
// instead of Next.js' default "This page couldn't load" message.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
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
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Something went wrong</h1>
          <p style={{ color: "#a8a29e", marginBottom: "1.5rem", maxWidth: 600 }}>
            The 3D museum hit a runtime error. Most often this is a texture/image that failed to load.
            You can go back to the timeline or reload the page.
          </p>
          {error?.message && (
            <pre
              style={{
                background: "#1a1a2e",
                color: "#fca5a5",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                fontSize: "0.85rem",
                maxWidth: 800,
                overflow: "auto",
                marginBottom: "1.5rem",
              }}
            >
              {error.message}
            </pre>
          )}
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => {
                try {
                  reset?.();
                } catch {}
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
            <button
              onClick={() => typeof window !== "undefined" && window.location.reload()}
              style={{
                background: "transparent",
                color: "#d4af37",
                padding: "0.75rem 1.5rem",
                border: "1px solid #d4af37",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
