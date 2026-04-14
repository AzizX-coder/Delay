import { useEffect, useState } from "react";
import { useTasksStore } from "@/stores/tasksStore";
import { useThemeStore } from "@/stores/themeStore";
import { useT } from "@/lib/i18n";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Inbox,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  Trash2,
  Circle,
  CheckCircle,
  Flag,
  Calendar,
  MoreVertical,
  Smile,
  Edit2,
} from "lucide-react";
import { format } from "date-fns";
import { PRIORITY_COLORS } from "@/types/task";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

export function TasksPage() {
  const {
    tasks,
    taskLists,
    activeView,
    loadTasks,
    loadTaskLists,
    createTask,
    toggleTask,
    deleteTask,
    updateTask,
    createTaskList,
    updateTaskList,
    deleteTaskList,
    setActiveView,
    getFilteredTasks,
  } = useTasksStore();
  const { theme } = useThemeStore();
  const t = useT();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showListModal, setShowListModal] = useState(false);
  const [listModalData, setListModalData] = useState<{ id?: string, name: string, icon: string }>({ name: "", icon: "📁" });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
    loadTaskLists();
  }, []);

  const filteredTasks = getFilteredTasks();

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    const listId = ["today", "upcoming", "completed"].includes(activeView)
      ? "inbox"
      : activeView;
    createTask(newTaskTitle.trim(), listId);
    setNewTaskTitle("");
  };

  const handleSaveList = async () => {
    if (!listModalData.name.trim()) return;
    if (listModalData.id) {
      await updateTaskList(listModalData.id, { name: listModalData.name, icon: listModalData.icon });
    } else {
      await createTaskList(listModalData.name, undefined, listModalData.icon);
    }
    setListModalData({ name: "", icon: "📁" });
    setShowListModal(false);
  };

  const smartViews = [
    { id: "inbox", label: "Inbox", icon: <Inbox size={18} /> },
    { id: "today", label: "Today", icon: <CalendarDays size={18} /> },
    { id: "upcoming", label: "Upcoming", icon: <CalendarClock size={18} /> },
    { id: "completed", label: "Completed", icon: <CheckCircle2 size={18} /> },
  ];

  return (
    <div className="flex h-full bg-bg-primary">
      {/* Sidebar */}
      <div className="w-64 h-full flex flex-col border-r border-border/40 bg-bg-secondary/30 backdrop-blur-md p-4">
        <h2 className="text-[17px] font-bold text-text-primary tracking-tight px-2 mb-6">
          Tasks
        </h2>

        {/* Smart views */}
        <div className="space-y-1 mb-8">
          {smartViews.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-[13px] font-medium transition-all cursor-pointer
                ${activeView === view.id
                    ? "bg-accent/10 text-accent shadow-sm"
                    : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                }`}
            >
              <span className={activeView === view.id ? "text-accent" : "text-text-tertiary"}>
                {view.icon}
              </span>
              {view.label}
              <span className="ml-auto text-[11px] font-bold opacity-60">
                {view.id === "inbox"
                  ? tasks.filter((t) => t.list_id === "inbox" && !t.completed).length
                  : view.id === "completed"
                  ? tasks.filter((t) => t.completed).length
                  : ""}
              </span>
            </button>
          ))}
        </div>

        {/* Lists Section */}
        <div className="flex items-center justify-between px-2 mb-3">
          <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">
            Your Lists
          </span>
          <button
            onClick={() => {
              setListModalData({ name: "", icon: "📁" });
              setShowListModal(true);
            }}
            className="w-5 h-5 flex items-center justify-center rounded-md bg-accent/10 text-accent hover:bg-accent hover:text-bg-primary transition-all cursor-pointer"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="space-y-1 flex-1 overflow-y-auto">
          {taskLists
            .filter((l) => l.id !== "inbox")
            .map((list) => (
              <div key={list.id} className="relative group">
                <button
                  onClick={() => setActiveView(list.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                    text-[13px] font-medium transition-all cursor-pointer
                    ${activeView === list.id
                        ? "bg-accent/10 text-accent shadow-sm"
                        : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                    }`}
                >
                  <span className="text-base leading-none shrink-0">{list.icon || "📁"}</span>
                  <span className="truncate flex-1 text-left">{list.name}</span>
                </button>
                
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setListModalData({ id: list.id, name: list.name, icon: list.icon });
                      setShowListModal(true);
                    }}
                    className="p-1 px-1.5 rounded-lg hover:bg-accent/10 text-text-tertiary hover:text-accent transition-all cursor-pointer"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTaskList(list.id);
                    }}
                    className="p-1 px-1.5 rounded-lg hover:bg-danger/10 text-text-tertiary hover:text-danger transition-all cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col px-10 py-10 overflow-hidden max-w-4xl w-full mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[32px] font-bold text-text-primary tracking-tight">
              {smartViews.find((v) => v.id === activeView)?.label ||
                taskLists.find((l) => l.id === activeView)?.name ||
                "Tasks"}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[14px] text-text-tertiary font-medium">
            <span className="px-2 py-0.5 rounded-md bg-accent/5 text-accent border border-accent/10">
              {filteredTasks.filter((t) => !t.completed).length} open
            </span>
            <span>·</span>
            <span>{filteredTasks.length} total tasks</span>
          </div>
        </motion.div>

        {/* New task input */}
        {activeView !== "completed" && (
          <div className="relative mb-8 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-lg bg-accent/10 text-accent transition-transform group-focus-within:scale-110">
              <Plus size={16} />
            </div>
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
              className="w-full h-14 pl-14 pr-4 bg-bg-secondary/40 backdrop-blur-md
                border border-border/40 rounded-2xl text-[16px] font-medium
                text-text-primary placeholder:text-text-tertiary
                outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5
                transition-all shadow-xl shadow-black/5"
              spellCheck={false}
            />
          </div>
        )}

        {/* Task list */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length === 0 ? (
              <EmptyState
                size="lg"
                icon={<div className="p-4 rounded-[28px] bg-accent/10 text-accent mb-4"><CheckCircle2 size={32} /></div>}
                title={activeView === "completed" ? "Archive is clean" : t("notes.peak")}
                description={activeView === "completed" ? "Finished tasks live here. Go get some done!" : t("notes.peak_sub")}
              />
            ) : (
              filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="group flex items-start gap-4 p-4 rounded-2xl bg-bg-secondary/20 border border-border/10 hover:border-border/40 hover:bg-bg-secondary/40 transition-all duration-200"
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 cursor-pointer shrink-0 transition-transform active:scale-90"
                  >
                    {task.completed ? (
                      <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                        <CheckCircle size={14} className="text-bg-primary" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-border/60 group-hover:border-accent transition-colors" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    {editingTaskId === task.id ? (
                      <input
                        autoFocus
                        defaultValue={task.title}
                        onBlur={(e) => {
                          updateTask(task.id, { title: e.target.value });
                          setEditingTaskId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateTask(task.id, { title: (e.target as HTMLInputElement).value });
                            setEditingTaskId(null);
                          }
                        }}
                        className="w-full bg-transparent text-[15px] font-medium text-text-primary outline-none"
                        spellCheck={false}
                      />
                    ) : (
                      <p
                        onDoubleClick={() => setEditingTaskId(task.id)}
                        className={`text-[15px] font-medium leading-normal cursor-pointer transition-all duration-300 ${
                          task.completed ? "text-text-tertiary line-through opacity-60" : "text-text-primary"
                        }`}
                      >
                        {task.title}
                      </p>
                    )}
                    
                    {(task.priority > 0 || task.due_date) && (
                      <div className="flex items-center gap-3 mt-2">
                        {task.priority > 0 && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-bg-primary/40 border border-border/20 text-[10px] font-bold uppercase tracking-wider">
                            <Flag size={10} style={{ color: PRIORITY_COLORS[task.priority] }} fill="currentColor" />
                            Priority
                          </div>
                        )}
                        {task.due_date && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-bg-primary/40 border border-border/20 text-[10px] font-bold text-text-tertiary">
                            <Calendar size={10} />
                            {format(task.due_date * 1000, "MMM d")}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-8 h-8
                      rounded-xl text-text-tertiary hover:text-danger hover:bg-danger/10
                      transition-all cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* List Modal (Create/Edit) */}
      <Modal
        open={showListModal}
        onClose={() => setShowListModal(false)}
        title={listModalData.id ? "Edit List" : "Create New List"}
        size="sm"
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 py-2">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-20 h-20 rounded-[24px] bg-bg-secondary border-2 border-dashed border-border/60 hover:border-accent hover:bg-accent/5 text-[32px] flex items-center justify-center transition-all cursor-pointer relative group"
            >
              {listModalData.icon}
              <div className="absolute inset-0 bg-black/40 rounded-[24px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Smile size={24} className="text-white" />
              </div>
            </button>
            <span className="text-[12px] font-bold text-text-tertiary uppercase tracking-widest">Choose Emoji Icon</span>
          </div>

          <Input
            label="List Name"
            placeholder="Work, Fitness, Coding..."
            value={listModalData.name}
            onChange={(e) => setListModalData({ ...listModalData, name: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSaveList()}
            autoFocus
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowListModal(false)}>Cancel</Button>
            <Button onClick={handleSaveList}>{listModalData.id ? "Apply Changes" : "Create List"}</Button>
          </div>
        </div>

        {showEmojiPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/20">
            <div className="relative shadow-2xl rounded-[24px] overflow-hidden">
               <Picker
                data={data}
                set="native"
                theme={theme === "dark" ? "dark" : "light"}
                onEmojiSelect={(emoji: any) => {
                  setListModalData({ ...listModalData, icon: emoji.native });
                  setShowEmojiPicker(false);
                }}
              />
            </div>
            <div className="fixed inset-0 -z-10" onClick={() => setShowEmojiPicker(false)} />
          </div>
        )}
      </Modal>
    </div>
  );
}

