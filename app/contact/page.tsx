"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

type FormState = {
  name: string
  email: string
  subject: string
  message: string
}

const initialForm: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus("idle")

    const { error } = await supabase.from("contact_inquiries").insert([
      {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      },
    ])

    if (error) {
      setErrorMessage(error.message)
      setStatus("error")
    } else {
      setStatus("success")
      setForm(initialForm)
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
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
            {status === "success" && (
              <Alert className="mb-6 border-green-300 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  お問い合わせを受け付けました。ありがとうございます。
                </AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <Alert className="mb-6 border-red-300 bg-red-50 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  送信に失敗しました: {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">名前</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="山田 太郎"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="example@email.com"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="subject">件名</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  placeholder="件名を入力してください"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="message">メッセージ</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  placeholder="お問い合わせ内容を入力してください"
                  rows={5}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "送信中..." : "送信する"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
