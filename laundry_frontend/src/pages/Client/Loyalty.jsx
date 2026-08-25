import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { 
  ArrowLeft, 
  Award, 
  Gift, 
  Users, 
  Share2,
  CheckCircle,
  Sparkles
} from 'lucide-react'

export function Loyalty() {
  const navigate = useNavigate()
  const [loyalty, setLoyalty] = useState(null)
  const [referrals, setReferrals] = useState([])
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [loyaltyRes, referralsRes, codeRes] = await Promise.all([
        api.get('/admin/loyalty/my-stamps/'),
        api.get('/admin/referral/my-referrals/'),
        api.get('/admin/referral/generate/')
      ])
      setLoyalty(loyaltyRes.data)
      setReferrals(referralsRes.data)
      setReferralCode(codeRes.data.referral_code)
    } catch (error) {
      console.error('Error fetching loyalty data:', error)
    } finally {
      setLoading(false)
    }
  }

  const redeemLoyalty = async () => {
    try {
      const { data } = await api.post('/admin/loyalty/redeem/')
      alert('🎉 Reward redeemed! Your free order has been created.')
      navigate(`/client/orders/${data.free_order_id}`)
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to redeem')
    }
  }

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode)
      alert('Referral code copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-brand-green">Loading...</div>
      </div>
    )
  }

  const stamps = loyalty?.stamps || 0
  const stampsRequired = loyalty?.stamps_required || 5
  const rewardAvailable = loyalty?.reward_available || false
  const progress = Math.min((stamps / stampsRequired) * 100, 100)

  return (
    <div className="animate-fadeIn max-w-2xl mx-auto">
      <button onClick={() => navigate('/client')} className="flex items-center gap-2 text-text-secondary hover:text-brand-green transition-colors mb-4">
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="card mb-6 bg-gradient-to-br from-brand-green to-brand-greenDark text-white">
        <div className="text-center py-4">
          <Award size={48} className="mx-auto mb-2 text-brand-gold" />
          <h2 className="text-2xl font-brand">Loyalty Program</h2>
          <p className="text-white/80 text-sm">Earn stamps with every order</p>
        </div>

        <div className="bg-white/10 rounded-card p-4 mt-2">
          <div className="flex justify-between text-sm mb-1">
            <span>{stamps} stamps earned</span>
            <span>{stampsRequired} stamps needed</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5">
            <div 
              className="bg-brand-gold rounded-full h-2.5 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {rewardAvailable ? (
          <button
            onClick={redeemLoyalty}
            className="mt-4 w-full bg-brand-gold text-brand-greenDark font-semibold py-3 rounded-button hover:bg-brand-goldLight transition-colors flex items-center justify-center gap-2"
          >
            <Gift size={20} />
            Redeem Free Order!
          </button>
        ) : (
          <p className="text-center text-white/80 text-sm mt-4">
            Earn {stampsRequired - stamps} more stamp{stampsRequired - stamps > 1 ? 's' : ''} to get a free order
          </p>
        )}
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold text-brand-green mb-3 flex items-center gap-2">
          <Share2 size={18} />
          Refer & Earn
        </h3>
        <p className="text-sm text-text-secondary mb-3">
          Share your referral code with friends. When they place their first order, you both get <strong className="text-brand-green">100 KSH off</strong>!
        </p>
        <div className="flex items-center gap-3">
          <code className="flex-1 bg-gray-100 px-4 py-2 rounded-lg font-mono text-lg text-brand-green text-center">
            {referralCode || 'Loading...'}
          </code>
          <button
            onClick={copyReferralCode}
            className="btn-primary rounded-full px-5 py-2 text-sm"
          >
            Copy Code
          </button>
        </div>
      </div>

      {referrals.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-brand-green mb-3 flex items-center gap-2">
            <Users size={18} />
            Your Referrals
          </h3>
          <div className="space-y-2">
            {referrals.map((ref) => (
              <div key={ref.id} className="flex items-center justify-between text-sm border-b border-gray-100 py-2">
                <span>{ref.referee?.phone_number || 'Unknown'}</span>
                <span className={ref.reward_issued ? 'text-green-600' : 'text-text-light'}>
                  {ref.reward_issued ? (
                    <span className="flex items-center gap-1"><CheckCircle size={14} /> Reward given</span>
                  ) : (
                    'Pending'
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center mt-4">
        <button onClick={() => navigate('/client/subscriptions')} className="text-brand-green hover:underline text-sm">
          <Sparkles size={14} className="inline mr-1" />
          Save more with subscription plans
        </button>
      </div>
    </div>
  )
}