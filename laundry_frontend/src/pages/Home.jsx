import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect } from 'react'
import api from '../api/client'
import { Icon } from '../components/Icon'
import { Phone, MapPin, ArrowRight, Sparkles } from 'lucide-react'

export function Home() {
  const { user } = useAuth()
  const [branding, setBranding] = useState(null)

  useEffect(() => {
    api.get('/admin/public/branding/')
      .then(res => setBranding(res.data))
      .catch(() => {})
  }, [])

  const b = branding || {
    tagline: 'Fast & Fresh! Need It Today?',
    sub_tagline: 'Book before 10 AM, get it back by 5 PM',
    phone: '0793 272 588',
    location: 'Daystar, Athi River',
    footer_message: 'We clean more than clothes, we care for you',
    pillars: [
      { icon: 'Truck', title: 'FREE PICK UP & DELIVERY', description: 'We come to you' },
      { icon: 'Sparkles', title: 'QUALITY WASH', description: 'Expert care' },
      { icon: 'ShieldCheck', title: 'EXPERT CARE', description: 'We care for you' },
      { icon: 'Package', title: 'NEATLY FOLDED', description: 'Ready to wear' },
    ]
  }

  const dashboardPath = user ? `/${user.role}` : '/login'

  return (
    <div className="animate-fadeIn py-6 max-w-7xl mx-auto px-4">
      {/* Hero */}
      <div className="card text-center max-w-3xl mx-auto p-8 md:p-12">
        <Sparkles className="text-brand-pink mx-auto mb-4" size={48} />
        <h1 className="text-5xl md:text-6xl font-heading leading-tight">
          <span className="block text-2xl font-normal text-text-secondary">BUBBLE</span>
          <span className="text-brand-pink">BASKET</span>
          <span className="block text-2xl font-normal text-text-secondary">LAUNDRY</span>
        </h1>
        <p className="text-xl text-text-secondary mt-4 font-medium">{b.tagline}</p>
        <p className="text-text-light mb-6">{b.sub_tagline}</p>
        <Link to={dashboardPath}>
          <button className="btn-primary text-lg px-12 py-4 rounded-full inline-flex items-center gap-2">
            {user ? 'Go to Dashboard' : 'Get Started'}
            <ArrowRight size={20} />
          </button>
        </Link>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-4xl mx-auto">
        {b.pillars.map((pillar, idx) => (
          <div key={idx} className="card text-center p-4 hover:scale-[1.02] transition-transform duration-200">
            <Icon name={pillar.icon} size={32} className="text-brand-pink mx-auto mb-2" />
            <h3 className="font-semibold text-sm text-brand-indigo">{pillar.title}</h3>
            <p className="text-text-light text-xs">{pillar.description}</p>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="card max-w-2xl mx-auto mt-10 text-center p-6 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-brand-indigo font-semibold">
          <MapPin size={18} className="text-brand-pink" />
          <span>{b.location}</span>
        </div>
        <p className="text-text-secondary text-sm">Free pick up and delivery</p>
        <div className="flex items-center gap-2 text-brand-pink font-bold text-xl">
          <Phone size={20} />
          <a href={`tel:${b.phone.replace(/\s/g,'')}`}>{b.phone}</a>
        </div>
        <p className="text-text-light text-sm italic mt-1">{b.footer_message}</p>
      </div>
    </div>
  )
}