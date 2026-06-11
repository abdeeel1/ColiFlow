import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion as Motion } from 'motion/react'
import { Package, ChevronDown, Check } from 'lucide-react'

/**
 * Branded animated select used to pick one of the sender's colis.
 *
 * The dropdown is rendered in a portal with fixed positioning so it is never
 * clipped by parent `overflow` containers (e.g. the mobile horizontal filter row).
 *
 * Props:
 *  - value        : currently selected value (string) | ''
 *  - onChange     : (value: string) => void
 *  - options      : [{ value, label, sub? }]
 *  - placeholder  : string shown when nothing is selected
 *  - className    : extra classes on the trigger
 */
export default function ColisSelect({
    value,
    onChange,
    options = [],
    placeholder = 'Sélectionner…',
    className = '',
}) {
    const [open, setOpen] = useState(false)
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
    const triggerRef = useRef(null)
    const menuRef = useRef(null)

    const selected = options.find((o) => String(o.value) === String(value))

    // position the portal menu under the trigger
    const updateCoords = () => {
        const el = triggerRef.current
        if (!el) return
        const r = el.getBoundingClientRect()
        setCoords({ top: r.bottom + 8, left: r.left, width: r.width })
    }

    useLayoutEffect(() => {
        if (open) updateCoords()
    }, [open])

    // reposition while open (scroll / resize), close on outside click + Escape
    useEffect(() => {
        if (!open) return
        const onScrollResize = () => updateCoords()
        const onClick = (e) => {
            if (
                triggerRef.current?.contains(e.target) ||
                menuRef.current?.contains(e.target)
            )
                return
            setOpen(false)
        }
        const onKey = (e) => e.key === 'Escape' && setOpen(false)

        window.addEventListener('scroll', onScrollResize, true)
        window.addEventListener('resize', onScrollResize)
        document.addEventListener('mousedown', onClick)
        document.addEventListener('keydown', onKey)
        return () => {
            window.removeEventListener('scroll', onScrollResize, true)
            window.removeEventListener('resize', onScrollResize)
            document.removeEventListener('mousedown', onClick)
            document.removeEventListener('keydown', onKey)
        }
    }, [open])

    return (
        <>
            {/* Trigger */}
            <Motion.button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((o) => !o)}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 cursor-pointer rounded-2xl border-0 bg-white px-4 py-[0.7rem] text-sm font-bold text-[#374151] transition min-w-52 ${
                    open ? 'ring-2 ring-[#0984E3]/30' : 'hover:bg-gray-50'
                } ${className}`}
            >
                <Package className="size-4 shrink-0 text-[#0984E3]" />
                <span
                    className={`flex-1 truncate text-left ${
                        selected ? 'text-[#374151]' : 'text-gray-400'
                    }`}
                >
                    {selected ? selected.label : placeholder}
                </span>
                <Motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 text-gray-400"
                >
                    <ChevronDown className="size-4" />
                </Motion.span>
            </Motion.button>

            {/* Dropdown (portal) */}
            {createPortal(
                <AnimatePresence>
                    {open && (
                        <Motion.ul
                            ref={menuRef}
                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                            transition={{ duration: 0.16, ease: 'easeOut' }}
                            style={{
                                position: 'fixed',
                                top: coords.top,
                                left: coords.left,
                                minWidth: coords.width,
                            }}
                            className="z-[9999] max-h-72 w-max max-w-[min(20rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl shadow-black/10"
                        >
                            {options.length === 0 && (
                                <li className="px-3 py-2 text-sm text-gray-400">
                                    Aucun colis
                                </li>
                            )}
                            {options.map((opt) => {
                                const isActive =
                                    String(opt.value) === String(value)
                                return (
                                    <li key={opt.value}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onChange(String(opt.value))
                                                setOpen(false)
                                            }}
                                            className={`flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                                                isActive
                                                    ? 'bg-blue-50 text-[#0984E3]'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-semibold">
                                                    {opt.label}
                                                </p>
                                                {opt.sub && (
                                                    <p
                                                        className={`truncate text-xs ${
                                                            isActive
                                                                ? 'text-[#0984E3]/70'
                                                                : 'text-gray-400'
                                                        }`}
                                                    >
                                                        {opt.sub}
                                                    </p>
                                                )}
                                            </div>
                                            {isActive && (
                                                <Check className="mt-0.5 size-4 shrink-0" />
                                            )}
                                        </button>
                                    </li>
                                )
                            })}
                        </Motion.ul>
                    )}
                </AnimatePresence>,
                document.body,
            )}
        </>
    )
}
