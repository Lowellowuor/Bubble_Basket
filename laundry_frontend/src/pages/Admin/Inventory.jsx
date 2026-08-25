import { useState, useEffect } from 'react'
import api from '../../api/client'
import { Plus, Package, Edit2, Trash2 } from 'lucide-react'

export function AdminInventory() {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState({ name: '', category: '', quantity: 0, unit_cost: 0 })

  useEffect(() => {
    api.get('/admin/inventory/').then((res) => setItems(res.data))
  }, [])

  const addItem = async () => {
    await api.post('/admin/inventory/', newItem)
    const { data } = await api.get('/admin/inventory/')
    setItems(data)
    setNewItem({ name: '', category: '', quantity: 0, unit_cost: 0 })
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <h2 className="section-title flex items-center gap-2">
        <Package size={28} />
        Inventory
      </h2>

      <div className="card">
        <h4 className="font-semibold text-brand-green mb-3 flex items-center gap-2">
          <Plus size={18} />
          Add New Item
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Category"
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Unit Cost"
            value={newItem.unit_cost}
            onChange={(e) => setNewItem({ ...newItem, unit_cost: parseFloat(e.target.value) })}
            className="input-field"
          />
        </div>
        <button onClick={addItem} className="btn-primary rounded-full mt-3 px-6 flex items-center gap-2">
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="card">
        <h4 className="font-semibold text-brand-green mb-3">Current Stock</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-text-secondary border-b border-gray-100">
              <tr>
                <th className="text-left py-2">Name</th>
                <th className="text-left">Category</th>
                <th className="text-left">Qty</th>
                <th className="text-left">Cost</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-2">{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.quantity}</td>
                  <td>KES {item.unit_cost}</td>
                  <td>
                    <button className="text-blue-500 hover:text-blue-700 mr-2"><Edit2 size={16} /></button>
                    <button className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}