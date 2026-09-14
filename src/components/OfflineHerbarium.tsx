import React, { useState, useEffect } from "react";
import { PlantData, SavedHerbariumItem, EdibilityRating, IdentificationFeedback, FeedbackStats } from "../types";
import { PlantService, FULL_BOTANICAL_DATABASE } from "../services/plantService";
import {
  Search,
  Filter,
  Bookmark,
  Trash2,
  Share2,
  Calendar,
  MapPin,
  Leaf,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertOctagon,
  BookOpen,
  Layers,
  Database,
  ArrowUpDown,
  Smartphone,
  Download,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileCheck,
  FileText,
  Heart,
  Award,
  Scale,
} from "lucide-react";

interface OfflineHerbariumProps {
  onSelectPlant: (plant: PlantData) => void;
  onOpenScanner: () => void;
  onOpenApkModal?: () => void;
}

export const OfflineHerbarium: React.FC<OfflineHerbariumProps> = ({
  onSelectPlant,
  onOpenScanner,
  onOpenApkModal,
}) => {
  const [activeTab, setActiveTab] = useState<"catalog" | "saved" | "feedback">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEdibility, setSelectedEdibility] = useState<string>("all");
  const [selectedSafety, setSelectedSafety] = useState<"all" | "safe" | "toxic">("all");
  const [selectedPartCategory, setSelectedPartCategory] = useState<string>("all");
  const [savedItems, setSavedItems] = useState<SavedHerbariumItem[]>([]);
  const [feedbackList, setFeedbackList] = useState<IdentificationFeedback[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>({
    total: 0,
    confirmed: 0,
    corrected: 0,
    uncertain: 0,
    accuracyRate: 100,
    organBreakdown: {},
    topMisidentified: [],
  });

  const refreshData = () => {
    setSavedItems(PlantService.getSavedHerbarium());
    setFeedbackList(PlantService.getFeedbackList());
    setFeedbackStats(PlantService.getFeedbackStats());
  };

  useEffect(() => {
    refreshData();
    const handleFeedbackUpdate = () => refreshData();
    window.addEventListener("floramedica-feedback-updated", handleFeedbackUpdate);
    return () => {
      window.removeEventListener("floramedica-feedback-updated", handleFeedbackUpdate);
    };
  }, []);

  const filteredPlants = PlantService.searchPlants(searchQuery, {
    edibility: selectedEdibility,
    safety: selectedSafety,
    partCategory: selectedPartCategory,
  });

  const handleDeleteSaved = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    PlantService.removeFromHerbarium(itemId);
    setSavedItems(PlantService.getSavedHerbarium());
  };

  const handleDeleteFeedback = async (id: string, plantId: string) => {
    await PlantService.deleteFeedback(id, plantId);
    refreshData();
  };

  const getEdibilityBadgeColor = (rating: EdibilityRating) => {
    switch (rating) {
      case "Edible":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Edible Cooked":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Medicinal Only":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "Caution":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case "Toxic/Inedible":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    }
  };

  return (
    <div className="flex flex-col gap-5 text-[#E2E8F0]">
      {/* Header Banner - Geometric Balance */}
      <div className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-5 sm:p-7 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Database className="w-3 h-3" />
              100% Offline Botanical Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Offline Materia Medica Herbarium
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Full taxonomic monographs, 3D morphology profiles, and pharmacopoeial references stored locally on device.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center bg-[#111614] p-1 rounded-sm border border-[#2D3748] self-stretch sm:self-auto gap-1">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight transition-all cursor-pointer ${
              activeTab === "catalog"
                ? "bg-emerald-500 text-black shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Taxa ({FULL_BOTANICAL_DATABASE.length})
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight transition-all cursor-pointer ${
              activeTab === "saved"
                ? "bg-emerald-500 text-black shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            My Field Scans ({savedItems.length})
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight transition-all cursor-pointer ${
              activeTab === "feedback"
                ? "bg-emerald-500 text-black shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Verification Ledger ({feedbackList.length})
          </button>
        </div>
      </div>

      {/* Android Standalone Field Package Banner */}
      <div className="bg-[#111614] border border-emerald-500/30 rounded-sm p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-sm text-emerald-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase tracking-tight text-xs sm:text-sm">
                Take FloraMedica to Off-Grid Field Expeditions
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-sm">
                Android APK v4.0.2
              </span>
            </div>
            <p className="text-slate-400 text-[11px] font-mono mt-0.5">
              Includes full offline taxonomic database, Pl@ntNet-300K plant morphology priors, and Sowa-Rigpa/Siddha monographs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onOpenApkModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-sm font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Download Android APK (38.4 MB)</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by scientific name, Telugu, Tamil, Tibetan, Sanskrit, or medicinal action..."
            className="w-full bg-[#161C1A] border border-[#2D3748] rounded-sm pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:border-emerald-500 outline-none shadow-sm placeholder:text-slate-500 font-sans"
          />
        </div>

        {/* Quick Filter Selectors */}
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedEdibility}
            onChange={(e) => setSelectedEdibility(e.target.value)}
            className="bg-[#161C1A] border border-[#2D3748] rounded-sm px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 outline-none font-mono cursor-pointer"
          >
            <option value="all">All Edibilities</option>
            <option value="Edible">Edible Raw</option>
            <option value="Edible Cooked">Edible Cooked</option>
            <option value="Medicinal Only">Medicinal Only</option>
            <option value="Caution">Caution</option>
            <option value="Toxic/Inedible">Toxic / Inedible</option>
          </select>

          <select
            value={selectedPartCategory}
            onChange={(e) => setSelectedPartCategory(e.target.value)}
            className="bg-[#161C1A] border border-[#2D3748] rounded-sm px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 outline-none font-mono cursor-pointer"
          >
            <option value="all">All Drug Origins</option>
            <option value="Flower">🌸 Flower Drug Origins</option>
            <option value="Seed">🌰 Seed Drug Origins</option>
            <option value="Leaf">🍃 Leaf Drug Origins</option>
          </select>

          <select
            value={selectedSafety}
            onChange={(e) => setSelectedSafety(e.target.value as any)}
            className="bg-[#161C1A] border border-[#2D3748] rounded-sm px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 outline-none font-mono cursor-pointer"
          >
            <option value="all">All Safety</option>
            <option value="safe">Non-Toxic Safe</option>
            <option value="toxic">Toxic / Upavisha</option>
          </select>
        </div>
      </div>

      {/* Catalog Grid View */}
      {activeTab === "catalog" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlants.map((plant) => (
            <div
              key={plant.id}
              onClick={() => onSelectPlant(plant)}
              className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-5 shadow-sm hover:border-emerald-500/60 transition-all cursor-pointer flex flex-col justify-between gap-4 group"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider font-mono border ${getEdibilityBadgeColor(
                      plant.edibility?.rating || "Caution"
                    )}`}
                  >
                    {plant.edibility?.rating || "Caution"}
                  </span>

                  <span className="text-[11px] font-mono text-slate-400">
                    {(plant.family || "").split(" ")[0] || "Botanical"}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {plant.commonNames?.[0] || plant.scientificName}
                </h3>

                <p className="text-xs text-emerald-400/90 font-serif italic">
                  {plant.scientificName}
                </p>

                {/* Multilingual Pills */}
                <div className="flex flex-wrap gap-1.5 text-[11px] mt-1 font-mono">
                  {plant.teluguName ? (
                    <span className="px-2 py-0.5 rounded-sm bg-[#0F1412] text-amber-300 border border-[#2D3748]">
                      {plant.teluguName}
                    </span>
                  ) : plant.tamilName ? (
                    <span className="px-2 py-0.5 rounded-sm bg-[#0F1412] text-amber-300 border border-[#2D3748]">
                      {plant.tamilName}
                    </span>
                  ) : null}
                  {plant.tibetanName && (
                    <span className="px-2 py-0.5 rounded-sm bg-[#0F1412] text-emerald-300 border border-[#2D3748]">
                      {plant.tibetanName}
                    </span>
                  )}
                </div>

                {/* Primary Medicinal Actions */}
                <div className="mt-2 flex flex-wrap gap-1 font-mono">
                  {(plant.medicinal?.primaryActions || []).slice(0, 3).map((act, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-sm bg-[#111614] text-slate-300 text-[10px] border border-[#2D3748]"
                    >
                      {act}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-[#2D3748] flex items-center justify-between text-xs text-emerald-400 font-bold uppercase tracking-tight font-mono">
                <span className="flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5" />
                  3D Morphology Ready
                </span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-[11px]">
                  View Dossier <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Saved Field Scans View */}
      {activeTab === "saved" && (
        <div className="flex flex-col gap-4">
          {savedItems.length === 0 ? (
            <div className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="p-4 rounded-sm bg-[#1A2220] border border-[#2D3748] text-slate-400">
                <Bookmark className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold uppercase tracking-tight text-white font-mono">No Saved Field Scans Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Scan plants using the live camera or browse the offline catalog and click "Save" to build your private digital herbarium.
              </p>
              <button
                onClick={onOpenScanner}
                className="mt-2 px-5 py-2.5 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer"
              >
                Open Camera Scanner
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectPlant(item.plant)}
                  className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-5 shadow-sm hover:border-emerald-500/60 transition-all cursor-pointer flex flex-col justify-between gap-4 group"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider font-mono border ${getEdibilityBadgeColor(
                          item.plant.edibility?.rating || "Caution"
                        )}`}
                      >
                        {item.plant.edibility?.rating || "Caution"}
                      </span>

                      <button
                        onClick={(e) => handleDeleteSaved(e, item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-sm transition-colors cursor-pointer"
                        title="Remove from Herbarium"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {item.plant.commonNames?.[0] || item.plant.scientificName}
                    </h3>

                    <p className="text-xs text-emerald-400/90 font-serif italic">
                      {item.plant.scientificName}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-400" />
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        {item.location}
                      </span>
                    </div>

                    {item.userNotes && (
                      <p className="text-xs text-slate-300 bg-[#0F1412] p-2.5 rounded-sm border border-[#2D3748] mt-1 italic">
                        "{item.userNotes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#2D3748] flex items-center justify-between text-xs text-emerald-400 font-bold uppercase tracking-tight font-mono">
                    <span>Inspect Botanical Monograph</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feedback & Model Retraining Verification Ledger Tab */}
      {activeTab === "feedback" && (
        <div className="flex flex-col gap-4">
          {/* Header Action Bar */}
          <div className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-tight text-white font-mono flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Model Ground Truth Feedback Ledger
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[#1A2220] text-emerald-400 border border-[#2D3748]">
                  {feedbackStats.accuracyRate}% Precision
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {feedbackStats.total} total verifications ({feedbackStats.confirmed} confirmed, {feedbackStats.corrected} corrected)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => PlantService.downloadTrainingDataset("jsonl")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold uppercase tracking-tight transition-all cursor-pointer"
                title="Download JSONL dataset formatted for Gemini & Vision Transformer Fine-Tuning"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSONL</span>
              </button>

              <button
                onClick={() => PlantService.downloadTrainingDataset("csv")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#1A2220] hover:bg-[#242f2c] border border-[#2D3748] text-slate-300 hover:text-white text-xs font-mono font-bold uppercase tracking-tight transition-all cursor-pointer"
                title="Download CSV taxonomy ledger"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {feedbackList.length === 0 ? (
            <div className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="p-4 rounded-sm bg-[#1A2220] border border-[#2D3748] text-slate-400">
                <FileCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold uppercase tracking-tight text-white font-mono">
                No Feedback Records Yet
              </h3>
              <p className="text-xs text-slate-400 max-w-sm font-mono">
                Identify plants and use the "Taxonomic Verification & Model Feedback" card in the Dossier to confirm or correct identifications.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {feedbackList.map((item) => (
                <div
                  key={item.id}
                  className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-4 flex flex-col justify-between gap-3 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.userDecision === "confirmed_correct" && (
                          <span className="px-2 py-0.5 rounded-xs bg-emerald-950/60 border border-emerald-700 text-emerald-300 font-bold text-[10px] flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Confirmed Match
                          </span>
                        )}
                        {item.userDecision === "corrected" && (
                          <span className="px-2 py-0.5 rounded-xs bg-amber-950/60 border border-amber-700 text-amber-300 font-bold text-[10px] flex items-center gap-1 font-mono">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            Corrected Taxon
                          </span>
                        )}
                        {item.userDecision === "uncertain" && (
                          <span className="px-2 py-0.5 rounded-xs bg-slate-900 border border-slate-700 text-slate-300 font-bold text-[10px] flex items-center gap-1 font-mono">
                            <HelpCircle className="w-3 h-3 text-slate-400" />
                            Uncertain
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-[#1A2220] text-slate-400 border border-[#2D3748]">
                          {item.correctedData?.organ || item.originalIdentification.detectedOrgan || "leaf"}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteFeedback(item.id, item.plantId)}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-sm transition-colors cursor-pointer"
                        title="Delete from training dataset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      {item.userDecision === "corrected" ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="text-xs text-slate-400 line-through font-mono">
                            {item.originalIdentification.scientificName}
                          </div>
                          <div className="text-sm font-bold text-emerald-300 font-serif italic">
                            ➔ {item.correctedData?.scientificName}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm font-bold text-white font-serif italic">
                          {item.originalIdentification.scientificName}
                        </div>
                      )}
                    </div>

                    {item.correctedData?.correctionReason && (
                      <div className="text-[11px] text-amber-300/90 font-mono">
                        Reason: {item.correctedData.correctionReason}
                      </div>
                    )}

                    {item.userNotes && (
                      <p className="text-xs text-slate-300 bg-[#0F1412] p-2 rounded-sm border border-[#2D3748] italic">
                        "{item.userNotes}"
                      </p>
                    )}

                    <div className="text-[10px] text-slate-500 font-mono">
                      Logged on {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Institutional Authorship & Benevity Causes Contribution Card */}
      <div className="p-4 sm:p-5 rounded-sm bg-[#141B19] border border-[#2D3748] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-white font-sans text-sm">
              Dr. Bheemaiah Anil K
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#1A2521] text-emerald-400 border border-emerald-500/30">
              Mother Divine Inc., Seattle
            </span>
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] px-2 py-0.5 rounded-sm bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 hover:underline flex items-center gap-1"
            >
              <Scale className="w-3 h-3" /> CC BY-SA 4.0
            </a>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            FloraMedica Offline Botanical Taxon Database &amp; Ethnomedicinal Herbarium • Open Knowledge Commons
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <a
            href="https://causes.benevity.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-tight text-[11px] rounded-sm flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Heart className="w-3.5 h-3.5 fill-black" />
            <span>Contribute via Benevity</span>
          </a>
        </div>
      </div>
    </div>
  );
};
