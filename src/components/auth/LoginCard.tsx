
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import LoginTabs from "./LoginTabs";
import UsernameLoginForm from "./UsernameLoginForm";
import PhoneLoginForm from "./PhoneLoginForm";

const LoginCard = () => {
  const [isUsernameLogin, setIsUsernameLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">SafeGroup Alerts</CardTitle>
        <CardDescription>התחבר כדי לנהל את הקבוצות והתראות שלך</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <LoginTabs 
          isUsernameLogin={isUsernameLogin} 
          setIsUsernameLogin={setIsUsernameLogin} 
          isLoading={isLoading} 
        />

        {isUsernameLogin ? (
          <UsernameLoginForm isLoading={isLoading} setIsLoading={setIsLoading} />
        ) : (
          <PhoneLoginForm isLoading={isLoading} setIsLoading={setIsLoading} />
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
  );
};

export default LoginCard;
