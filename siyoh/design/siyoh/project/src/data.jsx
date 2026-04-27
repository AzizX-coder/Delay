// Mock content for Siyoh

const SIYOH_DATA = {
  stories: [
    {
      id: 1, title: 'The Weight of Quiet Mornings',
      author: 'Amara Okafor', handle: '@amara.writes',
      type: 'text', mins: 7, plays: '12.4k', likes: 892,
      excerpt: 'There is a particular shade of light that only exists at 5:47 AM — when the city hasn\'t yet decided what kind of day it wants to be. I have been collecting these mornings for three years now, keeping them like pressed flowers between the pages of notebooks I never finish.',
      tags: ['Essay', 'Memoir'], cover: 0, date: 'Apr 12',
    },
    {
      id: 2, title: 'Letters I Never Sent',
      author: 'Ravi Shankar', handle: '@ravi.s',
      type: 'audio', mins: 14, plays: '8.1k', likes: 640,
      excerpt: 'A collection of unsent letters, read in the voice of the writer. Intimate, unguarded, and recorded in a single take at 2 AM in Bengaluru.',
      tags: ['Audio', 'Essay'], cover: 1, date: 'Apr 10',
    },
    {
      id: 3, title: 'The Cartographer\'s Daughter',
      author: 'Lina Vestergaard', handle: '@lina.v',
      type: 'text', mins: 22, plays: '34.6k', likes: 2140,
      excerpt: 'Chapter one of a novel in progress. My father drew maps for a living, but he never once drew the route home.',
      tags: ['Fiction', 'Novel'], cover: 2, date: 'Apr 9',
    },
    {
      id: 4, title: 'Bread, Butter, and the Meaning of Sundays',
      author: 'Theo Mwangi', handle: '@theo',
      type: 'text', mins: 5, plays: '4.2k', likes: 310,
      excerpt: 'My grandmother used to say that a Sunday without bread was a week that had lost its spine.',
      tags: ['Essay', 'Food'], cover: 3, date: 'Apr 8',
    },
    {
      id: 5, title: 'Notes From a Slow Train',
      author: 'Ines Moreau', handle: '@ines',
      type: 'audio', mins: 9, plays: '6.7k', likes: 412,
      excerpt: 'Field recording and reflections from a 14-hour train through the French countryside.',
      tags: ['Audio', 'Travel'], cover: 4, date: 'Apr 7',
    },
    {
      id: 6, title: 'How to Disappear Politely',
      author: 'Kenji Park', handle: '@kenji',
      type: 'text', mins: 11, plays: '18.9k', likes: 1230,
      excerpt: 'A guide, partly serious, partly not, for the chronically overextended.',
      tags: ['Essay', 'Humor'], cover: 5, date: 'Apr 6',
    },
    {
      id: 7, title: 'Small Gods of the Kitchen',
      author: 'Amara Okafor', handle: '@amara.writes',
      type: 'audio', mins: 18, plays: '22.3k', likes: 1680,
      excerpt: 'On the invisible rituals of cooking for someone you love.',
      tags: ['Audio', 'Memoir'], cover: 6, date: 'Apr 4',
    },
    {
      id: 8, title: 'The Blue Hour',
      author: 'Sasha Dimitrova', handle: '@sasha.d',
      type: 'text', mins: 13, plays: '9.8k', likes: 720,
      excerpt: 'A short story about the twenty minutes between dusk and dark, and the woman who lived inside them.',
      tags: ['Fiction', 'Short Story'], cover: 7, date: 'Apr 3',
    },
  ],

  collections: [
    { name: 'For Quiet Evenings', count: 24, seed: 0 },
    { name: 'First-time Writers', count: 47, seed: 2 },
    { name: 'Late-night Audio', count: 18, seed: 7 },
    { name: 'Memoir & Essay', count: 112, seed: 5 },
  ],

  genres: ['All', 'Essay', 'Fiction', 'Memoir', 'Poetry', 'Travel', 'Food', 'Humor', 'Letters'],
  themes: ['Slow living', 'Grief', 'Home', 'Identity', 'Love', 'Craft', 'Place', 'Solitude'],

  writers: [
    { name: 'Amara Okafor', handle: '@amara.writes', readers: '24.1k', seed: 0, bio: 'Essays on small rituals.' },
    { name: 'Ravi Shankar', handle: '@ravi.s', readers: '12.8k', seed: 1, bio: 'Audio storyteller, Bengaluru.' },
    { name: 'Lina Vestergaard', handle: '@lina.v', readers: '38.2k', seed: 2, bio: 'Novels, slowly.' },
    { name: 'Theo Mwangi', handle: '@theo', readers: '6.4k', seed: 3, bio: 'Food and memory.' },
  ],
};

// A single long story body for detail pages (3-4 paragraphs)
const SIYOH_STORY_BODY = [
  'There is a particular shade of light that only exists at 5:47 AM — when the city hasn\'t yet decided what kind of day it wants to be. I have been collecting these mornings for three years now, keeping them like pressed flowers between the pages of notebooks I never finish.',
  'My grandmother used to say that the world is gentlest before it remembers itself. She would rise while the kettle was still cold and sit at the kitchen window with a cup of nothing in particular, waiting for the sparrows. I thought, for many years, that she was praying. Now I think she was simply listening.',
  'Quiet is not the absence of noise. Quiet is what remains when you stop trying to fill it — the hum of a refrigerator, the complaint of old wood, the soft report of a neighbour\'s door closing two floors below. A good morning teaches you that attention itself is a kind of love.',
  'I have learned that if I do not write these small hours down, they will leave me. Not all at once, but slowly, the way a photograph fades in a sunny window. So I sit. I steep the tea. I write the light as carefully as I can, knowing the words will never be enough, knowing also that this is precisely the point.',
];

Object.assign(window, { SIYOH_DATA, SIYOH_STORY_BODY });
