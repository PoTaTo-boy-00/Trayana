'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Mic, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import Webcam from 'react-webcam';

interface FieldUpdateFormProps {
  onSubmit: (data: {
    message: string;
    media: File[];
    location?: GeolocationPosition;
  }) => void;
}

export function FieldUpdateForm({ onSubmit }: FieldUpdateFormProps) {
  const [message, setMessage] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [location, setLocation] = useState<GeolocationPosition>();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': [],
      'video/*': []
    },
    onDrop: (acceptedFiles) => {
      setMediaFiles([...mediaFiles, ...acceptedFiles]);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        onSubmit({ message, media: mediaFiles, location: position });
      });
    } else {
      onSubmit({ message, media: mediaFiles });
    }
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // Implement voice recording logic
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    // Implement voice recording stop logic
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your update..."
        className="min-h-[100px]"
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowCamera(!showCamera)}
        >
          <Camera className="h-4 w-4 mr-2" />
          Camera
        </Button>
        <Button
          type="button"
          variant={isRecording ? "destructive" : "outline"}
          onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
        >
          <Mic className="h-4 w-4 mr-2" />
          {isRecording ? 'Stop Recording' : 'Voice Update'}
        </Button>
        <div
          {...getRootProps()}
          className="flex-1"
        >
          <input {...getInputProps()} />
          <Button type="button" variant="outline" className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      {showCamera && (
        <Card className="p-4">
          <Webcam
            audio={false}
            className="w-full rounded-lg"
            screenshotFormat="image/jpeg"
          />
          <Button
            type="button"
            className="mt-2"
            onClick={() => setShowCamera(false)}
          >
            Capture
          </Button>
        </Card>
      )}

      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {mediaFiles.map((file, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setMediaFiles(mediaFiles.filter((_, i) => i !== index))}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button type="submit" className="w-full">
        Submit Update
      </Button>
    </form>
  );
}