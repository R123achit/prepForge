# 🎨 PrepForge Design System

## Overview
PrepForge uses a **premium glassmorphism design system** with consistent colors, animations, and components across the entire application.

## 🌈 Color Palette

### Primary Colors
```css
Purple: #a855f7 (primary)
Blue: #3b82f6 (secondary)
Green: #10b981 (accent)
```

### Background
```css
Base: bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900
Overlay: bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.2),rgba(255,255,255,0))]
```

### Glass Effects
```css
Glass Card: backdrop-blur-xl bg-white/10 border border-white/20
Glass Sidebar: backdrop-blur-xl bg-white/5 border border-white/10
```

## 🎭 Component Classes

### Buttons
```css
.btn-primary {
  @apply bg-gradient-to-r from-purple-600 to-blue-600 
         hover:from-purple-700 hover:to-blue-700 
         text-white font-semibold py-3 px-6 rounded-full 
         transition-all duration-300 shadow-lg hover:shadow-xl 
         hover:scale-105 hover:shadow-purple-500/25;
}

.btn-secondary {
  @apply backdrop-blur-xl bg-white/10 border border-white/20 
         hover:bg-white/20 text-white font-semibold py-3 px-6 
         rounded-full transition-all duration-300 
         hover:border-purple-500/50;
}
```

### Cards
```css
.card {
  @apply backdrop-blur-xl bg-white/10 border border-white/20 
         rounded-2xl p-6 shadow-xl hover:bg-white/15 
         transition-all duration-300 hover:scale-105;
}

.glass-card {
  @apply backdrop-blur-xl bg-white/5 border border-white/10 
         rounded-2xl shadow-2xl;
}
```

### Inputs
```css
.input {
  @apply w-full backdrop-blur-xl bg-white/10 border border-white/20 
         rounded-xl px-4 py-3 text-white placeholder-gray-400 
         focus:outline-none focus:border-purple-500 
         focus:ring-2 focus:ring-purple-500/20 transition-all;
}
```

### Text
```css
.gradient-text {
  @apply bg-gradient-to-r from-purple-400 to-blue-400 
         bg-clip-text text-transparent;
}
```

## ✨ Animation Guidelines

### Page Transitions
```jsx
// Standard page entry
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}

// Staggered elements
transition={{ delay: index * 0.1 }}
```

### Hover Effects
```jsx
// Cards and buttons
whileHover={{ scale: 1.05, y: -5 }}
whileTap={{ scale: 0.95 }}

// Icons
group-hover:scale-110 transition-transform
```

### Background Animations
```jsx
// Floating orbs
animate={{
  scale: [1, 1.2, 1],
  opacity: [0.3, 0.6, 0.3],
}}
transition={{ duration: 4, repeat: Infinity }}
```

## 🏗 Layout Structure

### Page Layout
```jsx
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
  {/* Background Effects */}
  <div className="fixed inset-0 z-0">
    <div className="absolute inset-0 bg-[radial-gradient(...)]" />
    {/* Floating orbs */}
  </div>
  
  {/* Content */}
  <div className="relative z-10">
    {/* Your content */}
  </div>
</div>
```

### Sidebar Layout
```jsx
<motion.aside className="w-64 backdrop-blur-xl bg-white/5 border-r border-white/10 fixed h-full z-10">
  {/* Sidebar content */}
</motion.aside>
```

## 🎯 Component Patterns

### Stat Cards
```jsx
<motion.div className="glass-card p-6 group cursor-pointer">
  <div className="flex items-center justify-between mb-4">
    <Icon className="w-10 h-10 text-purple-500 group-hover:scale-110 transition-transform" />
    <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full" />
  </div>
  <p className="text-gray-400 text-sm font-medium">{label}</p>
  <p className="text-3xl font-bold text-white">{value}</p>
</motion.div>
```

### Action Cards
```jsx
<motion.div 
  whileHover={{ scale: 1.05, y: -10 }}
  className="glass-card p-8 text-center cursor-pointer group relative overflow-hidden"
>
  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
  <div className="relative z-10">
    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
</motion.div>
```

## 🎨 Gradient Combinations

### Primary Gradients
- `from-purple-600 to-blue-600` (buttons, primary actions)
- `from-purple-500 to-blue-500` (icons, highlights)
- `from-purple-400 to-blue-400` (text gradients)

### Secondary Gradients
- `from-blue-500 to-green-500` (secondary actions)
- `from-green-500 to-purple-500` (accent elements)
- `from-slate-900 via-purple-900 to-slate-900` (backgrounds)

## 📱 Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

## 🔧 Implementation Checklist

### ✅ Completed Components
- [x] Landing Page
- [x] Layout/Sidebar
- [x] Login Page
- [x] Register Page
- [x] Dashboard
- [x] LoadingSpinner
- [x] Global CSS
- [x] AIChatbot Component
- [x] InterviewVideo Page
- [x] InterviewRoom Page

### 🚧 Remaining Components
- [ ] AI Interview Pages
- [ ] Live Interview Pages
- [ ] Profile Page
- [ ] Resume Builder
- [ ] Notification Component

## 🎯 Design Principles

1. **Consistency**: All components use the same color palette and glass effects
2. **Smooth Animations**: Every interaction has a smooth transition
3. **Visual Hierarchy**: Clear typography and spacing
4. **Accessibility**: Proper contrast ratios and focus states
5. **Performance**: Optimized animations and effects

---

**Next Steps**: Apply this design system to all remaining components to ensure complete visual consistency across PrepForge.