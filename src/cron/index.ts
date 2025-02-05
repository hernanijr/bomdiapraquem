import cron from "node-cron";
import fetch from "node-fetch";

export function setupCronJobs() {
  // Tarefa 1: Buscar tweets a cada 11 dias
  cron.schedule("0 0 */11 * *", async () => {
    console.log("Buscando tweets...");
    try {
      const response = await fetch("http://localhost:3000/api/fetchTweets", {
        method: "POST",
      });

      if (response.ok) {
        console.log("Tweets buscados e salvos com sucesso.");
      } else {
        console.error("Erro ao buscar tweets:", await response.json());
      }
    } catch (error) {
      console.error("Erro na tarefa de busca de tweets:", error);
    }
  });

  // Tarefa 2: Gerar categorias diariamente
  cron.schedule("0 0 * * *", async () => {
    console.log("Gerando categorias...");
    try {
      const response = await fetch("http://localhost:3000/api/generateCategories", {
        method: "POST",
      });

      if (response.ok) {
        console.log("Categorias geradas e salvas com sucesso.");
      } else {
        console.error("Erro ao gerar categorias:", await response.json());
      }
    } catch (error) {
      console.error("Erro na tarefa de geração de categorias:", error);
    }
  });

  console.log("Cron jobs configurados.");
}
