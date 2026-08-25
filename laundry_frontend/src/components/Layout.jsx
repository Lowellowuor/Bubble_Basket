import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { 
  LogOut, 
  ShoppingBag, 
  Heart,
  User,
  Award,
  TrendingUp,
  LayoutDashboard,
  Sparkles
} from 'lucide-react'

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const dashboardPath = user ? `/${user.role}` : '/'

  const clientNavItems = [
    { path: '/client', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/client/profile', icon: User, label: 'Profile' },
    { path: '/client/loyalty', icon: Award, label: 'Loyalty' },
    { path: '/client/subscriptions', icon: TrendingUp, label: 'Plans' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-brand-lavender">
      <header className="bg-brand-white border-b border-brand-indigo/5 shadow-soft sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to={dashboardPath} className="flex items-center gap-2">
            <ShoppingBag size={32} className="text-brand-pink" />
            <span className="font-heading text-2xl text-brand-indigo">Bubble Basket</span>
          </Link>

          <div className="flex items-center gap-3">
            {user?.role === 'client' && (
              <div className="hidden md:flex items-center gap-1">
                {clientNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="text-sm text-text-secondary hover:text-brand-pink px-3 py-1.5 rounded-full hover:bg-brand-lavender transition-colors flex items-center gap-1.5"
                  >
                    <item.icon size={16} className="text-brand-pink" />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
            
            {user ? (
              <>
                <span className="hidden sm:inline text-sm font-medium text-text-secondary capitalize bg-brand-lavender px-3 py-1 rounded-full">
                  {user.role.replace('_', ' ')}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-brand-pink transition-colors"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-1.5 px-5">
                Login
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      <footer className="bg-brand-indigo text-white/80 text-center text-sm py-6 mt-6">
        <p>© {new Date().getFullYear()} Bubble Basket Laundry — Daystar, Athi River</p>
        <p className="text-white/60 text-xs mt-1 flex items-center justify-center gap-1">
          We clean more than clothes, we care for you
          <Heart size={12} className="inline text-brand-pink" />
        </p>
      </footer>
    </div>
  )
}