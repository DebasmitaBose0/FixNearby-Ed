import { useState, useEffect } from 'react';
import IssueSubmissionForm from '../components/IssueSubmissionForm';
import { getNearbyIssues, upvoteIssue } from '../services/issueService';
import useToast from '../hooks/useToast';
import { AlertTriangle, MapPin, ThumbsUp, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import useGeolocation from '../hooks/useGeolocation';

const CivicIssues = () => {
  const { coords, loading: geoLoading } = useGeolocation();
  const { showToast } = useToast();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'report'

  const categories = [
    'All',
    'Traffic Light',
    'Pothole',
    'Street Light',
    'Sidewalk',
    'Drainage',
    'Graffiti',
    'Litter',
    'Other'
  ];

  const fetchIssues = async () => {
    try {
      setLoading(true);
      // Default coordinates if geolocation not yet loaded
      const lat = coords?.latitude || 40.7128;
      const lng = coords?.longitude || -74.0060;
      const data = await getNearbyIssues({
        latitude: lat,
        longitude: lng,
        category: filterCategory !== 'All' ? filterCategory : undefined,
        radiusKm: 10
      });
      if (data && Array.isArray(data.data)) {
        setIssues(data.data);
      } else if (Array.isArray(data)) {
        setIssues(data);
      }
    } catch (error) {
      console.error('Failed to load issues:', error);
      showToast({ type: 'error', message: 'Could not fetch neighborhood reports.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [coords, filterCategory]);

  const handleUpvote = async (id) => {
    try {
      await upvoteIssue(id);
      showToast({ type: 'success', message: 'Upvote recorded!' });
      fetchIssues();
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Already upvoted or failed to upvote.' });
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const filteredIssues = issues.filter(issue => 
    issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          Civic Reporting Portal 🛠️
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Help improve your neighborhood. Report public issues like potholes, broken street lights, or road obstructions, and track their resolution status.
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-xl bg-slate-100 p-1.5">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'list'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Reports
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'report'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Report New Issue
          </button>
        </div>
      </div>

      {activeTab === 'report' ? (
        <div className="animate-fadeIn">
          <IssueSubmissionForm onSubmitSuccess={() => {
            setActiveTab('list');
            fetchIssues();
          }} />
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          {/* Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search reported issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Filter className="text-slate-400 shrink-0" size={18} />
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      filterCategory === cat
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="animate-pulse bg-white border border-slate-200 rounded-2xl p-6 h-48" />
              ))}
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
              <h3 className="text-lg font-bold text-slate-900">No issues found</h3>
              <p className="text-slate-500 text-sm mt-1">Be the first to report an issue in this area!</p>
              <button
                onClick={() => setActiveTab('report')}
                className="mt-6 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
              >
                Report Issue
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredIssues.map((issue) => (
                <div
                  key={issue._id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeColor(issue.status)}`}>
                        {issue.status?.toUpperCase() || 'OPEN'}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(issue.reportedAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2">{issue.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {issue.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between mt-auto">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-400" />
                      {issue.category}
                    </span>

                    <button
                      onClick={() => handleUpvote(issue._id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition"
                    >
                      <ThumbsUp size={14} />
                      Upvote ({issue.upvotes || 0})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CivicIssues;
