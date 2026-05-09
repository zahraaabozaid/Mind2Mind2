import re

with open('src/pages/AdminPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add supabase import
content = content.replace("import { useTheme } from '../context/ThemeContext';", "import { useTheme } from '../context/ThemeContext';\nimport { supabase } from '../lib/supabase';")

# Remove mock data block
mock_data_pattern = re.compile(r'// ─── Mock data ───.*?const navItems = \[', re.DOTALL)
content = mock_data_pattern.sub('const navItems = [', content)

# Replace state initializations
states_pattern = re.compile(r'const \[activeSection, setActiveSection\] = useState\(\'overview\'\);.*?const \[sidebarOpen, setSidebarOpen\] = useState\(false\);', re.DOTALL)

new_states = '''const [activeSection, setActiveSection] = useState('overview');
  const [userList, setUserList] = useState<any[]>([]);
  const [ideaList, setIdeaList] = useState<any[]>([]);
  const [featuredList, setFeaturedList] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editCatVal, setEditCatVal] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', expiry: '' });
  const [flaggedList, setFlaggedList] = useState<any[]>([]);
  const [ticketsList, setTicketsList] = useState<any[]>([]);
  const [alertsList, setAlertsList] = useState<any[]>([]);
  const [badWordsFilter, setBadWordsFilter] = useState(true);
  const [toast, setToast] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);'''

content = states_pattern.sub(new_states, content)

# Replace useEffect and Handlers
handlers_pattern = re.compile(r'// Check admin auth.*?const renderSection = \(\) => \{', re.DOTALL)

new_handlers = '''// Check admin auth
  useEffect(() => {
    if (sessionStorage.getItem('m2m-admin-auth') !== 'true') {
      onNavigate('admin-login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch users
      const { data: profiles } = await supabase.from('profiles').select('*');
      if (profiles) {
        setUserList(profiles.map(p => ({
          id: p.id,
          name: p.display_name || p.username,
          email: p.username + '@user.com',
          joined: new Date(p.created_at).toISOString().split('T')[0],
          status: p.status || 'active',
          verified: p.video_verified
        })));
      }

      // Fetch ideas
      const { data: demos } = await supabase.from('knowledge_demos').select('*, profiles(display_name, username)');
      if (demos) {
        const mappedDemos = demos.map(d => ({
          id: d.id,
          title: d.title,
          author: d.profiles?.display_name || d.profiles?.username || 'Unknown',
          date: new Date(d.created_at).toISOString().split('T')[0],
          status: d.is_flagged ? 'flagged' : (d.is_published ? 'approved' : 'pending'),
          flagged: d.is_flagged,
          featured: d.is_featured,
          reason: d.flag_reason || '',
          type: 'idea'
        }));
        setIdeaList(mappedDemos);
        setFeaturedList(mappedDemos.filter(d => d.featured));
        setFlaggedList(mappedDemos.filter(d => d.flagged));
      }

      // Fetch tickets
      const { data: tickets } = await supabase.from('support_tickets').select('*');
      if (tickets) {
        setTicketsList(tickets.map(t => ({
          id: '#' + t.id.substring(0, 4),
          rawId: t.id,
          user: t.user_id,
          subject: t.subject,
          status: t.status,
          priority: t.priority,
          date: new Date(t.created_at).toISOString().split('T')[0]
        })));
      }

      // Fetch categories
      const { data: cats } = await supabase.from('profiles').select('category');
      if (cats) {
        const uniqueCats = Array.from(new Set(cats.map(c => c.category).filter(Boolean))) as string[];
        setCategories(uniqueCats.length > 0 ? uniqueCats : ['Technology', 'Education', 'E-Commerce']);
      }

      // Fetch coupons
      const { data: coups } = await supabase.from('coupons').select('*');
      if (coups) {
        setCoupons(coups.map(c => ({
          id: c.id,
          code: c.code,
          discount: c.discount_percentage,
          expiry: c.expiry_date
        })));
      }

      // Fetch alerts
      const { data: alerts } = await supabase.from('fraud_alerts').select('*');
      if (alerts) {
        setAlertsList(alerts.map(a => ({
          id: a.id,
          type: a.type,
          user: a.user_id || 'Unknown',
          severity: a.severity,
          desc: a.description,
          date: new Date(a.created_at).toISOString().split('T')[0]
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg: string) => setToast(msg);

  const handleLogout = () => {
    sessionStorage.removeItem('m2m-admin-auth');
    onNavigate('home');
  };

  const banUser = async (id: string) => {
    const user = userList.find(u => u.id === id);
    if (!user) return;
    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    await supabase.from('profiles').update({ status: newStatus }).eq('id', id);
    fetchData();
    showToast('User status updated');
  };
  const verifyUser = async (id: string) => {
    await supabase.from('profiles').update({ video_verified: true }).eq('id', id);
    fetchData();
    showToast('User verified');
  };
  const deleteUser = async (id: string) => {
    await supabase.from('profiles').delete().eq('id', id);
    fetchData();
    showToast('User removed');
  };

  const approveIdea = async (id: string) => {
    await supabase.from('knowledge_demos').update({ is_published: true, is_flagged: false }).eq('id', id);
    fetchData();
    showToast('Idea approved');
  };
  const removeIdea = async (id: string) => {
    await supabase.from('knowledge_demos').delete().eq('id', id);
    fetchData();
    showToast('Idea removed');
  };
  const flagIdea = async (id: string) => {
    await supabase.from('knowledge_demos').update({ is_flagged: true, is_published: false, flag_reason: 'Admin flagged' }).eq('id', id);
    fetchData();
    showToast('Idea flagged');
  };

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(c => [...c, newCategory.trim()]);
      setNewCategory('');
      showToast('Category added');
    }
  };
  const deleteCategory = (cat: string) => {
    setCategories(c => c.filter(x => x !== cat));
    showToast('Category deleted');
  };
  const saveEditCategory = (old: string) => {
    if (editCatVal.trim()) {
      setCategories(c => c.map(x => x === old ? editCatVal.trim() : x));
      setEditingCat(null);
      showToast('Category updated');
    }
  };

  const toggleFeatured = async (id: string) => {
    const idea = ideaList.find(i => i.id === id);
    if (!idea) return;
    await supabase.from('knowledge_demos').update({ is_featured: !idea.featured }).eq('id', id);
    fetchData();
    showToast('Featured status updated');
  };

  const addCoupon = async () => {
    if (newCoupon.code.trim() && newCoupon.discount && newCoupon.expiry) {
      await supabase.from('coupons').insert({
        code: newCoupon.code.toUpperCase(),
        discount_percentage: Number(newCoupon.discount),
        expiry_date: newCoupon.expiry
      });
      setNewCoupon({ code: '', discount: '', expiry: '' });
      fetchData();
      showToast('Coupon added');
    }
  };
  const deleteCoupon = async (id: string) => {
    await supabase.from('coupons').delete().eq('id', id);
    fetchData();
    showToast('Coupon deleted');
  };

  const approveFlagged = async (id: string) => {
    await supabase.from('knowledge_demos').update({ is_flagged: false, is_published: true }).eq('id', id);
    fetchData();
    showToast('Content approved');
  };
  const rejectFlagged = async (id: string) => {
    await supabase.from('knowledge_demos').delete().eq('id', id);
    fetchData();
    showToast('Content removed');
  };

  const renderSection = () => {'''

content = handlers_pattern.sub(new_handlers, content)

# Replace mockTickets and mockAlerts
content = content.replace('mockTickets.map', 'ticketsList.map')
content = content.replace('mockAlerts.map', 'alertsList.map')

with open('src/pages/AdminPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
