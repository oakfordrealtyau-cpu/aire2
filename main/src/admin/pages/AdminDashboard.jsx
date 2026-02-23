import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme, useMediaQuery } from '@mui/material';
import api from "../../services/api";
import LottieLoader from '../../components/LottieLoader';
import { useAuth } from '../../context/AuthContext';

// Put your own mp3/wav path if you have one.
// If you don't, it will just silently fail and still show the snackbar.
const NOTIFICATION_SOUND_URL = "/sounds/notify.mp3";

const POLL_INTERVAL = 4000;
const BACKOFF_ON_429_MS = 60 * 1000; // 1 minute backoff when server returns 429

function getLocalTodayString() {
  // local date YYYY-MM-DD (not UTC)
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatMoneyAUD(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(n);
}

function safeText(v) {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

/**
 * Modern Skeleton Component
 */
function Skeleton({ width = "100%", height = 20, borderRadius = 8, style = {} }) {
  return (
    <div
      className="animate-pulse"
      style={{
        width,
        height,
        borderRadius,
        background: "rgba(255,255,255,0.08)",
        ...style,
      }}
    />
  );
}

function Badge({ label, tone = "info" }) {
  const styles = {
    info: { background: "rgba(20,184,166,0.14)", color: "#14b8a6", border: "1px solid rgba(20,184,166,0.35)" },
    warn: { background: "rgba(245,158,11,0.14)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.35)" },
    danger: { background: "rgba(239,68,68,0.14)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.35)" },
    ok: { background: "rgba(16,185,129,0.14)", color: "#10b981", border: "1px solid rgba(16,185,129,0.35)" },
    neutral: { background: "rgba(148,163,184,0.14)", color: "#cbd5e1", border: "1px solid rgba(148,163,184,0.25)" },
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        ...styles[tone],
      }}
    >
      {label}
    </span>
  );
}

function Card({ title, right, children, style }) {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
        borderRadius: 24,
        padding: 28,
        boxShadow: "0 4px 24px -1px rgba(0, 0, 0, 0.2)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        ...style,
      }}
    >
      {(title || right) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.9)", letterSpacing: '0.02em' }}>{title}</div>
          <div>{right}</div>
        </div>
      )}
      {children}
    </div>
  );
}

