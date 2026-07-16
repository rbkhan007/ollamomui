"use client";

import { useState } from "react";
import { Plus, Globe, Zap, FileText, Trash2, Pencil, Check, X } from "lucide-react";

export interface Source {
  id: string;
  label: string;
  type: "web" | "doc" | "note";
}

const TYPE_ICON: Record<Source["type"], typeof Globe> = {
  web: Globe,
  doc: FileText,
  note: FileText,
};

function surfaceCls(extra = "") {
  return `bg-[var(--surface)] border border-[var(--border)] ${extra}`;
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
  const [label, setLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  const add = () => {
    const v = label.trim();
    if (!v) return;
    onCreate({ id: `src-${Date.now()}`, label: v, type: "note" });
    setLabel("");
  };

  const saveEdit = () => {
    const v = editLabel.trim();
    if (!v || !editingId) return;
    onUpdate({ ...sources.find((s) => s.id === editingId)!, label: v });
    setEditingId(null);
    setEditLabel("");
  };

  return (
    <div className={`w-72 ${surfaceCls("rounded-xl p-4 flex flex-col shrink-0 shadow-sm")}`}>
      <h2 className="font-semibold mb-4" style={{ color: "var(--text)" }}>Sources</h2>

      <div className="flex gap-2 mb-4">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="+ Add a source"
          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none bg-[var(--bg-2)] border border-[var(--border)]"
          style={{ color: "var(--text)" }}
        />
        <button
          onClick={add}
          className="px-3 rounded-lg text-sm font-medium flex items-center gap-1"
          style={{ background: "var(--accent-2)", color: "#fff" }}
          title="Create source"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className={`rounded-lg p-3 ${surfaceCls()}`}>
        <div className="flex gap-2 text-xs">
          <button className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--bg-2)] border border-[var(--border)]">
            <Globe className="w-3 h-3" /> Web
          </button>
          <button className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--bg-2)] border border-[var(--border)]">
            <Zap className="w-3 h-3" /> Fast Research
          </button>
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto space-y-2">
        {sources.length === 0 && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>No sources yet.</p>
        )}
        {sources.map((s) => {
          const Icon = TYPE_ICON[s.type];
          const editing = editingId === s.id;
          return (
            <div
              key={s.id}
              className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 ${surfaceCls()}`}
            >
              <Icon className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
              {editing ? (
                <input
                  autoFocus
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  className="flex-1 bg-[var(--bg-2)] outline-none px-1 rounded"
                  style={{ color: "var(--text)" }}
                />
              ) : (
                <span className="truncate flex-1" style={{ color: "var(--text)" }}>{s.label}</span>
              )}
              {editing ? (
                <>
                  <button onClick={saveEdit} title="Save"><Check className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} /></button>
                  <button onClick={() => setEditingId(null)} title="Cancel"><X className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} /></button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditingId(s.id); setEditLabel(s.label); }} title="Edit">
                    <Pencil className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                  </button>
                  <button onClick={() => onDelete(s.id)} title="Delete">
                    <Trash2 className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
