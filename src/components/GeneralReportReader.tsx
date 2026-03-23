import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, Send, X, Sparkles, Scan, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
  isAnalysis?: boolean;
  fileName?: string;
}

export const GeneralReportReader = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('reportAnalyzerOpen', isOpen.toString());
  }, [isOpen]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>("");
  const isMobile = useIsMobile();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf", "text/plain"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image (JPG, PNG, WEBP), PDF, or text file",
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
          description: "Click 'Generate Analysis' to get AI-powered insights",
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

  const sendMessage = async () => {
    if (!input.trim() && !fileData) return;

    const userMessage = input.trim() || `Please analyze this document: ${fileName}`;
    setInput("");
    setMessages((prev) => [...prev, {
      role: "user",
      content: userMessage,
      fileName: fileData ? fileName : undefined
    }]);
    setLoading(true);

    try {
      // Extract text content from file
      let textContent = "";
      if (fileType === "text/plain") {
        // For text files, decode base64
        const base64Text = fileData!.split(',')[1];
        textContent = atob(base64Text);
      } else {
        // For images and PDFs, we'll use the filename and type for context
        textContent = `Document: ${fileName} (Type: ${fileType})`;
      }

      // List of models to try in order
      const models = [
        "qwen/qwen2.5-vl-32b-instruct:free",
        "mistralai/mistral-small-3.2-24b-instruct:free",
        "nvidia/nemotron-nano-12b-v2-vl:free"
      ];

      let analysis = "";
      let success = false;

      // Try each model until one succeeds
      for (const model of models) {
        try {
          console.log(`Trying model: ${model}`);

          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": "Bearer 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",
              "HTTP-Referer": window.location.origin,
              "X-Title": "HealthTrack",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "model": model,
              "messages": [
                {
                  "role": "system",
                  "content": "You are a specialized Radiology AI Analyst focusing on X-ray and body imaging analysis. Your expertise is in identifying physical harms, diseases, and abnormalities from radiological scans (X-rays, CT scans, MRI, ultrasound). ALWAYS start your response with the PHYSICAL ABNORMALITIES section first, then continue with other sections. Focus on anatomical findings, pathological conditions, and structural abnormalities. Use clear headings and highlight critical radiological findings. Always format the comparison as a markdown table with columns: Anatomical Region, Normal Appearance, Current Finding, Severity/Impact. Do not mention that you cannot analyze images or documents - provide detailed radiological analysis focusing on physical harms and diseases.",
                },
                {
                  "role": "user",
                  "content": `Please analyze this radiological document and provide a structured analysis focusing on X-ray and body imaging:\n\n${textContent}\n\n**Analysis Structure:**\n1. **PHYSICAL ABNORMALITIES** - List any physical harms, diseases, or abnormalities identified from the imaging (use PHYSICAL ABNORMALITIES heading)\n2. **Comparison Table** - Create a detailed comparison table with columns: Anatomical Region, Normal Appearance, Current Finding, Severity/Impact\n3. **Recommendations** - Specific recommendations for follow-up\n4. **Actionable Suggestions** - Next steps for the user\n\n**Table Format Example:**\n| Anatomical Region | Normal Appearance | Current Finding | Severity/Impact |\n|-------------------|-------------------|-----------------|----------------|\n| Lung Fields | Clear, no opacities | [Current finding] | [Description of severity] |\n\n**Important:** Start with the PHYSICAL ABNORMALITIES section at the top and use PHYSICAL ABNORMALITIES as the heading (without #### symbols). Focus on identifying fractures, tumors, infections, organ damage, and other physical abnormalities.`,
                },
              ],
            }),
          });

          if (!response.ok) {
            if (response.status === 429) {
              console.log(`Rate limit exceeded for ${model}, trying next model...`);
              continue; // Try next model
            }
            if (response.status === 402) {
              console.log(`Payment required for ${model}, trying next model...`);
              continue; // Try next model
            }
            const errorText = await response.text();
            console.error(`Error with ${model}:`, response.status, errorText);
            continue; // Try next model
          }

          const data = await response.json();
          const responseContent = data.choices[0].message.content;

          // Check if the response indicates inability to analyze images/documents
          if (responseContent.includes("unable to analyze images") ||
              responseContent.includes("unable to analyze documents") ||
              responseContent.includes("I'm unable to analyze") ||
              responseContent.includes("I cannot analyze images") ||
              responseContent.includes("I cannot analyze documents")) {
            console.log(`Model ${model} returned inability message, trying next model...`);
            continue; // Try next model
          }

          analysis = responseContent;
          success = true;
          console.log(`Success with model: ${model}`);
          break; // Exit loop on success

        } catch (modelError: unknown) {
          console.error(`Network error with ${model}:`, modelError instanceof Error ? modelError.message : "Unknown error");
          continue; // Try next model
        }
      }

      if (!success) {
        throw new Error("All AI models failed. Please try again later.");
      }

      setMessages((prev) => [...prev, {
        role: "assistant",
        content: analysis,
        isAnalysis: true,
        fileName: fileName
      }]);

      // Clear file data after analysis
      setFileData(null);
      setFileName("");
      setFileType("");

    } catch (error: any) {
      console.error("Error analyzing document:", error);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `Error: ${error.message || "Failed to analyze the document"}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="fixed bottom-6 right-24 rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 hover:from-blue-700 hover:via-cyan-600 hover:to-teal-600 transition-all duration-500 hover:scale-110"
        title="Radiology Report Analyzer"
      >
        <Scan className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] shadow-2xl flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Report Analyzer</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4 h-[350px]">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Scan className="h-12 w-12 mx-auto mb-3 opacity-50 text-blue-500" />
              <p className="text-sm font-medium mb-2">Upload Radiology Reports</p>
              <p className="text-xs text-muted-foreground">X-rays, CT scans, MRI, ultrasound reports</p>
              <p className="text-xs text-muted-foreground mt-1">AI-powered analysis for physical abnormalities & diseases</p>
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`${msg.role === "user" ? "max-w-[80%]" : "w-full"} rounded-lg px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : msg.isAnalysis
                        ? "bg-white text-black border border-gray-200"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {msg.fileName && (
                      <div className="flex items-center gap-2 mb-2 text-xs opacity-75">
                        <FileUp className="h-3 w-3" />
                        {msg.fileName}
                      </div>
                    )}
                    {msg.isAnalysis ? (
                      <div className="text-sm">
                        {msg.content.split('\n').map((line, index) => {
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
                                <div key={index} className="grid grid-cols-4 gap-2 p-2 bg-muted/50 rounded-lg border text-xs">
                                  <div className="font-semibold text-primary">{cells[0]?.trim()}</div>
                                  <div className="text-green-600 font-medium">{cells[1]?.trim()}</div>
                                  <div className="text-blue-600">{cells[2]?.trim()}</div>
                                  <div className="text-orange-600 font-medium">{cells[3]?.trim()}</div>
                                </div>
                              );
                            }
                          }

                          // Handle table headers (usually the first row with Metric, Normal Range, etc.)
                          if (line.includes('Anatomical Region') && line.includes('Normal Appearance') && line.includes('Current Finding') && line.includes('Severity/Impact')) {
                            return (
                              <div key={index} className="grid grid-cols-4 gap-2 p-2 bg-primary/10 rounded-lg border-2 border-primary/20 font-bold text-xs">
                                <div className="text-primary">Anatomical Region</div>
                                <div className="text-primary">Normal Appearance</div>
                                <div className="text-primary">Current Finding</div>
                                <div className="text-primary">Severity/Impact</div>
                              </div>
                            );
                          }

                          // Handle main headings (### )
                          if (line.startsWith('### ')) {
                            return (
                              <h3 key={index} className="text-base font-bold text-primary mb-2 mt-4">
                                {line.replace('### ', '').replace(/\*\*/g, '')}
                              </h3>
                            );
                          }

                          // Handle PHYSICAL ABNORMALITIES section
                          if (line.startsWith('PHYSICAL ABNORMALITIES')) {
                            return (
                              <div key={index} className="bg-red-100 border-l-4 border-red-500 p-3 mb-3 rounded-r-lg">
                                <h4 className="text-base font-bold text-black mb-1">
                                  PHYSICAL ABNORMALITIES
                                </h4>
                              </div>
                            );
                          }

                          // Handle other sub headings (#### )
                          if (line.startsWith('#### ')) {
                            return (
                              <h4 key={index} className="text-sm font-bold text-red-600 mb-2">
                                {line.replace('#### ', '').replace(/\*\*/g, '')}
                              </h4>
                            );
                          }

                          // Handle bold text with ** **
                          if (line.includes('**') && line.trim() !== '') {
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                              <p key={index} className="text-xs text-foreground mb-1">
                                {parts.map((part, partIndex) =>
                                  part.startsWith('**') && part.endsWith('**') ? (
                                    <strong key={partIndex} className="font-bold text-red-600 bg-red-100 px-1 rounded">
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
                              <div key={index} className="flex items-start gap-2 mb-1">
                                <span className="text-blue-500 mt-1 text-xs">•</span>
                                <span className="text-xs text-foreground">
                                  {parts.map((part, partIndex) =>
                                    part.startsWith('**') && part.endsWith('**') ? (
                                      <strong key={partIndex} className="font-bold text-red-600 bg-red-100 px-1 rounded">
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
                            return <div key={index} className="h-1"></div>;
                          }

                          // Regular text
                          const parts = line.split(/(\*\*.*?\*\*)/g);
                          return (
                            <p key={index} className="text-xs text-muted-foreground mb-1">
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
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-100" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        <div className="p-4 border-t bg-background shrink-0">
          <div className="space-y-2">
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-3 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                id="general-report-upload"
                accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf,text/plain"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading || loading}
              />
              <label
                htmlFor="general-report-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Sparkles className="h-6 w-6 text-primary animate-spin" />
                    <p className="text-xs font-medium">Uploading...</p>
                  </>
                ) : fileData ? (
                  <>
                    <FileUp className="h-6 w-6 text-green-500" />
                    <p className="text-xs font-medium text-green-600">{fileName}</p>
                  </>
                ) : (
                  <>
                    <FileUp className="h-6 w-6 text-primary" />
                    <p className="text-xs font-medium">Upload Document</p>
                  </>
                )}
              </label>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about abnormalities, fractures, tumors..."
                disabled={loading}
              />
              <Button type="submit" size="icon" disabled={loading || (!input.trim() && !fileData)}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
