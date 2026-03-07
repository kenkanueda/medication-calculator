"use client"

import { useState, useEffect } from "react"
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
import { Pencil, Trash2, Plus } from "lucide-react"

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
  id: string
  brandName: string
  drugMasterId: string
  amount: number | null
  unit: string | null
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

const emptyMed: Omit<MedicationRow, "id"> = {
  brandName: "",
  drugMasterId: "",
  amount: null,
  unit: null,
}

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
  const [doses, setDoses] = useState<DangerousDoseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<MedicationRow | null>(null)
  const [form, setForm] = useState<Omit<MedicationRow, "id">>(emptyMed)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const [{ data: medsData }, { data: dosesData }] = await Promise.all([
      supabase.from("medications").select("*").order("brandName"),
      supabase.from("dangerousDoses").select("*").order("name"),
    ])
    setRows(medsData ?? [])
    setDoses(dosesData ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setEditing(null)
    setForm(emptyMed)
    setOpen(true)
  }

  function openEdit(row: MedicationRow) {
    setEditing(row)
    setForm({
      brandName: row.brandName,
      drugMasterId: row.drugMasterId,
      amount: row.amount,
      unit: row.unit,
    })
    setOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      brandName: form.brandName,
      drugMasterId: form.drugMasterId,
      amount: form.amount,
      unit: strOrNull(form.unit ?? ""),
    }
    if (editing) {
      await supabase.from("medications").update(payload).eq("id", editing.id)
    } else {
      await supabase.from("medications").insert([payload])
    }
    setSaving(false)
    setOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    await supabase.from("medications").delete().eq("id", id)
    setDeleteId(null)
    load()
  }

  function ingredientName(drugMasterId: string) {
    return doses.find(d => d.id === drugMasterId)?.name ?? drugMasterId
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
                <th className="px-3 py-2 whitespace-nowrap">有効成分</th>
                <th className="px-3 py-2 whitespace-nowrap">含有量</th>
                <th className="px-3 py-2 whitespace-nowrap">単位</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{row.brandName}</td>
                  <td className="px-3 py-2">{ingredientName(row.drugMasterId)}</td>
                  <td className="px-3 py-2">{row.amount ?? "—"}</td>
                  <td className="px-3 py-2">{row.unit ?? "—"}</td>
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
                <tr><td colSpan={5} className="px-3 py-4 text-center text-gray-400">データなし</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 追加・編集ダイアログ */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "薬剤を編集" : "薬剤を追加"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>商品名 *</Label>
              <Input
                value={form.brandName}
                onChange={e => setForm(prev => ({ ...prev, brandName: e.target.value }))}
                placeholder="例: カロナール錠500"
              />
            </div>
            <div className="space-y-1">
              <Label>有効成分 *</Label>
              <Select
                value={form.drugMasterId}
                onValueChange={v => setForm(prev => ({ ...prev, drugMasterId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="成分を選択" />
                </SelectTrigger>
                <SelectContent>
                  {doses.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>含有量</Label>
                <Input
                  type="number"
                  value={form.amount ?? ""}
                  onChange={e => setForm(prev => ({ ...prev, amount: numOrNull(e.target.value) }))}
                  placeholder="例: 500"
                />
              </div>
              <div className="space-y-1">
                <Label>単位</Label>
                <Input
                  value={form.unit ?? ""}
                  onChange={e => setForm(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="例: mg"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>キャンセル</Button>
            <Button onClick={handleSave} disabled={saving || !form.brandName || !form.drugMasterId}>
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
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← 薬剤計算機に戻る
          </Link>
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
