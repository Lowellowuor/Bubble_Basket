import React, { createContext, useState, useEffect } from 'react'
import api from '../api/client'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const role = localStorage.getItem('role')
    const userId = localStorage.getItem('user_id')
    
    if (token && role && userId) {
      setUser({ role, id: parseInt(userId) })
    }
    setLoading(false)
  }, [])

  const login = async (phoneNumber, otp) => {
    const { data } = await api.post('/auth/verify-otp/', {
      phone_number: phoneNumber,
      otp,
    })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    localStorage.setItem('role', data.role)
    localStorage.setItem('user_id', data.user_id)
    setUser({ role: data.role, id: data.user_id })
    return data
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}