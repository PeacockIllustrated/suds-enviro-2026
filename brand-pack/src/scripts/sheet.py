"""Contact sheet of rendered pages: python3 sheet.py out.jpg from to [cols] [w]"""
import sys, glob, os
from PIL import Image
out, a, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 2
W = int(sys.argv[5]) if len(sys.argv) > 5 else 1000
H = round(W * 990 / 1400)
d = os.path.join(os.path.dirname(__file__), '..', '..', 'pages')
fs = [os.path.join(d, f'page-{i:02d}.jpg') for i in range(a, b + 1) if os.path.exists(os.path.join(d, f'page-{i:02d}.jpg'))]
rows = (len(fs) + cols - 1) // cols
S = Image.new('RGB', (cols * W + (cols + 1) * 10, rows * H + (rows + 1) * 10), '#888')
for i, f in enumerate(fs):
    S.paste(Image.open(f).resize((W, H)), (10 + (i % cols) * (W + 10), 10 + (i // cols) * (H + 10)))
S.save(out, quality=85)
