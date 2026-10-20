"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectTables } from "@/store/selectors";
import { addTable, updateTable } from "@/store/slices/posSlice";
import { Field, Modal } from "@/components/ui";
import { nameTaken, nextTableName } from "./tableNames";

/** Add a new table, or edit an existing one when `editId` is given. */
export function TableForm({ open, editId, onClose }: { open: boolean; editId?: string | null; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const tables = useAppSelector(selectTables);
  const editing = tables.find((t) => t.id === editId);
  const zones = [...new Set(tables.map((t) => t.zone))];
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setError(null);
    onClose();
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = { name: String(f.get("name")).trim(), seats: Number(f.get("seats")), zone: String(f.get("zone")).trim() || "Indoor" };
    if (!data.name) return setError("Give the table a name.");
    if (nameTaken(tables, data.name, editing?.id)) return setError(`There is already a table called “${data.name}”.`);
    dispatch(editing ? updateTable({ ...editing, ...data }) : addTable(data));
    close();
  };

  return (
    <Modal open={open} onClose={close} title={<h2 className="text-lg font-semibold">{editing ? `Edit ${editing.name}` : "Add table"}</h2>}>
      <form key={editId ?? "new"} onSubmit={submit} onChange={() => setError(null)} className="space-y-4">
        <Field label="Table name">
          <input name="name" required maxLength={30} autoFocus defaultValue={editing?.name ?? nextTableName(tables)} className="field" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Seats">
            <select name="seats" defaultValue={editing?.seats ?? 4} className="field">
              {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20].map((n) => <option key={n} value={n}>{n} seats</option>)}
            </select>
          </Field>
          <Field label="Zone" hint="Pick one or type a new zone">
            <input name="zone" list="zones" maxLength={20} defaultValue={editing?.zone ?? zones[0] ?? "Indoor"} className="field" />
            <datalist id="zones">{zones.map((z) => <option key={z} value={z} />)}</datalist>
          </Field>
        </div>
        {error && <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="button" className="btn btn-ghost flex-1" onClick={close}>Cancel</button>
          <button className="btn btn-primary flex-1">{editing ? "Save changes" : "Add table"}</button>
        </div>
      </form>
    </Modal>
  );
}
