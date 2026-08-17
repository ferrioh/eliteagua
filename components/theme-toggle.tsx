'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDark(document.documentElement.classList.contains('dark'))
      setMounted(true)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('elite-theme', next ? 'dark' : 'light') } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
      className={`inline-flex items-center justify-center rounded-full p-2 transition-colors ${className ?? 'text-muted-foreground hover:text-primary'}`}
    >
      {mounted && (dark ? <Sun className="size-4" /> : <Moon className="size-4" />)}
      {!mounted && <span className="size-4 rounded-full bg-border" aria-hidden="true" />}
    </button>
  )
}