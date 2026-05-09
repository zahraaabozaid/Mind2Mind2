import React, { useState } from 'react';
import { BarChart3, Users, TrendingUp, Activity, Award, DollarSign, ChevronDown, Filter, Download } from 'lucide-react';
import { AdminStats } from '../../types';

interface AdminDashboardProps {
  stats?: AdminStats;
}

export default function AdminDashboard({ stats }: AdminDashboardProps) {
  const [dateRange, setDateRange] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'exchanges' | 'revenue'>('users');

  // Mock stats
  const mockStats: AdminStats = stats || {
    total_users: 12847,
    total_exchanges: 5234,
    total_revenue: 125430,
    active_users_today: 2341,
    new_users_this_week: 487,
    average_rating: 4.72,
    most_popular_skills: ['React', 'Python', 'UI/UX Design', 'Arabic', 'Guitar'],
    verified_users_count: 8932,
  };

  const StatCard = ({ icon: Icon, label, value, change, trend }: any) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-teal-600" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend === 'up' ? '↑' : '↓'} {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-slate-500 text-sm mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-500">Monitor platform performance and user activity</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium ml-auto">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Total Users"
            value={mockStats.total_users}
            change={12}
            trend="up"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Exchanges"
            value={mockStats.total_exchanges}
            change={8}
            trend="up"
          />
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={mockStats.total_revenue}
            change={15}
            trend="up"
          />
          <StatCard
            icon={Award}
            label="Avg. Rating"
            value={mockStats.average_rating}
            change={2}
            trend="up"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Active Users Today</h3>
              <Activity className="w-5 h-5 text-teal-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-2">{mockStats.active_users_today.toLocaleString()}</p>
            <p className="text-sm text-slate-500">+{mockStats.new_users_this_week} new this week</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Verified Users</h3>
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-2">{mockStats.verified_users_count.toLocaleString()}</p>
            <p className="text-sm text-slate-500">
              {((mockStats.verified_users_count / mockStats.total_users) * 100).toFixed(1)}% of total
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Platform Health</h3>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex items-end gap-2 mb-2">
              <div className="flex-1 h-8 bg-emerald-500 rounded" style={{ height: '32px' }} />
              <div className="flex-1 h-6 bg-emerald-500 rounded" style={{ height: '24px' }} />
              <div className="flex-1 h-10 bg-emerald-500 rounded" style={{ height: '40px' }} />
            </div>
            <p className="text-sm text-slate-500">Excellent</p>
          </div>
        </div>

        {/* Popular Skills */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Most Popular Skills</h3>
          <div className="space-y-4">
            {mockStats.most_popular_skills.map((skill, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">{skill}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full"
                      style={{ width: `${100 - i * 15}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-500 min-w-fit">{100 - i * 15}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">User Growth</h3>
          <div className="flex items-end gap-2 h-48">
            {[45, 52, 48, 65, 72, 68, 85, 92, 88, 95, 102, 110].map((val, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-lg hover:from-teal-700 hover:to-teal-500 transition-colors cursor-pointer group relative"
                style={{ height: `${(val / 110) * 100}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {val}K
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-4">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
          </div>
        </div>
      </div>
    </div>
  );
}
