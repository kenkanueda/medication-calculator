import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← 薬剤計算機に戻る
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">お問い合わせ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              ご意見・ご要望・不具合の報告などは、以下のメールアドレスまでお送りください。
            </p>
            <a
              href="mailto:tomtom.kito@gmail.com"
              className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
            >
              <Mail className="h-4 w-4" />
              tomtom.kito@gmail.com
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
