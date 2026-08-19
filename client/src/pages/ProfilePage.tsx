import { Facebook, MapPin, Phone, User as UserIcon, type LucideIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { FormSection } from '@/components/shared/FormSection';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateProfile } from '@/hooks/queries/use-profile';
import { apiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

function Field({
  id,
  label,
  icon: Icon,
  children,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        <Icon size={14} strokeWidth={2} className="text-muted-foreground" />
        {label}
      </Label>
      {children}
    </div>
  );
}

export function ProfilePage(): React.JSX.Element {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form || !user) return;
    (form.elements.namedItem('name') as HTMLInputElement | null)?.setAttribute('value', user.name ?? '');
    (form.elements.namedItem('phone') as HTMLInputElement | null)?.setAttribute('value', user.phone ?? '');
    (form.elements.namedItem('location') as HTMLInputElement | null)?.setAttribute('value', user.location ?? '');
    (form.elements.namedItem('facebookId') as HTMLInputElement | null)?.setAttribute('value', user.facebookId ?? '');
  }, [user]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const str = (k: string): string | undefined => {
      const v = String(f.get(k) ?? '').trim();
      return v || undefined;
    };
    updateProfile.mutate(
      {
        name: str('name'),
        phone: str('phone'),
        location: str('location'),
        facebookId: str('facebookId'),
      },
      {
        onSuccess: () => toast.success('Profile updated'),
        onError: (err) => toast.error(apiErrorMessage(err, 'Could not update profile')),
      },
    );
  };

  return (
    <div className="container max-w-2xl py-8 md:py-12">
      <PageHeader eyebrow="Account" title="Edit profile" description={user?.email} />

      <form ref={formRef} className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <FormSection title="Your details" description="This is what owners and buyers will see.">
          <Field id="name" label="Full name" icon={UserIcon}>
            <Input
              id="name"
              name="name"
              defaultValue={user?.name ?? ''}
              required
              maxLength={100}
              placeholder="Your name"
            />
          </Field>

          <Field id="phone" label="Phone number" icon={Phone}>
            <Input
              id="phone"
              name="phone"
              defaultValue={user?.phone ?? ''}
              maxLength={30}
              placeholder="+880 17 xxxxxxxx"
            />
          </Field>

          <Field id="location" label="Location / City" icon={MapPin}>
            <Input
              id="location"
              name="location"
              defaultValue={user?.location ?? ''}
              maxLength={200}
              placeholder="e.g. Dhaka, Bangladesh"
            />
          </Field>

          <Field id="facebookId" label="Facebook profile URL or ID" icon={Facebook}>
            <Input
              id="facebookId"
              name="facebookId"
              defaultValue={user?.facebookId ?? ''}
              maxLength={200}
              placeholder="https://facebook.com/yourprofile"
            />
          </Field>
        </FormSection>

        <div className="pt-1">
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>

      <div className="surface-panel mt-6 p-5">
        <p className="type-eyebrow">Account info</p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Role</dt>
            <dd className="mt-1 text-sm font-medium capitalize">{user?.role}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Member since</dt>
            <dd className="mt-1 text-sm font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
