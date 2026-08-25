import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { useWebSocket } from '../../hooks/useWebSocket'
import { 
  PlusCircle, 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Award,
  Gift,
  TrendingUp
} from 'lucide-react'

export function ClientDashboard() {
  const [orders, setOrders] = useState([])
  const [activeOrderId, setActiveOrderId] = useState(null)
  const [loyalty, setLoyalty] = useState(null)
  const [loading, setLoading] = useState(true)
  const statusUpdate = useWebSocket(activeOrderId)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, loyaltyRes] = await Promise.all([
          api.get('/orders/'),
          api.get('/admin/loyalty/my-stamps/')
        ])
        setOrders(ordersRes.data)
        setLoyalty(loyaltyRes.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (statusUpdate) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === statusUpdate.order_id ? { ...o, status: statusUpdate.status } : o
        )
      )
    }
  }, [statusUpdate])

  const statusColors = {
    created: 'bg-yellow-100 text-yellow-700',
    picked_up: 'bg-blue-100 text-blue-700',
    washing: 'bg-purple-100 text-purple-700',
    drying: 'bg-orange-100 text-orange-700',
    ready: 'bg-green-100 text-green-700',
    delivered: 'bg-green-200 text-green-800',
    cancelled: 'bg-red-100 text-red-700',
  }

  const statusIcons = {
    created: Clock,
    picked_up: Clock,
    washing: Clock,
    drying: Clock,
    ready: CheckCircle,
    delivered: CheckCircle,
    cancelled: AlertCircle,
  }

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
  const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-brand-green">Loading...</div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="section-title">My Laundry</h2>
          <p className="text-text-secondary text-sm">Track your orders and manage your laundry</p>
        </div>
        <div className="flex gap-2">
          <Link to="/client/subscriptions" className="btn-outline rounded-full text-sm px-4 py-2 flex items-center gap-1">
            <TrendingUp size={16} />
            Plans
          </Link>
          <Link to="/client/new-order" className="btn-primary rounded-full px-5 py-2.5 flex items-center gap-2">
            <PlusCircle size={18} />
            New Order
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card p-3 text-center">
          <p className="text-2xl font-brand text-brand-green">{activeOrders.length}</p>
          <p className="text-xs text-text-secondary">Active Orders</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-brand text-brand-green">{completedOrders.length}</p>
          <p className="text-xs text-text-secondary">Completed</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-brand text-brand-gold">{loyalty?.stamps || 0}</p>
          <p className="text-xs text-text-secondary flex items-center justify-center gap-1">
            <Award size={12} /> Stamps
          </p>
        </div>
        <Link to="/client/loyalty" className="card p-3 text-center hover:shadow-hover transition-shadow">
          <p className="text-sm font-semibold text-brand-green">
            {loyalty?.reward_available ? 'Free Order!' : `${loyalty?.stamps_required || 5} stamps needed`}
          </p>
          <p className="text-xs text-text-secondary flex items-center justify-center gap-1">
            <Gift size={12} /> Redeem
          </p>
        </Link>
      </div>

      {activeOrders.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Clock size={18} className="text-brand-green" />
            Active Orders
          </h3>
          <div className="space-y-3">
            {activeOrders.map((order) => {
              const StatusIcon = statusIcons[order.status] || Clock
              return (
                <Link key={order.id} to={`/client/orders/${order.id}`}>
                  <div className="card flex flex-wrap items-center justify-between gap-3 hover:shadow-hover transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3">
                      <StatusIcon size={18} className={statusColors[order.status]?.replace('bg-', 'text-').replace('100', '600') || 'text-gray-500'} />
                      <span className="font-brand text-brand-green font-semibold">
                        {order.order_number}
                      </span>
                      <span className={`badge-status ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-text-secondary">KES {order.total_price}</span>
                      <ChevronRight size={16} className="text-text-light" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {completedOrders.length > 0 && (
        <div>
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            Completed Orders
          </h3>
          <div className="space-y-2">
            {completedOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="card flex flex-wrap items-center justify-between gap-3 opacity-70">
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="font-brand text-brand-green font-semibold text-sm">
                    {order.order_number}
                  </span>
                  <span className="badge-status bg-green-100 text-green-700 text-xs">
                    {order.status.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-text-light">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {completedOrders.length > 3 && (
              <p className="text-center text-text-light text-sm">+{completedOrders.length - 3} more</p>
            )}
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div className="card text-center py-12">
          <Package size={48} className="mx-auto text-text-light mb-3" />
          <p className="text-text-secondary">No orders yet</p>
          <Link to="/client/new-order">
            <button className="btn-primary mt-4 rounded-full">
              Place your first order
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}