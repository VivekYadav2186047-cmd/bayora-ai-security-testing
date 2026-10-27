
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ShieldCheck,
  LayoutDashboard,
  FlaskConical,
  ScrollText,
  RefreshCw,
  Plus,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  CircleDot,
  TerminalSquare,
} from "lucide-react";
import "./style.css";

const API = "https://bayora-backend.onrender.com";

function App() {
  const [sessions, setSessions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [title, setTitle] = useState("");
  const [team, setTeam] = useState("red");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [prompt, setPrompt] = useState("");
const [testType, setTestType] = useState("safety_check");
const [testResult, setTestResult] = useState(null);
const [testing, setTesting] = useState(false);

  async function loadData() {
    setLoading(true);

    try {
      const [healthRes, sessionsRes, logsRes] = await Promise.all([
        fetch(`${API}/health`),
        fetch(`${API}/api/sessions`),
        fetch(`${API}/api/audit-logs`),
      ]);

      if (!healthRes.ok || !sessionsRes.ok || !logsRes.ok) {
        throw new Error("API request failed");
      }

      const health = await healthRes.json();
      const sessionData = await sessionsRes.json();
      const logData = await logsRes.json();

      setConnected(health.status === "healthy");
      setSessions(sessionData.sessions || []);
      setLogs(logData.audit_logs || []);
      setMessage("");
    } catch {
      setConnected(false);
      setMessage(
        "Cannot reach the backend. Check that the API server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createSession(event) {
    event.preventDefault();

    if (!title.trim()) {
      setMessage("Enter a name for this test session.");
      return;
    }

    try {
      const response = await fetch(`${API}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), team }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to create session.");
      }

      setTitle("");
      setMessage("Session created successfully.");
      await loadData();
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    }
  }
  
  async function runSecurityTest(event) {
    event.preventDefault();

    if (!prompt.trim()) {
      setMessage("Please enter a prompt to test.");
      return;
    }

    setTesting(true);
    setTestResult(null);
    setMessage("");

    try {
      const response = await fetch(`${API}/api/tests/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          test_type: testType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Test request failed."
        );
      }

      setTestResult(data);
      setPrompt("");
      await loadData();
    } catch (error) {
      setMessage(error.message || "Unable to run test.");
    } finally {
      setTesting(false);
    }
  }


  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleString([], {
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="#overview">
          <div className="brand-icon">
            <ShieldCheck size={23} />
          </div>
          <div>
            <strong>bayora<span>.</span></strong>
            <small>SECURITY LAB</small>
          </div>
        </a>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="nav">
          <a className="nav-link active" href="#overview">
            <LayoutDashboard size={18} /> Overview
          </a>
          <a className="nav-link" href="#sessions">
            <FlaskConical size={18} /> Test sessions
          </a>
          <a className="nav-link" href="#audit">
            <ScrollText size={18} /> Audit trail
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="environment-icon">
            <TerminalSquare size={17} />
          </div>
          <div>
            <strong>Local environment</strong>
            <small>Hackathon prototype</small>
          </div>
          <span className={`live-dot ${connected ? "" : "offline"}`} />
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> Overview
          </div>

          <div className="topbar-right">
            <span
              className={`connection ${connected ? "" : "disconnected"}`}
            >
              <span className="live-dot" />
              {connected ? "API connected" : "API unavailable"}
            </span>

            <button
              className="icon-button"
              onClick={loadData}
              disabled={loading}
              aria-label="Refresh data"
              title="Refresh data"
            >
              <RefreshCw size={16} className={loading ? "spin" : ""} />
            </button>

            <div className="avatar">BT</div>
          </div>
        </header>

        <div className="page-content" id="overview">
          <section className="page-heading">
            <div>
              <div className="overline">
                <span /> SECURITY WORKSPACE
              </div>
              <h1>Overview</h1>
              <p>
                Manage test sessions and review recorded security activity.
              </p>
            </div>

            <a className="primary-button heading-action" href="#new-session">
              <Plus size={17} /> New test session
            </a>
          </section>

          {message && (
            <div className={`notice ${connected ? "success" : "warning"}`}>
              {message}
            </div>
          )}

          <section className="metrics">
            <article className="metric-card">
              <div className="metric-top">
                <span>Total sessions</span>
                <div className="metric-icon slate">
                  <Activity size={18} />
                </div>
              </div>
              <div className="metric-number">{sessions.length}</div>
              <div className="metric-foot">Records in this workspace</div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>Red team</span>
                <div className="metric-icon red">
                  <FlaskConical size={18} />
                </div>
              </div>
              <div className="metric-number">
                {sessions.filter((s) => s.team === "red").length}
              </div>
              <div className="metric-foot">Adversarial test sessions</div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>Blue team</span>
                <div className="metric-icon blue">
                  <ShieldCheck size={18} />
                </div>
              </div>
              <div className="metric-number">
                {sessions.filter((s) => s.team === "blue").length}
              </div>
              <div className="metric-foot">Defense-focused sessions</div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>Audit events</span>
                <div className="metric-icon green">
                  <ScrollText size={18} />
                </div>
              </div>
              <div className="metric-number">{logs.length}</div>
              <div className="metric-foot">Recorded application events</div>
            </article>
          </section>

          <section className="work-grid">
            <article className="card create-card" id="new-session">
              <div className="card-heading">
                <div>
                  <span className="section-kicker">CONFIGURATION</span>
                  <h2>Create a test session</h2>
                </div>
                <div className="heading-symbol">
                  <Plus size={19} />
                </div>
              </div>

              <p className="card-description">
                Create a session to organise your next security evaluation.
              </p>

              <form onSubmit={createSession}>
                <label htmlFor="session-title">Session name</label>
                <input
                  id="session-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Prompt injection evaluation"
                  maxLength={100}
                  required
                />

                <label htmlFor="team">Testing team</label>
                <select
                  id="team"
                  value={team}
                  onChange={(event) => setTeam(event.target.value)}
                >
                  <option value="red">
                    Red Team — Adversarial testing
                  </option>
                  <option value="blue">
                    Blue Team — Defense and monitoring
                  </option>
                </select>

                <div className="form-note">
                  <CircleDot size={14} />
                  This creates a session record; it does not execute an AI test.
                </div>

                <button className="primary-button submit-button" type="submit">
                  <Plus size={17} /> Create session
                </button>
              </form>
            </article>

            <article className="card sessions-card" id="sessions">
              <div className="card-heading">
                <div>
                  <span className="section-kicker">WORKSPACE ACTIVITY</span>
                  <h2>Recent sessions</h2>
                </div>
                <a className="text-action" href="#audit">
                  View audit <ArrowUpRight size={15} />
                </a>
              </div>

              {sessions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <FlaskConical size={22} />
                  </div>
                  <strong>No sessions yet</strong>
                  <p>
                    Create your first session to populate this workspace.
                  </p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>SESSION</th>
                        <th>TEAM</th>
                        <th>STATUS</th>
                        <th>CREATED</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.slice(0, 6).map((session) => (
                        <tr key={session.id}>
                          <td>
                            <div className="session-name">
                              <span className={`team-mark ${session.team}`}>
                                {session.team === "red" ? "R" : "B"}
                              </span>
                              <div>
                                <strong>{session.title}</strong>
                                <small>Session #{session.id}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`team-label ${session.team}`}>
                              {session.team} team
                            </span>
                          </td>
                          <td>
                            <span className="status-label">
                              <span />
                              {session.status}
                            </span>
                          </td>
                          <td className="date-cell">
                            {formatDate(session.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                className="secondary-button"
                onClick={loadData}
                disabled={loading}
              >
                <RefreshCw size={14} /> Refresh records
              </button>
            </article>
          </section>
          
  <section className="card" id="red-team-test">
    <div className="card-heading">
      <div>
        <span className="section-kicker">RED TEAM / EVALUATION</span>
        <h2>Security test runner</h2>
      </div>
      <div className="heading-symbol">
        <ShieldCheck size={19} />
      </div>
    </div>

    <p className="card-description">
      Submit a prompt to record a demo security evaluation.
      This prototype does not connect to a real AI model.
    </p>

    <form onSubmit={runSecurityTest}>
      <label htmlFor="test-type">Test category</label>
      <select
        id="test-type"
        value={testType}
        onChange={(event) => setTestType(event.target.value)}
      >
        <option value="safety_check">Safety check</option>
        <option value="prompt_injection">Prompt injection</option>
        <option value="jailbreak">Jailbreak check</option>
      </select>

      <label htmlFor="test-prompt">Prompt to evaluate</label>
      <textarea
        id="test-prompt"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Enter a prompt for the demo evaluation..."
        maxLength={2000}
        rows={4}
        required
      />

      <div className="form-note">
        <CircleDot size={14} />
        Demo only — no real AI model is evaluated.
      </div>

      <button
        className="primary-button submit-button"
        type="submit"
        disabled={testing || !connected}
      >
        <FlaskConical size={17} />
        {testing ? "Recording test..." : "Run security test"}
      </button>
    </form>

    {testResult && (
      <div className="test-result" aria-live="polite">
        <h3>Test result</h3>
        <p>
          <strong>Status:</strong> {testResult.status}
        </p>
        <p>
          <strong>Risk level:</strong> {testResult.risk_level}
        </p>
        <p>
  <strong>Risk score:</strong> {testResult.risk_score ?? "N/A"}/100
</p>
<div>
  <strong>Detected patterns:</strong>
  {testResult.findings?.length ? (
    <ul>
      {testResult.findings.map((finding) => (
        <li key={finding}>{finding}</li>
      ))}
    </ul>
  ) : (
    <p>No configured patterns matched.</p>
  )}
</div>
<p>
  <strong>Recommendation:</strong> {testResult.recommendation}
</p>
<div className="blue-team-review">
  <h3>Blue Team Review</h3>
  <p>Review the findings and record a decision.</p>

  <label htmlFor="review-status">Review decision</label>
  <select id="review-status" defaultValue="needs_investigation">
    <option value="safe">Safe</option>
    <option value="needs_investigation">Needs investigation</option>
    <option value="unsafe">Unsafe</option>
  </select>

  <label htmlFor="review-notes">Reviewer notes</label>
  <textarea
    id="review-notes"
    placeholder="Explain your review decision..."
    rows={3}
  />

  <button
    className="primary-button submit-button"
    type="button"
    onClick={async () => {
      const reviewStatus = document.getElementById("review-status").value;
      const notes = document.getElementById("review-notes").value;

      try {
        const response = await fetch(`${API}/api/tests/review`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            review_status: reviewStatus,
            notes,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Review could not be saved.");
        }

        setMessage("Blue Team review saved successfully.");
        await loadData();
      } catch (error) {
        setMessage(error.message || "Unable to save review.");
      }
    }}
  >
    <ShieldCheck size={17} /> Save Blue Team review
  </button>
</div>
        <p>{testResult.message}</p>
        <span className="form-note">
          Simulated result — not a real security verdict.
        </span>
      </div>
    )}
  </section>


          <section className="card audit-card" id="audit">
            <div className="card-heading">
              <div>
                <span className="section-kicker">TRACEABILITY</span>
                <h2>Audit trail</h2>
              </div>
              <span className="audit-count">
                <Clock3 size={14} /> Latest events
              </span>
            </div>

            <p className="card-description">
              Recent events recorded by the application database.
            </p>

            {logs.length === 0 ? (
              <div className="audit-empty">
                No audit events recorded yet.
              </div>
            ) : (
              <div className="audit-list">
                {logs.slice(0, 5).map((log) => (
                  <div className="audit-row" key={log.id}>
                    <div className="audit-event-icon">
                      <CheckCircle2 size={17} />
                    </div>
                    <div className="audit-event-details">
                      <strong>{log.event.replaceAll("_", " ")}</strong>
                      <small>{log.details}</small>
                    </div>
                    <time>{formatDate(log.created_at)}</time>
                  </div>
                ))}
              </div>
            )}
          </section>

          <footer className="footer">
            <span>
              BAYORA <span className="footer-dot">/</span> BINARY TITANS
            </span>
            <span>Hackathon prototype · Local environment</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
