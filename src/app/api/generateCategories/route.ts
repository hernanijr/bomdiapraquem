import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabaseClient";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST() {
  try {
    const supabase = createClient();

    // Buscar tweets do Supabase
    const { data: tweets, error: fetchError } = await supabase
      .from("tweets")
      .select("text")
      .limit(10);

    if (fetchError || !tweets) throw fetchError || new Error("Nenhum tweet encontrado.");

    // Cria o prompt usando os tweets
    const prompt = `
      Com base nesses exemplos:
      - Quem já sofreu por uma Larissa
      - Quem é solteiro(a)
      - Amantes de bolo de cenoura
      - Quem tá namorando
      - Torcida do Vasco e Santos
      - Quem acordou depois das 10h
      - Jogadores de Minecraft
      - Homens com moicano
      - Moradores de Parnaíba/PI
      - Mulheres com mais de 1,70
      - Fãs do Neymar
      - Quem toma oxalato de escitalopram
      - Pessoas que tiveram problemas de auto estima no ensino médio
      - Pessoas que justificam atos de babaquice com o signo (arianos)
      - Galera que tem problema com a justiça do trabalho
      - PJ que cumpre horário
      Pessoas com o nome sujo
      Skatistas
      Amantes de caldo de cana
      Pessoas com cabelo sujo
      Almeidas
      Silvas,
      Quem não tomou café da manhã
      Fãs do sonic
      Usuários de blusa verde,
      Quem trabalha com atendimento ao público
      Ateus
      crentes
      Macumbeiros
      quem não está mais suportando
      quem está cansado de tudo
      quem está querendo desistir
      quem se pergunta todo os dias pq tanto sofrimento
      quem está sendo vencido pela tristeza e solidão
      - Torcida do Grêmio e Flamengo
      - Quem acordou cedo e não trabalha
      - Gamers do país
      - Quem ama a Champions
      - Galera tatuada
      - Moradores de Sério/RS
      - Mulheres com menos de 1,60
      - quem é fiel
      - torcida do são paulo
      - homens calvos e carecas
      - quem ja leu um livro esse mês
      - quem aumentou a ofensiva no duo
      - quem tem ex-ficante que vai casar
      - pessoas com emprego
      * amantes da américa latina
      * quem queria um feriadinho
      * haters de coach
      * quem ta doente e não deu valor a saúde antes
      * quem não comparece se o convite for feito com pouquíssima antecedência
      * quem odeia academia lotada
      * introvertidos que parecem extrovertidos
      * fãs da beiçola
      e nesses exemplos de tweets de \"Bom Dia pra quem\",:
      ${tweets.map((tweet) => `- ${tweet.text}`).join("\n")}
      crie 10 categorias criativas semelhantes):
    `;

    // Gerar categorias com OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Modelo mais acessível
      messages: [
        {
          role: "system",
          content: "Você é um assistente criativo que gera ideias para categorias de bom dia",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const messageContent = completion.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error("No content received from OpenAI");
    }

    const categories = messageContent
        .trim()
        .split("\n")
        .map((item) => item.replace(/^- /, "").trim());

    // Salvar categorias no Supabase
    const { error: saveError } = await supabase.from("categories").insert(
      categories.map((name: string) => ({ name }))
    );

    if (saveError) throw saveError;

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Erro ao gerar categorias:", error);
    return NextResponse.json({ error: "Erro ao gerar categorias" }, { status: 500 });
  }
}
