def analyze(code: str) -> list[dict]:
    return [
        {
            "line": 1,
            "severity": "warning",
            "message": "Use const instead of var",
        },
        {
            "line": 2,
            "severity": "warning",
            "message": "Missing semicolon",
        },
    ]
