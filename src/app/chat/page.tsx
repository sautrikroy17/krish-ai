"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Send,
  Square,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Brain,
  BookOpen,
  Heart,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatSession = {
  id: string;
  title: string;
  preview: string;
  timestamp: number;
  messages: Message[];
};

const SUGGESTIONS = [
  { icon: <Brain className="w-4 h-4" />, text: "Explain quantum entanglement simply" },
  { icon: <BookOpen className="w-4 h-4" />, text: "Help me study for my exam tomorrow" },
  { icon: <Heart className="w-4 h-4" />, text: "I need someone to talk to right now" },
  { icon: <Sparkles className="w-4 h-4" />, text: "What's the most fascinating thing you know?" },
];

function useStreamingChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (text: string, currentMessages: Message[]) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };

    const updatedMessages = [...currentMessages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    const assistantId = `assistant-${Date.now()}`;
    const assistantMessage: Message = { id: assistantId, role: "assistant", content: "" };
    setMessages([...updatedMessages, assistantMessage]);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(({ role, content }) => ({ role, content })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("0:")) {
            // AI SDK data stream format: 0:"text chunk"
            try {
              const json = line.slice(2);
              const parsed = JSON.parse(json);
              if (typeof parsed === "string") {
                accumulated += parsed;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: accumulated } : m
                  )
                );
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Sorry, something went wrong. Please try again." }
              : m
          )
        );
      }
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, [isLoading]);

  return { messages, input, setInput, isLoading, sendMessage, stop, setMessages };
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, input, setInput, isLoading, sendMessage, stop, setMessages } = useStreamingChat();

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  // Create new session
  const createNewSession = useCallback(() => {
    const id = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id,
      title: "New Chat",
      preview: "Start a conversation...",
      timestamp: Date.now(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(id);
    setMessages([]);
    setInput("");
  }, [setMessages, setInput]);

  // Init
  useEffect(() => {
    createNewSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save messages to session on change
  useEffect(() => {
    if (!activeSessionId || messages.length === 0) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        const title = messages[0]?.role === "user"
          ? messages[0].content.slice(0, 40) + (messages[0].content.length > 40 ? "..." : "")
          : s.title;
        const lastAI = [...messages].reverse().find((m) => m.role === "assistant");
        const preview = lastAI?.content.slice(0, 80) + "..." || s.preview;
        return { ...s, title, preview, messages };
      })
    );
  }, [messages, activeSessionId]);

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id) {
      if (remaining.length > 0) {
        loadSession(remaining[0]);
      } else {
        createNewSession();
      }
    }
  };

  const loadSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
  };

  const copyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input, messages);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`sidebar flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? "w-72" : "w-0"} overflow-hidden flex-shrink-0`}
      >
        <div className="flex flex-col h-full w-72">
          {/* Logo */}
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg">✦</span>
              <span className="font-black text-lg gradient-text">KRISH</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-8 h-8 rounded-lg glass flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat */}
          <div className="p-4">
            <button
              id="new-chat-btn"
              onClick={createNewSession}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold relative"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Chat
              </span>
            </button>
          </div>

          {/* Sessions */}
          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
            <p className="text-xs text-zinc-600 font-medium px-2 mb-2 uppercase tracking-wider">
              Conversations
            </p>
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => loadSession(session)}
                className={`w-full text-left rounded-xl px-3 py-3 group relative ${
                  activeSessionId === session.id ? "glass-strong border border-blue-500/20" : "hover:glass"
                }`}
              >
                <p className="text-sm font-medium text-white truncate pr-6">{session.title}</p>
                <p className="text-xs text-zinc-500 truncate mt-0.5">{session.preview}</p>
                <button
                  onClick={(e) => deleteSession(session.id, e)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center text-zinc-600 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5">
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-xs text-zinc-500">Llama 3.3 70B · Groq LPU™</p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-medium">Online · Ultra Fast</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CHAT ===== */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 flex-shrink-0">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 rounded-xl glass flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
              K
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Krish</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-zinc-500">{isLoading ? "Thinking..." : "Ready to help"}</span>
              </div>
            </div>
          </div>
          <div className="glass rounded-full px-3 py-1.5 text-xs text-zinc-400 font-medium hidden sm:flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            Llama 3.3 70B
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <EmptyState setInput={setInput} textareaRef={textareaRef} />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onCopy={() => copyMessage(message.id, message.content)}
                  copied={copiedId === message.id}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    K
                  </div>
                  <div className="glass rounded-2xl rounded-tl-sm px-5 py-4">
                    <div className="flex gap-1.5">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <div className="glass-strong rounded-2xl border border-white/10 focus-within:border-blue-500/40 focus-within:shadow-[0_0_30px_rgba(79,172,254,0.1)]" style={{ transition: "border-color 0.3s, box-shadow 0.3s" }}>
              <textarea
                ref={textareaRef}
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask Krish anything..."
                rows={1}
                className="chat-input w-full px-5 pt-4 pb-2 min-h-[52px] max-h-[200px] bg-transparent border-0 shadow-none"
                disabled={isLoading}
              />
              <div className="flex items-center justify-between px-4 pb-3">
                <p className="text-xs text-zinc-600">Enter ↵ to send · Shift+Enter for new line</p>
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <button
                      type="button"
                      onClick={stop}
                      className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/30"
                      title="Stop"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSend}
                      id="send-btn"
                      disabled={!input.trim()}
                      className="send-btn w-9 h-9"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-zinc-700 mt-2">Krish may make mistakes. Verify important info.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function EmptyState({
  setInput,
  textareaRef,
}: {
  setInput: (v: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="relative mb-8">
        <div
          className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-3xl font-black shadow-[0_0_40px_rgba(79,172,254,0.3)]"
          style={{ animation: "glowPulse 3s ease-in-out infinite" }}
        >
          K
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-black" />
      </div>
      <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
        Hey, I&apos;m <span className="gradient-text">Krish</span> ✦
      </h2>
      <p className="text-zinc-400 max-w-sm mb-10 text-base leading-relaxed">
        Your personal AI — smarter than the rest, more human than you&apos;d expect. What&apos;s on your mind?
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.text}
            onClick={() => {
              setInput(s.text);
              textareaRef.current?.focus();
            }}
            className="glass rounded-2xl p-4 text-left hover:glass-strong neon-border group"
            style={{ transition: "all 0.3s ease" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-zinc-400 group-hover:text-blue-400" style={{ transition: "color 0.2s" }}>
                {s.icon}
              </span>
              <p className="text-sm text-zinc-300 group-hover:text-white font-medium" style={{ transition: "color 0.2s" }}>
                {s.text}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onCopy,
  copied,
}: {
  message: Message;
  onCopy: () => void;
  copied: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-4 message-in ${isUser ? "flex-row-reverse" : ""}`}>
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
            U
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
            K
          </div>
        )}
      </div>
      <div className={`group max-w-[80%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-5 py-4 text-sm leading-relaxed ${
            isUser
              ? "bg-gradient-to-br from-blue-500/25 to-purple-500/25 border border-blue-500/20 text-white rounded-tr-sm"
              : "glass text-zinc-200 rounded-tl-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownContent content={message.content} />
          )}
        </div>
        <button
          onClick={onCopy}
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 px-2 py-1 rounded-lg hover:glass"
          style={{ transition: "opacity 0.2s" }}
        >
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={`code-${i}`} className="my-3 rounded-xl overflow-hidden">
          {lang && (
            <div className="bg-white/5 border border-white/10 border-b-0 rounded-t-xl px-4 py-2 text-xs text-zinc-400 font-mono">
              {lang}
            </div>
          )}
          <pre className={`bg-black/40 border border-white/10 ${lang ? "rounded-b-xl rounded-t-none" : "rounded-xl"} px-4 py-3 overflow-x-auto`}>
            <code className="text-xs text-zinc-300 font-mono leading-relaxed">{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={`h3-${i}`} className="text-base font-bold gradient-text mt-4 mb-2">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={`h2-${i}`} className="text-lg font-bold gradient-text mt-5 mb-2">{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={`h1-${i}`} className="text-xl font-black gradient-text mt-5 mb-3">{line.slice(2)}</h1>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1.5">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-zinc-300">
              <span className="text-blue-400 mt-1 flex-shrink-0 text-xs">▸</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-2 space-y-1.5">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-zinc-300">
              <span className="text-purple-400 font-bold flex-shrink-0 text-xs w-4">{j + 1}.</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ol>
      );
      continue;
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={`bq-${i}`} className="border-l-2 border-purple-500 pl-4 py-1 my-2 text-zinc-400 italic text-sm">
          {line.slice(2)}
        </blockquote>
      );
    } else if (line === "---" || line === "***") {
      elements.push(<hr key={`hr-${i}`} className="border-white/10 my-3" />);
    } else if (line.trim() === "") {
      elements.push(<div key={`sp-${i}`} className="h-1.5" />);
    } else {
      elements.push(
        <p key={`p-${i}`} className="text-zinc-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      );
    }

    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-blue-300">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-blue-500/10 border border-blue-500/20 rounded px-1.5 py-0.5 text-blue-300 text-xs font-mono">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" class="text-blue-400 underline hover:text-blue-300">$1</a>');
}
