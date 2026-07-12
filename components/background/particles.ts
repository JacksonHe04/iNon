import type { Blob, MouseRipple, AmbientRipple } from './constants'

export class BlobParticle implements Blob {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  color: string
  blur: number

  constructor(config: Blob) {
    this.x = config.x
    this.y = config.y
    this.radius = config.radius
    this.vx = config.vx
    this.vy = config.vy
    this.color = config.color
    this.blur = config.blur
  }

  update(width: number, height: number) {
    this.x += this.vx
    this.y += this.vy

    if (this.x - this.radius < 0 || this.x + this.radius > width) {
      this.vx *= -1
    }
    if (this.y - this.radius < 0 || this.y + this.radius > height) {
      this.vy *= -1
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.filter = `blur(${this.blur}px)`
    const blobGradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.radius
    )
    blobGradient.addColorStop(0, this.color + 'FF')
    blobGradient.addColorStop(0.5, this.color + 'DD')
    blobGradient.addColorStop(1, this.color + '00')
    ctx.fillStyle = blobGradient
    ctx.fillRect(
      this.x - this.radius,
      this.y - this.radius,
      this.radius * 2,
      this.radius * 2
    )
    ctx.restore()
  }
}
