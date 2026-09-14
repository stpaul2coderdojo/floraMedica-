import React, { useState, useEffect } from "react";
import {
  Camera,
  BookOpen,
  Layers,
  Database,
  Wifi,
  WifiOff,
  Leaf,
  Info,
  Sparkles,
  Search,
  Rotate3d,
  CheckCircle,
  HelpCircle,
  Download,
  Flame,
  Smartphone,
  MessageSquare,
  Bot,
  Heart,
  Award,
  Scale,
  Globe,
  ExternalLink,
  Plus,
  FileText,
  BarChart3,
} from "lucide-react";
import { PlantData } from "./types";
import { FULL_BOTANICAL_DATABASE } from "./services/plantService";
import { CameraScanner } from "./components/CameraScanner";
import { PlantDossier } from "./components/PlantDossier";
import { DigitalRepository } from "./components/DigitalRepository";
import { OfflineHerbarium } from "./components/OfflineHerbarium";
import { AndroidApkModal } from "./components/AndroidApkModal";
import { ModelTrainingDataModal } from "./components/ModelTrainingDataModal";
import { AboutAttributionModal } from "./components/AboutAttributionModal";
import { HerbLookupModal } from "./components/HerbLookupModal";
import { BotanicalChatbot } from "./components/BotanicalChatbot";
import { WildSaladForagingExplorer } from "./components/WildSaladForagingExplorer";
import { PlantNetDatasetsModal } from "./components/PlantNetDatasetsModal";
import { PlantNet300kTestSetModal } from "./components/PlantNet300kTestSetModal";
import { PlantGroupingPopulationEstimator } from "./components/PlantGroupingPopulationEstimator";

