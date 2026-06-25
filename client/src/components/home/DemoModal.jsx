import { useEffect, useRef, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion as Motion, AnimatePresence } from "motion/react"
import { X, Play, Pause, SkipBack, SkipForward, RotateCcw, Volume2 } from "lucide-react"
import { screens } from "./demoScreens"

// Guided product tour ported from the "ColiFlow Demo.dc.html" design prototype.
// Each of the 8 screens is faithful design markup rendered into the browser
// viewport; React drives the French voice narration, the guide cursor and the
// playback controls.
const NARRATION = [
  {
    title: "Accueil",
    url: "/",
    text: "Bienvenue sur ColiFlow, la première plateforme de livraison entre particuliers au Maroc. Elle met en relation les expéditeurs qui veulent envoyer un colis avec des voyageurs qui ont de la place sur un trajet qu'ils font déjà.",
  },
  {
    title: "Publier un colis",
    url: "/packages/create",
    text: "Côté expéditeur, je décris mon colis en quelques étapes : son nom, sa catégorie, le trajet de départ et d'arrivée, une photo, puis mon budget. Il ne me reste plus qu'à publier mon annonce.",
  },
  {
    title: "Trouver un trajet",
    url: "/travels",
    text: "ColiFlow me propose alors les voyageurs disponibles sur mon trajet. Je peux filtrer par prix ou par véhicule, n'afficher que les profils vérifiés, et les visualiser directement sur la carte.",
  },
  {
    title: "Côté voyageur",
    url: "/traveler/dashboard",
    text: "Côté voyageur maintenant. Une fois mon identité vérifiée par carte d'identité, je publie mon trajet et je reçois les demandes d'envoi. J'accepte le colis qui correspond à mon itinéraire.",
  },
  {
    title: "Messagerie",
    url: "/messages",
    text: "Les deux parties discutent en toute sécurité grâce à la messagerie intégrée, pour convenir du prix et du point de rendez-vous.",
  },
  {
    title: "Paiement sécurisé",
    url: "/packages/CF-014",
    text: "L'expéditeur paie via notre système de dépôt fiduciaire. L'argent est bloqué en toute sécurité et ne sera versé au voyageur qu'une fois la livraison confirmée.",
  },
  {
    title: "Suivi en direct",
    url: "/sender/dashboard",
    text: "Pendant le transport, l'expéditeur suit son colis en direct sur la carte, du départ jusqu'à l'arrivée.",
  },
  {
    title: "Livraison & avis",
    url: "/sender/dashboard",
    text: "À la réception, la livraison est confirmée, le voyageur est payé, et les deux parties laissent un avis. Voilà comment ColiFlow simplifie l'envoi de colis au Maroc. Merci de votre attention !",
  },
]

