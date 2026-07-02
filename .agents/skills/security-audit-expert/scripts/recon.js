#!/usr/bin/env node
/**
 * recon.js — Varredura automatizada de padrões de risco em projetos Next.js/Supabase/Stripe.
 *
 * Zero dependências externas (só módulos nativos do Node) — roda igual em
 * Windows, macOS e Linux, sem precisar de bash, ripgrep, ou WSL.
 *
 * Uso:
 *   node recon.js [caminho-do-projeto] [opções]
 *
 * Opções:
 *   --json          imprime o resultado em JSON (útil para o agente consumir programaticamente)
 *   --out=arquivo   também escreve o relatório em Markdown neste caminho
 *   --no-audit      pula a etapa de `npm/pnpm/yarn audit` (que precisa de rede)
 *
 * Isto NÃO é um veredito de segurança. É uma lista de pontos para investigar
 * manualmente com contexto — trate cada resultado como uma pista, nunca como
 * um achado confirmado. Falsos positivos são esperados e normais.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ---------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const flags = { json: false, out: null, audit: true };
let projectDir = '.';

for (const arg of args) {
  if (arg === '--json') flags.json = true;
  else if (arg === '--no-audit') flags.audit = false;
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

const SCAN_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mts', '.cts', '.sql',
]);

const SCAN_FILENAMES = new Set([
  '.env.example', '.env.sample', 'vercel.json', 'next.config.js', 'next.config.ts',
  'middleware.ts', 'middleware.js',
]);

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB — pula arquivos gigantes/gerados

// ---------------------------------------------------------------------------
// Categorias de checagem — cada uma é um regex aplicado linha a linha
// ---------------------------------------------------------------------------

const CHECKS = [
  {
    id: 1,
    title: 'Possíveis segredos hardcoded',
    pattern: /(sk_live_[A-Za-z0-9]+|sk_test_[A-Za-z0-9]{10,}|AKIA[0-9A-Z]{16}|-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----)/,
  },
  {
    id: 2,
    title: 'Variáveis NEXT_PUBLIC_ suspeitas (nome sugere dado sensível)',
    pattern: /NEXT_PUBLIC_\w*(SERVICE_ROLE|SECRET|PRIVATE|ADMIN_KEY|PASSWORD)\w*/i,
  },
  {
    id: 3,
    title: 'Uso de Service Role Key do Supabase (confirmar se está isolado em server-only)',
    pattern: /SERVICE_ROLE_KEY/,
  },
  {
    id: 4,
    title: 'getSession() em contexto potencialmente server-side (verificar se deveria ser getUser())',
    pattern: /auth\.getSession\(\)/,
  },
  {
    id: 5,
    title: 'dangerouslySetInnerHTML (checar se o conteúdo é sanitizado)',
    pattern: /dangerouslySetInnerHTML/,
  },
  {
    id: 6,
    title: 'eval / Function dinâmica / child_process (risco de execução de código)',
    pattern: /(\beval\(|new Function\(|child_process|execSync\(|\bexec\()/,
  },
  {
    id: 7,
    title: 'Rotas de API (route handlers) — mapa de superfície para revisão manual',
    pattern: /export\s+(async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\b/,
  },
  {
    id: 8,
    title: "Server Actions ('use server') — tratar como endpoints públicos",
    pattern: /["']use server["']/,
  },
  {
    id: 10,
    title: 'localStorage/sessionStorage com nome sugerindo dado sensível',
    pattern: /(localStorage|sessionStorage)\.(setItem|getItem)\([^)]*(token|auth|password|secret)/i,
  },
  {
    id: 11,
    title: 'CORS wildcard',
    pattern: /Access-Control-Allow-Origin.*\*/,
  },
  {
    id: 13,
    title: 'TODO/FIXME relacionados a segurança (pistas deixadas pelo próprio time)',
    pattern: /(TODO|FIXME).*(auth|security|seguran|permiss|valida)/i,
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

// ---------------------------------------------------------------------------
// Varredura por regex, linha a linha
// ---------------------------------------------------------------------------

function relPath(p) {
  return path.relative(projectDir, p) || p;
}

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
// Checagem 9: webhooks Stripe sem constructEvent no mesmo arquivo
// ---------------------------------------------------------------------------

function checkWebhooksSemAssinatura(files) {
  const hits = [];
  for (const file of files) {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const mentionsWebhookOrStripe = /stripe|webhook/i.test(content);
    const hasConstructEvent = /constructEvent/.test(content);
    if (mentionsWebhookOrStripe && !hasConstructEvent && /webhook/i.test(file)) {
      hits.push({ file: relPath(file), line: null, text: '(arquivo de webhook sem constructEvent — verificar manualmente)' });
    }
  }
  return hits;
}

// ---------------------------------------------------------------------------
// Checagem 12: pastas de debug/seed/reset esquecidas
// ---------------------------------------------------------------------------

function checkDebugDirs(rootDir) {
  const suspiciousNames = /^(debug|seed|reset-db|_debug|__debug)$/i;
  const hits = [];

  function search(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.isSymbolicLink()) continue;
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      if (suspiciousNames.test(entry.name)) {
        hits.push({ file: relPath(fullPath), line: null, text: '(diretório potencialmente esquecido em produção)' });
      }
      search(fullPath);
    }
  }

  search(rootDir);
  return hits;
}

// ---------------------------------------------------------------------------
// npm/pnpm/yarn audit automático (best-effort, nunca quebra o script)
// ---------------------------------------------------------------------------

function runDependencyAudit(rootDir) {
  if (!flags.audit) return { skipped: true, reason: '--no-audit' };

  const hasPnpm = fs.existsSync(path.join(rootDir, 'pnpm-lock.yaml'));
  const hasYarn = fs.existsSync(path.join(rootDir, 'yarn.lock'));
  const hasNpm = fs.existsSync(path.join(rootDir, 'package-lock.json'));

  let cmd = null;
  if (hasPnpm) cmd = 'pnpm audit --json';
  else if (hasYarn) cmd = 'yarn npm audit --json';
  else if (hasNpm) cmd = 'npm audit --json';
  else return { skipped: true, reason: 'nenhum lockfile encontrado (package-lock.json / pnpm-lock.yaml / yarn.lock)' };

  try {
    const output = execSync(cmd, {
      cwd: rootDir,
      timeout: 30000,
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 10 * 1024 * 1024,
    }).toString();

    const parsed = JSON.parse(output);
    // npm e pnpm têm formatos de saída ligeiramente diferentes — normaliza o que der.
    const meta = parsed.metadata?.vulnerabilities || parsed.vulnerabilities || null;
    return { skipped: false, command: cmd, summary: meta || 'formato de saída não reconhecido, ver JSON bruto se necessário' };
  } catch (err) {
    // `npm audit` retorna exit code != 0 quando ENCONTRA vulnerabilidades — isso não é falha do comando.
    const out = err.stdout ? err.stdout.toString() : '';
    if (out) {
      try {
        const parsed = JSON.parse(out);
        const meta = parsed.metadata?.vulnerabilities || parsed.vulnerabilities || null;
        return { skipped: false, command: cmd, summary: meta || 'formato de saída não reconhecido' };
      } catch {
        // não deu para parsear, cai no relato de erro abaixo
      }
    }
    return { skipped: true, reason: `não foi possível rodar automaticamente (${err.message.split('\n')[0]}) — rode "${cmd}" manualmente` };
  }
}

// ---------------------------------------------------------------------------
// Execução
// ---------------------------------------------------------------------------

const startTime = Date.now();
const files = walk(projectDir);
const regexResults = scanFiles(files);
const webhookHits = checkWebhooksSemAssinatura(files.filter((f) => /webhook/i.test(f)));
const debugDirHits = checkDebugDirs(projectDir);
const audit = runDependencyAudit(projectDir);
const durationMs = Date.now() - startTime;

const allSections = [
  ...CHECKS.map((c) => ({ id: c.id, title: c.title, hits: regexResults[c.id] })),
  { id: 9, title: 'Arquivos de webhook sem constructEvent no mesmo arquivo (confirmar manualmente)', hits: webhookHits },
  { id: 12, title: 'Pastas de debug/seed/reset potencialmente esquecidas', hits: debugDirHits },
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
    dependencyAudit: audit,
  }, null, 2));
} else {
  const lines = [];
  lines.push(`Varredura de segurança — ${projectDir}`);
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
  lines.push('  14. Auditoria de dependências (npm/pnpm/yarn audit)');
  lines.push('════════════════════════════════════════════════════════════════');
  if (audit.skipped) {
    lines.push(`  (não executado: ${audit.reason})`);
  } else {
    lines.push(`  comando: ${audit.command}`);
    lines.push(`  ${JSON.stringify(audit.summary)}`);
  }

  lines.push('');
  lines.push('════════════════════════════════════════════════════════════════');
  lines.push('Varredura concluída. Cada seção acima é ponto de partida, não');
  lines.push('veredito — leia cada hit em contexto antes de registrar um achado.');
  lines.push('════════════════════════════════════════════════════════════════');

  const report = lines.join('\n');
  console.log(report);

  if (flags.out) {
    const mdLines = [`# Varredura de Segurança — Recon Automático`, '', `**Projeto:** \`${projectDir}\`  `, `**Arquivos analisados:** ${files.length} · **Tempo:** ${durationMs}ms`, ''];
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
    mdLines.push('## 14. Auditoria de dependências');
    if (audit.skipped) {
      mdLines.push(`_(não executado: ${audit.reason})_`);
    } else {
      mdLines.push(`Comando: \`${audit.command}\``);
      mdLines.push('```json');
      mdLines.push(JSON.stringify(audit.summary, null, 2));
      mdLines.push('```');
    }
    fs.writeFileSync(flags.out, mdLines.join('\n'), 'utf8');
    console.log(`\nRelatório também salvo em: ${flags.out}`);
  }
}
