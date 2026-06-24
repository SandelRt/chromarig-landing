export type PaletteMode = "Triadic" | "Complementary" | "Analogous" | "Theme"

export type WalkthroughStep = {
  id: string
  label: string
  action: string
  detail: string
  sceneState: "color" | "preview" | "placement" | "result"
}

export const walkthroughSteps: WalkthroughStep[] = [
  {
    id: "base-color",
    label: "1. Pick Base Color",
    action: "Choose a color or theme",
    detail: "Start with one color, exactly like ChromaRig's Color Source step.",
    sceneState: "color",
  },
  {
    id: "preview-palette",
    label: "2. Preview Palette",
    action: "Click Preview Palette",
    detail: "See the palette before any lights are generated.",
    sceneState: "preview",
  },
  {
    id: "light-placement",
    label: "3. Set Light Count and Placement",
    action: "Choose 1-4 lights and Aim at Empties if needed",
    detail: "Use click controls and optional target empties instead of typing or guessing.",
    sceneState: "placement",
  },
  {
    id: "generate-rig",
    label: "4. Generate Rig",
    action: "Click Generate Rig",
    detail: "Create named ChromaRig lights, then clear generated data safely when needed.",
    sceneState: "result",
  },
]

export const marketplaceLinks = [
  { label: "Gumroad", href: "", status: "coming-soon" },
  { label: "Superhive", href: "", status: "coming-soon" },
  { label: "Blender Market", href: "", status: "coming-soon" },
  { label: "Blender Extensions", href: "", status: "coming-soon" },
]

export const productMedia = {
  uiPreviewImage: "/chromarig-ui-preview.png",
  uiPreviewAlt:
    "ChromaRig Blender sidebar showing Quick Start, Color Source, Click To Preview, and Palette Preview controls.",
  youtubeUrl: "https://youtu.be/054NPm502sU",
  youtubeTitle: "ChromaRig demo walkthrough",
}

export const presetTheme = ["#40f59b", "#5fb8ff", "#ffb047", "#ff5a7d"]

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "")
  const value = Number.parseInt(normalized, 16)
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

function rgbToHex(r: number, g: number, b: number) {
  const channel = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0")
  return `#${channel(r)}${channel(g)}${channel(b)}`
}

function rgbToHsl(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const lightness = (max + min) / 2
  let hue = 0
  let saturation = 0

  if (max !== min) {
    const diff = max - min
    saturation = lightness > 0.5 ? diff / (2 - max - min) : diff / (max + min)
    switch (max) {
      case rn:
        hue = (gn - bn) / diff + (gn < bn ? 6 : 0)
        break
      case gn:
        hue = (bn - rn) / diff + 2
        break
      default:
        hue = (rn - gn) / diff + 4
        break
    }
    hue *= 60
  }

  return { h: hue, s: saturation, l: lightness }
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const h = ((hue % 360) + 360) % 360
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lightness - c / 2
  let r = 0
  let g = 0
  let b = 0

  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255)
}

export function createPalette(baseColor: string, mode: PaletteMode) {
  if (mode === "Theme") return presetTheme

  const { h, s, l } = rgbToHsl(baseColor)
  const vivid = clamp(s * 1.05, 0.44, 0.95)
  const lift = clamp(l, 0.4, 0.68)

  if (mode === "Complementary") {
    return [
      hslToHex(h, vivid, lift),
      hslToHex(h + 180, vivid, lift),
      hslToHex(h + 25, vivid * 0.75, clamp(lift + 0.1, 0.35, 0.72)),
      hslToHex(h + 205, vivid * 0.75, clamp(lift - 0.06, 0.32, 0.68)),
    ]
  }

  if (mode === "Analogous") {
    return [
      hslToHex(h - 30, vivid, lift),
      hslToHex(h, vivid, lift),
      hslToHex(h + 30, vivid, lift),
      hslToHex(h + 60, vivid * 0.82, clamp(lift + 0.05, 0.32, 0.72)),
    ]
  }

  return [
    hslToHex(h, vivid, lift),
    hslToHex(h + 120, vivid, lift),
    hslToHex(h + 240, vivid, lift),
    hslToHex(h + 35, vivid * 0.75, clamp(lift + 0.08, 0.36, 0.74)),
  ]
}
