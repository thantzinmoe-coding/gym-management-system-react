import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { Mail, RefreshCw } from 'lucide-react';
import { authService } from '@/services/authService';

export default function VerifyOTP() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { email, role, userId } = location.state || {};

  console.log(userId);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const verified = await authService.verifyAccount({
        email,
        otp,
      });

      if (verified) {
        toast({
          title: 'Email Verified',
          description: 'Your email has been successfully verified.',
        });

        // Navigate to MemberProfileSetup with userId, email, and role
        navigate(`/setup/${role.toLowerCase()}-profile`, {
          state: { userId, email, role }
        });

      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOTP = async () => {
    const response = await authService.resendOTP(email);

    if (response) {
      toast({
        title: "OTP Resent",
        description: `New verification code sent to ${email}.`,
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Mail className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to
            <br />
            <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Verification Code</label>
            <div className="flex justify-center">
              <InputOTP 
                maxLength={6} 
                value={otp} 
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <Button 
            onClick={handleVerifyOTP}
            className="w-full" 
            disabled={isVerifying || otp.length !== 6}
          >
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Didn't receive the code?
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resendOTP}
              className="text-primary"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Resend Code
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}