
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Globe,
  Plus,
  Search,
  RefreshCw,
  MessageSquare,
  Eye,
  Edit3,
  Trash2,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  CalendarDays,
  Activity,
  Flag,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "../styles/admin-dashboard.css";

const initialStats = {
  total_posts: 0,
  published_posts: 0,
  draft_posts: 0,
  total_users: 0,
  total_comments: 0,
};

function AdminDashboard() {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const location = useLocation();

  const [stats, setStats] = useState(initialStats);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.message || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Reports state
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");
  const [reportFilter, setReportFilter] = useState("pending");
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportActionId, setReportActionId] = useState(null);

  // Load dashboard statistics and posts
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [statsResponse, postsResponse] = await Promise.all([
        api.get("admin/dashboard/stats/"),
        api.get("posts/"),
      ]);

      setStats({
        ...initialStats,
        ...statsResponse.data,
      });

      const postData = postsResponse.data.results || postsResponse.data;
      setPosts(Array.isArray(postData) ? postData : []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all reports
  const loadReports = useCallback(async () => {
    try {
      setReportsLoading(true);
      setReportsError("");

      const response = await api.get("admin/reports/");
      const reportData = response.data.results || response.data;

      setReports(Array.isArray(reportData) ? reportData : []);
    } catch (err) {
      setReportsError(
        err.response?.data?.detail ||
          "Unable to load reports. Please try again."
      );
    } finally {
      setReportsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.is_staff) {
      loadDashboard();
      loadReports();
    }
  }, [
    authLoading,
    isAuthenticated,
    user,
    loadDashboard,
    loadReports,
  ]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch = post.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || post.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [posts, searchTerm, statusFilter]);

  // Filter reports
  const filteredReports = useMemo(() => {
    if (reportFilter === "all") {
      return reports;
    }

    return reports.filter(
      (report) => report.status === reportFilter
    );
  }, [reports, reportFilter]);

  // Access checks
  if (authLoading) {
    return (
      <main className="admin-loading-screen">
        <div className="admin-loading-spinner" />
        <p>Checking administrator access...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.is_staff) {
    return <Navigate to="/posts" replace />;
  }

  // Delete post
  async function handleDeletePost(post) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${post.title}"?\n\nThis action cannot be undone. Associated images and comments may also be deleted.`
    );

    if (!confirmed) return;

    try {
      setDeletingPostId(post.id);
      setError("");
      setNotice("");

      await api.delete(`posts/${post.id}/`);

      setPosts((previousPosts) =>
        previousPosts.filter((item) => item.id !== post.id)
      );

      setStats((previousStats) => ({
        ...previousStats,
        total_posts: Math.max(0, previousStats.total_posts - 1),
        published_posts:
          post.status === "published"
            ? Math.max(0, previousStats.published_posts - 1)
            : previousStats.published_posts,
        draft_posts:
          post.status === "draft"
            ? Math.max(0, previousStats.draft_posts - 1)
            : previousStats.draft_posts,
      }));

      setNotice(`"${post.title}" was deleted successfully.`);

      try {
        const response = await api.get("admin/dashboard/stats/");
        setStats(response.data);
      } catch {
        // Deletion succeeded; keep locally updated statistics.
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete the post. Please try again."
      );
    } finally {
      setDeletingPostId(null);
    }
  }

  // Open report details
  async function handleViewReport(report) {
    try {
      setReportsError("");
      setReportActionId(report.id);

      const response = await api.get(
        `admin/reports/${report.id}/`
      );

      setSelectedReport(response.data);
    } catch (err) {
      setReportsError(
        err.response?.data?.detail ||
          "Unable to load report details."
      );
    } finally {
      setReportActionId(null);
    }
  }

  // Mark report as reviewed or dismissed
  async function handleReportStatus(report, newStatus) {
    try {
      setReportActionId(report.id);
      setReportsError("");
      setNotice("");

      const response = await api.patch(
        `admin/reports/${report.id}/`,
        { status: newStatus }
      );

      setReports((previousReports) =>
        previousReports.map((item) =>
          item.id === report.id ? response.data : item
        )
      );

      setSelectedReport((previous) =>
        previous?.id === report.id ? response.data : previous
      );

      setNotice(
        `Report #${report.id} marked as ${newStatus}.`
      );
    } catch (err) {
      setReportsError(
        err.response?.data?.detail ||
          "Unable to update this report."
      );
    } finally {
      setReportActionId(null);
    }
  }

  // Delete report only (does not delete reported content)
  async function handleDeleteReport(report) {
    const confirmed = window.confirm(
      `Delete report #${report.id} permanently?\n\nThis will only delete the report, not the reported post or comment.`
    );

    if (!confirmed) return;

    try {
      setReportActionId(report.id);
      setReportsError("");
      setNotice("");

      await api.delete(`admin/reports/${report.id}/`);

      setReports((previousReports) =>
        previousReports.filter((item) => item.id !== report.id)
      );

      setSelectedReport((previous) =>
        previous?.id === report.id ? null : previous
      );

      setNotice(`Report #${report.id} deleted successfully.`);
    } catch (err) {
      setReportsError(
        err.response?.data?.detail ||
          "Unable to delete this report."
      );
    } finally {
      setReportActionId(null);
    }
  }

  // Format report target
  function formatReportTarget(report) {
    if (report.post) {
      return `Post: ${report.post_title || `#${report.post}`}`;
    }

    if (report.comment) {
      return `Comment: ${
        report.comment_body || `#${report.comment}`
      }`;
    }

    return "Unknown content";
  }

  const statCards = [
    {
      label: "Total Posts",
      value: stats.total_posts,
      description: "All content",
      icon: FileText,
      color: "green",
    },
    {
      label: "Published",
      value: stats.published_posts,
      description: "Visible to readers",
      icon: Eye,
      color: "blue",
    },
    {
      label: "Drafts",
      value: stats.draft_posts,
      description: "Waiting to be published",
      icon: Edit3,
      color: "orange",
    },
    {
      label: "Total Users",
      value: stats.total_users,
      description: "Registered accounts",
      icon: Users,
      color: "purple",
    },
    {
      label: "Comments",
      value: stats.total_comments,
      description: "Community activity",
      icon: MessageSquare,
      color: "cyan",
    },
  ];

  function formatDate(dateValue) {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(dateValue) {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="admin-shell">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <h2>SHADOWS<span>CAGE</span></h2>
            <p>ADMIN CONTROL</p>
          </div>

          <button
            type="button"
            className="admin-mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-sidebar-section">
          <p className="admin-sidebar-label">WORKSPACE</p>

          <Link
            to="/admin"
            className="admin-nav-link active"
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </Link>

          <a
            href="#post-management"
            className="admin-nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <FileText size={19} />
            <span>Manage Posts</span>
          </a>

          <a
            href="#reports-management"
            className="admin-nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <Flag size={19} />
            <span>Reported Content</span>
          </a>

          <Link
            to="/admin/users"
            className="admin-nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <Users size={19} />
            <span>Manage Users</span>
          </Link>
        </div>

        <div className="admin-sidebar-section">
          <p className="admin-sidebar-label">QUICK ACTIONS</p>

          <Link
            to="/admin/posts/new"
            className="admin-nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <Plus size={19} />
            <span>Create New Post</span>
          </Link>
        </div>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-profile">
            <div className="admin-avatar">
              {(user?.username || "A").charAt(0).toUpperCase()}
            </div>

            <div className="admin-profile-info">
              <strong>{user?.username || "Administrator"}</strong>
              <span>Administrator</span>
            </div>

            <span className="admin-online-indicator" />
          </div>

          <Link to="/posts" className="admin-nav-link admin-website-link">
            <Globe size={19} />
            <span>View Website</span>
            <ChevronRight size={16} className="admin-nav-arrow" />
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="admin-breadcrumb">
                Workspace <ChevronRight size={13} /> Dashboard
              </p>
              <h1>Dashboard Overview</h1>
            </div>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-system-status">
              <span />
              System Active
            </div>

            <div className="admin-topbar-user">
              <div className="admin-avatar small">
                {(user?.username || "A").charAt(0).toUpperCase()}
              </div>
              <span>{user?.username || "Admin"}</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {/* Welcome section */}
          <section className="admin-welcome">
            <div>
              <p className="admin-eyebrow">
                <Activity size={14} /> CONTROL CENTER
              </p>

              <h2>
                Welcome back, {user?.username || "Admin"}.
              </h2>

              <p>
                Here's what's happening with your ShadowsCage platform.
                Manage your content and community from here.
              </p>
            </div>
          </section>

          {/* Messages */}
          {notice && (
            <div className="admin-alert success">
              <ShieldCheck size={18} />
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Dismiss message"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {error && (
            <div className="admin-alert error">
              <span>{error}</span>
              <button type="button" onClick={loadDashboard}>
                <RefreshCw size={15} /> Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="admin-loading-card">
              <div className="admin-loading-spinner" />
              <p>Loading your dashboard...</p>
            </div>
          ) : (
            <>
              {/* Statistics */}
              <section className="admin-overview-section">
                <div className="admin-section-heading">
                  <div>
                    <h3>Platform Overview</h3>
                    <p>A summary of your website activity.</p>
                  </div>

                  <button
                    type="button"
                    className="admin-refresh-button"
                    onClick={loadDashboard}
                    title="Refresh dashboard"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>

                <div className="admin-stats-grid">
                  {statCards.map((card) => {
                    const Icon = card.icon;

                    return (
                      <article
                        className="admin-stat-card"
                        key={card.label}
                      >
                        <div className="admin-stat-card-top">
                          <div className={`admin-stat-icon ${card.color}`}>
                            <Icon size={21} />
                          </div>
                          <span className="admin-stat-caption">
                            {card.label}
                          </span>
                        </div>

                        <strong className="admin-stat-number">
                          {Number(card.value || 0).toLocaleString()}
                        </strong>

                        <p>{card.description}</p>
                      </article>
                    );
                  })}
                </div>
              </section>

              {/* Post management */}
              <section
                className="admin-post-section"
                id="post-management"
              >
                <div className="admin-section-heading post-heading">
                  <div>
                    <p className="admin-eyebrow">CONTENT MANAGEMENT</p>
                    <h3>Manage Posts</h3>
                    <p>
                      Create, edit and manage the content on your platform.
                    </p>
                  </div>

                  <Link
                    to="/admin/posts/new"
                    className="admin-secondary-button"
                  >
                    <Plus size={17} />
                    New Post
                  </Link>
                </div>

                {/* Search and filters */}
                <div className="admin-post-toolbar">
                  <div className="admin-search-box">
                    <Search size={18} />
                    <input
                      type="search"
                      placeholder="Search posts by title..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </div>

                  <div className="admin-filter-group">
                    {["all", "published", "draft"].map((filter) => (
                      <button
                        type="button"
                        key={filter}
                        className={`admin-filter-button ${
                          statusFilter === filter ? "selected" : ""
                        }`}
                        onClick={() => setStatusFilter(filter)}
                      >
                        {filter === "all"
                          ? "All Posts"
                          : filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Post table */}
                <div className="admin-table-container">
                  <div className="admin-table-header">
                    <div>
                      <h4>All Content</h4>
                      <span>
                        {filteredPosts.length}{" "}
                        {filteredPosts.length === 1 ? "post" : "posts"} found
                      </span>
                    </div>
                  </div>

                  {filteredPosts.length === 0 ? (
                    <div className="admin-empty-state">
                      <div className="admin-empty-icon">
                        <FileText size={27} />
                      </div>
                      <h4>No posts found</h4>
                      <p>
                        {posts.length === 0
                          ? "You haven't created any posts yet."
                          : "Try changing your search or filter."}
                      </p>

                      {posts.length === 0 && (
                        <Link
                          to="/admin/posts/new"
                          className="admin-primary-button"
                        >
                          <Plus size={17} />
                          Create Your First Post
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="admin-table-scroll">
                      <table className="admin-post-table">
                        <thead>
                          <tr>
                            <th>POST</th>
                            <th>STATUS</th>
                            <th>IMAGES</th>
                            <th>CREATED</th>
                            <th className="admin-actions-heading">ACTIONS</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredPosts.map((post) => (
                            <tr key={post.id}>
                              <td>
                                <div className="admin-table-post">
                                  {post.image_thumbnail ? (
                                    <img
                                      src={post.image_thumbnail}
                                      alt={post.title}
                                      className="admin-table-thumbnail"
                                    />
                                  ) : (
                                    <div className="admin-table-thumbnail placeholder">
                                      <FileText size={20} />
                                    </div>
                                  )}

                                  <div className="admin-table-post-info">
                                    <strong>{post.title}</strong>
                                    <span>Post #{post.id}</span>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <span
                                  className={`admin-status-badge ${
                                    post.status === "published"
                                      ? "published"
                                      : "draft"
                                  }`}
                                >
                                  <span />
                                  {post.status || "draft"}
                                </span>
                              </td>

                              <td>
                                <span className="admin-image-count">
                                  {post.images_count ?? 0} images
                                </span>
                              </td>

                              <td>
                                <span className="admin-date-cell">
                                  <CalendarDays size={14} />
                                  {formatDate(post.created_date)}
                                </span>
                              </td>

                              <td>
                                <div className="admin-table-actions">
                                  <Link
                                    to={`/admin/posts/${post.id}/edit`}
                                    className="admin-table-action edit"
                                    title="Edit post"
                                  >
                                    <Edit3 size={16} />
                                    <span>Edit</span>
                                  </Link>

                                  <button
                                    type="button"
                                    className="admin-table-action delete"
                                    onClick={() => handleDeletePost(post)}
                                    disabled={deletingPostId === post.id}
                                    title="Delete post"
                                  >
                                    {deletingPostId === post.id ? (
                                      <RefreshCw
                                        size={16}
                                        className="admin-spinning"
                                      />
                                    ) : (
                                      <Trash2 size={16} />
                                    )}
                                    <span>
                                      {deletingPostId === post.id
                                        ? "Deleting"
                                        : "Delete"}
                                    </span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>

              {/* Reports management */}
              <section
                className="admin-post-section admin-reports-section"
                id="reports-management"
              >
                <div className="admin-section-heading post-heading">
                  <div>
                    <p className="admin-eyebrow">COMMUNITY SAFETY</p>
                    <h3>
                      <Flag size={21} /> Reported Content
                    </h3>
                    <p>
                      Review reports submitted by registered users.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={loadReports}
                    disabled={reportsLoading}
                  >
                    <RefreshCw
                      size={16}
                      className={reportsLoading ? "admin-spinning" : ""}
                    />
                    Refresh Reports
                  </button>
                </div>

                {/* Report counts */}
                <div className="admin-report-summary">
                  <div>
                    <span>Pending</span>
                    <strong>
                      {reports.filter((r) => r.status === "pending").length}
                    </strong>
                  </div>

                  <div>
                    <span>Reviewed</span>
                    <strong>
                      {reports.filter((r) => r.status === "reviewed").length}
                    </strong>
                  </div>

                  <div>
                    <span>Dismissed</span>
                    <strong>
                      {reports.filter((r) => r.status === "dismissed").length}
                    </strong>
                  </div>

                  <div>
                    <span>Total Reports</span>
                    <strong>{reports.length}</strong>
                  </div>
                </div>

                {/* Report error */}
                {reportsError && (
                  <div className="admin-alert error">
                    <span>{reportsError}</span>
                    <button type="button" onClick={loadReports}>
                      <RefreshCw size={15} /> Retry
                    </button>
                  </div>
                )}

                {/* Report filters */}
                <div className="admin-post-toolbar">
                  <div className="admin-filter-group">
                    {["pending", "reviewed", "dismissed", "all"].map(
                      (filter) => (
                        <button
                          type="button"
                          key={filter}
                          className={`admin-filter-button ${
                            reportFilter === filter ? "selected" : ""
                          }`}
                          onClick={() => {
                            setReportFilter(filter);
                            setSelectedReport(null);
                          }}
                        >
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Reports table */}
                <div className="admin-table-container">
                  <div className="admin-table-header">
                    <div>
                      <h4>Submitted Reports</h4>
                      <span>
                        {filteredReports.length}{" "}
                        {filteredReports.length === 1
                          ? "report"
                          : "reports"}{" "}
                        found
                      </span>
                    </div>
                  </div>

                  {reportsLoading ? (
                    <div className="admin-loading-card">
                      <div className="admin-loading-spinner" />
                      <p>Loading reports...</p>
                    </div>
                  ) : filteredReports.length === 0 ? (
                    <div className="admin-empty-state">
                      <div className="admin-empty-icon">
                        <Flag size={27} />
                      </div>
                      <h4>No reports found</h4>
                      <p>
                        There are no reports in this category.
                      </p>
                    </div>
                  ) : (
                    <div className="admin-table-scroll">
                      <table className="admin-post-table admin-report-table">
                        <thead>
                          <tr>
                            <th>REPORT</th>
                            <th>REPORTED CONTENT</th>
                            <th>REASON</th>
                            <th>STATUS</th>
                            <th>DATE</th>
                            <th>ACTIONS</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredReports.map((report) => (
                            <tr key={report.id}>
                              <td>
                                <div className="admin-table-post-info">
                                  <strong>Report #{report.id}</strong>
                                  <span>
                                    By {report.reporter_username}
                                  </span>
                                </div>
                              </td>

                              <td>
                                <div className="admin-report-target">
                                  {report.post ? (
                                    <>
                                      <FileText size={15} />
                                      <span>
                                        {report.post_title ||
                                          `Post #${report.post}`}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <MessageSquare size={15} />
                                      <span>
                                        Comment #{report.comment}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </td>

                              <td>
                                <span className="admin-report-reason">
                                  {report.reason.replaceAll("_", " ")}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={`admin-status-badge report-${report.status}`}
                                >
                                  <span />
                                  {report.status}
                                </span>
                              </td>

                              <td>
                                <span className="admin-date-cell">
                                  <CalendarDays size={14} />
                                  {formatDate(report.created_at)}
                                </span>
                              </td>

                              <td>
                                <div className="admin-table-actions">
                                  <button
                                    type="button"
                                    className="admin-table-action edit"
                                    onClick={() => handleViewReport(report)}
                                    disabled={reportActionId === report.id}
                                  >
                                    <Eye size={16} />
                                    <span>View</span>
                                  </button>

                                  <button
                                    type="button"
                                    className="admin-table-action delete"
                                    onClick={() => handleDeleteReport(report)}
                                    disabled={reportActionId === report.id}
                                  >
                                    <Trash2 size={16} />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Selected report details */}
                {selectedReport && (
                  <div className="admin-report-detail">
                    <div className="admin-report-detail-header">
                      <div>
                        <p className="admin-eyebrow">REPORT DETAILS</p>
                        <h4>Report #{selectedReport.id}</h4>
                      </div>

                      <button
                        type="button"
                        className="admin-report-close"
                        onClick={() => setSelectedReport(null)}
                        aria-label="Close report details"
                      >
                        <X size={19} />
                      </button>
                    </div>

                    <div className="admin-report-detail-grid">
                      <div>
                        <span>Reporter</span>
                        <strong>
                          {selectedReport.reporter_username}
                        </strong>
                      </div>

                      <div>
                        <span>Reported Content</span>
                        <strong>
                          {formatReportTarget(selectedReport)}
                        </strong>
                      </div>

                      <div>
                        <span>Reason</span>
                        <strong>
                          {selectedReport.reason.replaceAll("_", " ")}
                        </strong>
                      </div>

                      <div>
                        <span>Status</span>
                        <strong>
                          {selectedReport.status}
                        </strong>
                      </div>

                      <div>
                        <span>Submitted</span>
                        <strong>
                          {formatDateTime(selectedReport.created_at)}
                        </strong>
                      </div>

                      <div>
                        <span>Reviewed At</span>
                        <strong>
                          {formatDateTime(selectedReport.reviewed_at)}
                        </strong>
                      </div>
                    </div>

                    <div className="admin-report-description">
                      <span>Additional Details</span>
                      <p>
                        {selectedReport.description?.trim() ||
                          "The reporter did not provide additional details."}
                      </p>
                    </div>

                    {selectedReport.comment_body && (
                      <div className="admin-report-description">
                        <span>Reported Comment</span>
                        <p>{selectedReport.comment_body}</p>
                      </div>
                    )}

                    <div className="admin-report-detail-actions">
                      {selectedReport.status !== "reviewed" && (
                        <button
                          type="button"
                          className="admin-report-action reviewed"
                          onClick={() =>
                            handleReportStatus(
                              selectedReport,
                              "reviewed"
                            )
                          }
                          disabled={reportActionId === selectedReport.id}
                        >
                          <CheckCircle2 size={17} />
                          Mark as Reviewed
                        </button>
                      )}

                      {selectedReport.status !== "dismissed" && (
                        <button
                          type="button"
                          className="admin-report-action dismissed"
                          onClick={() =>
                            handleReportStatus(
                              selectedReport,
                              "dismissed"
                            )
                          }
                          disabled={reportActionId === selectedReport.id}
                        >
                          <XCircle size={17} />
                          Dismiss Report
                        </button>
                      )}

                      <button
                        type="button"
                        className="admin-report-action delete"
                        onClick={() => handleDeleteReport(selectedReport)}
                        disabled={reportActionId === selectedReport.id}
                      >
                        <Trash2 size={17} />
                        Delete Report
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Bottom quick links */}
              <section className="admin-quick-links">
                <div className="admin-quick-link-card">
                  <div className="admin-quick-link-icon users">
                    <Users size={21} />
                  </div>
                  <div>
                    <h4>User Management</h4>
                    <p>View and manage registered user accounts.</p>
                  </div>
                  <Link to="/admin/users" aria-label="Manage users">
                    <ChevronRight size={20} />
                  </Link>
                </div>

                <div className="admin-quick-link-card">
                  <div className="admin-quick-link-icon website">
                    <Globe size={21} />
                  </div>
                  <div>
                    <h4>Visit Website</h4>
                    <p>View the public ShadowsCage website.</p>
                  </div>
                  <Link to="/posts" aria-label="Visit website">
                    <ChevronRight size={20} />
                  </Link>
                </div>
              </section>

              <footer className="admin-footer">
                <span>SHADOWSCAGE ADMIN CONTROL CENTER</span>
                <span>Content management system</span>
              </footer>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
