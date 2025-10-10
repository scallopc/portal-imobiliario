"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Activity } from "lucide-react"

interface ChatHealthStatus {
  status: 'healthy' | 'unhealthy' | 'error'
  checks: {
    gemini: boolean
    firebase: boolean
    timestamp: string
  }
  message: string
  error?: string
}

export function ChatStatus() {
  const [status, setStatus] = useState<ChatHealthStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkChatHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/chat/health')
      const data = await response.json()
      setStatus(data)
      setLastCheck(new Date())
    } catch (error) {
      setStatus({
        status: 'error',
        checks: { gemini: false, firebase: false, timestamp: new Date().toISOString() },
        message: 'Erro ao verificar status',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkChatHealth()
    // Auto-refresh a cada 5 minutos
    const interval = setInterval(checkChatHealth, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="h-5 w-5 animate-spin" />
    if (!status) return <AlertCircle className="h-5 w-5 text-gray-400" />
    
    switch (status.status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'unhealthy':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    if (!status) return 'secondary'
    switch (status.status) {
      case 'healthy': return 'default'
      case 'unhealthy': return 'secondary'
      case 'error': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Status do Chat da Jade
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={checkChatHealth}
          disabled={loading}
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Geral */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium">
                {status?.message || 'Verificando...'}
              </span>
            </div>
            <Badge variant={getStatusColor()}>
              {status?.status?.toUpperCase() || 'UNKNOWN'}
            </Badge>
          </div>

          {/* Detalhes dos Serviços */}
          {status?.checks && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">Serviços:</h4>
              
              <div className="flex items-center justify-between text-sm">
                <span>Google Gemini AI</span>
                <div className="flex items-center gap-1">
                  {status.checks.gemini ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={status.checks.gemini ? 'text-green-600' : 'text-red-600'}>
                    {status.checks.gemini ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span>Firebase Database</span>
                <div className="flex items-center gap-1">
                  {status.checks.firebase ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={status.checks.firebase ? 'text-green-600' : 'text-red-600'}>
                    {status.checks.firebase ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Erro */}
          {status?.error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <strong>Erro:</strong> {status.error}
            </div>
          )}

          {/* Última Verificação */}
          {lastCheck && (
            <div className="text-xs text-gray-500">
              Última verificação: {lastCheck.toLocaleString('pt-BR')}
            </div>
          )}

          {/* Ações Rápidas */}
          <div className="pt-2 border-t">
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Troubleshooting:</strong></p>
              <p>• Verifique variáveis de ambiente</p>
              <p>• Execute: <code className="bg-gray-100 px-1 rounded">node scripts/diagnose-chat.js</code></p>
              <p>• Consulte: <code className="bg-gray-100 px-1 rounded">CHAT_TROUBLESHOOTING.md</code></p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
