# ลดขนาดไฟล์สไปรต์ (ภาพ base64 ในไฟล์ .js) ให้โหลดเร็วขึ้นบนมือถือ
#   - เข้ารหัส PNG ใหม่แบบพาเลต (สีไม่เกิน 256 = ไม่เสียคุณภาพเลย)
#   - ภาพที่สีเกิน 256 (มอนสเตอร์ภาพละเอียด) ลดเหลือ 256 สีได้ด้วย --quant (ไม่ใช้กับตัวละครผู้เล่นที่ต้องย้อมสี)
#   - --drop ลบชีตที่ไม่ได้ใช้แล้วออกจากไฟล์
# วิธีรัน (จากโฟลเดอร์ game):
#   python tools/slim_sprites.py pixel_sprites.js --drop kk_knight,kk_mage,kk_ranger,kk_rogue
#   python tools/slim_sprites.py monsters_cp.js --quant
#   python tools/slim_sprites.py vfx.js
import base64, io, re, sys
from PIL import Image

def smallest_png(data, quant):
    im = Image.open(io.BytesIO(data)).convert('RGBA')
    outs = []
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True); outs.append(b.getvalue())
    colors = im.getcolors(256)
    if colors is not None:                      # <=256 สี: ทำพาเลตแบบตรงทุกพิกเซล (lossless)
        pal = Image.new('P', im.size)
        lut = {c: i for i, (_, c) in enumerate(colors)}
        pal.putdata([lut[p] for p in im.getdata()])
        flat = []
        for _, (r, g, bb, a) in colors: flat += [r, g, bb]
        pal.putpalette(flat + [0] * (768 - len(flat)))
        b = io.BytesIO(); pal.save(b, 'PNG', optimize=True, transparency=bytes(a for _, (_, _, _, a) in colors)); outs.append(b.getvalue())
    elif quant:                                 # สีเยอะ: ลดเหลือ 256 สี (ไม่ทำ dithering ให้ขอบคม)
        q = im.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
        b = io.BytesIO(); q.save(b, 'PNG', optimize=True); outs.append(b.getvalue())
    best = min(outs, key=len)
    return best if len(best) < len(data) else data

def main():
    path = sys.argv[1]; quant = '--quant' in sys.argv
    drop = []
    if '--drop' in sys.argv: drop = sys.argv[sys.argv.index('--drop') + 1].split(',')
    src = open(path, encoding='utf-8').read(); before = len(src)
    for k in drop:   # ลบทั้งก้อน "key":{...}  (ก้อนข้อมูลชีตไม่มีวงเล็บซ้อนลึกเกิน anims)
        m = re.search(r'"%s":\{"img":"data:image/png;base64,[A-Za-z0-9+/=]+".*?\}\}\}' % re.escape(k), src)
        if not m: print('ไม่พบ', k); continue
        s, e = m.span()
        if src[e:e+1] == ',': e += 1
        elif src[s-1:s] == ',': s -= 1
        src = src[:s] + src[e:]; print('ลบ', k)
    def rep(m):
        raw = base64.b64decode(m.group(1)); new = smallest_png(raw, quant)
        return 'data:image/png;base64,' + base64.b64encode(new).decode()
    src = re.sub(r'data:image/png;base64,([A-Za-z0-9+/=]+)', rep, src)
    open(path, 'w', encoding='utf-8', newline='').write(src)
    print(f'{path}: {before//1024} KB -> {len(src)//1024} KB')

main()
