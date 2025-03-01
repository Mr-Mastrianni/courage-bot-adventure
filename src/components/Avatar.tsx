import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '../components/ui/use-toast';

interface AvatarProps {
  url: string | null;
  size: number;
  onUpload: (url: string) => void;
}

const Avatar: React.FC<AvatarProps> = ({ url, size, onUpload }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (url) setAvatarUrl(url);
  }, [url]);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      setUploading(true);
      setError(null);
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      
      // Validate file type
      const allowedFileTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      if (!allowedFileTypes.includes(fileExt?.toLowerCase() || '')) {
        setError('Invalid file type. Please upload an image file (jpg, jpeg, png, gif, webp).');
        setUploading(false);
        return;
      }
      
      // Check file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('File size too large. Maximum size is 5MB.');
        setUploading(false);
        return;
      }
      
      // Always use 'avatars' bucket
      const bucketName = 'avatars';
      
      console.log('Uploading avatar to bucket:', bucketName);
      
      // Generate random filename to avoid collisions
      const fileName = `${Math.random()}.${fileExt}`;
      
      // Upload file to storage
      const { error: uploadError, data } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Avatar upload error:', uploadError.message);
        
        // Check if the error is due to missing bucket
        if (uploadError.message.includes('bucket') && uploadError.message.toLowerCase().includes('not found')) {
          setError('Storage not configured properly. Please contact support. (Missing avatars bucket)');
        } else {
          setError(`Error uploading avatar: ${uploadError.message}`);
        }
        
        setUploading(false);
        return;
      }
      
      console.log('Avatar uploaded successfully:', data);
      
      // Get public URL
      const { data: { publicUrl } } = await supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      console.log('Avatar public URL:', publicUrl);
      
      // Pass URL to parent component
      onUpload(publicUrl);
      
      // Show success message
      toast({
        title: "Avatar Updated",
        description: "Your avatar has been updated successfully.",
        variant: "success"
      });
      
    } catch (error) {
      console.error('Unexpected error during avatar upload:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="overflow-hidden rounded-full border-2 border-gray-200"
        style={{ height: size, width: size }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="object-cover w-full h-full"
          />
        ) : (
          <div 
            className="flex items-center justify-center bg-gray-100 w-full h-full text-gray-400"
            style={{ fontSize: size / 2 }}
          >
            👤
          </div>
        )}
      </div>
      <div className="mt-2">
        <label
          className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
          htmlFor="avatar-upload"
        >
          {uploading ? 'Uploading...' : 'Upload Avatar'}
        </label>
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden"
        />
      </div>
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}
    </div>
  );
};

export default Avatar;
