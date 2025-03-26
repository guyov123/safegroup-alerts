
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, User, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const registerSchema = z.object({
  name: z.string().min(2, { message: "שם חייב להכיל לפחות 2 תווים" }),
  email: z.string().email({ message: "כתובת דוא״ל לא תקינה" }),
  password: z.string().min(6, { message: "סיסמה חייבת להכיל לפחות 6 תווים" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "הסיסמאות אינן תואמות",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "נרשמת בהצלחה!",
        description: "ברוך הבא ל-SafeGroup",
      });

      navigate("/login");
    } catch (error: any) {
      // Handle known error types
      if (error.message.includes("already registered")) {
        toast({
          variant: "destructive",
          title: "שגיאה בהרשמה",
          description: "משתמש עם דוא״ל זה כבר רשום במערכת",
        });
      } else {
        toast({
          variant: "destructive",
          title: "שגיאה בהרשמה",
          description: error.message || "אירעה שגיאה בתהליך ההרשמה",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">הצטרף ל-SafeGroup</CardTitle>
          <CardDescription>צור חשבון חדש כדי להתחיל להשתמש באפליקציה</CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">שם מלא</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <FormControl>
                        <Input id="name" placeholder="הזן את שמך המלא" className="pl-10 text-right" dir="rtl" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">דוא"ל</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <FormControl>
                        <Input id="email" placeholder="הזן את הדוא״ל שלך" className="pl-10 text-right" dir="rtl" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">סיסמה</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <FormControl>
                        <Input id="password" type="password" placeholder="צור סיסמה חזקה" className="pl-10 text-right" dir="rtl" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">אימות סיסמה</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <FormControl>
                        <Input id="confirmPassword" type="password" placeholder="הזן את הסיסמה שוב" className="pl-10 text-right" dir="rtl" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                {isLoading ? "מבצע רישום..." : "הירשם"}
              </Button>
            </CardContent>
          </form>
        </Form>
        
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center text-muted-foreground">
            כבר יש לך חשבון? 
            <Link to="/login" className="text-primary font-medium hover:underline mr-1">
              התחבר כעת
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
