import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | 蔵出し管理帳',
  description: '蔵出し管理帳アプリのプライバシーポリシー',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 leading-relaxed">
      <h1 className="text-2xl font-bold mb-2">プライバシーポリシー</h1>
      <p className="text-sm text-slate-500 mb-10">最終更新日: 2026年8月28日</p>

      <p className="mb-8">
        「蔵出し管理帳」（以下「本アプリ」）は、個人開発者である高橋由華（以下「開発者」）が提供する、食品・防災備蓄品の消費期限を管理するアプリケーションです。本ポリシーは、本アプリの利用に伴い取得する情報の取り扱いについて説明します。
      </p>

      <Section title="1. 取得する情報">
        <p className="mb-3">本アプリの利用に伴い、以下の情報を取り扱います。</p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>アカウント情報（メールアドレス）</strong>: Google・Appleアカウント、またはデモアカウントでのログインの際に、メールアドレスを取得します。認証基盤であるSupabase, Inc.を通じて管理されます。
          </li>
          <li>
            <strong>登録したアイテムの情報</strong>: 食品名・カテゴリ・消費期限・保存場所・数量・バーコード等、ユーザーが入力または撮影により取得した情報です。アプリの一覧表示・期限通知などのコア機能のため、開発者が管理するデータベース（Supabase）に保存されます。
          </li>
          <li>
            <strong>撮影した商品の写真</strong>: バーコード・商品名・消費期限を読み取るために、商品パッケージの写真を撮影していただきます。この写真は読み取りのためだけに第三者であるAnthropic, PBC（アメリカ）のAPIへ送信されます。写真そのものは開発者のサーバーに保存されることはなく、読み取り結果の生成後は送信した写真データを保持しません。写真をAIモデルの学習に利用したり、読み取り目的以外で第三者に提供したりすることはありません。アプリ内で初めて撮影機能を利用する際に、この内容へのご同意をアプリ内で確認しています。
          </li>
          <li>
            <strong>通知設定・カレンダー同期設定</strong>: リマインドメールを送るタイミングや、iOSカレンダーに同期するかどうかの設定です。アイテム情報と同様にデータベースに保存されます。
          </li>
        </ul>
      </Section>

      <Section title="2. 情報の第三者提供・委託先">
        <p className="mb-3">本アプリは、以下の第三者サービスを利用しています。それぞれの情報の取り扱いは、各社のプライバシーポリシーに従います。</p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Anthropic, PBC</strong>: 商品情報の読み取り（AI画像解析）のため、撮影した写真をAPI経由で送信します。同社の利用規約に基づき取り扱われ、モデルの学習には使用されません。
          </li>
          <li>
            <strong>Google LLC</strong>: Googleアカウントによるログイン機能のため。
          </li>
          <li>
            <strong>Apple Inc.</strong>: Sign in with Appleによるログイン機能のため。
          </li>
          <li>
            <strong>Supabase, Inc.</strong>: ユーザー認証、およびアイテム情報のデータベースホスティングのため。
          </li>
          <li>
            <strong>Vercel Inc.</strong>: 本アプリのWebサイトおよびAPIサーバーのホスティングのため。
          </li>
          <li>
            <strong>Resend</strong>: 消費期限のリマインドメール配信のため、登録されたメールアドレス宛にメールを送信します。
          </li>
        </ul>
        <p className="mt-3">上記以外の目的で、取得した情報を第三者に販売・提供することはありません。</p>
      </Section>

      <Section title="3. データの保存場所と削除">
        <p>
          登録したアイテム情報・アカウント情報は、開発者が管理するデータベース（Supabase）に、ユーザーが本アプリを利用する間保存されます。アプリ内の「設定」画面から、いつでもアカウントを削除することができます。アカウントを削除すると、そのアカウントに紐づくアイテム情報を含め、保存されている情報はすべて完全に削除されます。カレンダー（.ics）・CSVのエクスポートは、ユーザーが操作した場合にのみ端末上でファイルとして生成・共有され、開発者のサーバーを経由することはありません。
        </p>
      </Section>

      <Section title="4. 広告・トラッキングについて">
        <p>本アプリは広告を表示しません。また、広告目的でのトラッキング（IDFA等の広告識別子の収集）は行いません。</p>
      </Section>

      <Section title="5. お子様のプライバシー">
        <p>本アプリは、13歳未満のお子様による利用を意図していません。13歳未満のお子様から意図せず情報を取得したことが判明した場合、速やかに削除します。</p>
      </Section>

      <Section title="6. セキュリティ">
        <p>写真および各種情報の送受信には、通信の暗号化（HTTPS）を使用しています。ただし、インターネットを通じた情報伝送の安全性を完全に保証するものではありません。</p>
      </Section>

      <Section title="7. 本ポリシーの変更">
        <p>本ポリシーの内容は、法令の変更や本アプリの機能追加等に伴い、予告なく変更されることがあります。重要な変更がある場合は、本ページ上でお知らせします。</p>
      </Section>

      <Section title="8. お問い合わせ">
        <p>
          本ポリシーに関するご質問・ご意見は、下記までご連絡ください。
          <br />
          開発者: 高橋由華
          <br />
          お問い合わせ先: <a href="mailto:yukachristina1991@gmail.com" className="text-blue-600 underline">yukachristina1991@gmail.com</a>
        </p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      {children}
    </section>
  );
}
