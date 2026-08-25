import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { 
  User, 
  Phone, 
  MapPin, 
  Home, 
  Save, 
  ArrowLeft,
  Check,
  X,
  Tag
} from 'lucide-react'

export function Profile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    phone_number: '',
    client_profile: {
      hostel: '',
      room_number: '',
      prefers_fabric_softener: true,
      prefers_scent_free: false,
      prefers_color_separation: false,
      referral_code: ''
    }
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile/')
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/auth/profile/update/', {
        name: profile.name,
        hostel: profile.client_profile.hostel,
        room_number: profile.client_profile.room_number,
        prefers_fabric_softener: profile.client_profile.prefers_fabric_softener,
        prefers_scent_free: profile.client_profile.prefers_scent_free,
        prefers_color_separation: profile.client_profile.prefers_color_separation,
      })
      alert('Profile updated successfully!')
    } catch (error) {
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const togglePreference = (key) => {
    setProfile({
      ...profile,
      client_profile: {
        ...profile.client_profile,
        [key]: !profile.client_profile[key]
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-brand-green">Loading...</div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn max-w-2xl mx-auto">
      <button onClick={() => navigate('/client')} className="flex items-center gap-2 text-text-secondary hover:text-brand-green transition-colors mb-4">
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">My Profile</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary rounded-full px-6 py-2 flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              <User size={16} className="inline mr-1" />
              Full Name
            </label>
            <input
              type="text"
              value={profile.name || ''}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="input-field"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              <Phone size={16} className="inline mr-1" />
              Phone Number
            </label>
            <input
              type="text"
              value={profile.phone_number || ''}
              disabled
              className="input-field bg-gray-50 text-text-secondary"
            />
            <p className="text-xs text-text-light mt-1">Phone number cannot be changed</p>
          </div>
        </div>

        <div className="border-t border-gray-100 my-6" />

        <div className="space-y-4 mb-6">
          <h3 className="font-semibold text-brand-green">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                <MapPin size={16} className="inline mr-1" />
                Hostel / Residence
              </label>
              <input
                type="text"
                value={profile.client_profile?.hostel || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  client_profile: {
                    ...profile.client_profile,
                    hostel: e.target.value
                  }
                })}
                className="input-field"
                placeholder="e.g. Bethel Hostel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                <Home size={16} className="inline mr-1" />
                Room Number
              </label>
              <input
                type="text"
                value={profile.client_profile?.room_number || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  client_profile: {
                    ...profile.client_profile,
                    room_number: e.target.value
                  }
                })}
                className="input-field"
                placeholder="e.g. 203"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 my-6" />

        <div>
          <h3 className="font-semibold text-brand-green mb-3">Laundry Preferences</h3>
          <div className="space-y-2">
            {[
              { key: 'prefers_fabric_softener', label: 'Use Fabric Softener' },
              { key: 'prefers_scent_free', label: 'Scent-Free Detergent' },
              { key: 'prefers_color_separation', label: 'Separate Colors' },
            ].map((pref) => (
              <button
                key={pref.key}
                onClick={() => togglePreference(pref.key)}
                className="w-full flex items-center justify-between p-3 rounded-card border transition-colors hover:bg-gray-50"
              >
                <span className="text-sm">{pref.label}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  profile.client_profile?.[pref.key]
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-text-light'
                }`}>
                  {profile.client_profile?.[pref.key] ? <Check size={14} className="inline" /> : <X size={14} className="inline" />}
                  {profile.client_profile?.[pref.key] ? ' On' : ' Off'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 my-6" />

        <div>
          <h3 className="font-semibold text-brand-green mb-2 flex items-center gap-2">
            <Tag size={18} />
            Referral Code
          </h3>
          <div className="flex items-center gap-3">
            <code className="bg-gray-100 px-4 py-2 rounded-lg font-mono text-lg text-brand-green">
              {profile.client_profile?.referral_code || 'Generate in dashboard'}
            </code>
            <button
              onClick={() => {
                const code = profile.client_profile?.referral_code || ''
                if (code) {
                  navigator.clipboard.writeText(code)
                  alert('Referral code copied!')
                }
              }}
              className="btn-outline text-sm py-1.5 px-4 rounded-full"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-text-light mt-2">
            Share your referral code with friends – you both get 100 KSH off!
          </p>
        </div>
      </div>
    </div>
  )
}