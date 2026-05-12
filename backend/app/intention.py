"""Normalización y texto puente entre la intención del usuario y la lectura simbólica."""

from __future__ import annotations

import re
from typing import Optional

_MAX_LEN = 400


def sanitize_intencion(raw: Optional[str]) -> Optional[str]:
    if not raw:
        return None
    s = raw.strip()
    if not s:
        return None
    s = re.sub(r"\s+", " ", s)
    if len(s) > _MAX_LEN:
        s = s[:_MAX_LEN].rstrip()
    return s


def build_puente_intencion(_intencion: str, nombre_patron: str) -> str:
    """
    Una frase que enlaza intención y signo principal, sin repetir el texto de la intención
    (ese ya se muestra aparte en la interfaz).
    """
    return f"Con tu contexto, el signo principal es «{nombre_patron}»; las pistas secundarias ganan precisión."


def build_analisis_pista_secundaria(
    intencion: Optional[str],
    _nombre_patron: str,
    interpretacion: str,
) -> str:
    """
    «Otras pistas»: solo lo que aporta la imagen para ese signo.
    Si hay intención, una frase corta para matizar (el nombre del patrón ya va en la lista).
    """
    base = interpretacion.strip()
    if not base:
        return _nombre_patron
    if intencion:
        return f"{base} Úsalo como matiz con «{intencion}» frente al signo principal."
    return base
