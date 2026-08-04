import { useEffect, useRef, useState } from "react";
import { api } from "../api";

interface List {
  id: string;
  name: string;
  count: number;
  createdAt: string;
}

export default function Leads() {
  const [lists, setLists] = useState<List[]>([]);
  const [msg, setMsg] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => api.get("/leads/lists").then((d) => setLists(d.lists));
  useEffect(() => {
    load();
  }, []);

  const doImport = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await api.upload("/leads/import", form);
      setMsg(r);
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (e: any) {
      setMsg({ error: e.message });
    } finally {
      setBusy(false);
    }
  };

  const enrich = async (id: string, mode: "stub" | "chromium") => {
    setBusy(true);
    try {
      const r = await api.post(`/enrichment/lists/${id}`, { mode });
      alert(`Enriched ${r.enriched} leads via ${r.mode}.`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const view = async (id: string) => {
    const d = await api.get(`/leads/lists/${id}`);
    setPreview(d);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this list and its leads?")) return;
    await api.del(`/leads/lists/${id}`);
    setPreview(null);
    load();
  };

  return (
    <div>
      <h1>Leads</h1>
      <p className="muted">Import TXT, CSV, TSV or XLSX. Columns like email, first name, company are auto-detected; anything else becomes a custom merge field.</p>

      <div className="card">
        <h2>Import a file</h2>
        <input ref={fileRef} type="file" accept=".txt,.csv,.tsv,.xlsx,.xls" />
        <div style={{ marginTop: 12 }}>
          <button onClick={doImport} disabled={busy}>{busy ? "Importing…" : "Import"}</button>
        </div>
        {msg && !msg.error && (
          <div className="alert good">
            Imported <strong>{msg.imported}</strong> leads into “{msg.list.name}”.
            {msg.skipped ? ` Skipped ${msg.skipped} invalid/duplicate.` : ""}
            {msg.suppressed ? ` ${msg.suppressed} on suppression list.` : ""}
          </div>
        )}
        {msg?.error && <div className="alert bad">{msg.error}</div>}
      </div>

      <div className="card">
        <h2>Your lists</h2>
        {lists.length === 0 && <p className="muted">No lists yet.</p>}
        {lists.length > 0 && (
          <table>
            <thead><tr><th>Name</th><th>Leads</th><th>Enrich</th><th></th></tr></thead>
            <tbody>
              {lists.map((l) => (
                <tr key={l.id}>
                  <td>{l.name}</td>
                  <td>{l.count}</td>
                  <td>
                    <button className="ghost sm" disabled={busy} onClick={() => enrich(l.id, "stub")}>Quick</button>{" "}
                    <button className="ghost sm" disabled={busy} onClick={() => enrich(l.id, "chromium")}>Chromium</button>
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button className="ghost sm" onClick={() => view(l.id)}>View</button>{" "}
                    <button className="danger sm" onClick={() => del(l.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {preview && (
        <div className="card">
          <div className="flex-between">
            <h2>{preview.list.name} — sample</h2>
            <button className="ghost sm" onClick={() => setPreview(null)}>Close</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr><th>Email</th><th>First</th><th>Last</th><th>Company</th><th>Title</th></tr></thead>
              <tbody>
                {preview.leads.slice(0, 50).map((l: any) => (
                  <tr key={l.id}>
                    <td>{l.email}</td><td>{l.firstName}</td><td>{l.lastName}</td>
                    <td>{l.company}</td><td>{l.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
