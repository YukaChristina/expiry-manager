@AGENTS.md

# expiry-manager プロジェクト概要

## 構成
- フロント＋API: Next.js 16.2.3 (Vercel)
- DB＋Auth: Supabase
- バーコードスキャン: @zxing/browser + @zxing/library
- 商品名取得: Open Food Facts API → UPC Item DB（フォールバック）
- メール通知: Resend
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
または `npx vercel --prod`

## 現在のテスト用変更（本番前に元に戻す）

### 認証を無効化している箇所
- `app/(app)/layout.tsx` — セッションチェックをスキップ
- `app/api/items/route.ts` — 認証なし、TEST_USER_ID = '00000000-0000-0000-0000-000000000001'
- `app/api/items/[id]/route.ts` — 同上
- `components/RegisterFlow.tsx` — Authorizationヘッダーなしでfetch

### Supabase設定変更（本番前に元に戻す）
- `items` テーブル: RLS無効化
- `items` テーブル: user_id外部キー制約削除

### デバッグ表示（本番前に削除）
- `components/RegisterFlow.tsx` — debugInfo でバーコードAPIレスポンスを画面表示
- `app/api/scan/barcode/route.ts` — `debug` フィールドをレスポンスに含める

## 本番化TODO
1. 認証を全箇所で元に戻す
2. SupabaseのRLSを再有効化: `ALTER TABLE items ENABLE ROW LEVEL SECURITY`
3. user_id外部キー制約を再追加
4. デバッグ表示を削除
