import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { 
  ArrowLeft, 
  Gift, 
  Share2, 
  Users, 
  CheckCircle,
  Sparkles,
  Copy,
  TrendingUp,
  Award
} from 'lucide-react'

export function Loyalty() {
  const navigate = useNavigate()
  const [loyalty, setLoyalty] = useState(null)
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [loyaltyRes, referralsRes] = await Promise.all([
        api.get('/admin/loyalty/my-stamps/'),
        api.get('/admin/referral/my-referrals/')
      ])
      setLoyalty(loyaltyRes.data)
      setReferrals(referralsRes.data)
    } catch (error) {
      console.error('Error fetching loyalty data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralCode = () => {
    if (loyalty?.referral_code) {
      navigator.clipboard.writeText(loyalty.referral_code)
      alert('Referral code copied!')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-brand-pink font-heading">Loading...</div>
      </div>
    )
  }

  const points = loyalty?.points || 0
  const referralCode = loyalty?.referral_code || ''
  const stamps = loyalty?.stamps || 0
  const stampsRequired = loyalty?.stamps_required || 5
  const rewardAvailable = loyalty?.reward_available || false
  const progress = Math.min((stamps / stampsRequired) * 100, 100)

  return (
    <div className="animate-fadeIn max-w-2xl mx-auto">
      <button onClick={() => navigate('/client')} className="flex items-center gap-2 text-text-secondary hover:text-brand-pink transition-colors mb-4">
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="card bg-gradient-to-br from-brand-pink to-brand-pink/80 text-white text-center p-6 mb-6">
        <Sparkles size={48} className="mx-auto mb-3 text-white/90" />
        <h2 className="font-heading text-2xl">Refer. Earn. SAVE!</h2>
        <p className="text-white/90 text-sm mt-1">Love our laundry service? Send a friend our way and get rewarded!</p>
      </div>

      <div className="card mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">Your Points</p>
          <p className="text-4xl font-heading text-brand-pink">{points}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-light">100 points = 10% discount</p>
          <p className="text-xs text-text-light">Points never expire</p>
        </div>
      </div>

      <div className="card mb-6 bg-gradient-to-br from-brand-indigo to-brand-indigo/90 text-white">
        <div className="text-center py-3">
          <Award size={40} className="mx-auto mb-2 text-brand-pink" />
          <h3 className="font-heading text-lg">Loyalty Stamps</h3>
          <p className="text-white/80 text-sm">Earn stamps with every order</p>
        </div>
        <div className="bg-white/10 rounded-card p-3 mt-1">
          <div className="flex justify-between text-sm mb-1">
            <span>{stamps} stamps earned</span>
            <span>{stampsRequired} stamps needed</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-brand-pink rounded-full h-2 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {rewardAvailable ? (
          <button
            onClick={async () => {
              try {
                const { data } = await api.post('/admin/loyalty/redeem/')
                alert('🎉 Reward redeemed! Your free order has been created.')
                navigate(`/client/orders/${data.free_order_id}`)
              } catch (error) {
                alert(error.response?.data?.error || 'Failed to redeem')
              }
            }}
            className="mt-3 w-full bg-brand-pink text-white font-semibold py-2 rounded-full hover:bg-brand-pink/90 transition-colors flex items-center justify-center gap-2"
          >
            <Gift size={18} />
            Redeem Free Order!
          </button>
        ) : (
          <p className="text-center text-white/80 text-sm mt-3">
            Earn {stampsRequired - stamps} more stamp{stampsRequired - stamps > 1 ? 's' : ''} to get a free order
          </p>
        )}
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold text-brand-indigo mb-3 flex items-center gap-2">
          <Share2 size={18} className="text-brand-pink" />
          YOUR REFERRAL CODE
        </h3>
        <div className="flex items-center gap-3 bg-brand-lavender p-3 rounded-2xl">
          <code className="flex-1 font-mono text-lg text-brand-indigo text-center">
            {referralCode || 'Loading...'}
          </code>
          <button
            onClick={copyReferralCode}
            className="btn-primary rounded-full px-4 py-1.5 text-sm flex items-center gap-1"
          >
            <Copy size={16} /> Copy
          </button>
        </div>
        <p className="text-xs text-text-light mt-2">
          Share this code with friends – you earn 100 points when they order!
        </p>
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold text-brand-indigo mb-3 flex items-center gap-2">
          <TrendingUp size={18} className="text-brand-pink" />
          How It Works
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-brand-pink/20 text-brand-pink flex items-center justify-center font-bold text-xs">1</span>
            <div>
              <p className="font-semibold">REFER</p>
              <p className="text-text-secondary">Share your referral code with friends</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-brand-pink/20 text-brand-pink flex items-center justify-center font-bold text-xs">2</span>
            <div>
              <p className="font-semibold">THEY ORDER</p>
              <p className="text-text-secondary">Your friend places their first laundry order using your code</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-brand-pink/20 text-brand-pink flex items-center justify-center font-bold text-xs">3</span>
            <div>
              <p className="font-semibold">YOU EARN</p>
              <p className="text-text-secondary">You earn <strong className="text-brand-pink">100 points</strong> for every successful referral!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-6 bg-[#FFF5F5] border-2 border-brand-pink/20">
        <h3 className="font-semibold text-brand-indigo mb-2 flex items-center gap-2">
          <Gift size={18} className="text-brand-pink" />
          YOUR POINTS, YOUR DISCOUNT!
        </h3>
        <p className="text-sm text-text-secondary">Every 100 points you earn gives you</p>
        <p className="text-2xl font-heading text-brand-pink">10% DISCOUNT</p>
        <p className="text-xs text-text-light mt-1">on your next laundry! ♡</p>
        <div className="flex flex-wrap gap-2 text-xs text-text-light mt-3">
          <span className="bg-brand-indigo/5 px-3 py-1 rounded-full">No limit to points</span>
          <span className="bg-brand-indigo/5 px-3 py-1 rounded-full">Points never expire</span>
          <span className="bg-brand-indigo/5 px-3 py-1 rounded-full">Use anytime!</span>
        </div>
      </div>

      {referrals.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-brand-indigo mb-3 flex items-center gap-2">
            <Users size={18} className="text-brand-pink" />
            Your Referrals
          </h3>
          <div className="space-y-2">
            {referrals.map((ref) => (
              <div key={ref.id} className="flex items-center justify-between text-sm border-b border-gray-100 py-2">
                <span>{ref.referee?.phone_number || 'Unknown'}</span>
                <span className={ref.reward_issued ? 'text-green-600 flex items-center gap-1' : 'text-text-light'}>
                  {ref.reward_issued ? <CheckCircle size={14} /> : 'Pending'}
                  {ref.reward_issued ? ' +100 pts' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center mt-4">
        <button onClick={() => navigate('/client/subscriptions')} className="text-brand-pink hover:underline text-sm font-medium">
          <Sparkles size={14} className="inline mr-1" />
          Save more with subscription plans
        </button>
      </div>
    </div>
  )
}