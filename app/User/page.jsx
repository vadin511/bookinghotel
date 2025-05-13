'use client'
import { createContext, useContext, useEffect, useState } from 'react';



const UserContext = createContext(undefined);

export const UserProvider = ( {children} ) => {
  const [user, setUser] = useState(null);

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
