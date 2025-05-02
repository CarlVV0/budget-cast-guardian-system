
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserX } from "lucide-react";
import { User } from "@/contexts/AuthContext";

interface ApprovedUsersTabProps {
  users: User[];
  currentUserId: string | undefined;
  searchApprovedUsers: string;
  setSearchApprovedUsers: (value: string) => void;
  setSelectedUser: (user: User) => void;
  setPasswordDialogOpen: (open: boolean) => void;
  handlePasswordReset: (user: User) => void;
  handleDeleteUserClick: (user: User) => void;
}

const ApprovedUsersTab: React.FC<ApprovedUsersTabProps> = ({
  users,
  currentUserId,
  searchApprovedUsers,
  setSearchApprovedUsers,
  setSelectedUser,
  setPasswordDialogOpen,
  handlePasswordReset,
  handleDeleteUserClick,
}) => {
  const approvedUsers = users.filter(user => user.status === "approved" && user.id !== currentUserId);
  
  const filteredApprovedUsers = approvedUsers.filter(user => 
    (user.fullName?.toLowerCase() || "").includes(searchApprovedUsers.toLowerCase()) ||
    ((user.idNumber || "")?.toLowerCase() || "").includes(searchApprovedUsers.toLowerCase())
  );

  return (
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
  );
};

export default ApprovedUsersTab;
