import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Transition from '../utils/Transition';
import axiosClient from '../services/axios';

// Plane icon for travel results
const PlaneIcon = () => (
  <svg className="fill-current text-gray-400 dark:text-gray-500 shrink-0 mr-3" width="16" height="16" viewBox="0 0 16 16">
    <path d="M15 5.94c0-.32-.2-.62-.5-.78L10 3V1.5A1.5 1.5 0 008.5 0 1.5 1.5 0 007 1.5V3L2.5 5.16c-.3.16-.5.46-.5.78v.94c0 .54.52.92 1.03.75L7 6.25V8.5l-1.7 1.13c-.19.13-.3.34-.3.57v.47c0 .43.41.73.82.6L8 10.75l2.18.52c.41.13.82-.17.82-.6v-.47c0-.23-.11-.44-.3-.57L9 8.5V6.25l3.97 1.38c.51.17 1.03-.21 1.03-.75v-.94z" />
  </svg>
);

// Page icon for static nav results
const PageIcon = () => (
  <svg className="fill-current text-gray-400 dark:text-gray-500 shrink-0 mr-3" width="16" height="16" viewBox="0 0 16 16">
    <path d="M14 0H2c-.6 0-1 .4-1 1v14c0 .6.4 1 1 1h8l5-5V1c0-.6-.4-1-1-1zM3 2h10v8H9v4H3V2z" />
  </svg>
);

// Static pages available to navigate to
const STATIC_PAGES = [
  { label: 'Accueil', path: '/' },
  { label: 'Liste des trajets', path: '/travels' },
  { label: 'Publier un trajet', path: '/travels/create' },
  { label: 'Nouveau colis', path: '/packages/create' },
  // Sender dashboard pages
  { label: 'Dashboard Expéditeur — Aperçu', path: '/sender/dashboard?tab=apercu' },
  { label: 'Dashboard Expéditeur — Mes Colis', path: '/sender/dashboard?tab=expedition' },
  { label: 'Dashboard Expéditeur — Suivi en direct', path: '/sender/dashboard?tab=suivi' },
  // Traveler dashboard
  { label: 'Dashboard Voyageur', path: '/traveler/dashboard' },
];

function ModalSearch({ id, searchId, modalOpen, setModalOpen }) {
  const modalContent = useRef(null);
  const searchInput = useRef(null);
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [travels, setTravels] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!modalOpen || modalContent.current.contains(target)) return;
      setModalOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close on Escape
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!modalOpen || keyCode !== 27) return;
      setModalOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  // focus input when opened
  useEffect(() => {
    if (modalOpen) {
      searchInput.current.focus();
    } else {
      // reset state when closed
      setQuery('');
      setTravels([]);
    }
  }, [modalOpen]);

  // debounced API search
  const searchTravels = useCallback((value) => {
    clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setTravels([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axiosClient.get('/api/travels', {
          params: { search: value },
        });
        // API may return { data: [...] } or directly an array
        const results = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setTravels(results.slice(0, 6));
      } catch {
        setTravels([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    searchTravels(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setModalOpen(false);
    navigate(`/travels?search=${encodeURIComponent(query.trim())}`);
  };

  const handleClose = () => setModalOpen(false);

  // Filter static pages by query
  const filteredPages = query.trim()
    ? STATIC_PAGES.filter((p) =>
        p.label.toLowerCase().includes(query.toLowerCase())
      )
    : STATIC_PAGES;

  const hasResults = travels.length > 0 || filteredPages.length > 0;

  return (
    <>
      {/* Modal backdrop */}
      <Transition
        className="fixed inset-0 bg-gray-900/30 z-50 transition-opacity"
        show={modalOpen}
        enter="transition ease-out duration-200"
        enterStart="opacity-0"
        enterEnd="opacity-100"
        leave="transition ease-out duration-100"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
        aria-hidden="true"
      />

      {/* Modal dialog */}
      <Transition
        id={id}
        className="fixed inset-0 z-50 overflow-hidden flex items-start top-20 mb-4 justify-center px-4 sm:px-6"
        role="dialog"
        aria-modal="true"
        show={modalOpen}
        enter="transition ease-in-out duration-200"
        enterStart="opacity-0 translate-y-4"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-in-out duration-200"
        leaveStart="opacity-100 translate-y-0"
        leaveEnd="opacity-0 translate-y-4"
      >
        <div
          ref={modalContent}
          className="bg-white dark:bg-gray-800 border border-transparent dark:border-gray-700/60 overflow-auto max-w-2xl w-full max-h-full rounded-lg shadow-lg"
        >
          {/* Search form */}
          <form onSubmit={handleSubmit} className="border-b border-gray-200 dark:border-gray-700/60">
            <div className="relative">
              <label htmlFor={searchId} className="sr-only">Search</label>
              <input
                id={searchId}
                className="w-full dark:text-gray-300 bg-white dark:bg-gray-800 border-0 focus:ring-transparent placeholder-gray-400 dark:placeholder-gray-500 appearance-none py-3 pl-10 pr-4"
                type="search"
                placeholder="Rechercher une page, un trajet, une ville…"
                ref={searchInput}
                value={query}
                onChange={handleChange}
              />
              <button className="absolute inset-0 right-auto group" type="submit" aria-label="Search">
                <svg
                  className="shrink-0 fill-current text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 ml-4 mr-2"
                  width="16" height="16" viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
                  <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
                </svg>
              </button>
            </div>
          </form>

          <div className="py-4 px-2">

            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-6 text-sm text-gray-400 dark:text-gray-500">
                <svg className="animate-spin mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Recherche en cours…
              </div>
            )}

            {/* No results */}
            {!loading && query.trim() && !hasResults && (
              <div className="text-center py-6 text-sm text-gray-400 dark:text-gray-500">
                Aucun résultat pour "<span className="font-medium text-gray-600 dark:text-gray-300">{query}</span>"
              </div>
            )}

            {/* Travel results from API */}
            {!loading && travels.length > 0 && (
              <div className="mb-3 last:mb-0">
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-2 mb-2">
                  Trajets
                </div>
                <ul className="text-sm">
                  {travels.map((travel) => (
                    <li key={travel.id}>
                      <Link
                        className="flex items-center p-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/20 rounded-lg"
                        to={`/travel/${travel.id}`}
                        onClick={handleClose}
                      >
                        <PlaneIcon />
                        <span className="flex-1 min-w-0">
                          <span className="font-medium">
                            {travel.from_city?.name ?? travel.from_city} → {travel.to_city?.name ?? travel.to_city}
                          </span>
                          {travel.departure_date && (
                            <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">
                              {new Date(travel.departure_date).toLocaleDateString()}
                            </span>
                          )}
                          {travel.max_weight && (
                            <span className="text-gray-400 dark:text-gray-500 ml-2 text-xs">
                              · {travel.max_weight} kg
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pages / navigation */}
            {!loading && filteredPages.length > 0 && (
              <div className="mb-3 last:mb-0">
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-2 mb-2">
                  Pages &amp; Navigation
                </div>
                <ul className="text-sm">
                  {filteredPages.map((page) => (
                    <li key={page.path}>
                      <Link
                        className="flex items-center p-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/20 rounded-lg"
                        to={page.path}
                        onClick={handleClose}
                      >
                        <PageIcon />
                        <span className="font-medium">{page.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>
      </Transition>
    </>
  );
}

export default ModalSearch;