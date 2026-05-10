/**
 * CreateMasterclassPage.tsx
 *
 * Form for experts to create a new group masterclass.
 * Only accessible to authenticated users (premium/expert check is advisory —
 * full enforcement is via RLS on the masterclasses table).
 */

import { useState } from 'react';
import {
  BookOpen, Calendar, Clock, Users, DollarSign,
  Link, FileText, Tag, ArrowLeft, CheckCircle, AlertCircle, Zap
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { Page } from '../types';
import { createMasterclass } from '../lib/masterclass-helpers';
import { getErrorMessage } from '../lib/supabase';

interface Props {
  onNavigate: (page: Page, id?: string) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

interface FormData {
  title: string;
  description: string;
  topic: string;
  date: string;
  time: string;
  max_participants: string;
  price_usd: string;
  session_link: string;
}

const TOPIC_OPTIONS = [
  'Technology', 'Design', 'Business', 'Marketing', 'Finance',
  'Language Learning', 'Music', 'Photography', 'Writing', 'Health & Wellness',
  'Data Science', 'Programming', 'Leadership', 'Other',
];

export default function CreateMasterclassPage({ onNavigate, onOpenAuth }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    topic: '',
    date: '',
    time: '',
    max_participants: '20',
    price_usd: '',
    session_link: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Require authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7 text-teal-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Sign in to Host a Masterclass
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            You need to be signed in to create and host group masterclasses.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => onOpenAuth('signin')}>Sign In</Button>
            <Button onClick={() => onOpenAuth('signup')}>Join Free</Button>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const validate = (): string | null => {
    if (!form.title.trim()) return 'Title is required.';
    if (form.title.length > 200) return 'Title must be under 200 characters.';
    if (!form.description.trim()) return 'Description is required.';
    if (!form.topic) return 'Please select a topic.';
    if (!form.date) return 'Date is required.';
    if (!form.time) return 'Time is required.';

    const scheduledAt = new Date(`${form.date}T${form.time}`);
    if (scheduledAt <= new Date()) return 'Scheduled date must be in the future.';

    const maxP = parseInt(form.max_participants, 10);
    if (isNaN(maxP) || maxP < 2 || maxP > 500) return 'Max participants must be between 2 and 500.';

    const price = parseFloat(form.price_usd);
    if (isNaN(price) || price < 0) return 'Price must be a positive number (0 for free).';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const scheduledAt = new Date(`${form.date}T${form.time}`).toISOString();
      const priceCents = Math.round(parseFloat(form.price_usd) * 100);

      await createMasterclass({
        title: form.title.trim(),
        description: form.description.trim(),
        topic: form.topic,
        scheduled_at: scheduledAt,
        max_participants: parseInt(form.max_participants, 10),
        price_cents: priceCents,
        session_link: form.session_link.trim() || undefined,
      });

      setSuccess(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to create masterclass. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Masterclass Created!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Your masterclass "{form.title}" has been published and is now visible to learners.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => onNavigate('masterclasses')}>
              View All Masterclasses
            </Button>
            <Button
              onClick={() => {
                setSuccess(false);
                setForm({
                  title: '', description: '', topic: '', date: '', time: '',
                  max_participants: '20', price_usd: '', session_link: '',
                });
              }}
            >
              Create Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-12">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-900 py-10 mb-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => onNavigate('masterclasses')}
            className="flex items-center gap-2 text-teal-400 hover:text-teal-300 text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Masterclasses
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500/20 border border-teal-500/30 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Create a Masterclass</h1>
              <p className="text-slate-400 text-sm">Host a live group session for multiple learners</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Premium notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Premium Feature
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Only premium/subscribed experts can host masterclasses. Learners pay per session to join.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-500" />
                Masterclass Title *
              </span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Advanced React Patterns for Production Apps"
              maxLength={200}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100"
            />
            <p className="text-xs text-slate-400 mt-1">{form.title.length}/200</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="What will learners gain from this session? What topics will you cover?"
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100 resize-none"
            />
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-teal-500" />
                Topic / Category *
              </span>
            </label>
            <select
              name="topic"
              value={form.topic}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100"
            >
              <option value="">Select a topic...</option>
              {TOPIC_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-500" />
                  Date *
                </span>
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-500" />
                  Time *
                </span>
              </label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Max Participants & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-500" />
                  Max Participants *
                </span>
              </label>
              <input
                type="number"
                name="max_participants"
                value={form.max_participants}
                onChange={handleChange}
                min={2}
                max={500}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-teal-500" />
                  Price (USD) *
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  name="price_usd"
                  value={form.price_usd}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                  placeholder="29.99"
                  className="w-full pl-7 pr-4 py-3 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Enter 0 for a free session</p>
            </div>
          </div>

          {/* Session Link */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Link className="w-4 h-4 text-teal-500" />
                Session Link (optional)
              </span>
            </label>
            <input
              type="url"
              name="session_link"
              value={form.session_link}
              onChange={handleChange}
              placeholder="https://meet.google.com/xxx or https://whereby.com/room"
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100"
            />
            <p className="text-xs text-slate-400 mt-1">
              You can add this later. Enrolled learners will see this link.
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate('masterclasses')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              <BookOpen className="w-4 h-4" />
              Publish Masterclass
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
