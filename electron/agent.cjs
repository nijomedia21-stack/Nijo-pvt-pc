// electron/agent.cjs - NIJO local agent (runs in the Electron main process on this laptop).
// Uses the Claude API (Messages API + client-side tools). Tools act on the local DataStore.
const sdk = require('@anthropic-ai/sdk');
const Anthropic = sdk.default || sdk.Anthropic || sdk;

const MODEL = 'claude-opus-5-5';

const SYSTEM = `You are "Nijo Copilot", the private AI assistant inside NIJO PVT PC on Nijo's own laptop.
Nijo is a Kerala Polytechnic AI & ML diploma student (Semester 1) and a freelance graphic designer / social media manager.
You help with three things:
1. Programming help: explain, write and debug code (mainly Python), step by step, with short runnable examples.
2. Teaching: explain study topics clearly for a first-semester polytechnic student, check understanding, give small practice questions.
3. Planning: create and manage tasks, calendar events and notes with the tools. When Nijo mentions something he has to do on a day or at a time, create a task with that dueDate and dueTime so he gets a reminder notification, then confirm what you created.
Rules: Use the tools instead of pretending. Dates are YYYY-MM-DD and times are 24h HH:MM in India time. Keep answers concise and practical. You may mix in Malayalam words naturally if Nijo writes in Malayalam.`;

const str = { type: 'string' };
const TOOLS = [
  {
    name: 'list_tasks',
    description: 'List tasks. Use before completing or deleting so you have the right id.',
    input_schema: { type: 'object', properties: { include_completed: { type: 'boolean' } }, required: [], additionalProperties: false },
  },
  {
    name: 'add_task',
    description: 'Create a task. Give dueDate (and dueTime if a time was mentioned) so a reminder notification fires.',
    input_schema: {
      type: 'object',
      properties: {
        title: str,
        description: str,
        dueDate: { type: 'string', description: 'YYYY-MM-DD' },
        dueTime: { type: 'string', description: 'HH:MM 24h, optional' },
        priority: { type: 'string', enum: ['high', 'medium', 'normal'] },
        workspace: { type: 'string', enum: ['study', 'design', 'general'] },
      },
      required: ['title', 'dueDate'],
      additionalProperties: false,
    },
  },
  {
    name: 'complete_task',
    description: 'Mark a task as completed by id.',
    input_schema: { type: 'object', properties: { id: str }, required: ['id'], additionalProperties: false },
  },
  {
    name: 'delete_task',
    description: 'Delete a task by id. Only when Nijo clearly asks to delete.',
    input_schema: { type: 'object', properties: { id: str }, required: ['id'], additionalProperties: false },
  },
  {
    name: 'list_events',
    description: 'List calendar events, optionally between two dates (YYYY-MM-DD).',
    input_schema: { type: 'object', properties: { from: str, to: str }, required: [], additionalProperties: false },
  },
  {
    name: 'add_event',
    description: 'Add a calendar event.',
    input_schema: {
      type: 'object',
      properties: {
        title: str,
        date: { type: 'string', description: 'YYYY-MM-DD' },
        time: { type: 'string', description: 'HH:MM 24h' },
        type: { type: 'string', enum: ['exam', 'deadline', 'festival', 'class', 'reels'] },
        notes: str,
      },
      required: ['title', 'date', 'time', 'type'],
      additionalProperties: false,
    },
  },
  {
    name: 'add_note',
    description: 'Save a note (study notes, ideas, code snippets).',
    input_schema: { type: 'object', properties: { title: str, body: str }, required: ['title', 'body'], additionalProperties: false },
  },
  {
    name: 'list_notes',
    description: 'List saved notes (titles and first lines).',
    input_schema: { type: 'object', properties: {}, required: [], additionalProperties: false },
  },
].map((t) => ({ ...t, strict: true }));

