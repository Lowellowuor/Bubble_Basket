import { useState, useEffect, useCallback } from 'react'
import api from '../../api/client'
import { 
  Users, 
  MoveRight, 
  Clock, 
  Package,
  CheckCircle,
  Truck,
  WashingMachine,
  Sun,
  UserPlus,
  RefreshCw,
  CreditCard,
  XCircle,
  AlertCircle
} from 'lucide-react'

export function StaffDashboard() {
  const [orders, setOrders] = useState([])
  const [riders, setRiders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setError(null)
    try {
      const [ordersRes, ridersRes] = await Promise.all([
        api.get('/orders/'),
        api.get('/users/?role=rider')
      ])
      console.log('📦 Staff orders:', ordersRes.data)
      console.log('👤 Riders:', ridersRes.data)
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : [])
      setRiders(Array.isArray(ridersRes.data) ? ridersRes.data : [])
    } catch (err) {
      console.error('❌ Error fetching staff data:', err)
      setError('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => {
      setRefreshing(true)
      fetchData()
    }, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status/`, { status: newStatus })
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
    } catch (error) {
      alert('Failed to update order status')
      fetchData()
    }
  }

  const assignRider = async (orderId, riderId) => {
    if (!riderId) return
    try {
      await api.patch(`/orders/${orderId}/assign-rider/`, { rider_id: riderId })
      const rider = riders.find(r => r.id === parseInt(riderId))
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId
            ? { ...o, assigned_rider: parseInt(riderId), rider_phone: rider?.phone_number || '' }
            : o
        )
      )
    } catch (error) {
      alert('Failed to assign rider')
    }
  }

  const statuses = [
    { key: 'created', label: 'New', icon: Package, color: 'text-yellow-600' },
    { key: 'picked_up', label: 'Picked Up', icon: Truck, color: 'text-blue-600' },
    { key: 'washing', label: 'Washing', icon: WashingMachine, color: 'text-purple-600' },
    { key: 'drying', label: 'Drying', icon: Sun, color: 'text-orange-600' },
    { key: 'ready', label: 'Ready', icon: CheckCircle, color: 'text-green-600' },
  ]

  const getNextStatus = (current) => {
    const idx = statuses.findIndex(s => s.key === current)
    if (idx === -1 || idx === statuses.length - 1) return null
    return statuses[idx + 1].key
  }

  const getPaymentIcon = (status) => {
    if (status === 'paid') return <CheckCircle size={12} className="text-green-600" />
    if (status === 'pending') return <Clock size={12} className="text-yellow-600" />
    return <XCircle size={12} className="text-red-600" />
  }

  const getPaymentColor = (status) => {
    if (status === 'paid') return 'bg-green-100 text-green-700'
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-brand-pink font-heading">Loading orders...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-3" />
        <p className="text-red-600">{error}</p>
        <button onClick={fetchData} className="btn-primary mt-4 rounded-full">
          <RefreshCw size={16} className="inline mr-1" /> Retry
        </button>
      </div>
    )
  }

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
  const paidOrders = orders.filter(o => o.payment_status === 'paid').length
  const pendingOrders = orders.filter(o => o.payment_status === 'pending').length
  const failedOrders = orders.filter(o => o.payment_status === 'failed').length

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="section-title flex items-center gap-3">
            <Users size={28} />
            Staff Dashboard
          </h2>
          <p className="text-text-secondary text-sm">Manage orders and assign riders</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-light">
            {activeOrders.length} active
          </span>
          <button
            onClick={() => { setRefreshing(true); fetchData() }}
            disabled={refreshing}
            className="btn-outline text-sm py-1 px-4 rounded-full flex items-center gap-1"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="card p-2 text-center">
          <span className="text-xs text-text-secondary">Paid</span>
          <p className="text-lg font-heading text-green-600">{paidOrders}</p>
        </div>
        <div className="card p-2 text-center">
          <span className="text-xs text-text-secondary">Pending</span>
          <p className="text-lg font-heading text-yellow-600">{pendingOrders}</p>
        </div>
        <div className="card p-2 text-center">
          <span className="text-xs text-text-secondary">Failed</span>
          <p className="text-lg font-heading text-red-600">{failedOrders}</p>
        </div>
      </div>

      {/* Kanban Board */}
      {activeOrders.length === 0 ? (
        <div className="card text-center py-12">
          <Package size={48} className="mx-auto text-text-light mb-3" />
          <p className="text-text-secondary">No active orders</p>
          <p className="text-sm text-text-light">Orders will appear here once customers place them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statuses.map(({ key, label, icon: Icon, color }) => {
            const columnOrders = orders.filter(o => o.status === key)
            return (
              <div key={key} className="card p-3 flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm text-brand-indigo uppercase tracking-wider flex items-center gap-2">
                    <Icon size={16} className={color} />
                    {label}
                  </h4>
                  <span className="text-xs bg-gray-100 text-text-secondary px-2 py-0.5 rounded-full">
                    {columnOrders.length}
                  </span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px]">
                  {columnOrders.map((order) => (
                    <div key={order.id} className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-brand text-brand-indigo font-semibold text-xs uppercase tracking-wider">
                            {order.order_number}
                          </p>
                          <p className="text-text-secondary text-xs truncate max-w-[120px]">
                            {order.pickup_location} → {order.delivery_location}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-medium text-brand-indigo">
                            KES {order.total_price}
                          </span>
                          <div className={`text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${getPaymentColor(order.payment_status)}`}>
                            {getPaymentIcon(order.payment_status)}
                            {order.payment_status}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {/* Next status button */}
                        {key !== 'ready' && (
                          <button
                            onClick={() => updateStatus(order.id, getNextStatus(key))}
                            className="btn-primary text-[10px] py-0.5 px-2 rounded-full flex items-center gap-0.5"
                          >
                            <MoveRight size={12} />
                            {getNextStatus(key)?.replace('_', ' ')}
                          </button>
                        )}

                        {key === 'ready' && (
                          <button
                            onClick={() => updateStatus(order.id, 'delivered')}
                            className="btn-gold text-[10px] py-0.5 px-2 rounded-full flex items-center gap-0.5"
                          >
                            <CheckCircle size={12} />
                            Deliver
                          </button>
                        )}

                        {/* Rider assignment */}
                        {(key === 'created' || key === 'picked_up' || key === 'ready') && (
                          <div className="flex items-center gap-0.5 ml-auto">
                            <Users size={12} className="text-text-light" />
                            <select
                              value={order.assigned_rider || ''}
                              onChange={(e) => assignRider(order.id, e.target.value)}
                              className="text-[10px] border border-gray-200 rounded-full px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-brand-pink"
                            >
                              <option value="">Rider</option>
                              {riders.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.phone_number}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {order.assigned_rider && (
                        <div className="mt-1 text-[10px] text-text-light flex items-center gap-0.5">
                          <UserPlus size={12} />
                          Rider: {order.rider_phone || 'Assigned'}
                        </div>
                      )}
                    </div>
                  ))}
                  {columnOrders.length === 0 && (
                    <div className="text-center text-text-light text-xs py-4">No orders</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick Stats Footer */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-3 text-center">
          <p className="text-2xl font-heading text-brand-pink">
            {orders.filter(o => o.status === 'created').length}
          </p>
          <p className="text-xs text-text-secondary">New Orders</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-heading text-brand-pink">
            {orders.filter(o => o.status === 'ready').length}
          </p>
          <p className="text-xs text-text-secondary">Ready to Deliver</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-heading text-brand-pink">
            {orders.filter(o => o.status === 'washing' || o.status === 'drying').length}
          </p>
          <p className="text-xs text-text-secondary">In Progress</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-heading text-brand-pink">
            {riders.filter(r => r.rider_profile?.is_available !== false).length}
          </p>
          <p className="text-xs text-text-secondary">Available Riders</p>
        </div>
      </div>
    </div>
  )
}