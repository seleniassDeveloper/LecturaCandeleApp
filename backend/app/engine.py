"""Orquestación: imagen -> OpenCV -> clasificador (NumPy o TensorFlow opcional) -> salida simbólica."""

from __future__ import annotations

import os
import platform
import subprocess
import tempfile
from io import BytesIO
from typing import Any, Dict, List, Optional

import numpy as np
from PIL import Image, ImageOps

from .intention import (
    build_analisis_pista_secundaria,
    build_puente_intencion,
    sanitize_intencion,
)
from .symbols import CLASS_ORDER, PATTERNS
from .tf_classifier import predict_logits, softmax

_heif_registered = False
_cv2_mod = None


def _cv2():
    """Importa OpenCV solo cuando hace falta (arranque más rápido en Render)."""
    global _cv2_mod
    if _cv2_mod is None:
        import cv2

        _cv2_mod = cv2
    return _cv2_mod


def warmup() -> None:
    """Precarga OpenCV (opcional, p. ej. /api/ready)."""
    _cv2()
    from .cv_features import extract_features  # noqa: F401, PLC0415


def _register_heif_once() -> None:
    global _heif_registered
    if _heif_registered:
        return
    try:
        from pillow_heif import register_heif_opener

        register_heif_opener()
    except ImportError:
        pass
    _heif_registered = True


def _guess_temp_suffix(data: bytes) -> str:
    if data.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ".webp"
    return ".img"


def _sips_suffix_candidates(data: bytes) -> List[str]:
    if len(data) >= 12 and data[4:8] == b"ftyp":
        brand = data[8:12]
        if brand == b"avif":
            return [".avif", ".heic"]
        return [".heic", ".heif", ".avif"]
    s = _guess_temp_suffix(data)
    if s == ".img":
        return [".jpg", ".jpeg", ".png", ".webp", ".heic"]
    return [s]


def _decode_via_macos_sips(data: bytes) -> Optional[np.ndarray]:
    """Convierte a JPEG temporal con `sips` (incluido en macOS); útil si pillow-heif falla."""
    if platform.system() != "Darwin":
        return None
    sips = "/usr/bin/sips"
    if not os.path.isfile(sips):
        return None
    for suffix in _sips_suffix_candidates(data):
        try:
            with tempfile.TemporaryDirectory(prefix="ceromancia_") as td:
                inp = os.path.join(td, f"upload{suffix}")
                outp = os.path.join(td, "converted.jpg")
                with open(inp, "wb") as f:
                    f.write(data)
                r = subprocess.run(
                    [sips, "-s", "format", "jpeg", inp, "--out", outp],
                    capture_output=True,
                    text=True,
                    timeout=90,
                )
                if r.returncode == 0 and os.path.isfile(outp):
                    cv = _cv2()
                    img = cv.imread(outp, cv.IMREAD_COLOR)
                    if img is not None:
                        return img
        except (OSError, subprocess.SubprocessError):
            continue
    return None


def _decode_via_pillow(data: bytes) -> Optional[np.ndarray]:
    _register_heif_once()
    try:
        pil = Image.open(BytesIO(data))
        pil = ImageOps.exif_transpose(pil)
        pil = pil.convert("RGB")
        rgb = np.asarray(pil, dtype=np.uint8)
        cv = _cv2()
        return cv.cvtColor(rgb, cv.COLOR_RGB2BGR)
    except Exception:
        return None


def decode_upload(data: bytes) -> np.ndarray:
    """
    Decodifica imagen en BGR para OpenCV.

    Orden: OpenCV → Pillow (incl. HEIC con pillow-heif) → en macOS, `sips` → JPEG.
    """
    if not data:
        raise ValueError("El archivo está vacío.")

    cv = _cv2()
    arr = np.frombuffer(data, dtype=np.uint8)
    img = cv.imdecode(arr, cv.IMREAD_COLOR)
    if img is not None:
        return img

    img = _decode_via_pillow(data)
    if img is not None:
        return img

    img = _decode_via_macos_sips(data)
    if img is not None:
        return img

    hints: List[str] = []
    if len(data) >= 8 and data[4:8] == b"ftyp":
        hints.append("Detectado contenedor HEIF/HEIC o similar (cabecera ftyp).")
        try:
            import pillow_heif  # noqa: F401
        except ImportError:
            hints.append("Instala soporte HEIC: pip install pillow-heif")
        if platform.system() == "Linux":
            hints.append("En Ubuntu/Debian suele hacer falta: sudo apt install libheif1")
        if platform.system() == "Darwin":
            hints.append("Si sigue fallando, en Fotos: Archivo → Exportar → JPEG.")
    else:
        hints.append("Comprueba que el archivo sea una foto (JPEG, PNG, WebP o HEIC).")

    raise ValueError(
        "No se pudo decodificar la imagen. " + " ".join(hints) + " Luego: pip install -r requirements.txt y reinicia el servidor."
    )


def analyze_bgr(
    bgr: np.ndarray,
    top_k: int = 3,
    intencion: Optional[str] = None,
) -> Dict[str, Any]:
    from .cv_features import extract_features  # noqa: PLC0415

    fv = extract_features(bgr)
    logits = predict_logits(fv.values)
    probs = softmax(logits)

    ranked: List[tuple[str, float]] = sorted(
        zip(CLASS_ORDER, probs.tolist()),
        key=lambda t: t[1],
        reverse=True,
    )
    top = ranked[: max(1, top_k)]

    intencion_limpia = sanitize_intencion(intencion)

    secondary: List[Dict[str, Any]] = []
    for i, (pid, p) in enumerate(top):
        pat = PATTERNS[pid]
        row: Dict[str, Any] = {
            "id": pid,
            "probabilidad": round(float(p), 4),
            "nombre": pat.nombre,
            "etiquetas": pat.etiquetas,
            "mensaje_simbolico": pat.mensaje_simbolico,
            "interpretacion": pat.interpretacion,
        }
        if i > 0:
            row["analisis_pista"] = build_analisis_pista_secundaria(
                intencion_limpia,
                pat.nombre,
                pat.interpretacion,
            )
        secondary.append(row)

    puente: Optional[str] = None
    if intencion_limpia:
        puente = build_puente_intencion(intencion_limpia, secondary[0]["nombre"])

    return {
        "intencion_recibida": intencion_limpia,
        "puente_intencion": puente,
        "patron_principal": secondary[0],
        "patrones": secondary,
        "medidas_visuales": fv.debug,
        "logits": {k: round(float(v), 4) for k, v in zip(CLASS_ORDER, logits.tolist())},
    }
