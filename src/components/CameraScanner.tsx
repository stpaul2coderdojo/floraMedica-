import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  Upload,
  FolderOpen,
  Image as ImageIcon,
  RefreshCw,
  Zap,
  ZapOff,
  Sparkles,
  SlidersHorizontal,
  Layers,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Eye,
  Target,
  Database,
  Smartphone,
  Info,
  ShieldCheck,
  RotateCw,
  Search,
  MessageSquare,
  Bot,
  Leaf,
  Utensils,
  BarChart3,
} from "lucide-react";
import { PlantData, PlantNetMorphology, PlantNetOrgan, PlantNetDatasetType } from "../types";
import { PlantService, FULL_BOTANICAL_DATABASE } from "../services/plantService";
import { PlantNetDatasetsModal } from "./PlantNetDatasetsModal";

interface CameraScannerProps {
  onPlantIdentified: (plant: PlantData, isOffline: boolean, source: string) => void;
  isOnlineMode: boolean;
  onOpenLookup?: () => void;
  onOpenChatbot?: () => void;
  onOpenForager?: () => void;
  onOpenBiodiversity?: () => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onPlantIdentified,
  isOnlineMode,
  onOpenLookup,
  onOpenChatbot,
  onOpenForager,
  onOpenBiodiversity,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraSnapInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied" | "unknown">("unknown");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMorphologyFilter, setShowMorphologyFilter] = useState(false);
  const [selectedOrgan, setSelectedOrgan] = useState<PlantNetMorphology | "auto">("auto");
  const [selectedDataset, setSelectedDataset] = useState<PlantNetDatasetType | "all">("all");
  const [isDatasetsModalOpen, setIsDatasetsModalOpen] = useState(false);

  // Morphological manual quick-filter state
  const [selectedLeafShape, setSelectedLeafShape] = useState<string>("any");
  const [selectedFlowerColor, setSelectedFlowerColor] = useState<string>("any");
  const [selectedMargin, setSelectedMargin] = useState<"entire" | "serrate" | "any">("any");
  const [selectedStemType, setSelectedStemType] = useState<"herb" | "shrub" | "tree" | "climber" | "any">("any");

  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Himalayan & offline field test specimens state
  const [sampleCategory, setSampleCategory] = useState<"himalayan" | "all" | "edible" | "medicinal" | "sacred">("himalayan");
  const [sampleSearchQuery, setSampleSearchQuery] = useState("");
  const [showAllSamplesModal, setShowAllSamplesModal] = useState(false);

