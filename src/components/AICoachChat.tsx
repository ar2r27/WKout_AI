import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  Sparkles,
  Trash2,
  Check,
  Calendar,
  Copy,
  Play
} from 'lucide-react';
import { ChatMessage, WorkoutPlan, UserProfile, AppSettings } from '../types';

interface AICoachChatProps {
  messages: ChatMessage[];
  onSendUserMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  onClearChat: () => void;
  onApplyPlan: (plan: WorkoutPlan) => void;
  profile: UserProfile;
  currentPlan: WorkoutPlan | null;
  settings: AppSettings;
  onOpenSettings: () => void;
  onGoToWorkout?: () => void;
}

export const AICoachChat: React.FC<AICoachChatProps> = ({
  messages,
  onSendUserMessage,
  isLoading,
  onClearChat,
  onApplyPlan,
  profile,
  currentPlan,
  settings,
  onOpenSettings,
  onGoToWorkout
}) => {
  const [inputText, setInputText] = useState('');
  const [appliedPlanId, setAppliedPlanId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleCopyMessage = async (msgId: string, content: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    'Ułóż mi nowy plan treningowy na 3 dni',
    'Bolą mnie kolana – zamień przysiady na bezpieczne ćwiczenie',
    'Mam dziś tylko 35 minut, jak przeprowadzić efektywny trening?',
    'Jak prawidłowo robić progres ciężaru w wyciskaniu?',
    'Zalecenia żywieniowe okołotreningowe'
  ];

  const handleSend = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || isLoading) return;

    setInputText('');
    await onSendUserMessage(content);
  };

  const handleApplyProposedPlan = (plan: WorkoutPlan) => {
    onApplyPlan(plan);
    setAppliedPlanId(plan.id);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-130px)]">
      {/* Coach Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30">
            <Bot className="w-5 h-5" />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-white">Trener AI {settings.coachName}</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">
                {settings.geminiApiKey ? settings.geminiModel : 'Wbudowany Trener'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Personalizacja planów • Biomechanika • Regeneracja
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!settings.geminiApiKey && (
            <button
              onClick={onOpenSettings}
              className="text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Dodaj klucz Gemini
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm('Czy chcesz wyczyścić historię rozmowy z trenerem?')) {
                onClearChat();
              }
            }}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-850 transition"
            title="Wyczyść czat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSystem = msg.role === 'system';

          if (isSystem) {
            return (
              <div
                key={msg.id}
                className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 text-center font-medium my-2"
              >
                {msg.content}
              </div>
            );
          }

          const isPlanActive =
            (msg.action?.type === 'plan_proposal' &&
              msg.action.planData &&
              (currentPlan?.id === msg.action.planData.id || appliedPlanId === msg.action.planData.id)) ||
            false;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md chat-bubble select-text ${
                  isUser
                    ? 'bg-gradient-to-br from-zinc-800 to-zinc-850 text-white border border-zinc-700/60 rounded-tr-sm'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-sm'
                }`}
              >
                {/* AI badge */}
                {!isUser && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 mb-1.5">
                    <Sparkles className="w-3 h-3" /> Trener AI
                  </div>
                )}

                {/* Message Content formatted with linebreaks */}
                <div className="whitespace-pre-wrap select-text">{msg.content}</div>

                {/* Action Card: Proposed Plan */}
                {msg.action?.type === 'plan_proposal' && msg.action.planData && (
                  <div className="mt-4 pt-3 border-t border-zinc-800 bg-zinc-950/70 p-4 rounded-xl border border-emerald-500/30">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                      <Calendar className="w-4 h-4" /> Propozycja Nowego Planu
                    </div>
                    <div className="text-base font-black text-white">
                      {msg.action.planData.title}
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {msg.action.planData.description}
                    </div>

                    {/* Days preview */}
                    <div className="space-y-2 mt-3">
                      {msg.action.planData.days.map((day, idx) => (
                        <div
                          key={day.id || idx}
                          className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs"
                        >
                          <div className="font-bold text-white flex items-center justify-between">
                            <span>{day.name}</span>
                            <span className="text-zinc-500 font-normal">
                              {day.exercises.length} ćwiczeń
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                            {day.exercises.map((e) => e.name).join(' • ')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Apply Plan Button or Active State */}
                    {isPlanActive ? (
                      <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
                        <div className="flex-1 w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" /> Plan jest aktywny w Twoim treningu
                        </div>
                        {onGoToWorkout && (
                          <button
                            onClick={onGoToWorkout}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-extrabold text-xs bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center gap-1.5 transition whitespace-nowrap shadow-glow-green"
                          >
                            <Play className="w-3.5 h-3.5 fill-black" /> Rozpocznij trening
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApplyProposedPlan(msg.action!.planData!)}
                        className="mt-4 w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black shadow-glow-green"
                      >
                        <Check className="w-4 h-4" /> Zastosuj ten plan do mojego profilu
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Timestamp and Copy Action */}
              <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-zinc-500">
                <span>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <button
                  onClick={() => handleCopyMessage(msg.id, msg.content)}
                  className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition py-0.5 px-1.5 rounded hover:bg-zinc-800"
                  title="Kopiuj treść wiadomości"
                >
                  {copiedMsgId === msg.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Skopiowano</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Kopiuj</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 max-w-[200px] animate-pulse">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>Trener AI pisze...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel / Pills */}
      <div className="py-2 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white whitespace-nowrap transition shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="pt-2 border-t border-zinc-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Napisz do Trenera (np. 'Ułóż plan FBW', 'Bolą mnie lędźwie')..."
            disabled={isLoading}
            className="flex-1 bg-zinc-900 border border-zinc-750 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold transition shadow-glow-green"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
