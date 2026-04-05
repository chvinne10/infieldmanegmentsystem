import React, { useState } from 'react';
import { uploadScheduleImage, processScheduleUpload } from '../services/uploadService';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadId, setUploadId] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select an image');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await uploadScheduleImage(formData);
      setUploadId(response.id);
      toast.success('Image uploaded successfully!');
      
      // Auto-process
      await handleProcess(response.id);
    } catch (error) {
      toast.error('Failed to upload image');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleProcess = async (id) => {
    try {
      setProcessing(true);
      const response = await processScheduleUpload(id);
      setResults(response);
      toast.success('Schedule processed successfully!');
    } catch (error) {
      toast.error('Failed to process schedule');
      console.error('Process error:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Schedule</h1>
          <p className="text-gray-600">Upload a handwritten or printed schedule image for AI processing</p>
        </div>

        {/* Upload Area */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Image</h2>
          
          <div className="flex gap-6">
            {/* Upload Input */}
            <div className="flex-1">
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer">
                <div className="text-center">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <p className="text-gray-600">Click to upload image</p>
                  <p className="text-gray-400 text-sm">PNG, JPG, GIF, TIFF up to 10MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Preview */}
            {preview && (
              <div className="flex-1">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Upload Button */}
          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-6 btn-primary w-full"
            >
              {uploading ? 'Uploading...' : 'Upload & Process'}
            </button>
          )}
        </div>

        {/* Results */}
        {results && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Parsed Tasks</h2>
            
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                Found {results.task_count} tasks with {results.confidence?.toFixed(2) || 0}% confidence
              </p>
            </div>

            {results.parsed_tasks?.length > 0 ? (
              <div className="space-y-4">
                {results.parsed_tasks.map((task, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">Client: {task.client_name}</p>
                    {task.location && <p className="text-sm text-gray-600">Location: {task.location}</p>}
                    {task.time && <p className="text-sm text-gray-600">Time: {task.time}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No tasks found in the image</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