  // Safe stream cleanup
  const stopCamera = useCallback(() => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {}
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
  }, []);

  // Progressive Camera Acquisition with multi-tier fallbacks
  const startCamera = useCallback(async (targetFacingMode?: "environment" | "user") => {
    const currentFacing = targetFacingMode || facingMode;
    setIsInitializing(true);
    setCameraError(null);

    // Stop existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera hardware API is not supported in this browser environment. You can upload plant photos from your files below.");
      setIsInitializing(false);
      setIsCameraActive(false);
      return;
    }

    let stream: MediaStream | null = null;

    // Constraint tier 1: High quality with facingMode
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: currentFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch (err1: any) {
      // Constraint tier 2: Simple facingMode
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: currentFacing },
          audio: false,
        });
      } catch (err2: any) {
        // Constraint tier 3: Generic video device fallback
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (err3: any) {
          const finalErr = err3 || err2 || err1;
          const errName = finalErr?.name || "";
          
          if (errName === "NotAllowedError" || errName === "PermissionDeniedError") {
            setPermissionState("denied");
            setCameraError(
              "Camera permission was not granted by browser. Tap 'Enable Camera' to allow access, or use 'Browse Files' to select plant photos from your device storage."
            );
          } else if (errName === "NotFoundError" || errName === "DevicesNotFoundError") {
            setCameraError("No camera hardware detected on this device. You can browse plant photos from your filesystem or select from offline specimens.");
          } else if (errName === "NotReadableError" || errName === "TrackStartError") {
            setCameraError("Camera is currently in use by another application. Please close other camera tabs/apps and retry.");
          } else {
            setCameraError("Unable to connect to camera. You can browse plant photos from files or choose from curated specimens below.");
          }
          
          setIsCameraActive(false);
          setIsInitializing(false);
          return;
        }
      }
    }

    if (stream) {
      streamRef.current = stream;
      setPermissionState("granted");
      setCameraError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr: any) {
          if (playErr.name !== "AbortError" && playErr.name !== "NotAllowedError") {
            console.warn("Video play notice:", playErr);
          }
        }
      }
      setIsCameraActive(true);
    }
    setIsInitializing(false);
  }, [facingMode]);

  // Initial check: if already granted permission, connect; otherwise wait for user gesture
  useEffect(() => {
    let isCancelled = false;

    const checkPermissionAndStart = async () => {
      if (typeof navigator !== "undefined" && navigator.permissions && navigator.permissions.query) {
        try {
          const status = await navigator.permissions.query({ name: "camera" as any });
          if (!isCancelled) {
            setPermissionState(status.state as any);
            status.onchange = () => {
              if (!isCancelled) {
                setPermissionState(status.state as any);
              }
            };
            // If already explicitly granted, start seamlessly
            if (status.state === "granted") {
              startCamera();
            }
          }
        } catch (permErr) {
          // navigator.permissions.query for camera is not supported in all browsers
          setPermissionState("unknown");
        }
      }
    };

    checkPermissionAndStart();

    return () => {
      isCancelled = true;
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Toggle Camera Facing Mode (Flip front/back)
  const toggleFacingMode = () => {
    const nextFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

  // Toggle Torch (if supported by hardware)
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const capabilities = (track.getCapabilities && track.getCapabilities()) as any;
        if (capabilities && capabilities.torch) {
          await track.applyConstraints({
            advanced: [{ torch: !isTorchOn } as any],
          });
          setIsTorchOn(!isTorchOn);
        } else {
          setIsTorchOn(!isTorchOn);
        }
      } catch (err) {
        setIsTorchOn(!isTorchOn);
      }
    }
  };

  // Capture Still Frame from Video
  const captureFrame = async () => {
    if (!videoRef.current) return;

    setIsAnalyzing(true);
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL("image/jpeg", 0.85);

        const result = await PlantService.identifyPlantFromImage(
          base64Image,
          "image/jpeg",
          "",
          selectedOrgan,
          selectedDataset
        );
        onPlantIdentified(result.plant, result.isOfflineResult, result.source);
      }
    } catch (err) {
      console.warn("Frame capture identification fallback:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Resize large images on client side to prevent memory/payload issues
  const resizeImageToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const MAX_DIM = 1600;
            let width = img.width;
            let height = img.height;

            if (width > MAX_DIM || height > MAX_DIM) {
              if (width > height) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              } else {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
              resolve(dataUrl);
            } else {
              resolve(e.target?.result as string);
            }
          } catch {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => {
          resolve(e.target?.result as string);
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Robust File Processor for Photos / Gallery / Drops
  const processSelectedFile = async (file: File) => {
    if (!file) return;

    // Check basic type
    if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|heic|bmp|gif)$/i.test(file.name)) {
      setUploadError("Please select a valid botanical image file (.jpg, .png, .webp).");
      return;
    }

    setUploadError(null);
    setIsAnalyzing(true);

    try {
      const base64Image = await resizeImageToDataUrl(file);
      if (!base64Image) {
        throw new Error("Unable to read image data");
      }

      const result = await PlantService.identifyPlantFromImage(
        base64Image,
        "image/jpeg",
        "",
        selectedOrgan,
        selectedDataset
      );

      onPlantIdentified(result.plant, result.isOfflineResult, result.source);
    } catch (err: any) {
      console.warn("Upload processing error:", err);
      // Even if AI service fails, PlantService fallback will provide a match
      setUploadError("Processing image with offline botanical key...");
    } finally {
      setIsAnalyzing(false);
      // Reset input element value safely
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraSnapInputRef.current) cameraSnapInputRef.current.value = "";
    }
  };

  // Handle Photo File Upload from Filesystem / Gallery Input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // Quick Select Sample Plant
  const selectSamplePlant = (plant: PlantData) => {
    onPlantIdentified(
      plant,
      true,
      "Curated Botanical Taxonomy & Pharmacopoeia Reference"
    );
  };

  // Run Morphological Decision Key
  const handleMorphologyMatch = () => {
    const matches = PlantService.matchMorphologicalKey({
      leafShape: selectedLeafShape,
      flowerColor: selectedFlowerColor,
      margin: selectedMargin,
      stemType: selectedStemType,
      organClass: selectedOrgan === "auto" ? "any" : selectedOrgan,
    });

    if (matches.length > 0) {
      onPlantIdentified(
        matches[0],
        true,
        `Offline Morphological Key (${matches.length} species matched)`
      );
    }
  };

  const organOptions: { id: PlantNetOrgan | "auto"; label: string; icon: string; desc: string }[] = [
    { id: "auto", label: "Auto Morphology", icon: "⚡", desc: "Pl@ntNet-300K botanical morphology detector" },
    { id: "leaf", label: "Leaf", icon: "🌿", desc: "Foliage venation & margins" },
    { id: "flower", label: "Flower", icon: "🌸", desc: "Corolla & stamen symmetry" },
    { id: "fruit", label: "Fruit / Seed", icon: "🍎", desc: "Pericarp & seed pod" },
    { id: "bark", label: "Bark / Stem", icon: "🪵", desc: "Cortical fissures & wood" },
    { id: "habit", label: "Habit", icon: "🌳", desc: "Whole plant canopy structure" },
  ];

  return (
    <div id="camera-scanner-wrapper" className="flex flex-col gap-3">
      {/* Hidden File Inputs: Accessible in DOM without display:none obstruction */}
      {/* 1. Filesystem/Gallery picker (NO capture attribute = opens file manager / gallery) */}
      <input
        id="filesystem-file-input"
        ref={fileInputRef}
        type="file"
        accept="image/*,.jpg,.jpeg,.png,.webp,.heic,.bmp"
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          border: 0,
          opacity: 0,
          pointerEvents: "none",
        }}
        onChange={handleFileUpload}
      />

      {/* 2. Direct native camera trigger (with capture attribute) */}
      <input
        id="native-camera-snap-input"
        ref={cameraSnapInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          border: 0,
          opacity: 0,
          pointerEvents: "none",
        }}
        onChange={handleFileUpload}
      />

      {/* Top Feature Spotlight: Wild Salad Foraging, Botanical AI Bot, Grouping & Biodiversity, and Herb Lookup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-2.5 bg-[#161C1A] border border-[#2D3748] rounded-sm shadow-sm">
        {/* 1. Wild Salad & Foraging Explorer Spotlight */}
        {onOpenForager && (
          <button
            id="scanner-open-forager-card-btn"
            onClick={onOpenForager}
            className="flex items-center justify-between p-2.5 bg-[#0F1412] hover:bg-[#131D19] border border-emerald-500/40 hover:border-emerald-400 rounded-sm text-left transition-all cursor-pointer group shadow-sm"
            title="Open Himalayan Wild Salad & Reverse Foraging Index"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-sm bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                <Leaf className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-tight text-white group-hover:text-emerald-300">
                    Wild Salad &amp; Foraging
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xs">
                    4 Cats
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono line-clamp-1">
                  Reverse Index &amp; Salad Builder
                </span>
              </div>
            </div>
            <span className="text-emerald-400 font-mono text-xs group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </button>
        )}

        {/* 2. Plant Grouping Estimation & Biodiversity Check Spotlight */}
        {onOpenBiodiversity && (
          <button
            id="scanner-open-biodiversity-card-btn"
            onClick={onOpenBiodiversity}
            className="flex items-center justify-between p-2.5 bg-[#0F1412] hover:bg-[#131D19] border border-emerald-500/50 hover:border-emerald-400 rounded-sm text-left transition-all cursor-pointer group shadow-sm ring-1 ring-emerald-500/20"
            title="Open Plant Grouping Estimation, Population Statistics & Biodiversity Health Check"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-sm bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                <BarChart3 className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-tight text-white group-hover:text-emerald-300">
                    Grouping &amp; Biodiversity
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xs">
                    Survey
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono line-clamp-1">
                  Quadrat &amp; Population Stats
                </span>
              </div>
            </div>
            <span className="text-emerald-400 font-mono text-xs group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </button>
        )}

        {/* 3. Botanical AI Knowledge Bot Spotlight */}
        {onOpenChatbot && (
          <button
            id="scanner-open-chatbot-card-btn"
            onClick={onOpenChatbot}
            className="flex items-center justify-between p-2.5 bg-[#0F1412] hover:bg-[#131D19] border border-emerald-500/40 hover:border-emerald-400 rounded-sm text-left transition-all cursor-pointer group shadow-sm"
            title="Ask Plant Morphology Botanical AI (Leaves, Flowers, Fruits, Bark & Pharmacopoeia)"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-sm bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-tight text-white group-hover:text-emerald-300">
                    Botanical AI Bot
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xs">
                    AI
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono line-clamp-1">
                  Plant Morphology Diagnostics
                </span>
              </div>
            </div>
            <span className="text-emerald-400 font-mono text-xs group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </button>
        )}

        {/* 4. Fast Herb Search Trigger */}
        <button
          id="scanner-herb-lookup-trigger-btn"
          onClick={onOpenLookup}
          className="flex items-center justify-between p-2.5 bg-[#0F1412] hover:bg-[#131D19] border border-[#2D3748] hover:border-emerald-500/40 rounded-sm text-left transition-all cursor-pointer group shadow-sm"
          title="Lookup Herb by Common Name or Scientific Name (Online PlantNet API / Offline Pl@ntNet-300K)"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-slate-800 text-slate-300 flex items-center justify-center group-hover:scale-105 group-hover:bg-slate-700 group-hover:text-emerald-400 transition-all">
              <Search className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-tight text-white group-hover:text-emerald-300">
                  Lookup Herb
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 bg-black/40 text-slate-400 border border-slate-700 rounded-xs">
                  ⌘K
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono line-clamp-1">
                {isOnlineMode ? "PlantNet Online Mode" : "Pl@ntNet-300K Offline"}
              </span>
            </div>
          </div>
          <span className="text-slate-400 font-mono text-xs group-hover:translate-x-0.5 transition-transform">
            →
          </span>
        </button>
      </div>

      {/* Pl@ntNet-300K Plant Morphology & Dataset Targeting Bar */}
      <div className="flex flex-col gap-2 bg-[#161C1A] p-2.5 rounded-sm border border-[#2D3748]">
        {/* Plant Morphology Selector */}
        <div className="flex items-center justify-between flex-wrap gap-1.5">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 font-mono">
              Plant Morphology:
            </span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {organOptions.map((opt) => (
              <button
                id={`organ-btn-${opt.id}`}
                key={opt.id}
                onClick={() => setSelectedOrgan(opt.id)}
                className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-sm border transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                  selectedOrgan === opt.id
                    ? "bg-emerald-500 text-black border-emerald-400 shadow-sm"
                    : "bg-[#0F1412] text-slate-300 border-[#2D3748] hover:border-emerald-500/50 hover:text-emerald-300"
                }`}
                title={opt.desc}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dataset Targeting Selector */}
        <div className="flex items-center justify-between flex-wrap gap-1.5 pt-1.5 border-t border-[#2D3748]/60">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-300 font-mono">
              Dataset Index:
            </span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {[
              { id: "all", label: "All Datasets (8)", short: "ALL" },
              { id: "plantnet_300k", label: "NeurIPS 300K", short: "300K" },
              { id: "gbif_human_validated", label: "GBIF Validated", short: "GBIF-VAL" },
              { id: "gbif_auto_occurrences", label: "GBIF AI Occur", short: "GBIF-AI" },
              { id: "himalayan_flora", label: "Himalayan Flora", short: "HIMALAYA" },
              { id: "useful_plants", label: "Useful & Med", short: "MED-PLANTS" },
            ].map((ds) => (
              <button
                id={`dataset-filter-btn-${ds.id}`}
                key={ds.id}
                onClick={() => setSelectedDataset(ds.id as any)}
                className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-sm border transition-all whitespace-nowrap cursor-pointer ${
                  selectedDataset === ds.id
                    ? "bg-teal-500 text-slate-950 border-teal-400 font-bold shadow-sm"
                    : "bg-[#0F1412] text-slate-400 border-[#2D3748] hover:border-teal-500/50 hover:text-teal-300"
                }`}
                title={ds.label}
              >
                {ds.label}
              </button>
            ))}
            <button
              id="open-datasets-modal-btn"
              onClick={() => setIsDatasetsModalOpen(true)}
              className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-sm bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 whitespace-nowrap flex items-center gap-1 cursor-pointer"
            >
              <span>+ Datasets Hub</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-3 py-2 rounded-sm flex items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-amber-400 hover:text-white font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Scanner Viewport Box with Drag and Drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full aspect-4/3 sm:aspect-16/10 rounded-sm sm:rounded-md overflow-hidden bg-[#000000] border transition-all shadow-2xl ${
          dragOver
            ? "border-emerald-400 ring-2 ring-emerald-500/50 bg-emerald-950/20"
            : "border-[#2D3748]"
        }`}
      >
        {/* Drag over indicator overlay */}
        {dragOver && (
          <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-xs flex flex-col items-center justify-center text-emerald-300 z-30 pointer-events-none">
            <Upload className="w-12 h-12 animate-bounce text-emerald-400 mb-2" />
            <span className="font-bold text-sm uppercase tracking-wider font-mono">
              Drop Botanical Photo Here to Analyze
            </span>
          </div>
        )}

        {/* Subtle geometric dot matrix background when video inactive */}
        <div className="absolute inset-0 opacity-20 bg-[#0F1412] pointer-events-none" />

        {/* Live Video Element */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isCameraActive ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Torch Light Visual Filter */}
        {isTorchOn && (
          <div className="absolute inset-0 bg-emerald-300/10 pointer-events-none mix-blend-screen" />
        )}

        {/* Camera Inactive / Permission / Choice State */}
        {!isCameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0F1412]/95 text-slate-300 z-10">
            <div className="p-3 mb-3 bg-[#161C1A] border border-[#2D3748] text-emerald-400 rounded-sm">
              <Camera className="w-8 h-8 animate-pulse" />
            </div>
            
            <h3 className="text-base font-bold uppercase tracking-tight text-white mb-1">
              Botanical Camera Scanner & Photo Analyzer
            </h3>
            
            <p className="text-xs text-slate-400 max-w-md mb-4 font-mono leading-relaxed">
              {cameraError ? (
                <span className="text-amber-300">{cameraError}</span>
              ) : (
                "Scan plants in real-time or select/upload specimen photos directly from your device storage and photo gallery."
              )}
            </p>

            <div className="flex flex-wrap gap-2.5 justify-center">
              <button
                id="enable-camera-primary-btn"
                onClick={() => startCamera()}
                disabled={isInitializing}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-tight rounded-sm bg-emerald-500 hover:bg-emerald-400 text-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isInitializing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting Camera...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{cameraError ? "Retry Camera Access" : "Enable Live Camera"}</span>
                  </>
                )}
              </button>

              {/* Native Connected Upload Button via Label */}
              <label
                htmlFor="filesystem-file-input"
                id="browse-filesystem-btn"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-tight rounded-sm bg-[#1A2220] hover:bg-[#232f2c] text-emerald-300 border border-emerald-500/50 hover:border-emerald-400 transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                title="Browse Photos & Files from Storage"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <FolderOpen className="w-4 h-4 text-emerald-400" />
                <span>Upload Photo / Gallery</span>
              </label>

              {/* Native Connected Camera Snap via Label */}
              <label
                htmlFor="native-camera-snap-input"
                id="native-camera-snap-btn"
                onClick={() => cameraSnapInputRef.current?.click()}
                className="px-4 py-2.5 text-xs font-bold uppercase tracking-tight rounded-sm bg-[#161C1A] hover:bg-[#202926] text-slate-300 border border-[#2D3748] transition-all cursor-pointer flex items-center gap-1.5"
                title="Take Photo with Native Android Camera App"
              >
                <Camera className="w-3.5 h-3.5 text-slate-400" />
                <span>Camera Snap</span>
              </label>
            </div>

            {/* Hint for browser permission */}
            <div className="mt-4 text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Runs 100% locally on device. Drag-and-drop photos also supported.</span>
            </div>
          </div>
        )}

        {/* Geometric Balance HUD Reticle & Crosshairs */}
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none p-5 sm:p-7 flex flex-col justify-between z-10">
            {/* Top Bar Indicators */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-[#161C1A]/90 backdrop-blur-md px-3 py-1.5 rounded-sm border border-[#2D3748] text-[10px] font-mono uppercase tracking-widest text-emerald-400 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>FLORAMEDICA PRO • PL@NTNET-300K</span>
              </div>

              <div className="flex items-center gap-1.5 bg-[#161C1A]/90 backdrop-blur-md px-3 py-1.5 rounded-sm border border-[#2D3748] text-[10px] text-slate-300 font-mono">
                {isOnlineMode ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> AI Online
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" /> Offline Key Active
                  </span>
                )}
              </div>
            </div>

            {/* Target Geometric Reticle in Center */}
            <div className="relative mx-auto w-60 h-60 sm:w-80 sm:h-80 border border-emerald-500/30 flex items-center justify-center">
              {/* 4 Crisp Corner Accent Brackets */}
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-500" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-500" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-500" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-500" />

              {/* Geometric Crosshair Axis Lines */}
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-emerald-500/30" />
              <div className="absolute inset-y-0 left-1/2 w-[1px] bg-emerald-500/30" />

              {/* Active Laser Scan Line */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-[0_0_12px_#10b981]" />

              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 px-2 py-0.5 bg-[#0F1412]/80 border border-emerald-500/30 rounded-sm z-10">
                {selectedOrgan === "auto"
                  ? "Align Specimen Plant Morphology"
                  : `Align ${selectedOrgan.toUpperCase()} Morphology`}
              </span>
            </div>

            {/* Bottom HUD Metadata Bar */}
            <div className="flex justify-between items-end bg-[#0F1412]/80 p-2 sm:p-3 border border-[#2D3748]/80 backdrop-blur-sm rounded-sm">
              <div className="space-y-0.5">
                <div className="text-[9px] uppercase tracking-widest text-emerald-500 font-bold font-mono">
                  Zenodo Dataset 5645731 Benchmark
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Plant Morphology: {selectedOrgan.toUpperCase()} | 306K Specimen Benchmark | Top-K Candidate Set
                </div>
              </div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 flex items-center gap-1">
                <Database className="w-3 h-3" /> Pl@ntNet Active
              </div>
            </div>
          </div>
        )}

        {/* Analyzing Overlay Screen */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-[#0F1412]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white z-30">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <div className="absolute inset-2 border-2 border-emerald-400/30 border-b-emerald-300 animate-spin animate-reverse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <h4 className="text-sm font-bold uppercase tracking-tight text-emerald-400">
              Pl@ntNet-300K & Pharmacopoeial Analysis...
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs font-mono">
              Evaluating plant morphology priors, resolving label ambiguity via top-k candidates, and extracting Siddha/Sowa-Rigpa monographs.
            </p>
          </div>
        )}
      </div>

      {/* Geometric Camera Controls & Filesystem Shutter Bar */}
      <div className="flex items-center justify-between p-3 bg-[#161C1A] rounded-sm border border-[#2D3748] shadow-md gap-2 flex-wrap sm:flex-nowrap">
        {/* Left Action: Browse Filesystem / Gallery with Native Label Connection */}
        <label
          htmlFor="filesystem-file-input"
          id="upload-file-button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 text-emerald-300 hover:text-white bg-[#1A2220] hover:bg-[#232f2c] border border-emerald-500/40 hover:border-emerald-400 rounded-sm transition-all text-xs font-bold uppercase tracking-tight cursor-pointer shadow-xs"
          title="Upload / Browse Plant Photos from Filesystem / Gallery"
        >
          <Upload className="w-4 h-4 text-emerald-400" />
          <FolderOpen className="w-4 h-4 text-emerald-400" />
          <span>Upload / Gallery</span>
        </label>

        {/* Center Primary Capture Button */}
        <button
          id="capture-sample-btn"
          onClick={captureFrame}
          disabled={!isCameraActive || isAnalyzing}
          className={`bg-emerald-500 text-black px-6 py-2.5 font-bold uppercase text-xs sm:text-sm tracking-tight rounded-sm transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] ${
            !isCameraActive || isAnalyzing
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-emerald-400 cursor-pointer active:scale-95"
          }`}
          title="Capture Sample from Live Video"
        >
          <Camera className="w-4 h-4 text-black stroke-[2.5]" />
          <span>Capture Sample</span>
        </button>

        {/* Right Actions: Native Camera Snap, Torch & Flip */}
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="native-camera-snap-input"
            id="quick-camera-snap-action"
            onClick={() => cameraSnapInputRef.current?.click()}
            className="p-2 rounded-sm bg-[#1A2220] border border-[#2D3748] text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="Snap with Native Camera App"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
          </label>

          <button
            id="toggle-torch-btn"
            onClick={toggleTorch}
            className={`p-2 rounded-sm border transition-colors cursor-pointer ${
              isTorchOn
                ? "bg-emerald-500 text-black border-emerald-400"
                : "bg-[#1A2220] border-[#2D3748] text-slate-300 hover:text-white"
            }`}
            title="Toggle Flashlight / Torch"
          >
            {isTorchOn ? <Zap className="w-4 h-4 text-black" /> : <ZapOff className="w-4 h-4" />}
          </button>

          <button
            id="toggle-facing-mode-btn"
            onClick={toggleFacingMode}
            className="p-2 rounded-sm bg-[#1A2220] border border-[#2D3748] text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Flip Camera (Front/Back)"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Curated Botanical Specimens for Instant Offline Testing (Expanded 100+ Himalayan Database) */}
      <div className="flex flex-col gap-3 p-3.5 rounded-sm bg-[#161C1A] border border-[#2D3748]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              Instant Field Test Specimens ({FULL_BOTANICAL_DATABASE.length} Offline Plants)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="open-all-samples-modal-btn"
              onClick={() => setShowAllSamplesModal(true)}
              className="text-xs px-2.5 py-1 rounded-sm bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 font-bold uppercase tracking-tight transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              Browse All ({FULL_BOTANICAL_DATABASE.length})
            </button>
            <button
              id="toggle-morphology-key-btn"
              onClick={() => setShowMorphologyFilter(!showMorphologyFilter)}
              className="text-xs px-2.5 py-1 rounded-sm bg-[#0E1311] hover:bg-[#1A2220] border border-[#2D3748] text-slate-300 hover:text-emerald-300 flex items-center gap-1.5 font-bold uppercase tracking-tight transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {showMorphologyFilter ? "Hide Key" : "Taxonomic Key"}
            </button>
          </div>
        </div>

        {/* Category Pills & Quick Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { id: "himalayan", label: "🏔️ Himalayas (120+)" },
            { id: "edible", label: "🥗 Wild Foraging" },
            { id: "medicinal", label: "🌿 Sowa-Rigpa & Ayur" },
            { id: "sacred", label: "✨ Sacred & Ashtavarga" },
            { id: "all", label: `🌐 All (${FULL_BOTANICAL_DATABASE.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSampleCategory(tab.id as any)}
              className={`px-2.5 py-1 text-[11px] rounded-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                sampleCategory === tab.id
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                  : "bg-[#0E1311] text-slate-400 hover:text-slate-200 border border-[#2D3748]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Specimen Chips (Horizontal Scrollable) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {FULL_BOTANICAL_DATABASE
            .filter((p) => {
              if (sampleCategory === "himalayan") {
                return (
                  p.tags?.some((t) =>
                    /himalay|alpine|ladakh|tibet|sowa|ashtavarga|kashmir|spiti/i.test(t)
                  ) ||
                  /himalay|alpine|ladakh|tibet|kashmir|uttarakhand|spiti/i.test(p.habitat || "") ||
                  Boolean(p.tibetanName)
                );
              }
              if (sampleCategory === "edible") return p.edibility.isSafeForHumanConsumption;
              if (sampleCategory === "medicinal") return !p.edibility.isSafeForHumanConsumption || p.edibility.rating !== "Edible";
              if (sampleCategory === "sacred") {
                return p.tags?.some((t) => /sacred|ashtavarga|incense|dhoop|brahma/i.test(t));
              }
              return true;
            })
            .slice(0, 18)
            .map((plant) => (
              <button
                id={`specimen-chip-${plant.id}`}
                key={plant.id}
                onClick={() => selectSamplePlant(plant)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-sm bg-[#0E1311] hover:bg-[#1A2220] border border-[#2D3748] hover:border-emerald-500/60 text-left transition-all shrink-0 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
                  {plant.commonNames[0].charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#E2E8F0] group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                    {plant.commonNames[0]}
                  </span>
                  <span className="text-[10px] text-slate-400 italic whitespace-nowrap font-serif">
                    {plant.scientificName.split(" ").slice(0, 2).join(" ")}
                  </span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-sm font-mono uppercase tracking-wider font-bold border ${
                    plant.edibility.isSafeForHumanConsumption
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : plant.edibility.rating?.includes("Toxic")
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {plant.edibility.isSafeForHumanConsumption ? "Edible" : "Medicinal"}
                </span>
              </button>
            ))}
          <button
            onClick={() => setShowAllSamplesModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            + Explore All {FULL_BOTANICAL_DATABASE.length} Plants
          </button>
        </div>
      </div>

      {/* Modal to browse ALL 100+ Himalayan and Botanical Field Test Specimens */}
      {showAllSamplesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[90vh] bg-[#121816] border border-[#2D3748] rounded-sm flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#2D3748] flex items-center justify-between bg-[#161C1A]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#E2E8F0] flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  Field Test Specimens Library ({FULL_BOTANICAL_DATABASE.length} Offline Species)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select any authentic Himalayan or pharmacopoeia specimen to perform instant offline field testing, 3D morphology rendering & medicinal analysis.
                </p>
              </div>
              <button
                onClick={() => setShowAllSamplesModal(false)}
                className="w-8 h-8 rounded-sm bg-[#0E1311] border border-[#2D3748] hover:border-slate-500 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Search and Filters */}
            <div className="p-3 sm:p-4 border-b border-[#2D3748] bg-[#0E1311] flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={sampleSearchQuery}
                  onChange={(e) => setSampleSearchQuery(e.target.value)}
                  placeholder="Search Himalayan plants (Brahma Kamal, Kutki, Yartsa...)"
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-sm bg-[#161C1A] border border-[#2D3748] text-[#E2E8F0] placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
                {[
                  { id: "himalayan", label: "🏔️ Himalayas" },
                  { id: "edible", label: "🥗 Wild Foraging" },
                  { id: "medicinal", label: "🌿 Medicinal" },
                  { id: "sacred", label: "✨ Sacred" },
                  { id: "all", label: "🌐 All" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSampleCategory(tab.id as any)}
                    className={`px-3 py-1 text-xs rounded-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      sampleCategory === tab.id
                        ? "bg-emerald-500 text-slate-950 font-bold"
                        : "bg-[#161C1A] text-slate-400 hover:text-slate-200 border border-[#2D3748]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Grid of Specimens */}
            <div className="p-4 sm:p-5 overflow-y-auto max-h-[60vh] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 scrollbar-thin">
              {FULL_BOTANICAL_DATABASE
                .filter((p) => {
                  if (sampleCategory === "himalayan") {
                    const isHim =
                      p.tags?.some((t) =>
                        /himalay|alpine|ladakh|tibet|sowa|ashtavarga|kashmir|spiti/i.test(t)
                      ) ||
                      /himalay|alpine|ladakh|tibet|kashmir|uttarakhand|spiti/i.test(p.habitat || "") ||
                      Boolean(p.tibetanName);
                    if (!isHim) return false;
                  } else if (sampleCategory === "edible") {
                    if (!p.edibility.isSafeForHumanConsumption) return false;
                  } else if (sampleCategory === "medicinal") {
                    if (p.edibility.isSafeForHumanConsumption && p.edibility.rating === "Edible") return false;
                  } else if (sampleCategory === "sacred") {
                    const isSacred = p.tags?.some((t) => /sacred|ashtavarga|incense|dhoop|brahma/i.test(t));
                    if (!isSacred) return false;
                  }

                  if (sampleSearchQuery.trim()) {
                    const q = sampleSearchQuery.toLowerCase();
                    const match =
                      p.commonNames.some((cn) => cn.toLowerCase().includes(q)) ||
                      p.scientificName.toLowerCase().includes(q) ||
                      (p.sanskritName && p.sanskritName.toLowerCase().includes(q)) ||
                      (p.tibetanName && p.tibetanName.toLowerCase().includes(q)) ||
                      (p.teluguName && p.teluguName.toLowerCase().includes(q)) ||
                      p.family.toLowerCase().includes(q) ||
                      p.tags?.some((t) => t.toLowerCase().includes(q));
                    if (!match) return false;
                  }
                  return true;
                })
                .map((plant) => (
                  <button
                    key={plant.id}
                    onClick={() => {
                      setShowAllSamplesModal(false);
                      selectSamplePlant(plant);
                    }}
                    className="p-3 rounded-sm bg-[#161C1A] hover:bg-[#1C2522] border border-[#2D3748] hover:border-emerald-500/70 text-left transition-all flex flex-col justify-between gap-2 group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-[#E2E8F0] group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {plant.commonNames[0]}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-sm font-mono uppercase font-bold border shrink-0 ${
                            plant.edibility.isSafeForHumanConsumption
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : plant.edibility.rating?.includes("Toxic")
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {plant.edibility.isSafeForHumanConsumption ? "Edible" : "Medicinal"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 italic font-serif line-clamp-1">
                        {plant.scientificName}
                      </p>
                      {plant.tibetanName && (
                        <p className="text-[10px] text-amber-300/80 font-mono mt-0.5 line-clamp-1">
                          {plant.tibetanName}
                        </p>
                      )}
                      {plant.teluguName && (
                        <p className="text-[10px] text-emerald-300/80 mt-0.5 line-clamp-1">
                          {plant.teluguName}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#2D3748]/60 text-[10px] text-slate-500 font-mono">
                      <span>{plant.family}</span>
                      <span className="text-emerald-400 group-hover:underline">Test Sample →</span>
                    </div>
                  </button>
                ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[#2D3748] bg-[#161C1A] flex items-center justify-between text-xs text-slate-400">
              <span>Showing filtered specimens from offline database</span>
              <button
                onClick={() => setShowAllSamplesModal(false)}
                className="px-4 py-1.5 rounded-sm bg-[#0E1311] border border-[#2D3748] hover:border-slate-400 text-slate-200 text-xs font-bold cursor-pointer"
              >
                Close Library
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Morphological Key Drawer / Feature Matcher */}
      {showMorphologyFilter && (
        <div id="morphology-key-drawer" className="p-4 sm:p-5 rounded-sm bg-[#161C1A] border border-[#2D3748] text-[#E2E8F0] flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#2D3748] pb-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Offline Morphological Taxonomic Key
            </h4>
            <span className="text-[10px] text-slate-400 font-mono uppercase">
              Feature Matching Engine
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label htmlFor="morphology-leaf-shape" className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 tracking-wider font-mono">
                Leaf Shape
              </label>
              <select
                id="morphology-leaf-shape"
                value={selectedLeafShape}
                onChange={(e) => setSelectedLeafShape(e.target.value)}
                className="w-full bg-[#0F1412] border border-[#2D3748] rounded-sm p-2 text-xs text-[#E2E8F0] focus:border-emerald-500 outline-none"
              >
                <option value="any">Any Shape</option>
                <option value="cordate">Cordate (Heart-shaped)</option>
                <option value="reniform">Reniform (Kidney-shaped)</option>
                <option value="ovate">Ovate / Elliptic</option>
                <option value="lanceolate">Lanceolate (Spear-shaped)</option>
                <option value="pinnate">Pinnate / Compound</option>
                <option value="peltate">Peltate (Shield/Lotus)</option>
              </select>
            </div>

            <div>
              <label htmlFor="morphology-flower-color" className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 tracking-wider font-mono">
                Flower Color
              </label>
              <select
                id="morphology-flower-color"
                value={selectedFlowerColor}
                onChange={(e) => setSelectedFlowerColor(e.target.value)}
                className="w-full bg-[#0F1412] border border-[#2D3748] rounded-sm p-2 text-xs text-[#E2E8F0] focus:border-emerald-500 outline-none"
              >
                <option value="any">Any Flower Color</option>
                <option value="white">White / Cream</option>
                <option value="pink">Pink / Rose</option>
                <option value="purple">Purple / Lilac</option>
                <option value="yellow">Yellow / Gold</option>
                <option value="red">Crimson / Red</option>
              </select>
            </div>

            <div>
              <label htmlFor="morphology-margin" className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 tracking-wider font-mono">
                Leaf Margin
              </label>
              <select
                id="morphology-margin"
                value={selectedMargin}
                onChange={(e) => setSelectedMargin(e.target.value as any)}
                className="w-full bg-[#0F1412] border border-[#2D3748] rounded-sm p-2 text-xs text-[#E2E8F0] focus:border-emerald-500 outline-none"
              >
                <option value="any">Any Margin</option>
                <option value="serrate">Serrate / Toothed</option>
                <option value="entire">Entire (Smooth edge)</option>
              </select>
            </div>

            <div>
              <label htmlFor="morphology-stem-type" className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 tracking-wider font-mono">
                Growth Habit
              </label>
              <select
                id="morphology-stem-type"
                value={selectedStemType}
                onChange={(e) => setSelectedStemType(e.target.value as any)}
                className="w-full bg-[#0F1412] border border-[#2D3748] rounded-sm p-2 text-xs text-[#E2E8F0] focus:border-emerald-500 outline-none"
              >
                <option value="any">Any Habit</option>
                <option value="climber">Climber / Creeper Liana</option>
                <option value="herb">Herb / Small Subshrub</option>
                <option value="shrub">Woody Shrub</option>
                <option value="tree">Canopy Tree</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-1">
            <button
              id="match-offline-taxon-btn"
              onClick={handleMorphologyMatch}
              className="px-5 py-2 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-tight text-xs transition-all shadow-md cursor-pointer"
            >
              Match Offline Taxon Key
            </button>
          </div>
        </div>
      )}

      {/* Pl@ntNet Datasets Repository Modal */}
      <PlantNetDatasetsModal
        isOpen={isDatasetsModalOpen}
        onClose={() => setIsDatasetsModalOpen(false)}
        onSelectDatasetForScanning={(datasetId) => setSelectedDataset(datasetId)}
        onSelectPlant={(plant) => selectSamplePlant(plant)}
      />
    </div>
  );
};
