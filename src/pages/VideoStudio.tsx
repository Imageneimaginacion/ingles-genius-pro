import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { Upload, Play, Film, Video, Loader2, Image as ImageIcon, Check } from 'lucide-react';
import { generateVeoVideo } from '../services/geminiService';

interface VideoStudioProps {
  user: UserProfile | null;
  onVideoCreated: (xp: number, coins: number) => void;
}

const VideoStudio: React.FC<VideoStudioProps> = ({ user, onVideoCreated }) => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdult = user?.age ? user.age >= 18 : true;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setVideoUrl(null); // Reset video if new image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    setLoading(true);
    setVideoUrl(null);
    try {
      const url = await generateVeoVideo(image, prompt, aspectRatio);
      setVideoUrl(url);
      // Gamification: Reward user
      onVideoCreated(50, 25);
    } catch (error) {
      alert("Video generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in pb-32 px-4">
      {/* Header */}
      <div className={`p-6 mb-8 sticky top-0 z-20 backdrop-blur-md bg-opacity-95 border-b flex items-center gap-3 rounded-b-2xl shadow-sm
          ${isAdult ? 'bg-[#0F131A]/90 border-space-light' : 'bg-white/90 border-white'}
      `}>
         <Film className={isAdult ? "text-space-primary" : "text-purple-500"} size={24} />
         <h1 className={`text-xl font-extrabold uppercase tracking-widest ${isAdult ? 'text-white' : 'text-space-dark'}`}>
            {isAdult ? "Video Studio Pro" : "Cine Mágico"}
         </h1>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Control Panel */}
        <div className={`rounded-[2rem] p-8 flex flex-col gap-6 border-2 transition-all
            ${isAdult ? 'bg-[#151924] border-space-primary/30' : 'bg-white border-white shadow-xl'}
        `}>
            <div className="text-center mb-4">
                <h2 className={`text-2xl font-black mb-2 ${isAdult ? 'text-white' : 'text-space-dark'}`}>Create Your Scene</h2>
                <p className={`text-sm ${isAdult ? 'text-space-muted' : 'text-gray-500'}`}>Upload an image and let Veo animate it.</p>
            </div>

            {/* Image Upload Area */}
            <div 
                onClick={() => fileInputRef.current?.click()}
                className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group
                    ${isAdult 
                        ? 'bg-space-dark border-space-light hover:border-space-primary' 
                        : 'bg-gray-50 border-gray-300 hover:border-purple-400'
                    }
                `}
            >
                {image ? (
                    <>
                        <img src={image} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt="Source" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-bold flex items-center gap-2"><ImageIcon /> Change Image</span>
                        </div>
                    </>
                ) : (
                    <div className={`flex flex-col items-center gap-2 ${isAdult ? 'text-space-muted' : 'text-gray-400'}`}>
                        <Upload size={40} />
                        <span className="font-bold text-sm uppercase">Click to Upload</span>
                    </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
            </div>

            {/* Prompt Input */}
            <div>
                <label className={`block text-xs font-bold uppercase mb-2 ${isAdult ? 'text-space-muted' : 'text-gray-500'}`}>Magic Prompt (Optional)</label>
                <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={isAdult ? "Describe the motion..." : "Ej: Un gato volando en el espacio..."}
                    className={`w-full p-4 rounded-xl outline-none resize-none h-24 border-2
                        ${isAdult 
                            ? 'bg-space-dark border-space-light text-white focus:border-space-primary' 
                            : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-purple-400'
                        }
                    `}
                />
            </div>

            {/* Aspect Ratio */}
            <div>
                <label className={`block text-xs font-bold uppercase mb-2 ${isAdult ? 'text-space-muted' : 'text-gray-500'}`}>Formato</label>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setAspectRatio('16:9')}
                        className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
                            aspectRatio === '16:9' 
                            ? (isAdult ? 'bg-space-primary/20 border-space-primary text-white' : 'bg-purple-100 border-purple-500 text-purple-700')
                            : (isAdult ? 'bg-space-dark border-space-light text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-400')
                        }`}
                    >
                        Landscape (16:9)
                    </button>
                    <button 
                        onClick={() => setAspectRatio('9:16')}
                        className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
                            aspectRatio === '9:16' 
                            ? (isAdult ? 'bg-space-primary/20 border-space-primary text-white' : 'bg-purple-100 border-purple-500 text-purple-700')
                            : (isAdult ? 'bg-space-dark border-space-light text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-400')
                        }`}
                    >
                        Portrait (9:16)
                    </button>
                </div>
            </div>

            <button 
                onClick={handleGenerate}
                disabled={!image || loading}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-3
                    ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}
                    ${isAdult 
                        ? 'bg-space-primary text-white hover:bg-blue-500 shadow-blue-500/20' 
                        : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-purple-500/30'
                    }
                `}
            >
                {loading ? (
                    <><Loader2 className="animate-spin" /> Generando Video...</>
                ) : (
                    <><Video /> Generar Video</>
                )}
            </button>
        </div>

        {/* Preview Area */}
        <div className="flex flex-col gap-6">
            <div className={`flex-1 rounded-[2rem] p-8 border-2 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden
                ${isAdult ? 'bg-[#151924] border-space-light' : 'bg-white border-white shadow-xl'}
            `}>
                {videoUrl ? (
                    <div className="w-full h-full flex flex-col items-center">
                        <video 
                            src={videoUrl} 
                            controls 
                            autoPlay 
                            loop 
                            className="max-w-full max-h-[500px] rounded-xl shadow-2xl border border-gray-700"
                        />
                        <div className="mt-6 flex items-center gap-2 text-green-500 font-bold animate-bounce">
                            <Check size={20} /> Video Generated! (+50 XP)
                        </div>
                        <a 
                            href={videoUrl} 
                            download="veo-creation.mp4"
                            className={`mt-4 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-colors
                                ${isAdult ? 'bg-space-dark text-white hover:bg-space-light' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                            `}
                        >
                            Download MP4
                        </a>
                    </div>
                ) : (
                    <div className="text-center opacity-50">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${isAdult ? 'bg-space-dark' : 'bg-gray-100'}`}>
                            <Play size={40} className={isAdult ? 'text-space-muted' : 'text-gray-400'} />
                        </div>
                        <p className={`font-bold ${isAdult ? 'text-space-muted' : 'text-gray-400'}`}>
                            {loading ? "Veo is dreaming..." : "Your video will appear here"}
                        </p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default VideoStudio;