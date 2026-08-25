import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { Pricing } from './pages/Pricing'
import { ClientDashboard } from './pages/Client/Dashboard'
import { NewOrder } from './pages/Client/NewOrder'
import { OrderTracker } from './pages/Client/OrderTracker'
import { Profile } from './pages/Client/Profile'
import { Loyalty } from './pages/Client/Loyalty'
import { Subscriptions } from './pages/Client/Subscriptions'
import { StaffDashboard } from './pages/Staff/Dashboard'
import { RiderDashboard } from './pages/Rider/Dashboard'
import { AdminDashboard } from './pages/Admin/Dashboard'
import { AdminInventory } from './pages/Admin/Inventory'
import { AdminPromotions } from './pages/Admin/Promotions'
import { AdminAnalytics } from './pages/Admin/Analytics'
import { AdminBranding } from './pages/Admin/Branding'
import { AdminPricing } from './pages/Admin/Pricing'
import { AdminPayments } from './pages/Admin/Payments'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={<Login />} />

      {/* Authenticated Routes (with Layout) */}
      <Route element={<Layout />}>
        {/* Client */}
        <Route path="/client" element={<ProtectedRoute allowedRoles={['client']}><ClientDashboard /></ProtectedRoute>} />
        <Route path="/client/new-order" element={<ProtectedRoute allowedRoles={['client']}><NewOrder /></ProtectedRoute>} />
        <Route path="/client/orders/:id" element={<ProtectedRoute allowedRoles={['client']}><OrderTracker /></ProtectedRoute>} />
        <Route path="/client/profile" element={<ProtectedRoute allowedRoles={['client']}><Profile /></ProtectedRoute>} />
        <Route path="/client/loyalty" element={<ProtectedRoute allowedRoles={['client']}><Loyalty /></ProtectedRoute>} />
        <Route path="/client/subscriptions" element={<ProtectedRoute allowedRoles={['client']}><Subscriptions /></ProtectedRoute>} />

        {/* Staff */}
        <Route path="/staff" element={<ProtectedRoute allowedRoles={['shop_staff']}><StaffDashboard /></ProtectedRoute>} />

        {/* Rider */}
        <Route path="/rider" element={<ProtectedRoute allowedRoles={['rider']}><RiderDashboard /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={['admin']}><AdminInventory /></ProtectedRoute>} />
        <Route path="/admin/promotions" element={<ProtectedRoute allowedRoles={['admin']}><AdminPromotions /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/branding" element={<ProtectedRoute allowedRoles={['admin']}><AdminBranding /></ProtectedRoute>} />
        <Route path="/admin/pricing" element={<ProtectedRoute allowedRoles={['admin']}><AdminPricing /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><AdminPayments /></ProtectedRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App