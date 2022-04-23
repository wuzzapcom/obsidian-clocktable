import { Moment } from 'moment';
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, Hotkey } from 'obsidian';

interface ObsidianClocktableSettings {
	pathToDailyNotes: string;
}

const DEFAULT_SETTINGS: ObsidianClocktableSettings = {
	pathToDailyNotes: 'daily'
}

const taskFormatRegexp = /- (\[\d\d:\d\d\]) (.+ )?(:.+:)(.*)?/;

export default class ObsidianClocktable extends Plugin {
	settings: ObsidianClocktableSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ObsidianClocktableSettingsTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

		this.addCommand({
			id: 'insert-clocktable-report',
			name: 'Insert clocktable report',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				new EnterReportIntervalsModal(this.app, (s: Moment, f: Moment)=>{
					prepareReport(this.app, s, f, this.settings.pathToDailyNotes, (text: string) => {
						editor.replaceRange(text, editor.getCursor());
					})
				}).open();
			}
		});

		this.addCommand({
			id: 'add-5-minutes',
			name: 'Add 5 minutes to current task',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				let l = editor.getLine(editor.getCursor().line)
				let replacedLine = changeTaskTimeToDelta(5, 'minute', l)
				editor.setLine(editor.getCursor().line, replacedLine)
			},
			hotkeys: [{modifiers: ["Mod", "Shift"], key: "k"}],
		});
		this.addCommand({
			id: 'sub-5-minutes',
			name: 'Sub 5 minutes to current task',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				let l = editor.getLine(editor.getCursor().line)
				let replacedLine = changeTaskTimeToDelta(-5, 'minute', l)
				editor.setLine(editor.getCursor().line, replacedLine)
			},
			hotkeys: [{modifiers: ["Mod", "Shift"], key: "j"}],
		});
		this.addCommand({
			id: 'insert-black-task-line',
			name: 'Insert line with black task',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				let cur = editor.getCursor().line
				editor.setLine(cur,
					editor.getLine(editor.getCursor().line) +
					"\n- [11:30] :ex:"	
				)
			},
			hotkeys: [{modifiers: ["Mod", "Shift"], key: "l"}],
		});
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class EnterReportIntervalsModal extends Modal {
	start: string = moment().format("YYYY-MM-DD");
	finish: string = moment().format("YYYY-MM-DD");
	callback: (s: Moment, f:Moment)=>void;

	constructor(app: App, c: (s: Moment, f:Moment)=>void) {
		super(app);
		this.callback = c;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl("h1", { text: "Obsidian Clocktable" });
		contentEl.createEl("h2", { text: "Report interval(YYYY-MM-DD format)" });

		new Setting(contentEl)
		.setName("start date")
		.addText(text => text
			.setValue(this.start)
			.onChange((value) => {
				this.start = value
		  	})
		);

		// finish interval TextEdit
		new Setting(contentEl)
		.setName("finish date")
		.addText(text => text
			.setValue(this.finish)
			.onChange((value) => {
				this.finish = value
		  	})
		)

		// Submit button
		new Setting(contentEl)
		.addButton((btn) =>
		  btn
			.setButtonText("Submit")
			.setCta()
			.onClick(() => {
				let start = this.parseDate(this.start)
				let finish = this.parseDate(this.finish)
				if (start == null || finish == null) { return }
				if (start.isAfter(finish)) {
					this.invalidInputNotice("start should be < finish")
					return
				}
			  	this.close();
			  	this.callback(start, finish)
			}));

	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}

	parseDate(input: string): Moment {
		if (input == null || (input.length != 10 && input[4] != "-" && input[7] != "-")) {
			this.invalidInputNotice(input);
			this.close();
			return null
		} 
		let date = moment(input, "YYYY-MM-DD")
		if (!date.isValid) {
			this.close();
			this.invalidInputNotice(input);
			return null
		}	
		return date
	}

	invalidInputNotice(v: string) {
		new Notice('Invalid value: ' + v);
	}
}

class ObsidianClocktableSettingsTab extends PluginSettingTab {
	plugin: ObsidianClocktable;

	constructor(app: App, plugin: ObsidianClocktable) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Obsidian Clocktable'});

		new Setting(containerEl)
			.setName('Path to daily folder')
			.setDesc('Enter path will be used to find your daily notes with tasks')
			.addText(text => text
				.setPlaceholder('daily')
				.setValue(this.plugin.settings.pathToDailyNotes)
				.onChange(async (value) => {
					this.plugin.settings.pathToDailyNotes = value;
					await this.plugin.saveSettings();
				}));
	}
}

async function prepareReport(app: App, start: Moment, finish:Moment, dailyPath:string, onComplete: (c: string)=>void) {
	// https://marcus.se.net/obsidian-plugin-docs/concepts/vault
	var files = app.vault.getFiles()
	var targetFilenames = generateFilenamesInInterval(start, finish)

	let contentPromises = files
							.filter((v, i, arr) => {
								return v.parent.name == dailyPath && targetFilenames.includes(v.name)
							})
							.map((v, i, arr) => {
								return app.vault.read(v)
							})

	let contents = await Promise.all(contentPromises)
	if (contents.length == 0) {
		new Notice("No files to open, check selected interval or path to notes in settings")
		return
	}

	var taskDurations = new Map()

	contents.forEach((v, i , arr) => calculateDurations(taskDurations, v))

	let report = ""
	taskDurations.forEach((v, k, m) => {
		report += `${k} => ${moment.duration(v, "seconds").toISOString().substring(2)}\n`
	})
	
	onComplete(report)
}

function calculateDurations(taskDurations: Map<string, number>, content: string) {
	let lines = content.split("\n")
	var prevTime
	for (var l of lines.reverse()) {
		let m = l.match(taskFormatRegexp)
		if (m == null) {
			if (l.startsWith("- [") && l.contains(":")) {
				new Notice(`Line not matched regexp but seems similar to format, please check for typos: "${l}"`)
			}
			continue
		}

		let time = moment(m[1].substring(1, m[1].length - 1), "HH:mm")
		let taskName = m[3]

		if (prevTime == null) {
			prevTime = time
			continue
		}
		var dur = 0
		if (taskDurations.has(taskName)) {
			dur = taskDurations.get(taskName)
		}
		dur += prevTime.diff(time, 'seconds')
		taskDurations.set(taskName, dur)

		prevTime = time
	}
}

function generateFilenamesInInterval(start: Moment, finish: Moment): string[] {
	var res: string[] = []
	let formatFilename = (m: Moment): string => {return m.format("YYYY-MM-DD")+".md"}

	for (let cur = start; cur.format("YYYY-MM-DD") != finish.format("YYYY-MM-DD"); cur = cur.add(1, 'day')) {
		res.push(formatFilename(cur))
	}
	res.push(formatFilename(finish))

	return res
}

function changeTaskTimeToDelta(val: moment.DurationInputArg1, unit: moment.DurationInputArg2, l: string): string {
	let m = l.match(taskFormatRegexp)
	if (m == null) {
		new Notice("given line has wrong format")
		return
	}
	let time = moment(m[1].substring(1, m[1].length - 1), "HH:mm")
	time = time.add(val, unit)
	return `- [${time.format("HH[:]mm")}] ${l.substring(10)}`
}