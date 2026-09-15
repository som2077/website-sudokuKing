import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

const hasSupabase = supabaseUrl && supabaseKey;
const supabase = hasSupabase ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      roomCode,
      difficulty,
      player1,
      player2,
      winnerId,
      winnerUsername,
      finishReason,
      timeSeconds,
    } = body;

    if (!roomCode || !player1 || !player2) {
      return NextResponse.json({ error: "Missing match parameters" }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ ok: true, stored: false, reason: "Supabase not configured" });
    }

    // 1. Insert match record
    const { error: matchError } = await supabase.from("versus_matches").insert({
      room_code: roomCode,
      difficulty: difficulty || "Medium",
      player1_id: player1.id,
      player1_username: player1.username,
      player1_country: player1.countryCode || "US",
      player2_id: player2.id,
      player2_username: player2.username,
      player2_country: player2.countryCode || "US",
      winner_id: winnerId,
      winner_username: winnerUsername,
      finish_reason: finishReason || "completion",
      time_seconds: timeSeconds || 0,
      p1_mistakes: player1.mistakes || 0,
      p2_mistakes: player2.mistakes || 0,
      p1_progress: player1.progress || 0,
      p2_progress: player2.progress || 0,
    });

    if (matchError) {
      console.warn("Could not insert versus match:", matchError.message);
    }

    // 2. Update player ratings on versus_leaderboard for non-bot human players
    const updatePlayer = async (p: typeof player1, isWinner: boolean) => {
      if (p.isBot) return;

      const { data: existing } = await supabase
        .from("versus_leaderboard")
        .select("*")
        .eq("username", p.username)
        .maybeSingle();

      const matchesPlayed = (existing?.matches_played || 0) + 1;
      const matchesWon = (existing?.matches_won || 0) + (isWinner ? 1 : 0);
      const matchesLost = (existing?.matches_lost || 0) + (isWinner ? 0 : 1);
      const winRate = Number(((matchesWon / matchesPlayed) * 100).toFixed(2));
      const currentStreak = isWinner ? (existing?.current_streak || 0) + 1 : 0;
      const bestStreak = Math.max(existing?.best_streak || 0, currentStreak);
      const fastestWin = isWinner
        ? existing?.fastest_win_seconds
          ? Math.min(existing.fastest_win_seconds, timeSeconds)
          : timeSeconds
        : existing?.fastest_win_seconds || null;
      const eloDelta = isWinner ? 25 : -15;
      const eloRating = Math.max(500, (existing?.elo_rating || 1000) + eloDelta);

      await supabase.from("versus_leaderboard").upsert(
        {
          username: p.username,
          country_code: p.countryCode || "US",
          country_name: p.countryName || "United States",
          avatar_seed: p.avatarSeed || p.username,
          matches_played: matchesPlayed,
          matches_won: matchesWon,
          matches_lost: matchesLost,
          win_rate: winRate,
          current_streak: currentStreak,
          best_streak: bestStreak,
          fastest_win_seconds: fastestWin,
          elo_rating: eloRating,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "username" }
      );
    };

    if (winnerId) {
      const isP1Winner = player1.id === winnerId;
      await Promise.all([
        updatePlayer(player1, isP1Winner),
        updatePlayer(player2, !isP1Winner),
      ]);
    }

    return NextResponse.json({ ok: true, stored: true });
  } catch (err: unknown) {
    console.error("Versus match recording error:", err);
    return NextResponse.json({ ok: true, stored: false });
  }
}
