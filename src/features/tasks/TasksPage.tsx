import { useEffect, useState } from "react";
import { useTasksStore } from "@/stores/tasksStore";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Inbox,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  ListIcon,
  Trash2,
  Circle,
  CheckCircle,
  Flag,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { PRIORITY_COLORS } from "@/types/task";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

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
    setActiveView,
    getFilteredTasks,
  } = useTasksStore();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

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

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    createTaskList(newListName.trim());
    setNewListName("");
    setShowNewList(false);
  };

  const smartViews = [
    { id: "inbox", label: "Inbox", icon: <Inbox size={18} /> },
    { id: "today", label: "Today", icon: <CalendarDays size={18} /> },
    { id: "upcoming", label: "Upcoming", icon: <CalendarClock size={18} /> },
    { id: "completed", label: "Completed", icon: <CheckCircle2 size={18} /> },
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-60 h-full flex flex-col border-r border-border-light bg-bg-secondary/40 backdrop-blur-xl p-3 pt-4">
        <h2 className="text-[17px] font-semibold text-text-primary tracking-[-0.01em] px-2 mb-4">
          Tasks
        </h2>

        {/* Smart views */}
        <div className="space-y-0.5 mb-4">
          {smartViews.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[--radius-sm]
                text-[13px] transition-colors cursor-pointer
                ${
                  activeView === view.id
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                }`}
            >
              {view.icon}
              {view.label}
              <span className="ml-auto text-[11px] text-text-tertiary">
                {view.id === "inbox"
                  ? tasks.filter(
                      (t) => t.list_id === "inbox" && !t.completed
                    ).length
                  : view.id === "completed"
                  ? tasks.filter((t) => t.completed).length
                  : ""}
              </span>
            </button>
          ))}
        </div>

        {/* Lists */}
        <div className="flex items-center justify-between px-2 mb-1.5">
          <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
            Lists
          </span>
          <button
            onClick={() => setShowNewList(true)}
            className="text-text-tertiary hover:text-accent transition-colors cursor-pointer"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="space-y-0.5 flex-1 overflow-y-auto">
          {taskLists
            .filter((l) => l.id !== "inbox")
            .map((list) => (
              <button
                key={list.id}
                onClick={() => setActiveView(list.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[--radius-sm]
                  text-[13px] transition-colors cursor-pointer
                  ${
                    activeView === list.id
                      ? "bg-accent/10 text-accent font-medium"
                      : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                  }`}
              >
                <ListIcon size={16} />
                <span className="truncate">{list.name}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col px-8 py-8 overflow-hidden max-w-3xl w-full mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-[28px] font-bold text-text-primary tracking-[-0.02em]">
            {smartViews.find((v) => v.id === activeView)?.label ||
              taskLists.find((l) => l.id === activeView)?.name ||
              "Tasks"}
          </h1>
          <p className="text-[13px] text-text-tertiary mt-0.5">
            {filteredTasks.length === 0
              ? "Nothing on your plate."
              : `${filteredTasks.filter((t) => !t.completed).length} open · ${filteredTasks.length} total`}
          </p>
        </motion.div>

        {/* New task input */}
        {activeView !== "completed" && (
          <div className="flex items-center gap-2 mb-5">
            <div className="flex-1 relative">
              <Plus
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
              />
              <input
                type="text"
                placeholder="Add a task…"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
                className="w-full h-11 pl-10 pr-4 bg-bg-glass-heavy backdrop-blur-xl
                  border border-border-light rounded-xl text-[14px]
                  text-text-primary placeholder:text-text-tertiary
                  outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10
                  transition-all
                  shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_20px_rgba(0,0,0,0.04)]"
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* Task list */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length === 0 ? (
              <EmptyState
                size="lg"
                icon={<CheckCircle2 size={28} strokeWidth={1.5} />}
                title={
                  activeView === "completed"
                    ? "No completed tasks"
                    : "All caught up"
                }
                description={
                  activeView === "completed"
                    ? "Finished tasks will appear here."
                    : "Add a task above to get started."
                }
              />
            ) : (
              filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="group flex items-start gap-3 px-3 py-3 mb-1 rounded-[--radius-md]
                    hover:bg-bg-hover transition-colors"
                >
                  {/* Checkbox */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 cursor-pointer shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle
                        size={20}
                        className="text-accent"
                        fill="currentColor"
                        strokeWidth={0}
                      />
                    ) : (
                      <Circle
                        size={20}
                        className="text-text-tertiary hover:text-accent transition-colors"
                      />
                    )}
                  </motion.button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
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
                            updateTask(task.id, {
                              title: (e.target as HTMLInputElement).value,
                            });
                            setEditingTaskId(null);
                          }
                        }}
                        className="w-full bg-transparent text-[14px] text-text-primary
                          outline-none border-b border-accent/40 pb-0.5"
                        spellCheck={false}
                      />
                    ) : (
                      <p
                        onDoubleClick={() => setEditingTaskId(task.id)}
                        className={`text-[14px] cursor-pointer ${
                          task.completed
                            ? "text-text-tertiary line-through"
                            : "text-text-primary"
                        }`}
                      >
                        {task.title}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {task.priority > 0 && (
                        <span className="flex items-center gap-1 text-[11px]">
                          <Flag
                            size={10}
                            style={{ color: PRIORITY_COLORS[task.priority] }}
                            fill="currentColor"
                          />
                        </span>
                      )}
                      {task.due_date && (
                        <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
                          <Calendar size={10} />
                          {format(task.due_date * 1000, "MMM d")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="hidden group-hover:flex items-center justify-center w-7 h-7
                      rounded-md text-text-tertiary hover:text-danger hover:bg-danger/10
                      transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* New list modal */}
      <Modal
        open={showNewList}
        onClose={() => setShowNewList(false)}
        title="New List"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="List name"
            placeholder="e.g. Work, Personal..."
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowNewList(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateList}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
