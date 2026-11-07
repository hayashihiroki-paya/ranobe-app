# 作業計画・進捗

最終更新: 2026-11-07
作業ブランチ: `develop`

## 目的

長期間更新していなかったプロジェクトのローカル実行環境を再構築し、楽天ブックスAPIを含む主要機能が動作する状態にする。

## 現状

- [x] リポジトリ構成、環境変数参照、Prisma設定、seedスクリプトを調査
- [x] 作業ツリーがクリーンであることを確認し、`develop` ブランチを作成
- [ ] 必要な環境変数と外部サービスの利用可否を確認
- [ ] ローカル依存関係を復元
- [ ] PostgreSQLデータベースを接続し、マイグレーションを適用
- [ ] 必要な初期データを確認して投入
- [ ] ローカルで起動し、主要機能を動作確認
- [ ] lintとテストを実行し、結果を記録

## 作業項目

### 1. 外部サービスと環境変数

`.env.local` に必要な値を設定する。秘密情報はこのドキュメントやGitに記録しない。

- `DATABASE_URL`: PostgreSQL/Neonの接続文字列
- `NEXTAUTH_URL`: ローカル開発では `http://localhost:3000`
- `NEXTAUTH_SECRET`: NextAuth用のランダムなsecret
- `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`: Googleログインを利用する場合のOAuth資格情報
- `RAKUTEN_APP_ID`: 楽天ウェブサービスのアプリID。再発行・有効性を確認する
- `ADMIN_EMAIL`: 管理者向けタグ再計算APIを利用する場合の管理者メールアドレス

Googleログインを使う場合は、Google OAuthクライアントにローカルのNextAuthコールバックURLを登録する。楽天アプリIDについては、設定後にBooksBook Search APIの応答を確認する。エラー時はキー失効と決めつけず、HTTPステータスとAPIエラー本文も確認する。

### 2. ローカル依存関係

- Next.js 16の要件を満たすNode.jsを用意する（Node.js 20.9以上）
- `npm ci` で `package-lock.json` に基づき依存関係を復元する
- `postinstall` によりPrisma Clientが生成されることを確認する

### 3. データベース

- 開発用PostgreSQL/Neonの接続先を確認する。本番DBを誤って変更しない
- `npx prisma migrate deploy` で既存マイグレーションを適用する
- seedスクリプトの対象・前提・既存データへの影響を確認してから必要なものだけ実行する

`package.json` にseed用スクリプトは定義されていない。`scripts/seedTags.ts`、`scripts/seed.ts`、`prisma/seed.ts` は役割と実行方法を個別に確認する。特に `prisma/seed.ts` は書籍やユーザー等のデータを作成するため、空の開発DBであることを確認せず実行しない。

### 4. 起動と動作確認

- `npm run dev` でローカル起動
- ログイン（利用する場合）、書籍検索、書籍詳細表示を確認
- 楽天APIのエラーはサーバーログとNetwork応答で確認し、キー・リクエスト内容・応答を切り分ける
- `npm run lint` と `npm test` を実行し、結果を記録

## 進捗更新ルール

作業を進めたら、このファイルのチェック項目と「現状」を更新する。問題が出た場合は、再現手順・エラー概要・次の対応を追記する。秘密情報や接続文字列は記録しない。

## 作業ログ

### 2026-11-07

- `main` がクリーンであることを確認
- ローカル／リモートに既存の `develop` がないことを確認し、新規作成して切り替え
- READMEには環境構築手順がなく、Next.js、Prisma、PostgreSQL（README記載ではNeon）、NextAuth、楽天ブックスAPIを利用していることを確認
- `RAKUTEN_APP_ID` は検索APIと書籍詳細取得で参照されている
- `DATABASE_URL`、`GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`、`NEXTAUTH_SECRET`、`ADMIN_EMAIL` の参照箇所を確認
- マイグレーションと複数のseedスクリプトが存在する。seed実行コマンドはpackage scriptsに登録されていない
