'use client';

import { useEffect, useState } from "react";

interface Category {
  name: string;
}
import "./globals.css";
import { createClient } from "@/utils/supabaseClient";

export default function Home() {
  const [categories, setCategories] = useState<string[]>(["Carregando categorias..."]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();

      // Buscar 10 categorias aleatórias do Supabase
      const { data: savedCategories, error } = await supabase.rpc("get_random_categories", {
        limit_rows: 10,
      });

      if (error || !savedCategories || savedCategories.length === 0) {
        console.error("Erro ao buscar categorias do Supabase ou nenhuma categoria disponível:", error);
        setCategories(["Nenhuma categoria disponível no momento"]);
      } else {
        setCategories(savedCategories.map((cat: Category) => cat.name));
      }

      setLoading(false);
    };

    fetchCategories();
  }, []);

  const message = loading
    ? "☀️ Bom dia! Carregando categorias..."
    : `☀️ Bom dia! E o bom dia especial de hoje vai para:\n* ${categories.join("\n* ")}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    alert("Mensagem copiada para o clipboard!");
  };

  return (
    <div className="container">
      <h1 className="title">☀️ Bom Dia Especial ☀️</h1>
      <p className="message">{message}</p>
      <button className="copy-button" onClick={copyToClipboard}>
        Copiar mensagem
      </button>
    </div>
  );
}
