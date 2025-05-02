
import { User } from "@/contexts/AuthContext";
import { Expense } from "@/contexts/ExpenseContext";
import { Notification } from "@/contexts/NotificationContext";

export interface AdminHelperFunctions {
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getUserDetails: (userId: string) => string;
  handleDeleteClick: (expenseId: string) => void;
  handleApproveExpense: (expenseId: string) => void;
  handleRejectExpense: (expenseId: string) => void;
  handleApproveUser: (userId: string, email: string, fullName: string) => void;
  handleRejectUser: (userId: string, email: string, fullName: string) => void;
}
