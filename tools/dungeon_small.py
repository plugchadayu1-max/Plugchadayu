# ดันเจี้ยน: ลดขนาดห้องลง (22x20 -> 14x13 ช่อง) ให้มอนสเตอร์ 100 ตัวไล่ถึงผู้เล่นได้ทุกตัว
import os
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b):
    if a not in t: raise SystemExit('missing: ' + a[:90])
    return t.replace(a, b, 1)
w = rd('f_world.js')
if 'x>=9&&x<=22' in w: raise SystemExit('already applied')
w = rep(w, "    if(y>=5&&y<=24&&x>=5&&x<=26)ch=((x+y)%7===0&&(x<8||x>23||y<8||y>21)?',':'.');\n    if((x===9||x===22)&&(y===9||y===20))ch='r';\n    if((x===15||x===16)&&y===14)ch='r';\n",
        "    if(y>=12&&y<=24&&x>=9&&x<=22)ch=((x+y)%7===0&&(x<12||x>19||y<15||y>21)?',':'.');   // ห้องเล็ก 14x13 ช่อง ต่อกับเมืองด้านล่าง\n    if((x===10||x===21)&&(y===13||y===22))ch='r';   // เสาหินมุมห้อง (ไม่มีสิ่งกีดขวางกลางห้อง)\n")
w = rep(w, "const x=rnd(6.5,25.5)*CELL,y=rnd(6.5,22.5)*CELL;if(walkable(x,y)&&dist({x,y},P)>(boss?500:380)&&!nearTown(x,y))pos={x,y}}",
           "const x=rnd(9.6,21.4)*CELL,y=rnd(12.6,23.4)*CELL;if(walkable(x,y)&&reachable(x,y)&&dist({x,y},P)>(boss?420:300)&&!nearTown(x,y))pos={x,y}}")
w = rep(w, "if(!pos)pos={x:2304+rnd(-300,300),y:1800+rnd(-200,200)};", "if(!pos)pos={x:15.5*CELL+rnd(-300,300),y:17*CELL+rnd(-200,200)};")
wr('f_world.js', w)
print('ok')
