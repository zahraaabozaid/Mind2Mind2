import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { skillCategories } from '../../lib/arab-data';

interface SearchFilters {
  query: string;
  category: string;
  rating: number;
  availability: 'all' | 'available' | 'unavailable';
  sortBy: 'relevance' | 'rating' | 'recent';
}

interface SmartSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  placeholder?: string;
  showAdvanced?: boolean;
}

export default function SmartSearchBar({
  onSearch,
  placeholder = 'Search skills, experts, or topics...',
  showAdvanced = true,
}: SmartSearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    rating: 0,
    availability: 'all',
    sortBy: 'relevance',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const mockSuggestions = [
    'React',
    'Python',
    'Web Design',
    'Arabic',
    'Guitar',
    'Yoga',
    'Machine Learning',
    'UI/UX Design',
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters({ ...filters, query: value });

    if (value.length > 0) {
      const filtered = mockSuggestions.filter(s =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const newFilters = { ...filters, query: suggestion };
    setFilters(newFilters);
    setShowSuggestions(false);
    onSearch(newFilters);
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      query: '',
      category: '',
      rating: 0,
      availability: 'all',
      sortBy: 'relevance',
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const hasActiveFilters =
    filters.query ||
    filters.category ||
    filters.rating > 0 ||
    filters.availability !== 'all' ||
    filters.sortBy !== 'relevance';

  return (
    <div ref={searchRef} className="w-full">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={filters.query}
              onChange={handleQueryChange}
              onFocus={() => filters.query && setShowSuggestions(true)}
              placeholder={placeholder}
              className="w-full pl-12 pr-4 py-3 md:py-4 bg-white border border-slate-200 rounded-lg md:rounded-l-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm md:text-base"
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <Search className="w-3.5 h-3.5 inline mr-2 text-slate-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-4 md:px-6 py-3 md:py-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg md:rounded-r-lg transition-colors text-sm md:text-base"
          >
            Search
          </button>
        </div>

        {/* Clear Button */}
        {filters.query && (
          <button
            onClick={handleClear}
            className="absolute right-16 md:right-24 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              hasActiveFilters
                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-teal-600 text-white text-xs rounded-full">
                {Object.values(filters).filter(v => v && v !== 'all' && v !== 'relevance' && v !== 0).length}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {showFilters && (
            <div className="mt-3 p-4 bg-white border border-slate-200 rounded-lg space-y-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                >
                  <option value="">All Categories</option>
                  {skillCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Rating</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700 min-w-fit">
                    {filters.rating > 0 ? `${filters.rating}+` : 'Any'}
                  </span>
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Availability</label>
                <div className="flex gap-2">
                  {['all', 'available', 'unavailable'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleFilterChange('availability', option)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filters.availability === option
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {option === 'all' ? 'All' : option === 'available' ? 'Available' : 'Unavailable'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating">Highest Rating</option>
                  <option value="recent">Most Recent</option>
                </select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={handleClear}
                  className="w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
