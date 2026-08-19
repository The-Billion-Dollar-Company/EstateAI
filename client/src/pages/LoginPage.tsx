import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthCard } from '@/components/auth/AuthCard';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/hooks/queries/use-auth';
import { apiErrorMessage } from '@/lib/api';
import { isFirebaseConfigured } from '@/lib/firebase';

export function LoginPage(): React.JSX.Element {
  const navigate = useNavigate();
  const login = useLogin();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    login.mutate(
      { email: String(form.get('email')), password: String(form.get('password')) },
      {
        onSuccess: () => navigate('/'),
        onError: (err) => setError(apiErrorMessage(err, 'Could not sign in')),
      },
    );
  };

  return (
    <AuthCard
      title="Welcome back"
      footer={
        <>
          New to EstateAI?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create an account
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
              autoComplete="current-password"
              required
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
        </div>
        <Button type="submit" size="lg" className="press-scale w-full" disabled={login.isPending}>
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <GoogleSection onError={setError} />

      <p className="mt-6 rounded-lg bg-surface px-3 py-2.5 text-center text-xs leading-5 text-muted-foreground">
        Demo account: <span className="font-medium text-foreground">buyer@estateai.test</span> ·
        password123
      </p>
    </AuthCard>
  );
}

/** Divider + Google button, hidden entirely when Firebase isn't configured. */
function GoogleSection({ onError }: { onError: (m: string) => void }): React.JSX.Element | null {
  if (!isFirebaseConfigured()) return null;
  return (
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
      <GoogleButton onError={onError} />
    </div>
  );
}
