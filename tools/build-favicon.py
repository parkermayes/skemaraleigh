#!/usr/bin/env python3
"""Generates the rocket favicon in SKEMA colors.

One geometry definition drives both outputs, so the SVG and the PNG fallbacks
can never drift apart. Run: python3 tools/build-favicon.py
"""
import math, os, zlib, struct

INK   = (0x26, 0x26, 0x26)
RED   = (0xE7, 0x43, 0x3C)
DEEP  = (0xC9, 0x34, 0x2E)
PAPER = (0xF7, 0xF5, 0xF4)
TILE  = (0xEF, 0xEC, 0xEA)   # light tile, like a rounded app icon
S = 128  # logical canvas
ANGLE = 45                   # rocket flies up and to the right
ZOOM  = 0.76                 # shrink so the rotated hull still clears the tile

# ---------------------------------------------------------------- geometry
def body_outline():
    """Rocket hull: smooth nose cone, straight flank, slight taper at the base."""
    left, right = [], []
    for i in range(81):
        y = 18 + (106 - 18) * i / 80
        if y <= 58:                                    # nose
            w = 20 * math.sin(math.pi / 2 * (y - 18) / 40)
        elif y <= 92:                                  # flank
            w = 20.0
        else:                                          # base taper
            w = 20 - 6 * ((y - 92) / 14) ** 1.5
        left.append((64 - w, y))
        right.append((64 + w, y))
    return left + right[::-1]

def place(pts):
    """Rotate about the canvas centre by ANGLE, then scale by ZOOM."""
    t = math.radians(ANGLE)
    cos, sin = math.cos(t), math.sin(t)
    out = []
    for x, y in pts:
        dx, dy = x - 64, y - 64
        rx = dx * cos - dy * sin
        ry = dx * sin + dy * cos
        out.append((64 + rx * ZOOM, 64 + ry * ZOOM))
    return out

SHAPES = [
    ('poly', place(body_outline()), RED),
    ('poly', place([(44, 74), (26, 104), (44, 97)]), DEEP),     # trailing fin
    ('poly', place([(84, 74), (102, 104), (84, 97)]), DEEP),    # leading fin
    ('poly', place([(56, 104), (64, 124), (72, 104)]), INK),    # exhaust
    ('circle', place([(64, 55)])[0] + (11 * ZOOM,), PAPER),     # window
]

# ------------------------------------------------------------------- SVG
def emit_svg(path):
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}">',
        f'  <rect width="{S}" height="{S}" rx="28" fill="rgb{TILE}"/>',
    ]
    for kind, data, color in SHAPES:
        if kind == 'poly':
            pts = ' '.join(f'{x:.2f},{y:.2f}' for x, y in data)
            parts.append(f'  <polygon points="{pts}" fill="rgb{color}"/>')
        else:
            cx, cy, r = data
            parts.append(f'  <circle cx="{cx}" cy="{cy}" r="{r}" fill="rgb{color}"/>')
    parts.append('</svg>')
    open(path, 'w').write('\n'.join(parts) + '\n')
    return path

# ------------------------------------------------------------------- PNG
def inside_poly(pts, x, y):
    hit = False
    n = len(pts)
    for i in range(n):
        x0, y0 = pts[i]
        x1, y1 = pts[(i + 1) % n]
        if (y0 > y) != (y1 > y):
            xi = x0 + (y - y0) / (y1 - y0) * (x1 - x0)
            if x < xi:
                hit = not hit
    return hit

def emit_png(path, size, ss=4):
    """Supersampled `ss` times per axis, then box-filtered down for clean edges."""
    n = size * ss
    scale = S / n
    radius = 28 * n / S
    px = [[(0, 0, 0, 0)] * n for _ in range(n)]

    for j in range(n):
        y = (j + 0.5) * scale
        for i in range(n):
            x = (i + 0.5) * scale
            # rounded-square background
            dx = max(28 - x, x - (S - 28), 0)
            dy = max(28 - y, y - (S - 28), 0)
            if dx * dx + dy * dy > 28 * 28:
                continue
            col = TILE
            for kind, data, c in SHAPES:
                if kind == 'poly':
                    if inside_poly(data, x, y):
                        col = c
                else:
                    cx, cy, r = data
                    if (x - cx) ** 2 + (y - cy) ** 2 <= r * r:
                        col = c
            px[j][i] = (*col, 255)

    rows = bytearray()
    for j in range(size):
        rows.append(0)
        for i in range(size):
            acc = [0, 0, 0, 0]
            for dj in range(ss):
                for di in range(ss):
                    p = px[j * ss + dj][i * ss + di]
                    for k in range(4):
                        acc[k] += p[k]
            rows.extend(bytes(v // (ss * ss) for v in acc))

    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)

    png = (b'\x89PNG\r\n\x1a\n'
           + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0))
           + chunk(b'IDAT', zlib.compress(bytes(rows), 9))
           + chunk(b'IEND', b''))
    open(path, 'wb').write(png)
    return path

if __name__ == '__main__':
    here = os.path.join(os.path.dirname(__file__), '..', 'assets')
    print('wrote', emit_svg(os.path.join(here, 'favicon.svg')))
    for sz in (32, 180):
        print('wrote', emit_png(os.path.join(here, f'favicon-{sz}.png'), sz))
