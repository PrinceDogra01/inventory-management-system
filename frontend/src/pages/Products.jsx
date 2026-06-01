import { useState, useEffect } from 'react'
import { Package, Plus, Pencil, Trash2, Search, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { productsApi } from '../utils/api'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { PageLoader } from '../components/ui/Spinner'

const initialForm = { name: '', sku: '', description: '', price: '', quantity: '' }

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
   productsApi.getAll()
  .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditProduct(null)
    setForm(initialForm)
    setShowForm(true)
  }

  const openEdit = (p) => {
    setEditProduct(p)
    setForm({ name: p.name, sku: p.sku, description: p.description || '', price: p.price, quantity: p.quantity })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) }
      if (editProduct) {
        await productsApi.update(editProduct.id, data)
        toast.success('Product updated!')
      } else {
        await productsApi.create(data)
        toast.success('Product created!')
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
      await productsApi.delete(deleteTarget.id)
      toast.success('Product deleted')
      setDeleteTarget(null)
      load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-100">Products</h2>
          <p className="text-slate-500 text-sm">{products.length} total products</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input-field pl-9 py-2 text-sm w-56"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? <PageLoader /> : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Package}
            title="No products found"
            description={search ? "Try a different search term" : "Add your first product to get started"}
            action={!search && <button className="btn-primary" onClick={openCreate}><Plus size={16} />Add Product</button>}
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-800/50 bg-slate-900/50">
                <tr>
                  <th className="table-header">Product</th>
                  <th className="table-header">SKU</th>
                  <th className="table-header">Price</th>
                  <th className="table-header">Stock</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell">
                      <div className="font-medium text-slate-200">{p.name}</div>
                      {p.description && <div className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{p.description}</div>}
                    </td>
                    <td className="table-cell">
                      <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded-lg text-slate-400">{p.sku}</span>
                    </td>
                    <td className="table-cell">
                      <span className="font-mono text-emerald-400">${p.price.toFixed(2)}</span>
                    </td>
                    <td className="table-cell">
                      <span className="font-mono">{p.quantity}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge border text-xs ${
                        p.quantity === 0 ? 'bg-red-900/30 text-red-400 border-red-900/30' :
                        p.quantity <= 10 ? 'bg-amber-900/30 text-amber-400 border-amber-900/30' :
                        'bg-emerald-900/30 text-emerald-400 border-emerald-900/30'
                      }`}>
                        {p.quantity === 0 ? 'Out of Stock' : p.quantity <= 10 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="btn-success py-1.5 px-2.5 text-xs" onClick={() => openEdit(p)}>
                          <Pencil size={13} /> Edit
                        </button>
                        <button className="btn-danger py-1.5 px-2.5 text-xs" onClick={() => setDeleteTarget(p)}>
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editProduct ? 'Edit Product' : 'Add Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Product Name *</label>
              <input className="input-field" placeholder="e.g. Wireless Headphones" required
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">SKU *</label>
              <input className="input-field font-mono" placeholder="e.g. WH-001" required
                value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
            </div>
            <div>
              <label className="label">Price *</label>
              <input className="input-field" type="number" step="0.01" min="0" placeholder="0.00" required
                value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div>
              <label className="label">Quantity *</label>
              <input className="input-field" type="number" min="0" placeholder="0" required
                value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea className="input-field resize-none" rows={2} placeholder="Optional product description"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}
