import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { sql } = await req.json();

    if (!sql) {
      return new Response(
        JSON.stringify({ error: "SQL required in body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Criar cliente com service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    console.log("📋 Executando SQL...");
    console.log(`Tamanho: ${sql.length} bytes`);

    // Executar SQL via RPC (se existir) ou via query direta
    // Como estamos em uma edge function, temos acesso privilegiado
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
        apikey: supabaseServiceKey,
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      // Se RPC não existe, tentar abordagem alternativa
      console.log("⚠️ RPC não disponível, tentando alternativa...");
      
      // Dividir SQL em statements e executar
      const statements = sql
        .split(";")
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith("--"));

      let successful = 0;
      let failed = 0;

      for (const statement of statements) {
        try {
          // Usar query genérica
          await supabase.rpc("exec_sql", { sql: statement + ";" });
          successful++;
        } catch (e) {
          failed++;
          console.error(`Erro em statement: ${e}`);
        }
      }

      return new Response(
        JSON.stringify({
          success: failed === 0,
          successful,
          failed,
          message: "Migrações aplicadas parcialmente",
        }),
        {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Migrações executadas com sucesso",
        result,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Erro:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
