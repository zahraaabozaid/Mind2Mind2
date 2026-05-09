import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface FilterPanelProps {
  onClose?: () => void;
  onApply: (filters: any) => void;
  isMobile?: boolean;
}

export default function AdvancedFilterPanel({ onClose, onApply, isMobile = false }: FilterPanelProps) {
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    responseTime: 'any',
    languages: [] as string[],
    verificationStatus: 'any',
    exchangeCount: 0,
    skillLevel: 'any',
  });

  const [expandedSections, setExpandedSections] = useState({
    price: true,
    responseTime: true,
    languages: false,
    verification: false,
    exchanges: false,
    skillLevel: false,
  });

  const languages = ['Arabic', 'English', 'French', 'Spanish', 'German', 'Chinese', 'Japanese'];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleLanguage = (lang: string) => {
    setFilters(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const handleApply = () => {
    onApply(filters);
    if (isMobile && onClose) onClose();
  };

  const handleReset = () => {
    setFilters({
      priceRange: [0, 1000],
      responseTime: 'any',
      languages: [],
      verificationStatus: 'any',
      exchangeCount: 0,
      skillLevel: 'any',
    });
  };

  const FilterSection = ({
    title,
    section,
    children,
  }: {
    title: string;
    section: keyof typeof expandedSections;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <span className="font-medium text-slate-900">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${
            expandedSections[section] ? 'rotate-180' : ''
          }`}
        />
      </button>
      {expandedSections[section] && <div className="px-4 py-3 bg-slate-50">{children}</div>}
    </div>
  );

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 ${
        isMobile ? 'fixed inset-0 z-50 rounded-none flex flex-col' : 'w-full max-w-sm'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">Advanced Filters</h3>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${isMobile ? '' : ''}`}>
        {/* Price Range */}
        <FilterSection title="Price Range" section="price">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">$0</span>
              <span className="font-medium text-slate-900">${filters.priceRange[1]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={filters.priceRange[1]}
              onChange={(e) =>
                setFilters(prev => ({
                  ...prev,
                  priceRange: [prev.priceRange[0], parseInt(e.target.value)],
                }))
              }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </FilterSection>

        {/* Response Time */}
        <FilterSection title="Response Time" section="responseTime">
          <div className="space-y-2">
            {['any', 'within-1h', 'within-24h', 'within-week'].map(option => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="responseTime"
                  value={option}
                  checked={filters.responseTime === option}
                  onChange={(e) => setFilters(prev => ({ ...prev, responseTime: e.target.value }))}
                  className="w-4 h-4 text-teal-600"
                />
                <span className="text-sm text-slate-700">
                  {option === 'any'
                    ? 'Any'
                    : option === 'within-1h'
                      ? 'Within 1 hour'
                      : option === 'within-24h'
                        ? 'Within 24 hours'
                        : 'Within a week'}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Languages */}
        <FilterSection title="Languages" section="languages">
          <div className="space-y-2">
            {languages.map(lang => (
              <label key={lang} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.languages.includes(lang)}
                  onChange={() => toggleLanguage(lang)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <span className="text-sm text-slate-700">{lang}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Verification Status */}
        <FilterSection title="Verification Status" section="verification">
          <div className="space-y-2">
            {['any', 'verified', 'unverified'].map(option => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="verification"
                  value={option}
                  checked={filters.verificationStatus === option}
                  onChange={(e) => setFilters(prev => ({ ...prev, verificationStatus: e.target.value }))}
                  className="w-4 h-4 text-teal-600"
                />
                <span className="text-sm text-slate-700">
                  {option === 'any' ? 'All' : option === 'verified' ? 'Video Verified' : 'Not Verified'}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Exchange Count */}
        <FilterSection title="Minimum Exchanges" section="exchanges">
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-900">{filters.exchangeCount}+ exchanges</div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filters.exchangeCount}
              onChange={(e) => setFilters(prev => ({ ...prev, exchangeCount: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </FilterSection>

        {/* Skill Level */}
        <FilterSection title="Skill Level" section="skillLevel">
          <div className="space-y-2">
            {['any', 'beginner', 'intermediate', 'advanced', 'expert'].map(option => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="skillLevel"
                  value={option}
                  checked={filters.skillLevel === option}
                  onChange={(e) => setFilters(prev => ({ ...prev, skillLevel: e.target.value }))}
                  className="w-4 h-4 text-teal-600"
                />
                <span className="text-sm text-slate-700 capitalize">
                  {option === 'any' ? 'All Levels' : option}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Footer */}
      <div className={`border-t border-slate-200 px-4 py-3 flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
