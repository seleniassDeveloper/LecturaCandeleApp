"""
Extracción de características de visión por computadora a partir de fotos de velas.

Combina:
- segmentación heurística por color (HSV) para llama y cera;
- momentos geométricos y contornos;
- medidas de oscuridad (residuos).

Las salidas son un vector numérico normalizado apto para un clasificador TensorFlow.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Tuple

import cv2
import numpy as np


@dataclass
class FeatureVector:
    values: np.ndarray  # shape (F,)
    debug: Dict[str, Any]


def _resize_max_side(bgr: np.ndarray, max_side: int = 640) -> np.ndarray:
    h, w = bgr.shape[:2]
    m = max(h, w)
    if m <= max_side:
        return bgr
    scale = max_side / m
    return cv2.resize(bgr, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)


def _flame_mask(hsv: np.ndarray) -> np.ndarray:
    """Máscara aproximada de llama: tonos cálidos y alta luminancia en la mitad superior."""
    h, w = hsv.shape[:2]
    h_ch, s_ch, v_ch = cv2.split(hsv)
    roi = np.zeros((h, w), dtype=np.uint8)
    roi[: int(h * 0.55), :] = 255
    # Amarillo/naranja/rojo en OpenCV H: 0-35 y 150-179 aprox.
    warm = ((h_ch <= 35) | (h_ch >= 150)) & (s_ch > 40) & (v_ch > 140)
    bright = v_ch > 180
    mask = ((warm | bright) & (roi > 0)).astype(np.uint8) * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8), iterations=1)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8), iterations=1)
    return mask


def _wax_mask(hsv: np.ndarray, v_blur: np.ndarray) -> np.ndarray:
    """Charco de cera: mitad inferior, bordes suaves, luminancia media."""
    h, w = hsv.shape[:2]
    roi = np.zeros((h, w), dtype=np.uint8)
    roi[int(h * 0.45) :, :] = 255
    _, thr = cv2.threshold(v_blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    # Cera fundida suele ser más clara que fondo oscuro; invertimos si la escena es clara.
    mean_v = float(np.mean(v_blur))
    if mean_v > 120:
        pool = (v_blur < thr - 10).astype(np.uint8) * 255
    else:
        pool = (v_blur > thr - 15).astype(np.uint8) * 255
    mask = cv2.bitwise_and(pool, roi)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8), iterations=2)
    return mask


def _residue_mask(v_blur: np.ndarray) -> np.ndarray:
    """Zonas muy oscuras en tercio inferior (hollín / residuo)."""
    h, w = v_blur.shape[:2]
    roi = np.zeros((h, w), dtype=np.uint8)
    roi[int(h * 0.55) :, :] = 255
    dark = (v_blur < 55).astype(np.uint8) * 255
    return cv2.bitwise_and(dark, roi)


def extract_features(bgr: np.ndarray) -> FeatureVector:
    bgr = _resize_max_side(bgr)
    h, w = bgr.shape[:2]
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    v = hsv[:, :, 2]
    v_blur = cv2.GaussianBlur(v, (9, 9), 0)

    flame = _flame_mask(hsv)
    wax = _wax_mask(hsv, v_blur)
    residue = _residue_mask(v_blur)

    flame_area = float(np.sum(flame > 0)) + 1e-6
    wax_area = float(np.sum(wax > 0)) + 1e-6

    # Centroide de la llama
    m = cv2.moments(flame)
    if m["m00"] > 1e-3:
        cx = m["m10"] / m["m00"]
        cy = m["m01"] / m["m00"]
    else:
        cx, cy = w / 2, h * 0.25

    dx = (cx - w / 2) / (w / 2)
    dy = (cy - h / 2) / (h / 2)

    # Excentricidad aproximada del charco (elipse equivalente)
    wax_pts = cv2.findNonZero(wax)
    ecc = 0.0
    wax_compact = 0.0
    secondary_blobs = 0.0
    if wax_pts is not None and len(wax_pts) > 40:
        x, y, ww, hh = cv2.boundingRect(wax_pts)
        aspect = max(ww, hh) / (min(ww, hh) + 1e-6)
        ecc = float(np.clip((aspect - 1) / 4, 0, 1))
        hull = cv2.convexHull(wax_pts)
        hull_area = cv2.contourArea(hull) + 1e-6
        wax_compact = float(np.clip(wax_area / hull_area, 0, 2)) / 2

        cnts, _ = cv2.findContours(wax, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        areas = sorted([cv2.contourArea(c) for c in cnts if cv2.contourArea(c) > wax_area * 0.04], reverse=True)
        if len(areas) >= 2:
            secondary_blobs = float(np.clip(areas[1] / (areas[0] + 1e-6), 0, 1))

    flame_ratio = float(np.clip(flame_area / (h * w), 0, 0.15)) / 0.15
    wax_ratio = float(np.clip(wax_area / (h * w), 0, 0.35)) / 0.35
    residue_ratio = float(np.sum(residue > 0)) / (h * w + 1e-6)
    residue_ratio = float(np.clip(residue_ratio / 0.08, 0, 1))

    # "Acumulación vertical": componentes alargadas en la máscara de cera
    wax_vert = wax[int(h * 0.2) :, :]
    v_structure = 0.0
    if np.any(wax_vert):
        ys, xs = np.where(wax_vert > 0)
        span_y = (ys.max() - ys.min() + 1) / h
        span_x = (xs.max() - xs.min() + 1) / w
        v_structure = float(np.clip(span_y / (span_x + 0.2) - 1, 0, 2)) / 2

    # Dispersión: perímetro^2 / área del charco (normalizado)
    wax_perim = 0.0
    if wax_pts is not None and len(wax_pts) > 20:
        cnts, _ = cv2.findContours(wax, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if cnts:
            c = max(cnts, key=cv2.contourArea)
            p = cv2.arcLength(c, True)
            a = cv2.contourArea(c) + 1e-6
            wax_perim = float(np.clip((p * p) / (4 * np.pi * a) - 1, 0, 6)) / 6

    feats = np.array(
        [
            np.clip(dx, -1, 1),
            np.clip(dy, -1, 1),
            flame_ratio,
            wax_ratio,
            ecc,
            wax_compact,
            secondary_blobs,
            residue_ratio,
            v_structure,
            wax_perim,
        ],
        dtype=np.float32,
    )

    debug: Dict[str, Any] = {
        "image_size": {"w": w, "h": h},
        "flame_centroid": {"x": float(cx), "y": float(cy)},
        "raw": {
            "dx": float(dx),
            "dy": float(dy),
            "flame_ratio": float(flame_ratio),
            "wax_ratio": float(wax_ratio),
            "eccentricity_pool": float(ecc),
            "wax_compactness": float(wax_compact),
            "secondary_blob_ratio": float(secondary_blobs),
            "residue_ratio": float(residue_ratio),
            "vertical_structure": float(v_structure),
            "wax_dispersion": float(wax_perim),
        },
    }
    return FeatureVector(values=feats, debug=debug)
