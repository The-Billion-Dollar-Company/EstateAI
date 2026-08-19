import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: 'confirm' | 'decline';
  bookingTitle: string;
  loading?: boolean;
  onSubmit: (message: string) => void;
}

export function RespondBookingDialog({
  open,
  onOpenChange,
  action,
  bookingTitle,
  loading = false,
  onSubmit,
}: Props): React.JSX.Element {
  const [message, setMessage] = useState('');

  const isConfirm = action === 'confirm';

  const handleSubmit = (): void => {
    onSubmit(message.trim());
    setMessage('');
  };

  const handleClose = (open: boolean): void => {
    if (!open) setMessage('');
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isConfirm ? 'Confirm booking' : 'Decline booking'}</DialogTitle>
          <DialogDescription>
            {isConfirm
              ? `Confirm this request for "${bookingTitle}". Your phone number will be shared with the buyer.`
              : `Decline this request for "${bookingTitle}".`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="owner-msg">
            Message to buyer <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="owner-msg"
            rows={3}
            placeholder={
              isConfirm
                ? 'e.g. "Looking forward to your visit! Please call before coming."'
                : 'e.g. "Sorry, this listing is no longer available."'
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={isConfirm ? 'default' : 'destructive'}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Sending…' : isConfirm ? 'Confirm' : 'Decline'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
