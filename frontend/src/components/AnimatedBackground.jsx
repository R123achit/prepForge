import { memo } from 'react'

// Optimized: Removed framer-motion animations, using pure CSS
const AnimatedBackground = memo(() => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Static gradient orbs with CSS animations */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-full blur-3xl animate-float" />
      <div className="absolute top-40 right-40 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-primary-500/10 to-primary-600/10 rounded-full blur-3xl animate-float-slow" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
    </div>
  )
})

AnimatedBackground.displayName = 'AnimatedBackground'

export default AnimatedBackground