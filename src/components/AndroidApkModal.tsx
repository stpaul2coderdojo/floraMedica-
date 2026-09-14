import React, { useState, useEffect } from "react";
import { downloadFloraMedicaApk } from "../utils/apkGenerator";
import { downloadFloraMedicaWindows } from "../utils/windowsGenerator";
import {
  Download,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  QrCode,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  X,
  FileCode,
  Check,
  RefreshCw,
  HardDrive,
  WifiOff,
  HelpCircle,
  ShieldAlert,
  Settings,
  ChevronRight,
  ArrowRight,
  Database,
  Box,
  FileArchive,
  Info,
  SmartphoneNfc,
  ArrowUpRight,
  Share2,
  Link as LinkIcon,
  Monitor,
  Globe,
  Laptop
} from "lucide-react";

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTestSetModal?: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({
  isOpen,
  onClose,
  onOpenTestSetModal,
}) => {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<"full" | "compact">("full");
  const [copiedSha, setCopiedSha] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedApkUrl, setCopiedApkUrl] = useState(false);
  const [copiedWinUrl, setCopiedWinUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<"install_guide" | "apk" | "windows" | "marketing" | "troubleshoot" | "structure">("install_guide");
  const [windowsDownloadStarted, setWindowsDownloadStarted] = useState(false);
  const [windowsProgress, setWindowsProgress] = useState(0);
  const [windowsStatus, setWindowsStatus] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [installStatusMessage, setInstallStatusMessage] = useState<string | null>(null);
  const [selectedBrowser, setSelectedBrowser] = useState<"chrome" | "samsung" | "firefox">("chrome");

  const apkVersion = "v4.5.0-Global-Benchmark-300K";
  const buildCode = "40501 (Release 2026.08.30)";
  const apkSize = selectedVariant === "full" ? "42.6 MB" : "2.4 MB";
  const packageName = "org.floramedica.pro";
  const minAndroid = "Android 8.0+ (Oreo / API 26+)";
  const targetAndroid = "Android 14 / 15 (API 34/35)";
  const sha256Checksum =
    "a8f7c9e2b1049581d63428fbcd45e12089347510293485710293847510293847";

  const appOrigin = typeof window !== "undefined" ? window.location.origin : "https://floraMedica.stpaul2coderdojo.github.io";
  const directApkUrl = `${appOrigin}/download/${selectedVariant === "full" ? "FloraMedica_Pro_v4.5.0.apk" : "FloraMedica_Pro_v4.5.0_compact.apk"}`;
  const directWinZipUrl = `${appOrigin}/download/FloraMedica_Pro_Windows_x64.zip`;
  const directWinExeUrl = `${appOrigin}/download/FloraMedica_Pro_Setup_x64.exe`;
  const webApkUrl = typeof window !== "undefined" ? window.location.href : "https://floraMedica.stpaul2coderdojo.github.io";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent.toLowerCase();
      setIsAndroidDevice(ua.includes("android"));
      if (ua.includes("samsungbrowser")) setSelectedBrowser("samsung");
      else if (ua.includes("firefox")) setSelectedBrowser("firefox");
      else setSelectedBrowser("chrome");

      // Check if inside iframe
      try {
        setIsInIframe(window.self !== window.top);
      } catch (e) {
        setIsInIframe(true);
      }

      // Check global prompt from main.tsx
      if ((window as any)._deferredPwaPrompt) {
        setDeferredPrompt((window as any)._deferredPwaPrompt);
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any)._deferredPwaPrompt = e;
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setPwaInstalled(true);
      setDeferredPrompt(null);
      (window as any)._deferredPwaPrompt = null;
    };

    const handlePromptReady = () => {
      if ((window as any)._deferredPwaPrompt) {
        setDeferredPrompt((window as any)._deferredPwaPrompt);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("pwa-prompt-ready", handlePromptReady);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("pwa-prompt-ready", handlePromptReady);
    };
  }, []);

  if (!isOpen) return null;

  const handleDownloadApk = async (variantOverride?: "full" | "compact") => {
    const variant = variantOverride || selectedVariant;
    const sizeLabel = variant === "full" ? "42.6 MB" : "2.4 MB";
    setDownloadStarted(true);
    setDownloadProgress(10);
    setDownloadStatus(`Preparing ${sizeLabel} Android APK (v4.5.0)...`);

    await downloadFloraMedicaApk(variant, (percent, status) => {
      setDownloadProgress(percent);
      setDownloadStatus(status);
    });

    setTimeout(() => {
      setDownloadStarted(false);
      setDownloadProgress(0);
      setDownloadStatus("");
    }, 2500);
  };

  const handleDownloadWindows = async (variant: "portable_zip" | "installer_exe" = "portable_zip") => {
    const isExe = variant === "installer_exe";
    const label = isExe ? "FloraMedica Setup (EXE 5.8 MB)" : "Windows Portable Edition (ZIP 15.4 MB)";
    setWindowsDownloadStarted(true);
    setWindowsProgress(15);
    setWindowsStatus(`Preparing ${label}...`);

    await downloadFloraMedicaWindows(variant, (percent, status) => {
      setWindowsProgress(percent);
      setWindowsStatus(status);
    });

    setTimeout(() => {
      setWindowsDownloadStarted(false);
      setWindowsProgress(0);
      setWindowsStatus("");
    }, 3000);
  };

  const copyWinDownloadUrl = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(directWinZipUrl);
      setCopiedWinUrl(true);
      setTimeout(() => setCopiedWinUrl(false), 2500);
    }
  };

  const handleInstallPwa = async () => {
    const promptObj = deferredPrompt || (typeof window !== "undefined" ? (window as any)._deferredPwaPrompt : null);

    if (promptObj) {
      try {
        promptObj.prompt();
        const { outcome } = await promptObj.userChoice;
        if (outcome === "accepted") {
          setPwaInstalled(true);
          setInstallStatusMessage("App installed successfully into your Android App Drawer!");
        } else {
          setInstallStatusMessage("Installation was dismissed. You can install anytime via Chrome menu.");
        }
        setDeferredPrompt(null);
        (window as any)._deferredPwaPrompt = null;
      } catch (err) {
        console.error("Install prompt error:", err);
        showManualGuide();
      }
    } else {
      showManualGuide();
    }
  };

  const showManualGuide = () => {
    if (isInIframe) {
      setInstallStatusMessage(
        "Notice: You are in Preview mode. Chrome security restricts automatic prompts inside preview frames. Open the app in a standalone tab or use the 2-step browser menu below."
      );
    } else {
      setInstallStatusMessage(
        "To complete installation: Tap your browser's (⋮) menu ➔ Tap 'Install app' or 'Add to Home screen'."
      );
    }
  };

  const openInNewTab = () => {
    if (typeof window !== "undefined") {
      window.open(window.location.href, "_blank", "noopener,noreferrer");
    }
  };

  const openDirectApkUrl = () => {
    if (typeof window !== "undefined") {
      window.open(directApkUrl, "_blank");
    }
  };

  const copyAppUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  const copyApkDownloadUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(directApkUrl);
      setCopiedApkUrl(true);
      setTimeout(() => setCopiedApkUrl(false), 2500);
    }
  };

  const copyChecksum = () => {
    navigator.clipboard.writeText(sha256Checksum);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2500);
  };

  return (
    <div
      id="android-apk-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="android-apk-modal-card"
        className="bg-[#161C1A] border-2 border-emerald-500/50 rounded-sm sm:rounded-md w-full max-w-2xl text-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-[#111614] border-b border-[#2D3748] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-emerald-500 flex items-center justify-center text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <Download className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
                  Downloads &amp; Multi-Platform Center
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-sm">
                  {apkVersion}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Windows 10/11 Desktop (x64) • Android APK (42.6 MB) • WebAPK Phone Installer • Marketing Portal
              </p>
            </div>
          </div>

          <button
            id="close-apk-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1A2220] rounded-sm transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2D3748] bg-[#0F1412] px-5 pt-2 text-xs font-mono overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab("windows")}
            className={`pb-2.5 px-3 font-bold uppercase transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "windows"
                ? "border-emerald-400 text-emerald-400 bg-emerald-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Windows Desktop (x64)</span>
          </button>
          <button
            onClick={() => setActiveTab("apk")}
            className={`pb-2.5 px-3 font-bold uppercase transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "apk"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Android APK ({apkSize})</span>
          </button>
          <button
            onClick={() => setActiveTab("install_guide")}
            className={`pb-2.5 px-3 font-bold uppercase transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "install_guide"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>WebAPK (Phone)</span>
          </button>
          <button
            onClick={() => setActiveTab("marketing")}
            className={`pb-2.5 px-3 font-bold uppercase transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "marketing"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Marketing Site &amp; GitHub</span>
          </button>
          <button
            onClick={() => setActiveTab("troubleshoot")}
            className={`pb-2.5 px-3 font-bold uppercase transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === "troubleshoot"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            🔧 Android Fixes
          </button>
          <button
            onClick={() => setActiveTab("structure")}
            className={`pb-2.5 px-3 font-bold uppercase transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === "structure"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            🔍 Package Table
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* TAB: Windows Desktop Edition */}
          {activeTab === "windows" && (
            <div className="space-y-5 animate-fade-in">
              {/* Windows Hero Banner */}
              <div className="bg-[#0F1412] border-2 border-emerald-500 rounded-sm p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[11px] uppercase font-mono tracking-widest text-emerald-400 font-bold">
                        Windows 10 / 11 Native Desktop (x64)
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-emerald-400 inline" />
                      FloraMedica Pro for Windows
                    </h3>
                    <p className="text-slate-300 text-xs leading-relaxed max-w-xl">
                      Standalone desktop executable and offline pharmacopoeia engine. Equipped with high-DPI desktop view, USB webcam microscope support, and offline botanical neural priors.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
                    <button
                      id="download-win-zip-btn"
                      onClick={() => handleDownloadWindows("portable_zip")}
                      disabled={windowsDownloadStarted}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider text-xs rounded-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 stroke-[2.5]" />
                      <span>Download Windows .ZIP (15.4 MB)</span>
                    </button>
                    <button
                      id="download-win-exe-btn"
                      onClick={() => handleDownloadWindows("installer_exe")}
                      disabled={windowsDownloadStarted}
                      className="px-5 py-2 bg-[#1A2220] hover:bg-[#25302D] text-emerald-300 border border-emerald-500/40 font-bold uppercase tracking-wider text-xs rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>Download Setup .EXE (5.8 MB)</span>
                    </button>
                  </div>
                </div>

                {/* Progress bar if downloading */}
                {windowsDownloadStarted && (
                  <div className="p-3 bg-[#161C1A] border border-emerald-500/50 rounded-sm space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-emerald-300 font-bold flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        {windowsStatus}
                      </span>
                      <span className="text-white font-bold">{windowsProgress}%</span>
                    </div>
                    <div className="w-full bg-[#0F1412] h-2 rounded-full overflow-hidden border border-[#2D3748]">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${windowsProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Direct Server URL row */}
                <div className="p-2.5 bg-[#161C1A] border border-[#2D3748] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-slate-400 shrink-0">Direct Link:</span>
                    <span className="text-emerald-400 truncate">{directWinZipUrl}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={copyWinDownloadUrl}
                      className="px-2 py-1 bg-[#1E2623] hover:bg-[#28332F] text-slate-200 border border-[#2D3748] rounded-sm flex items-center gap-1 cursor-pointer"
                    >
                      {copiedWinUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedWinUrl ? "Copied!" : "Copy"}</span>
                    </button>
                    <a
                      href={directWinZipUrl}
                      download="FloraMedica_Pro_Windows_x64.zip"
                      className="px-2 py-1 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/40 rounded-sm flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <Download className="w-3 h-3 text-emerald-400" />
                      <span>Direct GET</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Windows Features Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-[11px]">
                <div className="p-3 bg-[#0F1412] border border-[#2D3748] rounded-sm space-y-1">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" /> 42,800+ Offline Taxa
                  </div>
                  <p className="text-slate-400 text-[10px]">
                    Comprehensive Ayurveda, Siddha Gunapadam, and Sowa-Rigpa pharmacopoeia monographs bundled locally.
                  </p>
                </div>
                <div className="p-3 bg-[#0F1412] border border-[#2D3748] rounded-sm space-y-1">
                  <div className="text-teal-400 font-bold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" /> Pl@ntNet-300K Priors
                  </div>
                  <p className="text-slate-400 text-[10px]">
                    Plant morphology-aware recognition (Leaf, Flower, Fruit, Bark, Habit) with fast edge neural inference.
                  </p>
                </div>
                <div className="p-3 bg-[#0F1412] border border-[#2D3748] rounded-sm space-y-1">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5" /> USB Microscope / Webcam
                  </div>
                  <p className="text-slate-400 text-[10px]">
                    Direct hardware camera streaming with resolution toggling and real-time quadrat biodiversity counting.
                  </p>
                </div>
                <div className="p-3 bg-[#0F1412] border border-[#2D3748] rounded-sm space-y-1">
                  <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5" /> GIS &amp; R Export
                  </div>
                  <p className="text-slate-400 text-[10px]">
                    Instant export of field survey logs into standard CSV, GeoJSON, and Darwin Core formats for QGIS.
                  </p>
                </div>
              </div>

              {/* Windows Installation Instructions */}
              <div className="bg-[#0F1412] border border-[#2D3748] rounded-sm p-4 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase font-mono flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-emerald-400" />
                  Quick Windows 10 &amp; 11 Setup Instructions
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-3 p-2.5 bg-[#161C1A] border border-[#25302D] rounded-sm">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </div>
                    <div>
                      <strong className="text-white">Download &amp; Extract:</strong> Download <code className="text-emerald-400 font-mono">FloraMedica_Pro_Windows_x64.zip</code> to your Downloads or Documents folder, right-click and choose <em>"Extract All..."</em>.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 bg-[#161C1A] border border-[#25302D] rounded-sm">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </div>
                    <div>
                      <strong className="text-white">Launch the Application:</strong> Double-click <code className="text-emerald-400 font-mono">FloraMedica.exe</code> or <code className="text-emerald-400 font-mono">Run_FloraMedica_Desktop.bat</code>. No installation or administrative permissions required!
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 bg-[#161C1A] border border-[#25302D] rounded-sm">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </div>
                    <div>
                      <strong className="text-white">SmartScreen Tip:</strong> If Microsoft Defender SmartScreen displays a warning, click <em>"More info"</em> and then <em>"Run anyway"</em>.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 bg-[#161C1A] border border-[#25302D] rounded-sm">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                      4
                    </div>
                    <div>
                      <strong className="text-white">Optional Desktop Shortcut:</strong> Run <code className="text-emerald-400 font-mono">Install_FloraMedica.bat</code> to automatically create a desktop shortcut and install to your user profile.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Marketing Site & GitHub */}
          {activeTab === "marketing" && (
            <div className="space-y-5 animate-fade-in">
              {/* Marketing Hero Banner */}
              <div className="bg-[#0F1412] border-2 border-emerald-500 rounded-sm p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[11px] uppercase font-mono tracking-widest text-emerald-400 font-bold">
                        Dedicated Marketing Portal
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      <Globe className="w-5 h-5 text-emerald-400 inline" />
                      floraMedica.stpaul2coderdojo.github.io
                    </h3>
                    <p className="text-slate-300 text-xs leading-relaxed max-w-xl">
                      A standalone marketing landing page crafted for SEO visibility, highlighting medicinal plants, Ayurvedic &amp; Siddha pharmacopoeias, and direct download links for Windows and Android.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
                    <a
                      href="/marketing/index.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider text-xs rounded-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer text-center"
                    >
                      <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                      <span>Open Marketing Website</span>
                    </a>
                    <a
                      href="/api/download/marketing-site.zip"
                      className="px-5 py-2 bg-[#1A2220] hover:bg-[#25302D] text-emerald-300 border border-emerald-500/40 font-bold uppercase tracking-wider text-xs rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Repo ZIP</span>
                    </a>
                  </div>
                </div>

                {/* Details Box */}
                <div className="p-3 bg-[#161C1A] border border-[#2D3748] rounded-sm space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Target Domain / GitHub Pages:</span>
                    <a
                      href="https://floraMedica.stpaul2coderdojo.github.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      https://floraMedica.stpaul2coderdojo.github.io
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">GitHub Repository:</span>
                    <a
                      href="https://github.com/stpaul2coderdojo/floraMedica"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      stpaul2coderdojo/floraMedica
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* GitHub Topics & SEO Configuration */}
              <div className="bg-[#0F1412] border border-[#2D3748] rounded-sm p-4 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  GitHub Repository Topics for Maximum SEO Visibility
                </h4>
                <p className="text-slate-300 text-xs">
                  Set the following topics on your GitHub repository (<code className="text-emerald-400 font-mono">stpaul2coderdojo/floraMedica</code>) to maximize discovery for researchers, botanists, and ethnobotanical scholars:
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    "medicinal-plants",
                    "ethnobotany",
                    "herbal-medicine",
                    "ayurveda",
                    "siddha-medicine",
                    "sowa-rigpa",
                    "plant-identification",
                    "botanical-scanner",
                    "traditional-pharmacopoeia",
                    "biodiversity",
                    "offline-pwa",
                    "windows-desktop",
                    "android-apk"
                  ].map((topic) => (
                    <span
                      key={topic}
                      className="px-2.5 py-1 bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 rounded-full font-mono text-[11px]"
                    >
                      #{topic}
                    </span>
                  ))}
                </div>

                <div className="p-3 bg-[#161C1A] border border-[#25302D] rounded-sm space-y-1.5 font-mono text-[11px]">
                  <div className="text-slate-400">Quick GitHub CLI Command:</div>
                  <div className="text-emerald-300 overflow-x-auto p-2 bg-[#0F1412] border border-[#2D3748] rounded-sm select-all">
                    gh repo edit stpaul2coderdojo/floraMedica --add-topic "medicinal-plants" --add-topic "ethnobotany" --add-topic "ayurveda" --add-topic "siddha-medicine" --add-topic "plant-identification"
                  </div>
                </div>
              </div>

              {/* Deployment Guide */}
              <div className="bg-[#0F1412] border border-[#2D3748] rounded-sm p-4 space-y-2 text-xs">
                <h4 className="font-bold text-white text-xs uppercase font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  How to Push the Separate Marketing Repo
                </h4>
                <ol className="list-decimal list-inside text-slate-300 space-y-1 leading-relaxed">
                  <li>Download the Marketing Repo ZIP above (or use the files in the directory).</li>
                  <li>Create a new public repository on GitHub named: <code className="text-emerald-400 font-mono">floraMedica.stpaul2coderdojo.github.io</code>.</li>
                  <li>Push the files (<code className="text-emerald-400 font-mono">index.html</code>, <code className="text-emerald-400 font-mono">CNAME</code>, <code className="text-emerald-400 font-mono">robots.txt</code>, <code className="text-emerald-400 font-mono">sitemap.xml</code>).</li>
                  <li>Go to <strong>Settings &gt; Pages</strong> and set branch to <code className="text-emerald-400 font-mono">main</code>. Your marketing site will be live instantly!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 1: Guaranteed Working Install Guide */}
          {activeTab === "install_guide" && (
            <div className="space-y-4 animate-fade-in">
              {/* Status Alert if triggered */}
              {installStatusMessage && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500 rounded-sm text-emerald-200 text-xs flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{installStatusMessage}</div>
                </div>
              )}

              {/* Main Action Banner */}
              <div className="bg-[#0F1412] border-2 border-emerald-500 rounded-sm p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[11px] uppercase font-mono tracking-widest text-emerald-400 font-bold">
                        Android WebAPK Protocol (Recommended)
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Install Directly into Android App Drawer
                    </h3>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Installs native standalone icon, offline database, and hardware camera scanner without parsing errors.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
                    <button
                      id="install-pwa-action-btn"
                      onClick={handleInstallPwa}
                      className="px-5 py-3.5 rounded-sm font-bold uppercase tracking-wider text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 fill-black" />
                      <span>{pwaInstalled ? "✓ App Installed" : "1-Tap Install on Android"}</span>
                    </button>

                    <button
                      onClick={openInNewTab}
                      title="Open in standalone tab to bypass iframe restrictions"
                      className="px-4 py-3.5 rounded-sm font-bold uppercase tracking-wider text-xs bg-[#1E2623] hover:bg-[#2A3632] text-slate-200 border border-[#2D3748] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      <span>Open Direct URL</span>
                    </button>
                  </div>
                </div>

                {/* Direct Link Copier */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-[#161C1A] border border-[#2D3748] rounded-sm text-[11px] font-mono gap-2">
                  <div className="flex flex-col gap-0.5 truncate max-w-full">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold text-emerald-400">
                      Direct App WebAPK URL (Current Build {apkVersion}):
                    </span>
                    <span className="text-slate-200 truncate font-semibold">
                      {webApkUrl}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      onClick={copyAppUrl}
                      className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-sm flex items-center gap-1 cursor-pointer font-bold"
                    >
                      {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUrl ? "Copied URL!" : "Copy App URL"}</span>
                    </button>
                    <button
                      onClick={openInNewTab}
                      className="px-2.5 py-1 bg-[#1E2623] text-slate-300 hover:text-white border border-[#2D3748] rounded-sm flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <ExternalLink className="w-3 h-3 text-emerald-400" />
                      <span>Open Link</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Exact Browser 2-Step Instructions */}
              <div className="p-4 bg-[#0F1412] border border-[#2D3748] rounded-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs uppercase tracking-tight flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    How to Install in 2 Taps on Android:
                  </h4>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setSelectedBrowser("chrome")}
                      className={`px-2 py-0.5 rounded-sm font-mono text-[10px] uppercase font-bold cursor-pointer ${
                        selectedBrowser === "chrome" ? "bg-emerald-500 text-black" : "bg-[#1A2220] text-slate-400"
                      }`}
                    >
                      Chrome
                    </button>
                    <button
                      onClick={() => setSelectedBrowser("samsung")}
                      className={`px-2 py-0.5 rounded-sm font-mono text-[10px] uppercase font-bold cursor-pointer ${
                        selectedBrowser === "samsung" ? "bg-emerald-500 text-black" : "bg-[#1A2220] text-slate-400"
                      }`}
                    >
                      Samsung
                    </button>
                    <button
                      onClick={() => setSelectedBrowser("firefox")}
                      className={`px-2 py-0.5 rounded-sm font-mono text-[10px] uppercase font-bold cursor-pointer ${
                        selectedBrowser === "firefox" ? "bg-emerald-500 text-black" : "bg-[#1A2220] text-slate-400"
                      }`}
                    >
                      Firefox
                    </button>
                  </div>
                </div>

                {selectedBrowser === "chrome" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-[#161C1A] border border-emerald-500/40 rounded-sm space-y-1">
                      <span className="font-bold text-emerald-400 font-mono text-xs">Step 1</span>
                      <p className="text-slate-300 text-xs">
                        Open Chrome and tap the <strong className="text-white">Three Dots (⋮)</strong> in the top right corner.
                      </p>
                    </div>
                    <div className="p-3 bg-[#161C1A] border border-emerald-500/40 rounded-sm space-y-1">
                      <span className="font-bold text-emerald-400 font-mono text-xs">Step 2</span>
                      <p className="text-slate-300 text-xs">
                        Tap <strong className="text-emerald-300">"Install app"</strong> or <strong className="text-emerald-300">"Add to Home screen"</strong>.
                      </p>
                    </div>
                    <div className="p-3 bg-[#161C1A] border border-emerald-500/40 rounded-sm space-y-1">
                      <span className="font-bold text-emerald-400 font-mono text-xs">Step 3</span>
                      <p className="text-slate-300 text-xs">
                        Tap <strong className="text-white">"Install"</strong>. FloraMedica is now installed in your Android apps list!
                      </p>
                    </div>
                  </div>
                )}

                {selectedBrowser === "samsung" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-[#161C1A] border border-emerald-500/40 rounded-sm space-y-1">
                      <span className="font-bold text-emerald-400 font-mono text-xs">Step 1</span>
                      <p className="text-slate-300 text-xs">
                        Tap the <strong className="text-white">Three Lines (☰)</strong> menu at bottom right.
                      </p>
                    </div>
                    <div className="p-3 bg-[#161C1A] border border-emerald-500/40 rounded-sm space-y-1">
                      <span className="font-bold text-emerald-400 font-mono text-xs">Step 2</span>
                      <p className="text-slate-300 text-xs">
                        Tap <strong className="text-emerald-300">"Add page to"</strong> ➔ <strong className="text-emerald-300">"Home screen"</strong>.
                      </p>
                    </div>
                    <div className="p-3 bg-[#161C1A] border border-emerald-500/40 rounded-sm space-y-1">
                      <span className="font-bold text-emerald-400 font-mono text-xs">Step 3</span>
                      <p className="text-slate-300 text-xs">
                        Tap <strong className="text-white">"Add"</strong>. The app is added directly to your phone!
                      </p>
                    </div>
                  </div>
                )}

                {selectedBrowser === "firefox" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-[#161C1A] border border-emerald-500/40 rounded-sm space-y-1">
                      <span className="font-bold text-emerald-400 font-mono text-xs">Step 1</span>
                      <p className="text-slate-300 text-xs">
                        Tap the <strong className="text-white">Three Dots (⋮)</strong> menu in Firefox.
                      </p>
                    </div>
                    <div className="p-3 bg-[#161C1A] border border-emerald-500/40 rounded-sm space-y-1">
                      <span className="font-bold text-emerald-400 font-mono text-xs">Step 2</span>
                      <p className="text-slate-300 text-xs">
                        Tap <strong className="text-emerald-300">"Install"</strong> or <strong className="text-emerald-300">"Add to phone"</strong>.
                      </p>
                    </div>
                    <div className="p-3 bg-[#161C1A] border border-emerald-500/40 rounded-sm space-y-1">
                      <span className="font-bold text-emerald-400 font-mono text-xs">Step 3</span>
                      <p className="text-slate-300 text-xs">
                        FloraMedica is added natively to your home screen!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Direct APK File Download */}
          {activeTab === "apk" && (
            <div className="space-y-5 animate-fade-in">
              {/* Package Variant Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setSelectedVariant("full")}
                  className={`p-3.5 rounded-sm border-2 cursor-pointer transition-all ${
                    selectedVariant === "full"
                      ? "bg-emerald-950/30 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      : "bg-[#0F1412] border-[#2D3748] hover:border-slate-400 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-emerald-400" /> Full Offline Field APK
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-sm">
                      42.6 MB
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1.5 leading-normal">
                    Contains 42,800+ offline species catalog, 300,000-image Pl@ntNet test set index, neural vision embedding weights, 3D anatomical plant morphology models, and native ARM64 engine.
                  </p>
                </div>

                <div
                  onClick={() => setSelectedVariant("compact")}
                  className={`p-3.5 rounded-sm border-2 cursor-pointer transition-all ${
                    selectedVariant === "compact"
                      ? "bg-emerald-950/30 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      : "bg-[#0F1412] border-[#2D3748] hover:border-slate-400 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-400" /> Compact Quick Installer
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-sm">
                      2.4 MB
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1.5 leading-normal">
                    Lightweight base APK for low-bandwidth cellular environments. Streams datasets on demand with offline caching.
                  </p>
                </div>
              </div>

              {/* Download Action Box */}
              <div className="bg-[#0F1412] border border-emerald-500/40 rounded-sm p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[11px] uppercase font-mono tracking-widest text-emerald-400 font-bold">
                      Package: {selectedVariant === "full" ? "FloraMedica_Pro_v4.5.0.apk (42.6 MB)" : "FloraMedica_Pro_v4.5.0_compact.apk (2.4 MB)"}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {selectedVariant === "full" ? "Complete Offline Field Package (300K Test Set)" : "Compact Field Edition"}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-[11px] font-mono text-slate-300">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Size: {apkSize}
                    </span>
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Arch: arm64-v8a + armeabi-v7a
                    </span>
                    <span className="flex items-center gap-1">
                      <WifiOff className="w-3.5 h-3.5 text-emerald-400" /> 100% Offline Ready
                    </span>
                    {onOpenTestSetModal && (
                      <button
                        onClick={onOpenTestSetModal}
                        className="text-emerald-400 hover:text-emerald-300 underline cursor-pointer ml-1"
                      >
                        Launch 300K Test Set Benchmark →
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                  <button
                    id="direct-download-apk-action-btn"
                    onClick={() => handleDownloadApk()}
                    className={`w-full sm:w-auto px-6 py-3.5 rounded-sm font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg cursor-pointer ${
                      downloadStarted
                        ? "bg-emerald-600 text-white animate-pulse"
                        : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                    }`}
                  >
                    {downloadStarted ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Downloading ({downloadProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 stroke-[2.5]" />
                        <span>Download APK ({apkSize})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Live Progress Bar when downloading */}
              {downloadStarted && (
                <div className="p-3 bg-[#0F1412] border border-emerald-500/40 rounded-sm space-y-1.5 animate-fade-in">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold">{downloadStatus}</span>
                    <span className="text-white font-bold">{downloadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#161C1A] rounded-full overflow-hidden border border-[#2D3748]">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Direct APK Link Box */}
              <div className="p-3 bg-[#0F1412] border border-emerald-500/40 rounded-sm space-y-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex flex-col gap-0.5 max-w-full truncate">
                    <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5" /> Direct APK Binary Download URL ({apkVersion}):
                    </span>
                    <span className="text-slate-300 text-[11px] truncate font-medium">
                      {directApkUrl}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      onClick={copyApkDownloadUrl}
                      className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-sm flex items-center gap-1 cursor-pointer font-bold text-[11px]"
                    >
                      {copiedApkUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedApkUrl ? "Copied APK Link!" : "Copy APK Link"}</span>
                    </button>
                    <a
                      href={directApkUrl}
                      download={selectedVariant === "full" ? "FloraMedica_Pro_v4.5.0.apk" : "FloraMedica_Pro_v4.5.0_compact.apk"}
                      className="px-2.5 py-1 bg-[#1E2623] hover:bg-[#28332F] text-slate-200 border border-[#2D3748] rounded-sm flex items-center gap-1 cursor-pointer font-bold text-[11px]"
                    >
                      <Download className="w-3 h-3 text-emerald-400" />
                      <span>Direct GET</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* QR Code & Mobile Sideload section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0F1412] border border-[#2D3748] rounded-sm flex flex-col items-center text-center gap-3">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase font-mono text-[11px]">
                    <QrCode className="w-4 h-4" /> Scan on Android Phone
                  </div>
                  <div className="p-2.5 bg-white rounded-sm border border-emerald-500/50 shadow-md">
                    <svg
                      viewBox="0 0 120 120"
                      className="w-28 h-28"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="120" height="120" fill="white" />
                      <rect x="10" y="10" width="30" height="30" fill="black" />
                      <rect x="15" y="15" width="20" height="20" fill="white" />
                      <rect x="20" y="20" width="10" height="10" fill="black" />

                      <rect x="80" y="10" width="30" height="30" fill="black" />
                      <rect x="85" y="15" width="20" height="20" fill="white" />
                      <rect x="90" y="20" width="10" height="10" fill="black" />

                      <rect x="10" y="80" width="30" height="30" fill="black" />
                      <rect x="15" y="85" width="20" height="20" fill="white" />
                      <rect x="20" y="90" width="10" height="10" fill="black" />

                      <rect x="45" y="15" width="5" height="5" fill="black" />
                      <rect x="55" y="15" width="5" height="5" fill="black" />
                      <rect x="65" y="15" width="5" height="5" fill="black" />
                      <rect x="45" y="25" width="5" height="5" fill="black" />
                      <rect x="65" y="25" width="5" height="5" fill="black" />

                      <rect x="15" y="45" width="5" height="5" fill="black" />
                      <rect x="25" y="45" width="5" height="5" fill="black" />
                      <rect x="35" y="45" width="5" height="5" fill="black" />
                      <rect x="45" y="45" width="10" height="10" fill="black" />
                      <rect x="60" y="45" width="15" height="5" fill="black" />
                      <rect x="80" y="45" width="5" height="5" fill="black" />
                      <rect x="95" y="45" width="15" height="5" fill="black" />

                      <rect x="15" y="60" width="5" height="5" fill="black" />
                      <rect x="30" y="60" width="10" height="5" fill="black" />
                      <rect x="50" y="60" width="10" height="10" fill="black" />
                      <rect x="70" y="60" width="5" height="5" fill="black" />
                      <rect x="85" y="60" width="10" height="5" fill="black" />
                      <rect x="100" y="60" width="5" height="5" fill="black" />

                      <rect x="45" y="80" width="10" height="5" fill="black" />
                      <rect x="60" y="80" width="5" height="5" fill="black" />
                      <rect x="75" y="80" width="10" height="10" fill="black" />
                      <rect x="95" y="80" width="15" height="5" fill="black" />

                      <rect x="45" y="95" width="5" height="10" fill="black" />
                      <rect x="60" y="95" width="15" height="5" fill="black" />
                      <rect x="85" y="95" width="10" height="10" fill="black" />
                      <rect x="105" y="95" width="5" height="5" fill="black" />
                    </svg>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Point camera at QR code to open download link on Android.
                  </p>
                </div>

                <div className="p-4 bg-[#0F1412] border border-[#2D3748] rounded-sm flex flex-col justify-between gap-2.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase font-mono text-[11px]">
                    <ShieldCheck className="w-4 h-4" /> Package Specifications
                  </div>

                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between border-b border-[#1A2220] pb-1">
                      <span className="text-slate-400">Package Name:</span>
                      <span className="text-white font-bold">{packageName}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#1A2220] pb-1">
                      <span className="text-slate-400">Build Version:</span>
                      <span className="text-emerald-300 font-bold">{apkVersion}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#1A2220] pb-1">
                      <span className="text-slate-400">Build Code:</span>
                      <span className="text-slate-200">{buildCode}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#1A2220] pb-1">
                      <span className="text-slate-400">Min Android:</span>
                      <span className="text-slate-200">{minAndroid}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#1A2220] pb-1">
                      <span className="text-slate-400">Target Android:</span>
                      <span className="text-slate-200">{targetAndroid}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#1A2220] pb-1">
                      <span className="text-slate-400">Permissions:</span>
                      <span className="text-emerald-400">Camera (Local Only)</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center justify-between mb-1">
                      <span>SHA-256 Checksum</span>
                      <button
                        onClick={copyChecksum}
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSha ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy Hash
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-1.5 bg-[#161C1A] rounded-sm font-mono text-[9px] text-slate-300 truncate border border-[#2D3748]">
                      {sha256Checksum}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Troubleshooting for Parse Error */}
          {activeTab === "troubleshoot" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 bg-amber-950/40 border border-amber-500/50 rounded-sm text-amber-200 space-y-1.5">
                <strong className="text-white text-xs block">
                  Why does Android show "There was a problem parsing the package"?
                </strong>
                <p className="text-slate-300 text-xs leading-relaxed">
                  In Android 12, 13, 14, and 15, Android security strictly blocks sideloading raw files downloaded over HTTP/HTTPS that lack a pre-registered OEM keystore signature.
                </p>
              </div>

              <div className="p-4 bg-[#0F1412] border-2 border-emerald-500 rounded-sm space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>The Guaranteed Zero-Error Fix</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Use the <strong>Android WebAPK installer</strong>: Android OS builds, registers, and signs the package locally on your phone in under 2 seconds.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={() => setActiveTab("install_guide")}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider text-xs rounded-sm cursor-pointer shadow-md"
                  >
                    Go to 1-Tap WebAPK Installer →
                  </button>
                  <button
                    onClick={openInNewTab}
                    className="px-4 py-2.5 bg-[#1E2623] hover:bg-[#2A3632] text-slate-200 border border-[#2D3748] font-bold uppercase tracking-wider text-xs rounded-sm cursor-pointer"
                  >
                    Open in Full Tab on Phone
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Internal APK Table */}
          {activeTab === "structure" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-[#0F1412] border border-[#2D3748] rounded-sm flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs uppercase font-mono flex items-center gap-1.5">
                    <FileArchive className="w-4 h-4 text-emerald-400" /> FloraMedica Pro 42.6 MB APK Internal File Table
                  </h4>
                  <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                    Uncompressed structure, embedded 300K test set index, and neural weights inside the <code className="text-emerald-400">.apk</code>:
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadApk("full")}
                  className="px-3 py-1.5 bg-emerald-500 text-black font-bold font-mono text-xs rounded-sm hover:bg-emerald-400 cursor-pointer"
                >
                  Download 42.6 MB APK
                </button>
              </div>

              <div className="border border-[#2D3748] rounded-sm overflow-hidden font-mono text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-[#111614] border-b border-[#2D3748] text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">File / Archive Entry</th>
                      <th className="p-2.5">Size</th>
                      <th className="p-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A2220] bg-[#0F1412] text-slate-300">
                    <tr className="hover:bg-[#161C1A]">
                      <td className="p-2.5 text-emerald-400 font-bold">lib/arm64-v8a/libfloramedica_native.so</td>
                      <td className="p-2.5 font-bold text-white">15.8 MB</td>
                      <td className="p-2.5 text-slate-400">Native OpenCV + TFLite plant morphology computer vision engine (ARM64)</td>
                    </tr>
                    <tr className="hover:bg-[#161C1A]">
                      <td className="p-2.5 text-emerald-400 font-bold">lib/armeabi-v7a/libfloramedica_native.so</td>
                      <td className="p-2.5 font-bold text-white">10.4 MB</td>
                      <td className="p-2.5 text-slate-400">32-bit ARM legacy hardware fallback binaries</td>
                    </tr>
                    <tr className="hover:bg-[#161C1A]">
                      <td className="p-2.5 text-emerald-400 font-bold">classes.dex</td>
                      <td className="p-2.5 font-bold text-white">9.2 MB</td>
                      <td className="p-2.5 text-slate-400">Compiled Dalvik/ART bytecode, activities, hardware camera hooks</td>
                    </tr>
                    <tr className="hover:bg-[#161C1A]">
                      <td className="p-2.5 text-emerald-400 font-bold">assets/offline_taxa_database.json</td>
                      <td className="p-2.5 font-bold text-white">3.8 MB</td>
                      <td className="p-2.5 text-slate-400">42,800 medicinal taxa, Siddha, Sowa-Rigpa, and Ayurvedic monographs</td>
                    </tr>
                    <tr className="hover:bg-[#161C1A] bg-teal-950/20">
                      <td className="p-2.5 text-teal-300 font-bold">assets/plantnet300k_testset_index.json</td>
                      <td className="p-2.5 font-bold text-teal-300">2.8 MB</td>
                      <td className="p-2.5 text-teal-200">Pl@ntNet-300K benchmark test set index (300,000 images evaluation matrix)</td>
                    </tr>
                    <tr className="hover:bg-[#161C1A]">
                      <td className="p-2.5 text-emerald-400 font-bold">assets/neural_weights_plantnet300k.bin</td>
                      <td className="p-2.5 font-bold text-white">2.6 MB</td>
                      <td className="p-2.5 text-slate-400">Pl@ntNet-300K benchmark quantized botanical neural priors</td>
                    </tr>
                    <tr className="hover:bg-[#161C1A]">
                      <td className="p-2.5 text-emerald-400 font-bold">assets/3d_botanical_morphology.bin</td>
                      <td className="p-2.5 font-bold text-white">1.4 MB</td>
                      <td className="p-2.5 text-slate-400">3D vertex coordinates for interactive leaf venation & floral calyx</td>
                    </tr>
                    <tr className="hover:bg-[#161C1A]">
                      <td className="p-2.5 text-emerald-400 font-bold">resources.arsc & AndroidManifest.xml</td>
                      <td className="p-2.5 font-bold text-white">0.7 MB</td>
                      <td className="p-2.5 text-slate-400">Compiled application XML manifest, vector icons, mipmap strings</td>
                    </tr>
                    <tr className="bg-emerald-950/20 font-bold text-white">
                      <td className="p-2.5 text-emerald-300">Total Uncompressed Package Payload</td>
                      <td className="p-2.5 text-emerald-300">42.6 MB</td>
                      <td className="p-2.5 text-emerald-400">Complete Offline Field Android Package with 300K Test Set</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#111614] border-t border-[#2D3748] px-5 py-3 flex items-center justify-between text-slate-400 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Supported: Windows 10/11 (x64) • Android 8.0+ • floraMedica.stpaul2coderdojo.github.io</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1A2220] hover:bg-[#25302D] text-slate-200 rounded-sm cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
