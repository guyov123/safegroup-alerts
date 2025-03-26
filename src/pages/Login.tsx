
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Lock } from "lucide-react";

const Login = () => {
  const [isEmailLogin, setIsEmailLogin] = useState(true);

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
            >
              <Mail className="mr-2 h-4 w-4" />
              דוא"ל
            </Button>
            <Button 
              variant={!isEmailLogin ? "default" : "outline"} 
              className="w-1/2" 
              onClick={() => setIsEmailLogin(false)}
            >
              <Phone className="mr-2 h-4 w-4" />
              טלפון
            </Button>
          </div>

          {isEmailLogin ? (
            <>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">דוא"ל</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="email" placeholder="הזן את הדוא״ל שלך" className="pl-10 text-right" dir="rtl" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">סיסמה</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="password" type="password" placeholder="הזן את הסיסמה שלך" className="pl-10 text-right" dir="rtl" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">מספר טלפון</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="phone" placeholder="הזן את מספר הטלפון שלך" className="pl-10 text-right" dir="rtl" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium">קוד חד פעמי</label>
                <Input id="otp" placeholder="הזן את הקוד שנשלח אליך" className="text-right" dir="rtl" />
                <Button variant="link" className="p-0 h-auto text-sm w-full text-left">שלח קוד חדש</Button>
              </div>
            </>
          )}

          <Button className="w-full mt-6">התחבר</Button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">או המשך באמצעות</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full">
            <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden="true">
              <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
              <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
              <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
              <path d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24 12.0004 24Z" fill="#34A853" />
            </svg>
            התחבר עם Google
          </Button>
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
