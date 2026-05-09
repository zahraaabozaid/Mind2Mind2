import { useState, useEffect } from 'react';
import { X, Upload, FileVideo, FileText, Globe, Lock, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

import { KnowledgeDemo } from '../../types';

interface Props {
  onClose: () => void;
  onUploaded: (demo?: KnowledgeDemo) => void;
}

export default function DemoUploadModal({ onClose, onUploaded }: Props) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillName, setSkillName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'video' | 'pdf'>('video');
  const [visibility, setVisibility] = useState<'public' | 'custom'>('public');
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
  const [usernameInput, setUsernameInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Technology');

  useEffect(() => {
    const fetchCats = async () => {
      const { data } = await supabase.from('skill_categories').select('*').order('name');
      if (data) setCategories(data);
    };
    fetchCats();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type.startsWith('video/')) {
      setFileType('video');
    } else if (f.type === 'application/pdf') {
      setFileType('pdf');
    }
    setFile(f);
  };

  const addAllowedUser = () => {
    const trimmed = usernameInput.trim().toLowerCase();
    if (trimmed && !allowedUsers.includes(trimmed)) {
      setAllowedUsers(prev => [...prev, trimmed]);
    }
    setUsernameInput('');
  };

  const removeAllowedUser = (username: string) => {
    setAllowedUsers(prev => prev.filter(u => u !== username));
  };

  const handleUpload = async () => {
    if (!user) {
      setError('You must be logged in to upload');
      return;
    }
    if (!file) {
      setError('No file selected. Please choose a video or PDF.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a title for your demo.');
      return;
    }

    setError('');
    setSuccess('');
    setUploading(true);
    setUploadProgress(10);

    let uploadedPath = '';

    try {
      // 1. Prepare Path & Filename
      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const storagePath = `${user.id}/${timestamp}_${cleanFileName}`;
      uploadedPath = storagePath;
      
      console.log("Starting upload to path:", storagePath);
      setUploadProgress(30);

      // 2. Upload to Storage
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('demos')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadErr) {
        console.error("Supabase Storage Error:", uploadErr);
        throw new Error(`Storage Error: ${uploadErr.message}`);
      }

      console.log("Storage upload successful:", uploadData);
      setUploadProgress(60);

      // 3. Get Public URL
      const { data: urlData } = supabase.storage.from('demos').getPublicUrl(storagePath);
      const fileUrl = urlData.publicUrl;

      // 4. Insert Database Record
      console.log("Inserting database record...");
      const { data: insertData, error: insertErr } = await supabase.from('demos').insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        file_url: fileUrl,
        file_type: fileType,
        visibility: visibility,
        allowed_users: visibility === 'custom' ? allowedUsers : [],
        skill_name: skillName.trim() || 'General',
        category: selectedCategory
      }).select();
      
      if (insertErr) {
        console.error("Database Insert Error:", insertErr);
        // ROLLBACK: Delete the uploaded file since DB record failed
        console.log("Rolling back: Deleting uploaded file from storage...");
        await supabase.storage.from('demos').remove([storagePath]);
        throw new Error(`Database Error: ${insertErr.message}`);
      }

      console.log("Database record created:", insertData);
      setUploadProgress(100);
      setSuccess('Demo uploaded and published successfully!');

      // Final confirmation before closing
      setTimeout(() => {
        onUploaded(insertData?.[0]);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Critical Upload Failure:', err);
      setError(err.message || 'An unexpected error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-indigo-600 to-teal-600 px-6 pt-6 pb-8 text-center relative rounded-t-3xl">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Upload Demo</h2>
          <p className="text-white/70 text-sm">Share your knowledge with a video or PDF</p>
        </div>

        <div className="px-6 py-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800"
              placeholder="e.g., Introduction to React Hooks"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 resize-none"
              placeholder="Describe what this demo covers..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800 bg-white"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
              {categories.length === 0 && <option value="Technology">Technology</option>}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Skill / Topic</label>
            <input
              type="text"
              value={skillName}
              onChange={e => setSkillName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800"
              placeholder="e.g., React, Python, Photography"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">File (Video or PDF)</label>
            <label className="flex items-center gap-3 border-2 border-dashed border-slate-200 rounded-2xl p-5 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                {fileType === 'video' ? (
                  <FileVideo className="w-6 h-6 text-slate-400 group-hover:text-teal-500" />
                ) : (
                  <FileText className="w-6 h-6 text-slate-400 group-hover:text-teal-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {file ? (
                  <>
                    <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(1)} MB • {fileType.toUpperCase()}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-500 group-hover:text-teal-600">Click to choose a file</p>
                    <p className="text-xs text-slate-400">MP4, MOV, WebM, or PDF (max 50MB)</p>
                  </>
                )}
              </div>
              <input type="file" accept="video/*,application/pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Visibility</label>
            <div className="flex gap-3">
              <button
                onClick={() => setVisibility('public')}
                className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  visibility === 'public'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Globe className="w-4 h-4" />
                Public
              </button>
              <button
                onClick={() => setVisibility('custom')}
                className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  visibility === 'custom'
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Lock className="w-4 h-4" />
                Custom
              </button>
            </div>
          </div>

          {visibility === 'custom' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
              <label className="block text-sm font-medium text-amber-800">Allowed Usernames</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAllowedUser())}
                  className="flex-1 border border-amber-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 text-slate-800 bg-white"
                  placeholder="Enter a username"
                />
                <button onClick={addAllowedUser} className="p-2 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {allowedUsers.map(username => (
                  <span key={username} className="inline-flex items-center gap-1 bg-white text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-medium">
                    @{username}
                    <button onClick={() => removeAllowedUser(username)} className="hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-teal-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-teal-500 h-2 rounded-full transition-all duration-500" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
          {success && <div className="bg-teal-50 border border-teal-100 text-teal-700 text-sm px-4 py-3 rounded-xl">{success}</div>}

          <Button onClick={handleUpload} loading={uploading} disabled={!file || !title.trim()} className="w-full" size="lg">
            <Upload className="w-4 h-4" />
            Upload Demo
          </Button>
        </div>
      </div>
    </div>
  );
}
