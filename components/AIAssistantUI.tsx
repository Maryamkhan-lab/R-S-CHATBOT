"use client"

import React, { useEffect, useRef, useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import ChatPane from "./ChatPane"
import ThemeToggle from "./ThemeToggle"
import { api, User, Message } from "@/lib/api"

export default function AIAssistantUI() {
  const [mounted, setMounted] = useState(false)
  const [userData, setUserData] = useState<User | null>(null)
  
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const isStreamingRef = useRef(false)
  
  // ✅ FIX: AbortController Ref to kill requests
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [theme, setTheme] = useState("light")
  const composerRef = useRef<any>(null)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) setTheme(savedTheme)
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark")

    const savedSidebar = localStorage.getItem("sidebar-collapsed-state")
    if (savedSidebar) setSidebarCollapsed(JSON.parse(savedSidebar))

    fetchUserData()
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (theme === "dark") document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
    localStorage.setItem("theme", theme)
  }, [theme, mounted])

  const fetchUserData = async () => {
    try {
      const user = await api.user.getProfile().catch(() => null)
      if (user) setUserData(user)
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    if (!selectedId || selectedId.startsWith("new_")) {
        if (!selectedId) setMessages([])
        return
    }
    if (isStreamingRef.current) return 

    const loadMessages = async () => {
      try {
        const msgs = await api.chat.getDetails(selectedId)
        setMessages(msgs || [])
      } catch (e) {
        console.error("Failed to load messages", e)
      }
    }
    loadMessages()
  }, [selectedId, isThinking])

  const createNewChat = () => {
    // Abort any ongoing stream before switching
    if (abortControllerRef.current) abortControllerRef.current.abort()
    
    setSelectedId(null)
    setMessages([])
    setSidebarOpen(false)
  }

  const handlePauseThinking = () => {
    // ✅ FIX: Actually kill the network request
    if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
    }
    setIsThinking(false)
    isStreamingRef.current = false
  }

  const handleSend = async (content: string) => {
    if (!content.trim()) return

    // Cancel previous if exists
    if (abortControllerRef.current) abortControllerRef.current.abort()
    
    // Create new controller
    const ac = new AbortController()
    abortControllerRef.current = ac

    const tempUserMsg: Message = {
      id: Math.random().toString(),
      chat_id: selectedId || "temp",
      role: "user",
      content: content,
      created_at: new Date().toISOString(),
      is_summarized: false
    }
    
    const tempAiMsg: Message = {
      id: "ai-placeholder",
      chat_id: selectedId || "temp",
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
      is_summarized: false
    }

    setMessages(prev => [...prev, tempUserMsg, tempAiMsg])
    setIsThinking(true)
    isStreamingRef.current = true

    let currentResponse = ""
    let activeThreadId = selectedId

    await api.streamMessage(
      content,
      selectedId,
      (chunk, newThreadId) => {
        currentResponse += chunk
        
        if (newThreadId && !activeThreadId) {
            activeThreadId = newThreadId
            setSelectedId(newThreadId)
            setSidebarRefreshKey(k => k + 1) 
        }

        setMessages(prev => {
            const newArr = [...prev]
            const lastIdx = newArr.length - 1
            if (lastIdx >= 0 && newArr[lastIdx].role === "assistant") {
                newArr[lastIdx] = { ...newArr[lastIdx], content: currentResponse }
            }
            return newArr
        })
      },
      (error) => {
        console.error("Stream error:", error)
        setMessages(prev => [...prev, { 
            id: "err", chat_id: "err", role: "assistant", 
            content: "Error: " + error, created_at: new Date().toISOString(), is_summarized: false 
        }])
      },
      () => {
        setIsThinking(false)
        isStreamingRef.current = false
        abortControllerRef.current = null
      },
      ac.signal // ✅ Pass signal
    )
  }

  const handleEditMessage = async (msgId: string, newContent: string) => {
    if (abortControllerRef.current) abortControllerRef.current.abort()
    const ac = new AbortController()
    abortControllerRef.current = ac

    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: newContent } : m))
    
    const msgIndex = messages.findIndex(m => m.id === msgId)
    if (msgIndex === -1) return
    
    const truncatedMessages = messages.slice(0, msgIndex + 1)
    setMessages([...truncatedMessages, { 
        id: "ai-regen", chat_id: selectedId!, role: "assistant", 
        content: "", created_at: new Date().toISOString(), is_summarized: false 
    }])
    
    setIsThinking(true)
    isStreamingRef.current = true

    let currentResponse = ""

    await api.editMessage(
        msgId, 
        newContent,
        (chunk) => {
            currentResponse += chunk
            setMessages(prev => {
                const newArr = [...prev]
                const lastIdx = newArr.length - 1
                newArr[lastIdx] = { ...newArr[lastIdx], content: currentResponse }
                return newArr
            })
        },
        () => {
            setIsThinking(false)
            isStreamingRef.current = false
            abortControllerRef.current = null
        },
        ac.signal
    )
  }

  if (!mounted) return <div className="h-screen w-full bg-zinc-50 dark:bg-zinc-950"></div>
  
  const activeConversation = {
      id: selectedId || "new",
      title: selectedId ? "Chat" : "New Chat",
      messages: messages,
      updatedAt: new Date().toISOString(),
      preview: "",
      pinned: false,
      folder: "",
      messageCount: messages.length
  }

  return (
    <div className="h-screen w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="md:hidden sticky top-0 z-40 flex items-center gap-2 border-b border-zinc-200/60 bg-white/80 px-3 py-2 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="ml-1 flex items-center gap-2 text-sm font-semibold tracking-tight">AI Assistant</div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>

      <div className="mx-auto flex h-[calc(100vh-0px)] max-w-[1400px]">
        <Sidebar
          key={sidebarRefreshKey}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          theme={theme}
          setTheme={setTheme}
          collapsed={{ recent: false }} 
          setCollapsed={() => {}}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={(v) => {
              setSidebarCollapsed(v)
              localStorage.setItem("sidebar-collapsed-state", JSON.stringify(v))
          }}
          conversations={[]} 
        />

        <main className="relative flex min-w-0 flex-1 flex-col">
          <Header createNewChat={createNewChat} sidebarCollapsed={sidebarCollapsed} setSidebarOpen={setSidebarOpen} />
          <ChatPane
            ref={composerRef}
            conversation={activeConversation}
            onSend={handleSend}
            onEditMessage={handleEditMessage}
            onResendMessage={() => {}} 
            isThinking={isThinking}
            onPauseThinking={handlePauseThinking} // ✅ Using our new handler
            userName={userData?.full_name}
          />
        </main>
      </div>
    </div>
  )
}