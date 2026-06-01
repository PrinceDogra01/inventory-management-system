import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Trash2, Eye, X, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ordersApi, customersApi, productsApi } from '../utils/api'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { PageLoader } from '../components/ui/Spinner'

const statusColors = {
  pending: 'bg-amber-900/30 text-amber-400 border-amber-900/30',
  completed: 'bg-emerald-900/30 text-emerald-400 border-emerald-900/30',
  cancelled: 'bg-red-900/30 text-red-400 border-red-900/30',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  // Order form state
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }])
  const [notes, setNotes] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([ordersApi.getAll(), customersApi.getAll(), productsApi.getAll()])
      .then(([o, c, p]) => { setOrders(o); setCustomers(c); setProducts(p) })
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setSelectedCustomer('')
    setOrderItems([{ product_id: '', quantity: 1 }])
    setNotes('')
    setShowForm(true)
  }

  const addItem = () => setOrderItems(prev => [...prev, { product_id: '', quantity: 1 }])
  const removeItem = (i) => setOrderItems(prev => prev.filter((_, idx) => idx !== i))
  const updateItem = (i, key, val) => setOrderItems(prev => prev.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  const calcTotal = () => {
    return orderItems.reduce((sum, item) => {
      const p = products.find(p => p.id === parseInt(item.product_id))
      return sum + (p ? p.price * (parseInt(item.quantity) || 0) : 0)
    }, 0)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!selectedCustomer) return toast.error('Select a customer')
    const validItems = orderItems.filter(i => i.product_id && i.quantity > 0)
    if (!validItems.length) return toast.error('Add at least one product')

    setSaving(true)
    try {
      await ordersApi.create({
        customer_id: parseInt(selectedCustomer),
        items: validItems.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })),
        notes: notes || null
      })
      toast.success('Order created!')
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
      await ordersApi.delete(deleteTarget.id)
      toast.success('Order cancelled')
      setDeleteTarget(null)
      load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = orders.filter(o =>
    `#${o.id}`.includes(search) ||
    o.customer?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-100">Orders</h2>
          <p className="text-slate-500 text-sm">{orders.length} total orders</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input-field pl-9 py-2 text-sm w-56"
              placeholder="Search orders..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> New Order
          </button>
        </div>
      </div>

      {loading ? <PageLoader /> : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ShoppingCart}
            title="No orders yet"
            description={search ? "Try different search" : "Create your first order"}
            action={!search && <button className="btn-primary" onClick={openCreate}><Plus size={16} />New Order</button>}
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-800/50 bg-slate-900/50">
                <tr>
                  <th className="table-header">Order ID</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Items</th>
                  <th className="table-header">Total</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Date</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="table-row">
                    <td className="table-cell">
                      <span className="font-mono font-medium text-indigo-400">#{o.id}</span>
                    </td>
                    <td className="table-cell">
                      <span className="font-medium text-slate-200">{o.customer?.name}</span>
                    </td>
                    <td className="table-cell">
                      <span className="text-slate-400">{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</span>
                    </td>
                    <td className="table-cell">
                      <span className="font-mono text-emerald-400">${o.total_amount.toFixed(2)}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge border text-xs ${statusColors[o.status] || 'bg-slate-800 text-slate-400'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="table-cell text-slate-500 text-xs">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/orders/${o.id}`} className="btn-success py-1.5 px-2.5 text-xs">
                          <Eye size={13} /> View
                        </Link>
                        <button className="btn-danger py-1.5 px-2.5 text-xs" onClick={() => setDeleteTarget(o)}>
                          <Trash2 size={13} /> Cancel
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

      {/* Create Order Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create New Order" size="lg">
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="label">Customer *</label>
            <select className="input-field" required value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
              <option value="">Select a customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Order Items *</label>
              <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1" onClick={addItem}>
                <Plus size={13} /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {orderItems.map((item, i) => {
                const prod = products.find(p => p.id === parseInt(item.product_id))
                return (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                    <div className="flex-1">
                      <select className="input-field text-sm py-2" value={item.product_id}
                        onChange={e => updateItem(i, 'product_id', e.target.value)}>
                        <option value="">Select product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                            {p.name} (${p.price.toFixed(2)}) — {p.quantity} in stock
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-20">
                      <input className="input-field text-sm py-2 text-center" type="number" min="1"
                        max={prod?.quantity || 9999} placeholder="Qty"
                        value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
                    </div>
                    <div className="w-20 text-right">
                      {prod && <span className="text-xs font-mono text-emerald-400">${(prod.price * (parseInt(item.quantity) || 0)).toFixed(2)}</span>}
                    </div>
                    {orderItems.length > 1 && (
                      <button type="button" className="text-slate-600 hover:text-red-400 transition-colors" onClick={() => removeItem(i)}>
                        <X size={16} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input-field resize-none" rows={2} placeholder="Optional order notes..."
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
            <span className="text-slate-400 font-medium">Estimated Total</span>
            <span className="text-xl font-bold font-mono text-emerald-400">${calcTotal().toFixed(2)}</span>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Cancel Order"
        message={`Cancel Order #${deleteTarget?.id}? Stock will be restored.`}
      />
    </div>
  )
}
