
import { Button } from "@/components/ui/button";
import { User, Phone } from "lucide-react";

interface LoginTabsProps {
  isUsernameLogin: boolean;
  setIsUsernameLogin: (isUsernameLogin: boolean) => void;
  isLoading: boolean;
}

const LoginTabs = ({ isUsernameLogin, setIsUsernameLogin, isLoading }: LoginTabsProps) => {
  return (
    <div className="flex gap-2 mb-6">
      <Button 
        variant={isUsernameLogin ? "default" : "outline"} 
        className="w-1/2" 
        onClick={() => setIsUsernameLogin(true)}
        disabled={isLoading}
      >
        <User className="mr-2 h-4 w-4" />
        שם משתמש
      </Button>
      <Button 
        variant={!isUsernameLogin ? "default" : "outline"} 
        className="w-1/2" 
        onClick={() => setIsUsernameLogin(false)}
        disabled={isLoading}
      >
        <Phone className="mr-2 h-4 w-4" />
        טלפון
      </Button>
    </div>
  );
};

export default LoginTabs;
