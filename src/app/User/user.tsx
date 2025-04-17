'use client'
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type User = {
  id: number;
  name: string;
  email: string;
} | null;

type UserContextType = {
  user: User;
  setUser: (user: User) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    console.log(1);
    
    const fetchUser = async () => {
      const res = await fetch('/api/profile'); 
      if (res.ok) {
        const data = await res.json();
        
        setUser(data.user);
      }
    };

    fetchUser();
  }, []);
  console.log(user);
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser phải được sử dụng trong UserProvider');
  }
  return context;
};
