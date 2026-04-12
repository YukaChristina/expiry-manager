@AGENTS.md

# expiry-manager プロジェクト概要

## 構成
- フロント＋API: Next.js 16.2.3 (Vercel)
- DB＋Auth: Supabase
- バーコードスキャン: @zxing/browser + @zxing/library
- 商品名取得: Open Food Facts → 楽天市場API（JANコード検索）→ UPC Item DB
- メール通知: Resend（独自ドメイン未設定のため本番送信は未完）
- カレンダー連携: ical-generator（.ics エクスポート）
- AI: Anthropic SDK

## リポジトリ・デプロイ
- GitHub: https://github.com/YukaChristina/expiry-manager
- Vercel: https://expiry-manager-olive.vercel.app

## Vercelデプロイ手順
VercelのProduction Branchが `master` に設定されているため、以下の2行が必要：
```bash
git push origin main
git push origin main:master
```
または `npx vercel --prod`（環境変数を追加したあとは必ずこちらを使う）

## 環境変数（Vercel設定済み）
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL` = https://expiry-manager-olive.vercel.app
- `NEXT_PUBLIC_DEMO_EMAIL` = demo@expiry-manager.com
- `NEXT_PUBLIC_DEMO_PASSWORD` = Demo1234!
- `RAKUTEN_APP_ID`

## Supabase設定
- RLS: 有効（`ALTER TABLE items ENABLE ROW LEVEL SECURITY`）
- user_id外部キー制約: 有効（`items_user_id_fkey`）
- Email確認: **オフ**（Confirm email を無効化済み）
- デモアカウント: demo@expiry-manager.com / Demo1234!

## 実装済み機能
- ログイン（デモボタン＋通常ログイン）
- 新規登録（`/signup`）
- バーコードスキャン（スマホ背面カメラ）
- 商品名自動取得（3段階フォールバック）
- 見つからない場合は手入力UIを表示
- アイテム登録・一覧・削除・編集
- リマインド通知タイミング設定（3/7/14/30日前）
- メール通知チェックボックス（ログイン中のメールアドレスを表示）
- ヘッダーにログイン中のメールアドレス表示
- カレンダー連携（.icsエクスポート）— 期限日＋リマインド日の2イベント
- CSVエクスポート
- Vercel Cron（毎朝8時に通知APIを呼ぶ）

## 未完・TODO
- メール実送信: Resendで独自ドメインを設定すれば有効化できる
- `send_email` フラグはDBに保存されているが、cronでの送信判定に使われていない（要実装）
- デバッグ表示（RegisterFlowのdebugInfo）は残っているが実害なし
