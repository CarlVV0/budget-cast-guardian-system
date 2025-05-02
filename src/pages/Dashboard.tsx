
import React, { useMemo } from "react";
import { useExpenses } from "@/contexts/ExpenseContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, Calendar, TrendingUp, ClipboardList } from "lucide-react";

const Dashboard = () => {
  const { getUserExpenses } = useExpenses();
  const userExpenses = getUserExpenses();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  
  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const last7Days = new Date(now.setDate(now.getDate() - 7)).toISOString();
    const last30Days = new Date(now.setDate(now.getDate() - 23)).toISOString();
    const lastYear = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    
    const todayExpenses = userExpenses.filter(expense => new Date(expense.date).toISOString() >= today);
    const last7DaysExpenses = userExpenses.filter(expense => new Date(expense.date).toISOString() >= last7Days);
    const last30DaysExpenses = userExpenses.filter(expense => new Date(expense.date).toISOString() >= last30Days);
    const lastYearExpenses = userExpenses.filter(expense => new Date(expense.date).toISOString() >= lastYear);
    
    return {
      todayTotal: todayExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      last7DaysTotal: last7DaysExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      last30DaysTotal: last30DaysExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      lastYearTotal: lastYearExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      totalExpenses: userExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    };
  }, [userExpenses]);
  
  // Prepare chart data - fix the typo here, changing '.m' to '.map'
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return date;
    }).reverse();
    
    return last7Days.map(date => {
      const dateStr = date.toISOString().split("T")[0];
      const dayExpenses = userExpenses.filter(expense => expense.date.startsWith(dateStr));
      const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        date: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
        amount: total,
      };
    });
  }, [userExpenses]);
  
  // Recent expenses
  const recentExpenses = [...userExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Today's Expenses</p>
                <h3 className="text-xl font-bold">{formatCurrency(stats.todayTotal)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last 7 Days</p>
                <h3 className="text-xl font-bold">{formatCurrency(stats.last7DaysTotal)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 p-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last 30 Days</p>
                <h3 className="text-xl font-bold">{formatCurrency(stats.last30DaysTotal)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-orange-100 p-3">
                <ClipboardList className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Year</p>
                <h3 className="text-xl font-bold">{formatCurrency(stats.lastYearTotal)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                <h3 className="text-xl font-bold">{formatCurrency(stats.totalExpenses)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Expense Trends</CardTitle>
            <CardDescription>Your spending over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${formatCurrency(value as number)}`, "Amount"]}
                  />
                  <Bar dataKey="amount" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExpenses.length === 0 ? (
                <p className="text-center text-sm text-gray-500">No recent expenses</p>
              ) : (
                recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{expense.itemName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
