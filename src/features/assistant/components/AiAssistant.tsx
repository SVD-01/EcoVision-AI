import { useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { Bot, Languages, Mic, Send, Sparkles, X } from "lucide-react";
import { askAssistant } from "@/shared/api/mockApi";
import type { AssistantMessage } from "@/shared/api/types";
import { Button, GlassPanel, TextInput } from "@/shared/components/ui";

const quickPrompts = ["How do I recycle a battery?", "Create a compost guide", "Explain my Eco Score"];

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { id: "welcome", role: "assistant", language: "en", content: "Ask me about sorting, circularity, reports, routes, or smart-bin workflows." },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const mutation = useMutation({
    mutationFn: (nextMessages: AssistantMessage[]) => askAssistant(nextMessages, language),
    onSuccess: (message) => setMessages((current) => [...current, message]),
  });

  const submit = (prompt = input) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    const userMessage: AssistantMessage = { id: Math.random().toString(36).slice(2), role: "user", content: trimmed, language };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    mutation.mutate(nextMessages);
  };

  const voiceSupported = useMemo(() => typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition), []);

  const startVoice = () => {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang = language === "es" ? "es-ES" : language === "fr" ? "fr-FR" : "en-US";
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      setInput(transcript);
      inputRef.current?.focus();
    };
    recognition.start();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <GlassPanel className="mb-4 flex h-[640px] w-[min(420px,calc(100vw-40px))] flex-col overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-300 text-slate-950"><Bot className="h-5 w-5" /></span>
              <div>
                <p className="font-semibold text-white">EcoVision AI Assistant</p>
                <p className="text-xs text-emerald-200">OpenAI/Gemini backend placeholder</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close assistant"><X className="h-5 w-5" /></button>
          </div>

          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <Languages className="h-4 w-4 text-emerald-200" />
            <select value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-full border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none">
              <option value="en">English</option>
              <option value="es">Spanish ready</option>
              <option value="fr">French ready</option>
            </select>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message) => (
              <div key={message.id} className={`rounded-[1.25rem] border p-3 text-sm leading-6 ${message.role === "user" ? "ml-8 border-emerald-300/20 bg-emerald-300/10 text-emerald-50" : "mr-8 border-white/10 bg-white/[0.05] text-slate-200"}`}>
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            ))}
            {mutation.isPending ? (
              <div className="mr-8 rounded-[1.25rem] border border-white/10 bg-white/[0.05] p-3 text-sm text-slate-300">
                AI is typing<span className="inline-flex w-8 animate-pulse">...</span>
              </div>
            ) : null}
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button key={prompt} onClick={() => submit(prompt)} className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/12">{prompt}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <TextInput ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submit(); }} placeholder="Ask about recycling guidance..." />
              {voiceSupported ? <Button variant="secondary" className="px-4" onClick={startVoice} aria-label="Start voice input"><Mic className="h-4 w-4" /></Button> : null}
              <Button className="px-4" onClick={() => submit()} aria-label="Send message"><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </GlassPanel>
      ) : null}

      <button onClick={() => setOpen((state) => !state)} className="glow-border grid h-16 w-16 place-items-center rounded-full bg-emerald-300 text-slate-950 shadow-[0_0_42px_rgba(52,211,153,0.45)]" aria-label="Open EcoVision AI assistant">
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>
    </div>
  );
}