type AppView = "scanner" | "biodiversity" | "dossier" | "repository" | "herbarium" | "chatbot" | "forager";

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>("scanner");
  const [selectedPlant, setSelectedPlant] = useState<PlantData>(
    FULL_BOTANICAL_DATABASE[0] // Default to Centella asiatica (Vallari / Brah-ma)
  );
  const [isOnlineMode, setIsOnlineMode] = useState(true);
  const [scanSourceInfo, setScanSourceInfo] = useState<{
    isOffline: boolean;
    source: string;
  } | null>(null);
  const [repoInitialFilter, setRepoInitialFilter] = useState<
    "sowaRigpa" | "siddha" | "papers"
  >("sowaRigpa");
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isTrainingHubOpen, setIsTrainingHubOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [aboutModalTab, setAboutModalTab] = useState<"authorship" | "license" | "benevity">("authorship");
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);
  const [isPlantNetDatasetsModalOpen, setIsPlantNetDatasetsModalOpen] = useState(false);
  const [is300kTestSetModalOpen, setIs300kTestSetModalOpen] = useState(false);

  // Check online/offline network status
  useEffect(() => {
    const handleOnline = () => setIsOnlineMode(true);
    const handleOffline = () => setIsOnlineMode(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Global keyboard shortcut: Cmd+K or Ctrl+K opens Herb Lookup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsLookupModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle plant identified from camera or upload or lookup
  const handlePlantIdentified = (
    plant: PlantData,
    isOffline: boolean,
    source: string
  ) => {
    setSelectedPlant(plant);
    setScanSourceInfo({ isOffline, source });
    setCurrentView("dossier");
  };

  const handleOpenRepositoryPointer = (
    sourceType: "sowaRigpa" | "siddha" | "papers"
  ) => {
    setRepoInitialFilter(sourceType);
    setCurrentView("repository");
  };

  return (
    <div className="min-h-screen bg-[#0F1412] text-[#E2E8F0] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Geometric Application Bar */}
      <header className="sticky top-0 z-40 bg-[#161C1A] border-b border-[#2D3748] px-3 sm:px-6 py-2.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
          {/* Top Bar: Brand Logo & Right Action Badges */}
          <div className="flex items-center justify-between gap-3">
            {/* Brand Logo & Tagline */}
            <div
              onClick={() => setCurrentView("scanner")}
              className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-sm flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <Leaf className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold tracking-tight uppercase text-emerald-400">
                    FloraMedica Pro
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-sm bg-[#1A2220] text-emerald-400 border border-[#2D3748]">
                    Android PWA
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 hidden sm:block font-mono">
                  Taxonomic Scanner &amp; Traditional Pharmacopoeia
                </p>
              </div>
            </div>

            {/* Right Header Status Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Authorship, CC License & Benevity Causes Button */}
              <button
                id="about-benevity-header-btn"
                onClick={() => {
                  setAboutModalTab("authorship");
                  setIsAboutModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-sm bg-[#1A2220] hover:bg-[#25322E] border border-amber-500/40 text-amber-300 hover:text-white font-mono font-bold uppercase tracking-tight text-xs transition-all cursor-pointer"
                title="Authorship (Dr Bheemaiah Anil K, Mother Divine Inc Seattle), Creative Commons CC BY-SA 4.0 &amp; Contribute via Benevity Causes"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xl:inline">Authorship &amp; Causes</span>
                <span className="xl:hidden">About</span>
              </button>

              {/* Pl@ntNet Datasets Repository Button */}
              <button
                id="plantnet-datasets-header-btn"
                onClick={() => setIsPlantNetDatasetsModalOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-sm bg-[#1A2220] hover:bg-[#25322E] border border-teal-500/40 text-teal-300 hover:text-white font-mono font-bold uppercase tracking-tight text-xs transition-all cursor-pointer"
                title="Open Pl@ntNet Datasets Repository (NeurIPS 300K, GBIF Human Validated, GBIF AI Occurrences, Regional Projects)"
              >
                <Database className="w-3.5 h-3.5 text-teal-400" />
                <span>Pl@ntNet Datasets (8)</span>
              </button>

              {/* 300K Test Set Benchmark Button */}
              <button
                id="plantnet-300k-testset-header-btn"
                onClick={() => setIs300kTestSetModalOpen(true)}
                className="hidden xl:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-sm bg-[#1A2220] hover:bg-[#25322E] border border-cyan-500/40 text-cyan-300 hover:text-white font-mono font-bold uppercase tracking-tight text-xs transition-all cursor-pointer"
                title="Pl@ntNet-300K NeurIPS Test Set (300,000 Images Benchmark Engine)"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>300K Test Set</span>
              </button>

              {/* Model Retraining Dataset Hub Button */}
              <button
                id="model-training-hub-header-btn"
                onClick={() => setIsTrainingHubOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-sm bg-[#1A2220] hover:bg-[#25322E] border border-emerald-500/40 text-emerald-300 hover:text-white font-mono font-bold uppercase tracking-tight text-xs transition-all cursor-pointer"
                title="Open Model Retraining &amp; Taxonomic Feedback Dataset Hub"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Training Hub</span>
              </button>

              {/* Download / Install Multi-Platform App Action Button */}
              <button
                id="download-apk-header-btn"
                onClick={() => setIsApkModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-tight text-xs shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all cursor-pointer"
                title="Download FloraMedica for Windows Desktop (x64), Android APK & WebAPK"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Downloads (Win/APK)</span>
                <span className="sm:hidden">Get App</span>
              </button>

              {/* Network Mode Status */}
              <button
                onClick={() => setIsOnlineMode(!isOnlineMode)}
                className={`px-2.5 py-1 rounded-sm border transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer ${
                  isOnlineMode
                    ? "bg-[#1A2220] border-[#2D3748] text-emerald-400 hover:border-emerald-500/50"
                    : "bg-amber-950/40 border-amber-800/60 text-amber-300"
                }`}
                title={
                  isOnlineMode
                    ? "Online AI Mode (PlantNet API + Gemini 3.7 Vision Active)"
                    : "Pl@ntNet-300K Offline Mode Active"
                }
              >
                {isOnlineMode ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] uppercase hidden sm:inline font-bold">AI Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] uppercase hidden sm:inline font-bold">Offline</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Primary View Navigation Bar - Always Visible Across All Devices & Preview Screen Sizes */}
          <nav className="flex items-center gap-1.5 bg-[#111614] p-1 rounded-sm border border-[#2D3748] text-xs overflow-x-auto scrollbar-none">
            {/* 1. Scanner */}
            <button
              id="header-scanner-nav-btn"
              onClick={() => setCurrentView("scanner")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                currentView === "scanner"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-[#1A2220]"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scanner</span>
            </button>

            {/* 2. 📊 Plant Grouping Estimation & Biodiversity Survey */}
            <button
              id="header-biodiversity-nav-btn"
              onClick={() => setCurrentView("biodiversity")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                currentView === "biodiversity"
                  ? "bg-emerald-500 text-black shadow-sm ring-1 ring-emerald-300"
                  : "bg-emerald-950/40 text-emerald-300 hover:text-white hover:bg-emerald-900/60 border border-emerald-500/40"
              }`}
              title="Estimate Plant Groupings, Population Density & Shannon Biodiversity from Multi-Frame Camera/Uploads"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Grouping &amp; Biodiversity</span>
              <span className="text-[9px] font-mono px-1 py-0.2 bg-emerald-500/20 text-emerald-200 rounded-xs border border-emerald-500/40">
                Pop Stats
              </span>
            </button>

            {/* 3. 🌿 Wild Salad & Foraging Explorer - High Visibility */}
            <button
              id="header-foraging-nav-btn"
              onClick={() => setCurrentView("forager")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                currentView === "forager"
                  ? "bg-emerald-500 text-black shadow-sm ring-1 ring-emerald-300"
                  : "bg-emerald-950/40 text-emerald-300 hover:text-white hover:bg-emerald-900/60 border border-emerald-500/40"
              }`}
              title="Explore Himalayan Wild Salad Greens, Flour Starch, Berries & Tubers"
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Wild Salad &amp; Foraging</span>
              <span className="text-[9px] font-mono px-1 py-0.2 bg-emerald-500/20 text-emerald-200 rounded-xs border border-emerald-500/40">
                4 Cats
              </span>
            </button>

            {/* 3. 🤖 Botanical AI Knowledge Bot - High Visibility */}
            <button
              id="header-chatbot-nav-btn"
              onClick={() => setCurrentView("chatbot")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                currentView === "chatbot"
                  ? "bg-emerald-500 text-black shadow-sm ring-1 ring-emerald-300"
                  : "bg-emerald-950/40 text-emerald-300 hover:text-white hover:bg-emerald-900/60 border border-emerald-500/40"
              }`}
              title="Ask Context-Aware Plant Morphology Botanical AI"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span>Botanical AI Bot</span>
              <span className="text-[9px] font-mono px-1 py-0.2 bg-emerald-500/20 text-emerald-200 rounded-xs border border-emerald-500/40">
                AI
              </span>
            </button>

            {/* 4. Herb Lookup */}
            <button
              id="header-herb-lookup-nav-btn"
              onClick={() => setIsLookupModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight text-emerald-300 hover:text-white bg-[#161F1C] hover:bg-[#1F2C27] border border-emerald-500/30 hover:border-emerald-400 whitespace-nowrap transition-all cursor-pointer"
              title="Lookup Herb by Name (Online PlantNet API vs Offline Pl@ntNet-300K) [Ctrl+K]"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lookup Herb</span>
              <kbd className="hidden xl:inline text-[9px] font-mono px-1 bg-black/40 border border-[#2D3748] rounded-xs text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* 5. Dossier & 3D */}
            <button
              id="header-dossier-nav-btn"
              onClick={() => setCurrentView("dossier")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                currentView === "dossier"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-[#1A2220]"
              }`}
            >
              <Rotate3d className="w-3.5 h-3.5" />
              <span>Dossier &amp; 3D</span>
            </button>

            {/* 6. Offline Herbarium */}
            <button
              id="header-herbarium-nav-btn"
              onClick={() => setCurrentView("herbarium")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                currentView === "herbarium"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-[#1A2220]"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Herbarium</span>
            </button>

            {/* 7. Materials */}
            <button
              id="header-repository-nav-btn"
              onClick={() => setCurrentView("repository")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                currentView === "repository"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-[#1A2220]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Materials</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-6 flex flex-col gap-5">
        {/* Active Scan Identification Source Badge (if viewing dossier after scan) */}
        {currentView === "dossier" && scanSourceInfo && (
          <div className="p-3 bg-[#161C1A] border border-[#2D3748] text-[#E2E8F0] text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-emerald-400 font-mono uppercase text-[11px]">Match Source:</strong> {scanSourceInfo.source}
              </span>
            </div>
            <button
              onClick={() => setCurrentView("scanner")}
              className="text-xs font-bold uppercase tracking-tight text-emerald-400 hover:text-emerald-300 border-b border-emerald-400 cursor-pointer"
            >
              Scan Another
            </button>
          </div>
        )}

        {/* View Routing */}
        {currentView === "scanner" && (
          <div className="flex flex-col gap-6">
            <CameraScanner
              onPlantIdentified={handlePlantIdentified}
              isOnlineMode={isOnlineMode}
              onOpenLookup={() => setIsLookupModalOpen(true)}
              onOpenChatbot={() => setCurrentView("chatbot")}
              onOpenForager={() => setCurrentView("forager")}
              onOpenBiodiversity={() => setCurrentView("biodiversity")}
            />
          </div>
        )}

        {currentView === "biodiversity" && (
          <PlantGroupingPopulationEstimator
            isOnlineMode={isOnlineMode}
            onSelectPlantForDossier={(plant) => {
              setSelectedPlant(plant);
              setCurrentView("dossier");
            }}
            onOpenHerbLookup={() => setIsLookupModalOpen(true)}
          />
        )}

        {currentView === "dossier" && (
          <PlantDossier
            plant={selectedPlant}
            onOpenRepositoryPointer={handleOpenRepositoryPointer}
            onOpenChatbot={() => setCurrentView("chatbot")}
            onOpenForager={() => setCurrentView("forager")}
          />
        )}

        {currentView === "chatbot" && (
          <div className="flex flex-col gap-4 min-h-[70vh]">
            <BotanicalChatbot
              currentPlant={selectedPlant}
              isOnlineMode={isOnlineMode}
              onSelectPlant={(p) => {
                setSelectedPlant(p);
                setCurrentView("dossier");
              }}
            />
          </div>
        )}

        {currentView === "forager" && (
          <WildSaladForagingExplorer
            onSelectPlant={handlePlantIdentified}
            onOpenChatbotWithContext={(plantName, query) => {
              setCurrentView("chatbot");
            }}
          />
        )}

        {currentView === "repository" && (
          <DigitalRepository
            initialSystemFilter={repoInitialFilter}
            onSelectPlant={(plant) => {
              setSelectedPlant(plant);
              setCurrentView("dossier");
            }}
          />
        )}

        {currentView === "herbarium" && (
          <OfflineHerbarium
            onSelectPlant={(plant) => {
              setSelectedPlant(plant);
              setCurrentView("dossier");
            }}
            onOpenScanner={() => setCurrentView("scanner")}
            onOpenApkModal={() => setIsApkModalOpen(true)}
          />
        )}
      </main>

      {/* Floating Botanical Knowledge Chat Toggle (on all screens except chatbot view) */}
      {currentView !== "chatbot" && (
        <div className="fixed bottom-18 md:bottom-6 right-4 sm:right-6 z-40">
          <button
            id="floating-knowledge-bot-toggle-btn"
            onClick={() => setCurrentView("chatbot")}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase text-xs tracking-tight rounded-full shadow-[0_4px_20px_rgba(16,185,129,0.4)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Ask Context-Aware Botanist AI (Multi-Image Enabled)"
          >
            <Bot className="w-5 h-5 stroke-[2.5]" />
            <span className="hidden sm:inline">Ask Botanist AI</span>
            {selectedPlant && (
              <span className="hidden md:inline text-[10px] font-mono font-normal opacity-80 border-l border-black/30 pl-2">
                {selectedPlant.scientificName.split(" ")[0]}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Institutional Balance & Authorship Footer */}
      <footer className="bg-[#0A0E0C] border-t border-[#2D3748] px-4 sm:px-8 py-5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          {/* Main Attribution & Contribution Row */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-[#1E2925]">
            {/* Authorship & Organization */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-white tracking-tight text-sm">
                    Dr. Bheemaiah Anil K
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-sm bg-[#161F1C] text-emerald-400 border border-emerald-500/30">
                    Lead Author &amp; Researcher
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Mother Divine Inc., Seattle, Washington • Computational Ethnobotany &amp; Pharmacognosy
                </p>
              </div>
            </div>

            {/* Benevity Causes & CC License Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <button
                onClick={() => {
                  setAboutModalTab("benevity");
                  setIsAboutModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-tight text-[11px] rounded-sm flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(245,158,11,0.25)] cursor-pointer"
                title="Contribute to FloraMedica through Benevity Causes (Employer Matching Eligible)"
              >
                <Heart className="w-3.5 h-3.5 fill-black" />
                <span>Contribute via Benevity Causes</span>
              </button>

              <a
                href="https://causes.benevity.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#141C19] hover:bg-[#1F2B26] text-amber-300 border border-amber-500/40 text-[11px] font-mono rounded-sm flex items-center gap-1 transition-colors"
                title="Open Benevity Causes Direct URL"
              >
                <ExternalLink className="w-3 h-3" />
                <span>causes.benevity.org</span>
              </a>

              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#141C19] hover:bg-[#1F2B26] text-cyan-300 border border-cyan-500/40 text-[11px] font-mono rounded-sm flex items-center gap-1 transition-colors"
                title="Creative Commons Attribution-ShareAlike 4.0 International License"
              >
                <Scale className="w-3 h-3" />
                <span>CC BY-SA 4.0</span>
              </a>

              <button
                onClick={() => {
                  setAboutModalTab("authorship");
                  setIsAboutModalOpen(true);
                }}
                className="px-3 py-1.5 bg-[#141C19] hover:bg-[#1F2B26] text-slate-300 border border-[#2D3748] text-[11px] font-mono rounded-sm flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Full Details</span>
              </button>
            </div>
          </div>

          {/* Legal, Licensing & URLs Row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-slate-300 font-semibold">
                Licensed under Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0)
              </span>
              <span>•</span>
              <span>Dr. Bheemaiah Anil K &amp; Mother Divine Inc, Seattle</span>
              <span>•</span>
              <a
                href="https://floraMedica.stpaul2coderdojo.github.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1"
                title="FloraMedica Official Marketing Site & Medicinal Plants Portal"
              >
                <Globe className="w-3 h-3 inline" /> floraMedica.stpaul2coderdojo.github.io
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-end md:self-auto text-[10px] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" /> System Status: Ready
              </span>
              <span>•</span>
              <button
                onClick={() => setIsApkModalOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors font-bold"
                title="Download Windows Desktop (x64) or Android APK"
              >
                <Download className="w-3 h-3" /> Windows &amp; Android Downloads
              </button>
              <span>•</span>
              <span className="text-slate-500">v4.5.0-Global-300K</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Android Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#161C1A] border-t border-[#2D3748] px-2 py-2 flex items-center justify-around text-[10px]">
        <button
          onClick={() => setCurrentView("scanner")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-sm transition-all cursor-pointer ${
            currentView === "scanner"
              ? "text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span className="uppercase tracking-tight">Scan</span>
        </button>

        <button
          onClick={() => setIsLookupModalOpen(true)}
          className="flex flex-col items-center gap-1 p-1.5 rounded-sm text-emerald-300 hover:text-white transition-all cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span className="uppercase tracking-tight">Lookup</span>
        </button>

        <button
          onClick={() => setCurrentView("dossier")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-sm transition-all cursor-pointer ${
            currentView === "dossier"
              ? "text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Rotate3d className="w-4 h-4" />
          <span className="uppercase tracking-tight">Dossier</span>
        </button>

        <button
          onClick={() => setCurrentView("forager")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-sm transition-all cursor-pointer ${
            currentView === "forager"
              ? "text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Leaf className="w-4 h-4" />
          <span className="uppercase tracking-tight">Foraging</span>
        </button>

        <button
          onClick={() => setCurrentView("chatbot")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-sm transition-all cursor-pointer ${
            currentView === "chatbot"
              ? "text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Bot className="w-4 h-4" />
          <span className="uppercase tracking-tight">Bot AI</span>
        </button>

        <button
          onClick={() => setCurrentView("repository")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-sm transition-all cursor-pointer ${
            currentView === "repository"
              ? "text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="uppercase tracking-tight">Materials</span>
        </button>

        <button
          onClick={() => setCurrentView("herbarium")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-sm transition-all cursor-pointer ${
            currentView === "herbarium"
              ? "text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Database className="w-4 h-4" />
          <span className="uppercase tracking-tight">Herbarium</span>
        </button>
      </nav>

      {/* Herb Lookup Modal (Online PlantNet API vs Offline Pl@ntNet-300K) */}
      <HerbLookupModal
        isOpen={isLookupModalOpen}
        onClose={() => setIsLookupModalOpen(false)}
        onSelectPlant={handlePlantIdentified}
        isOnlineMode={isOnlineMode}
        onOpenForagingExplorer={() => setCurrentView("forager")}
      />

      {/* Android APK Modal */}
      <AndroidApkModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        onOpenTestSetModal={() => {
          setIsApkModalOpen(false);
          setIs300kTestSetModalOpen(true);
        }}
      />

      {/* Pl@ntNet-300K Test Set Benchmark Modal (300,000 Images Evaluation Matrix) */}
      <PlantNet300kTestSetModal
        isOpen={is300kTestSetModalOpen}
        onClose={() => setIs300kTestSetModalOpen(false)}
      />

      {/* Model Retraining & Fine-Tuning Dataset Hub Modal */}
      <ModelTrainingDataModal
        isOpen={isTrainingHubOpen}
        onClose={() => setIsTrainingHubOpen(false)}
      />

      {/* Pl@ntNet Datasets Repository Modal */}
      <PlantNetDatasetsModal
        isOpen={isPlantNetDatasetsModalOpen}
        onClose={() => setIsPlantNetDatasetsModalOpen(false)}
        onSelectPlant={(plant) => handlePlantIdentified(plant, true, "Pl@ntNet Multi-Dataset Repository")}
        onOpenTestSetModal={() => {
          setIsPlantNetDatasetsModalOpen(false);
          setIs300kTestSetModalOpen(true);
        }}
      />

      {/* Institutional Authorship, Creative Commons License & Benevity Causes Modal */}
      <AboutAttributionModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        initialTab={aboutModalTab}
      />
    </div>
  );
}
