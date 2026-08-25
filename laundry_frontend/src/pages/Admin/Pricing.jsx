import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save,
  Edit2,
  X,
  Check
} from 'lucide-react'

export function AdminPricing() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState(null)
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' })
  const [newItem, setNewItem] = useState({ service: '', price: '' })

  useEffect(() => {
    fetchPricing()
  }, [])

  const fetchPricing = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/pricing-categories/')
      setCategories(data)
    } catch (error) {
      console.error('Error fetching pricing:', error)
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async () => {
    if (!newCategory.name) return
    try {
      const { data } = await api.post('/admin/pricing-categories/', {
        ...newCategory,
        is_active: true
      })
      setCategories([...categories, data])
      setNewCategory({ name: '', icon: '' })
    } catch (error) {
      alert('Failed to add category')
    }
  }

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category and all its items?')) return
    try {
      await api.delete(`/admin/pricing-categories/${id}/`)
      setCategories(categories.filter(c => c.id !== id))
    } catch (error) {
      alert('Failed to delete category')
    }
  }

  const addItem = async (categoryId) => {
    if (!newItem.service || !newItem.price) return
    try {
      const { data } = await api.post('/admin/pricing-items/', {
        category: categoryId,
        ...newItem,
        is_active: true
      })
      // Update category items locally
      setCategories(categories.map(cat => {
        if (cat.id === categoryId) {
          return { ...cat, items: [...cat.items, data] }
        }
        return cat
      }))
      setNewItem({ service: '', price: '' })
    } catch (error) {
      alert('Failed to add item')
    }
  }

  const deleteItem = async (itemId, categoryId) => {
    if (!confirm('Delete this item?')) return
    try {
      await api.delete(`/admin/pricing-items/${itemId}/`)
      setCategories(categories.map(cat => {
        if (cat.id === categoryId) {
          return { ...cat, items: cat.items.filter(item => item.id !== itemId) }
        }
        return cat
      }))
    } catch (error) {
      alert('Failed to delete item')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-brand-green">Loading pricing...</div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-text-secondary hover:text-brand-green transition-colors mb-4">
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <h2 className="section-title mb-6">Pricing Management</h2>

      {/* Add Category */}
      <div className="card mb-6">
        <h4 className="font-semibold text-brand-green mb-3 flex items-center gap-2">
          <Plus size={18} />
          Add Category
        </h4>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Category name (e.g., Clothes)"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            className="input-field flex-1 min-w-[150px]"
          />
          <input
            type="text"
            placeholder="Icon (emoji or Lucide name)"
            value={newCategory.icon}
            onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
            className="input-field flex-1 min-w-[150px]"
          />
          <button onClick={addCategory} className="btn-primary rounded-full px-6 flex items-center gap-2">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Categories List */}
      {categories.map((cat) => (
        <div key={cat.id} className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-brand text-lg text-brand-green">
              {cat.icon} {cat.name}
            </h3>
            <button
              onClick={() => deleteCategory(cat.id)}
              className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-2 mb-3">
            {cat.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                <span>{item.service}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-brand-green">{item.price}</span>
                  <button
                    onClick={() => deleteItem(item.id, cat.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Item */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Service name"
              value={newItem.service}
              onChange={(e) => setNewItem({ ...newItem, service: e.target.value })}
              className="input-field flex-1 min-w-[120px] text-sm"
            />
            <input
              type="text"
              placeholder="Price (e.g., 80 KSH)"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="input-field flex-1 min-w-[120px] text-sm"
            />
            <button
              onClick={() => addItem(cat.id)}
              className="btn-primary rounded-full px-4 py-1.5 text-sm flex items-center gap-1"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>
        </div>
      ))}

      {categories.length === 0 && (
        <div className="card text-center py-12 text-text-light">
          <p>No pricing categories yet. Add one above.</p>
        </div>
      )}
    </div>
  )
}