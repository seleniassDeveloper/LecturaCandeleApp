"""Catálogo de patrones simbólicos predefinidos y textos de interpretación."""

from dataclasses import dataclass
from typing import Dict, List


@dataclass(frozen=True)
class SymbolicPattern:
    id: str
    nombre: str
    etiquetas: List[str]
    mensaje_simbolico: str
    interpretacion: str


PATTERNS: Dict[str, SymbolicPattern] = {
    "llama_estable": SymbolicPattern(
        id="llama_estable",
        nombre="Llama centrada y estable",
        etiquetas=["equilibrio", "claridad", "foco"],
        mensaje_simbolico=(
            "Lectura ordenada de lo que pides: foco claro y pocas interferencias de fuera."
        ),
        interpretacion=(
            "En la foto la llama se ve bastante recta y el charco de cera, bastante simétrico."
        ),
    ),
    "llama_inclinada_derecha": SymbolicPattern(
        id="llama_inclinada_derecha",
        nombre="Llama inclinada hacia la derecha",
        etiquetas=["futuro", "acción", "apertura"],
        mensaje_simbolico=(
            "Lo que viene o lo de afuera pesa más que lo viejo: empuje hacia adelante."
        ),
        interpretacion=("En la imagen el eje de la llama cae hacia la derecha del observador."),
    ),
    "llama_inclinada_izquierda": SymbolicPattern(
        id="llama_inclinada_izquierda",
        nombre="Llama inclinada hacia la izquierda",
        etiquetas=["pasado", "memoria", "arraigo"],
        mensaje_simbolico=("Temas del pasado o sin cerrar que aún condicionan el presente."),
        interpretacion=("En la imagen el eje de la llama cae hacia la izquierda del observador."),
    ),
    "cera_acumulada": SymbolicPattern(
        id="cera_acumulada",
        nombre="Acumulación o columna de cera",
        etiquetas=["acumulación", "tensión", "carga"],
        mensaje_simbolico=("Carga o tensión que cuesta soltar; conviene ver qué estás acumulando."),
        interpretacion=("Se ve mucha cera en vertical o bordes altos respecto al charco central."),
    ),
    "cera_dispersa": SymbolicPattern(
        id="cera_dispersa",
        nombre="Cera dispersa o surcos alargados",
        etiquetas=["dispersión", "cambio", "movimiento"],
        mensaje_simbolico=(
            "Energía repartida en varias direcciones o etapa movediza antes de que algo asiente."
        ),
        interpretacion=("La cera fundida forma surcos o manchas alargadas y bastante desiguales."),
    ),
    "residuos_oscuros": SymbolicPattern(
        id="residuos_oscuros",
        nombre="Residuos oscuros o hollín",
        etiquetas=["sombra", "purificación", "advertencia suave"],
        mensaje_simbolico=(
            "Capas densas o sombra en proceso de depurar; el fuego está trabajando eso."
        ),
        interpretacion=("Hay manchas oscuras compatibles con hollín o residuos quemados alrededor."),
    ),
    "figura_en_cera": SymbolicPattern(
        id="figura_en_cera",
        nombre="Figura o protuberancia distinta en la cera",
        etiquetas=["signo", "mensaje", "anomalía significativa"],
        mensaje_simbolico=("Un frente concreto de tu situación pide mirarse aparte del resto."),
        interpretacion=(
            "Se distingue una masa o protuberancia de cera claramente separada del charco principal."
        ),
    ),
    "mezcla_equilibrada": SymbolicPattern(
        id="mezcla_equilibrada",
        nombre="Patrones mixtos sin predominio claro",
        etiquetas=["complejidad", "matiz", "integración"],
        mensaje_simbolico=("Varias señales a la vez: integra matices antes de cerrar en una sola lectura."),
        interpretacion=("En la imagen no domina un solo patrón; varias pistas compiten con fuerza parecida."),
    ),
}


# Orden fijo para capas de clasificación (TensorFlow y matriz de reglas).
CLASS_ORDER: List[str] = [
    "llama_estable",
    "llama_inclinada_derecha",
    "llama_inclinada_izquierda",
    "cera_acumulada",
    "cera_dispersa",
    "residuos_oscuros",
    "figura_en_cera",
    "mezcla_equilibrada",
]
