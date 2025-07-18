"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, FileText, AlertTriangle, CheckCircle, Upload, File, X } from "lucide-react";
import { toast } from "sonner";

interface AnalysisResult {
  summary: string;
  riskScore: number;
  riskReasons: string[];
  analysisId: string;
}

export default function EulaAnalyzer() {
  const [eulaText, setEulaText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<"text" | "file">("text");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeEula = async () => {
    if (!eulaText.trim()) {
      toast.error("Please enter EULA text to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze-eula", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eulaText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze EULA");
      }

      setResult(data);
      toast.success("EULA analysis completed!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: "Low", color: "bg-green-500", textColor: "text-green-700" };
    if (score <= 60) return { level: "Medium", color: "bg-yellow-500", textColor: "text-yellow-700" };
    if (score <= 80) return { level: "High", color: "bg-orange-500", textColor: "text-orange-700" };
    return { level: "Very High", color: "bg-red-500", textColor: "text-red-700" };
  };

  const clearAnalysis = () => {
    setResult(null);
    setError(null);
    setEulaText("");
    setUploadedFile(null);
    setInputMode("text");
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const extractTextFromDocx = async (file: File): Promise<string> => {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };


  const handleFileSelect = useCallback(async (file: File) => {
    const allowedTypes = [
      'text/plain',
      'text/html',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const fileName = file.name.toLowerCase();
    const isAllowedType = allowedTypes.includes(file.type) || 
                         fileName.endsWith('.txt') || 
                         fileName.endsWith('.docx');

    if (!isAllowedType) {
      toast.error("Please upload a supported file (.txt, .html, .docx)");
      return;
    }

    if (file.size > 25 * 1024 * 1024) { // 25MB limit for larger documents
      toast.error("File size must be less than 25MB");
      return;
    }

    try {
      let content = "";
      
      toast.info("Processing file...");
      
      if (file.type === 'text/plain' || fileName.endsWith('.txt') || file.type === 'text/html') {
        content = await readFileContent(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
        content = await extractTextFromDocx(file);
      } else if (file.type === 'application/msword') {
        toast.error("Legacy .doc files are not supported. Please save as .docx format.");
        return;
      }

      if (!content || content.trim().length === 0) {
        toast.error("No text content found in the file. Please check if the file contains readable text.");
        return;
      }

      if (content.length > 50000) {
        toast.error("File content is too long (max 50,000 characters)");
        return;
      }

      setUploadedFile(file);
      setEulaText(content);
      setInputMode("file");
      toast.success(`File "${file.name}" loaded successfully`);
    } catch (error) {
      console.error("File processing error:", error);
      toast.error("Failed to read file content. Please ensure the file is not corrupted or password-protected.");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const removeFile = () => {
    setUploadedFile(null);
    setEulaText("");
    setInputMode("text");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section className="min-h-screen bg-gray-950 text-white px-4 sm:px-6 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto flex flex-col">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            EULAlyzer AI
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            AI-powered risk assessment for End User License Agreements
          </p>
        </div>

        {/* Main Content - 2 Columns */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Input */}
          <div className="flex flex-col min-h-0 lg:min-h-[600px]">
            <Card className="bg-gray-900 border-purple-800/30 flex-1 flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0 mb-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-purple-300">
                      <FileText className="h-5 w-5" />
                      EULA Input
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Upload a file or paste your EULA text
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {result && (
                      <Button 
                        variant="outline" 
                        onClick={clearAnalysis}
                        size="sm"
                        className="bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-500 flex-shrink-0"
                      >
                        Clear
                      </Button>
                    )}
                    <Button 
                      onClick={analyzeEula} 
                      disabled={isAnalyzing || !eulaText.trim()}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white min-w-[100px] flex-shrink-0"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        "Analyze EULA"
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Mode Toggle */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
                  <div className="flex gap-2">
                    <Button
                      variant={inputMode === "text" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setInputMode("text");
                        if (uploadedFile) removeFile();
                      }}
                      className={inputMode === "text" ? "bg-purple-600 hover:bg-purple-700" : "border-purple-600/50 text-purple-300 hover:bg-purple-600/20"}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Paste Text</span>
                      <span className="sm:hidden">Text</span>
                    </Button>
                    <Button
                      variant={inputMode === "file" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setInputMode("file")}
                      className={inputMode === "file" ? "bg-purple-600 hover:bg-purple-700" : "border-purple-600/50 text-purple-300 hover:bg-purple-600/20"}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Upload File</span>
                      <span className="sm:hidden">File</span>
                    </Button>
                  </div>
                  <span className="text-xs text-gray-400 text-center sm:text-right">
                    {eulaText.length.toLocaleString()} / 50,000 characters
                  </span>
                </div>

                {/* Input Area */}
                <div className="flex-1 min-h-0 flex flex-col">
                  {inputMode === "file" ? (
                    <div className="flex-1 space-y-3 flex flex-col min-h-0">
                      {/* File Upload Area */}
                      <div
                        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors flex-shrink-0 touch-manipulation ${
                          isDragOver
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-purple-600/30 hover:border-purple-500/50 bg-gray-800/50"
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                      >
                        {uploadedFile ? (
                          <div className="space-y-2">
                            <File className="h-6 w-6 mx-auto text-purple-400" />
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-medium text-sm text-white">{uploadedFile.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={removeFile}
                                className="h-5 w-5 p-0 text-gray-400 hover:text-red-400"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-400">
                              {(uploadedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="h-6 w-6 mx-auto text-purple-400" />
                            <div>
                              <p className="font-medium text-sm text-white">
                                <span className="hidden sm:inline">Drop EULA file here</span>
                                <span className="sm:hidden">Upload EULA file</span>
                              </p>
                              <p className="text-xs text-gray-400">
                                <span className="hidden sm:inline">or </span>
                                <button
                                  type="button"
                                  className="text-purple-400 hover:text-purple-300 hover:underline touch-manipulation"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  <span className="hidden sm:inline">browse files</span>
                                  <span className="sm:hidden">Tap to select file</span>
                                </button>
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 px-2">
                              Supports .txt, .html, .docx files up to 25MB
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.html,.docx,.doc"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />

                      {/* File Content Preview */}
                      {uploadedFile && eulaText && (
                        <div className="flex-1 min-h-0 flex flex-col">
                          <h4 className="text-sm font-medium mb-2 text-purple-300">Content Preview:</h4>
                          <textarea
                            value={eulaText}
                            onChange={(e) => setEulaText(e.target.value)}
                            className="flex-1 w-full text-xs bg-gray-800 border border-purple-600/30 text-white resize-none rounded-md p-3 overflow-y-auto focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[300px] lg:min-h-[400px]"
                            disabled={isAnalyzing}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <textarea
                      placeholder="Paste your EULA text here..."
                      value={eulaText}
                      onChange={(e) => setEulaText(e.target.value)}
                      className="flex-1 w-full bg-gray-800 border border-purple-600/30 text-white resize-none rounded-md p-3 overflow-y-auto focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[400px] lg:min-h-[500px]"
                      disabled={isAnalyzing}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div className="flex flex-col min-h-0 lg:min-h-[600px] mt-6 lg:mt-0">
            {error ? (
              <Alert variant="destructive" className="bg-red-900/50 border-red-600/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            ) : result ? (
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[70vh] lg:max-h-none">
                {/* Risk Score */}
                <Card className="bg-gray-900 border-purple-800/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-purple-300 text-lg">
                      <AlertTriangle className="h-5 w-5" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">Risk Score</span>
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={`${getRiskLevel(result.riskScore).color} text-white text-sm`}
                          >
                            {getRiskLevel(result.riskScore).level}
                          </Badge>
                          <span className="text-xl font-bold text-white">{result.riskScore}/100</span>
                        </div>
                      </div>
                      <Progress value={result.riskScore} className="w-full h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Summary */}
                <Card className="bg-gray-900 border-purple-800/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-purple-300">Summary</CardTitle>
                    <CardDescription className="text-gray-400">Risk explanation in plain English</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-gray-200">{result.summary}</p>
                  </CardContent>
                </Card>

                {/* Risk Reasons */}
                {result.riskReasons.length > 0 && (
                  <Card className="bg-gray-900 border-purple-800/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-purple-300">Key Risk Factors</CardTitle>
                      <CardDescription className="text-gray-400">Specific concerns identified</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.riskReasons.map((reason, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 mt-0.5 text-purple-400 flex-shrink-0" />
                            <span className="text-gray-200">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Legal Disclaimer */}
                <Alert className="bg-yellow-900/30 border-yellow-600/50">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-200 text-xs">
                    <strong>Legal Disclaimer:</strong> This analysis is for informational purposes only and should not be considered legal advice. 
                    Consult with a qualified attorney for legal guidance.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <Card className="bg-gray-900 border-purple-800/30 flex-1 flex items-center justify-center">
                <CardContent className="text-center">
                  <FileText className="h-12 w-12 mx-auto text-purple-400 mb-4" />
                  <h3 className="text-lg font-medium text-purple-300 mb-2">Ready to Analyze</h3>
                  <p className="text-gray-400 text-sm">
                    Upload a EULA file or paste text to get started with AI-powered risk assessment
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}