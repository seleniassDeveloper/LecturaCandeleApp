"""
Clasificador simbólico: misma lógica que una capa densa Keras (logits = x @ W + b).

- **Inferencia por defecto:** NumPy (rápido, sin TensorFlow en tiempo de ejecución).
- **Opcional:** con `CEROMANCIA_USE_TF=1` y `backend/models/symbol_classifier.keras`,
  se carga el modelo con TensorFlow/Keras (útil si entrenaste y exportaste pesos).

Exportar el archivo `.keras` de ejemplo (requiere TensorFlow instalado):

  `python scripts/export_keras_model.py`
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Optional, Tuple

import numpy as np

from .symbols import CLASS_ORDER

FEATURE_DIM = 10

_keras_model: Optional[object] = None
_keras_load_failed = False


def _rule_prior_weights() -> Tuple[np.ndarray, np.ndarray]:
    """
    Matriz (FEATURE_DIM, num_classes): correlaciones entre features y clases.

    Features: dx, dy, flame_ratio, wax_ratio, ecc, wax_compact,
    secondary_blobs, residue_ratio, v_structure, wax_dispersion.
    """
    n = len(CLASS_ORDER)
    W = np.zeros((FEATURE_DIM, n), dtype=np.float32)
    b = np.full((n,), -0.5, dtype=np.float32)

    idx = {k: i for i, k in enumerate(CLASS_ORDER)}

    W[0, idx["llama_estable"]] = -2.0
    W[2, idx["llama_estable"]] = 1.2
    W[5, idx["llama_estable"]] = 1.0
    b[idx["llama_estable"]] = 0.2

    W[0, idx["llama_inclinada_derecha"]] = 2.2
    W[2, idx["llama_inclinada_derecha"]] = 0.6
    b[idx["llama_inclinada_derecha"]] = -0.2

    W[0, idx["llama_inclinada_izquierda"]] = -2.2
    W[2, idx["llama_inclinada_izquierda"]] = 0.6

    W[8, idx["cera_acumulada"]] = 2.0
    W[4, idx["cera_acumulada"]] = 0.8
    W[3, idx["cera_acumulada"]] = 0.5

    W[9, idx["cera_dispersa"]] = 2.0
    W[4, idx["cera_dispersa"]] = 0.9
    W[5, idx["cera_dispersa"]] = -0.6

    W[7, idx["residuos_oscuros"]] = 2.5

    W[6, idx["figura_en_cera"]] = 2.2
    W[3, idx["figura_en_cera"]] = 0.4

    W[:, idx["mezcla_equilibrada"]] = 0.15
    b[idx["mezcla_equilibrada"]] = -0.1

    return W, b


def model_dir() -> Path:
    return Path(__file__).resolve().parent.parent / "models"


def _env_use_tf() -> bool:
    return os.environ.get("CEROMANCIA_USE_TF", "").lower() in ("1", "true", "yes")


def _load_keras_once(path: Path):
    global _keras_model, _keras_load_failed
    if _keras_model is not None:
        return _keras_model
    if _keras_load_failed:
        return None
    if not _env_use_tf() or not path.is_file():
        return None
    try:
        from tensorflow import keras

        _keras_model = keras.models.load_model(path, compile=False)
        return _keras_model
    except Exception:
        _keras_load_failed = True
        return None


def predict_logits(features: np.ndarray) -> np.ndarray:
    path = model_dir() / "symbol_classifier.keras"
    x = features.reshape(1, -1).astype(np.float32)
    m = _load_keras_once(path)
    if m is not None:
        return m(x, training=False).numpy().reshape(-1)
    W, b = _rule_prior_weights()
    return (x @ W + b).reshape(-1)


def softmax(probs: np.ndarray) -> np.ndarray:
    e = np.exp(probs - np.max(probs))
    return e / (np.sum(e) + 1e-9)
