/**
 * MasterclassSuccessPage.tsx
 *
 * Shown after a successful Stripe Checkout payment.
 * Polls for enrollment confirmation (webhook may take a few seconds),
 * then displays the session link and confirmation details.
 */

import { useState, useEffect } from 'react';
import { CheckCircle, Video, Calendar, ExternalLink, ArrowRight, Clock, Loader } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { Page, Masterclass } from '../types';
import {
  confirmEnrollmentBySession,
  fetchMasterclassById,
  formatPrice,
} from '../lib/masterclass-helpers';
import { getErrorMessage } from '../lib/supabase';

interface Props {
  // id is passed as "masterclassId|stripeSessionId"
  masterclassId?: string;
  onNavigate: (page: Page, id?: string) => void;
}

export default function MasterclassSuccessPage({ masterclassId: rawId, onNavigate }: Props) {
  const { user } = useAuth();
  const [masterclass, setMasterclass] = useState<Masterclass | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse the compound ID: "masterclassId|stripeSessionId"
  const [mcId, stripeSessionId] = (rawId ?? '').split('|');

  useEffect(() => {
    if (!mcId || !user) {
      setLoading(false);
      return;
    }
    initPage();
  }, [mcId, user]);

  const initPage = async () => {
    setLoading(true);
    try {
      // Fetch masterclass details
      const mc = await fetchMasterclassById(mcId);
      setMasterclass(mc);

      // Poll for enrollment confirmation (webhook processing)
      if (stripeSessionId && user) {
        const enrollment = await confirmEnrollmentBySession(stripeSessionId, mcId, user.id);
        setConfirmed(!!enrollment);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Something went wrong verifying your enrollment.'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Confirming your enrollment...</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">This may take a few seconds.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Enrollment Pending
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Your payment was received but enrollment confirmation is still processing.
            Please check your email or contact support if this persists.
          </p>
          <Button onClick={() => onNavigate('masterclasses')}>
            Back to Masterclasses
          </Button>
        </div>
      </div>
    );
  }

  const scheduledDate = masterclass ? new Date(masterclass.scheduled_at) : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Green header */}
          <div className="bg-gradient-to-br from-teal-600 to-emerald-600 px-8 py-10 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {confirmed ? "You're Enrolled!" : 'Payment Received!'}
            </h1>
            <p className="text-teal-100 text-sm">
              {confirmed
                ? 'Your spot is confirmed. See you at the session!'
                : 'Your payment is being processed. Enrollment will be confirmed shortly.'}
            </p>
          </div>

          {/* Details */}
          <div className="p-8">
            {masterclass && (
              <div className="space-y-4 mb-8">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {masterclass.title}
                </h2>

                {scheduledDate && (
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4 text-teal-500 flex-shrink-0" />
                    <span>
                      {scheduledDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {' at '}
                      {scheduledDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZoneName: 'short',
                      })}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  <span>Amount paid: <strong>{formatPrice(masterclass.price_cents)}</strong></span>
                </div>

                {masterclass.expert_profile && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-teal-100 flex-shrink-0">
                      {masterclass.expert_profile.avatar_url ? (
                        <img
                          src={masterclass.expert_profile.avatar_url}
                          alt={masterclass.expert_profile.display_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-teal-700 text-xs font-bold">
                          {masterclass.expert_profile.display_name?.[0]}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Hosted by <strong className="text-slate-900 dark:text-white">
                        {masterclass.expert_profile.display_name}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Session Link */}
            {masterclass?.session_link ? (
              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4 mb-6">
                <p className="text-sm font-semibold text-teal-800 dark:text-teal-300 mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Your Session Link
                </p>
                <a
                  href={masterclass.session_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-sm font-medium hover:underline break-all"
                >
                  {masterclass.session_link}
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                </a>
                <p className="text-xs text-teal-600/70 dark:text-teal-400/70 mt-2">
                  Save this link — you'll need it to join the session.
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-4 mb-6">
                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  The session link will be shared by the expert before the session starts.
                </p>
              </div>
            )}

            {/* Email note */}
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-6">
              A confirmation email has been sent to your registered email address.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => onNavigate('masterclasses')}
                className="flex-1"
              >
                Browse More Masterclasses
              </Button>
              <Button
                onClick={() => onNavigate('home')}
                className="flex-1"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
