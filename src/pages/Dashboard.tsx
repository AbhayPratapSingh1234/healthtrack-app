import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, LogOut, AlertCircle, Calendar, TrendingUp, Target, Sparkles, Printer, Download } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RiskGauge from "@/components/RiskGauge";
import { exportToCSV } from "@/lib/exportUtils";

interface Assessment {
  id: string;
  diabetes_risk: number;
  obesity_risk: number;
  hypertension_risk: number;
  bmi: number;
  weight: number;
  created_at: string;
}

const Dashboard = () => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchAssessment(user.id);
  };

  const fetchAssessment = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("health_assessments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setAssessment(data);
    } catch (error: any) {
      console.error("Error fetching assessment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportAssessment = () => {
    if (!assessment) {
      toast({
        title: "No Assessment Found",
        description: "Complete an assessment first to export data.",
        variant: "destructive",
      });
      return;
    }
    exportToCSV([assessment], 'health-assessment');
  };

  const getRiskLevel = (risk: number): string => {
    if (risk < 30) return "Low";
    if (risk < 60) return "Medium";
    return "High";
  };

  const getRiskColor = (risk: number): string => {
    if (risk < 30) return "text-accent";
    if (risk < 60) return "text-warning";
    return "text-destructive";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <header className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">HealthTrack</span>
          </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="ghost" onClick={handleExportAssessment}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
        </header>

        <div className="container mx-auto px-4 py-20 text-center">
          <Card className="max-w-2xl mx-auto p-12">
            <AlertCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Complete Your Assessment</h2>
            <p className="text-muted-foreground mb-8">
              Start by taking a quick health assessment to get your personalized risk profile.
            </p>
            <Link to="/questionnaire">
              <Button size="lg">Start Assessment</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between border-b">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <Activity className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">HealthTrack</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="ghost" onClick={handleExportAssessment}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Health Dashboard</h1>
          <p className="text-muted-foreground">
            Assessment completed on {new Date(assessment.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Current Weight</h3>
            <p className="text-4xl font-bold text-primary">{assessment.weight} kg</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">BMI</h3>
            <p className="text-4xl font-bold text-primary">{assessment.bmi.toFixed(1)}</p>
          </Card>
        </div>

        {/* Risk Assessments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Health Risk Assessment</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <RiskGauge risk={assessment.diabetes_risk} title="Diabetes Risk" />
              <div className="mt-4 text-center">
                <p className={`text-xl font-bold ${getRiskColor(assessment.diabetes_risk)}`}>
                  {getRiskLevel(assessment.diabetes_risk)} Risk
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <RiskGauge risk={assessment.obesity_risk} title="Obesity Risk" />
              <div className="mt-4 text-center">
                <p className={`text-xl font-bold ${getRiskColor(assessment.obesity_risk)}`}>
                  {getRiskLevel(assessment.obesity_risk)} Risk
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <RiskGauge risk={assessment.hypertension_risk} title="Hypertension Risk" />
              <div className="mt-4 text-center">
                <p className={`text-xl font-bold ${getRiskColor(assessment.hypertension_risk)}`}>
                  {getRiskLevel(assessment.hypertension_risk)} Risk
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/log" className="block">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer text-center">
              <Calendar className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Daily Log</h3>
              <p className="text-sm text-muted-foreground">Track your metrics</p>
            </Card>
          </Link>
          
          <Link to="/progress" className="block">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer text-center">
              <TrendingUp className="h-10 w-10 text-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-1">View Progress</h3>
              <p className="text-sm text-muted-foreground">See your trends</p>
            </Card>
          </Link>
          
          <Link to="/goals" className="block">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer text-center">
              <Target className="h-10 w-10 text-warning mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Health Goals</h3>
              <p className="text-sm text-muted-foreground">Set objectives</p>
            </Card>
          </Link>
          
          <Link to="/recommendations" className="block">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer text-center">
              <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">AI Advice</h3>
              <p className="text-sm text-muted-foreground">Get recommendations</p>
            </Card>
          </Link>
        </div>

        {/* Retake Assessment */}
        <Card className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-4">Want to update your assessment?</h3>
          <Link to="/questionnaire">
            <Button>Retake Assessment</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
