
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Eye, Trash2 } from "lucide-react";
import { Expense } from "@/contexts/ExpenseContext";

interface AllExpensesTabProps {
  allExpenses: Expense[];
  searchExpenses: string;
  setSearchExpenses: (value: string) => void;
  formatDate: (dateString: string) => string;
  getUserDetails: (userId: string) => string;
  formatCurrency: (amount: number) => string;
  handleDeleteClick: (expenseId: string) => void;
}

const AllExpensesTab: React.FC<AllExpensesTabProps> = ({
  allExpenses,
  searchExpenses,
  setSearchExpenses,
  formatDate,
  getUserDetails,
  formatCurrency,
  handleDeleteClick,
}) => {
  const filteredAllExpenses = allExpenses.filter(expense => 
    (expense.userFullName?.toLowerCase() || "").includes(searchExpenses.toLowerCase()) ||
    (expense.userIdNumber?.toLowerCase() || "").includes(searchExpenses.toLowerCase())
  );

  return (
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
  );
};

export default AllExpensesTab;
