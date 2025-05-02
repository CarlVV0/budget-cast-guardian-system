import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, User } from "@/contexts/AuthContext";
import { useExpenses } from "@/contexts/ExpenseContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, FileEdit, Check, Eye, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Admin = () => {
  const { currentUser, users, adminChangeUserPassword, adminResetUserPassword, approveUser, rejectUser, deleteUser } = useAuth();
  const { getAllExpenses, deleteExpense, getPendingExpenses, approveExpense, rejectExpense } = useExpenses();
  const { notifications, markAsRead, clearNotification, addNotification } = useNotifications();
  const { toast } = useToast();
  
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  
  const pendingExpenses = getPendingExpenses();
  const allExpenses = getAllExpenses();
  
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

  const pendingUsers = users.filter(u => u.status === "pending" && u.role !== "admin");

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

  const [searchPending, setSearchPending] = useState("");
  const [searchExpenses, setSearchExpenses] = useState("");
  const [searchNotifications, setSearchNotifications] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [searchApprovedUsers, setSearchApprovedUsers] = useState("");

  const filteredPendingExpenses = pendingExpenses.filter(expense => 
    (expense.userFullName?.toLowerCase() || "").includes(searchPending.toLowerCase()) ||
    (expense.userIdNumber?.toLowerCase() || "").includes(searchPending.toLowerCase())
  );

  const filteredAllExpenses = allExpenses.filter(expense => 
    (expense.userFullName?.toLowerCase() || "").includes(searchExpenses.toLowerCase()) ||
    (expense.userIdNumber?.toLowerCase() || "").includes(searchExpenses.toLowerCase())
  );

  const filteredNotifications = notifications.filter(notification => 
    ((notification.metadata?.userId || "").toLowerCase().includes(searchNotifications.toLowerCase()) || 
     (notification.metadata?.userFullName || "").toLowerCase().includes(searchNotifications.toLowerCase()))
  );

  const filteredUsers = users.filter(user => 
    (user.id !== currentUser?.id) && (
      (user.fullName?.toLowerCase() || "").includes(searchUsers.toLowerCase()) ||
      ((user.idNumber || "")?.toLowerCase() || "").includes(searchUsers.toLowerCase())
    )
  );

  const approvedUsers = users.filter(user => user.status === "approved" && user.id !== currentUser?.id);
  const filteredApprovedUsers = approvedUsers.filter(user => 
    (user.fullName?.toLowerCase() || "").includes(searchApprovedUsers.toLowerCase()) ||
    ((user.idNumber || "")?.toLowerCase() || "").includes(searchApprovedUsers.toLowerCase())
  );

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
          <Card>
            <CardHeader>
              <CardTitle>Pending Expense Approvals</CardTitle>
              <CardDescription>
                Review and approve or reject expenses submitted by users
              </CardDescription>
              <div className="mt-2">
                <Input
                  placeholder="Search by ID number or name..."
                  value={searchPending}
                  onChange={(e) => setSearchPending(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredPendingExpenses.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No pending expenses to approve</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Year Level</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPendingExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{formatDate(expense.date)}</TableCell>
                          <TableCell>{getUserDetails(expense.userId)}</TableCell>
                          <TableCell className="font-medium">{expense.itemName}</TableCell>
                          <TableCell>{expense.yearLevel}</TableCell>
                          <TableCell>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2">
                                  <Eye className="h-4 w-4" />
                                  View Description
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="max-w-sm">
                                <p className="text-sm">{expense.description}</p>
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(expense.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => handleApproveExpense(expense.id)}
                              >
                                <Check className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleRejectExpense(expense.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expenses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Expenses</CardTitle>
              <CardDescription>
                Manage all user expenses in the system
              </CardDescription>
              <div className="mt-2">
                <Input
                  placeholder="Search by ID number or name..."
                  value={searchExpenses}
                  onChange={(e) => setSearchExpenses(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredAllExpenses.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No expenses found in the system</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Year Level</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAllExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{formatDate(expense.date)}</TableCell>
                          <TableCell>{getUserDetails(expense.userId)}</TableCell>
                          <TableCell className="font-medium">{expense.itemName}</TableCell>
                          <TableCell>{expense.yearLevel}</TableCell>
                          <TableCell>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2">
                                  <Eye className="h-4 w-4" />
                                  View Description
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="max-w-sm">
                                <p className="text-sm">{expense.description}</p>
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                expense.status === "approved" ? "default" :
                                expense.status === "pending" ? "outline" : "destructive"
                              }
                            >
                              {expense.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(expense.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(expense.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Notifications</CardTitle>
              <CardDescription>
                View and manage all system notifications
              </CardDescription>
              <div className="mt-2">
                <Input
                  placeholder="Search by ID number or name..."
                  value={searchNotifications}
                  onChange={(e) => setSearchNotifications(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredNotifications.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No notifications in the system</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`rounded-lg border p-4 ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{notification.message}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(notification.date).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as Read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => clearNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending-users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending User Approvals</CardTitle>
              <CardDescription>
                Review and manage pending user registrations
              </CardDescription>
              <div className="mt-2">
                <Input
                  placeholder="Search by ID number or name..."
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>ID Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.filter(user => user.status === "pending").map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.idNumber || "Not set"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleApproveUser(user.id, user.email, user.fullName)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleRejectUser(user.id, user.email, user.fullName)}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved-users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Approved Users</CardTitle>
              <CardDescription>
                View and manage approved users
              </CardDescription>
              <div className="mt-2">
                <Input
                  placeholder="Search by ID number or name..."
                  value={searchApprovedUsers}
                  onChange={(e) => setSearchApprovedUsers(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>ID Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApprovedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.idNumber || "Not set"}</TableCell>
                        <TableCell>
                          <Badge variant="default">
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setPasswordDialogOpen(true);
                              }}
                            >
                              Change Password
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePasswordReset(user)}
                            >
                              Reset Password
                            </Button>
                            {user.id !== "admin" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteUserClick(user)}
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Password</DialogTitle>
            <DialogDescription>
              Enter a new password for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPasswordDialogOpen(false);
                setNewPassword("");
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handlePasswordChange}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete user {userToDelete?.fullName} ({userToDelete?.email})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteUserDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUserConfirm} 
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
