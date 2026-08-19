import { Star } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateReview } from '@/hooks/queries/use-properties';
import { apiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

interface StarPickerProps {
  value: number;
  onChange: (value: number) => void;
}

function StarPicker({ value, onChange }: StarPickerProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          onClick={() => onChange(n)}
          className="press-scale rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Star
            size={22}
            strokeWidth={2}
            className={cn(n <= value ? 'fill-warning text-warning' : 'text-border')}
          />
        </button>
      ))}
    </div>
  );
}

interface Props {
  propertyId: string;
}

/** A minimal "leave a review" form: star rating + comment, one review per user. */
export function ReviewForm({ propertyId }: Props): React.JSX.Element | null {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const createReview = useCreateReview(propertyId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!isAuthenticated) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-surface/60 px-4 py-5 text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>{' '}
        to write a review.
      </p>
    );
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (rating < 1) {
      toast.error('Pick a star rating first');
      return;
    }
    createReview.mutate(
      { rating, comment: comment.trim() },
      {
        onSuccess: () => {
          toast.success('Review posted — thanks!');
          setRating(0);
          setComment('');
        },
        onError: (err) => toast.error(apiErrorMessage(err, 'Could not post your review')),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="surface-card space-y-3.5 p-5">
      <p className="type-eyebrow">Write a review</p>
      <StarPicker value={rating} onChange={setRating} />
      <Textarea
        aria-label="Your review"
        placeholder="Share how your experience with this listing went…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={1000}
        required
      />
      <Button type="submit" size="sm" disabled={createReview.isPending}>
        {createReview.isPending ? 'Posting…' : 'Post review'}
      </Button>
    </form>
  );
}
