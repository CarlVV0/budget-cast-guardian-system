
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { LayoutDashboard, DollarSign, BarChart, UserCircle, Settings, FileText, LogOut } from "lucide-react";

const Sidebar = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  
  const isAdmin = currentUser?.role === "admin";
  
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Expenses",
      href: "/expenses",
      icon: DollarSign,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: UserCircle,
    },
    ...(isAdmin
      ? [
          {
            name: "Admin",
            href: "/admin",
            icon: Settings,
          },
        ]
      : []),
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white shadow-md">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-center border-b">
          <h1 className="text-xl font-bold text-blue-600">MDC-Cast Budget</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="flex flex-col gap-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === item.href
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="border-t p-4">
          <div className="mb-2 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
              <UserCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{currentUser?.fullName}</p>
              <p className="text-xs text-gray-500">{currentUser?.email}</p>
            </div>
          </div>
          
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
