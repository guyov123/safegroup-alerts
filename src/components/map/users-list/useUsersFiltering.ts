
import { useState, useEffect } from 'react';
import { MapUser } from "../types";

export function useUsersFiltering(users: MapUser[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayType, setDisplayType] = useState<"all" | "withLocation">("all");
  
  // Filter users based on search and display type
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.location && user.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch && (displayType === "all" || (displayType === "withLocation" && Boolean(user.latitude && user.longitude)));
  });
  
  // Sort users: safe first, with location first, then by last reported time
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "safe" ? -1 : 1;
    }
    
    const aHasLocation = Boolean(a.latitude && a.longitude);
    const bHasLocation = Boolean(b.latitude && b.longitude);
    
    if (aHasLocation !== bHasLocation) {
      return aHasLocation ? -1 : 1;
    }
    
    if (a.lastReported && b.lastReported) {
      return new Date(b.lastReported).getTime() - new Date(a.lastReported).getTime();
    }
    
    if (a.lastReported && !b.lastReported) return -1;
    if (!a.lastReported && b.lastReported) return 1;
    
    return a.name.localeCompare(b.name);
  });

  const hasAnyUsersWithLocation = users.some(user => user.latitude && user.longitude);

  return {
    searchQuery,
    setSearchQuery,
    displayType,
    setDisplayType,
    sortedUsers,
    hasAnyUsersWithLocation
  };
}
