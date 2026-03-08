"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pencil, Trash2, Plus, LogOut } from "lucide-react"

// ---- 型定義 ----
type DangerousDoseRow = {
  id: string
  name: string
  toxic: number | null
  lethal: number | null
  toxicPerKg: number | null
  lethalPerKg: number | null
  unit: string | null
  halfLife: string | null
  symptoms: string | null
  treatment: string | null
}

type MedicationRow = {
  id: number
  brand_name: string
  medication_ingredients: {
    id: number
    ingredient_id: number
    amount: number | null
    unit: string | null
    ingredients: { id: number; name: string } | null
  }[]
}

type IngredientRow = {
  id: number
  name: string
}

type MedIngFormRow = {
  ingredient_name: string
  amount: number | null
  unit: string
}

const emptyDose: Omit<DangerousDoseRow, "id"> = {
  name: "",
  toxic: null,
  lethal: null,
  toxicPerKg: null,
  lethalPerKg: null,
  unit: null,
  halfLife: null,
  symptoms: null,
  treatment: null,
}

const emptyIngRow: MedIngFormRow = { ingredient_name: "", amount: null, unit: "mg" }

// ---- ヘルパー ----
function numOrNull(v: string): number | null {
  const n = parseFloat(v)
  return isNaN(n) ? null : n
}
function strOrNull(v: string): string | null {
  return v.trim() === "" ? null : v.trim()
}

