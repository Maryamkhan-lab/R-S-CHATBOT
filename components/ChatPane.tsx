"use client"

import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react"
import { Pencil, RefreshCw, Check, X, Square, Sparkles, User, Bot, Copy } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea" // ✅ This will work now
import { cn } from "@/lib/utils"
import { Message as MessageType } from "@/lib/api"
import { timeAgo } from "./utils"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
// ✅ Import ComposerHandle to use in types
import Composer, { ComposerHandle } from "./Composer" 

// ✅ 1. Update Handle Interface to include 'focus'
export interface ChatPaneHandle {
  insertTemplate: (content: string) => void;
  focus: () => void;
}

interface ChatPaneProps {
  conversation: {
    id: string
    title: string
    messages: MessageType[]
    updatedAt: string
    preview: string
    pinned: boolean
    folder: string
    messageCount: number
  } | null
  onSend: (content: string) => void
  onEditMessage: (messageId: string, newContent: string) => void
  onResendMessage: (messageId: string) => void
  isThinking: boolean
  onPauseThinking: () => void
  userName?: string
}

function ThinkingMessage({ onPause }: { onPause: () => void }) {
  return (
    <div className="group flex gap-4 px-4">
       <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border text-xs font-medium shadow-sm border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400">
          <Bot className="h-4 w-4" />
       </div>
       <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">AI Assistant</span>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></div>
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></div>
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400"></div>
            </div>
            <button
              onClick={onPause}
              className="ml-auto inline-flex items-center gap-1 rounded-full border border-zinc-300 px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <Square className="h-3 w-3" /> Stop
            </button>
          </div>
       </div>
    </div>
  )
}

const ChatPane = forwardRef<ChatPaneHandle, ChatPaneProps>(function ChatPane(
  { conversation, onSend, onEditMessage, onResendMessage, isThinking, onPauseThinking, userName },
  ref,
) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // ✅ 2. Internal Ref for Composer
  const internalComposerRef = useRef<ComposerHandle>(null)

  useEffect(() => {
    if (scrollRef.current) {
        const div = scrollRef.current
        const isNearBottom = div.scrollHeight - div.scrollTop - div.clientHeight < 100
        if(isNearBottom || isThinking) {
            div.scrollTop = div.scrollHeight
        }
    }
  }, [conversation?.messages, isThinking])

  // ✅ 3. Correctly implement useImperativeHandle
  useImperativeHandle(ref, () => ({
      insertTemplate: (templateContent: string) => {
        internalComposerRef.current?.insertTemplate(templateContent)
      },
      focus: () => {
        internalComposerRef.current?.focus()
      }
  }), [])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-zinc-500">
        <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
          <Sparkles className="h-8 w-8 text-zinc-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">AI Assistant</h3>
        <p className="max-w-sm text-sm">Select a conversation from the sidebar or start a new chat to begin.</p>
      </div>
    )
  }

  const messages = conversation.messages || []

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        
        {messages.length > 0 && (
           <div className="mx-auto max-w-3xl pb-4 border-b border-zinc-100 dark:border-zinc-800/50 mb-6">
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                {conversation.title || "New Chat"}
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                {messages.length} messages · Updated {timeAgo(conversation.updatedAt)}
              </p>
           </div>
        )}

        {messages.map((msg) => (
            <div key={msg.id} className={cn("group flex gap-4 mx-auto max-w-3xl", msg.role === "assistant" ? "" : "flex-row-reverse")}>
              <div className={cn(
                "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border text-xs font-medium shadow-sm",
                msg.role === "user" 
                  ? "border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400"
                  : "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400"
              )}>
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div className={cn(
                  "flex-1 min-w-0 space-y-1 relative",
                  msg.role === "user" ? "text-right" : "text-left"
              )}>
                <div className={cn("flex items-center gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {msg.role === "user" ? (userName || "You") : "AI Assistant"}
                  </span>
                </div>

                {editingId === msg.id ? (
                  <div className="mt-2 space-y-2 text-left">
                    <Textarea
                      value={draft}
                      // ✅ 4. Fixed implicit 'any' error
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft(e.target.value)}
                      className="min-h-[100px] bg-white dark:bg-zinc-900"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => {
                        onEditMessage(msg.id, draft)
                        setEditingId(null)
                      }}><Check className="w-3 h-3 mr-1"/> Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className={cn(
                      "rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed border",
                      msg.role === "user" 
                        ? "bg-white border-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 rounded-tr-sm"
                        : "bg-zinc-50/80 border-transparent dark:bg-zinc-900/50 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tl-sm w-full"
                  )}>
                     {msg.content ? (
                        <div className={cn(
                          "prose prose-sm dark:prose-invert max-w-none break-words",
                          "prose-table:border-collapse prose-th:bg-zinc-100 dark:prose-th:bg-zinc-800 prose-td:border prose-th:border prose-td:border-zinc-200 dark:prose-td:border-zinc-700 prose-th:p-2 prose-td:p-2"
                        )}>
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" />,
                                    code: ({node, className, children, ...props}) => {
                                        return (
                                            <code className={cn("bg-zinc-100 dark:bg-zinc-800 rounded px-1 py-0.5 font-mono text-xs", className)} {...props}>
                                                {children}
                                            </code>
                                        )
                                    },
                                    pre: ({node, ...props}) => (
                                        <pre className="bg-zinc-900 text-zinc-100 p-3 rounded-lg overflow-x-auto my-2" {...props} />
                                    )
                                }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                     ) : (
                        <span className="animate-pulse text-zinc-400">Thinking...</span>
                     )}
                  </div>
                )}
                
                {!editingId && !isThinking && (
                   <div className={cn(
                       "flex gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity",
                       msg.role === "user" ? "justify-end" : "justify-start"
                   )}>
                      {msg.role === "user" && (
                         <button onClick={() => { setEditingId(msg.id); setDraft(msg.content); }} className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded dark:hover:bg-zinc-800" title="Edit">
                           <Pencil className="w-3.5 h-3.5" />
                         </button>
                      )}
                      {msg.role === "assistant" && (
                        <>
                           <button onClick={() => handleCopy(msg.content)} className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded dark:hover:bg-zinc-800" title="Copy">
                             <Copy className="w-3.5 h-3.5" />
                           </button>
                           <button onClick={() => onResendMessage(msg.id)} className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded dark:hover:bg-zinc-800" title="Regenerate">
                             <RefreshCw className="w-3.5 h-3.5" />
                           </button>
                        </>
                      )}
                   </div>
                )}
              </div>
            </div>
        ))}
        
        {isThinking && (
           <div className="mx-auto max-w-3xl">
              <ThinkingMessage onPause={onPauseThinking} />
           </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-zinc-950">
         <div className="mx-auto max-w-3xl">
            {/* ✅ 5. Pass internalRef here, not the forwarded ref */}
            <Composer 
                ref={internalComposerRef} 
                onSend={onSend} 
                busy={isThinking} 
            />
         </div>
      </div>
    </div>
  )
})

export default ChatPane