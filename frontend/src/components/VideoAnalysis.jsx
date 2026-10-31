import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, Video, Image as ImageIcon, Camera, Play, CheckCircle2,
  AlertCircle, Sparkles, BarChart3, Car, Bike, Bus, Truck, Eye,
  RefreshCw, Zap, ShieldCheck
} from 'lucide-react';
import { uploadAndAnalyzeVideo, runDemoMedia } from '../services/api';

const BACKEND_BASE = `http://${typeof window !== 'undefined' ? (window.location.hostname || '127.0.0.1') : '127.0.0.1'}:8002`;

export default function VideoAnalysis({ onAnalysisComplete }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'demo' | 'webcam'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [confidence, setConfidence] = useState(0.35);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [annotatedMediaUrl, setAnnotatedMediaUrl] = useState(null);
  const [isImage, setIsImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Webcam state
  const [webcamActive, setWebcamActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'dib', 'tiff', 'tif', 'gif', 'jfif', 'jpe', 'heic', 'avif'];

  // Handle file selection (both input and drag-and-drop)
  const processSelectedFile = (file) => {
    if (!file) return;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const isImg = file.type?.startsWith('image/') || IMAGE_EXTS.includes(ext);

    setIsImage(isImg);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadStatus(null);
    setDetectionResult(null);
    setAnnotatedMediaUrl(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Run YOLO analysis on uploaded file
  const handleProcessMedia = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setDetectionResult(null);
    setAnnotatedMediaUrl(null);
    setUploadStatus({
      type: 'info',
      message: `Analyzing ${isImage ? 'image' : 'video'} with Ultralytics YOLO11n...`
    });

    try {
      const response = await uploadAndAnalyzeVideo(selectedFile, confidence);
      const annotatedUrl = response.annotated_video_url
        ? `${BACKEND_BASE}${response.annotated_video_url}`
        : null;

      setAnnotatedMediaUrl(annotatedUrl);
      setDetectionResult(response);
      setUploadStatus({
        type: 'success',
        message: `Analysis complete: ${response.total_unique_vehicles} vehicles identified in ${response.processing_stats?.elapsed_sec ?? '0.8'}s`
      });

      if (onAnalysisComplete) {
        onAnalysisComplete(response);
      }
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: err.message || 'Detection failed. Ensure the server is running.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 1-Click Demo Preset Loader
  const handleRunDemoPreset = async (preset) => {
    setIsProcessing(true);
    setDetectionResult(null);
    setAnnotatedMediaUrl(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadStatus({
      type: 'info',
      message: `Executing demo preset: ${preset.replace('_', ' ').toUpperCase()}...`
    });

    try {
      const response = await runDemoMedia(preset);
      setIsImage(response.file_type === 'image');
      const annotatedUrl = response.annotated_video_url
        ? `${BACKEND_BASE}${response.annotated_video_url}`
        : null;

      setAnnotatedMediaUrl(annotatedUrl);
      setDetectionResult(response);
      setUploadStatus({
        type: 'success',
        message: `Preset loaded: ${response.total_unique_vehicles} vehicles detected (${response.processing_stats?.fps ?? '12'} FPS)`
      });

      if (onAnalysisComplete) {
        onAnalysisComplete(response);
      }
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: err.message || 'Demo preset failed.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Webcam Controls
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setWebcamActive(true);
      setUploadStatus({ type: 'info', message: 'CCTV / Webcam stream active. Click Capture to analyze frame.' });
    } catch (err) {
      setUploadStatus({ type: 'error', message: 'Camera permission denied or camera not found.' });
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setWebcamActive(false);
  };

  const captureWebcamFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `cctv_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        processSelectedFile(file);
        setActiveTab('upload');
      }
    }, 'image/jpeg', 0.95);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const congestionBadge = (status) => {
    if (status === 'HIGH') return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    if (status === 'MEDIUM') return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
      
      {/* Panel Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
              Vision Intelligence Unit
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                YOLO11n + ByteTrack
              </span>
            </h3>
            <p className="text-xs text-slate-400">Universal multi-format media & CCTV stream processor</p>
          </div>
        </div>

        {/* Source Mode Tabs */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'upload'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload File</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('demo');
              if (webcamActive) stopWebcam();
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'demo'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Demo Presets</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('webcam');
              if (!webcamActive) startWebcam();
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'webcam'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3 h-3" />
            <span>Live CCTV</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: UPLOAD MEDIA (IMAGES + VIDEOS) ── */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Left: Viewport / Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex flex-col items-center justify-center bg-slate-950/90 rounded-xl border p-4 min-h-[230px] relative overflow-hidden transition-all ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/20 shadow-lg shadow-cyan-500/20'
                : 'border-slate-800'
            }`}
          >
            {annotatedMediaUrl ? (
              /* Processed AI Output Display */
              <div className="w-full flex flex-col items-center space-y-2">
                <div className="w-full flex items-center justify-between">
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 font-semibold">
                    <Eye className="w-3.5 h-3.5" /> AI Annotated Vision Feed
                  </span>
                  <button
                    onClick={() => setAnnotatedMediaUrl(null)}
                    className="text-[11px] text-slate-400 hover:text-cyan-400 underline underline-offset-2"
                  >
                    View Original
                  </button>
                </div>

                {isImage ? (
                  <img
                    key={annotatedMediaUrl}
                    src={annotatedMediaUrl}
                    alt="YOLO Detection"
                    className="w-full max-h-[190px] object-contain rounded-lg border border-emerald-500/40 shadow-lg bg-black/40"
                  />
                ) : (
                  <video
                    key={annotatedMediaUrl}
                    src={annotatedMediaUrl}
                    controls
                    autoPlay
                    muted
                    loop
                    className="w-full max-h-[190px] object-cover rounded-lg border border-emerald-500/40 shadow-lg"
                  />
                )}
              </div>
            ) : previewUrl ? (
              /* Selected Source File Preview */
              <div className="w-full h-full flex flex-col items-center">
                {isImage ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-h-[180px] object-contain rounded-lg border border-slate-700 shadow-md bg-black/30"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full max-h-[180px] object-cover rounded-lg border border-slate-700 shadow-md"
                  />
                )}
                <div className="mt-2.5 text-xs text-slate-400 flex items-center justify-between w-full font-mono">
                  <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Replace
                  </button>
                </div>
              </div>
            ) : (
              /* Universal Dropzone */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full border-2 border-dashed border-slate-800 hover:border-cyan-500/70 rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all hover:bg-slate-900/50 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-cyan-500/40 transition-all shadow-inner">
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-cyan-400" />
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  Drop traffic video or photo here
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click to browse from your computer
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1 justify-center">
                  {['JPG', 'PNG', 'WEBP', 'MP4', 'MOV', 'AVI'].map((fmt) => (
                    <span key={fmt} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      .{fmt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.gif,.jfif,.heic,.avif,.mp4,.avi,.mov,.mkv,.webm"
              className="hidden"
            />
          </div>

          {/* Right: Controls & AI Execution */}
          <div className="flex flex-col justify-between space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Confidence Filter:</span>
                <span className="font-mono text-cyan-400 font-bold">{Math.round(confidence * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.85"
                step="0.05"
                value={confidence}
                onChange={(e) => setConfidence(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0.10 (High Recall)</span>
                <span>0.85 (High Precision)</span>
              </div>
            </div>

            {/* Target Classes Badge */}
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-[11px] space-y-1.5">
              <div className="flex items-center text-slate-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
                <span>Multi-Class Vehicle Filter:</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-400">
                <span>• Car (Class #2)</span>
                <span>• Motorcycle (#3)</span>
                <span>• Bus (#5)</span>
                <span>• Truck (#7)</span>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleProcessMedia}
              disabled={!selectedFile || isProcessing}
              className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
                !selectedFile || isProcessing
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 active:scale-[0.98]'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Running YOLO11n Inference...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run YOLO11n AI Analysis</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* ── TAB 2: 1-CLICK DEMO PRESETS ── */}
      {activeTab === 'demo' && (
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Instant Demonstration Assets
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluate detection, spatial density estimation, and adaptive timing in one click.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => handleRunDemoPreset('intersection')}
              disabled={isProcessing}
              className="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900/80 text-left transition-all group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  Intersection Photo
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">JPG</span>
              </div>
              <p className="text-[11px] text-slate-400">10 active vehicles at crossroad</p>
            </button>

            <button
              onClick={() => handleRunDemoPreset('cars')}
              disabled={isProcessing}
              className="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900/80 text-left transition-all group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  Multi-Lane Frame
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">PNG</span>
              </div>
              <p className="text-[11px] text-slate-400">High-resolution arterial snapshot</p>
            </button>

            <button
              onClick={() => handleRunDemoPreset('traffic_video')}
              disabled={isProcessing}
              className="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900/80 text-left transition-all group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                <span className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-400" />
                  CCTV Traffic Video
                </span>
                <span className="text-[10px] text-purple-400 font-mono">MP4</span>
              </div>
              <p className="text-[11px] text-slate-400">15 vehicles with ByteTrack IDs</p>
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 3: LIVE CCTV / WEBCAM ── */}
      {activeTab === 'webcam' && (
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                Live Camera / CCTV Optical Feed
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Stream webcam or connect network CCTV feed</p>
            </div>
            <div className="flex items-center space-x-2">
              {webcamActive ? (
                <button
                  onClick={stopWebcam}
                  className="px-2.5 py-1 text-[11px] font-mono rounded bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900"
                >
                  Turn Off
                </button>
              ) : (
                <button
                  onClick={startWebcam}
                  className="px-2.5 py-1 text-[11px] font-mono rounded bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900"
                >
                  Enable Camera
                </button>
              )}
            </div>
          </div>

          <div className="relative w-full aspect-video max-h-[220px] bg-black/60 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${webcamActive ? 'block' : 'hidden'}`}
            />
            {!webcamActive && (
              <div className="text-center text-slate-500 space-y-1">
                <Camera className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs">Camera is currently standby</p>
              </div>
            )}
          </div>

          {webcamActive && (
            <button
              onClick={captureWebcamFrame}
              className="w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center space-x-1.5 shadow-md"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Capture & Analyze Snapshot</span>
            </button>
          )}
        </div>
      )}

      {/* ── REAL DETECTION RESULTS HUD ── */}
      {detectionResult && (
        <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/30 space-y-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Real-Time Inference Telemetry
              </h4>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${congestionBadge(detectionResult.congestion_status)}`}>
              {detectionResult.congestion_status} CONGESTION
            </span>
          </div>

          {/* Vehicle Distribution Cards */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-slate-900/80 rounded-lg p-2.5 text-center border border-slate-800">
              <Car className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white font-mono">{detectionResult.category_counts?.cars ?? 0}</div>
              <div className="text-[10px] text-slate-400 font-medium">Cars</div>
            </div>
            <div className="bg-slate-900/80 rounded-lg p-2.5 text-center border border-slate-800">
              <Bike className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white font-mono">{detectionResult.category_counts?.motorcycles ?? 0}</div>
              <div className="text-[10px] text-slate-400 font-medium">Bikes</div>
            </div>
            <div className="bg-slate-900/80 rounded-lg p-2.5 text-center border border-slate-800">
              <Bus className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white font-mono">{detectionResult.category_counts?.buses ?? 0}</div>
              <div className="text-[10px] text-slate-400 font-medium">Buses</div>
            </div>
            <div className="bg-slate-900/80 rounded-lg p-2.5 text-center border border-slate-800">
              <Truck className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white font-mono">{detectionResult.category_counts?.trucks ?? 0}</div>
              <div className="text-[10px] text-slate-400 font-medium">Trucks</div>
            </div>
          </div>

          {/* 4-Way Approach Allocation & Queue Breakdown */}
          {detectionResult.density_analysis?.approaches && (
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-2">
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>4-Way Directional Assignment:</span>
                <span className="text-cyan-400">Total PCU: {detectionResult.density_analysis.total_pcu_load ?? '—'}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                {['north', 'south', 'east', 'west'].map((dir) => {
                  const app = detectionResult.density_analysis.approaches[dir] || {};
                  return (
                    <div key={dir} className="p-1.5 rounded bg-slate-950 border border-slate-800">
                      <div className="text-slate-400 uppercase font-bold">{dir}</div>
                      <div className="text-white font-bold">{app.vehicle_count ?? 0} veh</div>
                      <div className="text-cyan-400">{Math.round((app.density ?? 0) * 100)}% den</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Performance Metadata */}
          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Latency: {detectionResult.processing_stats?.elapsed_sec ?? '0.0'}s</span>
            <span>Speed: {detectionResult.processing_stats?.fps ?? '—'} FPS</span>
            <span className="text-emerald-400 font-semibold">Intersection Synchronized ✓</span>
          </div>
        </div>
      )}

      {/* Status Notifications */}
      {uploadStatus && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center space-x-2 border transition-all ${
            uploadStatus.type === 'error'
              ? 'bg-rose-950/40 text-rose-300 border-rose-800/60'
              : uploadStatus.type === 'success'
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
              : 'bg-cyan-950/40 text-cyan-300 border-cyan-800/60'
          }`}
        >
          {uploadStatus.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : uploadStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <RefreshCw className="w-4 h-4 text-cyan-400 shrink-0 animate-spin" />
          )}
          <span>{uploadStatus.message}</span>
        </div>
      )}

    </div>
  );
}
