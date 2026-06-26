#!/usr/bin/env python3
"""Generate simple license-free launcher icons for the Vokabeltrainer app."""

from pathlib import Path

from PIL import Image, ImageDraw

PRIMARY = (37, 99, 235, 255)
PRIMARY_RGB = (37, 99, 235)
WHITE = (255, 255, 255, 255)

RES_DIR = Path(__file__).resolve().parent.parent / "android" / "app" / "src" / "main" / "res"
PUBLIC_DIR = Path(__file__).resolve().parent.parent / "public"

FOREGROUND_SIZES = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432,
}

LAUNCHER_SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}


def draw_card_icon(size: int, *, foreground_only: bool) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0) if foreground_only else PRIMARY)
    draw = ImageDraw.Draw(img)

    if not foreground_only:
        draw.rectangle((0, 0, size, size), fill=PRIMARY)

    card_w = int(size * 0.52)
    card_h = int(size * 0.42)
    x = (size - card_w) // 2
    y = (size - card_h) // 2 - int(size * 0.04)
    offset = int(size * 0.05)
    radius = max(4, int(size * 0.06))

    shadow = (255, 255, 255, 100 if foreground_only else 120)
    draw.rounded_rectangle(
        (x + offset, y + offset, x + card_w + offset, y + card_h + offset),
        radius=radius,
        fill=shadow,
    )
    draw.rounded_rectangle((x, y, x + card_w, y + card_h), radius=radius, fill=WHITE)

    cx = x + card_w // 2
    top = y + int(card_h * 0.2)
    bottom = y + int(card_h * 0.8)
    bar = y + int(card_h * 0.54)
    half = int(card_w * 0.17)
    inset = max(2, int(size * 0.015))
    letter = [
        (cx, top),
        (cx + half, bottom),
        (cx + half - inset, bottom),
        (cx, bar),
        (cx - half + inset, bottom),
        (cx - half, bottom),
    ]
    draw.polygon(letter, fill=PRIMARY if foreground_only else PRIMARY_RGB)

    return img


def main() -> None:
    for folder, size in FOREGROUND_SIZES.items():
        target = RES_DIR / folder / "ic_launcher_foreground.png"
        target.parent.mkdir(parents=True, exist_ok=True)
        draw_card_icon(size, foreground_only=True).save(target)

    for folder, size in LAUNCHER_SIZES.items():
        folder_path = RES_DIR / folder
        folder_path.mkdir(parents=True, exist_ok=True)
        icon = draw_card_icon(size, foreground_only=False)
        icon.save(folder_path / "ic_launcher.png")
        icon.save(folder_path / "ic_launcher_round.png")

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    favicon_sizes = [32, 192, 512]
    for favicon_size in favicon_sizes:
        draw_card_icon(favicon_size, foreground_only=False).save(
            PUBLIC_DIR / f"icon-{favicon_size}.png",
        )


if __name__ == "__main__":
    main()
