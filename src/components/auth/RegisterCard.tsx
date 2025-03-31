
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import RegisterForm from "./RegisterForm";

const RegisterCard = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">הצטרף ל-SafeGroup</CardTitle>
        <CardDescription>צור חשבון חדש כדי להתחיל להשתמש באפליקציה</CardDescription>
      </CardHeader>
      
      <RegisterForm isLoading={isLoading} setIsLoading={setIsLoading} />
      
      <CardFooter className="flex justify-center">
        <p className="text-sm text-center text-muted-foreground">
          כבר יש לך חשבון? 
          <Link to="/login" className="text-primary font-medium hover:underline mr-1">
            התחבר כעת
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterCard;
