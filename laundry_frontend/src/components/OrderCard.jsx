import { Clock, CheckCircle, AlertCircle } from 'lucide-react'

export function OrderCard({ order }) {
  const statusColors = {
    created: 'bg-yellow-100 text-status-created',
    picked_up: 'bg-blue-100 text-status-picked',
    washing: 'bg-purple-100 text-status-washing',
    drying: 'bg-orange-100 text-status-drying',
    ready: 'bg-green-100 text-status-ready',
    delivered: 'bg-green-200 text-status-delivered',
    cancelled: 'bg-red-100 text-status-cancelled',
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

  const Icon = statusIcons[order.status] || Clock

  return (
    <div className="card flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
      <div className="flex items-center gap-3">
        <Icon size={18} className={statusColors[order.status]?.replace('bg-', 'text-').replace('100', '600') || 'text-gray-500'} />
        <span className="font-brand text-brand-green font-semibold text-lg">
          {order.order_number}
        </span>
        <span className={`badge-status ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
          {order.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-text-secondary">
          KES {order.total_price}
        </span>
        <span className="text-xs text-text-light">
          {new Date(order.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}