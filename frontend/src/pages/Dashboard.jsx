import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Users, ShoppingCart, AlertTriangle, TrendingUp, ArrowRight, Clock } from 'lucide-react'
import { dashboardApi } from '../utils/api'
import { PageLoader } from '../components/ui/Spinner'

const StatCard = ({ icon: Icon, label, value, color, bgColor, borderColor, to }) => (
  <Link to={to} className={`card p-5 hover:border-${borderColor} transition-all duration-200 group cursor-pointer`}>
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl ${bgColor} border ${borderColor} flex items-center justify-center`}>
        <Icon size={18} className={color} />
      </div>
      <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
    </div>
    <div className="text-2xl font-bold text-slate-100 mb-0.5">{value?.toLocaleString() ?? '—'}</div>
    <div className="text-sm text-slate-500">{label}</div>
  </Link>
)

const statusColors = {
  pending: 'bg-amber-900/30 text-amber-400 border-amber-900/30',
  completed: 'bg-emerald-900/30 text-emerald-400 border-emerald-900/30',
  cancelled: 'bg-red-900/30 text-red-400 border-red-900/30',
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    dashboardApi.getStats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />
  if (error) return (
    <div className="card p-8 text-center">
      <AlertTriangle size={32} className="text-amber-400 mx-auto mb-3" />
      <p className="text-slate-400">Failed to load dashboard: {error}</p>
      <p className="text-slate-500 text-sm mt-1">Make sure the backend is running.</p>
    </div>
  )

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Overview</h2>
        <p className="text-slate-500 text-sm mt-1">Real-time inventory & order metrics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package} label="Total Products" value={stats?.total_products}
          color="text-indigo-400" bgColor="bg-indigo-900/30" borderColor="border-indigo-500/20"
          to="/products"
        />
        <StatCard
          icon={Users} label="Total Customers" value={stats?.total_customers}
          color="text-emerald-400" bgColor="bg-emerald-900/30" borderColor="border-emerald-500/20"
          to="/customers"
        />
        <StatCard
          icon={ShoppingCart} label="Total Orders" value={stats?.total_orders}
          color="text-sky-400" bgColor="bg-sky-900/30" borderColor="border-sky-500/20"
          to="/orders"
        />
        <StatCard
          icon={AlertTriangle} label="Low Stock Items" value={stats?.low_stock_products}
          color="text-amber-400" bgColor="bg-amber-900/30" borderColor="border-amber-500/20"
          to="/products"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-indigo-400" />
              <h3 className="font-semibold text-slate-200">Recent Orders</h3>
            </div>
            <Link to="/orders" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all →
            </Link>
          </div>
          {stats?.recent_orders?.length > 0 ? (
            <div className="space-y-2">
              {stats.recent_orders.map(order => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 transition-colors group"
                >
                  <div>
                    <span className="text-sm font-medium text-slate-200">Order #{order.id}</span>
                    <span className="text-xs text-slate-500 ml-2">{order.customer?.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-emerald-400">${order.total_amount.toFixed(2)}</span>
                    <span className={`badge border ${statusColors[order.status] || 'bg-slate-800 text-slate-400'}`}>
                      {order.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-8">No orders yet</p>
          )}
        </div>

        {/* Low Stock */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" />
              <h3 className="font-semibold text-slate-200">Low Stock Alert</h3>
            </div>
            <Link to="/products" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Manage →
            </Link>
          </div>
          {stats?.low_stock_items?.length > 0 ? (
            <div className="space-y-2">
              {stats.low_stock_items.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30">
                  <div>
                    <span className="text-sm font-medium text-slate-200">{product.name}</span>
                    <span className="text-xs text-slate-500 font-mono ml-2">{product.sku}</span>
                  </div>
                  <span className={`badge border ${
                    product.quantity === 0 
                      ? 'bg-red-900/30 text-red-400 border-red-900/30' 
                      : 'bg-amber-900/30 text-amber-400 border-amber-900/30'
                  }`}>
                    {product.quantity} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <TrendingUp size={24} className="text-emerald-400" />
              <p className="text-slate-500 text-sm">All products well-stocked</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
