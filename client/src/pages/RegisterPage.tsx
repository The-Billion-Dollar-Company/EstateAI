import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthCard } from '@/components/auth/AuthCard';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRegister } from '@/hooks/queries/use-auth';
import { apiErrorMessage } from '@/lib/api';
import { isFirebaseConfigured } from '@/lib/firebase';

export function RegisterPage(): React.JSX.Element {
  const navigate = useNavigate();
  const register = useRegister();
  const [role, setRole] = useState<'buyer' | 'owner'>('buyer');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password'));
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    register.mutate(
      {
        name: String(form.get('name')),
        email: String(form.get('email')),
        password,
        role,
      },
      {
        onSuccess: () => navigate('/'),
        onError: (err) => setError(apiErrorMessage(err, 'Could not create account')),
      },
    );
  };

  return (
    <AuthCard
      title="Create your account"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/35 bg-destructive/[0.07] px-3.5 py-2.5 text-sm leading-6 text-destructive"
          >
            {error}
          </p>
        )}
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" autoComplete="name" required placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">At least 8 characters.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">I want to</Label>
          <Select value={role} onValueChange={(v) => setRole(v as 'buyer' | 'owner')}>
            <SelectTrigger id="role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buyer">Buy or rent property</SelectItem>
              <SelectItem value="owner">List my property</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" size="lg" className="press-scale w-full" disabled={register.isPending}>
          {register.isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      {isFirebaseConfigured() && (
        <div className="mt-6 space-y-5">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                or
              </span>
            </div>
          </div>
          <GoogleButton onError={setError} />
        </div>
      )}
    </AuthCard>
  );
}
