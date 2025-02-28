
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Play, Pause } from "lucide-react";
import { uploadVideo } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Sample video data
const sampleVideos = [
  {
    id: "video1",
    title: "First Skydiving Experience",
    thumbnail: "https://images.unsplash.com/photo-1505142468607-b094e9abd3f9?auto=format&fit=crop&w=600&q=80",
    duration: "3:42",
    uploader: "Alex M.",
    date: "2023-10-15",
    views: 1243,
    category: "Skydiving",
  },
  {
    id: "video2",
    title: "Swimming with Sharks in the Bahamas",
    thumbnail: "https://images.unsplash.com/photo-1560275619-4cc9ef870740?auto=format&fit=crop&w=600&q=80",
    duration: "5:18",
    uploader: "Jamie L.",
    date: "2023-09-28",
    views: 893,
    category: "Underwater",
  },
  {
    id: "video3",
    title: "Rock Climbing for Beginners",
    thumbnail: "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=600&q=80",
    duration: "8:27",
    uploader: "Morgan T.",
    date: "2023-10-02",
    views: 1568,
    category: "Climbing",
  },
  {
    id: "video4",
    title: "White Water Kayaking - Class 5 Rapids",
    thumbnail: "https://images.unsplash.com/photo-1623874514711-0f321325f318?auto=format&fit=crop&w=600&q=80",
    duration: "6:53",
    uploader: "River Adventures",
    date: "2023-09-15",
    views: 742,
    category: "Kayaking",
  },
  {
    id: "video5",
    title: "My First Base Jump",
    thumbnail: "https://images.unsplash.com/photo-1601808881948-aa5ada8d8c40?auto=format&fit=crop&w=600&q=80",
    duration: "4:21",
    uploader: "Chris D.",
    date: "2023-10-10",
    views: 2134,
    category: "Base Jumping",
  },
  {
    id: "video6",
    title: "Bungee Jumping - Facing My Fear of Heights",
    thumbnail: "https://images.unsplash.com/photo-1600014870707-0185db856284?auto=format&fit=crop&w=600&q=80",
    duration: "7:12",
    uploader: "Taylor K.",
    date: "2023-09-22",
    views: 983,
    category: "Bungee",
  },
];

// Video categories
const categories = [
  "Skydiving",
  "Hang Gliding",
  "Rock Climbing",
  "Swimming with Sharks",
  "Base Jumping",
  "Kayaking",
  "Wing Walking",
  "Bungee Jumping",
  "Zip Lines",
  "Rope Swings",
  "Swimming with Whales",
  "Deep Water Diving",
  "Other",
];

const VideoGallery = () => {
  const { toast } = useToast();
  const [videos, setVideos] = useState(sampleVideos);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "",
    name: "",
    file: null as File | null,
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm({
        ...uploadForm,
        file: e.target.files[0],
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUploadForm({
      ...uploadForm,
      [name]: value,
    });
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setUploadForm({
      ...uploadForm,
      category: value,
    });
  };

  // Handle upload
  const handleUpload = async () => {
    // Validation
    if (!uploadForm.file) {
      toast({
        title: "Missing video file",
        description: "Please select a video to upload",
        variant: "destructive",
      });
      return;
    }

    if (!uploadForm.title || !uploadForm.category || !uploadForm.name) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 300);

    try {
      // Use the API function
      const response = await uploadVideo(
        uploadForm.file,
        uploadForm.title,
        uploadForm.description,
        uploadForm.category,
        uploadForm.name
      );

      // Clear interval and set to 100% when done
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Delay to show 100% complete
      setTimeout(() => {
        setIsUploading(false);
        setIsUploadOpen(false);
        setUploadProgress(0);
        
        // Reset form
        setUploadForm({
          title: "",
          description: "",
          category: "",
          name: "",
          file: null,
        });
        
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        if (response.success) {
          // Add video to the list
          const newVideo = {
            id: response.videoId as string,
            title: uploadForm.title,
            thumbnail: URL.createObjectURL(uploadForm.file),
            duration: "0:00", // This would normally be extracted from the video
            uploader: uploadForm.name,
            date: new Date().toISOString().split('T')[0],
            views: 0,
            category: uploadForm.category,
          };
          
          setVideos([newVideo, ...videos]);
          
          toast({
            title: "Upload successful",
            description: response.message,
          });
        } else {
          toast({
            title: "Upload failed",
            description: response.message,
            variant: "destructive",
          });
        }
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      
      toast({
        title: "Upload error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Play or pause video
  const togglePlayPause = (videoId: string) => {
    if (playingVideo === videoId) {
      setIsPlaying(!isPlaying);
    } else {
      setPlayingVideo(videoId);
      setIsPlaying(true);
    }
  };

  return (
    <section id="videos" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-courage-100 text-courage-800 mb-4">
            Success Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Watch Transformations Unfold
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            See firsthand how people just like you overcame their fears and discovered new strengths through our adventures.
          </p>
          <Button 
            onClick={() => setIsUploadOpen(true)}
            className="bg-courage-600 hover:bg-courage-700 flex items-center gap-2"
          >
            <Upload size={18} />
            Share Your Story
          </Button>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <div 
              key={video.id} 
              className="overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow activity-card"
            >
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Button 
                    onClick={() => togglePlayPause(video.id)}
                    className="bg-black/70 hover:bg-black/90 text-white rounded-full h-12 w-12 flex items-center justify-center"
                  >
                    {playingVideo === video.id && isPlaying ? (
                      <Pause size={24} />
                    ) : (
                      <Play size={24} />
                    )}
                  </Button>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{video.title}</h3>
                  <span className="text-xs font-medium bg-courage-50 text-courage-700 rounded-full px-2 py-0.5 whitespace-nowrap">
                    {video.category}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                  <span>{video.uploader}</span>
                  <div className="flex items-center gap-2">
                    <span>{video.views} views</span>
                    <span>•</span>
                    <span>{video.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Story</DialogTitle>
            <DialogDescription>
              Upload a video of your Be Courageous experience to inspire others
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Video Title*</Label>
              <Input
                id="title"
                name="title"
                placeholder="My First Skydiving Experience"
                value={uploadForm.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Share the details of your experience..."
                value={uploadForm.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category*</Label>
              <Select
                value={uploadForm.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Your Name*</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={uploadForm.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Video File*</Label>
              <div
                onClick={triggerFileInput}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                  uploadForm.file ? "border-courage-300" : "border-gray-300"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="video/*"
                  onChange={handleFileChange}
                />
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  {uploadForm.file
                    ? `Selected: ${uploadForm.file.name}`
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  MP4, MOV or AVI (max. 1GB)
                </p>
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="text-sm flex justify-between">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-courage-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUploadOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={
                isUploading ||
                !uploadForm.file ||
                !uploadForm.title ||
                !uploadForm.category ||
                !uploadForm.name
              }
              className="bg-courage-600 hover:bg-courage-700"
            >
              {isUploading ? "Uploading..." : "Upload Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default VideoGallery;