// ================================================================
// dangerousDoses タブ
// ================================================================
function DangerousDosesTab() {
  const [rows, setRows] = useState<DangerousDoseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<DangerousDoseRow | null>(null)
  const [form, setForm] = useState<Omit<DangerousDoseRow, "id">>(emptyDose)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from("dangerousDoses").select("*").order("name")
    setRows(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setEditing(null)
    setForm(emptyDose)
    setOpen(true)
  }

  function openEdit(row: DangerousDoseRow) {
    setEditing(row)
    setForm({
      name: row.name,
      toxic: row.toxic,
      lethal: row.lethal,
      toxicPerKg: row.toxicPerKg,
      lethalPerKg: row.lethalPerKg,
      unit: row.unit,
      halfLife: row.halfLife,
      symptoms: row.symptoms,
      treatment: row.treatment,
    })
    setOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      name: form.name,
      toxic: form.toxic,
      lethal: form.lethal,
      toxicPerKg: form.toxicPerKg,
      lethalPerKg: form.lethalPerKg,
      unit: strOrNull(form.unit ?? ""),
      halfLife: strOrNull(form.halfLife ?? ""),
      symptoms: strOrNull(form.symptoms ?? ""),
      treatment: strOrNull(form.treatment ?? ""),
    }
    if (editing) {
      await supabase.from("dangerousDoses").update(payload).eq("id", editing.id)
    } else {
      await supabase.from("dangerousDoses").insert([payload])
    }
    setSaving(false)
    setOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    await supabase.from("dangerousDoses").delete().eq("id", id)
    setDeleteId(null)
    load()
  }

  function f(name: keyof Omit<DangerousDoseRow, "id">) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const raw = e.target.value
      const numFields = ["toxic", "lethal", "toxicPerKg", "lethalPerKg"] as const
      if ((numFields as readonly string[]).includes(name)) {
        setForm(prev => ({ ...prev, [name]: raw === "" ? null : numOrNull(raw) }))
      } else {
        setForm(prev => ({ ...prev, [name]: raw }))
      }
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" /> 追加
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">読み込み中...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-3 py-2 whitespace-nowrap">成分名</th>
                <th className="px-3 py-2 whitespace-nowrap">単位</th>
                <th className="px-3 py-2 whitespace-nowrap">中毒量</th>
                <th className="px-3 py-2 whitespace-nowrap">致死量</th>
                <th className="px-3 py-2 whitespace-nowrap">中毒量/kg</th>
                <th className="px-3 py-2 whitespace-nowrap">致死量/kg</th>
                <th className="px-3 py-2 whitespace-nowrap">半減期</th>
                <th className="px-3 py-2 whitespace-nowrap">症状</th>
                <th className="px-3 py-2 whitespace-nowrap">治療</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-b hover:bg-gray-50 align-top">
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{row.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.unit ?? "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.toxic ?? "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.lethal ?? "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.toxicPerKg ?? "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.lethalPerKg ?? "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.halfLife ?? "—"}</td>
                  <td className="px-3 py-2 max-w-[200px]">
                    <p className="line-clamp-2 text-xs">{row.symptoms ?? "—"}</p>
                  </td>
                  <td className="px-3 py-2 max-w-[200px]">
                    <p className="line-clamp-2 text-xs">{row.treatment ?? "—"}</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(row.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-4 text-center text-gray-400">データなし</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 追加・編集ダイアログ */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "有効成分を編集" : "有効成分を追加"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>成分名 *</Label>
              <Input value={form.name} onChange={f("name")} placeholder="例: アセトアミノフェン" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>単位</Label>
                <Input value={form.unit ?? ""} onChange={f("unit")} placeholder="例: mg" />
              </div>
              <div className="space-y-1">
                <Label>半減期</Label>
                <Input value={form.halfLife ?? ""} onChange={f("halfLife")} placeholder="例: 2〜3時間" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>中毒量</Label>
                <Input type="number" value={form.toxic ?? ""} onChange={f("toxic")} placeholder="数値" />
              </div>
              <div className="space-y-1">
                <Label>致死量</Label>
                <Input type="number" value={form.lethal ?? ""} onChange={f("lethal")} placeholder="数値" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>中毒量/kg</Label>
                <Input type="number" value={form.toxicPerKg ?? ""} onChange={f("toxicPerKg")} placeholder="mg/kg" />
              </div>
              <div className="space-y-1">
                <Label>致死量/kg</Label>
                <Input type="number" value={form.lethalPerKg ?? ""} onChange={f("lethalPerKg")} placeholder="mg/kg" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>症状</Label>
              <Textarea value={form.symptoms ?? ""} onChange={f("symptoms")} rows={2} />
            </div>
            <div className="space-y-1">
              <Label>治療</Label>
              <Textarea value={form.treatment ?? ""} onChange={f("treatment")} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>キャンセル</Button>
            <Button onClick={handleSave} disabled={saving || !form.name}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>削除の確認</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">この有効成分を削除しますか？関連する薬剤データにも影響する場合があります。</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>キャンセル</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>削除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ================================================================
// medications タブ
// ================================================================
function MedicationsTab() {
  const [rows, setRows] = useState<MedicationRow[]>([])
  const [ingredients, setIngredients] = useState<IngredientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<MedicationRow | null>(null)
  const [brandName, setBrandName] = useState("")
  const [ingRows, setIngRows] = useState<MedIngFormRow[]>([{ ...emptyIngRow }])
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    const [{ data: medsData }, { data: ingData }] = await Promise.all([
      supabase
        .from("medications")
        .select(`id, brand_name, medication_ingredients ( id, ingredient_id, amount, unit, ingredients ( id, name ) )`)
        .order("brand_name"),
      supabase.from("ingredients").select("id, name").order("name"),
    ])
    setRows((medsData as MedicationRow[]) ?? [])
    setIngredients(ingData ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setEditing(null)
    setBrandName("")
    setIngRows([{ ...emptyIngRow }])
    setOpen(true)
  }

  function openEdit(row: MedicationRow) {
    setEditing(row)
    setBrandName(row.brand_name)
    setIngRows(
      row.medication_ingredients.length > 0
        ? row.medication_ingredients.map(mi => ({
            ingredient_name: mi.ingredients?.name ?? "",
            amount: mi.amount,
            unit: mi.unit ?? "mg",
          }))
        : [{ ...emptyIngRow }]
    )
    setOpen(true)
  }

  async function handleSave() {
    if (!brandName.trim()) return
    setSaving(true)

    // 1. medication を upsert（brand_name がユニーク）
    const { data: medData, error: medErr } = await supabase
      .from("medications")
      .upsert({ ...(editing ? { id: editing.id } : {}), brand_name: brandName.trim() }, { onConflict: "brand_name" })
      .select("id")
      .single()

    if (medErr || !medData) { setSaving(false); return }
    const medId = medData.id

    // 2. 既存の medication_ingredients を全削除
    await supabase.from("medication_ingredients").delete().eq("medication_id", medId)

    // 3. 有効な行ごとに ingredient upsert → medication_ingredients insert
    for (const row of ingRows) {
      if (!row.ingredient_name.trim() || row.amount === null) continue
      const { data: ingData } = await supabase
        .from("ingredients")
        .upsert({ name: row.ingredient_name.trim() }, { onConflict: "name" })
        .select("id")
        .single()
      if (!ingData) continue
      await supabase.from("medication_ingredients").insert({
        medication_id: medId,
        ingredient_id: ingData.id,
        amount: row.amount,
        unit: row.unit || "mg",
      })
    }

    setSaving(false)
    setOpen(false)
    load()
  }

  async function handleDelete(id: number) {
    await supabase.from("medications").delete().eq("id", id)
    setDeleteId(null)
    load()
  }

  function updateIngRow(idx: number, field: keyof MedIngFormRow, value: string | number | null) {
    setIngRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }

  function addIngRow() {
    setIngRows(prev => [...prev, { ...emptyIngRow }])
  }

  function removeIngRow(idx: number) {
    setIngRows(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" /> 追加
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">読み込み中...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-3 py-2 whitespace-nowrap">商品名</th>
                <th className="px-3 py-2">有効成分（含有量）</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-b hover:bg-gray-50 align-top">
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{row.brand_name}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">
                    {row.medication_ingredients.map((mi, i) => (
                      <span key={i} className="mr-2">
                        {mi.ingredients?.name ?? "?"} {mi.amount}{mi.unit}
                      </span>
                    ))}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(row.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={3} className="px-3 py-4 text-center text-gray-400">データなし</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 追加・編集ダイアログ */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "薬剤を編集" : "薬剤を追加"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>商品名 *</Label>
              <Input
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                placeholder="例: カロナール錠500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>有効成分</Label>
                <Button type="button" variant="outline" size="sm" onClick={addIngRow}>
                  <Plus className="h-3 w-3 mr-1" /> 成分を追加
                </Button>
              </div>
              {ingRows.map((row, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1">
                    <Select
                      value={row.ingredient_name}
                      onValueChange={v => updateIngRow(idx, "ingredient_name", v)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="成分を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredients.map(ing => (
                          <SelectItem key={ing.id} value={ing.name}>{ing.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="number"
                    className="w-24"
                    placeholder="含有量"
                    value={row.amount ?? ""}
                    onChange={e => updateIngRow(idx, "amount", numOrNull(e.target.value))}
                  />
                  <Input
                    className="w-16"
                    placeholder="単位"
                    value={row.unit}
                    onChange={e => updateIngRow(idx, "unit", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngRow(idx)}
                    disabled={ingRows.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>キャンセル</Button>
            <Button onClick={handleSave} disabled={saving || !brandName.trim()}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>削除の確認</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">この薬剤を削除しますか？</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>キャンセル</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>削除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ================================================================
// メインページ
// ================================================================
export default function AdminPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/admin/login")
      } else {
        setChecking(false)
      }
    })
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace("/admin/login")
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">確認中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← 薬剤計算機に戻る
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500">
            <LogOut className="h-4 w-4 mr-1" />
            ログアウト
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>管理画面</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="doses">
              <TabsList className="mb-4">
                <TabsTrigger value="doses">有効成分マスタ</TabsTrigger>
                <TabsTrigger value="medications">薬剤</TabsTrigger>
              </TabsList>
              <TabsContent value="doses">
                <DangerousDosesTab />
              </TabsContent>
              <TabsContent value="medications">
                <MedicationsTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
