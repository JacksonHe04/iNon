'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

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

export function AnimatedGradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const isDark = resolvedTheme === 'dark'

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
    const blobs: Blob[] = isDark
      ? [
          {
            x: canvas.width * 0.3,
            y: canvas.height * 0.4,
            radius: 300,
            vx: 1.5,
            vy: 1.2,
            color: '#082a1f', // Deep dark forest green
            blur: 75,
          },
          {
            x: canvas.width * 0.7,
            y: canvas.height * 0.6,
            radius: 350,
            vx: -1.3,
            vy: 1.1,
            color: '#0b2130', // Deep dark ocean blue
            blur: 85,
          },
          {
            x: canvas.width * 0.5,
            y: canvas.height * 0.3,
            radius: 280,
            vx: 1.2,
            vy: -1.4,
            color: '#0a261d',
            blur: 70,
          },
          {
            x: canvas.width * 0.2,
            y: canvas.height * 0.7,
            radius: 320,
            vx: -1.1,
            vy: -1.3,
            color: '#041711',
            blur: 80,
          },
          {
            x: canvas.width * 0.8,
            y: canvas.height * 0.2,
            radius: 260,
            vx: 1.0,
            vy: 1.3,
            color: '#103328',
            blur: 65,
          },
          {
            x: canvas.width * 0.4,
            y: canvas.height * 0.8,
            radius: 340,
            vx: -1.4,
            vy: 1.0,
            color: '#071f16',
            blur: 90,
          },
          {
            x: canvas.width * 0.6,
            y: canvas.height * 0.5,
            radius: 290,
            vx: 1.3,
            vy: -1.1,
            color: '#09291e',
            blur: 75,
          },
          {
            x: canvas.width * 0.1,
            y: canvas.height * 0.4,
            radius: 310,
            vx: 1.1,
            vy: 1.5,
            color: '#031610',
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
            color: '#5FA989',
            blur: 60,
          },
          {
            x: canvas.width * 0.7,
            y: canvas.height * 0.6,
            radius: 350,
            vx: -3.2,
            vy: 2.8,
            color: '#6BBB9B',
            blur: 70,
          },
          {
            x: canvas.width * 0.5,
            y: canvas.height * 0.3,
            radius: 280,
            vx: 3.0,
            vy: -3.5,
            color: '#7FD4B3',
            blur: 55,
          },
          {
            x: canvas.width * 0.2,
            y: canvas.height * 0.7,
            radius: 320,
            vx: -2.8,
            vy: -3.3,
            color: '#4A9478',
            blur: 65,
          },
          {
            x: canvas.width * 0.8,
            y: canvas.height * 0.2,
            radius: 260,
            vx: 2.5,
            vy: 3.2,
            color: '#8FE0C5',
            blur: 50,
          },
          {
            x: canvas.width * 0.4,
            y: canvas.height * 0.8,
            radius: 340,
            vx: -3.4,
            vy: 2.6,
            color: '#5CAC8E',
            blur: 75,
          },
          {
            x: canvas.width * 0.6,
            y: canvas.height * 0.5,
            radius: 290,
            vx: 3.3,
            vy: -2.9,
            color: '#69C29F',
            blur: 60,
          },
          {
            x: canvas.width * 0.1,
            y: canvas.height * 0.4,
            radius: 310,
            vx: 2.9,
            vy: 3.6,
            color: '#4E9F82',
            blur: 68,
          },
        ]

    const ripColor1 = isDark ? 'rgba(52, 211, 153' : 'rgba(91, 155, 133'
    const ripColor2 = isDark ? 'rgba(16, 185, 129' : 'rgba(61, 122, 104'
    const ripColor3 = isDark ? 'rgba(6, 95, 70' : 'rgba(45, 95, 79'

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
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      if (isDark) {
        gradient.addColorStop(0, '#040b08')
        gradient.addColorStop(0.5, '#07120e')
        gradient.addColorStop(1, '#0b1f18')
      } else {
        gradient.addColorStop(0, '#E5F5EF')
        gradient.addColorStop(0.5, '#D0EDE3')
        gradient.addColorStop(1, '#BCE5D6')
      }
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
  }, [resolvedTheme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ width: '100%', height: '100%' }}
    />
  )
}