"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Trash2,
  Undo,
  Save,
  Send,
  Eye,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Palette,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { soundFx } from "@/lib/sounds";
import confetti from "canvas-confetti";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface FlowerItem {
  id: string;
  type: string;
  color: string;
  label: string;
  icon: string;
}

interface CanvasElement {
  id: string;
  flowerType: string;
  color: string;
  x: number;
  y: number;
  radius: number;
  rotation: number;
  symmetry: number; // 1, 4, 8, 12, 16
  size: number;
}

const FLORAL_ASSETS: FlowerItem[] = [
  { id: "marigold_orange", type: "marigold", color: "#ea580c", label: "Orange Marigold", icon: "🏵️" },
  { id: "marigold_yellow", type: "marigold", color: "#facc15", label: "Yellow Marigold", icon: "🌼" },
  { id: "rose_red", type: "rose", color: "#e11d48", label: "Red Rose Petal", icon: "🌹" },
  { id: "jasmine_white", type: "jasmine", color: "#f8fafc", label: "White Jasmine (Mulla)", icon: "🤍" },
  { id: "lotus_pink", type: "lotus", color: "#ec4899", label: "Pink Lotus", icon: "🪷" },
  { id: "leaf_green", type: "leaf", color: "#15803d", label: "Tulsi & Banana Leaf", icon: "🍃" },
  { id: "lamp_brass", type: "lamp", color: "#f59e0b", label: "Nilavilakku Brass Lamp", icon: "🪔" },
  { id: "thrikkakara_clay", type: "appan", color: "#b45309", label: "Thrikkakara Appan", icon: "🔺" },
];

const TEMPLATES = [
  { id: "blank", name: "Blank Canvas", description: "Start from scratch" },
  { id: "traditional", name: "Traditional Atham", description: "Classic 8-ring Kerala arrangement" },
  { id: "mandala", name: "Lotus Mandala", description: "12-petal sacred geometry" },
  { id: "sunburst", name: "Golden Sunburst", description: "Vibrant yellow-orange celebration" },
];

function getStarterElements(templateId: string): CanvasElement[] {
  const center = 250; // canvas 500x500

  if (templateId === "blank") {
    return [];
  }

  if (templateId === "traditional") {
    return [
      {
        id: "el_center",
        flowerType: "lamp",
        color: "#f59e0b",
        x: center,
        y: center,
        radius: 0,
        rotation: 0,
        symmetry: 1,
        size: 32,
      },
      {
        id: "el_ring1",
        flowerType: "jasmine",
        color: "#f8fafc",
        x: center,
        y: center,
        radius: 45,
        rotation: 0,
        symmetry: 8,
        size: 16,
      },
      {
        id: "el_ring2",
        flowerType: "marigold",
        color: "#facc15",
        x: center,
        y: center,
        radius: 90,
        rotation: 22.5,
        symmetry: 8,
        size: 22,
      },
      {
        id: "el_ring3",
        flowerType: "marigold",
        color: "#ea580c",
        x: center,
        y: center,
        radius: 140,
        rotation: 0,
        symmetry: 16,
        size: 20,
      },
      {
        id: "el_ring4",
        flowerType: "rose",
        color: "#e11d48",
        x: center,
        y: center,
        radius: 195,
        rotation: 22.5,
        symmetry: 8,
        size: 28,
      },
    ];
  }

  if (templateId === "mandala") {
    return [
      {
        id: "el_center_lotus",
        flowerType: "lotus",
        color: "#ec4899",
        x: center,
        y: center,
        radius: 0,
        rotation: 0,
        symmetry: 1,
        size: 38,
      },
      {
        id: "el_m_1",
        flowerType: "leaf",
        color: "#15803d",
        x: center,
        y: center,
        radius: 70,
        rotation: 0,
        symmetry: 12,
        size: 18,
      },
      {
        id: "el_m_2",
        flowerType: "marigold",
        color: "#facc15",
        x: center,
        y: center,
        radius: 130,
        rotation: 15,
        symmetry: 12,
        size: 22,
      },
      {
        id: "el_m_3",
        flowerType: "rose",
        color: "#e11d48",
        x: center,
        y: center,
        radius: 185,
        rotation: 0,
        symmetry: 12,
        size: 26,
      },
    ];
  }

  if (templateId === "sunburst") {
    return [
      {
        id: "el_s_center",
        flowerType: "lamp",
        color: "#f59e0b",
        x: center,
        y: center,
        radius: 0,
        rotation: 0,
        symmetry: 1,
        size: 34,
      },
      {
        id: "el_s_1",
        flowerType: "marigold",
        color: "#ea580c",
        x: center,
        y: center,
        radius: 60,
        rotation: 0,
        symmetry: 16,
        size: 16,
      },
      {
        id: "el_s_2",
        flowerType: "marigold",
        color: "#facc15",
        x: center,
        y: center,
        radius: 120,
        rotation: 11.25,
        symmetry: 16,
        size: 22,
      },
      {
        id: "el_s_3",
        flowerType: "leaf",
        color: "#15803d",
        x: center,
        y: center,
        radius: 180,
        rotation: 0,
        symmetry: 8,
        size: 30,
      },
    ];
  }

  return [];
}

