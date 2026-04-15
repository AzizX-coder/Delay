export interface NoteTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  build: () => { title: string; content: any };
}

const h = (level: 1 | 2 | 3, text: string) => ({
  type: "heading",
  attrs: { level },
  content: [{ type: "text", text }],
});
const p = (text?: string) => ({
  type: "paragraph",
  ...(text ? { content: [{ type: "text", text }] } : {}),
});
const taskList = (items: string[]) => ({
  type: "taskList",
  content: items.map((t) => ({
    type: "taskItem",
    attrs: { checked: false },
    content: [p(t)],
  })),
});
const bulletList = (items: string[]) => ({
  type: "bulletList",
  content: items.map((t) => ({
    type: "listItem",
    content: [p(t)],
  })),
});

const today = () => {
  const d = new Date();
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    icon: "📝",
    description: "Start fresh.",
    build: () => ({
      title: "",
      content: { type: "doc", content: [p()] },
    }),
  },
  {
    id: "daily",
    name: "Daily Journal",
    icon: "🌅",
    description: "A guided reflection for today.",
    build: () => ({
      title: today(),
      content: {
        type: "doc",
        content: [
          h(1, today()),
          h(2, "Intent"),
          p("What am I choosing to focus on today?"),
          h(2, "Three priorities"),
          taskList(["", "", ""]),
          h(2, "Notes"),
          p(),
          h(2, "Gratitude"),
          bulletList([""]),
        ],
      },
    }),
  },
  {
    id: "meeting",
    name: "Meeting",
    icon: "👥",
    description: "Agenda, notes, action items.",
    build: () => ({
      title: "Meeting — " + today(),
      content: {
        type: "doc",
        content: [
          h(1, "Meeting"),
          h(3, "Attendees"),
          bulletList([""]),
          h(3, "Agenda"),
          bulletList([""]),
          h(3, "Notes"),
          p(),
          h(3, "Action items"),
          taskList([""]),
        ],
      },
    }),
  },
  {
    id: "project",
    name: "Project Plan",
    icon: "🚀",
    description: "Goal, milestones, risks.",
    build: () => ({
      title: "Project — ",
      content: {
        type: "doc",
        content: [
          h(1, "Project name"),
          h(2, "Goal"),
          p("What success looks like."),
          h(2, "Scope"),
          bulletList(["In-scope", "Out-of-scope"]),
          h(2, "Milestones"),
          taskList(["M1 — kickoff", "M2 — draft", "M3 — launch"]),
          h(2, "Risks"),
          bulletList([""]),
          h(2, "Open questions"),
          bulletList([""]),
        ],
      },
    }),
  },
  {
    id: "brainstorm",
    name: "Brainstorm",
    icon: "💡",
    description: "Wild ideas, then shortlist.",
    build: () => ({
      title: "Brainstorm — ",
      content: {
        type: "doc",
        content: [
          h(1, "Brainstorm"),
          h(3, "Prompt"),
          p("What are we exploring?"),
          h(3, "Wild ideas"),
          bulletList(["", "", ""]),
          h(3, "Shortlist"),
          taskList([""]),
        ],
      },
    }),
  },
  {
    id: "recipe",
    name: "Recipe",
    icon: "🍳",
    description: "Ingredients and steps.",
    build: () => ({
      title: "Recipe — ",
      content: {
        type: "doc",
        content: [
          h(1, "Recipe"),
          h(3, "Ingredients"),
          bulletList([""]),
          h(3, "Steps"),
          { type: "orderedList", content: [
            { type: "listItem", content: [p("")] },
          ]},
        ],
      },
    }),
  },
];
