import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Package, User, Calendar, FileText, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { ordersApi } from '../utils/api'
import { PageLoader } from '../components/ui/Spinner'

const statusColors = {
  pending: 'bg-amber-900/30 text-amber-400 border-amber-900/30',
  completed: 'bg-emerald-900/30 text-emerald-400 border-emerald-900/30',
  cancelled: 'bg-red-900/30 text-red-400 border-red-900/30',
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersApi.getById(id)
      .then(setOrder)
      .catch(e => { toast.error(e.message); navigate('/orders') })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageLoader />
  if (!order) return null

  return (
    <div className="max-w-3xl space-y-5 fade-in">
      <div className="flex items-center gap-3">
        <Link to="/orders" className="text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Order #{order.id}</h2>
          <p className="text-slate-500 text-sm">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <span className={`badge border ml-auto ${statusColors[order.status] || 'bg-slate-800 text-slate-400'}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Info */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-indigo-400" />
            <h3 className="font-semibold text-slate-200">Customer</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div><span className="text-slate-500">Name</span><span className="text-slate-200 ml-2 font-medium">{order.customer?.name}</span></div>
            <div><span className="text-slate-500">Email</span><span className="text-slate-300 ml-2">{order.customer?.email}</span></div>
            {order.customer?.phone && <div><span className="text-slate-500">Phone</span><span className="text-slate-300 ml-2">{order.customer.phone}</span></div>}
          </div>
        </div>

        {/* Order Summary */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} className="text-emerald-400" />
            <h3 className="font-semibold text-slate-200">Summary</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Order ID</span><span className="font-mono text-indigo-400">#{order.id}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Items</span><span className="text-slate-300">{order.items?.length}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Status</span>
              <span className={`badge border text-xs ${statusColors[order.status]}`}>{order.status}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800/50">
              <span className="text-slate-400 font-medium">Total</span>
              <span className="font-bold font-mono text-emerald-400 text-base">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart size={16} className="text-sky-400" />
          <h3 className="font-semibold text-slate-200">Order Items</h3>
        </div>
        <div className="space-y-3">
          {order.items?.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center">
                  <Package size={14} className="text-slate-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-200">{item.product?.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{item.product?.sku}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-300">{item.quantity} × <span className="font-mono">${item.unit_price.toFixed(2)}</span></div>
                <div className="text-sm font-mono font-semibold text-emerald-400">${item.subtotal.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>

        {order.notes && (
          <div className="mt-4 p-3 rounded-xl bg-slate-800/20 border border-slate-800/50">
            <span className="text-xs text-slate-500 block mb-1">Notes</span>
            <p className="text-sm text-slate-400">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
