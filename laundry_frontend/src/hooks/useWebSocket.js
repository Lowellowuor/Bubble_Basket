import { useEffect, useRef, useState } from 'react'

export function useWebSocket(orderId) {
  const [status, setStatus] = useState(null)
  const ws = useRef(null)

  useEffect(() => {
    if (!orderId) return
    const url = `${import.meta.env.VITE_WS_URL}/orders/${orderId}/`
    ws.current = new WebSocket(url)

    ws.current.onopen = () => console.log('WS connected')
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setStatus(data)
    }
    ws.current.onclose = () => console.log('WS disconnected')

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [orderId])

  return status
}