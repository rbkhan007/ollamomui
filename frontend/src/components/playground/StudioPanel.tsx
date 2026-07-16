"use client";

import {
  Play, Presentation, Video, BrainCircuit, FileSpreadsheet, BookOpen,
  MessageSquareText, BarChart3, Plus, Copy, Download, Trash2, Pencil, Check, X,
} from "lucide-react";
import { useState } from "react";
import { downloadMarkdown, type StudioArtifact } from "@/app/playground/studio";

export type GenerateKind = "mindmap" | "report" | "flashcards" | "quiz";

const studioItems: { icon: typeof Play; label: string; beta: boolean; gen: GenerateKind | null }[] = [
  { icon: Play, label: "Audio Overview", beta: false, gen: null },
  { icon: Presentation, label: "Slide Deck", beta: true, gen: null },
  { icon: Video, label: "Video Overview", beta: false, gen: null },
  { icon: BrainCircuit, label: "Mind Map", beta: false, gen: "mindmap" },
  { icon: FileSpreadsheet, label: "Reports", beta: false, gen: "report" },
  { icon: BookOpen, label: "Flashcards", beta: false, gen: "flashcards" },
  { icon: MessageSquareText, label: "Quiz", beta: false, gen: "quiz" },
  { icon: BarChart3, label: "Infographic", beta: true, gen: null },
  { icon: FileSpreadsheet, label: "Data Table", beta: false, gen: null },
];

export function StudioPanel({
  artifacts,
  onGenerate,
  onUpdate,
  onDelete,
}: {
  artifacts: StudioArtifact[];
  onGenerate: (kind: GenerateKind) => void;
  onUpdate: (a: StudioArtifact) => void;
  onDelete: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const saveEdit = () => {
    const v = editTitle.trim();
    if (!v || !editingId) return;
    const target = artifacts.find((a) => a.id === editingId);
    if (target) onUpdate({ ...target, title: v });
    setEditingId(null);
    setEditTitle("");
  };

  return (
    <div className={`w-80 rounded-xl p-4 flex flex-col gap-4 shrink-0 shadow-sm bg-[var(--surface)] border border-[var(--border)]`}>
      <h2 className="font-semibold" style={{ color: "var(--text)" }}>Studio</h2>

      <div className="grid grid-cols-3 gap-2">
        {studioItems.map((item) => (
          <button
            key={item.label}
            disabled={!item.gen}
            onClick={() => item.gen && onGenerate(item.gen)}
            title={item.gen ? `Generate ${item.label}` : `${item.label} (coming soon)`}
            className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-[var(--bg-2)] border border-[var(--border)] text-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--bg-2)]"
          >
            <item.icon className="w-5 h-5" style={{ color: "var(--text)" }} />
            <span className="text-[10px] leading-tight font-medium" style={{ color: "var(--text)" }}>{item.label}</span>
            {item.beta && <span className="text-[8px] bg-blue-500 text-white px-1 rounded">BETA</span>}
          </button>
        ))}
      </div>

      <div className="mt-2 flex-1 overflow-y-auto space-y-2">
        {artifacts.length === 0 ? (
          <p className="text-xs text-center pt-4" style={{ color: "var(--text-muted)" }}>
            Generated studio output appears here.
          </p>
        ) : (
          artifacts.map((a) => {
            const editing = editingId === a.id;
            return (
              <div
                key={a.id}
                className="text-xs px-3 py-2 rounded-lg bg-[var(--bg-2)] border border-[var(--border)]"
              >
                <div className="flex items-center justify-between gap-2">
                  {editing ? (
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                      className="flex-1 bg-[var(--surface)] outline-none px-1 rounded"
                      style={{ color: "var(--text)" }}
                    />
                  ) : (
                    <span className="font-medium truncate" style={{ color: "var(--text)" }}>{a.title}</span>
                  )}
                  <div className="flex items-center gap-1">
                    {editing ? (
                      <>
                        <button onClick={saveEdit} title="Save"><Check className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} /></button>
                        <button onClick={() => setEditingId(null)} title="Cancel"><X className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => navigator.clipboard?.writeText(a.markdown)} title="Copy">
                          <Copy className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                        </button>
                        <button onClick={() => downloadMarkdown(a)} title="Download .md">
                          <Download className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                        </button>
                        <button onClick={() => { setEditingId(a.id); setEditTitle(a.title); }} title="Rename">
                          <Pencil className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                        </button>
                        <button onClick={() => onDelete(a.id)} title="Delete">
                          <Trash2 className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <pre className="mt-1 max-h-28 overflow-hidden text-[10px] whitespace-pre-wrap" style={{ color: "var(--text-muted)" }}>
                  {a.markdown.split("\n").slice(0, 4).join("\n")}
                </pre>
              </div>
            );
          })
        )}
      </div>

      <button className="flex items-center justify-center gap-2 w-full py-2 rounded-lg hover:bg-[var(--bg-2)] text-sm font-medium bg-[var(--bg-2)] border border-[var(--border)]" style={{ color: "var(--text)" }}>
        <Plus className="w-4 h-4" /> Add note
      </button>
    </div>
  );
}
