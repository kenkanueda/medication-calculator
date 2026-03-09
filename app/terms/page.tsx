import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← 薬剤計算機に戻る
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">利用規約・免責事項</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 space-y-6">
            <section>
              <h2 className="font-semibold text-base mb-2">1. 本アプリの性質について</h2>
              <p>
                本アプリ（medication-calculator）は、薬剤の用法・用量に基づいた計算を補助するための個人的な学習・業務効率化ツールであり、厚生労働省が定義する「医療機器（プログラム医療機器）」ではありません。
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">2. 免責事項</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="font-medium">正確性の限界：</span>
                  計算結果の正確性については細心の注意を払っておりますが、データの誤り、プログラムのバグ、または計算ロジックの不備がないことを保証するものではありません。
                </li>
                <li>
                  <span className="font-medium">自己責任の原則：</span>
                  本アプリの計算結果はあくまで「参考値」です。投与量、投与経路、投与速度等の最終的な決定は、必ず利用される医師・薬剤師等の専門家が、自身の医学的知見および最新の添付文書（PMDA等）に基づき、自らの責任において行ってください。
                </li>
                <li>
                  <span className="font-medium">損害への対応：</span>
                  本アプリを利用したことによって生じた直接的、間接的、付随的、結果的損害（医療過誤、健康被害、データ消失、業務中断等を含むがこれらに限定されない）について、開発者は一切の責任を負いません。
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">3. データの根拠</h2>
              <p>
                本アプリが参照している薬剤データは、一般的な医療用医薬品の添付文書に基づいています。患者個別の臨床状態（腎機能・肝機能、併用薬、アレルギー、禁忌事項等）は計算に反映されません。
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-base mb-2">4. 利用条件への同意</h2>
              <p>
                本アプリを利用することにより、利用者は上記の免責事項および利用規約のすべてに同意したものとみなされます。同意いただけない場合は、本アプリの利用をお控えください。
              </p>
            </section>

            <p className="text-xs text-gray-400 pt-2 border-t">
              最終更新日：2025年
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
