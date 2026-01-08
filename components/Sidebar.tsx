"use client"
import { motion, AnimatePresence } from "framer-motion"
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  SearchIcon, 
  Plus, 
  Clock, 
  Settings, 
  LogIn 
} from 'lucide-react'
import SidebarSection from "./SidebarSection"
import ConversationRow from "./ConversationRow"
import ThemeToggle from "./ThemeToggle"
import SearchModal from "./SearchModal"
import { cls } from "./utils"
import { useState, useEffect } from "react"
import { api, ChatSession, User } from "@/lib/api"
import Link from "next/link"

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  theme: string;
  setTheme: (theme: string) => void;
  collapsed: { recent: boolean; pinned?: boolean };
  setCollapsed: React.Dispatch<React.SetStateAction<any>>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  sidebarCollapsed?: boolean;
  setSidebarCollapsed?: (collapsed: boolean) => void;
  // Legacy props (ignored)
  conversations?: any[];
  pinned?: any[];
  recent?: any[];
  togglePin?: any;
  query?: any;
  setQuery?: any;
  searchRef?: any;
  createNewChat?: any;
}

export default function Sidebar({
  open,
  onClose,
  theme,
  setTheme,
  collapsed,
  setCollapsed,
  selectedId,
  onSelect,
  sidebarCollapsed = false,
  setSidebarCollapsed = () => {},
}: SidebarProps) {
  const [mounted, setMounted] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  
  // Real Data States
  const [conversations, setConversations] = useState<ChatSession[]>([])
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  useEffect(() => {
    setMounted(true)

    const fetchData = async () => {
      // 1. Load Cache
      const cachedUser = localStorage.getItem("user")
      if (cachedUser) {
        try { setUserData(JSON.parse(cachedUser)) } catch (e) {}
      }

      try {
        setLoading(true)
        // 2. Fetch API
        const [chats, profile] = await Promise.allSettled([
          api.chat.list().catch(() => []),
          api.user.getProfile().catch(() => null)
        ])

        if (chats.status === "fulfilled") {
          setConversations(chats.value || [])
        }
        
        if (profile.status === "fulfilled" && profile.value) {
          setUserData(profile.value)
          localStorage.setItem("user", JSON.stringify(profile.value))
        } else if (profile.status === "fulfilled" && !profile.value) {
          setUserData(null) 
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // --- Search Logic (Fixed) ---
  const filteredConversations = conversations.filter(c => {
    // Safety check: Fallback to "New Chat" if title is missing
    const title = c.title || "New Chat"
    return title.toLowerCase().includes(query.toLowerCase())
  })

  const handleCreateChat = () => {
    onSelect(null) 
    if (window.innerWidth < 768) onClose()
  }

  const handleDeleteChat = async (id: string) => {
    try {
        await api.chat.delete(id)
        setConversations(prev => prev.filter(c => c.id !== id))
        if (selectedId === id) onSelect(null)
    } catch (e) {
        console.error("Delete failed", e)
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return "?"
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const renderUserSection = () => {
    if (!mounted) return <div className="h-12 w-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-xl" />

    if (userData) {
      return (
        <Link 
          href="/profile"
          className="mt-2 flex items-center gap-2 rounded-xl bg-zinc-50 p-2 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 transition cursor-pointer"
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-900 overflow-hidden">
            {userData.avatar_url ? (
              <img src={userData.avatar_url} alt="User" className="h-full w-full object-cover" />
            ) : (
              getInitials(userData.full_name || userData.email)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{userData.full_name || "User"}</div>
            <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{userData.email}</div>
          </div>
        </Link>
      )
    }

    return (
      <Link 
          href="/login" 
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
      >
          <LogIn className="h-4 w-4" /> Log In
      </Link>
    )
  }

  // --- Render Collapsed ---
  if (sidebarCollapsed) {
    return (
      <motion.aside
        initial={{ width: 320 }}
        animate={{ width: 64 }}
        className="z-50 flex h-full shrink-0 flex-col border-r border-zinc-200/60 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-center justify-center border-b border-zinc-200/60 px-3 py-3 dark:border-zinc-800">
          <button onClick={() => setSidebarCollapsed(false)} className="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col items-center gap-4 pt-4">
          <button onClick={handleCreateChat} className="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <Plus className="h-5 w-5" />
          </button>
          <button onClick={() => setShowSearchModal(true)} className="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <SearchIcon className="h-5 w-5" />
          </button>
        </div>
      </motion.aside>
    )
  }

  // --- Render Full ---
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(open || typeof window !== "undefined") && (
          <motion.aside
            initial={{ x: -340 }}
            animate={{ x: open ? 0 : 0 }}
            exit={{ x: -340 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className={cls(
              "z-50 flex h-full w-80 shrink-0 flex-col border-r border-zinc-200/60 bg-white dark:border-zinc-800 dark:bg-zinc-900",
              "fixed inset-y-0 left-0 md:static md:translate-x-0",
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-zinc-200/60 px-3 py-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-sm">
                  <span className="font-bold text-lg">AI</span>
                </div>
                <div className="text-sm font-semibold tracking-tight">AI Assistant</div>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <button onClick={() => setSidebarCollapsed(true)} className="hidden md:block rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <PanelLeftClose className="h-5 w-5" />
                </button>
                <button onClick={onClose} className="md:hidden rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <PanelLeftClose className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Search Input (Updated to be interactive) */}
            <div className="px-3 pt-3">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full rounded-full border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none hover:bg-zinc-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:bg-zinc-900"
                />
              </div>
            </div>

            {/* New Chat Button */}
            <div className="px-3 pt-3">
              <button
                onClick={handleCreateChat}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
              >
                <Plus className="h-4 w-4" /> Start New Chat
              </button>
            </div>

            {/* Chat List */}
            <nav className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 pb-4">
              <SidebarSection
                icon={<Clock className="h-4 w-4" />}
                title={query ? "SEARCH RESULTS" : "RECENT CHATS"}
                collapsed={collapsed.recent}
                onToggle={() => setCollapsed((s: any) => ({ ...s, recent: !s.recent }))}
              >
                {!mounted || loading ? (
                    <div className="px-4 py-2 text-xs text-zinc-400">Loading chats...</div>
                ) : filteredConversations.length === 0 ? (
                  <div className="select-none rounded-lg border border-dashed border-zinc-200 px-3 py-3 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    {query ? "No chats found." : "No conversations yet."}
                  </div>
                ) : (
                  filteredConversations.map((c) => (
                    <ConversationRow
                      key={c.id}
                      data={c}
                      active={c.id === selectedId}
                      onSelect={() => onSelect(c.id)}
                      onTogglePin={() => {}}
                      onDelete={() => handleDeleteChat(c.id)}
                      showMeta={true}
                    />
                  ))
                )}
              </SidebarSection>
            </nav>

            {/* Footer */}
            <div className="mt-auto border-t border-zinc-200/60 px-3 py-3 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                 <button className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <Settings className="w-5 h-5" />
                 </button>
                 <ThemeToggle theme={theme} setTheme={setTheme} />
              </div>
              
              {renderUserSection()}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        conversations={conversations}
        selectedId={selectedId}
        onSelect={onSelect}
        togglePin={() => {}} 
        createNewChat={handleCreateChat}
      />
    </>
  )
}