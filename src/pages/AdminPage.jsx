import { useEffect, useState } from "react";
import api from "../lib/api";

const PAGE_SIZE = 10;

export default function AdminPage() {
  const [tab, setTab] = useState("users");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 text-sm mt-1">
          Manage users and view all notes in the system.
        </p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1">
          <TabButton active={tab === "users"} onClick={() => setTab("users")}>
            Users
          </TabButton>
          <TabButton active={tab === "notes"} onClick={() => setTab("notes")}>
            All Notes
          </TabButton>
        </div>
      </div>

      {tab === "users" && <UsersTab />}
      {tab === "notes" && <AllNotesTab />}
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active
          ? "border-brand-600 text-brand-700"
          : "border-transparent text-gray-600 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user", interests: "" });
  const [saving, setSaving] = useState(false);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const loadUsers = async (p = page) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/admin/users?page=${p}&limit=${PAGE_SIZE}`);
      setUsers(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const openCreate = () => {
    setForm({ name: "", email: "", password: "", role: "user", interests: "" });
    setShowForm(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const interests = form.interests.split(",").map((s) => s.trim()).filter(Boolean);
      await api.post("/admin/users", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        interests,
      });
      setShowForm(false);
      await loadUsers(page);
    } catch (err) {
      setError(err.response?.data?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`Change this user's role to ${newRole}?`)) return;
    try {
      await api.patch(`/admin/users/${id}`, { role: newRole });
      await loadUsers(page);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}" and all their notes?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      const remaining = users.length - 1;
      if (remaining === 0 && page > 1) {
        setPage(page - 1);
      } else {
        await loadUsers(page);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">{total} total users</p>
        <button onClick={openCreate} className="btn-primary">
          + Create User
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="card p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">Create New User</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interests <span className="text-gray-400">(comma-separated)</span>
              </label>
              <input className="input" placeholder="chess, reading, coding" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Creating..." : "Create User"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-gray-600">Loading users...</div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Interests</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded ${
                          u.role === "admin"
                            ? "bg-brand-50 text-brand-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {(u.interests || []).join(", ") || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRoleChange(u._id, u.role)}
                        className="text-sm text-brand-600 hover:underline mr-3"
                      >
                        {u.role === "admin" ? "Make user" : "Make admin"}
                      </button>
                      <button
                        onClick={() => handleDelete(u._id, u.name)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page <= 1} className="btn-secondary text-sm">← Previous</button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page >= totalPages} className="btn-secondary text-sm">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AllNotesTab() {
  const [notes, setNotes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const loadNotes = async (p = page) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/admin/notes?page=${p}&limit=${PAGE_SIZE}`);
      setNotes(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">{total} total notes across all users</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <div className="text-gray-600">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-600">No notes in the system yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((n) => (
              <div key={n._id} className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-2 break-words">{n.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3 break-words">
                  {n.body || <span className="italic text-gray-400">No body</span>}
                </p>
                <div className="text-xs text-gray-500 mb-1">
                  by <span className="font-medium">{n.owner?.name || "Unknown"}</span>
                  {n.owner?.email && ` (${n.owner.email})`}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleDateString(undefined, {
                    year: "numeric", month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page <= 1} className="btn-secondary text-sm">← Previous</button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page >= totalPages} className="btn-secondary text-sm">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}