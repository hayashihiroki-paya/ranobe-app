# 作業計画・進捗

最終更新: 2026-11-17
作業ブランチ: `17-local-setup-docs`

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
- [x] READMEにローカル開発手順を追加（2026-11-17、Issue #17ブランチ）
- [x] seedスクリプトごとの作用とDB前提を確認
- [ ] Issue #12統合後に `RAKUTEN_ACCESS_KEY` を環境変数一覧へ反映
- [x] タグ・カテゴリ重み用の再実行可能なseedコマンドを追加・文書化
- [ ] 開発用DBでseedコマンドを実行してデータを確認

## 作業項目

### 1. 外部サービスと環境変数

`.env` に必要な値を設定する。秘密情報はこのドキュメントやGitに記録しない。

- `DATABASE_URL`: PostgreSQL/Neonの接続文字列
- `NEXTAUTH_URL`: ローカル開発では `http://localhost:3000`
- `NEXTAUTH_SECRET`: NextAuth用のランダムなsecret
- `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`: Googleログインを利用する場合のOAuth資格情報
- `RAKUTEN_APP_ID`: 楽天ウェブサービスのアプリID。再発行・有効性を確認する
- `RAKUTEN_ACCESS_KEY`: Issue #12の新認証方式を取り込んだ後に追加・設定する（現行mainの `.env.example` には未掲載）
- `ADMIN_EMAIL`: 管理者向けタグ再計算APIを利用する場合の管理者メールアドレス

Googleログインを使う場合は、Google OAuthクライアントにローカルのNextAuthコールバックURLを登録する。現行mainの楽天検索は旧接続方式のままで、新ドメイン・新認証方式への移行と実API確認はIssue #12で管理する。移行後の認証情報と設定項目は、Issue #12の変更を取り込んでからこの手順と `.env.example` に反映する。

### 2. ローカル依存関係

- Next.js 16の要件を満たすNode.jsを用意する（Node.js 20.9以上）
- `npm ci` で `package-lock.json` に基づき依存関係を復元する
- `postinstall` によりPrisma Clientが生成されることを確認する

### 3. データベース

- 開発用PostgreSQL/Neonの接続先を確認する。本番DBを誤って変更しない
- `npx prisma migrate deploy` で既存マイグレーションを適用する
- `npm run db:seed` でタグとCategoryWeightの初期データを投入する（upsertのため再実行可能）。実行前に接続先が開発DBであることを確認する
- seedスクリプトの対象・前提・既存データへの影響を確認してから必要なものだけ実行する

`npm run db:seed` は既存のTypeScriptコンパイラで `scripts/seedTags.ts` と `scripts/seed.ts` を一時出力先へコンパイルし、タグとCategoryWeightをupsertする。再実行可能ですが、実行前に開発DBであることを確認してください。`prisma/seed.ts` は別のデモデータ生成用で、30ユーザーとlike・UserBookTagを作成し、ID 1〜60の書籍と既存タグを前提とします。標準seedには含めず、既存データや本番DBで実行しないでください。

### 4. 起動と動作確認

- `npm run dev` でローカル起動
- ログイン（利用する場合）、書籍検索、書籍詳細表示を確認
- 楽天APIのエラーはサーバーログとNetwork応答で確認し、キー・リクエスト内容・応答を切り分ける
- `npm run lint` と `npm test` を実行し、結果を記録

## 進捗更新ルール

作業を進めたら、このファイルのチェック項目と「現状」を更新する。問題が出た場合は、再現手順・エラー概要・次の対応を追記する。秘密情報や接続文字列は記録しない。

## 作業ログ

### 2026-11-17

- Issue #17に紐づく `17-local-setup-docs` を `main` から作成。
- READMEにNode.js要件、依存関係復元、環境設定、マイグレーション、起動、lint・単体テストの手順を追加。
- seedスクリプトを確認。タグとCategoryWeightはupsert、`prisma/seed.ts` は30ユーザーと関連データを作成することを記録。
- Issue #12は未統合のため、新しい楽天API認証情報の設定は移行ブランチ統合後に反映する。
- `npm run db:seed` を追加し、タグとカテゴリ重みのseedだけを実行するよう設定。デモユーザー生成seedは標準コマンドから除外。


### 2026-11-07

- `main` がクリーンであることを確認
- ローカル／リモートに既存の `develop` がないことを確認し、新規作成して切り替え
- READMEには環境構築手順がなく、Next.js、Prisma、PostgreSQL（README記載ではNeon）、NextAuth、楽天ブックスAPIを利用していることを確認
- `RAKUTEN_APP_ID` は検索APIと書籍詳細取得で参照されている
- `DATABASE_URL`、`GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`、`NEXTAUTH_SECRET`、`ADMIN_EMAIL` の参照箇所を確認
- マイグレーションと複数のseedスクリプトが存在する。seed実行コマンドはpackage scriptsに登録されていない
