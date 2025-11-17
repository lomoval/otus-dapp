'use client'

import { useState } from 'react'
import { Trash2, Clock, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

interface LogEntry {
  timestamp: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

interface LogsProps {
  logs: LogEntry[]
  clearLogs: () => void
}

export default function Logs({ logs, clearLogs }: LogsProps) {
  const [autoScroll, setAutoScroll] = useState(true)

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getLogClass = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'log-success'
      case 'error':
        return 'log-error'
      case 'warning':
        return 'log-warning'
      case 'info':
      default:
        return 'log-info'
    }
  }

  // Auto-scroll to bottom when new logs are added
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const isAtBottom = element.scrollHeight - element.scrollTop === element.clientHeight
    setAutoScroll(isAtBottom)
  }

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Activity Logs
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearLogs}
            disabled={logs.length === 0}
            className="p-2 text-gray-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Clear logs"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="log-container" onScroll={handleScroll}>
        {logs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No activity yet</p>
            <p className="text-sm">Connect a wallet to see logs</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div key={index} className={`log-entry ${getLogClass(log.type)}`}>
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {getLogIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500 font-mono">
                        {log.timestamp}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed break-words">
                      {log.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 flex justify-between items-center">
        <span>
          {logs.length} log{logs.length !== 1 ? 's' : ''}
        </span>
        {logs.length > 0 && (
          <button
            onClick={() => {
              const container = document.querySelector('.log-container') as HTMLElement
              if (container) {
                container.scrollTop = container.scrollHeight
              }
            }}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            Scroll to bottom
          </button>
        )}
      </div>
    </div>
  )
}
