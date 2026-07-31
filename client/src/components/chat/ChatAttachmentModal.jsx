import React, { useState } from 'react';
import { Paperclip, X, UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';
import apiClient from '../../services/apiClient';

const ChatAttachmentModal = ({ isOpen, onClose, onSendAttachment }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }

    setFile(selected);
    setError(null);

    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('attachment', file);

      const response = await apiClient.post('/attachments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onSendAttachment(response.data.attachment);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload attachment.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-lg">
            <Paperclip className="w-5 h-5 text-indigo-600" />
            <span>Send File Attachment</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-900/30 transition">
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="chat-file-input"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <label htmlFor="chat-file-input" className="cursor-pointer flex flex-col items-center">
            <UploadCloud className="w-10 h-10 text-indigo-500 mb-2" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Click to select photo or document</span>
            <span className="text-xs text-slate-400 mt-1">PNG, JPG, PDF, DOCX up to 10MB</span>
          </label>
        </div>

        {file && (
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3 truncate">
              {preview ? (
                <img src={preview} alt="Preview" className="w-10 h-10 object-cover rounded-lg" />
              ) : (
                <FileText className="w-8 h-8 text-indigo-500" />
              )}
              <div className="truncate text-xs">
                <span className="font-bold text-slate-900 dark:text-white block truncate">{file.name}</span>
                <span className="text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-xs hover:bg-indigo-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Send Attachment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAttachmentModal;
