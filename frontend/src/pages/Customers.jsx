import { useState, useEffect } from 'react'
import { Users, Plus, Trash2, Search, Mail, Phone, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import { customersApi } from '../utils/api'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { PageLoader } from '../components/ui/Spinner'

const initialForm = { name: '', email: '', phone: '', address: '' }

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editCustomer, setEditCustomer] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    customersApi.getAll()
  .then(data => setCustomers(Array.isArray(data) ? data : []))
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditCustomer(null)
    setForm(initialForm)
    setShowForm(true)
  }

  const openEdit = (c) => {
    setEditCustomer(c)
    setForm({ name: c.name, email: c.email, phone: c.phone || '', address: c.address || '' })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editCustomer) {
        await customersApi.update(editCustomer.id, form)
        toast.success('Customer updated!')
      } else {
        await customersApi.create(form)
        toast.success('Customer created!')
      }
      setShowForm(false)
      load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await customersApi.delete(deleteTarget.id)
      toast.success('Customer deleted')
      setDeleteTarget(null)
      load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-100">Customers</h2>
          <p className="text-slate-500 text-sm">{customers.length} registered customers</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input-field pl-9 py-2 text-sm w-56"
              placeholder="Search customers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>

      {loading ? <PageLoader /> : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title="No customers found"
            description={search ? "Try a different search" : "Add your first customer to get started"}
            action={!search && <button className="btn-primary" onClick={openCreate}><Plus size={16} />Add Customer</button>}
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-800/50 bg-slate-900/50">
                <tr>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header">Address</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-900/50 border border-indigo-800/50 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-indigo-400">
                            {c.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-slate-200">{c.name}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Mail size={13} className="text-slate-600" />
                        {c.email}
                      </div>
                    </td>
                    <td className="table-cell">
                      {c.phone ? (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Phone size={13} className="text-slate-600" />
                          {c.phone}
                        </div>
                      ) : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="table-cell">
                      <span className="text-slate-500 text-xs truncate max-w-[140px] block">
                        {c.address || '—'}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="btn-success py-1.5 px-2.5 text-xs" onClick={() => openEdit(c)}>
                          <Pencil size={13} /> Edit
                        </button>
                        <button className="btn-danger py-1.5 px-2.5 text-xs" onClick={() => setDeleteTarget(c)}>
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editCustomer ? 'Edit Customer' : 'Add Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input className="input-field" placeholder="John Doe" required
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Email Address *</label>
            <input className="input-field" type="email" placeholder="john@example.com" required
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input className="input-field" placeholder="+1 (555) 000-0000"
              value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label className="label">Address</label>
            <textarea className="input-field resize-none" rows={2} placeholder="123 Main St, City, State"
              value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editCustomer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Customer"
        message={`Delete "${deleteTarget?.name}"? This will also delete all their orders.`}
      />
    </div>
  )
}
