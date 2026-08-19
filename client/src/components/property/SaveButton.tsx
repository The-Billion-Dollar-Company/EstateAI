import { Heart } from 'lucide-react';
import { useState } from 'react';

import { api, apiErrorMessage, type ApiResponse } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/types/user';

interface Props {
  propertyId: string;
  propertyTitle: string;
  className?: string;
}

/** Heart toggle wired to the saved-properties API. */
export function SaveButton({ propertyId, propertyTitle, className }: Props): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSaved = Boolean(user?.savedProperties.includes(propertyId));

  const updateUserSavedProperties = (savedProperties: string[]): void => {
    if (!user) return;
    const nextUser: User = { ...user, savedProperties };
    setUser(nextUser);
  };

  return (
    <div className={cn('absolute right-3 top-3 z-10', className)}>
      <button
        type="button"
        aria-pressed={isSaved}
        aria-label={isSaved ? `Unsave ${propertyTitle}` : `Save ${propertyTitle}`}
        disabled={isSaving}
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isAuthenticated || !user) {
            setError('Sign in to save properties');
            return;
          }
          setIsSaving(true);
          setError(null);
          const previousSavedProperties = user.savedProperties;
          const nextSavedProperties = isSaved
            ? previousSavedProperties.filter((savedId) => savedId !== propertyId)
            : [...previousSavedProperties, propertyId];
          updateUserSavedProperties(nextSavedProperties);
          try {
            const res = await api.post<ApiResponse<{ savedProperties: string[] }>>(
              `/users/me/saved/${propertyId}`,
            );
            updateUserSavedProperties(res.data.data.savedProperties);
          } catch (err) {
            updateUserSavedProperties(previousSavedProperties);
            setError(apiErrorMessage(err, 'Could not update saved properties'));
          } finally {
            setIsSaving(false);
          }
        }}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full bg-card/95 shadow-xs backdrop-blur transition-[background-color,transform] duration-200 hover:scale-105 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70',
          error && 'ring-2 ring-destructive/50',
        )}
      >
        <Heart
          size={17}
          strokeWidth={1.75}
          className={cn(
            'transition-colors',
            isSaved ? 'fill-destructive text-destructive' : 'text-foreground',
          )}
        />
      </button>
      {error && (
        <p className="mt-2 max-w-40 rounded-md bg-card/95 px-2 py-1 text-[11px] leading-4 text-destructive shadow-xs">
          {error}
        </p>
      )}
    </div>
  );
}
