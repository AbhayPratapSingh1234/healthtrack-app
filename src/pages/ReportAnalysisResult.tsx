import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Loader2, FileText, AlertCircle, CheckCircle, Stethoscope, Activity, Shield, Lightbulb, TrendingUp, Heart, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ReportAnalysisResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState(true);
  const [report, setReport] = useState<{
    comparisonTable?: Array<{
      parameter: string;
      reportValue: string;
      normalRange: string;
      status: string;
      effect: string;
    }>;
    summary?: string;
    majorDisease?: string;
    potentialDiagnoses?: string[];
    majorConcerns?: string[];
    recommendations?: string[];
    specialistConsultations?: string[];
    precautions?: string[];
    rawAnalysis?: string;
  } | null>(null);
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    const { fileData, fileName: name, fileType } = location.state || {};

    if (!fileData) {
      toast({
        title: "No report data",
        description: "Please upload a report first",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setFileName(name);
    analyzeReport(fileData, name, fileType);
  }, [location.state, navigate]);

  const analyzeReport = async (fileData: string, fileName: string, fileType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("analyze-health-report", {
        body: {
          fileData,
          fileName,
          fileType,
        },
      });

      if (error) {
        console.error("Error analyzing report:", error);
        toast({
          title: "Analysis failed",
          description: error.message || "Failed to analyze the report. Please try again.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setReport(data.analysis);
      setAnalyzing(false);
      toast({
        title: "Analysis complete",
        description: "Your personalized health report is ready",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "normal": return "default";
      case "high": return "destructive";
      case "low": return "secondary";
      case "critical": return "destructive";
      default: return "outline";
    }
  };

  const calculateHealthScore = () => {
    if (!report?.comparisonTable) return 0;
    const total = report.comparisonTable.length;
    const normal = report.comparisonTable.filter(row => row.status?.toLowerCase() === 'normal').length;
    return Math.round((normal / total) * 100);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Attention";
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && report) {
      const tableHtml = report.comparisonTable ? `
        <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f0f0f0;">
              <th>Parameter</th>
              <th>Report Value</th>
              <th>Normal Range</th>
              <th>Status</th>
              <th>Effect</th>
            </tr>
          </thead>
          <tbody>
            ${report.comparisonTable.map((row: any) => `
              <tr>
                <td><strong>${row.parameter}</strong></td>
                <td>${row.reportValue}</td>
                <td>${row.normalRange}</td>
                <td><span style="padding: 2px 8px; background: ${row.status?.toLowerCase() === 'normal' ? '#e8f5e9' : '#ffebee'}; border-radius: 4px;">${row.status}</span></td>
                <td>${row.effect}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '';

      printWindow.document.write(`
        <html>
          <head>
            <title>Health Report Analysis</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
              h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
              h2 { color: #555; margin-top: 30px; }
              .section { margin: 20px 0; }
              ul { line-height: 1.8; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>
            <h1>Health Report Analysis</h1>
            <p><strong>Report:</strong> ${fileName}</p>
            ${report.summary ? `<div class="section"><h2>Summary</h2><p>${report.summary}</p></div>` : ''}
            ${report.potentialDiagnoses && report.potentialDiagnoses.length > 0 ? `
              <div class="section" style="background: #fee; padding: 15px; border-left: 4px solid #dc2626; border-radius: 4px;">
                <h2 style="color: #dc2626;">Potential Diagnoses / Health Conditions</h2>
                <p style="margin: 10px 0;">Based on your report values, you may be at risk for:</p>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  ${report.potentialDiagnoses.map((d: string) => `<span style="background: #dc2626; color: white; padding: 6px 12px; border-radius: 12px; font-weight: bold;">${d}</span>`).join('')}
                </div>
              </div>
            ` : ''}
            ${tableHtml}
            ${report.majorConcerns ? `<div class="section"><h2>Major Concerns</h2><ul>${report.majorConcerns.map((c: string) => `<li>${c}</li>`).join('')}</ul></div>` : ''}
            ${report.specialistConsultations && report.specialistConsultations.length > 0 ? `<div class="section"><h2>Suggested Specialist Consultations</h2><ul>${report.specialistConsultations.map((s: string) => `<li>${s}</li>`).join('')}</ul></div>` : ''}
            ${report.precautions && report.precautions.length > 0 ? `<div class="section"><h2>Precautions</h2><ul>${report.precautions.map((p: string) => `<li>${p}</li>`).join('')}</ul></div>` : ''}
            ${report.recommendations ? `<div class="section"><h2>Recommendations</h2><ul>${report.recommendations.map((r: string) => `<li>${r}</li>`).join('')}</ul></div>` : ''}
            ${report.rawAnalysis ? `<div class="section"><pre>${report.rawAnalysis}</pre></div>` : ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>

          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Medical Report Analysis
              </CardTitle>
              <CardDescription>
                AI-powered analysis of your health report
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyzing ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 text-primary animate-spin" />
                    <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-semibold">Analyzing Your Health Report...</p>
                    <p className="text-sm text-muted-foreground">
                      Our AI Doctor is carefully reviewing your medical report
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This may take a moment
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              ) : report ? (
                <div className="space-y-8">
                  {/* Header Section with Enhanced Styling */}
                  <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-xl p-6 border border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-primary">Analysis Results</h2>
                          <p className="text-sm text-muted-foreground">Report: {fileName}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrint}
                          className="hover:bg-primary/10 transition-colors"
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print Report
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/")}
                          className="hover:bg-secondary/10 transition-colors"
                        >
                          Upload New
                        </Button>
                      </div>
                    </div>

                    {/* Interactive Health Score Dashboard */}
                    {report.comparisonTable && report.comparisonTable.length > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                              <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">Health Score</h3>
                              <p className="text-sm text-blue-700 dark:text-blue-300">Overall assessment based on your test results</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-3xl font-bold ${getHealthScoreColor(calculateHealthScore())}`}>
                              {calculateHealthScore()}%
                            </div>
                            <div className="text-sm text-muted-foreground">{getHealthScoreLabel(calculateHealthScore())}</div>
                          </div>
                        </div>
                        <Progress value={calculateHealthScore()} className="h-3" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>Needs Attention</span>
                          <span>Excellent</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {report.summary && (
                    <div className="bg-secondary/20 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Summary</h3>
                      <p className="text-sm">{report.summary}</p>
                    </div>
                  )}

                  {/* Enhanced Potential Diagnoses Section */}
                  {report.potentialDiagnoses && report.potentialDiagnoses.length > 0 && (
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border border-red-200 dark:border-red-800 rounded-xl p-6 shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg animate-pulse">
                          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-red-900 dark:text-red-100">Potential Health Conditions</h3>
                          <p className="text-sm text-red-700 dark:text-red-300">Based on your report values, you may be at risk for:</p>
                        </div>
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-red-100 dark:border-red-700">
                        <div className="flex flex-wrap gap-3">
                          {report.potentialDiagnoses.map((diagnosis: string, index: number) => (
                            <Badge key={index} variant="destructive" className="text-sm py-3 px-4 font-semibold shadow-md hover:shadow-lg transition-shadow">
                              {diagnosis}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {report.comparisonTable && report.comparisonTable.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Parameter</TableHead>
                            <TableHead className="font-semibold">Report Value</TableHead>
                            <TableHead className="font-semibold">Normal Range</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Effect</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {report.comparisonTable.map((row: any, index: number) => (
                            <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                              <TableCell className="font-medium">{row.parameter}</TableCell>
                              <TableCell>{row.reportValue}</TableCell>
                              <TableCell>{row.normalRange}</TableCell>
                              <TableCell>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant={getStatusColor(row.status)} className="cursor-help">
                                      {row.status}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{row.effect}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>
                              <TableCell className="text-sm">{row.effect}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : null}

                  {/* Enhanced Major Concerns Section */}
                  {report.majorConcerns && report.majorConcerns.length > 0 && (
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6 shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                          <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100">Critical Health Concerns</h3>
                          <p className="text-sm text-orange-700 dark:text-orange-300">Immediate attention required for these findings</p>
                        </div>
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-orange-100 dark:border-orange-700">
                        <ul className="space-y-3">
                          {report.majorConcerns.map((concern: string, index: number) => (
                            <li key={index} className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                              <div className="p-1 bg-orange-200 dark:bg-orange-800 rounded-full mt-0.5">
                                <AlertCircle className="h-3 w-3 text-orange-700 dark:text-orange-300" />
                              </div>
                              <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{concern}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {report.specialistConsultations && report.specialistConsultations.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Suggested Specialist Consultations
                      </h3>
                      <ul className="space-y-2">
                        {report.specialistConsultations.map((specialist: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-1">👨‍⚕️</span>
                            <span>{specialist}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {report.precautions && report.precautions.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Precautions
                      </h3>
                      <ul className="space-y-2">
                        {report.precautions.map((precaution: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-amber-600 dark:text-amber-400 mt-1">⚠️</span>
                            <span>{precaution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {report.recommendations && report.recommendations.length > 0 && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Recommendations</h3>
                      <ul className="space-y-2">
                        {report.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-primary mt-1">✓</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Enhanced Raw Analysis Section */}
                  {report.rawAnalysis && (
                    <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                          <Activity className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Detailed Analysis</h3>
                          <p className="text-sm text-slate-700 dark:text-slate-300">Comprehensive AI-generated health insights</p>
                        </div>
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100 leading-relaxed">{report.rawAnalysis}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
