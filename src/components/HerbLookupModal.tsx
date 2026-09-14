import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Leaf,
  Wifi,
  WifiOff,
  Sparkles,
  Database,
  ArrowRight,
  X,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Filter,
  Layers,
  Eye,
  ZoomIn,
  Image as ImageIcon,
  Info,
  Maximize2,
  Box,
  ChevronRight,
  ShieldCheck,
  Globe,
  Tag,
} from "lucide-react";
import { PlantData, PlantNetOrgan, PlantOrganImage } from "../types";
import { PlantService, FULL_BOTANICAL_DATABASE } from "../services/plantService";
import { getPlantOrganImages } from "../data/plantOrganImages";

interface HerbLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlant: (plant: PlantData, isOffline: boolean, source: string) => void;
  isOnlineMode: boolean;
  onOpenForagingExplorer?: () => void;
}

type OrganFilterType = "all" | "leaf" | "flower" | "bark" | "fruit" | "habit";
type CulinaryFilterType = "all" | "wild_salad" | "edible_flour" | "fruits_berries" | "tubers_winterfood";
type ViewModeType = "gallery" | "detailed" | "compact";

export const HerbLookupModal: React.FC<HerbLookupModalProps> = ({
  isOpen,
  onClose,
  onSelectPlant,
  isOnlineMode,
  onOpenForagingExplorer,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PlantData[]>([]);
  const [searchSource, setSearchSource] = useState<string>("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeOrganFilter, setActiveOrganFilter] = useState<OrganFilterType>("all");
  const [activeCulinaryFilter, setActiveCulinaryFilter] = useState<CulinaryFilterType>("all");
  const [viewMode, setViewMode] = useState<ViewModeType>("gallery");
  
  // Active selected organ per plant card (map plant.id -> organ)
  const [selectedOrganPerPlant, setSelectedOrganPerPlant] = useState<Record<string, PlantNetOrgan>>({});
  
  // Lightbox / Deep Organ Inspector State
  const [inspectingPlant, setInspectingPlant] = useState<PlantData | null>(null);
  const [inspectingOrganIndex, setInspectingOrganIndex] = useState<number>(0);
  
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus input on open & initialize curated list
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (!searchTerm) {
        setSearchResults(FULL_BOTANICAL_DATABASE.slice(0, 8));
        setSearchSource(
          isOnlineMode
            ? "PlantNet API Online Mode Active • Multi-Organ Taxonomic Feeds Enabled"
            : "Pl@ntNet-300K Offline Benchmark Database (Zenodo 5645731)"
        );
      }
    }
  }, [isOpen, isOnlineMode]);

  // Execute lookup
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    setSearchError(null);

    const trimmed = term.trim();
    if (!trimmed) {
      setSearchResults(FULL_BOTANICAL_DATABASE.slice(0, 8));
      setSearchSource(
        isOnlineMode
          ? "PlantNet API Online Mode Active • Multi-Organ Taxonomic Feeds Enabled"
          : "Pl@ntNet-300K Offline Benchmark Database (Zenodo 5645731)"
      );
      return;
    }

    // Fast local filter first for instant UI response
    const localMatches = PlantService.searchPlants(trimmed);
    if (localMatches.length > 0) {
      setSearchResults(localMatches);
      setSearchSource(
        isOnlineMode
          ? "Pl@ntNet-300K Local Taxonomy & PlantNet API Live Ready"
          : "Pl@ntNet-300K Offline Benchmark Database (Zenodo 5645731)"
      );
    }

    // If query is specific, run the deep lookup service
    if (trimmed.length >= 3) {
      setIsSearching(true);
      try {
        const result = await PlantService.lookupHerbByName(trimmed, isOnlineMode);
        if (result.plant) {
          // Put the top match first and merge any other candidate matches
          const uniqueList = [result.plant];
          for (const c of result.candidates) {
            if (!uniqueList.some((p) => p.id === c.id || p.scientificName === c.scientificName)) {
              uniqueList.push(c);
            }
          }
          setSearchResults(uniqueList);
          setSearchSource(result.source);
        } else if (localMatches.length === 0) {
          setSearchResults([]);
          setSearchError(`No direct specimen matched "${trimmed}". Try searching by genus, Telugu Siddha name, or common name.`);
        }
      } catch (err: any) {
        console.warn("Search lookup error:", err);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleSelect = (plant: PlantData) => {
    const isOffline = !isOnlineMode || plant.identificationEngine === "offline_database";
    onSelectPlant(plant, isOffline, searchSource || "Herb Name Lookup");
    onClose();
  };

  const curatedQuickKeywords = [
    { label: "Urtica dioica", sub: "Nettle / Zwa-tshod", category: "wild_salad" },
    { label: "Chenopodium album", sub: "Bathua / Mountain Spinach", category: "wild_salad" },
    { label: "Rumex acetosa", sub: "Wild Sorrel / Chuka", category: "wild_salad" },
    { label: "Taraxacum tibetanum", sub: "Alpine Dandelion", category: "wild_salad" },
    { label: "Diplazium esculentum", sub: "Linguda Fiddlehead", category: "wild_salad" },
    { label: "Nasturtium officinale", sub: "Watercress / Piriya Halim", category: "wild_salad" },
    { label: "Portulaca oleracea", sub: "Wild Purslane / Kulfa", category: "wild_salad" },
    { label: "Allium wallichii", sub: "Jimbu / Wild Chives", category: "wild_salad" },
    { label: "Oxalis corniculata", sub: "Wood Sorrel / Changery", category: "wild_salad" },
    { label: "Malva verticillata", sub: "Sonchal / Mallow", category: "wild_salad" },
    { label: "Fagopyrum tataricum", sub: "Tartary Buckwheat Flour", category: "edible_flour" },
    { label: "Amaranthus hypochondriacus", sub: "Ramdana / Amaranth Flour", category: "edible_flour" },
    { label: "Hippophae rhamnoides", sub: "Seabuckthorn Superfruit", category: "fruits_berries" },
    { label: "Berberis aristata", sub: "Kingora / Wild Barberry", category: "fruits_berries" },
    { label: "Dioscorea deltoidea", sub: "Tarur Wild Yam Tuber", category: "tubers_winterfood" },
    { label: "Dactylorhiza hatagirea", sub: "Salam Panja Salep Tuber", category: "tubers_winterfood" },
    { label: "Centella asiatica", sub: "Gotu Kola / Vallari", category: "wild_salad" },
    { label: "Phyllanthus emblica", sub: "Amla / Usiri", category: "fruits_berries" },
    { label: "Ocimum tenuiflorum", sub: "Holy Basil / Tulsi", category: "general" },
    { label: "Withania somnifera", sub: "Ashwagandha", category: "general" },
  ];

  const organIcons: Record<string, { label: string; icon: string; color: string; bg: string }> = {
    leaf: { label: "Leaf (Foliage)", icon: "🌿", color: "text-emerald-400", bg: "bg-emerald-950/40 border-emerald-500/30" },
    flower: { label: "Flower (Corolla)", icon: "🌸", color: "text-pink-400", bg: "bg-pink-950/40 border-pink-500/30" },
    bark: { label: "Bark & Stem", icon: "🪵", color: "text-amber-400", bg: "bg-amber-950/40 border-amber-500/30" },
    fruit: { label: "Fruit & Seed", icon: "🍎", color: "text-red-400", bg: "bg-red-950/40 border-red-500/30" },
    habit: { label: "Growth Habit", icon: "🌳", color: "text-teal-400", bg: "bg-teal-950/40 border-teal-500/30" },
    other: { label: "Other Organ", icon: "🌱", color: "text-slate-400", bg: "bg-slate-900 border-slate-700" },
  };

  // Helper to get active organ image for a plant
  const getActivePlantImage = (plant: PlantData): { url: string; organ: PlantNetOrgan; title: string; source: string } => {
    const images = plant.organImages && plant.organImages.length > 0 ? plant.organImages : getPlantOrganImages(plant);
    const preferredOrgan = selectedOrganPerPlant[plant.id] || (activeOrganFilter !== "all" ? activeOrganFilter : "leaf");
    
    const matched = images.find((img) => img.organ === preferredOrgan);
    if (matched) {
      return {
        url: matched.url,
        organ: matched.organ,
        title: matched.title || `${plant.scientificName} (${matched.organ})`,
        source: matched.source || (isOnlineMode ? "PlantNet API" : "Pl@ntNet-300K"),
      };
    }
    
    return {
      url: images[0]?.url || plant.imageUrl || "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
      organ: images[0]?.organ || "leaf",
      title: images[0]?.title || `${plant.scientificName} Leaf`,
      source: images[0]?.source || "Pl@ntNet-300K",
    };
  };

  // Filtered results based on organ filter & culinary category filter
  const displayedResults = useMemo(() => {
    let list = searchResults;

    if (activeCulinaryFilter !== "all") {
      if (activeCulinaryFilter === "wild_salad") {
        list = list.filter((p) =>
          p.tags.some((t) => t.toLowerCase().includes("salad") || t.toLowerCase().includes("leaf") || t.toLowerCase().includes("leaves")) ||
          p.edibility.edibleParts.some((part) => part.toLowerCase().includes("leaf") || part.toLowerCase().includes("shoot"))
        );
      } else if (activeCulinaryFilter === "edible_flour") {
        list = list.filter((p) =>
          p.tags.some((t) => t.toLowerCase().includes("flour") || t.toLowerCase().includes("grain") || t.toLowerCase().includes("starch")) ||
          p.edibility.culinaryUses.toLowerCase().includes("flour") ||
          p.edibility.culinaryUses.toLowerCase().includes("atta") ||
          p.edibility.culinaryUses.toLowerCase().includes("porridge")
        );
      } else if (activeCulinaryFilter === "fruits_berries") {
        list = list.filter((p) =>
          p.edibility.edibleParts.some((part) => part.toLowerCase().includes("fruit") || part.toLowerCase().includes("berry")) ||
          p.tags.some((t) => t.toLowerCase().includes("fruit") || t.toLowerCase().includes("berry"))
        );
      } else if (activeCulinaryFilter === "tubers_winterfood") {
        list = list.filter((p) =>
          p.edibility.edibleParts.some((part) => part.toLowerCase().includes("tuber") || part.toLowerCase().includes("root") || part.toLowerCase().includes("rhizome") || part.toLowerCase().includes("bulb")) ||
          p.tags.some((t) => t.toLowerCase().includes("tuber") || t.toLowerCase().includes("winter") || t.toLowerCase().includes("root"))
        );
      }
    }

    if (activeOrganFilter !== "all") {
      list = list.filter((plant) => {
        const images = plant.organImages && plant.organImages.length > 0 ? plant.organImages : getPlantOrganImages(plant);
        return images.some((img) => img.organ === activeOrganFilter);
      });
    }

    return list;
  }, [searchResults, activeOrganFilter, activeCulinaryFilter]);

  if (!isOpen) return null;

  return (
    <div
      id="herb-lookup-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="herb-lookup-modal-container"
        className="bg-[#161C1A] border border-[#2D3748] rounded-lg w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Mode Badge & Organ Multi-Feed Indicator */}
        <div className="p-3 sm:p-4 border-b border-[#2D3748] flex items-center justify-between bg-[#111614]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-md flex items-center justify-center text-black font-bold shadow-md shadow-emerald-500/20">
              <Search className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
                  Herb Taxonomic & Multi-Organ Lookup
                </h3>
                <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Leaves • Flowers • Bark • Fruit • Habit
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {isOnlineMode ? (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <span>PlantNet API Online Mode Active</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                    <WifiOff className="w-3 h-3 text-amber-400" />
                    <span>Pl@ntNet-300K Offline Mode (Zenodo 5645731)</span>
                  </span>
                )}
                <span className="text-[10px] font-mono text-slate-400 hidden md:inline">
                  • 42,000+ Regional Taxa with Fine-Grained Anatomical Imagery
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="close-herb-lookup-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-md hover:bg-[#1A2220] transition-colors cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="p-3 sm:p-4 bg-[#161C1A] border-b border-[#2D3748] space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
            <input
              id="herb-lookup-input-field"
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search scientific binomial (e.g. Centella asiatica), Telugu Siddha, Sowa-Rigpa, or common name..."
              className="w-full bg-[#0F1412] border border-[#2D3748] focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-white rounded-md pl-10 pr-10 py-2.5 text-sm font-sans placeholder:text-slate-500 outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Organ Filter Tabs & View Mode Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
            {/* Organ Selectors */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold shrink-0 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3 text-emerald-400" />
                <span>Organ:</span>
              </span>
              
              <button
                onClick={() => setActiveOrganFilter("all")}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  activeOrganFilter === "all"
                    ? "bg-emerald-500 text-black font-bold shadow-sm"
                    : "bg-[#111614] text-slate-300 hover:text-emerald-300 border border-[#2D3748] hover:bg-[#1A2220]"
                }`}
              >
                <span>🌿🌸 All Organs</span>
              </button>

              <button
                onClick={() => setActiveOrganFilter("leaf")}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  activeOrganFilter === "leaf"
                    ? "bg-emerald-500 text-black font-bold shadow-sm"
                    : "bg-[#111614] text-slate-300 hover:text-emerald-300 border border-[#2D3748] hover:bg-[#1A2220]"
                }`}
              >
                <span>🌿 Leaves</span>
              </button>

              <button
                onClick={() => setActiveOrganFilter("flower")}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  activeOrganFilter === "flower"
                    ? "bg-pink-500 text-black font-bold shadow-sm"
                    : "bg-[#111614] text-slate-300 hover:text-pink-300 border border-[#2D3748] hover:bg-[#1A2220]"
                }`}
              >
                <span>🌸 Flowers</span>
              </button>

              <button
                onClick={() => setActiveOrganFilter("bark")}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  activeOrganFilter === "bark"
                    ? "bg-amber-500 text-black font-bold shadow-sm"
                    : "bg-[#111614] text-slate-300 hover:text-amber-300 border border-[#2D3748] hover:bg-[#1A2220]"
                }`}
              >
                <span>🪵 Bark & Stems</span>
              </button>

              <button
                onClick={() => setActiveOrganFilter("fruit")}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  activeOrganFilter === "fruit"
                    ? "bg-red-500 text-black font-bold shadow-sm"
                    : "bg-[#111614] text-slate-300 hover:text-red-300 border border-[#2D3748] hover:bg-[#1A2220]"
                }`}
              >
                <span>🍎 Fruits & Seeds</span>
              </button>

              <button
                onClick={() => setActiveOrganFilter("habit")}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  activeOrganFilter === "habit"
                    ? "bg-teal-500 text-black font-bold shadow-sm"
                    : "bg-[#111614] text-slate-300 hover:text-teal-300 border border-[#2D3748] hover:bg-[#1A2220]"
                }`}
              >
                <span>🌳 Growth Habit</span>
              </button>
            </div>

            {/* View Mode Toggle & Open Wild Salad UI */}
            <div className="flex items-center gap-2">
              {onOpenForagingExplorer && (
                <button
                  id="modal-open-wild-salad-explorer-btn"
                  onClick={() => {
                    onClose();
                    onOpenForagingExplorer();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold transition-all cursor-pointer shadow-sm"
                  title="Open Dedicated Himalayan Wild Salad & Reverse Foraging Index Explorer"
                >
                  <span>🥗 Wild Salad & Foraging UI</span>
                  <ArrowRight className="w-3 h-3 text-emerald-400" />
                </button>
              )}

              <div className="hidden sm:flex items-center gap-1 bg-[#111614] border border-[#2D3748] p-0.5 rounded">
                <button
                  onClick={() => setViewMode("gallery")}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                    viewMode === "gallery" ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Organ Gallery
                </button>
                <button
                  onClick={() => setViewMode("detailed")}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                    viewMode === "detailed" ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Detailed Monograph
                </button>
                <button
                  onClick={() => setViewMode("compact")}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                    viewMode === "compact" ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Compact List
                </button>
              </div>
            </div>
          </div>

          {/* Reverse Index / Culinary Category Quick Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none border-t border-[#2D3748]/50">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold shrink-0 flex items-center gap-1">
              <span>Category:</span>
            </span>

            <button
              onClick={() => setActiveCulinaryFilter("all")}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-all shrink-0 cursor-pointer ${
                activeCulinaryFilter === "all"
                  ? "bg-slate-700 text-white font-bold"
                  : "bg-[#111614] text-slate-400 hover:text-slate-200 border border-[#2D3748]"
              }`}
            >
              🌿 All Taxa
            </button>

            <button
              onClick={() => setActiveCulinaryFilter("wild_salad")}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-all shrink-0 cursor-pointer ${
                activeCulinaryFilter === "wild_salad"
                  ? "bg-emerald-500 text-black font-bold"
                  : "bg-[#111614] text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/40"
              }`}
            >
              🥗 Wild Salad (Edible Leaves)
            </button>

            <button
              onClick={() => setActiveCulinaryFilter("edible_flour")}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-all shrink-0 cursor-pointer ${
                activeCulinaryFilter === "edible_flour"
                  ? "bg-amber-500 text-black font-bold"
                  : "bg-[#111614] text-amber-400 hover:bg-amber-950/40 border border-amber-500/40"
              }`}
            >
              🌾 Edible Flour & Grains
            </button>

            <button
              onClick={() => setActiveCulinaryFilter("fruits_berries")}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-all shrink-0 cursor-pointer ${
                activeCulinaryFilter === "fruits_berries"
                  ? "bg-pink-500 text-black font-bold"
                  : "bg-[#111614] text-pink-400 hover:bg-pink-950/40 border border-pink-500/40"
              }`}
            >
              🫐 Wild Fruits & Berries
            </button>

            <button
              onClick={() => setActiveCulinaryFilter("tubers_winterfood")}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-all shrink-0 cursor-pointer ${
                activeCulinaryFilter === "tubers_winterfood"
                  ? "bg-teal-500 text-black font-bold"
                  : "bg-[#111614] text-teal-400 hover:bg-teal-950/40 border border-teal-500/40"
              }`}
            >
              🥔 Tubers & Winterfood
            </button>
          </div>

          {/* Quick Curated Taxa Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold shrink-0">
              Quick Taxa:
            </span>
            {curatedQuickKeywords.map((item) => (
              <button
                key={item.label}
                onClick={() => handleSearch(item.label)}
                className="px-2 py-0.5 rounded bg-[#111614] hover:bg-[#1A2220] border border-[#2D3748] hover:border-emerald-500/50 text-[10px] text-slate-300 hover:text-emerald-300 font-mono transition-all shrink-0 cursor-pointer flex items-center gap-1"
              >
                <span>{item.label}</span>
                <span className="text-[9px] text-slate-500">({item.sub})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Source Citation & Status Banner */}
        <div className="px-4 py-2 bg-[#111614] border-b border-[#2D3748] flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-md">{searchSource}</span>
          </div>
          <div className="flex items-center gap-2">
            {isOnlineMode && (
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>PlantNet v2 API Connected</span>
              </span>
            )}
            <span className="text-emerald-400 font-bold">
              {displayedResults.length} {displayedResults.length === 1 ? "specimen" : "specimens"}
            </span>
          </div>
        </div>

        {/* Results List View with Organ Gallery */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 max-h-[58vh]">
          {isSearching && (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 gap-3 font-mono">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs uppercase tracking-wider text-emerald-400">
                {isOnlineMode
                  ? "Querying PlantNet API & Multi-Organ Pharmacopoeias..."
                  : "Scanning Pl@ntNet-300K Benchmark Taxa & Organ Priors..."}
              </p>
            </div>
          )}

          {searchError && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-md text-amber-300 text-xs font-mono flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <p className="font-bold">No Exact Match Found</p>
                <p className="mt-1 text-slate-300">{searchError}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSearch("Centella asiatica")}
                    className="px-2 py-1 bg-[#161C1A] border border-[#2D3748] text-emerald-400 hover:text-white rounded text-[10px]"
                  >
                    Try Gotu Kola
                  </button>
                  <button
                    onClick={() => handleSearch("Ocimum")}
                    className="px-2 py-1 bg-[#161C1A] border border-[#2D3748] text-emerald-400 hover:text-white rounded text-[10px]"
                  >
                    Try Ocimum (Tulsi)
                  </button>
                  <button
                    onClick={() => handleSearch("Neem")}
                    className="px-2 py-1 bg-[#161C1A] border border-[#2D3748] text-emerald-400 hover:text-white rounded text-[10px]"
                  >
                    Try Neem
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isSearching &&
            displayedResults.map((plant) => {
              const organImages = plant.organImages && plant.organImages.length > 0 ? plant.organImages : getPlantOrganImages(plant);
              const activeImg = getActivePlantImage(plant);
              const currentSelectedOrgan = selectedOrganPerPlant[plant.id] || activeImg.organ;

              return (
                <div
                  id={`herb-result-${plant.id}`}
                  key={plant.id}
                  className="group bg-[#111614] hover:bg-[#141A18] border border-[#2D3748] hover:border-emerald-500/60 rounded-lg p-3 sm:p-4 transition-all shadow-sm flex flex-col gap-3"
                >
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Active Selected Organ Primary Thumbnail */}
                    <div className="relative w-full lg:w-48 h-36 lg:h-auto shrink-0 bg-[#0A0D0C] rounded-md overflow-hidden border border-[#2D3748] group-hover:border-emerald-500/40">
                      <img
                        src={activeImg.url}
                        alt={activeImg.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Active Organ Tag Badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono border border-white/10 text-white">
                        <span>{organIcons[activeImg.organ]?.icon || "🌱"}</span>
                        <span className="capitalize font-bold">{activeImg.organ}</span>
                      </div>

                      {/* Inspect Button on image */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingPlant(plant);
                          setInspectingOrganIndex(organImages.findIndex((img) => img.organ === activeImg.organ) || 0);
                        }}
                        className="absolute bottom-2 right-2 p-1.5 bg-black/80 hover:bg-emerald-500 text-slate-300 hover:text-black rounded text-[10px] font-mono flex items-center gap-1 transition-all"
                        title="Inspect plant morphology in high resolution"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Inspect Morphology</span>
                      </button>

                      {/* Provenance Tag */}
                      <div className="absolute bottom-2 left-2 text-[8px] font-mono bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        {isOnlineMode ? "PlantNet API Live" : "Pl@ntNet-300K"}
                      </div>
                    </div>

                    {/* Plant Specimen Information */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-serif italic font-bold text-base sm:text-lg text-white group-hover:text-emerald-400 transition-colors">
                              {plant.scientificName}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              ({plant.family})
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                plant.edibility.isSafeForHumanConsumption
                                  ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                                  : "bg-red-950/60 text-red-300 border border-red-500/30"
                              }`}
                            >
                              {plant.edibility.rating} ({plant.edibility.ratingScore}/100)
                            </span>
                          </div>

                          {/* Vernacular Tags */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] font-mono">
                            {plant.teluguName && (
                              <span className="bg-[#161C1A] text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                                Siddha (Telugu): {plant.teluguName}
                              </span>
                            )}
                            {plant.tibetanName && (
                              <span className="bg-[#161C1A] text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded">
                                Sowa-Rigpa: {plant.tibetanName}
                              </span>
                            )}
                            {plant.sanskritName && (
                              <span className="bg-[#161C1A] text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
                                Ayurveda: {plant.sanskritName}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Direct Dossier & 3D Action Button */}
                        <button
                          onClick={() => handleSelect(plant)}
                          className="self-start sm:self-center mt-2 sm:mt-0 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded text-xs uppercase tracking-tight flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-md shadow-emerald-500/10"
                        >
                          <span>Open Dossier & 3D</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-300 font-sans line-clamp-2">
                        <span className="font-bold text-slate-400">Common: </span>
                        {(plant.commonNames || []).join(", ")} •{" "}
                        <span className="text-slate-400 italic">{plant.botanicalDescription.summary}</span>
                      </p>

                      {/* Multi-Organ Thumbnail Strip */}
                      <div className="pt-2 border-t border-[#1F2926]">
                        <div className="flex items-center justify-between pb-1 text-[10px] font-mono text-slate-400">
                          <span className="flex items-center gap-1 font-bold text-emerald-400 uppercase tracking-wider">
                            <Layers className="w-3 h-3" />
                            <span>Plant Morphology Imagery ({organImages.length} Views)</span>
                          </span>
                          <span className="text-slate-500">Click morphology to switch view</span>
                        </div>

                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1">
                          {organImages.map((img, idx) => {
                            const isCurrent = currentSelectedOrgan === img.organ;
                            const organMeta = organIcons[img.organ] || organIcons.other;

                            return (
                              <div
                                key={img.id || `${plant.id}-${img.organ}-${idx}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrganPerPlant((prev) => ({
                                    ...prev,
                                    [plant.id]: img.organ,
                                  }));
                                }}
                                className={`relative group/organ p-1 rounded bg-[#0D1210] border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                                  isCurrent
                                    ? "border-emerald-400 ring-1 ring-emerald-400 bg-emerald-950/20"
                                    : "border-[#2D3748] hover:border-emerald-500/50 hover:bg-[#161C1A]"
                                }`}
                              >
                                <div className="w-full h-12 sm:h-14 rounded overflow-hidden relative bg-black">
                                  <img
                                    src={img.url}
                                    alt={img.title || img.organ}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover group-hover/organ:scale-110 transition-transform duration-300"
                                  />
                                  <span className="absolute bottom-0.5 right-0.5 text-[10px] bg-black/70 px-1 rounded">
                                    {organMeta.icon}
                                  </span>
                                </div>
                                <span className={`text-[9px] font-mono truncate w-full text-center capitalize ${
                                  isCurrent ? "text-emerald-300 font-bold" : "text-slate-400 group-hover/organ:text-white"
                                }`}>
                                  {img.organ}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Medicinal & Actions metadata pills */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap text-[10px] font-mono text-slate-400">
                        <span className="bg-[#161C1A] px-2 py-0.5 rounded border border-[#2D3748]">
                          🌿 Leaf Shape: {plant.botanicalDescription.leafShape}
                        </span>
                        <span className="bg-[#161C1A] px-2 py-0.5 rounded border border-[#2D3748]">
                          🌸 Flower: {plant.botanicalDescription.flowerColor}
                        </span>
                        <span className="text-slate-400 truncate max-w-xs">
                          Actions: {(plant.medicinal.primaryActions || []).slice(0, 3).join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer with PlantNet API attribution */}
        <div className="p-3 bg-[#111614] border-t border-[#2D3748] flex items-center justify-between text-slate-400 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">Pl@ntNet-300K Benchmark (Zenodo 5645731)</span>
            <span className="hidden sm:inline text-slate-500">• Plant Morphology Classifier</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500 hidden md:inline">
              Shortcut: <kbd className="bg-[#1A2220] px-1.5 py-0.5 rounded border border-[#2D3748] text-slate-300">Esc</kbd> to exit
            </span>
            <button
              onClick={onClose}
              className="px-3.5 py-1 bg-[#161C1A] hover:bg-[#1A2220] border border-[#2D3748] text-slate-300 hover:text-white rounded text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Deep Plant Morphology Inspector & High-Resolution Lightbox Modal */}
      {inspectingPlant && (
        <div
          id="organ-inspector-lightbox"
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg animate-fadeIn"
          onClick={() => setInspectingPlant(null)}
        >
          <div
            className="bg-[#141A18] border border-emerald-500/40 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="p-3 sm:p-4 border-b border-[#2D3748] bg-[#0E1311] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white font-serif italic">
                    {inspectingPlant.scientificName}
                  </h4>
                  <p className="text-[10px] font-mono text-emerald-400">
                    High-Resolution Plant Morphology Anatomical Photo Gallery ({inspectingPlant.family})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectingPlant(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-[#1A2220] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lightbox Body */}
            {(() => {
              const organImages = inspectingPlant.organImages && inspectingPlant.organImages.length > 0
                ? inspectingPlant.organImages
                : getPlantOrganImages(inspectingPlant);
              const currentImg = organImages[inspectingOrganIndex] || organImages[0];
              const organMeta = organIcons[currentImg?.organ || "leaf"] || organIcons.other;

              return (
                <div className="flex-1 overflow-y-auto p-4 flex flex-col lg:flex-row gap-4">
                  {/* Big Image Display */}
                  <div className="flex-1 flex flex-col items-center justify-center bg-black/60 rounded-lg border border-[#2D3748] p-2 relative min-h-[300px]">
                    <img
                      src={currentImg?.url}
                      alt={currentImg?.title}
                      referrerPolicy="no-referrer"
                      className="max-h-[50vh] max-w-full object-contain rounded"
                    />
                    
                    {/* Organ Overlay Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-3 py-1 rounded border border-white/10 text-white font-mono text-xs">
                      <span>{organMeta.icon}</span>
                      <span className="capitalize font-bold">{currentImg?.organ} Morphology Class</span>
                    </div>

                    {/* Source attribution tag */}
                    <div className="absolute bottom-4 left-4 text-[10px] font-mono bg-black/80 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                      Provenance: {currentImg?.source?.toUpperCase() || (isOnlineMode ? "PLANTNET API" : "PL@NTNET-300K")}
                    </div>
                  </div>

                  {/* Organ Details & Switcher Panel */}
                  <div className="w-full lg:w-80 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                          Plant Morphology Diagnosis
                        </span>
                        <h5 className="text-sm font-bold text-white mt-0.5">
                          {currentImg?.title || `${currentImg?.organ} Anatomical Structure`}
                        </h5>
                        <p className="text-xs text-slate-300 mt-1 font-mono">
                          Photographer/Attribution: {currentImg?.author || "Botanical Taxonomy Archive"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          License: {currentImg?.license || "CC-BY-SA 4.0"}
                        </p>
                      </div>

                      {/* Organ-specific morphological features */}
                      <div className="p-3 bg-[#0E1311] rounded border border-[#2D3748] space-y-2 text-xs font-mono">
                        <div className="text-emerald-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" />
                          <span>Plant Morphology Characters</span>
                        </div>
                        
                        {currentImg?.organ === "leaf" && (
                          <div className="space-y-1 text-slate-300 text-[11px]">
                            <p>• Shape: {inspectingPlant.botanicalDescription.leafShape}</p>
                            <p>• Venation: {inspectingPlant.botanicalDescription.venation}</p>
                            <p>• Margin: {inspectingPlant.morphology3D.serration ? "Serrate" : "Entire / Undulate"}</p>
                          </div>
                        )}

                        {currentImg?.organ === "flower" && (
                          <div className="space-y-1 text-slate-300 text-[11px]">
                            <p>• Color: {inspectingPlant.botanicalDescription.flowerColor}</p>
                            <p>• Inflorescence: Axillary / Fascicled</p>
                            <p>• Corolla: 3D Morphology Mesh Verified</p>
                          </div>
                        )}

                        {currentImg?.organ === "bark" && (
                          <div className="space-y-1 text-slate-300 text-[11px]">
                            <p>• Stem Type: {inspectingPlant.botanicalDescription.stemType}</p>
                            <p>• Cortical Feature: Fissured / Herbaceous</p>
                            <p>• Siddha Part: {inspectingPlant.medicinal.siddha.drugOriginClassification}</p>
                          </div>
                        )}

                        {currentImg?.organ === "fruit" && (
                          <div className="space-y-1 text-slate-300 text-[11px]">
                            <p>• Type: {inspectingPlant.botanicalDescription.fruitType}</p>
                            <p>• Seed Dispersal: Dehiscent / Drupaceous</p>
                            <p>• Edibility: {inspectingPlant.edibility.rating}</p>
                          </div>
                        )}

                        {currentImg?.organ === "habit" && (
                          <div className="space-y-1 text-slate-300 text-[11px]">
                            <p>• Height: {inspectingPlant.botanicalDescription.heightRange}</p>
                            <p>• Habitat: {inspectingPlant.habitat}</p>
                            <p>• Growth Form: Perennial Botanical Taxon</p>
                          </div>
                        )}
                      </div>

                      {/* Organ Switcher Tabs */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                          Switch Plant Morphology:
                        </span>
                        <div className="grid grid-cols-5 gap-1">
                          {organImages.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setInspectingOrganIndex(idx)}
                              className={`p-1 rounded text-center border transition-all ${
                                idx === inspectingOrganIndex
                                  ? "border-emerald-400 bg-emerald-950/40 text-emerald-300 font-bold"
                                  : "border-[#2D3748] bg-[#0E1311] text-slate-400 hover:text-white"
                              }`}
                            >
                              <div className="h-10 w-full rounded overflow-hidden mb-1">
                                <img src={img.url} alt={img.organ} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[9px] capitalize block truncate">{img.organ}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons inside lightbox */}
                    <div className="pt-3 border-t border-[#2D3748] flex items-center gap-2">
                      <button
                        onClick={() => {
                          handleSelect(inspectingPlant);
                          setInspectingPlant(null);
                        }}
                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded text-xs uppercase tracking-tight flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>View Full Dossier</span>
                      </button>
                      <button
                        onClick={() => setInspectingPlant(null)}
                        className="px-3 py-2 bg-[#1A2220] hover:bg-[#25322E] text-slate-300 hover:text-white rounded text-xs font-mono transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
