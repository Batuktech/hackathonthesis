"use client";

import { DataPanel } from "@/components/dashboard/DataPanel";
import { api } from "@/lib/api";

export default function AdminDegreeTypesPage() {
  return <DataPanel title="Зэргийн төрөл" description="Бакалавр, магистр, доктор зэрэг нэмнэ." load={api.getDegreeTypes} create={api.createDegreeType} update={api.updateDegreeType} remove={api.deleteDegreeType} fields={[{ name: "name", label: "Нэр" }, { name: "description", label: "Тайлбар" }]} />;
}
