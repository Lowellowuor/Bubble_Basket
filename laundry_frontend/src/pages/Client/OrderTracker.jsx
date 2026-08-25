import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { useWebSocket } from '../../hooks/useWebSocket'
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Package, 
  Truck, 
  WashingMachine,
  Sun,
  MapPin,
  Calendar,
  CreditCard,
  AlertCircle,
  XCircle
} from 'lucide-react'

export function OrderTracker() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const statusUpdate = useWebSocket(id)

  useEffect(() => {
    fetchOrder()
  }, [])

  useEffect(() => {
    if (statusUpdate) {
      setOrder(prev => prev ? { ...prev, status: statusUpdate.status } : prev)
    }
  }, [statusUpdate])

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}/`)
      setOrder(data)
    } catch (error) {
      alert('Order not found')
      navigate('/client')
    } finally {
      setLoading(false)
    }
  }

  const statusSteps = [
    { key: 'created', label: 'Order Placed', icon: Package },
    { key: 'picked_up', label: 'Picked Up', icon: Truck },
    { key: 'washing', label: 'Washing', icon: WashingMachine },
    { key: 'drying', label: 'Drying', icon: Sun },
    { key: 'ready', label: 'Ready for Delivery', icon: CheckCircle },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ]

  const currentStepIndex = statusSteps.findIndex(s => s.key === order?.status)
  const isDelivered = order?.status === 'delivered'
  const isCancelled = order?.status === 'cancelled'

  // Payment status helpers
  const getPaymentIcon = (status) => {
    if (status === 'paid') return <CheckCircle size={14} className="text-green-600" />
    if (status === 'pending') return <Clock size={14} className="text-yellow-600" />
    return <XCircle size={14} className="text-red-600" />
  }

  const getPaymentColor = (status) => {
    if (status === 'paid') return 'text-green-600'
    if (status === 'pending') return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-brand-green">Loading order...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="card text-center py-12">
        <AlertCircle size={48} className="mx-auto text-text-light mb-3" />
        <p className="text-text-secondary">Order not found</p>
        <button onClick={() => navigate('/client')} className="btn-primary mt-4 rounded-full">
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn max-w-3xl mx-auto">
      <button onClick={() => navigate('/client')} className="flex items-center gap-2 text-text-secondary hover:text-brand-green transition-colors mb-4">
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="card mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-brand text-2xl text-brand-green">{order.order_number}</h2>
            <p className="text-text-light text-sm flex items-center gap-2">
              <Calendar size={14} />
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <div>
            <span className={`badge-status ${
              isCancelled ? 'bg-red-100 text-red-700' :
              isDelivered ? 'bg-green-200 text-green-800' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
            <p className="text-2xl font-brand text-brand-green mt-1 text-right">KES {order.total_price}</p>
          </div>
        </div>
      </div>

      {!isCancelled && (
        <div className="card mb-6">
          <h3 className="font-semibold mb-4 text-brand-green">Order Status</h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200">
              <div 
                className="w-0.5 bg-brand-green transition-all duration-500"
                style={{ height: `${isDelivered ? 100 : (currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
              />
            </div>

            <div className="space-y-6">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex
                const isActive = index === currentStepIndex
                const Icon = step.icon

                return (
                  <div key={step.key} className="flex items-start gap-4 relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      isCompleted ? 'bg-brand-green text-white' : 'bg-gray-200 text-text-light'
                    }`}>
                      {isCompleted ? <CheckCircle size={16} /> : <Icon size={16} />}
                    </div>
                    <div className={`flex-1 pt-0.5 ${isActive ? 'font-semibold' : ''}`}>
                      <p className={isCompleted ? 'text-brand-green' : 'text-text-secondary'}>
                        {step.label}
                      </p>
                      {isActive && !isDelivered && (
                        <p className="text-xs text-text-light animate-pulse">In progress...</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold text-brand-green mb-3">Order Details</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-text-secondary">Pickup</span>
            <span className="font-medium">{order.pickup_location}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-text-secondary">Delivery</span>
            <span className="font-medium">{order.delivery_location}</span>
          </div>

          {/* Payment Status – Enhanced */}
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-text-secondary flex items-center gap-1">
              <CreditCard size={14} />
              Payment
            </span>
            <span className={`font-medium capitalize flex items-center gap-1 ${getPaymentColor(order.payment_status)}`}>
              {getPaymentIcon(order.payment_status)}
              {order.payment_status}
              {order.mpesa_receipt && (
                <span className="text-xs text-text-light ml-1">
                  (Receipt: {order.mpesa_receipt})
                </span>
              )}
            </span>
          </div>

          {order.special_instructions && (
            <div className="py-1">
              <span className="text-text-secondary">Instructions:</span>
              <p className="text-text-primary mt-0.5">{order.special_instructions}</p>
            </div>
          )}
          <div className="flex justify-between py-1">
            <span className="text-text-secondary">Items</span>
            <div className="text-right">
              {order.items?.map((item, i) => (
                <div key={i} className="text-sm">
                  {item.description}
                  {item.weight_kg && ` (${item.weight_kg}kg)`}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isCancelled && (
        <div className="card mt-4 bg-red-50 border border-red-200">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle size={24} />
            <p>This order has been cancelled.</p>
          </div>
        </div>
      )}
    </div>
  )
}