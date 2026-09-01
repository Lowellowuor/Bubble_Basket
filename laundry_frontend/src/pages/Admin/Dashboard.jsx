import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  Clock,
  TrendingUp
} from 'lucide-react'

export function AdminDashboard() {
  const navigate = useNavigate()
  const [revenue, setRevenue] = useState(null)
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [pendingTotal, setPendingTotal] = useState(0)

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
        
        // Calculate pending payments total – ensure we parse numbers
        const pendingOrders = ordersRes.data.filter(o => o.payment_status === 'pending')
        const totalPending = pendingOrders.reduce((sum, o) => {
          const price = typeof o.total_price === 'number' ? o.total_price : parseFloat(o.total_price) || 0
          return sum + price
        }, 0)
        setPendingTotal(totalPending)
      } catch (error) {
        console.error('Error fetching admin data:', error)
      }
    }
    fetchData()
  }, [])

  const stats = [
    { 
      label: "Today's Revenue", 
      value: `KES ${revenue?.total_revenue || 0}`, 
      icon: DollarSign, 
      color: 'text-brand-green',
      nav: '/admin/analytics?period=day'
    },
    { 
      label: "Orders Today", 
      value: revenue?.order_count || 0, 
      icon: ShoppingBag, 
      color: 'text-brand-gold',
      nav: '/admin/payments?status=all'
    },
    { 
      label: "Active Customers", 
      value: customers.length, 
      icon: Users, 
      color: 'text-blue-500',
      nav: '/admin/analytics?tab=customers'
    },
    { 
      label: "Total Orders", 
      value: orders.length, 
      icon: Package, 
      color: 'text-purple-500',
      nav: '/admin/payments'
    },
    { 
      label: "Pending Payment", 
      value: `KES ${pendingTotal.toFixed(2)}`, 
      icon: Clock, 
      color: 'text-yellow-600',
      nav: '/admin/payments?status=pending'
    },
  ]

  const quickActions = [
    { to: '/admin/inventory', icon: Package, label: 'Inventory', desc: 'Manage stock' },
    { to: '/admin/promotions', icon: Tag, label: 'Promotions', desc: 'Create discounts' },
    { to: '/admin/pricing', icon: CreditCard, label: 'Pricing', desc: 'Update prices' },
    { to: '/admin/branding', icon: PenTool, label: 'Branding', desc: 'Edit site content' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics', desc: 'View reports' },
  ]

  return (
    <div className="animate-fadeIn space-y-6">
      <h2 className="section-title flex items-center gap-2">
        <LayoutDashboard size={28} />
        Admin Overview
      </h2>

      {/* Stats Cards - clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            onClick={() => navigate(stat.nav)}
            className="card flex items-center gap-4 cursor-pointer hover:shadow-softHover transition-shadow"
          >
            <div className={`p-3 rounded-full bg-${stat.color}/10 ${stat.color} flex-shrink-0`}>
              <stat.icon size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-text-secondary truncate">{stat.label}</p>
              <p className="text-xl font-heading text-brand-indigo truncate">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {quickActions.map((action) => (
          <Link key={action.to} to={action.to} className="card text-center hover:shadow-softHover transition-shadow p-4">
            <action.icon size={32} className="mx-auto text-brand-pink mb-2" />
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