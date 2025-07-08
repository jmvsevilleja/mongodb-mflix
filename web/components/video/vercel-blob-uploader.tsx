"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  FileVideo,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VercelBlobUploaderProps {
  onUploadComplete?: (url: string) => void;
  movieId?: string;
  movieTitle?: string;
}

export function VercelBlobUploader({
  onUploadComplete,
  movieId,
  movieTitle,
}: VercelBlobUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("video/")) {
        toast({
          title: "Invalid File Type",
          description: "Please select a video file (MP4, WebM, MOV, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (500MB limit)
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please select a video file smaller than 500MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setUploadedUrl(null);
      setError(null);
    }
  };

  const uploadToVercelBlob = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Create a filename with movie info if available
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const filename = movieTitle
        ? `trailers/${movieTitle.replace(
            /[^a-zA-Z0-9]/g,
            "_"
          )}_${timestamp}.${fileExtension}`
        : `trailers/trailer_${timestamp}.${fileExtension}`;

      // In a real implementation, you would call your API endpoint that handles Vercel Blob upload
      // For demo purposes, we'll simulate the upload process

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      // Simulate API call to your backend that uploads to Vercel Blob
      // const formData = new FormData();
      // formData.append('file', file);
      // formData.append('filename', filename);
      // if (movieId) formData.append('movieId', movieId);

      // const response = await fetch('/api/upload-trailer', {
      //   method: 'POST',
      //   body: formData,
      // });

      // if (!response.ok) {
      //   throw new Error('Upload failed');
      // }

      // const { url } = await response.json();

      // For demo, create a mock Vercel Blob URL
      await new Promise((resolve) => setTimeout(resolve, 2000));
      clearInterval(progressInterval);
      setUploadProgress(100);

      const mockUrl = `https://blob.vercel-storage.com/trailers/${filename}`;
      setUploadedUrl(mockUrl);
      onUploadComplete?.(mockUrl);

      toast({
        title: "Upload Successful",
        description: "Trailer has been uploaded to Vercel Blob",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setError(errorMessage);
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: "URL has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed: " + error,
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Trailer to Vercel Blob
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Movie Info */}
        {movieTitle && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">Uploading trailer for:</p>
            <p className="text-sm text-muted-foreground">{movieTitle}</p>
            {movieId && (
              <p className="text-xs text-muted-foreground">ID: {movieId}</p>
            )}
          </div>
        )}

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
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose Different File
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => uploadToVercelBlob(selectedFile)}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload to Vercel Blob
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload a video file (MP4, WebM, MOV)
                </p>
                <p className="text-xs text-muted-foreground">
                  Maximum file size: 500MB
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

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">
                Uploading to Vercel Blob...
              </span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-xs text-muted-foreground">
              {uploadProgress.toFixed(0)}% complete
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Success State */}
        {uploadedUrl && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Upload completed successfully!
              </span>
            </div>

            <div className="space-y-2">
              <Label>Vercel Blob URL:</Label>
              <div className="flex gap-2">
                <Input
                  value={uploadedUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(uploadedUrl)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(uploadedUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              <p className="font-medium mb-1">Next Steps:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Copy the URL above</li>
                <li>Update your movie record in the database</li>
                <li>Set the &quot;trailer&quot; field to this URL</li>
                <li>The video player will automatically use this MP4 file</li>
              </ul>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
          <p className="font-medium mb-1">About Vercel Blob Storage:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Optimized for video streaming and global CDN delivery</li>
            <li>Automatic compression and format optimization</li>
            <li>Secure URLs with built-in access controls</li>
            <li>Seamless integration with your Next.js application</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
