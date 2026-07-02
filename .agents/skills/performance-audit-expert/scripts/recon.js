#!/usr/bin/env node
/**
 * recon.js — Varredura automatizada de padrões de risco de performance em
 * projetos Next.js (App Router) + Supabase + Vercel.
 *
 * Zero dependências externas (só módulos nativos do Node) — roda igual em
 * Windows, macOS e Linux, sem precisar de bash, ripgrep, ou WSL.
 *
 * Uso:
 *   node recon.js [caminho-do-projeto] [opções]
 *
 * Opções:
 *   --json             imprime o resultado em JSON (útil para o agente consumir programaticamente)
 *   --out=arquivo       além de imprimir no terminal, salva a varredura em Markdown neste caminho
 *   --no-build-stats    pula a leitura de `.next/static` (bundle já construído)
 *
 * Isto NÃO é um veredito de performance. É uma lista de pontos para investigar
 * manualmente com contexto — trate cada resultado como uma pista, nunca como
 * um achado confirmado. Falsos positivos são normais (ex: um `<script>` que
 * já está dentro de um componente de terceiro, um `for` que não faz I/O).
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const flags = { json: false, out: null, buildStats: true };
let projectDir = '.';

for (const arg of args) {
  if (arg === '--json') flags.json = true;
  else if (arg === '--no-build-stats') flags.buildStats = false;
  else if (arg.startsWith('--out=')) flags.out = arg.slice('--out='.length);
  else projectDir = arg;
}

projectDir = path.resolve(projectDir);

if (!fs.existsSync(projectDir) || !fs.statSync(projectDir).isDirectory()) {
  console.error(`Diretório não encontrado: ${projectDir}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Config de varredura
// ---------------------------------------------------------------------------

const EXCLUDED_DIRS = new Set([
  'node_modules', '.next', '.git', 'dist', 'build', 'out',
  '.vercel', '.turbo', 'coverage', '.cache',
]);

const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mts', '.cts']);

const SCAN_FILENAMES = new Set([
  'next.config.js', 'next.config.ts', 'middleware.ts', 'middleware.js', 'proxy.ts', 'proxy.js', 'vercel.json',
]);

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB — pula arquivos gigantes/gerados

// ---------------------------------------------------------------------------
// Categorias de checagem — cada uma é um regex aplicado linha a linha
// ---------------------------------------------------------------------------

const CHECKS = [
  {
    id: 1,
    title: '<img> nativo em vez de next/image (verificar se não é otimizado)',
    pattern: /<img\s/,
  },
  {
    id: 2,
    title: 'Fonte externa via <link>/@import (fonts.googleapis.com) em vez de next/font',
    pattern: /fonts\.googleapis\.com/,
  },
  {
    id: 3,
    title: 'Import "estrela" (import * as ...) — pode impedir tree-shaking',
    pattern: /import\s+\*\s+as\s+\w+\s+from/,
  },
  {
    id: 4,
    title: "Import completo de 'lodash' (não tree-shakeable) — considerar lodash/<fn> ou lodash-es",
    pattern: /from\s+['"]lodash['"]/,
  },
  {
    id: 5,
    title: "Import de 'moment' (biblioteca pesada, considerar date-fns ou Intl nativo)",
    pattern: /from\s+['"]moment['"]/,
  },
  {
    id: 6,
    title: "Supabase select('*') — possível overfetching de colunas",
    pattern: /\.select\(\s*['"]\*['"]\s*\)/,
  },
  {
    id: 7,
    title: "export const dynamic = 'force-dynamic' — confirmar se é intencional",
    pattern: /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"]/,
  },
  {
    id: 8,
    title: 'export const revalidate = 0 — confirmar se é intencional',
    pattern: /export\s+const\s+revalidate\s*=\s*0\b/,
  },
  {
    id: 9,
    title: '<script src=...> cru em vez de next/script (verificar estratégia de carregamento)',
    pattern: /<script[^>]+src=/,
  },
  {
    id: 10,
    title: "fetch() sem 'cache:'/'next:' explícito na mesma linha (heurística — pode ser multi-linha, checar manualmente)",
    pattern: /fetch\([^)]*\)(?!.*\b(cache|next)\s*:)/,
  },
  {
    id: 11,
    title: 'dynamic() usado — mapa de code-splitting já aplicado (positivo, não é problema)',
    pattern: /dynamic\(\s*\(\)\s*=>\s*import\(/,
  },
  {
    id: 13,
    title: "'use cache' presente — mapa de onde o Cache Components já está aplicado (positivo)",
    pattern: /^\s*['"]use cache['"]/,
  },
  {
    id: 14,
    title: 'TODO/FIXME relacionados a performance (pistas deixadas pelo próprio time)',
    pattern: /(TODO|FIXME).*(perf|performance|lento|slow|otimiz|optimiz)/i,
  },
];

// ---------------------------------------------------------------------------
// Caminhada recursiva no diretório do projeto
// ---------------------------------------------------------------------------

function walk(dir, fileList = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return fileList; // sem permissão de leitura, pula
  }

  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue; // evita loops de symlink

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      walk(fullPath, fileList);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      const shouldScan = SCAN_EXTENSIONS.has(ext) || SCAN_FILENAMES.has(entry.name);
      if (!shouldScan) continue;

      try {
        const size = fs.statSync(fullPath).size;
        if (size > MAX_FILE_SIZE_BYTES) continue;
      } catch {
        continue;
      }

      fileList.push(fullPath);
    }
  }

  return fileList;
}

function relPath(p) {
  return path.relative(projectDir, p) || p;
}

// ---------------------------------------------------------------------------
// Varredura por regex, linha a linha
// ---------------------------------------------------------------------------

function scanFiles(files) {
  const results = {};
  for (const check of CHECKS) results[check.id] = [];

  for (const file of files) {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue; // arquivo binário ou ilegível, pula
    }

    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const check of CHECKS) {
        if (check.pattern.test(line)) {
          results[check.id].push({
            file: relPath(file),
            line: i + 1,
            text: line.trim().slice(0, 200),
          });
        }
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Checagem 12: possível padrão N+1 — arquivo com loop (`for (`/`.map(`) E `await`
// em quantidade que sugere query dentro de iteração. Heurística de arquivo,
// não de linha exata — precisa de leitura manual do trecho para confirmar.
// ---------------------------------------------------------------------------

function checkPossibleNPlusOne(files) {
  const hits = [];
  for (const file of files) {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const hasLoop = /(for\s*\(|\.map\(|\.forEach\()/.test(content);
    const awaitCount = (content.match(/\bawait\b/g) || []).length;
    const hasPromiseAll = /Promise\.all/.test(content);
    // Múltiplos awaits + presença de loop + SEM Promise.all no arquivo é o
    // padrão mais suspeito de N+1 sequencial não paralelizado.
    if (hasLoop && awaitCount >= 3 && !hasPromiseAll) {
      hits.push({
        file: relPath(file),
        line: null,
        text: `(${awaitCount} 'await' no arquivo + loop presente, sem Promise.all — revisar se há query/fetch dentro de iteração)`,
      });
    }
  }
  return hits;
}

// ---------------------------------------------------------------------------
// Checagem 15: dependências pesadas conhecidas no package.json
// ---------------------------------------------------------------------------

const HEAVY_DEPENDENCIES = {
  moment: 'considerar date-fns (tree-shakeable) ou Intl.DateTimeFormat nativo',
  'moment-timezone': 'considerar date-fns-tz ou Intl nativo',
  jquery: 'raramente necessário num app Next.js/React moderno',
  lodash: 'usar lodash-es com imports pontuais, ou lodash/<funcao>',
  underscore: 'considerar funções nativas de array/objeto',
  'core-js': 'confirmar se o target de build realmente precisa do polyfill completo',
};

function checkHeavyDependencies(rootDir) {
  const pkgPath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return { skipped: true, reason: 'package.json não encontrado' };

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch {
    return { skipped: true, reason: 'package.json não pôde ser parseado' };
  }

  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const hits = [];
  for (const dep of Object.keys(allDeps)) {
    if (HEAVY_DEPENDENCIES[dep]) {
      hits.push({ file: 'package.json', line: null, text: `${dep} — ${HEAVY_DEPENDENCIES[dep]}` });
    }
  }
  return { skipped: false, hits };
}

// ---------------------------------------------------------------------------
// Checagem 16: maiores chunks JS já construídos em .next/static (se existir)
// ---------------------------------------------------------------------------

function checkBuildChunkSizes(rootDir) {
  if (!flags.buildStats) return { skipped: true, reason: '--no-build-stats' };

  const chunksDir = path.join(rootDir, '.next', 'static', 'chunks');
  if (!fs.existsSync(chunksDir)) {
    return { skipped: true, reason: 'nenhum build encontrado em .next/static/chunks (rode `next build` para incluir esta análise)' };
  }

  const LARGE_CHUNK_BYTES = 200 * 1024; // 200KB
  const results = [];

  function walkChunks(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkChunks(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        try {
          const size = fs.statSync(fullPath).size;
          results.push({ file: path.relative(rootDir, fullPath), size });
        } catch {
          // ignora
        }
      }
    }
  }

  walkChunks(chunksDir);
  results.sort((a, b) => b.size - a.size);
  const top = results.slice(0, 10).map((r) => ({
    file: r.file,
    line: null,
    text: `${(r.size / 1024).toFixed(1)}KB${r.size > LARGE_CHUNK_BYTES ? '  ⚠️ acima de 200KB' : ''}`,
  }));

  return { skipped: false, totalChunks: results.length, top };
}

// ---------------------------------------------------------------------------
// Execução
// ---------------------------------------------------------------------------

const startTime = Date.now();
const files = walk(projectDir);
const regexResults = scanFiles(files);
const nPlusOneHits = checkPossibleNPlusOne(files);
const heavyDeps = checkHeavyDependencies(projectDir);
const buildStats = checkBuildChunkSizes(projectDir);
const durationMs = Date.now() - startTime;

const allSections = [
  ...CHECKS.map((c) => ({ id: c.id, title: c.title, hits: regexResults[c.id] })),
  { id: 12, title: 'Possível padrão N+1 (loop + múltiplos await, sem Promise.all — confirmar manualmente)', hits: nPlusOneHits },
].sort((a, b) => a.id - b.id);

// ---------------------------------------------------------------------------
// Saída
// ---------------------------------------------------------------------------

if (flags.json) {
  console.log(JSON.stringify({
    projectDir,
    filesScanned: files.length,
    durationMs,
    sections: allSections,
    heavyDependencies: heavyDeps,
    buildChunkStats: buildStats,
  }, null, 2));
} else {
  const lines = [];
  lines.push(`Varredura de performance — ${projectDir}`);
  lines.push(`Arquivos analisados: ${files.length} · Tempo: ${durationMs}ms`);

  for (const section of allSections) {
    lines.push('');
    lines.push('════════════════════════════════════════════════════════════════');
    lines.push(`  ${section.id}. ${section.title}`);
    lines.push('════════════════════════════════════════════════════════════════');
    if (section.hits.length === 0) {
      lines.push('  (nenhum resultado)');
    } else {
      for (const hit of section.hits) {
        const loc = hit.line ? `${hit.file}:${hit.line}` : hit.file;
        lines.push(`  ${loc}  ${hit.text}`);
      }
    }
  }

  lines.push('');
  lines.push('════════════════════════════════════════════════════════════════');
  lines.push('  15. Dependências pesadas conhecidas (package.json)');
  lines.push('════════════════════════════════════════════════════════════════');
  if (heavyDeps.skipped) {
    lines.push(`  (não executado: ${heavyDeps.reason})`);
  } else if (heavyDeps.hits.length === 0) {
    lines.push('  (nenhuma dependência da lista conhecida encontrada)');
  } else {
    for (const hit of heavyDeps.hits) lines.push(`  ${hit.file}  ${hit.text}`);
  }

  lines.push('');
  lines.push('════════════════════════════════════════════════════════════════');
  lines.push('  16. Maiores chunks JS em .next/static (build existente)');
  lines.push('════════════════════════════════════════════════════════════════');
  if (buildStats.skipped) {
    lines.push(`  (não executado: ${buildStats.reason})`);
  } else {
    lines.push(`  Total de chunks .js: ${buildStats.totalChunks} — top 10 maiores:`);
    for (const hit of buildStats.top) lines.push(`  ${hit.file}  ${hit.text}`);
  }

  lines.push('');
  lines.push('════════════════════════════════════════════════════════════════');
  lines.push('Varredura concluída. Cada seção acima é ponto de partida, não');
  lines.push('veredito — leia cada hit em contexto antes de registrar um achado.');
  lines.push('════════════════════════════════════════════════════════════════');

  const report = lines.join('\n');
  console.log(report);

  if (flags.out) {
    const mdLines = [`# Varredura de Performance — Recon Automático`, '', `**Projeto:** \`${projectDir}\`  `, `**Arquivos analisados:** ${files.length} · **Tempo:** ${durationMs}ms`, ''];
    for (const section of allSections) {
      mdLines.push(`## ${section.id}. ${section.title}`);
      if (section.hits.length === 0) {
        mdLines.push('_(nenhum resultado)_');
      } else {
        mdLines.push('```');
        for (const hit of section.hits) {
          const loc = hit.line ? `${hit.file}:${hit.line}` : hit.file;
          mdLines.push(`${loc}  ${hit.text}`);
        }
        mdLines.push('```');
      }
      mdLines.push('');
    }

    mdLines.push('## 15. Dependências pesadas conhecidas (package.json)');
    if (heavyDeps.skipped) {
      mdLines.push(`_(não executado: ${heavyDeps.reason})_`);
    } else if (heavyDeps.hits.length === 0) {
      mdLines.push('_(nenhuma dependência da lista conhecida encontrada)_');
    } else {
      mdLines.push('```');
      for (const hit of heavyDeps.hits) mdLines.push(`${hit.file}  ${hit.text}`);
      mdLines.push('```');
    }
    mdLines.push('');

    mdLines.push('## 16. Maiores chunks JS em .next/static');
    if (buildStats.skipped) {
      mdLines.push(`_(não executado: ${buildStats.reason})_`);
    } else {
      mdLines.push(`Total de chunks .js: ${buildStats.totalChunks} — top 10 maiores:`);
      mdLines.push('```');
      for (const hit of buildStats.top) mdLines.push(`${hit.file}  ${hit.text}`);
      mdLines.push('```');
    }

    fs.writeFileSync(flags.out, mdLines.join('\n'), 'utf8');
    console.log(`\nRelatório também salvo em: ${flags.out}`);
  }
}
