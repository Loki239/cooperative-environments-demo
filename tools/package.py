"""Build a single-file offline copy and a portable static-site archive."""
import json
from pathlib import Path
import re
import zipfile

SITE = Path(__file__).resolve().parents[1]
ROOT = SITE.parents[1]
import os
OUT = Path(os.environ.get('ENVIRONMENT_LAB_PACKAGE_OUT', str(SITE.parent / 'environment-lab-package')))

data = {str(path.relative_to(SITE)): json.loads(path.read_text())
        for path in SITE.rglob('*.json')}
html = (SITE / 'index.html').read_text()
html = re.sub(r'<link rel="stylesheet" href="styles\.css(?:\?[^"]*)?">', lambda _: '<style>' + (SITE / 'styles.css').read_text() + '</style>', html)
for name in ['engine.js', 'scenes.js', 'core-scenes.js', 'e113-scene.js', 'catalogue-scenes.js', 'legacy-action-targets.js', 'action-targets.js', 'action-overlay.js', 'communication-scene.js', 'established-engine.js', 'established-ui.js', 'app.js']:
    js = (SITE / name).read_text()
    assert '</script' not in js.lower()
    html = re.sub(r'<script defer src="' + re.escape(name) + r'(?:\?[^"]*)?"></script>', '', html)
bootstrap = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
scripts = '<script>window.ENVIRONMENT_LAB_EMBEDDED=' + bootstrap + ';</script>\n'
scripts += '\n'.join('<script>' + (SITE / name).read_text() + '</script>' for name in ['engine.js', 'scenes.js', 'core-scenes.js', 'e113-scene.js', 'catalogue-scenes.js', 'legacy-action-targets.js', 'action-targets.js', 'action-overlay.js', 'communication-scene.js', 'established-engine.js', 'established-ui.js', 'app.js'])
html = html.replace('</body>', scripts + '\n</body>')
html = '\n'.join(line.rstrip() for line in html.splitlines()) + '\n'
(SITE / 'offline.html').write_text(html)
OUT.mkdir(parents=True, exist_ok=True)
archive = OUT / 'environment-lab.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
    for path in sorted(SITE.rglob('*')):
        if path.is_file() and '__pycache__' not in path.parts:
            z.write(path, 'environment-lab/' + str(path.relative_to(SITE)))
print(json.dumps({'offline_bytes': (SITE / 'offline.html').stat().st_size, 'archive_bytes': archive.stat().st_size}))
