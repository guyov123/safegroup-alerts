
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, ShieldCheck, Clock, Loader2, MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "@/hooks/useLocation";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

interface GroupMember {
  id: string;
  name: string | null;
  email: string;
  status: "safe" | "unknown";
  time: string;
  image: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
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
  const [isReportingStatus, setIsReportingStatus] = useState(false);
  const { currentPosition } = useLocation();
  
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
          
          // Fetch safety status for each member
          const memberIds = membersData.map(member => member.id);
          
          const { data: safetyData, error: safetyError } = await supabase
            .from('member_safety_status')
            .select('*')
            .in('member_id', memberIds)
            .order('reported_at', { ascending: false });
            
          if (safetyError) {
            console.error(`Error fetching safety data:`, safetyError);
          }
          
          // Get the latest status for each member
          const latestStatusByMember = safetyData ? 
            safetyData.reduce((acc, status) => {
              if (!acc[status.member_id] || new Date(status.reported_at) > new Date(acc[status.member_id].reported_at)) {
                acc[status.member_id] = status;
              }
              return acc;
            }, {} as Record<string, any>) : {};
          
          // Calculate distance if current position is available
          const userLat = currentPosition?.coords.latitude;
          const userLon = currentPosition?.coords.longitude;
          
          // Map the members data to include status and time
          const members: GroupMember[] = membersData.map(member => {
            const latestStatus = latestStatusByMember[member.id];
            let distance: number | undefined = undefined;
            
            // Calculate distance if both positions are available
            if (latestStatus?.latitude && latestStatus?.longitude && userLat && userLon) {
              const R = 6371; // Radius of the earth in km
              const dLat = (latestStatus.latitude - userLat) * Math.PI / 180;
              const dLon = (latestStatus.longitude - userLon) * Math.PI / 180; 
              const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(userLat * Math.PI / 180) * Math.cos(latestStatus.latitude * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2); 
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
              distance = Number((R * c).toFixed(2)); // Distance in km
            }
            
            return {
              id: member.id,
              name: member.name,
              email: member.email,
              status: latestStatus ? latestStatus.status : "unknown",
              time: latestStatus ? formatDistanceToNow(new Date(latestStatus.reported_at), { addSuffix: true, locale: he }) : "",
              image: "",
              latitude: latestStatus?.latitude,
              longitude: latestStatus?.longitude,
              distance
            };
          });
          
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
  
  useEffect(() => {
    fetchGroupsAndMembers();
    
    // Setup real-time listener for safety status updates
    const safetyChannel = supabase
      .channel('member_safety_updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'member_safety_status' 
        },
        () => {
          console.log("Safety status updated, refreshing data");
          fetchGroupsAndMembers();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(safetyChannel);
    };
  }, [currentPosition]);

  const markAsSafe = async () => {
    try {
      if (isReportingStatus) return;
      
      setIsReportingStatus(true);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("אנא התחבר כדי לדווח על מצב בטיחות");
        setIsReportingStatus(false);
        return;
      }
      
      // Get the user's group member ID
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();
        
      if (memberError) {
        console.error("Error fetching member:", memberError);
        toast.error("שגיאה בזיהוי המשתמש");
        setIsReportingStatus(false);
        return;
      }
      
      let memberId = memberData?.id;
      
      // If user is not a member yet, create a member entry
      if (!memberId) {
        // Get first group owned by the user
        const { data: ownedGroups, error: groupsError } = await supabase
          .from('groups')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1)
          .single();
          
        if (groupsError || !ownedGroups) {
          // Create a default group for the user
          const { data: newGroup, error: createGroupError } = await supabase
            .from('groups')
            .insert({
              name: 'הקבוצה שלי',
              owner_id: user.id
            })
            .select()
            .single();
            
          if (createGroupError) {
            console.error("Error creating group:", createGroupError);
            toast.error("שגיאה ביצירת קבוצה למשתמש");
            setIsReportingStatus(false);
            return;
          }
          
          // Create member in the new group
          const { data: newMember, error: createMemberError } = await supabase
            .from('group_members')
            .insert({
              group_id: newGroup.id,
              email: user.email,
              name: user.user_metadata?.full_name || user.email
            })
            .select()
            .single();
            
          if (createMemberError) {
            console.error("Error creating group member:", createMemberError);
            toast.error("שגיאה ביצירת חבר קבוצה");
            setIsReportingStatus(false);
            return;
          }
          
          memberId = newMember.id;
        } else {
          // Create member in existing group
          const { data: newMember, error: createMemberError } = await supabase
            .from('group_members')
            .insert({
              group_id: ownedGroups.id,
              email: user.email,
              name: user.user_metadata?.full_name || user.email
            })
            .select()
            .single();
            
          if (createMemberError) {
            console.error("Error creating group member:", createMemberError);
            toast.error("שגיאה ביצירת חבר קבוצה");
            setIsReportingStatus(false);
            return;
          }
          
          memberId = newMember.id;
        }
      }
      
      // Construct safety report
      const safetyReport: any = {
        member_id: memberId,
        status: "safe"
      };
      
      // Add location if available
      if (currentPosition) {
        safetyReport.latitude = currentPosition.coords.latitude;
        safetyReport.longitude = currentPosition.coords.longitude;
      }
      
      // Insert safety status
      const { error: insertError } = await supabase
        .from('member_safety_status')
        .insert(safetyReport);
        
      if (insertError) {
        console.error("Error reporting safety status:", insertError);
        toast.error("שגיאה בדיווח מצב בטיחות");
        setIsReportingStatus(false);
        return;
      }
      
      setIsSafe(true);
      toast.success("סימנת את עצמך כבטוח/ה!");
      
      // Refresh data
      fetchGroupsAndMembers();
      
      // Reset status after 10 seconds (UI only - the reported status remains in DB)
      setTimeout(() => {
        setIsSafe(false);
      }, 10000);
    } catch (error) {
      console.error("Error:", error);
      toast.error("שגיאה בדיווח מצב בטיחות");
    } finally {
      setIsReportingStatus(false);
    }
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
          disabled={isSafe || isReportingStatus}
          className={cn(
            "px-8 py-10 text-lg font-bold rounded-full transition-all transform hover:scale-105",
            isSafe ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
          )}
        >
          {isReportingStatus ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-10 w-10 mb-1 animate-spin" />
              <span>שולח דיווח...</span>
            </div>
          ) : isSafe ? (
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="h-10 w-10 mb-1" />
              <span>דיווחת שאתה בטוח/ה</span>
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
                          <div className="text-right">
                            <div className="font-medium">{member.name || member.email}</div>
                            {(member.latitude || member.distance !== undefined) && (
                              <div className="flex items-center justify-end text-xs text-muted-foreground gap-2">
                                {member.distance !== undefined && (
                                  <div className="flex items-center gap-1">
                                    <span>{member.distance} ק"מ</span>
                                    <Navigation className="h-3 w-3" />
                                  </div>
                                )}
                                
                                {member.latitude && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
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
