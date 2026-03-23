import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, ArrowLeft, LogOut, Download } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { exportToCSV } from "@/lib/exportUtils";

interface HealthLog {
  log_date: string;
  weight: number | null;
  blood_pressure_systolic: number | null;
  blood_glucose: number | null;
  exercise_minutes: number | null;
}

interface HealthAssessment {
  id: string;
  created_at: string;
  weight: number;
  bmi: number;
  diabetes_risk: number;
  obesity_risk: number;
  hypertension_risk: number;
}

const Progress = () => {
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [assessments, setAssessments] = useState<HealthAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchLogs();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const fetchLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch daily health logs
      const { data: logsData, error: logsError } = await supabase
        .from("daily_health_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("log_date", { ascending: true });

      if (logsError) throw logsError;

      // Fetch health assessments
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from("health_assessments")
        .select("id, created_at, weight, bmi, diabetes_risk, obesity_risk, hypertension_risk")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (assessmentsError) throw assessmentsError;

      setLogs(logsData || []);
      setAssessments(assessmentsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleExportHealthLogs = () => {
    const exportData = logs.map(log => ({
      Date: log.log_date,
      Weight: log.weight || '',
      'Blood Pressure Systolic': log.blood_pressure_systolic || '',
      'Blood Glucose': log.blood_glucose || '',
      'Exercise Minutes': log.exercise_minutes || ''
    }));
    exportToCSV(exportData, 'health-logs');
  };

  const handleExportAssessments = () => {
    const exportData = assessments.map(assessment => ({
      Date: new Date(assessment.created_at).toLocaleDateString(),
      Weight: assessment.weight,
      BMI: assessment.bmi.toFixed(2),
      'Diabetes Risk (%)': assessment.diabetes_risk,
      'Obesity Risk (%)': assessment.obesity_risk,
      'Hypertension Risk (%)': assessment.hypertension_risk
    }));
    exportToCSV(exportData, 'health-assessments');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <Activity className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">HealthTrack</span>
        </div>
        <Button variant="ghost" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Progress Tracking</h1>
              <p className="text-muted-foreground">View your health trends over time</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportHealthLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
              <Button variant="outline" onClick={handleExportAssessments}>
                <Download className="h-4 w-4 mr-2" />
                Export Assessments
              </Button>
            </div>
          </div>
        </div>

        {logs.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No health logs yet. Start tracking to see your progress!</p>
            <Link to="/log">
              <Button>Log Your First Entry</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Weight Chart */}
            {logs.some((log) => log.weight) && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Weight Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={logs.filter((log) => log.weight)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="log_date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Blood Pressure Chart */}
            {logs.some((log) => log.blood_pressure_systolic) && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Blood Pressure Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={logs.filter((log) => log.blood_pressure_systolic)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="log_date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="blood_pressure_systolic" stroke="hsl(var(--destructive))" name="Systolic" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Exercise Chart */}
            {logs.some((log) => log.exercise_minutes) && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Exercise Activity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={logs.filter((log) => log.exercise_minutes)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="log_date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="exercise_minutes"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--accent))" }}
                      name="Minutes"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Blood Glucose Chart */}
            {logs.some((log) => log.blood_glucose) && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Blood Glucose Levels</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={logs.filter((log) => log.blood_glucose)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="log_date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Line type="monotone" dataKey="blood_glucose" stroke="hsl(var(--warning))" strokeWidth={2} dot={{ fill: "hsl(var(--warning))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* BMI Trend from Assessments */}
            {assessments.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">BMI Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={assessments.map(assessment => ({
                    date: new Date(assessment.created_at).toLocaleDateString(),
                    bmi: assessment.bmi
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Line type="monotone" dataKey="bmi" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Diabetes Risk Trend */}
            {assessments.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Diabetes Risk Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={assessments.map(assessment => ({
                    date: new Date(assessment.created_at).toLocaleDateString(),
                    risk: assessment.diabetes_risk
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                      }}
                      formatter={(value) => [`${value}%`, 'Risk']}
                    />
                    <Line type="monotone" dataKey="risk" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ fill: "hsl(var(--destructive))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Obesity Risk Trend */}
            {assessments.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Obesity Risk Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={assessments.map(assessment => ({
                    date: new Date(assessment.created_at).toLocaleDateString(),
                    risk: assessment.obesity_risk
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                      }}
                      formatter={(value) => [`${value}%`, 'Risk']}
                    />
                    <Line type="monotone" dataKey="risk" stroke="hsl(var(--warning))" strokeWidth={2} dot={{ fill: "hsl(var(--warning))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Hypertension Risk Trend */}
            {assessments.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Hypertension Risk Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={assessments.map(assessment => ({
                    date: new Date(assessment.created_at).toLocaleDateString(),
                    risk: assessment.hypertension_risk
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                      }}
                      formatter={(value) => [`${value}%`, 'Risk']}
                    />
                    <Line type="monotone" dataKey="risk" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: "hsl(var(--accent))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
