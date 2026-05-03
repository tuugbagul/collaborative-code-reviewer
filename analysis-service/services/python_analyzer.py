import subprocess
import tempfile
import os
import re


SEVERITY_MAP = {
    "E": "error",
    "F": "error",
    "W": "warning",
    "C": "convention",
    "R": "refactor",
}


def analyze(code: str) -> list[dict]:
    with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False) as f:
        f.write(code)
        tmp_path = f.name

    try:
        result = subprocess.run(
            ["pylint", "--output-format=text", "--score=no", tmp_path],
            capture_output=True,
            text=True,
        )
        return _parse(result.stdout)
    finally:
        os.unlink(tmp_path)


def _parse(output: str) -> list[dict]:
    # pylint text format: path:line:col: X#### (message-id) message
    pattern = re.compile(r":(\d+):\d+:\s+([EWCRF])\d+:\s+(.+)")
    issues = []
    for line in output.splitlines():
        m = pattern.search(line)
        if m:
            line_no, code_char, message = m.groups()
            issues.append({
                "line": int(line_no),
                "severity": SEVERITY_MAP.get(code_char, "info"),
                "message": message.strip(),
            })
    return issues
