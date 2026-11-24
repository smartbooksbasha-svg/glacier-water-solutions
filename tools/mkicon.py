#!/usr/bin/env python3
"""Generate Glacier Water Solutions icons with pure stdlib (no Pillow)."""
import os, struct, zlib

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'icons'))
TOP = (11, 34, 48)
BOT = (20, 71, 92)
CYAN = (103, 232, 249)
WHITE = (255, 255, 255)


def lerp(a, b, t):
    return (a[0] + (b[0]-a[0])*t, a[1] + (b[1]-a[1])*t, a[2] + (b[2]-a[2])*t)


def in_round(x, y, r):
    if x < 0 or x > 1 or y < 0 or y > 1:
        return False
    if x < r and y < r:
        return (x-r)**2 + (y-r)**2 <= r*r
    if x > 1-r and y < r:
        return (x-(1-r))**2 + (y-r)**2 <= r*r
    if x < r and y > 1-r:
        return (x-r)**2 + (y-(1-r))**2 <= r*r
    if x > 1-r and y > 1-r:
        return (x-(1-r))**2 + (y-(1-r))**2 <= r*r
    return True


def circ(x, y, cx, cy, r):
    return (x-cx)**2 + (y-cy)**2 <= r*r


def drop(x, y, s):
    cx = 0.5 + (x-0.5)/s
    cy = 0.5 + (y-0.5)/s
    if circ(cx, cy, 0.5, 0.62, 0.245):
        return True
    if 0.17 <= cy < 0.62:
        w = 0.245 * ((cy-0.17)/0.45)
        return abs(cx-0.5) <= w
    return False


def chunk(tag, data):
    return (struct.pack('>I', len(data)) + tag + data
            + struct.pack('>I', zlib.crc32(tag+data) & 0xFFFFFFFF))


def png(size, rows):
    raw = b''.join(b'\x00' + r for r in rows)
    return (b'\x89PNG\r\n\x1a\n'
            + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(raw, 9))
            + chunk(b'IEND', b''))


def render(size, rounded=True, scale=1.0):
    ss = 3
    n = ss*ss
    rows = []
    for py in range(size):
        row = bytearray()
        for px in range(size):
            pr = pg = pb = pa = 0.0
            for sy in range(ss):
                for sx in range(ss):
                    x = (px + (sx+0.5)/ss)/size
                    y = (py + (sy+0.5)/ss)/size
                    if rounded and not in_round(x, y, 0.225):
                        continue
                    col = lerp(TOP, BOT, y)
                    if drop(x, y, scale):
                        col = CYAN
                    if circ(x, y, 0.5+(0.43-0.5)/scale, 0.5+(0.55-0.5)/scale, 0.045/scale):
                        col = WHITE
                    pr += col[0]*255; pg += col[1]*255; pb += col[2]*255; pa += 255
            if pa == 0:
                row += b'\x00\x00\x00\x00'
            else:
                row += bytes((round(pr/pa), round(pg/pa), round(pb/pa), round(pa/n)))
        rows.append(bytes(row))
    return png(size, rows)


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, size, rounded, scale in [
        ('icon-32.png', 32, True, 1.0),
        ('icon-192.png', 192, True, 1.0),
        ('icon-512.png', 512, True, 1.0),
        ('maskable-512.png', 512, False, 0.78),
        ('apple-touch-icon.png', 180, False, 0.88),
    ]:
        path = os.path.normpath(os.path.join(OUT, name))
        with open(path, 'wb') as fh:
            fh.write(render(size, rounded, scale))
        print(name, os.path.getsize(path), 'bytes')


if __name__ == '__main__':
    main()
