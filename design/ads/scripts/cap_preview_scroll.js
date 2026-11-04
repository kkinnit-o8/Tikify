// Add preview (checked) scrolled so "Save to library" is visible, + element positions in screen px (1170-wide capture space)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const BASE = 'http://127.0.0.1:8000/Tikify/'; const OUT = '/tmp/claude-0/-home-user-Tikify/ece3f78c-d3dd-5dde-b884-0f5893502a95/scratchpad/caps';
const COVERS = 'design/future-look/covers/';
const SOUNDS = [['midnight','Midnight Drive (sped up)','Noctra',178],['neon','after hours','citylights',192],['velvet','velvet (slowed + reverb)','rose.mp3',167],['golden','golden hour, but sad','sunnie.wav',114],['rain','rainy café','mono.loft',210],['phonk','GYM PHONK 03','ironvoice',154],['dance','the dance everyone’s doing','kaiimoves',61],['slowed','dreamy (slowed)','hazey',143],['lofi','3am study loop','paperplanes',180],['summer','summer anthem','wavesclub',128],['ocean','deep focus','tidal.mind',240]];
const PLAYLISTS = [['Late Night Drive',['midnight','neon','velvet','golden','rain']],['Gym',['phonk','dance','summer','neon']],['Soft Hours',['slowed','lofi','ocean','rain']],['Road trip',['summer','midnight','golden','dance','neon']]];
const DEMO_LINK = 'https://www.tiktok.com/@nightcore.edits/video/7311000000000000001';
const DEMO_INFO = { tiktokId:'7311000000000000001', musicId:'7311000000000000002', title:'haunted (sped up + reverb)', artist:'nightcore.edits', isOriginal:false, coverUrl: BASE+COVERS+'haunted.png', coverUrls:[BASE+COVERS+'haunted.png'], videoCoverUrl: BASE+COVERS+'haunted.png', audioUrl: BASE+'demo-audio.wav', duration:23, videoTitle:'this sound >>> #fyp', videoAuthor:'@nightcore.edits', sourceUrl: DEMO_LINK };
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport:{width:390,height:844}, deviceScaleFactor:3, serviceWorkers:'block' });
  await page.goto(BASE + '#/library'); await page.waitForFunction(() => typeof DB !== 'undefined');
  await page.evaluate(async ({SOUNDS,PLAYLISTS,COVERS}) => { const now=Date.now(); const wav=(s)=>{const n=8000*s,b=new ArrayBuffer(44+n),v=new DataView(b);const w=(o,t)=>[...t].forEach((c,i)=>v.setUint8(o+i,c.charCodeAt(0)));w(0,'RIFF');v.setUint32(4,36+n,true);w(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,8000,true);v.setUint32(28,8000,true);v.setUint16(32,1,true);v.setUint16(34,8,true);w(36,'data');v.setUint32(40,n,true);new Uint8Array(b,44).fill(128);return new Blob([b],{type:'audio/wav'});};
    for (const [i,[id,title,artist,duration]] of SOUNDS.entries()) { const coverBlob = await (await fetch(COVERS+id+'.png')).blob(); await DB.put('sounds',{id,title,artist,coverBlob,sourceUrl:'https://www.tiktok.com/@demo/video/1',tiktokId:String(i+1),duration,addedAt:now-i*60000}); await DB.put('audio',{id,blob:wav(duration)}); }
    for (const [i,[name,soundIds]] of PLAYLISTS.entries()) await DB.put('playlists',{id:'pl'+i,name,soundIds,createdAt:now-(10-i)*1000});
    localStorage.setItem('tikify.installDismissedAt', JSON.stringify(now)); localStorage.setItem('tikify.lastBackupAt', JSON.stringify(now)); }, {SOUNDS,PLAYLISTS,COVERS});
  await page.addInitScript(() => localStorage.setItem('tikify.session', JSON.stringify({queue:['midnight','neon','velvet','golden','rain'],baseQueue:['midnight','neon','velvet','golden','rain'],upNext:[],index:0,contextId:'pl:pl0',context:'Late Night Drive',t:48})));
  await page.reload(); await page.waitForFunction(() => typeof TikTok !== 'undefined');
  await page.evaluate((I) => { TikTok.lookup = async () => I; }, DEMO_INFO);
  await page.waitForSelector('.mini-player:not([hidden])'); await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => { location.hash = '#/add'; }); await page.waitForSelector('#linkInput');
  await page.fill('#linkInput', DEMO_LINK); await page.click('#findBtn'); await page.waitForSelector('.preview'); await page.waitForTimeout(400);
  await page.click('.pl-checks label:nth-child(1)'); await page.waitForTimeout(250);
  const info = await page.evaluate(() => {
    const r = (sel) => { const b = document.querySelector(sel).getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2, b.width, b.height]; };
    const before = r('#saveBtn');
    document.querySelector('#saveBtn').scrollIntoView({ block: 'center' });
    const scroller = [document.scrollingElement, document.querySelector('#view'), document.querySelector('main')].map((e) => e && [e.tagName + (e.id ? '#' + e.id : ''), e.scrollTop]);
    return { before, after: r('#saveBtn'), chip: r('.pl-checks label:nth-child(1)'), cover: r('.preview .cover'), title: r('#pTitle'), scroller };
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, 'add_preview_scrolled.png') });
  // pressed look: simulate :active by adding a translucent overlay? no — capture the real button then the tap in the film
  console.log(JSON.stringify(info));
  fs.writeFileSync(path.join(OUT, 'add_preview_pos.json'), JSON.stringify(info));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
