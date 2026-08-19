import { Store } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useBecomeOwner } from '@/hooks/queries/use-auth';
import { apiErrorMessage } from '@/lib/api';

interface Props {
  label?: string;
  onError?: (message: string) => void;
}

/** Upgrades a buyer to an owner so they can list properties. */
export function BecomeOwnerButton({ label = 'Become an owner', onError }: Props): React.JSX.Element {
  const becomeOwner = useBecomeOwner();
  const [localError, setLocalError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        className="press-scale gap-2"
        disabled={becomeOwner.isPending}
        onClick={() =>
          becomeOwner.mutate(undefined, {
            onError: (err) => {
              const message = apiErrorMessage(err, 'Could not upgrade your account');
              setLocalError(message);
              onError?.(message);
            },
          })
        }
      >
        <Store size={16} strokeWidth={2} aria-hidden />
        {becomeOwner.isPending ? 'Upgrading…' : label}
      </Button>
      {localError && (
        <p role="alert" className="text-sm text-destructive">
          {localError}
        </p>
      )}
    </div>
  );
}
