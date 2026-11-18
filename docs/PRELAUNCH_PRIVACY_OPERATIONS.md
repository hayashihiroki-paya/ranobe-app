# 公開前のプライバシー・運用要件

最終確認: 2026-11-18
対象: `main`（`71a981a`、Issue #27 のマージ後）

この文書は、リポジトリと公開情報から確認できた現状、未確認事項、公開前の作業を整理したものです。個人情報保護法等への適合性についての法的判断ではありません。運営主体、提供方法、利用者、委託先やデータ保存場所を確定した上で、最新の公式資料と専門家による確認が必要です。

## 方針案と判断事項

### リポジトリ公開範囲

- GitHub上のリポジトリは現在 **Public** です。
- 現時点の方針は **Publicを維持** です。READMEでサービスの目的と技術構成を公開しており、追跡対象の環境ファイルは値を含まない `.env.example` のみです。ソース公開自体は本番環境の秘密情報を公開する理由にはなりません。
- Publicであることを秘密情報対策の代わりにはできません。公開前に全履歴・全ブランチをスキャンし、漏えいが見つかった資格情報は失効・再発行します。対応Issueは [#46](https://github.com/hayashihiroki-paya/ranobe-app/issues/46) です。
- 事業上のソース秘匿要件や契約条件が変わる場合はPrivate化を再検討します。Public/Privateの切替は秘密情報対策の代わりにせず、公開前の履歴監査を完了します。

### 運営・提供形態（未確定）

運営者が個人か法人か、問い合わせ先、正式なサービス提供地域、料金・広告・アフィリエイトの有無はリポジトリから確定できません。これらは説明文書、問い合わせ先、追加の法令・API利用条件レビューに影響するため、Issue [#45](https://github.com/hayashihiroki-paya/ranobe-app/issues/45) で公開前に決定します。

## コードから確認できたデータと公開範囲

| データ | 確認できた内容 | 取扱い上の確認事項 |
| --- | --- | --- |
| アカウント | メールアドレス、表示名、プロフィール画像、パスワードハッシュ、作成日時、オンボーディング状態。パスワードはbcryptでハッシュ化して保存。 | 利用目的、保存期間、本人からの開示・訂正・削除依頼の受付方法を文書化する。 |
| Googleログイン | Googleのプロバイダー識別子と、認証Account行のトークン用フィールド（access/refresh/id token等）。 | Googleトークンの保管・失効を確認する。現状の削除処理はAccount行をDBから消すが、Google側のトークン失効を呼び出していない。対応Issueは [#49](https://github.com/hayashihiroki-paya/ranobe-app/issues/49)。 |
| 利用者の嗜好 | いいね、本棚、読みたい本、利用者が付けるタグ、タグスコア、ランキング。 | プロフィールページはログイン必須だが、ログイン利用者は別利用者の本棚・嗜好情報を閲覧できる実装。登録前に公開範囲を説明し、公開範囲を変更する必要があるか決める。 |
| 書籍・タグ | 書籍情報と共通タグ。楽天API等から取得する書誌情報と利用者入力のタグがある。 | 外部APIの表示・保存・再利用条件に従う。利用者データ削除時も共通書籍・タグは残す現行設計。 |
| 認証セッション | NextAuthはJWTセッション戦略。PrismaスキーマにはSessionモデルもある。 | Cookie、JWT、有効期間、ログへの出力、ホスティング側の保持を本番設定で確認する。 |

## アカウント削除・保持

- Issue #29（PR #42）により、アカウント削除はUserと関連するOAuth Account、Session、Like、Wish、LikeRank、UserBookTag、UserTagScoreをDBトランザクションで削除します。共有のBookとTagは保持します。
- Googleログインで登録したアカウントを削除した後、同じGoogle IDで新しいアカウントを作成できる場合があります。削除済み識別子を保持して再登録を禁止するかは未決です。現状の削除設計とデータ最小化を前提に、**再登録を許可し、削除済みIDを別途保持しない案**を推奨します。運営者が決定し、Issue #45 の利用者向け説明に反映します。
- DB本体の削除は実装済みですが、DBバックアップ、ログ、ホスティング側の保持期間と、削除済みデータがそれらから消える時期は未確認です。バックアップの保持・復旧・復元時の削除再適用は [#48](https://github.com/hayashihiroki-paya/ranobe-app/issues/48) で扱います。
- 問い合わせ窓口、本人確認方法、削除完了までの案内、バックアップ上の保持説明は未整備です（[#45](https://github.com/hayashihiroki-paya/ranobe-app/issues/45)、[#48](https://github.com/hayashihiroki-paya/ranobe-app/issues/48)）。

## 外部サービス・秘密情報

### 確認できた構成

- DB: PostgreSQL。READMEと依存関係はNeonを示していますが、本番プロジェクト、リージョン、契約プラン、委託条件は確認できていません。
- ホスティング: Issue #29 のマージ後にVercelチェック成功が記録されています。本番プロジェクト、環境変数、権限、リージョン、保持設定はリポジトリから確認できていません。
- 認証: Googleログインとメール・パスワードログイン。
- 書籍検索: 現行 `main` は旧楽天エンドポイント `app.rakuten.co.jp` と `RAKUTEN_APP_ID` を使います。新ドメイン・認証への移行と実API確認は未完了で、Issue [#12](https://github.com/hayashihiroki-paya/ranobe-app/issues/12) で管理しています。現行 `.env.example` に `RAKUTEN_ACCESS_KEY` はありません。

### 秘密情報

- `.gitignore` は `.env*` を除外し、`.env.example` だけ追跡対象にします。サンプル内はプレースホルダーです。環境変数は `DATABASE_URL`、`NEXTAUTH_SECRET`、Google OAuthのClient ID/Secret、`RAKUTEN_APP_ID`、`ADMIN_EMAIL` 等です。
- 本番値はGit、README、Issue、ブラウザー応答、ログへ記録せず、ホスティング側の秘密情報ストアで管理します。開発と本番のDB・OAuth/API資格情報を分離し、閲覧者を絞ります。
- `.env.example` の確認だけではGit履歴の過去漏えいは判定できません。履歴スキャンと本番設定レビューは公開前ゲートとして [#46](https://github.com/hayashihiroki-paya/ranobe-app/issues/46) に分割しました。

### 外部サービス利用条件

- 楽天ウェブサービスの規約は、利用範囲、アクセス回数・頻度、表示方法等を別途定める場合があるとしています。Books API固有の現行条件、商品情報の保存・表示・リンク、アプリIDや新しいaccess keyの管理、アフィリエイト利用の有無をIssue #12 の実API確認と合わせて確認します。上限値は現行の公式仕様を確認するまで決めません。
- GoogleのSign in with Googleのベストプラクティスは、アカウント削除時のトークン失効を案内しています。現状の削除処理との不足を [#49](https://github.com/hayashihiroki-paya/ranobe-app/issues/49) に分割しました。
- Neon、Vercel、Google等のデータ処理条件、保存地域、委託先・再委託先を確認し、利用者向け説明と一致させます。

## バックアップ・監視・障害対応

- リポジトリ内に、本番DBのバックアップ設定、保持期間、RPO/RTO、復元手順、復元演習の記録はありません。Neon側の本番プラン・設定を別途確認し、隔離環境への復元を検証します（[#48](https://github.com/hayashihiroki-paya/ranobe-app/issues/48)）。
- 一部処理に `console.error` はありますが、アプリケーションエラー・稼働監視、アラート先、担当者、利用者への障害告知手順はリポジトリから確認できません。エラー監視、ログの個人情報・秘密情報除外、障害対応手順を [#47](https://github.com/hayashihiroki-paya/ranobe-app/issues/47) で整備します。
- 検索APIとユーザー登録などの公開エンドポイントにアプリケーションレベルのレート制限は確認できません。楽天APIの契約上限とホスティング保護機能を確認し、複数インスタンスで有効な制限を [#50](https://github.com/hayashihiroki-paya/ranobe-app/issues/50) で実装します。

## 公開開始前の完了ゲート

以下はこのプロジェクトの運用上の公開開始ゲートです。法令上の義務の網羅的な判断ではありません。

| 優先度 | 内容 | 状態・Issue |
| --- | --- | --- |
| P0 | プライバシー説明、利用規約、運営者・問い合わせ窓口、プロフィール公開範囲、削除後の再登録方針を決定し、利用者に提示 | 未着手、[#45](https://github.com/hayashihiroki-paya/ranobe-app/issues/45) |
| P0 | Google OAuthトークンをアカウント削除時に失効 | 未着手、[#49](https://github.com/hayashihiroki-paya/ranobe-app/issues/49) |
| P0 | Git履歴の秘密情報スキャン、本番資格情報の保管・権限・ローテーション確認 | 未着手、[#46](https://github.com/hayashihiroki-paya/ranobe-app/issues/46) |
| P0 | 本番DBの保持・復旧目標を定め、復元手順を実地確認 | 未着手、[#48](https://github.com/hayashihiroki-paya/ranobe-app/issues/48) |
| P0 | エラー監視、通知先、障害時の利用者案内と対応責任者を確認 | 未着手、[#47](https://github.com/hayashihiroki-paya/ranobe-app/issues/47) |
| P0 | 楽天APIを新仕様へ移行し、実API接続・表示条件・アクセス上限を確認 | 未完了、[#12](https://github.com/hayashihiroki-paya/ranobe-app/issues/12)、レート制限は[#50](https://github.com/hayashihiroki-paya/ranobe-app/issues/50) |
| 方針 | リポジトリPublic維持 | 採用。秘密情報履歴監査は[#46](https://github.com/hayashihiroki-paya/ranobe-app/issues/46)で公開前に完了する |
| 判断 | 事業者の個人/法人、提供地域、広告・アフィリエイト有無、データ保存地域 | 未確定。運営者が決定し、契約・法令レビューを行う（[#45](https://github.com/hayashihiroki-paya/ranobe-app/issues/45)） |

## 公式資料

- [個人情報保護委員会「個人情報の保護に関する法律についてのガイドライン（通則編）」](https://www.ppc.go.jp/personalinfo/legal/guidelines_tsusoku/)
- [Google「Best Practices for Implementing Sign in with Google」](https://developers.google.com/identity/siwg/best-practices)
- [Google「OAuth 2.0 Best Practices」](https://developers.google.com/identity/protocols/oauth2/resources/best-practices)
- [楽天ウェブサービス利用規約](https://webservice.rakuten.co.jp/guide/rule)

## 作業記録

- 2026-11-18: `main` の実装、環境設定例、README、関連Issueを確認。GitHubメタデータからリポジトリがPublicであることを確認。
- 2026-11-18: 個人情報保護委員会、Google、楽天ウェブサービスの公式資料を確認。公開前ゲートと未確認事項を整理。
- 2026-11-18: 実装作業を [#45](https://github.com/hayashihiroki-paya/ranobe-app/issues/45)〜[#50](https://github.com/hayashihiroki-paya/ranobe-app/issues/50) に分割。既存の楽天API移行 [#12](https://github.com/hayashihiroki-paya/ranobe-app/issues/12) とアカウント削除 [#29](https://github.com/hayashihiroki-paya/ranobe-app/issues/29) は重複作成せず関連づけた。
