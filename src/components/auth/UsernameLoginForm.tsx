
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface UsernameLoginFormProps {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const UsernameLoginForm = ({ isLoading, setIsLoading }: UsernameLoginFormProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent multiple submissions
    
    setIsLoading(true);
    
    try {
      console.log("Attempting to log in with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        
        // Check for specific error messages
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "התחברות נכשלה",
            description: "אימייל או סיסמה שגויים. נסה שוב.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "התחברות נכשלה",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        console.log("Login successful:", data);
        toast({
          title: "התחברות הצליחה",
          description: "ברוכים הבאים למערכת",
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error("Login error caught:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת ההתחברות. נסה שוב מאוחר יותר.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleUsernameLogin} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">אימייל</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            id="email" 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="הזן את האימייל שלך" 
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
  );
};

export default UsernameLoginForm;
