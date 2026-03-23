import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText, Sparkles, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const GeneralReportAnalysisResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inDiseasesSection, setInDiseasesSection] = useState(false);

  const { analysis, fileName, fileType } = location.state || {};

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
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 animate-pulse mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <header className="container mx-auto px-4 py-6 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <FileText className="h-8 w-8 text-primary" />
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
              Sign Out
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">No Analysis Found</h1>
          <p className="text-muted-foreground mb-8">
            It seems you haven't uploaded a document for analysis yet.
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <FileText className="h-8 w-8 text-primary" />
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
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Document Analysis Results</h1>
          <p className="text-muted-foreground">
            AI-powered analysis of your uploaded document: <strong>{fileName}</strong>
          </p>
        </div>

        <Card className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Analysis Summary</h2>
          </div>

          <div className="space-y-4">
            {analysis.split('\n').map((line, index) => {
              // Skip table separator lines (lines with only | and -)
              if (line.trim().match(/^[\s\|:-]+$/)) {
                return null;
              }
              // Specifically skip the mentioned separator line
              if (line.trim() === '|-------------------|-------------------|-----------------|--') {
                return null;
              }

              // Handle table rows (lines starting with | but not separator lines)
              if (line.trim().startsWith('|') && line.includes('|') && !line.includes('---') && !line.includes(':--')) {
                const cells = line.split('|').filter(cell => cell.trim() !== '');
                if (cells.length >= 4) {
                  return (
                    <div key={index} className="grid grid-cols-4 gap-2 p-3 bg-muted/50 rounded-lg border">
                      <div className="font-semibold text-primary">{cells[0]?.trim()}</div>
                      <div className="text-green-600 font-medium">{cells[1]?.trim()}</div>
                      <div className="text-blue-600">{cells[2]?.trim()}</div>
                      <div className="text-orange-600 font-medium">{cells[3]?.trim()}</div>
                    </div>
                  );
                }
              }

              // Handle table headers (usually the first row with Metric, Normal Range, etc.)
              if (line.includes('Metric') && line.includes('Normal Range') && line.includes('Current') && line.includes('Variance')) {
                return (
                  <div key={index} className="grid grid-cols-4 gap-2 p-3 bg-primary/10 rounded-lg border-2 border-primary/20 font-bold">
                    <div className="text-primary">Metric</div>
                    <div className="text-primary">Normal Range</div>
                    <div className="text-primary">Current Health Status</div>
                    <div className="text-primary">Variance</div>
                  </div>
                );
              }

              // Handle main headings (### )
              if (line.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-lg font-bold text-primary mb-3 mt-6">
                    {line.replace('### ', '').replace(/\*\*/g, '')}
                  </h3>
                );
              }

              // Handle DISEASES section (DISEASES)
              if (line.startsWith('DISEASES')) {
                setInDiseasesSection(true);
                return (
                  <div key={index} className="bg-red-100 border-l-4 border-red-500 p-4 mb-4 rounded-r-lg">
                    <h4 className="text-lg font-bold text-black mb-2">
                      DISEASES
                    </h4>
                  </div>
                );
              }

              // Reset diseases section flag when we hit other headings
              if (line.startsWith('### ') || (line.startsWith('#### ') && !line.startsWith('#### DISEASES'))) {
                setInDiseasesSection(false);
              }

              // Handle other sub headings (#### )
              if (line.startsWith('#### ')) {
                return (
                  <h4 key={index} className="text-base font-bold text-red-600 mb-3">
                    {line.replace('#### ', '').replace(/\*\*/g, '')}
                  </h4>
                );
              }

              // Handle bold text with ** **
              if (line.includes('**') && line.trim() !== '') {
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                  <p key={index} className="text-sm text-foreground mb-2">
                    {parts.map((part, partIndex) =>
                      part.startsWith('**') && part.endsWith('**') ? (
                        <strong key={partIndex} className={`font-bold ${inDiseasesSection ? 'text-red-600 bg-red-100 px-1 rounded' : 'text-foreground'}`}>
                          {part.slice(2, -2)}
                        </strong>
                      ) : (
                        part
                      )
                    )}
                  </p>
                );
              }

              // Handle bullet points (- )
              if (line.startsWith('- ')) {
                const content = line.substring(2);
                const parts = content.split(/(\*\*.*?\*\*)/g);
                return (
                  <div key={index} className="flex items-start gap-2 mb-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-sm text-foreground">
                      {parts.map((part, partIndex) =>
                        part.startsWith('**') && part.endsWith('**') ? (
                          <strong key={partIndex} className={`font-bold ${inDiseasesSection ? 'text-red-600 bg-red-100 px-1 rounded' : 'text-foreground'}`}>
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

              // Handle empty lines
              if (line.trim() === '') {
                return <div key={index} className="h-2"></div>;
              }

              // Regular text
              const parts = line.split(/(\*\*.*?\*\*)/g);
              return (
                <p key={index} className="text-sm text-muted-foreground mb-2">
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
        </Card>

        <div className="flex justify-center mt-8">
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Upload Another Document
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GeneralReportAnalysisResult;
