import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Home, BookOpen, FileText, LogOut, ArrowLeft, Calendar, User } from "lucide-react";
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

const Blog = () => {
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

  const blogPosts = [
    {
      id: 1,
      title: "Understanding Your Health Risk Assessment",
      excerpt: "Learn how our AI analyzes your health data to provide personalized risk assessments for diabetes, obesity, and hypertension.",
      date: "2024-01-15",
      author: "HealthTrack Team",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "The Importance of Daily Health Logging",
      excerpt: "Discover why consistent health tracking is crucial for maintaining optimal health and preventing chronic conditions.",
      date: "2024-01-10",
      author: "Dr. Sarah Johnson",
      readTime: "7 min read"
    },
    {
      id: 3,
      title: "Nutrition Tips for Better Health Outcomes",
      excerpt: "Practical dietary recommendations based on your health profile and lifestyle factors.",
      date: "2024-01-05",
      author: "Nutrition Expert",
      readTime: "6 min read"
    },
    {
      id: 4,
      title: "Exercise and Physical Activity Guidelines",
      excerpt: "Evidence-based exercise recommendations tailored to different age groups and health conditions.",
      date: "2023-12-28",
      author: "Fitness Specialist",
      readTime: "8 min read"
    }
  ];

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

        {/* Blog Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            HealthTrack Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Insights, tips, and expert advice for better health
          </p>
          <div className="mt-6 flex justify-center">
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-accent rounded-full"></div>
          </div>
        </div>

        {/* Blog Posts */}
        <div className="max-w-5xl mx-auto space-y-12">
          {blogPosts.map((post, index) => (
            <Card
              key={post.id}
              className={`animate-fade-in hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border-0 bg-background/95 backdrop-blur hover:bg-background/100 group ${
                index % 2 === 0 ? 'animate-slide-in-left' : 'animate-slide-in-right'
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center group-hover:animate-bounce-gentle">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                      Health Tips
                    </span>
                    <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full border border-accent/20">
                      {post.readTime}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-3xl hover:text-primary cursor-pointer transition-colors duration-300 group-hover:text-primary/80 leading-tight">
                  {post.title}
                </CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-4 text-sm mt-4">
                  <span className="flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-full">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">{new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </span>
                  <span className="flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-full">
                    <User className="h-4 w-4 text-accent" />
                    <span className="font-medium">{post.author}</span>
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="group/btn hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105 border-primary/30 hover:border-primary"
                    onClick={() => navigate(`/blog/${post.id}`)}
                  >
                    <span className="mr-2">Read More</span>
                    <ArrowLeft className="h-4 w-4 rotate-180 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Featured</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="max-w-3xl mx-auto mt-20 animate-fade-in" style={{ animationDelay: '1s' }}>
          <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-2 border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 h-16 w-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-pulse-glow">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                Stay Updated
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Subscribe to our newsletter for the latest health tips and insights
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse-glow text-lg"
              >
                Subscribe to Newsletter
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Join 10,000+ health enthusiasts • No spam, unsubscribe anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Blog;
