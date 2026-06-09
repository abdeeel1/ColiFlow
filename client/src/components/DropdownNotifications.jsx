import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Package, Inbox, CheckCircle, XCircle, Bell } from 'lucide-react';
import Transition from '../utils/Transition';
import axiosClient from '../services/axios';

const TYPE_CONFIG = {
  package_created:  { Icon: Package,     bg: 'bg-blue-100 dark:bg-blue-950/30',   color: 'text-blue-500',   link: '/sender/dashboard?tab=expedition' },
  request_received: { Icon: Inbox,        bg: 'bg-purple-100 dark:bg-purple-950/30', color: 'text-purple-500', link: '/traveler/dashboard' },
  request_accepted: { Icon: CheckCircle,  bg: 'bg-green-100 dark:bg-green-950/30',  color: 'text-green-500',  link: '/sender/dashboard?tab=suivi' },
  request_rejected: { Icon: XCircle,      bg: 'bg-red-100 dark:bg-red-950/30',      color: 'text-red-500',    link: '/sender/dashboard?tab=expedition' },
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)       return 'À l\'instant';
  if (diff < 3600)     return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400)    return `Il y a ${Math.floor(diff / 3600)} h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
}

function DropdownNotifications({ align }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);

  const trigger  = useRef(null);
  const dropdown = useRef(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/api/notifications');
      setNotifications(res.data.notifications ?? []);
      setUnreadCount(res.data.unread_count ?? 0);
    } catch {
      // silently fail — user might not be authenticated yet
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Refresh when dropdown opens
  useEffect(() => {
    if (dropdownOpen) fetchNotifications();
  }, [dropdownOpen, fetchNotifications]);

  // Close on click outside
  useEffect(() => {
    const handler = ({ target }) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  });

  // Close on Escape
  useEffect(() => {
    const handler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });

  const handleMarkRead = async (id) => {
    try {
      await axiosClient.patch(`/api/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosClient.patch('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 lg:hover:bg-gray-200 dark:hover:bg-gray-700/50 dark:lg:hover:bg-gray-800 rounded-full ${dropdownOpen && 'bg-gray-200 dark:bg-gray-800'}`}
        aria-haspopup="true"
        onClick={() => setDropdownOpen(o => !o)}
        aria-expanded={dropdownOpen}
      >
        <span className="sr-only">Notifications</span>
        <svg
          className="fill-current text-gray-500/80 dark:text-gray-400/80"
          width={16} height={16} viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6.5 0a6.5 6.5 0 0 0-6.5 6.5c0 1.116.285 2.165.786 3.079l-.734 2.203a1 1 0 0 0 1.265 1.265l2.203-.734A6.479 6.479 0 0 0 6.5 13a6.5 6.5 0 0 0 0-13Z" />
          <path d="M11.5 7a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 1.5a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0v-1.5H9.25a.75.75 0 0 1 0-1.5h1.5v-1.5A.75.75 0 0 1 11.5 8.5Z" />
        </svg>
        {unreadCount > 0 && (
          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full" />
        )}
      </button>

      <Transition
        className={`origin-top-right z-10 absolute top-full min-w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div ref={dropdown}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100 dark:border-gray-700/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#0984E3] hover:underline font-medium cursor-pointer"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          {/* List */}
          <ul className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60">
            {loading && notifications.length === 0 && (
              <li className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                Chargement…
              </li>
            )}

            {!loading && notifications.length === 0 && (
              <li className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                Aucune notification pour l'instant.
              </li>
            )}

            {notifications.map((notif) => {
              const cfg = TYPE_CONFIG[notif.type] ?? { Icon: Bell, bg: 'bg-gray-100 dark:bg-gray-700', color: 'text-gray-400', link: '#' };
              const { Icon } = cfg;
              return (
                <li key={notif.id}>
                  <Link
                    to={cfg.link}
                    onClick={() => {
                      if (!notif.read) handleMarkRead(notif.id);
                      setDropdownOpen(false);
                    }}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition ${
                      !notif.read ? 'bg-blue-50/50 dark:bg-blue-950/10' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                      <Icon size={15} className={cfg.color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold mb-0.5 ${notif.read ? 'text-gray-700 dark:text-gray-200' : 'text-gray-900 dark:text-gray-100'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {timeAgo(notif.created_at)}
                      </p>
                    </div>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#0984E3] shrink-0 mt-1.5" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-700/60 px-4 py-2.5">
              <Link
                to="/sender/dashboard?tab=expedition"
                onClick={() => setDropdownOpen(false)}
                className="text-xs text-[#0984E3] font-medium hover:underline"
              >
                Voir toutes les notifications →
              </Link>
            </div>
          )}
        </div>
      </Transition>
    </div>
  );
}

export default DropdownNotifications;
