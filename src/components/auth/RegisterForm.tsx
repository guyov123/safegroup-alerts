import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { Mail, User, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const registerSchema = z.object({
  name: z.string().min(2, { message: "שם חייב להכיל לפחות 2 תווים" }),
  username: z.string().min(3, { message: "שם משתמש חייב להכיל לפחות 3 תווים" }),
  password: z.string().min(6, { message: "סיסמה חייבת להכיל לפחות 6 תווים" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "הסיסמאות אינן תואמות",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
}

const RegisterForm = ({ isLoading, setIsLoading }: RegisterFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    if (isLoading) return; // Prevent multiple submissions
    
    setIsLoading(true);
    try {
      // Create a valid email with proper domain format that will pass validation
      const cleanUsername = data.username.replace(/[^a-zA-Z0-9]/g, "");
      const emailAddress = `${cleanUsername}@example.com`;
      console.log("Attempting to register with:", emailAddress);
      
      // Direct sign up with properly formatted email
      const { data: authData, error } = await supabase.auth.signUp({
        email: emailAddress, // Using username with valid domain as email for authentication
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            preferred_username: data.username // Store the original username in user metadata
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) {
        console.error("Registration error:", error);
        throw error;
      }

      console.log("Registration successful:", authData);
      
      // If the user was created successfully, sign them in immediately
      if (authData.user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: emailAddress, // Using the same email format for sign in
          password: data.password
        });
        
        if (signInError) {
          console.error("Auto-login error:", signInError);
          // If auto-login fails, still consider signup a success and redirect to login
          toast({
            title: "נרשמת בהצלחה!",
            description: "אנא התחבר עם הפרטים שיצרת",
          });
          navigate("/login");
        } else {
          // Successfully signed in after registration
          toast({
            title: "נרשמת והתחברת בהצלחה!",
            description: "ברוכים הבאים למערכת",
          });
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error("Registration error caught:", error);
      
      // Handle known error types
      if (error.message.includes("already registered")) {
        toast({
          variant: "destructive",
          title: "שגיאה בהרשמה",
          description: "משתמש עם שם משתמש זה כבר רשום במערכת",
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
            name="username"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">שם משתמש</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <FormControl>
                    <Input id="username" placeholder="בחר שם משתמש" className="pl-10 text-right" dir="rtl" {...field} />
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

          <Button 
            className="w-full mt-6" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? "מבצע רישום..." : "הירשם"}
          </Button>
        </CardContent>
      </form>
    </Form>
  );
};

export default RegisterForm;
