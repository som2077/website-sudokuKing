"use client";

import { useState, useEffect } from "react";
import { useVersusStore } from "@/store/useVersusStore";
import { Difficulty } from "@/lib/sudokuEngine";
import {
  Swords,
  Users,
  Bot,
  Zap,
  Copy,
  Check,
  Share2,
  Play,
  Sparkles,
  Edit2,
} from "lucide-react";
import {
  getCountryFlag,
  getPlayerProfile,
  savePlayerProfile,
  PlayerProfile,
} from "@/lib/leaderboardService";
import { soundEffects } from "@/lib/soundEffects";
import { analytics } from "@/lib/analytics";

const DEFAULT_LOBBY_PROFILE: PlayerProfile = {
  username: "SudokuPlayer",
  countryCode: "US",
  countryName: "United States",
  avatarSeed: "player",
};

export function VersusLobby() {
  const {
    roomCode,
    me,
    opponent,
    isHost,
    initRoom,
    toggleReady,
    difficulty,
  } = useVersusStore();

  const [activeTab, setActiveTab] = useState<"friend" | "bot" | "quick">(
    "friend",
  );
  const [friendSubTab, setFriendSubTab] = useState<"create" | "join">("create");
  const [inputCode, setInputCode] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("Medium");
  const [copied, setCopied] = useState(false);

  // Profile quick-editing with safe SSR initial state
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_LOBBY_PROFILE);
  const [editingProfile, setEditingProfile] = useState(false);
  const [newName, setNewName] = useState(DEFAULT_LOBBY_PROFILE.username);

  useEffect(() => {
    const p = getPlayerProfile();
    setProfile(p);
    setNewName(p.username);
  }, []);

  // Random room code generator
  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "SK-";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateRoom = () => {
    soundEffects.playClick();
    const code = generateCode();
    analytics.trackVersus("create_room", {
      mode: "friend",
      difficulty: selectedDifficulty,
    });
    initRoom({
      roomCode: code,
      mode: "friend",
      isHost: true,
      difficulty: selectedDifficulty,
    });
  };

  const handleJoinRoom = () => {
    if (!inputCode.trim()) return;
    soundEffects.playClick();
    let formatted = inputCode.trim().toUpperCase();
    if (
      !formatted.startsWith("SK-") &&
      !formatted.startsWith("BOT-") &&
      !formatted.startsWith("QM-")
    ) {
      if (formatted.startsWith("SK")) {
        formatted = "SK-" + formatted.substring(2).replace(/^-+/, "");
      } else {
        formatted = "SK-" + formatted;
      }
    }

    analytics.trackVersus("join_room", {
      roomCode: formatted,
    });

    initRoom({
      roomCode: formatted,
      mode: "friend",
      isHost: false,
      difficulty: "Medium",
    });
  };

  const handleStartBot = (botDiff: "Easy" | "Medium" | "Hard") => {
    soundEffects.playClick();
    const code = `BOT-${Date.now().toString(36).substring(3, 7).toUpperCase()}`;
    analytics.trackVersus("create_room", {
      mode: "bot",
      botDifficulty: botDiff,
    });
    initRoom({
      roomCode: code,
      mode: "bot",
      isHost: true,
      difficulty: botDiff,
      botDifficulty: botDiff,
    });
  };

  const handleQuickMatch = () => {
    soundEffects.playClick();
    const poolCode = `QM-${Math.floor(Math.random() * 5 + 1)}`;
    analytics.trackVersus("create_room", {
      mode: "quick",
      difficulty: selectedDifficulty,
    });
    initRoom({
      roomCode: poolCode,
      mode: "quick",
      isHost: true,
      difficulty: selectedDifficulty,
    });
  };

  const copyInviteLink = () => {
    if (typeof window === "undefined" || !roomCode) return;
    soundEffects.playClick();
    const url = `${window.location.origin}/versus?room=${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inRoom = roomCode.length > 0;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8">
      {/* Title & Badge - Apple Display Typography */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 text-[11px] font-bold mb-3 shadow-2xs">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Real-time Multiplayer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-[-0.03em] flex items-center justify-center gap-2.5">
          <Swords className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500" />
          <span>1 vs 1 Sudoku Duel</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          Race head-to-head on the exact same board in real-time. First solver to complete all 81 cells wins!
        </p>
      </div>

      {inRoom ? (
        /* Room Waiting Card - Apple AirDrop / Wallet Card Style */
        <div className="bg-white/90 backdrop-blur-xl border border-black/[0.08] rounded-[32px] p-6 sm:p-8 shadow-[0_16px_50px_rgb(0,0,0,0.06)]">
          <div className="flex flex-col items-center text-center">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Active Room
            </span>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-3xl sm:text-4xl font-black text-indigo-600 tracking-wider">
                {roomCode}
              </span>
              <button
                onClick={copyInviteLink}
                className="p-2 rounded-2xl bg-black/[0.04] hover:bg-black/[0.08] active:scale-95 text-slate-700 transition-all cursor-pointer"
                title="Copy Invite Link"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Apple Share Sheet Pill Buttons */}
            <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
              <button
                onClick={copyInviteLink}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 font-semibold text-xs hover:bg-indigo-100/80 active:scale-95 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? "Link Copied!" : "Copy Invite Link"}</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `⚔️ Challenge me in a 1 vs 1 Sudoku Duel on Sudoku King! Click to join: ${
                    typeof window !== "undefined"
                      ? `${window.location.origin}/versus?room=${roomCode}`
                      : ""
                  }`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-300/70 text-emerald-700 font-semibold text-xs hover:bg-emerald-100/80 active:scale-95 transition-all cursor-pointer"
              >
                <span>💬 WhatsApp Invite</span>
              </a>
            </div>

            {/* Room Difficulty Settings */}
            <div className="w-full mb-6 p-3 rounded-2xl bg-slate-50 border border-black/[0.05] text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Match Difficulty
                </span>
                <span className="text-xs font-black text-indigo-600">
                  {difficulty}
                </span>
              </div>
              {isHost ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        soundEffects.playClick();
                        useVersusStore.getState().setDifficulty(d);
                      }}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                        difficulty === d
                          ? "bg-slate-950 text-white shadow-xs"
                          : "bg-white border border-black/[0.06] text-slate-700 hover:bg-slate-100/80"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Set by room host ({difficulty})
                </p>
              )}
            </div>

            {/* Players Status Cards */}
            <div className="w-full grid grid-cols-2 gap-3 sm:gap-4 p-4 rounded-2xl bg-slate-50 border border-black/[0.05] mb-6">
              {/* You */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-base flex items-center justify-center mb-2 shadow-[0_4px_12px_rgba(79,70,229,0.25)]">
                  {me.username.substring(0, 2).toUpperCase()}
                </div>
                <span className="font-bold text-slate-900 text-xs truncate max-w-[120px]">
                  {me.username} (You)
                </span>
                <span className="text-[10px] text-slate-500 mb-2">
                  {getCountryFlag(me.countryCode)} {isHost ? "Host" : "Guest"}
                </span>
                <span
                  className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${
                    me.isReady
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {me.isReady ? "Ready ✓" : "Not Ready"}
                </span>
              </div>

              {/* Opponent */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-2xl font-black text-base flex items-center justify-center mb-2 shadow-xs ${
                    opponent
                      ? "bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-[0_4px_12px_rgba(244,63,94,0.25)]"
                      : "bg-slate-200 text-slate-400 border border-dashed border-slate-300 animate-pulse"
                  }`}
                >
                  {opponent
                    ? opponent.username.substring(0, 2).toUpperCase()
                    : "?"}
                </div>
                <span className="font-bold text-slate-900 text-xs truncate max-w-[120px]">
                  {opponent ? opponent.username : "Waiting..."}
                </span>
                <span className="text-[10px] text-slate-500 mb-2">
                  {opponent
                    ? `${getCountryFlag(opponent.countryCode)} Player`
                    : "Share code"}
                </span>
                <span
                  className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${
                    opponent?.isReady
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {opponent?.isReady ? "Ready ✓" : "Not Ready"}
                </span>
              </div>
            </div>

            {/* Apple Action Button: Ready to Play */}
            <button
              onClick={() => {
                soundEffects.playClick();
                toggleReady();
              }}
              className={`w-full py-4 rounded-2xl font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] ${
                me.isReady
                  ? "bg-slate-950 text-white hover:bg-slate-900"
                  : "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:opacity-95 shadow-indigo-600/25"
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{me.isReady ? "Cancel Ready" : "I'm Ready to Play!"}</span>
            </button>
            <p className="text-[11px] text-slate-400 mt-2">
              Match begins automatically as soon as both players tap Ready.
            </p>
          </div>
        </div>
      ) : (
        /* Mode Tabs Card - Apple Glass Surface */
        <div className="bg-white/90 backdrop-blur-xl border border-black/[0.08] rounded-[32px] p-5 sm:p-8 shadow-[0_16px_50px_rgb(0,0,0,0.06)]">
          {/* Profile preview & quick-edit pill */}
          <div
            suppressHydrationWarning
            className="mb-6 p-3 bg-slate-50 border border-black/[0.05] rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5" suppressHydrationWarning>
              <span className="text-2xl" suppressHydrationWarning>
                {getCountryFlag(profile.countryCode)}
              </span>
              {editingProfile ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-2.5 py-1 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  maxLength={16}
                  autoFocus
                />
              ) : (
                <div suppressHydrationWarning>
                  <span
                    suppressHydrationWarning
                    className="text-xs font-extrabold text-slate-900 block leading-tight"
                  >
                    {profile.username}
                  </span>
                  <span
                    suppressHydrationWarning
                    className="text-[10px] text-slate-500"
                  >
                    Playing as • {profile.countryName}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (editingProfile) {
                  if (newName.trim()) {
                    const updated = { ...profile, username: newName.trim() };
                    savePlayerProfile(updated);
                    setProfile(updated);
                  }
                  setEditingProfile(false);
                } else {
                  setEditingProfile(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/[0.08] hover:bg-slate-50 text-[11px] font-semibold text-slate-700 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <Edit2 className="w-3 h-3 text-slate-500" />
              <span>{editingProfile ? "Done" : "Edit Name"}</span>
            </button>
          </div>

          {/* Apple Segmented Control: With Friend / vs AI Bot / Quick Match */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/90 rounded-2xl mb-6 border border-black/[0.04]">
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab("friend");
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-[0.98] ${
                activeTab === "friend"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>With Friend</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab("bot");
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-[0.98] ${
                activeTab === "bot"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-purple-600" />
              <span>vs AI Bot</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab("quick");
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-[0.98] ${
                activeTab === "quick"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Match</span>
            </button>
          </div>

          {/* TAB 1: With Friend */}
          {activeTab === "friend" && (
            <div>
              {/* Apple Sub-segmented Switcher */}
              <div className="flex border-b border-black/[0.06] mb-6">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setFriendSubTab("create");
                  }}
                  className={`flex-1 pb-3 font-bold text-xs sm:text-sm border-b-2 cursor-pointer transition-colors ${
                    friendSubTab === "create"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Create Room
                </button>
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setFriendSubTab("join");
                  }}
                  className={`flex-1 pb-3 font-bold text-xs sm:text-sm border-b-2 cursor-pointer transition-colors ${
                    friendSubTab === "join"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Join Room
                </button>
              </div>

              {friendSubTab === "create" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Match Difficulty
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
                        <button
                          key={d}
                          onClick={() => {
                            soundEffects.playClick();
                            setSelectedDifficulty(d);
                          }}
                          className={`py-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                            selectedDifficulty === d
                              ? "bg-indigo-50/90 border-indigo-600 text-indigo-700 ring-1 ring-indigo-600"
                              : "bg-white border-black/[0.08] text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleCreateRoom}
                    className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-extrabold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(79,70,229,0.25)] cursor-pointer"
                  >
                    Create Private Room
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Enter 6-Character Room Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SK-4921"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl border border-black/[0.08] font-mono text-center text-lg font-black uppercase text-slate-900 tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                      maxLength={8}
                    />
                  </div>

                  <button
                    onClick={handleJoinRoom}
                    disabled={!inputCode.trim()}
                    className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-extrabold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(79,70,229,0.25)] disabled:opacity-40 cursor-pointer"
                  >
                    Join Room
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: vs AI Bot */}
          {activeTab === "bot" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                Duel immediately against an autonomous AI Bot solver. Instant start, zero wait.
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    diff: "Easy",
                    desc: "Casual solve pace, great for warming up",
                  },
                  {
                    diff: "Medium",
                    desc: "Balanced solver speed, intense human-like duel",
                  },
                  {
                    diff: "Hard",
                    desc: "Master speed solver, zero hesitation race!",
                  },
                ].map(({ diff, desc }) => (
                  <button
                    key={diff}
                    onClick={() =>
                      handleStartBot(diff as "Easy" | "Medium" | "Hard")
                    }
                    className="p-4 rounded-2xl border border-black/[0.06] hover:border-purple-300 hover:bg-purple-50/40 active:scale-[0.98] transition-all flex items-center justify-between text-left cursor-pointer group shadow-2xs bg-white"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm group-hover:text-purple-700">
                          {diff} Bot
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          Instant
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 mt-0.5 block">
                        {desc}
                      </span>
                    </div>
                    <Play className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Quick Match */}
          {activeTab === "quick" && (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-2">
                <Zap className="w-7 h-7 fill-current" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Instant Matchmaking
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Automatically connects you with an active player or an available solver in seconds.
              </p>

              <div className="max-w-xs mx-auto mb-3">
                <div className="grid grid-cols-3 gap-1.5">
                  {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        soundEffects.playClick();
                        setSelectedDifficulty(d);
                      }}
                      className={`py-2 rounded-xl border text-xs font-semibold cursor-pointer active:scale-95 transition-all ${
                        selectedDifficulty === d
                          ? "bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500"
                          : "bg-white border-black/[0.08] text-slate-700"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleQuickMatch}
                className="w-full py-4 rounded-2xl bg-slate-950 text-white font-extrabold text-sm hover:bg-slate-900 active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(0,0,0,0.15)] cursor-pointer"
              >
                Find Match Now
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
