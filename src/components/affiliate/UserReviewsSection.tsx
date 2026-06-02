'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Star, ThumbsUp, MessageSquarePlus, CheckCircle2, Loader2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

interface UserReview {
  id: string;
  productSlug: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  pros: string | null;
  cons: string | null;
  verified: boolean;
  helpful: number;
  createdAt: string;
}

interface UserReviewsSectionProps {
  productSlug: string;
}

function StarRatingSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
          aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
        >
          <Star
            size={28}
            className={`transition-colors ${
              star <= (hover || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{value} of 5</span>
      )}
    </div>
  );
}

function ReviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={`${
            star <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function ReviewSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border border-gray-200 dark:border-gray-700">
          <CardContent className="p-5">
            <div className="skeleton-shimmer h-5 w-48 mb-3 rounded" />
            <div className="skeleton-shimmer h-4 w-32 mb-3 rounded" />
            <div className="skeleton-shimmer h-4 w-full mb-2 rounded" />
            <div className="skeleton-shimmer h-4 w-3/4 rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function WriteReviewDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    author: string;
    rating: number;
    title: string;
    content: string;
    pros: string;
    cons: string;
  }) => void;
  isSubmitting: boolean;
}) {
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (author.trim().length < 2) newErrors.author = 'Name must be at least 2 characters';
    if (rating === 0) newErrors.rating = 'Please select a rating';
    if (title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters';
    if (content.trim().length < 10) newErrors.content = 'Review must be at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ author: author.trim(), rating, title: title.trim(), content: content.trim(), pros: pros.trim(), cons: cons.trim() });
  };

  const handleClose = () => {
    setAuthor('');
    setRating(0);
    setTitle('');
    setContent('');
    setPros('');
    setCons('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Write a Review</h3>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              aria-label="Close dialog"
            >
              <X size={18} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="review-author" className="text-gray-900 dark:text-gray-200">Your Name *</Label>
              <Input
                id="review-author"
                value={author}
                onChange={(e) => { setAuthor(e.target.value); setErrors((p) => ({ ...p, author: '' })); }}
                placeholder="Enter your name"
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-[#007185] focus:ring-[#007185]"
              />
              {errors.author && <p className="text-red-500 text-xs">{errors.author}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-200">Your Rating *</Label>
              <StarRatingSelector value={rating} onChange={(v) => { setRating(v); setErrors((p) => ({ ...p, rating: '' })); }} />
              {errors.rating && <p className="text-red-500 text-xs">{errors.rating}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-title" className="text-gray-900 dark:text-gray-200">Review Title *</Label>
              <Input
                id="review-title"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })); }}
                placeholder="Summarize your experience"
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-[#007185] focus:ring-[#007185]"
              />
              {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-content" className="text-gray-900 dark:text-gray-200">Your Review *</Label>
              <Textarea
                id="review-content"
                value={content}
                onChange={(e) => { setContent(e.target.value); setErrors((p) => ({ ...p, content: '' })); }}
                placeholder="Share your detailed experience with this product..."
                rows={4}
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-[#007185] focus:ring-[#007185] resize-none"
              />
              {errors.content && <p className="text-red-500 text-xs">{errors.content}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="review-pros" className="text-gray-900 dark:text-gray-200">Pros (optional)</Label>
                <Input
                  id="review-pros"
                  value={pros}
                  onChange={(e) => setPros(e.target.value)}
                  placeholder="What did you like?"
                  className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-[#007185] focus:ring-[#007185]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="review-cons" className="text-gray-900 dark:text-gray-200">Cons (optional)</Label>
                <Input
                  id="review-cons"
                  value={cons}
                  onChange={(e) => setCons(e.target.value)}
                  placeholder="What could be improved?"
                  className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-[#007185] focus:ring-[#007185]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold px-6 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-gray-300 dark:border-gray-600 dark:text-gray-300"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function UserReviewsSection({ productSlug }: UserReviewsSectionProps) {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set());

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews?productSlug=${encodeURIComponent(productSlug)}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [productSlug]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (data: {
    author: string;
    rating: number;
    title: string;
    content: string;
    pros: string;
    cons: string;
  }) => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to submit review',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Review Submitted!',
        description: 'Thank you for sharing your experience.',
      });

      setDialogOpen(false);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (helpfulIds.has(reviewId)) return;

    try {
      setHelpfulIds((prev) => new Set(prev).add(reviewId));
      const response = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      });

      if (response.ok) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
          )
        );
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      setHelpfulIds((prev) => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
    percentage: reviews.length > 0
      ? (reviews.filter((r) => Math.round(r.rating) === star).length / reviews.length) * 100
      : 0,
  }));

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Reviews</h2>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold"
        >
          <MessageSquarePlus size={16} className="mr-2" />
          Write a Review
        </Button>
      </div>

      {loading ? (
        <ReviewSkeleton />
      ) : reviews.length === 0 ? (
        /* Empty State */
        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquarePlus size={28} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Be the first to review this product
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 max-w-md mx-auto">
              Share your experience with other coffee enthusiasts. Your review helps others make informed decisions.
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold"
            >
              <MessageSquarePlus size={16} className="mr-2" />
              Write the First Review
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Average Rating Summary */}
          <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex flex-col items-center shrink-0">
                  <div className="text-5xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={18}
                        className={`${
                          star <= Math.round(averageRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex-1 w-full max-w-sm">
                  {ratingDistribution.map(({ star, count, percentage }) => (
                    <div key={star} className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400 w-6 text-right">{star}</span>
                      <Star size={12} className="text-gray-400 dark:text-gray-500 fill-gray-400 dark:fill-gray-500 shrink-0" />
                      <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{review.author}</span>
                        {review.verified && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                            <CheckCircle2 size={12} />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <ReviewStars rating={review.rating} />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2">{review.title}</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{review.content}</p>

                  {(review.pros || review.cons) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {review.pros && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">Pros</span>
                          <p className="text-xs text-emerald-800 dark:text-emerald-300">{review.pros}</p>
                        </div>
                      )}
                      {review.cons && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                          <span className="text-xs font-semibold text-red-700 dark:text-red-400 block mb-1">Cons</span>
                          <p className="text-xs text-red-800 dark:text-red-300">{review.cons}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <Separator className="my-3 dark:bg-gray-700" />

                  <button
                    onClick={() => handleHelpful(review.id)}
                    disabled={helpfulIds.has(review.id)}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                      helpfulIds.has(review.id)
                        ? 'text-[#007185] dark:text-[#5cc7d4] cursor-default'
                        : 'text-gray-500 dark:text-gray-400 hover:text-[#007185] dark:hover:text-[#5cc7d4]'
                    }`}
                    aria-label="Mark review as helpful"
                  >
                    <ThumbsUp size={14} className={helpfulIds.has(review.id) ? 'fill-[#007185] dark:fill-[#5cc7d4]' : ''} />
                    Helpful {review.helpful > 0 && `(${review.helpful})`}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Write Review Dialog */}
      <WriteReviewDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmitReview}
        isSubmitting={submitting}
      />
    </section>
  );
}
