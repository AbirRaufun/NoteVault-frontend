import { useEffect, useState } from "react";
import api from "../lib/api";

const PAGE_SIZE = 6;

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", body: "" });
  const [saving, setSaving] = useState(false);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const loadNotes = async (p = page) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/notes?page=${p}&limit=${PAGE_SIZE}`);
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

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", body: "" });
    setShowForm(true);
  };

  const openEdit = (note) => {
    setEditing(note);
    setForm({ title: note.title, body: note.body || "" });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ title: "", body: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/notes/${editing._id}`, form);
      } else {
        await api.post("/notes", form);
      }
      closeForm();
      await loadNotes(page);
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await api.delete(`/notes/${id}`);
      const remainingOnPage = notes.length - 1;
      if (remainingOnPage === 0 && page > 1) {
        setPage(page - 1);
      } else {
        await loadNotes(page);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
          <p className="text-gray-600 text-sm mt-1">
            {total} {total === 1 ? "note" : "notes"} total
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          + New Note
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? "Edit Note" : "New Note"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                autoFocus
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body
              </label>
              <textarea
                className="input min-h-[120px] resize-y"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
              <button type="button" onClick={closeForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-gray-600">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No notes yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first note to get started.
          </p>
          <button onClick={openCreate} className="btn-primary">
            + New Note
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note._id}
                className="card p-5 flex flex-col hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-2 break-words">
                  {note.title}
                </h3>
                <p className="text-sm text-gray-600 flex-1 mb-3 line-clamp-3 break-words">
                  {note.body || <span className="italic text-gray-400">No body</span>}
                </p>
                <div className="text-xs text-gray-400 mb-3">
                  {new Date(note.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(note)}
                    className="btn-secondary text-sm flex-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="btn-danger text-sm flex-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="btn-secondary text-sm"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="btn-secondary text-sm"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}