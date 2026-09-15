import { VersusPlayer } from "./types";
import { COUNTRIES } from "@/lib/leaderboardService";

export const BOT_PROFILES = [
  { name: "NexusAI", country: "JP" },
  { name: "SudokuNinja", country: "US" },
  { name: "QuantumSolver", country: "DE" },
  { name: "AlphaGrid", country: "GB" },
  { name: "MatrixMind", country: "IN" },
  { name: "VortexDigit", country: "CA" },
];

export const createBotPlayer = (
  difficulty: "Easy" | "Medium" | "Hard" = "Medium",
): VersusPlayer => {
  const profile = BOT_PROFILES[Math.floor(Math.random() * BOT_PROFILES.length)];
  const countryObj =
    COUNTRIES.find((c) => c.code === profile.country) || COUNTRIES[0];

  return {
    id: `bot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    username: `${profile.name} (Bot)`,
    countryCode: countryObj.code,
    countryName: countryObj.name,
    avatarSeed: `bot_${profile.name}`,
    isReady: true,
    isHost: false,
    isBot: true,
    botDifficulty: difficulty,
    progress: 0,
    totalGivens: 0,
    mistakes: 0,
  };
};

export class BotGameSimulator {
  private timer: NodeJS.Timeout | null = null;
  private currentProgress: number = 0;
  private totalCells: number = 81;
  private mistakes: number = 0;
  private isRunning: boolean = false;
  private remainingIndices: number[] = [];
  private onProgressCallback: (
    progress: number,
    mistakes: number,
    cellIndex?: number,
  ) => void;
  private onFinishCallback: (timeSeconds: number, mistakes: number) => void;
  private startTime: number = 0;
  private difficulty: "Easy" | "Medium" | "Hard";

  constructor(
    initialGivens: number,
    difficulty: "Easy" | "Medium" | "Hard",
    remainingIndices: number[],
    onProgress: (
      progress: number,
      mistakes: number,
      cellIndex?: number,
    ) => void,
    onFinish: (timeSeconds: number, mistakes: number) => void,
    initialMistakes: number = 0,
  ) {
    this.currentProgress = initialGivens;
    this.difficulty = difficulty;
    this.remainingIndices = [...remainingIndices].sort(
      () => Math.random() - 0.5,
    );
    this.onProgressCallback = onProgress;
    this.onFinishCallback = onFinish;
    this.mistakes = initialMistakes;
  }

  public start() {
    this.isRunning = true;
    this.startTime = Date.now();
    this.scheduleNextMove();
  }

  public stop() {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private scheduleNextMove() {
    if (!this.isRunning) return;

    // Difficulty-tuned solve speed per cell:
    // Easy Bot: 4.0 - 7.5 seconds per cell
    // Medium Bot: 2.5 - 5.0 seconds per cell
    // Hard Bot: 1.5 - 3.5 seconds per cell
    let baseDelay = 3500;
    let variance = 2000;

    if (this.difficulty === "Easy") {
      baseDelay = 4500;
      variance = 3000;
    } else if (this.difficulty === "Hard") {
      baseDelay = 2000;
      variance = 1500;
    }

    // Occasional "thinking pause"
    const isThinkingLong = Math.random() < 0.15;
    const delay =
      baseDelay + Math.random() * variance + (isThinkingLong ? 3000 : 0);

    this.timer = setTimeout(() => {
      if (!this.isRunning) return;

      // Small chance of mistake (max 2 mistakes so bot doesn't self-destruct prematurely)
      const makesMistake = Math.random() < 0.05 && this.mistakes < 2;
      if (makesMistake) {
        this.mistakes += 1;
        this.onProgressCallback(this.currentProgress, this.mistakes);
        this.scheduleNextMove();
        return;
      }

      this.currentProgress += 1;
      const solvedCell = this.remainingIndices.pop();
      this.onProgressCallback(this.currentProgress, this.mistakes, solvedCell);

      if (this.currentProgress >= this.totalCells) {
        this.isRunning = false;
        const timeSeconds = Math.round((Date.now() - this.startTime) / 1000);
        this.onFinishCallback(timeSeconds, this.mistakes);
      } else {
        this.scheduleNextMove();
      }
    }, delay);
  }
}
