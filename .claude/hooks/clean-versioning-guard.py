"""PreToolUse guard for the clean-versioning skill: blocks AI-attributed commits and `gh pr merge`.

Reads the hook payload (tool_name/tool_input) from stdin and denies the matching
Bash/PowerShell call before it runs, instead of relying on remembering the rule
every time. See .claude/skills/clean-versioning/SKILL.md for the policy this enforces.

Claude may create PRs (`gh pr create`) and check their CI status, but merging a PR
is exclusive to the user, so `gh pr merge` stays blocked.
"""

import json
import re
import sys


def deny(reason: str) -> None:
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }))
    sys.exit(0)


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        sys.exit(0)

    command = (payload.get("tool_input") or {}).get("command") or ""
    if not command:
        sys.exit(0)

    if re.search(r"(^|[;&|\s])gh\s+pr\s+merge\b", command):
        deny(
            "clean-versioning: Claude nunca mergea un Pull Request. "
            "Crea el PR, revisa el CI, y detente ahi -- el merge es exclusivo del usuario."
        )

    if re.search(r"git\s+commit", command) and re.search(
        r"co-authored-by:\s*claude"
        r"|generated with \[claude code\]"
        r"|generated with claude"
        r"|noreply@anthropic\.com"
        r"|\U0001F916",
        command,
        re.IGNORECASE,
    ):
        deny(
            "clean-versioning: el mensaje de commit trae una firma o mencion de IA "
            "(Claude/Anthropic). Quitala antes de confirmar."
        )

    sys.exit(0)


if __name__ == "__main__":
    main()
