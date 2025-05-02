import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserCircle, Mail, Calendar } from "lucide-react";

const Profile = () => {
  const { currentUser, updateProfile, changePassword } = useAuth();
  
  // Profile form state
  const [fullName, setFullName] = useState(currentUser?.fullName || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [idNumber, setIdNumber] = useState(currentUser?.idNumber || "");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const isIdNumberReadOnly = currentUser?.idNumber && currentUser.role !== "admin";

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  const handleProfileUpdate = () => {
    setProfileMessage("");
    setProfileError("");
    
    if (!fullName) {
      setProfileError("Full name is required");
      return;
    }
    
    // Email cannot be changed in this demo for simplicity
    // In a real app, email changes would require verification
    
    try {
      updateProfile({ fullName, idNumber });
      setProfileMessage("Profile updated successfully");
    } catch (error) {
      setProfileError("Failed to update profile");
    }
  };
  
  const handlePasswordChange = async () => {
    setPasswordMessage("");
    setPasswordError("");
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMessage("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Failed to change password"
      );
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
              <UserCircle className="h-16 w-16 text-blue-600" />
            </div>
            
            <h2 className="mt-4 text-xl font-semibold">{currentUser?.fullName}</h2>
            <p className="text-sm text-gray-500">{currentUser?.role}</p>
            
            <div className="mt-6 w-full space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{currentUser?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium">
                    {formatDate(currentUser?.registrationDate)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="mt-6">
                {profileMessage && (
                  <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>{profileMessage}</AlertDescription>
                  </Alert>
                )}
                
                {profileError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{profileError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="id-number">ID Number</Label>
                    <Input
                      id="id-number"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="Enter your ID number"
                      disabled={isIdNumberReadOnly}
                      className={isIdNumberReadOnly ? "bg-gray-50" : ""}
                    />
                    <p className="text-xs text-gray-500">
                      {isIdNumberReadOnly 
                        ? "ID number can only be changed by an admin once set."
                        : "Your ID number will be used for expense records."}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      Email cannot be changed in this demo application.
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFullName(currentUser?.fullName || "");
                        setIdNumber(currentUser?.idNumber || "");
                        setProfileMessage("");
                        setProfileError("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleProfileUpdate}>Save Changes</Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="password" className="mt-6">
                {passwordMessage && (
                  <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>{passwordMessage}</AlertDescription>
                  </Alert>
                )}
                
                {passwordError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setPasswordMessage("");
                        setPasswordError("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handlePasswordChange}>Change Password</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
