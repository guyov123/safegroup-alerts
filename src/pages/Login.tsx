
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Login = () => {
  const navigate = useNavigate();
  const [isEmailLogin, setIsEmailLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Email login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Phone login states
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: "התחברות נכשלה",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "התחברות הצליחה",
          description: "ברוכים הבאים למערכת",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת ההתחברות. נסה שוב מאוחר יותר.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: false,
        }
      });
      
      if (error) {
        toast({
          title: "שליחת קוד נכשלה",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setVerificationSent(true);
        toast({
          title: "קוד נשלח",
          description: "קוד אימות נשלח למספר הטלפון שלך",
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת שליחת הקוד. נסה שוב מאוחר יותר.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms'
      });
      
      if (error) {
        toast({
          title: "אימות נכשל",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "התחברות הצליחה",
          description: "ברוכים הבאים למערכת",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת האימות. נסה שוב מאוחר יותר.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendNewCode = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: false,
        }
      });
      
      if (error) {
        toast({
          title: "שליחת קוד נכשלה",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "קוד חדש נשלח",
          description: "קוד אימות חדש נשלח למספר הטלפון שלך",
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת שליחת הקוד. נסה שוב מאוחר יותר.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">SafeGroup Alerts</CardTitle>
          <CardDescription>התחבר כדי לנהל את הקבוצות והתראות שלך</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-6">
            <Button 
              variant={isEmailLogin ? "default" : "outline"} 
              className="w-1/2" 
              onClick={() => setIsEmailLogin(true)}
              disabled={isLoading}
            >
              <Mail className="mr-2 h-4 w-4" />
              דוא"ל
            </Button>
            <Button 
              variant={!isEmailLogin ? "default" : "outline"} 
              className="w-1/2" 
              onClick={() => setIsEmailLogin(false)}
              disabled={isLoading}
            >
              <Phone className="mr-2 h-4 w-4" />
              טלפון
            </Button>
          </div>

          {isEmailLogin ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">דוא"ל</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="email" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="הזן את הדוא״ל שלך" 
                    className="pl-10 text-right" 
                    dir="rtl" 
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">סיסמה</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="הזן את הסיסמה שלך" 
                    className="pl-10 text-right" 
                    dir="rtl" 
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? "מתחבר..." : "התחבר"}
              </Button>
            </form>
          ) : (
            <form onSubmit={verificationSent ? verifyOtp : handlePhoneLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">מספר טלפון</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="phone" 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="הזן את מספר הטלפון שלך" 
                    className="pl-10 text-right" 
                    dir="rtl" 
                    required
                    disabled={verificationSent}
                  />
                </div>
              </div>
              
              {verificationSent && (
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium">קוד חד פעמי</label>
                  <div className="flex justify-center mb-2">
                    <InputOTP 
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
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
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm w-full text-left"
                    onClick={sendNewCode}
                    disabled={isLoading}
                    type="button"
                  >
                    שלח קוד חדש
                  </Button>
                </div>
              )}
              
              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading 
                  ? (verificationSent ? "מאמת..." : "שולח קוד...") 
                  : (verificationSent ? "אמת את הקוד" : "שלח קוד אימות")}
              </Button>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center text-muted-foreground">
            אין לך חשבון? 
            <Link to="/register" className="text-primary font-medium hover:underline mr-1">
              הירשם כעת
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
