import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { HTML_STARTERS } from "../templates";

export default function Compose() {
  const nav = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [f, setF] = useState<any>({
    name: "", smtpProfileId: "", listId: "", subject: "",
    text: "", html: "", delayMs: 3000,
    trackOpens: true, trackClicks: true, encodeBody: "none",
  });
  const [lint, setLint] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/smtp").then((d) => setProfiles(d.profiles));
    api.get("/leads/lists").then((d) => setLists(d.lists));
  }, []);

  const set = (k: string, v: any) => setF((s: any) => ({ ...s, [k]: v }));
  const applyStarter = (i: number) => {
    setF((s: any) => ({ ...s, html: HTML_STARTERS[i].html, text: HTML_STARTERS[i].text }));
  };

  const runLint = async () => {
    setLint(await api.post("/deliverability/lint", { subject: f.subject, text: f.text, html: f.html }));
  };
  const sendTest = async () => {
    if (!f.smtpProfileId) return setErr("Pick a sending mailbox first.");
    const to = prompt("Send a test email to which address?");
    if (!to) return;
    setErr("");
    try {
      const r = await api.post("/campaigns/test-send", {
        smtpProfileId: f.smtpProfileId, toEmail: to,
        subject: f.subject || "Envelock test", text: f.text, html: f.html,
      });
      alert(r.ok ? `✅ Test sent to ${to}` : `❌ ${r.message}`);
    } catch (e: any) {
      setErr(e.message);
    }
  };
  const runPreview = async () => {
    if (!f.listId) return setErr("Pick a lead list to preview against.");
    setErr("");
    try {
      setPreview(await api.post("/campaigns/preview", { listId: f.listId, subject: f.subject, text: f.text, html: f.html }));
    } catch (e: any) {
      setErr(e.message);
    }
  };

  const create = async () => {
    setErr("");
    setBusy(true);
    try {
      const r = await api.post("/campaigns", { ...f, delayMs: Number(f.delayMs) });
      nav(`/campaigns/${r.campaign.id}`);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1>New Campaign</h1>
      <p className="muted">Personalize with <code>{"{{first_name}}"}</code>, fallbacks <code>{"{{first_name|there}}"}</code>, and spintax <code>{"{Hi|Hello}"}</code>.</p>

      <div className="card">
        <div className="grid2">
          <div>
            <label>Campaign name</label>
            <input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="August outreach" />
          </div>
          <div>
            <label>Send from (SMTP)</label>
            <select value={f.smtpProfileId} onChange={(e) => set("smtpProfileId", e.target.value)}>
              <option value="">Select a mailbox…</option>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.label} — {p.fromEmail}</option>)}
            </select>
          </div>
        </div>
        <div className="grid2">
          <div>
            <label>Lead list</label>
            <select value={f.listId} onChange={(e) => set("listId", e.target.value)}>
              <option value="">Select a list…</option>
              {lists.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.count})</option>)}
            </select>
          </div>
          <div>
            <label>Delay between sends (ms)</label>
            <input type="number" value={f.delayMs} onChange={(e) => set("delayMs", e.target.value)} />
          </div>
        </div>
        <label>Subject</label>
        <input value={f.subject} onChange={(e) => set("subject", e.target.value)} placeholder="Quick idea for {{company}}" />
      </div>

      <div className="card">
        <div className="flex-between">
          <h2>Body</h2>
          <div>
            {HTML_STARTERS.map((s, i) => (
              <button key={i} className="ghost sm" style={{ marginLeft: 6 }} onClick={() => applyStarter(i)}>{s.name}</button>
            ))}
          </div>
        </div>
        <label>Plain text</label>
        <textarea value={f.text} onChange={(e) => set("text", e.target.value)} placeholder="Hi {{first_name|there}}, …" />
        <label>HTML (optional — sent as multipart with the text above)</label>
        <textarea value={f.html} onChange={(e) => set("html", e.target.value)} style={{ minHeight: 140, fontFamily: "monospace", fontSize: 12 }} />
      </div>

      <div className="card">
        <h2>Sending options</h2>
        <div className="row">
          <div className="check"><input type="checkbox" checked={f.trackOpens} onChange={(e) => set("trackOpens", e.target.checked)} /> <label style={{ margin: 0 }}>Track opens</label></div>
          <div className="check"><input type="checkbox" checked={f.trackClicks} onChange={(e) => set("trackClicks", e.target.checked)} /> <label style={{ margin: 0 }}>Track clicks</label></div>
        </div>
        <label>Body encoding</label>
        <select value={f.encodeBody} onChange={(e) => set("encodeBody", e.target.value)}>
          <option value="none">None — recommended (best deliverability)</option>
          <option value="quoted-printable">Quoted-printable (MIME)</option>
          <option value="base64">Base64 (MIME)</option>
          <option value="obfuscate">Obfuscate text ⚠️ hurts deliverability</option>
        </select>
        {f.encodeBody === "obfuscate" && (
          <div className="alert warn">Obfuscation inserts hidden characters. Spam filters look for exactly this — it will <strong>lower</strong> your inbox rate. Only enabled because you asked for it.</div>
        )}
      </div>

      <div className="card">
        <div className="row">
          <button className="ghost" onClick={runLint}>Run spam check</button>
          <button className="ghost" onClick={runPreview}>Preview merge</button>
          <button className="ghost" onClick={sendTest}>Send test to me</button>
        </div>
        {lint && (
          <div className={`alert ${lint.risk === "high" ? "bad" : lint.risk === "medium" ? "warn" : "good"}`}>
            <strong>Spam risk: {lint.risk} (score {lint.score})</strong>
            {lint.findings.map((x: any, i: number) => <div key={i} className="small" style={{ marginTop: 4 }}>• {x.message}</div>)}
            {lint.findings.length === 0 && <div className="small">No issues found. 👍</div>}
          </div>
        )}
        {preview && (
          <div className="alert info">
            <div className="small muted">Rendered against {preview.againstEmail}</div>
            <div><strong>{preview.subject}</strong></div>
            {preview.unresolvedTags.length > 0 && (
              <div className="small" style={{ color: "#efd497", marginTop: 6 }}>
                ⚠️ Unresolved tags (will be blank): {preview.unresolvedTags.map((t: string) => <span key={t} className="tag">{`{{${t}}}`}</span>)}
              </div>
            )}
            {preview.html && <div style={{ background: "#fff", color: "#000", borderRadius: 8, padding: 12, marginTop: 8 }} dangerouslySetInnerHTML={{ __html: preview.html }} />}
            {!preview.html && <pre className="small" style={{ whiteSpace: "pre-wrap" }}>{preview.text}</pre>}
          </div>
        )}
        {err && <div className="alert bad">{err}</div>}
        <div style={{ marginTop: 14 }}>
          <button onClick={create} disabled={busy || !f.name || !f.smtpProfileId || !f.listId || !f.subject}>
            {busy ? "Creating…" : "Create campaign →"}
          </button>
        </div>
      </div>
    </div>
  );
}
