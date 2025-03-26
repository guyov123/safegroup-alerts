
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, ShieldCheck, Clock } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const [isSafe, setIsSafe] = useState(false);
  
  // Mock data for group members
  const groupMembers = [
    { id: 1, name: "יעל כהן", status: "safe", time: "12:45", image: "" },
    { id: 2, name: "דני לוי", status: "safe", time: "11:30", image: "" },
    { id: 3, name: "מיכל רבין", status: "unknown", time: "", image: "" },
    { id: 4, name: "אורי שמיר", status: "safe", time: "09:15", image: "" },
  ];

  const markAsSafe = () => {
    setIsSafe(true);
    toast.success("סימנת את עצמך כבטוח/ה!");
    
    // Reset status after some time (for demo purposes)
    setTimeout(() => {
      setIsSafe(false);
    }, 10000);
  };

  return (
    <div className="container max-w-5xl px-4 py-6 md:py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">ברוך הבא, ישראל</h1>
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
      
      <h2 className="text-2xl font-bold mb-4 text-right">סטטוס חברי קבוצה</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-right">משפחה</CardTitle>
          <CardDescription className="text-right">4 חברים</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {groupMembers.map((member) => (
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
                  <div className="text-right font-medium">{member.name}</div>
                  <Avatar>
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 flex justify-center">
        <Button variant="outline" className="text-sm">
          <Shield className="mr-2 h-4 w-4" />
          שלח תזכורת לכל חברי הקבוצה
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
