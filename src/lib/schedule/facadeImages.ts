export interface FacadeImageDef {
  key: string
  src: string
  label: string
}

export const FACADE_IMAGES: Record<string, FacadeImageDef> = {
  'A|מזרח': { key: 'A|מזרח', src: '/facades/mizrah-a.png', label: 'חזית מזרח A' },
  'B|מזרח': { key: 'B|מזרח', src: '/facades/mizrah-b.png', label: 'חזית מזרח פנים B' },
  'A|מערב': { key: 'A|מערב', src: '/facades/mearav-a.png', label: 'חזית מערב פנים A' },
  'B|מערב': { key: 'B|מערב', src: '/facades/mearav-b.png', label: 'חזית מערב B' },
  'A|צפון': { key: 'צפון', src: '/facades/tzafon.png', label: 'חזית צפון' },
  'B|צפון': { key: 'צפון', src: '/facades/tzafon.png', label: 'חזית צפון' },
  'A|דרום': { key: 'דרום', src: '/facades/darom.png', label: 'חזית דרום' },
  'B|דרום': { key: 'דרום', src: '/facades/darom.png', label: 'חזית דרום' },
}

export function getFacadeImage(building?: string | null, facade?: string | null): FacadeImageDef | null {
  if (!building || !facade) return null
  return FACADE_IMAGES[`${building}|${facade}`] ?? null
}
