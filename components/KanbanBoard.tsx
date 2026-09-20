"use client";

import { useState, useCallback } from "react";

export type KanbanColumn = {
  id: string;
  label: string;
  color?: string;
};

export type KanbanCard = {
  id: string;
  columnId: string;
  title: string;
  subtitle?: string;
  tags?: string[];
};

type DragData = { cardId: string; fromColumn: string };

export function KanbanBoard({
  columns,
  initialCards,
  onCardMove,
}: {
  columns: KanbanColumn[];
  initialCards: KanbanCard[];
  onCardMove?: (cardId: string, from: string, to: string) => void;
}) {
  const [cards, setCards] = useState<KanbanCard[]>(initialCards);
  const [dragging, setDragging] = useState<DragData | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  const cardsByColumn = useCallback(
    (colId: string) => cards.filter((c) => c.columnId === colId),
    [cards]
  );

  function handleDragStart(e: React.DragEvent, cardId: string, fromColumn: string) {
    setDragging({ cardId, fromColumn });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", cardId);
  }

  function handleDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverColumn(colId);
  }

  function handleDragLeave() {
    setOverColumn(null);
  }

  function handleDrop(e: React.DragEvent, toColumn: string) {
    e.preventDefault();
    setOverColumn(null);
    if (!dragging) return;
    if (dragging.fromColumn === toColumn) return;

    setCards((prev) =>
      prev.map((c) => (c.id === dragging.cardId ? { ...c, columnId: toColumn } : c))
    );
    onCardMove?.(dragging.cardId, dragging.fromColumn, toColumn);
    setDragging(null);
  }

  function handleDragEnd() {
    setDragging(null);
    setOverColumn(null);
  }

  return (
    <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1rem" }}>
      {columns.map((col) => {
        const colCards = cardsByColumn(col.id);
        const isOver = overColumn === col.id;
        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            style={{
              minWidth: 220,
              flex: "0 0 220px",
              background: isOver ? "#e8f4fd" : "#f9f9f9",
              borderRadius: 8,
              padding: "0.75rem",
              border: isOver ? "2px dashed #3b82f6" : "2px solid transparent",
              transition: "background 0.15s, border 0.15s",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <h4 style={{ margin: 0, fontSize: "0.85rem" }}>{col.label}</h4>
              <span
                style={{
                  background: col.color || "#ddd",
                  color: "#fff",
                  borderRadius: 12,
                  padding: "0.1rem 0.5rem",
                  fontSize: "0.75rem",
                }}
              >
                {colCards.length}
              </span>
            </div>
            {colCards.map((card) => (
              <div
                key={card.id}
                draggable
                onDragStart={(e) => handleDragStart(e, card.id, card.columnId)}
                onDragEnd={handleDragEnd}
                style={{
                  padding: "0.5rem",
                  marginBottom: "0.5rem",
                  background: "#fff",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  cursor: "grab",
                  opacity: dragging?.cardId === card.id ? 0.5 : 1,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ fontWeight: 500, fontSize: "0.85rem" }}>{card.title}</div>
                {card.subtitle && (
                  <div style={{ fontSize: "0.75rem", color: "#666", marginTop: 2 }}>{card.subtitle}</div>
                )}
                {card.tags && card.tags.length > 0 && (
                  <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                    {card.tags.map((t) => (
                      <span key={t} style={{ fontSize: "0.65rem", background: "#e5e7eb", borderRadius: 4, padding: "0.1rem 0.35rem" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
