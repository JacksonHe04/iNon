'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import type { ThemeType } from '@/types/layout'

interface Blob {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  color: string
  blur: number
}

interface MouseRipple {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
  delay: number
  fadeOut: boolean
}

interface AmbientRipple {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
  speed: number
}

const CANVAS_THEMES: Record<
  ThemeType,
  {
    gradient: {
      light: [string, string, string]
      dark: [string, string, string]
    }
    blobs: {
      light: string[]
      dark: string[]
    }
    ripples: {
      light: [string, string, string]
      dark: [string, string, string]
    }
  }
> = {
  green: {
    gradient: {
      light: ['#E5F5EF', '#D0EDE3', '#BCE5D6'],
      dark: ['#040b08', '#07120e', '#0b1f18'],
    },
    blobs: {
      light: ['#5FA989', '#6BBB9B', '#7FD4B3', '#4A9478', '#8FE0C5', '#5CAC8E', '#69C29F', '#4E9F82'],
      dark: ['#082a1f', '#0b2130', '#0a261d', '#041711', '#103328', '#071f16', '#09291e', '#031610'],
    },
    ripples: {
      light: ['rgba(91, 155, 133', 'rgba(61, 122, 104', 'rgba(45, 95, 79'],
      dark: ['rgba(52, 211, 153', 'rgba(16, 185, 129', 'rgba(6, 95, 70'],
    },
  },
  red: {
    gradient: {
      light: ['#FFF0F0', '#FDE2E2', '#FCDADA'],
      dark: ['#0f0204', '#160408', '#22090e'],
    },
    blobs: {
      light: ['#e87a90', '#f4a7b9', '#e16b8c', '#f596aa', '#f17c67', '#f05e75', '#f2818d', '#e05a72'],
      dark: ['#2c0b11', '#26040b', '#380c14', '#1c0205', '#350810', '#220509', '#2d0b13', '#150103'],
    },
    ripples: {
      light: ['rgba(232, 122, 144', 'rgba(225, 107, 140', 'rgba(190, 24, 74'],
      dark: ['rgba(251, 113, 133', 'rgba(244, 63, 94', 'rgba(159, 18, 57'],
    },
  },
  orange: {
    gradient: {
      light: ['#FFFBF0', '#FDF3D5', '#FBF0CF'],
      dark: ['#100a01', '#161004', '#211709'],
    },
    blobs: {
      light: ['#f8b862', '#fcd575', '#f39800', '#ea930d', '#f7c173', '#fbca4d', '#e19818', '#e6a13b'],
      dark: ['#2a1b02', '#261502', '#231501', '#1c0e00', '#36250b', '#211302', '#281a05', '#160b00'],
    },
    ripples: {
      light: ['rgba(248, 184, 98', 'rgba(243, 152, 0', 'rgba(217, 119, 6'],
      dark: ['rgba(251, 191, 36', 'rgba(245, 158, 11', 'rgba(180, 83, 9'],
    },
  },
  blue: {
    gradient: {
      light: ['#F0F6FF', '#DFECFC', '#CFE3F8'],
      dark: ['#010a15', '#041121', '#091b33'],
    },
    blobs: {
      light: ['#6cb2e6', '#8fc9f2', '#509ce0', '#72bcf7', '#4a8cd6', '#8cd0f7', '#5cb3f2', '#3b82f6'],
      dark: ['#02162a', '#051833', '#011523', '#000e1c', '#0b2545', '#021321', '#051d38', '#000b16'],
    },
    ripples: {
      light: ['rgba(108, 178, 230', 'rgba(80, 156, 224', 'rgba(2, 132, 199'],
      dark: ['rgba(56, 189, 248', 'rgba(14, 165, 233', 'rgba(3, 105, 161'],
    },
  },
  gray: {
    gradient: {
      light: ['#F5F5F5', '#EDEDED', '#E5E5E5'],
      dark: ['#0c0c0c', '#121212', '#1f1f1f'],
    },
    blobs: {
      light: ['#a3a3a3', '#c2c2c2', '#737373', '#b5b5b5', '#8e8e8e', '#d4d4d4', '#9c9c9c', '#6b6b6b'],
      dark: ['#1a1a1a', '#141414', '#242424', '#0d0d0d', '#2e2e2e', '#1b1b1b', '#252525', '#0a0a0a'],
    },
    ripples: {
      light: ['rgba(163, 163, 163', 'rgba(115, 115, 115', 'rgba(82, 82, 82'],
      dark: ['rgba(156, 163, 175', 'rgba(107, 114, 128', 'rgba(55, 65, 81'],
    },
  },
}

