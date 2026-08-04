import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api, API_BASE, getToken } from "../api";

interface Row {
  id: string;
  email: string;
  status: string;
  smtpResponse?: string;
  errorMessage?: string;
  openedAt?: string;
  clickedAt?: string;
}

export default function CampaignLive() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [funnel, setFunnel] = useState<any>(null);
  const [live, setLive] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const loadDetail = async () => {
    const d = await api.get(`/campaigns/${id}`);
    setCampaign(d.campaign);
    setRows(d.recipients);
    setFunnel(d.funnel);
    return d;
  };

  useEffect(() => {
    loadDetail();
    return () => esRef.current?.close();
  }, [id]);

  const updateRow = (r: any) =>
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: r.status, smtpResponse: r.smtpResponse, errorMessage: r.error } : x)));

  const startStream = () => {
    // EventSource can't set headers, so pass the token as a query param.
    const es = new EventSource(`${API_BASE}/campaigns/${id}/stream?token=${getToken()}`);
    esRef.current = es;
    es.addEventListener("recipient", (e: any) => updateRow(JSON.parse(e.data)));
    es.addEventListener("status", (e: any) => {
      const d = JSON.parse(e.data);
      setCampaign((c: any) => ({ ...c, status: d.status }));
    });
    es.addEventListener("done", () => {
      setLive(false);
      es.close();
      loadDetail();
    });
    es.onerror = () => {};
  };

  const send = async () => {
    setLive(true);
    startStream();
    try {
      await api.post(`/campaigns/${id}/send`);
    } catch (e: any) {
      alert(e.message);
      setLive(false);
    }
  };

  const stop = async () => {
    await api.post(`/campaigns/${id}/stop`);
  };

  if (!campaign) return <div className="muted">Loading…</div>;

  const counts = rows.reduce((a: any, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {});

  return (
    <div>
      <div className="flex-between">
        <div>
          <h1>{campaign.name}</h1>
          <p className="muted">Subject: {campaign.subject} · <span className={`badge ${campaign.status}`}>{campaign.status}</span></p>
        </div>
        <div>
          {!live && campaign.status !== "sending" && <button onClick={send}>▶ Start sending</button>}
          {(live || campaign.status === "sending") && <button className="danger" onClick={stop}>■ Stop</button>}
        </div>
      </div>

      <div className="card">
        <div className="stats">
          <div className="stat"><div className="n">{rows.length}</div><div className="l">Total</div></div>
          <div className="stat"><div className="n" style={{ color: "var(--good)" }}>{counts.sent || 0}</div><div className="l">Sent</div></div>
          <div className="stat"><div className="n" style={{ color: "var(--bad)" }}>{(counts.failed || 0) + (counts.bounced || 0)}</div><div className="l">Failed</div></div>
          <div className="stat"><div className="n" style={{ color: "var(--accent)" }}>{counts.sending || 0}</div><div className="l">Sending</div></div>
          <div className="stat"><div className="n">{counts.queued || 0}</div><div className="l">Queued</div></div>
        </div>
      </div>

      <div className="card">
        <h2>Send log (live, one by one)</h2>
        <div className="log">
          <table>
            <thead><tr><th>Email</th><th>Status</th><th>Server response</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.email}</td>
                  <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                  <td className="small muted">{r.errorMessage || r.smtpResponse || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
