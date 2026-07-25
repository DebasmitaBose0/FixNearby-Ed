import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileCheck,
  Flag,
  Eye,
  Download,
  X,
  FileText,
  UserCheck,
  UserX,
  ArrowLeft
} from "lucide-react";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import {
  getReportedReviews,
  approveReview,
  rejectReview,
  bulkAction,
  getModerationStats,
} from "../../services/moderationService";
import {
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} from "../../services/verificationService";
import { getAllIssues } from "../../services/issueService";
import api from "../../services/apiClient";
import { exportToCSV } from "../../utils/exportUtils";

const StatBadge = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-5">
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  </div>
);

const ModerationPanel = () => {
  useDocumentTitle('Moderation & Verification Center');

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'reviews'; // reviews, verifications, issues

  const [activeTab, setActiveTab] = useState(initialTab);

  // Stats
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, flagged: 0 });

  // Tab 1: Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsPagination, setReviewsPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedReviews, setSelectedReviews] = useState(new Set());
  const [reviewActionLoading, setReviewActionLoading] = useState(null);

  // Tab 2: Verifications state
  const [verifications, setVerifications] = useState([]);
  const [verificationsLoading, setVerificationsLoading] = useState(false);
  const [selectedDocModal, setSelectedDocModal] = useState(null); // { docUrl, title }
  const [rejectModal, setRejectModal] = useState(null); // { id, type, name }
  const [rejectionReason, setRejectionReason] = useState('');

  // Tab 3: Issues state
  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issueStatusFilter, setIssueStatusFilter] = useState('all');

  const [loading, setLoading] = useState(true);

  // Sync tab with search params
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  // Load reviews data
  const loadReviewsData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        getReportedReviews({ page, limit: 8 }),
        getModerationStats(),
      ]);
      setReviews(reviewsRes.reviews || []);
      setReviewsPagination(reviewsRes.pagination || { page: 1, pages: 1, total: 0 });
      setStats(statsRes.stats || { total: 0, approved: 0, pending: 0, flagged: 0 });
    } catch (err) {
      console.error("Failed to load moderation reviews:", err);
    } finally {
      setLoading(false);
      setSelectedReviews(new Set());
    }
  }, []);

  // Load pending verifications
  const loadVerificationsData = useCallback(async () => {
    setVerificationsLoading(true);
    try {
      const res = await getPendingVerifications();
      setVerifications(res.verifications || res.pending || []);
    } catch (err) {
      console.error("Failed to load pending verifications:", err);
    } finally {
      setVerificationsLoading(false);
    }
  }, []);

  // Load civic & dispute issues
  const loadIssuesData = useCallback(async () => {
    setIssuesLoading(true);
    try {
      const data = await getAllIssues();
      setIssues(Array.isArray(data) ? data : data.issues || []);
    } catch (err) {
      console.error("Failed to load issues:", err);
    } finally {
      setIssuesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'reviews') loadReviewsData();
    else if (activeTab === 'verifications') loadVerificationsData();
    else if (activeTab === 'issues') loadIssuesData();
  }, [activeTab, loadReviewsData, loadVerificationsData, loadIssuesData]);

  // Review Actions
  const toggleSelectReview = (id) => {
    setSelectedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllReviews = () => {
    if (selectedReviews.size === reviews.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(reviews.map((r) => r._id)));
    }
  };

  const handleApproveReview = async (id) => {
    setReviewActionLoading(id);
    try {
      await approveReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      setStats((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        approved: prev.approved + 1,
      }));
      setSelectedReviews((prev) => { const s = new Set(prev); s.delete(id); return s; });
    } catch (err) {
      console.error("Approve review failed:", err);
    } finally {
      setReviewActionLoading(null);
    }
  };

  const handleRejectReview = async (id) => {
    setReviewActionLoading(id);
    try {
      await rejectReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      setStats((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        flagged: prev.flagged + 1,
      }));
      setSelectedReviews((prev) => { const s = new Set(prev); s.delete(id); return s; });
    } catch (err) {
      console.error("Reject review failed:", err);
    } finally {
      setReviewActionLoading(null);
    }
  };

  const handleBulkReviewAction = async (action) => {
    if (selectedReviews.size === 0) return;
    setReviewActionLoading("bulk");
    try {
      await bulkAction([...selectedReviews], action);
      loadReviewsData(reviewsPagination.page);
    } catch (err) {
      console.error("Bulk review action failed:", err);
    } finally {
      setReviewActionLoading(null);
    }
  };

  // Verification Actions
  const handleApproveWorkerVerification = async (id) => {
    try {
      await approveVerification(id, "Verified by Admin moderation team");
      setVerifications(prev => prev.filter(v => v._id !== id));
    } catch (err) {
      console.error("Verification approve failed:", err);
    }
  };

  const handleConfirmRejectVerification = async () => {
    if (!rejectModal) return;
    try {
      await rejectVerification(rejectModal.id, rejectionReason || "Document verification rejected by administrator");
      setVerifications(prev => prev.filter(v => v._id !== rejectModal.id));
      setRejectModal(null);
      setRejectionReason('');
    } catch (err) {
      console.error("Verification reject failed:", err);
    }
  };

  // Issue Status Update Action
  const handleUpdateIssueStatus = async (issueId, newStatus) => {
    try {
      await api.patch(`/issues/${issueId}/status`, { status: newStatus });
      setIssues(prev => prev.map(i => i._id === issueId ? { ...i, status: newStatus } : i));
    } catch (err) {
      console.error("Failed to update issue status:", err);
    }
  };

  // CSV Export for active tab
  const handleExportTabCSV = () => {
    if (activeTab === 'reviews') {
      const data = reviews.map(r => ({
        ReviewID: r._id,
        User: r.user?.name || 'Unknown',
        Worker: r.worker?.name || 'N/A',
        Rating: r.rating,
        ReviewText: r.reviewText,
        ReportReason: r.reportReason || 'N/A',
        ReportedAt: r.reportedAt ? new Date(r.reportedAt).toLocaleDateString() : ''
      }));
      exportToCSV(data, 'reported_reviews_moderation');
    } else if (activeTab === 'verifications') {
      const data = verifications.map(v => ({
        VerificationID: v._id,
        LegalName: v.fullName,
        WorkerEmail: v.workerId?.email || '',
        IDType: v.idType || 'N/A',
        IDNumber: v.idNumber || 'N/A',
        Status: v.status,
        SubmittedDate: new Date(v.createdAt).toLocaleDateString()
      }));
      exportToCSV(data, 'pending_worker_verifications');
    } else {
      const data = issues.map(i => ({
        IssueID: i._id,
        Title: i.title,
        Category: i.category,
        Status: i.status,
        Upvotes: i.upvotes,
        ReportedDate: new Date(i.createdAt).toLocaleDateString()
      }));
      exportToCSV(data, 'reported_issues_disputes');
    }
  };

  const filteredIssues = issues.filter(i => issueStatusFilter === 'all' || i.status === issueStatusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-2 transition font-medium">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <Shield className="h-8 w-8 text-blue-600" />
            Moderation & Verification Center
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Review flagged reviews, worker verification applications, and reported civic disputes</p>
        </div>

        <button
          onClick={handleExportTabCSV}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm self-start sm:self-auto"
        >
          <Download className="h-4 w-4 text-emerald-600" />
          Export {activeTab.toUpperCase()} CSV
        </button>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatBadge icon={ClipboardList} label="Total Reviews" value={stats.total} color="bg-gray-600" />
        <StatBadge icon={AlertTriangle} label="Pending Review Queue" value={stats.pending} color="bg-amber-500" />
        <StatBadge icon={FileCheck} label="Pending Verifications" value={verifications.length} color="bg-blue-600" />
        <StatBadge icon={Flag} label="Flagged / Open Issues" value={issues.filter(i => i.status === 'open').length} color="bg-rose-600" />
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-gray-200 dark:border-slate-700 mb-6 font-semibold text-sm">
        <button
          onClick={() => handleTabChange('reviews')}
          className={`pb-3 px-4 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'reviews'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400'
          }`}
        >
          <ClipboardList size={18} />
          Review Queue ({stats.pending})
        </button>

        <button
          onClick={() => handleTabChange('verifications')}
          className={`pb-3 px-4 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'verifications'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400'
          }`}
        >
          <FileCheck size={18} />
          Worker Verifications ({verifications.length})
        </button>

        <button
          onClick={() => handleTabChange('issues')}
          className={`pb-3 px-4 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'issues'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400'
          }`}
        >
          <Flag size={18} />
          Reported Issues & Disputes ({issues.length})
        </button>
      </div>

      {/* ────────────────── TAB 1: REVIEW MODERATION QUEUE ────────────────── */}
      {activeTab === 'reviews' && (
        <div>
          {/* Bulk Actions Bar */}
          {reviews.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 px-5 py-3 mb-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedReviews.size === reviews.length && reviews.length > 0}
                  onChange={toggleSelectAllReviews}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-600 dark:text-slate-300">
                  {selectedReviews.size > 0 ? `${selectedReviews.size} selected` : "Select all reviews"}
                </span>
              </div>
              {selectedReviews.size > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkReviewAction("approve")}
                    disabled={reviewActionLoading === "bulk"}
                    className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    Approve Selected
                  </button>
                  <button
                    onClick={() => handleBulkReviewAction("reject")}
                    disabled={reviewActionLoading === "bulk"}
                    className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition disabled:opacity-50"
                  >
                    Flag Selected
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-gray-400">
                <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-2" />
                <p>Loading moderation queue...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-40 text-emerald-500" />
                <p className="font-bold text-gray-800 dark:text-white text-lg">Queue Clear!</p>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">No user reviews require moderation at this time</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/80 dark:bg-slate-900/50 text-xs text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-slate-700">
                      <tr>
                        <th className="px-4 py-3 w-10"></th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Worker</th>
                        <th className="px-4 py-3">Rating</th>
                        <th className="px-4 py-3">Review Content</th>
                        <th className="px-4 py-3">Report Reason</th>
                        <th className="px-4 py-3">Reported</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                      {reviews.map((review) => (
                        <tr key={review._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition">
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedReviews.has(review._id)}
                              onChange={() => toggleSelectReview(review._id)}
                              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{review.user?.name || "Unknown User"}</p>
                              <p className="text-xs text-gray-400">{review.user?.email || ""}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-700 dark:text-slate-300 font-medium">{review.worker?.name || "N/A"}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-0.5 text-amber-400 font-bold text-xs">
                              {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-600 dark:text-slate-300 max-w-[280px]">
                            <p className="truncate" title={review.reviewText}>{review.reviewText}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 rounded-full text-xs font-semibold">
                              {review.reportReason || "Flagged content"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-400 text-xs">
                            {review.reportedAt ? new Date(review.reportedAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleApproveReview(review._id)}
                                disabled={reviewActionLoading === review._id}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 transition"
                                title="Approve Review"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRejectReview(review._id)}
                                disabled={reviewActionLoading === review._id}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 transition"
                                title="Flag / Reject Review"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {reviewsPagination.pages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/30">
                    <p className="text-xs text-gray-500">
                      Page {reviewsPagination.page} of {reviewsPagination.pages} ({reviewsPagination.total} items)
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadReviewsData(reviewsPagination.page - 1)}
                        disabled={reviewsPagination.page <= 1}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => loadReviewsData(reviewsPagination.page + 1)}
                        disabled={reviewsPagination.page >= reviewsPagination.pages}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ────────────────── TAB 2: WORKER VERIFICATION WORKFLOW ────────────────── */}
      {activeTab === 'verifications' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-6">
          <div className="mb-6 flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-700">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileCheck className="text-emerald-600" size={20} />
                Pending Worker Verification Applications
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Inspect legal credentials, ID documents, and proof of qualifications</p>
            </div>
            <button
              onClick={loadVerificationsData}
              className="p-2 text-gray-500 hover:text-blue-600 transition"
              title="Refresh applications"
            >
              <RefreshCw size={16} className={verificationsLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {verificationsLoading ? (
            <div className="py-16 text-center text-gray-400 font-medium">Loading worker verification applications...</div>
          ) : verifications.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-30 text-emerald-500" />
              <p className="font-bold text-gray-800 dark:text-white text-lg">No Pending Applications</p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">All service worker verification submissions have been reviewed</p>
            </div>
          ) : (
            <div className="space-y-6">
              {verifications.map((item) => (
                <div
                  key={item._id}
                  className="p-5 rounded-2xl border border-gray-100 dark:border-slate-700/80 bg-gray-50/50 dark:bg-slate-900/40"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-slate-700/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">{item.fullName}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        Worker Email: <span className="font-medium text-gray-800 dark:text-slate-200">{item.workerId?.email || 'N/A'}</span> &bull; Submitted: {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleApproveWorkerVerification(item._id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                      >
                        <UserCheck size={14} /> Approve Verification
                      </button>

                      <button
                        onClick={() => setRejectModal({ id: item._id, name: item.fullName })}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl text-xs font-semibold transition"
                      >
                        <UserX size={14} /> Reject Application
                      </button>
                    </div>
                  </div>

                  {/* ID Details & Document Attachments Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                      <p className="text-[10px] font-semibold uppercase text-gray-400">Government ID Type</p>
                      <p className="text-xs font-bold text-gray-800 dark:text-slate-200 mt-0.5">{item.idType || 'Passport / Driver License'}</p>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">{item.idNumber || 'ID-8829402'}</p>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                      <p className="text-[10px] font-semibold uppercase text-gray-400">Date of Birth</p>
                      <p className="text-xs font-bold text-gray-800 dark:text-slate-200 mt-0.5">
                        {item.dateOfBirth ? new Date(item.dateOfBirth).toLocaleDateString() : '1990-05-15'}
                      </p>
                    </div>

                    {/* Documents List */}
                    <div className="sm:col-span-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase text-gray-400 w-full mb-1">Submitted Files</span>

                      {item.idDocument && (
                        <button
                          onClick={() => setSelectedDocModal({ docUrl: item.idDocument, title: 'Government ID Document' })}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <Eye size={12} /> ID Proof
                        </button>
                      )}

                      {item.selfieWithId && (
                        <button
                          onClick={() => setSelectedDocModal({ docUrl: item.selfieWithId, title: 'Selfie with ID Photo' })}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <Eye size={12} /> Selfie w/ ID
                        </button>
                      )}

                      {item.addressProof && (
                        <button
                          onClick={() => setSelectedDocModal({ docUrl: item.addressProof, title: 'Address Proof Document' })}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <Eye size={12} /> Address Proof
                        </button>
                      )}

                      {item.professionalLicense && (
                        <button
                          onClick={() => setSelectedDocModal({ docUrl: item.professionalLicense, title: 'Professional License' })}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <Eye size={12} /> License
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ────────────────── TAB 3: REPORTED CIVIC ISSUES & DISPUTES ────────────────── */}
      {activeTab === 'issues' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Flag className="text-rose-600" size={20} />
                Reported Civic Issues & Booking Disputes Queue
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Manage reported civic issues, booking disputes, and progress status</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-gray-500">Filter Status:</span>
              <select
                value={issueStatusFilter}
                onChange={e => setIssueStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl font-semibold text-gray-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All Issues</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {issuesLoading ? (
            <div className="py-16 text-center text-gray-400 font-medium">Loading issues list...</div>
          ) : filteredIssues.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-30 text-emerald-500" />
              <p className="font-bold text-gray-800 dark:text-white text-lg">No Issues Match Filter</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIssues.map((issue) => (
                <div
                  key={issue._id}
                  className="p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/40 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center"
                >
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 dark:text-white text-base">{issue.title}</h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                        {issue.category}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-slate-300 mt-1 line-clamp-2">{issue.description}</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Upvotes: <span className="font-bold text-gray-700 dark:text-slate-300">{issue.upvotes || 0}</span> &bull; Reported: {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Status Progression Controls */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      issue.status === 'open' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                      issue.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                      issue.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                      'bg-gray-100 text-gray-600 dark:bg-slate-700'
                    }`}>
                      {issue.status}
                    </span>

                    <select
                      value={issue.status}
                      onChange={e => handleUpdateIssueStatus(issue._id, e.target.value)}
                      className="px-2.5 py-1 text-xs font-semibold border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="open">Mark Open</option>
                      <option value="in-progress">Mark In-Progress</option>
                      <option value="resolved">Mark Resolved</option>
                      <option value="closed">Mark Closed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Verification Rejection Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Reject Worker Application</h3>
            <p className="text-xs text-gray-500 mb-4">Applicant: {rejectModal.name}</p>

            <textarea
              className="w-full p-3 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
              rows="3"
              placeholder="State the reason for rejection (e.g., blurry ID photo, invalid license number)..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectVerification}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedDocModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-700 relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700 mb-4">
              <h4 className="font-bold text-gray-900 dark:text-white text-base">{selectedDocModal.title}</h4>
              <button
                onClick={() => setSelectedDocModal(null)}
                className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center justify-center bg-gray-100 dark:bg-slate-900 rounded-xl p-4 min-h-[300px] max-h-[500px] overflow-auto">
              <img
                src={selectedDocModal.docUrl.startsWith('http') ? selectedDocModal.docUrl : `/uploads/${selectedDocModal.docUrl}`}
                alt={selectedDocModal.title}
                className="max-h-[450px] object-contain rounded-lg shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=500&auto=format&fit=crop&q=60";
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationPanel;
