# 鳥取県 紹介サイト（学校イベント用）

ビルド不要の静的サイト（HTML / CSS / JS のみ）です。フレームワークを使っていないので、
そのまま Vercel にアップロードすればすぐに公開できます。

## フォルダ構成

```
tottori-site/
├── index.html      … ページ本体
├── css/style.css   … スタイル・アニメーション定義
├── js/script.js    … スクロール演出・星空アニメーションなど
└── vercel.json     … Vercel用の設定（無くても動きます）
```

## Vercelへのアップロード方法（GUIで一番簡単な方法）

1. https://vercel.com にログイン（GitHubアカウントでOK）
2. ダッシュボードの「Add New… → Project」を選択
3. 「Deploy without Git」的な導線が出ない場合は、一度 GitHub に
   このフォルダをリポジトリとして push し、そのリポジトリを Import する
4. Framework Preset は **Other**（何も自動検出されなくてOK）
5. Build Command・Output Directory は空欄のままで大丈夫です
6. Deploy を押せば数十秒で公開されます

Vercel CLI を使える場合はもっと簡単です。

```bash
npm i -g vercel
cd tottori-site
vercel
```

## 内容の編集について

- `index.html` の `<section class="event" id="event">` 内が
  イベント情報のプレースホルダーです。実際の日時・場所などに書き換えてください。
- 統計データ（人口・面積など）はおおよその一般的な数値です。展示の正確性が必要な場合は
  最新の公式データ（鳥取県公式サイトなど）で確認・更新してください。

## アニメーションについて

- スクロールに連動して、背景が「昼の砂丘色」から「夜の星空」へ少しずつ変化します
- 一番下に近い「星取県」のセクションでは、canvas でランダムに星が瞬き、
  たまに流れ星が出現します（`prefers-reduced-motion` 設定を尊重し、
  その場合は控えめな表示になります）
- 砂丘セクションの背景には、風紋（砂の模様）をイメージした線がゆっくり揺れています

外部依存は Google Fonts の読み込みのみです（オフラインでは文字が代替フォントになりますが、
レイアウトは崩れません）。
