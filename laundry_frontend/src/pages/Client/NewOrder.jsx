import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Package, 
  Scale, 
  Bed, 
  Shirt,
  MapPin,
  MessageSquare,
  CreditCard,
  Smartphone,
  Sparkles,
  Home,
  Store
} from 'lucide-react'

export function NewOrder() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState({
    service_type: 'regular',
    weight_kg: '',
    duvet_size: '',
    special_item: '',
    pickup_location: '',
    pickup_landmark: '',
    delivery_type: 'shop',
    delivery_location: '',
    special_instructions: '',
    items: []
  })
  const [duvetSizes] = useState([
    { label: 'Small (4×6)', value: 'small', price: 350 },
    { label: 'Medium (5×6)', value: 'medium', price: 400 },
    { label: 'Large (6×6)', value: 'large', price: 450 },
  ])
  const [specialItems] = useState([
    { label: 'Suit (Blazer + Trouser)', value: 'suit', price: 350 },
    { label: 'Suit (Wash, Dry & Iron)', value: 'suit_iron', price: 450 },
    { label: 'Blazer / Heavy Jacket', value: 'blazer', price: 200 },
    { label: 'Graduation Gown', value: 'gown', price: 300 },
    { label: 'Door Mat', value: 'doormat', price: 150 },
  ])

  const [totalPrice, setTotalPrice] = useState(0)
  const [profile, setProfile] = useState(null)
  const [usePoints, setUsePoints] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    calculatePrice()
  }, [order])

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/admin/loyalty/my-stamps/')
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const calculatePrice = () => {
    let price = 0
    if (order.service_type === 'regular' && order.weight_kg) {
      price = parseFloat(order.weight_kg) * 80
    } else if (order.service_type === 'duvet' && order.duvet_size) {
      const found = duvetSizes.find(d => d.value === order.duvet_size)
      price = found ? found.price : 0
    } else if (order.service_type === 'special' && order.special_item) {
      const found = specialItems.find(s => s.value === order.special_item)
      price = found ? found.price : 0
    }
    setTotalPrice(price)
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    let createdOrderId = null
    try {
      let items = []
      if (order.service_type === 'regular') {
        items.push({
          item_type: 'regular',
          description: 'Clothes (per kg)',
          weight_kg: parseFloat(order.weight_kg),
          price: totalPrice
        })
      } else if (order.service_type === 'duvet') {
        const found = duvetSizes.find(d => d.value === order.duvet_size)
        items.push({
          item_type: 'bulky',
          description: `Duvet ${found?.label || ''}`,
          flat_rate: totalPrice,
          price: totalPrice
        })
      } else if (order.service_type === 'special') {
        const found = specialItems.find(s => s.value === order.special_item)
        items.push({
          item_type: 'bulky',
          description: found?.label || 'Special item',
          flat_rate: totalPrice,
          price: totalPrice
        })
      }

      const deliveryLocation = order.delivery_type === 'shop' 
        ? 'Bubble Basket Laundry, Daystar, Athi River' 
        : order.delivery_location

      const payload = {
        pickup_location: order.pickup_location + (order.pickup_landmark ? ` (Near: ${order.pickup_landmark})` : ''),
        delivery_location: deliveryLocation,
        special_instructions: order.special_instructions,
        items: items
      }

      const { data } = await api.post('/orders/create/', payload)
      createdOrderId = data.id

      if (usePoints && profile?.points >= 100) {
        try {
          const pointsRes = await api.post(`/orders/${createdOrderId}/apply-points/`)
          alert(`✅ ${pointsRes.data.message}`)
        } catch (err) {
          alert(err.response?.data?.error || 'Failed to apply points discount')
        }
      }

      if (totalPrice > 0) {
        await api.post(`/payments/initiate/${createdOrderId}/`)
      }

      navigate(`/client/orders/${createdOrderId}`)
    } catch (error) {
      alert('Failed to create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="font-heading text-xl text-brand-indigo">What would you like to wash?</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => setOrder({ ...order, service_type: 'regular' })}
          className={`card text-center p-4 transition-all ${
            order.service_type === 'regular' 
              ? 'ring-2 ring-brand-pink shadow-softHover' 
              : 'hover:shadow-softHover'
          }`}
        >
          <Scale size={32} className="mx-auto text-brand-pink mb-2" />
          <h4 className="font-semibold text-brand-indigo">Clothes (per kg)</h4>
          <p className="text-sm text-text-light">80 KSH / kg</p>
        </button>

        <button
          onClick={() => setOrder({ ...order, service_type: 'duvet' })}
          className={`card text-center p-4 transition-all ${
            order.service_type === 'duvet' 
              ? 'ring-2 ring-brand-pink shadow-softHover' 
              : 'hover:shadow-softHover'
          }`}
        >
          <Bed size={32} className="mx-auto text-brand-pink mb-2" />
          <h4 className="font-semibold text-brand-indigo">Duvets</h4>
          <p className="text-sm text-text-light">From 350 KSH</p>
        </button>

        <button
          onClick={() => setOrder({ ...order, service_type: 'special' })}
          className={`card text-center p-4 transition-all ${
            order.service_type === 'special' 
              ? 'ring-2 ring-brand-pink shadow-softHover' 
              : 'hover:shadow-softHover'
          }`}
        >
          <Shirt size={32} className="mx-auto text-brand-pink mb-2" />
          <h4 className="font-semibold text-brand-indigo">Special Items</h4>
          <p className="text-sm text-text-light">Suits, jackets & more</p>
        </button>
      </div>

      {order.service_type === 'regular' && (
        <div className="card mt-4">
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Weight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            min="0.5"
            placeholder="e.g. 2.5"
            value={order.weight_kg}
            onChange={(e) => setOrder({ ...order, weight_kg: e.target.value })}
            className="input-field"
          />
          <p className="text-sm text-text-light mt-1">Min order: 0.5 kg</p>
        </div>
      )}

      {order.service_type === 'duvet' && (
        <div className="card mt-4">
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Select Size
          </label>
          <select
            value={order.duvet_size}
            onChange={(e) => setOrder({ ...order, duvet_size: e.target.value })}
            className="input-field"
          >
            <option value="">Select duvet size...</option>
            {duvetSizes.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label} - {d.price} KSH
              </option>
            ))}
          </select>
        </div>
      )}

      {order.service_type === 'special' && (
        <div className="card mt-4">
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Select Item
          </label>
          <select
            value={order.special_item}
            onChange={(e) => setOrder({ ...order, special_item: e.target.value })}
            className="input-field"
          >
            <option value="">Select item...</option>
            {specialItems.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label} - {s.price} KSH
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="font-heading text-xl text-brand-indigo">Pickup & Delivery</h3>

      <div className="card">
        <label className="block text-sm font-medium text-text-secondary mb-1">
          <MapPin size={16} className="inline mr-1 text-brand-pink" />
          Pickup Address
        </label>
        <input
          type="text"
          placeholder="Your address (e.g., Bethel Hostel, Room 203)"
          value={order.pickup_location}
          onChange={(e) => setOrder({ ...order, pickup_location: e.target.value })}
          className="input-field"
          required
        />
        <div className="mt-3">
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Nearby Landmark <span className="text-text-light text-xs">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g., near the cafeteria, next to the library"
            value={order.pickup_landmark}
            onChange={(e) => setOrder({ ...order, pickup_landmark: e.target.value })}
            className="input-field"
          />
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Delivery Option
        </label>
        <div className="space-y-2">
          <button
            onClick={() => setOrder({ ...order, delivery_type: 'shop' })}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
              order.delivery_type === 'shop'
                ? 'border-brand-pink bg-brand-pink/5 ring-2 ring-brand-pink'
                : 'border-gray-200 hover:border-brand-pink/30'
            }`}
          >
            <div className={`p-2 rounded-full ${order.delivery_type === 'shop' ? 'bg-brand-pink' : 'bg-gray-100'}`}>
              <Store size={18} className={order.delivery_type === 'shop' ? 'text-white' : 'text-gray-400'} />
            </div>
            <div className="text-left">
              <p className="font-medium text-brand-indigo">Pick up from Bubble Basket Laundry</p>
              <p className="text-xs text-text-light">Daystar, Athi River</p>
            </div>
          </button>

          <button
            onClick={() => setOrder({ ...order, delivery_type: 'custom' })}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
              order.delivery_type === 'custom'
                ? 'border-brand-pink bg-brand-pink/5 ring-2 ring-brand-pink'
                : 'border-gray-200 hover:border-brand-pink/30'
            }`}
          >
            <div className={`p-2 rounded-full ${order.delivery_type === 'custom' ? 'bg-brand-pink' : 'bg-gray-100'}`}>
              <Home size={18} className={order.delivery_type === 'custom' ? 'text-white' : 'text-gray-400'} />
            </div>
            <div className="text-left">
              <p className="font-medium text-brand-indigo">Deliver to a different address</p>
              <p className="text-xs text-text-light">Enter custom delivery address</p>
            </div>
          </button>
        </div>

        {order.delivery_type === 'custom' && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Delivery Address
            </label>
            <input
              type="text"
              placeholder="Enter delivery address"
              value={order.delivery_location}
              onChange={(e) => setOrder({ ...order, delivery_location: e.target.value })}
              className="input-field"
            />
          </div>
        )}
      </div>

      <div className="card">
        <label className="block text-sm font-medium text-text-secondary mb-1">
          <MessageSquare size={16} className="inline mr-1 text-brand-pink" />
          Special Instructions (Optional)
        </label>
        <textarea
          placeholder="Any special requests? (e.g., use fabric softener, separate colors)"
          value={order.special_instructions}
          onChange={(e) => setOrder({ ...order, special_instructions: e.target.value })}
          className="input-field min-h-[80px]"
        />
      </div>
    </div>
  )

  const renderStep3 = () => {
    const points = profile?.points || 0
    const canRedeem = points >= 100
    const discountedPrice = usePoints ? totalPrice * 0.9 : totalPrice

    return (
      <div className="space-y-4">
        <h3 className="font-heading text-xl text-brand-indigo">Review & Pay</h3>

        <div className="card space-y-3">
          <div className="flex justify-between py-2 border-b border-brand-indigo/5">
            <span className="text-text-secondary">Service</span>
            <span className="font-medium text-brand-indigo">
              {order.service_type === 'regular' && 'Clothes (per kg)'}
              {order.service_type === 'duvet' && 'Duvet'}
              {order.service_type === 'special' && 'Special Item'}
            </span>
          </div>
          {order.service_type === 'regular' && order.weight_kg && (
            <div className="flex justify-between py-2 border-b border-brand-indigo/5">
              <span className="text-text-secondary">Weight</span>
              <span className="font-medium text-brand-indigo">{order.weight_kg} kg</span>
            </div>
          )}
          {order.service_type === 'duvet' && order.duvet_size && (
            <div className="flex justify-between py-2 border-b border-brand-indigo/5">
              <span className="text-text-secondary">Duvet Size</span>
              <span className="font-medium text-brand-indigo">
                {duvetSizes.find(d => d.value === order.duvet_size)?.label || ''}
              </span>
            </div>
          )}
          {order.service_type === 'special' && order.special_item && (
            <div className="flex justify-between py-2 border-b border-brand-indigo/5">
              <span className="text-text-secondary">Item</span>
              <span className="font-medium text-brand-indigo">
                {specialItems.find(s => s.value === order.special_item)?.label || ''}
              </span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-brand-indigo/5">
            <span className="text-text-secondary">Pickup</span>
            <span className="font-medium text-brand-indigo">{order.pickup_location}{order.pickup_landmark ? ` (Near: ${order.pickup_landmark})` : ''}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-brand-indigo/5">
            <span className="text-text-secondary">Delivery</span>
            <span className="font-medium text-brand-indigo">
              {order.delivery_type === 'shop' 
                ? 'Bubble Basket Laundry (shop)' 
                : order.delivery_location || 'To be specified'}
            </span>
          </div>

          {usePoints && canRedeem && (
            <div className="flex justify-between py-2 border-b border-brand-pink/20 bg-brand-pink/5 px-2 rounded">
              <span className="text-sm text-brand-pink font-semibold">Discount (10%)</span>
              <span className="text-sm text-brand-pink">- KES {(totalPrice * 0.1).toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between py-3">
            <span className="text-lg font-heading text-brand-indigo">Total</span>
            <span className="text-2xl font-heading text-brand-pink">KES {discountedPrice.toFixed(2)}</span>
          </div>
        </div>

        {canRedeem && (
          <div className="card bg-brand-lavender border border-brand-pink/20">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="usePoints"
                checked={usePoints}
                onChange={(e) => setUsePoints(e.target.checked)}
                className="w-5 h-5 text-brand-pink rounded border-gray-300 focus:ring-brand-pink"
              />
              <label htmlFor="usePoints" className="text-sm text-text-secondary">
                Use <strong className="text-brand-pink">100 points</strong> for <strong className="text-brand-pink">10% discount</strong> (you have {points} points)
              </label>
            </div>
            <p className="text-xs text-text-light mt-1 ml-8">Points never expire – use them anytime!</p>
          </div>
        )}

        <div className="card bg-[#FFF5F5] border-2 border-mpesa-magenta/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-mpesa-magenta/10 rounded-2xl">
              <Smartphone size={28} className="text-mpesa-magenta" />
            </div>
            <div>
              <p className="font-semibold text-brand-indigo">Lipa Na M-PESA</p>
              <p className="text-sm text-text-secondary">You'll receive an STK push on your phone</p>
              <p className="text-xs text-text-light mt-1">
                Paybill: <strong className="text-mpesa-magenta">303030</strong> · 
                Account: <strong className="text-mpesa-magenta">2051303388</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate('/client')} 
          className="text-text-secondary hover:text-brand-pink transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="section-title">New Order</h2>
        <Sparkles size={20} className="text-brand-pink ml-auto" />
      </div>

      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold font-heading ${
              step >= s ? 'bg-brand-pink text-white shadow-soft' : 'bg-brand-indigo/10 text-text-light'
            }`}>
              {step > s ? <Check size={16} /> : s}
            </div>
            {s < 3 && (
              <div className={`w-12 h-0.5 ${step > s ? 'bg-brand-pink' : 'bg-brand-indigo/10'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="mb-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      <div className="flex gap-3">
        {step > 1 && (
          <button onClick={handleBack} className="btn-outline flex-1 rounded-full">
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={handleNext}
            className="btn-primary flex-1 rounded-full flex items-center justify-center gap-2"
            disabled={step === 1 && !order.service_type}
          >
            Next <ArrowRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading || totalPrice === 0}
            className="btn-primary flex-1 rounded-full flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : `Pay KES ${totalPrice}`}
            <Smartphone size={18} />
          </button>
        )}
      </div>
    </div>
  )
}