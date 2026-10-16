# แปลงมอนสเตอร์จาก photo/craftpix-* เป็นชีตสไปรต์ -> game/monsters_cp.js (window.SPRITES เพิ่มเติม)
#   powershell -ExecutionPolicy Bypass -File game\tools\build_monsters.ps1
# - ชุดเฟรม (ปีศาจ/มังกร/จินน์/กิ้งก่า/เมดูซ่า/โทรลล์): ย่อให้สูงพอดีเกม หันขวา + กลับด้านเป็นหันซ้าย
# - ไอคอน 32x32: สร้างท่า idle/walk/attack/hurt/death เอง (เด้ง พุ่ง จาง)
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System; using System.Drawing; using System.Drawing.Imaging; using System.Drawing.Drawing2D; using System.Runtime.InteropServices;
public static class MB {
  public static Bitmap Load(string p){ using(var i=Image.FromFile(p)){ var b=new Bitmap(i.Width,i.Height,PixelFormat.Format32bppArgb); using(var g=Graphics.FromImage(b)) g.DrawImage(i,0,0,i.Width,i.Height); return b; } }
  static int[] Px(Bitmap b){ var d=b.LockBits(new Rectangle(0,0,b.Width,b.Height),ImageLockMode.ReadOnly,PixelFormat.Format32bppArgb); var a=new int[b.Width*b.Height]; Marshal.Copy(d.Scan0,a,0,a.Length); b.UnlockBits(d); return a; }
  static void Put(Bitmap b,int[] a){ var d=b.LockBits(new Rectangle(0,0,b.Width,b.Height),ImageLockMode.WriteOnly,PixelFormat.Format32bppArgb); Marshal.Copy(a,0,d.Scan0,a.Length); b.UnlockBits(d); }
  // กรอบเนื้อภาพ [x0,y0,x1,y1] (รวมขอบ)
  public static int[] BBox(Bitmap b){ var a=Px(b); int w=b.Width,h=b.Height,x0=w,y0=h,x1=-1,y1=-1;
    for(int y=0;y<h;y++)for(int x=0;x<w;x++)if(((a[y*w+x]>>24)&255)>40){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
    return new int[]{x0,y0,x1,y1}; }
  // ภาพพิกเซลที่ขยายมาแล้ว: หาขนาดบล็อก (4/3/2) จากความซ้ำของพิกเซล
  public static int Block(Bitmap b){ var a=Px(b); int w=b.Width,h=b.Height;
    for(int k=4;k>=2;k--)for(int ox=0;ox<k;ox++)for(int oy=0;oy<k;oy++){ long n=0,bad=0;
      for(int y=oy;y<h;y++)for(int x=ox;x<w;x++){int p=a[y*w+x];if(((p>>24)&255)<40)continue;n++;int q=a[(y-(y-oy)%k)*w+(x-(x-ox)%k)];if(p!=q)bad++;}
      if(n>50&&bad<n*0.02)return k; }
    return 1; }
  // ย่อ/ขยาย: nearest (ภาพพิกเซล) หรือ bicubic + ตัดอัลฟาให้ขอบคม (ภาพความละเอียดสูง)
  public static Bitmap Scale(Bitmap s,double f,bool hq){ int w=Math.Max(1,(int)Math.Round(s.Width*f)),h=Math.Max(1,(int)Math.Round(s.Height*f));
    var b=new Bitmap(w,h,PixelFormat.Format32bppArgb);
    using(var g=Graphics.FromImage(b)){ g.InterpolationMode=hq?InterpolationMode.HighQualityBicubic:InterpolationMode.NearestNeighbor; g.PixelOffsetMode=PixelOffsetMode.Half; g.DrawImage(s,new Rectangle(0,0,w,h),0,0,s.Width,s.Height,GraphicsUnit.Pixel); }
    if(hq){ var a=Px(b); for(int i=0;i<a.Length;i++){int al=(a[i]>>24)&255; if(al<110)a[i]=0; else { int r=(a[i]>>16)&255,gg=(a[i]>>8)&255,bb=a[i]&255; if(al<255){r=Math.Min(255,r*255/al);gg=Math.Min(255,gg*255/al);bb=Math.Min(255,bb*255/al);} a[i]=(255<<24)|(r<<16)|(gg<<8)|bb; } } Put(b,a); }
    return b; }
  public static Bitmap Crop(Bitmap s,int x,int y,int w,int h,bool flip){ var b=new Bitmap(w,h,PixelFormat.Format32bppArgb);
    using(var g=Graphics.FromImage(b)){ g.InterpolationMode=InterpolationMode.NearestNeighbor; g.PixelOffsetMode=PixelOffsetMode.Half; g.DrawImage(s,new Rectangle(0,0,w,h),x,y,w,h,GraphicsUnit.Pixel); }
    if(flip)b.RotateFlip(RotateFlipType.RotateNoneFlipX); return b; }
  // วาดไอคอนลงช่อง: เลื่อน dx,dy  บีบสูง sy (ยึดเท้า)  ความทึบ al  ย้อมขาว wt
  public static Bitmap IconFrame(Bitmap ic,int cw,int ch,int ox,int oy,int dx,int dy,double sy,double al,bool flip){
    var b=new Bitmap(cw,ch,PixelFormat.Format32bppArgb); int h=(int)Math.Round(ic.Height*sy);
    using(var g=Graphics.FromImage(b)){ g.InterpolationMode=InterpolationMode.NearestNeighbor; g.PixelOffsetMode=PixelOffsetMode.Half;
      var cm=new ColorMatrix(); cm.Matrix33=(float)al; var ia=new ImageAttributes(); ia.SetColorMatrix(cm);
      g.DrawImage(ic,new Rectangle(ox+dx,oy+dy+(ic.Height-h),ic.Width,h),0,0,ic.Width,ic.Height,GraphicsUnit.Pixel,ia); }
    if(flip)b.RotateFlip(RotateFlipType.RotateNoneFlipX); return b; }
  public static string Sheet(Bitmap[] fr,int cols,int cw,int ch){ int rows=(fr.Length+cols-1)/cols; var b=new Bitmap(cols*cw,rows*ch,PixelFormat.Format32bppArgb);
    using(var g=Graphics.FromImage(b)){ for(int i=0;i<fr.Length;i++) g.DrawImageUnscaled(fr[i],(i%cols)*cw,(i/cols)*ch); }
    using(var ms=new System.IO.MemoryStream()){ b.Save(ms,ImageFormat.Png); return Convert.ToBase64String(ms.ToArray()); } }
}
'@

$root = Split-Path (Split-Path $PSScriptRoot)          # D:\2.SCHOOL\start 011069
$ph = Join-Path $root 'photo'
$P5 = "$ph\craftpix-561178-free-rpg-monster-sprites-pixel-art\PNG"
$TA = "$ph\craftpix-639714-2d-game-troll-free-character-sprites\PNG\Animation"
$TB = "$ph\craftpix-986711\_PNG"
$IL = "$ph\craftpix-net-459799\PNG\Transperent"
$IC = "$ph\craftpix-net-737210\PNG\Transperent"
$ANIMS = 'idle','walk','attack','hurt','death'

# ชุดเฟรม: key, โฟลเดอร์, ชื่อไฟล์แต่ละท่า (regex), ภาพพิกเซลหรือไม่, ความสูงเป้าหมาย (พิกเซลอาร์ต)
$FRAMES = @(
  @{k='cp_demon';  d="$P5\demon";        m=@{idle='^Idle';walk='^Walk';attack='^Attack';hurt='^Hurt';death='^Death'}; px=$true; h=40},
  @{k='cp_dragon'; d="$P5\dragon";       m=@{idle='^Idle';walk='^Walk';attack='^Fire_Attack';hurt='^Hurt';death='^Death'}; px=$true; h=40},
  @{k='cp_jinn';   d="$P5\jinn_animation";m=@{idle='^Idle';walk='^Flight';attack='^Magic_Attack';hurt='^Hurt';death='^Death'}; px=$true; h=42},
  @{k='cp_lizard'; d="$P5\lizard";       m=@{idle='^Idle';walk='^Walk';attack='^Attack';hurt='^Hurt';death='^Death'}; px=$true; h=32},
  @{k='cp_medusa'; d="$P5\medusa";       m=@{idle='^Idle';walk='^Walk';attack='^Attack';hurt='^Hurt';death='^Death'}; px=$true; h=40},
  @{k='cp_sdragon';d="$P5\small_dragon"; m=@{idle='^Idle';walk='^Walk';attack='^Fire_Attack';hurt='^Hurt';death='^Death'}; px=$true; h=26},
  @{k='cp_trollA1';d="$TA\Troll1";       m=@{idle='^Idle_';walk='^Walk_';attack='^Attack_';hurt='^Hurt_';death='^Dead_'}; px=$false; h=56},
  @{k='cp_trollA2';d="$TA\Troll2";       m=@{idle='^Idle_';walk='^Walk_';attack='^Attack_';hurt='^Hurt_';death='^Dead_'}; px=$false; h=56},
  @{k='cp_trollA3';d="$TA\Troll3";       m=@{idle='^Idle_';walk='^Walk_';attack='^Attack_';hurt='^Hurt_';death='^Dead_'}; px=$false; h=58},
  @{k='cp_trollB1';d="$TB\1_TROLL";      m=@{idle='_IDLE_';walk='_WALK_';attack='_ATTACK_';hurt='_HURT_';death='_DIE_'}; px=$false; h=44},
  @{k='cp_trollB2';d="$TB\2_TROLL";      m=@{idle='_IDLE_';walk='_WALK_';attack='_ATTACK_';hurt='_HURT_';death='_DIE_'}; px=$false; h=44},
  @{k='cp_trollB3';d="$TB\3_TROLL";      m=@{idle='_IDLE_';walk='_WALK_';attack='_ATTACK_';hurt='_HURT_';death='_DIE_'}; px=$false; h=46}
)
# ไอคอน: key = ไฟล์ (L = มอนสเตอร์เลเวลต่ำ, C = มอนสเตอร์ความมืด)
$ICONS = [ordered]@{
  cp_slime="$IL\Icon21.png"; cp_mush="$IL\Icon1.png"; cp_snail="$IL\Icon5.png"; cp_bat="$IL\Icon32.png"; cp_flower="$IL\Icon14.png";
  cp_boar="$IL\Icon31.png"; cp_spider="$IL\Icon36.png"; cp_wolf="$IL\Icon43.png"; cp_gnome="$IL\Icon44.png"; cp_mantis="$IL\Icon39.png";
  cp_scorp="$IC\Icon48.png"; cp_snake="$IC\Icon13.png"; cp_beetle="$IC\Icon5.png"; cp_rat="$IC\Icon18.png"; cp_imp="$IC\Icon10.png";
  cp_hound="$IC\Icon7.png"; cp_fwisp="$IC\Icon16.png"; cp_zombie="$IC\Icon17.png"; cp_spiderS="$IC\Icon2.png"; cp_garg="$IC\Icon38.png";
  cp_rdemon="$IC\Icon11.png"; cp_wolfD="$IC\Icon33.png"; cp_ghost="$IC\Icon34.png"; cp_were="$IC\Icon35.png"; cp_reaper="$IC\Icon12.png";
  cp_hellh="$IC\Icon27.png"; cp_ent="$IC\Icon41.png"; cp_ogre="$IC\Icon39.png"; cp_hooded="$IC\Icon43.png"; cp_felem="$IC\Icon47.png"; cp_deer="$IC\Icon30.png"
}

$out = [ordered]@{}
function Num($n){ [int]([regex]::Match($n,'(\d+)\.png$').Groups[1].Value) }
function Sub($arr,$max){ if($arr.Count -le $max){return ,$arr}; $r=@(); for($i=0;$i -lt $max;$i++){ $r+=$arr[[Math]::Floor($i*$arr.Count/$max)] }; return ,$r }

foreach($SP in $FRAMES){
  $files = Get-ChildItem $SP.d -Filter *.png
  $raw=@{}
  foreach($a in $ANIMS){ $fs = $files | Where-Object { $_.Name -match $SP.m[$a] } | Sort-Object { Num $_.Name }; $raw[$a] = Sub @($fs) 8 }
  # มาตราส่วน: ภาพพิกเซล = 1/ขนาดบล็อก (แล้วย่อเพิ่มเป็นจำนวนเต็มถ้ายังสูงเกิน), ภาพละเอียด = ให้สูงเท่าเป้าหมาย
  $idle0 = [MB]::Load($raw.idle[0].FullName); $bb=[MB]::BBox($idle0); $hh=$bb[3]-$bb[1]+1
  if($SP.px){ $blk=[MB]::Block($idle0); $f=1.0/$blk; while($hh*$f -gt $SP.h*1.3){ $f=$f/2 } ; $hq=$false } else { $f=$SP.h/$hh; $hq=$true }
  $idle0.Dispose()
  $sc=@{}; $U=@(1e9,1e9,-1,-1)
  foreach($a in $ANIMS){ $sc[$a]=@(); foreach($fi in $raw[$a]){ $im=[MB]::Load($fi.FullName); $s=[MB]::Scale($im,$f,$hq); $im.Dispose(); $b=[MB]::BBox($s)
      if($b[2] -ge 0){ $U[0]=[Math]::Min($U[0],$b[0]);$U[1]=[Math]::Min($U[1],$b[1]);$U[2]=[Math]::Max($U[2],$b[2]);$U[3]=[Math]::Max($U[3],$b[3]) }
      $sc[$a]+= ,$s } }
  $ib=[MB]::BBox($sc.idle[0]); $cx0=[Math]::Round(($ib[0]+$ib[2])/2)
  $hw=[Math]::Max($cx0-$U[0],$U[2]-$cx0)+1; $x0=$cx0-$hw; $cw=2*$hw+1; $y0=$U[1]-1; $ch=$U[3]-$y0+2
  $fr=New-Object System.Collections.ArrayList; $an=[ordered]@{}
  foreach($a in $ANIMS){ $R=@();$Lf=@()
    foreach($s in $sc[$a]){ $R+=$fr.Add([MB]::Crop($s,$x0,$y0,$cw,$ch,$false)) }
    foreach($s in $sc[$a]){ $Lf+=$fr.Add([MB]::Crop($s,$x0,$y0,$cw,$ch,$true)) }
    $an[$a]=[ordered]@{right=$R;left=$Lf} }
  $cols=[Math]::Min(20,$fr.Count)
  $out[$SP.k]=[ordered]@{img='data:image/png;base64,'+[MB]::Sheet($fr.ToArray([Drawing.Bitmap]),$cols,$cw,$ch);cw=$cw;ch=$ch;cols=$cols;rows=[Math]::Ceiling($fr.Count/$cols);pixel=$true;
    foot=[Math]::Round(($ib[3]+1-$y0)/$ch,4);cx=0.5;body=($ib[3]-$ib[1]+1);anims=$an}
  Write-Host ("{0,-11} scale {1:0.###}  cell {2}x{3}  body {4}  frames {5}" -f $SP.k,$f,$cw,$ch,($ib[3]-$ib[1]+1),$fr.Count)
}

# ไอคอน -> ท่าทางอัตโนมัติ
$IDLE=@(@(0,0,1),@(0,-1,1),@(0,-1,1),@(0,0,1))            # dx,dy,sy
$WALK=@(@(0,0,1),@(0,-2,1),@(0,-3,1),@(0,-1,1))
$ATK =@(@(-1,0,1),@(0,-1,1),@(3,-2,1),@(5,-1,1),@(2,0,1))
$HURT=@(@(-2,0,.94),@(-1,0,1))
$DIE =@(@(0,0,1,1),@(0,0,.9,.85),@(0,1,.8,.7),@(0,1,.65,.5),@(0,2,.5,.3),@(0,2,.35,.12))
foreach($k in $ICONS.Keys){
  $ic=[MB]::Load($ICONS[$k]); $b=[MB]::BBox($ic)
  # จัดให้กลางตัวอยู่กลางช่องพอดี (กลับด้านแล้วจุดยึดไม่เลื่อน)
  $cw=$ic.Width+14; $ch=$ic.Height+5; $ox=[Math]::Round($cw/2-($b[0]+$b[2]+1)/2); $oy=4
  $fr=New-Object System.Collections.ArrayList; $an=[ordered]@{}
  $set=[ordered]@{idle=$IDLE;walk=$WALK;attack=$ATK;hurt=$HURT;death=$DIE}
  foreach($a in $set.Keys){ $R=@();$Lf=@()
    foreach($flip in $false,$true){ foreach($t in $set[$a]){ $al= if($t.Count -gt 3){$t[3]}else{1}
      $i=$fr.Add([MB]::IconFrame($ic,$cw,$ch,$ox,$oy,$t[0],$t[1],$t[2],$al,$flip)); if($flip){$Lf+=$i}else{$R+=$i} } }
    $an[$a]=[ordered]@{right=$R;left=$Lf} }
  $cols=[Math]::Min(20,$fr.Count)
  $out[$k]=[ordered]@{img='data:image/png;base64,'+[MB]::Sheet($fr.ToArray([Drawing.Bitmap]),$cols,$cw,$ch);cw=$cw;ch=$ch;cols=$cols;rows=[Math]::Ceiling($fr.Count/$cols);pixel=$true;
    foot=[Math]::Round(($oy+$b[3]+1)/$ch,4);cx=0.5;body=($b[3]-$b[1]+1);anims=$an}
  $ic.Dispose()
}
$js = "// สร้างอัตโนมัติจาก tools/build_monsters.ps1 (ภาพจาก photo/craftpix-*) — อย่าแก้ไฟล์นี้ด้วยมือ`nwindow.SPRITES=Object.assign(window.SPRITES||{}," + ($out | ConvertTo-Json -Depth 6 -Compress) + ");`n"
$dst = Join-Path (Split-Path $PSScriptRoot) 'monsters_cp.js'
[IO.File]::WriteAllText($dst,$js,(New-Object Text.UTF8Encoding $false))
Write-Host "wrote $dst  $([int]($js.Length/1KB)) KB  ($($out.Count) sprites)"
