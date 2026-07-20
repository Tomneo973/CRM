#!/usr/bin/env python3
"""
Regenere une version unique et autonome (single-file) de l'app a partir
des fichiers modulaires (index.html + css/ + js/).

Usage :
    python3 build.py

Produit : dist/onboard-crm-standalone.html
Aucune dependance requise (Python standard uniquement).
"""
import re
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'index.html')
OUT_DIR = os.path.join(ROOT, 'dist')
OUT_FILE = os.path.join(OUT_DIR, 'onboard-crm-standalone.html')

SCRIPT_SRC_RE = re.compile(r'<script src="([^"]+)"></script>')
LINK_CSS_RE = re.compile(r'<link rel="stylesheet" href="([^"]+)">')


def is_local(path):
    return not (path.startswith('http://') or path.startswith('https://'))


def inline_scripts(html):
    def repl(m):
        src = m.group(1)
        if not is_local(src):
            return m.group(0)  # keep CDN scripts as-is
        filepath = os.path.join(ROOT, src)
        with open(filepath, encoding='utf-8') as f:
            content = f.read()
        return '<script>\n' + content + '\n</script>'
    return SCRIPT_SRC_RE.sub(repl, html)


def inline_styles(html):
    def repl(m):
        href = m.group(1)
        if not is_local(href):
            return m.group(0)
        filepath = os.path.join(ROOT, href)
        with open(filepath, encoding='utf-8') as f:
            content = f.read()
        return '<style>\n' + content + '\n</style>'
    return LINK_CSS_RE.sub(repl, html)


def main():
    with open(SRC, encoding='utf-8') as f:
        html = f.read()
    html = inline_scripts(html)
    html = inline_styles(html)
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        f.write(html)
    size_kb = os.path.getsize(OUT_FILE) / 1024
    print(f"OK -> {OUT_FILE} ({size_kb:.1f} Ko)")


if __name__ == '__main__':
    main()
