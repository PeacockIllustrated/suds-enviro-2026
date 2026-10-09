import sys,glob,os
from PIL import Image, ImageDraw
fmt=sys.argv[1]; out=sys.argv[2]; cols=int(sys.argv[3]) if len(sys.argv)>3 else 7
fs=sorted(glob.glob(f'stills/{fmt}-*.jpg'),key=lambda f:float(f.split('-')[-1][:-4])); lo,hi=(float(sys.argv[4]),float(sys.argv[5])) if len(sys.argv)>5 else (0,99); fs=[f for f in fs if lo<=float(f.split('-')[-1][:-4])<hi]
w=300 if fmt=='portrait' else 480
ims=[Image.open(f) for f in fs]; h=int(w*ims[0].height/ims[0].width)
rows=(len(ims)+cols-1)//cols
S=Image.new('RGB',(cols*(w+6),rows*(h+28)),'#333'); d=ImageDraw.Draw(S)
for i,(f,im) in enumerate(zip(fs,ims)):
    c,r=i%cols,i//cols; S.paste(im.resize((w,h)),(c*(w+6),r*(h+28)+22)); d.text((c*(w+6)+4,r*(h+28)+4),f.split('-')[-1][:-4],fill='white')
S.save(out,quality=80)
