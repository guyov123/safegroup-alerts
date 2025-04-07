
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface AuthDebugPanelProps {
  onClose: () => void;
}

const AuthDebugPanel = ({ onClose }: AuthDebugPanelProps) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [memberInfo, setMemberInfo] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchDebugInfo() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get current authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Auth debug error:", userError);
          setError("שגיאה בטעינת נתוני משתמש");
          setIsLoading(false);
          return;
        }
        
        setCurrentUser(user);
        
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        // Find group members with matching email or auth_id
        const { data: members, error: membersError } = await supabase
          .from('group_members')
          .select('*, groups(name)')
          .or(`email.eq.${user.email},auth_id.eq.${user.id}`);
          
        if (membersError) {
          console.error("Members debug error:", membersError);
          setError("שגיאה בטעינת נתוני חברי קבוצה");
          setIsLoading(false);
          return;
        }
        
        setMemberInfo(members || []);
        
      } catch (err) {
        console.error("Debug panel error:", err);
        setError("שגיאה בטעינת נתוני ניפוי באגים");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDebugInfo();
  }, []);
  
  // Function to manually link auth_id
  const linkAuthId = async (memberId: string) => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('group_members')
        .update({ auth_id: currentUser.id })
        .eq('id', memberId);
        
      if (error) {
        console.error("Error linking auth_id:", error);
        return;
      }
      
      // Refresh data
      const { data: updatedMember } = await supabase
        .from('group_members')
        .select('*, groups(name)')
        .eq('id', memberId)
        .single();
        
      if (updatedMember) {
        setMemberInfo(prev => prev.map(m => 
          m.id === memberId ? updatedMember : m
        ));
      }
      
    } catch (err) {
      console.error("Error in linkAuthId:", err);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="font-bold text-lg">פאנל ניפוי באגי אימות</h3>
          <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="py-4 text-center">טוען נתונים...</div>
        ) : error ? (
          <div className="py-4 text-center text-red-500">{error}</div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded p-3">
              <h4 className="font-medium text-right">נתוני משתמש מחובר</h4>
              {currentUser ? (
                <div className="text-xs mt-2 bg-gray-50 p-2 rounded">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-gray-500">מזהה:</div>
                    <div className="text-right">{currentUser.id}</div>
                    
                    <div className="text-gray-500">אימייל:</div>
                    <div className="text-right">{currentUser.email}</div>
                    
                    <div className="text-gray-500">שם מלא:</div>
                    <div className="text-right">{currentUser.user_metadata?.full_name || 'לא זמין'}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 text-amber-500 text-sm">
                  לא מחובר משתמש
                </div>
              )}
            </div>
            
            <div className="border rounded p-3">
              <h4 className="font-medium text-right">חברי קבוצה תואמים</h4>
              {memberInfo.length > 0 ? (
                <div className="space-y-3 mt-2">
                  {memberInfo.map((member) => (
                    <div key={member.id} className="bg-gray-50 p-2 rounded">
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="text-gray-500">מזהה:</div>
                        <div className="text-right">{member.id}</div>
                        
                        <div className="text-gray-500">שם:</div>
                        <div className="text-right">{member.name || 'לא זמין'}</div>
                        
                        <div className="text-gray-500">אימייל:</div>
                        <div className="text-right">{member.email}</div>
                        
                        <div className="text-gray-500">קבוצה:</div>
                        <div className="text-right">{member.groups?.name || 'לא זמין'}</div>
                        
                        <div className="text-gray-500">auth_id:</div>
                        <div className="text-right">
                          {member.auth_id ? (
                            <span className={member.auth_id === currentUser?.id ? 'text-green-500' : 'text-red-500'}>
                              {member.auth_id === currentUser?.id ? '✓ תואם' : '✗ לא תואם'} 
                              <span className="block text-gray-400 text-[10px]">{member.auth_id.substring(0, 8)}...</span>
                            </span>
                          ) : (
                            <span className="text-amber-500">חסר</span>
                          )}
                        </div>
                      </div>
                      
                      {!member.auth_id && currentUser && (
                        <Button 
                          size="sm"
                          variant="outline"
                          className="w-full mt-2 text-xs h-7"
                          onClick={() => linkAuthId(member.id)}
                        >
                          קשר auth_id למשתמש זה
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : currentUser ? (
                <div className="text-center py-2 text-amber-500 text-sm">
                  לא נמצאו חברי קבוצה תואמים לאימייל {currentUser.email}
                </div>
              ) : (
                <div className="text-center py-2 text-gray-500 text-sm">
                  יש להתחבר כדי לראות נתונים
                </div>
              )}
            </div>
            
            <div className="border rounded p-3">
              <h4 className="font-medium text-right">עזרה</h4>
              <div className="text-xs mt-2">
                <ul className="list-disc list-inside space-y-1 text-right">
                  <li>ודא שהאימייל של המשתמש המחובר זהה לאימייל שהוזמן לקבוצה</li>
                  <li>אם האימייל תואם אך auth_id חסר, לחץ על "קשר auth_id" לקישור ידני</li>
                  <li>אם אתה מתחבר לראשונה, עדכוני סטטוס חדשים יקשרו אוטומטית את המשתמש</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebugPanel;
