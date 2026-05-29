"""API FastAPI: subida de imagen e interpretación simbólica."""

from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from .symbols import PATTERNS

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

_IMAGE_EXT = (
    ".heic",
    ".heif",
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".bmp",
    ".tif",
    ".tiff",
    ".avif",
)


def _looks_like_image_upload(filename: str | None, content_type: str | None) -> bool:
    ct = (content_type or "").lower()
    if ct.startswith("image/"):
        return True
    fn = (filename or "").lower()
    if not fn:
        return False
    if any(fn.endswith(ext) for ext in _IMAGE_EXT):
        return True
    if ct in ("application/octet-stream", "binary/octet-stream"):
        return any(fn.endswith(ext) for ext in _IMAGE_EXT)
    return False

app = FastAPI(
    title="Ceromancia CV",
    description="Análisis de velas: cera, llama y residuos con visión por computadora y TensorFlow.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/ready")
def ready():
    """Comprueba que el motor de análisis (OpenCV) puede cargarse."""
    try:
        from .engine import warmup  # noqa: PLC0415

        warmup()
        return {"status": "ready"}
    except Exception as e:
        raise HTTPException(503, f"Motor no listo: {e}") from e


@app.get("/api/patrones")
def list_patrones():
    return {
        "patrones": [
            {
                "id": p.id,
                "nombre": p.nombre,
                "etiquetas": p.etiquetas,
            }
            for p in PATTERNS.values()
        ]
    }


@app.post("/api/analizar")
async def analizar(
    file: UploadFile = File(...),
    intencion: str = Form(""),
    top_k: int = Query(3, ge=1, le=8),
):
    if not _looks_like_image_upload(file.filename, file.content_type):
        raise HTTPException(
            400,
            "Sube una imagen (JPEG, PNG, WebP, HEIC/HEIF del iPhone, etc.).",
        )
    raw = await file.read()
    if len(raw) > 12 * 1024 * 1024:
        raise HTTPException(413, "Imagen demasiado grande (máx. 12 MB).")
    from .engine import analyze_bgr, decode_upload  # noqa: PLC0415 — carga OpenCV solo al analizar

    try:
        bgr = decode_upload(raw)
    except ValueError as e:
        raise HTTPException(400, str(e)) from e

    try:
        result = analyze_bgr(
            bgr,
            top_k=min(max(top_k, 1), 8),
            intencion=intencion,
        )
    except Exception as e:
        raise HTTPException(500, f"Error en el análisis: {e}") from e

    result["archivo"] = file.filename
    return result


@app.get("/.well-known/assetlinks.json")
def android_assetlinks():
    """Verificación TWA para Google Play (Trusted Web Activity)."""
    package = os.environ.get("ANDROID_PACKAGE_NAME", "").strip()
    fingerprints = [
        fp.strip()
        for fp in os.environ.get("ANDROID_SHA256_FINGERPRINTS", "").split(",")
        if fp.strip()
    ]
    if not package or not fingerprints:
        raise HTTPException(
            503,
            "Configura ANDROID_PACKAGE_NAME y ANDROID_SHA256_FINGERPRINTS en el servidor.",
        )
    payload = [
        {
            "relation": ["delegate_permission/common.handle_all_urls"],
            "target": {
                "namespace": "android_app",
                "package_name": package,
                "sha256_cert_fingerprints": fingerprints,
            },
        }
    ]
    return payload


@app.get("/manifest.webmanifest")
def manifest_webmanifest():
    path = STATIC_DIR / "manifest.webmanifest"
    if not path.is_file():
        raise HTTPException(404, "manifest no encontrado")
    return FileResponse(path, media_type="application/manifest+json")


@app.get("/sw.js")
def service_worker():
    path = STATIC_DIR / "sw.js"
    if not path.is_file():
        raise HTTPException(404, "service worker no encontrado")
    return FileResponse(
        path,
        media_type="application/javascript",
        headers={"Cache-Control": "no-cache"},
    )


def _index_path() -> Path:
    return STATIC_DIR / "index.html"


@app.get("/privacidad", response_class=HTMLResponse)
def privacidad_page():
    path = STATIC_DIR / "privacidad.html"
    if not path.is_file():
        raise HTTPException(404, "privacidad.html no encontrado")
    return HTMLResponse(content=path.read_text(encoding="utf-8"))


@app.get("/index.html", response_class=HTMLResponse)
def index_html():
    path = _index_path()
    if not path.is_file():
        raise HTTPException(404, "index.html no encontrado")
    return HTMLResponse(content=path.read_text(encoding="utf-8"))


@app.get("/", response_class=HTMLResponse)
def root_page():
    path = _index_path()
    if not path.is_file():
        return HTMLResponse(
            content="<p>Coloca frontend en backend/static/index.html</p>",
            status_code=503,
        )
    return HTMLResponse(content=path.read_text(encoding="utf-8"))


if STATIC_DIR.is_dir():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
