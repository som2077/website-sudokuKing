import { create } from "zustand";
import { Board, Difficulty, generatePuzzle } from "@/lib/sudokuEngine";
import {
  VersusPlayer,
  VersusMatchStatus,
  VersusBroadcastEvent,
} from "@/lib/versus/types";
import { BotGameSimulator, createBotPlayer } from "@/lib/versus/botSimulator";
import { VersusRealtimeManager } from "@/lib/versus/versusRealtimeService";
import { getPlayerProfile } from "@/lib/leaderboardService";
import { soundEffects } from "@/lib/soundEffects";
import { recordVersusResult } from "@/lib/gameStats";

export interface VersusBoardSnapshot {
  board: Board;
  notes: Record<number, number[]>;
}

export const ACTIVE_VERSUS_KEY = "sudoku_king_active_versus_v1";

export interface SavedVersusCache {
  roomCode: string;
  mode: "friend" | "quick" | "bot";
  status: VersusMatchStatus;
  difficulty: Difficulty;
  puzzleSeed: string;
  isHost: boolean;
  me: VersusPlayer;
  opponent: VersusPlayer | null;
  board: Board;
  initialBoard: Board;
  solution: Board;
  notes: Record<number, number[]>;
  mistakes: number;
  elapsedSeconds: number;
  mySeriesScore: number;
  opponentSeriesScore: number;
  botDifficulty?: "Easy" | "Medium" | "Hard";
}

export const saveActiveVersus = (state: VersusState) => {
  if (typeof window === "undefined") return;
  if (state.status === "finished") {
    clearActiveVersus();
    return;
  }
  if (state.status === "lobby" && !state.roomCode) {
    clearActiveVersus();
    return;
  }

  try {
    const cache: SavedVersusCache = {
      roomCode: state.roomCode,
      mode: state.mode,
      status: state.status,
      difficulty: state.difficulty,
      puzzleSeed: state.puzzleSeed,
      isHost: state.isHost,
      me: state.me,
      opponent: state.opponent,
      board: state.board,
      initialBoard: state.initialBoard,
      solution: state.solution,
      notes: state.notes,
      mistakes: state.mistakes,
      elapsedSeconds: state.elapsedSeconds,
      mySeriesScore: state.mySeriesScore,
      opponentSeriesScore: state.opponentSeriesScore,
      botDifficulty: state.opponent?.botDifficulty,
    };
    localStorage.setItem(ACTIVE_VERSUS_KEY, JSON.stringify(cache));
  } catch {}
};

export const clearActiveVersus = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACTIVE_VERSUS_KEY);
  } catch {}
};

interface VersusState {
  // Connection & Room
  roomCode: string;
  mode: "friend" | "quick" | "bot";
  status: VersusMatchStatus;
  difficulty: Difficulty;
  puzzleSeed: string;
  isHost: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected";

  // Players
  me: VersusPlayer;
  opponent: VersusPlayer | null;
  winner: VersusPlayer | null;
  finishReason: "completion" | "knockout" | "forfeit" | null;
  mySeriesScore: number;
  opponentSeriesScore: number;
  rematchRequestedByMe: boolean;
  rematchRequestedByOpponent: boolean;

  // Countdown & Timer
  countdown: number;
  matchStartTime: number | null;
  elapsedSeconds: number;

  // Board & Input
  board: Board;
  initialBoard: Board;
  solution: Board;
  notes: Record<number, number[]>;
  selectedCell: number | null;
  notesMode: boolean;
  mistakes: number;
  maxMistakes: number;
  errorCells: number[];
  history: VersusBoardSnapshot[];

  // Realtime & Bot managers
  realtimeManager: VersusRealtimeManager | null;
  botSimulator: BotGameSimulator | null;
  lastOpponentCellIndex: number | null;

  // Actions
  initRoom: (params: {
    roomCode: string;
    mode: "friend" | "quick" | "bot";
    isHost: boolean;
    difficulty: Difficulty;
    botDifficulty?: "Easy" | "Medium" | "Hard";
  }) => void;
  setDifficulty: (diff: Difficulty) => void;
  setOpponent: (opponent: VersusPlayer) => void;
  toggleReady: () => void;
  startCountdown: (seed?: string) => void;
  selectCell: (index: number | null) => void;
  inputDigit: (num: number) => void;
  erase: () => void;
  undo: () => void;
  toggleNotesMode: () => void;
  tickTimer: () => void;
  forfeit: () => void;
  finishMatch: (
    winner: VersusPlayer | null,
    reason?: "completion" | "knockout" | "forfeit",
  ) => void;
  requestRematch: () => void;
  acceptRematch: () => void;
  leaveRoom: () => void;
  restoreSavedVersus: () => boolean;

