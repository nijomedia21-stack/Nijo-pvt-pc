import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Palette, 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Instagram, 
  Sparkles, 
  Clock, 
  Plus, 
  Trash2,
  Edit2,
  ExternalLink,
  ChevronRight,
  Zap,
  Activity,
  Eye,
  CheckCircle2,
  Share2,
  FolderOpen,
  X
} from 'lucide-react';
import { WorkspaceMode, LibraBrandColor, InstagramReelItem } from '../types';
import { 
  LIBRA_PALETTE, 
  LIBRA_REELS, 
  LIBRA_AI_PROMPTS 
} from '../data/initialData';

interface AdaptiveStudyDesignModuleProps {
  workspaceMode: WorkspaceMode;
  onOpenWorkspaceSwitcher: () => void;
}

export interface ClientProfile {
  id: string;
  name: string;
  handle: string;
  niche: string;
  contractStatus: 'active' | 'review' | 'completed';
  postsScheduled: number;
  engagementRate: string;
  storiesActive: number;
  files: Array<{ name: string; size: string; type: string; date: string }>;
}

const DEFAULT_CLIENTS: ClientProfile[] = [
  {
    id: 'c-libra',
    name: 'Libra Studio',
    handle: '@libra.studio',
    niche: 'Luxury Minimalist Fashion & Visual Identity',
    contractStatus: 'active',
    postsScheduled: 4,
    engagementRate: '4.8%',
    storiesActive: 2,
    files: [
      { name: 'Libra_Brand_Identity_Kit_v2.svg', size: '1.2 MB', type: 'vector', date: 'Nov 02, 2026' },
      { name: 'Reels_Hook_Batch_04.mp4', size: '18.4 MB', type: 'video', date: 'Nov 03, 2026' },
      { name: 'Libra_Typography_Syne_Jakarta.pdf', size: '3.1 MB', type: 'pdf', date: 'Nov 01, 2026' },
      { name: 'Client_Retainer_Agreement_2026.pdf', size: '850 KB', type: 'document', date: 'Oct 28, 2026' }
    ]
  }
];

