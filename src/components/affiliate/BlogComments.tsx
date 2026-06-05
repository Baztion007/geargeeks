'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, Trash2, User, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  postSlug: string;
  author: string;
  content: string;
  timestamp: number;
}

const STORAGE_KEY = 'geargeekz-blog-comments';

function getComments(): Comment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveComments(comments: Comment[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Color palette for avatar backgrounds (amber/warm themed)
const avatarColors = [
  'from-amber-400 to-orange-500',
  'from-orange-400 to-red-500',
  'from-amber-500 to-yellow-500',
  'from-orange-500 to-amber-600',
  'from-yellow-500 to-amber-500',
  'from-red-400 to-orange-500',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function BlogComments({ postSlug }: { postSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Load comments on mount and when postSlug changes
  useEffect(() => {
    setComments(getComments().filter((c) => c.postSlug === postSlug));
  }, [postSlug]);

  const postComments = comments
    .sort((a, b) => b.timestamp - a.timestamp);
  const visibleComments = showAll ? postComments : postComments.slice(0, 3);
  const commentCount = postComments.length;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!authorName.trim() || !content.trim()) {
        toast({ title: 'Missing fields', description: 'Please fill in your name and comment.', variant: 'destructive' });
        return;
      }
      if (authorName.trim().length < 2) {
        toast({ title: 'Name too short', description: 'Your name must be at least 2 characters.', variant: 'destructive' });
        return;
      }
      if (content.trim().length < 3) {
        toast({ title: 'Comment too short', description: 'Your comment must be at least 3 characters.', variant: 'destructive' });
        return;
      }

      setIsSubmitting(true);

      const newComment: Comment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        postSlug,
        author: authorName.trim(),
        content: content.trim(),
        timestamp: Date.now(),
      };

      const allComments = getComments();
      allComments.push(newComment);
      saveComments(allComments);
      // Save the last author name so they can delete their own comments
      localStorage.setItem('geargeekz-last-comment-author', authorName.trim());
      setComments(allComments.filter((c) => c.postSlug === postSlug));
      setContent('');
      setIsSubmitting(false);
      setIsFormOpen(false);

      toast({ title: 'Comment posted!', description: 'Your comment has been published.' });
    },
    [authorName, content, postSlug]
  );

  const handleDelete = useCallback(
    (commentId: string) => {
      const allComments = getComments().filter((c) => c.id !== commentId);
      saveComments(allComments);
      setComments(allComments.filter((c) => c.postSlug === postSlug));
      toast({ title: 'Comment deleted', description: 'Your comment has been removed.' });
    },
    [postSlug]
  );

  // Check if the current user (by author name stored in localStorage) can delete a comment
  const canDelete = (commentAuthor: string): boolean => {
    // Simple heuristic: if the user previously submitted with this name from this browser
    // we allow deletion — this is a localStorage-only approach
    const lastAuthor = localStorage.getItem('geargeekz-last-comment-author');
    return lastAuthor === commentAuthor;
  };

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-amber-500" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Comments
          </h3>
          {commentCount > 0 && (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold">
              {commentCount}
            </Badge>
          )}
        </div>
        <Button
          onClick={() => setIsFormOpen(!isFormOpen)}
          size="sm"
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-sm hover:shadow-md transition-all"
        >
          <MessageSquare size={14} className="mr-1.5" />
          Write a Comment
        </Button>
      </div>

      {/* Comment Form */}
      {isFormOpen && (
        <Card className="mb-6 border-amber-200 dark:border-amber-800/30 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Send size={14} className="text-amber-500" />
              Write a Comment
            </h4>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="comment-author" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Your Name
                </label>
                <input
                  id="comment-author"
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={50}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="comment-content" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Comment
                </label>
                <textarea
                  id="comment-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={3}
                  maxLength={1000}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors resize-none"
                />
                <p className="text-[10px] text-gray-400 mt-1 text-right">{content.length}/1000</p>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFormOpen(false)}
                  className="text-gray-500 dark:text-gray-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Posting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Send size={12} />
                      Post Comment
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      {commentCount === 0 ? (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-8 text-center">
            <MessageSquare size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No comments yet. Be the first to share your thoughts!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visibleComments.map((comment) => (
            <Card
              key={comment.id}
              className="border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(
                      comment.author
                    )} flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    <span className="text-xs font-bold text-white">
                      {getInitials(comment.author)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {comment.author}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <Clock size={10} />
                        {timeAgo(comment.timestamp)}
                      </span>
                      {canDelete(comment.author) && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="ml-auto text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                          aria-label="Delete comment"
                          title="Delete your comment"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed whitespace-pre-line">
                      {comment.content}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5" title={formatTimestamp(comment.timestamp)}>
                      {formatTimestamp(comment.timestamp)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Show more / less toggle */}
          {commentCount > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full text-center py-2 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-colors flex items-center justify-center gap-1"
            >
              {showAll ? (
                <>
                  Show Less <ChevronUp size={14} />
                </>
              ) : (
                <>
                  Show {commentCount - 3} More Comment{commentCount - 3 !== 1 ? 's' : ''} <ChevronDown size={14} />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
