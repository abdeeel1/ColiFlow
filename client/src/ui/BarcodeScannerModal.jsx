import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { AnimatePresence, motion as Motion } from 'motion/react';
import { X, ScanLine, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Safely stop a scanner instance. html5-qrcode throws *synchronously*
 * (not a rejected promise) when stopped while not running/paused, which
 * would crash React — so we guard on state and swallow every failure.
 */
function safeStop(scanner) {
  if (!scanner) return Promise.resolve();
  try {
    const state = scanner.getState?.();
    if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
      return scanner.stop().catch(() => {});
    }
  } catch { /* not running — nothing to stop */ }
  return Promise.resolve();
}

/**
 * Reusable camera barcode / QR scanner modal.
 *
 * Props:
 *  - open       : boolean — controls visibility
 *  - onClose    : () => void
 *  - onScan     : (decodedText) => void   called once a code is read
 *  - title      : optional header title
 */
export default function BarcodeScannerModal({ open, onClose, onScan, title = 'Scanner le Code-Barres' }) {
  const regionRef = useRef(null);
  const scannerRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | starting | scanning | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState('');

  // unique id so multiple instances never clash (sanitized for valid DOM id)
  const regionId = `scanner-region-${useId().replace(/[:]/g, '')}`;

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const html5 = new Html5Qrcode(regionId, { verbose: false });
    scannerRef.current = html5;

    const start = async () => {
      setStatus('starting');
      setErrorMsg('');
      setResult('');
      try {
        await html5.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          (decodedText) => {
            if (cancelled) return;
            setResult(decodedText);
            setStatus('success');
            // stop then bubble up
            safeStop(html5).finally(() => {
              onScan?.(decodedText);
            });
          },
          () => {} // per-frame failure (ignored — fires constantly while searching)
        );
        // closed while the camera was still starting up → stop it now
        if (cancelled) { safeStop(html5); return; }
        setStatus('scanning');
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setErrorMsg(
          err?.name === 'NotAllowedError'
            ? "Accès à la caméra refusé. Autorisez la caméra dans votre navigateur."
            : err?.name === 'NotFoundError'
            ? 'Aucune caméra détectée sur cet appareil.'
            : "Impossible de démarrer la caméra."
        );
      }
    };

    start();

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      safeStop(s).finally(() => {
        try { s?.clear(); } catch { /* noop */ }
      });
      scannerRef.current = null;
    };
  }, [open, regionId, onScan]);

  const retry = () => {
    // toggling status forces the effect-driven UI back to camera; simplest is reload via state
    setStatus('starting');
    setErrorMsg('');
    const html5 = scannerRef.current;
    if (!html5) return;
    html5.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      (decodedText) => {
        setResult(decodedText);
        setStatus('success');
        safeStop(html5).finally(() => onScan?.(decodedText));
      },
      () => {}
    )
      .then(() => setStatus('scanning'))
      .catch(() => { setStatus('error'); setErrorMsg("Impossible de démarrer la caméra."); });
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <Motion.div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
          <Motion.div
            className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
              <div className="flex items-center gap-2">
                <ScanLine size={18} className="text-[#0984E3]" />
                <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer"
              >
                <X size={16} className="text-gray-500 dark:text-gray-300" />
              </button>
            </div>

            {/* Camera viewport */}
            <div className="relative bg-black aspect-square">
              <div id={regionId} ref={regionRef} className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />

              {/* Scan frame overlay */}
              {(status === 'scanning' || status === 'starting') && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-56 h-56">
                    {/* corners */}
                    {['top-0 left-0 border-t-4 border-l-4 rounded-tl-xl',
                      'top-0 right-0 border-t-4 border-r-4 rounded-tr-xl',
                      'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl',
                      'bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl',
                    ].map((c) => (
                      <span key={c} className={`absolute w-8 h-8 border-[#0984E3] ${c}`} />
                    ))}
                    {/* moving laser line */}
                    <Motion.span
                      className="absolute left-2 right-2 h-0.5 bg-[#0984E3] shadow-[0_0_8px_2px_rgba(9,132,227,0.7)] rounded-full"
                      initial={{ top: '8px' }}
                      animate={{ top: ['8px', 'calc(100% - 8px)', '8px'] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                </div>
              )}

              {/* Starting spinner */}
              {status === 'starting' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 text-white">
                  <span className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-xs">Démarrage de la caméra…</span>
                </div>
              )}

              {/* Success */}
              {status === 'success' && (
                <Motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-green-600/90 text-white"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <CheckCircle size={48} />
                  <p className="font-bold">Code scanné !</p>
                  <p className="text-sm font-mono break-all px-6 text-center">{result}</p>
                </Motion.div>
              )}

              {/* Error */}
              {status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900/90 text-white px-6 text-center">
                  <AlertCircle size={42} className="text-red-400" />
                  <p className="text-sm">{errorMsg}</p>
                  <button
                    onClick={retry}
                    className="flex items-center gap-1.5 mt-1 px-4 py-2 text-sm font-semibold rounded-lg bg-[#0984E3] hover:bg-blue-600 transition cursor-pointer"
                  >
                    <RefreshCw size={14} /> Réessayer
                  </button>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Placez le code-barres du colis dans le cadre.
              </p>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
