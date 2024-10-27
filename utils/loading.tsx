// D:\programUse\workspace\nextjsWorkapace\whm-system\utils\loading.tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: number
  color?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 40, color = '#3B82F6' }) => {
  return (
    <div className="flex justify-center items-center">
      <motion.div
        style={{
          width: size,
          height: size,
          border: `4px solid ${color}`,
          borderTop: '4px solid transparent',
          borderRadius: '50%',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

interface WithLoadingProps {
  loading: boolean
  children: React.ReactNode
}

export const WithLoading: React.FC<WithLoadingProps> = ({ loading, children }) => {
  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 bg-white bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 w-full h-full">
          <LoadingSpinner />
        </div>
      )}
      {children}
    </div>
  )
}
