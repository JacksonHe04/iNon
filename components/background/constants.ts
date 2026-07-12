import type { ThemeType } from '@/types/layout'

export interface Blob {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  color: string
  blur: number
}

export interface MouseRipple {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
  delay: number
  fadeOut: boolean
}

export interface AmbientRipple {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
  speed: number
}

export const CANVAS_THEMES: Record<
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
