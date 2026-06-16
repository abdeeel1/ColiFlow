import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Wrench } from 'lucide-react';
import axiosClient from '../services/axios';

/**
 * Global maintenance banner. When the admin turns on "Mode Maintenance" the
 * whole site shows this strip and write operations (CRUD) are blocked on the
 * backend. Admins keep full access, so the banner stays informational for them.
 *
 * It is `fixed` to the top and reserves space by padding #root, so it stays
 * visible even on the full-height dashboard layouts (flex h-screen).
 */
export default function MaintenanceBanner() {
  const [config, setConfig] = useState(null);
  const ref = useRef(null);
  const isAdmin = useSelector((s) => s.auth.user?.role === 'admin');

  const load = () => {
    // cache-bust + no-store so a stale GET never hides a live maintenance state
    axiosClient.get('/api/app-config', {
      params: { _t: Date.now() },
      headers: { 'Cache-Control': 'no-cache' },
    })
      .then((r) => setConfig(r.data))
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const onChange = () => load();
    // Poll so other users' open tabs pick up the change without a reload.
    const interval = setInterval(load, 20000);
    const onVisible = () => { if (!document.hidden) load(); };
    window.addEventListener('app-config-changed', onChange);
    window.addEventListener('focus', onChange);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(interval);
      window.removeEventListener('app-config-changed', onChange);
      window.removeEventListener('focus', onChange);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  // Reserve room at the top of the page so the fixed banner never overlaps content.
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    if (config?.maintenance_mode) {
      const h = ref.current?.offsetHeight || 44;
      root.style.paddingTop = `${h}px`;
      return () => { root.style.paddingTop = ''; };
    }
    root.style.paddingTop = '';
  }, [config?.maintenance_mode]);

  if (!config?.maintenance_mode) return null;

  return (
    <div
      ref={ref}
      className="fixed top-0 inset-x-0 z-9999 bg-linear-to-r from-red-600 to-rose-500 text-white shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2.5 text-center">
        <Wrench size={16} className="shrink-0" />
        <p className="text-sm font-medium">
          {config.app_name || 'ColiFlow'} est actuellement en maintenance. Les opérations sont temporairement indisponibles.
          {isAdmin && <span className="font-bold"> (accès administrateur maintenu)</span>}
        </p>
      </div>
    </div>
  );
}
