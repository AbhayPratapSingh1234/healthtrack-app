import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Activity, Home, BookOpen, FileText, LogOut, User } from "lucide-react";
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

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

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
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      navigate("/");
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
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

          {user ? (
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
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all duration-300 hover:scale-105"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export { Navbar };
