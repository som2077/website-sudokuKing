import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

const hasSupabase = supabaseUrl && supabaseKey;
const supabase = hasSupabase ? createClient(supabaseUrl, supabaseKey) : null;

const DEFAULT_CHAMPIONS = [
  {
    username: "NexusAI",
    countryCode: "JP",
    countryName: "Japan",
    avatarSeed: "bot_NexusAI",
    matchesPlayed: 48,
    matchesWon: 42,
    matchesLost: 6,
    winRate: 87.5,
    currentStreak: 8,
    bestStreak: 14,
    fastestWinSeconds: 134,
    eloRating: 1840,
    rank: 1,
  },
  {
    username: "SudokuMaster99",
    countryCode: "US",
    countryName: "United States",
    avatarSeed: "player_master",
    matchesPlayed: 35,
    matchesWon: 29,
    matchesLost: 6,
    winRate: 82.8,
    currentStreak: 5,
    bestStreak: 9,
    fastestWinSeconds: 145,
    eloRating: 1720,
    rank: 2,
  },
  {
    username: "GridWizard",
    countryCode: "DE",
    countryName: "Germany",
    avatarSeed: "player_grid",
    matchesPlayed: 30,
    matchesWon: 24,
    matchesLost: 6,
    winRate: 80.0,
    currentStreak: 3,
    bestStreak: 7,
    fastestWinSeconds: 162,
    eloRating: 1650,
    rank: 3,
  },
  {
    username: "AlphaDigit",
    countryCode: "IN",
    countryName: "India",
    avatarSeed: "player_alpha",
    matchesPlayed: 28,
    matchesWon: 22,
    matchesLost: 6,
    winRate: 78.5,
    currentStreak: 4,
    bestStreak: 6,
    fastestWinSeconds: 178,
    eloRating: 1590,
    rank: 4,
  },
  {
    username: "SpeedSolver_UK",
    countryCode: "GB",
    countryName: "United Kingdom",
    avatarSeed: "player_uk",
    matchesPlayed: 24,
    matchesWon: 18,
    matchesLost: 6,
    winRate: 75.0,
    currentStreak: 2,
    bestStreak: 5,
    fastestWinSeconds: 185,
    eloRating: 1510,
    rank: 5,
  },
];

export async function GET() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("versus_leaderboard")
        .select("*")
        .order("elo_rating", { ascending: false })
        .order("matches_won", { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        const mapped = data.map((row, idx) => ({
          username: row.username,
          countryCode: row.country_code,
          countryName: row.country_name,
          avatarSeed: row.avatar_seed,
          matchesPlayed: row.matches_played,
          matchesWon: row.matches_won,
          matchesLost: row.matches_lost,
          winRate: Number(row.win_rate),
          currentStreak: row.current_streak,
          bestStreak: row.best_streak,
          fastestWinSeconds: row.fastest_win_seconds,
          eloRating: row.elo_rating,
          rank: idx + 1,
        }));

        return NextResponse.json(
          { entries: mapped, totalSolvers: mapped.length },
          {
            headers: {
              "Cache-Control": "public, max-age=15, stale-while-revalidate=45",
            },
          }
        );
      }
    } catch (err) {
      console.warn("Could not query versus_leaderboard from Supabase, returning fallback:", err);
    }
  }

  return NextResponse.json(
    { entries: DEFAULT_CHAMPIONS, totalSolvers: DEFAULT_CHAMPIONS.length },
    {
      headers: {
        "Cache-Control": "public, max-age=15, stale-while-revalidate=45",
      },
    }
  );
}
