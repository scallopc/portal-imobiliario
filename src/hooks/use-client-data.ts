import { useState, useEffect } from 'react'

interface ClientData {
  name?: string
  email?: string
  phone?: string
}

const CLIENT_DATA_KEY = 'jade_client_data'

export function useClientData() {
  const [clientData, setClientDataState] = useState<ClientData>({})

  useEffect(() => {
    const stored = sessionStorage.getItem(CLIENT_DATA_KEY)
    if (stored) {
      try {
        setClientDataState(JSON.parse(stored))
      } catch (error) {
        console.error('Erro ao carregar dados do cliente:', error)
      }
    }
  }, [])

  const setClientData = (data: Partial<ClientData>) => {
    const updated = { ...clientData, ...data }
    setClientDataState(updated)
    sessionStorage.setItem(CLIENT_DATA_KEY, JSON.stringify(updated))
  }

  const clearClientData = () => {
    setClientDataState({})
    sessionStorage.removeItem(CLIENT_DATA_KEY)
  }

  const hasClientData = () => {
    return !!(clientData.name || clientData.email || clientData.phone)
  }

  return {
    clientData,
    setClientData,
    clearClientData,
    hasClientData: hasClientData(),
  }
}
