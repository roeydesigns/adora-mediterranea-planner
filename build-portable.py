"""Build the standalone offline planner with embedded code and source images."""
from pathlib import Path
import base64
import json
import re

root = Path(__file__).resolve().parent
dist = root / 'dist'
html = (dist / 'index.html').read_text()
html = re.sub(r'<link rel="stylesheet" href="style.css[^\"]*">', lambda _: '<style>' + (dist / 'style.css').read_text() + '</style>', html)
html = re.sub(r'<script defer src="(offers|groups)\.js"></script>', lambda m: '<script>' + (dist / (m[1] + '.js')).read_text() + '</script>', html)
html = re.sub(r'<script defer src="app\.js[^\"]*"></script>', '', html)
script = (dist / 'app.js').read_text().replace("$('source-image').src=link.href;", "$('source-image').src=window.ADORA_IMAGES[link.getAttribute('href')]||link.href;")
html = html.replace('</body>', '<script>' + script + '</script></body>')
images = {}
for name in ['wifi.png', 'beverages.jpg', 'miyakojima-oct21.jpg', 'naha-oct21.jpg']:
    source = dist / 'sources' / name
    mime = 'image/png' if source.suffix == '.png' else 'image/jpeg'
    images['sources/' + name] = 'data:' + mime + ';base64,' + base64.b64encode(source.read_bytes()).decode()
html = html.replace('</head>', '<script>window.ADORA_IMAGES=' + json.dumps(images) + '</script></head>')
html = html.replace('href="sources/wifi.png"', 'data-image-open href="sources/wifi.png"')
(root / 'adora-cruise-planner.html').write_text(html)
