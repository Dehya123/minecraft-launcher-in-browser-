import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Settings as SettingsIcon,
  Layers,
  Puzzle,
  User,
  Globe,
  Newspaper,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  FileCode,
  Sparkles,
  HelpCircle,
  FolderOpen,
  Share2,
  RefreshCw,
  Search,
  Monitor,
  ShieldCheck,
  Flame,
  ArrowRight
} from 'lucide-react';

interface GameClient {
  id: string;
  name: string;
  version: string;
  kind: string;
  url: string;
  tone: 'green' | 'blue' | 'orange';
  icon: string;
  description: string;
}

interface Installation {
  id: string;
  name: string;
  clientId: string;
  base: boolean;
  created: string;
}

interface SavedLink {
  id: string;
  name: string;
  type: 'Mod' | 'Resource pack' | 'Server' | 'Addon' | 'Other';
  url: string;
}

interface InstalledMod {
  id: string;
  name: string;
  fileName: string;
  size: number;
  code: string;
  enabled: boolean;
  added: string;
}

interface LauncherPrefs {
  newTab: boolean;
  recent: boolean;
  confirm: boolean;
  soundEffects: boolean;
  theme: 'dark' | 'light';
  accent: string;
}

interface Profile {
  name: string;
  avatar: string;
  skinType: 'steve' | 'alex' | 'diamond' | 'netherite' | 'ender';
}

const CLIENTS: GameClient[] = [
  {
    id: '26.3',
    name: 'Eaglercraft 26.3',
    version: '26.3',
    kind: 'Eaglercraft',
    url: 'https://dhyeybg.github.io/Eaglercraft-26.3/',
    tone: 'green',
    icon: '⛏',
    description: 'Community Minecraft 1.8.8 web port with modern optimizations and server support.'
  },
  {
    id: '26.2',
    name: 'GX Launcher · 26.2',
    version: '26.2',
    kind: 'GX Launcher WASM',
    url: 'https://gx-launcher.github.io/game/26.2-wasm/index.html',
    tone: 'green',
    icon: '⛏',
    description: 'High performance WebAssembly client build with smooth mouse lock.'
  },
  {
    id: '26.1.2',
    name: 'GX Launcher · 26.1.2',
    version: '26.1.2',
    kind: 'GX Launcher WASM',
    url: 'https://gx-launcher.github.io/game/26.1.2-wasm/index.html',
    tone: 'green',
    icon: '⛏',
    description: 'Stable 26.1 maintenance release with shader compat.'
  },
  {
    id: '1.21.11',
    name: 'GX Launcher · 1.21.11',
    version: '1.21.11',
    kind: 'GX Launcher Modern',
    url: 'https://gx-launcher.github.io/game/1.21.11-wasm/index.html',
    tone: 'blue',
    icon: '◆',
    description: 'Modern edition web experiment featuring recent block palettes.'
  },
  {
    id: '1.20.6',
    name: 'GX Launcher · 1.20.6',
    version: '1.20.6',
    kind: 'GX Launcher Modern',
    url: 'https://gx-launcher.github.io/game/1.20.6-wasm/index.html',
    tone: 'blue',
    icon: '◆',
    description: 'Trails & Tales version web test build.'
  },
  {
    id: '1.12.2',
    name: 'GX Launcher · 1.12.2',
    version: '1.12.2',
    kind: 'GX Launcher Classic',
    url: 'https://gx-launcher.github.io/game/1.12.2/index.html',
    tone: 'orange',
    icon: '▦',
    description: 'The World of Color Update in browser form.'
  },
  {
    id: '1.8.8',
    name: 'GX Launcher · 1.8.8',
    version: '1.8.8',
    kind: 'GX Launcher Classic',
    url: 'https://gx-launcher.github.io/game/1.8.8/index.html',
    tone: 'orange',
    icon: '⚔',
    description: 'Beloved classic combat update 1.8.8, popular for PvP.'
  }
];

const DEFAULT_STATE = {
  profile: {
    name: 'Player',
    avatar: '☺',
    skinType: 'steve' as const
  },
  installations: CLIENTS.map((c, i) => ({
    id: `base-${c.id}`,
    name: i === 0 ? 'Latest browser client' : c.name,
    clientId: c.id,
    base: true,
    created: new Date().toISOString()
  })),
  links: [
    {
      id: 'default-1',
      name: 'Eaglercraft Archive Builds',
      type: 'Other' as const,
      url: 'https://github.com/Eaglercraft-Archive/unminified-eaglercraft-builds/releases'
    },
    {
      id: 'default-2',
      name: 'EaglerForge Documentation & ModAPI',
      type: 'Mod' as const,
      url: 'https://eaglerforge.github.io/EaglerForgeInjector/docs/'
    }
  ],
  installedMods: [] as InstalledMod[],
  prefs: {
    newTab: true,
    recent: true,
    confirm: false,
    soundEffects: true,
    theme: 'dark' as const,
    accent: '#5dbb45'
  },
  selected: '26.3'
};

const STORAGE_KEY = 'chatcraftLauncher.v2';

