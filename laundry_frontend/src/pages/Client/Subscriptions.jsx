import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { 
  ArrowLeft, 
  Check, 
  Zap, 
  Crown, 
  Package
} from 'lucide-react'

export function Subscriptions() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [mySubscriptions, setMySubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [plansRes, subsRes] = await Promise.all([
        api.get('/admin/subscriptions/plans/'),
        api.get('/admin/subscriptions/my/')
      ])
      setPlans(plansRes.data)
      setMySubscriptions(subsRes.data)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const purchasePlan = async (planId) => {
    setPurchasing(planId)
    try {
      const { data } = await api.post('/admin/subscriptions/purchase/', { plan_id: planId })
      alert(`🎉 Subscription purchased! Valid until ${new Date(data.end_date).toLocaleDateString()}`)
      fetchData()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to purchase subscription')
    } finally {
      setPurchasing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-brand-green">Loading plans...</div>
      </div>
    )
  }

  const activeSubscription = mySubscriptions.find(s => s.is_active)

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      <button onClick={() => navigate('/client')} className="flex items-center gap-2 text-text-secondary hover:text-brand-green transition-colors mb-4">
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <h2 className="section-title text-center mb-2">Subscription Plans</h2>
      <p className="text-center text-text-secondary mb-6">Save more with prepaid plans</p>

      {activeSubscription && (
        <div className="card bg-green-50 border border-green-200 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Crown size={32} className="text-brand-gold" />
              <div>
                <p className="font-semibold text-brand-green">Active Plan: {activeSubscription.plan.name}</p>
                <p className="text-sm text-text-secondary">
                  Remaining: {activeSubscription.remaining_loads} kg · Valid until {new Date(activeSubscription.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className="badge-status bg-green-200 text-green-800">Active</span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isActive = activeSubscription?.plan?.id === plan.id
          return (
            <div key={plan.id} className={`card flex flex-col ${isActive ? 'ring-2 ring-brand-green' : ''}`}>
              <div className="text-center mb-4">
                {plan.name.includes('Gold') ? (
                  <Crown size={40} className="mx-auto text-brand-gold mb-2" />
                ) : (
                  <Zap size={40} className="mx-auto text-brand-green mb-2" />
                )}
                <h3 className="font-brand text-xl text-brand-green">{plan.name}</h3>
                <p className="text-text-secondary text-sm">{plan.description}</p>
              </div>

              <div className="text-center mb-4">
                <span className="text-3xl font-brand text-brand-green">KES {plan.price}</span>
                <p className="text-xs text-text-light">/ {plan.validity_days} days</p>
              </div>

              <ul className="space-y-2 mb-4 flex-1">
                <li className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-green-600 flex-shrink-0" />
                  {plan.load_quantity_kg} kg load
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-green-600 flex-shrink-0" />
                  {plan.discount_rate}% discount on regular prices
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-green-600 flex-shrink-0" />
                  Priority service
                </li>
              </ul>

              <button
                onClick={() => purchasePlan(plan.id)}
                disabled={purchasing === plan.id || isActive}
                className={`btn-primary w-full rounded-full text-center ${
                  isActive ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {purchasing === plan.id ? 'Processing...' : isActive ? 'Active' : 'Subscribe'}
              </button>
            </div>
          )
        })}
      </div>

      {plans.length === 0 && (
        <div className="card text-center py-12">
          <Package size={48} className="mx-auto text-text-light mb-3" />
          <p className="text-text-secondary">No subscription plans available yet</p>
          <p className="text-sm text-text-light">Check back later!</p>
        </div>
      )}
    </div>
  )
}