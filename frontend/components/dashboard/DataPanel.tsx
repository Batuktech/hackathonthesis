"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { FadeIn } from "@/components/reactbits/FadeIn";
import { roleLabel, statusLabel, teacherTypeLabel } from "@/lib/mn";
import { Plus, AlertCircle, CheckCircle, Search, Pencil, Trash2, X, Check } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

type DataField = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  options?: Array<[string, string]>;
  showWhen?: (values: Record<string, string>) => boolean;
};

export function DataPanel({
  title,
  description,
  load,
  create,
  update,
  remove,
  fields = [],
}: {
  title: string;
  description: string;
  load: () => Promise<any[]>;
  create?: (data: Record<string, string>) => Promise<any>;
  update?: (id: string, data: Record<string, string>) => Promise<any>;
  remove?: (id: string) => Promise<any>;
  fields?: DataField[];
}) {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  async function refresh() {
    setLoading(true);
    try {
      setItems(await load());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!create) return;
    setSubmitting(true);
    setError("");
    try {
      const form = new FormData(event.currentTarget);
      const nextValues = Object.fromEntries(fields.map((field) => [field.name, String(form.get(field.name) ?? "")])) as Record<string, string>;
      const visibleFields = fields.filter((field) => !field.showWhen || field.showWhen(nextValues));
      const data = Object.fromEntries(
        visibleFields.map((field) => [field.name, String(form.get(field.name) ?? "")]),
      ) as Record<string, string>;
      const newItem = await create(data);
      setItems((prev) => [newItem, ...prev]);
      event.currentTarget.reset();
      setFormValues({});
      setError("");
      setSuccess("Амжилттай хадгаллаа.");
      showToast("Амжилттай хадгаллаа!", "success");
      void refresh();
    } catch (err) {
      setSuccess("");
      const message = err instanceof Error ? err.message : "Хадгалахад алдаа гарлаа";
      setError(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(item: any) {
    setEditingId(item.id);
    const values: Record<string, string> = {};
    for (const field of fields) {
      const val = item[field.name];
      if (val !== undefined && val !== null) {
        values[field.name] = String(val);
      } else if (field.name === "role" && item.role) {
        values[field.name] = String(item.role);
      } else if (field.name === "teacherType" && item.teacherType) {
        values[field.name] = String(item.teacherType);
      }
    }
    setEditValues(values);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValues({});
  }

  async function saveEdit(id: string) {
    if (!update) return;
    setSubmitting(true);
    try {
      const visibleFields = fields.filter((field) => !field.showWhen || field.showWhen(editValues));
      const data = Object.fromEntries(
        visibleFields.map((field) => [field.name, editValues[field.name] ?? ""]),
      ) as Record<string, string>;
      const updatedItem = await update(id, data);
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updatedItem } : item)));
      setEditingId(null);
      setEditValues({});
      setSuccess("Амжилттай шинэчиллээ.");
      showToast("Амжилттай шинэчиллээ!", "success");
      void refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Шинэчлэхэд алдаа гарлаа";
      setError(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete(id: string) {
    if (!remove) return;
    setDeletingId(id);
    try {
      await remove(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSuccess("Амжилттай устгалаа.");
      showToast("Амжилттай устгалаа!", "success");
      void refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Устгахад алдаа гарлаа";
      setError(message);
      showToast(message, "error");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredItems = items.filter((item) => {
    const searchStr = searchQuery.toLowerCase();
    const searchFields = [
      item.name,
      item.title,
      item.user?.name,
      item.email,
      item.thesis?.title,
      item.academicSeason?.name,
      item.degreeType?.name,
    ];
    return searchFields.some((field) => field?.toString().toLowerCase().includes(searchStr));
  });

  return (
    <DashboardShell>
      <div className="grid gap-6">
        <FadeIn>
          <SpotlightCard className="p-6">
            <h1 className="text-3xl font-black text-neutral-950">{title}</h1>
            <p className="mt-2 text-neutral-600">{description}</p>
          </SpotlightCard>
        </FadeIn>

        {create ? (
          <FadeIn delay={0.1}>
            <SpotlightCard className="p-5">
              <h2 className="mb-4 font-black flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Шинээр нэмэх
              </h2>
              <form className="grid gap-3 md:grid-cols-3" onSubmit={submit}>
                {fields.filter((field) => !field.showWhen || field.showWhen(formValues)).map((field) => (
                  <label className="data-label" key={field.name}>
                    {field.label}
                    {field.options ? (
                      <select
                      name={field.name}
                      className="data-input"
                      value={formValues[field.name] ?? field.options[0]?.[0] ?? ""}
                      onChange={(event) => setFormValues((values) => ({ ...values, [field.name]: event.target.value }))}
                    >
                      {field.options.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    ) : (
                      <input
                        name={field.name}
                        type={field.type ?? "text"}
                        placeholder={field.placeholder ?? field.label}
                        className="data-input"
                        value={formValues[field.name] ?? ""}
                        onChange={(event) => setFormValues((values) => ({ ...values, [field.name]: event.target.value }))}
                      />
                    )}
                  </label>
                ))}
                <div className="flex items-end">
                <motion.button
                  className="data-button w-full"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={submitting}
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  {submitting ? "Хадгалж байна..." : "Нэмэх"}
                </motion.button>
                </div>
              </form>
            </SpotlightCard>
          </FadeIn>
        ) : null}

        <FadeIn delay={0.2}>
          <SpotlightCard className="p-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-neutral-400 flex-shrink-0" />
              <input
                className="data-input"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Хайх..."
              />
            </div>
          </SpotlightCard>
        </FadeIn>

        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              key="error"
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.p>
          ) : null}
          {success ? (
            <motion.p
              key="success"
              className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <FadeIn delay={0.3}>
          <SpotlightCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">Нэр / гарчиг</th>
                    <th className="px-4 py-3">Төлөв</th>
                    <th className="px-4 py-3">Мэдээлэл</th>
                    <th className="px-4 py-3">Шинэчилсэн</th>
                    <th className="px-4 py-3 w-[140px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-4 py-8 text-neutral-500 text-center" colSpan={5}>
                        <motion.div
                          className="inline-flex items-center gap-2"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          Уншиж байна...
                        </motion.div>
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-neutral-500 text-center" colSpan={5}>
                        {searchQuery ? "Хайлтад тохирох мэдээлэл алга." : "Одоогоор мэдээлэл алга."}
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, index) => {
                      const isEditing = editingId === item.id;
                      return (
                        <motion.tr
                          key={item.id}
                          className="border-b border-neutral-100 last:border-0"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          whileHover={{ backgroundColor: "rgba(245, 245, 245, 1)" }}
                        >
                          {isEditing ? (
                            <td className="px-4 py-3" colSpan={3}>
                              <div className="grid gap-2 md:grid-cols-3">
                                {fields.filter((field) => !field.showWhen || field.showWhen(editValues)).map((field) => (
                                  <label className="data-label text-xs" key={field.name}>
                                    {field.label}
                                    {field.options ? (
                                      <select
                                        className="data-input text-xs"
                                        value={editValues[field.name] ?? field.options[0]?.[0] ?? ""}
                                        onChange={(event) => setEditValues((values) => ({ ...values, [field.name]: event.target.value }))}
                                      >
                                        {field.options.map(([value, label]) => (
                                          <option key={value} value={value}>{label}</option>
                                        ))}
                                      </select>
                                    ) : (
                                      <input
                                        type={field.type ?? "text"}
                                        className="data-input text-xs"
                                        placeholder={field.placeholder ?? field.label}
                                        value={editValues[field.name] ?? ""}
                                        onChange={(event) => setEditValues((values) => ({ ...values, [field.name]: event.target.value }))}
                                      />
                                    )}
                                  </label>
                                ))}
                              </div>
                            </td>
                          ) : (
                            <>
                              <td className="px-4 py-3 font-bold text-neutral-950">
                                {item.name ?? item.title ?? item.user?.name ?? item.thesis?.title ?? item.email ?? item.id}
                              </td>
                              <td className="px-4 py-3">
                                <span className="status-pill">
                                  {item.role ? roleLabel(item.role) : item.teacherType ? teacherTypeLabel(item.teacherType) : statusLabel(item.status ?? item.isActive?.toString?.() ?? "Идэвхтэй")}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-neutral-600">
                                {item.email ?? item.academicSeason?.name ?? item.degreeType?.name ?? item.student?.user?.name ?? item.location ?? item.teacherCode ?? "-"}
                              </td>
                            </>
                          )}
                          <td className="px-4 py-3 text-neutral-500">
                            {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {isEditing ? (
                                <>
                                  <motion.button
                                    className="data-button text-xs px-2 py-1"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => saveEdit(item.id)}
                                    disabled={submitting}
                                  >
                                    <Check className="w-3 h-3 inline mr-0.5" />
                                    Хадгалах
                                  </motion.button>
                                  <motion.button
                                    className="data-button secondary text-xs px-2 py-1"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={cancelEdit}
                                  >
                                    <X className="w-3 h-3 inline mr-0.5" />
                                    Болих
                                  </motion.button>
                                </>
                              ) : (
                                <>
                                  {update ? (
                                    <motion.button
                                      className="data-button secondary text-xs px-2 py-1"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => startEdit(item)}
                                    >
                                      <Pencil className="w-3 h-3 inline mr-0.5" />
                                      Засах
                                    </motion.button>
                                  ) : null}
                                  {remove ? (
                                    <motion.button
                                      className="data-button secondary text-xs px-2 py-1 text-red-600 border-red-200 hover:bg-red-50"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => confirmDelete(item.id)}
                                      disabled={deletingId === item.id}
                                    >
                                      <Trash2 className="w-3 h-3 inline mr-0.5" />
                                      {deletingId === item.id ? "Устгаж байна..." : "Устгах"}
                                    </motion.button>
                                  ) : null}
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </SpotlightCard>
        </FadeIn>
      </div>
    </DashboardShell>
  );
}
