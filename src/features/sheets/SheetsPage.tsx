import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { Plus, Trash2, Table2, Bold, Italic, AlignLeft } from "lucide-react";

const uid = () => crypto.randomUUID();
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface Sheet { id: string; name: string; rows: number; cols: number; cells: Record<string, string>; }

export function SheetsPage() {
  const [sheets, setSheets] = useState<Sheet[]>([
    { id: uid(), name: "Sheet 1", rows: 50, cols: 20, cells: {} }
  ]);
  const [activeSheet, setActiveSheet] = useState(sheets[0].id);
  const [editing, setEditing] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const sheet = sheets.find(s => s.id === activeSheet)!;

  const cellKey = (r: number, c: number) => `${ALPHA[c]}${r + 1}`;

  const setCellValue = (key: string, val: string) => {
    setSheets(prev => prev.map(s => s.id === activeSheet ? { ...s, cells: { ...s.cells, [key]: val } } : s));
  };

  const evaluate = (val: string): string => {
    if (!val.startsWith("=")) return val;
    try {
      const expr = val.slice(1).toUpperCase();
      const sumMatch = expr.match(/^SUM\(([A-Z]\d+):([A-Z]\d+)\)$/);
      if (sumMatch) {
        const [, start, end] = sumMatch;
        const sc = start.charCodeAt(0) - 65, sr = parseInt(start.slice(1)) - 1;
        const ec = end.charCodeAt(0) - 65, er = parseInt(end.slice(1)) - 1;
        let sum = 0;
        for (let r = sr; r <= er; r++) for (let c = sc; c <= ec; c++) {
          const v = parseFloat(sheet.cells[cellKey(r, c)] || "0");
          if (!isNaN(v)) sum += v;
        }
        return String(sum);
      }
      return val;
    } catch { return val; }
  };

  const addSheet = () => {
    const s: Sheet = { id: uid(), name: `Sheet ${sheets.length + 1}`, rows: 50, cols: 20, cells: {} };
    setSheets(prev => [...prev, s]);
    setActiveSheet(s.id);
  };

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Formula bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border/40 bg-bg-secondary/30">
        <div className="w-16 text-center text-[11px] font-bold text-text-tertiary bg-bg-hover rounded-md py-1 px-2">
          {selected || "A1"}
        </div>
        <span className="text-text-tertiary">=</span>
        <input
          value={selected ? (sheet.cells[selected] || "") : ""}
          onChange={e => selected && setCellValue(selected, e.target.value)}
          className="flex-1 bg-transparent text-[13px] text-text-primary outline-none font-mono"
          placeholder="Enter value or formula (e.g. =SUM(A1:A10))"
        />
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <table className="border-collapse min-w-full">
          <thead>
            <tr>
              <th className="sticky top-0 left-0 z-20 w-10 h-7 bg-bg-secondary border-r border-b border-border/30 text-[10px] text-text-tertiary" />
              {Array.from({ length: sheet.cols }).map((_, c) => (
                <th key={c} className="sticky top-0 z-10 h-7 min-w-[100px] bg-bg-secondary border-r border-b border-border/30
                  text-[10px] font-bold text-text-tertiary text-center select-none">
                  {ALPHA[c]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: sheet.rows }).map((_, r) => (
              <tr key={r}>
                <td className="sticky left-0 z-10 w-10 bg-bg-secondary border-r border-b border-border/30
                  text-[10px] font-bold text-text-tertiary text-center select-none">
                  {r + 1}
                </td>
                {Array.from({ length: sheet.cols }).map((_, c) => {
                  const key = cellKey(r, c);
                  const isEditing = editing === key;
                  const isSelected = selected === key;
                  const raw = sheet.cells[key] || "";
                  return (
                    <td key={c}
                      onClick={() => { setSelected(key); }}
                      onDoubleClick={() => setEditing(key)}
                      className={`h-7 min-w-[100px] border-r border-b border-border/20 text-[12px] font-mono px-1.5 cursor-cell
                        ${isSelected ? "outline outline-2 outline-accent bg-accent/5" : ""}
                        ${isEditing ? "bg-white/5" : ""}`}>
                      {isEditing ? (
                        <input autoFocus value={raw}
                          onChange={e => setCellValue(key, e.target.value)}
                          onBlur={() => setEditing(null)}
                          onKeyDown={e => { if (e.key === "Enter") setEditing(null); }}
                          className="w-full h-full bg-transparent outline-none text-text-primary" />
                      ) : (
                        <span className="text-text-primary">{evaluate(raw)}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-t border-border/40 bg-bg-secondary/30">
        {sheets.map(s => (
          <button key={s.id} onClick={() => setActiveSheet(s.id)}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all
              ${s.id === activeSheet ? "bg-accent/15 text-accent" : "text-text-tertiary hover:bg-bg-hover"}`}>
            {s.name}
          </button>
        ))}
        <button onClick={addSheet} className="w-6 h-6 flex items-center justify-center rounded-lg text-text-tertiary hover:text-accent cursor-pointer">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
