"""Writes the Tikify logo files (SVG) into this folder. The wordmark is outlined from Inter
(fonts/Inter-Variable.woff2 at ExtraBold), so the files need no font installed.

    pip install fonttools brotli uharfbuzz
    python3 design/logo/make_logo.py
    node design/future-look/render.js logo      # the PNGs, from these SVGs
"""
import io
import os

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, '..', '..', 'fonts', 'Inter-Variable.woff2')

INK = '#08070b'
WHITE = '#f6f3f8'
STOPS = [(0, '#ff7a45'), (.5, '#ff2d7a'), (1, '#8b5cff')]  # ember → magenta → violet


# ---------- the mark: five sound bars whose heights trace a play triangle (100 × 100 grid) ----------
def bars():
    out = []
    for i in range(5):
        x = 25 + i * 12
        cx = x + 4
        h = max(8, 2 * 31 * (83 - cx) / (83 - 25))
        out.append((x, 50 - h / 2, 8, h))
    return out


def bar_rects(fill):
    return ''.join(f'<rect x="{x:g}" y="{y:.2f}" width="{w:g}" height="{h:.2f}" rx="4" fill="{fill}"/>' for x, y, w, h in bars())


def gradient(id_):
    stops = ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in STOPS)
    return f'<linearGradient id="{id_}" x1="0" y1="0" x2="1" y2="1">{stops}</linearGradient>'


def icon_body(glow=True):
    """The app icon on the 100 grid: dark rounded square, glowing gradient bars."""
    return f'''<defs>{gradient('g')}
    <radialGradient id="bg" cx=".3" cy=".2" r="1"><stop offset="0" stop-color="#2a2333"/><stop offset="1" stop-color="#07060a"/></radialGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="100" height="100" rx="23" fill="url(#bg)"/>
  <rect x=".5" y=".5" width="99" height="99" rx="22.5" fill="none" stroke="#fff" stroke-opacity=".12"/>
  <g{' filter="url(#glow)"' if glow else ''}>{bar_rects('url(#g)')}</g>'''


# ---------- the wordmark, outlined ----------
def load_font():
    font = TTFont(FONT)
    static = instancer.instantiateVariableFont(font, {'wght': 800, 'opsz': 32})
    buf = io.BytesIO()
    static.flavor = None
    static.save(buf)
    return static, buf.getvalue()


def wordmark(size, tracking=-.03):
    """'Tikify' as one SVG path at font size `size`, baseline at y=0. Returns (d, width, cap height)."""
    font, data = load_font()
    upem = font['head'].unitsPerEm
    face = hb.Face(data)
    hbfont = hb.Font(face)
    buf = hb.Buffer()
    buf.add_str('Tikify')
    buf.guess_segment_properties()
    hb.shape(hbfont, buf, {'kern': True, 'cv11': True, 'ss01': True})
    glyphs = font.getGlyphSet()
    order = font.getGlyphOrder()
    k = size / upem
    pen = SVGPathPen(glyphs)
    x = 0
    n = len(buf.glyph_infos)
    for i, (info, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
        name = order[info.codepoint]
        glyphs[name].draw(TransformPen(pen, (k, 0, 0, -k, x + pos.x_offset * k, -pos.y_offset * k)))
        x += pos.x_advance * k + (tracking * size if i < n - 1 else 0)
    cap = font['OS/2'].sCapHeight * k
    return pen.getCommands(), x, cap


def svg(w, h, body, vb=None):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w:g}" height="{h:g}" viewBox="{vb or f"0 0 {w:g} {h:g}"}">\n  {body}\n</svg>\n'


def write(name, text):
    with open(os.path.join(HERE, name), 'w') as f:
        f.write(text)
    print('wrote', name)


def main():
    # App icon, and the bars alone (gradient, white) on a tight square around them.
    write('tikify-icon.svg', svg(1024, 1024, icon_body(), '0 0 100 100'))
    x0, y0 = 25, min(y for _, y, _, _ in bars())
    side = max(81 - x0, 100 - 2 * y0)
    pad = side * .08
    vb = f'{x0 - pad - (side - (81 - x0)) / 2:.2f} {y0 - pad:.2f} {side + 2 * pad:.2f} {side + 2 * pad:.2f}'
    write('tikify-mark.svg', svg(1024, 1024, f'<defs>{gradient("g")}</defs>{bar_rects("url(#g)")}', vb))
    write('tikify-mark-white.svg', svg(1024, 1024, bar_rects('#ffffff'), vb))

    # Lockups: icon + wordmark, as in the app (the type is .72 of the icon, 22% of it apart).
    d, tw, cap = wordmark(72)
    gap, pad = 22, 10
    base = 50 + cap / 2  # the capitals centred on the icon
    w = pad + 100 + gap + tw + pad
    h = 100 + 2 * pad
    for name, color in [('tikify-lockup.svg', WHITE), ('tikify-lockup-on-light.svg', INK)]:
        body = f'<g transform="translate({pad} {pad})">{icon_body()}</g>' \
               f'<path transform="translate({pad + 100 + gap:.2f} {pad + base:.2f})" fill="{color}" d="{d}"/>'
        write(name, svg(round(w * 4), round(h * 4), body, f'0 0 {w:.2f} {h:.2f}'))

    # The wordmark on its own.
    d, tw, cap = wordmark(100)
    font, _ = load_font()
    desc = -font['OS/2'].sTypoDescender * 100 / font['head'].unitsPerEm
    asc = font['OS/2'].sTypoAscender * 100 / font['head'].unitsPerEm
    for name, color in [('tikify-wordmark.svg', WHITE), ('tikify-wordmark-on-light.svg', INK)]:
        body = f'<path transform="translate(4 {asc:.2f})" fill="{color}" d="{d}"/>'
        write(name, svg(round((tw + 8) * 8), round((asc + desc) * 8), body, f'0 0 {tw + 8:.2f} {asc + desc:.2f}'))


if __name__ == '__main__':
    main()
