import { useEffect, useState } from "react";
import { api } from "../api";

interface Profile {
  id: string;
  label: string;
  host: string;
  port: number;
  secure: string;
  username: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  lastVerified?: string;
}

const empty = {
  label: "", host: "", port: 587, secure: "starttls",
  username: "", password: "", fromName: "", fromEmail: "", replyTo: "",
};

export default function Smtp() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [test, setTest] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => api.get("/smtp").then((d) => setProfiles(d.profiles));
  useEffect(() => {
    load();
  }, []);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const runTest = async () => {
    setBusy(true);
    setTest(null);
    try {
      const r = await api.post("/smtp/test", {
        host: form.host, port: Number(form.port), secure: form.secure,
        username: form.username, password: form.password,
      });
      setTest(r);
    } catch (e: any) {
      setTest({ ok: false, message: e.message });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setMsg("");
    try {
      await api.post("/smtp", { ...form, port: Number(form.port) });
      setForm(empty);
      setTest(null);
      setMsg("SMTP profile saved.");
      load();
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  const testSaved = async (id: string) => {
    const r = await api.post(`/smtp/${id}/test`);
    alert(r.ok ? `✅ ${r.message}` : `❌ ${r.message}\n\n${r.suggestion || ""}`);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this SMTP profile?")) return;
    await api.del(`/smtp/${id}`);
    load();
  };

  return (
    <div>
      <h1>SMTP Servers</h1>
      <p className="muted">Connect your sending mailbox. Test the connection before saving — you'll get an exact reason if it fails.</p>

      <div className="card">
        <h2>Add a mailbox</h2>
        <div className="grid2">
          <div>
            <label>Label</label>
            <input value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="Main outreach box" />
          </div>
          <div>
            <label>Encryption</label>
            <select value={form.secure} onChange={(e) => set("secure", e.target.value)}>
              <option value="starttls">STARTTLS (usually port 587)</option>
              <option value="ssl">SSL / TLS (usually port 465)</option>
              <option value="none">None (not recommended)</option>
            </select>
          </div>
        </div>
        <div className="grid2">
          <div>
            <label>SMTP Host</label>
            <input value={form.host} onChange={(e) => set("host", e.target.value)} placeholder="smtp.yourdomain.com" />
          </div>
          <div>
            <label>Port</label>
            <input type="number" value={form.port} onChange={(e) => set("port", e.target.value)} />
          </div>
        </div>
        <div className="grid2">
          <div>
            <label>Username</label>
            <input value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="you@yourdomain.com" />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="app password" />
          </div>
        </div>
        <div className="grid2">
          <div>
            <label>From name</label>
            <input value={form.fromName} onChange={(e) => set("fromName", e.target.value)} placeholder="Jane at Envelock" />
          </div>
          <div>
            <label>From email</label>
            <input value={form.fromEmail} onChange={(e) => set("fromEmail", e.target.value)} placeholder="jane@yourdomain.com" />
          </div>
        </div>
        <label>Reply-To (optional)</label>
        <input value={form.replyTo} onChange={(e) => set("replyTo", e.target.value)} placeholder="replies@yourdomain.com" />

        {test && (
          <div className={`alert ${test.ok ? "good" : "bad"}`}>
            <strong>{test.ok ? "✅ " : "❌ "}{test.message}</strong>
            {test.tls && (
              <div className="small">Negotiated TLS: {test.tls.version} · {test.tls.cipher}</div>
            )}
            {test.suggestion && <div className="small" style={{ marginTop: 6 }}>💡 {test.suggestion}</div>}
            {test.detail && <div className="small muted" style={{ marginTop: 6 }}><code>{test.detail}</code></div>}
          </div>
        )}
        {msg && <div className="alert info">{msg}</div>}

        <div className="row" style={{ marginTop: 14 }}>
          <button className="ghost" onClick={runTest} disabled={busy || !form.host}>
            {busy ? "Testing…" : "Test connection"}
          </button>
          <button onClick={save} disabled={!form.host || !form.fromEmail}>Save mailbox</button>
        </div>
      </div>

      <div className="card">
        <h2>Your mailboxes</h2>
        {profiles.length === 0 && <p className="muted">None yet.</p>}
        {profiles.length > 0 && (
          <table>
            <thead>
              <tr><th>Label</th><th>Host</th><th>From</th><th>Verified</th><th></th></tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id}>
                  <td>{p.label}</td>
                  <td className="muted">{p.host}:{p.port} <span className="tag">{p.secure}</span></td>
                  <td className="muted">{p.fromName} &lt;{p.fromEmail}&gt;</td>
                  <td>{p.lastVerified ? <span className="badge sent">verified</span> : <span className="muted small">never</span>}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button className="ghost sm" onClick={() => testSaved(p.id)}>Test</button>{" "}
                    <button className="danger sm" onClick={() => del(p.id)}>Delete</button>
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
