"use client";

import { Download } from "lucide-react";
import { SearchField } from "@/components/admin/PageHeading";
import { SelectField } from "@/components/admin/SelectField";

export function ExportButton({ onClick, label = "Export CSV" }: { onClick: () => void; label?: string }) {
  return <button className="secondary export-button" type="button" onClick={onClick}><Download size={15}/>{label}</button>;
}

export function TableToolbar({ search, onSearch, placeholder, filter, onFilter, filterOptions, onExport, exportLabel }: { search: string; onSearch: (value: string) => void; placeholder: string; filter: string; onFilter: (value: string) => void; filterOptions: { value: string; label: string }[]; onExport?: () => void; exportLabel?: string }) {
  return <div className="table-toolbar"><SearchField value={search} onChange={onSearch} placeholder={placeholder}/><div className="table-toolbar-actions"><SelectField name="table-filter" value={filter} onValueChange={onFilter} options={filterOptions} className="table-filter-select"/>{onExport && <ExportButton onClick={onExport} label={exportLabel}/>}</div></div>;
}
