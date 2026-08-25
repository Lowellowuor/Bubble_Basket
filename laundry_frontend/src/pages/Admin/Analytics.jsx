import { useState, useEffect } from 'react'
import api from '../../api/client'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  ShoppingBag,
  RefreshCw
} from 'lucide-react'

export function AdminAnalytics() {
  const [revenue, setRevenue] = useState(null)
  const [volume, setVolume] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const [revenueRes, volumeRes] = await Promise.all([
        api.get('/admin/analytics/revenue/?period=week'),
        api.get('/admin/analytics/order-volume/?days=7')
      ])
      console.log('📊 Revenue data:', revenueRes.data)
      console.log('📊 Volume data:', volumeRes.data)
      setRevenue(revenueRes.data)
      setVolume(volumeRes.data?.volume || [])
    } catch (error) {
      console.error('❌ Error fetching analytics:', error)
      setError('Failed to load analytics. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-brand-green">Loading analytics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600">{error}</p>
        <button onClick={fetchAnalytics} className="btn-primary mt-4 rounded-full">
          <RefreshCw size={16} className="inline mr-1" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="section-title flex items-center gap-2">
          <BarChart3 size={28} />
          Analytics
        </h2>
        <button onClick={fetchAnalytics} className="btn-outline rounded-full px-4 py-2 text-sm flex items-center gap-2">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h4 className="text-sm text-text-secondary flex items-center gap-1">
            <TrendingUp size={16} />
            Revenue (7 days)
          </h4>
          <p className="text-2xl font-brand text-brand-green">
            KES {revenue?.total_revenue ? Number(revenue.total_revenue).toFixed(2) : '0.00'}
          </p>
          <div className="flex gap-4 text-xs text-text-light mt-1">
            <span>Cash: {revenue?.cash_revenue || 0}</span>
            <span>M‑PESA: {revenue?.mpesa_revenue || 0}</span>
          </div>
        </div>
        <div className="card">
          <h4 className="text-sm text-text-secondary flex items-center gap-1">
            <ShoppingBag size={16} />
            Orders
          </h4>
          <p className="text-2xl font-brand text-brand-green">{revenue?.order_count || 0}</p>
        </div>
        <div className="card">
          <h4 className="text-sm text-text-secondary flex items-center gap-1">
            <Calendar size={16} />
            Period
          </h4>
          <p className="text-sm text-text-secondary">
            {revenue?.start_date ? new Date(revenue.start_date).toLocaleDateString() : ''} - {revenue?.end_date ? new Date(revenue.end_date).toLocaleDateString() : ''}
          </p>
        </div>
      </div>

      <div className="card">
        <h4 className="font-semibold text-brand-green mb-3 flex items-center gap-2">
          <Calendar size={18} />
          Daily Order Volume
        </h4>
        {volume.length > 0 ? (
          <div className="space-y-2">
            {volume.map((day) => (
              <div key={day.day} className="flex justify-between text-sm border-b border-gray-100 py-2">
                <span>{day.day}</span>
                <span className="font-medium">{day.count} orders</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-light text-center py-4">No order volume data available.</p>
        )}
      </div>
    </div>
  )
}