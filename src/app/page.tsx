"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { TEMPLATES, getTemplatesForCategory, getRecommendedTemplates, SlideTemplate } from "@/lib/templates";
import { KEYWORD_BANKS } from "@/lib/keywords";
import {
  generateSlidesFromPrompt,
  generateSlidesFromFileContent,
  detectProfile,
  PresentationData,
  SlideData,
} from "@/lib/slideGenerator";
import { generatePptx } from "@/lib/pptxEngine";
import { parseUploadedFile } from "@/lib/fileParser";
import SlidePreview from "@/components/SlidePreview";
import SlideEditor from "@/components/SlideEditor";
import ColorSchemePicker from "@/components/ColorSchemePicker";
import { TemplateColors } from "@/lib/templates";

type AppStep = "landing" | "configure" | "preview";

const PROFILES = [
  { id: "consulting", label: "Consulting", icon: "📊", desc: "McKinsey, BCG, Bain style" },
  { id: "tech", label: "Technology", icon: "💻", desc: "Engineering & developer focus" },
  { id: "business", label: "Business", icon: "📈", desc: "Corporate & strategy" },
  { id: "vc_pitch", label: "VC Pitch", icon: "🚀", desc: "Fundraising & investor decks" },
  { id: "investment_banking", label: "Investment Banking", icon: "🏦", desc: "M&A, IPO, advisory" },
  { id: "board", label: "Board Meeting", icon: "🏛️", desc: "Board of Directors governance" },
  { id: "aop", label: "Annual Plan (AOP)", icon: "📅", desc: "Annual operating plan & budget" },
  { id: "academic", label: "Academic", icon: "🎓", desc: "Research & scholarly" },
  { id: "product", label: "Product", icon: "🎯", desc: "Product management & launches" },
  { id: "generic", label: "General", icon: "✨", desc: "Clean, versatile design" },
];

