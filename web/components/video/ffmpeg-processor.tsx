"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Download, 
  Play, 
  Scissors, 
  Volume2, 
  Image,
  FileVideo,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FFmpegProcessorProps {
  onVideoProcessed?: (processedUrl: string) => void;
}

export function FFmpegProcessor({ onVideoProcessed }: FFmpegProcessorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedVideo, setProcessedVideo] = useState<string | null>(null);
  const [operation, setOperation] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Note: This is a client-side demo. In production, you'd want to use FFmpeg.wasm
  // or process videos on your server with actual FFmpeg
  const processVideo = async (file: File, operationType: string) => {
    setIsLoading(true);
    setProgress(0);
    setOperation(operationType);

    try {
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      // For demo purposes, we'll just create a blob URL from the original file
      // In a real implementation, you'd use FFmpeg.wasm here
      await new Promise(resolve => setTimeout(resolve, 3000));

      clearInterval(progressInterval);
      setProgress(100);

      // Create a processed video URL (in reality, this would be the FFmpeg output)
      const processedUrl = URL.createObjectURL(file);
      setProcessedVideo(processedUrl);
      onVideoProcessed?.(processedUrl);

      toast({
        title: "Video Processed Successfully",
        description: `${operationType} operation completed`,
      });

    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "Failed to process video: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
      setOperation("");
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a video file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (100MB limit for demo)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a video file smaller than 100MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setProcessedVideo(null);
    }
  };

  const operations = [
    {
      id: "compress",
      name: "Compress Video",
      description: "Reduce file size while maintaining quality",
      icon: FileVideo,
    },
    {
      id: "extract-audio",
      name: "Extract Audio",
      description: "Extract audio track from video",
      icon: Volume2,
    },
    {
      id: "thumbnail",
      name: "Generate Thumbnail",
      description: "Create thumbnail from video frame",
      icon: Image,
    },
    {
      id: "trim",
      name: "Trim Video",
      description: "Cut video to specific duration",
      icon: Scissors,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileVideo className="h-5 w-5" />
          Video Processing (FFmpeg Demo)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="space-y-2">
                <FileVideo className="h-8 w-8 mx-auto text-primary" />
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Different File
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload a video file
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select Video File
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Processing Operations */}
        {selectedFile && (
          <div className="space-y-4">
            <h4 className="font-medium">Available Operations</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {operations.map((op) => {
                const Icon = op.icon;
                return (
                  <Button
                    key={op.id}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start space-y-2"
                    onClick={() => processVideo(selectedFile, op.name)}
                    disabled={isLoading}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{op.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-left">
                      {op.description}
                    </p>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Processing Progress */}
        {isLoading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Processing: {operation}</span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground">
              {progress.toFixed(0)}% complete
            </p>
          </div>
        )}

        {/* Processed Video */}
        {processedVideo && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Processed Video</h4>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Play className="h-3 w-3" />
                Ready
              </Badge>
            </div>
            
            <video
              src={processedVideo}
              controls
              className="w-full rounded-lg"
              style={{ maxHeight: "300px" }}
            >
              Your browser does not support the video tag.
            </video>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = processedVideo;
                  a.download = `processed_${selectedFile?.name || 'video'}`;
                  a.click();
                }}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setProcessedVideo(null);
                  setSelectedFile(null);
                }}
              >
                Process Another
              </Button>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
          <p className="font-medium mb-1">Demo Note:</p>
          <p>
            This is a demonstration of video processing capabilities. In a production environment, 
            you would use FFmpeg.wasm for client-side processing or a server-side FFmpeg implementation 
            for more complex operations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}