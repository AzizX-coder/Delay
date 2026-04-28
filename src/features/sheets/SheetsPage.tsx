import { useState } from "react";
import { Plus, Table2, MousePointer2, FileSpreadsheet, Trash2 } from "lucide-react";

const uid = () => crypto.randomUUID();
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface Sheet { id: string; name: string; rows: number; cols: number; cells: Record<string, string>; }

function getSheets(): Sheet[] {
  try { return JSON.parse(localStorage.getItem("delay_sheets") || "[]"); } catch { return []; }
}
function saveSheets(sheets: Sheet[]) { localStorage.setItem("delay_sheets", JSON.stringify(sheets)); }

const VISIBLE_ROWS = 30;

export function SheetsPage() {
  const [sheets, setSheets] = useState<Sheet[]>(() => {
    const s = getSheets();
    return s.length > 0 ? s : [{ id: uid(), name: "Sheet1", rows: 100, cols: 26, cells: {} }];
  });
  const [visibleRows, setVisibleRows] = useState(VISIBLE_ROWS);
  const [activeSheet, setActiveSheet] = useState(sheets[0]?.id);
  const [editing, setEditing] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const sheet = sheets.find(s => s.id === activeSheet);

  const persist = (updated: Sheet[]) => { setSheets(updated); saveSheets(updated); };

  const cellKey = (r: number, c: number) => `${ALPHA[c]}${r + 1}`;

  const setCellValue = (key: string, val: string) => {
    persist(sheets.map(s => s.id === activeSheet ? { ...s, cells: { ...s.cells, [key]: val } } : s));
  };

  const evaluate = (val: string): string => {
    if (!val.startsWith("=")) return val;
    try {
      const expr = val.slice(1).toUpperCase();
      const sumMatch = expr.match(/^SUM\(([A-Z]\d+):([A-Z]\d+)\)$/);
      if (sumMatch) {
        const [, start, end] = sumMatch;
        const sc = start.charCodeAt(0) - 65, sr = parseInt(start.substring(1)) - 1;
        const ec = end.charCodeAt(0) - 65, er = parseInt(end.substring(1)) - 1;
        let sum = 0;
        for (let r = sr; r <= er; r++) {
          for (let c = sc; c <= ec; c++) {
            const v = parseFloat(sheet?.cells[cellKey(r, c)] || "0");
            if (!isNaN(v)) sum += v;
          }
        }
        return String(sum);
      }
      return val;
    } catch { return val; }
  };

  const addSheet = () => {
    const s: Sheet = { id: uid(), name: `Sheet${sheets.length + 1}`, rows: 100, cols: 26, cells: {} };
    const max = [...sheets, s];
    persist(max);
    setActiveSheet(s.id);
  };

  const deleteSheet = (id: string) => {
    if (sheets.length === 1) return;
    const upd = sheets.filter(s => s.id !== id);
    persist(upd);
    if (activeSheet === id) setActiveSheet(upd[0].id);
  };

  if (!sheet) return null;

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Top Toolbar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border/40 bg-bg-secondary/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-500 flex items-center justify-center">
            <FileSpreadsheet size={16} />
          </div>
          <span className="text-[14px] font-bold text-text-primary mr-4">{sheet.name}</span>
        </div>
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-0">
            <button className="w-8 h-8 rounded hover:bg-bg-hover flex items-center justify-center text-text-tertiary">
              <MousePointer2 size={14} />
            </button>
            <div className="w-px h-4 bg-border/40 mx-2" />
            <span className="w-16 text-center text-[12px] font-bold text-text-tertiary bg-bg-hover/50 rounded py-1 px-2 border border-border/20 shadow-inner block">
              {selected || "A1"}
            </span>
          </div>
          <div className="flex-1 flex items-center bg-bg-hover/30 border border-border/40 rounded-xl px-3 py-1.5 focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/10 transition-all">
            <span className="text-text-tertiary/70 font-mono text-[13px] mr-2 italic">ƒx</span>
            <input
              value={selected ? (sheet.cells[selected] || "") : ""}
              onChange={e => selected && setCellValue(selected, e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-text-primary outline-none font-mono tracking-wide"
              placeholder="Enter value or formula =SUM(A1:B5)"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto bg-bg-primary pb-10">
        <table className="border-collapse min-w-full">
          <thead>
            <tr>
              <th className="sticky top-0 left-0 z-30 w-[46px] h-7 bg-bg-secondary border-r border-b border-border/30 shadow-sm" />
              {Array.from({ length: sheet.cols }).map((_, c) => (
                <th key={c} className="sticky top-0 z-20 h-7 min-w-[120px] bg-bg-secondary border-r border-b border-border/30
                  text-[11px] font-bold text-text-tertiary text-center select-none shadow-sm shadow-border/5">
                  {ALPHA[c]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.min(visibleRows, sheet.rows) }).map((_, r) => (
              <tr key={r}>
                <td className="sticky left-0 z-20 w-[46px] bg-bg-secondary border-r border-b border-border/30
                  text-[10px] font-bold text-text-tertiary text-center select-none shadow-sm shadow-border/5">
                  {r + 1}
                </td>
                {Array.from({ length: sheet.cols }).map((_, c) => {
                  const key = cellKey(r, c);
                  const isEditing = editing === key;
                  const isSelected = selected === key;
                  const raw = sheet.cells[key] || "";
                  const val = evaluate(raw);
                  const isNum = !isNaN(Number(val)) && val !== "";
                  
                  return (
                    <td key={c}
                      onClick={() => setSelected(key)}
                      onDoubleClick={() => setEditing(key)}
                      className={`h-[26px] min-w-[120px] border-r border-b border-border/20 text-[13px] px-2 cursor-cell whitespace-nowrap overflow-hidden text-ellipsis
                        ${isSelected ? "outline outline-2 outline-accent outline-offset-[-2px] bg-accent/5 z-10 relative" : "z-0"}
                        ${isEditing ? "bg-bg-primary text-text-primary" : "text-text-secondary hover:bg-white/[0.02]"}
                        ${isNum && !isEditing ? "text-right text-blue-400" : ""}`}>
                      {isEditing ? (
                        <input autoFocus value={raw}
                          onFocus={e => e.target.select()}
                          onChange={e => setCellValue(key, e.target.value)}
                          onBlur={() => setEditing(null)}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              setEditing(null);
                              // Auto-select down
                              const match = selected?.match(/([A-Z])(\d+)/);
                              if (match) setSelected(`${match[1]}${parseInt(match[2]) + 1}`);
                            }
                          }}
                          className="w-full h-full bg-transparent outline-none font-mono text-text-primary" />
                      ) : (
                        <span className={val.startsWith("=") ? "text-danger italic font-mono" : ""}>{val}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {visibleRows < sheet.rows && (
          <div className="flex justify-center py-4">
            <button onClick={() => setVisibleRows(v => Math.min(v + 30, sheet.rows))}
              className="px-6 py-2 rounded-xl bg-accent/10 text-accent text-[12px] font-bold hover:bg-accent/20 cursor-pointer transition-all">
              Load More Rows ({visibleRows}/{sheet.rows})
            </button>
          </div>
        )}
      </div>

      {/* Sheet Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-t border-border/40 bg-bg-secondary/80 backdrop-blur pb-4 absolute bottom-0 left-0 right-0">
        {sheets.map(s => (
          <div key={s.id} className="flex items-center group">
            <button onClick={() => setActiveSheet(s.id)}
              className={`px-4 py-1.5 rounded-l-lg text-[12px] font-bold cursor-pointer transition-all border-y border-l
                ${s.id === activeSheet ? "bg-accent/15 text-accent border-accent/20" : "bg-bg-primary text-text-tertiary hover:bg-bg-hover border-border/20 shadow-sm"}`}>
              {s.name}
            </button>
            <button onClick={() => deleteSheet(s.id)}
              className={`px-2 py-1.5 rounded-r-lg border-y border-r cursor-pointer transition-all
                ${s.id === activeSheet ? "bg-accent/15 text-accent hover:text-danger hover:bg-danger/10 border-accent/20" : "bg-bg-primary opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger hover:bg-danger/10 border-border/20"}`}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button onClick={addSheet} className="w-7 h-7 ml-2 flex items-center justify-center rounded-full bg-bg-hover text-text-tertiary hover:text-accent hover:bg-accent/10 cursor-pointer shadow-sm">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