export default function HomePage() {
  const [step, setStep] = useState<AppStep>("landing");
  const [profile, setProfile] = useState<string>("generic");
  const [keywordMode, setKeywordMode] = useState<string>("generic");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("minimal-white");
  const [chatInput, setChatInput] = useState("");
  const [uploadedContent, setUploadedContent] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [editingSlide, setEditingSlide] = useState<SlideData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [templateFilter, setTemplateFilter] = useState("all");
  const [chatMessages, setChatMessages] = useState<{ role: string; text: string }[]>([]);
  const [customColors, setCustomColors] = useState<TemplateColors | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseUploadedFile(file);
      setUploadedContent(parsed.text);
      setUploadedFileName(file.name);
      setChatMessages(prev => [
        ...prev,
        { role: "user", text: `📎 Uploaded: ${file.name}` },
        { role: "system", text: `File parsed successfully! Extracted ${parsed.text.length} characters from your ${parsed.type}. You can now generate a presentation from this content, or add more context via chat.` },
      ]);
    } catch (error) {
      setChatMessages(prev => [
        ...prev,
        { role: "system", text: "Error parsing file. Please try a different format (.xlsx, .docx, .csv, .txt, .pptx)" },
      ]);
    }
  };

  // Handle chat submit
  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: "user", text: userMessage }]);

    // Auto-detect profile from input
    const detectedProfile = detectProfile(userMessage);
    if (detectedProfile !== "generic" && profile === "generic") {
      setProfile(detectedProfile);
      setKeywordMode(detectedProfile);
      setChatMessages(prev => [
        ...prev,
        { role: "system", text: `Detected a ${detectedProfile.replace('_', ' ')} context. Template recommendations updated! You can change this in settings.` },
      ]);
    }

    setChatInput("");
  };

  // Generate presentation
  const handleGenerate = async () => {
    setIsGenerating(true);

    const fullInput = [
      ...chatMessages.filter(m => m.role === "user").map(m => m.text),
      uploadedContent,
    ].join("\n\n");

    if (!fullInput.trim()) {
      setChatMessages(prev => [
        ...prev,
        { role: "system", text: "Please provide some input first — either type your content in the chat or upload a file." },
      ]);
      setIsGenerating(false);
      return;
    }

    try {
      const data = generateSlidesFromPrompt(fullInput, keywordMode, selectedTemplate);
      data.profile = keywordMode;
      setPresentation(data);
      setActiveSlideIndex(0);
      setStep("preview");
      setChatMessages(prev => [
        ...prev,
        { role: "system", text: `Presentation generated with ${data.slides.length} slides using the ${TEMPLATES.find(t => t.id === selectedTemplate)?.name} template. You can now preview and edit slides!` },
      ]);
    } catch (error) {
      setChatMessages(prev => [
        ...prev,
        { role: "system", text: "Error generating presentation. Please try again." },
      ]);
    }

    setIsGenerating(false);
  };

  // Download PPTX
  const handleDownload = async () => {
    if (!presentation) return;
    setIsDownloading(true);

    try {
      const blob = await generatePptx(presentation);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${presentation.title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Error generating PPTX file. Please try again.");
    }

    setIsDownloading(false);
  };

  // Update slide after editing
  const handleSlideUpdate = (updated: SlideData) => {
    if (!presentation) return;
    const newSlides = presentation.slides.map(s => s.id === updated.id ? updated : s);
    setPresentation({ ...presentation, slides: newSlides });
  };

  // Regenerate with new template
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (presentation) {
      const newPresentation = { ...presentation, templateId };
      setPresentation(newPresentation);
    }
  };

  // Get template for current presentation
  // Resolve active template — apply custom color override if set
  const baseTemplate = TEMPLATES.find(t => t.id === (presentation?.templateId || selectedTemplate)) || TEMPLATES[0];
  const currentTemplate = customColors
    ? { ...baseTemplate, colors: { ...baseTemplate.colors, ...customColors }, thumbnailGradient: baseTemplate.thumbnailGradient }
    : baseTemplate;

  // Filtered templates
  const filteredTemplates = templateFilter === "recommended"
    ? getRecommendedTemplates(profile)
    : templateFilter === "all"
    ? TEMPLATES
    : getTemplatesForCategory(templateFilter);

  // ====================== RENDER ======================

  // Landing Page
  if (step === "landing") {
    return (
      <div className="min-h-screen bg-dark-950">
        {/* Navbar */}
        <nav className="fixed top-0 w-full z-40 bg-dark-950/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
              </div>
              <span className="text-xl font-bold font-display text-white">DeckCraft<span className="gradient-text"> AI</span></span>
            </div>
            <button onClick={() => setStep("configure")} className="btn-primary text-sm">
              Get Started →
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card text-sm text-dark-300 mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              17 Professional Templates • 10 Industry Profiles • Instant PPTX Export
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold font-display leading-tight mb-6 animate-slide-up">
              <span className="text-white">Build Stunning</span>
              <br />
              <span className="gradient-text">Presentations</span>
              <br />
              <span className="text-white">in Seconds</span>
            </h1>

            <p className="text-xl text-dark-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              Transform your ideas, files, and data into professional-grade presentations.
              From <strong className="text-white">VC pitch decks</strong> to <strong className="text-white">consulting frameworks</strong>,{" "}
              <strong className="text-white">tech architecture</strong> reviews to <strong className="text-white">investment banking</strong> materials —
              DeckCraft AI adapts to your exact context.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <button onClick={() => setStep("configure")} className="btn-primary text-lg px-8 py-4 rounded-2xl">
                Create Presentation →
              </button>
              <button onClick={() => setStep("configure")} className="btn-secondary text-lg px-8 py-4 rounded-2xl">
                Upload a File
              </button>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: "💬", title: "Chat to Create", desc: "Describe your presentation in plain language and get professional slides instantly" },
                { icon: "📁", title: "Upload Anything", desc: "Excel, Word, PPT, CSV, Google Docs — we parse and transform your content" },
                { icon: "🎨", title: "17+ Templates", desc: "Industry-specific designs for consulting, tech, VC, banking, academic & more" },
              ].map((f, i) => (
                <div key={i} className="glass-card-hover p-6 text-left animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <span className="text-3xl mb-3 block">{f.icon}</span>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-dark-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Profiles Section */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-3 font-display">Context-Aware Design</h2>
            <p className="text-dark-400 text-center mb-12 max-w-2xl mx-auto">
              Every industry speaks differently. DeckCraft adapts templates, keywords, tone, and structure to your specific context.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PROFILES.map((p) => (
                <div key={p.id} className="glass-card-hover p-5 text-center">
                  <span className="text-2xl mb-2 block">{p.icon}</span>
                  <h4 className="font-bold text-white text-sm mb-1">{p.label}</h4>
                  <p className="text-dark-500 text-xs">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Template Gallery Preview */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-3 font-display">Template Gallery</h2>
            <p className="text-dark-400 text-center mb-12 max-w-2xl mx-auto">
              Professional designs inspired by the world's best presentations — McKinsey, YC, Google, and more.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {TEMPLATES.map((t) => (
                <div key={t.id} className="glass-card-hover overflow-hidden group">
                  <div className={`h-24 bg-gradient-to-br ${t.thumbnailGradient} flex items-center justify-center`}>
                    <span className="text-white/80 text-xs font-bold uppercase tracking-wider group-hover:scale-110 transition-transform">{t.name}</span>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-dark-400 leading-relaxed">{t.description.slice(0, 60)}...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Keyword Systems */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-3 font-display">Smart Keyword Highlighting</h2>
            <p className="text-dark-400 text-center mb-12 max-w-2xl mx-auto">
              Choose between tech and business keyword banks. Key terms are automatically highlighted in bold for maximum impact.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-primary-400 mb-3">💻 Tech Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {KEYWORD_BANKS.tech.keywords.slice(0, 20).map(k => (
                    <span key={k} className="px-2 py-1 bg-primary-500/10 text-primary-300 text-xs rounded-md font-medium">{k}</span>
                  ))}
                </div>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-accent-400 mb-3">📈 Business Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {KEYWORD_BANKS.business.keywords.slice(0, 20).map(k => (
                    <span key={k} className="px-2 py-1 bg-accent-500/10 text-accent-300 text-xs rounded-md font-medium">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-4 font-display">Ready to Create?</h2>
            <p className="text-dark-400 mb-8">Start building your next presentation — it takes less than a minute.</p>
            <button onClick={() => setStep("configure")} className="btn-primary text-lg px-10 py-4 rounded-2xl">
              Start Building Now →
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-dark-500">
            <span>DeckCraft AI — Professional Presentation Builder</span>
            <span>Built with Next.js • Deployed on Vercel</span>
          </div>
        </footer>
      </div>
    );
  }

  // Configure Page — Chat + Settings
  if (step === "configure") {
    return (
      <div className="min-h-screen bg-dark-950 flex">
        {/* Left Sidebar — Settings */}
        <div className="w-80 border-r border-white/5 bg-dark-900/50 flex flex-col overflow-y-auto">
          {/* Logo */}
          <div className="p-5 border-b border-white/5">
            <button onClick={() => setStep("landing")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
              </div>
              <span className="font-bold font-display text-white">DeckCraft <span className="gradient-text">AI</span></span>
            </button>
          </div>

          {/* Profile Selection */}
          <div className="p-5 border-b border-white/5">
            <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Industry Profile</h3>
            <div className="grid grid-cols-2 gap-2">
              {PROFILES.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setProfile(p.id); setKeywordMode(p.id); }}
                  className={`p-2 rounded-lg text-left transition-all text-xs ${
                    profile === p.id
                      ? 'bg-primary-500/20 border border-primary-500/50 text-primary-300'
                      : 'bg-dark-800/50 border border-dark-700 text-dark-300 hover:border-dark-500'
                  }`}
                >
                  <span className="text-base block mb-0.5">{p.icon}</span>
                  <span className="font-medium">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Keyword Mode Toggle */}
          <div className="p-5 border-b border-white/5">
            <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Keyword Emphasis</h3>
            <div className="flex gap-2">
              {["tech", "business", "consulting", "board", "aop", "generic"].map(mode => (
                <button
                  key={mode}
                  onClick={() => setKeywordMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    keywordMode === mode
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/50'
                      : 'bg-dark-800/50 text-dark-400 border border-dark-700 hover:border-dark-500'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Scheme */}
          <ColorSchemePicker
            onApply={(colors) => {
              setCustomColors(colors);
              setChatMessages(prev => [
                ...prev,
                { role: "system", text: `✓ Custom color palette applied! Primary: ${colors.primary}, Accent: ${colors.accent}. These colors will override the selected template.` },
              ]);
            }}
            onClear={() => {
              setCustomColors(null);
              setChatMessages(prev => [
                ...prev,
                { role: "system", text: "Custom color palette removed. Using template's default colors." },
              ]);
            }}
            activeCustomColors={customColors}
          />

          {/* Template Selection */}
          <div className="p-5 flex-1 overflow-y-auto">
            <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Design Template</h3>

            {/* Filter */}
            <div className="flex flex-wrap gap-1 mb-3">
              {["all", "recommended", "consulting", "tech", "business"].map(f => (
                <button
                  key={f}
                  onClick={() => setTemplateFilter(f)}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    templateFilter === f ? 'bg-primary-500/20 text-primary-300' : 'text-dark-500 hover:text-dark-300'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredTemplates.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateChange(t.id)}
                  className={`w-full text-left rounded-lg overflow-hidden transition-all ${
                    selectedTemplate === t.id
                      ? 'ring-2 ring-primary-500 ring-offset-1 ring-offset-dark-900'
                      : 'hover:ring-1 hover:ring-dark-600'
                  }`}
                >
                  <div className={`h-12 bg-gradient-to-br ${t.thumbnailGradient} flex items-center px-3`}>
                    <span className="text-white text-xs font-bold">{t.name}</span>
                  </div>
                  <div className="bg-dark-800/50 px-3 py-2">
                    <p className="text-[10px] text-dark-400 line-clamp-1">{t.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="h-14 border-b border-white/5 bg-dark-900/30 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-semibold text-white">Presentation Builder</h2>
              {uploadedFileName && (
                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full">
                  📎 {uploadedFileName}
                </span>
              )}
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-primary text-sm py-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  Generating...
                </span>
              ) : (
                "Generate Presentation ✨"
              )}
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Welcome Message */}
            {chatMessages.length === 0 && (
              <div className="max-w-2xl mx-auto text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 font-display">What would you like to present?</h3>
                <p className="text-dark-400 mb-8 max-w-lg mx-auto">
                  Describe your presentation topic, upload a file, or try one of the quick prompts below.
                  Select your industry profile on the left for contextual designs.
                </p>

                {/* Quick Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl mx-auto">
                  {[
                    { text: "Create a VC pitch deck for a SaaS startup", profile: "vc_pitch" },
                    { text: "Build a McKinsey-style consulting strategy deck", profile: "consulting" },
                    { text: "Design a technical architecture review presentation", profile: "tech" },
                    { text: "Create a Board of Directors quarterly review deck", profile: "board" },
                    { text: "Build an Annual Operating Plan (AOP) for FY2026", profile: "aop" },
                    { text: "Create an investment banking M&A pitch book", profile: "investment_banking" },
                    { text: "Build a product launch announcement deck", profile: "product" },
                    { text: "Make a quarterly business review for leadership", profile: "business" },
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setChatInput(prompt.text);
                        setProfile(prompt.profile);
                        setKeywordMode(prompt.profile);
                      }}
                      className="glass-card-hover p-3 text-left text-sm text-dark-300 hover:text-white transition-colors"
                    >
                      <span className="text-primary-400">→</span> {prompt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-lg rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'glass-card text-dark-200'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="border-t border-white/5 p-4 bg-dark-900/30">
            <div className="max-w-3xl mx-auto flex gap-3">
              {/* File Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.docx,.txt,.pptx,.json,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary p-3 rounded-xl"
                title="Upload file (.xlsx, .docx, .csv, .txt, .pptx)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit();
                    }
                  }}
                  placeholder="Describe your presentation, e.g. 'Create a VC pitch deck for an AI-powered logistics startup...'"
                  className="input-field pr-12 resize-none"
                  rows={2}
                />
                <button
                  onClick={handleChatSubmit}
                  className="absolute right-3 bottom-3 w-8 h-8 bg-primary-500 hover:bg-primary-400 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-center text-dark-600 text-xs mt-2">
              Supports: .xlsx, .csv, .docx, .txt, .pptx, .json • Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Preview Page
  if (step === "preview" && presentation) {
    return (
      <div className="min-h-screen bg-dark-950 flex">
        {/* Left — Slide Thumbnails */}
        <div className="w-[280px] border-r border-white/5 bg-dark-900/50 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/5">
            <button onClick={() => setStep("configure")} className="flex items-center gap-2 text-dark-400 hover:text-white text-sm transition-colors mb-3">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Editor
            </button>
            <h3 className="text-sm font-bold text-white">{presentation.title}</h3>
            <p className="text-xs text-dark-400 mt-0.5">{presentation.slides.length} slides • {currentTemplate.name}</p>
          </div>

          {/* Thumbnails */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {presentation.slides.map((slide, index) => (
              <div key={slide.id} className="relative group">
                <div className="flex items-start gap-2">
                  <span className="text-[10px] text-dark-500 font-medium mt-1 w-4 text-right">{index + 1}</span>
                  <div className="flex-1">
                    <div onClick={() => setActiveSlideIndex(index)} className={`transition-all ${activeSlideIndex === index ? 'ring-2 ring-primary-500' : 'ring-1 ring-dark-700 hover:ring-dark-500'} rounded overflow-hidden`}>
                      <SlidePreview
                        slide={slide}
                        template={currentTemplate}
                        presentation={presentation}
                        isActive={activeSlideIndex === index}
                        size="small"
                      />
                    </div>
                    {/* Edit button */}
                    <button
                      onClick={() => setEditingSlide(slide)}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-dark-800/90 text-white p-1 rounded transition-opacity"
                      title="Edit slide"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main — Large Preview */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="h-14 border-b border-white/5 bg-dark-900/30 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-semibold text-white">Preview</h2>
              <span className="text-xs text-dark-400">
                Slide {activeSlideIndex + 1} of {presentation.slides.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Template Switcher */}
              <select
                value={presentation.templateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="bg-dark-800 border border-dark-600 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary-500"
              >
                {TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              {/* Edit Current */}
              <button
                onClick={() => setEditingSlide(presentation.slides[activeSlideIndex])}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit
              </button>

              {/* Download */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="btn-primary text-xs py-1.5 flex items-center gap-1 disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Download .pptx
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Slide Preview Area */}
          <div className="flex-1 flex items-center justify-center p-8 bg-dark-950">
            <div className="relative">
              <SlidePreview
                slide={presentation.slides[activeSlideIndex]}
                template={currentTemplate}
                presentation={presentation}
                size="large"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="h-14 border-t border-white/5 bg-dark-900/30 flex items-center justify-center gap-4 px-6">
            <button
              onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
              disabled={activeSlideIndex === 0}
              className="btn-secondary py-1.5 px-4 text-xs disabled:opacity-30"
            >
              ← Previous
            </button>
            <div className="flex gap-1">
              {presentation.slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlideIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeSlideIndex === i ? 'bg-primary-500 w-6' : 'bg-dark-600 hover:bg-dark-400'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveSlideIndex(Math.min(presentation.slides.length - 1, activeSlideIndex + 1))}
              disabled={activeSlideIndex === presentation.slides.length - 1}
              className="btn-secondary py-1.5 px-4 text-xs disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Slide Editor Modal */}
        {editingSlide && (
          <SlideEditor
            slide={editingSlide}
            onUpdate={handleSlideUpdate}
            onClose={() => setEditingSlide(null)}
          />
        )}
      </div>
    );
  }

  return null;
}
