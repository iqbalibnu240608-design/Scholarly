"""Generate a small Markdown completion report from explicitly supplied facts.
This intentionally does not inspect git or claim tests passed automatically.
"""
import argparse
from datetime import date
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("--title", default="Work Completion Report")
parser.add_argument("--summary", required=True)
parser.add_argument("--checks", action="append", default=[])
parser.add_argument("--limitations", action="append", default=[])
parser.add_argument("--output", default=".agents/reports/final/COMPLETION.md")
args = parser.parse_args()

content = [
    f"# {args.title}", "", f"- Date: {date.today().isoformat()}", "",
    "## Summary", args.summary, "", "## Checks actually run",
]
content += [f"- {item}" for item in args.checks] or ["- No checks recorded."]
content += ["", "## Limitations / not verified"]
content += [f"- {item}" for item in args.limitations] or ["- None recorded."]
path = Path(args.output)
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text("\n".join(content) + "\n", encoding="utf-8")
print(f"Report written: {path}")
