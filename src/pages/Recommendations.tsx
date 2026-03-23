import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, ArrowLeft, LogOut, Sparkles, Heart, Zap, Target, Home } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const buildHealthContext = (healthData: any, logs: any[], goals: any[]): string => {
    let context = `Health Profile:\n`;
    context += `- Age: ${healthData.age}\n`;
    context += `- Gender: ${healthData.gender}\n`;
    context += `- BMI: ${healthData.bmi?.toFixed(1)}\n`;
    context += `- Current Weight: ${healthData.weight} kg\n\n`;

    context += `Risk Assessment:\n`;
    context += `- Diabetes Risk: ${healthData.diabetes_risk}%\n`;
    context += `- Obesity Risk: ${healthData.obesity_risk}%\n`;
    context += `- Hypertension Risk: ${healthData.hypertension_risk}%\n\n`;

    context += `Lifestyle:\n`;
    context += `- Exercise: ${healthData.exercise_frequency}\n`;
    context += `- Diet Type: ${healthData.diet_type}\n`;
    context += `- Smoking: ${healthData.smoking_status}\n`;
    context += `- Alcohol: ${healthData.alcohol_consumption}\n`;
    context += `- Sleep: ${healthData.sleep_hours} hours\n\n`;

    if (logs && logs.length > 0) {
      context += `Recent Health Logs (last ${logs.length} days):\n`;
      logs.forEach((log: any) => {
        context += `- ${log.log_date}: Weight ${log.weight}kg`;
        if (log.blood_pressure_systolic) {
          context += `, BP ${log.blood_pressure_systolic}/${log.blood_pressure_diastolic}`;
        }
        if (log.exercise_minutes) {
          context += `, Exercise ${log.exercise_minutes}min`;
        }
        context += `\n`;
      });
      context += `\n`;
    }

    if (goals && goals.length > 0) {
      context += `Health Goals:\n`;
      goals.forEach((goal: any) => {
        context += `- ${goal.goal_type}: Target ${goal.target_value}`;
        if (goal.current_value) {
          context += ` (Current: ${goal.current_value})`;
        }
        context += `\n`;
      });
      context += `\n`;
    }

    context += `Please provide personalized recommendations for:\n`;
    context += `1. Diet and nutrition\n`;
    context += `2. Exercise and physical activity\n`;
    context += `3. Lifestyle improvements\n`;
    context += `Focus on the highest risk areas and be specific with actionable steps.`;

    return context;
  };

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch user's health assessment
      const { data: assessment } = await supabase
        .from("health_assessments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!assessment) {
        toast({
          title: "No Assessment Found",
          description: "Please complete your health assessment first.",
          variant: "destructive",
        });
        return;
      }

      // Fetch recent logs
      const { data: logs } = await supabase
        .from("daily_health_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("log_date", { ascending: false })
        .limit(7);

      // Fetch goals
      const { data: goals } = await supabase
        .from("health_goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active");

      // Build context for AI
      const context = buildHealthContext(assessment, logs || [], goals || []);

      // Call OpenRouter API directly
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
"Authorization": "Bearer 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",
          "HTTP-Referer": window.location.origin,
          "X-Title": "HealthTrack",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
"model": "stepfun/step-3.5-flash:free",
          "messages": [
            {
              "role": "system",
              "content": "You are a professional health advisor. Provide personalized, actionable health recommendations based on the user's health data. Focus on diet, exercise, and lifestyle changes. Be supportive and encouraging. Keep recommendations specific and practical.",
            },
            {
              "role": "user",
              "content": context,
            },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limits exceeded, please try again later.");
        }
        if (response.status === 402) {
          throw new Error("Payment required, please add funds to your OpenRouter account.");
        }
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error(`AI gateway error: ${errorText || response.status}`);
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Invalid response structure:", data);
        throw new Error("Invalid AI response structure");
      }
      const recommendations = data.choices[0].message.content;

      setRecommendations(recommendations);
    } catch (error: any) {
      console.error("Error generating recommendations:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">HealthTrack</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">AI Health Recommendations</h1>
          <p className="text-muted-foreground">Get personalized health advice based on your data</p>
        </div>

        {!recommendations ? (
          <Card className="p-12 text-center relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 animate-bounce" style={{ animationDelay: '0s' }}>
                <Heart className="h-8 w-8 text-red-400" />
              </div>
              <div className="absolute top-8 right-8 animate-bounce" style={{ animationDelay: '1s' }}>
                <Zap className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="absolute bottom-8 left-8 animate-bounce" style={{ animationDelay: '2s' }}>
                <Target className="h-7 w-7 text-green-400" />
              </div>
              <div className="absolute bottom-4 right-4 animate-bounce" style={{ animationDelay: '0.5s' }}>
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
            </div>

            <div className="relative z-10">
              <div className="animate-pulse">
                <Sparkles className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <h2 className="text-2xl font-bold mb-4 animate-fade-in">Generate Your Personalized Plan</h2>
              <p className="text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Our AI will analyze your health data, recent logs, and goals to create personalized recommendations for
                diet, exercise, and lifestyle improvements.
              </p>
              <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Button onClick={generateRecommendations} size="lg" disabled={loading} className="animate-pulse hover:animate-none">
                  {loading ? "Analyzing..." : "Generate Recommendations"}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-8 relative overflow-hidden">
              {/* Success animation overlay */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-2 right-2 animate-ping">
                  <Heart className="h-4 w-4 text-red-500" />
                </div>
                <div className="absolute bottom-2 left-2 animate-ping" style={{ animationDelay: '1s' }}>
                  <Zap className="h-4 w-4 text-yellow-500" />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 relative z-10">
                <div className="animate-bounce">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold animate-fade-in">Your Personalized Recommendations</h2>
              </div>
              <div className="space-y-4 relative z-10">
                {recommendations.split('---').map((section, index) => (
                  <div key={index} className="bg-card border rounded-lg p-4">
                    {section.split('\n').map((line, lineIndex) => {
                      if (line.startsWith('### ')) {
                        return (
                          <h3 key={lineIndex} className="text-lg font-bold text-primary mb-3">
                            {line.replace('### ', '').replace(/\*\*/g, '')}
                          </h3>
                        );
                      }
                      if (line.startsWith('#### ')) {
                        return (
                          <h4 key={lineIndex} className="text-base font-bold text-red-600 mb-3">
                            {line.replace('#### ', '').replace(/\*\*/g, '')}
                          </h4>
                        );
                      }
                      if (line.startsWith('**') && line.includes(':**')) {
                        return (
                          <h4 key={lineIndex} className="text-base font-bold text-green-600 mb-2">
                            {line.replace(/\*\*/g, '')}
                          </h4>
                        );
                      }
                      if (line.includes('*(Focus:')) {
                        const focusText = line.match(/\*\(Focus: (.*?)\)\*/)?.[1];
                        if (focusText) {
                          return (
                            <div key={lineIndex} className="text-black font-medium mb-3 text-sm">
                              Focus: {focusText}
                            </div>
                          );
                        }
                      }
                      if (line.startsWith('*Action*')) {
                        return (
                          <div key={lineIndex} className="text-black font-bold mb-2 text-sm">
                            Action
                          </div>
                        );
                      }
                      if (line.startsWith('- ')) {
                        const content = line.substring(2);
                        const parts = content.split(/(\*\*.*?\*\*)/g);
                        return (
                          <div key={lineIndex} className="flex items-start gap-2 mb-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span className="text-sm text-foreground">
                              {parts.map((part, partIndex) =>
                                part.startsWith('**') && part.endsWith('**') ? (
                                  <strong key={partIndex} className="font-bold text-foreground">
                                    {part.slice(2, -2)}
                                  </strong>
                                ) : (
                                  part
                                )
                              )}
                            </span>
                          </div>
                        );
                      }
                      if (line.trim() === '') {
                        return null;
                      }
                      const parts = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <p key={lineIndex} className="text-sm text-muted-foreground mb-2">
                          {parts.map((part, partIndex) =>
                            part.startsWith('**') && part.endsWith('**') ? (
                              <strong key={partIndex} className="font-bold text-foreground">
                                {part.slice(2, -2)}
                              </strong>
                            ) : (
                              part
                            )
                          )}
                        </p>
                      );
                    })}
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex justify-center">
              <Button
                onClick={generateRecommendations}
                variant="outline"
                disabled={loading}
                className="animate-pulse hover:animate-none transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center gap-2">
                  <div className="animate-spin" style={{ animationDuration: loading ? '1s' : '0s' }}>
                    <Sparkles className="h-4 w-4" />
                  </div>
                  {loading ? "Regenerating..." : "Regenerate Recommendations"}
                </div>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
