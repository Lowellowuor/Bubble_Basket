import { useState, useEffect } from 'react'
import api from '../../api/client'
import { Tag, Plus, Percent } from 'lucide-react'

export function AdminPromotions() {
  const [promos, setPromos] = useState([])
  const [newPromo, setNewPromo] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 0,
    start_date: '',
    end_date: '',
    usage_limit: 1,
  })

  useEffect(() => {
    api.get('/admin/promo-codes/').then((res) => setPromos(res.data))
  }, [])

  const addPromo = async () => {
    await api.post('/admin/promo-codes/', newPromo)
    const { data } = await api.get('/admin/promo-codes/')
    setPromos(data)
    setNewPromo({ code: '', discount_type: 'percentage', discount_value: 0, start_date: '', end_date: '', usage_limit: 1 })
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <h2 className="section-title flex items-center gap-2">
        <Tag size={28} />
        Promotions
      </h2>

      <div className="card">
        <h4 className="font-semibold text-brand-green mb-3 flex items-center gap-2">
          <Plus size={18} />
          Create Promo Code
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Code"
            value={newPromo.code}
            onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
            className="input-field"
          />
          <select
            value={newPromo.discount_type}
            onChange={(e) => setNewPromo({ ...newPromo, discount_type: e.target.value })}
            className="input-field"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
          <input
            type="number"
            placeholder="Value"
            value={newPromo.discount_value}
            onChange={(e) => setNewPromo({ ...newPromo, discount_value: parseFloat(e.target.value) })}
            className="input-field"
          />
          <input
            type="datetime-local"
            value={newPromo.start_date}
            onChange={(e) => setNewPromo({ ...newPromo, start_date: e.target.value })}
            className="input-field"
          />
          <input
            type="datetime-local"
            value={newPromo.end_date}
            onChange={(e) => setNewPromo({ ...newPromo, end_date: e.target.value })}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Usage limit"
            value={newPromo.usage_limit}
            onChange={(e) => setNewPromo({ ...newPromo, usage_limit: parseInt(e.target.value) })}
            className="input-field"
          />
        </div>
        <button onClick={addPromo} className="btn-primary rounded-full mt-3 px-6 flex items-center gap-2">
          <Plus size={16} /> Create
        </button>
      </div>

      <div className="card">
        <h4 className="font-semibold text-brand-green mb-3">Active Promos</h4>
        <ul className="space-y-2">
          {promos.map((p) => (
            <li key={p.id} className="flex justify-between items-center border-b border-gray-100 py-2">
              <span className="font-mono text-brand-green">{p.code}</span>
              <span className="text-sm flex items-center gap-1">
                {p.discount_type === 'percentage' ? <Percent size={14} /> : 'KES'}
                {p.discount_type === 'percentage' ? `${p.discount_value}%` : p.discount_value}
              </span>
              <span className="text-xs text-text-light">Used: {p.used_count}/{p.usage_limit}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}