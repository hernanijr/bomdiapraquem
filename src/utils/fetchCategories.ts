import { createClient } from "@/utils/supabaseClient";

export async function fetchCategories(limit_rows: number = 10): Promise<string[]> {
  const supabase = createClient();

  const { data: savedCategories, error } = await supabase.rpc("get_random_categories", {
    limit_rows,
  });

  if (error || !savedCategories || savedCategories.length === 0) {
    console.error("Erro ao buscar categorias:", error);
    return ["Nenhuma categoria disponível no momento"];
  }

  return savedCategories.map((cat: { name: string }) => cat.name);
}
