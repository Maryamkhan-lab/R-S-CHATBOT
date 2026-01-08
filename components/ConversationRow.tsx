import React from "react";
import { Star, Trash2 } from "lucide-react";
import { cls, timeAgo } from "./utils";
import { ChatSession } from "@/lib/api";

// 1. Define the interface to fix the "Type not assignable" error
interface ConversationRowProps {
  data: any; // Using 'any' for flexibility, or you can match your ChatSession type exactly
  active: boolean;
  onSelect: () => void;
  onTogglePin?: () => void;
  onDelete?: () => void; // ✅ Added onDelete
  showMeta?: boolean;
  suppressHydrationWarning?: boolean;
}

export default function ConversationRow({ 
  data, 
  active, 
  onSelect, 
  onTogglePin, 
  onDelete, 
  showMeta,
  suppressHydrationWarning 
}: ConversationRowProps) {
  
  const count = Array.isArray(data.messages) ? data.messages.length : (data.messageCount || 0);

  return (
    <div className="group relative">
      <div
        onClick={onSelect}
        className={cls(
          "-mx-1 flex w-[calc(100%+8px)] cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors",
          active
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800/60 dark:text-zinc-100"
            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
        )}
        title={data.title}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium tracking-tight">
                {data.title || "New Chat"}
            </span>
            <span 
                className="shrink-0 text-[11px] text-zinc-500 dark:text-zinc-400"
                suppressHydrationWarning={suppressHydrationWarning}
            >
              {data.updated_at ? timeAgo(data.updated_at) : (data.created_at ? timeAgo(data.created_at) : "")}
            </span>
          </div>
          {showMeta && (
            <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              {count} messages
            </div>
          )}
        </div>

        {/* Action Buttons (Show on Hover) */}
        <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
            {/* Pin Button */}
            {onTogglePin && (
                <button
                    onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin();
                    }}
                    title={data.pinned ? "Unpin" : "Pin"}
                    className="rounded-md p-1 text-zinc-400 hover:bg-zinc-200/50 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-300"
                >
                    {data.pinned ? (
                    <Star className="h-4 w-4 fill-zinc-800 text-zinc-800 dark:fill-zinc-200 dark:text-zinc-200" />
                    ) : (
                    <Star className="h-4 w-4" />
                    )}
                </button>
            )}

            {/* Delete Button */}
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Optional confirmation
                        if(window.confirm("Delete this chat?")) {
                            onDelete();
                        }
                    }}
                    title="Delete Chat"
                    className="rounded-md p-1 text-zinc-400 hover:bg-red-100 hover:text-red-600 dark:text-zinc-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            )}
        </div>
      </div>

      {/* Preview Tooltip */}
      {data.preview && (
        <div className="pointer-events-none absolute left-[calc(100%+6px)] top-1 hidden w-64 rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-700 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 md:group-hover:block z-50">
            <div className="line-clamp-6 whitespace-pre-wrap">{data.preview}</div>
        </div>
      )}
    </div>
  );
}