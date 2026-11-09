let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(raw || "{}");
  } catch {
    process.stdout.write("{}");
    return;
  }

  const cmd = input?.tool_input?.command;
  if (!cmd || typeof cmd !== "string") {
    process.stdout.write("{}");
    return;
  }

  // Read-only / debug subcommands are fine to run directly; everything else must
  // go through `podman compose` so docker-compose.yaml stays the single source
  // of truth for how services are wired together.
  const ALLOWED = new Set([
    "compose",
    "ps",
    "logs",
    "exec",
    "inspect",
    "machine",
    "version",
    "info",
    "top",
    "stats",
    "cp",
    "diff",
    "port",
    "images",
    "history",
    "search",
    "login",
    "logout",
  ]);

  const re = /(^|[;&|]\s*)podman\s+(\S+)/g;
  let m;
  let offender = null;
  while ((m = re.exec(cmd))) {
    const sub = m[2];
    if (!ALLOWED.has(sub)) {
      offender = sub;
      break;
    }
  }

  if (!offender) {
    process.stdout.write("{}");
    return;
  }

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          `Bloqueado: 'podman ${offender}' evita docker-compose.yaml.\n` +
          `Usa 'podman compose up -d --build' o 'podman compose up -d <service>' para gestionar el ciclo de vida de los contenedores.\n` +
          `Comandos de inspeccion (ps, logs, exec, inspect, machine...) si estan permitidos directo.`,
      },
    })
  );
});
