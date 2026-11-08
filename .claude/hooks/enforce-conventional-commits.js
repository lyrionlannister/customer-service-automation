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
  if (!cmd || typeof cmd !== "string" || !/\bgit\s+commit\b/.test(cmd)) {
    process.stdout.write("{}");
    return;
  }

  let subject = null;

  // Heredoc form: git commit -m "$(cat <<'EOF' ... EOF)"
  const heredoc = cmd.match(/-m\s+"\$\(cat\s*<<\s*'?(\w+)'?\s*\n([\s\S]*?)\n\s*\1/);
  if (heredoc) {
    subject = heredoc[2].split("\n")[0].trim();
  } else {
    const quoted = cmd.match(/-m\s+"((?:[^"\\]|\\.)*)"/) || cmd.match(/-m\s+'([^']*)'/);
    if (quoted) subject = quoted[1].split("\n")[0].trim();
  }

  // No -m found (e.g. --amend --no-edit, or an editor-based commit): nothing to validate.
  if (!subject) {
    process.stdout.write("{}");
    return;
  }

  const pattern = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([\w.\/-]+\))?!?:\s.+/;
  if (pattern.test(subject)) {
    process.stdout.write("{}");
    return;
  }

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          `Commit bloqueado: el mensaje "${subject}" no sigue Conventional Commits.\n` +
          `Formato: tipo(scope opcional): descripcion\n` +
          `Tipos validos: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert\n` +
          `Ejemplo: fix(auth): valida isActive antes de emitir token`,
      },
    })
  );
});
