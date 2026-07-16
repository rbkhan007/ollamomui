"use client";

import {
  Presentation, FileText, BrainCircuit, BarChart3, LineChart, Table2,
  Plus, Copy, Download, Trash2, Pencil, Check, X, StickyNote, Loader2, Sparkles,
} from "lucide-react";
import { useState } from "react";
import { GlassCard, IconButton, IconChip, Pill } from "./playground-ui";
import {
  downloadMarkdown, type StudioArtifact, type GenerateKind, STUDIO_TITLES,
} from "@/app/playground/studio";

const STUDIO_ITEMS: { icon: typeof Presentation; label: string; kind: GenerateKind; color: string }[] = [
  { icon: Presentation, label: "Slide Deck", kind: "slides", color: "var(--accent)" },
  { icon: FileText, label: "Report", kind: "report", color: "var(--green)" },
  { icon: BrainCircuit, label: "Mind Map", kind: "mindmap", color: "var(--accent-2)" },
  { icon: BarChart3, label: "Infographic", kind: "infographic", color: "var(--accent-3)" },
  { icon: LineChart, label: "Graph", kind: "graph", color: "var(--accent-4)" },
  { icon: Table2, label: "Data Table", kind: "datatable", color: "var(--text-muted)" },
];

const ARTIFACT_ICON: Record<GenerateKind, typeof Presentation> = {
  slides: Presentation,
  report: FileText,
  mindmap: BrainCircuit,
  infographic: BarChart3,
  graph: LineChart,
  datatable: Table2,
};

export function StudioPanel({
  artifacts,
  onGenerate,
  generating,
  onUpdate,
  onDelete,
  onAddNote,
}: {
  artifacts: StudioArtifact[];
  onGenerate: (kind: GenerateKind) => void;
  generating: GenerateKind | null;
  onUpdate: (a: StudioArtifact) => void;
  onDelete: (id: string) => void;
  onAddNote: () => void;
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
    <GlassCard className="w-80 shrink-0 flex flex-col p-4">
      <header className="flex items-center gap-2 mb-4">
        <IconChip color="var(--accent-3)"><Sparkles /></IconChip>
        <h2 className="font-semibold text-[15px] flex-1" style={{ color: "var(--text)" }}>Ollamo Studio</h2>
        <Pill color="var(--text-muted)">{artifacts.length}</Pill>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {STUDIO_ITEMS.map((item) => {
          const busy = generating === item.kind;
          return (
            <button
              key={item.kind}
              disabled={!!generating}
              onClick={() => onGenerate(item.kind)}
              title={`Generate ${item.label} with a free OpenRouter model`}
              className="pg-studio-btn relative"
            >
              {busy ? (
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: item.color }} />
              ) : (
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="pg-scroll mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
        {artifacts.length === 0 ? (
          <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>
            <StickyNote className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Pick a generator above to create study material.</p>
          </div>
        ) : (
          artifacts.map((a) => {
            const Icon = ARTIFACT_ICON[a.kind];
            const editing = editingId === a.id;
            return (
              <div key={a.id} className="rounded-xl px-3 py-2.5" style={{ background: "var(--bg-2)", border: "1px solid var(--glass-border)" }}>
                <div className="flex items-center gap-2">
                  <IconChip color="var(--accent-3)" size={14}><Icon className="w-3.5 h-3.5" /></IconChip>
                  {editing ? (
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                      className="flex-1 bg-transparent outline-none text-xs font-medium"
                      style={{ color: "var(--text)" }}
                    />
                  ) : (
                    <span className="truncate flex-1 text-xs font-semibold" style={{ color: "var(--text)" }}>{a.title}</span>
                  )}
                  <div className="flex items-center gap-0.5">
                    {editing ? (
                      <>
                        <IconButton onClick={saveEdit} title="Save"><Check className="w-3.5 h-3.5" /></IconButton>
                        <IconButton onClick={() => setEditingId(null)} title="Cancel"><X className="w-3.5 h-3.5" /></IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton onClick={() => navigator.clipboard?.writeText(a.markdown)} title="Copy Markdown"><Copy className="w-3.5 h-3.5" /></IconButton>
                        <IconButton onClick={() => downloadMarkdown(a)} title="Download .md"><Download className="w-3.5 h-3.5" /></IconButton>
                        <IconButton onClick={() => { setEditingId(a.id); setEditTitle(a.title); }} title="Rename"><Pencil className="w-3.5 h-3.5" /></IconButton>
                        <IconButton onClick={() => onDelete(a.id)} title="Delete" variant="danger"><Trash2 className="w-3.5 h-3.5" /></IconButton>
                      </>
                    )}
                  </div>
                </div>
                <pre className="mt-1.5 max-h-24 overflow-hidden text-[10px] whitespace-pre-wrap leading-snug" style={{ color: "var(--text-muted)" }}>
                  {a.markdown.split("\n").slice(0, 5).join("\n")}
                </pre>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={onAddNote}
        className="pg-studio-btn mt-3 !flex-row !gap-2 !text-xs !font-semibold"
        style={{ flexDirection: "row" }}
      >
        <Plus className="w-4 h-4" /> Add note
      </button>
    </GlassCard>
  );
}

export { STUDIO_TITLES };
