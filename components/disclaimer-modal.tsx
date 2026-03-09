"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const STORAGE_KEY = "disclaimer_agreed_v1"

export function DisclaimerModal() {
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setOpen(true)
    }
  }, [])

  function handleAgree() {
    localStorage.setItem(STORAGE_KEY, "true")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            ⚠️ ご利用前の重要事項（免責事項）
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-gray-700 space-y-4">
          <section>
            <h3 className="font-semibold mb-1">1. 本アプリの性質について</h3>
            <p>
              本アプリ（medication-calculator）は、薬剤の用法・用量に基づいた計算を補助するための個人的な学習・業務効率化ツールであり、厚生労働省が定義する「医療機器（プログラム医療機器）」ではありません。
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">2. 免責事項</h3>
            <ul className="list-disc pl-5 space-y-1">
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
            <h3 className="font-semibold mb-1">3. データの根拠</h3>
            <p>
              本アプリが参照している薬剤データは、一般的な医療用医薬品の添付文書に基づいています。患者個別の臨床状態（腎機能・肝機能、併用薬、アレルギー、禁忌事項等）は計算に反映されません。
            </p>
          </section>

          <div className="flex items-start gap-3 pt-2 border-t">
            <Checkbox
              id="agree"
              checked={checked}
              onCheckedChange={v => setChecked(!!v)}
            />
            <Label htmlFor="agree" className="leading-snug cursor-pointer">
              私は上記の免責事項をすべて読み、内容を理解しました。本アプリの計算結果を鵜呑みにせず、自身の責任において利用することに同意します。
            </Label>
          </div>
        </div>

        <Button
          className="w-full mt-2"
          disabled={!checked}
          onClick={handleAgree}
        >
          同意して利用する
        </Button>
      </DialogContent>
    </Dialog>
  )
}
