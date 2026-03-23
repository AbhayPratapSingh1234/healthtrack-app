import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Shield, User, ArrowLeft, Eye, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  role: string;
  created_at: string;
  email?: string;
  assessment_count?: number;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewDetails = async (user: UserProfile) => {
    setSelectedUser(user);
    try {
      // Fetch detailed user information
      const { data: assessments } = await supabase
        .from("health_assessments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const { data: logs } = await supabase
        .from("daily_health_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const { data: goals } = await supabase
        .from("health_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setUserDetails({
        ...user,
        assessments: assessments || [],
        logs: logs || [],
        goals: goals || []
      });
      setViewDialogOpen(true);
    } catch (error: any) {
      console.error("Error fetching user details:", error);
      toast({
        title: "Error",
        description: "Failed to load user details.",
        variant: "destructive",
      });
    }
  };

  const handleChangeRole = async (newRole: string) => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", selectedUser.id);

      if (error) throw error;

      // Update local state
      setUsers(users.map(u =>
        u.id === selectedUser.id ? { ...u, role: newRole } : u
      ));

      toast({
        title: "Success",
        description: `User role updated to ${newRole}.`,
      });

      setChangeRoleDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      console.log("User ID:", user.id); // Log user ID for admin setup
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    fetchUsers();
  };

  const fetchUsers = async () => {
    try {
      // Get all profiles with emails
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      const usersWithEmails = profiles || [];

      // Get assessment counts for each user
      const usersWithCounts = await Promise.all(
        usersWithEmails.map(async (user) => {
          const { count } = await supabase
            .from("health_assessments")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

          return {
            ...user,
            assessment_count: count || 0
          };
        })
      );

      setUsers(usersWithCounts);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load user data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (role: string) => {
    return role === "admin" ? "default" : "secondary";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading user management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">User Management</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">
            View and manage all registered users on the HealthTrack platform.
          </p>
        </div>

        {/* Search */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by email or user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </Card>

        {/* User Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <Users className="h-8 w-8 text-primary mb-2" />
            <h3 className="text-lg font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-primary">{users.length}</p>
          </Card>

          <Card className="p-6">
            <Shield className="h-8 w-8 text-accent mb-2" />
            <h3 className="text-lg font-semibold mb-2">Admin Users</h3>
            <p className="text-3xl font-bold text-accent">
              {users.filter(u => u.role === "admin").length}
            </p>
          </Card>

          <Card className="p-6">
            <User className="h-8 w-8 text-warning mb-2" />
            <h3 className="text-lg font-semibold mb-2">Regular Users</h3>
            <p className="text-3xl font-bold text-warning">
              {users.filter(u => u.role === "user").length}
            </p>
          </Card>
        </div>

        {/* Users List */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">All Users</h2>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{user.email}</span>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    User ID: {user.id} • Joined: {new Date(user.created_at).toLocaleDateString()} • Assessments: {user.assessment_count}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(user)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setChangeRoleDialogOpen(true);
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Change Role
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found matching your search.</p>
            </div>
          )}
        </Card>

        {/* View Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Details - {userDetails?.email}</DialogTitle>
            </DialogHeader>
            {userDetails && (
              <div className="space-y-6">
                {/* Basic Info */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">User ID</span>
                      <p className="font-mono text-sm">{userDetails.id}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Email</span>
                      <p>{userDetails.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Role</span>
                      <Badge variant={getRoleBadgeVariant(userDetails.role)}>
                        {userDetails.role}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Joined</span>
                      <p>{new Date(userDetails.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Card>

                {/* Health Assessments */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Health Assessments ({userDetails.assessments.length})</h3>
                  {userDetails.assessments.length > 0 ? (
                    <div className="space-y-2">
                      {userDetails.assessments.slice(0, 5).map((assessment: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                          <span>{new Date(assessment.created_at).toLocaleDateString()}</span>
                          <div className="text-sm">
                            Diabetes: {assessment.diabetes_risk}% • Obesity: {assessment.obesity_risk}% • Hypertension: {assessment.hypertension_risk}%
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No assessments found</p>
                  )}
                </Card>

                {/* Health Logs */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Recent Health Logs ({userDetails.logs.length})</h3>
                  {userDetails.logs.length > 0 ? (
                    <div className="space-y-2">
                      {userDetails.logs.slice(0, 5).map((log: any, index: number) => (
                        <div key={index} className="p-2 border rounded">
                          <div className="flex justify-between">
                            <span className="font-medium">{new Date(log.created_at).toLocaleDateString()}</span>
                            <span className="text-sm">Weight: {log.weight}kg</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            BP: {log.systolic_bp}/{log.diastolic_bp} • Glucose: {log.blood_glucose}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No health logs found</p>
                  )}
                </Card>

                {/* Goals */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Health Goals ({userDetails.goals.length})</h3>
                  {userDetails.goals.length > 0 ? (
                    <div className="space-y-2">
                      {userDetails.goals.slice(0, 5).map((goal: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <span className="font-medium">{goal.goal_type}</span>
                            <div className="text-sm text-muted-foreground">
                              Target: {goal.target_value} • Current: {goal.current_value}
                            </div>
                          </div>
                          <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                            {goal.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No goals found</p>
                  )}
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Change Role Dialog */}
        <Dialog open={changeRoleDialogOpen} onOpenChange={setChangeRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Role for {selectedUser?.email}</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <p>Change role for user: <strong>{selectedUser.email}</strong></p>
                <Select onValueChange={handleChangeRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserManagement;
