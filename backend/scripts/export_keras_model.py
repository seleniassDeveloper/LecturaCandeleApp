"""
Genera `backend/models/symbol_classifier.keras` con TensorFlow.

Ejecutar solo en un entorno donde `pip install tensorflow` funcione:

  cd backend && . .venv/bin/activate && pip install tensorflow && python scripts/export_keras_model.py
"""

import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.symbols import CLASS_ORDER  # noqa: E402
from app.tf_classifier import _rule_prior_weights  # noqa: E402


def main():
    from tensorflow import keras

    num = len(CLASS_ORDER)
    W, b = _rule_prior_weights()
    inp = keras.Input(shape=(W.shape[0],), name="features")
    out = keras.layers.Dense(
        num,
        activation=None,
        kernel_initializer=keras.initializers.Constant(W),
        bias_initializer=keras.initializers.Constant(b),
        name="logits_linear",
    )(inp)
    model = keras.Model(inp, out, name="symbolic_export")
    out_dir = Path(__file__).resolve().parent.parent / "models"
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / "symbol_classifier.keras"
    model.save(path)
    print(f"Guardado: {path}")


if __name__ == "__main__":
    main()
