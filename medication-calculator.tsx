"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, X, Info } from "lucide-react"
// Supabaseクライアントをインポート（環境に合わせてパスを調整してください）
import { supabase } from "@/lib/supabase"

type DangerousDose = {
  toxic?: number
  lethal?: number
  toxicPerKg?: number
  lethalPerKg?: number
  unit?: string
  halfLife?: string
  symptoms?: string
  treatment?: string
}

export default function Component() {
  // --- Supabaseから取得するデータを格納するステート ---
  const [medications, setMedications] = useState<Record<string, any>>({})
  const [dangerousDoses, setDangerousDoses] = useState<Record<string, DangerousDose>>({})
  const [isLoading, setIsLoading] = useState(true)

  console.log("med");
  console.log(medications);
  console.log("dan");
  console.log(dangerousDoses);

  // --- 既存のステート ---
  const [medicationName, setMedicationName] = useState("")
  const [dosage, setDosage] = useState("")
  const [medicationList, setMedicationList] = useState<Array<{ name: string; dosage: number; id: number }>>([])
  const [totalIngredients, setTotalIngredients] = useState<Record<string, { amount: number; unit: string }>>({})
  const [dosageInfo, setDosageInfo] = useState<Record<string, { status: string; message: string }>>({})
  const [nextId, setNextId] = useState(1)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLUListElement>(null)

  // --- 1. Supabaseからデータをフェッチして初期化 ---
  useEffect(() => {
    async function fetchMasterData() {
      try {
        // テーブル名は自身の環境に合わせて適宜変更してください
        const { data: medsData } = await supabase.from('medications').select('*')
        const { data: dosesData } = await supabase.from('dangerousDoses').select('*')

        if (medsData && dosesData) {
          // 既存の dangerousDoses オブジェクト形式に変換
          const dObj: Record<string, DangerousDose> = {}
          dosesData.forEach(d => {
            dObj[d.name] = {
              toxic: d.toxic,
              lethal: d.lethal,
              toxicPerKg: d.toxic_per_kg,
              lethalPerKg: d.lethal_per_kg,
              unit: d.unit,
              halfLife: d.half_life,
              symptoms: d.symptoms,
              treatment: d.treatment
            }
          })

    // 2. 薬剤データ (medications) の整形
            const mObj: Record<string, any> = {}
            medsData.forEach(m => {
              // drugMasterId を使って、dosesData から成分名(name)を検索する
              const ingredient = dosesData.find(d => d.id === m.drugMasterId)
              
              if (ingredient) {
                // brandName をキーにして、成分名と含有量を格納
                mObj[m.brandName] = {
                  [ingredient.name]: { amount: m.amount, unit: m.unit }
                }
              }
            })

          setDangerousDoses(dObj)
          setMedications(mObj)
        }
      } catch (error) {
        console.error("Data fetch error:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMasterData()
  }, [])

  // --- 既存の判定ロジック（そのまま） ---
  const checkDosages = (
    totalIngredients: Record<string, { amount: number; unit: string }>,
  ) => {
    const newDosageInfo: Record<string, { status: string; message: string }> = {}
    Object.entries(totalIngredients).forEach(([ingredient, { amount, unit }]) => {
      if (dangerousDoses[ingredient]) {
        const { toxic, lethal, toxicPerKg, lethalPerKg, halfLife, symptoms, treatment } = dangerousDoses[ingredient]
        let status = "info"
        let message = ""

        if (lethal && amount >= lethal) {
          status = "lethal"
          message = `警告: 致死量（${lethal}${unit}）を超えています。`
        } else if (toxic && amount >= toxic) {
          status = "toxic"
          message = `注意: 中毒量（${toxic}${unit}）を超えています。`
        } else if (toxic || lethal) {
          status = "info"
          message = `中毒量: ${toxic || "不明"}${unit}, 致死量: ${lethal || "不明"}${unit}`
        } else if (toxicPerKg || lethalPerKg) {
          status = "info"
          message = ""
        } else {
          message = "特定の中毒量および致死量は報告されていません。臨床症状に従ってください。"
        }

        if (toxicPerKg || lethalPerKg) {
          message += `\n/kg用量 - 中毒量: ${toxicPerKg || "不明"}mg/kg, 致死量: ${lethalPerKg || "不明"}mg/kg`
        }
        if (halfLife) message += `\n半減期: ${halfLife}`
        if (symptoms) message += `\n症状: ${symptoms}`
        if (treatment) message += `\n治療: ${treatment}`

        newDosageInfo[ingredient] = { status, message }
      }
    })
    setDosageInfo(newDosageInfo)
  }

  // --- 既存のアクション（そのまま） ---
  const addMedication = () => {

  // 現在の入力値と、保持しているマスターデータの全リストをログに出します
    console.log("--- 追加ボタン押下 ---");
    console.log("入力された薬名:", medicationName);
    console.log("入力された用量:", dosage);
    console.log("現在保持している全薬剤キー:", Object.keys(medications));

    if (medicationName && dosage && medications[medicationName]) {
      const newMedication = { name: medicationName, dosage: Number.parseFloat(dosage), id: nextId }
      const newList = [...medicationList, newMedication]
      setMedicationList(newList)
      setNextId(nextId + 1)
      calculateTotal(newList)
      setMedicationName("")
      setDosage("")
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const removeMedication = (id: number) => {
    const newList = medicationList.filter((med) => med.id !== id)
    setMedicationList(newList)
    calculateTotal(newList)
  }

  const calculateTotal = (list: Array<{ name: string; dosage: number; id: number }>) => {
    const totals: Record<string, { amount: number; unit: string }> = {}
    list.forEach((med) => {
      const ingredients = medications[med.name]
      if (!ingredients) return
      Object.entries(ingredients).forEach(([ingredient, data]: any) => {
        if (totals[ingredient]) {
          totals[ingredient].amount += data.amount * med.dosage
        } else {
          totals[ingredient] = { amount: data.amount * med.dosage, unit: data.unit }
        }
      })
    })
    setTotalIngredients(totals)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMedicationName(value)
    if (value.length > 0) {
      const filteredSuggestions = Object.keys(medications).filter((med) =>
        med.toLowerCase().includes(value.toLowerCase()),
      )
      setSuggestions(filteredSuggestions)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setMedicationName(suggestion)
    setSuggestions([])
    setShowSuggestions(false)
  }

  useEffect(() => {
    checkDosages(totalIngredients)
  }, [totalIngredients, dangerousDoses])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">データを取得中...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
    <div className="w-full max-w-md">
    <Card>
      <CardHeader>
        <CardTitle>薬剤計算機-test</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); addMedication(); }} className="space-y-4">
          <div className="relative">
            <Label htmlFor="medication-name">薬の名前</Label>
            <Input
              id="medication-name"
              value={medicationName}
              onChange={handleInputChange}
              placeholder="例: カロナール錠500"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul
                ref={suggestionsRef}
                className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto rounded-md shadow-lg"
              >
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <Label htmlFor="dosage">内服量</Label>
            <Input
              id="dosage"
              type="number"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="例: 1錠"
              min="0"
            />
          </div>
          <Button type="submit">追加</Button>
        </form>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">追加された薬</h3>
          <ul className="space-y-2">
            {medicationList.map((med) => (
              <li key={med.id} className="flex items-center justify-between bg-secondary p-2 rounded">
                <span className="text-sm">{med.name}: {med.dosage} 錠</span>
                <Button variant="ghost" size="icon" onClick={() => removeMedication(med.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">成分ごとの合計と安全性</h3>
          <ul className="list-none pl-0 space-y-4">
            {Object.entries(totalIngredients).map(([ingredient, { amount, unit }]) => (
              <li key={ingredient} className="flex flex-col">
                <div className="flex justify-between items-center text-sm">
                  <span>{ingredient}:</span>
                  <span className="font-bold">{amount}{unit}</span>
                </div>
                {dosageInfo[ingredient] && (
                  <Alert variant={dosageInfo[ingredient].status === "info" ? "default" : "destructive"} className="mt-2">
                    {dosageInfo[ingredient].status === "info" ? <Info className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    <AlertTitle>{dosageInfo[ingredient].status === "info" ? "情報" : "警告"}</AlertTitle>
                    <AlertDescription className="text-xs whitespace-pre-wrap">
                      {dosageInfo[ingredient].message}
                    </AlertDescription>
                  </Alert>
                )}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <div className="px-6 pb-4 flex justify-between">
        <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600">
          管理画面
        </Link>
        <Link href="/contact" className="text-xs text-gray-400 hover:text-gray-600">
          お問い合わせ
        </Link>
      </div>
    </Card>
    </div>
    </div>
  )
}