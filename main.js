/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// main.ts
__export(exports, {
  default: () => ObsidianClocktable
});
var import_obsidian = __toModule(require("obsidian"));
var DEFAULT_SETTINGS = {
  pathToDailyNotes: "daily"
};
var taskFormatRegexp = /- (\[\d\d:\d\d\]) (.+ )?(:.+:)(.*)?/;
var ObsidianClocktable = class extends import_obsidian.Plugin {
  onload() {
    return __async(this, null, function* () {
      yield this.loadSettings();
      this.addSettingTab(new ObsidianClocktableSettingsTab(this.app, this));
      this.registerInterval(window.setInterval(() => console.log("setInterval"), 5 * 60 * 1e3));
      this.addCommand({
        id: "insert-clocktable-report",
        name: "Insert clocktable report",
        editorCallback: (editor, view) => {
          new EnterReportIntervalsModal(this.app, (s, f) => {
            this.settings.pathToDailyNotes;
            prepareReport(this.app, s, f, this.settings.pathToDailyNotes, (text) => {
              editor.replaceRange(text, editor.getCursor());
            });
          }).open();
        }
      });
      this.addCommand({
        id: "add-5-minutes",
        name: "Add 5 minutes to current task",
        editorCallback: (editor, view) => {
          let l = editor.getLine(editor.getCursor().line);
          let replacedLine = changeTaskTimeToDelta(5, "minute", l);
          editor.setLine(editor.getCursor().line, replacedLine);
        },
        hotkeys: [{ modifiers: ["Mod", "Shift"], key: "k" }]
      });
      this.addCommand({
        id: "sub-5-minutes",
        name: "Sub 5 minutes to current task",
        editorCallback: (editor, view) => {
          let l = editor.getLine(editor.getCursor().line);
          let replacedLine = changeTaskTimeToDelta(-5, "minute", l);
          editor.setLine(editor.getCursor().line, replacedLine);
        },
        hotkeys: [{ modifiers: ["Mod", "Shift"], key: "j" }]
      });
      this.addCommand({
        id: "insert-black-task-line",
        name: "Insert line with black task",
        editorCallback: (editor, view) => {
          let cur = editor.getCursor().line;
          editor.setLine(cur, editor.getLine(editor.getCursor().line) + "\n- [11:30] :ex:");
        },
        hotkeys: [{ modifiers: ["Mod", "Shift"], key: "l" }]
      });
    });
  }
  onunload() {
  }
  loadSettings() {
    return __async(this, null, function* () {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
    });
  }
  saveSettings() {
    return __async(this, null, function* () {
      yield this.saveData(this.settings);
    });
  }
};
var EnterReportIntervalsModal = class extends import_obsidian.Modal {
  constructor(app, c) {
    super(app);
    this.callback = c;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h1", { text: "Obsidian Clocktable" });
    contentEl.createEl("h2", { text: "Report interval(YYYY-MM-DD format)" });
    new import_obsidian.Setting(contentEl).setName("start").addText((text) => text.onChange((value) => {
      this.start = value;
    }));
    new import_obsidian.Setting(contentEl).setName("finish").addText((text) => text.onChange((value) => {
      this.finish = value;
    }));
    new import_obsidian.Setting(contentEl).addButton((btn) => btn.setButtonText("Submit").setCta().onClick(() => {
      let start = this.parseDate(this.start);
      let finish = this.parseDate(this.finish);
      if (start == null || finish == null) {
        return;
      }
      if (start.isAfter(finish)) {
        this.invalidInputNotice("start should be < finish");
        return;
      }
      this.close();
      this.callback(start, finish);
    }));
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
  parseDate(input) {
    if (input == null || input.length != 10 && input[4] != "-" && input[7] != "-") {
      this.invalidInputNotice(input);
      this.close();
      return null;
    }
    let date = moment(input, "YYYY-MM-DD");
    if (!date.isValid) {
      this.close();
      this.invalidInputNotice(input);
      return null;
    }
    return date;
  }
  invalidInputNotice(v) {
    new import_obsidian.Notice("Invalid value: " + v);
  }
};
var ObsidianClocktableSettingsTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Obsidian Clocktable" });
    new import_obsidian.Setting(containerEl).setName("Path to daily folder").setDesc("Enter path will be used to find your daily notes with tasks").addText((text) => text.setPlaceholder("daily").setValue(this.plugin.settings.pathToDailyNotes).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.pathToDailyNotes = value;
      yield this.plugin.saveSettings();
    })));
  }
};
function prepareReport(app, start, finish, dailyPath, onComplete) {
  return __async(this, null, function* () {
    var files = app.vault.getFiles();
    var targetFilenames = generateFilenamesInInterval(start, finish);
    let contentPromises = files.filter((v, i, arr) => {
      return v.parent.name == dailyPath && targetFilenames.includes(v.name);
    }).map((v, i, arr) => {
      return app.vault.read(v);
    });
    let contents = yield Promise.all(contentPromises);
    if (contents.length == 0) {
      new import_obsidian.Notice("No files to open, check selected interval or path to notes in settings");
      return;
    }
    var taskDurations = new Map();
    contents.forEach((v, i, arr) => calculateDurations(taskDurations, v));
    let report = "";
    taskDurations.forEach((v, k, m) => {
      let formattedDur = moment.utc(moment.duration(v, "seconds").asMilliseconds()).format("H[h]mm[m]");
      report += `${k} => ${formattedDur}
`;
    });
    onComplete(report);
  });
}
function calculateDurations(taskDurations, content) {
  let lines = content.split("\n");
  var prevTime;
  for (var l of lines.reverse()) {
    let m = l.match(taskFormatRegexp);
    if (m == null) {
      continue;
    }
    let time = moment(m[1].substring(1, m[1].length - 1), "HH:mm");
    let taskName = m[3];
    if (prevTime == null) {
      prevTime = time;
      continue;
    }
    var dur = 0;
    if (taskDurations.has(taskName)) {
      dur = taskDurations.get(taskName);
    }
    dur += prevTime.diff(time, "seconds");
    taskDurations.set(taskName, dur);
    prevTime = time;
  }
}
function generateFilenamesInInterval(start, finish) {
  var res = [];
  for (let cur = start; cur.format("YYYY-MM-DD") != finish.format("YYYY-MM-DD"); cur = cur.add(1, "day")) {
    res.push(cur.format("YYYY-MM-DD") + ".md");
  }
  return res;
}
function changeTaskTimeToDelta(val, unit, l) {
  let m = l.match(taskFormatRegexp);
  if (m == null) {
    new import_obsidian.Notice("given line has wrong format");
    return;
  }
  let time = moment(m[1].substring(1, m[1].length - 1), "HH:mm");
  time = time.add(val, unit);
  return `- [${time.format("HH[:]mm")}] ${l.substring(10)}`;
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgTW9tZW50IH0gZnJvbSAnbW9tZW50JztcbmltcG9ydCB7IEFwcCwgRWRpdG9yLCBNYXJrZG93blZpZXcsIE1vZGFsLCBOb3RpY2UsIFBsdWdpbiwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZywgSG90a2V5IH0gZnJvbSAnb2JzaWRpYW4nO1xuXG5pbnRlcmZhY2UgT2JzaWRpYW5DbG9ja3RhYmxlU2V0dGluZ3Mge1xuXHRwYXRoVG9EYWlseU5vdGVzOiBzdHJpbmc7XG59XG5cbmNvbnN0IERFRkFVTFRfU0VUVElOR1M6IE9ic2lkaWFuQ2xvY2t0YWJsZVNldHRpbmdzID0ge1xuXHRwYXRoVG9EYWlseU5vdGVzOiAnZGFpbHknXG59XG5cbmNvbnN0IHRhc2tGb3JtYXRSZWdleHAgPSAvLSAoXFxbXFxkXFxkOlxcZFxcZFxcXSkgKC4rICk/KDouKzopKC4qKT8vO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPYnNpZGlhbkNsb2NrdGFibGUgZXh0ZW5kcyBQbHVnaW4ge1xuXHRzZXR0aW5nczogT2JzaWRpYW5DbG9ja3RhYmxlU2V0dGluZ3M7XG5cblx0YXN5bmMgb25sb2FkKCkge1xuXHRcdGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG5cblx0XHQvLyBUaGlzIGFkZHMgYSBzZXR0aW5ncyB0YWIgc28gdGhlIHVzZXIgY2FuIGNvbmZpZ3VyZSB2YXJpb3VzIGFzcGVjdHMgb2YgdGhlIHBsdWdpblxuXHRcdHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgT2JzaWRpYW5DbG9ja3RhYmxlU2V0dGluZ3NUYWIodGhpcy5hcHAsIHRoaXMpKTtcblxuXHRcdC8vIFdoZW4gcmVnaXN0ZXJpbmcgaW50ZXJ2YWxzLCB0aGlzIGZ1bmN0aW9uIHdpbGwgYXV0b21hdGljYWxseSBjbGVhciB0aGUgaW50ZXJ2YWwgd2hlbiB0aGUgcGx1Z2luIGlzIGRpc2FibGVkLlxuXHRcdHRoaXMucmVnaXN0ZXJJbnRlcnZhbCh3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4gY29uc29sZS5sb2coJ3NldEludGVydmFsJyksIDUgKiA2MCAqIDEwMDApKTtcblxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ2luc2VydC1jbG9ja3RhYmxlLXJlcG9ydCcsXG5cdFx0XHRuYW1lOiAnSW5zZXJ0IGNsb2NrdGFibGUgcmVwb3J0Jyxcblx0XHRcdGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yOiBFZGl0b3IsIHZpZXc6IE1hcmtkb3duVmlldykgPT4ge1xuXHRcdFx0XHRuZXcgRW50ZXJSZXBvcnRJbnRlcnZhbHNNb2RhbCh0aGlzLmFwcCwgKHM6IE1vbWVudCwgZjogTW9tZW50KT0+e1xuXHRcdFx0XHRcdHRoaXMuc2V0dGluZ3MucGF0aFRvRGFpbHlOb3Rlc1xuXHRcdFx0XHRcdHByZXBhcmVSZXBvcnQodGhpcy5hcHAsIHMsIGYsIHRoaXMuc2V0dGluZ3MucGF0aFRvRGFpbHlOb3RlcywgKHRleHQ6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRcdFx0ZWRpdG9yLnJlcGxhY2VSYW5nZSh0ZXh0LCBlZGl0b3IuZ2V0Q3Vyc29yKCkpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH0pLm9wZW4oKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ2FkZC01LW1pbnV0ZXMnLFxuXHRcdFx0bmFtZTogJ0FkZCA1IG1pbnV0ZXMgdG8gY3VycmVudCB0YXNrJyxcblx0XHRcdGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yOiBFZGl0b3IsIHZpZXc6IE1hcmtkb3duVmlldykgPT4ge1xuXHRcdFx0XHRsZXQgbCA9IGVkaXRvci5nZXRMaW5lKGVkaXRvci5nZXRDdXJzb3IoKS5saW5lKVxuXHRcdFx0XHRsZXQgcmVwbGFjZWRMaW5lID0gY2hhbmdlVGFza1RpbWVUb0RlbHRhKDUsICdtaW51dGUnLCBsKVxuXHRcdFx0XHRlZGl0b3Iuc2V0TGluZShlZGl0b3IuZ2V0Q3Vyc29yKCkubGluZSwgcmVwbGFjZWRMaW5lKVxuXHRcdFx0fSxcblx0XHRcdGhvdGtleXM6IFt7bW9kaWZpZXJzOiBbXCJNb2RcIiwgXCJTaGlmdFwiXSwga2V5OiBcImtcIn1dLFxuXHRcdH0pO1xuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ3N1Yi01LW1pbnV0ZXMnLFxuXHRcdFx0bmFtZTogJ1N1YiA1IG1pbnV0ZXMgdG8gY3VycmVudCB0YXNrJyxcblx0XHRcdGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yOiBFZGl0b3IsIHZpZXc6IE1hcmtkb3duVmlldykgPT4ge1xuXHRcdFx0XHRsZXQgbCA9IGVkaXRvci5nZXRMaW5lKGVkaXRvci5nZXRDdXJzb3IoKS5saW5lKVxuXHRcdFx0XHRsZXQgcmVwbGFjZWRMaW5lID0gY2hhbmdlVGFza1RpbWVUb0RlbHRhKC01LCAnbWludXRlJywgbClcblx0XHRcdFx0ZWRpdG9yLnNldExpbmUoZWRpdG9yLmdldEN1cnNvcigpLmxpbmUsIHJlcGxhY2VkTGluZSlcblx0XHRcdH0sXG5cdFx0XHRob3RrZXlzOiBbe21vZGlmaWVyczogW1wiTW9kXCIsIFwiU2hpZnRcIl0sIGtleTogXCJqXCJ9XSxcblx0XHR9KTtcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0aWQ6ICdpbnNlcnQtYmxhY2stdGFzay1saW5lJyxcblx0XHRcdG5hbWU6ICdJbnNlcnQgbGluZSB3aXRoIGJsYWNrIHRhc2snLFxuXHRcdFx0ZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3I6IEVkaXRvciwgdmlldzogTWFya2Rvd25WaWV3KSA9PiB7XG5cdFx0XHRcdGxldCBjdXIgPSBlZGl0b3IuZ2V0Q3Vyc29yKCkubGluZVxuXHRcdFx0XHRlZGl0b3Iuc2V0TGluZShjdXIsXG5cdFx0XHRcdFx0ZWRpdG9yLmdldExpbmUoZWRpdG9yLmdldEN1cnNvcigpLmxpbmUpICtcblx0XHRcdFx0XHRcIlxcbi0gWzExOjMwXSA6ZXg6XCJcdFxuXHRcdFx0XHQpXG5cdFx0XHR9LFxuXHRcdFx0aG90a2V5czogW3ttb2RpZmllcnM6IFtcIk1vZFwiLCBcIlNoaWZ0XCJdLCBrZXk6IFwibFwifV0sXG5cdFx0fSk7XG5cdH1cblxuXHRvbnVubG9hZCgpIHtcblxuXHR9XG5cblx0YXN5bmMgbG9hZFNldHRpbmdzKCkge1xuXHRcdHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xuXHR9XG5cblx0YXN5bmMgc2F2ZVNldHRpbmdzKCkge1xuXHRcdGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG5cdH1cbn1cblxuY2xhc3MgRW50ZXJSZXBvcnRJbnRlcnZhbHNNb2RhbCBleHRlbmRzIE1vZGFsIHtcblx0c3RhcnQ6IHN0cmluZztcblx0ZmluaXNoOiBzdHJpbmc7XG5cdGNhbGxiYWNrOiAoczogTW9tZW50LCBmOk1vbWVudCk9PnZvaWQ7XG5cblx0Y29uc3RydWN0b3IoYXBwOiBBcHAsIGM6IChzOiBNb21lbnQsIGY6TW9tZW50KT0+dm9pZCkge1xuXHRcdHN1cGVyKGFwcCk7XG5cdFx0dGhpcy5jYWxsYmFjayA9IGM7XG5cdH1cblxuXHRvbk9wZW4oKSB7XG5cdFx0Y29uc3Qge2NvbnRlbnRFbH0gPSB0aGlzO1xuXHRcdGNvbnRlbnRFbC5jcmVhdGVFbChcImgxXCIsIHsgdGV4dDogXCJPYnNpZGlhbiBDbG9ja3RhYmxlXCIgfSk7XG5cdFx0Y29udGVudEVsLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiBcIlJlcG9ydCBpbnRlcnZhbChZWVlZLU1NLUREIGZvcm1hdClcIiB9KTtcblxuXHRcdC8vIHN0YXJ0IGludGVydmFsIFRleHRFZGl0XG5cdFx0bmV3IFNldHRpbmcoY29udGVudEVsKVxuXHRcdC5zZXROYW1lKFwic3RhcnRcIilcblx0XHQuYWRkVGV4dCgodGV4dCkgPT5cblx0XHQgIHRleHQub25DaGFuZ2UoKHZhbHVlKSA9PiB7XG5cdFx0XHR0aGlzLnN0YXJ0ID0gdmFsdWVcblx0XHQgIH0pKTtcblxuXHRcdC8vIGZpbmlzaCBpbnRlcnZhbCBUZXh0RWRpdFxuXHRcdG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcblx0XHQuc2V0TmFtZShcImZpbmlzaFwiKVxuXHRcdC5hZGRUZXh0KCh0ZXh0KSA9PlxuXHRcdHRleHQub25DaGFuZ2UoKHZhbHVlKSA9PiB7XG5cdFx0XHR0aGlzLmZpbmlzaCA9IHZhbHVlXG5cdFx0fSkpO1xuXG5cdFx0Ly8gU3VibWl0IGJ1dHRvblxuXHRcdG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcblx0XHQuYWRkQnV0dG9uKChidG4pID0+XG5cdFx0ICBidG5cblx0XHRcdC5zZXRCdXR0b25UZXh0KFwiU3VibWl0XCIpXG5cdFx0XHQuc2V0Q3RhKClcblx0XHRcdC5vbkNsaWNrKCgpID0+IHtcblx0XHRcdFx0bGV0IHN0YXJ0ID0gdGhpcy5wYXJzZURhdGUodGhpcy5zdGFydClcblx0XHRcdFx0bGV0IGZpbmlzaCA9IHRoaXMucGFyc2VEYXRlKHRoaXMuZmluaXNoKVxuXHRcdFx0XHRpZiAoc3RhcnQgPT0gbnVsbCB8fCBmaW5pc2ggPT0gbnVsbCkgeyByZXR1cm4gfVxuXHRcdFx0XHRpZiAoc3RhcnQuaXNBZnRlcihmaW5pc2gpKSB7XG5cdFx0XHRcdFx0dGhpcy5pbnZhbGlkSW5wdXROb3RpY2UoXCJzdGFydCBzaG91bGQgYmUgPCBmaW5pc2hcIilcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0fVxuXHRcdFx0ICBcdHRoaXMuY2xvc2UoKTtcblx0XHRcdCAgXHR0aGlzLmNhbGxiYWNrKHN0YXJ0LCBmaW5pc2gpXG5cdFx0XHR9KSk7XG5cblx0fVxuXG5cdG9uQ2xvc2UoKSB7XG5cdFx0Y29uc3Qge2NvbnRlbnRFbH0gPSB0aGlzO1xuXHRcdGNvbnRlbnRFbC5lbXB0eSgpO1xuXHR9XG5cblx0cGFyc2VEYXRlKGlucHV0OiBzdHJpbmcpOiBNb21lbnQge1xuXHRcdGlmIChpbnB1dCA9PSBudWxsIHx8IChpbnB1dC5sZW5ndGggIT0gMTAgJiYgaW5wdXRbNF0gIT0gXCItXCIgJiYgaW5wdXRbN10gIT0gXCItXCIpKSB7XG5cdFx0XHR0aGlzLmludmFsaWRJbnB1dE5vdGljZShpbnB1dCk7XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH0gXG5cdFx0bGV0IGRhdGUgPSBtb21lbnQoaW5wdXQsIFwiWVlZWS1NTS1ERFwiKVxuXHRcdGlmICghZGF0ZS5pc1ZhbGlkKSB7XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0XHR0aGlzLmludmFsaWRJbnB1dE5vdGljZShpbnB1dCk7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH1cdFxuXHRcdHJldHVybiBkYXRlXG5cdH1cblxuXHRpbnZhbGlkSW5wdXROb3RpY2Uodjogc3RyaW5nKSB7XG5cdFx0bmV3IE5vdGljZSgnSW52YWxpZCB2YWx1ZTogJyArIHYpO1xuXHR9XG59XG5cbmNsYXNzIE9ic2lkaWFuQ2xvY2t0YWJsZVNldHRpbmdzVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG5cdHBsdWdpbjogT2JzaWRpYW5DbG9ja3RhYmxlO1xuXG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IE9ic2lkaWFuQ2xvY2t0YWJsZSkge1xuXHRcdHN1cGVyKGFwcCwgcGx1Z2luKTtcblx0XHR0aGlzLnBsdWdpbiA9IHBsdWdpbjtcblx0fVxuXG5cdGRpc3BsYXkoKTogdm9pZCB7XG5cdFx0Y29uc3Qge2NvbnRhaW5lckVsfSA9IHRoaXM7XG5cblx0XHRjb250YWluZXJFbC5lbXB0eSgpO1xuXG5cdFx0Y29udGFpbmVyRWwuY3JlYXRlRWwoJ2gyJywge3RleHQ6ICdPYnNpZGlhbiBDbG9ja3RhYmxlJ30pO1xuXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQuc2V0TmFtZSgnUGF0aCB0byBkYWlseSBmb2xkZXInKVxuXHRcdFx0LnNldERlc2MoJ0VudGVyIHBhdGggd2lsbCBiZSB1c2VkIHRvIGZpbmQgeW91ciBkYWlseSBub3RlcyB3aXRoIHRhc2tzJylcblx0XHRcdC5hZGRUZXh0KHRleHQgPT4gdGV4dFxuXHRcdFx0XHQuc2V0UGxhY2Vob2xkZXIoJ2RhaWx5Jylcblx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnBhdGhUb0RhaWx5Tm90ZXMpXG5cdFx0XHRcdC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5wYXRoVG9EYWlseU5vdGVzID0gdmFsdWU7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHRcdH0pKTtcblx0fVxufVxuXG4vKlxuXHUwNDREXHUwNDQyXHUwNDNFIFx1MDQzMVx1MDQ0M1x1MDQzNFx1MDQzNVx1MDQ0MiBcdTA0M0FcdTA0M0VcdTA0M0NcdTA0MzBcdTA0M0RcdTA0MzRcdTA0MzAsIFx1MDQzRlx1MDQzRSBcdTA0MzdcdTA0MzBcdTA0M0ZcdTA0NDNcdTA0NDFcdTA0M0FcdTA0NDMgXHUwNDNBXHUwNDNFXHUwNDQyXHUwNDNFXHUwNDQwXHUwNDNFXHUwNDM5IFx1MDQzRVx1MDQ0Mlx1MDQzQVx1MDQ0MFx1MDQ0Qlx1MDQzMlx1MDQzMFx1MDQzNVx1MDQ0Mlx1MDQ0MVx1MDQ0RiBcdTA0M0VcdTA0M0FcdTA0M0RcdTA0M0UgXHUwNDQxIFx1MDQzMlx1MDQ0Qlx1MDQzMVx1MDQzRVx1MDQ0MFx1MDQzRVx1MDQzQyBcdTA0MzRcdTA0MzJcdTA0NDNcdTA0NDUgXHUwNDM0XHUwNDMwXHUwNDQyOiBcdTA0M0RcdTA0MzBcdTA0NDdcdTA0MzBcdTA0M0JcdTA0MzAgXHUwNDM4IFx1MDQzQVx1MDQzRVx1MDQzRFx1MDQ0Nlx1MDQzMCBcdTA0M0ZcdTA0MzVcdTA0NDBcdTA0MzhcdTA0M0VcdTA0MzRcdTA0MzAsIFx1MDQzOFx1MDQ0NSBcdTA0M0NcdTA0M0VcdTA0MzZcdTA0M0RcdTA0M0UgXHUwNDM3XHUwNDMwXHUwNDNGXHUwNDNFXHUwNDNCXHUwNDNEXHUwNDRGXHUwNDQyXHUwNDRDIFx1MDQzNFx1MDQzNVx1MDQ0NFx1MDQzRVx1MDQzQlx1MDQ0Mlx1MDQzRFx1MDQ0Qlx1MDQzQ1x1MDQzOCBcdTA0MzdcdTA0M0RcdTA0MzBcdTA0NDdcdTA0MzVcdTA0M0RcdTA0MzhcdTA0NEZcdTA0M0NcdTA0Mzg6KFx1MDQ0MVx1MDQzNVx1MDQzM1x1MDQzRVx1MDQzNFx1MDQzRFx1MDQ0Ri0xNCBcdTA0MzRcdTA0M0RcdTA0MzVcdTA0MzksIFx1MDQ0MVx1MDQzNVx1MDQzM1x1MDQzRVx1MDQzNFx1MDQzRFx1MDQ0Rilcblx1MDQ0MFx1MDQzNVx1MDQzN1x1MDQ0M1x1MDQzQlx1MDQ0Q1x1MDQ0Mlx1MDQzMFx1MDQ0Mlx1MDQzRVx1MDQzQyBcdTA0M0FcdTA0M0VcdTA0M0NcdTA0MzBcdTA0M0RcdTA0MzRcdTA0MzAgXHUwNDMxXHUwNDQzXHUwNDM0XHUwNDM1XHUwNDQyIFx1MDQzMlx1MDQ0MVx1MDQ0Mlx1MDQzMFx1MDQzMlx1MDQzQlx1MDQ0Rlx1MDQ0Mlx1MDQ0QyBcdTA0NDJcdTA0MzVcdTA0M0FcdTA0NDFcdTA0NDIgXHUwNDQxXHUwNDNFIFx1MDQ0MVx1MDQzM1x1MDQzNVx1MDQzRFx1MDQzNVx1MDQ0MFx1MDQzOFx1MDQ0MFx1MDQzRVx1MDQzMlx1MDQzMFx1MDQzRFx1MDQzRFx1MDQ0Qlx1MDQzQyBcdTA0M0VcdTA0NDJcdTA0NDdcdTA0MzVcdTA0NDJcdTA0M0VcdTA0M0MgXHUwNDMyIFx1MDQ0Mlx1MDQzNVx1MDQzQVx1MDQ0M1x1MDQ0OVx1MDQzNVx1MDQzNSBcdTA0M0NcdTA0MzVcdTA0NDFcdTA0NDJcdTA0M0VcblxuXHUwNDQyXHUwNDMwXHUwNDNBXHUwNDM2XHUwNDM1IFx1MDQ0MVx1MDQzNFx1MDQzNVx1MDQzQlx1MDQzMFx1MDQ0Mlx1MDQ0QyBcdTA0M0RcdTA0MzBcdTA0MzFcdTA0M0VcdTA0NDAgXHUwNDNDXHUwNDM4XHUwNDNEXHUwNDM4IFx1MDQzQVx1MDQzRVx1MDQzQ1x1MDQzMFx1MDQzRFx1MDQzNCBcdTA0MzRcdTA0M0JcdTA0NEYgXHUwNDQxXHUwNDQyXHUwNDQwXHUwNDNFXHUwNDNBXHUwNDM4IFx1MDQzMiBcdTA0NDRcdTA0M0VcdTA0NDBcdTA0M0NcdTA0MzBcdTA0NDJcdTA0MzUgLSBbMTA6MTBdIDpyZXN0OlxuLSBcdTA0MzRcdTA0M0VcdTA0MzFcdTA0MzBcdTA0MzJcdTA0MzhcdTA0NDJcdTA0NEMgNSBcdTA0M0NcdTA0MzhcdTA0M0RcdTA0NDNcdTA0NDIgXHUwNDNBIFx1MDQzOFx1MDQzRFx1MDQ0Mlx1MDQzNVx1MDQ0MFx1MDQzMlx1MDQzMFx1MDQzQlx1MDQ0M1xuLSBcdTA0MzJcdTA0NEJcdTA0NDdcdTA0MzVcdTA0NDFcdTA0NDJcdTA0NEMgNSBcdTA0M0NcdTA0MzhcdTA0M0RcdTA0NDNcdTA0NDJcbi0gXHUwNDMyXHUwNDQxXHUwNDQyXHUwNDMwXHUwNDMyXHUwNDM4XHUwNDQyXHUwNDRDIFx1MDQzRlx1MDQ0M1x1MDQ0MVx1MDQ0Mlx1MDQ0M1x1MDQ0RSBcdTA0NDFcdTA0NDJcdTA0NDBcdTA0M0VcdTA0M0FcdTA0NDMoXHUwNDQxIFx1MDQzMFx1MDQzMlx1MDQ0Mlx1MDQzRVx1MDQzQVx1MDQzRVx1MDQzQ1x1MDQzRlx1MDQzQlx1MDQzOFx1MDQ0Mlx1MDQzRVx1MDQzQz8pXG4qL1xuYXN5bmMgZnVuY3Rpb24gcHJlcGFyZVJlcG9ydChhcHA6IEFwcCwgc3RhcnQ6IE1vbWVudCwgZmluaXNoOk1vbWVudCwgZGFpbHlQYXRoOnN0cmluZywgb25Db21wbGV0ZTogKGM6IHN0cmluZyk9PnZvaWQpIHtcblx0Ly8gaHR0cHM6Ly9tYXJjdXMuc2UubmV0L29ic2lkaWFuLXBsdWdpbi1kb2NzL2NvbmNlcHRzL3ZhdWx0XG5cdHZhciBmaWxlcyA9IGFwcC52YXVsdC5nZXRGaWxlcygpXG5cdHZhciB0YXJnZXRGaWxlbmFtZXMgPSBnZW5lcmF0ZUZpbGVuYW1lc0luSW50ZXJ2YWwoc3RhcnQsIGZpbmlzaClcblxuXHRsZXQgY29udGVudFByb21pc2VzID0gZmlsZXNcblx0XHRcdFx0XHRcdFx0LmZpbHRlcigodiwgaSwgYXJyKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHYucGFyZW50Lm5hbWUgPT0gZGFpbHlQYXRoICYmIHRhcmdldEZpbGVuYW1lcy5pbmNsdWRlcyh2Lm5hbWUpXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdC5tYXAoKHYsIGksIGFycikgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBhcHAudmF1bHQucmVhZCh2KVxuXHRcdFx0XHRcdFx0XHR9KVxuXG5cdGxldCBjb250ZW50cyA9IGF3YWl0IFByb21pc2UuYWxsKGNvbnRlbnRQcm9taXNlcylcblx0aWYgKGNvbnRlbnRzLmxlbmd0aCA9PSAwKSB7XG5cdFx0bmV3IE5vdGljZShcIk5vIGZpbGVzIHRvIG9wZW4sIGNoZWNrIHNlbGVjdGVkIGludGVydmFsIG9yIHBhdGggdG8gbm90ZXMgaW4gc2V0dGluZ3NcIilcblx0XHRyZXR1cm5cblx0fVxuXG5cdHZhciB0YXNrRHVyYXRpb25zID0gbmV3IE1hcCgpXG5cblx0Y29udGVudHMuZm9yRWFjaCgodiwgaSAsIGFycikgPT4gY2FsY3VsYXRlRHVyYXRpb25zKHRhc2tEdXJhdGlvbnMsIHYpKVxuXG5cdGxldCByZXBvcnQgPSBcIlwiXG5cdHRhc2tEdXJhdGlvbnMuZm9yRWFjaCgodiwgaywgbSkgPT4ge1xuXHRcdGxldCBmb3JtYXR0ZWREdXIgPSBtb21lbnQudXRjKG1vbWVudC5kdXJhdGlvbih2LCBcInNlY29uZHNcIikuYXNNaWxsaXNlY29uZHMoKSkuZm9ybWF0KFwiSFtoXW1tW21dXCIpXG5cdFx0cmVwb3J0ICs9IGAke2t9ID0+ICR7Zm9ybWF0dGVkRHVyfVxcbmBcblx0fSlcblx0XG5cdG9uQ29tcGxldGUocmVwb3J0KVxufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVEdXJhdGlvbnModGFza0R1cmF0aW9uczogTWFwPHN0cmluZywgbnVtYmVyPiwgY29udGVudDogc3RyaW5nKSB7XG5cdGxldCBsaW5lcyA9IGNvbnRlbnQuc3BsaXQoXCJcXG5cIilcblx0dmFyIHByZXZUaW1lXG5cdGZvciAodmFyIGwgb2YgbGluZXMucmV2ZXJzZSgpKSB7XG5cdFx0bGV0IG0gPSBsLm1hdGNoKHRhc2tGb3JtYXRSZWdleHApXG5cdFx0aWYgKG0gPT0gbnVsbCkge1xuXHRcdFx0Y29udGludWVcblx0XHR9XG5cblx0XHRsZXQgdGltZSA9IG1vbWVudChtWzFdLnN1YnN0cmluZygxLCBtWzFdLmxlbmd0aCAtIDEpLCBcIkhIOm1tXCIpXG5cdFx0bGV0IHRhc2tOYW1lID0gbVszXVxuXG5cdFx0aWYgKHByZXZUaW1lID09IG51bGwpIHtcblx0XHRcdHByZXZUaW1lID0gdGltZVxuXHRcdFx0Y29udGludWVcblx0XHR9XG5cdFx0dmFyIGR1ciA9IDBcblx0XHRpZiAodGFza0R1cmF0aW9ucy5oYXModGFza05hbWUpKSB7XG5cdFx0XHRkdXIgPSB0YXNrRHVyYXRpb25zLmdldCh0YXNrTmFtZSlcblx0XHR9XG5cdFx0ZHVyICs9IHByZXZUaW1lLmRpZmYodGltZSwgJ3NlY29uZHMnKVxuXHRcdHRhc2tEdXJhdGlvbnMuc2V0KHRhc2tOYW1lLCBkdXIpXG5cblx0XHRwcmV2VGltZSA9IHRpbWVcblx0fVxufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUZpbGVuYW1lc0luSW50ZXJ2YWwoc3RhcnQ6IE1vbWVudCwgZmluaXNoOiBNb21lbnQpOiBzdHJpbmdbXSB7XG5cdHZhciByZXM6IHN0cmluZ1tdID0gW11cblx0Zm9yIChsZXQgY3VyID0gc3RhcnQ7IGN1ci5mb3JtYXQoXCJZWVlZLU1NLUREXCIpICE9IGZpbmlzaC5mb3JtYXQoXCJZWVlZLU1NLUREXCIpOyBjdXIgPSBjdXIuYWRkKDEsICdkYXknKSkge1xuXHRcdHJlcy5wdXNoKGN1ci5mb3JtYXQoXCJZWVlZLU1NLUREXCIpK1wiLm1kXCIpXG5cdH1cblxuXHRyZXR1cm4gcmVzXG59XG5cbmZ1bmN0aW9uIGNoYW5nZVRhc2tUaW1lVG9EZWx0YSh2YWw6IG1vbWVudC5EdXJhdGlvbklucHV0QXJnMSwgdW5pdDogbW9tZW50LkR1cmF0aW9uSW5wdXRBcmcyLCBsOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRsZXQgbSA9IGwubWF0Y2godGFza0Zvcm1hdFJlZ2V4cClcblx0aWYgKG0gPT0gbnVsbCkge1xuXHRcdG5ldyBOb3RpY2UoXCJnaXZlbiBsaW5lIGhhcyB3cm9uZyBmb3JtYXRcIilcblx0XHRyZXR1cm5cblx0fVxuXHRsZXQgdGltZSA9IG1vbWVudChtWzFdLnN1YnN0cmluZygxLCBtWzFdLmxlbmd0aCAtIDEpLCBcIkhIOm1tXCIpXG5cdHRpbWUgPSB0aW1lLmFkZCh2YWwsIHVuaXQpXG5cdHJldHVybiBgLSBbJHt0aW1lLmZvcm1hdChcIkhIWzpdbW1cIil9XSAke2wuc3Vic3RyaW5nKDEwKX1gXG59Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFDQSxzQkFBb0c7QUFNcEcsSUFBTSxtQkFBK0M7QUFBQSxFQUNwRCxrQkFBa0I7QUFBQTtBQUduQixJQUFNLG1CQUFtQjtBQUV6Qix1Q0FBZ0QsdUJBQU87QUFBQSxFQUdoRCxTQUFTO0FBQUE7QUFDZCxZQUFNLEtBQUs7QUFHWCxXQUFLLGNBQWMsSUFBSSw4QkFBOEIsS0FBSyxLQUFLO0FBRy9ELFdBQUssaUJBQWlCLE9BQU8sWUFBWSxNQUFNLFFBQVEsSUFBSSxnQkFBZ0IsSUFBSSxLQUFLO0FBRXBGLFdBQUssV0FBVztBQUFBLFFBQ2YsSUFBSTtBQUFBLFFBQ0osTUFBTTtBQUFBLFFBQ04sZ0JBQWdCLENBQUMsUUFBZ0IsU0FBdUI7QUFDdkQsY0FBSSwwQkFBMEIsS0FBSyxLQUFLLENBQUMsR0FBVyxNQUFZO0FBQy9ELGlCQUFLLFNBQVM7QUFDZCwwQkFBYyxLQUFLLEtBQUssR0FBRyxHQUFHLEtBQUssU0FBUyxrQkFBa0IsQ0FBQyxTQUFpQjtBQUMvRSxxQkFBTyxhQUFhLE1BQU0sT0FBTztBQUFBO0FBQUEsYUFFaEM7QUFBQTtBQUFBO0FBSUwsV0FBSyxXQUFXO0FBQUEsUUFDZixJQUFJO0FBQUEsUUFDSixNQUFNO0FBQUEs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