import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { 
  Truck, 
  MapPin, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Package,
  User,
  Phone,
  RefreshCw,
  ChevronRight
} from 'lucide-react'

export function RiderDashboard() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(() => {
      fetchOrders(true)
    }, 15000) // Refresh every 15 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true)
    setRefreshing(true)
    try {
      const { data } = await api.get('/orders/') // Only returns orders assigned to this rider
      console.log('🚚 Rider orders:', data)
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('❌ Error fetching rider orders:', error)
      if (!silent) alert('Failed to load orders')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleDeliver = async (orderId) => {
    if (!window.confirm('Mark this order as delivered?')) return
    try {
      await api.patch(`/orders/${orderId}/deliver/`)
      setOrders(prev => prev.filter(o => o.id !== orderId))
      alert('✅ Order delivered successfully!')
    } catch (error) {
      alert('Failed to mark as delivered')
    }
  }

  const getPaymentStatus = (status) => {
    if (status === 'paid') return { label: 'Paid', color: 'text-green-600 bg-green-100' }
    if (status === 'pending') return { label: 'Pending', color: 'text-yellow-600 bg-yellow-100' }
    return { label: 'Failed', color: 'text-red-600 bg-red-100' }
  }

  const readyOrders = orders.filter(o => o.status === 'ready')
  const deliveredOrders = orders.filter(o => o.status === 'delivered')
  const inTransitOrders = orders.filter(o => o.status === 'picked_up' || o.status === 'washing' || o.status === 'drying')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-brand-green">Loading deliveries...</div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="section-title flex items-center gap-3">
            <Truck size={28} />
            Rider Dashboard
          </h2>
          <p className="text-text-secondary text-sm">Manage your deliveries</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-light">
            {readyOrders.length} ready · {deliveredOrders.length} delivered
          </span>
          <button
            onClick={() => fetchOrders()}
            disabled={refreshing}
            className="btn-outline text-sm py-1 px-4 rounded-full flex items-center gap-1"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card text-center p-3">
          <p className="text-2xl font-brand text-brand-green">{readyOrders.length}</p>
          <p className="text-xs text-text-secondary flex items-center justify-center gap-1">
            <Package size={12} /> Ready to Deliver
          </p>
        </div>
        <div className="card text-center p-3">
          <p className="text-2xl font-brand text-yellow-600">{inTransitOrders.length}</p>
          <p className="text-xs text-text-secondary flex items-center justify-center gap-1">
            <Clock size={12} /> In Progress
          </p>
        </div>
        <div className="card text-center p-3">
          <p className="text-2xl font-brand text-green-600">{deliveredOrders.length}</p>
          <p className="text-xs text-text-secondary flex items-center justify-center gap-1">
            <CheckCircle size={12} /> Delivered
          </p>
        </div>
      </div>

      {/* Ready Orders */}
      {readyOrders.length > 0 && (
        <div>
          <h3 className="font-semibold text-brand-green mb-3 flex items-center gap-2">
            <Package size={18} />
            Ready for Delivery
          </h3>
          <div className="space-y-3">
            {readyOrders.map((order) => {
              const payment = getPaymentStatus(order.payment_status)
              return (
                <div key={order.id} className="card hover:shadow-hover transition-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-brand text-brand-green font-semibold">
                          {order.order_number}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${payment.color}`}>
                          {payment.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <MapPin size={14} />
                        <span>{order.pickup_location} → {order.delivery_location}</span>
                      </div>
                      {order.special_instructions && (
                        <p className="text-xs text-text-light mt-1 italic">
                          📝 {order.special_instructions}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-xs text-text-light">
                        <span className="flex items-center gap-1">
                          <User size={12} /> {order.student?.phone_number || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={12} /> {order.student?.phone_number || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-brand-green">
                        KES {order.total_price}
                      </span>
                      <button
                        onClick={() => handleDeliver(order.id)}
                        className="btn-primary text-sm py-1.5 px-4 rounded-full flex items-center gap-1"
                      >
                        <CheckCircle size={16} />
                        Deliver
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Delivered Orders */}
      {deliveredOrders.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-text-secondary mb-3 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            Completed Deliveries
          </h3>
          <div className="space-y-2">
            {deliveredOrders.map((order) => (
              <div key={order.id} className="card opacity-70 p-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-brand text-brand-green font-semibold text-sm">
                    {order.order_number}
                  </span>
                  <span className="ml-2 text-xs text-text-light">
                    {order.delivery_location}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-text-light">KES {order.total_price}</span>
                  <span className="text-xs text-green-600">Delivered</span>
                  <ChevronRight size={16} className="text-text-light" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div className="card text-center py-12">
          <Truck size={48} className="mx-auto text-text-light mb-3" />
          <p className="text-text-secondary">No deliveries assigned to you.</p>
          <p className="text-sm text-text-light">Check back later or refresh.</p>
        </div>
      )}
    </div>
  )
}