import { useEffect, useState } from "react";
import { api } from "../api";

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [f, setF] = useState({ email: "", password: "", name: "", role: "user", dailySendCap: 500 });
  const [msg, setMsg] = useState<any>(null);

  const load = () => {
    api.get("/users").then((d) => setUsers(d.users));
    api.get("/users/audit").then((d) => setLogs(d.logs)).catch(() => {});
  };
  useEffect(() => {
    load();
  }, []);

  const set = (k: string, v: any) => setF((s) => ({ ...s, [k]: v }));

  const create = async () => {
    setMsg(null);
    try {
      await api.post("/users", { ...f, dailySendCap: Number(f.dailySendCap) });
      setF({ email: "", password: "", name: "", role: "user", dailySendCap: 500 });
      setMsg({ ok: "User created." });
      load();
    } catch (e: any) {
      setMsg({ err: e.message });
    }
  };

  const toggle = async (u: any) => {
    await api.patch(`/users/${u.id}`, { active: !u.active });
    load();
  };

  return (
    <div>
      <h1>Users &amp; Admin</h1>
      <p className="muted">Create operators with limited access. Users can send but cannot create other users or change global settings.</p>

      <div className="card">
        <h2>Create user</h2>
        <div className="grid2">
          <div><label>Email</label><input value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div><label>Name</label><input value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
        </div>
        <div className="grid2">
          <div><label>Temp password</label><input value={f.password} onChange={(e) => set("password", e.target.value)} /></div>
          <div>
            <label>Role</label>
            <select value={f.role} onChange={(e) => set("role", e.target.value)}>
              <option value="user">User (send only)</option>
              <option value="admin">Admin (full access)</option>
            </select>
          </div>
        </div>
        <label>Daily send cap</label>
        <input type="number" value={f.dailySendCap} onChange={(e) => set("dailySendCap", e.target.value)} />
        {msg?.ok && <div className="alert good">{msg.ok}</div>}
        {msg?.err && <div className="alert bad">{msg.err}</div>}
        <div style={{ marginTop: 12 }}><button onClick={create} disabled={!f.email || f.password.length < 6}>Create user</button></div>
      </div>

      <div className="card">
        <h2>Team &amp; activity</h2>
        <table>
          <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Campaigns</th><th>Sent</th><th>Failed</th><th>Opened</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}<div className="small muted">{u.name}</div></td>
                <td><span className="tag">{u.role}</span></td>
                <td>{u.active ? <span className="badge sent">active</span> : <span className="badge failed">disabled</span>}</td>
                <td>{u.stats.campaigns}</td>
                <td>{u.stats.sent}</td>
                <td>{u.stats.failed}</td>
                <td>{u.stats.opened}</td>
                <td style={{ textAlign: "right" }}>
                  {u.role !== "admin" && <button className="ghost sm" onClick={() => toggle(u)}>{u.active ? "Disable" : "Enable"}</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Audit log</h2>
        <div className="log">
          <table>
            <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Detail</th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="small muted">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="small">{l.user?.email || "—"}</td>
                  <td><span className="tag">{l.action}</span></td>
                  <td className="small muted">{l.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
