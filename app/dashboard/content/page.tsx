"use client";

import { KanbanBoard, type KanbanColumn, type KanbanCard } from "@/components/KanbanBoard";

const columns: KanbanColumn[] = [
  { id: "idea", label: "IDEA", color: "#6366f1" },
  { id: "script", label: "SCRIPT", color: "#8b5cf6" },
  { id: "creative_brief", label: "CREATIVE BRIEF", color: "#a855f7" },
  { id: "compliance_review", label: "COMPLIANCE REVIEW", color: "#f59e0b" },
  { id: "human_approval", label: "HUMAN APPROVAL", color: "#ef4444" },
  { id: "scheduled", label: "SCHEDULED", color: "#3b82f6" },
  { id: "published", label: "PUBLISHED", color: "#22c55e" },
  { id: "evaluated", label: "EVALUATED", color: "#6b7280" },
];

const demoCards: KanbanCard[] = [
  { id: "c1", columnId: "idea", title: "AI Productivity Review", subtitle: "TikTok 9:16", tags: ["tiktok", "new"] },
  { id: "c2", columnId: "idea", title: "Top 5 AI Tools", subtitle: "YouTube 16:9", tags: ["youtube"] },
  { id: "c3", columnId: "script", title: "Affiliate Marketing Guide", subtitle: "Instagram 1:1", tags: ["instagram"] },
  { id: "c4", columnId: "compliance_review", title: "Course Review Video", subtitle: "Needs disclosure check", tags: ["compliance"] },
  { id: "c5", columnId: "published", title: "Quick AI Tip #3", subtitle: "TikTok — 12k views", tags: ["tiktok", "live"] },
];

export default function ContentPage() {
  function handleCardMove(cardId: string, from: string, to: string) {
    // In production: PATCH /api/content with status update + audit log
    console.log(`Card ${cardId} moved: ${from} → ${to}`);
  }

  return (
    <div>
      <h1>Content Pipeline</h1>
      <p style={{ color: "#666", marginBottom: "1rem" }}>
        Drag cards between columns to update status. Blocked content cannot enter publishing state.
      </p>

      <KanbanBoard columns={columns} initialCards={demoCards} onCardMove={handleCardMove} />

      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          background: "#fff4f4",
          borderRadius: 8,
          border: "1px solid #fecaca",
        }}
      >
        <strong>Blocked content cannot enter publishing state.</strong> Human approval is required for all content before it moves to SCHEDULED or PUBLISHED.
      </div>
    </div>
  );
}
