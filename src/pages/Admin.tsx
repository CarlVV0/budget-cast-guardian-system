
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, User } from "@/contexts/AuthContext";
import { useExpenses } from "@/contexts/ExpenseContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Import refactored components
import PendingExpensesTab from "@/components/admin/PendingExpensesTab";
import AllExpensesTab from "@/components/admin/AllExpensesTab";
import NotificationsTab from "@/components/admin/NotificationsTab";
import PendingUsersTab from "@/components/admin/PendingUsersTab";
import ApprovedUsersTab from "@/components/admin/ApprovedUsersTab";
import ConfirmDialogs from "@/components/admin/ConfirmDialogs";

const Admin = () => {
  const { currentUser, users, adminChangeUserPassword, adminResetUserPassword, approveUser, rejectUser, deleteUser } = useAuth();
  const { getAllExpenses, deleteExpense, getPendingExpenses, approveExpense, rejectExpense } = useExpenses();
  const { notifications, markAsRead, clearNotification, addNotification } = useNotifications();
  const { toast } = useToast();
  
  // State management
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchPending, setSearchPending] = useState("");
  const [searchExpenses, setSearchExpenses] = useState("");
  const [searchNotifications, setSearchNotifications] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [searchApprovedUsers, setSearchApprovedUsers] = useState("");
  
  // Redirect non-admin users
  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Data initialization
  const pendingExpenses = getPendingExpenses();
  const allExpenses = getAllExpenses();
  
  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const getUserDetails = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.fullName} (${user.email})` : "Unknown User";
  };
  
  // Event handlers
  const handleDeleteClick = (expenseId: string) => {
    setSelectedExpenseId(expenseId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (selectedExpenseId) {
      deleteExpense(selectedExpenseId);
      toast({
        title: "Expense deleted",
        description: "The expense has been removed from the system",
      });
      setDeleteDialogOpen(false);
    }
  };

  const handleApproveExpense = (expenseId: string) => {
    approveExpense(expenseId);
    toast({
      title: "Expense approved",
      description: "The expense has been approved and added to the system",
    });
  };

  const handleRejectExpense = (expenseId: string) => {
    setSelectedExpenseId(expenseId);
    setDeleteDialogOpen(true);
  };

  const handleApproveUser = (userId: string, email: string, fullName: string) => {
    approveUser(userId);
    addNotification({
      message: `Your account "${fullName}" has been approved! You can now log in.`,
      type: "system",
      metadata: { userId, email }
    });
    toast({
      title: "User Approved",
      description: `User ${email} has been approved.`,
    });
  };
  
  const handleRejectUser = (userId: string, email: string, fullName: string) => {
    rejectUser(userId);
    addNotification({
      message: `Your account "${fullName}" was rejected by admin.`,
      type: "system",
      metadata: { userId, email }
    });
    toast({
      title: "User Rejected",
      description: `User ${email} has been rejected.`,
    });
  };

  const handleDeleteUserClick = (user: User) => {
    setUserToDelete(user);
    setDeleteUserDialogOpen(true);
  };

  const handleDeleteUserConfirm = () => {
    if (userToDelete) {
      try {
        deleteUser(userToDelete.id);
        toast({
          title: "User Deleted",
          description: `User ${userToDelete.email} has been deleted from the system.`,
        });
        setDeleteUserDialogOpen(false);
        setUserToDelete(null);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete user",
        });
      }
    }
  };

  const handlePasswordChange = async () => {
    if (!selectedUser || !newPassword) return;
    
    try {
      await adminChangeUserPassword(selectedUser.id, newPassword);
      toast({
        title: "Password Changed",
        description: `Password changed successfully for ${selectedUser.email}`,
      });
      setPasswordDialogOpen(false);
      setNewPassword("");
      setSelectedUser(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password",
      });
    }
  };
  
  const handlePasswordReset = async (user: User) => {
    try {
      const tempPassword = await adminResetUserPassword(user.id);
      toast({
        title: "Password Reset",
        description: `Temporary password for ${user.email}: ${tempPassword}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
      
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-5 md:w-auto md:grid-cols-none md:flex">
          <TabsTrigger value="pending">
            Pending Approvals
            {pendingExpenses.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingExpenses.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="expenses">All Expenses</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="pending-users">Pending Users</TabsTrigger>
          <TabsTrigger value="approved-users">Approved Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          <PendingExpensesTab 
            pendingExpenses={pendingExpenses}
            searchPending={searchPending}
            setSearchPending={setSearchPending}
            formatDate={formatDate}
            getUserDetails={getUserDetails}
            formatCurrency={formatCurrency}
            handleApproveExpense={handleApproveExpense}
            handleRejectExpense={handleRejectExpense}
          />
        </TabsContent>
        
        <TabsContent value="expenses" className="mt-6">
          <AllExpensesTab 
            allExpenses={allExpenses}
            searchExpenses={searchExpenses}
            setSearchExpenses={setSearchExpenses}
            formatDate={formatDate}
            getUserDetails={getUserDetails}
            formatCurrency={formatCurrency}
            handleDeleteClick={handleDeleteClick}
          />
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <NotificationsTab 
            notifications={notifications}
            searchNotifications={searchNotifications}
            setSearchNotifications={setSearchNotifications}
            markAsRead={markAsRead}
            clearNotification={clearNotification}
          />
        </TabsContent>
        
        <TabsContent value="pending-users" className="mt-6">
          <PendingUsersTab 
            users={users}
            currentUserId={currentUser?.id}
            searchUsers={searchUsers}
            setSearchUsers={setSearchUsers}
            handleApproveUser={handleApproveUser}
            handleRejectUser={handleRejectUser}
          />
        </TabsContent>
        
        <TabsContent value="approved-users" className="mt-6">
          <ApprovedUsersTab 
            users={users}
            currentUserId={currentUser?.id}
            searchApprovedUsers={searchApprovedUsers}
            setSearchApprovedUsers={setSearchApprovedUsers}
            setSelectedUser={setSelectedUser}
            setPasswordDialogOpen={setPasswordDialogOpen}
            handlePasswordReset={handlePasswordReset}
            handleDeleteUserClick={handleDeleteUserClick}
          />
        </TabsContent>
      </Tabs>
      
      <ConfirmDialogs
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        handleDeleteConfirm={handleDeleteConfirm}
        passwordDialogOpen={passwordDialogOpen}
        setPasswordDialogOpen={setPasswordDialogOpen}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        handlePasswordChange={handlePasswordChange}
        deleteUserDialogOpen={deleteUserDialogOpen}
        setDeleteUserDialogOpen={setDeleteUserDialogOpen}
        userToDelete={userToDelete}
        handleDeleteUserConfirm={handleDeleteUserConfirm}
      />
    </div>
  );
};

export default Admin;