export default function DemoModal({ open, onClose }) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [cursor, setCursor] = useState({ x: 430, y: 300, on: false })
  const [phase, setPhase] = useState("idle") // idle | down | up
  // The browser window is a fixed 1120px design; scale it to fit narrow screens.
  const [scale, setScale] = useState(1)
  const [frameH, setFrameH] = useState(0)

  const colRef = useRef(null)
  const frameRef = useRef(null)
  const viewportRef = useRef(null)
  const voiceRef = useRef(null)
  const timers = useRef([])
  // Mirror playing state into a ref so async speech callbacks read the latest value.
  const playingRef = useRef(false)
  const stepRef = useRef(0)

  useEffect(() => { playingRef.current = playing }, [playing])
  useEffect(() => { stepRef.current = step }, [step])

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t))
    timers.current = []
  }, [])

  const stopSpeech = useCallback(() => {
    clearTimers()
    if (window.speechSynthesis) window.speechSynthesis.cancel()
  }, [clearTimers])

  // Pick a French voice once available.
  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) return
    const pick = () => {
      const vs = synth.getVoices()
      voiceRef.current =
        vs.find((v) => /fr-FR/i.test(v.lang)) || vs.find((v) => /^fr/i.test(v.lang)) || null
    }
    pick()
    synth.onvoiceschanged = pick
    return () => { synth.onvoiceschanged = null }
  }, [])

  // Move the guide cursor to the screen's call-to-action, "click" it, then run `done`.
  const moveCursorToAction = useCallback((done) => {
    const vp = viewportRef.current
    const target = vp && vp.querySelector("[data-act]")
    if (!vp || !target) {
      timers.current.push(setTimeout(done, 300))
      return
    }
    const scale = vp.getBoundingClientRect().width / vp.offsetWidth || 1
    const vr = vp.getBoundingClientRect()
    const tr = target.getBoundingClientRect()
    const x = (tr.left + tr.width / 2 - vr.left) / scale
    const y = (tr.top + tr.height / 2 - vr.top) / scale
    setCursor({ x, y, on: true })
    timers.current.push(
      setTimeout(() => {
        setPhase("down")
        timers.current.push(setTimeout(() => setPhase("up"), 70))
        timers.current.push(
          setTimeout(() => {
            setPhase("idle")
            done && done()
          }, 520),
        )
      }, 1000),
    )
  }, [])

  // Declared before speak via ref to break the mutual recursion.
  const speakRef = useRef(null)

  const runGuide = useCallback(() => {
    const last = stepRef.current >= NARRATION.length - 1
    moveCursorToAction(() => {
      if (!playingRef.current) return
      if (last) {
        setPlaying(false)
        return
      }
      timers.current.push(
        setTimeout(() => {
          setStep((s) => {
            const next = s + 1
            stepRef.current = next
            timers.current.push(setTimeout(() => speakRef.current && speakRef.current(), 0))
            return next
          })
        }, 350),
      )
    })
  }, [moveCursorToAction])

  const speak = useCallback(() => {
    const synth = window.speechSynthesis
    if (!synth) {
      setPlaying(false)
      return
    }
    synth.cancel()
    const u = new SpeechSynthesisUtterance(NARRATION[stepRef.current].text)
    u.lang = "fr-FR"
    u.rate = 0.98
    u.pitch = 1
    if (voiceRef.current) u.voice = voiceRef.current
    u.onend = () => {
      if (!playingRef.current) return
      runGuide()
    }
    setPlaying(true)
    playingRef.current = true
    setCursor((c) => ({ ...c, on: true }))
    synth.speak(u)
  }, [runGuide])

  useEffect(() => { speakRef.current = speak }, [speak])

  const handlePlay = useCallback(() => {
    if (playingRef.current) {
      stopSpeech()
      setPlaying(false)
      setCursor((c) => ({ ...c, on: false }))
      setPhase("idle")
    } else {
      speak()
    }
  }, [speak, stopSpeech])

  const go = useCallback(
    (n) => {
      const next = Math.max(0, Math.min(NARRATION.length - 1, n))
      const wasPlaying = playingRef.current
      stopSpeech()
      setPlaying(false)
      setCursor((c) => ({ ...c, on: false }))
      setPhase("idle")
      setStep(next)
      stepRef.current = next
      if (wasPlaying) timers.current.push(setTimeout(() => speak(), 60))
    },
    [speak, stopSpeech],
  )

  // Lock body scroll while open; stop any narration on close/unmount.
  // State is reset by remounting (parent keys this component on `open`).
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
      stopSpeech()
    }
  }, [open, stopSpeech])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  // Scale the fixed-width browser window down to the column width on small screens.
  useEffect(() => {
    if (!open) return
    const recompute = () => {
      const col = colRef.current
      const frame = frameRef.current
      if (!col || !frame) return
      const s = Math.min(1, col.clientWidth / 1120)
      setScale(s)
      setFrameH(frame.offsetHeight * s) // offsetHeight is the unscaled layout height
    }
    recompute()
    const ro = new ResizeObserver(recompute)
    if (colRef.current) ro.observe(colRef.current)
    if (frameRef.current) ro.observe(frameRef.current)
    window.addEventListener("resize", recompute)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", recompute)
    }
  }, [open, step])

  const cur = NARRATION[step]
  const ripScale = phase === "up" ? 2 : 0.25
  const ripOpacity = phase === "down" ? 0.5 : 0
  const ripTransition =
    phase === "up" ? "transform .46s ease-out, opacity .46s ease-out" : "none"

  return createPortal(
    <AnimatePresence>
      {open && (
        <Motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-3 sm:p-6"
          style={{ background: "rgba(8,18,32,.72)", backdropFilter: "blur(6px)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <style>{`
            @keyframes cf-ping{0%{transform:scale(.6);opacity:.8}75%,100%{transform:scale(2.2);opacity:0}}
            @keyframes cf-eq{0%,100%{height:5px}50%{height:16px}}
            .cf-eqbar{width:3px;background:#0984E3;border-radius:2px;animation:cf-eq .9s ease-in-out infinite}
          `}</style>

          <Motion.div
            ref={colRef}
            className="relative flex w-full max-w-[1120px] flex-col items-center gap-4 my-auto"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.45, 0, 0.15, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Fermer la démo"
              className="absolute -top-2 -right-1 sm:-top-3 sm:-right-3 z-[70] flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg hover:text-gray-900 hover:scale-105 transition"
            >
              <X size={18} />
            </button>

            {/* ===== BROWSER WINDOW (fixed 1120px, scaled to fit) ===== */}
            <div style={{ width: "100%", height: frameH || undefined, overflow: "hidden" }}>
            <div
              ref={frameRef}
              className="overflow-hidden rounded-2xl border bg-white"
              style={{
                width: 1120,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                borderColor: "#dfe6ee",
                boxShadow:
                  "0 30px 70px -20px rgba(16,42,67,.45),0 8px 24px -12px rgba(16,42,67,.3)",
              }}
            >
              {/* chrome */}
              <div
                className="flex items-center gap-3.5 px-4 py-2.5"
                style={{ background: "#f4f6f9", borderBottom: "1px solid #e6ebf1" }}
              >
                <div className="flex gap-2">
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
                </div>
                <div
                  className="mx-auto flex flex-1 items-center gap-2"
                  style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 9,
                    padding: "7px 14px",
                    maxWidth: 560,
                    color: "#64748b",
                    fontSize: 13,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0984E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <span style={{ color: "#94a3b8" }}>coliflow.vercel.app</span>
                  <span style={{ color: "#0f172a", fontWeight: 600 }}>{cur.url}</span>
                </div>
                <div style={{ width: 54 }} />
              </div>

              {/* viewport */}
              <div
                id="cf-viewport"
                ref={viewportRef}
                style={{ height: 600, overflow: "hidden", background: "#F8FAFC", position: "relative" }}
              >
                <div
                  key={step}
                  style={{ height: "100%" }}
                  dangerouslySetInnerHTML={{ __html: screens[step] }}
                />

                {/* ===== GUIDE CURSOR ===== */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    zIndex: 60,
                    pointerEvents: "none",
                    opacity: cursor.on ? 1 : 0,
                    transform: `translate(${cursor.x}px, ${cursor.y}px)`,
                    transition:
                      "transform .9s cubic-bezier(.45,0,.15,1),opacity .35s ease",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: 42,
                      height: 42,
                      marginLeft: -21,
                      marginTop: -21,
                      borderRadius: "50%",
                      background: "rgba(9,132,227,.4)",
                      transform: `scale(${ripScale})`,
                      opacity: ripOpacity,
                      transition: ripTransition,
                    }}
                  />
                  <svg width="27" height="27" viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,.45))", transform: `scale(${phase === "down" ? 0.82 : 1})`, transition: "transform .12s ease" }}>
                    <path d="M5 2.5 19.5 11.8 12.2 13.4 8.7 21.5Z" fill="#ffffff" stroke="#1f2d3d" strokeWidth="1.4" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
            </div>

            {/* ===== NARRATION DOCK ===== */}
            <div
              className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-5"
              style={{ background: "#0f1b2d", borderRadius: 18, padding: "16px 18px", boxShadow: "0 20px 50px -20px rgba(16,42,67,.55)" }}
            >
              {/* play controls */}
              <div className="order-2 flex items-center justify-center gap-2 sm:order-0">
                <button onClick={() => go(step - 1)} title="Précédent" className="flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: 11, border: "none", background: "#1e2d42", color: "#cbd5e1", cursor: "pointer" }}>
                  <SkipBack size={17} fill="currentColor" />
                </button>
                <button onClick={handlePlay} title="Lecture" className="flex items-center justify-center" style={{ width: 50, height: 50, borderRadius: 14, border: "none", background: "#0984E3", color: "#fff", cursor: "pointer", boxShadow: "0 8px 20px -8px rgba(9,132,227,.8)" }}>
                  {playing ? <Pause size={20} fill="#fff" /> : <Play size={20} fill="#fff" />}
                </button>
                <button onClick={() => go(step + 1)} title="Suivant" className="flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: 11, border: "none", background: "#1e2d42", color: "#cbd5e1", cursor: "pointer" }}>
                  <SkipForward size={17} fill="currentColor" />
                </button>
              </div>

              {/* caption */}
              <div className="order-1 w-full min-w-0 flex-1 sm:order-0">
                <div className="mb-1.5 flex items-center gap-2.5">
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".5px", color: "#0984E3", textTransform: "uppercase" }}>
                    Étape {step + 1}/8 · {cur.title}
                  </span>
                  {playing && (
                    <span style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 16 }}>
                      <i className="cf-eqbar" style={{ animationDelay: "0s" }} />
                      <i className="cf-eqbar" style={{ animationDelay: ".15s" }} />
                      <i className="cf-eqbar" style={{ animationDelay: ".3s" }} />
                      <i className="cf-eqbar" style={{ animationDelay: ".45s" }} />
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 14.5, lineHeight: 1.5, color: "#e2e8f0", fontWeight: 500 }} className="line-clamp-3 sm:line-clamp-none">
                  {cur.text}
                </div>
              </div>

              {/* replay + dots */}
              <div className="order-3 flex w-full items-center justify-between gap-2.5 sm:order-0 sm:w-auto sm:flex-col sm:items-end">
                <button onClick={() => speak()} title="Réécouter" className="flex items-center gap-1.5" style={{ background: "#1e2d42", color: "#cbd5e1", border: "none", borderRadius: 11, padding: "8px 13px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  <RotateCcw size={14} />
                  <span className="hidden sm:inline">Réécouter</span>
                </button>
                <div className="flex gap-1.5">
                  {NARRATION.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => go(i)}
                      aria-label={`Aller à l'étape ${i + 1}`}
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 9999,
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        background: i === step ? "#0984E3" : i < step ? "#3b6bb6" : "#33415a",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* hint */}
            <div className="hidden items-center gap-2 sm:flex" style={{ fontSize: 11.5, color: "#cbd5e1" }}>
              <Volume2 size={13} />
              Narration française — appuyez sur Lecture pour démarrer la visite guidée. Astuce : activez le son de votre navigateur.
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
