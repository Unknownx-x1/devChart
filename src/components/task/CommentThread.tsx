"use client";

import React, { useState } from "react";
import Avatar from "@/components/shared/Avatar";
import { useAuth } from "@/context/AuthContext";

interface Comment {
  _id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

interface CommentThreadProps {
  comments: Comment[];
  onAddComment: (text: string) => Promise<void>;
}

export default function CommentThread({ comments, onAddComment }: CommentThreadProps) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;

    try {
      setSubmitting(true);
      await onAddComment(commentText.trim());
      setCommentText("");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-bold text-black uppercase tracking-wider">Discussion ({comments.length})</h3>

      {/* Comment List */}
      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-2">No discussion yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="flex gap-3 bg-zinc-50 border border-zinc-200 rounded-lg p-3"
            >
              <Avatar name={comment.authorName} size="sm" />
              <div className="flex flex-col flex-1 gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black">{comment.authorName}</span>
                  <span className="text-[10px] text-zinc-500">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-xs text-zinc-700 whitespace-pre-wrap">{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      {user?.role !== "Visitor" && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            rows={2}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Ask a question or add details..."
            className="w-full p-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
            maxLength={1000}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!commentText.trim() || submitting}
              className="py-1 px-3.5 bg-black text-teal-200 hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
