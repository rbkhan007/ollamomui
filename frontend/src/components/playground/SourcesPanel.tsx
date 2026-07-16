"use client";

import { useRef, useState } from "react";
import {
  Plus, Database, Sparkles, Trash2, Pencil, Check, X, FileUp, FileText,
} from "lucide-react";
import { GlassCard, IconButton, IconChip, Pill } from "./playground-ui";

export interface Source {
  id: string;
  label: string;
  type: "web" | "doc" | "note";
  file?: boolean;
}

export function SourcesPanel({
  sources,
  onCreate,
  onUpdate,
  onDelete,
}: {
  sources: Source[];
  onCreate: (s: Source) => void;
  onUpdate: (s: Source) => void;
  onDelete: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => {
      onCreate({ id: `src-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, label: f.name, type: "doc", file: true });
    });
  };

  const saveEdit = () => {
    const v = editLabel.trim();
    if (!v || !editingId) return;
    const target = sources.find((s) => s.id === editingId);
    if (target) onUpdate({ ...target, label: v });
    setEditingId(null);
    setEditLabel("");
  };

  return (
    <GlassCard className="w-72 shrink-0 flex flex-col p-4">
      <header className="flex items-center gap-2 mb-4">
        <IconChip color="var(--accent)"><Database className="w-4 h-4" /></IconChip>
        <h2 className="font-semibold text-[15px] flex-1" style={{ color: "var(--text)" }}>Sources</h2>
        <Pill color="var(--text-muted)">{sources.length}</Pill>
      </header>

      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
      />
      <button
        onClick={() => fileRef.current?.click()}
        className="pg-studio-btn !flex-row !gap-2 !py-2.5 mb-3 !text-xs !font-semibold"
        style={{ flexDirection: "row" }}
      >
        <FileUp className="w-4 h-4" style={{ color: "var(--accent)" }} /> Upload files
      </button>

      <div className="pg-scroll mt-1 flex-1 overflow-y-auto space-y-2 pr-1">
        {sources.length === 0 && (
          <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>
            <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No sources yet. Upload a file to begin.</p>
          </div>
        )}
        {sources.map((s) => {
          const editing = editingId === s.id;
          return (
            <div
              key={s.id}
              className="group flex items-center gap-2 rounded-xl px-3 py-2 transition-colors"
              style={{ background: "var(--bg-2)", border: "1px solid var(--glass-border)" }}
            >
              <IconChip color="var(--accent)" size={14}>
                {s.file ? <FileUp className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
              </IconChip>
              {editing ? (
                <input
                  autoFocus
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  className="flex-1 bg-transparent outline-none text-xs"
                  style={{ color: "var(--text)" }}
                />
              ) : (
                <span className="truncate flex-1 text-xs font-medium" style={{ color: "var(--text)" }}>{s.label}</span>
              )}
              {editing ? (
                <div className="flex items-center gap-1">
                  <IconButton onClick={saveEdit} title="Save"><Check className="w-3.5 h-3.5" /></IconButton>
                  <IconButton onClick={() => setEditingId(null)} title="Cancel"><X className="w-3.5 h-3.5" /></IconButton>
                </div>
              ) : (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconButton onClick={() => { setEditingId(s.id); setEditLabel(s.label); }} title="Edit"><Pencil className="w-3.5 h-3.5" /></IconButton>
                  <IconButton onClick={() => onDelete(s.id)} title="Delete" variant="danger"><Trash2 className="w-3.5 h-3.5" /></IconButton>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