export const AdaptiveStudyDesignModule: React.FC<AdaptiveStudyDesignModuleProps> = () => {
  // Clients state with persistent localStorage
  const [clients, setClients] = useState<ClientProfile[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nijo_smm_clients');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          // ignore error
        }
      }
    }
    return DEFAULT_CLIENTS;
  });

  const [selectedClientId, setSelectedClientId] = useState<string>(() => {
    return clients[0]?.id || 'c-libra';
  });

  // Client to Delete & Client to Edit
  const [clientToDelete, setClientToDelete] = useState<ClientProfile | null>(null);
  const [clientToEdit, setClientToEdit] = useState<ClientProfile | null>(null);

  // Edit form state
  const [editName, setEditName] = useState<string>('');
  const [editHandle, setEditHandle] = useState<string>('');
  const [editNiche, setEditNiche] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'active' | 'review' | 'completed'>('active');
  const [editEngagement, setEditEngagement] = useState<string>('4.8%');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nijo_smm_clients', JSON.stringify(clients));
      // sync client names to tasks module
      const clientNames = clients.map(c => c.name.replace(/\s+Studio$/i, '').trim());
      localStorage.setItem('nijo_pvt_clients', JSON.stringify(clientNames));
    }
  }, [clients]);

  const [copiedColorHex, setCopiedColorHex] = useState<string | null>(null);
  const [copiedCaptionId, setCopiedCaptionId] = useState<string | null>(null);
  const [captionGeneratorTopic, setCaptionGeneratorTopic] = useState<string>('');
  const [generatedCaption, setGeneratedCaption] = useState<string | null>(null);

  // Add Client Modal
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState<boolean>(false);
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientHandle, setNewClientHandle] = useState<string>('');
  const [newClientNiche, setNewClientNiche] = useState<string>('');

  const activeClient = clients.find(c => c.id === selectedClientId) || clients[0];

  const handleCopy = (text: string, type: 'color' | 'caption', id: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'color') {
      setCopiedColorHex(id);
      setTimeout(() => setCopiedColorHex(null), 2500);
    } else if (type === 'caption') {
      setCopiedCaptionId(id);
      setTimeout(() => setCopiedCaptionId(null), 2500);
    }
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const newClient: ClientProfile = {
      id: `c-${Date.now()}`,
      name: newClientName.trim(),
      handle: newClientHandle.trim() || `@${newClientName.trim().toLowerCase().replace(/\s+/g, '')}`,
      niche: newClientNiche.trim() || 'Social Media Management & Branding',
      contractStatus: 'active',
      postsScheduled: 0,
      engagementRate: '0.0%',
      storiesActive: 0,
      files: [
        { name: `${newClientName.trim()}_Brand_Assets.zip`, size: '2.5 MB', type: 'archive', date: 'Just now' }
      ]
    };

    setClients([...clients, newClient]);
    setSelectedClientId(newClient.id);
    setNewClientName('');
    setNewClientHandle('');
    setNewClientNiche('');
    setIsAddClientModalOpen(false);
  };

  const handleOpenEditClient = (client: ClientProfile) => {
    setClientToEdit(client);
    setEditName(client.name);
    setEditHandle(client.handle);
    setEditNiche(client.niche);
    setEditStatus(client.contractStatus);
    setEditEngagement(client.engagementRate);
  };

  const handleSaveEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientToEdit || !editName.trim()) return;

    setClients(prev => prev.map(c => {
      if (c.id === clientToEdit.id) {
        return {
          ...c,
          name: editName.trim(),
          handle: editHandle.trim() || c.handle,
          niche: editNiche.trim() || c.niche,
          contractStatus: editStatus,
          engagementRate: editEngagement.trim() || c.engagementRate,
        };
      }
      return c;
    }));

    setClientToEdit(null);
  };

  const handleConfirmDeleteClient = (clientId: string) => {
    const updated = clients.filter(c => c.id !== clientId);
    if (updated.length === 0) {
      setClients(DEFAULT_CLIENTS);
      setSelectedClientId(DEFAULT_CLIENTS[0].id);
    } else {
      setClients(updated);
      if (selectedClientId === clientId) {
        setSelectedClientId(updated[0].id);
      }
    }
    setClientToDelete(null);
  };

  const handleDeleteClientFile = (clientId: string, fileName: string) => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          files: c.files.filter(f => f.name !== fileName)
        };
      }
      return c;
    }));
  };

  const handleGenerateCaption = () => {
    if (!captionGeneratorTopic.trim()) return;
    const topic = captionGeneratorTopic.trim();
    const result = `Minimalist luxury is never about doing less; it's about making every millimeter intentional.\n\nExploring ${topic} through the lens of deep midnight navy and platinum contrast.\n\nAgency: NIJO SMM (@nijo.media21)\nClient: ${activeClient.handle}\n\n#NijoSMM #BrandIdentity #VisualDesign #${topic.replace(/\s+/g, '')} #KeralaDesigners`;
    setGeneratedCaption(result);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-y-auto">
      {/* Top Banner: Replaced with clean "Studio" & "NIJO SMM" */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F294A] text-cyan-300 flex items-center justify-center font-bold shadow-xs">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">
                Studio
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#1E3A8A] border border-blue-200">
                NIJO SMM
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Client accounts, 24/7 post monitoring, brand deliverables, and Instagram Reels pipeline
            </p>
          </div>
        </div>

        {/* Action Buttons: Edit Client, Delete Client, Add Client */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeClient && (
            <button
              onClick={() => handleOpenEditClient(activeClient)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-[#1E3A8A] text-xs font-semibold rounded-lg border border-slate-300 transition-all cursor-pointer shadow-2xs"
              title={`Edit details for ${activeClient.name}`}
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Client</span>
            </button>
          )}

          {activeClient && (
            <button
              onClick={() => setClientToDelete(activeClient)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-all cursor-pointer shadow-2xs"
              title={`Delete client ${activeClient.name}`}
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Delete Client</span>
            </button>
          )}

          <button
            onClick={() => setIsAddClientModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-cyan-300" />
            <span>New Client</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* 1. Clients Navigation Cards with Edit and Delete options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>Clients ({clients.length})</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Click client card to inspect deliverables &amp; reels
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {clients.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedClientId(c.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative group ${
                  selectedClientId === c.id
                    ? 'bg-white border-[#1E3A8A] shadow-md ring-2 ring-[#1E3A8A]/20'
                    : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#1E3A8A] transition-colors">
                      {c.name}
                    </h3>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {c.handle}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {c.contractStatus}
                    </span>

                    {/* Edit Client Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditClient(c);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-[#1E3A8A] hover:bg-blue-50 transition-colors"
                      title={`Edit ${c.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Client Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setClientToDelete(c);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title={`Delete ${c.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">
                  {c.niche}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="font-medium text-[#1E3A8A]">
                    {c.files.length} Assets in Vault
                  </span>
                  <span className="font-mono text-slate-500">
                    ER: {c.engagementRate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. 24/7 Account & Post Monitoring Card */}
        <div className="bg-[#0F294A] text-white rounded-2xl p-5 shadow-sm border border-[#1E3A8A] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E3A8A]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] text-cyan-300 flex items-center justify-center">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>24/7 Account &amp; Post Monitoring</span>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded">
                    Live Watchdog
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  Monitoring {activeClient.name} ({activeClient.handle})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-300">Continuous 24h Watchdog Active</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#16365F] p-3 rounded-xl border border-[#1E3A8A]">
              <span className="text-[10px] font-bold text-slate-300 uppercase block">Active Stories (24h)</span>
              <span className="text-lg font-extrabold text-cyan-200 font-mono mt-0.5 block">{activeClient.storiesActive} Live</span>
            </div>
            <div className="bg-[#16365F] p-3 rounded-xl border border-[#1E3A8A]">
              <span className="text-[10px] font-bold text-slate-300 uppercase block">Reels Scheduled</span>
              <span className="text-lg font-extrabold text-cyan-200 font-mono mt-0.5 block">{activeClient.postsScheduled} Ready</span>
            </div>
            <div className="bg-[#16365F] p-3 rounded-xl border border-[#1E3A8A]">
              <span className="text-[10px] font-bold text-slate-300 uppercase block">Engagement Rate</span>
              <span className="text-lg font-extrabold text-cyan-200 font-mono mt-0.5 block">{activeClient.engagementRate}</span>
            </div>
            <div className="bg-[#16365F] p-3 rounded-xl border border-[#1E3A8A]">
              <span className="text-[10px] font-bold text-slate-300 uppercase block">Audience Sentiment</span>
              <span className="text-lg font-extrabold text-emerald-300 font-mono mt-0.5 block">98.2% Positive</span>
            </div>
          </div>
        </div>

        {/* 3. Sleek 3-Line Compact Color Swatch Bar (Strict Zero-Red) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#0F294A]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {activeClient.name} Brand Colors (3-Line Swatch Bar)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Click any line to copy HEX
            </span>
          </div>

          <div className="space-y-2">
            {/* Line 1: Midnight Navy */}
            <button
              onClick={() => handleCopy('#0F294A', 'color', '#0F294A')}
              className="w-full h-8 rounded-lg bg-[#0F294A] flex items-center justify-between px-4 text-white text-xs font-mono font-bold hover:opacity-95 transition-all shadow-inner cursor-pointer"
            >
              <span>Midnight Navy (Primary Tone)</span>
              <span>{copiedColorHex === '#0F294A' ? 'Copied #0F294A!' : '#0F294A'}</span>
            </button>

            {/* Line 2: Electric Royal */}
            <button
              onClick={() => handleCopy('#1E3A8A', 'color', '#1E3A8A')}
              className="w-full h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-between px-4 text-white text-xs font-mono font-bold hover:opacity-95 transition-all shadow-inner cursor-pointer"
            >
              <span>Electric Royal (Interactive & Accent)</span>
              <span>{copiedColorHex === '#1E3A8A' ? 'Copied #1E3A8A!' : '#1E3A8A'}</span>
            </button>

            {/* Line 3: Pure Platinum & Ice Cyan */}
            <button
              onClick={() => handleCopy('#F8FAFC', 'color', '#F8FAFC')}
              className="w-full h-8 rounded-lg bg-[#F8FAFC] border border-slate-300 flex items-center justify-between px-4 text-slate-900 text-xs font-mono font-bold hover:bg-slate-100 transition-all shadow-inner cursor-pointer"
            >
              <span>Pure Platinum (Canvas & Typography Space)</span>
              <span className="text-slate-600">{copiedColorHex === '#F8FAFC' ? 'Copied #F8FAFC!' : '#F8FAFC · Cyan #06B6D4'}</span>
            </button>
          </div>
        </div>

        {/* 4. Client Deliverables & Files Explorer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#1E3A8A]" />
              <h3 className="text-sm font-bold text-slate-900">
                {activeClient.name} Asset Vault &amp; Deliverables
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {activeClient.files.length} Files Ready
            </span>
          </div>

          <div className="space-y-2.5">
            {activeClient.files.map((file) => (
              <div
                key={file.name}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4 hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[#0F294A]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{file.name}</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{file.size} · Updated {file.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const blob = new Blob([`NIJO SMM Client Asset: ${file.name}\nClient: ${activeClient.name}\nSize: ${file.size}`], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = file.name;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClientFile(activeClient.id, file.name)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
                    title={`Delete ${file.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Instagram Reels Content Calendar for Active Client */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Instagram className="w-4 h-4 text-[#1E3A8A]" />
              <h3 className="text-sm font-bold text-slate-900">
                Instagram Reels Pipeline ({activeClient.name})
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Next scheduled reel: Nov 04, 2026
            </span>
          </div>

          <div className="space-y-3">
            {LIBRA_REELS.map((reel) => (
              <div
                key={reel.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {reel.status}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Target: {reel.scheduledDate}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-1.5 leading-snug">
                      "{reel.hook}"
                    </h4>
                  </div>

                  <button
                    onClick={() => handleCopy(reel.caption, 'caption', reel.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 text-slate-800 text-xs font-medium rounded-lg border border-slate-300 shadow-2xs transition-colors shrink-0 cursor-pointer"
                  >
                    {copiedCaptionId === reel.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Caption</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {reel.caption}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span className="font-medium text-[#1E3A8A]">
                    Audio: {reel.audioTrack}
                  </span>
                  <div className="flex items-center gap-1">
                    {reel.hashtags.slice(0, 3).map((h) => (
                      <span key={h} className="text-slate-400">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Caption Generator */}
          <div className="p-4 bg-slate-100/70 rounded-xl border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>Instant Caption Generator for {activeClient.name}</span>
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter topic: e.g. Minimalist Watch Launch, Luxury Silk, Modern Contrast..."
                value={captionGeneratorTopic}
                onChange={(e) => setCaptionGeneratorTopic(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              />
              <button
                onClick={handleGenerateCaption}
                className="px-4 py-2 bg-[#0F294A] hover:bg-[#1E3A8A] text-white font-bold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Generate
              </button>
            </div>

            {generatedCaption && (
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-800 space-y-2">
                <div className="whitespace-pre-wrap font-sans leading-relaxed">
                  {generatedCaption}
                </div>
                <button
                  onClick={() => handleCopy(generatedCaption, 'caption', 'gen-custom')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Generated Caption</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT CLIENT MODAL */}
      {clientToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0F294A] text-white p-4 flex items-center justify-between border-b border-[#1E3A8A]">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-cyan-300" />
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Edit Client: {clientToEdit.name}
                </h3>
              </div>
              <button
                onClick={() => setClientToEdit(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditClient} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Client / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Instagram Handle
                </label>
                <input
                  type="text"
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Brand Niche / Category
                </label>
                <input
                  type="text"
                  value={editNiche}
                  onChange={(e) => setEditNiche(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contract Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                  >
                    <option value="active">Active</option>
                    <option value="review">Under Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Engagement Rate
                  </label>
                  <input
                    type="text"
                    value={editEngagement}
                    onChange={(e) => setEditEngagement(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClientToEdit(null)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#0F294A] hover:bg-[#1E3A8A] text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0F294A] text-white p-4 flex items-center justify-between border-b border-[#1E3A8A]">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-300" />
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Onboard New SMM Client
                </h3>
              </div>
              <button
                onClick={() => setIsAddClientModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Client / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Lifestyle, Nexa Studio..."
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Instagram Handle
                </label>
                <input
                  type="text"
                  placeholder="@client.brand"
                  value={newClientHandle}
                  onChange={(e) => setNewClientHandle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Brand Niche / Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Minimal Fashion, Architecture, Luxury..."
                  value={newClientNiche}
                  onChange={(e) => setNewClientNiche(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#0F294A] hover:bg-[#1E3A8A] text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Client Confirmation Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete Client</h3>
                <p className="text-xs text-slate-500">Remove from Studio</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">{clientToDelete.name}</strong> ({clientToDelete.handle})? All associated deliverables and tracking records will be removed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDeleteClient(clientToDelete.id)}
                className="px-4 py-1.5 text-xs font-bold bg-[#0F294A] hover:bg-[#1E3A8A] text-white rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdaptiveStudyDesignModule;
