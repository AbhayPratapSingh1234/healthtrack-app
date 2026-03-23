import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, TrendingUp, Activity, Calendar, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HealthTrends {
  totalAssessments: number;
  avgDiabetesRisk: number;
  avgObesityRisk: number;
  avgHypertensionRisk: number;
  assessmentsByMonth: { month: string; count: number }[];
  riskTrends: { month: string; diabetes: number; obesity: number; hypertension: number }[];
}

interface PlatformUsage {
  totalUsers: number;
  activeUsers: number;
  totalHealthLogs: number;
  totalGoals: number;
  userEngagement: { range: string; count: number }[];
  goalCompletionRate: number;
}

interface MonthlyHealthProgress {
  month: string;
  avgBMI: number;
  avgSystolicBP: number;
  avgDiastolicBP: number;
  avgBloodGlucose: number;
  avgWeight: number;
  totalLogs: number;
}

const SystemReports = () => {
  const [healthTrends, setHealthTrends] = useState<HealthTrends | null>(null);
  const [platformUsage, setPlatformUsage] = useState<PlatformUsage | null>(null);
  const [monthlyHealthProgress, setMonthlyHealthProgress] = useState<MonthlyHealthProgress[]>([]);
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    fetchReportsData();
  };

  const fetchReportsData = async () => {
    try {
      // Health Trends Data
      const { data: assessments } = await supabase
        .from("health_assessments")
        .select("diabetes_risk, obesity_risk, hypertension_risk, created_at");

      // Platform Usage Data
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: totalHealthLogs } = await supabase
        .from("daily_health_logs")
        .select("*", { count: "exact", head: true });

      const { count: totalGoals } = await supabase
        .from("health_goals")
        .select("*", { count: "exact", head: true });

      // Calculate active users (users with assessments in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentAssessments } = await supabase
        .from("health_assessments")
        .select("user_id")
        .gte("created_at", thirtyDaysAgo.toISOString());

      const activeUsers = new Set(recentAssessments?.map(a => a.user_id)).size;

      // Calculate health trends
      let healthTrendsData: HealthTrends = {
        totalAssessments: assessments?.length || 0,
        avgDiabetesRisk: 0,
        avgObesityRisk: 0,
        avgHypertensionRisk: 0,
        assessmentsByMonth: [],
        riskTrends: []
      };

      if (assessments && assessments.length > 0) {
        healthTrendsData.avgDiabetesRisk = assessments.reduce((sum, a) => sum + a.diabetes_risk, 0) / assessments.length;
        healthTrendsData.avgObesityRisk = assessments.reduce((sum, a) => sum + a.obesity_risk, 0) / assessments.length;
        healthTrendsData.avgHypertensionRisk = assessments.reduce((sum, a) => sum + a.hypertension_risk, 0) / assessments.length;

        // Group by month
        const monthlyData: { [key: string]: { count: number; diabetes: number; obesity: number; hypertension: number } } = {};

        assessments.forEach(assessment => {
          const date = new Date(assessment.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { count: 0, diabetes: 0, obesity: 0, hypertension: 0 };
          }

          monthlyData[monthKey].count++;
          monthlyData[monthKey].diabetes += assessment.diabetes_risk;
          monthlyData[monthKey].obesity += assessment.obesity_risk;
          monthlyData[monthKey].hypertension += assessment.hypertension_risk;
        });

        healthTrendsData.assessmentsByMonth = Object.entries(monthlyData)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, data]) => ({ month, count: data.count }));

        healthTrendsData.riskTrends = Object.entries(monthlyData)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, data]) => ({
            month,
            diabetes: data.diabetes / data.count,
            obesity: data.obesity / data.count,
            hypertension: data.hypertension / data.count
          }));
      }

      // Calculate platform usage
      const { data: goals } = await supabase
        .from("health_goals")
        .select("status");

      const completedGoals = goals?.filter(g => g.status === 'completed').length || 0;
      const goalCompletionRate = goals && goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;

      // User engagement ranges
      const { data: userAssessmentCounts } = await supabase
        .from("health_assessments")
        .select("user_id");

      const userCounts: { [key: string]: number } = {};
      userAssessmentCounts?.forEach(assessment => {
        userCounts[assessment.user_id] = (userCounts[assessment.user_id] || 0) + 1;
      });

      const engagementRanges = {
        "1-2 assessments": 0,
        "3-5 assessments": 0,
        "6-10 assessments": 0,
        "10+ assessments": 0
      };

      Object.values(userCounts).forEach(count => {
        if (count <= 2) engagementRanges["1-2 assessments"]++;
        else if (count <= 5) engagementRanges["3-5 assessments"]++;
        else if (count <= 10) engagementRanges["6-10 assessments"]++;
        else engagementRanges["10+ assessments"]++;
      });

      const platformUsageData: PlatformUsage = {
        totalUsers: totalUsers || 0,
        activeUsers,
        totalHealthLogs: totalHealthLogs || 0,
        totalGoals: totalGoals || 0,
        userEngagement: Object.entries(engagementRanges).map(([range, count]) => ({ range, count })),
        goalCompletionRate
      };

      // Calculate monthly health progress from daily logs
      const { data: healthLogs } = await supabase
        .from("daily_health_logs")
        .select("weight, blood_pressure_systolic, blood_pressure_diastolic, blood_glucose, body_fat_percentage, created_at");

      const monthlyProgress: { [key: string]: {
        bmi: number[];
        systolicBP: number[];
        diastolicBP: number[];
        bloodGlucose: number[];
        weight: number[];
        count: number;
      } } = {};

      if (healthLogs && healthLogs.length > 0) {
        healthLogs.forEach(log => {
          const date = new Date(log.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

          if (!monthlyProgress[monthKey]) {
            monthlyProgress[monthKey] = {
              bmi: [],
              systolicBP: [],
              diastolicBP: [],
              bloodGlucose: [],
              weight: [],
              count: 0
            };
          }

          // Calculate BMI if we have weight and can estimate height (this is approximate)
          // For now, we'll skip BMI calculation as we don't have height data
          // monthlyProgress[monthKey].bmi.push(calculatedBMI);

          if (log.blood_pressure_systolic) monthlyProgress[monthKey].systolicBP.push(log.blood_pressure_systolic);
          if (log.blood_pressure_diastolic) monthlyProgress[monthKey].diastolicBP.push(log.blood_pressure_diastolic);
          if (log.blood_glucose) monthlyProgress[monthKey].bloodGlucose.push(log.blood_glucose);
          if (log.weight) monthlyProgress[monthKey].weight.push(log.weight);

          monthlyProgress[monthKey].count++;
        });

        const monthlyHealthData: MonthlyHealthProgress[] = Object.entries(monthlyProgress)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, data]) => ({
            month,
            avgBMI: data.bmi.length > 0 ? data.bmi.reduce((a, b) => a + b, 0) / data.bmi.length : 0,
            avgSystolicBP: data.systolicBP.length > 0 ? data.systolicBP.reduce((a, b) => a + b, 0) / data.systolicBP.length : 0,
            avgDiastolicBP: data.diastolicBP.length > 0 ? data.diastolicBP.reduce((a, b) => a + b, 0) / data.diastolicBP.length : 0,
            avgBloodGlucose: data.bloodGlucose.length > 0 ? data.bloodGlucose.reduce((a, b) => a + b, 0) / data.bloodGlucose.length : 0,
            avgWeight: data.weight.length > 0 ? data.weight.reduce((a, b) => a + b, 0) / data.weight.length : 0,
            totalLogs: data.count
          }));

        setMonthlyHealthProgress(monthlyHealthData);
      }

      setHealthTrends(healthTrendsData);
      setPlatformUsage(platformUsageData);
    } catch (error: any) {
      console.error("Error fetching reports data:", error);
      toast({
        title: "Error",
        description: "Failed to load system reports.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Generating system reports...</p>
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
          <Activity className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">System Reports</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">System Reports</h1>
          <p className="text-muted-foreground">
            Detailed analysis of user health trends and platform usage statistics.
          </p>
        </div>

        {/* Health Trends Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Health Trends Analysis
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <FileText className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-lg font-semibold mb-2">Total Assessments</h3>
              <p className="text-3xl font-bold text-primary">{healthTrends?.totalAssessments || 0}</p>
            </Card>

            <Card className="p-6">
              <TrendingUp className="h-8 w-8 text-warning mb-2" />
              <h3 className="text-sm font-semibold mb-2">Avg Diabetes Risk</h3>
              <p className="text-2xl font-bold text-warning">{healthTrends?.avgDiabetesRisk.toFixed(1) || 0}%</p>
            </Card>

            <Card className="p-6">
              <TrendingUp className="h-8 w-8 text-destructive mb-2" />
              <h3 className="text-sm font-semibold mb-2">Avg Obesity Risk</h3>
              <p className="text-2xl font-bold text-destructive">{healthTrends?.avgObesityRisk.toFixed(1) || 0}%</p>
            </Card>

            <Card className="p-6">
              <TrendingUp className="h-8 w-8 text-destructive mb-2" />
              <h3 className="text-sm font-semibold mb-2">Avg Hypertension Risk</h3>
              <p className="text-2xl font-bold text-destructive">{healthTrends?.avgHypertensionRisk.toFixed(1) || 0}%</p>
            </Card>
          </div>

          {/* Assessment Trends */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Assessment Trends by Month</h3>
            <div className="space-y-3">
              {healthTrends?.assessmentsByMonth.slice(-6).map((item) => (
                <div key={item.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(item.count / Math.max(...healthTrends.assessmentsByMonth.map(m => m.count))) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Risk Trends */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Risk Level Trends</h3>
            <div className="space-y-4">
              {healthTrends?.riskTrends.slice(-6).map((trend) => (
                <div key={trend.month} className="space-y-2">
                  <span className="text-sm font-medium">{trend.month}</span>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Diabetes</div>
                      <div className="text-lg font-semibold text-warning">{trend.diabetes.toFixed(1)}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Obesity</div>
                      <div className="text-lg font-semibold text-destructive">{trend.obesity.toFixed(1)}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Hypertension</div>
                      <div className="text-lg font-semibold text-destructive">{trend.hypertension.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Monthly Health Progress Section */}
        {monthlyHealthProgress.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Monthly Health Progress (All Users)
            </h2>

            <div className="grid gap-6">
              {monthlyHealthProgress.slice(-6).map((progress) => (
                <Card key={progress.month} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{progress.month}</h3>
                    <Badge variant="outline">{progress.totalLogs} logs</Badge>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {progress.avgWeight > 0 && (
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Avg Weight</div>
                        <div className="text-lg font-semibold text-blue-600">{progress.avgWeight.toFixed(1)} kg</div>
                      </div>
                    )}

                    {progress.avgSystolicBP > 0 && (
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Avg BP (Systolic)</div>
                        <div className="text-lg font-semibold text-red-600">{progress.avgSystolicBP.toFixed(0)} mmHg</div>
                      </div>
                    )}

                    {progress.avgDiastolicBP > 0 && (
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Avg BP (Diastolic)</div>
                        <div className="text-lg font-semibold text-red-600">{progress.avgDiastolicBP.toFixed(0)} mmHg</div>
                      </div>
                    )}

                    {progress.avgBloodGlucose > 0 && (
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Avg Blood Glucose</div>
                        <div className="text-lg font-semibold text-orange-600">{progress.avgBloodGlucose.toFixed(1)} mg/dL</div>
                      </div>
                    )}
                  </div>

                  {progress.avgSystolicBP > 0 && progress.avgDiastolicBP > 0 && (
                    <div className="mt-3 text-center">
                      <div className="text-xs text-muted-foreground">Blood Pressure Reading</div>
                      <div className="text-sm font-medium">
                        {progress.avgSystolicBP.toFixed(0)}/{progress.avgDiastolicBP.toFixed(0)} mmHg
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {monthlyHealthProgress.length === 0 && (
              <Card className="p-6">
                <div className="text-center text-muted-foreground">
                  No health log data available for monthly analysis.
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Platform Usage Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Platform Usage Statistics
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <Users className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-primary">{platformUsage?.totalUsers || 0}</p>
            </Card>

            <Card className="p-6">
              <Activity className="h-8 w-8 text-accent mb-2" />
              <h3 className="text-lg font-semibold mb-2">Active Users (30d)</h3>
              <p className="text-3xl font-bold text-accent">{platformUsage?.activeUsers || 0}</p>
            </Card>

            <Card className="p-6">
              <Calendar className="h-8 w-8 text-warning mb-2" />
              <h3 className="text-lg font-semibold mb-2">Health Logs</h3>
              <p className="text-3xl font-bold text-warning">{platformUsage?.totalHealthLogs || 0}</p>
            </Card>

            <Card className="p-6">
              <TrendingUp className="h-8 w-8 text-success mb-2" />
              <h3 className="text-sm font-semibold mb-2">Goal Completion</h3>
              <p className="text-2xl font-bold text-success">{platformUsage?.goalCompletionRate.toFixed(1) || 0}%</p>
            </Card>
          </div>

          {/* User Engagement */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">User Engagement Levels</h3>
              <div className="space-y-3">
                {platformUsage?.userEngagement.map((engagement) => (
                  <div key={engagement.range} className="flex items-center justify-between">
                    <span className="text-sm">{engagement.range}</span>
                    <Badge variant="secondary">{engagement.count} users</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Platform Health</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">User Activity Rate</span>
                  <span className="font-semibold">
                    {platformUsage?.totalUsers ?
                      ((platformUsage.activeUsers / platformUsage.totalUsers) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Logs per User</span>
                  <span className="font-semibold">
                    {platformUsage?.totalUsers ?
                      (platformUsage.totalHealthLogs / platformUsage.totalUsers).toFixed(1) : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Goals per User</span>
                  <span className="font-semibold">
                    {platformUsage?.totalUsers ?
                      (platformUsage.totalGoals / platformUsage.totalUsers).toFixed(1) : 0}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemReports;
