"use client";

import React, { useState, useRef } from "react";
import { ExtractedPalette, extractColorsFromImage, extractColorsFromPptx, buildPaletteFromHex } from "@/lib/colorExtractor";
import { TemplateColors } from "@/lib/templates";

interface ColorSchemePickerProps {
  onApply: (colors: TemplateColors) => void;
  onClear: () => void;
  activeCustomColors: TemplateColors | null;
}

type Tab = "upload" | "pptx" | "manual";

export default function ColorSchemePicker({ onApply, onClear, activeCustomColors }: ColorSchemePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("upload");
  const [palette, setPalette] = useState<ExtractedPalette | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string>("");
  const [manualHexes, setManualHexes] = useState<string[]>(["", "", "", "", ""]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pptxInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsExtracting(true);
    setError("");
    try {
      const result = await extractColorsFromImage(file);
      setPalette(result);
    } catch (err: any) {
      setError(err.message || "Failed to extract colors from image");
    }
    setIsExtracting(false);
  };

  const handlePptxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsExtracting(true);
    setError("");
    try {
      const result = await extractColorsFromPptx(file);
      setPalette(result);
    } catch (err: any) {
      setError(err.message || "Failed to extract colors from PPTX");
    }
    setIsExtracting(false);
  };

  const handleManualBuild = () => {
    setError("");
    try {
      const result = buildPaletteFromHex(manualHexes.filter(h => h.trim()));
      setPalette(result);
    } catch (err: any) {
      setError(err.message || "Invalid hex colors");
    }
  };

  const handleApply = () => {
    if (!palette) return;
    onApply(palette.suggested);
    setIsOpen(false);
  };

  const handleClear = () => {
    setPalette(null);
    onClear();
    setIsOpen(false);
  };

  // Inline edit of a suggested color
  const updateSuggestedColor = (key: keyof TemplateColors, value: string) => {
    if (!palette) return;
    const updated = { ...palette.suggested, [key]: value };
    setPalette({ ...palette, suggested: updated });
  };

  return (
    <div className="p-5 border-b border-white/5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Custom Color Scheme</h3>
        {activeCustomColors && (
          <button onClick={handleClear} className="text-[10px] text-red-400 hover:text-red-300 transition-colors">
            Reset
          </button>
        )}
      </div>

      {/* Active custom colors preview */}
      {activeCustomColors && !isOpen && (
        <div className="mb-2">
          <div className="flex gap-1 mb-2">
            {[activeCustomColors.primary, activeCustomColors.secondary, activeCustomColors.accent, activeCustomColors.background, activeCustomColors.highlight].map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-md border border-dark-600" style={{ backgroundColor: c }} title={c} />
            ))}
          </div>
          <span className="text-[10px] text-green-400">✓ Custom palette active</span>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
          isOpen
            ? "bg-primary-500/20 text-primary-300 border border-primary-500/50"
            : "bg-dark-800/50 text-dark-300 border border-dark-700 hover:border-dark-500"
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        {isOpen ? "Close Color Picker" : "Extract / Set Custom Colors"}
      </button>

      {isOpen && (
        <div className="mt-3 glass-card p-4 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-dark-800/50 rounded-lg p-1">
            {([
              { id: "upload" as Tab, label: "Image" },
              { id: "pptx" as Tab, label: ".pptx" },
              { id: "manual" as Tab, label: "Hex Codes" },
            ]).map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setError(""); }}
                className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                  tab === t.id ? "bg-primary-500/30 text-primary-300" : "text-dark-400 hover:text-dark-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {tab === "upload" && (
            <div>
              <p className="text-[11px] text-dark-400 mb-2">
                Upload a screenshot, logo, or brand image. We'll extract the dominant color palette.
              </p>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={isExtracting}
                className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isExtracting ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    Extracting...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Upload Image / Screenshot
                  </>
                )}
              </button>
              <p className="text-[10px] text-dark-500 mt-1">.png, .jpg, .webp, .svg, .gif</p>
            </div>
          )}

          {tab === "pptx" && (
            <div>
              <p className="text-[11px] text-dark-400 mb-2">
                Upload an existing .pptx file and we'll extract its PowerPoint theme colors.
              </p>
              <input
                ref={pptxInputRef}
                type="file"
                accept=".pptx"
                onChange={handlePptxUpload}
                className="hidden"
              />
              <button
                onClick={() => pptxInputRef.current?.click()}
                disabled={isExtracting}
                className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isExtracting ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    Parsing theme...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Upload Sample .pptx
                  </>
                )}
              </button>
              <p className="text-[10px] text-dark-500 mt-1">Extracts theme colors from PowerPoint XML</p>
            </div>
          )}

          {tab === "manual" && (
            <div>
              <p className="text-[11px] text-dark-400 mb-2">
                Enter 3-5 hex color codes. We'll map them to Primary, Secondary, Accent, Background, and Highlight.
              </p>
              <div className="space-y-1.5">
                {manualHexes.map((hex, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border border-dark-600 shrink-0"
                      style={{ backgroundColor: /^#?[0-9A-Fa-f]{6}$/.test(hex.trim()) ? (hex.startsWith("#") ? hex : "#" + hex) : "#1e293b" }}
                    />
                    <input
                      type="text"
                      value={hex}
                      onChange={(e) => {
                        const updated = [...manualHexes];
                        updated[i] = e.target.value;
                        setManualHexes(updated);
                      }}
                      placeholder={`Color ${i + 1} (e.g. #003366)`}
                      className="input-field text-xs py-1.5"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleManualBuild}
                className="w-full btn-secondary text-xs py-2 mt-2"
              >
                Build Palette from Hex Codes
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 rounded-lg p-2">
              {error}
            </div>
          )}

          {/* Extracted palette result */}
          {palette && (
            <div className="space-y-3">
              {/* Source info */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-dark-400">
                  {palette.source === "image" && `Extracted from: ${palette.fileName}`}
                  {palette.source === "pptx" && `Theme from: ${palette.fileName}`}
                  {palette.source === "manual" && "Built from manual hex input"}
                </span>
              </div>

              {/* Raw extracted colors */}
              <div>
                <p className="text-[10px] text-dark-500 mb-1 font-medium uppercase">Extracted Colors</p>
                <div className="flex flex-wrap gap-1">
                  {palette.colors.map((c, i) => (
                    <div key={i} className="group relative">
                      <div
                        className="w-7 h-7 rounded-md border border-dark-600 cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-dark-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-mono">
                        {c}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mapped template colors — editable */}
              <div>
                <p className="text-[10px] text-dark-500 mb-1.5 font-medium uppercase">Mapped Color Roles (click to edit)</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { key: "primary" as const, label: "Primary" },
                      { key: "secondary" as const, label: "Secondary" },
                      { key: "accent" as const, label: "Accent" },
                      { key: "background" as const, label: "Background" },
                      { key: "text" as const, label: "Text" },
                      { key: "highlight" as const, label: "Highlight" },
                    ]
                  ).map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={palette.suggested[key] as string}
                        onChange={(e) => updateSuggestedColor(key, e.target.value)}
                        className="w-6 h-6 rounded border-none cursor-pointer bg-transparent"
                      />
                      <div className="flex-1">
                        <span className="text-[10px] text-dark-400">{label}</span>
                        <input
                          type="text"
                          value={palette.suggested[key] as string}
                          onChange={(e) => updateSuggestedColor(key, e.target.value)}
                          className="block w-full bg-transparent text-[10px] text-dark-200 font-mono border-none outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview strip */}
              <div>
                <p className="text-[10px] text-dark-500 mb-1 font-medium uppercase">Slide Preview</p>
                <div className="rounded-lg overflow-hidden h-14 flex">
                  {/* Mini slide mock */}
                  <div className="flex-1 flex flex-col" style={{ backgroundColor: palette.suggested.background }}>
                    <div className="h-3" style={{ backgroundColor: palette.suggested.primary }} />
                    <div className="h-[2px]" style={{ backgroundColor: palette.suggested.accent }} />
                    <div className="flex-1 p-1.5">
                      <div className="h-1 w-12 rounded mb-1" style={{ backgroundColor: palette.suggested.text, opacity: 0.8 }} />
                      <div className="h-0.5 w-16 rounded mb-0.5" style={{ backgroundColor: palette.suggested.text, opacity: 0.4 }} />
                      <div className="h-0.5 w-14 rounded" style={{ backgroundColor: palette.suggested.text, opacity: 0.4 }} />
                      <div className="h-1 w-6 rounded mt-1" style={{ backgroundColor: palette.suggested.highlight }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Apply / Cancel */}
              <div className="flex gap-2">
                <button onClick={() => { setPalette(null); setError(""); }} className="flex-1 btn-secondary text-xs py-1.5">
                  Cancel
                </button>
                <button onClick={handleApply} className="flex-1 btn-primary text-xs py-1.5">
                  Apply Palette ✓
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
