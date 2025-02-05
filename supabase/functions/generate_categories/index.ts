import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabaseUrl = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Buscar 10 tweets mais recentes
    const { data: tweets, error: fetchError } = await supabase
      .from("tweets")
      .select("text")
      .limit(10);

    if (fetchError || !tweets) {
      throw new Error("Erro ao buscar tweets.");
    }

    // Gerar categorias com OpenAI
    const prompt = `
      Com base nesses exemplos de tweets de \"Bom Dia pra quem\", crie 10 categorias criativas:
      ${tweets.map((tweet) => `- ${tweet.text}`).join("\n")}
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Você é um assistente criativo que gera categorias." },
          { role: "user", content: prompt },
        ],
      }),
    });

    const openAiResponse = await response.json();
    const categories = openAiResponse.choices[0].message.content
      .trim()
      .split("\n")
      .map((item: string) => item.replace(/^- /, "").trim());

    // Salvar categorias no Supabase
    const { error: saveError } = await supabase.from("categories").insert(
      categories.map((name: string) => ({ name }))
    );

    if (saveError) throw saveError;

    return new Response("Categorias geradas e salvas com sucesso.", { status: 200 });
  } catch (error) {
    console.error("Erro ao gerar categorias:", error);
    return new Response("Erro ao gerar categorias.", { status: 500 });
  }
});
