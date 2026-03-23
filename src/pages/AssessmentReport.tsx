import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Printer, FileText, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { supabase, type Database } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RiskGauge from "@/components/RiskGauge";
import { exportToCSV } from "@/lib/exportUtils";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@/components/ui/carousel";

type HealthAssessment = Database["public"]["Tables"]["health_assessments"]["Row"];
type AIReport = {
  title: string;
  subtitle: string;
  potentialHealthRisks: Array<{
    name: string;
    riskLevel: string;
    description: string;
  }>;
  preventionStrategies: Array<{
    category: string;
    items: string[];
  }>;
  personalizedRecommendations: Array<{
    title: string;
    description: string;
  }>;
  dietaryRecommendations: {
    foodsToAvoid: string[];
    foodsToInclude: string[];
    suggestedMealPlan: {
      breakfast: string;
      lunch: string;
      dinner: string;
      snacks: string;
    };
  };
  disclaimer: string;
};

const AssessmentReport: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [assessment, setAssessment] = useState<HealthAssessment | null>(null);
  const [report, setReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  const assessmentId = location.state?.assessmentId || searchParams.get('id') as string | undefined;

  useEffect(() => {
    if (assessmentId) {
      fetchAssessment();
    } else {
      toast({
        title: "No Assessment Data",
        description: "Please complete the questionnaire first.",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [assessmentId]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please log in", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase
        .from("health_assessments")
        .select("*")
        .eq("id", assessmentId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        toast({ title: "Assessment not found", description: error?.message, variant: "destructive" });
        return;
      }

      setAssessment(data);
      await generateReport(data);
    } catch (error) {
      toast({ title: "Error loading assessment", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };


  const generateReport = async (assessmentData: HealthAssessment) => {
    setGeneratingReport(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-assessment-report", {
        body: {
          assessmentData: {

            age: assessmentData.age,
            gender: assessmentData.gender,
            height: assessmentData.height,
            weight: assessmentData.weight,
            bmi: assessmentData.bmi,
            family_diabetes: assessmentData.family_diabetes,
            family_hypertension: assessmentData.family_hypertension,
            family_obesity: assessmentData.family_obesity,
            smoking_status: assessmentData.smoking_status,
            alcohol_consumption: assessmentData.alcohol_consumption,
            exercise_frequency: assessmentData.exercise_frequency,
            diet_type: assessmentData.diet_type,
            sleep_hours: assessmentData.sleep_hours,
            diabetes_risk: assessmentData.diabetes_risk,
            obesity_risk: assessmentData.obesity_risk,
            hypertension_risk: assessmentData.hypertension_risk,
            past_illnesses: assessmentData.past_illnesses || [],
            current_symptoms: assessmentData.current_symptoms || [],
            location: assessmentData.location,
            allergies: assessmentData.allergies || [],
          },
          api: "openai",
        },
      });

      if (error) throw error;
      
      console.log('Raw API data:', data);
      console.log('Report object:', data?.report);
      
      // Handle OpenRouter chat format
      if (data && data.report && data.report.choices && data.report.choices[0]) {
        const content = data.report.choices[0].message.content;
        const parsedReport = JSON.parse(content);
        setReport(parsedReport);
        console.log('Parsed report:', parsedReport);
      } else {
        const aiReport = data?.report as AIReport;
        setReport(aiReport);
      }
    } catch (error: any) {
      console.error("Report generation failed:", error);
      toast({
        title: "Report Generation Failed",
        description: "Showing assessment data only. " + (error.message || "Try again later."),
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const exportToPDF = () => {
    // Simple browser print for now
    window.print();
  };

  const exportToCSV = () => {
    if (!assessment) return;
    
    const exportData = [{
      ...assessment,
      bmi: assessment.bmi?.toFixed(2),
      diabetes_risk: `${assessment.diabetes_risk}%`,
      obesity_risk: `${assessment.obesity_risk}%`,
      hypertension_risk: `${assessment.hypertension_risk}%`,
      report_summary: report ? JSON.stringify(report, null, 2).slice(0, 1000) : "N/A",
    }];
    
    exportToCSV(exportData, `health-assessment-${assessment.id}`);
    toast({ title: "Report exported to CSV" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
        <div className="container max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 animate-spin text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Loading Assessment Report</h1>
              <p className="text-muted-foreground">Generating your personalized analysis...</p>
            </div>
          </div>
          <div className="space-y-2">
            <Progress value={generatingReport ? 75 : 50} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">
              {generatingReport ? "Generating AI recommendations..." : "Loading your data..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
        <div className="container max-w-4xl mx-auto">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <Card>
            <CardContent className="py-16 text-center">
              <h2 className="text-2xl font-bold mb-4">No Assessment Found</h2>
              <p className="text-muted-foreground mb-8">Please complete the health questionnaire first.</p>
              <Button asChild size="lg">
                <Link to="/questionnaire">Start Assessment</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4 print:bg-white">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 print:mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-8 block print:hidden">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="text-center mb-12 print:mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent mb-4">
              {report?.title || "Your Health Assessment Report"}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {report?.subtitle || "Personalized analysis and recommendations"}
            </p>
          </div>

          {/* Profile Summary */}
          <Card className="mb-12 print:mb-8">
            <CardHeader className="grid md:grid-cols-3 gap-4 pb-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Profile Summary</h3>
                <p className="text-2xl font-bold">{assessment.age} years • {assessment.gender}</p>
                <p className="text-muted-foreground">BMI: {(assessment.bmi || 0).toFixed(1)}</p>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <RiskGauge risk={assessment.diabetes_risk || 0} title="Diabetes Risk" />
                <RiskGauge risk={assessment.obesity_risk || 0} title="Obesity Risk" />
                <RiskGauge risk={assessment.hypertension_risk || 0} title="Hypertension Risk" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Potential Health Risks */}
        {report?.potentialHealthRisks && (
          <section className="mb-16 print:mb-12" id="risks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Potential Health Risks
                </CardTitle>
                <CardDescription>
                  Conditions you may be at risk for based on your profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {report.potentialHealthRisks.map((risk, index) => (
                  <div key={index} className="flex gap-4 md:gap-8 items-start p-6 bg-muted/50 rounded-xl border">
                    <div className="flex-shrink-0">
                      <Badge variant={risk.riskLevel.includes("HIGH") ? "destructive" : risk.riskLevel.includes("MEDIUM") ? "default" : "secondary"} className="text-lg px-4 py-2">
                        {risk.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-bold">{risk.name}</h3>
                      <p className="text-muted-foreground leading-relaxed">{risk.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Prevention Strategies */}
        {report?.preventionStrategies && (
          <section className="mb-16 print:mb-12" id="prevention">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-6 w-6" />
                  Prevention Strategies
                </CardTitle>
                <CardDescription>How to protect yourself and reduce risks</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {report.preventionStrategies.map((strategy, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{strategy.category}</AccordionTrigger>
                      <AccordionContent className="pt-2 space-y-2">
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {strategy.items.map((item, i) => (
                            <li key={i} className="ml-2">{item}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Personalized Recommendations */}
        {report?.personalizedRecommendations && (
          <section className="mb-16 print:mb-12" id="recommendations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Personalized Recommendations
                </CardTitle>
                <CardDescription>Action steps tailored to your health profile</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                {report.personalizedRecommendations.map((rec, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 pt-8 pb-8">
                      <h3 className="text-xl font-bold mb-3">{rec.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{rec.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Dietary Recommendations */}
{report?.dietaryRecommendations && (
          <section className="mb-16 print:mb-12" id="diet">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardTitle className="text-2xl flex items-center gap-3">
                  🍽️ Dietary Recommendations
                </CardTitle>
                <CardDescription className="text-white/80">Your personalized nutrition plan</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Avoid/Include Cards */}
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="p-8 border-b lg:border-r border-border bg-gradient-to-b from-red-50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-destructive rounded-2xl flex items-center justify-center">
                        <span className="text-xl font-bold">🚫</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-destructive">Foods to Avoid</h3>
                        <p className="text-muted-foreground">Limit these for better health</p>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {report.dietaryRecommendations.foodsToAvoid.map((food, i) => (
                        <div key={i} className="group hover:bg-destructive/5 p-4 rounded-xl border border-destructive/20 transition-all cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-destructive rounded-full group-hover:scale-110 transition-transform"></div>
                            <span className="font-medium">{food}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-8 bg-gradient-to-b from-emerald-50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                        <span className="text-xl font-bold">✅</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-emerald-700">Foods to Include</h3>
                        <p className="text-muted-foreground">Prioritize these daily</p>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {report.dietaryRecommendations.foodsToInclude.map((food, i) => (
                        <div key={i} className="group hover:bg-emerald-100 p-4 rounded-xl border border-emerald-200/50 transition-all cursor-pointer shadow-sm hover:shadow-md">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full group-hover:scale-110 transition-transform"></div>
                            <span className="font-medium">{food}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Meal Plan Carousel */}
                <div className="p-8 border-t bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h3 className="text-2xl font-bold mb-8 text-center text-gray-800 flex items-center justify-center gap-3">
                    📅 Suggested Daily Meal Plan
                  </h3>
                  <div className="max-w-4xl mx-auto">
                    <Carousel opts={{align: 'start', loop: false}} className="w-full max-w-2xl mx-auto">
                      <CarouselContent className="-ml-4">
                        {Object.entries(report.dietaryRecommendations.suggestedMealPlan).map(([meal, description], i) => (
                          <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/3">
                            <div className="group p-6 rounded-2xl bg-white border shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-48 flex flex-col justify-between cursor-pointer">
                              <div className="flex items-center gap-3 mb-3">
                                {meal === 'breakfast' && '☀️'}
                                {meal === 'lunch' && '🌞'}
                                {meal === 'dinner' && '🌙'}
                                {meal === 'snacks' && '🍎'}
                                <h4 className="font-bold text-xl capitalize">{meal}</h4>
                              </div>
                              <p className="text-gray-700 leading-relaxed flex-1">{description}</p>
                              <Button variant="outline" size="sm" className="mt-auto w-full group-hover:bg-primary group-hover:text-primary-foreground">
                                Add to Plan
                              </Button>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Disclaimer & Actions */}
        <Card className="print:border-t pt-12 mt-16">
          <CardContent className="pt-12 pb-12 text-center text-muted-foreground">
            <p className="max-w-2xl mx-auto mb-8 text-sm leading-relaxed print:text-base print:text-foreground">
              {report?.disclaimer || "This report is generated based on AI analysis and should not replace professional medical advice. Always consult with qualified healthcare providers for diagnosis and treatment."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center print:flex-col print:gap-2">
              <Button onClick={exportToPDF} variant="outline" size="lg" className="gap-2 print:hidden">
                <Printer className="h-4 w-4" />
                Print Report
              </Button>
              <Button onClick={exportToCSV} size="lg" className="gap-2">
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
              {!generatingReport && report === null && (
                <Button 
                  onClick={() => assessment && generateReport(assessment)} 
                  variant="secondary" 
                  size="lg"
                >
                  Regenerate AI Report
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssessmentReport;

