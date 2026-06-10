import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  Search, Phone, Send, Paperclip, MessageSquare,
  ArrowLeft, Filter, CheckCheck, Check, Hand,
  Pencil, Trash2, X,
} from 'lucide-react';
import Sidebar from '../partials/Sidebar';
import TravelerSidebar from '../partials/TravelerSidebar';
import Header from '../partials/Header';
import axiosClient from '../services/axios';

// ── helpers ──────────────────────────────────────────────────────
const avatarOf = (user) =>
  user?.profile_picture
    ? user.profile_picture
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? '?')}&background=0984E3&color=fff`;

// Build a WhatsApp link from a raw phone number.
// Strips formatting; Moroccan local numbers (leading 0) get the 212 country code.
const whatsappLink = (phone) => {
  if (!phone) return null;
  let digits = String(phone).replace(/[^\d]/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = '212' + digits.slice(1);
  return `https://wa.me/${digits}`;
};

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const formatRelative = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return formatTime(iso);
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return d.toLocaleDateString('fr-FR', { weekday: 'short' });
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
};

// Group consecutive messages by calendar day for the date separators.
const dayLabel = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Aujourd'hui";
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

export default function Messagerie() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const meId = user?.id;
  const isTraveler = !!user?.is_traveler;

  const [searchParams, setSearchParams] = useSearchParams();
  const activeUserId = searchParams.get('u') ? Number(searchParams.get('u')) : null;

  const [conversations, setConversations] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [convSearch, setConvSearch] = useState('');

  const [messages, setMessages] = useState([]);
  const [peer, setPeer] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState('');

  const bottomRef = useRef(null);
  const threadRef = useRef(null);

  // ── load conversations (with light polling) ──────────────────────
  const loadConversations = async () => {
    try {
      const { data } = await axiosClient.get('/api/conversations');
      setConversations(data.conversations ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConvs(false);
    }
  };

  useEffect(() => {
    loadConversations();
    const id = setInterval(loadConversations, 10000);
    return () => clearInterval(id);
  }, []);

  // ── load active thread (with polling) ────────────────────────────
  const loadThread = async (uid, { silent = false } = {}) => {
    if (!uid) return;
    if (!silent) setLoadingThread(true);
    try {
      const { data } = await axiosClient.get(`/api/messages/${uid}`);
      setMessages(data.messages ?? []);
      setPeer(data.peer ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoadingThread(false);
    }
  };

  useEffect(() => {
    if (!activeUserId) {
      setMessages([]);
      setPeer(null);
      return;
    }
    loadThread(activeUserId);
    const id = setInterval(() => loadThread(activeUserId, { silent: true }), 4000);
    return () => clearInterval(id);
  }, [activeUserId]);

  // Auto-scroll to bottom when messages change.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeUserId]);

  // ── send a message ───────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    const body = draft.trim();
    if (!body || !activeUserId || sending) return;

    setSending(true);
    // Optimistic bubble
    const optimistic = {
      id: `tmp-${Date.now()}`,
      sender_id: meId,
      receiver_id: activeUserId,
      body,
      read_at: null,
      created_at: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft('');

    try {
      await axiosClient.post('/api/messages', { receiver_id: activeUserId, body });
      await loadThread(activeUserId, { silent: true });
      loadConversations();
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(body);
    } finally {
      setSending(false);
    }
  };

  // ── edit / delete a message ──────────────────────────────────────
  const startEdit = (m) => {
    setEditingId(m.id);
    setEditDraft(m.body);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft('');
  };

  const saveEdit = async (m) => {
    const body = editDraft.trim();
    if (!body || body === m.body) {
      cancelEdit();
      return;
    }
    // Optimistic update
    setMessages((prev) =>
      prev.map((x) => (x.id === m.id ? { ...x, body, edited_at: new Date().toISOString() } : x))
    );
    cancelEdit();
    try {
      await axiosClient.patch(`/api/messages/${m.id}`, { body });
      loadConversations();
    } catch (err) {
      console.error(err);
      loadThread(activeUserId, { silent: true });
    }
  };

  const deleteMessage = async (m) => {
    if (!window.confirm('Voulez-vous supprimer ce message ?')) return;
    // Optimistic removal
    setMessages((prev) => prev.filter((x) => x.id !== m.id));
    try {
      await axiosClient.delete(`/api/messages/${m.id}`);
      loadConversations();
    } catch (err) {
      console.error(err);
      loadThread(activeUserId, { silent: true });
    }
  };

  const openConversation = (uid) => {
    setSearchParams({ u: String(uid) });
  };

  const filteredConvs = useMemo(() => {
    const q = convSearch.toLowerCase().trim();
    if (!q) return conversations;
    return conversations.filter((c) => c.user?.name?.toLowerCase().includes(q));
  }, [conversations, convSearch]);

  const totalUnread = conversations.reduce((s, c) => s + (c.unread || 0), 0);
  const waLink = whatsappLink(peer?.phone);

  return (
    <div className="flex h-screen overflow-hidden">
      {isTraveler
        ? <TravelerSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        : <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}

      <div className="relative flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow overflow-hidden">
          <div className="px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col max-w-9xl mx-auto w-full">

            {/* Title */}
            <div className="mb-5">
              <h1 className="text-2xl md:text-3xl text-[#0984E3] font-bold mb-1 flex items-center gap-2">
                Messagerie
                {totalUnread > 0 && (
                  <span className="bg-[#0984E3] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {totalUnread}
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-500">Discutez avec vos expéditeurs et voyageurs en temps réel.</p>
            </div>

            {/* Chat shell */}
            <div className="grow min-h-0 grid grid-cols-12 gap-4">

              {/* ── CONVERSATION LIST ─────────────────────────────── */}
              <aside className={`col-span-12 lg:col-span-4 xl:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xs flex flex-col min-h-0 ${activeUserId ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-100 dark:border-gray-700/60">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-gray-800 dark:text-gray-100">Discussions</h2>
                    <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                      <Filter size={16} />
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={convSearch}
                      onChange={(e) => setConvSearch(e.target.value)}
                      placeholder="Chercher un contact..."
                      className="pl-9 pr-3 py-2 w-full text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#0984E3] dark:text-gray-200"
                    />
                  </div>
                </div>

                <div className="grow overflow-y-auto no-scrollbar">
                  {loadingConvs ? (
                    <div className="p-3 flex flex-col gap-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700/40 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : filteredConvs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6 text-gray-400">
                      <MessageSquare size={40} className="opacity-30 mb-3" />
                      <p className="text-sm font-semibold">Aucune discussion</p>
                      <p className="text-xs mt-1">Vos contacts apparaîtront ici dès qu'une demande est créée.</p>
                    </div>
                  ) : (
                    <ul className="py-2">
                      {filteredConvs.map((c) => {
                        const isActive = c.user.id === activeUserId;
                        return (
                          <li key={c.user.id}>
                            <button
                              onClick={() => openConversation(c.user.id)}
                              className={`w-full flex items-center gap-3 px-3 py-3 transition relative ${
                                isActive
                                  ? 'bg-blue-50/70 dark:bg-blue-950/20'
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                              }`}
                            >
                              {isActive && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[#0984E3]" />}
                              <img
                                src={avatarOf(c.user)}
                                alt={c.user.name}
                                className="w-11 h-11 rounded-full object-cover shrink-0"
                              />
                              <div className="min-w-0 flex-1 text-left">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                    {c.user.name}
                                  </span>
                                  <span className="text-[11px] text-gray-400 shrink-0">{formatRelative(c.last_time)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2 mt-0.5">
                                  <span className={`text-xs truncate ${c.unread ? 'text-gray-700 dark:text-gray-200 font-medium' : 'text-gray-400'}`}>
                                    {c.last_message ?? 'Démarrer la discussion'}
                                  </span>
                                  {c.unread > 0 && (
                                    <span className="bg-[#0984E3] text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shrink-0">
                                      {c.unread}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </aside>

              {/* ── CHAT THREAD ───────────────────────────────────── */}
              <section className={`col-span-12 lg:col-span-8 xl:col-span-9 bg-white dark:bg-gray-800 rounded-2xl shadow-xs flex flex-col min-h-0 ${activeUserId ? 'flex' : 'hidden lg:flex'}`}>
                {!activeUserId ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 px-6">
                    <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center mb-4">
                      <MessageSquare size={36} className="text-[#0984E3]" />
                    </div>
                    <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">Vos messages</p>
                    <p className="text-sm mt-1 max-w-xs">Sélectionnez une discussion pour échanger avec un expéditeur ou un voyageur.</p>
                  </div>
                ) : (
                  <>
                    {/* Thread header */}
                    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700/60">
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => setSearchParams({})}
                          className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <ArrowLeft size={18} />
                        </button>
                        <div className="relative shrink-0">
                          <img
                            src={avatarOf(peer)}
                            alt={peer?.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{peer?.name ?? '...'}</p>
                          <p className="text-xs text-green-500 font-medium">En ligne</p>
                        </div>
                      </div>

                      {/* Call icon → WhatsApp */}
                      {waLink ? (
                        <Motion.a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          title={`Appeler / WhatsApp ${peer?.phone}`}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition"
                        >
                          <Phone size={18} />
                        </Motion.a>
                      ) : (
                        <button
                          disabled
                          title="Numéro indisponible"
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-300 cursor-not-allowed"
                        >
                          <Phone size={18} />
                        </button>
                      )}
                    </div>

                    {/* Messages */}
                    <div ref={threadRef} className="grow overflow-y-auto no-scrollbar px-4 py-5 bg-gray-50/40 dark:bg-gray-900/20">
                      {loadingThread ? (
                        <div className="flex flex-col gap-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={`h-10 w-1/2 rounded-2xl animate-pulse bg-gray-200 dark:bg-gray-700 ${i % 2 ? 'self-end' : 'self-start'}`} />
                          ))}
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                          <MessageSquare size={32} className="opacity-30 mb-2" />
                          <span className="flex items-center gap-1.5">
                            Aucun message. Dites bonjour
                            <Hand size={16} className="text-[#0984E3]" />
                          </span>
                        </div>
                      ) : (
                        <AnimatePresence initial={false}>
                          {messages.map((m, idx) => {
                            const mine = Number(m.sender_id) === Number(meId);
                            const prev = messages[idx - 1];
                            const showDay = !prev || dayLabel(prev.created_at) !== dayLabel(m.created_at);
                            const isReal = typeof m.id === 'number';
                            const edited = !!m.edited_at;
                            return (
                              <React.Fragment key={m.id}>
                                {showDay && (
                                  <div className="flex justify-center my-4">
                                    <span className="text-[11px] font-medium text-gray-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-xs">
                                      {dayLabel(m.created_at)}
                                    </span>
                                  </div>
                                )}
                                <Motion.div
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className={`group flex items-center gap-2 mb-2 ${mine ? 'justify-end' : 'justify-start'}`}
                                >
                                  {/* Edit / delete actions — only my own saved messages */}
                                  {mine && isReal && editingId !== m.id && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition order-first">
                                      <button
                                        onClick={() => startEdit(m)}
                                        title="Modifier"
                                        className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-[#0984E3] hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                      >
                                        <Pencil size={13} />
                                      </button>
                                      <button
                                        onClick={() => deleteMessage(m)}
                                        title="Supprimer"
                                        className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  )}

                                  <div
                                    className={`max-w-[75%] sm:max-w-[60%] px-4 py-2.5 rounded-2xl text-sm shadow-xs ${
                                      mine
                                        ? 'bg-[#0984E3] text-white rounded-br-md'
                                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700/60 rounded-bl-md'
                                    }`}
                                  >
                                    {editingId === m.id ? (
                                      <div className="flex flex-col gap-2 min-w-[180px]">
                                        <input
                                          autoFocus
                                          value={editDraft}
                                          onChange={(e) => setEditDraft(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveEdit(m);
                                            if (e.key === 'Escape') cancelEdit();
                                          }}
                                          className="px-2 py-1 rounded-lg text-sm text-gray-800 bg-white/95 border border-white focus:outline-none"
                                        />
                                        <div className="flex items-center justify-end gap-1">
                                          <button
                                            onClick={cancelEdit}
                                            title="Annuler"
                                            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                                          >
                                            <X size={14} />
                                          </button>
                                          <button
                                            onClick={() => saveEdit(m)}
                                            title="Enregistrer"
                                            className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-[#0984E3] hover:bg-blue-50 transition"
                                          >
                                            <Check size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                                        <div className={`flex items-center gap-1 mt-1 text-[10px] ${mine ? 'text-blue-100 justify-end' : 'text-gray-400'}`}>
                                          {edited && <span className="italic opacity-80">modifié</span>}
                                          {formatTime(m.created_at)}
                                          {mine && (m.pending
                                            ? <Check size={12} className="opacity-60" />
                                            : m.read_at
                                              ? <CheckCheck size={12} />
                                              : <Check size={12} />)}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </Motion.div>
                              </React.Fragment>
                            );
                          })}
                        </AnimatePresence>
                      )}
                      <div ref={bottomRef} />
                    </div>

                    {/* Composer */}
                    <form onSubmit={handleSend} className="p-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center gap-2">
                      <button type="button" className="p-2.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition shrink-0">
                        <Paperclip size={18} />
                      </button>
                      <input
                        type="text"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Tapez votre message..."
                        className="grow px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-[#0984E3] dark:text-gray-200"
                      />
                      <Motion.button
                        type="submit"
                        disabled={!draft.trim() || sending}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-11 h-11 flex items-center justify-center rounded-full bg-[#0984E3] text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
                      >
                        <Send size={18} />
                      </Motion.button>
                    </form>
                  </>
                )}
              </section>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
