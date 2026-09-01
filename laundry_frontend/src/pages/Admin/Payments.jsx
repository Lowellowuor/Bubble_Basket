import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../../api/client'
import { 
  ArrowLeft, 
  Search, 
  Filter,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw
} from 'lucide-react'

export function AdminPayments() {
  const navigate = useNavigate()
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  // Get status from URL query parameter
  const queryParams = new URLSearchParams(location.search)
  const initialStatus = queryParams.get('status') || 'all'
  const [filterStatus, setFilterStatus] = useState(initialStatus)

  // Update filterStatus when URL changes
  useEffect(() => {
    const status = new URLSearchParams(location.search).get('status') || 'all'
    setFilterStatus(status)
  }, [location.search])

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/orders/')
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching payments:', err)
      setError('Failed to load payments. Please try again.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    if (status === 'paid') return <CheckCircle size={16} className="text-green-600" />
    if (status === 'pending') return <Clock size={16} className="text-yellow-600" />
    return <XCircle size={16} className="text-red-600" />
  }

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.payment_status === filterStatus
    const matchesSearch = order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.student?.phone_number?.includes(searchTerm)
    const matchesDate = (!dateRange.start || new Date(order.created_at) >= new Date(dateRange.start)) &&
                        (!dateRange.end || new Date(order.created_at) <= new Date(dateRange.end))
    return matchesStatus && matchesSearch && matchesDate
  })

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.payment_status === 'paid' ? o.total_price : 0), 0)
  const totalPending = filteredOrders.reduce((sum, o) => sum + (o.payment_status === 'pending' ? o.total_price : 0), 0)
  const totalFailed = filteredOrders.reduce((sum, o) => sum + (o.payment_status === 'failed' ? o.total_price : 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-brand-pink font-heading">Loading payments...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600">{error}</p>
        <button onClick={fetchPayments} className="btn-primary mt-4 rounded-full">
          <RefreshCw size={16} className="inline mr-1" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-text-secondary hover:text-brand-pink transition-colors mb-4">
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title">Payments</h2>
        <button
          onClick={fetchPayments}
          className="btn-outline rounded-full px-4 py-2 text-sm flex items-center gap-2"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full">
            <CheckCircle size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Paid</p>
            <p className="text-xl font-heading text-green-600">KES {totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-full">
            <Clock size={24} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Pending</p>
            <p className="text-xl font-heading text-yellow-600">KES {totalPending.toFixed(2)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-full">
            <XCircle size={24} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Failed</p>
            <p className="text-xl font-heading text-red-600">KES {totalFailed.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-text-secondary mb-1">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                type="text"
                placeholder="Order # or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9"
              />
            </div>
          </div>
          <div className="min-w-[120px]">
            <label className="block text-xs text-text-secondary mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                // Update URL query parameter
                const params = new URLSearchParams(location.search)
                params.set('status', e.target.value)
                navigate({ search: params.toString() }, { replace: true })
              }}
              className="input-field"
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="min-w-[120px]">
            <label className="block text-xs text-text-secondary mb-1">From</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="min-w-[120px]">
            <label className="block text-xs text-text-secondary mb-1">To</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterStatus('all')
                setSearchTerm('')
                setDateRange({ start: '', end: '' })
                const params = new URLSearchParams(location.search)
                params.delete('status')
                navigate({ search: params.toString() }, { replace: true })
              }}
              className="btn-outline rounded-full px-4 py-2 text-sm"
            >
              <Filter size={16} className="inline mr-1" /> Clear
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-text-secondary border-b border-gray-100">
            <tr>
              <th className="text-left py-2">Order</th>
              <th className="text-left">Customer</th>
              <th className="text-left">Amount</th>
              <th className="text-left">Status</th>
              <th className="text-left">Receipt</th>
              <th className="text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 font-brand text-brand-indigo font-semibold">
                    {order.order_number}
                  </td>
                  <td>{order.student?.phone_number || 'N/A'}</td>
                  <td>KES {order.total_price}</td>
                  <td>
                    <span className={`flex items-center gap-1 ${
                      order.payment_status === 'paid' ? 'text-green-600' :
                      order.payment_status === 'pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {getStatusIcon(order.payment_status)}
                      {order.payment_status}
                    </span>
                  </td>
                  <td className={order.mpesa_receipt ? 'text-mpesa-magenta font-medium' : 'text-text-light'}>
                    {order.mpesa_receipt || '-'}
                  </td>
                  <td className="text-text-light">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-8 text-text-light">
                  {orders.length === 0 ? 'No orders found in the system.' : 'No payments match your filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-right text-sm text-text-light">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>
    </div>
  )
}