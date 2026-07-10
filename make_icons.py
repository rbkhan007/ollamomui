import math
from PIL import Image, ImageDraw

CYAN = (0, 240, 255, 255)
PURPLE = (139, 92, 246, 255)
DARK = (12, 12, 26, 255)
WHITE = (255, 255, 255, 255)


def draw_brand_mark(size):
    SS = 4
    s = (size * SS) / 64.0
    img = Image.new("RGBA", (size * SS, size * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = 32 * s, 32 * s

    def P(pts):
        return [(cx + x * s, cy + y * s) for x, y in pts]

    # outer hexagon (dark fill + cyan stroke)
    outer = [(0, -24), (21, -12), (21, 12), (0, 24), (-21, 12), (-21, -12)]
    d.polygon(P(outer), fill=DARK, outline=CYAN)
    # inner hexagon outline (purple, thin)
    inner = [(0, -18), (16, -9), (16, 9), (0, 18), (-16, 9), (-16, -9)]
    d.line(P(inner) + [P(inner)[0]], fill=PURPLE, width=max(1, int(1 * s)))
    # lightning bolt (cyan)
    bolt = [(-6, -10), (6, -10), (3, -2), (8, -2), (-6, 12), (-3, 3), (-9, 3)]
    d.polygon(P(bolt), fill=CYAN)
    # network nodes
    nodes = [(0, -24), (21, -12), (21, 12), (0, 24), (-21, 12), (-21, -12)]
    for i, (nx, ny) in enumerate(nodes):
        col = CYAN if i % 2 == 0 else PURPLE
        d.ellipse([cx + nx * s - 2 * s, cy + ny * s - 2 * s,
                   cx + nx * s + 2 * s, cy + ny * s + 2 * s], fill=col)
    # central core
    d.ellipse([cx - 3 * s, cy - 3 * s, cx + 3 * s, cy + 3 * s], fill=CYAN)

    out = img.resize((size, size), Image.LANCZOS)
    return out


def draw_favicon(size):
    SS = 4
    s = (size * SS) / 32.0
    img = Image.new("RGBA", (size * SS, size * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = 16 * s, 16 * s

    # background circle
    d.ellipse([cx - 14 * s, cy - 14 * s, cx + 14 * s, cy + 14 * s], fill=DARK)
    # hexagon outline
    hexpts = [(0, -12), (11, -6), (11, 6), (0, 12), (-11, 6), (-11, -6)]
    hp = [(cx + x * s, cy + y * s) for x, y in hexpts]
    d.line(hp + [hp[0]], fill=CYAN, width=max(1, int(1.5 * s)))
    # lightning bolt (purple)
    bolt = [(-4, -4), (4, -4), (0, 0), (4, 4), (-4, 4), (0, -4)]
    d.polygon([(cx + x * s, cy + y * s) for x, y in bolt], fill=PURPLE)
    # center dot
    d.ellipse([cx - 2 * s, cy - 2 * s, cx + 2 * s, cy + 2 * s], fill=CYAN)

    return img.resize((size, size), Image.LANCZOS)


import struct
import io


def build_ico(images):
    pngs = []
    for im in images:
        b = io.BytesIO()
        im.save(b, format="PNG")
        pngs.append(b.getvalue())
    header = struct.pack("<HHH", 0, 1, len(images))
    entries = b""
    data = b""
    offset = 6 + 16 * len(images)
    for im, png in zip(images, pngs):
        w = im.width if im.width < 256 else 0
        h = im.height if im.height < 256 else 0
        entries += struct.pack("<BBBBHHII", w, h, 0, 0, 1, 32,
                               len(png), offset + len(data))
        data += png
    return header + entries + data


sizes = [16, 24, 32, 48, 64, 128, 256]
bdata = build_ico([draw_brand_mark(s) for s in sizes])
with open("brand-mark.ico", "wb") as f:
    f.write(bdata)
fdata = build_ico([draw_favicon(s) for s in sizes])
with open("favicon.ico", "wb") as f:
    f.write(fdata)
print("wrote brand-mark.ico and favicon.ico")
