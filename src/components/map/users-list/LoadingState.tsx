
import React from 'react';
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface LoadingStateProps {
  progressValue: number;
  hideProgress: boolean;
}

const LoadingState = ({ progressValue, hideProgress }: LoadingStateProps) => {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-center mb-2">
        <Loader2 className="h-5 w-5 text-primary animate-spin mr-2" />
        <p className="text-muted-foreground">טוען נתונים...</p>
      </div>
      {!hideProgress && <Progress value={progressValue} className="h-2" />}
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
};

export default LoadingState;
