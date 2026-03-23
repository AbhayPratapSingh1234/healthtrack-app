import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, FileText, TrendingUp, Shield, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminStats {
  totalUsers: number;
  totalAssessments: number;
  avgDiabetesRisk: number;
  avgObesityRisk: number;
  avgHypertensionRisk: number;
}

interface MonthlyHealthProgress {
  month: string;
  avgWeight: number;
  avgSystolicBP: number;
  avgDiastolicBP: number;
  avgBloodGlucose: number;
  totalLogs: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [latestHealthProgress, setLatestHealthProgress] = useState<MonthlyHealthProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user is admin
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    console.log("Profile query result:", { profile, error, userId: user.id }); // Debug logging

    if (error || profile?.role !== "admin") {
      console.log("User ID:", user.id); // Log user ID for admin setup
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    fetchStats();
  };

  const fetchStats = async () => {
    try {
      // Get total users count
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get total assessments count
      const { count: totalAssessments } = await supabase
        .from("health_assessments")
        .select("*", { count: "exact", head: true });

      // Get average risks
      const { data: assessments } = await supabase
        .from("health_assessments")
        .select("diabetes_risk, obesity_risk, hypertension_risk");

      if (assessments && assessments.length > 0) {
        const avgDiabetesRisk = assessments.reduce((sum, a) => sum + a.diabetes_risk, 0) / assessments.length;
        const avgObesityRisk = assessments.reduce((sum, a) => sum + a.obesity_risk, 0) / assessments.length;
        const avgHypertensionRisk = assessments.reduce((sum, a) => sum + a.hypertension_risk, 0) / assessments.length;

        setStats({
          totalUsers: totalUsers || 0,
          totalAssessments: totalAssessments || 0,
          avgDiabetesRisk: Math.round(avgDiabetesRisk),
          avgObesityRisk: Math.round(avgObesityRisk),
          avgHypertensionRisk: Math.round(avgHypertensionRisk),
        });
      } else {
        setStats({
          totalUsers: totalUsers || 0,
          totalAssessments: totalAssessments || 0,
          avgDiabetesRisk: 0,
          avgObesityRisk: 0,
          avgHypertensionRisk: 0,
        });
      }

      // Get latest monthly health progress
      const { data: healthLogs } = await supabase
        .from("daily_health_logs")
        .select("weight, blood_pressure_systolic, blood_pressure_diastolic, blood_glucose, created_at")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (healthLogs && healthLogs.length > 0) {
        // Group logs by month
        const logsByMonth: { [key: string]: typeof healthLogs } = {};
        healthLogs.forEach(log => {
          const logDate = new Date(log.created_at);
          const month = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
          if (!logsByMonth[month]) logsByMonth[month] = [];
          logsByMonth[month].push(log);
        });
        // Find the most recent month with data
        const months = Object.keys(logsByMonth).sort().reverse();
        if (months.length > 0) {
          const latestMonth = months[0];
          const monthLogs = logsByMonth[latestMonth];
          const avgWeight = monthLogs
            .filter(log => log.weight)
            .reduce((sum, log) => sum + log.weight, 0) / monthLogs.filter(log => log.weight).length;
          const avgSystolicBP = monthLogs
            .filter(log => log.blood_pressure_systolic)
            .reduce((sum, log) => sum + log.blood_pressure_systolic, 0) / monthLogs.filter(log => log.blood_pressure_systolic).length;
          const avgDiastolicBP = monthLogs
            .filter(log => log.blood_pressure_diastolic)
            .reduce((sum, log) => sum + log.blood_pressure_diastolic, 0) / monthLogs.filter(log => log.blood_pressure_diastolic).length;
          const avgBloodGlucose = monthLogs
            .filter(log => log.blood_glucose)
            .reduce((sum, log) => sum + log.blood_glucose, 0) / monthLogs.filter(log => log.blood_glucose).length;
          setLatestHealthProgress({
            month: latestMonth,
            avgWeight: isNaN(avgWeight) ? 0 : avgWeight,
            avgSystolicBP: isNaN(avgSystolicBP) ? 0 : avgSystolicBP,
            avgDiastolicBP: isNaN(avgDiastolicBP) ? 0 : avgDiastolicBP,
            avgBloodGlucose: isNaN(avgBloodGlucose) ? 0 : avgBloodGlucose,
            totalLogs: monthLogs.length
          });
        }
      }

    } catch (error: any) {
      console.error("Error fetching stats:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between border-b">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">HealthTrack Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of HealthTrack platform statistics and user management.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <Users className="h-8 w-8 text-primary mb-2" />
            <h3 className="text-lg font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-primary">{stats?.totalUsers || 0}</p>
          </Card>

          <Card className="p-6">
            <FileText className="h-8 w-8 text-accent mb-2" />
            <h3 className="text-lg font-semibold mb-2">Total Assessments</h3>
            <p className="text-3xl font-bold text-accent">{stats?.totalAssessments || 0}</p>
          </Card>

          <Card className="p-6">
            <TrendingUp className="h-8 w-8 text-warning mb-2" />
            <h3 className="text-sm font-semibold mb-2">Avg Diabetes Risk</h3>
            <p className="text-2xl font-bold text-warning">{stats?.avgDiabetesRisk || 0}%</p>
          </Card>

          <Card className="p-6">
            <TrendingUp className="h-8 w-8 text-destructive mb-2" />
            <h3 className="text-sm font-semibold mb-2">Avg Obesity Risk</h3>
            <p className="text-2xl font-bold text-destructive">{stats?.avgObesityRisk || 0}%</p>
          </Card>
        </div>

        {/* Risk Overview */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Population Health Overview</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Diabetes Risk</h3>
              <div className="text-4xl font-bold text-warning">{stats?.avgDiabetesRisk || 0}%</div>
              <p className="text-sm text-muted-foreground mt-1">Average across all users</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-2">Obesity Risk</h3>
              <div className="text-4xl font-bold text-destructive">{stats?.avgObesityRisk || 0}%</div>
              <p className="text-sm text-muted-foreground mt-1">Average across all users</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-2">Hypertension Risk</h3>
              <div className="text-4xl font-bold text-destructive">{stats?.avgHypertensionRisk || 0}%</div>
              <p className="text-sm text-muted-foreground mt-1">Average across all users</p>
            </div>
          </div>
        </Card>

        {/* Admin Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link to="/admin/users" className="block">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Users className="h-10 w-10 text-primary mb-3" />
              <h3 className="text-lg font-semibold mb-2">User Management</h3>
              <p className="text-muted-foreground mb-4">
                View and manage user accounts, roles, and access.
              </p>
              <Button>Manage Users</Button>
            </Card>
          </Link>

          <Link to="/admin/reports" className="block">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <FileText className="h-10 w-10 text-accent mb-3" />
              <h3 className="text-lg font-semibold mb-2">System Reports</h3>
              <p className="text-muted-foreground mb-4">
                Generate detailed reports on user health trends and platform usage.
              </p>
              <Button>View Reports</Button>
            </Card>
          </Link>

          <Card className="p-6">
            <TrendingUp className="h-10 w-10 text-success mb-3" />
            <h3 className="text-lg font-semibold mb-4">Latest Monthly Health Progress</h3>
            {latestHealthProgress ? (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground mb-2">
                  Month: {latestHealthProgress.month}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {latestHealthProgress.avgWeight > 0 && (
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground">Avg Weight</div>
                      <div className="text-lg font-semibold text-blue-600">{latestHealthProgress.avgWeight.toFixed(1)} kg</div>
                    </div>
                  )}
                  {latestHealthProgress.avgSystolicBP > 0 && latestHealthProgress.avgDiastolicBP > 0 && (
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground">Avg Blood Pressure</div>
                      <div className="text-lg font-semibold text-red-600">{latestHealthProgress.avgSystolicBP.toFixed(0)}/{latestHealthProgress.avgDiastolicBP.toFixed(0)}</div>
                    </div>
                  )}
                  {latestHealthProgress.avgBloodGlucose > 0 && (
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground">Avg Glucose</div>
                      <div className="text-lg font-semibold text-orange-600">{latestHealthProgress.avgBloodGlucose.toFixed(1)} mg/dL</div>
                    </div>
                  )}
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Health Logs</div>
                    <div className="text-lg font-semibold text-green-600">{latestHealthProgress.totalLogs}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No health data available for this month yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Data will appear once users start logging their health metrics
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
