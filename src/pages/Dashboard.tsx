
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, ShieldCheck, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface GroupMember {
  id: string;
  name: string | null;
  email: string;
  status: "safe" | "unknown";
  time: string;
  image: string;
}

interface Group {
  id: string;
  name: string;
  members: GroupMember[];
}

const Dashboard = () => {
  const [isSafe, setIsSafe] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  
  useEffect(() => {
    const fetchGroupsAndMembers = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        // Fetch groups that belong to the current user
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });
          
        if (groupsError) {
          console.error("Error fetching groups:", groupsError);
          toast.error("שגיאה בטעינת הקבוצות");
          setIsLoading(false);
          return;
        }
        
        if (!groupsData || groupsData.length === 0) {
          setGroups([]);
          setIsLoading(false);
          return;
        }
        
        // For each group, fetch its members
        const groupsWithMembers = await Promise.all(
          groupsData.map(async (group) => {
            const { data: membersData, error: membersError } = await supabase
              .from('group_members')
              .select('*')
              .eq('group_id', group.id);
              
            if (membersError) {
              console.error(`Error fetching members for group ${group.id}:`, membersError);
              return {
                ...group,
                members: []
              };
            }
            
            // Map the members data to include status and time (assuming all are 'unknown' by default)
            const members: GroupMember[] = membersData.map(member => ({
              id: member.id,
              name: member.name,
              email: member.email,
              status: "unknown",
              time: "",
              image: ""
            }));
            
            return {
              ...group,
              members
            };
          })
        );
        
        setGroups(groupsWithMembers);
      } catch (error) {
        console.error("Error:", error);
        toast.error("שגיאה בטעינת הנתונים");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGroupsAndMembers();
  }, []);

  const markAsSafe = () => {
    setIsSafe(true);
    toast.success("סימנת את עצמך כבטוח/ה!");
    
    setTimeout(() => {
      setIsSafe(false);
    }, 10000);
  };

  return (
    <div className="container max-w-5xl px-4 py-6 md:py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">ברוך הבא</h1>
        <p className="text-muted-foreground">בדוק את הסטטוס של הקבוצות שלך וסמן את עצמך כבטוח/ה</p>
      </div>
      
      <div className="flex justify-center mb-10">
        <Button
          onClick={markAsSafe}
          disabled={isSafe}
          className={cn(
            "px-8 py-10 text-lg font-bold rounded-full transition-all transform hover:scale-105",
            isSafe ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
          )}
        >
          {isSafe ? (
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="h-10 w-10 mb-1" />
              <span>אתה במצב בטוח</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-10 w-10 mb-1" />
              <span>אני בטוח/ה</span>
            </div>
          )}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="mr-2">טוען קבוצות...</span>
        </div>
      ) : groups.length > 0 ? (
        <>
          <h2 className="text-2xl font-bold mb-4 text-right">סטטוס חברי קבוצה</h2>
          
          {groups.map((group) => (
            <Card key={group.id} className="mb-6">
              <CardHeader>
                <CardTitle className="text-right">{group.name}</CardTitle>
                <CardDescription className="text-right">{group.members.length} חברים</CardDescription>
              </CardHeader>
              <CardContent>
                {group.members.length > 0 ? (
                  <div className="space-y-4">
                    {group.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2">
                          {member.status === "safe" ? (
                            <div className="flex items-center text-green-500">
                              <ShieldCheck className="h-5 w-5 mr-1" />
                              <span className="text-xs flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {member.time}
                              </span>
                            </div>
                          ) : (
                            <div className="text-amber-500 text-sm">לא ידוע</div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right font-medium">{member.name || member.email}</div>
                          <Avatar>
                            <AvatarImage src={member.image} alt={member.name || member.email} />
                            <AvatarFallback>{(member.name?.[0] || member.email[0] || "").toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    אין חברים בקבוצה זו עדיין
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          <div className="mt-8 flex justify-center">
            <Button variant="outline" className="text-sm">
              <Shield className="mr-2 h-4 w-4" />
              שלח תזכורת לכל חברי הקבוצה
            </Button>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-medium mb-2">אין לך קבוצות עדיין</h3>
              <p className="text-muted-foreground mb-4">צור קבוצה חדשה בדף הקבוצות כדי להתחיל</p>
              <Button asChild>
                <a href="/groups">לדף הקבוצות</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
