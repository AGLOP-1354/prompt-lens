'use client'

import { AuthProvider } from '@/src/context/AuthProvider'
import AuthModal from '@/src/components/ui/AuthModal'

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
      <AuthModal />
    </AuthProvider>
  )
}

export default Providers