export function PookalamCanvas() {
  const { isSignedIn } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [elements, setElements] = useState<CanvasElement[]>(() => getStarterElements("traditional"));
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [selectedFlower, setSelectedFlower] = useState<FlowerItem>(FLORAL_ASSETS[0]);
  const [currentSymmetry, setCurrentSymmetry] = useState<number>(8); // 8-fold radial symmetry default
  const [petalSize, setPetalSize] = useState<number>(24);
  const [designTitle, setDesignTitle] = useState<string>("My Onam Pookalam");
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const saveToHistory = (newElements: CanvasElement[]) => {
    setHistory((prev) => [...prev.slice(-15), elements]);
    setElements(newElements);
    setIsSaved(false);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    soundFx.playClick();
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setElements(previous);
  };

  const handleClear = () => {
    soundFx.playClick();
    saveToHistory([]);
  };

  const loadTemplate = (templateId: string) => {
    soundFx.playClick();
    const newStarter = getStarterElements(templateId);
    saveToHistory(newStarter);
  };

  // Canvas Click: Place Floral Element with Radial Symmetry
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 500;
    const clickY = ((e.clientY - rect.top) / rect.height) * 500;

    const centerX = 250;
    const centerY = 250;

    const dx = clickX - centerX;
    const dy = clickY - centerY;
    const radius = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    soundFx.playClick();

    const newElement: CanvasElement = {
      id: `elem_${Date.now()}`,
      flowerType: selectedFlower.type,
      color: selectedFlower.color,
      x: centerX,
      y: centerY,
      radius: radius,
      rotation: angle,
      symmetry: currentSymmetry,
      size: petalSize,
    };

    saveToHistory([...elements, newElement]);
  };

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 500;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Kerala Brass Uruli / Floor Background
    const bgGrad = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 240);
    bgGrad.addColorStop(0, "#1e293b");
    bgGrad.addColorStop(0.85, "#0f172a");
    bgGrad.addColorStop(1, "#020617");
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 240, 0, Math.PI * 2);
    ctx.fill();

    // 2. Guide Rings (Concentric mandala circles)
    ctx.strokeStyle = "rgba(245, 158, 11, 0.15)";
    ctx.lineWidth = 1;
    [45, 90, 140, 195, 240].forEach((r) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 3. Render All Placed Floral Elements with Radial Symmetry
    elements.forEach((el) => {
      const count = el.symmetry || 1;
      const stepAngle = (Math.PI * 2) / count;

      for (let i = 0; i < count; i++) {
        const theta = (el.rotation * Math.PI) / 180 + i * stepAngle;
        const px = el.x + el.radius * Math.cos(theta);
        const py = el.y + el.radius * Math.sin(theta);

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(theta + Math.PI / 2);

        // Draw Petal according to type
        if (el.flowerType === "lamp") {
          // Nilavilakku Brass Lamp Flame
          ctx.fillStyle = "#f59e0b";
          ctx.beginPath();
          ctx.arc(0, 0, el.size * 0.4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ea580c";
          ctx.beginPath();
          ctx.moveTo(0, -el.size * 0.7);
          ctx.quadraticCurveTo(el.size * 0.4, 0, 0, el.size * 0.2);
          ctx.quadraticCurveTo(-el.size * 0.4, 0, 0, -el.size * 0.7);
          ctx.fill();
        } else if (el.flowerType === "leaf") {
          // Leaf shape
          ctx.fillStyle = el.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, el.size * 0.4, el.size * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (el.flowerType === "lotus") {
          // Lotus Petal
          ctx.fillStyle = el.color;
          ctx.beginPath();
          ctx.moveTo(0, -el.size * 0.8);
          ctx.quadraticCurveTo(el.size * 0.6, 0, 0, el.size * 0.5);
          ctx.quadraticCurveTo(-el.size * 0.6, 0, 0, -el.size * 0.8);
          ctx.fill();
        } else {
          // Standard Round Flower Petal (Marigold, Jasmine, Rose)
          ctx.fillStyle = el.color;
          ctx.beginPath();
          ctx.arc(0, 0, el.size * 0.5, 0, Math.PI * 2);
          ctx.fill();

          // Petal inner shadow/depth
          ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
          ctx.beginPath();
          ctx.arc(0, 0, el.size * 0.25, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    });

    // Outer Decorative Brass Rim
    ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 240, 0, Math.PI * 2);
    ctx.stroke();
  }, [elements]);

  const featuredEvent = useQuery(api.events.getFeaturedEvent);
  const eventId = featuredEvent?._id;
  const userDraft = useQuery(api.pookalam.getUserDraft, eventId && isSignedIn ? { eventId } : "skip");

  const saveDraftMutation = useMutation(api.pookalam.saveDraft);
  const submitToCompetitionMutation = useMutation(api.pookalam.submitToCompetition);

  // Restore user draft if found
  const draftRestoredRef = useRef(false);
  useEffect(() => {
    if (!draftRestoredRef.current && userDraft && userDraft.canvasData && Array.isArray(userDraft.canvasData)) {
      draftRestoredRef.current = true;
      setElements(userDraft.canvasData);
      if (userDraft.title) setDesignTitle(userDraft.title);
      if (userDraft.isSubmitted) setIsSubmitted(true);
    }
  }, [userDraft]);

  const handleSaveDraft = async () => {
    if (!eventId || !isSignedIn) {
      alert("Please sign in to save your Pookalam draft.");
      return;
    }

    soundFx.playClick();
    const canvas = canvasRef.current;
    const previewUrl = canvas ? canvas.toDataURL("image/png") : "";

    try {
      await saveDraftMutation({
        eventId,
        title: designTitle,
        canvasData: elements,
        previewUrl,
        templateId: "custom",
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save draft";
      alert(message);
    }
  };

  const handleSubmitCompetition = async () => {
    if (!eventId || !isSignedIn) {
      alert("Please sign in to submit your Pookalam.");
      return;
    }

    soundFx.playVictory();
    const canvas = canvasRef.current;
    const previewUrl = canvas ? canvas.toDataURL("image/png") : "";

    try {
      // 1. Save/Upsert draft first to get designId
      const designId = await saveDraftMutation({
        eventId,
        title: designTitle,
        canvasData: elements,
        previewUrl,
        templateId: "custom",
      });

      // 2. Submit to competition
      await submitToCompetitionMutation({
        designId,
        title: designTitle,
      });

      setIsSubmitted(true);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ea580c", "#facc15", "#e11d48", "#10b981"],
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit to competition";
      alert(message);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <Link
          href="/events/onam-2026"
          onClick={() => soundFx.playClick()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Onam 2026 Hub
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/events/onam-2026/pookalam/gallery"
            onClick={() => soundFx.playClick()}
            className="px-4 py-2 rounded-xl text-xs font-bold glass-panel border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <Eye className="w-3.5 h-3.5" /> View Public Voting Gallery
          </Link>
        </div>
      </div>

      {/* Main Designer Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Controls & Palette (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Design Info */}
          <div className="p-5 rounded-2xl glass-panel border border-amber-500/20 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🌸</span> Pookalam Designer
            </h2>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Design Title</label>
              <input
                type="text"
                value={designTitle}
                onChange={(e) => setDesignTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                placeholder="Give your Pookalam a festive name"
              />
            </div>
          </div>

          {/* Floral Petals Palette */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" /> 1. Select Floral Petal
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {FLORAL_ASSETS.map((flower) => {
                const isSelected = selectedFlower.id === flower.id;
                return (
                  <button
                    key={flower.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedFlower(flower);
                    }}
                    className={`p-2.5 rounded-xl text-left border flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? "bg-amber-500/20 border-amber-500 text-white font-bold shadow-md"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-xl">{flower.icon}</span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold truncate">{flower.label}</div>
                      <div
                        className="w-4 h-1.5 rounded-full mt-0.5"
                        style={{ backgroundColor: flower.color }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Radial Symmetry Tools */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> 2. Radial Symmetry
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[1, 4, 8, 12, 16].map((sym) => (
                <button
                  key={sym}
                  onClick={() => {
                    soundFx.playClick();
                    setCurrentSymmetry(sym);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    currentSymmetry === sym
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {sym === 1 ? "1x Single" : `${sym}x Fold`}
                </button>
              ))}
            </div>

            {/* Petal Size Slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Petal Size</span>
                <span className="text-white font-mono">{petalSize}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="48"
                value={petalSize}
                onChange={(e) => setPetalSize(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          {/* Starter Templates */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Starter Templates
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => loadTemplate(tmpl.id)}
                  className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-left text-xs transition-colors"
                >
                  <div className="font-bold text-white">{tmpl.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{tmpl.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Circular Canvas & Actions (8 Cols) */}
        <div className="lg:col-span-8 space-y-6 flex flex-col items-center">
          {/* Canvas Actions Bar */}
          <div className="w-full max-w-[500px] flex items-center justify-between glass-panel px-4 py-2.5 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 font-semibold"
                title="Undo last placement"
              >
                <Undo className="w-3.5 h-3.5" /> Undo
              </button>
              <button
                onClick={handleClear}
                className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/40 transition-colors flex items-center gap-1 font-semibold"
                title="Clear all petals"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>

            <div className="text-slate-400 font-medium">
              <strong className="text-amber-400">{elements.length}</strong> layers
            </div>
          </div>

          {/* Interactive Canvas */}
          <div className="relative p-4 rounded-3xl glass-panel-gold border border-amber-500/30 shadow-2xl">
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              onClick={handleCanvasClick}
              className="rounded-full shadow-inner cursor-crosshair max-w-full h-auto block"
            />
          </div>

          {/* Submission and Save Controls */}
          <div className="w-full max-w-[500px] space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveDraft}
                className="flex-1 py-3.5 rounded-2xl font-bold text-xs sm:text-sm glass-panel border border-slate-700 text-slate-200 hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4 text-amber-400" />
                {isSaved ? "Draft Saved!" : "Save Draft"}
              </button>

              <button
                onClick={handleSubmitCompetition}
                className="flex-1 py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:brightness-110 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Send className="w-4 h-4" />
                Submit to Competition (+50 XP)
              </button>
            </div>

            {isSubmitted && (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Your Pookalam &ldquo;{designTitle}&rdquo; is entered into Onam 2026 public voting!</span>
                </div>
                <Link
                  href="/events/onam-2026/pookalam/gallery"
                  onClick={() => soundFx.playClick()}
                  className="font-bold text-amber-300 underline shrink-0"
                >
                  View in Gallery →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
