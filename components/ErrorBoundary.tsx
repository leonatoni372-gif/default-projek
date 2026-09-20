"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              padding: "2rem",
              margin: "1rem",
              background: "#fff4f4",
              border: "1px solid #fcc",
              borderRadius: "8px",
            }}
          >
            <h2 style={{ color: "#c00" }}>Something went wrong</h2>
            <p style={{ color: "#666" }}>{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                background: "#c00",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
