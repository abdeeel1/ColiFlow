import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home, Navigation, Package, Wallet, Settings,
} from "lucide-react";
import SidebarLinkGroup from "./SidebarLinkGroup";

function TravelerSidebar({ sidebarOpen, setSidebarOpen, variant = "default" }) {
  const location = useLocation();
  const { pathname } = location;
  const activeTab = new URLSearchParams(location.search).get("tab");

  const trigger  = useRef(null);
  const sidebar  = useRef(null);

  const storedExpanded = localStorage.getItem("traveler-sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedExpanded === null ? false : storedExpanded === "true"
  );

  // close on outside click
  useEffect(() => {
    const handler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  });

  // close on Escape
  useEffect(() => {
    const handler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  });

  useEffect(() => {
    localStorage.setItem("traveler-sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("sidebar-expanded");
    } else {
      document.querySelector("body").classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  // active conditions
  const isHome       = pathname === "/traveler/dashboard" && (!activeTab || activeTab === "apercu");
  const isTrajets    = pathname === "/travels/create" || (pathname === "/traveler/dashboard" && activeTab === "trajets");
  const isColis      = pathname === "/traveler/dashboard" && (activeTab === "demandes" || activeTab === "livraisons");
  const isPortefeuille = pathname === "/traveler/dashboard" && activeTab === "gains";
  const isSettings   = pathname === "/profile";

  // helper: icon wrapper matching sidebar pattern
  const IconWrap = ({ active, children }) => (
    <div className={`shrink-0 ${active ? "text-[#0984E3]" : "text-gray-400 dark:text-gray-500"}`}>
      {children}
    </div>
  );

  const Chevron = ({ open }) => (
    <div className="flex shrink-0 ml-2">
      <svg
        className={`w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        viewBox="0 0 12 12"
      >
        <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
      </svg>
    </div>
  );

  const GroupLabel = ({ label }) => (
    <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
      {label}
    </span>
  );

  return (
    <div className="min-w-fit">
      {/* Backdrop (mobile) */}
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        id="traveler-sidebar"
        ref={sidebar}
        className={`flex lg:flex! flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:w-64! shrink-0 bg-white dark:bg-gray-800 p-4 transition-all duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } ${
          variant === "v2"
            ? "border-r border-gray-200 dark:border-gray-700/60"
            : "rounded-r-2xl shadow-xs"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between mb-10 pr-3 sm:px-2">
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="traveler-sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          <NavLink end to="/" className="block">
            <img src="/images/Logo.png" alt="ColiFlow Logo" className="w-33 xl:w-44" />
          </NavLink>
        </div>

        {/* Nav links */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold pl-3">
              <span className="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6" aria-hidden="true">
                •••
              </span>
              <span className="lg:hidden lg:sidebar-expanded:block 2xl:block">Pages</span>
            </h3>

            <ul className="mt-3 flex flex-col gap-5">

              {/* ── HOME ──────────────────────────────────────────────── */}
              <SidebarLinkGroup activecondition={isHome}>
                {(handleClick, open) => (
                  <>
                    <a
                      href="#0"
                      className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${!isHome && "hover:text-gray-900 dark:hover:text-white"}`}
                      onClick={(e) => { e.preventDefault(); handleClick(); setSidebarExpanded(true); }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <IconWrap active={isHome}><Home size={16} /></IconWrap>
                          <GroupLabel label="Home" />
                        </div>
                        <Chevron open={open} />
                      </div>
                    </a>
                    <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                      <ul className={`pl-8 mt-3 ${!open && "hidden"}`}>
                        <li className="mb-1 last:mb-0">
                          <NavLink
                            end
                            to="/traveler/dashboard"
                            className={() =>
                              "block transition duration-150 truncate " +
                              (isHome ? "text-[#0984E3]" : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                            }
                          >
                            <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Dashboard
                            </span>
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </SidebarLinkGroup>

              {/* ── MES TRAJETS ───────────────────────────────────────── */}
              <SidebarLinkGroup activecondition={isTrajets}>
                {(handleClick, open) => (
                  <>
                    <a
                      href="#0"
                      className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${!isTrajets && "hover:text-gray-900 dark:hover:text-white"}`}
                      onClick={(e) => { e.preventDefault(); handleClick(); setSidebarExpanded(true); }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <IconWrap active={isTrajets}><Navigation size={16} /></IconWrap>
                          <GroupLabel label="Mes Trajets" />
                        </div>
                        <Chevron open={open} />
                      </div>
                    </a>
                    <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                      <ul className={`pl-8 mt-3 flex flex-col gap-2 ${!open && "hidden"}`}>
                        <li className="mb-1 last:mb-0">
                          <NavLink
                            end
                            to="/travels/create"
                            className={({ isActive }) =>
                              "block transition duration-150 truncate " +
                              (isActive ? "text-[#0984E3]" : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                            }
                          >
                            <span className="text-sm font-medium text-orange-400 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Nouveau Trajet →
                            </span>
                          </NavLink>
                        </li>
                        <li className="mb-1 last:mb-0">
                          <NavLink
                            end
                            to="/traveler/dashboard?tab=trajets"
                            className={() =>
                              "block transition duration-150 truncate " +
                              (activeTab === "trajets" ? "text-[#0984E3]" : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                            }
                          >
                            <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Gestion des trajets
                            </span>
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </SidebarLinkGroup>

              {/* ── GESTION COLIS ─────────────────────────────────────── */}
              <SidebarLinkGroup activecondition={isColis}>
                {(handleClick, open) => (
                  <>
                    <a
                      href="#0"
                      className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${!isColis && "hover:text-gray-900 dark:hover:text-white"}`}
                      onClick={(e) => { e.preventDefault(); handleClick(); setSidebarExpanded(true); }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <IconWrap active={isColis}><Package size={16} /></IconWrap>
                          <GroupLabel label="Gestion Colis" />
                        </div>
                        <Chevron open={open} />
                      </div>
                    </a>
                    <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                      <ul className={`pl-8 mt-3 flex flex-col gap-2 ${!open && "hidden"}`}>
                        <li className="mb-1 last:mb-0">
                          <NavLink
                            end
                            to="/traveler/dashboard?tab=demandes"
                            className={() =>
                              "block transition duration-150 truncate " +
                              (activeTab === "demandes" ? "text-[#0984E3]" : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                            }
                          >
                            <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Demandes reçues
                            </span>
                          </NavLink>
                        </li>
                        <li className="mb-1 last:mb-0">
                          <NavLink
                            end
                            to="/traveler/dashboard?tab=livraisons"
                            className={() =>
                              "block transition duration-150 truncate " +
                              (activeTab === "livraisons" ? "text-[#0984E3]" : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                            }
                          >
                            <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Livraison en cours
                            </span>
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </SidebarLinkGroup>

              {/* ── PORTEFEUILLE ──────────────────────────────────────── */}
              <SidebarLinkGroup activecondition={isPortefeuille}>
                {(handleClick, open) => (
                  <>
                    <a
                      href="#0"
                      className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${!isPortefeuille && "hover:text-gray-900 dark:hover:text-white"}`}
                      onClick={(e) => { e.preventDefault(); handleClick(); setSidebarExpanded(true); }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <IconWrap active={isPortefeuille}><Wallet size={16} /></IconWrap>
                          <GroupLabel label="Portefeuille" />
                        </div>
                        <Chevron open={open} />
                      </div>
                    </a>
                    <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                      <ul className={`pl-8 mt-3 ${!open && "hidden"}`}>
                        <li className="mb-1 last:mb-0">
                          <NavLink
                            end
                            to="/traveler/dashboard?tab=gains"
                            className={() =>
                              "block transition duration-150 truncate " +
                              (activeTab === "gains" ? "text-[#0984E3]" : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                            }
                          >
                            <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Gains et Retraits
                            </span>
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </SidebarLinkGroup>

              {/* ── PARAMÈTRES ────────────────────────────────────────── */}
              <SidebarLinkGroup activecondition={isSettings}>
                {(handleClick, open) => (
                  <>
                    <a
                      href="#0"
                      className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${!isSettings && "hover:text-gray-900 dark:hover:text-white"}`}
                      onClick={(e) => { e.preventDefault(); handleClick(); setSidebarExpanded(true); }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <IconWrap active={isSettings}><Settings size={16} /></IconWrap>
                          <GroupLabel label="Paramètres" />
                        </div>
                        <Chevron open={open} />
                      </div>
                    </a>
                    <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                      <ul className={`pl-8 mt-3 flex flex-col gap-2 ${!open && "hidden"}`}>
                        <li className="mb-1 last:mb-0">
                          <NavLink
                            end
                            to="/profile"
                            className={({ isActive }) =>
                              "block transition duration-150 truncate " +
                              (isActive ? "text-[#0984E3]" : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                            }
                          >
                            <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Mon Profile
                            </span>
                          </NavLink>
                        </li>
                        <li className="mb-1 last:mb-0">
                          <NavLink
                            end
                            to="/profile?tab=vehicle"
                            className={() =>
                              "block transition duration-150 truncate " +
                              (pathname === "/profile" && activeTab === "vehicle" ? "text-[#0984E3]" : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                            }
                          >
                            <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Mon Vehicle &amp; documents
                            </span>
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </SidebarLinkGroup>

            </ul>
          </div>
        </div>

        {/* Expand / collapse button */}
        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
          <div className="w-12 pl-4 pr-3 py-2">
            <button
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
            >
              <span className="sr-only">Expand / collapse sidebar</span>
              <svg
                className="shrink-0 fill-current text-gray-400 dark:text-gray-500 sidebar-expanded:rotate-180"
                xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"
              >
                <path d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01M11.924 7.617a.997.997 0 0 0-.217-.324l-4.5-4.5a1 1 0 0 0-1.414 1.414L8.586 7M12 7.99a.996.996 0 0 0-.076-.373Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TravelerSidebar;