export function AnimatedGradientBackground({ theme: initialTheme = 'green' }: { theme?: string }) {
  const [theme, setTheme] = useState(initialTheme)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()

  // Sync state with prop updates
  useEffect(() => {
    setTheme(initialTheme)
  }, [initialTheme])

  // Listen to dynamic client-side theme triggers (e.g. from Theme Selector)
  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const detail = (e as CustomEvent<{ theme: string }>).detail
      if (detail?.theme) {
        setTheme(detail.theme)
      }
    }
    window.addEventListener('color-theme-changed', handleThemeChange)
    return () => {
      window.removeEventListener('color-theme-changed', handleThemeChange)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const isDark = resolvedTheme === 'dark'
    const activeTheme = (theme && CANVAS_THEMES[theme as ThemeType] ? theme : 'green') as ThemeType
    const config = CANVAS_THEMES[activeTheme]

    let animationFrameId: number
    let mouseX = 0
    let mouseY = 0
    let prevMouseX = 0
    let prevMouseY = 0
    const ripples: MouseRipple[] = []
    const ambientRipples: AmbientRipple[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Configuration depending on the theme
    const blobsColors = isDark ? config.blobs.dark : config.blobs.light
    const blobs: Blob[] = isDark
      ? [
          {
            x: canvas.width * 0.3,
            y: canvas.height * 0.4,
            radius: 300,
            vx: 1.5,
            vy: 1.2,
            color: blobsColors[0],
            blur: 75,
          },
          {
            x: canvas.width * 0.7,
            y: canvas.height * 0.6,
            radius: 350,
            vx: -1.3,
            vy: 1.1,
            color: blobsColors[1],
            blur: 85,
          },
          {
            x: canvas.width * 0.5,
            y: canvas.height * 0.3,
            radius: 280,
            vx: 1.2,
            vy: -1.4,
            color: blobsColors[2],
            blur: 70,
          },
          {
            x: canvas.width * 0.2,
            y: canvas.height * 0.7,
            radius: 320,
            vx: -1.1,
            vy: -1.3,
            color: blobsColors[3],
            blur: 80,
          },
          {
            x: canvas.width * 0.8,
            y: canvas.height * 0.2,
            radius: 260,
            vx: 1.0,
            vy: 1.3,
            color: blobsColors[4],
            blur: 65,
          },
          {
            x: canvas.width * 0.4,
            y: canvas.height * 0.8,
            radius: 340,
            vx: -1.4,
            vy: 1.0,
            color: blobsColors[5],
            blur: 90,
          },
          {
            x: canvas.width * 0.6,
            y: canvas.height * 0.5,
            radius: 290,
            vx: 1.3,
            vy: -1.1,
            color: blobsColors[6],
            blur: 75,
          },
          {
            x: canvas.width * 0.1,
            y: canvas.height * 0.4,
            radius: 310,
            vx: 1.1,
            vy: 1.5,
            color: blobsColors[7],
            blur: 82,
          },
        ]
      : [
          {
            x: canvas.width * 0.3,
            y: canvas.height * 0.4,
            radius: 300,
            vx: 3.5,
            vy: 3.0,
            color: blobsColors[0],
            blur: 60,
          },
          {
            x: canvas.width * 0.7,
            y: canvas.height * 0.6,
            radius: 350,
            vx: -3.2,
            vy: 2.8,
            color: blobsColors[1],
            blur: 70,
          },
          {
            x: canvas.width * 0.5,
            y: canvas.height * 0.3,
            radius: 280,
            vx: 3.0,
            vy: -3.5,
            color: blobsColors[2],
            blur: 55,
          },
          {
            x: canvas.width * 0.2,
            y: canvas.height * 0.7,
            radius: 320,
            vx: -2.8,
            vy: -3.3,
            color: blobsColors[3],
            blur: 65,
          },
          {
            x: canvas.width * 0.8,
            y: canvas.height * 0.2,
            radius: 260,
            vx: 2.5,
            vy: 3.2,
            color: blobsColors[4],
            blur: 50,
          },
          {
            x: canvas.width * 0.4,
            y: canvas.height * 0.8,
            radius: 340,
            vx: -3.4,
            vy: 2.6,
            color: blobsColors[5],
            blur: 75,
          },
          {
            x: canvas.width * 0.6,
            y: canvas.height * 0.5,
            radius: 290,
            vx: 3.3,
            vy: -2.9,
            color: blobsColors[6],
            blur: 60,
          },
          {
            x: canvas.width * 0.1,
            y: canvas.height * 0.4,
            radius: 310,
            vx: 2.9,
            vy: 3.6,
            color: blobsColors[7],
            blur: 68,
          },
        ]

    const ripColors = isDark ? config.ripples.dark : config.ripples.light
    const ripColor1 = ripColors[0]
    const ripColor2 = ripColors[1]
    const ripColor3 = ripColors[2]

    const createAmbientRipple = () => {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      ambientRipples.push({
        x,
        y,
        radius: 0,
        maxRadius: 100 + Math.random() * 100,
        alpha: 0.2 + Math.random() * 0.15,
        speed: 0.8 + Math.random() * 0.7,
      })

      if (ambientRipples.length > 5) {
        ambientRipples.shift()
      }
    }

    const ambientInterval = setInterval(() => {
      createAmbientRipple()
    }, 2000 + Math.random() * 2000)

    let trailCounter = 0
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      // Create trail ripples along mouse path
      const dx = mouseX - prevMouseX
      const dy = mouseY - prevMouseY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > 20) {
        trailCounter++
        if (trailCounter % 2 === 0) {
          ripples.push({
            x: mouseX,
            y: mouseY,
            radius: 0,
            maxRadius: 100,
            alpha: 0.35,
            delay: 3,
            fadeOut: false,
          })
        }

        prevMouseX = mouseX
        prevMouseY = mouseY
      }

      if (ripples.length > 15) {
        ripples.shift()
      }
    }
    window.addEventListener('mousemove', handleMouseMove)

    const handleClick = (e: MouseEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 200,
        alpha: 0.6,
        delay: 0,
        fadeOut: false,
      })
    }
    window.addEventListener('click', handleClick)

    const animate = () => {
      const gradColors = isDark ? config.gradient.dark : config.gradient.light
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, gradColors[0])
      gradient.addColorStop(0.5, gradColors[1])
      gradient.addColorStop(1, gradColors[2])
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      blobs.forEach((blob) => {
        blob.x += blob.vx
        blob.y += blob.vy

        if (blob.x - blob.radius < 0 || blob.x + blob.radius > canvas.width) {
          blob.vx *= -1
        }
        if (blob.y - blob.radius < 0 || blob.y + blob.radius > canvas.height) {
          blob.vy *= -1
        }

        ctx.save()
        ctx.filter = `blur(${blob.blur}px)`
        const blobGradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          blob.radius
        )
        blobGradient.addColorStop(0, blob.color + 'FF')
        blobGradient.addColorStop(0.5, blob.color + 'DD')
        blobGradient.addColorStop(1, blob.color + '00')
        ctx.fillStyle = blobGradient
        ctx.fillRect(
          blob.x - blob.radius,
          blob.y - blob.radius,
          blob.radius * 2,
          blob.radius * 2
        )
        ctx.restore()
      })

      ambientRipples.forEach((ripple, index) => {
        ripple.radius += ripple.speed
        ripple.alpha -= 0.003

        if (ripple.alpha <= 0 || ripple.radius >= ripple.maxRadius) {
          ambientRipples.splice(index, 1)
          return
        }

        ctx.save()
        ctx.filter = 'blur(20px)'
        const ambientGradient = ctx.createRadialGradient(
          ripple.x,
          ripple.y,
          ripple.radius * 0.5,
          ripple.x,
          ripple.y,
          ripple.radius
        )
        ambientGradient.addColorStop(
          0,
          `${ripColor1}, ${ripple.alpha * 0.6})`
        )
        ambientGradient.addColorStop(
          0.5,
          `${ripColor2}, ${ripple.alpha * 0.4})`
        )
        ambientGradient.addColorStop(1, `${ripColor3}, 0)`)
        ctx.fillStyle = ambientGradient
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      ripples.forEach((ripple, index) => {
        if (ripple.delay > 0) {
          ripple.delay--
          return
        }

        ripple.radius += 1.8

        // Start fade out when near max radius
        if (ripple.radius >= ripple.maxRadius * 0.7) {
          ripple.fadeOut = true
        }

        // Gradual fade out
        if (ripple.fadeOut) {
          ripple.alpha -= 0.015
        } else {
          ripple.alpha -= 0.006
        }

        if (ripple.alpha <= 0 || ripple.radius >= ripple.maxRadius) {
          ripples.splice(index, 1)
          return
        }

        ctx.save()
        ctx.filter = 'blur(15px)'
        const rippleGradient = ctx.createRadialGradient(
          ripple.x,
          ripple.y,
          ripple.radius * 0.5,
          ripple.x,
          ripple.y,
          ripple.radius
        )
        rippleGradient.addColorStop(
          0,
          `${ripColor1}, ${ripple.alpha * 0.6})`
        )
        rippleGradient.addColorStop(
          0.5,
          `${ripColor2}, ${ripple.alpha * 0.4})`
        )
        rippleGradient.addColorStop(1, `${ripColor3}, 0)`)
        ctx.fillStyle = rippleGradient
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        ctx.save()
        ctx.strokeStyle = `${ripColor1}, ${ripple.alpha * 0.5})`
        ctx.lineWidth = 2
        ctx.filter = 'blur(3px)'
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, ripple.radius * 0.8, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
      clearInterval(ambientInterval)
      cancelAnimationFrame(animationFrameId)
    }
  }, [resolvedTheme, theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ width: '100%', height: '100%' }}
    />
  )
}