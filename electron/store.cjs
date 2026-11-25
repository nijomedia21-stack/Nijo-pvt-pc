// electron/store.cjs - local JSON data store for NIJO PVT PC (tasks, events, notes).
// Lives in the app's userData folder on this laptop only.
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class DataStore extends EventEmitter {
  constructor(dir) {
    super();
    this.file = path.join(dir, 'nijo-data.json');
    this.data = { initialized: false, tasks: [], events: [], notes: [], notified: [] };
    try {
      if (fs.existsSync(this.file)) {
        this.data = { ...this.data, ...JSON.parse(fs.readFileSync(this.file, 'utf8')) };
      }
    } catch (e) {
      console.warn('[store] could not read data file, starting fresh:', e.message);
    }
  }

  get() {
    return JSON.parse(JSON.stringify(this.data));
  }

  // patch: partial { tasks?, events?, notes? } ; source: 'ui' | 'agent' | 'system'
  set(patch, source = 'ui') {
    for (const key of ['tasks', 'events', 'notes', 'notified']) {
      if (Array.isArray(patch[key])) this.data[key] = patch[key];
    }
    this.data.initialized = true;
    this.save();
    this.emit('change', source);
    return this.get();
  }

  save() {
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2));
    fs.renameSync(tmp, this.file);
  }
}

module.exports = { DataStore };