  // Remote event handlers
  handleRemoteEvent: (event: VersusBroadcastEvent) => void;
  onOpponentProgress: (
    progress: number,
    mistakes: number,
    lastCellIndex?: number,
  ) => void;
  onOpponentFinish: (timeSeconds: number, mistakes: number) => void;
}

export const useVersusStore = create<VersusState>((set, get) => ({
  roomCode: "",
  mode: "friend",
  status: "lobby",
  difficulty: "Medium",
  puzzleSeed: "",
  isHost: false,
  connectionStatus: "disconnected",

  me: {
    id: "me",
    username: "Player",
    countryCode: "US",
    countryName: "United States",
    avatarSeed: "player",
    isReady: false,
    isHost: false,
    progress: 0,
    totalGivens: 0,
    mistakes: 0,
  },
  opponent: null,
  winner: null,
  finishReason: null,
  mySeriesScore: 0,
  opponentSeriesScore: 0,
  rematchRequestedByMe: false,
  rematchRequestedByOpponent: false,

  countdown: 3,
  matchStartTime: null,
  elapsedSeconds: 0,

  board: Array(81).fill(0),
  initialBoard: Array(81).fill(0),
  solution: Array(81).fill(0),
  notes: {},
  selectedCell: null,
  notesMode: false,
  mistakes: 0,
  maxMistakes: 3,
  errorCells: [],
  history: [],

  realtimeManager: null,
  botSimulator: null,
  lastOpponentCellIndex: null,

  initRoom: ({
    roomCode,
    mode,
    isHost,
    difficulty,
    botDifficulty = "Medium",
  }) => {
    // Teardown any existing sessions
    get().leaveRoom();

    const profile = getPlayerProfile();
    const myPlayer: VersusPlayer = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      username: profile.username,
      countryCode: profile.countryCode,
      countryName: profile.countryName,
      avatarSeed: profile.avatarSeed,
      isReady: false,
      isHost,
      progress: 0,
      totalGivens: 0,
      mistakes: 0,
    };

    set({
      roomCode,
      mode,
      isHost,
      difficulty,
      status: "lobby",
      me: myPlayer,
      opponent: null,
      winner: null,
      finishReason: null,
      mySeriesScore: 0,
      opponentSeriesScore: 0,
      lastOpponentCellIndex: null,
      rematchRequestedByMe: false,
      rematchRequestedByOpponent: false,
      countdown: 3,
      elapsedSeconds: 0,
      errorCells: [],
      history: [],
      notes: {},
      selectedCell: null,
      mistakes: 0,
    });

    if (mode === "bot") {
      const bot = createBotPlayer(botDifficulty);
      set({ opponent: bot });
      saveActiveVersus(get());
      return;
    }

    // Connect to Supabase Realtime Channel
    const manager = new VersusRealtimeManager(roomCode, myPlayer, {
      onEvent: (event) => get().handleRemoteEvent(event),
      onPeerJoin: (peer) => {
        const state = get();
        if (!state.opponent || state.opponent.id !== peer.id) {
          set({ opponent: peer });
          // If I am host, inform peer about room difficulty
          if (state.isHost) {
            manager.sendEvent({
              type: "player_join",
              player: state.me,
            });
          }
        }
      },
      onPeerLeave: (peerId) => {
        const state = get();
        if (state.opponent?.id === peerId) {
          if (state.status === "playing") {
            // Opponent disconnected mid-game -> You win!
            set({
              status: "finished",
              winner: state.me,
            });
          } else {
            set({ opponent: null });
          }
        }
      },
      onStatusChange: (connStatus) => {
        set({ connectionStatus: connStatus });
      },
    });

    manager.connect();
    set({ realtimeManager: manager });
    saveActiveVersus(get());
  },

  setDifficulty: (diff: Difficulty) => {
    const { isHost, realtimeManager } = get();
    set({ difficulty: diff });
    if (isHost) {
      realtimeManager?.sendEvent({
        type: "difficulty_change",
        difficulty: diff,
      });
    }
  },

  setOpponent: (opponent: VersusPlayer) => {
    set({ opponent });
  },

  toggleReady: () => {
    const { me, realtimeManager, opponent, isHost, mode, difficulty } = get();
    const newReady = !me.isReady;
    const updatedMe = { ...me, isReady: newReady };
    set({ me: updatedMe });

    realtimeManager?.updatePresence({ isReady: newReady });
    realtimeManager?.sendEvent({
      type: "player_ready",
      playerId: me.id,
      isReady: newReady,
    });

    // Check if both ready
    if (mode === "bot" && newReady) {
      get().startCountdown();
    } else if (opponent?.isReady && newReady) {
      if (isHost) {
        const seed = `versus_${get().roomCode}_${Date.now()}`;
        realtimeManager?.sendEvent({
          type: "game_start",
          puzzleSeed: seed,
          difficulty,
          startTime: Date.now() + 3000,
        });
        get().startCountdown(seed);
      }
    }
  },

  startCountdown: (seed?: string) => {
    const { difficulty, roomCode, mode, opponent } = get();
    const chosenSeed = seed || `versus_${roomCode}_${Date.now()}`;

    // Generate puzzle using shared deterministic seed
    const { puzzle, solution } = generatePuzzle(difficulty, chosenSeed);
    const initialIndices = puzzle
      .map((val, idx) => (val !== 0 ? idx : -1))
      .filter((idx) => idx !== -1);
    const remainingIndices = puzzle
      .map((val, idx) => (val === 0 ? idx : -1))
      .filter((idx) => idx !== -1);
    const initialGivens = initialIndices.length;

    set((state) => ({
      status: "countdown",
      countdown: 3,
      puzzleSeed: chosenSeed,
      board: [...puzzle],
      initialBoard: [...puzzle],
      solution: [...solution],
      mistakes: 0,
      notes: {},
      selectedCell: null,
      errorCells: [],
      history: [],
      elapsedSeconds: 0,
      winner: null,
      lastOpponentCellIndex: null,
      me: {
        ...state.me,
        progress: initialGivens,
        totalGivens: initialGivens,
        mistakes: 0,
        solvedIndices: [...initialIndices],
      },
      opponent: state.opponent
        ? {
            ...state.opponent,
            progress: initialGivens,
            totalGivens: initialGivens,
            mistakes: 0,
            solvedIndices: [...initialIndices],
          }
        : null,
    }));

    saveActiveVersus(get());
    soundEffects.playClick();

    const interval = setInterval(() => {
      const current = get().countdown;
      if (current > 1) {
        set({ countdown: current - 1 });
        soundEffects.playClick();
      } else {
        clearInterval(interval);
        set({
          status: "playing",
          countdown: 0,
          matchStartTime: Date.now(),
        });
        saveActiveVersus(get());
        soundEffects.playVictory();

        // If playing with Bot, start bot simulator
        if (mode === "bot" && opponent?.isBot) {
          const botSim = new BotGameSimulator(
            initialGivens,
            opponent.botDifficulty || "Medium",
            remainingIndices,
            (progress, mistakes, cellIndex) =>
              get().onOpponentProgress(progress, mistakes, cellIndex),
            (timeSeconds, mistakes) =>
              get().onOpponentFinish(timeSeconds, mistakes),
          );
          botSim.start();
          set({ botSimulator: botSim });
        }
      }
    }, 1000);
  },

  selectCell: (index: number | null) => {
    set({ selectedCell: index });
  },

  inputDigit: (num: number) => {
    const {
      status,
      selectedCell,
      board,
      initialBoard,
      solution,
      notes,
      notesMode,
      mistakes,
      maxMistakes,
      me,
      realtimeManager,
      history,
    } = get();

    if (
      status !== "playing" ||
      selectedCell === null ||
      initialBoard[selectedCell] !== 0
    ) {
      return;
    }

    // Pencil Notes mode
    if (notesMode) {
      const currentNotes = notes[selectedCell] || [];
      const newNotes = currentNotes.includes(num)
        ? currentNotes.filter((n) => n !== num)
        : [...currentNotes, num].sort();

      set({
        notes: { ...notes, [selectedCell]: newNotes },
      });
      soundEffects.playNote();
      return;
    }

    // Main Value Input
    if (board[selectedCell] === num) return; // Already entered

    // Save undo snapshot
    const newHistory = [...history, { board: [...board], notes: { ...notes } }];

    const isCorrect = solution[selectedCell] === num;

    if (!isCorrect) {
      // Mistake!
      const newMistakes = mistakes + 1;
      soundEffects.playError();

      set((state) => ({
        mistakes: newMistakes,
        errorCells: [
          ...state.errorCells.filter((i) => i !== selectedCell),
          selectedCell,
        ],
        me: { ...state.me, mistakes: newMistakes },
        history: newHistory,
      }));

      realtimeManager?.sendEvent({
        type: "player_progress",
        playerId: me.id,
        progress: me.progress,
        mistakes: newMistakes,
        lastCellIndex: selectedCell,
      });

      // Knockout condition: 3 mistakes
      if (newMistakes >= maxMistakes) {
        get().finishMatch(get().opponent, "knockout");
      } else {
        saveActiveVersus(get());
      }
      return;
    }

    // Correct Move!
    const newBoard = [...board];
    newBoard[selectedCell] = num;

    // Clean up notes in same cell, row, col, box
    const newNotes = { ...notes };
    delete newNotes[selectedCell];

    const currentSolvedCount = newBoard.filter(
      (val, i) => val !== 0 && val === solution[i],
    ).length;
    soundEffects.playNumber(num);

    const currentSolvedIndices = me.solvedIndices || [];
    const newSolvedIndices = currentSolvedIndices.includes(selectedCell)
      ? currentSolvedIndices
      : [...currentSolvedIndices, selectedCell];

    const updatedMe: VersusPlayer = {
      ...me,
      progress: currentSolvedCount,
      mistakes,
      solvedIndices: newSolvedIndices,
    };

    set((state) => ({
      board: newBoard,
      notes: newNotes,
      errorCells: state.errorCells.filter((i) => i !== selectedCell),
      history: newHistory,
      me: updatedMe,
    }));
    saveActiveVersus(get());

    // Broadcast progress to opponent
    realtimeManager?.sendEvent({
      type: "player_progress",
      playerId: me.id,
      progress: currentSolvedCount,
      mistakes,
      lastCellIndex: selectedCell,
    });

    // Check Victory (all 81 cells solved)
    if (currentSolvedCount === 81) {
      const elapsed = get().elapsedSeconds;
      realtimeManager?.sendEvent({
        type: "player_finish",
        playerId: me.id,
        timeSeconds: elapsed,
        mistakes,
      });
      get().finishMatch(updatedMe, "completion");
    }
  },

  erase: () => {
    const { status, selectedCell, initialBoard, board, notes, history } = get();
    if (
      status !== "playing" ||
      selectedCell === null ||
      initialBoard[selectedCell] !== 0
    ) {
      return;
    }

    if (
      board[selectedCell] === 0 &&
      (!notes[selectedCell] || notes[selectedCell].length === 0)
    ) {
      return;
    }

    const newHistory = [...history, { board: [...board], notes: { ...notes } }];
    const newBoard = [...board];
    newBoard[selectedCell] = 0;
    const newNotes = { ...notes };
    delete newNotes[selectedCell];

    set((state) => ({
      board: newBoard,
      notes: newNotes,
      errorCells: state.errorCells.filter((i) => i !== selectedCell),
      history: newHistory,
    }));
    soundEffects.playErase();
    saveActiveVersus(get());
  },

  undo: () => {
    const { status, history } = get();
    if (status !== "playing" || history.length === 0) return;

    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    set({
      board: previous.board,
      notes: previous.notes,
      history: newHistory,
      errorCells: [],
    });
    soundEffects.playClick();
    saveActiveVersus(get());
  },

  toggleNotesMode: () => {
    set((state) => ({ notesMode: !state.notesMode }));
    soundEffects.playClick();
  },

  tickTimer: () => {
    const { status, elapsedSeconds } = get();
    if (status === "playing") {
      const next = elapsedSeconds + 1;
      set({ elapsedSeconds: next });
      if (next % 3 === 0) {
        saveActiveVersus(get());
      }
    }
  },

  finishMatch: (
    winner: VersusPlayer | null,
    reason: "completion" | "knockout" | "forfeit" = "completion",
  ) => {
    const {
      me,
      opponent,
      elapsedSeconds,
      mySeriesScore,
      opponentSeriesScore,
      botSimulator,
    } = get();
    botSimulator?.stop();

    const isMeWinner = winner?.id === me.id;
    if (isMeWinner) {
      soundEffects.playVictory();
      recordVersusResult(true, elapsedSeconds);
      set({
        status: "finished",
        winner: me,
        finishReason: reason,
        mySeriesScore: mySeriesScore + 1,
      });
    } else {
      soundEffects.playError();
      recordVersusResult(false, elapsedSeconds);
      set({
        status: "finished",
        winner: opponent,
        finishReason: reason,
        opponentSeriesScore: opponentSeriesScore + 1,
      });
    }

    // Persist match result to Supabase via API
    if (opponent) {
      fetch("/api/versus/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: get().roomCode,
          difficulty: get().difficulty,
          player1: me,
          player2: opponent,
          winnerId: isMeWinner ? me.id : opponent.id,
          winnerUsername: isMeWinner ? me.username : opponent.username,
          finishReason: reason,
          timeSeconds: elapsedSeconds,
        }),
      }).catch((err) =>
        console.warn("Could not post versus match to server:", err),
      );
    }
  },

  forfeit: () => {
    const { status, me, opponent, realtimeManager } = get();
    if (status !== "playing") return;

    realtimeManager?.sendEvent({
      type: "player_forfeit",
      playerId: me.id,
    });

    set({ me: { ...me, forfeit: true } });
    get().finishMatch(opponent, "forfeit");
  },

  requestRematch: () => {
    const { me, realtimeManager, mode } = get();
    set({ rematchRequestedByMe: true });

    if (mode === "bot") {
      // Bot instantly accepts rematch!
      setTimeout(() => {
        get().startCountdown();
      }, 500);
      return;
    }

    realtimeManager?.sendEvent({
      type: "rematch_request",
      playerId: me.id,
    });

    // If opponent already requested rematch, start!
    if (get().rematchRequestedByOpponent) {
      get().acceptRematch();
    }
  },

  acceptRematch: () => {
    const { roomCode, realtimeManager } = get();
    const newSeed = `versus_${roomCode}_${Date.now()}`;

    realtimeManager?.sendEvent({
      type: "rematch_accept",
      puzzleSeed: newSeed,
    });

    set({
      rematchRequestedByMe: false,
      rematchRequestedByOpponent: false,
    });

    get().startCountdown(newSeed);
  },

  leaveRoom: () => {
    clearActiveVersus();
    const { realtimeManager, botSimulator } = get();
    botSimulator?.stop();
    realtimeManager?.disconnect();
    set({
      realtimeManager: null,
      botSimulator: null,
      status: "lobby",
      opponent: null,
      winner: null,
      roomCode: "",
      connectionStatus: "disconnected",
    });
  },

  restoreSavedVersus: () => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem(ACTIVE_VERSUS_KEY);
      if (!raw) return false;
      const saved: SavedVersusCache = JSON.parse(raw);
      if (!saved || !saved.roomCode) return false;

      if (saved.status === "finished") {
        clearActiveVersus();
        return false;
      }

      if (saved.status === "playing" || saved.status === "countdown") {
        if (Array.isArray(saved.board) && saved.board.length === 81) {
          set({
            roomCode: saved.roomCode,
            mode: saved.mode,
            status: "playing",
            difficulty: saved.difficulty,
            puzzleSeed: saved.puzzleSeed,
            isHost: saved.isHost,
            me: saved.me,
            opponent: saved.opponent,
            board: [...saved.board],
            initialBoard: [...saved.initialBoard],
            solution: [...saved.solution],
            notes: saved.notes || {},
            mistakes: saved.mistakes || 0,
            elapsedSeconds: saved.elapsedSeconds || 0,
            mySeriesScore: saved.mySeriesScore || 0,
            opponentSeriesScore: saved.opponentSeriesScore || 0,
            countdown: 0,
            selectedCell: null,
          });

          if (saved.mode === "bot" && saved.opponent?.isBot) {
            const remainingIndices = saved.board
              .map((val, idx) => (val === 0 ? idx : -1))
              .filter((idx) => idx !== -1);

            const botSim = new BotGameSimulator(
              saved.opponent.progress || saved.me.totalGivens || 30,
              saved.botDifficulty || "Medium",
              remainingIndices,
              (progress, mistakes, cellIndex) =>
                get().onOpponentProgress(progress, mistakes, cellIndex),
              (timeSeconds, mistakes) =>
                get().onOpponentFinish(timeSeconds, mistakes),
              saved.opponent.mistakes || 0,
            );
            botSim.start();
            set({ botSimulator: botSim });
          } else if (saved.mode === "friend" || saved.mode === "quick") {
            const manager = new VersusRealtimeManager(saved.roomCode, saved.me, {
              onEvent: (event) => get().handleRemoteEvent(event),
              onPeerJoin: (peer) => {
                const state = get();
                if (!state.opponent || state.opponent.id !== peer.id) {
                  set({ opponent: peer });
                }
              },
              onPeerLeave: (peerId) => {
                const state = get();
                if (state.opponent?.id === peerId && state.status === "playing") {
                  set({ status: "finished", winner: state.me });
                }
              },
              onStatusChange: (connStatus) => {
                set({ connectionStatus: connStatus });
              },
            });
            manager.connect();
            set({ realtimeManager: manager });
          }
          return true;
        }
      }

      if (saved.status === "lobby") {
        get().initRoom({
          roomCode: saved.roomCode,
          mode: saved.mode,
          isHost: saved.isHost,
          difficulty: saved.difficulty,
          botDifficulty: saved.botDifficulty,
        });
        return true;
      }
    } catch (err) {
      console.warn("Could not restore saved versus session:", err);
    }
    return false;
  },

  handleRemoteEvent: (event: VersusBroadcastEvent) => {
    const state = get();

    switch (event.type) {
      case "player_join":
        if (event.player.id !== state.me.id) {
          set({ opponent: event.player });
        }
        break;

      case "player_ready":
        if (state.opponent && state.opponent.id === event.playerId) {
          set({
            opponent: { ...state.opponent, isReady: event.isReady },
          });
          // If I am ready too, start!
          if (state.me.isReady && event.isReady && state.isHost) {
            const seed = `versus_${state.roomCode}_${Date.now()}`;
            state.realtimeManager?.sendEvent({
              type: "game_start",
              puzzleSeed: seed,
              difficulty: state.difficulty,
              startTime: Date.now() + 3000,
            });
            get().startCountdown(seed);
          }
        }
        break;

      case "difficulty_change":
        set({ difficulty: event.difficulty });
        break;

      case "game_start":
        // Guest receives game_start from host
        if (!state.isHost) {
          set({ difficulty: event.difficulty });
          get().startCountdown(event.puzzleSeed);
        }
        break;

      case "player_progress":
        if (state.opponent && state.opponent.id === event.playerId) {
          get().onOpponentProgress(
            event.progress,
            event.mistakes,
            event.lastCellIndex,
          );
        }
        break;

      case "player_finish":
        if (state.opponent && state.opponent.id === event.playerId) {
          get().onOpponentFinish(event.timeSeconds, event.mistakes);
        }
        break;

      case "player_forfeit":
        if (state.opponent && state.opponent.id === event.playerId) {
          set({
            opponent: { ...state.opponent, forfeit: true },
          });
          get().finishMatch(state.me, "forfeit");
        }
        break;

      case "rematch_request":
        if (state.opponent && state.opponent.id === event.playerId) {
          set({ rematchRequestedByOpponent: true });
          if (state.rematchRequestedByMe) {
            get().acceptRematch();
          }
        }
        break;

      case "rematch_accept":
        set({
          rematchRequestedByMe: false,
          rematchRequestedByOpponent: false,
        });
        get().startCountdown(event.puzzleSeed);
        break;
    }
  },

  onOpponentProgress: (
    progress: number,
    mistakes: number,
    lastCellIndex?: number,
  ) => {
    const { opponent, me } = get();
    if (!opponent) return;

    const currentSolved = opponent.solvedIndices || [];
    const newSolved =
      lastCellIndex !== undefined && !currentSolved.includes(lastCellIndex)
        ? [...currentSolved, lastCellIndex]
        : currentSolved;

    // Knockout if opponent got 3 mistakes
    if (mistakes >= 3) {
      set({
        lastOpponentCellIndex: lastCellIndex ?? null,
        opponent: { ...opponent, progress, mistakes, solvedIndices: newSolved },
      });
      get().finishMatch(me, "knockout");
      return;
    }

    set({
      lastOpponentCellIndex: lastCellIndex ?? null,
      opponent: {
        ...opponent,
        progress,
        mistakes,
        solvedIndices: newSolved,
      },
    });
  },

  onOpponentFinish: (timeSeconds: number, mistakes: number) => {
    const { opponent, status } = get();
    if (!opponent || status !== "playing") return;

    set({
      opponent: {
        ...opponent,
        progress: 81,
        timeSeconds,
        mistakes,
      },
    });
    get().finishMatch(opponent, "completion");
  },
}));
