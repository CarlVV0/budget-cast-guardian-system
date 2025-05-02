
import React, { useMemo, useState } from "react";
import { useExpenses } from "@/contexts/ExpenseContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A259FF", "#4BC0C0"];

const Reports = () => {
  const { getUserExpenses } = useExpenses();
  const userExpenses = getUserExpenses();
  
  const [timeRange, setTimeRange] = useState("month");
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  
  // Filter expenses based on time range
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    let cutoffDate;
    
    switch (timeRange) {
      case "week":
        cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "month":
        cutoffDate = new Date(now);
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        cutoffDate = new Date(now);
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate = new Date(0); // All time
    }
    
    return userExpenses.filter(expense => new Date(expense.date) >= cutoffDate);
  }, [userExpenses, timeRange]);
  
  // Monthly expenses chart data
  const monthlyData = useMemo(() => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    const data = Array(12).fill(0).map((_, i) => ({
      name: months[i],
      amount: 0,
    }));
    
    filteredExpenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthIndex = date.getMonth();
      data[monthIndex].amount += expense.amount;
    });
    
    return data;
  }, [filteredExpenses]);
  
  // Category distribution data
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    
    filteredExpenses.forEach(expense => {
      if (categories[expense.yearLevel]) {
        categories[expense.yearLevel] += expense.amount;
      } else {
        categories[expense.yearLevel] = expense.amount;
      }
    });
    
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredExpenses]);
  
  // Calculate totals
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);
  
  const averageAmount = useMemo(() => {
    if (filteredExpenses.length === 0) return 0;
    return totalAmount / filteredExpenses.length;
  }, [filteredExpenses, totalAmount]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Expense Reports</h1>
        
        <div className="flex items-center gap-2">
          <Label htmlFor="time-range" className="mr-2">Time Range:</Label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="year">Past Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <h3 className="text-2xl font-bold">{formatCurrency(totalAmount)}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Average per Expense</p>
              <h3 className="text-2xl font-bold">{formatCurrency(averageAmount)}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Number of Expenses</p>
              <h3 className="text-2xl font-bold">{filteredExpenses.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
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
        
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Detailed Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">
              This report summarizes your expenses for the selected time period. You had a total of{" "}
              <span className="font-semibold">{filteredExpenses.length} expenses</span> amounting to{" "}
              <span className="font-semibold">{formatCurrency(totalAmount)}</span>.
              {filteredExpenses.length > 0 && (
                <>
                  {" "}The average expense was <span className="font-semibold">{formatCurrency(averageAmount)}</span>.
                </>
              )}
            </p>
            
            {categoryData.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700">Breakdown by Category:</h4>
                <ul className="mt-2 space-y-1">
                  {categoryData.map((category, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="mr-2 h-3 w-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span>{category.name}</span>
                      </div>
                      <span>{formatCurrency(category.value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button variant="outline" className="mt-4">
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
