#!/usr/bin/env python3
"""Genera iconos PNG para PWA (192 y 512). Ejecutar desde la raíz del backend en Docker o local."""

from pathlib import Path

from PIL import Image, ImageDraw


def main() -> None:
    static = Path(__file__).resolve().parent.parent / "static" / "icons"
    static.mkdir(parents=True, exist_ok=True)

    for size in (192, 512):
        im = Image.new("RGBA", (size, size), (18, 10, 26, 255))
        draw = ImageDraw.Draw(im)
        m = max(size // 8, 4)
        draw.rounded_rectangle(
            [m, m, size - m, size - m],
            radius=size // 8,
            outline=(232, 200, 122, 255),
            width=max(2, size // 48),
        )
        # punto cálido (llama estilizada)
        cx, cy = size // 2, size // 2 + size // 16
        r = size // 10
        draw.ellipse([cx - r, cy - r - size // 20, cx + r, cy + r], fill=(255, 210, 140, 255))
        im.save(static / f"icon-{size}.png", optimize=True)


if __name__ == "__main__":
    main()
