'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import type { ThemeType } from '@/types/layout'
import { CANVAS_THEMES } from './background/constants'
import type { MouseRipple, AmbientRipple } from './background/constants'
import { BlobParticle } from './background/particles'

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
    const rawBlobs = isDark
      ? [
          { x: canvas.width * 0.3, y: canvas.height * 0.4, radius: 300, vx: 1.5, vy: 1.2, color: blobsColors[0], blur: 75 },
          { x: canvas.width * 0.7, y: canvas.height * 0.6, radius: 350, vx: -1.3, vy: 1.1, color: blobsColors[1], blur: 85 },
          { x: canvas.width * 0.5, y: canvas.height * 0.3, radius: 280, vx: 1.2, vy: -1.4, color: blobsColors[2], blur: 70 },
          { x: canvas.width * 0.2, y: canvas.height * 0.7, radius: 320, vx: -1.1, vy: -1.3, color: blobsColors[3], blur: 80 },
          { x: canvas.width * 0.8, y: canvas.height * 0.2, radius: 260, vx: 1.0, vy: 1.3, color: blobsColors[4], blur: 65 },
          { x: canvas.width * 0.4, y: canvas.height * 0.8, radius: 340, vx: -1.4, vy: 1.0, color: blobsColors[5], blur: 90 },
          { x: canvas.width * 0.6, y: canvas.height * 0.5, radius: 290, vx: 1.3, vy: -1.1, color: blobsColors[6], blur: 75 },
          { x: canvas.width * 0.1, y: canvas.height * 0.4, radius: 310, vx: 1.1, vy: 1.5, color: blobsColors[7], blur: 82 },
        ]
      : [
          { x: canvas.width * 0.3, y: canvas.height * 0.4, radius: 300, vx: 3.5, vy: 3.0, color: blobsColors[0], blur: 60 },
          { x: canvas.width * 0.7, y: canvas.height * 0.6, radius: 350, vx: -3.2, vy: 2.8, color: blobsColors[1], blur: 70 },
          { x: canvas.width * 0.5, y: canvas.height * 0.3, radius: 280, vx: 3.0, vy: -3.5, color: blobsColors[2], blur: 55 },
          { x: canvas.width * 0.2, y: canvas.height * 0.7, radius: 320, vx: -2.8, vy: -3.3, color: blobsColors[3], blur: 65 },
          { x: canvas.width * 0.8, y: canvas.height * 0.2, radius: 260, vx: 2.5, vy: 3.2, color: blobsColors[4], blur: 50 },
          { x: canvas.width * 0.4, y: canvas.height * 0.8, radius: 340, vx: -3.4, vy: 2.6, color: blobsColors[5], blur: 75 },
          { x: canvas.width * 0.6, y: canvas.height * 0.5, radius: 290, vx: 3.3, vy: -2.9, color: blobsColors[6], blur: 60 },
          { x: canvas.width * 0.1, y: canvas.height * 0.4, radius: 310, vx: 2.9, vy: 3.6, color: blobsColors[7], blur: 68 },
        ]

    const blobs = rawBlobs.map((config) => new BlobParticle(config))

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
        blob.update(canvas.width, canvas.height)
        blob.draw(ctx)
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
        ambientGradient.addColorStop(0, `${ripColor1}, ${ripple.alpha * 0.6})`)
        ambientGradient.addColorStop(0.5, `${ripColor2}, ${ripple.alpha * 0.4})`)
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
        rippleGradient.addColorStop(0, `${ripColor1}, ${ripple.alpha * 0.6})`)
        rippleGradient.addColorStop(0.5, `${ripColor2}, ${ripple.alpha * 0.4})`)
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