
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useData } from '../services/DataContext';
import { Video, Upload, Sparkles, AlertCircle, Play, Info, CheckCircle2, RefreshCcw } from 'lucide-react';

// The global declaration for aistudio has been removed as it is already defined in the environment as AIStudio.
// We will access it via casting to ensure compatibility with pre-configured environment types.

export const VeoLab: React.FC = () => {
  const { assets } = useData();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectFromInventory = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const checkApiKey = async () => {
    // Accessing pre-configured aistudio via window casting
    const aistudio = (window as any).aistudio;
    const hasKey = await aistudio.hasSelectedApiKey();
    if (!hasKey) {
      setNeedsApiKey(true);
      return false;
    }
    return true;
  };

  const openKeyDialog = async () => {
    // Accessing pre-configured aistudio via window casting
    const aistudio = (window as any).aistudio;
    await aistudio.openSelectKey();
    setNeedsApiKey(false);
  };

  const generateVideo = async () => {
    setError(null);
    setVideoUrl(null);

    const hasKey = await checkApiKey();
    if (!hasKey) {
      await openKeyDialog();
      // Proceed assuming success as per guidelines: assume the key selection was successful after triggering openSelectKey()
    }

    if (!selectedImage) {
      setError("Please select or upload an image first.");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress("Initializing Veo GenAI Engine...");

    try {
      // Create a new GoogleGenAI instance right before making an API call to ensure it uses the most up-to-date API key.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];

      setGenerationProgress("Uploading frame and starting generation...");

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || "Animate this laboratory equipment in a realistic setting",
        image: {
          imageBytes: base64Data,
          mimeType: mimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });

      const loadingMessages = [
        "Analyzing physical components...",
        "Simulating laboratory lighting...",
        "Animating mechanical movement...",
        "Rendering temporal consistency...",
        "Finalizing cinematic output..."
      ];
      let msgIndex = 0;

      while (!operation.done) {
        setGenerationProgress(loadingMessages[msgIndex % loadingMessages.length]);
        msgIndex++;
        // Video generation can take a few minutes. 8s delay between polls.
        await new Promise(resolve => setTimeout(resolve, 8000));
        
        try {
          operation = await ai.operations.getVideosOperation({ operation: operation });
        } catch (opError: any) {
          // If the request fails with "Requested entity was not found.", reset key state and prompt again.
          if (opError?.message?.includes("Requested entity was not found")) {
            setNeedsApiKey(true);
            throw new Error("API Key session expired. Please re-select your key.");
          }
          throw opError;
        }
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setGenerationProgress("Fetching generated video bytes...");
        // Append API key when fetching from the download link.
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      } else {
        throw new Error("Video generation completed but no link was returned.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during generation.");
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-reva-navy">Equipment <span className="text-reva-orange">Animator</span></h2>
          <p className="text-gray-500 mt-1">Transform static equipment photos into cinematic operation simulations using Veo AI.</p>
        </div>
        {needsApiKey && (
          <button 
            onClick={openKeyDialog}
            className="flex items-center px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors font-bold text-sm"
          >
            <AlertCircle size={18} className="mr-2" /> Connect Paid API Key
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Sparkles size={20} className="mr-2 text-reva-orange" /> Configure Animation
            </h3>
            
            <div className="space-y-5">
              {/* Image Source Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">1. Select Reference Image</label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-reva-orange hover:bg-orange-50 transition-all group"
                  >
                    <Upload size={24} className="text-gray-300 group-hover:text-reva-orange mb-2" />
                    <span className="text-xs font-bold text-gray-500 group-hover:text-reva-orange">Upload Photo</span>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  </button>
                  <div className="w-full h-24 bg-gray-50 rounded-xl border-2 border-transparent overflow-hidden flex items-center justify-center">
                    {selectedImage ? (
                      <img src={selectedImage} className="w-full h-full object-cover" alt="Selected" />
                    ) : (
                      <Video size={32} className="text-gray-200" />
                    )}
                  </div>
                </div>
                
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Or select from Inventory:</p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {assets.filter(a => a.image).slice(0, 5).map(asset => (
                    <button 
                      key={asset.id}
                      onClick={() => handleSelectFromInventory(asset.image!)}
                      className={`flex-shrink-0 w-12 h-12 rounded-lg border-2 transition-all overflow-hidden ${selectedImage === asset.image ? 'border-reva-orange scale-110 shadow-md' : 'border-transparent hover:border-gray-300'}`}
                    >
                      <img src={asset.image} className="w-full h-full object-cover" alt={asset.name} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">2. Motion Instruction (Optional)</label>
                <textarea 
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. The oscilloscope screen shows a steady sine wave signal while knobs are adjusted"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-reva-orange outline-none text-sm min-h-[100px]"
                />
              </div>

              {/* Format */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">3. Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setAspectRatio('16:9')}
                    className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${aspectRatio === '16:9' ? 'border-reva-navy bg-blue-50 text-reva-navy shadow-inner' : 'border-gray-100 text-gray-400'}`}
                  >
                    Landscape (16:9)
                  </button>
                  <button 
                    onClick={() => setAspectRatio('9:16')}
                    className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${aspectRatio === '9:16' ? 'border-reva-navy bg-blue-50 text-reva-navy shadow-inner' : 'border-gray-100 text-gray-400'}`}
                  >
                    Portrait (9:16)
                  </button>
                </div>
              </div>

              <button 
                onClick={generateVideo}
                disabled={isGenerating || !selectedImage}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center shadow-lg transition-all ${
                  isGenerating || !selectedImage 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-reva-orange text-white hover:bg-orange-600 active:scale-95 shadow-orange-500/30'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCcw size={20} className="mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play size={20} className="mr-2" />
                    Animate Equipment
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3 border border-blue-100">
            <Info size={18} className="text-reva-navy mt-0.5" />
            <div className="text-xs text-reva-navy leading-relaxed">
              <strong>Note:</strong> Video generation uses the Veo model and requires a <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline font-bold">paid API key</a>. Generation may take up to 2-3 minutes.
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-8">
          <div className="bg-white h-full min-h-[500px] rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center p-8 relative overflow-hidden">
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-reva-navy/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
             
             {isGenerating ? (
               <div className="text-center space-y-6 z-10 animate-in fade-in zoom-in duration-500">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 border-4 border-reva-orange/20 border-t-reva-orange rounded-full animate-spin"></div>
                    <Video size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-reva-orange" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Processing Your Animation</h3>
                    <p className="text-reva-orange font-mono text-sm mt-2 animate-pulse">{generationProgress}</p>
                  </div>
                  <div className="max-w-xs mx-auto bg-gray-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-reva-orange h-full w-2/3 animate-[loading_20s_ease-in-out_infinite]"></div>
                  </div>
               </div>
             ) : videoUrl ? (
               <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-1000">
                  <div className={`relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white ${aspectRatio === '16:9' ? 'w-full aspect-video' : 'h-[600px] aspect-[9/16]'}`}>
                    <video 
                      src={videoUrl} 
                      controls 
                      autoPlay 
                      loop 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center">
                       <CheckCircle2 size={12} className="mr-1" /> VEO GENERATED
                    </div>
                  </div>
                  <div className="mt-8 flex gap-4">
                    <a 
                      href={videoUrl} 
                      download="reva_equipment_simulation.mp4"
                      className="px-8 py-3 bg-reva-navy text-white rounded-xl font-bold shadow-lg hover:bg-blue-900 transition-all active:scale-95"
                    >
                      Download Simulation
                    </a>
                    <button 
                      onClick={() => setVideoUrl(null)}
                      className="px-8 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                    >
                      Clear Result
                    </button>
                  </div>
               </div>
             ) : error ? (
               <div className="text-center max-w-sm">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Generation Failed</h3>
                  <p className="text-gray-500 mt-2 text-sm">{error}</p>
                  <button onClick={generateVideo} className="mt-6 text-reva-orange font-bold text-sm hover:underline">Try Again</button>
               </div>
             ) : (
               <div className="text-center group">
                  <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-gray-200 group-hover:border-reva-orange group-hover:bg-orange-50 transition-all duration-500">
                    <Video size={48} className="text-gray-200 group-hover:text-reva-orange group-hover:scale-110 transition-all duration-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Animation Canvas</h3>
                  <p className="text-gray-400 mt-2 max-w-xs mx-auto">
                    Select an equipment image on the left and click "Animate" to see it in action.
                  </p>
                  
                  {/* Visual Hint Icons */}
                  <div className="flex justify-center gap-8 mt-12 opacity-30">
                    <div className="flex flex-col items-center">
                        <CheckCircle2 size={20} className="mb-2"/>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">HD Rendering</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Sparkles size={20} className="mb-2"/>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Physics Sync</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Play size={20} className="mb-2"/>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Smooth FPS</span>
                    </div>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(100%); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
