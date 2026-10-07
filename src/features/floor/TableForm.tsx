"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectTables } from "@/store/selectors";
import { addTable, updateTable } from "@/store/slices/posSlice";
import { Field, Modal } from "@/components/ui";

/** Add a new table, or edit an existing one when `editId` is given. */
export function TableForm({ open, editId, onClose }: { open: boolean; editId?: string | null; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const tables = useAppSelector(selectTables);
  const editing = tables.find((t) => t.id === editId);
  const zones = [...new Set(tables.map((t) => t.zone))];

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = { name: String(f.get("name")).trim(), seats: Number(f.get("seats")), zone: String(f.get("zone")).trim() || "Indoor" };
    dispatch(editing ? updateTable({ ...editing, ...data }) : addTable(data));
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={<h2 className="text-lg font-semibold">{editing ? `Edit ${editing.name}` : "Add table"}</h2>}>
      <form key={editId ?? "new"} onSubmit={submit} className="space-y-4">
        <Field label="Table name">
          <input name="name" required autoFocus defaultValue={editing?.name ?? `Table ${tables.length + 1}`} className="field" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Seats">
            <select name="seats" defaultValue={editing?.seats ?? 4} className="field">
              {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20].map((n) => <option key={n} value={n}>{n} seats</option>)}
            </select>
          </Field>
          <Field label="Zone" hint="Pick one or type a new zone">
            <input name="zone" list="zones" defaultValue={editing?.zone ?? zones[0] ?? "Indoor"} className="field" />
            <datalist id="zones">{zones.map((z) => <option key={z} value={z} />)}</datalist>
          </Field>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary flex-1">{editing ? "Save changes" : "Add table"}</button>
        </div>
      </form>
    </Modal>
  );
}
