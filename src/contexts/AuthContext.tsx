import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  fullName: string;
  password: string;
  role: "user" | "admin";
  status: "pending" | "approved";
  idNumber?: string;
  registrationDate?: string;
}

interface AuthContextType {
  currentUser: User | null;
  signup: (email: string, fullName: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  updateProfile: (data: { fullName: string, idNumber?: string }) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  adminChangeUserPassword: (userId: string, newPassword: string) => Promise<void>;
  adminResetUserPassword: (userId: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const getDefaultUsers = (): User[] => {
  return [{
    id: "admin",
    email: "admin@mdc-cast.com",
    fullName: "Administrator",
    password: "admin123", // change for production!
    role: "admin",
    status: "approved",
    registrationDate: new Date().toISOString()
  }];
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("mdc-cast-current-user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  const [users, setUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem("mdc-cast-users");
    if (storedUsers) {
      try {
        const parsed = JSON.parse(storedUsers);
        if (Array.isArray(parsed)) {
          return parsed.map((u: any) => ({
            ...u,
            status: u.status || "approved",
            registrationDate: u.registrationDate || new Date().toISOString()
          }));
        } else {
          console.error("Stored users is not an array:", parsed);
          return getDefaultUsers();
        }
      } catch (e) {
        console.error("Error parsing stored users:", e);
        return getDefaultUsers();
      }
    }
    return getDefaultUsers();
  });
  
  const isAuthenticated = !!currentUser;
  
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("mdc-cast-current-user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("mdc-cast-current-user");
    }
  }, [currentUser]);
  
  useEffect(() => {
    localStorage.setItem("mdc-cast-users", JSON.stringify(users));
  }, [users]);
  
  const signup = async (email: string, fullName: string, password: string) => {
    setIsLoading(true);
    try {
      if (users.some(u => u.email === email)) {
        throw new Error("Email already exists");
      }
      const newUser: User = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
        email,
        fullName,
        password,
        role: "user",
        status: "pending",
        registrationDate: new Date().toISOString()
      };
      setUsers(prev => [...prev, newUser]);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        throw new Error("Invalid email or password");
      }
      if (user.status !== "approved") {
        throw new Error("Your account is awaiting admin approval.");
      }
      setCurrentUser(user);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };
  
  const logout = () => {
    setCurrentUser(null);
  };
  
  const approveUser = (userId: string) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, status: "approved" } : u
      )
    );
  };
  
  const rejectUser = (userId: string) => {
    setUsers(prev =>
      prev.filter(u => u.id !== userId)
    );
  };
  
  const updateProfile = (data: { fullName: string, idNumber?: string }) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...data };
    setCurrentUser(updatedUser);
    
    setUsers(prev => 
      prev.map(user => 
        user.id === currentUser.id ? updatedUser : user
      )
    );
  };
  
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser) {
      throw new Error("You must be logged in to change your password");
    }
    
    if (currentUser.password !== currentPassword) {
      throw new Error("Current password is incorrect");
    }
    
    const updatedUser = { ...currentUser, password: newPassword };
    setCurrentUser(updatedUser);
    
    setUsers(prev => 
      prev.map(user => 
        user.id === currentUser.id ? updatedUser : user
      )
    );
  };
  
  const resetPassword = async (email: string) => {
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error("No account found with that email address");
    }
    
    const tempPassword = `temp${Math.floor(Math.random() * 10000)}`;
    
    setUsers(prev => 
      prev.map(u => 
        u.email === email ? { ...u, password: tempPassword } : u
      )
    );
    
    console.log(`Temporary password for ${email}: ${tempPassword}`);
    return;
  };
  
  const adminChangeUserPassword = async (userId: string, newPassword: string) => {
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Only admins can change user passwords");
    }
    
    setUsers(prev => 
      prev.map(user => 
        user.id === userId ? { ...user, password: newPassword } : user
      )
    );
  };
  
  const adminResetUserPassword = async (userId: string) => {
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Only admins can reset user passwords");
    }
    
    const tempPassword = `temp${Math.floor(Math.random() * 10000)}`;
    
    setUsers(prev => 
      prev.map(user => 
        user.id === userId ? { ...user, password: tempPassword } : user
      )
    );
    
    console.log(`Temporary password for user ${userId}: ${tempPassword}`);
    return tempPassword;
  };
  
  const value = {
    currentUser,
    signup,
    login,
    logout,
    isLoading,
    approveUser,
    rejectUser,
    users,
    setUsers,
    updateProfile,
    changePassword,
    resetPassword,
    isAuthenticated,
    adminChangeUserPassword,
    adminResetUserPassword
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
