"use client";
import type { DecisionColumn, DecisionField } from "../domain/types";

const inputClass = "mt-1 min-h-11 w-full rounded-lg border border-line bg-surface px-3 py-2";
function Cell({ field, value, change }: { field: DecisionColumn | DecisionField; value: string; change: (value: string) => void }) {
  if (field.type === "member") return <select aria-label={field.label} className={inputClass} value={value} onChange={e => change(e.target.value)}><option value="">Selecione</option><option value="1">Pessoa 1</option><option value="2">Pessoa 2</option><option value="ambos">Ambos</option></select>;
  return <input aria-label={field.label} className={inputClass} maxLength={1200} type={["date", "time"].includes(field.type) ? field.type : "text"} inputMode={["money", "percent", "number"].includes(field.type) ? "decimal" : undefined} value={value} onChange={e => change(e.target.value)} />;
}
export function DecisionFields({ fields, definitions, values, change }: { fields: string[]; definitions: Record<string, DecisionField>; values: Record<string, string[]>; change: (values: Record<string, string[]>) => void }) {
  return <div className="space-y-5">{fields.map(key => {
    const field = definitions[key];
    if (!field || (field.when && !values[field.when.field]?.includes(field.when.value))) return null;
    const set = (value: string[]) => change({ ...values, [key]: value });
    return <fieldset key={key} className="space-y-2"><legend className="font-semibold">{field.label}</legend>
      {field.help ? <p className="text-sm text-muted">{field.help}</p> : null}
      {field.type === "table" ? <div className="space-y-3">{(values[key] ?? [JSON.stringify(field.columns!.map(() => ""))]).map((encoded, index) => {
        const row = JSON.parse(encoded) as string[];
        return <div key={index} className="grid gap-3 rounded-xl border border-line p-3 md:grid-cols-2">{field.columns!.map((column, i) => <label key={i}>{column.label}<Cell field={column} value={row[i] ?? ""} change={v => {
          const rows = [...values[key] ?? [encoded]]; const updated = [...row]; updated[i] = v; rows[index] = JSON.stringify(updated); set(rows);
        }} /></label>)}<button type="button" className="text-left text-sm text-brand underline" onClick={() => set((values[key] ?? [encoded]).filter((_, i) => i !== index))}>Remover linha</button></div>;
      })}<button type="button" className="text-brand underline" disabled={(values[key]?.length ?? 1) >= (field.maxRows ?? 20)} onClick={() => set([...values[key] ?? [JSON.stringify(field.columns!.map(() => ""))], JSON.stringify(field.columns!.map(() => ""))])}>Adicionar linha</button></div>
        : field.type === "selection" ? field.options!.map(option => <label key={option} className="mr-4 flex gap-2"><input type="checkbox" checked={values[key]?.includes(option) ?? false} onChange={e => {
          const selected = e.target.checked ? ["meta", "periodicidade"].includes(key) ? [option] : [...values[key] ?? [], option] : values[key]?.filter(v => v !== option) ?? [];
          const updated = { ...values, [key]: selected };
          for (const [dependent, definition] of Object.entries(definitions)) if (definition.when?.field === key && !selected.includes(definition.when.value)) delete updated[dependent];
          change(updated);
        }} />{option}</label>) : <Cell field={field} value={values[key]?.[0] ?? ""} change={v => set([v])} />}
    </fieldset>;
  })}</div>;
}
