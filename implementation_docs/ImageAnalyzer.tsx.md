# Source: `src/components/ImageAnalyzer.tsx`

```tsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, Loader2, AlertCircle, CheckCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

type UploadState = 'idle' | 'uploading' | 'analyzing' | 'success' | 'error' | 'quota_exceeded';

interface AnalysisResult {
  metadata?: any;
  composition?: any;
  color_profile?: any;
  lighting?: any;
  technical_specs?: any;
  artistic_elements?: any;
  typography?: any;
  generation_parameters?: any;
}

export const ImageAnalyzer: React.FC = () => {
  const [state, setState] = useState<UploadState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [cachedMessage, setCachedMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [expandedSection, setExpandedSection] = useState<string | null>('composition');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processFile = (selectedFile: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMsg('Unsupported file type. Use JPEG, PNG or WEBP.');
      setState('error');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMsg('File is too large. Maximum size is 5MB.');
      setState('error');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setState('idle');
    submitAnalysis(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (state === 'uploading' || state === 'analyzing') return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const submitAnalysis = async (fileToUpload: File) => {
    setState('uploading');
    setCachedMessage('');
    setErrorMsg('');
    setResult(null);

    const formData = new FormData();
    formData.append('image', fileToUpload);

    try {
      setState('analyzing');
      const res = await fetch('/api/decode', {
        method: 'POST',
        body: formData,
      });

      const contentType = res.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server error (${res.status})`);
      }

      if (!res.ok) {
        if (res.status === 429) {
          setState('quota_exceeded');
          setErrorMsg(data.error || 'Quota exceeded.');
        } else {
          setState('error');
          setErrorMsg(data.error || `Server error (${res.status})`);
        }
        return;
      }

      setResult(data.result);
      if (data.status === 'cached') {
        setCachedMessage(data.message);
      }
      setState('success');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setState('error');
      setErrorMsg(err.message || 'Network error.');
    }
  };

  const reset = () => {
    setState('idle');
    setFile(null);
    setPreview(null);
    setResult(null);
    setErrorMsg('');
    setCachedMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderJsonSection = (title: string, dataKey: keyof AnalysisResult) => {
    if (!result || !result[dataKey]) return null;
    const isExpanded = expandedSection === dataKey;

    return (
      <div className="border border-white/10 rounded-lg overflow-hidden mb-3 bg-black/40 backdrop-blur-md">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : dataKey)}
          className="w-full px-4 py-3 flex justify-between items-center hover:bg-white/5 transition-colors text-left"
        >
          <span className="font-brutal font-bold text-sm uppercase tracking-widest text-[#00f3ff]">{title}</span>
          {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 border-t border-white/5 font-mono text-sm text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(result[dataKey], null, 2)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <section className="w-full max-w-5xl mx-auto py-16 px-4">
      {/* Rest of UI structure... */}
      {/* ... */}
    </section>
  );
};
```
