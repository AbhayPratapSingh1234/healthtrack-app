import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Home, BookOpen, FileText, LogOut, ArrowLeft, Calendar, User, Clock, Share2, Bookmark, BookmarkCheck, Copy, MessageCircle } from "lucide-react";
import { useNavigate, useLocation, Link, useParams } from "react-router-dom";
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

const BlogPost = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savedPosts, setSavedPosts] = useState<number[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadSavedPosts();
    }
  }, [user]);

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

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "The blog post link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Unable to copy the link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const text = `Check out this blog post: ${post.title} - ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const loadSavedPosts = async () => {
    if (!user) return;
    try {
      const saved = localStorage.getItem(`savedPosts_${user.id}`);
      if (saved) {
        setSavedPosts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved posts:', error);
    }
  };

  const handleSavePost = async () => {
    if (!user || !post) return;

    const postId = post.id;
    const isSaved = savedPosts.includes(postId);
    let newSavedPosts;

    if (isSaved) {
      newSavedPosts = savedPosts.filter(id => id !== postId);
      toast({
        title: "Post unsaved",
        description: "The blog post has been removed from your saved posts.",
      });
    } else {
      newSavedPosts = [...savedPosts, postId];
      toast({
        title: "Post saved",
        description: "The blog post has been saved to your collection.",
      });
    }

    setSavedPosts(newSavedPosts);
    localStorage.setItem(`savedPosts_${user.id}`, JSON.stringify(newSavedPosts));
  };

  const blogPosts = [
    {
      id: 1,
      title: "Understanding Your Health Risk Assessment",
      excerpt: "Learn how our AI analyzes your health data to provide personalized risk assessments for diabetes, obesity, and hypertension.",
      date: "2024-01-15",
      author: "HealthTrack Team",
      readTime: "5 min read",
      content: `
        <h2>Introduction</h2>
        <p>Health risk assessment is a crucial tool in preventive healthcare. At HealthTrack, we use advanced AI algorithms to analyze your health data and provide personalized risk assessments for various conditions including diabetes, obesity, and hypertension.</p>

        <h2>How It Works</h2>
        <p>Our AI system takes into account multiple factors:</p>
        <ul>
          <li>Your age and gender</li>
          <li>Family medical history</li>
          <li>Current health metrics (weight, blood pressure, etc.)</li>
          <li>Lifestyle factors (exercise, diet, sleep)</li>
          <li>Previous health logs and trends</li>
        </ul>

        <h2>Understanding Your Results</h2>
        <p>The risk assessment provides you with:</p>
        <ul>
          <li><strong>Low Risk:</strong> Your current health indicators are within healthy ranges</li>
          <li><strong>Moderate Risk:</strong> Some areas need attention and lifestyle adjustments</li>
          <li><strong>High Risk:</strong> Immediate consultation with healthcare professionals recommended</li>
        </ul>

        <h2>Taking Action</h2>
        <p>Based on your assessment, HealthTrack provides personalized recommendations including:</p>
        <ul>
          <li>Dietary suggestions</li>
          <li>Exercise plans</li>
          <li>Health monitoring schedules</li>
          <li>When to seek professional medical advice</li>
        </ul>

        <h2>Regular Monitoring</h2>
        <p>Health risk assessment is not a one-time event. Regular monitoring helps track your progress and adjust recommendations as needed. We recommend reassessing your health risks every 3-6 months or whenever significant lifestyle changes occur.</p>
      `
    },
    {
      id: 2,
      title: "The Importance of Daily Health Logging",
      excerpt: "Discover why consistent health tracking is crucial for maintaining optimal health and preventing chronic conditions.",
      date: "2024-01-10",
      author: "Dr. Sarah Johnson",
      readTime: "7 min read",
      content: `
        <h2>Why Daily Health Logging Matters</h2>
        <p>In today's fast-paced world, it's easy to neglect our health until problems arise. Daily health logging serves as a proactive approach to maintaining wellness and preventing chronic conditions before they become serious issues.</p>

        <h2>The Power of Data</h2>
        <p>Your body generates valuable health data every day. By logging metrics such as:</p>
        <ul>
          <li>Blood pressure readings</li>
          <li>Weight and body measurements</li>
          <li>Sleep quality and duration</li>
          <li>Exercise and activity levels</li>
          <li>Diet and nutrition intake</li>
          <li>Energy levels and mood</li>
        </ul>
        <p>You create a comprehensive health profile that tells a story about your well-being.</p>

        <h2>Early Detection of Health Issues</h2>
        <p>Many health conditions develop gradually. Daily logging helps identify subtle changes that might indicate:</p>
        <ul>
          <li>Increasing blood pressure trends</li>
          <li>Gradual weight gain</li>
          <li>Declining sleep quality</li>
          <li>Reduced energy levels</li>
        </ul>

        <h2>Motivation and Accountability</h2>
        <p>Regular logging creates accountability and motivation. Seeing your progress over time encourages continued healthy behaviors and helps you stay committed to your health goals.</p>

        <h2>Personalized Insights</h2>
        <p>With consistent data collection, HealthTrack's AI can provide:</p>
        <ul>
          <li>Personalized health recommendations</li>
          <li>Trend analysis and predictions</li>
          <li>Goal setting and progress tracking</li>
          <li>Risk assessment updates</li>
        </ul>

        <h2>Making It Sustainable</h2>
        <p>To make daily logging sustainable:</p>
        <ul>
          <li>Set reminders for consistent timing</li>
          <li>Start with 2-3 key metrics</li>
          <li>Use mobile apps for easy logging</li>
          <li>Review your data weekly to stay motivated</li>
          <li>Celebrate small wins and improvements</li>
        </ul>

        <h2>The Long-Term Benefits</h2>
        <p>Consistent health logging leads to:</p>
        <ul>
          <li>Better health outcomes</li>
          <li>Reduced healthcare costs</li>
          <li>Increased lifespan</li>
          <li>Improved quality of life</li>
          <li>Greater control over your health destiny</li>
        </ul>
      `
    },
    {
      id: 3,
      title: "Nutrition Tips for Better Health Outcomes",
      excerpt: "Practical dietary recommendations based on your health profile and lifestyle factors.",
      date: "2024-01-05",
      author: "Nutrition Expert",
      readTime: "6 min read",
      content: `
        <h2>Personalized Nutrition Approach</h2>
        <p>Nutrition is not one-size-fits-all. Your dietary needs depend on your age, gender, activity level, health conditions, and goals. HealthTrack analyzes your profile to provide tailored nutrition recommendations.</p>

        <h2>Understanding Macronutrients</h2>
        <p>A balanced diet includes three main macronutrients:</p>
        <ul>
          <li><strong>Carbohydrates:</strong> Primary energy source (45-65% of daily calories)</li>
          <li><strong>Proteins:</strong> Building blocks for tissues (10-35% of daily calories)</li>
          <li><strong>Fats:</strong> Essential for hormone production and nutrient absorption (20-35% of daily calories)</li>
        </ul>

        <h2>Micronutrients Matter Too</h2>
        <p>Vitamins and minerals are crucial for optimal health:</p>
        <ul>
          <li>Vitamin D for bone health and immunity</li>
          <li>Iron for oxygen transport</li>
          <li>Calcium for bone and muscle function</li>
          <li>Magnesium for energy production</li>
          <li>Zinc for immune function</li>
        </ul>

        <h2>Meal Planning Strategies</h2>
        <p>Effective meal planning includes:</p>
        <ul>
          <li>Portion control based on your caloric needs</li>
          <li>Balanced meals with all food groups</li>
          <li>Hydration (aim for 8-10 glasses of water daily)</li>
          <li>Meal timing to maintain energy levels</li>
          <li>Snacks that support your health goals</li>
        </ul>

        <h2>Reading Food Labels</h2>
        <p>Understanding nutrition labels helps you make informed choices:</p>
        <ul>
          <li>Serving size vs. actual consumption</li>
          <li>Calories and macronutrient breakdown</li>
          <li>Added sugars and sodium content</li>
          <li>Ingredient list and quality</li>
        </ul>

        <h2>Special Dietary Considerations</h2>
        <p>Different health conditions require specific approaches:</p>
        <ul>
          <li><strong>Diabetes:</strong> Focus on low glycemic index foods and carbohydrate counting</li>
          <li><strong>Hypertension:</strong> Reduce sodium, increase potassium-rich foods</li>
          <li><strong>Weight Management:</strong> Caloric balance with nutrient-dense foods</li>
          <li><strong>Heart Health:</strong> Emphasize unsaturated fats and fiber</li>
        </ul>

        <h2>Supplements and When to Use Them</h2>
        <p>While whole foods are preferable, supplements can help fill nutritional gaps:</p>
        <ul>
          <li>Vitamin D if you have limited sun exposure</li>
          <li>Omega-3 fatty acids for heart health</li>
          <li>Calcium if dairy intake is low</li>
          <li>Probiotics for gut health</li>
        </ul>

        <h2>Sustainable Changes</h2>
        <p>Making lasting dietary changes:</p>
        <ul>
          <li>Start with small, achievable goals</li>
          <li>Focus on adding healthy foods rather than restricting</li>
          <li>Find enjoyable ways to prepare healthy meals</li>
          <li>Allow for occasional treats to maintain balance</li>
          <li>Track your intake to understand patterns</li>
        </ul>
      `
    },
    {
      id: 4,
      title: "Exercise and Physical Activity Guidelines",
      excerpt: "Evidence-based exercise recommendations tailored to different age groups and health conditions.",
      date: "2023-12-28",
      author: "Fitness Specialist",
      readTime: "8 min read",
      content: `
        <h2>The Importance of Regular Exercise</h2>
        <p>Physical activity is essential for maintaining health and preventing chronic diseases. Regular exercise improves cardiovascular health, strengthens muscles and bones, enhances mental health, and helps maintain a healthy weight.</p>

        <h2>Current Guidelines</h2>
        <p>Health organizations recommend:</p>
        <ul>
          <li><strong>Aerobic Activity:</strong> 150 minutes of moderate-intensity or 75 minutes of vigorous-intensity per week</li>
          <li><strong>Strength Training:</strong> 2 or more days per week, targeting all major muscle groups</li>
          <li><strong>Flexibility:</strong> Stretching activities at least 2-3 times per week</li>
          <li><strong>Balance:</strong> Activities to improve balance, especially important for older adults</li>
        </ul>

        <h2>Types of Exercise</h2>
        <p>A well-rounded fitness program includes:</p>
        <ul>
          <li><strong>Cardiovascular:</strong> Walking, running, cycling, swimming</li>
          <li><strong>Strength Training:</strong> Weight lifting, resistance bands, bodyweight exercises</li>
          <li><strong>Flexibility:</strong> Yoga, stretching, Pilates</li>
          <li><strong>Balance:</strong> Tai Chi, standing on one foot, heel-to-toe walk</li>
        </ul>

        <h2>Age-Appropriate Recommendations</h2>
        <h3>Young Adults (18-35)</h3>
        <ul>
          <li>Focus on building strength and cardiovascular fitness</li>
          <li>Incorporate high-intensity interval training (HIIT)</li>
          <li>Include sports and recreational activities</li>
        </ul>

        <h3>Middle Age (36-55)</h3>
        <ul>
          <li>Maintain muscle mass through strength training</li>
          <li>Include weight-bearing exercises for bone health</li>
          <li>Focus on joint-friendly activities</li>
        </ul>

        <h3>Older Adults (55+)</h3>
        <ul>
          <li>Emphasize balance and flexibility</li>
          <li>Include low-impact activities</li>
          <li>Focus on maintaining independence</li>
        </ul>

        <h2>Exercise with Health Conditions</h2>
        <h3>Heart Disease</h3>
        <ul>
          <li>Start slowly with medical supervision</li>
          <li>Focus on moderate-intensity activities</li>
          <li>Include cardiac rehabilitation programs</li>
        </ul>

        <h3>Diabetes</h3>
        <ul>
          <li>Monitor blood sugar before, during, and after exercise</li>
          <li>Include both aerobic and resistance training</li>
          <li>Carry fast-acting carbohydrates for emergencies</li>
        </ul>

        <h3>Arthritis</h3>
        <ul>
          <li>Choose low-impact activities like swimming or cycling</li>
          <li>Include range-of-motion exercises</li>
          <li>Use heat/cold therapy to manage joint pain</li>
        </ul>

        <h2>Getting Started</h2>
        <p>Begin your exercise journey:</p>
        <ul>
          <li>Consult with your healthcare provider</li>
          <li>Start with activities you enjoy</li>
          <li>Set realistic goals and track progress</li>
          <li>Find an exercise buddy for accountability</li>
          <li>Invest in proper equipment and comfortable clothing</li>
        </ul>

        <h2>Overcoming Barriers</h2>
        <p>Common challenges and solutions:</p>
        <ul>
          <li><strong>Time Constraints:</strong> Short 10-15 minute sessions throughout the day</li>
          <li><strong>Motivation:</strong> Set specific goals and reward achievements</li>
          <li><strong>Weather:</strong> Indoor alternatives like home workouts or gym memberships</li>
          <li><strong>Pain:</strong> Modify exercises or consult professionals</li>
        </ul>

        <h2>Tracking Progress</h2>
        <p>Monitor your fitness journey:</p>
        <ul>
          <li>Keep an exercise log</li>
          <li>Track measurements and strength gains</li>
          <li>Note improvements in energy and mood</li>
          <li>Reassess goals every 4-6 weeks</li>
        </ul>

        <h2>Safety First</h2>
        <p>Exercise safely by:</p>
        <ul>
          <li>Warming up before and cooling down after workouts</li>
          <li>Using proper form to prevent injury</li>
          <li>Staying hydrated and fueling properly</li>
          <li>Listening to your body and resting when needed</li>
          <li>Seeking professional guidance when starting new programs</li>
        </ul>
      `
    }
  ];

  const post = blogPosts.find(p => p.id === parseInt(id || '1'));

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

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
          <Button onClick={() => navigate('/blog')}>Back to Blog</Button>
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
          <Link to="/blog" className="inline-flex items-center gap-2 text-primary hover:underline transition-all duration-300 hover:scale-105">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>

        {/* Blog Post */}
        <div className="max-w-4xl mx-auto">
          <Card className="animate-fade-in shadow-2xl border-0 bg-background/95 backdrop-blur">
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between mb-6">
                <div className="h-16 w-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-pulse-glow">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="hover:bg-primary/10">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 shadow-xl border-0 bg-background/95 backdrop-blur">
                      <DropdownMenuItem onClick={handleCopyLink} className="hover:bg-primary/10 transition-colors">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleWhatsAppShare} className="hover:bg-primary/10 transition-colors">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Share on WhatsApp
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-primary/10"
                    onClick={handleSavePost}
                  >
                    {savedPosts.includes(post.id) ? (
                      <BookmarkCheck className="h-4 w-4 mr-2 text-black" />
                    ) : (
                      <Bookmark className="h-4 w-4 mr-2" />
                    )}
                    {savedPosts.includes(post.id) ? 'Saved' : 'Save'}
                  </Button>
                </div>
              </div>

              <CardTitle className="text-4xl font-bold mb-4 leading-tight">
                {post.title}
              </CardTitle>

              <CardDescription className="flex flex-wrap items-center gap-4 text-sm">
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
                <span className="flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-full">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="font-medium">{post.readTime}</span>
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <div
                className="prose prose-lg max-w-none prose-headings:text-primary prose-headings:font-bold prose-p:text-muted-foreground prose-p:leading-relaxed prose-ul:text-muted-foreground prose-li:marker:text-primary"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BlogPost;
