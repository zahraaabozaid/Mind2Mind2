import { useState, useEffect } from 'react';
import {
  BarChart3, Users, TrendingUp, Award,
  Ban, CheckCircle, Trash2, AlertTriangle, Plus, Edit3, Tag,
  Megaphone, LogOut, MessageSquare, ToggleRight, ToggleLeft
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Page } from '../types';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';

interface Props {
  onNavigate: (page: Page) => void;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockUsers = [
  { id: '1', display_name: 'Sara Rahman', email: 'sara@example.com', created_at: '2025-01-15T10:00:00Z', is_available: true, video_verified: true, user_id: 'user_001_sara_rahman' },
  { id: '2', display_name: 'Khaled Ali', email: 'khaled@example.com', created_at: '2025-02-20T11:30:00Z', is_available: true, video_verified: false, user_id: 'user_002_khaled_ali' },
  { id: '3', display_name: 'Fatima Hassan', email: 'fatima@example.com', created_at: '2025-03-10T09:15:00Z', is_available: false, video_verified: true, user_id: 'user_003_fatima_hassan' },
  { id: '4', display_name: 'Ahmed Nasser', email: 'ahmed@example.com', created_at: '2025-04-05T14:20:00Z', is_available: true, video_verified: false, user_id: 'user_004_ahmed_nasser' },
  { id: '5', display_name: 'Leila Mansour', email: 'leila@example.com', created_at: '2025-04-22T16:45:00Z', is_available: true, video_verified: true, user_id: 'user_005_leila_mansour' },
];

const mockIdeas = [
  { id: '1', title: 'AI Recipe Generator', profiles: { display_name: 'Sara Rahman' }, created_at: '2025-05-01T10:00:00Z', status: 'approved', flagged: false },
  { id: '2', title: 'Fashion Marketplace', profiles: { display_name: 'Khaled Ali' }, created_at: '2025-04-28T11:30:00Z', status: 'pending', flagged: false },
  { id: '3', title: 'Arabic Learning Game', profiles: { display_name: 'Fatima Hassan' }, created_at: '2025-04-25T09:15:00Z', status: 'flagged', flagged: true },
  { id: '4', title: 'Smart Energy Optimizer', profiles: { display_name: 'Ahmed Nasser' }, created_at: '2025-04-20T14:20:00Z', status: 'approved', flagged: false },
];

const mockTickets = [
  { id: '#101', user: 'Sara Rahman', subject: 'Cannot upload portfolio files', status: 'open', priority: 'high', date: '2025-05-02' },
  { id: '#102', user: 'Khaled Ali', subject: 'Exchange request not showing', status: 'in-progress', priority: 'medium', date: '2025-05-01' },
  { id: '#103', user: 'Omar Zaki', subject: 'Password reset not working', status: 'resolved', priority: 'low', date: '2025-04-30' },
  { id: '#104', user: 'Leila Mansour', subject: 'Billing inquiry', status: 'open', priority: 'high', date: '2025-04-29' },
];

const mockFeaturedIdeas = [
  { id: '1', title: 'AI Recipe Generator', author: 'Sara Rahman', featured: true },
  { id: '2', title: 'Fashion Marketplace', author: 'Khaled Ali', featured: false },
  { id: '3', title: 'Smart Energy Optimizer', author: 'Ahmed Nasser', featured: true },
  { id: '4', title: 'Freelancer Insurance', author: 'Leila Mansour', featured: false },
];

const mockFlagged = [
  { id: '1', type: 'idea', title: 'Suspicious Investment Scheme', author: 'Unknown User', reason: 'Spam', date: '2025-05-03' },
  { id: '2', type: 'profile', title: 'Fake Verified Expert Profile', author: 'scammer123', reason: 'Impersonation', date: '2025-05-02' },
  { id: '3', type: 'idea', title: 'Copy-pasted NFT Project', author: 'crypto_guy', reason: 'Copyright', date: '2025-05-01' },
];

const mockAlerts = [
  { id: '1', type: 'multiple_accounts', user: 'ip192.168.1.1', severity: 'high', desc: '5 accounts created from same IP in 2 hours', date: '2025-05-03' },
  { id: '2', type: 'spam', user: 'bot_user_99', severity: 'medium', desc: 'Automated proposal submissions detected', date: '2025-05-02' },
  { id: '3', type: 'payment', user: 'refund_abuser', severity: 'low', desc: 'Unusual refund pattern detected', date: '2025-05-01' },
];

const mockCoupons = [
  { id: '1', code: 'LAUNCH50', discount: 50, expiry: '2025-06-30' },
  { id: '2', code: 'SUMMER20', discount: 20, expiry: '2025-08-31' },
];

const initialCategories = ['Technology', 'Education', 'E-Commerce', 'FinTech', 'Productivity', 'Health'];

const navItems = [
  { id: 'overview', label: 'admin.overview', icon: BarChart3 },
  { id: 'users', label: 'admin.users', icon: Users },
  { id: 'ideas', label: 'admin.ideas', icon: TrendingUp },
  { id: 'categories', label: 'admin.categories', icon: Tag },
  { id: 'announcements', label: 'admin.announcements', icon: Megaphone },
];

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-once">
      <CheckCircle className="w-4 h-4 text-teal-400" />
      {message}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, change, trend, color = 'teal' }: {
  icon: typeof BarChart3;
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  color?: string;
}) {
  const { t } = useTheme();
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 bg-${color}-50 dark:bg-${color}-900/30 rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
        </div>
        {change && (
          <div className={`text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend === 'up' ? '↑' : '↓'} {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">{t(label)}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminPage({ onNavigate }: Props) {
  const { t } = useTheme();
  const [activeSection, setActiveSection] = useState('overview');
  const [userList, setUserList] = useState(mockUsers.map(u => ({ ...u })));
  const [ideaList, setIdeaList] = useState(mockIdeas.map(i => ({ ...i })));
  const [featuredList, setFeaturedList] = useState(mockFeaturedIdeas.map(i => ({ ...i })));
  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editCatVal, setEditCatVal] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [coupons, setCoupons] = useState(mockCoupons.map(c => ({ ...c })));
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', expiry: '' });
  const [flaggedList, setFlaggedList] = useState(mockFlagged.map(f => ({ ...f })));
  const [badWordsFilter, setBadWordsFilter] = useState(true);
  const [toast, setToast] = useState('');

  // Stats
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalIdeas, setTotalIdeas] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  // Check admin auth
  useEffect(() => {
    if (sessionStorage.getItem('m2m-admin-auth') !== 'true') {
      onNavigate('admin-login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch stats
      const { data: usersCount } = await supabase.from('profiles').select('id');
      
      if (usersCount) setTotalUsers(usersCount.length);
      // Fetch categories if table exists
      const { data: catsData } = await supabase.from('categories').select('name');
      if (catsData) setCategories(catsData.map(c => c.name));

      // In a real app, we would fetch the lists here
      // For now we keep the mock lists but update from DB if available
      const { data: realUsers } = await supabase.from('profiles').select('*').limit(50);
      if (realUsers && realUsers.length > 0) {
        setUserList(realUsers);
        setTotalUsers(realUsers.length);
      }

      setAvgRating(4.8); // Mock avg rating
      setTotalIdeas(ideaList.length);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showToast('Error loading platform data');
    }
  };

  const showToast = (msg: string) => setToast(msg);

  const handleLogout = () => {
    sessionStorage.removeItem('m2m-admin-auth');
    onNavigate('home');
  };

  // ─── User actions
  const banUser = (id: string) => {
    setUserList(l => l.map(u => u.id === id ? { ...u, is_available: !u.is_available } : u));
    showToast('User status updated');
  };
  const verifyUser = (id: string) => {
    setUserList(l => l.map(u => u.id === id ? { ...u, video_verified: true } : u));
    showToast('User verified');
  };
  const deleteUser = (id: string) => {
    setUserList(l => l.filter(u => u.id !== id));
    showToast('User removed');
  };

  // ─── Idea actions
  const approveIdea = (id: string) => {
    setIdeaList(l => l.map(i => i.id === id ? { ...i, status: 'approved', flagged: false } : i));
    showToast('Idea approved');
  };
  const removeIdea = (id: string) => {
    setIdeaList(l => l.filter(i => i.id !== id));
    showToast('Idea removed');
  };
  const flagIdea = (id: string) => {
    setIdeaList(l => l.map(i => i.id === id ? { ...i, status: 'flagged', flagged: true } : i));
    showToast('Idea flagged');
  };

  // ─── Category actions
  const addCategory = async () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      try {
        const { error } = await supabase
          .from('skill_categories')
          .insert({ name: newCategory.trim(), description: '' });

        if (error) throw error;

        setCategories(c => [...c, newCategory.trim()]);
        setNewCategory('');
        showToast('Category added');
      } catch (err) {
        console.error('Error adding category:', err);
        showToast('Failed to add category');
      }
    }
  };

  const deleteCategory = async (cat: string) => {
    try {
      const { error } = await supabase
        .from('skill_categories')
        .delete()
        .eq('name', cat);

      if (error) throw error;

      setCategories(c => c.filter(x => x !== cat));
      showToast('Category deleted');
    } catch (err) {
      console.error('Error deleting category:', err);
      showToast('Failed to delete category');
    }
  };

  const saveEditCategory = async (old: string) => {
    if (editCatVal.trim()) {
      try {
        const { error } = await supabase
          .from('skill_categories')
          .update({ name: editCatVal.trim() })
          .eq('name', old);

        if (error) throw error;

        setCategories(c => c.map(x => x === old ? editCatVal.trim() : x));
        setEditingCat(null);
        showToast('Category updated');
      } catch (err) {
        console.error('Error updating category:', err);
        showToast('Failed to update category');
      }
    }
  };

  // ─── Toggle featured
  const toggleFeatured = (id: string) => {
    setFeaturedList(l => l.map(f => f.id === id ? { ...f, featured: !f.featured } : f));
    showToast('Featured status updated');
  };

  // ─── Coupon actions
  const addCoupon = () => {
    if (newCoupon.code.trim() && newCoupon.discount && newCoupon.expiry) {
      setCoupons(c => [...c, { id: String(Date.now()), code: newCoupon.code.toUpperCase(), discount: Number(newCoupon.discount), expiry: newCoupon.expiry }]);
      setNewCoupon({ code: '', discount: '', expiry: '' });
      showToast('Coupon added');
    }
  };
  const deleteCoupon = (id: string) => {
    setCoupons(c => c.filter(x => x.id !== id));
    showToast('Coupon deleted');
  };

  // ─── Moderation actions
  const approveFlagged = (id: string) => { setFlaggedList(l => l.filter(f => f.id !== id)); showToast('Content approved'); };
  const rejectFlagged = (id: string) => { setFlaggedList(l => l.filter(f => f.id !== id)); showToast('Content removed'); };

  const renderSection = () => {
    switch (activeSection) {
      // ── Overview ──────────────────────────────────────────────────────────
      case 'overview': return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="admin.totalUsers" value={totalUsers} color="teal" />
            <StatCard icon={TrendingUp} label="admin.ideasPosted" value={totalIdeas} color="blue" />
            <StatCard icon={Award} label="admin.avgRating" value={avgRating.toFixed(2)} color="amber" />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('admin.highlights')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { label: 'admin.realUsers', val: totalUsers },
                { label: 'admin.activeIdeas', val: totalIdeas },
                { label: 'admin.verifiedUsers', val: userList.filter(u => u.video_verified).length },
                { label: 'admin.categories', val: categories.length }
              ].map(({ label, val }) => (
                <div key={label} className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-3">
                  <div className="text-xl font-bold text-teal-700 dark:text-teal-400">{val}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t(label)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

      // ── Users ──────────────────────────────────────────────────────────────
      case 'users': return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">{t('admin.manageUsers')}</h2>
            <span className="text-sm text-slate-500">{userList.length} {t('admin.users')}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  <th className="text-left px-5 py-3">{t('admin.user')}</th>
                  <th className="text-left px-5 py-3">{t('admin.userID')}</th>
                  <th className="text-left px-5 py-3">{t('admin.joined')}</th>
                  <th className="text-left px-5 py-3">{t('admin.status')}</th>
                  <th className="text-left px-5 py-3">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {userList.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-400 text-xs font-bold">{user.display_name[0]}</div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">{user.display_name}</div>
                          {user.video_verified && <span className="text-[10px] text-teal-600">✓ Verified</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400">{user.user_id.substring(0, 8)}...</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <Badge color={user.is_available ? 'green' : 'rose'} size="sm">{user.is_available ? 'active' : 'banned'}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => banUser(user.id)} title={user.is_available ? 'Ban' : 'Unban'} className={`p-1.5 rounded-lg transition-colors ${!user.is_available ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}>
                          <Ban className="w-4 h-4" />
                        </button>
                        {!user.video_verified && (
                          <button onClick={() => verifyUser(user.id)} title="Verify" className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => deleteUser(user.id)} title="Delete" className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

      // ── Ideas ──────────────────────────────────────────────────────────────
      case 'ideas': return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">{t('admin.manageIdeas')}</h2>
            <span className="text-sm text-slate-500">{ideaList.length} {t('ideas.title')}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  <th className="text-left px-5 py-3">{t('ideas.title')}</th>
                  <th className="text-left px-5 py-3">{t('admin.user')}</th>
                  <th className="text-left px-5 py-3">{t('admin.joined')}</th>
                  <th className="text-left px-5 py-3">{t('admin.status')}</th>
                  <th className="text-left px-5 py-3">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {ideaList.map(idea => (
                  <tr key={idea.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-slate-900 dark:text-white max-w-[200px] truncate">{idea.title}</td>
                    <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400">{idea.profiles?.display_name || 'Unknown'}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{new Date(idea.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <Badge color={idea.status === 'approved' ? 'green' : idea.status === 'flagged' ? 'rose' : 'amber'} size="sm">{idea.status}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => approveIdea(idea.id)} title="Approve" className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => flagIdea(idea.id)} title="Flag" className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeIdea(idea.id)} title="Remove" className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

      // ── Support Tickets ────────────────────────────────────────────────────
      case 'tickets': return (
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Support Tickets</h2>
          {mockTickets.map(ticket => (
            <div key={ticket.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-400">{ticket.id}</span>
                    <Badge color={ticket.status === 'resolved' ? 'green' : ticket.status === 'in-progress' ? 'amber' : 'rose'} size="sm">{ticket.status}</Badge>
                    <Badge color={ticket.priority === 'high' ? 'rose' : ticket.priority === 'medium' ? 'amber' : 'slate'} size="sm">{ticket.priority} priority</Badge>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{ticket.subject}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{ticket.user} · {ticket.date}</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      );

      // ── Categories ─────────────────────────────────────────────────────────
      case 'categories': return (
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">{t('admin.categories')}</h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex gap-2 mb-5">
              <input
                type="text"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCategory()}
                placeholder="New category name"
                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100"
              />
              <Button onClick={addCategory}>
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  {editingCat === cat ? (
                    <>
                      <input
                        type="text"
                        value={editCatVal}
                        onChange={e => setEditCatVal(e.target.value)}
                        className="flex-1 mr-2 px-3 py-1 border border-teal-300 rounded-lg text-sm focus:outline-none dark:bg-slate-600 dark:text-white"
                        onKeyDown={e => e.key === 'Enter' && saveEditCategory(cat)}
                      />
                      <Button size="sm" onClick={() => saveEditCategory(cat)}>Save</Button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        {cat}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditingCat(cat); setEditCatVal(cat); }} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteCategory(cat)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );

      // ── Announcements ──────────────────────────────────────────────────────
      case 'announcements': return (
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">{t('admin.announcements')}</h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('admin.announcements')}</p>
            <textarea
              rows={5}
              value={announcement}
              onChange={e => setAnnouncement(e.target.value)}
              placeholder="Type your announcement here…"
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100 resize-none mb-4"
            />
            <Button onClick={() => { if (announcement.trim()) { showToast('Announcement sent to all users!'); setAnnouncement(''); } }}>
              <Megaphone className="w-4 h-4" />
              Send to All Users
            </Button>
          </div>
        </div>
      );

      // ── Fraud Alerts ───────────────────────────────────────────────────────
      case 'fraud': return (
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Fraud Detection Alerts</h2>
          {mockAlerts.map(alert => (
            <div key={alert.id} className={`rounded-2xl border p-5 ${alert.severity === 'high' ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800' :
                alert.severity === 'medium' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' :
                  'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 ${alert.severity === 'high' ? 'text-rose-600' : alert.severity === 'medium' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{alert.desc}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Flagged: {alert.user} · {alert.date}</p>
                  </div>
                </div>
                <Badge color={alert.severity === 'high' ? 'rose' : alert.severity === 'medium' ? 'amber' : 'slate'} size="sm">{alert.severity}</Badge>
              </div>
            </div>
          ))}
        </div>
      );

      // ── Featured Listings ──────────────────────────────────────────────────
      case 'featured': return (
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Featured Listings</h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {featuredList.map((idea, i) => (
              <div key={idea.id} className={`flex items-center justify-between p-4 ${i < featuredList.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''}`}>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{idea.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">by {idea.author}</p>
                </div>
                <button
                  onClick={() => toggleFeatured(idea.id)}
                  className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-xl transition-colors ${idea.featured ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                >
                  {idea.featured ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  {idea.featured ? 'Featured' : 'Not Featured'}
                </button>
              </div>
            ))}
          </div>
        </div>
      );

      // ── Coupons ────────────────────────────────────────────────────────────
      case 'coupons': return (
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Coupon Manager</h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Add New Coupon</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <input type="text" placeholder="Code (e.g. LAUNCH50)" value={newCoupon.code} onChange={e => setNewCoupon(c => ({ ...c, code: e.target.value.toUpperCase() }))}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100" />
              <input type="number" placeholder="Discount %" value={newCoupon.discount} onChange={e => setNewCoupon(c => ({ ...c, discount: e.target.value }))}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100" />
              <input type="date" value={newCoupon.expiry} onChange={e => setNewCoupon(c => ({ ...c, expiry: e.target.value }))}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-100" />
            </div>
            <Button size="sm" onClick={addCoupon}><Plus className="w-4 h-4" /> Add Coupon</Button>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">Code</th>
                  <th className="text-left px-5 py-3">Discount</th>
                  <th className="text-left px-5 py-3">Expiry</th>
                  <th className="text-left px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {coupons.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-sm font-semibold text-teal-700 dark:text-teal-400">{c.code}</td>
                    <td className="px-5 py-3 text-sm text-slate-700 dark:text-slate-300">{c.discount}% off</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{c.expiry}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => deleteCoupon(c.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

      // ── Content Moderation ─────────────────────────────────────────────────
      case 'moderation': return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">Content Moderation</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">Bad Words Filter</span>
              <button
                onClick={() => { setBadWordsFilter(!badWordsFilter); showToast(`Bad words filter ${!badWordsFilter ? 'enabled' : 'disabled'}`); }}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl transition-colors ${badWordsFilter ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}
              >
                {badWordsFilter ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                {badWordsFilter ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
          {flaggedList.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 text-center">
              <CheckCircle className="w-10 h-10 text-teal-400 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No flagged content to review.</p>
            </div>
          ) : flaggedList.map(item => (
            <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-rose-100 dark:border-rose-900/30 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge color="rose" size="sm">{item.type}</Badge>
                    <Badge color="amber" size="sm">{item.reason}</Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">by {item.author} · {item.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => approveFlagged(item.id)}>
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => rejectFlagged(item.id)}>
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-16 flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('admin.panel')}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5 truncate">mohamedhosamm81@gmail.com</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${activeSection === item.id
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {t(item.label)}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-sm text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-2 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" />
            {t('admin.logout')}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeSection === item.id ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t(item.label)}
              </button>
            );
          })}
        </div>

        <div className="p-5 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              {t(navItems.find(n => n.id === activeSection)?.label || '')}
            </h1>
            <button onClick={handleLogout} className="hidden md:flex items-center gap-1.5 text-sm text-slate-500 hover:text-rose-600 transition-colors">
              <LogOut className="w-4 h-4" /> {t('admin.logout')}
            </button>
          </div>
          {renderSection()}
        </div>
      </main>

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
