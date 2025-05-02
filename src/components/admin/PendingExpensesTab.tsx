
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Check, Eye, Trash2 } from "lucide-react";
import { Expense } from "@/contexts/ExpenseContext";

interface PendingExpensesTabProps {
  pendingExpenses: Expense[];
  searchPending: string;
  setSearchPending: (value: string) => void;
  formatDate: (dateString: string) => string;
  getUserDetails: (userId: string) => string;
  formatCurrency: (amount: number) => string;
  handleApproveExpense: (expenseId: string) => void;
  handleRejectExpense: (expenseId: string) => void;
}

const PendingExpensesTab: React.FC<PendingExpensesTabProps> = ({
  pendingExpenses,
  searchPending,
  setSearchPending,
  formatDate,
  getUserDetails,
  formatCurrency,
  handleApproveExpense,
  handleRejectExpense,
}) => {
  const filteredPendingExpenses = pendingExpenses.filter(expense => 
    (expense.userFullName?.toLowerCase() || "").includes(searchPending.toLowerCase()) ||
    (expense.userIdNumber?.toLowerCase() || "").includes(searchPending.toLowerCase())
  );

  return (
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
  );
};

export default PendingExpensesTab;
