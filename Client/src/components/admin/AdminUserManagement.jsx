import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Plus, Search, GraduationCap, Users, X, Trash2, Edit2, Loader2, AlertCircle, CheckCircle2, Shield, Eye, EyeOff } from 'lucide-react';
import { clearAuth } from '../../utils/authUtils';

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  
  // Filters
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);

  // Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    title: '',
    message: '',
    type: 'info', // 'danger' or 'info'
    action: null,
    targetId: null
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/admin', { replace: true });
        return;
      }

      const response = await fetch(`/api/users${roleFilter ? `?role=${roleFilter}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401 || response.status === 403) {
        console.error('Session expired or unauthorized. Redirecting to login.');
        clearAuth();
        navigate('/admin', { replace: true });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(filteredUsers.map(u => u._id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (id) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleDeleteUser = (user) => {
    setConfirmModalConfig({
      title: 'Delete User Account',
      message: `Are you sure you want to delete ${user.fullName}? This action is permanent and cannot be undone.`,
      type: 'danger',
      action: 'delete',
      targetId: user._id
    });
    setIsConfirmModalOpen(true);
  };
  
  const handleBulkSuspend = () => {
    const count = selectedUserIds.length;
    setConfirmModalConfig({
      title: 'Update Account Access',
      message: `Are you sure you want to suspend or unsuspend the ${count} selected ${count === 1 ? 'user' : 'users'}? This will change their current account access status.`,
      type: 'danger',
      action: 'suspend'
    });
    setIsConfirmModalOpen(true);
  };

  const handleBulkResetPassword = () => {
    const count = selectedUserIds.length;
    setConfirmModalConfig({
      title: 'Reset User Password',
      message: `Are you sure you want to reset the password for the ${count} selected ${count === 1 ? 'user' : 'users'}? This will set their password to the system default.`,
      type: 'info',
      action: 'reset'
    });
    setIsConfirmModalOpen(true);
  };

  const executeConfirmedAction = async () => {
    const { action, targetId } = confirmModalConfig;
    let url = '';
    let method = '';
    let body = {};

    if (action === 'delete') {
      url = `/api/users/${targetId}`;
      method = 'DELETE';
    } else {
      url = action === 'suspend' ? '/api/users/bulk-suspend' : '/api/users/bulk-reset-password';
      method = action === 'suspend' ? 'PATCH' : 'POST';
      body = { userIds: selectedUserIds };
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: method !== 'DELETE' ? JSON.stringify(body) : undefined
      });

      if (response.status === 401 || response.status === 403) {
        clearAuth();
        navigate('/admin', { replace: true });
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Action failed');
      }
      
      let successMsg = '';
      if (action === 'delete') {
        successMsg = 'User deleted successfully';
      } else if (action === 'suspend') {
        successMsg = `Successfully updated ${selectedUserIds.length} ${selectedUserIds.length === 1 ? 'user' : 'users'}`;
      } else {
        successMsg = `Reset password for ${selectedUserIds.length} ${selectedUserIds.length === 1 ? 'user' : 'users'}`;
      }
      
      setSuccess(successMsg);
      if (action !== 'delete') setSelectedUserIds([]);
      setIsConfirmModalOpen(false);
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };
  const handleExportUsers = () => {
    if (filteredUsers.length === 0) return;

    // Define CSV Headers
    const headers = ['Full Name', 'Email', 'Role', 'Status', 'Suspended', 'Member Since'];
    
    // Convert users to CSV rows
    const rows = filteredUsers.map(user => [
      user.fullName,
      user.email,
      user.role,
      user.isVerified ? 'Verified' : 'Pending',
      user.isSuspended ? 'Yes' : 'No',
      new Date(user.createdAt).toLocaleDateString()
    ]);

    // Construct CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `SSC_Users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSuccess('Exported users to CSV successfully');
    setTimeout(() => setSuccess(null), 3000);
  };


  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500 mt-1">Audit, modify, and manage authentication for all registered users.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportUsers}
            disabled={filteredUsers.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 shadow-sm transition-all focus:ring-2 focus:ring-gray-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--dash-accent)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--dash-accent-strong)] shadow-sm transition-all focus:ring-2 focus:ring-[var(--dash-accent-soft)] outline-none"
          >
            <Plus className="w-4 h-4" /> New User
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-rose-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-sm font-medium">{success}</p>
          <button onClick={() => setSuccess(null)} className="ml-auto p-1 hover:bg-emerald-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col items-center text-center relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
           <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/40 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
           <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full mb-3 relative z-10">
              <Users className="w-6 h-6" />
           </div>
           <p className="text-sm text-gray-500 mb-1 relative z-10">Total Users</p>
           <div className="flex items-baseline gap-2 relative z-10">
              <span className="text-3xl font-extrabold text-gray-900">{loading ? '...' : users.length}</span>
           </div>
        </div>

        {/* Students Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col items-center text-center relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
           <div className="p-2.5 bg-teal-50 text-teal-600 rounded-full mb-3">
              <GraduationCap className="w-6 h-6" />
           </div>
           <p className="text-sm text-gray-500 mb-1">Students</p>
           <div className="flex items-center justify-center">
              <span className="text-3xl font-extrabold text-gray-900">
                {loading ? '...' : users.filter(u => u.role === 'student').length}
              </span>
           </div>
        </div>

        {/* Lecturers Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col items-center text-center relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
           <div className="p-2.5 bg-amber-50 text-amber-600 rounded-full mb-3">
              <Users className="w-6 h-6" />
           </div>
           <p className="text-sm text-gray-500 mb-1">Lecturers</p>
           <div className="flex items-center justify-center">
             <span className="text-3xl font-extrabold text-gray-900">
               {loading ? '...' : users.filter(u => u.role === 'lecturer').length}
             </span>
           </div>
        </div>

        {/* Verified Users Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col items-center text-center relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-full mb-3">
               <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Verified Users</p>
            <div className="flex items-center justify-center">
              <span className="text-3xl font-extrabold text-emerald-600">
                {loading ? '...' : users.filter(u => u.isVerified).length}
              </span>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
         <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/30">
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
               <select 
                 value={roleFilter}
                 onChange={(e) => setRoleFilter(e.target.value)}
                 className="w-full sm:w-auto text-sm font-medium border border-gray-200 text-gray-700 rounded-xl py-2 px-3 bg-white hover:bg-gray-50 cursor-pointer outline-none focus:ring-2 focus:ring-[var(--dash-accent-soft)] focus:border-[var(--dash-accent)] transition-all shadow-sm"
               >
                  <option value="">All Roles</option>
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="admin">Admin</option>
               </select>

               <div className="relative w-full sm:w-auto text-sm shadow-sm rounded-xl">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                 <input 
                   type="text"
                   placeholder="Search users..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--dash-accent-soft)] focus:border-[var(--dash-accent)] outline-none transition-all placeholder:text-gray-400"
                 />
               </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:inline-block">Bulk Actions:</span>
               <button 
                 onClick={handleBulkSuspend}
                 disabled={selectedUserIds.length === 0 || loading}
                 className="text-xs font-bold px-3 py-1.5 rounded-lg text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all outline-none"
               >
                 Suspend
               </button>
               <button 
                 onClick={handleBulkResetPassword}
                 disabled={selectedUserIds.length === 0 || loading}
                 className="text-xs font-bold px-3 py-1.5 rounded-lg text-[var(--dash-accent-strong)] bg-[var(--dash-accent-soft)] border border-[var(--dash-accent-soft)] hover:bg-[var(--dash-accent-soft)]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all outline-none"
               >
                 Reset Password
               </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead>
                  <tr className="text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-50 bg-gray-50/50">
                     <th className="px-6 py-4 font-bold w-12 text-center">
                        <input 
                          type="checkbox" 
                          checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-[var(--dash-accent)] focus:ring-[var(--dash-accent)] cursor-pointer transition-all" 
                        />
                     </th>
                     <th className="px-6 py-4 font-bold">Name</th>
                     <th className="px-6 py-4 font-bold text-center">Role</th>
                     <th className="px-6 py-4 font-bold">Status</th>
                     <th className="px-6 py-4 font-bold">Member Since</th>
                     <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 text-[var(--dash-accent)] animate-spin" />
                          <p className="text-sm text-gray-500 font-medium">Loading users...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="w-8 h-8 text-gray-300" />
                          <p className="text-sm text-gray-500 font-medium">No users found</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 text-center">
                           <input 
                             type="checkbox" 
                             checked={selectedUserIds.includes(user._id)}
                             onChange={() => handleSelectUser(user._id)}
                             className={`w-4 h-4 rounded border-gray-300 text-[var(--dash-accent)] focus:ring-[var(--dash-accent)] cursor-pointer transition-all ${selectedUserIds.includes(user._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} 
                           />
                        </td>
                        <td className="px-6 py-4 flex items-center gap-4">
                           {user.profilePicture ? (
                              <img src={user.profilePicture} alt={user.fullName} className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
                           ) : (
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-[var(--dash-accent-soft)] text-[var(--dash-accent-strong)] border border-[var(--dash-accent-soft)] shadow-sm">
                                 {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                              </div>
                           )}
                           <div>
                              <p className="text-sm font-bold text-gray-900 group-hover:text-[var(--dash-accent)] transition-colors">{user.fullName}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold capitalize ${
                             user.role === 'admin' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                             user.role === 'lecturer' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                             'bg-[var(--dash-accent-soft)] text-[var(--dash-accent-strong)] border border-[var(--dash-accent-soft)]'
                           }`}>
                              {user.role === 'student' && <GraduationCap className="w-3.5 h-3.5" />}
                              {user.role === 'lecturer' && <Users className="w-3.5 h-3.5" />}
                              {user.role === 'admin' && <Shield className="w-3.5 h-3.5" />}
                              {user.role}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1.5">
                             <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wide uppercase w-fit ${
                               user.isVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                             }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${user.isVerified ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></span>
                                {user.isVerified ? 'Verified' : 'Pending'}
                             </span>
                             {user.isSuspended && (
                               <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wide uppercase bg-rose-50 text-rose-700 border border-rose-100 w-fit">
                                 <X className="w-1.5 h-1.5" />
                                 Suspended
                               </span>
                             )}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                          {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2">
                             <button 
                                onClick={() => handleOpenEditModal(user)}
                                className="p-2 text-gray-400 hover:text-[var(--dash-accent)] hover:bg-[var(--dash-accent-soft)] rounded-lg transition-colors ring-1 ring-transparent hover:ring-[var(--dash-accent-soft)] outline-none"
                             >
                                <Edit2 className="w-4 h-4" />
                             </button>
                             <button 
                                onClick={() => handleDeleteUser(user)}
                                className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors ring-1 ring-transparent hover:ring-rose-100 outline-none"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                        </td>
                      </tr>
                    ))}
               </tbody>
            </table>
         </div>

         <div className="p-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
            <p>Showing {Math.min(filteredUsers.length, 1)} to {filteredUsers.length} of {users.length} users</p>
         </div>
      </div>

      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        mode={modalMode}
        onSuccess={(msg) => {
          setSuccess(msg);
          fetchUsers();
          setTimeout(() => setSuccess(null), 3000);
        }}
      />

      <ActionConfirmModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={executeConfirmedAction}
        config={confirmModalConfig}
        loading={loading}
      />
    </div>
  );
}

function UserModal({ isOpen, onClose, user, mode, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student',
    isVerified: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const calculateStrength = (pass) => {
    if (!pass) return { score: 0, text: '', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length > 5) score += 1;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, text: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score, text: 'Good', color: 'bg-amber-500' };
    return { score, text: 'Strong', color: 'bg-emerald-500' };
  };

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        password: '', 
        role: user.role || 'student',
        isVerified: user.isVerified || false
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        password: '',
        role: 'student',
        isVerified: false
      });
    }
    setErrors({});
    setServerError(null);
  }, [user, mode, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
      newErrors.fullName = 'Full name can only contain letters and spaces';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (mode === 'add') {
      if (!formData.password) {
        newErrors.password = 'Password is required for new users';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters long';
      }
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError(null);

    try {
      const token = localStorage.getItem('token');
      const url = mode === 'edit' ? `/api/users/${user._id}` : '/api/users';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const payload = { ...formData };
      if (mode === 'edit' && !payload.password) {
        delete payload.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      onSuccess(mode === 'edit' ? 'User updated successfully' : 'User created successfully');
      onClose();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{mode === 'edit' ? 'Edit User' : 'Add New User'}</h3>
            <p className="text-xs text-gray-500 mt-1">{mode === 'edit' ? 'Update account details' : 'Create a new system account'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {serverError && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {serverError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // Allow only letters and spaces
                setFormData({ ...formData, fullName: value });
                if (errors.fullName) setErrors({ ...errors, fullName: null });
              }}
              className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.fullName ? 'border-rose-500 bg-rose-50/30' : 'border-gray-200'} rounded-xl text-sm focus:ring-2 focus:ring-[var(--dash-accent-soft)] focus:border-[var(--dash-accent)] transition-all outline-none`}
              placeholder="Enter full name"
            />
            {errors.fullName && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.fullName}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.email ? 'border-rose-500 bg-rose-50/30' : 'border-gray-200'} rounded-xl text-sm focus:ring-2 focus:ring-[var(--dash-accent-soft)] focus:border-[var(--dash-accent)] transition-all outline-none`}
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                {mode === 'edit' ? 'New Password (Optional)' : 'Password'}
              </label>
              {formData.password && (
                 <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    calculateStrength(formData.password).text === 'Weak' ? 'text-rose-500' :
                    calculateStrength(formData.password).text === 'Good' ? 'text-amber-500' :
                    'text-emerald-500'
                 }`}>
                    {calculateStrength(formData.password).text}
                 </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                className={`w-full px-4 pr-10 py-2.5 bg-gray-50 border ${errors.password ? 'border-rose-500 bg-rose-50/30' : 'border-gray-200'} rounded-xl text-sm focus:ring-2 focus:ring-[var(--dash-accent-soft)] focus:border-[var(--dash-accent)] transition-all outline-none`}
                placeholder={mode === 'edit' ? "Leave blank to keep current password" : "••••••••"}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Strength Meter */}
            {formData.password && (
              <div className="flex gap-1 h-1.5 mt-2 px-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div 
                    key={level} 
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      level <= calculateStrength(formData.password).score 
                        ? calculateStrength(formData.password).color 
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            )}
            {errors.password && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.password}</p>}
          </div>

          <div className={mode === 'edit' ? "grid grid-cols-2 gap-4" : "block"}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[var(--dash-accent-soft)] focus:border-[var(--dash-accent)] transition-all outline-none appearance-none"
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {mode === 'edit' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
                <select
                  value={formData.isVerified}
                  onChange={(e) => setFormData({ ...formData, isVerified: e.target.value === 'true' })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[var(--dash-accent-soft)] focus:border-[var(--dash-accent)] transition-all outline-none appearance-none"
                >
                  <option value="true">Verified</option>
                  <option value= "false">Unverified</option>
                </select>
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="flex-1 px-4 py-2.5 bg-[var(--dash-accent)] text-white text-sm font-bold rounded-xl hover:bg-[var(--dash-accent-strong)] shadow-lg shadow-[var(--dash-accent-soft)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'edit' ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ActionConfirmModal({ isOpen, onClose, onConfirm, config, loading }) {
  if (!isOpen) return null;

  const isDanger = config.type === 'danger';
  const isDelete = config.action === 'delete';
  const confirmColor = isDanger 
    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100' 
    : 'bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-strong)] shadow-[var(--dash-accent-soft)]';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 text-center">
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${isDanger ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-[var(--dash-accent)]'}`}>
            {isDelete ? <Trash2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{config.title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed px-2">
            {config.message}
          </p>
        </div>

        <div className="p-4 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${confirmColor}`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isDelete ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
