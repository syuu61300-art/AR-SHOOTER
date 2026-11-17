# 🎯 AR Shooter Online — GPS Battle

カメラ背景のARシューティングゲームです。スマホ・PC両対応。

## ✨ 機能

| 機能 | 説明 |
|------|------|
| 📷 カメラAR背景 | スマホ背面/前面/PCウェブカメラ全対応 |
| 📍 GPS位置情報 | リアル座標でマップ表示 |
| 🤖 BOTモード | AI敵1〜8体で練習プレイ |
| 🌐 オンラインモード | ルームコードで友達と対戦 |
| 🗺️ タクティカルマップ | GPS連動リアルタイムミニマップ |
| 👾 ARマーカー | 敵の方向・距離をカメラ映像上に表示 |

## 🚀 プレイ方法

### GitHub Pages でプレイ（推奨）
```
https://<あなたのユーザー名>.github.io/ar-shooter/
```

### ローカルで起動
```bash
# Python 3
python3 -m http.server 8080
# → http://localhost:8080 でプレイ
```

> **注意**: カメラ・GPSはHTTPS または localhost でのみ動作します。

## 🎮 操作方法

| 操作 | アクション |
|------|-----------|
| 画面タップ / `Space` / `Enter` | 射撃 |
| 左下ジョイスティック | 移動（GPS座標を仮想移動） |
| `R` キー | リロード |
| ミニマップタップ | 拡大マップ表示 |
| 🔄 CAM ボタン | カメラ切り替え |

## 📋 GitHub Pages 公開手順

1. このリポジトリを GitHub でフォーク or 新規作成
2. `Settings` → `Pages` → Source: `main` ブランチ / `/ (root)`
3. 保存すると `https://<username>.github.io/<repo>/` で公開

## 🛠️ 技術スタック

- **フロントエンド**: 純粋な HTML / CSS / JavaScript（ライブラリ不要）
- **カメラ**: WebRTC MediaDevices API
- **GPS**: Geolocation API（高精度モード）
- **オンライン**: Claude room capability（WebSocket）
- **マップ**: Canvas 2D（GPS座標変換）

## 📁 ファイル構成

```
ar-shooter/
└── index.html   # ゲーム本体（1ファイルで完結）
```

## ライセンス
MIT
