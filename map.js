<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>MapScan デモ (2P対応)</title>
<style>
:root{--g:#00ff88;--b:#33aaff;--r:#ff3333;--y:#ffdd00;--bg:rgba(0,0,0,.8)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#0a0d12;color:var(--g);font-family:'Courier New',monospace;overflow:hidden}
#layout{display:flex;height:100vh;gap:0}
#left{width:220px;flex-shrink:0;background:#060910;border-right:1px solid rgba(0,255,136,.2);
  display:flex;flex-direction:column;padding:14px 12px;gap:10px;overflow-y:auto}
#right{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:14px}
#mini-wrap{position:relative}
#mini-wrap canvas{border-radius:50%;border:2px solid rgba(0,255,136,.4);display:block}
#mini-label{font-size:8px;color:rgba(0,255,136,.5);text-align:center;margin-top:4px;letter-spacing:1px}
#big-wrap{position:relative}
#big-wrap canvas{border:1px solid rgba(0,255,136,.35);border-radius:8px;display:block;
  width:min(80vw,480px);height:min(80vw,480px)}
.section-title{font-size:8px;letter-spacing:2px;color:rgba(0,255,136,.5);margin-top:6px}
.btn{width:100%;padding:9px 6px;border-radius:4px;border:1px solid;background:transparent;
  font-family:inherit;font-size:11px;letter-spacing:1px;cursor:pointer;text-align:center}
.btn.g{color:var(--g);border-color:rgba(0,255,136,.5)}
.btn.g:active{background:rgba(0,255,136,.15)}
.btn.b{color:var(--b);border-color:rgba(50,170,255,.5)}
.btn.b:active{background:rgba(50,170,255,.15)}
.btn.r{color:var(--r);border-color:rgba(255,50,50,.5)}
.btn:disabled{opacity:.35;cursor:not-allowed}
.row{display:flex;gap:6px}
.row .btn{flex:1}
input[type=range]{width:100%;accent-color:var(--g)}
.val{font-size:9px;color:rgba(255,255,255,.5);text-align:right}
#prog-wrap{width:100%;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden;height:7px;display:none}
#prog-fill{height:100%;width:0%;background:linear-gradient(90deg,var(--g),var(--b));transition:width .08s;border-radius:4px}
#prog-msg{font-size:9px;color:rgba(0,255,136,.7);min-height:14px;letter-spacing:.5px}
#player-list{display:flex;flex-direction:column;gap:4px;max-height:150px;overflow-y:auto}
.pitem{font-size:9px;padding:4px 7px;border-radius:3px;border:1px solid;line-height:1.5}
.pitem.red{color:var(--r);border-color:rgba(255,50,50,.35)}
.pitem.blue{color:var(--b);border-color:rgba(50,170,255,.35)}
.pitem.self{color:var(--g);border-color:rgba(0,255,136,.35)}
#gps-status{font-size:9px;line-height:1.7;color:rgba(255,255,255,.55)}
#gps-status span{color:var(--g)}
#zoom-row{display:flex;gap:6px;align-items:center;width:100%;max-width:480px}
#zoom-row .btn{width:44px;flex-shrink:0}
#zoom-label{flex:1;text-align:center;font-size:10px;color:rgba(255,255,255,.5)}
</style>
</head>
<body>
<div id="layout">
  <div id="left">
    <div style="font-size:14px;font-weight:bold;letter-spacing:3px;color:var(--g)">MAP SCAN</div>
    <div style="font-size:8px;color:rgba(0,255,136,.4);letter-spacing:1px">2P 共有デモ</div>

    <div class="section-title">GPS / 位置</div>
    <div id="gps-status">緯度: <span id="v-lat">--</span><br>経度: <span id="v-lon">--</span><br>精度: <span id="v-acc">--</span></div>
    <button class="btn g" onclick="reqGPS()">📍 GPS 取得</button>

    <div class="section-title">スキャン設定</div>
    <label class="val">半径: <span id="v-rad">150</span> m</label>
    <input type="range" id="sl-rad" min="50" max="500" step="10" value="150"
      oninput="document.getElementById('v-rad').textContent=this.value">
    <button class="btn g" id="btn-scan" onclick="doScan()" disabled>🔍 スキャン開始</button>

    <div class="section-title">P2P 共有</div>
    <div class="row">
      <button class="btn b" onclick="p2pHost()">🛰 HOST</button>
      <button class="btn b" onclick="p2pJoin()">🔑 JOIN</button>
    </div>
    <input id="room-code" maxlength="6" placeholder="XXXXXX"
      style="background:rgba(0,20,40,.9);color:var(--b);border:1px solid rgba(50,170,255,.3);
      border-radius:4px;padding:6px 8px;font-family:inherit;font-size:11px;width:100%;
      letter-spacing:2px;text-transform:uppercase">
    <div id="p2p-status" style="font-size:9px;color:rgba(50,170,255,.7);min-height:14px"></div>

    <div class="section-title">スキャン済みプレイヤー</div>
    <div id="player-list"></div>

    <div class="section-title">ミニマップ</div>
    <div id="mini-wrap">
      <canvas id="mini" width="110" height="110"></canvas>
      <div id="mini-label">[ MAP ]</div>
    </div>

    <div id="prog-wrap"><div id="prog-fill"></div></div>
    <div id="prog-msg"></div>
  </div>

  <div id="right">
    <div style="font-size:10px;letter-spacing:3px;color:rgba(0,255,136,.5)">SATELLITE MAP</div>
    <div id="big-wrap"><canvas id="big" width="480" height="480"></canvas></div>
    <div id="zoom-row">
      <button class="btn g" onclick="zoom(-1)">－</button>
      <div id="zoom-label">表示半径: -- m</div>
      <button class="btn g" onclick="zoom(+1)">＋</button>
    </div>
    <div style="font-size:8px;color:rgba(255,255,255,.25);text-align:center">
      © Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN
    </div>
  </div>
