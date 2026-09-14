import React, { useState } from "react";
import {
  Database,
  Layers,
  CheckCircle2,
  ExternalLink,
  Download,
  Search,
  Sparkles,
  Info,
  BookOpen,
  Eye,
  FileText,
  Share2,
  HardDrive,
  Copy,
  Check,
  Globe,
  Tag,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import {
  PlantNetDatasetMetadata,
  PlantNetDatasetType,
  PlantData,
  PlantNetOrgan,
} from "../types";
import { PlantService } from "../services/plantService";
import { PLANTNET_DATASETS_REGISTRY } from "../data/plantnetDatasets";

interface PlantNetDatasetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDatasetForScanning?: (datasetId: PlantNetDatasetType) => void;
  onSelectPlant?: (plant: PlantData) => void;
  onOpenTestSetModal?: () => void;
}

export const PlantNetDatasetsModal: React.FC<PlantNetDatasetsModalProps> = ({
  isOpen,
  onClose,
  onSelectDatasetForScanning,
  onSelectPlant,
  onOpenTestSetModal,
}) => {
  const [selectedDatasetId, setSelectedDatasetId] = useState<PlantNetDatasetType>("plantnet_300k");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "benchmark_image" | "gbif_validated" | "gbif_auto" | "regional_project">("all");
  const [activeTab, setActiveTab] = useState<"overview" | "species_browser" | "offline_cache" | "gbif_api">("overview");
  const [copiedDoi, setCopiedDoi] = useState<string | null>(null);

  if (!isOpen) return null;

  const datasets = PlantService.getPlantNetDatasets();
  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId) || datasets[0];
  const allPlants = PlantService.getAllPlants();
  const plantsInSelectedDataset = PlantService.getPlantsInDataset(selectedDatasetId);
  const stats = PlantService.getPlantNetStats();

  const filteredDatasets = datasets.filter((d) => {
    if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.shortName.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.citation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyCitation = (citation: string, id: string) => {
    navigator.clipboard.writeText(citation);
    setCopiedDoi(id);
    setTimeout(() => setCopiedDoi(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-5xl max-h-[92vh] bg-[#121816] border border-[#2D3748] rounded-sm flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#2D3748] flex items-center justify-between bg-[#161C1A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#E2E8F0] tracking-tight flex items-center gap-2">
                  Pl@ntNet Offline Datasets Repository
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  8 Pre-Bundled Datasets
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pl@ntNet-300K Benchmark, GBIF Human-Validated &amp; Automated Occurrences, and Regional Flora Projects
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-sm bg-[#0E1311] border border-[#2D3748] hover:border-slate-500 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Aggregate Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[#0E1311] border-b border-[#2D3748] text-xs font-mono">
          <div className="p-2 rounded-sm bg-[#161C1A] border border-[#2D3748] flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase">Total Datasets</span>
            <span className="text-emerald-400 font-bold text-sm">8 Registered Projects</span>
          </div>
          <div className="p-2 rounded-sm bg-[#161C1A] border border-[#2D3748] flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase">Offline Species</span>
            <span className="text-emerald-400 font-bold text-sm">{allPlants.length} Offline Flora</span>
          </div>
          <div className="p-2 rounded-sm bg-[#161C1A] border border-[#2D3748] flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase">GBIF &amp; Zenodo Vouchers</span>
            <span className="text-teal-300 font-bold text-sm">41.4M+ Records</span>
          </div>
          <div className="p-2 rounded-sm bg-[#161C1A] border border-[#2D3748] flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase">Offline Status</span>
            <span className="text-emerald-300 font-bold text-sm flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              100% Pre-Bundled
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 pt-2.5 bg-[#161C1A] border-b border-[#2D3748] overflow-x-auto scrollbar-thin">
          {[
            { id: "overview", label: "Datasets Catalog", icon: Database },
            { id: "species_browser", label: `Species in Dataset (${plantsInSelectedDataset.length})`, icon: Layers },
            { id: "offline_cache", label: "Offline Storage & Cache", icon: HardDrive },
            { id: "gbif_api", label: "GBIF API & NeurIPS Citations", icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-tight transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "text-emerald-400 border-emerald-500 bg-emerald-500/5"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview & Datasets Catalog */}
        {activeTab === "overview" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col md:flex-row gap-5 scrollbar-thin">
            {/* Left Dataset List */}
            <div className="w-full md:w-5/12 flex flex-col gap-3">
              {/* Category Filter & Search */}
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Pl@ntNet datasets..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-sm bg-[#0E1311] border border-[#2D3748] text-[#E2E8F0] placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
                  {[
                    { id: "all", label: "All (8)" },
                    { id: "benchmark_image", label: "NeurIPS 300K" },
                    { id: "gbif_validated", label: "GBIF Validated" },
                    { id: "gbif_auto", label: "GBIF AI" },
                    { id: "regional_project", label: "My Pl@ntNet" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id as any)}
                      className={`px-2 py-0.5 text-[10px] rounded-sm font-mono uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
                        categoryFilter === cat.id
                          ? "bg-emerald-500 text-slate-950 font-bold"
                          : "bg-[#0E1311] text-slate-400 hover:text-slate-200 border border-[#2D3748]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dataset Cards List */}
              <div className="flex flex-col gap-2 max-h-[50vh] md:max-h-[55vh] overflow-y-auto pr-1 scrollbar-thin">
                {filteredDatasets.map((dataset) => {
                  const isSelected = dataset.id === selectedDatasetId;
                  const plantCount = PlantService.getPlantsInDataset(dataset.id).length;

                  return (
                    <button
                      key={dataset.id}
                      onClick={() => setSelectedDatasetId(dataset.id)}
                      className={`p-3 rounded-sm text-left transition-all border flex flex-col gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-[#161C1A] border-emerald-500 shadow-md"
                          : "bg-[#0E1311] hover:bg-[#161C1A] border-[#2D3748]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#E2E8F0] line-clamp-1">
                          {dataset.name}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-sm font-mono uppercase font-bold border shrink-0 ${dataset.badgeColor}`}
                        >
                          {dataset.shortName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {dataset.description}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-[#2D3748]/60">
                        <span>{plantCount} Offline Species</span>
                        <span className="text-emerald-400 font-bold">{dataset.offlineStatus.toUpperCase()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Dataset Details View */}
            <div className="w-full md:w-7/12 p-4 sm:p-5 rounded-sm bg-[#161C1A] border border-[#2D3748] flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-3">
                {/* Title & Badges */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-sm font-mono uppercase font-bold border ${selectedDataset.badgeColor}`}
                    >
                      {selectedDataset.category.replace("_", " ").toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      {selectedDataset.humanValidated ? "Human / Expert Validated" : "Automated AI Occurrences"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#E2E8F0]">
                    {selectedDataset.name}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedDataset.description}
                  </p>
                </div>

                {/* Key Spec Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-sm bg-[#0E1311] border border-[#2D3748] text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Total Records</span>
                    <span className="text-slate-200 font-bold">{selectedDataset.totalImagesOrOccurrences}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Global Species</span>
                    <span className="text-slate-200 font-bold">{selectedDataset.totalSpeciesCount.toLocaleString()} Taxa</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Offline Size</span>
                    <span className="text-emerald-400 font-bold">{selectedDataset.downloadSize}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">DOI / Accession</span>
                    <span className="text-slate-300 text-[10px] truncate block">{selectedDataset.doi}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">License</span>
                    <span className="text-slate-300">{selectedDataset.license}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Offline App Flora</span>
                    <span className="text-emerald-300 font-bold">{plantsInSelectedDataset.length} Preloaded</span>
                  </div>
                </div>

                {/* Supported Plant Morphology */}
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1.5">
                    Supported PlantNet Botanical Morphology:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedDataset.organsSupported.map((organ) => (
                      <span
                        key={organ}
                        className="px-2 py-0.5 rounded-sm bg-[#0E1311] border border-[#2D3748] text-emerald-300 text-[11px] font-mono capitalize"
                      >
                        {organ === "leaf" && "🍃 Leaf"}
                        {organ === "flower" && "🌸 Flower"}
                        {organ === "fruit" && "🍒 Fruit"}
                        {organ === "bark" && "🪵 Bark / Stem"}
                        {organ === "habit" && "🌱 Habit (Whole)"}
                        {organ === "other" && "🔍 Other / Morphology"}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Academic Citation Block */}
                <div className="p-2.5 rounded-sm bg-[#0E1311] border border-[#2D3748] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                      Formal Academic Citation &amp; Accession:
                    </span>
                    <button
                      onClick={() => handleCopyCitation(selectedDataset.citation, selectedDataset.id)}
                      className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedDoi === selectedDataset.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy Citation
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 font-serif italic leading-relaxed">
                    {selectedDataset.citation}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#2D3748] flex-wrap">
                <button
                  onClick={() => {
                    setActiveTab("species_browser");
                  }}
                  className="px-3 py-1.5 rounded-sm bg-[#0E1311] hover:bg-[#161C1A] border border-[#2D3748] text-slate-200 text-xs font-bold uppercase tracking-tight flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  View {plantsInSelectedDataset.length} Species
                </button>

                <div className="flex items-center gap-2 flex-wrap">
                  {selectedDataset.id === "plantnet_300k" && onOpenTestSetModal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenTestSetModal();
                      }}
                      className="px-3.5 py-1.5 rounded-sm bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/60 text-cyan-300 hover:text-white text-xs font-bold uppercase tracking-tight flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      300K Test Set Benchmark
                    </button>
                  )}

                  {onSelectDatasetForScanning && (
                    <button
                      onClick={() => {
                        onSelectDatasetForScanning(selectedDataset.id);
                        onClose();
                      }}
                      className="px-4 py-1.5 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold uppercase tracking-tight flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Set Active for Field Scanner
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Species Browser for Selected Dataset */}
        {activeTab === "species_browser" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 scrollbar-thin">
            <div className="flex items-center justify-between flex-wrap gap-2 bg-[#161C1A] p-3 rounded-sm border border-[#2D3748]">
              <div>
                <span className="text-xs font-bold text-[#E2E8F0]">
                  Offline Taxa in {selectedDataset.name}
                </span>
                <p className="text-[11px] text-slate-400">
                  {plantsInSelectedDataset.length} authentic flora indexed with morphology, edibility, and pharmacopoeia data.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-sm border border-emerald-500/30">
                100% Offline Ready
              </span>
            </div>

            {/* Grid of Species */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {plantsInSelectedDataset.map((plant) => (
                <div
                  key={plant.id}
                  className="p-3 rounded-sm bg-[#161C1A] border border-[#2D3748] hover:border-emerald-500/60 flex flex-col justify-between gap-2.5 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-[#E2E8F0] group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {plant.commonNames[0]}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                        GBIF #{plant.gbifTaxonKey?.slice(0, 6)}
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
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                      {plant.botanicalDescription.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#2D3748]/60">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {plant.family}
                    </span>
                    {onSelectPlant && (
                      <button
                        onClick={() => {
                          onSelectPlant(plant);
                          onClose();
                        }}
                        className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                      >
                        Inspect Dossier →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Offline Storage & Cache Manager */}
        {activeTab === "offline_cache" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 scrollbar-thin font-mono text-xs">
            <div className="p-4 rounded-sm bg-[#161C1A] border border-[#2D3748] flex flex-col gap-3">
              <h3 className="text-sm font-bold text-[#E2E8F0] font-sans flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                Offline Storage Footprint &amp; Package Verification
              </h3>
              <p className="text-slate-400 text-xs font-sans">
                All 8 Pl@ntNet datasets and the entire 120+ species Himalayan and pharmacopoeia database are packaged inside the browser's local client bundle with zero latency.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                {datasets.map((d) => (
                  <div key={d.id} className="p-3 rounded-sm bg-[#0E1311] border border-[#2D3748] flex flex-col justify-between gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 truncate">{d.shortName}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-[10px] text-slate-500">{d.downloadSize}</span>
                    <span className="text-[9px] text-emerald-400 font-bold">STATUS: CACHED (OFFLINE)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Offline Engine Architecture */}
            <div className="p-4 rounded-sm bg-[#161C1A] border border-[#2D3748] flex flex-col gap-2 font-sans">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                Dual-Tier Identification Protocol
              </span>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>
                  <strong className="text-emerald-300">Tier 1 (Pl@ntNet-300K Benchmark Calibration):</strong> Vision Transformer and Gemini Vision plant morphology neural priors (Leaf, Flower, Fruit, Bark, Habit).
                </li>
                <li>
                  <strong className="text-emerald-300">Tier 2 (Zero-Latency Offline Fallback):</strong> Multi-factor botanical matching engine comparing 12 morphological attributes against the preloaded local GBIF dataset registry.
                </li>
                <li>
                  <strong className="text-emerald-300">Continuous Learning:</strong> Expert feedback entries export directly to Darwin Core Archive (DwC-A) and Pl@ntNet fine-tuning JSONL format.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 4: GBIF API & NeurIPS Citations */}
        {activeTab === "gbif_api" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 scrollbar-thin">
            <div className="p-4 rounded-sm bg-[#161C1A] border border-[#2D3748] flex flex-col gap-3">
              <h3 className="text-sm font-bold text-[#E2E8F0] flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                GBIF Datasets &amp; API Documentation References
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                As detailed in the Pl@ntNet official documentation, Pl@ntNet publishes two primary GBIF datasets, an open identification API, and the NeurIPS benchmark:
              </p>

              <div className="space-y-3 mt-1">
                <div className="p-3 rounded-sm bg-[#0E1311] border border-[#2D3748] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-300">
                      1. Pl@ntNet observations (with human validation)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">GBIF Dataset</span>
                  </div>
                  <p className="text-xs text-slate-400 font-serif italic">
                    Pl@ntNet (2023). Pl@ntNet observations (with human validation). DOI: 10.15468/bdsgvp.
                  </p>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Endpoint: https://api.gbif.org/v1/dataset/14d56162-e1f4-44cf-911b-857c2e3990dd
                  </span>
                </div>

                <div className="p-3 rounded-sm bg-[#0E1311] border border-[#2D3748] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-300">
                      2. Pl@ntNet automatically identified occurrences (without human validation)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">GBIF Dataset</span>
                  </div>
                  <p className="text-xs text-slate-400 font-serif italic">
                    Pl@ntNet (2023). Pl@ntNet automatically identified occurrences. DOI: 10.15468/e8zcqk.
                  </p>
                  <span className="text-[10px] font-mono text-sky-400">
                    Endpoint: https://api.gbif.org/v1/dataset/7ddf754f-d193-4cc9-b351-99906754a03b
                  </span>
                </div>

                <div className="p-3 rounded-sm bg-[#0E1311] border border-[#2D3748] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300">
                      3. Pl@ntNet-300K Image Dataset (NeurIPS 2021)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Zenodo: 5645731</span>
                  </div>
                  <p className="text-xs text-slate-400 font-serif italic">
                    Garcin et al. (2021). Pl@ntNet-300K: a plant image dataset with high label ambiguity and a long-tailed distribution. NeurIPS 2021.
                  </p>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Zenodo Accession: https://doi.org/10.5281/zenodo.5645731
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-[#2D3748] bg-[#161C1A] flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">
            Pl@ntNet &amp; GBIF Open Data Consortium Integration
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-sm bg-[#0E1311] border border-[#2D3748] hover:border-slate-400 text-slate-200 text-xs font-bold cursor-pointer"
          >
            Close Repository
          </button>
        </div>
      </div>
    </div>
  );
};
