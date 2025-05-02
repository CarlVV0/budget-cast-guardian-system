import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";

export interface Expense {
  id: string;
  userId: string;
  userIdNumber: string;
  userEmail: string;
  userFullName: string;
  date: string;
  itemName: string;
  amount: number;
  yearLevel: string;
  description: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id" | "userId" | "createdAt" | "status" | "userEmail" | "userFullName" | "userIdNumber">) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  approveExpense: (id: string) => void;
  rejectExpense: (id: string) => void;
  getExpenseById: (id: string) => Expense | undefined;
  getUserExpenses: () => Expense[];
  getAllExpenses: () => Expense[];
  getPendingExpenses: () => Expense[];
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const storedExpenses = localStorage.getItem("mdc-cast-expenses");
    if (storedExpenses) {
      try {
        const parsedExpenses = JSON.parse(storedExpenses);
        return parsedExpenses.map((expense: any) => ({
          ...expense,
          status: expense.status || (currentUser?.role === "admin" ? "approved" : "pending"),
          userId: expense.userId || currentUser?.id || "unknown"
        }));
      } catch (error) {
        console.error("Error parsing stored expenses:", error);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("mdc-cast-expenses", JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expenseData: Omit<Expense, "id" | "userId" | "createdAt" | "status" | "userEmail" | "userFullName" | "userIdNumber">) => {
    if (!currentUser) throw new Error("User must be logged in to add an expense");
    
    const newExpense: Expense = {
      id: `expense-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: currentUser.id,
      userIdNumber: currentUser.idNumber || "N/A",
      userEmail: currentUser.email,
      userFullName: currentUser.fullName,
      createdAt: new Date().toISOString(),
      status: currentUser.role === "admin" ? "approved" : "pending",
      ...expenseData,
    };
    
    setExpenses(prev => [...prev, newExpense]);
    
    if (currentUser.role !== "admin") {
      addNotification({
        message: `New expense pending approval: ${expenseData.itemName} - $${expenseData.amount} by ${currentUser.email}`,
        type: "expense-pending",
        metadata: {
          expenseId: newExpense.id,
          userId: currentUser.id,
          userEmail: currentUser.email
        }
      });
    }
  };

  const updateExpense = (id: string, expenseData: Partial<Expense>) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === id ? { ...expense, ...expenseData } : expense
      )
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const approveExpense = (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      updateExpense(id, { status: "approved" });
    }
  };

  const rejectExpense = (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      updateExpense(id, { status: "rejected" });
    }
  };

  const getExpenseById = (id: string) => {
    return expenses.find(expense => expense.id === id);
  };

  const getUserExpenses = () => {
    if (!currentUser) return [];
    return expenses.filter(expense => 
      expense.userId === currentUser.id && 
      expense.status === "approved"
    );
  };

  const getAllExpenses = () => {
    if (!currentUser || currentUser.role !== "admin") {
      return getUserExpenses();
    }
    return expenses.filter(expense => expense.status === "approved");
  };

  const getPendingExpenses = () => {
    if (!currentUser || currentUser.role !== "admin") return [];
    return expenses.filter(expense => expense.status === "pending");
  };

  const value = {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
    getExpenseById,
    getUserExpenses,
    getAllExpenses,
    getPendingExpenses,
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
};
