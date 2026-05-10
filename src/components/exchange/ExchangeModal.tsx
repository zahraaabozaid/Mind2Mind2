import { useState, useEffect } from 'react';
import { X, Repeat, Send } from 'lucide-react';
import { Profile } from '../../types';
import { supabase, getErrorMessage } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

interface Props {
  expert: Profile;
  onClose: () => void;
}

export default function ExchangeModal({ expert, onClose }: Props) {
  const { user } = useAuth();
  const [mySkill, setMySkill] = useState('');
  const [theirSkill, setTheirSkill] = useState(expert.teaching_skills[0] || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [senderProfile, setSenderProfile] = useState<{ id: string; display_name?: string } | null>(null);

  // Fetch sender's profile
  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('id, display_name')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setSenderProfile(data);
        });
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!mySkill.trim() || !theirSkill.trim() || !user || !senderProfile) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Verify session is still valid
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Your session has expired. Please log in again.');
        setLoading(false);
        return;
      }

      // Insert into exchange_requests table with profile IDs
      const { data: exchangeData, error: exchangeErr } = await supabase.from('exchange_requests').insert({
        requester_profile_id: senderProfile.id,
        provider_profile_id: expert.id,
        requester_id: user.id,
        provider_id: expert.user_id,
        requester_skill: mySkill.trim(),
        provider_skill: theirSkill.trim(),
        message: message.trim(),
        status: 'pending',
      }).select().single();

      if (exchangeErr) throw exchangeErr;

      // Create notification for the receiver
      if (expert.user_id && exchangeData) {
        await supabase.from('notifications').insert({
          user_id: expert.user_id,
          type: 'exchange_request',
          title: 'New Exchange Proposal',
          message: `${senderProfile.display_name || 'Someone'} wants to exchange ${mySkill.trim()} for ${theirSkill.trim()}`,
          related_id: exchangeData.id,
          is_read: false,
        });
      }

      setSent(true);
    } catch (err: unknown) {
      console.error('Exchange request error:', err);
      setError(getErrorMessage(err, 'Failed to send request'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <img src={expert.avatar_url} alt={expert.display_name} className="w-11 h-11 rounded-xl object-cover ring-2 ring-white/30" />
            <div>
              <div className="font-semibold">{expert.display_name}</div>
              <div className="text-teal-200 text-sm">{expert.location}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 bg-white/10 rounded-xl px-3 py-2 text-sm">
            <Repeat className="w-4 h-4 flex-shrink-0" />
            Propose a skill exchange
          </div>
        </div>

        {sent ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
              <Send className="w-7 h-7 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Request Sent!</h3>
            <p className="text-slate-500 text-sm mb-6">
              {expert.display_name} will be notified of your exchange proposal. They typically respond within 24 hours.
            </p>
            <Button onClick={onClose} className="w-full">Done</Button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                I want to learn from {expert.display_name.split(' ')[0]}:
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {expert.teaching_skills.map(skill => (
                  <button
                    key={skill}
                    onClick={() => setTheirSkill(skill)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                      theirSkill === skill
                        ? 'bg-teal-600 text-white'
                        : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={theirSkill}
                onChange={e => setTheirSkill(e.target.value)}
                placeholder="Or type a specific skill..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                In exchange, I will teach:
              </label>
              <input
                type="text"
                value={mySkill}
                onChange={e => setMySkill(e.target.value)}
                placeholder="e.g., React, Spanish, Photography..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                placeholder={`Hi ${expert.display_name.split(' ')[0]}, I'm interested in exchanging...`}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-700 resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={!mySkill.trim() || !theirSkill.trim()}
              className="w-full"
            >
              <Send className="w-4 h-4" />
              Send Exchange Request
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
