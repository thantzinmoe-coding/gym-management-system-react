import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { checkPasswordStrength } from "@/utils/passwordUtils";

export type Role = 'ADMIN' | 'TRAINER' | 'MEMBER';

export default function Register() {
  const user = authService.getCurrentUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('MEMBER');
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = checkPasswordStrength(password);


  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);


    // Basic validation
    const passwordStrengthRules = [
      /.{6,}/,
      /[A-Z]/,
      /[a-z]/,
      /[0-9]/,
      /[^A-Za-z0-9]/,
    ];

    const failedRules = passwordStrengthRules.filter((rule) => !rule.test(password));

    if (failedRules.length > 0) {
      toast({
        title: "Weak password",
        description:
          "Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      await authService.verifyEmail(email);
    } catch (error) {
      toast({
        title: "OTP sending failed",
        description: error?.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      console.error('OTP sending error:', error?.message);
      return;
    }

    try {
      const response = await authService.register({
        email: email,
        password: password,
        role: role
      });

      const Id = response.data.data?.currentUser?.id;

      console.log(Id);

      if (!Id) {
        throw new Error('User ID not found in response');
      }

      setUserId(Id);

      console.log('Registration successful:', response.data);

      navigate('/verify-otp', {
        state: {
          email,
          role,
          userId: Id
        }
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error?.message || "Failed to register. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      console.error('Registration error:', error?.message);
      return;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Join Our Gym</CardTitle>
          <CardDescription>Create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Input with Eye Toggle */}
            <div className="space-y-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500"
                disabled={isLoading}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
              {password && (
                <p className={`text-xs mt-1 ${strength.color}`}>
                  Strength: {strength.label}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">Register as</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as Role)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trainer">Trainer</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button with Loading State */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue to Verification"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Already have an account? <a href="/login" className="text-primary hover:underline">Login</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
