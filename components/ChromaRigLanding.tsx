"use client"

import { useEffect, useMemo, useState } from "react"
import { ChromaRigScene } from "./ChromaRigScene"
import { PaletteMode, createPalette, marketplaceLinks, productMedia, walkthroughSteps } from "../lib/chromarig"

const paletteModes: PaletteMode[] = ["Triadic", "Complementary", "Analogous", "Theme"]

function getYoutubeEmbedUrl(url: string) {
  if (!url.trim()) return ""

  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, "")

    if (host === "youtu.be") {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : ""
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/embed/")) return parsed.toString()
      if (parsed.pathname.startsWith("/shorts/")) {
        const videoId = parsed.pathname.split("/").filter(Boolean)[1]
        return videoId ? `https://www.youtube.com/embed/${videoId}` : ""
      }

      const videoId = parsed.searchParams.get("v")
      return videoId ? `https://www.youtube.com/embed/${videoId}` : ""
    }
  } catch {
    return ""
  }

  return ""
}

export function ChromaRigLanding() {
  const [baseColor, setBaseColor] = useState("#22f59f")
  const [paletteMode, setPaletteMode] = useState<PaletteMode>("Triadic")
  const [activeStep, setActiveStep] = useState(0)
  const [lightCount, setLightCount] = useState(4)
  const [aimAtEmpties, setAimAtEmpties] = useState(true)
  const [generated, setGenerated] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  const palette = useMemo(() => createPalette(baseColor, paletteMode), [baseColor, paletteMode])
  const currentStep = walkthroughSteps[activeStep]
  const sceneState = generated ? "result" : currentStep.sceneState
  const youtubeEmbedUrl = getYoutubeEmbedUrl(productMedia.youtubeUrl)

  function goToStep(index: number) {
    setActiveStep(index)
    if (index < walkthroughSteps.length - 1) setGenerated(false)
  }

  function previewPalette() {
    setGenerated(false)
    setActiveStep(1)
  }

  function generateRig() {
    setGenerated(true)
    setActiveStep(3)
  }

  const benefitActions = [
    {
      label: "Generate a contrast lighting rig from one color or preset theme.",
      detail: "Loads the Theme palette, uses 4 lights, and shows the generated CR_ rig.",
      run: () => { setPaletteMode("Theme"); setBaseColor("#ffb24a"); setLightCount(4); setAimAtEmpties(true); setGenerated(true); setActiveStep(3) },
    },
    {
      label: "Preview palettes before creating lights.",
      detail: "Moves to Preview Palette so swatches update before the rig is generated.",
      run: () => { setGenerated(false); setActiveStep(1) },
    },
    {
      label: "Choose 1-4 lights with click controls.",
      detail: "Cycles the safe light count range and updates the WebGL light beams.",
      run: () => { setLightCount((count) => (count >= 4 ? 1 : count + 1)); setGenerated(false); setActiveStep(2) },
    },
    {
      label: "Aim at empties without deleting user-owned scene objects.",
      detail: "Turns target mode on so the preview shows safe empty-based aiming.",
      run: () => { setAimAtEmpties(true); setGenerated(false); setActiveStep(2) },
    },
    {
      label: "Clear generated ChromaRig lights safely when you want to reset.",
      detail: "Resets the browser simulation to the first step without deleting user-owned data.",
      run: () => { setGenerated(false); setAimAtEmpties(false); setLightCount(1); setActiveStep(0) },
    },
  ]

  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="canvas-layer" aria-hidden="true">
          <ChromaRigScene
            palette={palette}
            activeScene={sceneState}
            lightCount={lightCount}
            aimAtEmpties={aimAtEmpties}
            reducedMotion={reducedMotion}
          />
        </div>
        <div className="hero-shade" aria-hidden="true" />

        <nav className="topbar" aria-label="Primary">
          <a className="brand" href="#top" aria-label="ChromaRig home">
            <img className="brand-logo" src="/lemniloop_mark.png" alt="" />
            <span>
              <strong>ChromaRig</strong>
              <small>Lemniloop Studio</small>
            </span>
          </a>
          <div className="nav-links">
            <a href="#preview">Interactive Preview</a>
            <a href="#demo">Demo Media</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#marketplaces">Buy Links</a>
          </div>
        </nav>

        <div className="hero-grid" id="top">
          <div className="hero-copy">
            <p className="eyebrow">Blender add-on - interactive browser simulation</p>
            <h1 id="hero-title">ChromaRig</h1>
            <p className="hook">Pick one color. Build a cinematic Blender lighting rig in seconds.</p>
            <p className="intro">
              Preview the exact ChromaRig flow before buying: choose a base color or theme, preview the palette,
              set 1-4 lights, aim at empties, and generate a clean rig setup.
            </p>
            <div className="hero-actions" id="marketplaces" aria-label="Marketplace links">
              {marketplaceLinks.map((link) =>
                link.href ? (
                  <a className="market-link" href={link.href} key={link.label}>
                    <span>{link.label}</span>
                    <small>Live</small>
                  </a>
                ) : (
                  <span className="market-link disabled" aria-disabled="true" key={link.label}>
                    <span>{link.label}</span>
                    <small>Coming soon</small>
                  </span>
                )
              )}
            </div>
            <p className="endorsement-note">
              Independent Lemniloop Studio product. Marketplace and Blender names identify compatibility and listing
              targets only; this page does not imply Blender endorsement or marketplace partnership.
            </p>
          </div>

          <div className="scene-spacer" aria-hidden="true" />

          <section className="sim-panel" id="preview" aria-labelledby="preview-title">
            <div className="panel-heading">
              <p className="eyebrow">Interactive preview</p>
              <h2 id="preview-title">Try the ChromaRig workflow</h2>
              <p>Browser simulation only. These controls preview the add-on before purchase.</p>
            </div>

            <div className="steps" aria-label="ChromaRig Quick Start">
              {walkthroughSteps.map((step, index) => (
                <button
                  className={index === activeStep ? "step active" : "step"}
                  key={step.id}
                  onClick={() => goToStep(index)}
                  title={`${step.action}: ${step.detail}`}
                  type="button"
                >
                  <strong>{step.label}</strong>
                  <small>{step.action}</small>
                </button>
              ))}
            </div>

            <div className="control-group">
              <label htmlFor="baseColor">Base Color</label>
              <div className="color-row">
                <input
                  id="baseColor"
                  type="color"
                  value={baseColor}
                  onChange={(event) => {
                    setBaseColor(event.target.value)
                    setGenerated(false)
                    setActiveStep(0)
                  }}
                  title="Your starting color. ChromaRig calculates the other light colors from this."
                />
                <span>{baseColor.toUpperCase()}</span>
              </div>
            </div>

            <div className="mode-grid" aria-label="Palette mode">
              {paletteModes.map((mode) => (
                <button
                  className={mode === paletteMode ? "mode active" : "mode"}
                  key={mode}
                  onClick={() => {
                    setPaletteMode(mode)
                    setGenerated(false)
                    setActiveStep(0)
                  }}
                  title={`${mode} palette source. Choose it, then click Preview Palette.`}
                  type="button"
                >
                  {mode}
                </button>
              ))}
            </div>

            <button className="primary-action" onClick={previewPalette} type="button" title="Click to preview Key, Fill, Rim, and Kicker colors before generating lights.">
              Click To Preview Palette
            </button>

            <div className="palette-preview" aria-label="Palette preview">
              {palette.slice(0, lightCount).map((color, index) => (
                <span key={`${color}-${index}`} style={{ background: color }} title={`${color} preview swatch`} />
              ))}
            </div>

            <div className="stepper-row">
              <span>Light Count</span>
              <div className="stepper" aria-label="Choose light count from 1 to 4">
                <button
                  type="button"
                  onClick={() => {
                    setLightCount((count) => Math.max(1, count - 1))
                    setGenerated(false)
                    setActiveStep(2)
                  }}
                  disabled={lightCount <= 1}
                  title="Lower Light Count without typing. Keeps the value inside 1 to 4."
                >
                  -
                </button>
                <strong>{lightCount}</strong>
                <button
                  type="button"
                  onClick={() => {
                    setLightCount((count) => Math.min(4, count + 1))
                    setGenerated(false)
                    setActiveStep(2)
                  }}
                  disabled={lightCount >= 4}
                  title="Raise Light Count without typing. Keeps the value inside 1 to 4."
                >
                  +
                </button>
              </div>
            </div>

            <label className="toggle-row" title="Let ChromaRig aim lights at target empties instead of using classic placement.">
              <input
                type="checkbox"
                checked={aimAtEmpties}
                onChange={(event) => {
                  setAimAtEmpties(event.target.checked)
                  setGenerated(false)
                  setActiveStep(2)
                }}
              />
              <span>Click To Aim at Empties</span>
            </label>

            <button className="generate-action" onClick={generateRig} type="button" title="Preview the generated rig using named CR_ lights.">
              Generate Rig
            </button>

            <div className="result-line" role="status">
              <strong>{generated ? "Rig generated" : currentStep.label}</strong>
              <span>{generated ? `${lightCount} CR_ lights previewed with safe target behavior.` : currentStep.detail}</span>
            </div>
          </section>
        </div>
      </section>

      <section className="media-band" id="demo" aria-labelledby="demo-title">
        <div className="media-heading">
          <p className="eyebrow">See it before you buy</p>
          <h2 id="demo-title">Actual UI preview plus demo video.</h2>
          <p>
            The browser simulation shows the idea. This section shows the real Blender panel and leaves a ready slot
            for the YouTube walkthrough once the final video link is available.
          </p>
        </div>

        <div className="media-grid">
          <article className="video-card" aria-labelledby="video-title">
            <div className="card-kicker">Video walkthrough</div>
            <h3 id="video-title">{productMedia.youtubeTitle}</h3>
            {youtubeEmbedUrl ? (
              <iframe
                src={youtubeEmbedUrl}
                title={productMedia.youtubeTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <div className="video-placeholder" role="img" aria-label="YouTube demo video placeholder">
                <strong>YouTube demo slot ready</strong>
                <span>Add the final YouTube URL in the product media config and this becomes an embedded walkthrough.</span>
              </div>
            )}
          </article>

          <figure className="ui-preview-card">
            <div className="card-kicker">Real Blender UI</div>
            <img
              src={productMedia.uiPreviewImage}
              alt={productMedia.uiPreviewAlt}
              width="296"
              height="876"
              loading="lazy"
            />
            <figcaption>
              Actual ChromaRig panel preview showing Quick Start, guided Color Source, Click To Preview, and Palette Preview.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="content-band" id="how-it-works">
        <div className="content-grid">
          <div>
            <p className="eyebrow">How it works</p>
            <h2>One color becomes a guided lighting setup.</h2>
          </div>
          <div className="copy-stack">
            <p>
              ChromaRig follows the order Blender artists actually need: pick a color, preview the palette,
              set count and placement, then generate the rig. The landing page mirrors that sequence so buyers
              can understand the add-on before they buy it.
            </p>
            <div className="benefit-actions" aria-label="Interactive ChromaRig benefit actions">
              {benefitActions.map((action) => (
                <button className="benefit-action" key={action.label} onClick={action.run} type="button" title={action.detail}>
                  <strong>{action.label}</strong>
                  <span>{action.detail}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="content-band split">
        <div>
          <p className="eyebrow">Why it works</p>
          <h2>Guided UI lowers the cost of experimenting.</h2>
        </div>
        <p>
          Quick Start guidance, hover-help standards, bounded controls, and visible object pickers make the tool
          approachable without hiding what it changes. The add-on is built around Blender-native UI behavior and
          release-tested packaging, so the experience can feel polished without unsafe custom panel drawing.
        </p>
      </section>

      <footer className="footer">
        <span>ChromaRig by Lemniloop Studio</span>
        <span>Support: mgmt@lemniloop.com</span>
        <span>GPLv3 or later - 5% of ChromaRig sales are donated to Blender development.</span>
      </footer>
    </main>
  )
}
