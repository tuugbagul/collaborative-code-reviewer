from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.python_analyzer import analyze as analyze_python
from services.js_analyzer import analyze as analyze_js

router = APIRouter()


class AnalyzeRequest(BaseModel):
    language: str
    code: str


@router.post("/analyze")
def analyze(request: AnalyzeRequest):
    lang = request.language.lower()
    if lang == "python":
        issues = analyze_python(request.code)
    elif lang in ("javascript", "js"):
        issues = analyze_js(request.code)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {request.language}")
    return {"issues": issues}
