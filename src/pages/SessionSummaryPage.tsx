/**
 * SessionSummaryPage.tsx
 *
 * Displays an AI-generated session summary for a completed exchange or masterclass.
 * Supports generating a new summary via Claude API and downloading as PDF.
 *
 * Route: page=session-summary, id=<sessionId>:<sessionType>
 * e.g. id="abc123:exchange" or id="xyz789:masterclass"
 */

import { useState, useEffect, useRef } from 'react';
import {
  Brain, CheckCircle, BookOpen, Target, Lightbulb,
  Download, RefreshCw, ArrowLeft, Loader, AlertCircle,
  Star, ChevronRight, Sparkles, User, Clock
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { Page, AISummaryContent, SessionSummary } from '../types';
import { fetchSessionSummary, generateSessionSummary } from '../lib/masterclass-helpers';

interface Props {
  // id format: "sessionId:sessionType:title:topic:expertName:learnerName:duration"
  sessionId?: string;
  onNavigate: (page: Page, id?: string) => void;
}

// ─── Summary Section Component ────────────────────────────────────────────────
function SummarySection({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Generate Form ────────────────────────────────────────────────────────────
function GenerateForm({
  sessionId,
  sessionType,
  onGenerated,
}: {
  sessionId: string;
  sessionType: 'exchange' | 'masterclass';
  onGenerated: (summary: AISummaryContent) => void;
}) {
  const [form, setForm] = useState({
    sessionTitle: '',
    sessionTopic: '',
    expertName: '',
    learnerName: '',
    durationMinutes: '60',
    sessionNotes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerate = async () => {
    if (!form.sessionTitle || !form.expertName || !form.learnerName) {
      setError('Please fill in the required fields.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generateSessionSummary({
        sessionId,
        sessionType,
        sessionTitle: form.sessionTitle,
        sessionTopic: form.sessionTopic || form.sessionTitle,
        expertName: form.expertName,
        learnerName: form.learnerName,
        durationMinutes: parseInt(form.durationMinutes, 10) || 60,
        sessionNotes: form.sessionNotes,
      });
      onGenerated(result.summary);
    } catch (err: any) {
      setError(err.message || 'Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-teal-500" />
        <h3 className="font-semibold text-slate-900 dark:text-white">Generate AI Summary</h3>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2.5 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Session Title *
          </label>
          <input
            type="text"
            name="sessionTitle"
            value={form.sessionTitle}
            onChange={handleChange}
            placeholder="e.g. React Hooks Deep Dive"
            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Topic
          </label>
          <input
            type="text"
            name="sessionTopic"
            value={form.sessionTopic}
            onChange={handleChange}
            placeholder="e.g. JavaScript, Design, etc."
            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Expert Name *
          </label>
          <input
            type="text"
            name="expertName"
            value={form.expertName}
            onChange={handleChange}
            placeholder="Expert's name"
            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Learner Name *
          </label>
          <input
            type="text"
            name="learnerName"
            value={form.learnerName}
            onChange={handleChange}
            placeholder="Learner's name"
            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            name="durationMinutes"
            value={form.durationMinutes}
            onChange={handleChange}
            min={1}
            max={480}
            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
          Session Notes / Transcript (optional)
        </label>
        <textarea
          name="sessionNotes"
          value={form.sessionNotes}
          onChange={handleChange}
          rows={3}
          placeholder="Any notes, key points discussed, or transcript excerpts..."
          className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100 resize-none"
        />
      </div>

      <Button onClick={handleGenerate} loading={loading} className="w-full">
        <Sparkles className="w-4 h-4" />
        Generate AI Summary with Claude
      </Button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SessionSummaryPage({ sessionId: rawId, onNavigate }: Props) {
  const { user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);
  const [summary, setSummary] = useState<AISummaryContent | null>(null);
  const [existingSummary, setExistingSummary] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGenerateForm, setShowGenerateForm] = useState(false);

  // Parse compound ID: "sessionId:sessionType"
  const parts = (rawId ?? '').split(':');
  const sessionId = parts[0] ?? '';
  const sessionType = (parts[1] ?? 'exchange') as 'exchange' | 'masterclass';

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    loadExistingSummary();
  }, [sessionId]);

  const loadExistingSummary = async () => {
    setLoading(true);
    try {
      const existing = await fetchSessionSummary(sessionId);
      if (existing) {
        setExistingSummary(existing);
        setSummary(existing.generated_summary);
      }
    } catch (err) {
      console.error('Error loading summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerated = (newSummary: AISummaryContent) => {
    setSummary(newSummary);
    setShowGenerateForm(false);
  };

  /**
   * Download summary as PDF using the browser's print dialog.
   * This is a lightweight approach that doesn't require a PDF library.
   */
  const handleDownloadPDF = () => {
    if (!printRef.current) return;

    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Session Summary</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; }
            h1 { color: #0d9488; font-size: 24px; margin-bottom: 8px; }
            h2 { color: #0f766e; font-size: 16px; margin: 20px 0 8px; }
            h3 { color: #374151; font-size: 14px; margin: 16px 0 6px; }
            p { color: #475569; line-height: 1.6; font-size: 14px; }
            ul { padding-left: 20px; }
            li { color: #475569; font-size: 14px; margin-bottom: 4px; line-height: 1.5; }
            .badge { display: inline-block; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; padding: 2px 8px; border-radius: 9999px; font-size: 12px; }
            .section { margin-bottom: 20px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; }
            .meta { color: #94a3b8; font-size: 12px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Session Summary</h1>
          <p class="meta">Generated by Mind2Mind AI · ${new Date().toLocaleDateString()}</p>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
          <Brain className="w-12 h-12 text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sign In Required</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Please sign in to view session summaries.
          </p>
          <Button onClick={() => onNavigate('home')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-12">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-900 py-10 mb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => onNavigate(sessionType === 'masterclass' ? 'masterclasses' : 'exchanges')}
            className="flex items-center gap-2 text-teal-400 hover:text-teal-300 text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500/20 border border-teal-500/30 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Session Summary</h1>
                <p className="text-slate-400 text-sm">
                  {sessionType === 'masterclass' ? 'Group Masterclass' : '1-on-1 Exchange'} · Powered by Claude
                </p>
              </div>
            </div>
            {summary && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                className="border-white/20 text-white hover:bg-white/10 flex-shrink-0"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* No summary yet — show generate form or prompt */}
        {!summary && !showGenerateForm && (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 mb-6">
            <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-teal-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              No Summary Yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              Generate an AI-powered summary of this session using Claude. It takes just a few seconds.
            </p>
            <Button onClick={() => setShowGenerateForm(true)}>
              <Sparkles className="w-4 h-4" />
              Generate Summary
            </Button>
          </div>
        )}

        {/* Generate form */}
        {showGenerateForm && !summary && (
          <div className="mb-6">
            <GenerateForm
              sessionId={sessionId}
              sessionType={sessionType}
              onGenerated={handleGenerated}
            />
          </div>
        )}

        {/* Summary display */}
        {summary && (
          <>
            {/* Regenerate button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {existingSummary
                    ? `Generated on ${new Date(existingSummary.created_at).toLocaleDateString()}`
                    : 'Just generated'}
                </span>
              </div>
              <button
                onClick={() => { setSummary(null); setShowGenerateForm(true); }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-600 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            </div>

            {/* Printable summary content */}
            <div ref={printRef} className="space-y-4">
              {/* Overview */}
              <SummarySection
                icon={BookOpen}
                title="Session Overview"
                color="bg-teal-50 dark:bg-teal-900/20 text-teal-600"
              >
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {summary.summary}
                </p>
              </SummarySection>

              {/* Key Takeaways */}
              <SummarySection
                icon={Star}
                title="Key Takeaways"
                color="bg-amber-50 dark:bg-amber-900/20 text-amber-600"
              >
                <ul className="space-y-2">
                  {summary.key_takeaways.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <ChevronRight className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </SummarySection>

              {/* Action Items — 2 column grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SummarySection
                  icon={Target}
                  title="Action Items for Learner"
                  color="bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                >
                  <ul className="space-y-2">
                    {summary.action_items_for_learner.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </SummarySection>

                <SummarySection
                  icon={User}
                  title="Action Items for Expert"
                  color="bg-purple-50 dark:bg-purple-900/20 text-purple-600"
                >
                  <ul className="space-y-2">
                    {summary.action_items_for_expert.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </SummarySection>
              </div>

              {/* Recommended Next Topics */}
              <SummarySection
                icon={Lightbulb}
                title="Recommended Next Topics"
                color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
              >
                <div className="flex flex-wrap gap-2">
                  {summary.recommended_next_topics.map((topic, i) => (
                    <span
                      key={i}
                      className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-medium px-3 py-1 rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </SummarySection>

              {/* Session Quality Note */}
              <SummarySection
                icon={Clock}
                title="Session Quality Note"
                color="bg-slate-100 dark:bg-slate-700 text-slate-500"
              >
                <p className="text-slate-600 dark:text-slate-400 text-sm italic">
                  "{summary.session_rating_suggestion}"
                </p>
              </SummarySection>
            </div>

            {/* Download CTA */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                className="flex-1"
              >
                <Download className="w-4 h-4" />
                Download as PDF
              </Button>
              <Button
                onClick={() => onNavigate(sessionType === 'masterclass' ? 'masterclasses' : 'exchanges')}
                className="flex-1"
              >
                Back to {sessionType === 'masterclass' ? 'Masterclasses' : 'Exchanges'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
