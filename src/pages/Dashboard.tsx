import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const load = () => api.get("/campaigns").then((d) => setCampaigns(d.campaigns));
  useEffect(() => {
    load();
  }, []);

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete campaign "${name}" and its send log?`)) return;
    try {
      await api.del(`/campaigns/${id}`);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const totals = campaigns.reduce(
    (a, c) => {
      a.sent += c.counts.sent;
      a.failed += c.counts.failed;
      a.opened += c.counts.opened;
      a.clicked += c.counts.clicked;
      return a;
    },
    { sent: 0, failed: 0, opened: 0, clicked: 0 }
  );
  const openRate = totals.sent ? Math.round((totals.opened / totals.sent) * 100) : 0;
  const clickRate = totals.sent ? Math.round((totals.clicked / totals.sent) * 100) : 0;

  return (
    <div>
      <div className="flex-between">
        <h1>Dashboard</h1>
        <Link to="/compose"><button>+ New Campaign</button></Link>
      </div>

      <div className="card">
        <div className="stats">
          <div className="stat"><div className="n">{totals.sent}</div><div className="l">Total sent</div></div>
          <div className="stat"><div className="n" style={{ color: "var(--bad)" }}>{totals.failed}</div><div className="l">Failed</div></div>
          <div className="stat"><div className="n">{totals.opened}</div><div className="l">Opened ({openRate}%)</div></div>
          <div className="stat"><div className="n" style={{ color: "var(--good)" }}>{totals.clicked}</div><div className="l">Clicked ({clickRate}%)</div></div>
        </div>
        <p className="small muted" style={{ marginTop: 10 }}>
          Note: opens are inflated by Apple Mail Privacy Protection & image proxies. Clicks are the reliable conversion signal.
        </p>
      </div>

      <div className="card">
        <h2>Campaigns</h2>
        {campaigns.length === 0 && <p className="muted">No campaigns yet. <Link to="/compose">Create one →</Link></p>}
        {campaigns.length > 0 && (
          <table>
            <thead><tr><th>Name</th><th>Status</th><th>Sent</th><th>Failed</th><th>Opened</th><th>Clicked</th><th></th></tr></thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td><span className={`badge ${c.status}`}>{c.status}</span></td>
                  <td>{c.counts.sent}/{c.counts.total}</td>
                  <td>{c.counts.failed}</td>
                  <td>{c.counts.opened}</td>
                  <td>{c.counts.clicked}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <Link to={`/campaigns/${c.id}`}>Open →</Link>{" "}
                    <button className="danger sm" onClick={() => del(c.id, c.name)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
