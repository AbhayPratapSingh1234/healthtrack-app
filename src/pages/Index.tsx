import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Home, BookOpen, FileText, LogOut, User, Heart, Shield, TrendingUp, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { HealthChatbot } from "@/components/HealthChatbot";
import { ReportReader } from "@/components/ReportReader";
import { GeneralReportReader } from "@/components/GeneralReportReader";
import QRCodeDownload from "@/components/QRCodeDownload";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } else {
        setUser(session?.user || null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    }

    // Always set loading to false after a reasonable timeout to prevent infinite loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navbar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">HealthTrack</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Button
              variant={location.pathname === "/" ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/")}
              className={location.pathname === "/" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button
              variant={location.pathname === "/about" ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/about")}
              className={location.pathname === "/about" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              About
            </Button>
            <Button
              variant={location.pathname === "/blog" ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/blog")}
              className={location.pathname === "/blog" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <FileText className="h-4 w-4 mr-2" />
              Blog
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    {user?.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile?mode=create")}>
                    <User className="h-4 w-4 mr-2" />
                    Create Your Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile?mode=view")}>
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/auth")}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Signup
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSheetOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-6">
            <Button
              variant={location.pathname === "/" ? "default" : "ghost"}
              onClick={() => {
                navigate("/");
                setIsSheetOpen(false);
              }}
              className="justify-start"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button
              variant={location.pathname === "/about" ? "default" : "ghost"}
              onClick={() => {
                navigate("/about");
                setIsSheetOpen(false);
              }}
              className="justify-start"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              About
            </Button>
            <Button
              variant={location.pathname === "/blog" ? "default" : "ghost"}
              onClick={() => {
                navigate("/blog");
                setIsSheetOpen(false);
              }}
              className="justify-start"
            >
              <FileText className="h-4 w-4 mr-2" />
              Blog
            </Button>

            <Separator />

            {user ? (
              <>
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  {user?.email}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate("/profile?mode=create");
                    setIsSheetOpen(false);
                  }}
                  className="justify-start"
                >
                  <User className="h-4 w-4 mr-2" />
                  Create Your Profile
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate("/profile?mode=view");
                    setIsSheetOpen(false);
                  }}
                  className="justify-start"
                >
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </Button>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await handleSignOut();
                    setIsSheetOpen(false);
                  }}
                  className="justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate("/auth");
                    setIsSheetOpen(false);
                  }}
                  className="justify-start"
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    navigate("/auth");
                    setIsSheetOpen(false);
                  }}
                  className="justify-start bg-blue-600 hover:bg-blue-700"
                >
                  Signup
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12 animate-slide-in-left">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Heart className="h-12 w-12 text-red-500 animate-bounce-gentle" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {user ? "Welcome to Your Health Dashboard" : "Welcome to HealthTrack"}
            </h1>
            <Shield className="h-12 w-12 text-green-500 animate-bounce-gentle" style={{ animationDelay: '0.5s' }} />
          </div>
          {user ? (
            <div className="flex items-center justify-center gap-2 mb-4">
              <Activity className="h-8 w-8 text-blue-500 animate-pulse-glow" />
              <span className="text-lg font-medium text-muted-foreground">You're logged in and ready to track your health!</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-4">
              <Activity className="h-8 w-8 text-blue-500 animate-pulse-glow" />
              <span className="text-lg font-medium text-muted-foreground">Start your health journey today!</span>
            </div>
          )}
          <p className="text-xl text-muted-foreground animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
            {user ? "Track your health journey and get personalized insights" : "Monitor your health, get AI-powered insights, and stay ahead of potential risks"}
          </p>
        </div>

        {user ? (
          <>
            {/* Assessment Card */}
            <div className="max-w-2xl mx-auto mb-8 animate-slide-in-left" style={{ animationDelay: '0.6s' }}>
              <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 transition-transform duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                    Start Your Health Assessment
                  </CardTitle>
                  <CardDescription>
                    Take our comprehensive health questionnaire to get personalized recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                    onClick={() => navigate("/questionnaire")}
                  >
                    Begin Assessment
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Report Reader Card */}
            <div className="max-w-2xl mx-auto mb-12 animate-slide-in-right" style={{ animationDelay: '0.9s' }}>
              <ReportReader />
            </div>
          </>
        ) : (
          /* Landing Content for Non-Authenticated Users */
          <div className="max-w-4xl mx-auto mb-12 animate-slide-in-left" style={{ animationDelay: '0.6s' }}>
            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                  Get Started with HealthTrack
                </CardTitle>
                <CardDescription>
                  Join thousands of users who are taking control of their health with AI-powered insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                  onClick={() => navigate("/auth")}
                >
                  Create Your Free Account
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* About Section */}
        <div className="max-w-4xl mx-auto animate-slide-in-left" style={{ animationDelay: '1.2s' }}>
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl">About HealthTrack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                HealthTrack is your comprehensive health monitoring platform designed to help you
                stay ahead of potential health risks. Our AI-powered system analyzes your health
                data to provide personalized insights and recommendations.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div className="text-center p-4 transform hover:scale-105 transition-transform duration-300 animate-slide-in-left" style={{ animationDelay: '1.5s' }}>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce-gentle">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Risk Assessment</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive health risk analysis based on your metrics
                  </p>
                </div>

                <div className="text-center p-4 transform hover:scale-105 transition-transform duration-300 animate-slide-in-right" style={{ animationDelay: '1.7s' }}>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce-gentle" style={{ animationDelay: '1s' }}>
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Daily Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Log your daily health metrics and track progress over time
                  </p>
                </div>

                <div className="text-center p-4 transform hover:scale-105 transition-transform duration-300 animate-slide-in-left" style={{ animationDelay: '1.9s' }}>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce-gentle" style={{ animationDelay: '1.5s' }}>
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">AI Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    Get personalized health advice powered by advanced AI
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Download Section */}
        <div className="max-w-4xl mx-auto mt-12 animate-slide-in-left" style={{ animationDelay: '2.2s' }}>
          <QRCodeDownload />
        </div>
      </main>

      {user && (
        <>
          <HealthChatbot />
          <GeneralReportReader />
        </>
      )}
    </div>
  );
};

export default Index;
