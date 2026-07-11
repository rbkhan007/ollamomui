import math
from PIL import Image, ImageDraw

CYAN = (0, 240, 255, 255)
PURPLE = (139, 92, 246, 255)

# NOTE: intentionally NO dark background fill — icons are transparent so they
# blend with both light and dark UI surfaces (matches brand-mark.svg / favicon.svg).


def gradient_layer(size, c1, c2):
    base = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    px = base.load()
    for y in range(size):
        t = y / max(1, size - 1)
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        for x in range(size):
            px[x, y] = (r, g, b, 255)
    return base


def hex_points(cx, cy, r):
    pts = []
    for i in range(6):
        a = math.radians(-90 + i * 60)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def draw_brand_mark(size):
    SS = 4
    s = (size * SS) / 64.0
    img = Image.new("RGBA", (size * SS, size * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = 32 * s, 32 * s

    def P(pts):
        return [(cx + x * s, cy + y * s) for x, y in pts]

    # outer hexagon (transparent fill + cyan stroke)
    outer = [(0, -24), (21, -12), (21, 12), (0, 24), (-21, 12), (-21, -12)]
    d.polygon(P(outer), outline=CYAN, width=max(2, int(2 * s)))
    # inner hexagon outline (purple, thin)
    inner = [(0, -18), (16, -9), (16, 9), (0, 18), (-16, 9), (-16, -9)]
    d.line(P(inner) + [P(inner)[0]], fill=PURPLE, width=max(1, int(1 * s)))
    # lightning bolt (cyan -> purple gradient)
    bolt = [(-6, -10), (6, -10), (3, -2), (8, -2), (-6, 12), (-3, 3), (-9, 3)]
    grad = gradient_layer(img.width, CYAN, PURPLE)
    mask = Image.new("L", (img.width, img.height), 0)
    ImageDraw.Draw(mask).polygon(P(bolt), fill=255)
    bolt_img = Image.new("RGBA", (img.width, img.height), (0, 0, 0, 0))
    bolt_img.paste(grad, (0, 0), mask)
    img = Image.alpha_composite(img, bolt_img)
    d = ImageDraw.Draw(img)
    # network nodes
    for i, pt in enumerate(hex_points(cx, cy, 24 * s)):
        col = CYAN if i % 2 == 0 else PURPLE
        d.ellipse([pt[0] - 2 * s, pt[1] - 2 * s, pt[0] + 2 * s, pt[1] + 2 * s], fill=col)
    # central core
    d.ellipse([cx - 3 * s, cy - 3 * s, cx + 3 * s, cy + 3 * s], fill=CYAN)

    return img.resize((size, size), Image.LANCZOS)


def draw_favicon(size):
    SS = 4
    s = (size * SS) / 32.0
    img = Image.new("RGBA", (size * SS, size * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = 16 * s, 16 * s

    # hexagon outline (transparent background)
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
