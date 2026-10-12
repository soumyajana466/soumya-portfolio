"use client";

import { useEffect, useState, useMemo } from "react";
import { getApiUrl } from "@/app/lib/api";

const API = getApiUrl();

type Message = {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

type AnalyticsData = {
  totals: {
    totalVisits: number;
    uniqueVisitors: number;
    totalMessages: number;
    conversionRate: string | number;
  };
  dailyStats: Array<{
    day: string;
    visits: number;
    unique: number;
  }>;
  devices: {
    Desktop: number;
    Mobile: number;
    Tablet: number;
    Unknown: number;
  };
  browsers: Array<{ name: string; count: number }>;
  referrers: Array<{ name: string; count: number }>;
};

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  // Avatar Upload State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploadStatus, setAvatarUploadStatus] = useState("");
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);

  // Tab & Analytics State
  const [activeTab, setActiveTab] = useState<"messages" | "analytics" | "profile">("messages");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Load token
  useEffect(() => {
    const t = localStorage.getItem("adminToken");
    if (t) setToken(t);
  }, []);

  // Fetch contacts
  useEffect(() => {
    if (!token) return;

    fetch(`${API}/api/admin/contacts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 401) {
          localStorage.removeItem("adminToken");
          setToken(null);
          return;
        }
        return r.json();
      })
      .then((d) => {
        console.log("Fetched data:", d); // Debug log
        if (d?.data) {
          console.log("Messages:", d.data); // Debug log
          setMessages(d.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
      });
  }, [token]);

  // Fetch Analytics
  useEffect(() => {
    if (!token) return;

    const fetchAnalytics = async () => {
      try {
        setLoadingAnalytics(true);
        const response = await fetch(`${API}/api/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          setToken(null);
          return;
        }
        const data = await response.json();
        if (data?.success && data?.data) {
          setAnalytics(data.data);
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, [token, messages]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = messages.length;
    const today = new Date().toDateString();
    const todayCount = messages.filter(
      (m) => new Date(m.createdAt).toDateString() === today
    ).length;

    // Last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekCount = messages.filter(
      (m) => new Date(m.createdAt) >= weekAgo
    ).length;

    // Messages per day for the last 7 days
    const dailyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toDateString();
      const count = messages.filter(
        (m) => new Date(m.createdAt).toDateString() === dateStr
      ).length;
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        count,
      };
    });

    const maxCount = Math.max(...dailyData.map((d) => d.count), 1);

    return { total, todayCount, weekCount, dailyData, maxCount };
  }, [messages]);

  // Filter and sort messages
  const filteredMessages = useMemo(() => {
    let filtered = messages;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = messages.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          m.message.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return a.name.localeCompare(b.name);
      }
    });
  }, [messages, searchQuery, sortBy]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch(`${API}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Invalid login");
      return;
    }

    localStorage.setItem("adminToken", data.token);
    setToken(data.token);
    setPassword("");
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    setMessages([]);
  };

  const handleCVUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvFile) {
      setUploadStatus("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("cv", cvFile);

    setUploadStatus("Uploading...");

    try {
      const response = await fetch(`${API}/api/admin/cv/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus("CV uploaded successfully! ✅");
        setCvFile(null);
        // Reset file input
        const fileInput = document.getElementById(
          "cv-input"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        setUploadStatus(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading CV:", error);
      setUploadStatus("Failed to upload CV");
    }

    setTimeout(() => setUploadStatus(""), 5000);
  };

  // Fetch current avatar
  useEffect(() => {
    if (!token) return;
    const loadCurrentAvatar = async () => {
      try {
        const response = await fetch(`${API}/api/admin/avatar`);
        const data = await response.json();
        if (data && data.url) {
          setCurrentAvatarUrl(data.url);
        }
      } catch (err) {
        console.error("Failed to load current avatar:", err);
      }
    };
    loadCurrentAvatar();
  }, [token]);

  const handleAvatarUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarFile || !token) return;

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    setAvatarUploadStatus("Uploading...");

    try {
      const response = await fetch(`${API}/api/admin/avatar/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAvatarUploadStatus("Avatar uploaded successfully! ✅");
        setCurrentAvatarUrl(data.url);
        setAvatarFile(null);
        // Reset file input
        const fileInput = document.getElementById("avatar-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        setAvatarUploadStatus(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setAvatarUploadStatus("Failed to upload avatar");
    }

    setTimeout(() => setAvatarUploadStatus(""), 5000);
  };

  /* ───────────────── LOGIN ───────────────── */
  if (!token) {
    return (
      <main className="admin-page">
        <form className="admin-card" onSubmit={handleLogin}>
          <h1>Admin Login</h1>

          <input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>

          {error && <p className="error">{error}</p>}
        </form>
      </main>
    );
  }

  /* ───────────────── DASHBOARD ───────────────── */
  return (
    <main className="admin-page">
      <div className="admin-dashboard">
        <header>
          <h1>📊 Admin Dashboard</h1>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </header>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button
            onClick={() => setActiveTab("messages")}
            className={`tab-btn ${activeTab === "messages" ? "tab-btn-active" : ""}`}
          >
            💌 Messages ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`tab-btn ${activeTab === "analytics" ? "tab-btn-active" : ""}`}
          >
            📈 Visitor Analytics
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`tab-btn ${activeTab === "profile" ? "tab-btn-active" : ""}`}
          >
            👤 Profile Settings
          </button>
        </div>

        {activeTab === "messages" && (
          <>
            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📨</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">Total Messages</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.todayCount}</div>
                  <div className="stat-label">Today</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.weekCount}</div>
                  <div className="stat-label">This Week</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💬</div>
                <div className="stat-content">
                  <div className="stat-value">
                    {messages.length > 0
                      ? Math.round((stats.weekCount / 7) * 10) / 10
                      : 0}
                  </div>
                  <div className="stat-label">Avg/Day</div>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="chart-section">
              <h2>📊 Messages Over Last 7 Days</h2>
              <div className="bar-chart">
                {stats.dailyData.map((data, i) => (
                  <div key={i} className="bar-container">
                    <div className="bar-label-top">{data.count}</div>
                    <div
                      className="bar"
                      style={{
                        height: `${(data.count / stats.maxCount) * 100}%`,
                        minHeight: data.count > 0 ? "20px" : "4px",
                      }}
                    />
                    <div className="bar-label">{data.day}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters and Search */}
            <div className="controls-section">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by name, email, or message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="sort-controls">
                <label>Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "date" | "name")}
                  className="sort-select"
                >
                  <option value="date">Latest First</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Messages Table */}
            <div className="table-section">
              <h2>💌 All Messages ({filteredMessages.length})</h2>

              {filteredMessages.length === 0 ? (
                <p className="no-data">
                  {searchQuery
                    ? "No messages found matching your search."
                    : "No messages yet."}
                </p>
              ) : (
                <div className="messages-table-wrapper">
                  <table className="messages-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Message</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMessages.map((m, index) => (
                        <tr key={m.id}>
                          <td>{index + 1}</td>
                          <td className="table-name">{m.name}</td>
                          <td className="table-email">{m.email}</td>
                          <td className="table-message">{m.message}</td>
                          <td className="table-date">
                            {new Date(m.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "analytics" && (
          <div>
            {loadingAnalytics && !analytics ? (
              <p style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>Loading analytics...</p>
            ) : (
              <>
                {/* Analytics Totals Stats */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">👁️</div>
                    <div className="stat-content">
                      <div className="stat-value">{analytics?.totals.totalVisits ?? 0}</div>
                      <div className="stat-label">Total Visits</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <div className="stat-value">{analytics?.totals.uniqueVisitors ?? 0}</div>
                      <div className="stat-label">Unique Visitors</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📨</div>
                    <div className="stat-content">
                      <div className="stat-value">{analytics?.totals.totalMessages ?? 0}</div>
                      <div className="stat-label">Contact Messages</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                      <div className="stat-value">{analytics?.totals.conversionRate ?? 0}%</div>
                      <div className="stat-label">Conv. Rate</div>
                    </div>
                  </div>
                </div>

                {/* Daily stats chart */}
                <div className="chart-section">
                  <h2>📊 Visits vs Unique Visitors (Last 7 Days)</h2>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <span className="legend-color visits"></span>
                      <span>Total Visits</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color uniques"></span>
                      <span>Unique Visitors</span>
                    </div>
                  </div>
                  <div className="bar-chart">
                    {analytics?.dailyStats.map((data, i) => {
                      const maxCount = Math.max(...(analytics?.dailyStats.map((d) => Math.max(d.visits, d.unique)) ?? [1]), 1);
                      return (
                        <div key={i} className="bar-container">
                          <div className="bar-label-top">
                            <span style={{ color: "#38bdf8" }}>{data.visits}</span>
                            {" / "}
                            <span style={{ color: "#10b981" }}>{data.unique}</span>
                          </div>
                          <div className="bar-group">
                            <div
                              className="bar-visits"
                              style={{
                                height: `${(data.visits / maxCount) * 100}%`,
                                minHeight: data.visits > 0 ? "10px" : "4px",
                              }}
                            />
                            <div
                              className="bar-uniques"
                              style={{
                                height: `${(data.unique / maxCount) * 100}%`,
                                minHeight: data.unique > 0 ? "10px" : "4px",
                              }}
                            />
                          </div>
                          <div className="bar-label">{data.day}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Grid for Devices and Referrers */}
                <div className="analytics-grid-two">
                  {/* Devices breakdown */}
                  <div className="analytics-card">
                    <h2>📱 Devices &amp; Browsers</h2>
                    <div className="progress-list" style={{ marginBottom: "28px" }}>
                      <h3 style={{ fontSize: "14px", color: "var(--muted)", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.05em" }}>Device Categories</h3>
                      {(() => {
                        const devices = analytics?.devices ?? { Desktop: 0, Mobile: 0, Tablet: 0, Unknown: 0 };
                        const total = Object.values(devices).reduce((a, b) => a + b, 0) || 1;
                        return Object.entries(devices).map(([key, val]) => {
                          const pct = Math.round((val / total) * 100);
                          return (
                            <div key={key} className="progress-item">
                              <div className="progress-meta">
                                <span className="progress-label">
                                  {key === "Desktop" ? "🖥️" : key === "Mobile" ? "📱" : key === "Tablet" ? "📟" : "❓"} {key}
                                </span>
                                <span className="progress-value">{val} ({pct}%)</span>
                              </div>
                              <div className="progress-bg">
                                <div className="progress-fill primary" style={{ width: `${pct}%` }}></div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    <div className="progress-list">
                      <h3 style={{ fontSize: "14px", color: "var(--muted)", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.05em" }}>Top Browsers</h3>
                      {analytics?.browsers && analytics.browsers.length > 0 ? (
                        (() => {
                          const total = analytics.browsers.reduce((a, b) => a + b.count, 0) || 1;
                          return analytics.browsers.map((b) => {
                            const pct = Math.round((b.count / total) * 100);
                            return (
                              <div key={b.name} className="progress-item">
                                <div className="progress-meta">
                                  <span className="progress-label">🌐 {b.name}</span>
                                  <span className="progress-value">{b.count} ({pct}%)</span>
                                </div>
                                <div className="progress-bg">
                                  <div className="progress-fill secondary" style={{ width: `${pct}%` }}></div>
                                </div>
                              </div>
                            );
                          });
                        })()
                      ) : (
                        <p className="referrers-empty">No browser data available</p>
                      )}
                    </div>
                  </div>

                  {/* Referrers breakdown */}
                  <div className="analytics-card">
                    <h2>🔗 Top Referrers</h2>
                    <div className="referrers-list">
                      {analytics?.referrers && analytics.referrers.length > 0 ? (
                        analytics.referrers.map((r, idx) => (
                          <div key={idx} className="referrer-row">
                            <span className="referrer-name">
                              ⚓ {r.name}
                            </span>
                            <span className="referrer-count">{r.count} hits</span>
                          </div>
                        ))
                      ) : (
                        <p className="referrers-empty">No referral data yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="profile-settings-section">
            {/* CV Upload Section */}
            <div className="settings-card-panel">
              <h2>📄 Customize CV Document</h2>
              <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "16px" }}>
                Upload your latest curriculum vitae (PDF or Word format) so visitors can download it from the home navbar.
              </p>
              <form onSubmit={handleCVUpload} className="cv-upload-form">
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="cv-input"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    className="file-input"
                  />
                  <label htmlFor="cv-input" className="file-label">
                    {cvFile ? cvFile.name : "Choose a file (PDF, DOC, DOCX)"}
                  </label>
                  <button type="submit" className="upload-btn" disabled={!cvFile}>
                    Upload CV
                  </button>
                </div>
                {uploadStatus && (
                  <p
                    className={
                      uploadStatus.includes("successfully")
                        ? "success-msg"
                        : "error-msg"
                    }
                  >
                    {uploadStatus}
                  </p>
                )}
              </form>
            </div>

            {/* Avatar Image Upload Section */}
            <div className="settings-card-panel" style={{ marginTop: "24px" }}>
              <h2>👤 Profile Avatar Image</h2>
              <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "16px" }}>
                Upload a high-quality picture (JPG, PNG, WEBP, or GIF) to replace the "SJ" text placeholders across the site.
              </p>
              
              {currentAvatarUrl && (
                <div className="avatar-preview-container" style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                  <div style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <img src={currentAvatarUrl} alt="Avatar Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div>
                    <span style={{ fontSize: "13px", color: "var(--text)", fontWeight: 600, display: "block" }}>Current Profile Image</span>
                    <span style={{ fontSize: "11px", color: "var(--muted)" }}>Served from server uploads directory</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleAvatarUpload} className="avatar-upload-form">
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="avatar-input"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="file-input"
                  />
                  <label htmlFor="avatar-input" className="file-label">
                    {avatarFile ? avatarFile.name : "Choose an image file (PNG, JPG, WEBP)"}
                  </label>
                  <button type="submit" className="upload-btn" disabled={!avatarFile}>
                    Upload Image
                  </button>
                </div>
                {avatarUploadStatus && (
                  <p
                    className={
                      avatarUploadStatus.includes("successfully")
                        ? "success-msg"
                        : "error-msg"
                    }
                  >
                    {avatarUploadStatus}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
