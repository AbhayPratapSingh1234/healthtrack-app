import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Home, BookOpen, FileText, LogOut, ArrowLeft, User } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const About = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/auth");
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-pulse mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-accent/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <g fill="none" fillRule="evenodd">
            <g fill="#9C92AC" fillOpacity="0.05">
              <circle cx="30" cy="30" r="2"/>
            </g>
          </g>
        </svg>
      </div>

      {/* Navbar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg relative z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-all duration-300 hover:scale-105">
              <Activity className="h-6 w-6 text-primary animate-pulse-glow" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">HealthTrack</span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Button
              variant={location.pathname === "/" ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/")}
              className={`transition-all duration-300 hover:scale-105 ${location.pathname === "/" ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg" : "hover:bg-primary/10"}`}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button
              variant={location.pathname === "/about" ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/about")}
              className={`transition-all duration-300 hover:scale-105 ${location.pathname === "/about" ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg" : "hover:bg-primary/10"}`}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              About
            </Button>
            <Button
              variant={location.pathname === "/blog" ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/blog")}
              className={`transition-all duration-300 hover:scale-105 ${location.pathname === "/blog" ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg" : "hover:bg-primary/10"}`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Blog
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:scale-110 transition-all duration-300 hover:shadow-lg">
                  <Avatar className="ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-xl border-0 bg-background/95 backdrop-blur">
                <DropdownMenuLabel className="text-primary font-semibold">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {user?.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile?mode=create")} className="hover:bg-primary/10 transition-colors">
                  <User className="h-4 w-4 mr-2" />
                  Create Your Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile?mode=view")} className="hover:bg-primary/10 transition-colors">
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="hover:bg-destructive/10 transition-colors">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* Back Button */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline transition-all duration-300 hover:scale-105">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* About Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="animate-fade-in shadow-2xl border-0 bg-background/95 backdrop-blur hover:shadow-3xl transition-all duration-500">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
                About HealthTrack
              </CardTitle>
              <CardDescription className="text-xl text-muted-foreground">
                Your comprehensive health monitoring platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <p className="text-muted-foreground leading-relaxed text-lg text-center max-w-2xl mx-auto">
                HealthTrack is your comprehensive health monitoring platform designed to help you
                stay ahead of potential health risks. Our AI-powered system analyzes your health
                data to provide personalized insights and recommendations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8 mt-12">
                <div className="animate-slide-in-left space-y-4 p-6 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <h3 className="text-2xl font-semibold text-primary">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To empower individuals with the knowledge and tools they need to maintain optimal health
                    through proactive monitoring and personalized guidance.
                  </p>
                </div>

                <div className="animate-slide-in-right space-y-4 p-6 rounded-xl bg-gradient-to-br from-accent/5 to-primary/5 hover:from-accent/10 hover:to-primary/10 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <h3 className="text-2xl font-semibold text-accent">How It Works</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our platform combines advanced AI technology with comprehensive health tracking to
                    deliver actionable insights tailored to your unique health profile.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/10 hover:from-primary/10 hover:to-secondary/20 transition-all duration-300 hover:scale-105 hover:shadow-xl group">
                  <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow group-hover:animate-bounce-gentle">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-primary">Risk Assessment</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Comprehensive health risk analysis based on your metrics
                  </p>
                </div>

                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-accent/5 to-secondary/10 hover:from-accent/10 hover:to-secondary/20 transition-all duration-300 hover:scale-105 hover:shadow-xl group">
                  <div className="h-16 w-16 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow group-hover:animate-bounce-gentle">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-accent">Daily Tracking</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Log your daily health metrics and track progress over time
                  </p>
                </div>

                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-warning/5 to-secondary/10 hover:from-warning/10 hover:to-secondary/20 transition-all duration-300 hover:scale-105 hover:shadow-xl group">
                  <div className="h-16 w-16 bg-gradient-to-br from-warning to-warning/80 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow group-hover:animate-bounce-gentle">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-warning">AI Recommendations</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Get personalized health advice powered by advanced AI
                  </p>
                </div>
              </div>

              <div className="mt-12 p-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl">
                <h3 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Get Started Today</h3>
                <p className="text-muted-foreground mb-6 text-center leading-relaxed">
                  Join thousands of users who are taking control of their health with HealthTrack.
                </p>
                <div className="text-center">
                  <Button
                    size="lg"
                    onClick={() => navigate("/questionnaire")}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse-glow"
                  >
                    Start Your Health Assessment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default About;