</div>

<script src="map-scan.js"></script>
<script>
'use strict';

const state = {
  lat: 35.6762, lon: 139.6503, acc: 0,
  heading: 0,
  gpsReady: false,
  team: 'red',
  myId: 'self',
  players: [
    { id:'p2', name:'Ghost', team:'blue', lat:35.6765, lon:139.6510, hp:80 },
    { id:'p3', name:'Viper', team:'red',  lat:35.6758, lon:139.6495, hp:100 }
  ]
};

const ZOOM_STEPS = [50, 80, 120, 180, 280, 400];
let zoomIdx = 2;
let bigRadius = ZOOM_STEPS[zoomIdx];

/* ── MapScan 初期化 ── */
MapScan.init({
  wrapEl        : document.getElementById('prog-wrap'),
  progressBarEl : document.getElementById('prog-fill'),
  progressMsgEl : document.getElementById('prog-msg')
});

/* スキャン受信時 */
MapScan.onPlayerScanReceived = meta => {
  updatePlayerList();
  const tag = meta.isSync ? '🔄 同期' : '📥 受信';
  setP2P(`${tag}: ${meta.id.substring(0,8)}… (R:${Math.round(meta.radiusM)}m)`);
};

/* ── GPS ── */
let gpsWatcher = null;
function reqGPS() {
  if (!navigator.geolocation) { alert('GPS非対応'); return; }
  navigator.geolocation.getCurrentPosition(p => {
    state.lat = p.coords.latitude;
    state.lon = p.coords.longitude;
    state.acc = p.coords.accuracy;
    state.gpsReady = true;
    updateGPSUI();
    document.getElementById('btn-scan').disabled = false;
  }, e => alert('GPS取得失敗: ' + e.message), { enableHighAccuracy: true });
  if (gpsWatcher === null) {
    gpsWatcher = navigator.geolocation.watchPosition(p => {
      state.lat = p.coords.latitude; state.lon = p.coords.longitude; state.acc = p.coords.accuracy;
      updateGPSUI();
    }, null, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  }
  const oi = e => {
    let h = e.webkitCompassHeading;
    if (h == null && e.alpha != null) h = 360 - e.alpha;
    if (h != null) state.heading = h;
  };
  window.addEventListener('deviceorientationabsolute', oi, true);
  window.addEventListener('deviceorientation', oi, true);
}
function updateGPSUI() {
  document.getElementById('v-lat').textContent = state.lat.toFixed(5) + '°';
  document.getElementById('v-lon').textContent = state.lon.toFixed(5) + '°';
  document.getElementById('v-acc').textContent = Math.round(state.acc) + 'm';
  document.getElementById('btn-scan').disabled = false;
}

/* ── スキャン実行 ── */
async function doScan() {
  const r = parseInt(document.getElementById('sl-rad').value);
  document.getElementById('btn-scan').disabled = true;
  document.getElementById('prog-wrap').style.display = 'block';

  const lat = state.lat, lon = state.lon;
  await MapScan.startScan(lat, lon, r);

  document.getElementById('btn-scan').disabled = false;
  updatePlayerList();
}

/* ── ズーム ── */
function zoom(d) {
  zoomIdx = Math.max(0, Math.min(ZOOM_STEPS.length - 1, zoomIdx + d));
  bigRadius = ZOOM_STEPS[zoomIdx];
  document.getElementById('zoom-label').textContent = '表示半径: ' + bigRadius + ' m';
}

/* ── 描画ループ ── */
function drawLoop() {
  MapScan.drawMap(
    document.getElementById('mini'),
    state.lon, state.lat, 150, state.heading,
    state.players, state.team, state.acc
  );
  MapScan.drawMap(
    document.getElementById('big'),
    state.lon, state.lat, bigRadius, state.heading,
    state.players, state.team, state.acc
  );
  document.getElementById('zoom-label').textContent = '表示半径: ' + bigRadius + ' m';
  requestAnimationFrame(drawLoop);
}
drawLoop();

/* ── プレイヤーリスト ── */
function updatePlayerList() {
  const scans = MapScan.getPlayerScans();
  const list = document.getElementById('player-list');
  list.innerHTML = '';
  if (scans.length === 0) {
    list.innerHTML = '<div style="font-size:9px;color:rgba(255,255,255,.3);padding:4px">スキャン待ち…</div>';
    return;
  }
  scans.forEach(s => {
    const d = document.createElement('div');
    const isSelf = s.id === 'self';
    const cls = isSelf ? 'self' : (s.team || 'red');
    d.className = 'pitem ' + cls;
    const name = isSelf ? '👤 自分' : '🌐 ' + (s.id || '?').substring(0, 8);
    const team = s.team ? '[' + s.team.toUpperCase() + '] ' : '';
    d.textContent = `${name}  ${team}R:${Math.round(s.radiusM)}m`;
    list.appendChild(d);
  });
}

/* ── P2P (PeerJS) ── */
let peer = null, hostConn = null, peerConns = {};
function setP2P(t) { document.getElementById('p2p-status').textContent = t; }

function loadPeer() {
  return new Promise((ok, ng) => {
    if (window.Peer) return ok();
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';
    s.onload = ok; s.onerror = ng; document.head.appendChild(s);
  });
}

async function p2pHost() {
  await loadPeer();
  const code = document.getElementById('room-code').value.trim().toUpperCase() ||
    Math.random().toString(36).substring(2, 8).toUpperCase();
  document.getElementById('room-code').value = code;
  peer = new Peer('map-scan-' + code);

  peer.on('open', id => {
    state.myId = id;
    state.team = 'red';
    setP2P('🛰 ホスト: ' + code);
    MapScan.initNet({ role: 'host', conns: peerConns, myId: id, team: 'red' });
    updatePlayerList();
  });

  peer.on('connection', c => {
    peerConns[c.peer] = c;
    setP2P('👥 ' + Object.keys(peerConns).length + '人接続中');

    c.on('open', () => {
      // 新規接続へ既存スキャンを同期
      MapScan.syncAllScansTo(c);
    });

    c.on('data', msg => {
      MapScan.onReceive(msg);
    });

    c.on('close', () => {
      delete peerConns[c.peer];
      MapScan.removeScan(c.peer);
      updatePlayerList();
      setP2P('👥 ' + Object.keys(peerConns).length + '人接続中');
    });
  });

  peer.on('error', e => setP2P('⚠ ' + e.type));
}

async function p2pJoin() {
  await loadPeer();
  const code = document.getElementById('room-code').value.trim().toUpperCase();
  if (!code || code.length !== 6) { setP2P('6文字のコードを入力'); return; }
  peer = new Peer();

  peer.on('open', id => {
    state.myId = id;
    state.team = 'blue';
    const c = hostConn = peer.connect('map-scan-' + code, { serialization: 'json', reliable: true });

    c.on('open', () => {
      setP2P('🔑 接続完了: ' + code);
      MapScan.initNet({ role: 'guest', hostConn: c, myId: id, team: 'blue' });
      // 自分のスキャンが既にあれば送信
      const self = MapScan.getSelfScan();
      if (self) {
        c.send({
          t: 'map_scan', ...self,
          id, team: 'blue',
          timestamp: self.timestamp || Date.now()
        });
      }
      updatePlayerList();
    });

    c.on('data', msg => MapScan.onReceive(msg));

    c.on('close', () => {
      setP2P('切断');
      MapScan.initNet(null);
    });
  });

  peer.on('error', e => setP2P('⚠ ' + e.type));
}

/* 起動時 */
document.getElementById('btn-scan').disabled = false;
updatePlayerList();
</script>
</body>
</html>
