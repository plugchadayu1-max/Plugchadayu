# รวมสไปรต์ 2D (กอบลิน/ออค จาก Craftpix) เป็น sprites.js  (atlas PNG แบบ base64 + ข้อมูลเฟรม)
# วิธีรัน:  powershell -ExecutionPolicy Bypass -File game\tools\build_sprites.ps1
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;using System.Collections.Generic;using System.Drawing;using System.Drawing.Drawing2D;using System.Drawing.Imaging;using System.IO;using System.Text;using System.Globalization;
public class SpriteSrc{public string Anim,Dir,Path;public int Cell,Step,Row;}
public static class SpritePack{
 static Dictionary<string,Bitmap> cache=new Dictionary<string,Bitmap>();
 static Bitmap Load(string p){Bitmap b;if(!cache.TryGetValue(p,out b)){b=new Bitmap(p);cache[p]=b;}return b;}
 // ตัดเฟรมจากชีต: Row>=0 = ใช้เฉพาะแถวนั้น, Row<0 = ทุกช่องเรียงตามการอ่าน
 static List<Bitmap> Frames(SpriteSrc s){
  var b=Load(s.Path);int cols=b.Width/s.Cell,rows=b.Height/s.Cell;var res=new List<Bitmap>();int k=0;
  for(int r=0;r<rows;r++){if(s.Row>=0&&r!=s.Row)continue;
   for(int c=0;c<cols;c++,k++){if(k%s.Step!=0)continue;
    var f=new Bitmap(s.Cell,s.Cell,PixelFormat.Format32bppArgb);using(var g=Graphics.FromImage(f))g.DrawImage(b,new Rectangle(0,0,s.Cell,s.Cell),new Rectangle(c*s.Cell,r*s.Cell,s.Cell,s.Cell),GraphicsUnit.Pixel);
    if(!Empty(f))res.Add(f);}}
  return res;}
 static bool Empty(Bitmap f){for(int y=0;y<f.Height;y+=2)for(int x=0;x<f.Width;x+=2)if(f.GetPixel(x,y).A>16)return false;return true;}
 static Rectangle BBox(Bitmap f){
  var d=f.LockBits(new Rectangle(0,0,f.Width,f.Height),ImageLockMode.ReadOnly,PixelFormat.Format32bppArgb);var px=new int[f.Width*f.Height];
  System.Runtime.InteropServices.Marshal.Copy(d.Scan0,px,0,px.Length);f.UnlockBits(d);
  int x0=f.Width,y0=f.Height,x1=-1,y1=-1;
  for(int y=0;y<f.Height;y++)for(int x=0;x<f.Width;x++)if(((px[y*f.Width+x]>>24)&255)>40){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  return x1<0?Rectangle.Empty:Rectangle.FromLTRB(x0,y0,x1+1,y1+1);}
 // targetBody = ความสูงตัวละครในแอตลาส (px), pixel = true สำหรับพิกเซลอาร์ต (ไม่เบลอ)
 public static string Build(SpriteSrc[] srcs,double targetBody,bool pixel,string idleKey){
  var all=new List<KeyValuePair<string,List<Bitmap>>>();Rectangle U=Rectangle.Empty;
  foreach(var s in srcs){var fr=Frames(s);all.Add(new KeyValuePair<string,List<Bitmap>>(s.Anim+"|"+(s.Dir??""),fr));foreach(var f in fr){var bb=BBox(f);if(bb.IsEmpty)continue;U=U.IsEmpty?bb:Rectangle.Union(U,bb);}}
  // ขนาดลำตัวจากท่ายืนหันหน้าเฟรมแรก
  Bitmap idle=null;foreach(var kv in all)if(kv.Key==idleKey&&kv.Value.Count>0){idle=kv.Value[0];break;}
  var ib=BBox(idle);double body=ib.Height;double sc=targetBody>0?targetBody/body:1;
  int cw=(int)Math.Ceiling(U.Width*sc)+2,ch=(int)Math.Ceiling(U.Height*sc)+2;int total=0;foreach(var kv in all)total+=kv.Value.Count;
  int cols=Math.Max(1,Math.Min(total,4096/cw));int rows=(total+cols-1)/cols;
  var atlas=new Bitmap(cols*cw,rows*ch,PixelFormat.Format32bppArgb);var g=Graphics.FromImage(atlas);
  g.InterpolationMode=pixel?InterpolationMode.NearestNeighbor:InterpolationMode.HighQualityBicubic;g.PixelOffsetMode=PixelOffsetMode.Half;
  var meta=new StringBuilder();var anims=new Dictionary<string,Dictionary<string,List<int>>>();int idx=0;
  foreach(var kv in all){var parts=kv.Key.Split('|');Dictionary<string,List<int>> a;if(!anims.TryGetValue(parts[0],out a)){a=new Dictionary<string,List<int>>();anims[parts[0]]=a;}
   string dir=parts[1]==""?"all":parts[1];if(!a.ContainsKey(dir))a[dir]=new List<int>();
   foreach(var f in kv.Value){int cx=(idx%cols)*cw+1,cy=(idx/cols)*ch+1;
    g.DrawImage(f,new Rectangle(cx,cy,(int)Math.Round(U.Width*sc),(int)Math.Round(U.Height*sc)),U,GraphicsUnit.Pixel);a[dir].Add(idx);idx++;}}
  g.Dispose();
  var ms=new MemoryStream();atlas.Save(ms,ImageFormat.Png);
  var ci=CultureInfo.InvariantCulture;
  double foot=(ib.Bottom-U.Top)*sc+1, cxr=((ib.Left+ib.Right)/2.0-U.Left)*sc+1;
  meta.Append("{img:'data:image/png;base64,"+Convert.ToBase64String(ms.ToArray())+"',");
  meta.Append("cw:"+cw+",ch:"+ch+",cols:"+cols+",rows:"+rows+",pixel:"+(pixel?"true":"false")+",");
  meta.Append("foot:"+(foot/ch).ToString("0.###",ci)+",cx:"+(cxr/cw).ToString("0.###",ci)+",body:"+(body*sc).ToString("0.#",ci)+",anims:{");
  bool fa=true;foreach(var a in anims){if(!fa)meta.Append(",");fa=false;meta.Append(a.Key+":{");bool fd=true;foreach(var d in a.Value){if(!fd)meta.Append(",");fd=false;meta.Append(d.Key+":["+string.Join(",",d.Value)+"]");}meta.Append("}");}
  meta.Append("}}");
  foreach(var kv in all)foreach(var f in kv.Value)f.Dispose();
  return meta.ToString();}
}
'@
$root = Split-Path (Split-Path $PSScriptRoot)
$photo = Join-Path $root 'photo'
$gobRoot = (Get-ChildItem $photo -Directory | Where-Object { Test-Path (Join-Path $_.FullName 'Chief Goblin') } | Select-Object -First 1).FullName
$orcRoot = (Get-ChildItem $photo -Directory | Where-Object { Test-Path (Join-Path $_.FullName 'PNG\Orc1') } | Select-Object -First 1).FullName
function Src($anim,$dir,$path,$cell,$step,$row){ $s=New-Object SpriteSrc; $s.Anim=$anim;$s.Dir=$dir;$s.Path=$path;$s.Cell=$cell;$s.Step=$step;$s.Row=$row; $s }

$out = New-Object Text.StringBuilder
[void]$out.AppendLine('// สร้างอัตโนมัติจาก tools/build_sprites.ps1 — อย่าแก้ไฟล์นี้ด้วยมือ')
[void]$out.AppendLine('window.SPRITES={')

# กอบลิน: ชีตละทิศ, เฟรม 480x480
$gdirs = @{front='Front';back='Back';left='Left';right='Right'}
$ganims = @(@('idle','Idle',2),@('walk','Walking',2),@('attack','Attacking',1),@('hurt','Hurt',2))
foreach ($pair in @(@('goblinM','Male Goblin'),@('goblinF','Female Goblin'),@('goblinC','Chief Goblin'))) {
  $base = Join-Path $gobRoot "$($pair[1])\PNG\Spritesheets"
  $list = @()
  foreach ($a in $ganims) { foreach ($d in 'front','back','left','right') { $list += Src $a[0] $d (Join-Path $base "$($gdirs[$d]) - $($a[1]).png") 480 $a[2] -1 } }
  $list += Src 'death' $null (Join-Path $base 'Dying.png') 480 1 -1
  $js = [SpritePack]::Build($list, 128, $false, 'idle|front')
  [void]$out.AppendLine("$($pair[0]):$js,"); "built $($pair[0])"
}
# ออค: แถว 0..3 = หน้า/หลัง/ซ้าย/ขวา, เฟรม 64x64 (พิกเซลอาร์ต)
foreach ($n in 1,2,3) {
  $base = Join-Path $orcRoot "PNG\Orc$n"
  $list = @()
  foreach ($a in 'idle','walk','attack','hurt','death') {
    $dir = Get-ChildItem $base -Directory | Where-Object { $_.Name -match "_$a`$" } | Select-Object -First 1
    $full = Get-ChildItem $dir.FullName -Filter '*_full.png' | Select-Object -First 1
    $i = 0; foreach ($d in 'front','back','left','right') { $list += Src $a $d $full.FullName 64 1 $i; $i++ }
  }
  $js = [SpritePack]::Build($list, 0, $true, 'idle|front')
  [void]$out.AppendLine("orc$n`:$js,"); "built orc$n"
}
[void]$out.AppendLine('};')
$file = Join-Path $root 'game\sprites.js'
[IO.File]::WriteAllText($file, $out.ToString(), (New-Object Text.UTF8Encoding $false))
"wrote $file  $([int]((Get-Item $file).Length/1KB)) KB"
