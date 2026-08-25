import { useState, useEffect } from 'react'
import api from '../api/client'
import { Phone, CreditCard, Smartphone, Sparkles, MessageCircle } from 'lucide-react'

export function Pricing() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/public/pricing/')
      .then(res => setCategories(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-brand-pink font-heading text-xl">Loading pricing...</div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn py-6 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <Sparkles size={40} className="text-brand-pink mx-auto mb-3" />
        <h2 className="section-title">Our Pricing</h2>
        <p className="text-text-secondary text-sm">Simple, transparent pricing for every need</p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="card hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-pink/10 flex items-center justify-center text-2xl">
                {cat.icon}
              </div>
              <h3 className="text-xl font-heading text-brand-indigo">{cat.name}</h3>
            </div>
            <ul className="space-y-2">
              {cat.items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm border-b border-brand-indigo/5 pb-2">
                  <span className="text-text-secondary">{item.service}</span>
                  <span className="font-semibold text-brand-pink">{item.price}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* M-PESA Payment Section */}
      <div className="card max-w-2xl mx-auto mt-10 p-6 text-center border-2 border-mpesa-magenta/20 bg-[#FFF5F5]">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="p-2 bg-mpesa-magenta/10 rounded-2xl">
            <Smartphone size={24} className="text-mpesa-magenta" />
          </div>
          <h4 className="font-heading text-xl text-brand-indigo">Lipa Na M-PESA</h4>
        </div>
        <p className="text-text-secondary">
          Paybill <strong className="text-mpesa-magenta text-lg">303030</strong>
        </p>
        <p className="text-text-secondary">
          Account <strong className="text-mpesa-magenta text-lg">2051303388</strong>
        </p>
        <div className="flex justify-center gap-4 text-xs text-text-light mt-3">
          <span className="flex items-center gap-1">
            <Smartphone size={14} className="text-mpesa-magenta" /> Airtel: *222#
          </span>
          <span className="flex items-center gap-1">
            <Smartphone size={14} className="text-mpesa-magenta" /> T‑Kash: *160#
          </span>
        </div>
      </div>

      {/* WhatsApp Contact */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
        <a
          href="tel:0793272588"
          className="btn-secondary rounded-full px-6 py-3 text-sm flex items-center gap-2"
        >
          <Phone size={18} />
          Call 0793 272 588
        </a>
        <a
          href="https://wa.me/254793272588"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp rounded-full px-6 py-3 text-sm flex items-center gap-2"
        >
          <MessageCircle size={18} />
          WhatsApp Us
        </a>
      </div>
    </div>
  )
}