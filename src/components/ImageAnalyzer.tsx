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
    // Validation
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
    setState('idle'); // ready to analyze
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

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setState('quota_exceeded');
          setErrorMsg(data.error || 'Quota exceeded.');
        } else {
          setState('error');
          setErrorMsg(data.error || 'Internal server error occurred.');
        }
        return;
      }

      setResult(data.result);
      if (data.status === 'cached') {
        setCachedMessage(data.message);
      }
      setState('success');
    } catch (err: any) {
      setState('error');
      setErrorMsg(err.message || 'Network error occurred.');
    }
  };

  const reset = () => {
    setState('idle');
    setFile(null);
    setPreview(null);
    setResult(null);
    setErrorMsg('');
    setCachedMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-brutal font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#ff003c] mb-4">
          AI VisuaL Protocol
        </h2>
        <p className="text-gray-400 font-mono text-sm md:text-base max-w-2xl mx-auto">
          Upload any image to decode its stylistic DNA. Our visual analysis engine breaks down composition, color profiles, lighting, and technical specifications into structured telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Upload & Preview */}
        <div className="flex flex-col gap-4">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center w-full h-80 rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden group ${(state === 'uploading' || state === 'analyzing') ? 'border-[#00f3ff]/50 bg-[#00f3ff]/5 pointer-events-none'
                : preview ? 'border-transparent bg-black/50'
                  : 'border-gray-700 bg-gray-900/40 hover:border-[#ff003c]/70 hover:bg-[#ff003c]/5 cursor-pointer'
              }`}
            onClick={() => !preview && fileInputRef.current?.click()}
          >
            {preview ? (
              <div className="relative w-full h-full">
                <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                  {state !== 'analyzing' && state !== 'uploading' && (
                    <button
                      onClick={reset}
                      className="absolute top-4 right-4 bg-black/60 hover:bg-white/10 p-2 rounded-full text-white backdrop-blur-md transition-all"
                    >
                      Reset
                    </button>
                  )}
                  <div className="flex items-center gap-3">
                    {state === 'analyzing' ? (
                      <div className="flex items-center gap-3 text-[#00f3ff] bg-black/60 px-4 py-2 rounded-full backdrop-blur-md">
                        <Loader2 className="animate-spin" size={20} />
                        <span className="font-mono text-sm font-bold uppercase">Decoding Vectors...</span>
                      </div>
                    ) : state === 'success' ? (
                      <div className="flex items-center gap-3 text-[#00ff9d] bg-black/60 px-4 py-2 rounded-full backdrop-blur-md">
                        <CheckCircle size={20} />
                        <span className="font-mono text-sm font-bold uppercase">Analysis Complete</span>
                      </div>
                    ) : state === 'error' || state === 'quota_exceeded' ? (
                      <div className="flex items-center gap-3 text-[#ff003c] bg-black/60 px-4 py-2 rounded-full backdrop-blur-md">
                        <AlertCircle size={20} />
                        <span className="font-mono text-sm font-bold uppercase">Scan Failed</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-white transition-colors p-6 text-center">
                <UploadCloud size={48} className="mb-4 text-gray-500 group-hover:text-[#ff003c] transition-colors" />
                <p className="font-brutal font-bold text-lg mb-2 uppercase">INITIATE UPLOAD</p>
                <p className="font-mono text-xs text-gray-500 max-w-[250px]">Drag & drop your visual artifact here, or click to browse files. (JPEG, PNG, WEBP max 5MB)</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileChange}
            />
          </div>

          <AnimatePresence>
            {state === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#ff003c]/20 border border-[#ff003c]/50 text-[#ff003c] px-4 py-3 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <p className="font-mono text-sm">{errorMsg}</p>
              </motion.div>
            )}
            {state === 'quota_exceeded' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#ffb700]/20 border border-[#ffb700]/50 text-[#ffb700] px-4 py-3 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <p className="font-mono text-sm">{errorMsg}</p>
              </motion.div>
            )}
            {cachedMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#00f3ff]/20 border border-[#00f3ff]/50 text-[#00f3ff] px-4 py-3 rounded-xl flex items-center gap-3"
              >
                <Info className="shrink-0" size={18} />
                <p className="font-mono text-sm">{cachedMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Results */}
        <div className="h-[600px] flex flex-col">
          <div className="flex-1 bg-black/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
            <h3 className="text-xl font-brutal font-bold uppercase text-white mb-6 flex items-center gap-3 pb-4 border-b border-white/10">
              <ImageIcon className="text-[#ff003c]" />
              Telemetry Feed
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {!result && state !== 'analyzing' && (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 font-mono text-sm text-center">
                  <div className="w-16 h-16 border border-gray-700 border-dashed rounded-full flex items-center justify-center mb-4">
                    <span className="w-2 h-2 bg-gray-700 rounded-full animate-pulse"></span>
                  </div>
                  Waiting for visual data input...
                </div>
              )}

              {state === 'analyzing' && (
                <div className="h-full flex flex-col items-center justify-center text-[#00f3ff] font-mono text-sm">
                  <Loader2 className="animate-spin w-12 h-12 mb-6 opacity-80" />
                  <p className="animate-pulse">Extracting metadata vectors...</p>
                  <p className="animate-pulse delay-75 mt-2 opacity-50">Analyzing visual hierarchy...</p>
                </div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {renderJsonSection('Composition', 'composition')}
                  {renderJsonSection('Color Profile', 'color_profile')}
                  {renderJsonSection('Lighting', 'lighting')}
                  {renderJsonSection('Technical Specs', 'technical_specs')}
                  {renderJsonSection('Artistic Elements', 'artistic_elements')}
                  {renderJsonSection('Typography', 'typography')}
                  {renderJsonSection('Generation Prompts', 'generation_parameters')}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
