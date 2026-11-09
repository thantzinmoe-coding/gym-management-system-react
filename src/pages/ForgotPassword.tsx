import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

const MIN_PASSWORD_LENGTH = 8;

/** Two steps: request a code by email, then set a new password with it. */
export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const fail = (error: unknown, fallback: string) =>
    toast({
      title: 'Something went wrong',
      description: (error as { message?: string })?.message || fallback,
      variant: 'destructive',
    });

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authService.requestPasswordReset(email.trim());
      toast({ title: 'Check your email', description: 'If an account exists for this address, we sent a 6-digit code.' });
      setStep('reset');
    } catch (error) {
      fail(error, 'Could not send the code.');
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) {
      fail(null, `The new password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      fail(null, 'The two passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await authService.resetPassword(email.trim(), code.trim(), password);
      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
      navigate('/login', { replace: true });
    } catch (error) {
      fail(error, 'Invalid or expired code.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Reset your password</CardTitle>
          <CardDescription>
            {step === 'email'
              ? 'Enter the email you registered with and we will send you a code.'
              : `Enter the code sent to ${email} and choose a new password.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={requestCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required autoComplete="email"
                  placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? 'Sending…' : 'Send code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">6-digit code</Label>
                <Input id="code" inputMode="numeric" required maxLength={6} autoComplete="one-time-code"
                  placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input id="password" type="password" required autoComplete="new-password"
                  placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`} value={password}
                  onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input id="confirm" type="password" required autoComplete="new-password"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={busy || code.length !== 6}>
                {busy ? 'Saving…' : 'Set new password'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" disabled={busy}
                onClick={() => setStep('email')}>
                Use a different email or resend the code
              </Button>
            </form>
          )}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Remembered it? <a href="/login" className="text-primary hover:underline">Back to sign in</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