function Table({ columns, rows, emptyText = "No items.", loading = false }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '10px 0' }}>
        {[1, 2, 3].map(i => <Skeleton key={i} height={48} />)}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  textAlign: "left",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  whiteSpace: "nowrap",
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: 24, color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: 'center' }}>
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((r, idx) => (
              <tr key={r.id ?? idx} className="hover:bg-white/5 transition-colors">
                {columns.map((c) => (
                  <td key={c.key} style={{ padding: "16px 18px", fontSize: 13, color: "rgba(255,255,255,0.9)", verticalAlign: "middle", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    {typeof c.render === "function" ? c.render(r) : safeText(r[c.key])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboard() {
  // Ensure we wait for auth to be ready before fetching dashboard data to avoid
  // a race where the admin route mounts before the client's Authorization header
  // is available (causing a 401 and immediate logout).
  const { user: authUser, loading: authLoading } = useAuth();

  // Core dashboard state
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    pendingListings: 0, // properties.status_id = 2 (pending_approval)
    pendingOffers: 0,   // offer_statuses.id = 1 (pending)
    pendingDocs: 0,     // documents.status = 'pending'
    inspectionsToday: 0,
    completedPaymentsToday: 0,
    revenueToday: 0,
  });

  const [revenueData, setRevenueData] = useState([]); // optional chart data
  const [systemData, setSystemData] = useState({});   // optional system health
  const [activities, setActivities] = useState([]);   // audit_logs / notifications
  const [queues, setQueues] = useState({
    listings: [], // pending listing objects
    offers: [],   // pending offer objects
    documents: [],// pending document objects
  });

  // UI state
  const [selectedDate, setSelectedDate] = useState(getLocalTodayString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });

  // Refs for safe orchestration
  const isInitialLoad = useRef(true);
  const prevPendingRef = useRef(0);

  // Responsive helpers
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /**
   * Main logic for Dashboard Data orchestration
   */
  useEffect(() => {
    // Don't attempt to fetch until auth is settled and we have a user.
    if (authLoading) return;
    if (!authUser) {
      // ensure we don't leave the dashboard in a loading state when unauthenticated
      setLoading(false);
      return;
    }

    let isMounted = true;
    let timerId;
    let controller;
    const backoffUntil = { current: 0 };

    isInitialLoad.current = true;

    const fetchDashboardData = async () => {
      // If we're currently in backoff due to 429, skip fetching
      if (Date.now() < backoffUntil.current) {
        return;
      }

      controller?.abort();
      controller = new AbortController();

      try {
        if (isInitialLoad.current) {
          setLoading(true);
        }

        const response = await api.get("/admin/dashboard", {
          params: { date: selectedDate },
          signal: controller.signal,
        });

        if (!isMounted) return;

        const root = response?.data ?? {};
        const payload =
          root?.data && typeof root.data === "object"
            ? root.data
            : root;

        const newStats = payload?.stats || payload?.kpis || {};
        const newRev = payload?.revenueData || payload?.revenue || [];
        const newSystem = payload?.systemData || payload?.fleetData || payload?.system || {};
        const newActs = payload?.activities || payload?.activity || payload?.logs || [];
        const newQueues = payload?.queues || payload?.workQueue || {};

        const mergedStats = { ...stats, ...newStats };
        const isToday = selectedDate === getLocalTodayString();

        const pendingTotal =
          Number(mergedStats.pendingListings || 0) +
          Number(mergedStats.pendingOffers || 0) +
          Number(mergedStats.pendingDocs || 0);

        if (
          !isInitialLoad.current &&
          isToday &&
          pendingTotal > prevPendingRef.current
        ) {
          const audio = new Audio(NOTIFICATION_SOUND_URL);
          audio.play().catch(() => {});
          setSnack({
            open: true,
            message: "New Pending Task Detected!",
            severity: "warning",
          });
        }

        prevPendingRef.current = pendingTotal;

        setStats(mergedStats);
        setRevenueData(Array.isArray(newRev) ? newRev : []);
        setSystemData(newSystem || {});
        setActivities(Array.isArray(newActs) ? newActs : []);
        setQueues({
          listings: Array.isArray(newQueues.listings)
            ? newQueues.listings
            : Array.isArray(newQueues.listingQueue)
            ? newQueues.listingQueue
            : [],
          offers: Array.isArray(newQueues.offers)
            ? newQueues.offers
            : Array.isArray(newQueues.offerQueue)
            ? newQueues.offerQueue
            : [],
          documents: Array.isArray(newQueues.documents)
            ? newQueues.documents
            : Array.isArray(newQueues.docs)
            ? newQueues.docs
            : [],
        });

        setError(null);
        isInitialLoad.current = false; 
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Dashboard Fetch Error:", err);

        const status = err?.response?.status || (err?.status ?? null);
        if (status === 401 || status === 403) {
          // Ensure server refresh cookie/session is cleared, then notify app to logout.
          try {
            // Attempt server-side logout (clears refresh cookie)
            api.post('/auth/logout').catch(() => {});
          } catch (e) {}

          try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } catch (e) {
            // ignore
          }

          try { window.dispatchEvent(new Event('ai_re_logout')); } catch (e) {}
          return;
        }

        // Handle server-side rate limiting gracefully: back off polling for a bit
        if (status === 429) {
          console.warn('Received 429 from dashboard API — backing off polling for', BACKOFF_ON_429_MS, 'ms');
          backoffUntil.current = Date.now() + BACKOFF_ON_429_MS;
          if (isMounted) {
            setSnack({ open: true, message: 'Server rate limit reached — pausing dashboard updates.', severity: 'warn' });
          }
          // ensure initial loading state is cleared so UI doesn't hang
          if (isInitialLoad.current) {
            setLoading(false);
            isInitialLoad.current = false;
          }
          return;
        }

        if (isMounted) {
          if (isInitialLoad.current) {
            const serverMsg = err?.response?.data?.message || null;
            setError(serverMsg || 'Unable to sync dashboard analytics.');
          }
        }
      } finally {
        if (isMounted && isInitialLoad.current === false) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    const isToday = selectedDate === getLocalTodayString();
    if (isToday) {
      timerId = setInterval(() => {
        if (!document.hidden && Date.now() >= backoffUntil.current) {
          fetchDashboardData();
        }
      }, POLL_INTERVAL);
    }

    return () => {
      isMounted = false;
      clearInterval(timerId);
      controller?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, authLoading, authUser]);

  const pendingTotal = useMemo(() => {
    return (
      Number(stats.pendingListings || 0) +
      Number(stats.pendingOffers || 0) +
      Number(stats.pendingDocs || 0)
    );
  }, [stats.pendingListings, stats.pendingOffers, stats.pendingDocs]);

  async function approveListing(listingId) {
    try {
      await api.patch(`/admin/listings/${listingId}/approve`);
      setSnack({ open: true, message: "Listing approved.", severity: "success" });
      setSelectedDate((d) => d);
    } catch (e) {
      console.error(e);
      setSnack({ open: true, message: "Failed to approve listing.", severity: "error" });
    }
  }

  async function rejectListing(listingId) {
    const reason = prompt("Rejection reason (optional):") || "";
    try {
      await api.patch(`/admin/listings/${listingId}/reject`, { reason });
      setSnack({ open: true, message: "Listing rejected.", severity: "success" });
      setSelectedDate((d) => d);
    } catch (e) {
      console.error(e);
      setSnack({ open: true, message: "Failed to reject listing.", severity: "error" });
    }
  }

  async function verifyDocument(documentId) {
    try {
      await api.patch(`/admin/docs/${documentId}/verify`);
      setSnack({ open: true, message: "Document verified.", severity: "success" });
      setSelectedDate((d) => d);
    } catch (e) {
      console.error(e);
      setSnack({ open: true, message: "Failed to verify document.", severity: "error" });
    }
  }

  async function reviewOffer(offerId) {
    try {
      await api.patch(`/admin/offers/${offerId}/review`);
      setSnack({ open: true, message: "Offer marked as reviewed.", severity: "success" });
      setSelectedDate((d) => d);
    } catch (e) {
      console.error(e);
      setSnack({ open: true, message: "Failed to review offer.", severity: "error" });
    }
  }

  const pageBg = "#020617"; // Rich slate-950
  const teal = "#14b8a6";

  return (
    <div style={{ minHeight: "100vh", background: pageBg, color: "white", fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Page header (compact + glass) — no duplicate Topbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: `linear-gradient(135deg, ${teal}, #0f766e)`, display: 'grid', placeItems: 'center', color: 'white', fontWeight: 900, boxShadow: `0 6px 20px ${teal}22` }}>AI</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'white', lineHeight: 1 }}>{'Dashboard'}</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>Overview & live work queues</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)', padding: '8px 10px', borderRadius: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>CONTEXT DATE</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                borderRadius: 8,
                padding: '6px 8px',
                fontSize: 13,
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>

          <div style={{ padding: '8px 12px', borderRadius: 12, background: 'linear-gradient(180deg, rgba(20,184,166,0.08), rgba(20,184,166,0.04))', border: '1px solid rgba(20,184,166,0.12)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#14b8a6' }}>TASKS</span>
            <span style={{ fontWeight: 900, fontSize: 16, color: 'white' }}>{pendingTotal}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: isMobile ? 12 : 32, maxWidth: 1600, margin: '0 auto' }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Initial Loading State */}
          {loading && isInitialLoad.current && (
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 24,
                padding: 32,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
              }}
            >
              <LottieLoader size={64} invert />
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Syncing Engine…</div>
                <div style={{ opacity: 0.5, fontSize: 14 }}>Aggregating real-time analytics and populating work queues.</div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 20,
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}
            >
              <div style={{ color: '#ef4444' }}>⚠️</div>
              <div>
                <div style={{ fontWeight: 800, color: '#ef4444' }}>Data Sync Error</div>
                <div style={{ opacity: 0.7, fontSize: 13 }}>{error}</div>
              </div>
            </div>
          )}

          {/* KPI Row - Responsive Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
            <Card title="Pending Listings" right={<Badge label="Properties" tone="warn" />}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                {loading && isInitialLoad.current ? <Skeleton width={60} height={42} /> : (
                  <div style={{ fontSize: 42, fontWeight: 900, color: "white" }}>{Number(stats.pendingListings || 0)}</div>
                )}
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>awaiting approval</div>
              </div>
            </Card>

            <Card title="Pending Offers" right={<Badge label="Offers" tone="warn" />}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                {loading && isInitialLoad.current ? <Skeleton width={60} height={42} /> : (
                  <div style={{ fontSize: 42, fontWeight: 900, color: "white" }}>{Number(stats.pendingOffers || 0)}</div>
                )}
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>awaiting review</div>
              </div>
            </Card>

            <Card title="Pending Docs" right={<Badge label="Compliance" tone="warn" />}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                {loading && isInitialLoad.current ? <Skeleton width={60} height={42} /> : (
                  <div style={{ fontSize: 42, fontWeight: 900, color: "white" }}>{Number(stats.pendingDocs || 0)}</div>
                )}
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>awaiting verification</div>
              </div>
            </Card>

            <Card title="Revenue Today" right={<Badge label="Financials" tone="info" />}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                {loading && isInitialLoad.current ? <Skeleton width={140} height={42} /> : (
                  <div style={{ fontSize: 32, fontWeight: 900, color: teal }}>{formatMoneyAUD(stats.revenueToday || 0)}</div>
                )}
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                  {Number(stats.completedPaymentsToday || 0)} payments
                </div>
              </div>
            </Card>
          </div>

          {/* Work Queue + Activity - Responsive Split */}
          <div className="admin-work-grid" style={{ alignItems: 'start' }}>
            
            {/* Work Queue Section */}
            <Card
              title="Work Queue"
              right={<div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> <Badge label="Live" tone="info" /></div>}
            >
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
                <Badge label={`LST: ${Number(stats.pendingListings || 0)}`} tone="warn" />
                <Badge label={`OFF: ${Number(stats.pendingOffers || 0)}`} tone="warn" />
                <Badge label={`DOC: ${Number(stats.pendingDocs || 0)}`} tone="warn" />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                
                {/* Listings Subsection */}
                <section>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontWeight: 800, color: "white", fontSize: 15 }}>Pending Listings</div>
                  </div>
                  <Table
                    loading={loading && isInitialLoad.current}
                    emptyText="All listings processed."
                    columns={[
                      { key: "street_address", label: "Property Address" },
                      { key: "seller_name", label: "Seller" },
                      {
                        key: "actions",
                        label: "Decision",
                        render: (r) => (
                          <div style={{ display: "flex", gap: 10 }}>
                            <button
                              onClick={() => approveListing(r.id)}
                              className="hover:scale-105 active:scale-95 transition-transform"
                              style={{
                                background: teal,
                                color: "white",
                                border: "none",
                                borderRadius: 10,
                                padding: "8px 14px",
                                fontSize: 12,
                                fontWeight: 800,
                                cursor: "pointer",
                                boxShadow: `0 4px 12px ${teal}33`
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectListing(r.id)}
                              className="hover:bg-red-500/10 transition-colors"
                              style={{
                                background: "transparent",
                                color: "#ef4444",
                                border: "1px solid rgba(239,68,68,0.3)",
                                borderRadius: 10,
                                padding: "8px 14px",
                                fontSize: 12,
                                fontWeight: 800,
                                cursor: "pointer",
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        ),
                      },
                    ]}
                    rows={queues.listings.map((l) => ({
                      id: l.id,
                      street_address: l.street_address || l.address || l.title,
                      seller_name: l.seller_name || l.seller || l.seller_email || "—",
                    }))}
                  />
                </section>

                {/* Offers Subsection */}
                <section>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontWeight: 800, color: "white", fontSize: 15 }}>Pending Offers</div>
                  </div>
                  <Table
                    loading={loading && isInitialLoad.current}
                    emptyText="No offers in queue."
                    columns={[
                      { key: "property", label: "Property" },
                      { key: "amount", label: "Offer" },
                      {
                        key: "actions",
                        label: "Status",
                        render: (r) => (
                          <button
                            onClick={() => reviewOffer(r.id)}
                            className="hover:bg-teal-500/10 transition-colors"
                            style={{
                              background: "transparent",
                              color: teal,
                              border: "1px solid rgba(20,184,166,0.3)",
                              borderRadius: 10,
                              padding: "8px 14px",
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            Mark Reviewed
                          </button>
                        ),
                      },
                    ]}
                    rows={queues.offers.map((o) => ({
                      id: o.id,
                      property: o.property_address || o.street_address || o.property || `#${o.property_id ?? "—"}`,
                      amount: formatMoneyAUD(o.offer_amount || o.amount),
                    }))}
                  />
                </section>

                {/* Documents Subsection */}
                <section>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontWeight: 800, color: "white", fontSize: 15 }}>Pending Documents</div>
                  </div>
                  <Table
                    loading={loading && isInitialLoad.current}
                    emptyText="All documents verified."
                    columns={[
                      { key: "type", label: "Category" },
                      { key: "file", label: "Resource" },
                      {
                        key: "actions",
                        label: "Verification",
                        render: (r) => (
                          <button
                            onClick={() => verifyDocument(r.id)}
                            className="hover:scale-105 transition-transform"
                            style={{
                              background: "white",
                              color: pageBg,
                              border: "none",
                              borderRadius: 10,
                              padding: "8px 14px",
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            Verify Doc
                          </button>
                        ),
                      },
                    ]}
                    rows={queues.documents.map((d) => ({
                      id: d.id,
                      type: d.doc_type || d.document_type || d.type || "—",
                      file: d.file_name || d.name || "—",
                    }))}
                  />
                </section>
              </div>
            </Card>

            {/* Activity Feed Section */}
            <Card title="Activity Log" right={<Badge label="System Logs" tone="neutral" />}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {loading && isInitialLoad.current ? (
                  [1, 2, 3, 4, 5].map(i => <Skeleton key={i} height={80} />)
                ) : Array.isArray(activities) && activities.length > 0 ? (
                  activities.slice(0, 10).map((a, idx) => (
                    <div
                      key={a.id ?? idx}
                      style={{
                        border: "1px solid rgba(255,255,255,0.04)",
                        borderRadius: 20,
                        padding: 16,
                        background: "rgba(255,255,255,0.02)",
                        transition: 'transform 0.2s ease'
                      }}
                      className="hover:border-white/10"
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 800, color: "white", fontSize: 14 }}>
                          {safeText(a.action || a.title || "Activity")}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                          {a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                        </div>
                      </div>
                      <div style={{ marginTop: 8, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                        <span style={{ fontWeight: 700, color: teal }}>{safeText(a.entity_type || a.entity || "system")}</span>
                        {" "}• ID: <span style={{ color: "rgba(255,255,255,0.9)" }}>{safeText(a.entity_id || a.entityId || "—")}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, textAlign: 'center', padding: '40px 0' }}>No activity records found for this date.</div>
                )}
              </div>
            </Card>
          </div>

          {/* Toast Notification */}
          {snack.open && (
            <div
              onClick={() => setSnack({ open: false, message: "", severity: "info" })}
              style={{
                position: "fixed",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                background:
                  snack.severity === "error"
                    ? "#ef4444"
                    : snack.severity === "warning"
                    ? "#f59e0b"
                    : snack.severity === "success"
                    ? "#10b981"
                    : teal,
                color: "white",
                padding: "16px 24px",
                borderRadius: 20,
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                cursor: "pointer",
                zIndex: 1000,
                maxWidth: 500,
                width: "calc(100% - 48px)",
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
              title="Click to dismiss"
            >
              <div style={{ fontWeight: 900, fontSize: 15 }}>{snack.message}</div>
              <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 500 }}>
                Automatic refresh every {POLL_INTERVAL / 1000}s active.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}