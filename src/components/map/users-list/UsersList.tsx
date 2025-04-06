
import React, { useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { MapUser } from "../types";
import UserListFilter from "./UserListFilter";
import UserListItem from "./UserListItem";
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import NoLocationWarning from "./NoLocationWarning";
import { useUsersFiltering } from "./useUsersFiltering";
import { useLoadingProgress } from "./useLoadingProgress";

interface UsersListProps {
  users: MapUser[];
  isLoading: boolean;
  onSelectUser: (user: MapUser) => void;
}

const UsersList = ({ users, isLoading, onSelectUser }: UsersListProps) => {
  const {
    searchQuery,
    setSearchQuery,
    displayType,
    setDisplayType,
    sortedUsers,
    hasAnyUsersWithLocation
  } = useUsersFiltering(users);

  const { progressValue, hideProgress } = useLoadingProgress(isLoading, users.length > 0);
  
  // Debug info for specific users
  useEffect(() => {
    const sharonUser = users.find(user => 
      user.name.includes('שרון') || 
      user.name.toLowerCase().includes('sharon') || 
      (user.email && user.email.toLowerCase().includes('mrshapron@gmail.com'))
    );
    
    if (sharonUser) {
      console.log("Sharon found in users list:", sharonUser);
    }
    
    // Log all emails for debugging
    const userEmails = users.map(u => u.email).filter(Boolean);
    console.log("All user emails in list:", userEmails);
  }, [users]);
  
  return (
    <div className="absolute top-4 right-4 z-10 w-80 bg-white rounded-md shadow-md">
      <UserListFilter 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
        displayType={displayType}
        onDisplayTypeChange={setDisplayType}
      />
      
      <div className="max-h-80 overflow-y-auto p-2">
        {isLoading && users.length === 0 ? (
          <LoadingState progressValue={progressValue} hideProgress={hideProgress} />
        ) : sortedUsers.length > 0 ? (
          <>
            {!hasAnyUsersWithLocation && <NoLocationWarning />}
            
            {isLoading && !hideProgress && (
              <div className="mb-2">
                <Progress value={progressValue} className="h-1" />
              </div>
            )}
            
            {sortedUsers.map(user => (
              <UserListItem 
                key={user.id} 
                user={user} 
                onSelect={onSelectUser}
              />
            ))}
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default UsersList;
