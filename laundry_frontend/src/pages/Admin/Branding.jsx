import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { 
  ArrowLeft, 
  Save, 
  RefreshCw,
  Plus,
  Trash2,
  GripVertical
} from 'lucide-react'

export function AdminBranding() {
  const navigate = useNavigate()
  const [branding, setBranding] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newPillar, setNewPillar] = useState({ icon: '', title: '', description: '' })

  useEffect(() => {
    fetchBranding()
  }, [])

  const fetchBranding = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/branding/1/')
      setBranding(data)
    } catch (error) {
      console.error('Error fetching branding:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch(`/admin/branding/${branding.id}/`, branding)
      alert('Branding updated successfully!')
    } catch (error) {
      alert('Failed to update branding')
    } finally {
      setSaving(false)
    }
  }

  const addPillar = () => {
    if (!newPillar.icon || !newPillar.title) return
    setBranding({
      ...branding,
      pillars: [...branding.pillars, { ...newPillar }]
    })
    setNewPillar({ icon: '', title: '', description: '' })
  }

  const removePillar = (index) => {
    const updated = [...branding.pillars]
    updated.splice(index, 1)
    setBranding({ ...branding, pillars: updated })
  }

  const updatePillar = (index, field, value) => {
    const updated = [...branding.pillars]
    updated[index][field] = value
    setBranding({ ...branding, pillars: updated })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-brand-green">Loading branding...</div>
      </div>
    )
  }

  if (!branding) {
    return (
      <div className="card text-center py-12">
        <p className="text-text-secondary">Branding not found</p>
        <button onClick={fetchBranding} className="btn-primary mt-4 rounded-full">
          <RefreshCw size={16} className="inline mr-1" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn max-w-3xl mx-auto">
      <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-text-secondary hover:text-brand-green transition-colors mb-4">
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title">Branding</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary rounded-full px-6 py-2 flex items-center gap-2"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Company Name</label>
          <input
            type="text"
            value={branding.company_name || ''}
            onChange={(e) => setBranding({ ...branding, company_name: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Tagline</label>
          <input
            type="text"
            value={branding.tagline || ''}
            onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Sub Tagline</label>
          <input
            type="text"
            value={branding.sub_tagline || ''}
            onChange={(e) => setBranding({ ...branding, sub_tagline: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
          <input
            type="text"
            value={branding.phone || ''}
            onChange={(e) => setBranding({ ...branding, phone: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Location</label>
          <input
            type="text"
            value={branding.location || ''}
            onChange={(e) => setBranding({ ...branding, location: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Footer Message</label>
          <input
            type="text"
            value={branding.footer_message || ''}
            onChange={(e) => setBranding({ ...branding, footer_message: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">M-PESA Paybill</label>
          <input
            type="text"
            value={branding.payment_paybill || ''}
            onChange={(e) => setBranding({ ...branding, payment_paybill: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">M-PESA Account</label>
          <input
            type="text"
            value={branding.payment_account || ''}
            onChange={(e) => setBranding({ ...branding, payment_account: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Airtel Money Code</label>
          <input
            type="text"
            value={branding.payment_airtel || ''}
            onChange={(e) => setBranding({ ...branding, payment_airtel: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">T‑Kash Code</label>
          <input
            type="text"
            value={branding.payment_tkash || ''}
            onChange={(e) => setBranding({ ...branding, payment_tkash: e.target.value })}
            className="input-field"
          />
        </div>
      </div>

      {/* Pillars */}
      <div className="card mt-6">
        <h3 className="font-semibold text-brand-green mb-3 flex items-center gap-2">
          <Plus size={18} />
          Pillars
        </h3>
        <div className="space-y-3">
          {branding.pillars?.map((pillar, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-card">
              <GripVertical size={16} className="text-text-light cursor-move" />
              <input
                type="text"
                placeholder="Icon name (e.g., Truck)"
                value={pillar.icon || ''}
                onChange={(e) => updatePillar(index, 'icon', e.target.value)}
                className="input-field flex-1 min-w-[100px] text-sm"
              />
              <input
                type="text"
                placeholder="Title"
                value={pillar.title || ''}
                onChange={(e) => updatePillar(index, 'title', e.target.value)}
                className="input-field flex-1 min-w-[100px] text-sm"
              />
              <input
                type="text"
                placeholder="Description"
                value={pillar.description || ''}
                onChange={(e) => updatePillar(index, 'description', e.target.value)}
                className="input-field flex-1 min-w-[100px] text-sm"
              />
              <button
                onClick={() => removePillar(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <input
            type="text"
            placeholder="Icon name"
            value={newPillar.icon}
            onChange={(e) => setNewPillar({ ...newPillar, icon: e.target.value })}
            className="input-field flex-1 min-w-[80px] text-sm"
          />
          <input
            type="text"
            placeholder="Title"
            value={newPillar.title}
            onChange={(e) => setNewPillar({ ...newPillar, title: e.target.value })}
            className="input-field flex-1 min-w-[80px] text-sm"
          />
          <input
            type="text"
            placeholder="Description"
            value={newPillar.description}
            onChange={(e) => setNewPillar({ ...newPillar, description: e.target.value })}
            className="input-field flex-1 min-w-[80px] text-sm"
          />
          <button onClick={addPillar} className="btn-primary rounded-full px-4 py-2 text-sm flex items-center gap-1">
            <Plus size={16} /> Add
          </button>
        </div>
        <p className="text-xs text-text-light mt-2">Use Lucide icon names (e.g., Truck, Sparkles, ShieldCheck, Package)</p>
      </div>
    </div>
  )
}