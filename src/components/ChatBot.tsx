import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const envGemini = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim() ?? '';
const envGroq = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim() ?? '';
// Google keys start with AIza; Groq keys start with gsk_. Allow a Google key stored in VITE_GROQ_API_KEY by mistake.
const GEMINI_API_KEY = envGemini || (envGroq.startsWith('AIza') ? envGroq : '');
const GROQ_API_KEY = envGroq.startsWith('gsk_') ? envGroq : '';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_ENDPOINT = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;

const MISSING_KEY_MSG =
  'Chat is not configured yet. Add VITE_GEMINI_API_KEY (Google AI Studio) or VITE_GROQ_API_KEY (Groq) to your .env and restart the dev server.';
const AUTH_FAIL_MSG =
  'The chat API key is invalid or expired. For Groq: check VITE_GROQ_API_KEY at console.groq.com. For Gemini: check Google AI Studio and API restrictions.';

const SYSTEM_PROMPT = `You are the Mind2Mind assistant. Mind2Mind is a skill-exchange platform where people connect to teach and learn from each other. Here is everything you need to know to help users:

Users can register and create a profile listing skills they can teach and skills they want to learn.
The Browse page lets users search and filter experts by skill category, rating, and availability.
A Knowledge Demo is a short video or content post where an expert showcases their skill. Users can like and view demos.
An Exchange Request is how users initiate a knowledge swap — one user requests to learn from another, they agree on what each will teach, and the exchange begins.
Once an exchange is accepted, both users can message each other in real-time through the exchange chat.
After an exchange is completed, both users can leave a review and rating for each other.
Users receive notifications for new exchange requests, messages, reviews, and status updates.
Profiles show stats like total exchanges, average rating, skills taught, and endorsements received.
The platform is free to use. There is no payment system — it is purely a knowledge barter system.

If a user asks something you don't know, politely say you don't have that information and suggest they contact support.
Always be friendly, concise, and helpful. You only answer questions about Mind2Mind.`;

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: "Hi! I'm the Mind2Mind assistant. Ask me anything about how the platform works!",
};

function isPlaceholderKey(key: string) {
  return !key || key.startsWith('YOUR_');
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever messages change or chat opens
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    const hasGemini = !isPlaceholderKey(GEMINI_API_KEY);
    const hasGroq = !isPlaceholderKey(GROQ_API_KEY);
    if (!hasGemini && !hasGroq) {
      setMessages((prev) => [...prev, { role: 'assistant', content: MISSING_KEY_MSG }]);
      setLoading(false);
      return;
    }

    try {
      const history = updatedMessages.filter(
        (_, i) => !(i === 0 && updatedMessages[0].role === 'assistant')
      );

      let reply: string;

      if (hasGemini) {
        const contents = history.map((msg) => ({
          role: (msg.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
          parts: [{ text: msg.content }],
        }));

        const response = await fetch(GEMINI_ENDPOINT(GEMINI_API_KEY), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (!response.ok) {
          const errBody = await response.text();
          console.error('Gemini API error:', response.status, errBody);
          if (response.status === 401 || response.status === 403) {
            throw new Error('AUTH');
          }
          throw new Error(`API error: ${response.status}`);
        }

        const data = (await response.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        reply =
          data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
          "Sorry, I couldn't generate a response. Please try again.";
      } else {
        const apiMessages = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.map((msg) => ({ role: msg.role, content: msg.content })),
        ];

        const response = await fetch(GROQ_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: 1024,
          }),
        });

        if (!response.ok) {
          const errBody = await response.text();
          console.error('Groq API error:', response.status, errBody);
          if (response.status === 401 || response.status === 403) {
            throw new Error('AUTH');
          }
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        reply =
          data?.choices?.[0]?.message?.content ??
          "Sorry, I couldn't generate a response. Please try again.";
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('ChatBot fetch error:', err);
      const isAuth =
        err instanceof Error && err.message === 'AUTH';
      const content = isAuth
        ? AUTH_FAIL_MSG
        : "Sorry, I'm having trouble connecting. Please try again.";
      setMessages((prev) => [...prev, { role: 'assistant', content }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Chat Window ─────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96
                     bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200
                     dark:border-slate-700 flex flex-col overflow-hidden"
          style={{ maxHeight: 'min(560px, calc(100vh - 120px))' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-teal-600 text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">Mind2Mind Assistant</p>
                <p className="text-xs text-teal-100">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50 dark:bg-slate-900">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-teal-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-600'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-600">
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything…"
                disabled={loading}
                className="flex-1 px-3.5 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100
                           placeholder-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2
                           focus:ring-teal-500 disabled:opacity-50 transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="p-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed
                           text-white rounded-xl transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Bubble Button ───────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 bg-teal-600 hover:bg-teal-700
                   text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200
                   flex items-center justify-center"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </>
  );
}
