import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { KeyRound, Shield } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { toast } from 'sonner';
import { WavesBackground } from './WavesBackground';
import ugandaPrisonsLogo from 'figma:asset/a1a2171c301702e7d1411052b77e2080575d2c9e.png';
import { login, verifyOtp, resendOtp } from '../../services/authService';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    setLoading(true);
    
    try {
      const response = await login({ username, password });
      
      if (response.error) {
        toast.error(response.error);
        setLoading(false);
        return;
      }
      
      // Check if MFA is required
      if (response.mfa_required) {
        // MFA required - show OTP form
        if (response.session_key) {
          setSessionId(response.session_key);
        }
        setStep('otp');
        toast.success(response.message || 'OTP sent to your registered device');
        setLoading(false);
      } else {
        // MFA not required - tokens already stored, redirect to dashboard
        toast.success(response.message || 'Login successful!');
        // Call onLogin to update app state and redirect
        onLogin();
      }
    } catch (error: any) {
      // axios interceptor shows user-friendly messages; show fallback if no response
      if (!error?.response) {
        toast.error('Failed to connect to server. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    if (!sessionId) {
      toast.error('Session expired. Please login again.');
      setStep('credentials');
      return;
    }

    setLoading(true);
    
    try {
      const response = await verifyOtp({
        session_key: sessionId,
        code: otp,
      });
      
      if (response.error) {
        toast.error(response.error);
        setLoading(false);
      } else if (response.access_token) {
        toast.success(response.message || 'Login successful!');
        setLoading(false);
        // Call onLogin to update app state
        onLogin();
      } else {
        toast.error('Invalid OTP. Please try again.');
        setLoading(false);
      }
    } catch (error: any) {
      if (!error?.response) {
        toast.error('Failed to connect to server. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    
    try {
      const response = await resendOtp(username);
      
      if (response.error) {
        toast.error(response.error);
      } else {
        // Update session key if provided
        if (response.session_key) {
          setSessionId(response.session_key);
        }
        
        toast.success(response.message || 'OTP resent successfully');
        setOtp('');
      }
    } catch (error: any) {
      if (!error?.response) {
        toast.error('Failed to connect to server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Dynamic Waves Background */}
      <WavesBackground />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-2xl mb-4 shadow-lg border-2 border-[#650000]/10 p-2">
            <img 
              src={ugandaPrisonsLogo} 
              alt="Uganda Prisons Service Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-[#650000] text-3xl mb-2">PMIS</h1>
          <p className="text-gray-700">Prison Management Information System</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              {step === 'credentials' ? (
                <Shield className="h-5 w-5 text-primary" />
              ) : (
                <KeyRound className="h-5 w-5 text-primary" />
              )}
              <CardTitle>
                {step === 'credentials' ? 'Login to PMIS' : 'Enter OTP'}
              </CardTitle>
            </div>
            <CardDescription>
              {step === 'credentials' 
                ? 'Enter your credentials to access the system'
                : 'Enter the 6-digit OTP sent to your registered device'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'credentials' ? (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username or Force Number</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username or force number"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Continue'}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <button type="button" className="text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="otp" className="text-center block">
                    One-Time Password
                  </Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOtp(value)}
                      disabled={loading}
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
                  <p className="text-center text-sm text-muted-foreground">
                    Logged in as: <span className="font-semibold">{username}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setStep('credentials');
                        setOtp('');
                      }}
                      disabled={loading}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handleResendOtp}
                      disabled={loading}
                    >
                      Resend OTP
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>© 2025 Prison Management Information System</p>
          <p className="mt-1">Authorized personnel only</p>
        </div>
      </div>
    </div>
  );
}
