import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeftRight, Clock, CheckCircle2, XCircle, Send,
  MessageSquare, User, Loader2, Inbox
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Exchange, Profile } from '../types';
import Button from '../components/ui/Button';

type Tab = 'received' | 'sent';

export default function ExchangeRequestsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('received');
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchExchanges = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('exchange_requests')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching exchanges:', error);
      setLoading(false);
      return;
    }

    const exchangeList = (data || []) as Exchange[];
    setExchanges(exchangeList);

    // Fetch all related profiles
    const userIds = new Set<string>();
    exchangeList.forEach(ex => {
      userIds.add(ex.sender_id);
      userIds.add(ex.receiver_id);
    });

    if (userIds.size > 0) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', Array.from(userIds));

      if (profileData) {
        const profileMap: Record<string, Profile> = {};
        (profileData as Profile[]).forEach(p => {
          if (p.user_id) profileMap[p.user_id] = p;
        });
        setProfiles(profileMap);
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchExchanges();
  }, [fetchExchanges]);

  const handleAccept = async (exchangeId: string) => {
    setActionLoading(exchangeId);
    try {
      await supabase.from('exchange_requests').update({ status: 'accepted', updated_at: new Date().toISOString() }).eq('id', exchangeId);

      // Find the exchange to send notification to the sender
      const exchange = exchanges.find(e => e.id === exchangeId);
      if (exchange) {
        await supabase.from('notifications').insert({
          user_id: exchange.sender_id,
          message: `Your exchange request has been accepted! Skill: ${exchange.skill_offered} ↔ ${exchange.skill_requested}`,
          exchange_id: exchangeId,
        });
      }

      await fetchExchanges();
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (exchangeId: string) => {
    if (!rejectionReason.trim()) return;
    setActionLoading(exchangeId);
    try {
      await supabase.from('exchange_requests').update({
        status: 'rejected',
        rejection_reason: rejectionReason.trim(),
        updated_at: new Date().toISOString(),
      }).eq('id', exchangeId);

      // Notify sender
      const exchange = exchanges.find(e => e.id === exchangeId);
      if (exchange) {
        await supabase.from('notifications').insert({
          user_id: exchange.sender_id,
          message: `Your exchange request was declined. Reason: ${rejectionReason.trim()}`,
          exchange_id: exchangeId,
        });
      }

      setRejectingId(null);
      setRejectionReason('');
      await fetchExchanges();
    } finally {
      setActionLoading(null);
    }
  };

  const filteredExchanges = exchanges.filter(ex => {
    if (!user) return false;
    if (tab === 'received') return ex.receiver_id === user.id;
    return ex.sender_id === user.id;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'accepted': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3.5 h-3.5" />;
      case 'accepted': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'rejected': return <XCircle className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <ArrowLeftRight className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Please sign in to view your exchange requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-teal-900 py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-teal-500/20 border border-teal-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ArrowLeftRight className="w-7 h-7 text-teal-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Exchange Requests</h1>
          <p className="text-slate-400 text-sm md:text-base">Manage your skill exchange proposals</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex bg-white rounded-2xl border border-slate-100 p-1.5 mb-6 shadow-sm">
          <button
            onClick={() => setTab('received')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              tab === 'received'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Received
            {exchanges.filter(e => e.receiver_id === user.id && e.status === 'pending').length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                tab === 'received' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-700'
              }`}>
                {exchanges.filter(e => e.receiver_id === user.id && e.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('sent')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              tab === 'sent'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Send className="w-4 h-4" />
            Sent
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          </div>
        ) : filteredExchanges.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 text-lg mb-1">No {tab} requests yet</p>
            <p className="text-slate-400 text-sm">
              {tab === 'received'
                ? 'When someone proposes an exchange with you, it will appear here.'
                : 'Exchanges you propose will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExchanges.map(exchange => {
              const otherUserId = tab === 'received' ? exchange.sender_id : exchange.receiver_id;
              const otherProfile = profiles[otherUserId];
              const isRejectOpen = rejectingId === exchange.id;

              return (
                <div
                  key={exchange.id}
                  className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {otherProfile?.avatar_url ? (
                        <img src={otherProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-teal-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-slate-900 text-sm">
                          {otherProfile?.display_name || otherProfile?.username || 'Unknown User'}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(exchange.status)}`}>
                          {getStatusIcon(exchange.status)}
                          {exchange.status.charAt(0).toUpperCase() + exchange.status.slice(1)}
                        </span>
                        <span className="text-slate-400 text-xs ml-auto flex-shrink-0">
                          {formatDate(exchange.created_at)}
                        </span>
                      </div>

                      {/* Skills */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full text-xs font-medium">
                          {tab === 'received' ? exchange.skill_offered : exchange.skill_offered}
                        </span>
                        <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-medium">
                          {tab === 'received' ? exchange.skill_requested : exchange.skill_requested}
                        </span>
                      </div>

                      {/* Message */}
                      {exchange.message && (
                        <div className="mt-3 bg-slate-50 rounded-xl px-3 py-2.5">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                            <MessageSquare className="w-3 h-3" />
                            Message
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{exchange.message}</p>
                        </div>
                      )}

                      {/* Rejection reason */}
                      {exchange.status === 'rejected' && exchange.rejection_reason && (
                        <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                          <div className="flex items-center gap-1.5 text-xs text-red-500 mb-1">
                            <XCircle className="w-3 h-3" />
                            Rejection Reason
                          </div>
                          <p className="text-sm text-red-700 leading-relaxed">{exchange.rejection_reason}</p>
                        </div>
                      )}

                      {/* Actions (only for received & pending) */}
                      {tab === 'received' && exchange.status === 'pending' && (
                        <div className="mt-4">
                          {!isRejectOpen ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAccept(exchange.id)}
                                loading={actionLoading === exchange.id}
                                disabled={!!actionLoading}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => setRejectingId(exchange.id)}
                                disabled={!!actionLoading}
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-3">
                              <label className="block text-sm font-medium text-red-700">
                                Reason for Rejection
                              </label>
                              <textarea
                                value={rejectionReason}
                                onChange={e => setRejectionReason(e.target.value)}
                                rows={3}
                                className="w-full border border-red-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300/30 text-slate-800 resize-none bg-white"
                                placeholder="Please explain why you're declining this exchange..."
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleReject(exchange.id)}
                                  loading={actionLoading === exchange.id}
                                  disabled={!rejectionReason.trim() || !!actionLoading}
                                >
                                  Confirm Rejection
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
