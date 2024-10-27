'use client'

import * as React from 'react'
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react'

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ')

interface BaseMessageProps extends HTMLMotionProps<"div"> {
  message: string
  icon: React.ElementType
  bgColor: string
  textColor: string
  borderColor: string
  duration?: number
  onClose?: () => void
}

const BaseMessage: React.FC<BaseMessageProps> = ({
  className = "",
  message,
  icon: Icon,
  bgColor,
  textColor,
  borderColor,
  duration = 5000,
  onClose,
  ...props
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-center rounded-lg border p-4 shadow-md",
        bgColor,
        textColor,
        borderColor,
        className
      )}
      {...props}
    >
      <Icon className="mr-2 h-5 w-5" />
      <span className="text-sm">{message}</span>
    </motion.div>
  )
}

export const InfoMessage: React.FC<{ message: string; duration?: number; onClose?: () => void }> = ({ message, duration, onClose }) => (
  <BaseMessage
    message={message}
    duration={duration}
    onClose={onClose}
    icon={Info}
    bgColor="bg-blue-100"
    textColor="text-blue-800"
    borderColor="border-blue-200"
  />
)

export const SuccessMessage: React.FC<{ message: string; duration?: number; onClose?: () => void }> = ({ message, duration, onClose }) => (
  <BaseMessage
    message={message}
    duration={duration}
    onClose={onClose}
    icon={CheckCircle2}
    bgColor="bg-green-100"
    textColor="text-green-800"
    borderColor="border-green-200"
  />
)

export const WarningMessage: React.FC<{ message: string; duration?: number; onClose?: () => void }> = ({ message, duration, onClose }) => (
  <BaseMessage
    message={message}
    duration={duration}
    onClose={onClose}
    icon={AlertCircle}
    bgColor="bg-yellow-100"
    textColor="text-yellow-800"
    borderColor="border-yellow-200"
  />
)

export const ErrorMessage: React.FC<{ message: string; duration?: number; onClose?: () => void }> = ({ message, duration, onClose }) => (
  <BaseMessage
    message={message}
    duration={duration}
    onClose={onClose}
    icon={XCircle}
    bgColor="bg-red-100"
    textColor="text-red-800"
    borderColor="border-red-200"
  />
)

export function MessageDemo() {
  const [messages, setMessages] = React.useState<Array<{ id: number; type: 'info' | 'success' | 'warning' | 'error'; content: string }>>([])

  const addMessage = (type: 'info' | 'success' | 'warning' | 'error', content: string) => {
    const id = Date.now()
    setMessages(prev => [...prev, { id, type, content }])
  }

  const removeMessage = (id: number) => {
    setMessages(prev => prev.filter(message => message.id !== id))
  }

  const showMessage = (type: 'info' | 'success' | 'warning' | 'error') => {
    const messageTexts = {
      info: '這是一條信息提示',
      success: '操作成功完成',
      warning: '請注意，這是一條警告',
      error: '錯誤！操作失敗'
    }
    addMessage(type, messageTexts[type])
  }

  const MessageComponent = {
    info: InfoMessage,
    success: SuccessMessage,
    warning: WarningMessage,
    error: ErrorMessage
  }

  return (
    <div className="relative">
      <div className="space-y-4">
        <div className="flex space-x-2">
          <button onClick={() => showMessage('info')} className="px-4 py-2 bg-blue-200 text-blue-800 rounded">信息</button>
          <button onClick={() => showMessage('success')} className="px-4 py-2 bg-green-200 text-green-800 rounded">成功</button>
          <button onClick={() => showMessage('warning')} className="px-4 py-2 bg-yellow-200 text-yellow-800 rounded">警告</button>
          <button onClick={() => showMessage('error')} className="px-4 py-2 bg-red-200 text-red-800 rounded">錯誤</button>
        </div>
      </div>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 space-y-2 w-80 z-50">
        <AnimatePresence>
          {messages.map(({ id, type, content }) => {
            const MessageComp = MessageComponent[type]
            return (
              <MessageComp
                key={id}
                message={content}
                duration={5000}
                onClose={() => removeMessage(id)}
              />
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<Array<{ id: number; type: 'info' | 'success' | 'warning' | 'error'; content: string }>>([])

  const addMessage = (type: 'info' | 'success' | 'warning' | 'error', content: string) => {
    const id = Date.now()
    setMessages(prev => [...prev, { id, type, content }])
  }

  const removeMessage = (id: number) => {
    setMessages(prev => prev.filter(message => message.id !== id))
  }

  const MessageComponent = {
    info: InfoMessage,
    success: SuccessMessage,
    warning: WarningMessage,
    error: ErrorMessage
  }

  return (
    <>
      {children}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 space-y-2 w-80 z-50">
        <AnimatePresence>
          {messages.map(({ id, type, content }) => {
            const MessageComp = MessageComponent[type]
            return (
              <MessageComp
                key={id}
                message={content}
                duration={5000}
                onClose={() => removeMessage(id)}
              />
            )
          })}
        </AnimatePresence>
      </div>
    </>
  )
}

export const useMessage = () => {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0)
  
  const showMessage = React.useCallback((type: 'info' | 'success' | 'warning' | 'error', content: string) => {
    const event = new CustomEvent('show-message', { detail: { type, content } })
    window.dispatchEvent(event)
    forceUpdate()
  }, [])

  return { showMessage }
}