import re


def analyze(code: str) -> list[dict]:
    lines = code.replace('\r\n', '\n').replace('\r', '\n').split('\n')
    issues = []

    for i, line in enumerate(lines, start=1):
        stripped = line.strip()

        # Skip empty lines and comments
        if not stripped or stripped.startswith('//') or stripped.startswith('*'):
            continue

        # var kullanimi
        if re.search(r'\bvar\b', line):
            issues.append({
                "line": i,
                "severity": "warning",
                "message": "Use 'const' or 'let' instead of 'var'",
            })

        # == kullanimi (=== olmayan)
        if re.search(r'(?<![=!<>])={2}(?!=)', line):
            issues.append({
                "line": i,
                "severity": "warning",
                "message": "Use '===' instead of '==' for strict equality",
            })

        # != kullanimi (!== olmayan)
        if re.search(r'!=(?!=)', line):
            issues.append({
                "line": i,
                "severity": "warning",
                "message": "Use '!==' instead of '!=' for strict inequality",
            })

        # console.log
        if re.search(r'\bconsole\.log\b', line):
            issues.append({
                "line": i,
                "severity": "warning",
                "message": "Remove 'console.log' before production",
            })

        # console.error / console.warn
        if re.search(r'\bconsole\.(error|warn)\b', line):
            issues.append({
                "line": i,
                "severity": "warning",
                "message": "Remove console statement before production",
            })

        # alert() kullanimi
        if re.search(r'\balert\s*\(', line):
            issues.append({
                "line": i,
                "severity": "warning",
                "message": "Avoid using 'alert()' in production code",
            })

        # debugger
        if re.search(r'\bdebugger\b', line):
            issues.append({
                "line": i,
                "severity": "error",
                "message": "Remove 'debugger' statement",
            })

        # TODO / FIXME yorumları
        if re.search(r'//.*\b(TODO|FIXME|HACK|XXX)\b', line, re.IGNORECASE):
            issues.append({
                "line": i,
                "severity": "info",
                "message": "Unresolved TODO/FIXME comment",
            })

        # Noktalı virgül eksikligi (satır kod içeriyorsa ve ; ile bitmiyorsa)
        if _missing_semicolon(stripped):
            issues.append({
                "line": i,
                "severity": "warning",
                "message": "Missing semicolon",
            })

        # eval() kullanimi
        if re.search(r'\beval\s*\(', line):
            issues.append({
                "line": i,
                "severity": "error",
                "message": "Avoid using 'eval()' — security risk",
            })

        # undefined ile doğrudan karşılaştırma
        if re.search(r'=== undefined|== undefined|!== undefined|!= undefined', line):
            issues.append({
                "line": i,
                "severity": "info",
                "message": "Consider using 'typeof x === \"undefined\"' instead",
            })

    return issues


def _missing_semicolon(line: str) -> bool:
    # Noktalı virgül gerekmez: blok açan/kapatan satırlar, kontrol akışları
    no_semi_needed = (
        line.endswith('{') or
        line.endswith('}') or
        line.endswith(',') or
        line.endswith('(') or
        line.endswith('=>') or
        line.startswith('//') or
        line.startswith('if ') or line.startswith('if(') or
        line.startswith('else') or
        line.startswith('for ') or line.startswith('for(') or
        line.startswith('while ') or line.startswith('while(') or
        line.startswith('try') or
        line.startswith('catch') or
        line.startswith('finally') or
        line.startswith('function ') or
        line.startswith('class ') or
        line.startswith('import ') or
        line.startswith('export default function') or
        line.startswith('export class')
    )
    if no_semi_needed:
        return False

    # Kod gibi görünen ve ; ile bitmeyen satırlar
    looks_like_code = bool(re.search(r'[a-zA-Z0-9_\)\]\'"]$', line))
    return looks_like_code
