import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Upload,
  Camera,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  Bot,
  User,
  Leaf,
  Layers,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  X,
  Copy,
  Check,
  ChevronDown,
  Info,
  Maximize2,
  Minimize2,
  Wifi,
  WifiOff,
  ShieldCheck,
} from "lucide-react";
import { PlantData, PlantNetOrgan } from "../types";
import { PlantService } from "../services/plantService";

interface ChatImageItem {
  id: string;
  data: string; // base64
  mimeType: string;
  organ: PlantNetOrgan;
  label?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  attachedImages?: ChatImageItem[];
}

interface BotanicalChatbotProps {
  currentPlant: PlantData | null;
  isOnlineMode: boolean;
  onSelectPlant?: (plant: PlantData) => void;
  isCompactModal?: boolean;
  onClose?: () => void;
}

export const BotanicalChatbot: React.FC<BotanicalChatbotProps> = ({
  currentPlant,
  isOnlineMode,
  onSelectPlant,
  isCompactModal = false,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: "initial-welcome",
        role: "assistant",
        content: currentPlant
          ? `### 🌿 FloraMedica Knowledge Botanist AI Active\n\nI am currently analyzing your specimen **${currentPlant.scientificName}** (${(currentPlant.commonNames || []).join(", ") || "Botanical Specimen"}).\n\n- **Telugu Siddha Vernacular:** ${currentPlant.teluguName || "N/A"}\n- **Sowa-Rigpa Name:** ${currentPlant.tibetanName || "N/A"}\n- **Safety & Edibility Index:** ${currentPlant.edibility.rating} (${currentPlant.edibility.ratingScore}/100)\n\nYou can ask any question about identification, toxic lookalikes, Siddha/Sowa-Rigpa formulations, or **upload multiple specimen photos** (leaf, flower, bark, fruit) for multi-image morphological reasoning.`
          : `### 🌿 FloraMedica Botanical & Pharmacopoeia Knowledge AI\n\nWelcome! I am calibrated on the **Pl@ntNet-300K benchmark** (Zenodo 5645731) and classical traditional pharmacopoeias (Siddha Gunapadam, Sowa-Rigpa rGyud-bZhi, and Ayurveda).\n\nUpload multiple plant photos or select a herb to ask about morphological diagnosis, dosage, and traditional formulations.`,
        timestamp: Date.now(),
      },
    ];
  });

  const [inputQuery, setInputQuery] = useState("");
  const [attachedImages, setAttachedImages] = useState<ChatImageItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([
    currentPlant
      ? `Compare ${currentPlant.scientificName} with toxic lookalikes`
      : "How do I identify medicinal herbs by leaf venation?",
    currentPlant
      ? `What is the classical Siddha preparation and dosage?`
      : "What are the core diagnostic rules of Sowa-Rigpa pharmacopoeia?",
    currentPlant
      ? `What active phytochemicals are in this plant?`
      : "Explain Pl@ntNet-300K plant morphology priors and top-k resolution.",
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedOrganForNextUpload, setSelectedOrganForNextUpload] = useState<PlantNetOrgan>("leaf");
  const [isIncludeSpecimenContext, setIsIncludeSpecimenContext] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // When currentPlant changes, notify user with contextual welcome if appropriate
  useEffect(() => {
    if (currentPlant) {
      setSuggestedFollowUps([
        `Compare ${currentPlant.scientificName} with toxic lookalikes`,
        `What is the classical Siddha preparation for ${currentPlant.scientificName}?`,
        `What are the Sowa-Rigpa taste and potencies of this plant?`,
        `What active phytochemical markers are present?`,
      ]);
    }
  }, [currentPlant]);

  // Handle Multi-image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          const newItem: ChatImageItem = {
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            data: base64,
            mimeType: file.type || "image/jpeg",
            organ: selectedOrganForNextUpload,
            label: `${file.name.slice(0, 16)} (${selectedOrganForNextUpload.toUpperCase()})`,
          };
          setAttachedImages((prev) => [...prev, newItem]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) {
      e.target.value = "";
    }
  };

  // Change organ tag for an attached image
  const updateImageOrgan = (imgId: string, organ: PlantNetOrgan) => {
    setAttachedImages((prev) =>
      prev.map((img) => (img.id === imgId ? { ...img, organ, label: `Specimen (${organ.toUpperCase()})` } : img))
    );
  };

  // Remove attached image
  const removeAttachedImage = (imgId: string) => {
    setAttachedImages((prev) => prev.filter((img) => img.id !== imgId));
  };

  // Auto-import current specimen image if available
  const handleImportCurrentSpecimen = () => {
    if (!currentPlant?.imageUrl) return;
    const newItem: ChatImageItem = {
      id: `img-specimen-${Date.now()}`,
      data: currentPlant.imageUrl,
      mimeType: "image/jpeg",
      organ: currentPlant.plantnet300k?.detectedOrgan || "leaf",
      label: `${currentPlant.scientificName} (Specimen Voucher)`,
    };
    setAttachedImages((prev) => [...prev, newItem]);
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text && attachedImages.length === 0) return;

    const currentTurnImages = [...attachedImages];
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text || "Please analyze the attached specimen images and provide botanical diagnosis.",
      timestamp: Date.now(),
      attachedImages: currentTurnImages.length > 0 ? currentTurnImages : undefined,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputQuery("");
    setAttachedImages([]);
    setIsGenerating(true);

    try {
      const response = await PlantService.sendBotanicalChatMessage({
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        currentPlantContext: isIncludeSpecimenContext ? currentPlant : null,
        images: currentTurnImages.map((img) => ({
          data: img.data,
          mimeType: img.mimeType,
          organ: img.organ,
          label: img.label,
        })),
        isOnline: isOnlineMode,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (response.suggestedFollowUps && response.suggestedFollowUps.length > 0) {
        setSuggestedFollowUps(response.suggestedFollowUps);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      const fallbackMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: "assistant",
        content: `### ⚠️ Botanical Query Notice\n\nAn unexpected connection issue occurred while contacting the live model. However, FloraMedica's offline botanical engine recommends referencing the **Offline Herbarium** and **Morphological Key Matrix** for instant diagnostic comparisons.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: `Chat session refreshed. FloraMedica knowledge bot is ready for your botanical inquiries and multi-image specimen analysis.`,
        timestamp: Date.now(),
      },
    ]);
  };

  const organList: { id: PlantNetOrgan; label: string; icon: string }[] = [
    { id: "leaf", label: "Leaf", icon: "🌿" },
    { id: "flower", label: "Flower", icon: "🌸" },
    { id: "fruit", label: "Fruit/Seed", icon: "🍎" },
    { id: "bark", label: "Bark/Stem", icon: "🪵" },
    { id: "habit", label: "Habit", icon: "🌳" },
  ];

  return (
    <div
      id="botanical-chatbot-container"
      className="flex flex-col h-full bg-[#111614] border border-[#2D3748] rounded-md overflow-hidden shadow-xl"
    >
      {/* Hidden Multi-Image Upload Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
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
        onChange={handleImageUpload}
      />

      <input
        ref={cameraInputRef}
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
        onChange={handleImageUpload}
      />

      {/* Header Bar */}
      <div className="p-3 sm:p-4 bg-[#161C1A] border-b border-[#2D3748] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-sm flex items-center justify-center text-black font-bold shadow-sm">
            <Bot className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold uppercase tracking-tight text-white">
                Context-Aware Botanist & Pharmacopoeia AI
              </span>
              {isOnlineMode ? (
                <span className="text-[9px] font-mono uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                  <Wifi className="w-2.5 h-2.5" /> Online AI
                </span>
              ) : (
                <span className="text-[9px] font-mono uppercase bg-amber-950/60 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                  <WifiOff className="w-2.5 h-2.5" /> Offline Engine
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Multi-Image Morphological Reasoning • Pl@ntNet-300K Benchmark
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="p-1.5 text-slate-400 hover:text-white bg-[#111614] hover:bg-[#1A2220] border border-[#2D3748] rounded-sm text-xs transition-colors cursor-pointer"
            title="Clear Chat History"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-[#111614] hover:bg-[#1A2220] border border-[#2D3748] rounded-sm text-xs transition-colors cursor-pointer"
              title="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Specimen Context Ribbon */}
      {currentPlant && (
        <div className="px-3 sm:px-4 py-2 bg-[#1A2220] border-b border-[#2D3748] flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded-sm border border-emerald-500/30">
              Active Context
            </span>
            <span className="font-serif italic font-bold text-white">
              {currentPlant.scientificName}
            </span>
            <span className="text-[11px] text-slate-400">
              ({currentPlant.commonNames?.[0] || currentPlant.family})
            </span>
            {currentPlant.teluguName && (
              <span className="text-[10px] font-mono text-amber-300">
                • Siddha: {currentPlant.teluguName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsIncludeSpecimenContext(!isIncludeSpecimenContext)}
              className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border transition-colors cursor-pointer ${
                isIncludeSpecimenContext
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                  : "bg-[#111614] text-slate-500 border-[#2D3748]"
              }`}
            >
              {isIncludeSpecimenContext ? "Context Attached ✓" : "Context Muted"}
            </button>
            {currentPlant.imageUrl && (
              <button
                onClick={handleImportCurrentSpecimen}
                className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[#111614] hover:bg-[#161C1A] text-slate-300 hover:text-emerald-300 border border-[#2D3748] transition-colors cursor-pointer flex items-center gap-1"
                title="Attach current identified photo to chat"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>Attach Specimen Photo</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh] sm:max-h-[65vh]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-sm bg-emerald-500 flex items-center justify-center text-black shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[88%] sm:max-w-[80%] rounded-md p-3.5 text-xs sm:text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-emerald-600/90 text-white rounded-br-none shadow-md"
                  : "bg-[#161C1A] border border-[#2D3748] text-slate-200 rounded-bl-none shadow-md"
              }`}
            >
              {/* Render Attached Images inside user message */}
              {msg.attachedImages && msg.attachedImages.length > 0 && (
                <div className="mb-3 space-y-1.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-200 font-bold flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    <span>Attached Specimen Images ({msg.attachedImages.length}):</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {msg.attachedImages.map((img) => (
                      <div
                        key={img.id}
                        onClick={() => setPreviewImage(img.data)}
                        className="relative rounded-sm overflow-hidden border border-white/20 bg-black/40 cursor-pointer group aspect-4/3"
                      >
                        <img
                          src={img.data}
                          alt="Specimen plant morphology"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 px-1.5 py-0.5 text-[9px] font-mono text-emerald-300 truncate">
                          {img.organ.toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Markdown-like structured text */}
              <div className="whitespace-pre-line font-sans space-y-2">
                {msg.content}
              </div>

              {/* Message Action Footer */}
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                <button
                  onClick={() => handleCopyText(msg.id, msg.content)}
                  className="hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedId === msg.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-sm bg-slate-700 flex items-center justify-center text-white shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isGenerating && (
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-sm bg-emerald-500 flex items-center justify-center text-black shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-[#161C1A] border border-[#2D3748] rounded-md p-3 text-xs font-mono text-emerald-400 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing botanical morphology & pharmacopoeial matrices...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Contextual Follow-Up Prompt Chips */}
      {suggestedFollowUps.length > 0 && !isGenerating && (
        <div className="px-4 py-2 bg-[#161C1A] border-t border-[#2D3748] flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase shrink-0">
            Suggested:
          </span>
          {suggestedFollowUps.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="px-2.5 py-1 rounded-sm bg-[#111614] hover:bg-[#1A2220] border border-[#2D3748] hover:border-emerald-500/50 text-[11px] text-slate-300 hover:text-emerald-300 whitespace-nowrap font-mono transition-all shrink-0 cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Multi-Image Attachment Tray (Preview before sending) */}
      {attachedImages.length > 0 && (
        <div className="p-3 bg-[#161C1A] border-t border-[#2D3748] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              Ready to Send ({attachedImages.length} specimen photos):
            </span>
            <button
              onClick={() => setAttachedImages([])}
              className="text-red-400 hover:text-red-300 text-[11px] cursor-pointer"
            >
              Clear All Images
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {attachedImages.map((img) => (
              <div
                key={img.id}
                className="relative rounded-sm overflow-hidden bg-black/60 border border-[#2D3748] p-1.5 flex flex-col gap-1.5"
              >
                <div className="relative aspect-4/3 w-full rounded-xs overflow-hidden">
                  <img
                    src={img.data}
                    alt={img.label}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    onClick={() => removeAttachedImage(img.id)}
                    className="absolute top-1 right-1 bg-black/80 hover:bg-red-600 text-white rounded-xs p-1 transition-colors cursor-pointer"
                    title="Remove Image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Plant Morphology Selector Dropdown per Image */}
                <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                  <span className="text-slate-400">Morphology:</span>
                  <select
                    value={img.organ}
                    onChange={(e) =>
                      updateImageOrgan(img.id, e.target.value as PlantNetOrgan)
                    }
                    className="bg-[#111614] text-emerald-400 border border-[#2D3748] rounded-xs px-1 py-0.5 text-[10px] outline-none cursor-pointer"
                  >
                    {organList.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Composer Bar */}
      <div className="p-3 sm:p-4 bg-[#161C1A] border-t border-[#2D3748] space-y-2">
        {/* Plant Morphology Selector for next upload */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Next Photo Morphology:</span>
            <div className="flex items-center gap-1">
              {organList.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOrganForNextUpload(o.id)}
                  className={`px-1.5 py-0.5 rounded-sm border transition-colors cursor-pointer ${
                    selectedOrganForNextUpload === o.id
                      ? "bg-emerald-500 text-black border-emerald-400 font-bold"
                      : "bg-[#111614] text-slate-300 border-[#2D3748] hover:border-emerald-500/40"
                  }`}
                >
                  {o.icon} {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[9px] text-slate-500">
              Pl@ntNet-300K Multi-Modal
            </span>
          </div>
        </div>

        {/* Input & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Gallery / Storage File Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-sm bg-[#111614] hover:bg-[#1A2220] border border-[#2D3748] hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer shrink-0"
            title="Upload Specimen Photos (Multi-Image)"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Camera Capture Snap Button */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="p-2.5 rounded-sm bg-[#111614] hover:bg-[#1A2220] border border-[#2D3748] hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer shrink-0"
            title="Snap Photo with Camera"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Query Text Input */}
          <input
            id="botanical-chat-query-input"
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              attachedImages.length > 0
                ? "Ask about these attached photos or compare with toxic lookalikes..."
                : currentPlant
                ? `Ask about ${currentPlant.scientificName}, Siddha/Sowa-Rigpa dosage, leaf traits...`
                : "Ask any botanical or medicinal pharmacopoeia question..."
            }
            className="flex-1 bg-[#0F1412] border border-[#2D3748] focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-white rounded-sm px-3 py-2.5 text-xs sm:text-sm font-sans outline-none placeholder:text-slate-500"
          />

          {/* Send Button */}
          <button
            id="send-botanical-chat-btn"
            onClick={() => handleSendMessage()}
            disabled={(!inputQuery.trim() && attachedImages.length === 0) || isGenerating}
            className={`px-4 py-2.5 bg-emerald-500 text-black font-bold uppercase text-xs tracking-tight rounded-sm transition-all flex items-center gap-1.5 shrink-0 ${
              (!inputQuery.trim() && attachedImages.length === 0) || isGenerating
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-emerald-400 cursor-pointer shadow-md"
            }`}
          >
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-[#161C1A] border border-[#2D3748] rounded-md p-2">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 bg-black/80 text-white p-1.5 rounded-sm hover:bg-red-600 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Enlarged Specimen"
              className="max-w-full max-h-[80vh] object-contain rounded-xs"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
