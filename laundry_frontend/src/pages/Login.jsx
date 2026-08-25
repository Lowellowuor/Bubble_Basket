import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { Phone, KeyRound, ArrowLeft, Sparkles } from 'lucide-react'

export function Login() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const requestOtp = async () => {
    setLoading(true)
    try {
      await api.post('/auth/request-otp/', { phone_number: phone })
      setStep(2)
    } catch {
      alert('Failed to send OTP')
    }
    setLoading(false)
  }

  const verifyOtp = async () => {
    setLoading(true)
    try {
      const data = await login(phone, otp)
      navigate(`/${data.role}`)
    } catch {
      alert('Invalid OTP')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md card p-8 animate-fadeIn">
        <div className="text-center mb-8">
          <Sparkles size={48} className="text-brand-pink mx-auto mb-3" />
          <h2 className="text-3xl font-heading text-brand-indigo">BUBBLE BASKET</h2>
          <p className="text-text-secondary text-sm">Laundry Management</p>
        </div>

        {step === 1 ? (
          <>
            <label className="block text-sm font-medium text-text-secondary mb-1">Phone Number</label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                type="text"
                placeholder="e.g. 2547xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field pl-12"
              />
            </div>
            <button
              onClick={requestOtp}
              disabled={loading}
              className="btn-primary w-full mt-4 rounded-full"
            >
              {loading ? 'Sending...' : 'Get OTP'}
            </button>
          </>
        ) : (
          <>
            <label className="block text-sm font-medium text-text-secondary mb-1">Enter 6‑digit OTP</label>
            <div className="relative">
              <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="input-field pl-12"
              />
            </div>
            <button
              onClick={verifyOtp}
              disabled={loading}
              className="btn-primary w-full mt-4 rounded-full"
            >
              {loading ? 'Verifying...' : 'Login'}
            </button>
            <button
              onClick={() => setStep(1)}
              className="text-sm text-text-light mt-4 hover:text-brand-pink transition-colors flex items-center justify-center gap-1"
            >
              <ArrowLeft size={14} /> Back
            </button>
          </>
        )}
      </div>
    </div>
  )
}