import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ReportReader = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image (JPG, PNG, WEBP) or PDF file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setFileName(file.name);
    setFileType(file.type);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = () => {
        const base64Data = reader.result as string;
        setFileData(base64Data);
        setUploading(false);
        toast({
          title: "File uploaded",
          description: "Click 'Analyze Report' to generate your personalized health insights",
        });
      };

      reader.onerror = () => {
        setUploading(false);
        toast({
          title: "Upload failed",
          description: "Failed to read the file. Please try again.",
          variant: "destructive",
        });
      };
    } catch (error: any) {
      setUploading(false);
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = () => {
    if (!fileData) return;
    
    navigate("/report-analysis", {
      state: {
        fileData,
        fileName,
        fileType,
      },
    });
  };

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          AI Report Reader
        </CardTitle>
        <CardDescription>
          Upload your health reports, x-rays, or medical documents for AI-powered analysis in simple language
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              id="report-upload"
              accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <label
              htmlFor="report-upload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <p className="text-lg font-medium">Uploading...</p>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we process your document
                  </p>
                </>
              ) : (
                <>
                  <FileUp className="h-12 w-12 text-primary" />
                  <p className="text-lg font-medium">Click to upload your report</p>
                  <p className="text-sm text-muted-foreground">
                    Supports: JPG, PNG, WEBP, PDF (Max 10MB)
                  </p>
                </>
              )}
            </label>
          </div>
          {fileData && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">File ready: {fileName}</p>
              <Button onClick={handleAnalyze} className="w-full sm:w-auto">
                Analyze Report
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
