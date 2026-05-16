import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import FormField from '../components/FormField';
import Icon from '../components/Icon';
import { btnPrimary, btnSecondary, inputStyle } from '../styles';
import { fmtDate, fmtDateTime } from '../helpers';

function getInitials(name, email) {
  if (name && name.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  return (email || '?').slice(0, 2).toUpperCase();
}

function RolePill({ role }) {
  const admin = role === 'admin';
  return (
    <span
      style={{
        background: admin ? 'var(--c-primary-soft)' : 'var(--c-surface-alt)',
        color: admin ? 'var(--c-primary)' : 'var(--c-text-muted)',
        border: `1px solid ${admin ? '#c8d8cc' : 'var(--c-border)'}`,
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'capitalize',
      }}
    >
      {role}
    </span>
  );
}

const linkBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 12.5,
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '4px 6px',
};

export default function Users() {
  const { users, movements, updateProfile, loading } = useData();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ full_name: '', employee_number: '', role: 'staff' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const editingUser = users.find((u) => u.id === editId);
  const editingSelf = editId && profile && editId === profile.id;

  function startEdit(u) {
    setEditId(u.id);
    setForm({
      full_name: u.full_name || '',
      employee_number: u.employee_number || '',
      role: u.role || 'staff',
    });
    setErrors({});
  }

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.full_name.trim()) {
      setErrors({ full_name: 'Name is required' });
      return;
    }
    setSaving(true);
    const { error } = await updateProfile(editId, {
      full_name: form.full_name.trim(),
      employee_number: form.employee_number.trim() || null,
      role: form.role,
    });
    setSaving(false);
    if (error) {
      showToast(error.message, 'error');
      return;
    }
    showToast('User updated', 'success');
    setEditId(null);
  }

  const admins = users.filter((u) => u.role === 'admin').length;
  const staffCount = users.filter((u) => u.role === 'staff').length;

  return (
    <div className="fade-in">
      <PageHeader title="Users" subtitle="Manage staff accounts and view their activity" />

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard label="Total Accounts" value={users.length} icon="users" />
        <StatCard label="Admins" value={admins} accent="var(--c-primary)" icon="check" />
        <StatCard label="Staff" value={staffCount} accent="var(--c-accent)" icon="users" />
      </div>

      {editingUser && (
        <div
          style={{
            background: 'var(--c-surface)',
            borderRadius: 'var(--r-lg)',
            border: '1px solid var(--c-border)',
            padding: 20,
            marginBottom: 20,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Edit user
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--c-text-muted)', marginBottom: 16 }}>
            {editingUser.email}{' '}
            <span style={{ color: 'var(--c-text-soft)' }}>
              · email &amp; password are changed from the Supabase dashboard
            </span>
          </div>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <FormField label="Full name *" error={errors.full_name}>
                <input
                  value={form.full_name}
                  onChange={(e) => set('full_name', e.target.value)}
                  style={inputStyle}
                />
              </FormField>
              <FormField label="Employee number">
                <input
                  value={form.employee_number}
                  onChange={(e) => set('employee_number', e.target.value)}
                  placeholder="e.g. 23221012"
                  style={inputStyle}
                />
              </FormField>
              <FormField
                label="Role"
                hint={editingSelf ? "You can't change your own role" : undefined}
              >
                <select
                  value={form.role}
                  onChange={(e) => set('role', e.target.value)}
                  disabled={editingSelf}
                  style={{ ...inputStyle, opacity: editingSelf ? 0.6 : 1 }}
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </FormField>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn-primary" disabled={saving} style={btnPrimary}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={btnSecondary}
                onClick={() => setEditId(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <Table
        columns={[
          { key: 'user', label: 'User' },
          { key: 'employee', label: 'Employee #' },
          { key: 'role', label: 'Role' },
          { key: 'lastLogin', label: 'Last login' },
          { key: 'joined', label: 'Joined' },
          { key: 'activity', label: 'Movements', right: true },
          { key: 'actions', label: '' },
        ]}
        rows={users.map((u) => {
          const count = movements.filter((m) => m.user_id === u.id).length;
          return {
            user: (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: u.role === 'admin' ? 'var(--c-primary)' : 'var(--c-accent)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 12,
                    fontFamily: 'var(--font-head)',
                    flexShrink: 0,
                  }}
                >
                  {getInitials(u.full_name, u.email)}
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>{u.full_name || '—'}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--c-text-muted)' }}>{u.email}</div>
                </div>
              </div>
            ),
            employee: (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                {u.employee_number || <span style={{ color: 'var(--c-text-soft)' }}>—</span>}
              </span>
            ),
            role: <RolePill role={u.role} />,
            lastLogin: u.last_login ? (
              <span style={{ fontSize: 12.5, color: 'var(--c-text-muted)' }}>
                {fmtDateTime(u.last_login)}
              </span>
            ) : (
              <span style={{ fontSize: 12.5, color: 'var(--c-text-soft)' }}>Never</span>
            ),
            joined: (
              <span style={{ fontSize: 12.5, color: 'var(--c-text-muted)' }}>
                {fmtDate(u.created_at)}
              </span>
            ),
            activity: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{count}</span>,
            actions: (
              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => startEdit(u)}
                  style={{ ...linkBtn, color: 'var(--c-primary)' }}
                >
                  <Icon name="edit" size={13} /> Edit
                </button>
                <button
                  onClick={() => navigate('/reports', { state: { staffId: u.id } })}
                  style={{ ...linkBtn, color: 'var(--c-text-muted)' }}
                >
                  <Icon name="report" size={13} /> Activity
                </button>
              </div>
            ),
          };
        })}
        emptyMsg={loading ? 'Loading…' : 'No users found'}
      />
    </div>
  );
}