export default function App() {
  // Load saved state or default
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) return { ...DEFAULT_STATE.profile, ...parsed.profile };
      }
    } catch (_) {}
    return DEFAULT_STATE.profile;
  });

  const [installations, setInstallations] = useState<Installation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.installations) && parsed.installations.length > 0) {
          return parsed.installations;
        }
      }
    } catch (_) {}
    return DEFAULT_STATE.installations;
  });

  const [links, setLinks] = useState<SavedLink[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.links)) return parsed.links;
      }
    } catch (_) {}
    return DEFAULT_STATE.links;
  });

  const [installedMods, setInstalledMods] = useState<InstalledMod[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.installedMods)) return parsed.installedMods;
      }
    } catch (_) {}
    return DEFAULT_STATE.installedMods;
  });

  const [prefs, setPrefs] = useState<LauncherPrefs>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.prefs) return { ...DEFAULT_STATE.prefs, ...parsed.prefs };
      }
    } catch (_) {}
    return DEFAULT_STATE.prefs;
  });

  const [selectedId, setSelectedId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selected && CLIENTS.some(c => c.id === parsed.selected)) {
          return parsed.selected;
        }
      }
    } catch (_) {}
    return DEFAULT_STATE.selected;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'play' | 'installations' | 'mods' | 'skins' | 'realms' | 'news' | 'settings'>('play');
  const [settingsSection, setSettingsSection] = useState<'general' | 'appearance' | 'audio' | 'privacy' | 'about'>('general');
  const [installSearch, setInstallSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInstallId, setEditingInstallId] = useState<string | null>(null);
  const [modalInstallName, setModalInstallName] = useState('');
  const [modalInstallClientId, setModalInstallClientId] = useState('26.3');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [inAppPlayClient, setInAppPlayClient] = useState<GameClient | null>(null);

  // Mod building state
  const [modClientFile, setModClientFile] = useState<File | null>(null);
  const [modBuilding, setModBuilding] = useState(false);
  const [modStatusMsg, setModStatusMsg] = useState<string>('Select an EaglerForge offline HTML client and enable at least one mod.');
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkType, setNewLinkType] = useState<SavedLink['type']>('Mod');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          profile,
          installations,
          links,
          installedMods,
          prefs,
          selected: selectedId
        })
      );
    } catch (_) {}
  }, [profile, installations, links, installedMods, prefs, selectedId]);

  // Apply theme & accent
  useEffect(() => {
    if (prefs.theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    document.documentElement.style.setProperty('--accent', prefs.accent || '#5dbb45');
  }, [prefs.theme, prefs.accent]);

  // Audio SFX generator (Web Audio API)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playClickSfx = () => {
    if (!prefs.soundEffects) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (_) {}
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  };

  const currentClient = useMemo(() => {
    return CLIENTS.find(c => c.id === selectedId) || CLIENTS[0];
  }, [selectedId]);

  const handleLaunch = (client: GameClient) => {
    playClickSfx();
    if (prefs.confirm) {
      const ok = window.confirm(`Launch ${client.name}?`);
      if (!ok) return;
    }
    showToast(`Launching ${client.name}...`);
    if (prefs.newTab) {
      const win = window.open(client.url, '_blank');
      if (!win) {
        showToast('Pop-up was blocked. Opening in this tab instead.');
        window.location.href = client.url;
      }
    } else {
      setInAppPlayClient(client);
    }
  };

  // Installation Modal handlers
  const openNewInstallModal = () => {
    playClickSfx();
    setEditingInstallId(null);
    setModalInstallName('New Browser Profile');
    setModalInstallClientId(selectedId);
    setModalOpen(true);
  };

  const openEditInstallModal = (inst: Installation) => {
    playClickSfx();
    setEditingInstallId(inst.id);
    setModalInstallName(inst.name);
    setModalInstallClientId(inst.clientId);
    setModalOpen(true);
  };

  const saveInstallModal = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSfx();
    const name = modalInstallName.trim();
    if (!name) return;

    if (editingInstallId) {
      setInstallations(prev =>
        prev.map(item => (item.id === editingInstallId ? { ...item, name, clientId: modalInstallClientId } : item))
      );
      showToast('Installation updated.');
    } else {
      const newInst: Installation = {
        id: `custom-${Date.now().toString(36)}`,
        name,
        clientId: modalInstallClientId,
        base: false,
        created: new Date().toISOString()
      };
      setInstallations(prev => [newInst, ...prev]);
      showToast('New installation created.');
    }
    setModalOpen(false);
  };

  const deleteInstall = (id: string, name: string) => {
    playClickSfx();
    if (window.confirm(`Delete installation "${name}"?`)) {
      setInstallations(prev => prev.filter(i => i.id !== id));
      showToast('Installation deleted.');
    }
  };

  // Mod files handling
  const handleModFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;

    const accepted = files.filter(f => /\.(js|mjs)$/i.test(f.name));
    if (accepted.length !== files.length) {
      showToast('Only .js or .mjs mod files are supported.');
      return;
    }

    if (accepted.some(f => f.size > 450 * 1024)) {
      showToast('For browser performance, individual mod files must be under 450 KB.');
      return;
    }

    const newMods: InstalledMod[] = [];
    for (const f of accepted) {
      try {
        const code = await f.text();
        newMods.push({
          id: `mod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          name: f.name.replace(/\.(m?js)$/i, ''),
          fileName: f.name,
          size: f.size,
          code,
          enabled: true,
          added: new Date().toISOString()
        });
      } catch (_) {
        showToast(`Could not read ${f.name}`);
      }
    }

    setInstalledMods(prev => [...newMods, ...prev]);
    showToast(`Added ${newMods.length} mod file${newMods.length === 1 ? '' : 's'}.`);
    e.target.value = '';
  };

  const handleDownloadSampleMod = () => {
    playClickSfx();
    const sampleCode = `// Minecraft Launcher Test Mod for EaglerForge
// Displays a confirmation toast message in the client
ModAPI.addEventListener("load", function () {
  ModAPI.displayToChat("§a[Launcher] §fEaglerForge Test Mod loaded successfully!");
  console.log("Minecraft Launcher browser test mod active.");
});
`;
    const blob = new Blob([sampleCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Minecraft-Launcher-Test-Mod.js';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 15000);
    showToast('Downloaded sample mod. Add it using "Install Selected Mods".');
  };

  const handleBuildModdedClient = async () => {
    playClickSfx();
    if (!modClientFile) {
      showToast('Choose your EaglerForge offline .html client file first.');
      return;
    }
    const enabledMods = installedMods.filter(m => m.enabled);
    if (!enabledMods.length) {
      showToast('Enable at least one mod from your library first.');
      return;
    }

    setModBuilding(true);
    setModStatusMsg('Reading client file and packaging mod scripts...');

    try {
      const rawHtml = await modClientFile.text();
      if (!/<html[\s>]/i.test(rawHtml) || !/<head[\s>]/i.test(rawHtml)) {
        throw new Error('Selected file does not appear to be a valid complete HTML client.');
      }

      // Encode mods
      const encodedMods = enabledMods.map(m => {
        const bytes = new TextEncoder().encode(m.code);
        let binary = '';
        for (let i = 0; i < bytes.length; i += 0x8000) {
          binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        }
        return btoa(binary);
      });

      const bootstrapScript = `(function(){
  const ccSources = ${JSON.stringify(encodedMods)};
  const ccUrls = ccSources.map(function(b64){
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], {type: 'text/javascript'}));
  });
  let ccOpts = (window.eaglercraftXOpts && typeof window.eaglercraftXOpts === 'object') ? window.eaglercraftXOpts : {};
  ccOpts.Mods = ccUrls;
  try {
    Object.defineProperty(window, 'eaglercraftXOpts', {
      configurable: true,
      enumerable: true,
      get: function() { return ccOpts; },
      set: function(v) { ccOpts = (v && typeof v === 'object') ? v : {}; ccOpts.Mods = ccUrls; }
    });
  } catch(e) {
    window.eaglercraftXOpts = ccOpts;
  }
})();`;

      const headMatch = rawHtml.match(/<head[^>]*>/i);
      if (!headMatch || headMatch.index === undefined) {
        throw new Error('HTML client missing <head> section.');
      }

      const insertion = headMatch.index + headMatch[0].length;
      const injectedHtml =
        rawHtml.slice(0, insertion) +
        `<script id="launcher-eaglerforge-bootstrap">${bootstrapScript}</script>` +
        rawHtml.slice(insertion);

      const outputBlob = new Blob([injectedHtml], { type: 'text/html' });
      const outputUrl = URL.createObjectURL(outputBlob);
      const a = document.createElement('a');
      a.href = outputUrl;
      const cleanName = modClientFile.name.replace(/\.html?$/i, '');
      a.download = `${cleanName}-Modded.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(outputUrl), 45000);

      setModStatusMsg(`Success! Built standalone client with ${enabledMods.length} mod(s). Check your downloads.`);
      showToast(`Modded client downloaded with ${enabledMods.length} active mods.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error packaging modded client.';
      setModStatusMsg(msg);
      showToast(msg);
    } finally {
      setModBuilding(false);
    }
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSfx();
    const name = newLinkName.trim();
    const url = newLinkUrl.trim();
    if (!name || !url) return;

    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
      const newL: SavedLink = {
        id: `link-${Date.now().toString(36)}`,
        name,
        type: newLinkType,
        url: parsed.href
      };
      setLinks(prev => [newL, ...prev]);
      setNewLinkName('');
      setNewLinkUrl('');
      showToast('Link saved to library.');
    } catch (_) {
      showToast('Please provide a valid http:// or https:// URL.');
    }
  };

  const filteredInstallations = useMemo(() => {
    const q = installSearch.toLowerCase().trim();
    if (!q) return installations;
    return installations.filter(i => {
      const c = CLIENTS.find(x => x.id === i.clientId);
      return i.name.toLowerCase().includes(q) || (c && c.name.toLowerCase().includes(q));
    });
  }, [installations, installSearch]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#202020] text-[#f4f4f4] font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-10 right-6 z-50 flex items-center gap-3 bg-[#2d3239] border border-white/20 text-white text-xs px-4 py-3 rounded shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="w-2 h-2 rounded-full bg-[#5dbb45]" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white ml-2 text-sm">
            ×
          </button>
        </div>
      )}

      {/* In-App Game View Overlay (when user selects in-app play or presses Play without new-tab) */}
      {inAppPlayClient && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between px-4 py-2 bg-[#1b1f24] border-b border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#5dbb45]">{inAppPlayClient.name}</span>
              <span className="text-gray-400">· {inAppPlayClient.version}</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={inAppPlayClient.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
              </a>
              <button
                onClick={() => setInAppPlayClient(null)}
                className="flex items-center gap-1 px-3 py-1 bg-red-600/80 hover:bg-red-600 rounded text-white font-bold"
              >
                <X className="w-3.5 h-3.5" /> Close Client
              </button>
            </div>
          </div>
          <div className="flex-1 w-full h-full relative">
            <iframe
              src={inAppPlayClient.url}
              title={inAppPlayClient.name}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; pointer-lock"
            />
          </div>
        </div>
      )}

      {/* Installation Edit/Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg bg-[#2c3138] border border-white/20 rounded shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-[#23272d] border-b border-white/10">
              <h2 className="text-base font-bold text-white">
                {editingInstallId ? 'Edit Installation' : 'New Installation Profile'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white text-xl font-bold p-1"
              >
                ×
              </button>
            </div>
            <form onSubmit={saveInstallModal}>
              <div className="p-5 space-y-4 text-sm">
                <div>
                  <label className="block text-xs text-gray-300 font-semibold mb-1">Installation Name</label>
                  <input
                    type="text"
                    value={modalInstallName}
                    onChange={e => setModalInstallName(e.target.value)}
                    maxLength={50}
                    placeholder="e.g. PvP Practice 1.8.8"
                    className="w-full bg-[#1e2227] border border-white/20 rounded p-2.5 text-white focus:outline-none focus:border-[#5dbb45]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-300 font-semibold mb-1">Target Client Version</label>
                  <select
                    value={modalInstallClientId}
                    onChange={e => setModalInstallClientId(e.target.value)}
                    className="w-full bg-[#1e2227] border border-white/20 rounded p-2.5 text-white focus:outline-none focus:border-[#5dbb45]"
                  >
                    {CLIENTS.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.kind})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="p-3 bg-black/20 border border-white/5 rounded text-xs text-gray-400 leading-relaxed">
                  Creates a quick launcher preset stored in your browser. Launching it starts the selected client link.
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-5 py-3 bg-[#23272d] border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-xs font-semibold text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#16833b] hover:bg-[#199747] rounded text-xs font-bold text-white shadow"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: Sidebar + Main Content Area */}
      <div className="flex h-full w-full">
        {/* Left Sidebar */}
        <aside className="w-56 md:w-60 flex-shrink-0 bg-[#191919] border-r border-[#101010] flex flex-col justify-between select-none">
          <div>
            {/* Brand Header */}
            <div className="h-16 flex items-center gap-3 px-4 bg-[#202020] border-b border-[#111]">
              <div className="grass-block-icon w-9 h-9" />
              <div>
                <div className="font-black text-sm tracking-wide text-white drop-shadow">MINECRAFT</div>
                <div className="text-[9px] font-bold tracking-widest text-gray-400">LAUNCHER</div>
              </div>
            </div>

            {/* My Games Section */}
            <div className="p-2 border-b border-white/5">
              <div className="text-[9px] font-bold tracking-wider text-gray-500 uppercase px-2 py-1">
                My Games
              </div>
              <button
                onClick={() => {
                  playClickSfx();
                  setActiveTab('play');
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-left transition-colors border-l-3 ${
                  activeTab === 'play'
                    ? 'bg-[#303030] text-white border-[#65b847] font-semibold'
                    : 'text-gray-300 hover:bg-white/5 border-transparent'
                }`}
              >
                <div className="grass-block-icon w-7 h-7" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs truncate font-bold">Minecraft: Java &amp; Bedrock</div>
                  <div className="text-[9px] text-gray-400 truncate">Browser Clients</div>
                </div>
              </button>

              <a
                href="https://www.minecraft.net/en-us/store/minecraft-java-bedrock-edition-pc"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center gap-2.5 px-2.5 py-2 mt-1 rounded text-left text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <div className="w-7 h-7 rounded-sm bg-gradient-to-b from-[#4d8b39] to-[#2c5b20] flex items-center justify-center text-xs font-bold text-black border border-black/40">
                  C
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs truncate">Minecraft Windows</div>
                  <div className="text-[9px] text-gray-500">Official Store</div>
                </div>
                <ExternalLink className="w-3 h-3 text-gray-500 flex-shrink-0" />
              </a>

              <a
                href="https://www.minecraft.net/en-us/about-dungeons"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-left text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <div className="w-7 h-7 rounded-sm bg-gradient-to-br from-[#c38b49] to-[#563d2b] flex items-center justify-center text-xs font-bold text-white border border-black/40">
                  D
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs truncate">Minecraft Dungeons</div>
                  <div className="text-[9px] text-gray-500">Official Info</div>
                </div>
                <ExternalLink className="w-3 h-3 text-gray-500 flex-shrink-0" />
              </a>
            </div>

            {/* Launcher Navigation Items */}
            <nav className="p-2 space-y-0.5">
              <div className="text-[9px] font-bold tracking-wider text-gray-500 uppercase px-2 py-1.5">
                Launcher
              </div>

              {[
                { id: 'play', label: 'Play', icon: Play },
                { id: 'installations', label: 'Installations', icon: Layers },
                { id: 'mods', label: 'Mods & Links', icon: Puzzle },
                { id: 'skins', label: 'Skins', icon: User },
                { id: 'realms', label: 'Realms', icon: Globe },
                { id: 'news', label: 'News & Patch Notes', icon: Newspaper },
                { id: 'settings', label: 'Settings', icon: SettingsIcon }
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      playClickSfx();
                      setActiveTab(item.id as typeof activeTab);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded transition-colors border-l-3 ${
                      isActive
                        ? 'bg-[#303030] text-white border-[#65b847] font-semibold'
                        : 'text-gray-300 hover:bg-white/5 border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Profile Bar */}
          <div
            onClick={() => {
              playClickSfx();
              setActiveTab('skins');
            }}
            className="p-3 bg-[#202020] border-t border-[#393939] flex items-center gap-3 cursor-pointer hover:bg-[#252525] transition-colors"
          >
            <div className="w-8 h-8 rounded bg-[#59483c] border border-black flex items-center justify-center text-sm font-bold text-white shadow-inner">
              {profile.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{profile.name}</div>
              <div className="text-[10px] text-gray-400 truncate">Local Player · Offline</div>
            </div>
            <div className="text-gray-500 text-xs">⚙</div>
          </div>
        </aside>

        {/* Right Main Screen */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#202020] overflow-hidden">
          {/* Top Tabs Bar */}
          <header className="h-12 bg-[#242424] border-b border-[#111] flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center space-x-1 overflow-x-auto h-full">
              {[
                { id: 'play', label: 'Play' },
                { id: 'installations', label: 'Installations' },
                { id: 'mods', label: 'Mods' },
                { id: 'skins', label: 'Skins' },
                { id: 'realms', label: 'Realms' },
                { id: 'news', label: 'Patch Notes' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    playClickSfx();
                    setActiveTab(t.id as typeof activeTab);
                  }}
                  className={`h-full px-4 text-xs uppercase tracking-wider font-bold border-b-2 transition-colors ${
                    activeTab === t.id
                      ? 'border-[#5eaa43] text-white bg-white/5'
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playClickSfx();
                  setPrefs(p => ({ ...p, soundEffects: !p.soundEffects }));
                  showToast(prefs.soundEffects ? 'Sound effects muted' : 'Sound effects enabled');
                }}
                title={prefs.soundEffects ? 'Mute SFX' : 'Enable SFX'}
                className="p-1.5 bg-[#303030] hover:bg-white/10 border border-white/10 rounded text-gray-300 hover:text-white"
              >
                {prefs.soundEffects ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  playClickSfx();
                  setActiveTab('settings');
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#303030] hover:bg-white/10 border border-white/10 rounded text-xs text-gray-300 hover:text-white"
              >
                <SettingsIcon className="w-3.5 h-3.5" /> Settings
              </button>
            </div>
          </header>

          {/* View Container */}
          <main className="flex-1 overflow-y-auto">
            {/* TAB: PLAY */}
            {activeTab === 'play' && (
              <div className="flex flex-col min-h-full">
                {/* Hero Trailer Scene */}
                <div className="relative w-full h-[460px] md:h-[520px] bg-[#263b4c] overflow-hidden flex flex-col justify-between border-b border-[#111]">
                  {/* Trailer Poster Backdrop */}
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-85 transition-transform duration-700"
                    style={{
                      backgroundImage: `url('https://img.youtube.com/vi/qNMfF9TYETM/maxresdefault.jpg')`
                    }}
                  />
                  {/* Gradient shade overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14181a] via-[#0c1214]/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

                  {/* Topline Header in scene */}
                  <div className="relative z-10 flex items-center justify-between p-6">
                    <div className="flex items-center gap-3">
                      <div className="grass-block-icon w-10 h-10 shadow-lg" />
                      <div>
                        <div className="text-xl font-black tracking-wider text-white drop-shadow-md">
                          MINECRAFT
                        </div>
                        <div className="text-[10px] font-extrabold tracking-widest text-[#d6f3c6]">
                          JAVA &amp; BEDROCK EDITION
                        </div>
                      </div>
                    </div>

                    <a
                      href="https://www.youtube.com/watch?v=qNMfF9TYETM"
                      target="_blank"
                      rel="noreferrer"
                      className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/60 hover:bg-black/80 border border-white/20 rounded text-xs font-bold text-white backdrop-blur-sm transition-all"
                    >
                      <span>WATCH OFFICIAL TRAILER</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#5dbb45]" />
                    </a>
                  </div>

                  {/* Middle Content */}
                  <div className="relative z-10 px-8 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-black/40 border border-white/10 text-[10px] font-bold text-[#82d95c] tracking-widest uppercase mb-2">
                      <span className="w-2 h-2 rounded-full bg-[#82d95c] animate-pulse" />
                      Browser Edition Client
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg leading-tight tracking-tight">
                      PLAY INSTANTLY
                    </h1>
                    <p className="text-xs md:text-sm text-gray-200 mt-2 line-clamp-2 drop-shadow leading-relaxed">
                      Launch full community web ports of Minecraft 1.8.8, 1.12.2, and modern experimental WebAssembly builds.
                      No installer needed.
                    </p>
                  </div>

                  {/* Bottom Dock Control Strip */}
                  <div className="relative z-10 w-full min-h-[96px] bg-[#1d1d1d]/95 backdrop-blur-md border-t border-white/20 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Selected Client Info */}
                    <div className="flex items-center gap-3 min-w-0 w-full md:w-auto">
                      <div className="grass-block-icon w-10 h-10 shadow" />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{currentClient.name}</div>
                        <div className="text-[11px] text-gray-400 truncate">
                          {currentClient.kind} · Ready to play
                        </div>
                      </div>
                    </div>

                    {/* Version Selector and Big Play Button */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                      <div className="w-52">
                        <label className="block text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1">
                          VERSION
                        </label>
                        <select
                          value={selectedId}
                          onChange={e => {
                            playClickSfx();
                            setSelectedId(e.target.value);
                          }}
                          className="w-full h-11 bg-[#343434] border border-[#151515] text-white text-xs font-semibold px-3 rounded focus:outline-none focus:border-[#5eaa43]"
                        >
                          {CLIENTS.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.version})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => handleLaunch(currentClient)}
                        className="h-11 min-w-[180px] bg-[#16833b] hover:bg-[#199747] active:translate-y-0.5 border border-[#0d5d2a] text-white font-black text-lg tracking-widest rounded shadow-[0_3px_0_#0a4a20] flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>PLAY</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Below Fold: News & Quick Launch */}
                <div className="p-6 md:p-8 space-y-6 max-w-6xl">
                  {/* Quick Launch Cards */}
                  {prefs.recent && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                          Quick Launch Clients
                        </h2>
                        <button
                          onClick={() => {
                            playClickSfx();
                            setActiveTab('installations');
                          }}
                          className="text-xs text-[#82d95c] hover:underline font-semibold"
                        >
                          View All Installations →
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {CLIENTS.slice(0, 4).map(c => (
                          <div
                            key={c.id}
                            className="bg-[#292929] border border-white/10 hover:border-white/30 rounded p-3 flex items-center justify-between gap-3 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${
                                  c.tone === 'orange'
                                    ? 'bg-amber-800 text-amber-200'
                                    : c.tone === 'blue'
                                    ? 'bg-sky-800 text-sky-200'
                                    : 'bg-emerald-800 text-emerald-200'
                                }`}
                              >
                                {c.icon}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">{c.name}</div>
                                <div className="text-[10px] text-gray-400">Ver {c.version}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleLaunch(c)}
                              className="px-3 py-1.5 bg-[#16833b] hover:bg-[#199747] text-white text-xs font-bold rounded shadow-sm"
                            >
                              Play
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* News Articles */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                        Official Minecraft News
                      </h2>
                      <a
                        href="https://www.minecraft.net/en-us/articles"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#82d95c] hover:underline font-semibold"
                      >
                        Read All Articles ↗
                      </a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <article className="bg-[#292929] border border-white/10 rounded overflow-hidden flex flex-col justify-between">
                        <div
                          className="h-32 bg-cover bg-center"
                          style={{
                            backgroundImage: `url('https://img.youtube.com/vi/qNMfF9TYETM/maxresdefault.jpg')`
                          }}
                        />
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-[#82d95c] uppercase">Feature Article</div>
                            <h3 className="text-sm font-bold text-white mt-1">What's new in Minecraft?</h3>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-3">
                              Discover latest announcements, world generation overhauls, trial chambers, and community creations.
                            </p>
                          </div>
                          <a
                            href="https://www.minecraft.net/en-us/articles"
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 text-xs text-[#82d95c] font-bold hover:underline"
                          >
                            READ ARTICLE ↗
                          </a>
                        </div>
                      </article>

                      <article className="bg-[#292929] border border-white/10 rounded overflow-hidden flex flex-col justify-between">
                        <div
                          className="h-32 bg-cover bg-center"
                          style={{
                            backgroundImage: `url('https://img.youtube.com/vi/GXr5glhGkzE/maxresdefault.jpg')`
                          }}
                        />
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-sky-400 uppercase">Game Updates</div>
                            <h3 className="text-sm font-bold text-white mt-1">Explore Latest Updates</h3>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-3">
                              Read full patch logs for recent Java and Bedrock updates with bug fixes and balance tweaks.
                            </p>
                          </div>
                          <a
                            href="https://www.minecraft.net/en-us/updates"
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 text-xs text-sky-400 font-bold hover:underline"
                          >
                            VIEW UPDATES ↗
                          </a>
                        </div>
                      </article>

                      <article className="bg-[#292929] border border-white/10 rounded overflow-hidden flex flex-col justify-between">
                        <div
                          className="h-32 bg-cover bg-center"
                          style={{
                            backgroundImage: `url('https://cdn.mos.cms.futurecdn.net/z27gSqonhSc8wimapsQDCL.jpg')`
                          }}
                        />
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-amber-400 uppercase">Community Tools</div>
                            <h3 className="text-sm font-bold text-white mt-1">EaglerForge Mod Support</h3>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-3">
                              Upload JavaScript mods or package custom offline Eaglercraft clients right inside the launcher.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              playClickSfx();
                              setActiveTab('mods');
                            }}
                            className="mt-3 text-left text-xs text-amber-400 font-bold hover:underline cursor-pointer"
                          >
                            EXPLORE MODS →
                          </button>
                        </div>
                      </article>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: INSTALLATIONS */}
            {activeTab === 'installations' && (
              <div className="p-6 md:p-8 max-w-5xl space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Installations</h1>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage shortcuts to browser client versions. Profiles are stored in your browser's local memory.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={installSearch}
                      onChange={e => setInstallSearch(e.target.value)}
                      placeholder="Search installations by name or version..."
                      className="w-full pl-9 pr-3 py-2 bg-[#1e2227] border border-white/10 rounded text-xs text-white focus:outline-none focus:border-[#5eaa43]"
                    />
                  </div>

                  <button
                    onClick={openNewInstallModal}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#16833b] hover:bg-[#199747] text-white text-xs font-bold rounded shadow transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Installation
                  </button>
                </div>

                {/* Table */}
                <div className="bg-[#252525] border border-white/10 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#1f1f1f] text-gray-400 uppercase tracking-wider border-b border-white/10">
                        <th className="py-3 px-4">Profile Name</th>
                        <th className="py-3 px-4">Client / Version</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredInstallations.map(inst => {
                        const client = CLIENTS.find(c => c.id === inst.clientId) || CLIENTS[0];
                        return (
                          <tr key={inst.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-white">{inst.name}</div>
                              {inst.base && <div className="text-[10px] text-gray-400">Default Preset</div>}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-gray-200">{client.name}</span>
                              <div className="text-[10px] text-gray-400">{client.kind}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-block px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] text-[#82d95c]">
                                Web URL
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleLaunch(client)}
                                  className="px-3 py-1 bg-[#16833b] hover:bg-[#199747] text-white font-bold rounded text-[11px]"
                                >
                                  PLAY
                                </button>
                                <button
                                  onClick={() => openEditInstallModal(inst)}
                                  className="px-2 py-1 bg-white/10 hover:bg-white/20 text-gray-200 rounded text-[11px]"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                {!inst.base && (
                                  <button
                                    onClick={() => deleteInstall(inst.id, inst.name)}
                                    className="px-2 py-1 bg-red-900/50 hover:bg-red-800 text-red-200 rounded text-[11px]"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredInstallations.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-400">
                            No installations found matching "{installSearch}".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: MODS & LINKS */}
            {activeTab === 'mods' && (
              <div className="p-6 md:p-8 max-w-5xl space-y-8">
                <div>
                  <h1 className="text-2xl font-bold text-white">Mods for Eaglercraft</h1>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage JavaScript mods for EaglerForge clients and build standalone offline modded clients.
                  </p>
                </div>

                {/* 3 Step Workflow */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Step 1: EaglerForge Injector */}
                  <div className="bg-[#292929] border border-white/10 rounded p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-[#16833b] text-white font-black text-xs flex items-center justify-center">
                          1
                        </span>
                        <h2 className="text-sm font-bold text-white">Prepare Mod-Capable Client</h2>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[#82d95c]">
                        EAGLERFORGE
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Download an unminified, unobfuscated EaglercraftX 1.8.8 offline HTML client, then run it through
                      EaglerForge Injector to enable JavaScript mod support.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href="https://eaglerforge.github.io/EaglerForgeInjector/"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-[#16833b] hover:bg-[#199747] text-white text-xs font-bold rounded flex items-center gap-1.5"
                      >
                        Open Injector ↗
                      </a>
                      <a
                        href="https://github.com/Eaglercraft-Archive/unminified-eaglercraft-builds/releases/latest"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded flex items-center gap-1.5"
                      >
                        1.8 Client Builds ↗
                      </a>
                    </div>
                    <div className="rounded border border-white/10 overflow-hidden bg-black/30">
                      <iframe
                        src="https://eaglerforge.github.io/EaglerForgeInjector/"
                        title="EaglerForge Injector Tool"
                        className="w-full h-64 border-0"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-modals"
                      />
                    </div>
                  </div>

                  {/* Step 2: Install Mod Files */}
                  <div className="bg-[#292929] border border-white/10 rounded p-5 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-[#16833b] text-white font-black text-xs flex items-center justify-center">
                            2
                          </span>
                          <h2 className="text-sm font-bold text-white">Installed Mod Library</h2>
                        </div>
                        <span className="text-xs text-gray-400">{installedMods.length} mod(s)</span>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-xs text-gray-300 font-medium">
                          Add JavaScript Mod (.js or .mjs)
                        </label>
                        <input
                          type="file"
                          accept=".js,.mjs"
                          multiple
                          onChange={handleModFilesUpload}
                          className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#16833b] file:text-white hover:file:bg-[#199747]"
                        />

                        <button
                          onClick={handleDownloadSampleMod}
                          className="w-full py-2 bg-white/10 hover:bg-white/15 text-xs text-gray-200 font-semibold rounded border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Sample Chat Mod
                        </button>
                      </div>

                      {/* Mod List */}
                      <div className="mt-4 max-h-48 overflow-y-auto divide-y divide-white/5 border border-white/5 rounded bg-black/20 p-2">
                        {installedMods.map(m => (
                          <div key={m.id} className="py-2 px-1 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileCode className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">{m.name}</div>
                                <div className="text-[10px] text-gray-400">
                                  {Math.max(1, Math.round(m.size / 1024))} KB
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <label className="flex items-center gap-1 text-[10px] text-gray-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={m.enabled}
                                  onChange={e => {
                                    setInstalledMods(prev =>
                                      prev.map(x => (x.id === m.id ? { ...x, enabled: e.target.checked } : x))
                                    );
                                  }}
                                  className="accent-[#5dbb45]"
                                />
                                ON
                              </label>
                              <button
                                onClick={() => {
                                  playClickSfx();
                                  setInstalledMods(prev => prev.filter(x => x.id !== m.id));
                                  showToast(`Removed ${m.name}`);
                                }}
                                className="text-red-400 hover:text-red-300 p-1"
                                title="Remove mod"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {installedMods.length === 0 && (
                          <div className="py-6 text-center text-xs text-gray-500">
                            No mods loaded yet. Upload a .js mod or get the sample mod.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded text-[11px] text-amber-200/80 leading-relaxed">
                      Only load mods from trusted sources. EaglerForge mods run in your client browser tab.
                    </div>
                  </div>
                </div>

                {/* Step 3: Modded Client Builder */}
                <div className="bg-[#292929] border border-white/10 rounded p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#16833b] text-white font-black text-xs flex items-center justify-center">
                      3
                    </span>
                    <h2 className="text-sm font-bold text-white">Build Standalone Modded HTML Client</h2>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Select your injected EaglerForge HTML client file. The launcher will automatically bundle your enabled
                    mods into the client's options and trigger a download of your ready-to-play offline build!
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block text-xs text-gray-300 font-semibold mb-1">
                        Select Injected Offline Client (.html)
                      </label>
                      <input
                        type="file"
                        accept=".html,.htm"
                        onChange={e => setModClientFile(e.target.files ? e.target.files[0] : null)}
                        className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handleBuildModdedClient}
                        disabled={modBuilding}
                        className="w-full py-2.5 bg-[#16833b] hover:bg-[#199747] disabled:opacity-50 text-white text-xs font-bold rounded shadow transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        {modBuilding ? 'Building Package...' : 'Build Modded Client'}
                      </button>
                      <div className="text-[11px] text-gray-400 truncate">{modStatusMsg}</div>
                    </div>
                  </div>
                </div>

                {/* Saved Links Library */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white">Saved Links &amp; Bookmarks</h2>
                      <p className="text-xs text-gray-400">Keep handy links to servers, resource packs, and forums.</p>
                    </div>
                    <span className="text-xs text-gray-400">{links.length} saved</span>
                  </div>

                  {/* Add Link Form */}
                  <form onSubmit={handleAddLink} className="bg-[#292929] border border-white/10 rounded p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="Title (e.g. PvP Server)"
                      value={newLinkName}
                      onChange={e => setNewLinkName(e.target.value)}
                      className="bg-[#1e2227] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5eaa43]"
                      required
                    />
                    <select
                      value={newLinkType}
                      onChange={e => setNewLinkType(e.target.value as SavedLink['type'])}
                      className="bg-[#1e2227] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5eaa43]"
                    >
                      <option value="Mod">Mod</option>
                      <option value="Resource pack">Resource pack</option>
                      <option value="Server">Server</option>
                      <option value="Addon">Addon</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newLinkUrl}
                      onChange={e => setNewLinkUrl(e.target.value)}
                      className="bg-[#1e2227] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5eaa43]"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-[#16833b] hover:bg-[#199747] text-white text-xs font-bold rounded py-2 transition-colors cursor-pointer"
                    >
                      + Save Link
                    </button>
                  </form>

                  {/* Links Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {links.map(l => (
                      <div key={l.id} className="bg-[#292929] border border-white/10 rounded p-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-[#82d95c]">{l.type}</span>
                            <button
                              onClick={() => {
                                playClickSfx();
                                setLinks(prev => prev.filter(x => x.id !== l.id));
                                showToast('Link removed.');
                              }}
                              className="text-gray-500 hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="text-xs font-bold text-white mt-1">{l.name}</div>
                          <div className="text-[11px] text-gray-400 truncate mt-0.5">{l.url}</div>
                        </div>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 text-xs text-[#82d95c] hover:underline font-semibold flex items-center gap-1"
                        >
                          Visit Website <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SKINS */}
            {activeTab === 'skins' && (
              <div className="p-6 md:p-8 max-w-4xl space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Character &amp; Skins</h1>
                  <p className="text-xs text-gray-400 mt-1">
                    Customize your local player persona. Browser clients manage in-game skins via their respective pause
                    menus and local storage.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Character Preview */}
                  <div className="bg-[#292929] border border-white/10 rounded overflow-hidden">
                    <div className="p-4 bg-[#23272d] border-b border-white/10 flex items-center justify-between">
                      <h2 className="text-xs font-bold text-white uppercase tracking-wider">Pixel Preview</h2>
                      <span className="text-[10px] text-[#82d95c] font-bold">LOCAL AVATAR</span>
                    </div>
                    <div className="h-64 bg-gradient-to-b from-[#252f36] to-[#1c2429] flex items-center justify-center relative overflow-hidden">
                      <div className="pixel-person">
                        <div
                          className="pixel-head"
                          style={{
                            boxShadow:
                              profile.skinType === 'alex'
                                ? 'inset 0 12px #c9622d'
                                : profile.skinType === 'diamond'
                                ? 'inset 0 12px #4ac9c0'
                                : undefined
                          }}
                        />
                        <div
                          className="pixel-body"
                          style={{
                            backgroundColor:
                              profile.skinType === 'alex'
                                ? '#5b8941'
                                : profile.skinType === 'diamond'
                                ? '#4ac9c0'
                                : profile.skinType === 'netherite'
                                ? '#3c383f'
                                : profile.skinType === 'ender'
                                ? '#141414'
                                : '#36a3a9'
                          }}
                        />
                        <div className="pixel-arm" />
                        <div
                          className="pixel-leg"
                          style={{
                            backgroundColor:
                              profile.skinType === 'diamond'
                                ? '#2a8b83'
                                : profile.skinType === 'netherite'
                                ? '#222026'
                                : '#3d546d'
                          }}
                        />
                      </div>
                    </div>
                    <div className="p-4 text-xs text-gray-400">
                      Standard classic Steve/Alex geometry. Most Eaglercraft clients also allow custom skin PNG uploads in
                      the in-game options screen.
                    </div>
                  </div>

                  {/* Profile Settings */}
                  <div className="bg-[#292929] border border-white/10 rounded p-5 space-y-4">
                    <h2 className="text-sm font-bold text-white">Player Details</h2>

                    <div>
                      <label className="block text-xs text-gray-300 font-semibold mb-1">Display Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={e => setProfile(p => ({ ...p, name: e.target.value.slice(0, 16) }))}
                        maxLength={16}
                        placeholder="Player"
                        className="w-full bg-[#1e2227] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5eaa43]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-300 font-semibold mb-1">Avatar Symbol</label>
                      <select
                        value={profile.avatar}
                        onChange={e => setProfile(p => ({ ...p, avatar: e.target.value }))}
                        className="w-full bg-[#1e2227] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5eaa43]"
                      >
                        <option value="☺">☺ Classic Smile</option>
                        <option value="⛏">⛏ Miner</option>
                        <option value="🧱">🧱 Block</option>
                        <option value="⚔">⚔ Adventurer</option>
                        <option value="◇">◇ Diamond</option>
                        <option value="★">★ Star</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-300 font-semibold mb-1">Preset Palette</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['steve', 'alex', 'diamond', 'netherite', 'ender'] as const).map(skin => (
                          <button
                            key={skin}
                            type="button"
                            onClick={() => {
                              playClickSfx();
                              setProfile(p => ({ ...p, skinType: skin }));
                            }}
                            className={`py-1.5 px-2 text-xs rounded uppercase font-bold border transition-colors cursor-pointer ${
                              profile.skinType === skin
                                ? 'bg-[#16833b] text-white border-[#5dbb45]'
                                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            {skin}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        playClickSfx();
                        showToast('Profile saved!');
                      }}
                      className="w-full py-2 bg-[#16833b] hover:bg-[#199747] text-white font-bold text-xs rounded transition-colors cursor-pointer"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: REALMS */}
            {activeTab === 'realms' && (
              <div className="p-6 md:p-8 max-w-4xl space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Minecraft Realms</h1>
                  <p className="text-xs text-gray-400 mt-1">
                    Information regarding private multiplayer servers and Realms subscriptions.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#2a3a2d] to-[#20252b] border border-white/10 rounded p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <div className="text-[10px] font-bold text-[#82d95c] tracking-widest uppercase">
                      PRIVATE WORLDS WITH FRIENDS
                    </div>
                    <h2 className="text-2xl font-black text-white mt-1">Play Together on Realms</h2>
                    <p className="text-xs text-gray-300 mt-2 max-w-xl leading-relaxed">
                      Minecraft Realms is Mojang's official subscription service for persistent online worlds. Community
                      browser clients run on custom WebSockets rather than official Microsoft Realm servers. For official
                      Realms, use the native Minecraft Launcher and Microsoft login.
                    </p>
                    <div className="flex gap-3 mt-4">
                      <a
                        href="https://www.minecraft.net/realms"
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-[#16833b] hover:bg-[#199747] text-white text-xs font-bold rounded flex items-center gap-1.5"
                      >
                        Official Realms Info ↗
                      </a>
                      <a
                        href="https://help.minecraft.net/"
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded flex items-center gap-1.5"
                      >
                        Help Center ↗
                      </a>
                    </div>
                  </div>
                  <div className="w-20 h-20 rounded bg-emerald-900/50 border-2 border-emerald-500/40 flex items-center justify-center text-4xl shadow-lg">
                    🌐
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#292929] border border-white/10 rounded p-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Official Realms</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Requires official Microsoft Account sign-in on Windows, Mac, Linux, or Bedrock devices.
                    </p>
                  </div>
                  <div className="bg-[#292929] border border-white/10 rounded p-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Browser Multiplayer</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Community clients connect through Eaglercraft WebSocket relays and custom bungeecord servers.
                    </p>
                  </div>
                  <div className="bg-[#292929] border border-white/10 rounded p-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Safety Notice</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Never enter your Microsoft account credentials or passwords into third-party web clients.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: NEWS */}
            {activeTab === 'news' && (
              <div className="p-6 md:p-8 max-w-4xl space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">News &amp; Patch Notes</h1>
                  <p className="text-xs text-gray-400 mt-1">Official release notes and launcher changelog.</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#292929] border border-white/10 rounded p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#82d95c]">Browser Edition 7.0 Release</span>
                      <span className="text-[10px] text-gray-500">October 2026</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">Complete Launcher Overhaul</h3>
                    <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside">
                      <li>Added 7 instant browser client profiles (Eaglercraft 26.3, GX 26.2, 1.21.11, 1.8.8, etc.)</li>
                      <li>Interactive EaglerForge mod tools with client mod injection and demo generator</li>
                      <li>Custom installation shortcut manager with edit, delete, and duplicate presets</li>
                      <li>Dark / Light theme switcher with custom Minecraft accent color picker</li>
                      <li>Web Audio API sound effects for tactile launcher feedback</li>
                    </ul>
                  </div>

                  <div className="bg-[#292929] border border-white/10 rounded p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-400">Game Update Highlights</span>
                      <span className="text-[10px] text-gray-500">Minecraft Official</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">Chamber Trials &amp; Modern Mechanics</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Check out the official updates hub to read about the Crafter, Mace weapon mechanics, Armadillos, wolf
                      armor, and copper grates.
                    </p>
                    <a
                      href="https://www.minecraft.net/en-us/updates"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-sky-400 hover:underline font-semibold"
                    >
                      Read official update logs ↗
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="p-6 md:p-8 max-w-4xl space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Launcher Settings</h1>
                  <p className="text-xs text-gray-400 mt-1">Configure appearance, launch behavior, and sound.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                  {/* Settings Nav */}
                  <div className="space-y-1 bg-[#252525] border border-white/10 rounded p-2">
                    {[
                      { id: 'general', label: 'General' },
                      { id: 'appearance', label: 'Appearance' },
                      { id: 'audio', label: 'Audio & SFX' },
                      { id: 'privacy', label: 'Privacy & Data' },
                      { id: 'about', label: 'About' }
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          playClickSfx();
                          setSettingsSection(s.id as typeof settingsSection);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded font-semibold transition-colors ${
                          settingsSection === s.id
                            ? 'bg-[#303030] text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {/* Settings Content Panel */}
                  <div className="md:col-span-3 bg-[#292929] border border-white/10 rounded p-6 space-y-6">
                    {settingsSection === 'general' && (
                      <div className="space-y-4">
                        <h2 className="text-sm font-bold text-white border-b border-white/10 pb-2">Launch Behavior</h2>

                        <label className="flex items-center justify-between text-xs text-gray-300 py-2 cursor-pointer">
                          <div>
                            <div className="font-semibold text-white">Open client in a new tab</div>
                            <div className="text-gray-400 text-[11px]">Recommended so the launcher remains open in your browser</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={prefs.newTab}
                            onChange={e => setPrefs(p => ({ ...p, newTab: e.target.checked }))}
                            className="w-4 h-4 accent-[#5dbb45]"
                          />
                        </label>

                        <label className="flex items-center justify-between text-xs text-gray-300 py-2 border-t border-white/5 cursor-pointer">
                          <div>
                            <div className="font-semibold text-white">Show quick launch cards</div>
                            <div className="text-gray-400 text-[11px]">Displays shortcuts below the trailer banner on the Play tab</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={prefs.recent}
                            onChange={e => setPrefs(p => ({ ...p, recent: e.target.checked }))}
                            className="w-4 h-4 accent-[#5dbb45]"
                          />
                        </label>

                        <label className="flex items-center justify-between text-xs text-gray-300 py-2 border-t border-white/5 cursor-pointer">
                          <div>
                            <div className="font-semibold text-white">Confirmation prompt before launch</div>
                            <div className="text-gray-400 text-[11px]">Ask for confirmation before launching any game link</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={prefs.confirm}
                            onChange={e => setPrefs(p => ({ ...p, confirm: e.target.checked }))}
                            className="w-4 h-4 accent-[#5dbb45]"
                          />
                        </label>
                      </div>
                    )}

                    {settingsSection === 'appearance' && (
                      <div className="space-y-4">
                        <h2 className="text-sm font-bold text-white border-b border-white/10 pb-2">Theme &amp; Accent</h2>

                        <div className="flex items-center justify-between py-2">
                          <div>
                            <div className="text-xs font-semibold text-white">Launcher Color Theme</div>
                            <div className="text-gray-400 text-[11px]">Switch between dark and light mode</div>
                          </div>
                          <select
                            value={prefs.theme}
                            onChange={e => setPrefs(p => ({ ...p, theme: e.target.value as 'dark' | 'light' }))}
                            className="bg-[#1e2227] border border-white/10 text-xs text-white rounded p-2"
                          >
                            <option value="dark">Dark Theme</option>
                            <option value="light">Light Theme</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between py-2 border-t border-white/5">
                          <div>
                            <div className="text-xs font-semibold text-white">Accent Highlight Color</div>
                            <div className="text-gray-400 text-[11px]">Default is classic launcher grass green</div>
                          </div>
                          <input
                            type="color"
                            value={prefs.accent}
                            onChange={e => setPrefs(p => ({ ...p, accent: e.target.value }))}
                            className="w-9 h-8 bg-transparent cursor-pointer rounded border border-white/20"
                          />
                        </div>
                      </div>
                    )}

                    {settingsSection === 'audio' && (
                      <div className="space-y-4">
                        <h2 className="text-sm font-bold text-white border-b border-white/10 pb-2">Audio Effects</h2>
                        <label className="flex items-center justify-between text-xs text-gray-300 py-2 cursor-pointer">
                          <div>
                            <div className="font-semibold text-white">UI Sound Effects</div>
                            <div className="text-gray-400 text-[11px]">Play subtle Minecraft click feedback on buttons</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={prefs.soundEffects}
                            onChange={e => setPrefs(p => ({ ...p, soundEffects: e.target.checked }))}
                            className="w-4 h-4 accent-[#5dbb45]"
                          />
                        </label>
                      </div>
                    )}

                    {settingsSection === 'privacy' && (
                      <div className="space-y-4">
                        <h2 className="text-sm font-bold text-white border-b border-white/10 pb-2">Storage &amp; Data</h2>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          All installations, profiles, bookmarks, and mod library scripts are saved locally in your
                          browser's localStorage. No private account credentials or telemetry are transmitted.
                        </p>
                        <button
                          onClick={() => {
                            if (window.confirm('Reset all saved launcher data, custom installations, and preferences?')) {
                              localStorage.removeItem(STORAGE_KEY);
                              setProfile(DEFAULT_STATE.profile);
                              setInstallations(DEFAULT_STATE.installations);
                              setLinks(DEFAULT_STATE.links);
                              setInstalledMods(DEFAULT_STATE.installedMods);
                              setPrefs(DEFAULT_STATE.prefs);
                              setSelectedId(DEFAULT_STATE.selected);
                              showToast('Reset launcher data to defaults.');
                            }
                          }}
                          className="px-4 py-2 bg-red-900/60 hover:bg-red-800 text-red-100 text-xs font-bold rounded"
                        >
                          Clear Saved Local Data
                        </button>
                      </div>
                    )}

                    {settingsSection === 'about' && (
                      <div className="space-y-3">
                        <h2 className="text-sm font-bold text-white border-b border-white/10 pb-2">About</h2>
                        <div className="text-xs font-bold text-white">Minecraft Launcher — Browser Edition v7.0</div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          A high-fidelity fan-made web interface replicating the desktop launcher experience for community
                          browser ports and EaglerForge mod integration. Not affiliated with Mojang Studios or Microsoft.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Bottom Statusbar */}
          <footer className="h-6 bg-[#161616] border-t border-[#090909] px-4 flex items-center justify-between text-[10px] text-gray-400 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5dba44]" />
              <span>Launcher ready</span>
              <span>•</span>
              <span>Browser edition</span>
            </div>
            <div className="font-mono text-[9px] text-gray-500">MINECRAFT LAUNCHER v7.0</div>
          </footer>
        </div>
      </div>
    </div>
  );
}
