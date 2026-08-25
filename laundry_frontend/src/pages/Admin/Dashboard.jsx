import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { 
  BarChart3, 
  Package, 
  Tag, 
  DollarSign, 
  ShoppingBag, 
  Users,
  PenTool,
  LayoutDashboard,
  CreditCard,
  Clock
} from 'lucide-react'

export function AdminDashboard() {
  const [revenue, setRevenue] = useState(null)
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revenueRes, customersRes, ordersRes] = await Promise.all([
          api.get('/admin/analytics/revenue/?period=day'),
          api.get('/admin/analytics/customers/'),
          api.get('/orders/')
        ])
        setRevenue(revenueRes.data)
        setCustomers(customersRes.data)
        setOrders(ordersRes.data)
      } catch (error) {
        console.error('Error fetching admin data:', error)
      }
    }
    fetchData()
  }, [])

  const pendingOrders = orders.filter(o => o.payment_status === 'pending')
  const pendingAmount = pendingOrders.reduce((sum, o) => sum + (o.total_price || 0), 0)

  const stats = [
    { label: "Today's Revenue", value: `KES ${revenue?.total_revenue || 0}`, icon: DollarSign, color: 'text-brand-green' },
    { label: "Orders Today", value: revenue?.order_count || 0, icon: ShoppingBag, color: 'text-brand-gold' },
    { label: "Active Customers", value: customers.length, icon: Users, color: 'text-blue-500' },
    { label: "Total Orders", value: orders.length, icon: Package, color: 'text-purple-500' },
    { label: "Pending Payments", value: `KES ${pendingAmount}`, icon: Clock, color: 'text-yellow-500' },
  ]

  const quickActions = [
    { to: '/admin/inventory', icon: Package, label: 'Inventory', desc: 'Manage stock' },
    { to: '/admin/promotions', icon: Tag, label: 'Promotions', desc: 'Create discounts' },
    { to: '/admin/pricing', icon: DollarSign, label: 'Pricing', desc: 'Update prices' },
    { to: '/admin/branding', icon: PenTool, label: 'Branding', desc: 'Edit site content' },
    { to: '/admin/payments', icon: CreditCard, label: 'Payments', desc: 'View transactions' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics', desc: 'View reports' },
  ]

  return (
    <div className="animate-fadeIn space-y-6">
      <h2 className="section-title flex items-center gap-2">
        <LayoutDashboard size={28} />
        Admin Overview
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`p-3 rounded-full bg-${stat.color}/10 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-text-secondary">{stat.label}</p>
              <p className="text-2xl font-brand text-brand-green">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickActions.map((action) => (
          <Link key={action.to} to={action.to} className="card text-center hover:shadow-hover transition-shadow p-4">
            <action.icon size={32} className="mx-auto text-brand-green mb-2" />
            <h4 className="font-semibold text-sm">{action.label}</h4>
            <p className="text-xs text-text-light">{action.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent Customers */}
      <div className="card">
        <h3 className="font-semibold text-brand-green mb-3 flex items-center gap-2">
          <Users size={18} />
          Recent Customers
        </h3>
        <div className="divide-y divide-gray-100">
          {customers.slice(0, 5).map((c) => (
            <div key={c.user_id} className="py-2 flex justify-between text-sm">
              <span>{c.name || c.phone}</span>
              <span className="text-text-light">{c.order_count} orders</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}