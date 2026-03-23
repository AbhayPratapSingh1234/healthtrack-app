import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Auth from "./pages/Auth";
import Questionnaire from "./pages/Questionnaire";
import Dashboard from "./pages/Dashboard";
import LogHealth from "./pages/LogHealth";
import Progress from "./pages/Progress";
import Recommendations from "./pages/Recommendations";
import Goals from "./pages/Goals";
import AssessmentReport from "./pages/AssessmentReport";
import ReportAnalysisResult from "./pages/ReportAnalysisResult";
import GeneralReportAnalysisResult from "./pages/GeneralReportAnalysisResult";
import Profile from "./pages/Profile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import SystemReports from "./pages/SystemReports";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/questionnaire" element={<Questionnaire />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/log" element={<LogHealth />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/assessment-report" element={<AssessmentReport />} />
              <Route path="/report-analysis" element={<ReportAnalysisResult />} />
              <Route path="/general-report-analysis" element={<GeneralReportAnalysisResult />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/reports" element={<SystemReports />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
