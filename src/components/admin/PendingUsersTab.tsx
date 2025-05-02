
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User } from "@/contexts/AuthContext";

interface PendingUsersTabProps {
  users: User[];
  currentUserId: string | undefined;
  searchUsers: string;
  setSearchUsers: (value: string) => void;
  handleApproveUser: (userId: string, email: string, fullName: string) => void;
  handleRejectUser: (userId: string, email: string, fullName: string) => void;
}

const PendingUsersTab: React.FC<PendingUsersTabProps> = ({
  users,
  currentUserId,
  searchUsers,
  setSearchUsers,
  handleApproveUser,
  handleRejectUser,
}) => {
  const filteredUsers = users.filter(user => 
    (user.id !== currentUserId) && (
      (user.fullName?.toLowerCase() || "").includes(searchUsers.toLowerCase()) ||
      ((user.idNumber || "")?.toLowerCase() || "").includes(searchUsers.toLowerCase())
    )
  );

  const pendingUsers = filteredUsers.filter(user => user.status === "pending");

  return (
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
              {pendingUsers.map((user) => (
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
  );
};

export default PendingUsersTab;
