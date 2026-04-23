import { useEffect, useState } from 'react';
import { userAPI } from '../../services/api';
import { User, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.get('/users')
      .then((r) => setUsers(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (id, isActive) => {
    try {
      const res = await userAPI.patch(`/users/${id}`, { isActive: !isActive });
      setUsers((prev) => prev.map((u) => (u._id === id ? res.data.data : u)));
      toast.success('User status updated');
    } catch {
      toast.error('Failed to update user');
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold mb-8">Manage Users</h1>
        <div className="card p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  {['User', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Action'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-gray-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-500">Loading...</td></tr>
                ) : users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          {user.role === 'admin'
                            ? <Shield className="w-4 h-4 text-primary-light" />
                            : <User className="w-4 h-4 text-gray-400" />}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{user.email}</td>
                    <td className="py-3 px-4 text-gray-400">{user.phone || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => toggleActive(user._id, user.isActive)}
                          className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                            user.isActive
                              ? 'border-red-500/50 text-red-400 hover:bg-red-500/10'
                              : 'border-green-500/50 text-green-400 hover:bg-green-500/10'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && users.length === 0 && (
              <div className="text-center py-8 text-gray-500">No users found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}