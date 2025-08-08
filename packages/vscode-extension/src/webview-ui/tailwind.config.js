/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Cores de texto frequentemente usadas
    'text-blue-400', 'text-green-400', 'text-purple-400', 'text-red-400', 
    'text-orange-400', 'text-indigo-400', 'text-yellow-400', 'text-white',
    'text-slate-300', 'text-slate-400', 'text-slate-500',
    
    // Backgrounds
    'bg-slate-700', 'bg-slate-800', 'bg-slate-900', 'bg-slate-700/50', 'bg-slate-800/30',
    'bg-slate-800/50', 'bg-slate-800/70', 'bg-white/5', 'bg-white/10', 'bg-white/20',
    'bg-black/20',
    
    // Borders
    'border-slate-600', 'border-slate-700', 'border-l-4',
    
    // Gradients
    'from-blue-500', 'to-blue-600', 'from-blue-600', 'via-purple-600', 'to-blue-800',
    'from-green-500', 'to-green-600', 'from-purple-500', 'to-purple-600',
    'from-orange-500', 'to-orange-600', 'from-red-500', 'to-red-600',
    'from-indigo-500', 'to-indigo-600', 'from-white', 'to-blue-200',
    'from-slate-700/50', 'to-slate-800/50', 'from-slate-600/50', 'to-slate-700/50',
    'from-transparent', 'via-white/20', 'to-transparent',
    
    // Animações
    'animate-spin', 'animate-pulse', 'animate-bounce',
    
    // Tamanhos e espaçamentos
    'w-4', 'w-5', 'w-6', 'w-8', 'w-10', 'w-12', 'w-48', 'w-64', 'w-80',
    'h-4', 'h-5', 'h-6', 'h-8', 'h-10', 'h-12', 'h-48', 'h-64', 'h-80',
    'max-w-7xl', 'max-h-80',
    
    // Flexbox e Grid
    'lg:col-span-2', 'md:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4', 'lg:grid-cols-6',
    'grid-cols-2', 'grid-cols-3',
    
    // Responsividade
    'md:grid-cols-3', 'lg:grid-cols-6',
    
    // Estados hover
    'hover:bg-slate-700/30', 'hover:bg-slate-800/70', 'hover:from-slate-600/50',
    'hover:to-slate-700/50', 'hover:scale-105', 'hover:shadow-2xl',
    'group-hover:opacity-100', 'group-hover:translate-x-full',
    
    // Transformações
    'scale-105', '-translate-x-full', 'translate-x-full', '-translate-y-32', 
    'translate-x-32', 'translate-y-24', '-translate-x-24',
    
    // Backdrop
    'backdrop-blur-sm',
    
    // Z-index
    'z-10',
    
    // Opacidade
    'opacity-90', 'opacity-100',
    
    // Transições
    'transition-all', 'transition-colors', 'transition-opacity', 'transition-transform',
    'duration-150', 'duration-200', 'duration-300', 'duration-700',
  ],
  theme: {
    extend: {
      colors: {
        // Cores específicas do VS Code (fallbacks para quando CSS vars não estão disponíveis)
        vscode: {
          background: 'var(--vscode-editor-background, #1e1e1e)',
          foreground: 'var(--vscode-editor-foreground, #cccccc)',
          selection: 'var(--vscode-editor-selectionBackground, #264f78)',
          hover: 'var(--vscode-list-hoverBackground, #2a2d2e)',
          active: 'var(--vscode-list-activeSelectionBackground, #0e639c)',
          border: 'var(--vscode-widget-border, #454545)',
          accent: 'var(--vscode-focusBorder, #007acc)',
          button: 'var(--vscode-button-background, #0e639c)',
          buttonHover: 'var(--vscode-button-hoverBackground, #1177bb)',
          input: 'var(--vscode-input-background, #3c3c3c)',
          sidebar: 'var(--vscode-sideBar-background, #252526)',
          panel: 'var(--vscode-panel-background, #1e1e1e)',
        },
        // Cores do tema padrão para garantir consistência
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        green: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        red: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        yellow: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
        purple: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        orange: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
        indigo: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
      },
      fontFamily: {
        mono: ['var(--vscode-editor-font-family, Consolas)', 'Monaco', 'Courier New', 'monospace'],
        sans: ['var(--vscode-font-family, -apple-system)', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'vscode': 'var(--vscode-font-size, 13px)',
      },
    },
  },
  plugins: [],
}