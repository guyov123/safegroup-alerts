
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface PhoneLoginFormProps {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const PhoneLoginForm = ({ isLoading, setIsLoading }: PhoneLoginFormProps) => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

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
  );
};

export default PhoneLoginForm;
