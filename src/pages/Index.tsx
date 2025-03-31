
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        // User is authenticated, go to dashboard
        navigate("/");
      } else {
        // User is not authenticated, go to login
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  return null;
};

export default Index;
