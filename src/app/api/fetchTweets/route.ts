import { NextResponse } from "next/server";
import axios from "axios";
import { createClient } from "@/utils/supabaseClient";

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

export async function POST() {
  try {
    // Query para buscar tweets
    const query = "bom dia de hoje vai para quem";
    const response = await axios.get("https://api.x.com/2/tweets/search/top", {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      params: {
        query,
        max_results: 10, // Número de tweets por requisição (limite do Free Tier)
      },
    });

    interface Tweet {
      text: string;
    }

    const tweets = response.data.data.map((tweet: Tweet) => tweet.text);

    // Salvar tweets no Supabase
    const supabase = createClient();
    const { error } = await supabase.from("tweets").insert(
      tweets.map((text: string) => ({ text }))
    );

    if (error) throw error;

    return NextResponse.json({ success: true, tweets });
  } catch (error) {
    console.error("Erro ao buscar tweets:", error);
    return NextResponse.json({ error: "Erro ao buscar tweets" }, { status: 500 });
  }
}
