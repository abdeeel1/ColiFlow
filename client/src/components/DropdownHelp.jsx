import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ExternalLink, Mail, HelpCircle } from 'lucide-react';
import Transition from '../utils/Transition';

const LINKS = [
  {
    label: 'Documentation',
    description: 'Comment fonctionne ColiFlow ?',
    icon: BookOpen,
    to: '/#faq',
    external: false,
  },
  {
    label: 'Voir les trajets',
    description: 'Parcourir les trajets disponibles',
    icon: ExternalLink,
    to: '/travels',
    external: false,
  },
  {
    label: 'Nous contacter',
    description: 'Une question ? Écrivez-nous',
    icon: Mail,
    to: 'mailto:support@coliflow.ma',
    external: true,
  },
];

function DropdownHelp({ align }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const trigger  = useRef(null);
  const dropdown = useRef(null);

  useEffect(() => {
    const handler = ({ target }) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  });

  useEffect(() => {
    const handler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 lg:hover:bg-gray-200 dark:hover:bg-gray-700/50 dark:lg:hover:bg-gray-800 rounded-full transition ${dropdownOpen ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
        aria-haspopup="true"
        onClick={() => setDropdownOpen(o => !o)}
        aria-expanded={dropdownOpen}
      >
        <span className="sr-only">Aide</span>
        <HelpCircle size={16} className="text-gray-500/80 dark:text-gray-400/80" />
      </button>

      <Transition
        className={`origin-top-right z-10 absolute top-full min-w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-2 rounded-lg shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div ref={dropdown}>
          <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-3 pt-1 pb-2">
            Besoin d'aide ?
          </div>
          <ul>
            {LINKS.map(({ label, description, icon: Icon, to, external }) => (
              <li key={label}>
                {external ? (
                  <a
                    href={to}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition group"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#0984E3]/10 flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-[#0984E3]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-[#0984E3] transition">
                        {label}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{description}</p>
                    </div>
                  </a>
                ) : (
                  <Link
                    to={to}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition group"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#0984E3]/10 flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-[#0984E3]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-[#0984E3] transition">
                        {label}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{description}</p>
                    </div>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Transition>
    </div>
  );
}

export default DropdownHelp;
