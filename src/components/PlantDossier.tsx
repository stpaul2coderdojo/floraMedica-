import React, { useState } from "react";
import {
  PlantData,
  EdibilityRating,
} from "../types";
import { Plant3DViewer } from "./Plant3DViewer";
import { IdentificationFeedbackCard } from "./IdentificationFeedbackCard";
import { ModelTrainingDataModal } from "./ModelTrainingDataModal";
import { PlantNetDatasetsModal } from "./PlantNetDatasetsModal";
import { getDatasetMetadata } from "../data/plantnetDatasets";
import {
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Snowflake,
  Heart,
  Activity,
  Sparkles,
  BookOpen,
  Utensils,
  Pill,
  Leaf,
  Share2,
  FileText,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Database,
  Layers,
  Scale,
  Award,
} from "lucide-react";
import { PlantService } from "../services/plantService";

interface PlantDossierProps {
  plant: PlantData;
  onOpenRepositoryPointer?: (sourceType: "sowaRigpa" | "siddha" | "papers") => void;
  onPlantSavedToggle?: () => void;
  onOpenChatbot?: () => void;
  onOpenForager?: () => void;
}

export const PlantDossier: React.FC<PlantDossierProps> = ({
  plant,
  onOpenRepositoryPointer,
  onPlantSavedToggle,
  onOpenChatbot,
  onOpenForager,
}) => {
  const [activeSystemTab, setActiveSystemTab] = useState<
    "siddha" | "sowaRigpa" | "ayurveda" | "phytotherapy"
  >("siddha");
  const [isSaved, setIsSaved] = useState(() =>
    PlantService.isPlantBookmarked(plant.id)
  );
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [isTrainingHubOpen, setIsTrainingHubOpen] = useState(false);
  const [isDatasetsModalOpen, setIsDatasetsModalOpen] = useState(false);

  const toggleSave = () => {
    if (isSaved) {
      PlantService.removeFromHerbarium(plant.id);
      setIsSaved(false);
    } else {
      PlantService.saveToHerbarium(plant, plant.imageUrl, "Field Monograph Bookmarked");
      setIsSaved(true);
    }
    if (onPlantSavedToggle) onPlantSavedToggle();
  };

  const shareMonograph = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `${plant.commonNames[0]} (${plant.scientificName}) - Medicinal & Edibility Profile from FloraMedica Pharmacopoeia.`
      );
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  const getEdibilityBadgeColor = (rating: EdibilityRating) => {
    switch (rating) {
      case "Edible":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Edible Cooked":
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
      case "Medicinal Only":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "Caution":
        return "bg-orange-500/10 text-orange-300 border-orange-500/30";
      case "Toxic/Inedible":
        return "bg-rose-500/10 text-rose-300 border-rose-500/30";
    }
  };

  return (
    <div className="flex flex-col gap-5 text-[#E2E8F0]">
      {/* Header Hero Banner - Geometric Balance */}
      <div className="relative rounded-sm bg-[#161C1A] border border-[#2D3748] p-5 sm:p-7 overflow-hidden shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${getEdibilityBadgeColor(
                  plant.edibility?.rating || "Caution"
                )}`}
              >
                {plant.edibility?.rating || "Caution"} • Score {plant.edibility?.ratingScore ?? 50}/100
              </span>

              {typeof plant.confidenceScore === "number" && (
                <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm bg-[#1A2220] border border-[#2D3748] text-emerald-400 font-bold">
                  Match {Math.round(plant.confidenceScore * 100)}%
                </span>
              )}

              <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm bg-[#1A2220] border border-[#2D3748] text-slate-300">
                {plant.family || "Botanical Specimen"}
              </span>

              {plant.plantnet300k?.detectedOrgan && (
                <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm bg-emerald-950/40 border border-emerald-800 text-emerald-300 font-bold flex items-center gap-1">
                  <Layers className="w-3 h-3 text-emerald-400" />
                  Plant Morphology: {plant.plantnet300k.detectedOrgan}
                </span>
              )}
              {plant.plantnetDatasets && plant.plantnetDatasets.length > 0 && (
                <button
                  onClick={() => setIsDatasetsModalOpen(true)}
                  className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm bg-teal-950/40 border border-teal-700 text-teal-300 font-bold flex items-center gap-1 hover:bg-teal-900/40 transition-colors cursor-pointer"
                >
                  <Database className="w-3 h-3 text-teal-400" />
                  {plant.plantnetDatasets.length} Pl@ntNet Datasets
                </button>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
              {plant.commonNames?.[0] || plant.scientificName}
            </h1>
            <p className="text-sm sm:text-base text-emerald-400 font-serif italic mb-3">
              {plant.scientificName}
            </p>

            {/* Traditional Multilingual Names */}
            <div className="flex flex-wrap gap-2 text-xs">
              {plant.teluguName ? (
                <span className="px-2.5 py-1 rounded-sm bg-[#0F1412] border border-[#2D3748] text-amber-300 font-mono text-[11px]">
                  Siddha (Telugu): <strong className="text-slate-100 font-sans">{plant.teluguName}</strong>
                </span>
              ) : plant.tamilName ? (
                <span className="px-2.5 py-1 rounded-sm bg-[#0F1412] border border-[#2D3748] text-amber-300 font-mono text-[11px]">
                  Siddha: <strong className="text-slate-100 font-sans">{plant.tamilName}</strong>
                </span>
              ) : null}
              {plant.tibetanName && (
                <span className="px-2.5 py-1 rounded-sm bg-[#0F1412] border border-[#2D3748] text-cyan-300 font-mono text-[11px]">
                  Sowa Rigpa: <strong className="text-slate-100 font-sans">{plant.tibetanName}</strong>
                </span>
              )}
              {plant.sanskritName && (
                <span className="px-2.5 py-1 rounded-sm bg-[#0F1412] border border-[#2D3748] text-emerald-300 font-mono text-[11px]">
                  Ayurveda: <strong className="text-slate-100 font-sans">{plant.sanskritName}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-2 self-end sm:self-start">
            {onOpenForager && (
              <button
                onClick={onOpenForager}
                className="flex items-center gap-1.5 px-3 py-2 rounded-sm bg-[#1A2220] hover:bg-[#25322E] text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold uppercase tracking-tight shadow-sm transition-all cursor-pointer"
                title="Explore Himalayan Wild Salads & Foraging Index"
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>Foraging Index</span>
              </button>
            )}
            {onOpenChatbot && (
              <button
                onClick={onOpenChatbot}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-black border border-emerald-400 text-xs font-bold uppercase tracking-tight shadow-sm transition-all cursor-pointer"
                title="Consult Context-Aware Botanist AI on this Specimen (Multi-Image Enabled)"
              >
                <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Ask Botanist AI</span>
              </button>
            )}
            <button
              onClick={shareMonograph}
              className="p-2 rounded-sm bg-[#1A2220] hover:bg-[#242f2c] border border-[#2D3748] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Share Monograph"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={toggleSave}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-sm border text-xs font-bold uppercase tracking-tight transition-all cursor-pointer ${
                isSaved
                  ? "bg-[#1A2220] text-emerald-400 border-emerald-500/50 shadow-sm"
                  : "bg-[#1A2220] hover:bg-[#242f2c] border-[#2D3748] text-slate-200"
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-black" /> Saved
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5 text-slate-400" /> Save Monograph
                </>
              )}
            </button>
          </div>
        </div>

        {copiedNotification && (
          <div className="mt-3 px-3 py-1.5 rounded-sm bg-emerald-950/60 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in font-mono">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            Botanical summary copied to clipboard!
          </div>
        )}

        {/* Botanical Summary Bio */}
        <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#0F1412] p-4 rounded-sm border border-[#2D3748]">
          {plant.botanicalDescription.summary}
        </p>
      </div>

      {/* User Feedback & Taxonomic Verification Mechanism */}
      <IdentificationFeedbackCard
        plant={plant}
        onOpenTrainingHub={() => setIsTrainingHubOpen(true)}
      />

      {/* Model Retraining & Fine-Tuning Dataset Hub Modal */}
      <ModelTrainingDataModal
        isOpen={isTrainingHubOpen}
        onClose={() => setIsTrainingHubOpen(false)}
      />

      {/* Interactive 3D Morphology Section */}
      <Plant3DViewer plant={plant} />

      {/* Edibility & Safety Matrix - Geometric Balance */}
      <div className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-5 sm:p-7 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#2D3748] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-tight text-white">
                Edibility Profile & Culinary Foraging Index
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Safe edible parts, culinary methods, and toxic lookalikes
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${getEdibilityBadgeColor(
              plant.edibility.rating
            )}`}
          >
            {plant.edibility?.rating || "Caution"}
          </span>
        </div>

        {/* Edible Parts Chips */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-mono">
            Edible Plant Parts
          </span>
          <div className="flex flex-wrap gap-2">
            {(plant.edibility?.edibleParts || []).map((part, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-sm bg-[#1A2220] border border-[#2D3748] text-xs font-bold text-emerald-300 flex items-center gap-1.5"
              >
                <Leaf className="w-3 h-3 text-emerald-400" />
                {part}
              </span>
            ))}
          </div>
        </div>

        {/* Culinary Uses */}
        <div className="p-3.5 rounded-sm bg-[#0F1412] border border-[#2D3748] text-xs text-slate-300 leading-relaxed">
          <strong className="text-emerald-400 block mb-1 text-[11px] uppercase font-mono tracking-wider">
            Culinary Preparation & Uses
          </strong>
          {plant.edibility?.culinaryUses || "No culinary preparation recorded."}
        </div>

        {/* Preparation Notes */}
        {plant.edibility?.preparationNotes && (
          <div className="p-3.5 rounded-sm bg-[#0F1412] border border-[#2D3748] text-xs text-slate-300 leading-relaxed">
            <strong className="text-cyan-400 block mb-1 text-[11px] uppercase font-mono tracking-wider">
              Culinary Detox & Extraction Notes
            </strong>
            {plant.edibility.preparationNotes}
          </div>
        )}

        {/* Toxic Lookalikes Diagnostic Alert */}
        {plant.edibility?.toxicLookalikes && plant.edibility.toxicLookalikes.length > 0 && (
          <div className="p-4 rounded-sm bg-rose-950/20 border border-rose-900/50 text-xs flex flex-col gap-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-xs font-mono">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Critical Toxic Lookalike Differential
            </div>
            {(plant.edibility.toxicLookalikes || []).map((lookalike, i) => (
              <div key={i} className="text-slate-300 pl-4 border-l-2 border-rose-600">
                <span className="font-bold text-rose-300 block">{lookalike.name}</span>
                <span className="text-slate-400">{lookalike.distinction}</span>
                {lookalike.hazard && (
                  <span className="block text-rose-400/90 font-mono mt-0.5 text-[10px] uppercase">
                    Hazard: {lookalike.hazard}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Safety Warnings & Contraindications */}
        {plant.edibility?.safetyWarnings && plant.edibility.safetyWarnings.length > 0 && (
          <div className="p-3.5 rounded-sm bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200/90 flex flex-col gap-1.5">
            <strong className="text-amber-400 uppercase tracking-wide flex items-center gap-1.5 font-mono text-[11px]">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Safety & Toxicity Warnings
            </strong>
            <ul className="list-disc pl-4 space-y-1">
              {(plant.edibility.safetyWarnings || []).map((warning, i) => (
                <li key={i} className="text-slate-300">
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tri-System Traditional Pharmacopoeia Matrix */}
      <div className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-5 sm:p-7 shadow-lg flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D3748] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-tight text-white">
                Traditional Pharmacopoeial Monograph
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Siddha, Sowa-Rigpa (Tibetan), Ayurveda, and Modern Phytotherapy
              </p>
            </div>
          </div>

          {/* System Tabs */}
          <div className="flex flex-wrap gap-1 bg-[#111614] p-1 rounded-sm border border-[#2D3748] self-start">
            <button
              onClick={() => setActiveSystemTab("siddha")}
              className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight transition-all cursor-pointer ${
                activeSystemTab === "siddha"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🌸 Siddha
            </button>
            <button
              onClick={() => setActiveSystemTab("sowaRigpa")}
              className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight transition-all cursor-pointer ${
                activeSystemTab === "sowaRigpa"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🏔️ Sowa Rigpa
            </button>
            <button
              onClick={() => setActiveSystemTab("ayurveda")}
              className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight transition-all cursor-pointer ${
                activeSystemTab === "ayurveda"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🕉️ Ayurveda
            </button>
            <button
              onClick={() => setActiveSystemTab("phytotherapy")}
              className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-tight transition-all cursor-pointer ${
                activeSystemTab === "phytotherapy"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🔬 Phytochemistry
            </button>
          </div>
        </div>

        {/* Tab 1: Siddha Pharmacopoeia */}
        {activeSystemTab === "siddha" && (
          <div className="flex flex-col gap-4 animate-fade-in text-xs">
            <div className="flex items-center justify-between p-3 rounded-sm bg-[#1A2220] border border-[#2D3748] text-slate-200">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Drug Origin Classification: {plant.medicinal.siddha.drugOriginClassification}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500">
                Pharma Network
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-sm bg-[#0F1412] border border-[#2D3748]">
                <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono mb-1">
                  Gunam (Properties)
                </span>
                <span className="font-bold text-slate-200 text-sm">
                  {plant.medicinal.siddha.gunam}
                </span>
              </div>
              <div className="p-3.5 rounded-sm bg-[#0F1412] border border-[#2D3748]">
                <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono mb-1">
                  Veeryam (Thermal Potency)
                </span>
                <span className="font-bold text-amber-300 text-sm">
                  {plant.medicinal.siddha.veeryam}
                </span>
              </div>
              <div className="p-3.5 rounded-sm bg-[#0F1412] border border-[#2D3748]">
                <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono mb-1">
                  Vibagham (Metabolic Conversion)
                </span>
                <span className="font-bold text-cyan-300 text-sm">
                  {plant.medicinal.siddha.vibagham}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-sm bg-[#0F1412] border border-[#2D3748] flex flex-col gap-2">
              <strong className="text-emerald-400 uppercase tracking-wider text-xs font-mono">
                Clinical Therapeutics & Sastric Action
              </strong>
              <p className="text-slate-300 leading-relaxed">
                {plant.medicinal?.siddha?.clinicalUses || "Traditional therapeutic monograph."}
              </p>
            </div>

            {plant.medicinal?.siddha?.formulations && plant.medicinal.siddha.formulations.length > 0 && (
              <div className="p-4 rounded-sm bg-[#0F1412] border border-[#2D3748] flex flex-col gap-2">
                <strong className="text-slate-300 uppercase tracking-wider text-xs font-mono">
                  Classical Siddha Formulations
                </strong>
                <div className="flex flex-wrap gap-2">
                  {(plant.medicinal.siddha.formulations || []).map((form, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-sm bg-[#1A2220] border border-[#2D3748] text-amber-200 font-medium"
                    >
                      {form}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Sowa Rigpa (Tibetan Medicine) */}
        {activeSystemTab === "sowaRigpa" && (
          <div className="flex flex-col gap-4 animate-fade-in text-xs">
            <div className="flex items-center justify-between p-3 rounded-sm bg-[#1A2220] border border-[#2D3748] text-cyan-200">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Snowflake className="w-4 h-4 text-cyan-400" />
                Tibetan Humoral Nature: {plant.medicinal?.sowaRigpa?.coldHotNature || "Cooling"}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500">
                SVDCDN Repository
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-sm bg-[#0F1412] border border-[#2D3748]">
                <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono mb-1">
                  Ro (Tibetan Taste)
                </span>
                <span className="font-bold text-cyan-300 text-sm">
                  {plant.medicinal?.sowaRigpa?.ro || "Kha-ba"}
                </span>
              </div>
              <div className="p-3.5 rounded-sm bg-[#0F1412] border border-[#2D3748]">
                <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono mb-1">
                  Zhu-jes (Post-Digestion)
                </span>
                <span className="font-bold text-slate-200 text-sm">
                  {plant.medicinal?.sowaRigpa?.zhuJes || "Kha-ba"}
                </span>
              </div>
              <div className="p-3.5 rounded-sm bg-[#0F1412] border border-[#2D3748]">
                <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono mb-1">
                  Nus-pa (17 Potencies)
                </span>
                <span className="font-bold text-emerald-300 text-sm">
                  {plant.medicinal?.sowaRigpa?.nusPa || "bsil"}
                </span>
              </div>
            </div>

            {/* Organ Affinity */}
            <div className="p-4 rounded-sm bg-[#0F1412] border border-[#2D3748] flex flex-col gap-2">
              <strong className="text-cyan-400 uppercase tracking-wider text-xs font-mono">
                Internal Organ Affinity Channels
              </strong>
              <div className="flex flex-wrap gap-2">
                {(plant.medicinal?.sowaRigpa?.organAffinity || []).map((org, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-sm bg-[#1A2220] border border-[#2D3748] text-cyan-200 font-medium"
                  >
                    {org}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-sm bg-[#0F1412] border border-[#2D3748] flex flex-col gap-2">
              <strong className="text-cyan-400 uppercase tracking-wider text-xs font-mono">
                Tibetan Four Tantras (rGyud-bZhi) Commentary
              </strong>
              <p className="text-slate-300 leading-relaxed">
                {plant.medicinal?.sowaRigpa?.traditionalTreatments || "Traditional Tibetan medical commentary."}
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Ayurveda */}
        {activeSystemTab === "ayurveda" && (
          <div className="flex flex-col gap-4 animate-fade-in text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-sm bg-[#0F1412] border border-[#2D3748]">
                <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono mb-1">
                  Rasa (Taste)
                </span>
                <span className="font-bold text-emerald-300">
                  {(plant.medicinal?.ayurveda?.rasa || []).join(", ") || "Tikta, Kashaya"}
                </span>
              </div>
              <div className="p-3 rounded-sm bg-[#0F1412] border border-[#2D3748]">
                <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono mb-1">
                  Guna (Quality)
                </span>
                <span className="font-bold text-slate-200">
                  {(plant.medicinal?.ayurveda?.guna || []).join(", ") || "Laghu, Ruksha"}
                </span>
              </div>
              <div className="p-3 rounded-sm bg-[#0F1412] border border-[#2D3748]">
                <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono mb-1">
                  Virya (Potency)
                </span>
                <span className="font-bold text-amber-300">
                  {plant.medicinal?.ayurveda?.virya || "Shita"}
                </span>
              </div>
              <div className="p-3 rounded-sm bg-[#0F1412] border border-[#2D3748]">
                <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono mb-1">
                  Vipaka (Post-Digestive)
                </span>
                <span className="font-bold text-cyan-300">
                  {plant.medicinal?.ayurveda?.vipaka || "Katu"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-sm bg-[#0F1412] border border-[#2D3748] flex flex-col gap-2">
              <strong className="text-emerald-400 uppercase tracking-wider text-xs font-mono">
                Dosha Impact
              </strong>
              <p className="text-slate-300 leading-relaxed">
                {plant.medicinal?.ayurveda?.doshaImpact || "Balances Tridosha."}
              </p>
            </div>

            <div className="p-4 rounded-sm bg-[#0F1412] border border-[#2D3748] flex flex-col gap-2">
              <strong className="text-emerald-400 uppercase tracking-wider text-xs font-mono">
                Primary Ayurvedic Indications
              </strong>
              <div className="flex flex-wrap gap-2">
                {(plant.medicinal?.ayurveda?.indications || []).map((ind, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-sm bg-[#1A2220] border border-[#2D3748] text-emerald-200 font-medium"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Phytochemistry & Modern Pharmacology */}
        {activeSystemTab === "phytotherapy" && (
          <div className="flex flex-col gap-4 animate-fade-in text-xs">
            {/* Active Constituents */}
            <div className="p-4 rounded-sm bg-[#0F1412] border border-[#2D3748] flex flex-col gap-2">
              <strong className="text-emerald-400 uppercase tracking-wider text-xs font-mono">
                Active Chemical Compounds & Bioactive Alkaloids
              </strong>
              <div className="flex flex-wrap gap-2">
                {(plant.medicinal?.westernPhytotherapy?.activeConstituents || []).map((chem, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-sm bg-[#1A2220] border border-[#2D3748] text-slate-200 font-mono font-bold"
                  >
                    {chem}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-sm bg-[#0F1412] border border-[#2D3748] flex flex-col gap-2">
              <strong className="text-emerald-400 uppercase tracking-wider text-xs font-mono">
                Pharmacological Mechanisms of Action
              </strong>
              <p className="text-slate-300 leading-relaxed">
                {plant.medicinal?.westernPhytotherapy?.pharmacology || "Bioactive constituents exert documented therapeutic actions."}
              </p>
            </div>

            <div className="p-4 rounded-sm bg-[#0F1412] border border-[#2D3748] flex flex-col gap-2">
              <strong className="text-emerald-400 uppercase tracking-wider text-xs font-mono">
                Modern Clinical Trials Summary
              </strong>
              <p className="text-slate-300 leading-relaxed">
                {plant.medicinal?.westernPhytotherapy?.modernStudies || "Scientific research corroborates traditional usage."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Practical Herbal Preparation Lab */}
      <div className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-5 sm:p-7 shadow-lg flex flex-col gap-4">
        <div className="flex items-center gap-2.5 border-b border-[#2D3748] pb-4">
          <div className="p-2 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold uppercase tracking-tight text-white">
              Herbal Preparation Lab & Safe Dosages
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Decoctions, cold infusions, medicated oils, and poultices
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(plant.medicinal?.preparations || []).map((prep, i) => (
            <div
              key={i}
              className="p-4 rounded-sm bg-[#0F1412] border border-[#2D3748] flex flex-col gap-2 text-xs"
            >
              <span className="font-bold text-emerald-400 text-sm uppercase font-mono tracking-tight">{prep.type}</span>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-slate-400">Method: </strong>
                {prep.recipe}
              </p>
              <div className="mt-1 pt-2 border-t border-[#2D3748] flex items-center justify-between text-slate-400 font-mono">
                <span>
                  <strong className="text-slate-300">Dosage: </strong>
                  {prep.dosage}
                </span>
              </div>
              {prep.safetyNote && (
                <span className="text-amber-400 text-[10px] font-mono uppercase">
                  ⚠️ {prep.safetyNote}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Digitised Material & Manuscript Quick Pointers */}
      {plant.digitisedRepository && (
        <div className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-5 sm:p-7 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#2D3748] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-tight text-white">
                  Full Digitised Materials & Academic PDF Pointers
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Open-access botanical mappings, structural layouts, and research citations
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Sowa Rigpa Pointer */}
            {plant.digitisedRepository.sowaRigpaCatalogue && (
              <div className="p-4 rounded-sm bg-[#0F1412] border border-[#2D3748] flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1 font-mono uppercase text-xs">
                    <FileText className="w-4 h-4" />
                    Sowa Rigpa Catalogue (SVDCDN Repository)
                  </div>
                  <p className="text-slate-300 text-xs font-mono">
                    {plant.digitisedRepository.sowaRigpaCatalogue.plateNumber} •{" "}
                    {plant.digitisedRepository.sowaRigpaCatalogue.manuscriptRef}
                  </p>
                  <p className="mt-2 text-slate-400 italic text-[11px] bg-[#161C1A] p-3 rounded-sm border border-[#2D3748]">
                    "{plant.digitisedRepository.sowaRigpaCatalogue.pdfExtractText}"
                  </p>
                </div>
                {onOpenRepositoryPointer && (
                  <button
                    onClick={() => onOpenRepositoryPointer("sowaRigpa")}
                    className="self-start text-xs font-bold uppercase tracking-tight text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    Open SVDCDN Botanical Mapping <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Siddha Pharmacopoeia Pointer */}
            {plant.digitisedRepository.siddhaPharmacopoeia && (
              <div className="p-4 rounded-sm bg-[#0F1412] border border-[#2D3748] flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1 font-mono uppercase text-xs">
                    <FileText className="w-4 h-4" />
                    Siddha Pharmacopoeial Booklets (Pharma Network)
                  </div>
                  <p className="text-slate-300 text-xs font-mono">
                    {plant.digitisedRepository.siddhaPharmacopoeia.structuralLayout} • Part:{" "}
                    {plant.digitisedRepository.siddhaPharmacopoeia.partCategory}
                  </p>
                  <p className="mt-2 text-slate-400 text-[11px] bg-[#161C1A] p-3 rounded-sm border border-[#2D3748] font-mono">
                    Spec: {plant.digitisedRepository.siddhaPharmacopoeia.standardSpec}
                  </p>
                </div>
                {onOpenRepositoryPointer && (
                  <button
                    onClick={() => onOpenRepositoryPointer("siddha")}
                    className="self-start text-xs font-bold uppercase tracking-tight text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    Open Siddha Monograph Specs <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pl@ntNet-300K Zenodo Benchmark & Set-Valued Candidates */}
      {plant.plantnet300k && (
        <div className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-5 sm:p-7 shadow-lg flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2D3748] pb-4 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-tight text-white">
                    Pl@ntNet-300K Benchmark &amp; Plant Morphology Classification
                  </h3>
                  <span className="px-2 py-0.5 text-[9px] font-mono uppercase font-bold rounded-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Zenodo {plant.plantnet300k.zenodoRecordId || "5645731"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Standardized on 306,146 images across 1,081 species with set-valued top-k disambiguation
                </p>
              </div>
            </div>

            <a
              href="https://zenodo.org/records/5645731"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 self-start sm:self-center"
            >
              DOI: 10.5281/zenodo.5645731 <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Plant Morphology & Ambiguity Status Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-3 rounded-sm bg-[#0F1412] border border-[#2D3748]">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
                Detected Plant Morphology
              </span>
              <div className="text-emerald-400 font-bold uppercase font-mono text-sm flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                {plant.plantnet300k.detectedOrgan.toUpperCase()}
              </div>
            </div>

            <div className="p-3 rounded-sm bg-[#0F1412] border border-[#2D3748]">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
                Morphology Confidence
              </span>
              <div className="text-white font-bold font-mono text-sm">
                {Math.round(plant.plantnet300k.organConfidence * 100)}%
              </div>
            </div>

            <div className="p-3 rounded-sm bg-[#0F1412] border border-[#2D3748]">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
                Ambiguity Index
              </span>
              <div
                className={`font-bold font-mono text-xs uppercase px-1.5 py-0.5 rounded-sm inline-block ${
                  plant.plantnet300k.ambiguityIndex === "Low"
                    ? "text-emerald-400 bg-emerald-950/40 border border-emerald-800"
                    : plant.plantnet300k.ambiguityIndex === "Moderate"
                    ? "text-amber-300 bg-amber-950/40 border border-amber-800"
                    : "text-rose-300 bg-rose-950/40 border border-rose-800"
                }`}
              >
                {plant.plantnet300k.ambiguityIndex}
              </div>
            </div>

            <div className="p-3 rounded-sm bg-[#0F1412] border border-[#2D3748]">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
                Set-Valued Protocol
              </span>
              <div className="text-cyan-300 font-bold font-mono text-xs flex items-center gap-1">
                <Scale className="w-3.5 h-3.5" /> Top-{plant.plantnet300k.candidates?.length || 1} Set
              </div>
            </div>
          </div>

          {/* Morphological Distinction Note */}
          {plant.plantnet300k.morphologicalDistinction && (
            <div className="p-3.5 rounded-sm bg-[#0F1412] border border-[#2D3748] text-xs">
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold block mb-1">
                Pl@ntNet-300K Fine-Grained Diagnostic Rationale:
              </span>
              <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                {plant.plantnet300k.morphologicalDistinction}
              </p>
            </div>
          )}

          {/* Associated Pl@ntNet Datasets Registry & GBIF Occurrence Linkages */}
          <div className="p-4 rounded-sm bg-[#0F1412] border border-[#2D3748] flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#E2E8F0] font-mono">
                  Associated Pl@ntNet Datasets &amp; GBIF Occurrences
                </span>
              </div>
              <button
                onClick={() => setIsDatasetsModalOpen(true)}
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Open Datasets Repository ({plant.plantnetDatasets?.length || 1})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(plant.plantnetDatasets || ["plantnet_300k"]).map((dsId) => {
                const meta = getDatasetMetadata(dsId);
                if (!meta) return null;
                return (
                  <button
                    key={dsId}
                    onClick={() => setIsDatasetsModalOpen(true)}
                    className={`px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold uppercase border flex items-center gap-1.5 cursor-pointer ${meta.badgeColor}`}
                  >
                    <span>{meta.shortName}</span>
                    <span className="text-slate-400 text-[9px]">({meta.category.replace('_', ' ')})</span>
                  </button>
                );
              })}
            </div>

            {/* GBIF Taxon Key Voucher */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#2D3748]/60 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">GBIF Taxon Key:</span>
                <span className="text-emerald-400 font-bold">#{plant.gbifTaxonKey || "3173168"}</span>
              </div>
              <a
                href={`https://www.gbif.org/species/${plant.gbifTaxonKey || "3173168"}`}
                target="_blank"
                rel="noreferrer"
                className="text-teal-400 hover:text-teal-300 flex items-center gap-1 text-[11px]"
              >
                View on GBIF Backbone Taxonomy <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Top-K Candidate Set Matrix */}
          {plant.plantnet300k.candidates && plant.plantnet300k.candidates.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block mb-2">
                Pl@ntNet-300K Top-K Candidate Set (Set-Valued Classification):
              </span>
              <div className="space-y-2">
                {plant.plantnet300k.candidates.map((cand, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-sm border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono transition-all ${
                      idx === 0
                        ? "bg-[#1A2220] border-emerald-500/40 shadow-sm"
                        : "bg-[#0F1412] border-[#2D3748]"
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                          idx === 0
                            ? "bg-emerald-500 text-black"
                            : "bg-[#161C1A] text-slate-400 border border-[#2D3748]"
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-white font-bold flex items-center gap-2">
                          <span>{cand.scientificName}</span>
                          <span className="text-slate-400 font-sans font-normal text-[11px]">
                            ({cand.commonName})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                          {cand.distinguishingFeature}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="px-2 py-0.5 text-[10px] rounded-sm bg-[#161C1A] border border-[#2D3748] text-slate-300 uppercase">
                        {cand.organClass}
                      </span>
                      <div className="w-20 sm:w-28 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#161C1A] rounded-full overflow-hidden border border-[#2D3748]">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${Math.round(cand.confidence * 100)}%` }}
                          />
                        </div>
                        <span className="text-emerald-400 font-bold text-[11px] w-8 text-right">
                          {Math.round(cand.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Institutional Authorship, Creative Commons License & Benevity Causes Card */}
      <div className="p-4 sm:p-5 rounded-sm bg-[#121816] border border-[#2D3748] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-white font-sans text-sm">
              Dr. Bheemaiah Anil K
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#18221F] text-emerald-400 border border-emerald-500/30">
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
            FloraMedica Open Botanical Pharmacopoeia &amp; Diagnostic Platform • Support our open-access mission
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <a
            href="https://causes.benevity.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-tight text-[11px] rounded-sm flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Heart className="w-3.5 h-3.5 fill-black" />
            <span>Contribute via Benevity</span>
          </a>
        </div>
      </div>
      {/* Pl@ntNet Datasets Repository Modal */}
      <PlantNetDatasetsModal
        isOpen={isDatasetsModalOpen}
        onClose={() => setIsDatasetsModalOpen(false)}
      />
    </div>
  );
};
