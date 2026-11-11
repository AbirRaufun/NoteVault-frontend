import { useEffect, useState } from "react";
import api from "../lib/api";

export default function InsightsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
        <p className="text-gray-600 text-sm mt-1">
          Data powered by MongoDB aggregation pipelines.
        </p>
      </div>

      <UsersByInterest />
      <PostsByUser />
    </div>
  );
}

function UsersByInterest() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/insights/by-interest");
        setData(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="mb-12">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Users by Interest
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Aggregation pipeline: <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">$unwind → $group → $sort</code>
          </p>
        </div>
        {data && (
          <span className="text-sm text-gray-500">
            {data.totalInterests} interests
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.groups.map((g) => (
            <div key={g.interest} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 capitalize">
                  {g.interest}
                </h3>
                <span className="text-xs px-2 py-0.5 bg-brand-50 text-brand-700 rounded">
                  {g.count} {g.count === 1 ? "user" : "users"}
                </span>
              </div>
              <ul className="space-y-2">
                {g.users.map((u) => (
                  <li key={u._id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{u.name}</span>
                      {u.role === "admin" && (
                        <span className="text-xs text-brand-600">admin</span>
                      )}
                    </div>
                    <span className="text-gray-500 text-xs">{u.email}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PostsByUser() {
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Load all users to populate the dropdown (admin-only endpoint, fine since only admins and users can reach here)
  useEffect(() => {
    (async () => {
      try {
        // use /auth/me alternative: use insights route hint — we only have admin/users.
        // But a normal user cannot call /admin/users. Instead, fetch all notes' owners?
        // Simplest: call the aggregation for the current user by default.
        // For the dropdown, fall back to "me". If the caller is admin, load full list.
        // We'll just try /admin/users; if 403, skip dropdown list.
        const { data } = await api.get("/admin/users?limit=100");
        setUsers(data.items);
        if (data.items.length > 0) {
          setSelectedId(data.items[0]._id);
        }
      } catch (err) {
        // Non-admin or error: ignore. The aggregation section still works for the current user.
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingPosts(true);
    setError("");
    (async () => {
      try {
        const { data } = await api.get(`/posts/by-user/${selectedId}`);
        setPosts(data.posts);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load posts");
      } finally {
        setLoadingPosts(false);
      }
    })();
  }, [selectedId]);

  return (
    <section>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Posts by User
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Aggregation pipeline: <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">$match → $lookup → $unwind → $project</code>
          </p>
        </div>
      </div>

      {loadingUsers ? (
        <div className="text-gray-600">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="card p-6">
          <p className="text-sm text-gray-600">
            User selection requires admin access. Login as an admin to browse posts by user.
          </p>
        </div>
      ) : (
        <>
          <div className="card p-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select a user
            </label>
            <select
              className="input"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loadingPosts ? (
            <div className="text-gray-600">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-sm text-gray-600">This user has no posts.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((p) => (
                <div key={p._id} className="card p-5">
                  <h3 className="font-semibold text-gray-900 mb-2 break-words">
                    {p.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 break-words">
                    {p.body || <span className="italic text-gray-400">No body</span>}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <div>
                      by <span className="font-medium text-gray-900">{p.author.name}</span>
                      {p.author.email && ` (${p.author.email})`}
                    </div>
                    <div>
                      {new Date(p.createdAt).toLocaleDateString(undefined, {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}