import type { ChatMessage } from "./chat-hooks";

export type GenerateKind =
  | "slides"
  | "report"
  | "mindmap"
  | "infographic"
  | "graph"
  | "datatable";

export interface StudioArtifact {
  id: string;
  kind: GenerateKind;
  title: string;
  markdown: string;
  createdAt: number;
  prompt?: string;
}

function stripThinking(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^\s*\[system\][\s\S]*?\[\/system\]\s*/gi, "")
    .replace(/^```markdown\s*|^```\s*|\s*```$/gi, "")
    .trim();
}

function lastAssistant(messages: ChatMessage[]): string {
  const m = [...messages].reverse().find((x) => x.role === "assistant" && !x.error && x.content);
  return m ? stripThinking(m.content) : "";
}

function sourceText(messages: ChatMessage[]): string {
  const parts = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n\n");
  return (parts || "Untitled notebook").slice(0, 4000);
}

/* The prompt sent to a free OpenRouter model to generate each artifact. */
export const STUDIO_PROMPTS: Record<GenerateKind, (ctx: string) => string> = {
  slides: (ctx) =>
    `You are creating slide-deck content for "Ollamo Studio". Based ONLY on the context below, produce a Markdown slide deck.\n\nContext:\n${ctx}\n\nReturn 6-8 slides. Use this exact format:\n# <Deck Title>\n\n## Slide 1 — <Title>\n- Bullet\n- Bullet\n\n## Slide 2 — <Title>\n...`,
  report: (ctx) =>
    `You are writing a structured report for "Ollamo Studio". Based ONLY on the context below, write a Markdown report.\n\nContext:\n${ctx}\n\nUse: # Title, ## Sections (Summary, Findings, Analysis, Recommendations), bullet points, and a short conclusion.`,
  mindmap: (ctx) =>
    `Create a Markdown mind map for "Ollamo Studio" from the context below.\n\nContext:\n${ctx}\n\nFormat as a nested bullet list rooted at "- **Central Topic**" with 2-3 levels of subtopics. Keep it scannable.`,
  infographic: (ctx) =>
    `Design an infographic brief as Markdown for "Ollamo Studio" from the context below.\n\nContext:\n${ctx}\n\nInclude: a one-line hook, 3-5 key-stat style callouts (use emoji + bold number/label), a short timeline, and a takeaway. Keep visual and concise.`,
  graph: (ctx) =>
    `Produce graph/chart data as Markdown for "Ollamo Studio" from the context below.\n\nContext:\n${ctx}\n\nReturn a fenced mermaid code block (graph TD or pie/xychart) plus a 2-3 sentence interpretation. Prefer a chart that best fits the data.`,
  datatable: (ctx) =>
    `Extract structured data as a Markdown table for "Ollamo Studio" from the context below.\n\nContext:\n${ctx}\n\nReturn a well-formed Markdown table with a clear header row and 5-12 rows of the most relevant data. Add one line of notes below.`,
};

export const STUDIO_TITLES: Record<GenerateKind, string> = {
  slides: "Slide Deck",
  report: "Report",
  mindmap: "Mind Map",
  infographic: "Infographic",
  graph: "Graph",
  datatable: "Data Table",
};

/* Build the artifact object once AI text is returned. */
export function buildArtifact(kind: GenerateKind, aiText: string): StudioArtifact {
  const clean = stripThinking(aiText) || aiText;
  return {
    id: `${kind}-${Date.now()}`,
    kind,
    title: STUDIO_TITLES[kind],
    markdown: clean || `# ${STUDIO_TITLES[kind]}\n\n_No content returned._`,
    createdAt: Date.now(),
  };
}

/* Local fallback used when the backend is offline. */
export function fallbackGenerate(kind: GenerateKind, messages: ChatMessage[]): StudioArtifact {
  const src = lastAssistant(messages) || sourceText(messages);
  const title = STUDIO_TITLES[kind];
  const body = src
    .split(/\n+/)
    .map((l) => l.replace(/^#+\s*/, "").replace(/[*_`]/g, "").trim())
    .filter(Boolean)
    .slice(0, 10)
    .map((l) => `- ${l.slice(0, 80)}`)
    .join("\n");
  const markdown = `# ${title}\n\n> Offline preview (start the OllamoMUI backend for AI-generated content).\n\n${body || "- (add a prompt to grow this artifact)"}\n`;
  return { id: `${kind}-${Date.now()}`, kind, title, markdown, createdAt: Date.now() };
}

export function createNote(): StudioArtifact {
  return {
    id: `note-${Date.now()}`,
    kind: "datatable",
    title: "Untitled note",
    markdown: "# 📝 Note\n\nStart writing…\n",
    createdAt: Date.now(),
  };
}

export function downloadMarkdown(artifact: StudioArtifact) {
  const blob = new Blob([artifact.markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${artifact.title.replace(/\s+/g, "-").toLowerCase()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