function runTool(store, name, input) {
  const d = store.get();
  const now = new Date().toISOString();
  switch (name) {
    case 'list_tasks': {
      const list = d.tasks.filter((t) => input.include_completed || !t.completed);
      return list.map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate, dueTime: t.dueTime || '', priority: t.priority, completed: t.completed }));
    }
    case 'add_task': {
      const today = now.slice(0, 10);
      const task = {
        id: `task-${Date.now()}`,
        title: input.title,
        description: input.description || '',
        category: input.dueDate === today ? 'today' : 'upcoming',
        priority: input.priority || 'normal',
        dueDate: input.dueDate,
        dueTime: input.dueTime || undefined,
        completed: false,
        workspace: input.workspace || 'general',
        tags: ['agent'],
        createdAt: now,
      };
      store.set({ tasks: [task, ...d.tasks] }, 'agent');
      return { created: task.id, title: task.title, dueDate: task.dueDate, dueTime: task.dueTime || null };
    }
    case 'complete_task': {
      if (!d.tasks.some((t) => t.id === input.id)) return { error: 'No task with that id. Call list_tasks.' };
      store.set({ tasks: d.tasks.map((t) => (t.id === input.id ? { ...t, completed: true, category: 'completed' } : t)) }, 'agent');
      return { completed: input.id };
    }
    case 'delete_task': {
      if (!d.tasks.some((t) => t.id === input.id)) return { error: 'No task with that id. Call list_tasks.' };
      store.set({ tasks: d.tasks.filter((t) => t.id !== input.id) }, 'agent');
      return { deleted: input.id };
    }
    case 'list_events': {
      return d.events.filter((e) => (!input.from || e.date >= input.from) && (!input.to || e.date <= input.to));
    }
    case 'add_event': {
      const ev = { id: `ev-${Date.now()}`, title: input.title, date: input.date, time: input.time, type: input.type, vibrationTrigger: 'gentle', notes: input.notes || '', workspace: 'general' };
      store.set({ events: [...d.events, ev] }, 'agent');
      return { created: ev.id };
    }
    case 'add_note': {
      const note = { id: `note-${Date.now()}`, title: input.title, body: input.body, updatedAt: now };
      store.set({ notes: [note, ...d.notes] }, 'agent');
      return { created: note.id };
    }
    case 'list_notes':
      return d.notes.map((n) => ({ id: n.id, title: n.title, preview: (n.body || '').slice(0, 120) }));
    default:
      return { error: `Unknown tool ${name}` };
  }
}

class NijoAgent {
  constructor(store, getApiKey) {
    this.store = store;
    this.getApiKey = getApiKey;
    this.history = []; // append-only conversation (full assistant content incl. thinking blocks)
  }

  reset() {
    this.history = [];
  }

  async chat(userText, mode) {
    const apiKey = this.getApiKey();
    if (!apiKey) return { text: 'Claude API key is not set. Open Copilot → "Set API key" to add it (it stays encrypted on this laptop).', model: 'none' };
    const client = new Anthropic({ apiKey });
    const stamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' });
    this.history.push({ role: 'user', content: `[Now: ${stamp} | workspace: ${mode}]\n${userText}` });

    for (let step = 0; step < 12; step++) {
      let response;
      try {
        response = await client.beta.messages.create({
          model: MODEL,
          max_tokens: 16000,
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
          output_config: { effort: 'medium' },
          system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
          tools: TOOLS,
          messages: this.history,
        });
      } catch (err) {
        this.history.pop(); // drop the unanswered user turn so history stays valid
        if (err instanceof Anthropic.AuthenticationError) return { text: 'The Claude API key was rejected. Set a valid key.', model: 'error' };
        if (err instanceof Anthropic.RateLimitError) return { text: 'Claude is rate-limited right now. Try again in a minute.', model: 'error' };
        if (err instanceof Anthropic.APIConnectionError) return { text: 'No internet connection to Claude.', model: 'error' };
        return { text: `Agent error: ${err.message}`, model: 'error' };
      }

      this.history.push({ role: 'assistant', content: response.content });

      if (response.stop_reason === 'refusal') {
        return { text: 'Claude declined this request.', model: response.model };
      }
      if (response.stop_reason !== 'tool_use') {
        const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
        return { text: text || '(no reply)', model: response.model, changed: true };
      }

      const results = [];
      for (const block of response.content) {
        if (block.type !== 'tool_use') continue;
        try {
          const out = runTool(this.store, block.name, block.input || {});
          results.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(out) });
        } catch (e) {
          results.push({ type: 'tool_result', tool_use_id: block.id, content: `Error: ${e.message}`, is_error: true });
        }
      }
      this.history.push({ role: 'user', content: results });
    }
    return { text: 'Stopped after too many steps.', model: MODEL };
  }
}

module.exports = { NijoAgent };
