'use strict'
// Practice test app: start page, timed test, grading, results and review. Everything is stored in
// localStorage, so a refresh keeps an attempt in progress and past attempts stay reviewable.

// The first five make up the full assessment (in its order); the last three are extra practice sections
const SECTIONS = [
  { key: 'sqlint', name: 'SQL (Intermediate)', count: 1, kind: 'Write a query', test: true },
  { key: 'stats', name: 'Statistics', count: 4, kind: 'Multiple choice', test: true },
  { key: 'sqlbasic', name: 'SQL (Basic)', count: 3, kind: 'Multiple choice', test: true },
  { key: 'python', name: 'Python (Basic)', count: 1, kind: 'Write code', test: true },
  { key: 'math', name: 'Applied Math', count: 5, kind: 'Multiple choice', test: true },
  { key: 'algo', name: 'Python (Problem Solving)', count: 0, kind: 'Write code', test: false },
  { key: 'pandas', name: 'pandas', count: 0, kind: 'Write code', test: false },
  { key: 'ml', name: 'Machine Learning', count: 0, kind: 'Multiple choice', test: false },
]
const SECTION = Object.fromEntries(SECTIONS.map((s) => [s.key, s]))
const TEST_SECTIONS = SECTIONS.filter((s) => s.test)
const DURATION_MS = 75 * 60 * 1000
// Timed tests for one subject, like HackerRank's skill tests: which sections, how many of each, how long
const SKILL_TESTS = [
  { key: 'sql', name: 'SQL', plan: [{ key: 'sqlint', count: 2 }, { key: 'sqlbasic', count: 6 }], minutes: 45 },
  { key: 'python', name: 'Python', plan: [{ key: 'python', count: 1 }, { key: 'algo', count: 1 }], minutes: 45 },
  { key: 'stats', name: 'Statistics', plan: [{ key: 'stats', count: 10 }], minutes: 25 },
  { key: 'math', name: 'Applied Math', plan: [{ key: 'math', count: 10 }], minutes: 25 },
  { key: 'algo', name: 'Problem Solving', plan: [{ key: 'algo', count: 2 }], minutes: 45 },
  { key: 'pandas', name: 'pandas', plan: [{ key: 'pandas', count: 2 }], minutes: 30 },
  { key: 'ml', name: 'Machine Learning', plan: [{ key: 'ml', count: 10 }], minutes: 20 },
]
const SKILL = Object.fromEntries(SKILL_TESTS.map((t) => [t.key, t]))
const durationOf = (a) => a?.durationMs ?? DURATION_MS
const CODE_POINTS = 5
const MCQ_POINTS = 1
const KEYS = { attempt: 'dsp.attempt', seen: 'dsp.seen', history: 'dsp.history', theme: 'dsp.theme' }
const HISTORY_LIMIT = 30

const BANK = window.BANK || []
const QUESTIONS = new Map(BANK.map((q) => [q.id, q]))
// Templates that generate fresh multiple choice questions (generators.js)
const TEMPLATES = window.GENERATORS?.templates || []

// Generated questions live inside the attempt that used them; make them findable like bank questions
function registerExtras(attempt) {
  for (const q of Object.values(attempt?.extra || {})) QUESTIONS.set(q.id, q)
}

const app = document.getElementById('app')
const dialog = document.getElementById('dialog')

// ---------- Small helpers ----------

const text = (v) => (Array.isArray(v) ? v.join('\n') : v ?? '')
const isCode = (q) => q.type === 'sql' || q.type === 'python'
const maxPoints = (q) => (isCode(q) ? CODE_POINTS : MCQ_POINTS)
const $ = (sel) => app.querySelector(sel)

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

function load(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key))
    return v ?? fallback
  } catch {
    return fallback
  }
}
function save(key, value) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be full or blocked; the test still works, it just won't survive a refresh
  }
}

function clock(ms) {
  const total = Math.max(0, Math.round(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = String(m).padStart(h ? 2 : 1, '0')
  return `${h ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`
}
const fmtPoints = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1))
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// A small Markdown subset for question text: paragraphs, - lists, | tables, ```code```, `code`, **bold**
function inline(s) {
  // Code spans first, so ** or * inside code is never read as formatting
  return String(s ?? '').split(/(`[^`]+`)/g)
    .map((part, i) => (i % 2 ? `<code>${esc(part.slice(1, -1))}</code>` : esc(part).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')))
    .join('')
}
function tableHtml(ls) {
  const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
  const [head, ...rows] = ls.filter((l) => !/^\s*\|[\s:|-]+\|\s*$/.test(l))
  return `<div class="table-wrap"><table class="data md"><thead><tr>${cells(head).map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${
    rows.map((r) => `<tr>${cells(r).map((c) => (c === 'NULL' ? '<td class="null">NULL</td>' : `<td>${inline(c)}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`
}
// Within a block, runs of "- " lines become a list, runs of "|" lines a table, and other lines a paragraph
function blocks(s) {
  const out = []
  for (const block of s.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)) {
    let run = []
    let kind = null
    const flush = () => {
      if (!run.length) return
      if (kind === 'list') out.push(`<ul>${run.map((l) => `<li>${inline(l.replace(/^\s*[-*] /, ''))}</li>`).join('')}</ul>`)
      else if (kind === 'table') out.push(tableHtml(run))
      else out.push(`<p>${run.map(inline).join('<br>')}</p>`)
      run = []
    }
    for (const line of block.split('\n')) {
      const k = /^\s*[-*] /.test(line) ? 'list' : line.trim().startsWith('|') ? 'table' : 'text'
      if (k !== kind) flush()
      kind = k
      run.push(line)
    }
    flush()
  }
  return out.join('')
}
function md(src) {
  return text(src).split(/```[a-z]*\n?([\s\S]*?)```/g)
    .map((part, i) => (i % 2 ? `<pre><code>${esc(part.replace(/\n$/, ''))}</code></pre>` : blocks(part)))
    .join('')
}

function dataTable(columns, rows, types) {
  const cell = (v) => (v === null || v === undefined ? '<td class="null">NULL</td>' : `<td>${esc(typeof v === 'number' ? +v.toFixed(4) : v)}</td>`)
  return `<div class="table-wrap"><table class="data"><thead><tr>${columns.map((c, i) => `<th>${esc(c)}${types ? `<small>${esc(types[i])}</small>` : ''}</th>`).join('')}</tr></thead>
    <tbody>${rows.length ? rows.map((r) => `<tr>${r.map(cell).join('')}</tr>`).join('') : `<tr><td colspan="${columns.length}" class="null">no rows</td></tr>`}</tbody></table></div>`
}

// ---------- Dialog (instead of the browser's confirm) ----------

function ask({ title, body, confirm = 'OK', cancel = 'Cancel', danger = false }) {
  return new Promise((resolve) => {
    dialog.innerHTML = `<form method="dialog">
      <div class="dialog-body"><h3>${esc(title)}</h3>${body}</div>
      <div class="dialog-actions">
        ${cancel ? `<button class="btn" value="cancel">${esc(cancel)}</button>` : ''}
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" value="ok">${esc(confirm)}</button>
      </div></form>`
    dialog.addEventListener('close', () => resolve(dialog.returnValue === 'ok'), { once: true })
    dialog.returnValue = ''
    dialog.showModal()
    dialog.querySelector('.btn-primary, .btn-danger').focus()
  })
}

// ---------- State ----------

const state = {
  view: 'start',
  attempt: null, // the attempt being taken or reviewed
  index: 0, // question shown in test or review
  runs: {}, // latest Run code output per question (not saved)
  grading: false,
  drawerOpen: false, // whether the Test Results drawer is open under the code editor
}

const history = () => load(KEYS.history, [])
function saveAttempt() {
  const a = state.attempt
  if (!a) return
  if (!a.submittedAt) {
    save(KEYS.attempt, a)
    return
  }
  const list = history().filter((h) => h.id !== a.id)
  list.unshift(a)
  save(KEYS.history, list.slice(0, HISTORY_LIMIT))
}

const current = () => QUESTIONS.get(state.attempt.questionIds[state.index])
const answerOf = (q) => state.attempt.answers[q.id]

const isMulti = (q) => q.type === 'multi'
const sameSet = (a, b) => Array.isArray(a) && a.length === b.length && [...a].sort().every((x, i) => x === [...b].sort()[i])

function isAnswered(q, a = answerOf(q)) {
  if (isMulti(q)) return Array.isArray(a) && a.length > 0
  if (!isCode(q)) return Number.isInteger(a)
  return typeof a === 'string' && a.trim() !== '' && a.trim() !== text(q.starter).trim()
}

function sectionOf(q) {
  return SECTION[q.section]
}

// Full tests are timed; drills and missed-question retries are untimed practice
const MODES = { test: 'Full test', skill: 'Skill test', drill: 'Section drill', topic: 'Topic practice', missed: 'Missed questions' }
const DRILL_MCQ = 10
const DRILL_CODE = 3
const isTimed = (a) => ['test', 'skill'].includes(a?.mode ?? 'test')

// Prefer the questions seen least; break ties randomly. plan is a list of {key, count}.
// Each template counts as one item in the pool; when it's picked it makes a brand new question.
function draw(plan) {
  const seen = load(KEYS.seen, {})
  const ids = []
  const extra = {}
  const usedPrompts = new Set()
  for (const sec of plan) {
    const pool = [
      ...BANK.filter((q) => q.section === sec.key && (!sec.topic || q.topic === sec.topic)).map((q) => ({ key: q.id })),
      ...TEMPLATES.filter((t) => t.section === sec.key && (!sec.topic || t.topic === sec.topic)).map((t) => ({ key: `tpl:${t.key}`, template: t })),
    ]
    const picked = shuffle(pool).sort((a, b) => (seen[a.key] || 0) - (seen[b.key] || 0)).slice(0, sec.count)
    // A topic with generators never runs out: keep building fresh questions until the drill is full
    const gens = pool.filter((x) => x.template)
    for (let k = 0; sec.topic && picked.length < sec.count && gens.length; k++) picked.push(gens[k % gens.length])
    for (const item of shuffle(picked)) {
      seen[item.key] = (seen[item.key] || 0) + 1
      if (!item.template) {
        ids.push(item.key)
        continue
      }
      // Retry a few times so one drill doesn't show the same generated numbers twice
      let q = GENERATORS.build(item.template)
      for (let tries = 0; tries < 8 && usedPrompts.has(JSON.stringify(q.prompt)); tries++) q = GENERATORS.build(item.template)
      usedPrompts.add(JSON.stringify(q.prompt))
      extra[q.id] = q
      QUESTIONS.set(q.id, q)
      ids.push(q.id)
    }
  }
  save(KEYS.seen, seen)
  return { ids, extra }
}

// Questions whose most recent result, in any past attempt, was not full marks
function missedIds() {
  const latest = new Map()
  for (const a of history()) {
    for (const id of a.questionIds) {
      const q = QUESTIONS.get(id)
      if (q && !latest.has(id)) latest.set(id, pointsFor(a, q) < maxPoints(q))
    }
  }
  const order = (id) => SECTIONS.findIndex((s) => s.key === QUESTIONS.get(id).section)
  return [...latest].filter(([, missed]) => missed).map(([id]) => id).sort((a, b) => order(a) - order(b))
}

// mode: test (full assessment), skill (timed one-subject test), drill (one section), topic (one topic), missed
function startAttempt(mode = 'test', section = null, topic = null) {
  let drawn
  let durationMs = DURATION_MS
  const drillCount = (key) => (SECTION[key].kind === 'Multiple choice' ? DRILL_MCQ : DRILL_CODE)
  if (mode === 'drill') drawn = draw([{ key: section, count: drillCount(section) }])
  else if (mode === 'topic') drawn = draw([{ key: section, topic, count: drillCount(section) }])
  else if (mode === 'skill') {
    drawn = draw(SKILL[section].plan)
    durationMs = SKILL[section].minutes * 60 * 1000
  } else if (mode === 'missed') {
    const ids = missedIds().slice(0, 14)
    drawn = { ids, extra: Object.fromEntries(ids.filter((id) => QUESTIONS.get(id)?.generated).map((id) => [id, QUESTIONS.get(id)])) }
  } else drawn = draw(TEST_SECTIONS)
  if (!drawn.ids.length) return
  state.attempt = { id: Date.now().toString(36), mode, section, topic, durationMs, startedAt: Date.now(), questionIds: drawn.ids, extra: drawn.extra, answers: {}, selfMarks: {} }
  state.index = 0
  state.runs = {}
  state.view = 'test'
  saveAttempt()
  warmUp()
  render()
}

function warmUp() {
  Runner.loadSql().catch(() => {})
  if (state.attempt.questionIds.some((id) => QUESTIONS.get(id)?.type === 'python')) Runner.warmPython()?.catch(() => {})
}

// ---------- Scoring ----------

function pointsFor(attempt, q) {
  const self = attempt.selfMarks?.[q.id]
  if (self !== undefined && self !== null) return self
  return attempt.results?.[q.id]?.points ?? 0
}

function totals(attempt) {
  const bySection = Object.fromEntries(SECTIONS.map((s) => [s.key, { score: 0, max: 0 }]))
  let score = 0
  let max = 0
  for (const id of attempt.questionIds) {
    const q = QUESTIONS.get(id)
    if (!q) continue
    const p = pointsFor(attempt, q)
    score += p
    max += maxPoints(q)
    bySection[q.section].score += p
    bySection[q.section].max += maxPoints(q)
  }
  return { score, max, bySection }
}

function withTimeout(promise, ms, message) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))])
}

async function grade(attempt) {
  const results = {}
  for (const id of attempt.questionIds) {
    const q = QUESTIONS.get(id)
    const a = attempt.answers[id]
    if (isMulti(q)) {
      const right = isAnswered(q, a) && sameSet(a, q.answers)
      results[id] = !isAnswered(q, a) ? { points: 0, status: 'unanswered' } : { points: right ? MCQ_POINTS : 0, status: right ? 'correct' : 'wrong' }
      continue
    }
    if (!isCode(q)) {
      results[id] = !Number.isInteger(a)
        ? { points: 0, status: 'unanswered' }
        : { points: a === q.answer ? MCQ_POINTS : 0, status: a === q.answer ? 'correct' : 'wrong' }
      continue
    }
    if (!isAnswered(q, a)) {
      results[id] = { points: 0, status: 'unanswered', detail: 'No code written.' }
      continue
    }
    try {
      if (q.type === 'sql') {
        const r = await Runner.runSql(q, a)
        results[id] = { points: r.pass ? CODE_POINTS : 0, status: r.pass ? 'correct' : 'wrong', detail: r.error ? `Error: ${r.error}` : r.reason }
      } else {
        const r = await withTimeout(Runner.runPython(q, a), 60000, 'Python took too long to load')
        const passed = r.tests.filter((t) => t.pass).length
        const points = Math.round((CODE_POINTS * passed * 10) / r.tests.length) / 10
        results[id] = {
          points,
          status: passed === r.tests.length ? 'correct' : passed ? 'partial' : 'wrong',
          detail: r.error ? `Your code raised ${r.error}` : `${passed} of ${r.tests.length} sample tests passed.`,
        }
      }
    } catch (e) {
      results[id] = { points: 0, status: 'ungraded', detail: `Could not grade automatically (${e.message}). Mark yourself in review.` }
    }
  }
  return results
}

async function submit(auto = false) {
  const a = state.attempt
  if (!a || a.submittedAt || state.grading) return
  state.grading = true
  if (a.pausedAt) {
    a.pausedTotal = (a.pausedTotal || 0) + (Date.now() - a.pausedAt)
    delete a.pausedAt
  }
  a.submittedAt = isTimed(a) ? Math.min(Date.now(), a.startedAt + durationOf(a) + (a.pausedTotal || 0)) : Date.now()
  a.autoSubmitted = auto
  save(KEYS.attempt, null)
  state.view = 'grading'
  render()
  a.results = await grade(a)
  state.grading = false
  saveAttempt()
  state.view = 'results'
  render()
}

// ---------- Timer ----------

// Paused time doesn't count: the clock is frozen at pausedAt, and earlier pauses add to pausedTotal
function remaining() {
  const a = state.attempt
  if (!a) return DURATION_MS
  const now = a.pausedAt ?? Date.now()
  return a.startedAt + durationOf(a) + (a.pausedTotal || 0) - now
}
const isPaused = () => Boolean(state.attempt?.pausedAt && !state.attempt.submittedAt)
function timeUsed(a) {
  const used = a.submittedAt - a.startedAt - (a.pausedTotal || 0)
  return isTimed(a) ? Math.min(used, durationOf(a)) : used
}

function pause() {
  const a = state.attempt
  if (!a || a.submittedAt || a.pausedAt || !isTimed(a)) return
  a.pausedAt = Date.now()
  saveAttempt()
  render()
}
function resume() {
  const a = state.attempt
  if (!a?.pausedAt) return
  a.pausedTotal = (a.pausedTotal || 0) + (Date.now() - a.pausedAt)
  delete a.pausedAt
  saveAttempt()
  render()
}
setInterval(() => {
  if (state.view !== 'test' || !state.attempt || state.attempt.submittedAt || !isTimed(state.attempt) || isPaused()) return
  const left = remaining()
  const el = document.getElementById('timer')
  if (el) {
    el.querySelector('.time').textContent = hrClock(left)
    el.classList.toggle('low', left < 5 * 60 * 1000)
  }
  if (left <= 0) submit(true)
}, 1000)

// ---------- Theme ----------

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  save(KEYS.theme, next)
  const btn = document.getElementById('theme')
  if (btn) btn.innerHTML = themeIcon()
}
const themeIcon = () => (document.documentElement.dataset.theme === 'dark' ? '☀' : '☾')
const themeButton = () => `<button class="icon-btn" id="theme" title="Switch light or dark mode" aria-label="Switch light or dark mode">${themeIcon()}</button>`

// ---------- Views ----------

function render() {
  const view = { start: renderStart, test: renderTest, grading: renderGrading, results: renderResults, review: renderTest }[state.view]
  view()
  const themeBtn = document.getElementById('theme')
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme)
}

function renderStart() {
  const past = history()
  const missed = missedIds()
  const bankCounts = Object.fromEntries(SECTIONS.map((s) => {
    const written = BANK.filter((q) => q.section === s.key).length
    const templates = TEMPLATES.filter((t) => t.section === s.key).length
    return [s.key, templates ? `${written} + ${templates} generators` : String(written)]
  }))
  app.innerHTML = `
    <header class="topbar"><div class="brand">DS <span>Practice</span> <small>· Data Science Intern assessment</small></div><div class="spacer"></div>${themeButton()}</header>
    <main class="page">
      <section class="card">
        <h1>Practice test</h1>
        <p class="lede">A timed simulation of the HackerRank screen: 14 questions in 75 minutes. No calculator: every number works out with pen and paper.</p>
        <table class="plain">
          <thead><tr><th>#</th><th>Section</th><th>Format</th><th class="num">Questions</th><th class="num">Points each</th><th class="num">In bank</th></tr></thead>
          <tbody>${TEST_SECTIONS.map((s, i) => `<tr><td>${i + 1}</td><td>${esc(s.name)}</td><td>${s.kind}</td><td class="num">${s.count}</td>
            <td class="num">${s.kind === 'Multiple choice' ? MCQ_POINTS : CODE_POINTS}</td><td class="num">${bankCounts[s.key]}</td></tr>`).join('')}</tbody>
        </table>
        <ul class="rules">
          <li>One timer for the whole test. It submits on its own when time runs out.</li>
          <li>Move between questions freely with the numbers on the left. Answers save as you go, so a refresh won't lose them.</li>
          <li>Coding questions have <strong>Run code</strong> (or Ctrl/Cmd + Enter) to check your answer against the sample data.</li>
          <li>Total: 22 points. Each coding question is worth 5, each multiple choice 1.</li>
          <li>Every section mixes written questions with generators that build a fresh question (new numbers, new tables, new test cases) every time, so practice never runs out.</li>
          <li>Some multiple choice questions say <strong>Pick ONE or MORE options</strong>. Those are all or nothing: you need exactly the right set.</li>
        </ul>
        <div class="actions"><button class="btn btn-primary btn-lg" id="start">Start test</button></div>
      </section>
      <section class="card">
        <h2>Skill tests</h2>
        <p class="lede">Timed tests on one subject, like HackerRank's skill tests. Use them to check a subject on its own before a full test.</p>
        <table class="plain"><thead><tr><th>Test</th><th>Questions</th><th class="num">Time</th><th></th></tr></thead>
        <tbody>${SKILL_TESTS.map((t) => `<tr><td>${esc(t.name)}</td><td>${esc(t.plan.map((x) => `${x.count} ${SECTION[x.key].name} ${SECTION[x.key].kind === 'Multiple choice' ? 'multiple choice' : 'coding'}`).join(' + '))}</td>
          <td class="num">${t.minutes} min</td><td class="num"><button class="btn" data-skill="${t.key}">Start</button></td></tr>`).join('')}</tbody></table>
      </section>
      <section class="card">
        <h2>Practice by topic</h2>
        <p class="lede">Untimed, with hints. Pick one topic, like window functions or the Poisson distribution, and get only that.</p>
        <div class="actions"><select id="topic-pick" class="topic-pick" aria-label="Topic">${topicOptions()}</select>
          <button class="btn btn-primary" id="topic-go">Practice this topic</button></div>
      </section>
      <section class="card">
        <h2>Untimed practice</h2>
        <p class="lede">Drill one section (${DRILL_MCQ} multiple choice questions, or ${DRILL_CODE} coding questions) with hints available, or retry every question you've missed before.</p>
        <div class="actions">${SECTIONS.map((s) => `<button class="btn" data-drill="${s.key}">${esc(s.name)}</button>`).join('')}</div>
        <div class="actions" style="margin-top:0.75rem"><button class="btn" id="missed"${missed.length ? '' : ' disabled'}>Retry missed questions (${missed.length})</button></div>
      </section>
      ${weakAreasHtml(past)}
      ${past.length ? `<section class="card"><h2>Past attempts</h2>
        <table class="plain"><thead><tr><th>Date</th><th>Type</th><th class="num">Score</th><th class="num">Time used</th><th></th></tr></thead>
        <tbody>${past.map((a) => {
          const t = totals(a)
          return `<tr class="clickable" data-attempt="${esc(a.id)}"><td>${new Date(a.startedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td>
            <td>${esc(attemptLabel(a))}</td><td class="num">${fmtPoints(t.score)} / ${t.max}</td><td class="num">${clock(timeUsed(a))}</td><td class="num"><button class="btn-link">Review</button></td></tr>`
        }).join('')}</tbody></table></section>` : ''}
    </main>`
  $('#start').addEventListener('click', () => startAttempt('test'))
  app.querySelectorAll('[data-drill]').forEach((b) => b.addEventListener('click', () => startAttempt('drill', b.dataset.drill)))
  $('#missed')?.addEventListener('click', () => startAttempt('missed'))
  app.querySelectorAll('[data-skill]').forEach((b) => b.addEventListener('click', () => startAttempt('skill', b.dataset.skill)))
  $('#topic-go').addEventListener('click', () => {
    const [section, topic] = JSON.parse($('#topic-pick').value)
    startAttempt('topic', section, topic)
  })
  app.querySelectorAll('[data-attempt]').forEach((row) => row.addEventListener('click', () => {
    state.attempt = past.find((a) => a.id === row.dataset.attempt)
    state.runs = {}
    state.view = 'results'
    render()
  }))
}

// "Skill test: SQL", "Topic practice: Poisson distribution", ...
function attemptLabel(a) {
  const mode = a.mode ?? 'test'
  if (mode === 'skill') return `${MODES.skill}: ${SKILL[a.section]?.name ?? a.section}`
  if (mode === 'topic') return `${MODES.topic}: ${a.topic}`
  return `${MODES[mode]}${a.section ? `: ${SECTION[a.section].name}` : ''}`
}

// Every topic with at least one question, grouped by section, for the topic picker
function topicOptions() {
  return SECTIONS.map((s) => {
    const counts = new Map()
    for (const q of BANK) if (q.section === s.key) counts.set(q.topic, (counts.get(q.topic) || 0) + 1)
    for (const t of TEMPLATES) if (t.section === s.key && t.topic) counts.set(t.topic, (counts.get(t.topic) || 0) + 1)
    const topics = [...counts].sort((a, b) => a[0].localeCompare(b[0]))
    if (!topics.length) return ''
    return `<optgroup label="${esc(s.name)}">${topics.map(([t, n]) => `<option value="${esc(JSON.stringify([s.key, t]))}">${esc(t)} (${n}${TEMPLATES.some((x) => x.section === s.key && x.topic === t) ? '+' : ''})</option>`).join('')}</optgroup>`
  }).join('')
}

// Accuracy by section and by topic across every past attempt, weakest first
function weakAreasHtml(past) {
  if (!past.length) return ''
  const sections = Object.fromEntries(SECTIONS.map((s) => [s.key, { score: 0, max: 0 }]))
  const topics = new Map()
  for (const a of past) {
    for (const id of a.questionIds) {
      const q = QUESTIONS.get(id)
      if (!q) continue
      const p = pointsFor(a, q)
      sections[q.section].score += p
      sections[q.section].max += maxPoints(q)
      const t = topics.get(q.topic) ?? { section: q.section, score: 0, max: 0, seen: 0 }
      t.score += p
      t.max += maxPoints(q)
      t.seen++
      topics.set(q.topic, t)
    }
  }
  const weak = [...topics].filter(([, t]) => t.score < t.max).sort((x, y) => x[1].score / x[1].max - y[1].score / y[1].max).slice(0, 6)
  return `<section class="card"><h2>Weak areas</h2>
    <p class="lede">From ${plural(past.length, 'past attempt')}. Your share of points by section, and the topics you've missed most.</p>
    <table class="plain"><thead><tr><th>Section</th><th class="num">Points</th><th style="width:40%"></th><th></th></tr></thead><tbody>${SECTIONS.filter((s) => s.test || sections[s.key].max).map((s) => {
      const b = sections[s.key]
      const pct = b.max ? Math.round((100 * b.score) / b.max) : null
      return `<tr><td>${esc(s.name)}</td><td class="num">${pct === null ? 'not tried' : `${pct}%`}</td>
        <td><div class="bar-track"><div class="bar-fill" style="width:${pct ?? 0}%"></div></div></td>
        <td class="num"><button class="btn-link" data-drill="${s.key}">Drill</button></td></tr>`
    }).join('')}</tbody></table>
    ${weak.length ? `<h2 style="margin-top:1.4rem">Topics to work on</h2><table class="plain"><thead><tr><th>Topic</th><th>Section</th><th class="num">Points</th></tr></thead><tbody>${
      weak.map(([topic, t]) => `<tr><td>${esc(topic)}</td><td>${esc(SECTION[t.section].name)}</td><td class="num">${fmtPoints(t.score)} / ${t.max}</td></tr>`).join('')}</tbody></table>` : ''}
  </section>`
}

function renderGrading() {
  app.innerHTML = `<header class="topbar"><div class="brand">DS <span>Practice</span></div></header>
    <div class="status"><div><h2>Grading your test…</h2><p>Running your code against the sample data. Python can take a few seconds the first time.</p></div></div>`
}

// HackerRank shows time as "59 min 51 sec"
function hrClock(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(total / 60)} min ${total % 60} sec`
}

const SQL_TYPES = { INTEGER: 'Integer', TEXT: 'String', REAL: 'Float' }

// Question numbers grouped by section (S1, S2, ...), like the HackerRank sidebar
function sidebarHtml(reviewing) {
  let html = ''
  let last = null
  let sectionNo = 0
  const flags = state.attempt.flags || {}
  state.attempt.questionIds.forEach((id, i) => {
    const q = QUESTIONS.get(id)
    if (q.section !== last) {
      sectionNo++
      html += `<span class="sec-label" title="${esc(sectionOf(q).name)}">S${sectionNo}</span>`
      last = q.section
    }
    let cls = ''
    if (reviewing) {
      const p = pointsFor(state.attempt, q)
      cls = p >= maxPoints(q) ? ' right' : p > 0 ? ' partial' : ' wrong'
    } else if (isAnswered(q)) cls = ' answered'
    html += `<button class="qnum${cls}${i === state.index ? ' current' : ''}${flags[id] ? ' flagged' : ''}" data-go="${i}"
      title="Question ${i + 1}: ${esc(sectionOf(q).name)}${flags[id] ? ' (bookmarked)' : ''}" aria-label="Question ${i + 1}">${i + 1}</button>`
  })
  return html
}

function sqlInputFormat(q) {
  return q.tables.map((t) => `<div class="table-wrap"><table class="data hr-format">
      <thead><tr><th colspan="2" class="caption">${esc(t.name.toUpperCase())}</th></tr><tr><th>Name</th><th>Type</th></tr></thead>
      <tbody>${t.columns.map(([name, type]) => `<tr><td>${esc(name)}</td><td>${esc(SQL_TYPES[type] || type)}</td></tr>`).join('')}</tbody></table></div>`).join('')
}

function sqlSampleInput(q) {
  return q.tables.map((t) => `<div class="table-wrap"><table class="data">
      <thead><tr><th colspan="${t.columns.length}" class="caption">${esc(t.name.toUpperCase())}</th></tr>
      <tr>${t.columns.map(([name]) => `<th>${esc(name)}</th>`).join('')}</tr></thead>
      <tbody>${t.rows.map((r) => `<tr>${r.map((v) => (v === null ? '<td class="null">NULL</td>' : `<td>${esc(v)}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`).join('')
}

// Query output as HackerRank prints it: one row per line, values separated by spaces
function rowsText(result) {
  if (!result || !result.rows.length) return ''
  return result.rows.map((r) => r.map((v) => (v === null ? 'NULL' : String(v))).join(' ')).join('\n')
}

function problemHtml(q, reviewing) {
  const sec = sectionOf(q)
  const flagged = state.attempt.flags?.[q.id]
  let extra = ''
  if (q.type === 'sql') {
    extra += `<h4>Input Format</h4>${sqlInputFormat(q)}<h4>Sample Input</h4>${sqlSampleInput(q)}
      <h4>Sample Output</h4><pre class="sample-out" id="expected-sample">Loading…</pre>`
  }
  if (q.type === 'python') {
    const program = q.tests.filter((t) => 'stdin' in t)
    if (program.length) {
      extra += program.slice(0, 2).map((t, i) => `<h4>Sample Input ${i}</h4><pre class="sample-out">${esc(t.stdin.replace(/\n$/, '')) || ' '}</pre>
        <h4>Sample Output ${i}</h4><pre class="sample-out">${esc(t.stdout.replace(/\n$/, '')) || '(no output)'}</pre>`).join('')
    } else {
      extra += `<h4>Sample tests</h4><ul class="sample-tests">${q.tests.map((t) => `<li><strong>${esc(t.name)}</strong>: ${
        t.setup ? `<code>${esc(text(t.setup)).replace(/\n/g, '; ')}</code>, then ` : ''}<code>${esc(t.expr)}</code> ${
        t.raises ? `raises <code>${esc(t.raises)}</code>` : `returns <code>${esc(t.expect)}</code>`}</li>`).join('')}</ul>`
    }
  }
  let review = ''
  if (reviewing) {
    review += `<div class="approach"><h4>How to approach it</h4><ol>${(q.approach || []).map((x) => `<li>${inline(x)}</li>`).join('')}</ol></div>`
    if (isCode(q)) {
      review += `<h4>Reference solution</h4><pre class="solution">${esc(text(q.solution))}</pre>`
      if (q.walkthrough?.length) review += `<div class="approach walkthrough"><h4>Line by line</h4><ol>${q.walkthrough.map((w) => `<li>${inline(w)}</li>`).join('')}</ol></div>`
      if (q.mistakes?.length) review += `<div class="approach mistakes"><h4>Common mistakes</h4><ul>${q.mistakes.map((m) => `<li>${inline(m)}</li>`).join('')}</ul></div>`
    }
  }
  const hintsShown = state.attempt.hints?.[q.id] || 0
  const steps = q.approach || []
  const hints = !reviewing && !isTimed(state.attempt) && steps.length
    ? `<div class="hint-box">${steps.slice(0, hintsShown).map((h, i) => `<p><strong>Hint ${i + 1}.</strong> ${inline(h)}</p>`).join('')}
        ${hintsShown < steps.length ? `<button class="btn btn-quiet hint-btn" id="hint">${hintsShown ? 'Next hint' : 'Show a hint'} (${hintsShown + 1} of ${steps.length})</button>` : ''}</div>`
    : ''
  return `<div class="q-title">
      ${reviewing ? '' : `<button class="bookmark${flagged ? ' on' : ''}" id="flag" aria-pressed="${flagged ? 'true' : 'false'}" title="Bookmark this question to come back to">${flagged ? '★' : '☆'}</button>`}
      <h1>${esc(q.title)}</h1></div>
    <p class="q-meta">${esc(sec.name)} · ${plural(maxPoints(q), 'point')}${q.difficulty ? ` · <span class="diff diff-${q.difficulty.toLowerCase()}">${esc(q.difficulty)}</span>` : ''}${reviewing ? '' : ` · Question ${state.index + 1} of ${state.attempt.questionIds.length}`}</p>
    <div class="problem">${md(q.prompt)}${hints}${extra}${review}</div>`
}

function multiHtml(q, reviewing) {
  const picked = Array.isArray(answerOf(q)) ? answerOf(q) : []
  if (!reviewing) {
    return `<h2 class="pick">Pick ONE or MORE options</h2>
      <div class="options" role="group" aria-label="Answer choices">${q.options.map((o, i) => `
      <label class="option multi${picked.includes(i) ? ' selected' : ''}"><input type="checkbox" name="multi" value="${i}"${picked.includes(i) ? ' checked' : ''}>
      <span class="opt-text">${inline(o)}</span></label>`).join('')}</div>
      <button class="btn-link clear-choice" id="clear"${picked.length ? '' : ' hidden'}>Clear Selection</button>`
  }
  const right = picked.length && sameSet(picked, q.answers)
  const status = !picked.length ? '<span class="tag soft">Not answered</span>' : right ? '<span class="tag ok">You got it</span>' : '<span class="tag bad">Incorrect</span>'
  return `<p class="your-answer">Your answer ${status}<br><small>Multi-select is all or nothing: you need exactly the right set of options.</small></p>
    <div class="options">${q.options.map((o, i) => {
      const should = q.answers.includes(i)
      const chose = picked.includes(i)
      const cls = should ? ' is-correct' : chose ? ' is-wrong-pick' : ''
      const tags = `${should ? '<span class="tag ok">Should be selected</span>' : ''}${chose ? `<span class="tag ${should ? 'soft' : 'bad'}">You selected</span>` : should ? '<span class="tag bad">You missed this</span>' : ''}`
      return `<div class="option multi review${cls}"><input type="checkbox" disabled${chose ? ' checked' : ''}><span class="opt-text">${inline(o)}${tags}</span>
        <div class="why">${inline(q.explanations[i])}</div></div>`
    }).join('')}</div>`
}

function optionsHtml(q, reviewing) {
  if (isMulti(q)) return multiHtml(q, reviewing)
  const picked = answerOf(q)
  if (!reviewing) {
    return `<h2 class="pick">Pick ONE option</h2>
      <div class="options" role="radiogroup" aria-label="Answer choices">${q.options.map((o, i) => `
      <label class="option${picked === i ? ' selected' : ''}"><input type="radio" name="opt" value="${i}"${picked === i ? ' checked' : ''}>
      <span class="opt-text">${inline(o)}</span></label>`).join('')}</div>
      <button class="btn-link clear-choice" id="clear"${Number.isInteger(picked) ? '' : ' hidden'}>Clear Selection</button>`
  }
  const status = !Number.isInteger(picked) ? '<span class="tag soft">Not answered</span>' : picked === q.answer ? '<span class="tag ok">You got it</span>' : '<span class="tag bad">Incorrect</span>'
  return `<p class="your-answer">Your answer ${status}</p><div class="options">${q.options.map((o, i) => {
    const cls = i === q.answer ? ' is-correct' : i === picked ? ' is-wrong-pick' : ''
    const tags = `${i === q.answer ? '<span class="tag ok">Correct answer</span>' : ''}${i === picked && i !== q.answer ? '<span class="tag bad">Your pick</span>' : ''}`
    return `<div class="option review${cls}"><input type="radio" disabled${i === picked ? ' checked' : ''}><span class="opt-text">${inline(o)}${tags}</span>
      <div class="why">${inline(q.explanations[i])}</div></div>`
  }).join('')}</div>`
}

function lineNumbers(code) {
  return Array.from({ length: code.split('\n').length }, (_, i) => i + 1).join('\n')
}

function codeHtml(q, reviewing) {
  const code = typeof answerOf(q) === 'string' ? answerOf(q) : text(q.starter)
  const sql = q.type === 'sql'
  let selfMark = ''
  if (reviewing) {
    const r = state.attempt.results?.[q.id]
    const self = state.attempt.selfMarks?.[q.id]
    selfMark = `<div class="self-mark-box">
      <strong>Automatic grade: ${fmtPoints(r?.points ?? 0)} / ${CODE_POINTS}</strong><span>${esc(r?.detail || '')}</span>
      <div class="self-mark"><span>Mark yourself:</span>
        <button class="btn${self === CODE_POINTS ? ' on' : ''}" data-mark="${CODE_POINTS}">Correct (${CODE_POINTS})</button>
        <button class="btn${self === 0 ? ' on' : ''}" data-mark="0">Incorrect (0)</button>
        <button class="btn${self === undefined || self === null ? ' on' : ''}" data-mark="auto">Use automatic grade</button></div></div>`
  }
  const open = state.drawerOpen && state.runs[q.id]
  return `${selfMark}<div class="code-pane">
      <div class="code-head"><label class="lang-label" for="lang">Language</label>
        <select id="lang" class="lang-select" title="${sql ? 'Runs on SQLite with MySQL date and string functions added' : 'Runs on CPython 3.12 (Pyodide)'}">
          <option>${sql ? 'MySQL' : 'Python 3'}</option></select>
        <span class="spacer"></span><button class="btn-link" id="reset">Reset code</button></div>
      <div class="editor"><pre class="gutter" aria-hidden="true">${lineNumbers(code)}</pre>
        <textarea id="code" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Code editor">${esc(code)}</textarea></div>
      <div class="drawer${open ? ' open' : ''}" id="output">${outputHtml(q)}</div>
      <div class="code-foot">
        <button class="drawer-toggle" id="drawer-toggle" aria-expanded="${open ? 'true' : 'false'}">${open ? '▾' : '▴'} Test Results</button>
        <span class="spacer"></span><span class="hint">Ctrl/Cmd + Enter</span>
        <button class="btn btn-run" id="run">▷ ${sql ? 'Run Query' : 'Run Code'}</button></div></div>`
}

// Turn a failed Python test into a pointer at the likely mistake
function pyCoach(t) {
  const msg = t.message || ''
  if (/IndentationError/.test(msg)) return "Python found a block with no code in it. Replace the stub's \"# Write your code here\" comment with your code, indented under the def line."
  if (/NameError/.test(msg)) return "A name isn't defined: check spelling and capitalization, and that it's defined before it's used."
  if (/AttributeError/.test(msg) && /NoneType/.test(msg)) return 'Something is None where an object was expected. Check that your functions return a value.'
  if (/AttributeError/.test(msg)) return 'An attribute is missing. Set it in __init__ (self.x = ...), and call super().__init__(...) in subclasses that define their own __init__.'
  if (/TypeError/.test(msg) && /NoneType/.test(msg)) return 'A None reached an operation that needs a value. Filter out None first, or make sure your function returns something.'
  if (/nothing was raised/.test(msg)) return 'The test expects an exception. Use raise SomeError(...); returning or printing an error message does not count.'
  if (/got None$/.test(msg)) return "Your function returned None. Add a return statement: printing a value isn't returning it."
  if (!('stdin' in t)) {
    const m = msg.match(/^Expected (.+), got (.+)$/)
    if (m && /^-?\d+\.\d+$/.test(m[1]) && /^-?\d+(\.\d+)?$/.test(m[2]) && Math.abs(+m[1] - +m[2]) < 0.011) return 'Close, but not equal: round the result to 2 decimals with round(x, 2), once, at the end.'
    return ''
  }
  const norm = (x) => (x || '').replace(/\r/g, '').split('\n').map((l) => l.trimEnd()).join('\n').replace(/\n+$/, '')
  const got = norm(t.output)
  const exp = norm(t.expected)
  if (got === exp || /Error/.test(msg)) return ''
  const gl = got ? got.split('\n') : []
  const el = exp ? exp.split('\n') : []
  if (gl.includes('None') && !el.includes('None')) return 'There is an extra None line. That happens when you print() the result of a function that already prints (or returns nothing).'
  if (!got && exp) return "Nothing was output. If the starter writes your function's return value, return it; if it only calls your function, print inside it."
  if (got.toLowerCase() === exp.toLowerCase()) return 'Only the capitalization differs. Print the words exactly as the prompt writes them.'
  if (got.replace(/\s+/g, ' ').trim() === exp.replace(/\s+/g, ' ').trim()) return 'Only the spacing or line breaks differ. Check single spaces between values and one result per line.'
  if ([...gl].sort().join('\n') === [...el].sort().join('\n')) return 'You have the right lines in the wrong order. Check the sort keys and the tie-breaks.'
  const twoDp = (x) => x.replace(/-?\d+(\.\d+)?/g, (n) => (+n).toFixed(2))
  if (twoDp(got) === twoDp(exp)) return "The numbers are right but formatted differently. Use exactly 2 decimals, for example f'{x:.2f}'."
  if (gl.length !== el.length) return `Expected ${el.length} line${el.length === 1 ? '' : 's'} of output, you produced ${gl.length}. Check that you output once per input item, and handle the empty case.`
  return ''
}

// Point at the usual cause of a wrong SQL result
function sqlCoach(r) {
  if (r.pass) return ''
  const err = r.error || ''
  if (/misuse of aggregate|aggregate functions are not allowed/i.test(err)) return 'An aggregate (SUM, COUNT, AVG) is in WHERE. Conditions on aggregates go in HAVING, after GROUP BY.'
  if (/misuse of window function/i.test(err)) return 'Window functions run after WHERE. Compute them in a CTE or subquery, then filter outside it.'
  if (/no such function/i.test(err)) return 'This runs on SQLite. Supported MySQL functions include YEAR, MONTH, DAY, DATE_FORMAT, DATEDIFF, SUBSTRING_INDEX, CONCAT, IFNULL and COALESCE; for others, use CASE or SUBSTR.'
  if (/no such column/i.test(err)) return 'A column name is wrong. Check the spelling, the table alias (c.name vs a.name), and that aliases from SELECT are only used where allowed.'
  if (/ambiguous column/i.test(err)) return 'Two joined tables share that column name. Prefix it with a table alias, like c.customer_id.'
  if (/syntax error/i.test(err)) return 'Check commas between columns, clause order (SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY), and the semicolon at the end.'
  if (!r.got || !r.expected) return ''
  if (/wrong order/i.test(r.reason)) return 'Add every sort key the prompt lists, including the last tie-breaker, with ASC or DESC on each.'
  if (r.got.rows.length > r.expected.rows.length) return 'Too many rows: a JOIN may be duplicating rows, a filter (WHERE or HAVING) may be missing, or you need RANK = 1 instead of every row.'
  if (r.got.rows.length < r.expected.rows.length) return 'Too few rows: a filter may be too strict (> vs >=), an INNER JOIN may need to be a LEFT JOIN, ROW_NUMBER may be dropping ties, or a NULL comparison may be removing rows.'
  if (/Wrong values/i.test(r.reason)) return 'Check integer division (multiply by 1.0), ROUND to 2 decimals, COALESCE for NULLs, and that filters ran before aggregating.'
  return ''
}
const coach = (text) => (text ? `<p class="coach"><strong>Tip:</strong> ${esc(text)}</p>` : '')

function outputHtml(q) {
  const run = state.runs[q.id]
  if (!run) return '<p class="null">Run your code to see results here.</p>'
  if (run.status === 'running') {
    const note = q.type === 'python' && Runner.pythonState() !== 'ready' ? ' The first Python run downloads the interpreter (about 10 MB), so it can take a few seconds.' : ''
    return `<div class="verdict"><span class="badge wait">Running</span><span>Running your code…${note}</span></div>`
  }
  if (run.status === 'error') {
    return `<div class="verdict"><span class="badge fail">Error</span><span>Could not run.</span></div><div class="errbox">${esc(run.message)}</div>`
  }
  const r = run.result
  if (q.type === 'sql') {
    return `<div class="verdict"><span class="badge ${r.pass ? 'pass' : 'fail'}">${r.pass ? 'Accepted' : r.error ? 'Error' : 'Wrong Answer'}</span><span>${esc(r.reason)}</span></div>
      ${r.error ? `<div class="errbox">${esc(r.error)}</div>` : ''}
      ${coach(sqlCoach(r))}
      ${r.got ? `<h4>Your Output (stdout)</h4><pre class="sample-out">${esc(rowsText(r.got)) || '(no rows)'}</pre>` : ''}
      ${r.expected ? `<h4>Expected Output</h4><pre class="sample-out">${esc(rowsText(r.expected))}</pre>` : ''}
      ${r.got ? `<details class="as-table"><summary>Show as tables with column names</summary><h4>Your output</h4>${dataTable(r.got.columns, r.got.rows)}<h4>Expected</h4>${dataTable(r.expected.columns, r.expected.rows)}</details>` : ''}`
  }
  const passed = r.tests.filter((t) => t.pass).length
  const all = passed === r.tests.length
  const head = `<div class="verdict"><span class="badge ${all ? 'pass' : 'fail'}">${all ? 'Accepted' : 'Wrong Answer'}</span><span>${passed}/${r.tests.length} test cases passed.</span></div>
    ${r.error ? `<div class="errbox">Your code has an error:\n${esc(r.error)}</div>${coach(pyCoach({ message: r.error }))}` : ''}`
  if (r.tests.some((t) => 'stdin' in t)) {
    const firstFail = r.tests.findIndex((t) => !t.pass)
    return `${head}${r.tests.map((t, i) => `<details class="case ${t.pass ? 'ok' : 'bad'}"${i === firstFail ? ' open' : ''}>
        <summary><span class="mark">${t.pass ? '✓' : '✗'}</span> Test case ${i}: ${esc(t.name)}</summary>
        ${t.message ? `<p class="t-msg">${esc(t.message)}</p>` : ''}
        ${t.pass ? '' : coach(pyCoach(t))}
        ${'stdin' in t ? `<h4>Input (stdin)</h4><pre class="sample-out">${esc(t.stdin.replace(/\n$/, '')) || ' '}</pre>
          <h4>Your Output (stdout)</h4><pre class="sample-out">${esc((t.output || '').replace(/\n$/, '')) || '(no output)'}</pre>
          <h4>Expected Output</h4><pre class="sample-out">${esc(t.expected.replace(/\n$/, '')) || '(no output)'}</pre>
          ${t.debug ? `<h4>Debug output (printed, not graded)</h4><pre class="sample-out">${esc(t.debug)}</pre>` : ''}` : ''}
      </details>`).join('')}`
  }
  return `${head}<ul class="tests">${r.tests.map((t) => `<li class="${t.pass ? 'ok' : 'bad'}"><span class="mark">${t.pass ? '✓' : '✗'}</span><span class="t-name">${esc(t.name)}</span>
      ${t.pass ? '' : `<span class="t-msg">${esc(t.message)}</span>${coach(pyCoach(t))}`}</li>`).join('')}</ul>
    ${r.stdout ? `<h4>What you printed</h4><pre class="stdout">${esc(r.stdout)}</pre>` : ''}`
}

function renderPaused() {
  const a = state.attempt
  const answered = a.questionIds.filter((id) => isAnswered(QUESTIONS.get(id))).length
  app.innerHTML = `
    <header class="hr-top"><span class="pill">Paused · ${hrClock(remaining())} left</span><span class="spacer"></span>${themeButton()}</header>
    <div class="paused">
      <div class="card paused-card">
        <h1>Test paused</h1>
        <p class="lede">The timer is stopped at <strong>${hrClock(remaining())}</strong> left, and the questions are hidden until you resume.
          You have answered ${answered} of ${a.questionIds.length}. The real HackerRank test can't be paused, so use this sparingly.</p>
        <div class="actions"><button class="btn btn-primary btn-lg" id="resume">Resume test</button></div>
      </div>
    </div>`
  $('#resume').addEventListener('click', resume)
  $('#resume').focus()
}

function renderTest() {
  const reviewing = state.view === 'review'
  const a = state.attempt
  if (!reviewing && isPaused()) return renderPaused()
  const q = current()
  const last = state.index === a.questionIds.length - 1
  const t = reviewing ? totals(a) : null
  const left = remaining()

  const pill = reviewing
    ? `<span class="pill">Score ${fmtPoints(t.score)} / ${t.max}</span>`
    : isTimed(a)
      ? `<span class="pill timer${left < 5 * 60 * 1000 ? ' low' : ''}" id="timer">◷ <span class="time">${hrClock(left)}</span></span>`
      : `<span class="pill">Untimed · ${esc(MODES[a.mode])}</span>`

  app.innerHTML = `
    <header class="hr-top">
      ${pill}
      <span class="spacer"></span>
      ${themeButton()}
      ${reviewing
        ? '<button class="btn" id="to-results">Back to results</button>'
        : `${isTimed(a) ? '<button class="btn btn-quiet" id="pause" title="Practice only: the real test cannot be paused">❚❚ Pause</button>' : ''}
           <button class="btn btn-quiet" id="submit">Submit test</button>
           <button class="btn btn-proceed" id="proceed">${last ? 'Save &amp; Finish' : 'Save &amp; Proceed'}</button>`}
    </header>
    <div class="hr-shell${isCode(q) ? ' is-code' : ''}">
      <nav class="hr-nav" aria-label="Questions">${sidebarHtml(reviewing)}</nav>
      <section class="hr-problem" aria-label="Problem">${problemHtml(q, reviewing)}</section>
      <section class="hr-answer" aria-label="Your answer">${isCode(q) ? codeHtml(q, reviewing) : optionsHtml(q, reviewing)}</section>
    </div>
    ${reviewing ? `<footer class="bottombar review-bar">
        <button class="btn" id="prev"${state.index === 0 ? ' disabled' : ''}>← Previous</button>
        <span class="progress">Question ${state.index + 1} of ${a.questionIds.length}</span><span class="spacer"></span>
        ${last ? '<button class="btn btn-primary" id="to-results-2">Back to results</button>' : '<button class="btn btn-primary" id="next">Next →</button>'}
      </footer>` : '<p class="keys-hint">Keys: number keys pick (or toggle) an option, Enter saves and goes to the next question.</p>'}`

  app.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => go(+b.dataset.go)))
  $('#prev')?.addEventListener('click', () => go(state.index - 1))
  $('#next')?.addEventListener('click', () => go(state.index + 1))
  $('#proceed')?.addEventListener('click', () => (last ? confirmSubmit() : go(state.index + 1)))
  $('#submit')?.addEventListener('click', confirmSubmit)
  $('#pause')?.addEventListener('click', pause)
  for (const id of ['#to-results', '#to-results-2']) $(id)?.addEventListener('click', () => { state.view = 'results'; render() })
  $('#hint')?.addEventListener('click', () => {
    a.hints = a.hints || {}
    a.hints[q.id] = (a.hints[q.id] || 0) + 1
    saveAttempt()
    const keep = $('.hr-problem')?.scrollTop
    render()
    const pane = $('.hr-problem')
    if (pane && keep !== undefined) pane.scrollTop = keep
  })
  $('#flag')?.addEventListener('click', () => {
    a.flags = a.flags || {}
    if (a.flags[q.id]) delete a.flags[q.id]
    else a.flags[q.id] = true
    saveAttempt()
    render()
  })

  if (!isCode(q) && !reviewing) {
    app.querySelectorAll('input[name="opt"]').forEach((input) => input.addEventListener('change', () => choose(q, +input.value)))
    app.querySelectorAll('input[name="multi"]').forEach((input) => input.addEventListener('change', () => toggle(q, +input.value)))
    $('#clear')?.addEventListener('click', () => {
      delete a.answers[q.id]
      saveAttempt()
      render()
    })
  }
  if (isCode(q)) wireEditor(q)
  if (reviewing) {
    app.querySelectorAll('[data-mark]').forEach((b) => b.addEventListener('click', () => {
      const v = b.dataset.mark
      if (v === 'auto') delete a.selfMarks[q.id]
      else a.selfMarks[q.id] = +v
      saveAttempt()
      render()
    }))
  }
  if (q.type === 'sql') showSampleOutput(q)
  app.querySelector('.qnum.current')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

async function showSampleOutput(q) {
  const box = () => document.getElementById('expected-sample')
  try {
    const r = await Runner.expectedSql(q)
    if (box() && current() === q) box().textContent = rowsText(r) || '(no rows)'
  } catch (e) {
    if (box()) box().textContent = `Could not load the SQL engine (${e.message}).`
  }
}

function go(i) {
  if (i < 0 || i >= state.attempt.questionIds.length) return
  state.index = i
  render()
  window.scrollTo(0, 0)
}

function toggle(q, i) {
  const now = Array.isArray(answerOf(q)) ? [...answerOf(q)] : []
  const next = now.includes(i) ? now.filter((x) => x !== i) : [...now, i].sort((x, y) => x - y)
  if (next.length) state.attempt.answers[q.id] = next
  else delete state.attempt.answers[q.id]
  saveAttempt()
  app.querySelectorAll('.option').forEach((el, k) => el.classList.toggle('selected', next.includes(k)))
  app.querySelectorAll('input[name="multi"]').forEach((el, k) => { el.checked = next.includes(k) })
  app.querySelector(`.qnum[data-go="${state.index}"]`)?.classList.toggle('answered', next.length > 0)
  const clear = $('#clear')
  if (clear) clear.hidden = !next.length
}

function choose(q, i) {
  state.attempt.answers[q.id] = i
  saveAttempt()
  app.querySelectorAll('.option').forEach((el, k) => el.classList.toggle('selected', k === i))
  app.querySelector(`.qnum[data-go="${state.index}"]`)?.classList.add('answered')
  const clear = $('#clear')
  if (clear) clear.hidden = false
}

async function confirmSubmit() {
  const a = state.attempt
  const unanswered = a.questionIds.map((id, i) => [QUESTIONS.get(id), i + 1]).filter(([q]) => !isAnswered(q)).map(([, n]) => n)
  const ok = await ask({
    title: 'Submit your test?',
    body: `<p>You have answered ${a.questionIds.length - unanswered.length} of ${a.questionIds.length} questions${isTimed(a) ? ` and have ${clock(remaining())} left` : ''}.</p>
      ${unanswered.length ? `<p>Unanswered: ${unanswered.join(', ')}.</p>` : ''}<p>You can't change answers after submitting.</p>`,
    confirm: 'Submit test',
    cancel: 'Keep working',
  })
  if (ok) submit(false)
}

// ---------- Code editor ----------

function insertText(ta, s) {
  ta.focus()
  if (!document.execCommand('insertText', false, s)) {
    ta.setRangeText(s, ta.selectionStart, ta.selectionEnd, 'end')
    ta.dispatchEvent(new Event('input'))
  }
}

function wireEditor(q) {
  const ta = $('#code')
  const gutter = app.querySelector('.gutter')
  const sync = () => {
    gutter.textContent = lineNumbers(ta.value)
    gutter.scrollTop = ta.scrollTop
  }
  ta.addEventListener('scroll', () => { gutter.scrollTop = ta.scrollTop })
  ta.addEventListener('input', () => {
    sync()
    state.attempt.answers[q.id] = ta.value
    saveAttempt()
    if (state.view === 'test') app.querySelector(`.qnum[data-go="${state.index}"]`)?.classList.toggle('answered', isAnswered(q))
  })
  ta.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      runCode(q)
    } else if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      insertText(ta, '    ')
    } else if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
      // Keep the current indent, and indent one more level after a Python line ending in ":"
      const before = ta.value.slice(0, ta.selectionStart)
      const line = before.slice(before.lastIndexOf('\n') + 1)
      let indent = line.match(/^[ \t]*/)[0]
      if (q.type === 'python' && /:\s*$/.test(line)) indent += '    '
      e.preventDefault()
      insertText(ta, `\n${indent}`)
    }
  })
  $('#run').addEventListener('click', () => runCode(q))
  $('#drawer-toggle').addEventListener('click', () => {
    state.drawerOpen = !document.getElementById('output').classList.contains('open')
    setDrawer(state.drawerOpen)
  })
  $('#reset').addEventListener('click', async () => {
    const ok = await ask({ title: 'Reset your code?', body: '<p>This replaces your code with the starter code.</p>', confirm: 'Reset', danger: true })
    if (!ok) return
    state.attempt.answers[q.id] = text(q.starter)
    saveAttempt()
    render()
  })
}

async function runCode(q) {
  const ta = $('#code')
  if (!ta) return
  const code = ta.value
  state.runs[q.id] = { status: 'running' }
  showOutput(q)
  try {
    const result = q.type === 'sql' ? await Runner.runSql(q, code) : await Runner.runPython(q, code)
    state.runs[q.id] = { status: 'done', result }
  } catch (e) {
    state.runs[q.id] = { status: 'error', message: e.message }
  }
  if (current() === q) showOutput(q)
}

function setDrawer(open) {
  document.getElementById('output')?.classList.toggle('open', open)
  const toggle = document.getElementById('drawer-toggle')
  if (toggle) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false')
    toggle.textContent = `${open ? '▾' : '▴'} Test Results`
  }
}

function showOutput(q) {
  const box = document.getElementById('output')
  if (!box) return
  box.innerHTML = outputHtml(q)
  state.drawerOpen = true
  setDrawer(true)
}

// ---------- Results ----------

function resultPill(q) {
  const a = state.attempt
  const r = a.results?.[q.id]
  const p = pointsFor(a, q)
  const max = maxPoints(q)
  if (r?.status === 'unanswered' && a.selfMarks?.[q.id] === undefined) return '<span class="result-pill none">Not answered</span>'
  if (r?.status === 'ungraded' && a.selfMarks?.[q.id] === undefined) return '<span class="result-pill part">Mark yourself</span>'
  if (p >= max) return '<span class="result-pill ok">Correct</span>'
  if (p > 0) return '<span class="result-pill part">Partly correct</span>'
  return '<span class="result-pill bad">Incorrect</span>'
}

function renderResults() {
  const a = state.attempt
  const t = totals(a)
  const used = timeUsed(a)
  app.innerHTML = `
    <header class="topbar"><div class="brand">DS <span>Practice</span></div><div class="spacer"></div>${themeButton()}
      <button class="btn" id="home">Home</button></header>
    <main class="page">
      <section class="card">
        <h1>Results${(a.mode ?? 'test') === 'test' ? '' : `: ${esc(attemptLabel(a))}`}</h1>
        <p class="lede">${a.autoSubmitted ? 'Time ran out, so the test was submitted automatically. ' : ''}${new Date(a.startedAt).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>
        <div class="score-row">
          <div><div class="stat-label">Score</div><div class="score-big">${fmtPoints(t.score)} <span style="font-size:1.2rem;color:var(--text-soft)">/ ${t.max}</span></div></div>
          <div><div class="stat-label">Percent</div><div class="stat-value">${Math.round((100 * t.score) / t.max)}%</div></div>
          <div><div class="stat-label">Time used</div><div class="stat-value">${clock(used)}${isTimed(a) ? ` <span style="font-size:0.9rem;color:var(--text-soft)">of ${clock(durationOf(a))}</span>` : ''}</div></div>
        </div>
        <div class="actions"><button class="btn btn-primary" id="new">Start a new test</button><button class="btn" id="review">Review answers</button>
          ${['drill', 'topic', 'skill'].includes(a.mode) ? `<button class="btn" id="again">${a.mode === 'skill' ? 'Take this skill test again' : 'Practice this again'}</button>` : ''}</div>
      </section>
      <section class="card">
        <h2>By section</h2>
        <table class="plain"><thead><tr><th>Section</th><th class="num">Score</th><th style="width:40%"></th></tr></thead>
        <tbody>${SECTIONS.filter((s) => t.bySection[s.key].max).map((s) => {
          const b = t.bySection[s.key]
          return `<tr><td>${esc(s.name)}</td><td class="num">${fmtPoints(b.score)} / ${b.max}</td>
            <td><div class="bar-track"><div class="bar-fill" style="width:${b.max ? (100 * b.score) / b.max : 0}%"></div></div></td></tr>`
        }).join('')}</tbody></table>
      </section>
      <section class="card">
        <h2>Every question</h2>
        <p class="lede">Click a question to see the correct answer, how to approach it, and why each wrong option is wrong.</p>
        <table class="plain"><thead><tr><th>#</th><th>Section</th><th>Question</th><th>Result</th><th class="num">Points</th></tr></thead>
        <tbody>${a.questionIds.map((id, i) => {
          const q = QUESTIONS.get(id)
          if (!q) return ''
          return `<tr class="clickable" data-review="${i}"><td>${i + 1}</td><td>${esc(sectionOf(q).name)}</td><td>${esc(q.title)}</td><td>${resultPill(q)}</td>
            <td class="num">${fmtPoints(pointsFor(a, q))} / ${maxPoints(q)}</td></tr>`
        }).join('')}</tbody></table>
      </section>
    </main>`
  $('#home').addEventListener('click', () => { state.view = 'start'; render() })
  $('#new').addEventListener('click', () => startAttempt('test'))
  $('#again')?.addEventListener('click', () => startAttempt(a.mode, a.section, a.topic))
  $('#review').addEventListener('click', () => openReview(0))
  app.querySelectorAll('[data-review]').forEach((row) => row.addEventListener('click', () => openReview(+row.dataset.review)))
}

function openReview(i) {
  state.index = i
  state.view = 'review'
  render()
  window.scrollTo(0, 0)
}

// ---------- Global keys ----------

document.addEventListener('keydown', (e) => {
  if ((state.view !== 'test' && state.view !== 'review') || dialog.open || isPaused()) return
  const q = current()
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isCode(q) && e.target.id !== 'code') {
    e.preventDefault()
    runCode(q)
    return
  }
  // Plain-key shortcuts only when focus isn't in an editor or on a control that uses the key itself
  if (state.view !== 'test' || e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('textarea, input:not([type="radio"]), select, button')) return
  if (!isCode(q) && /^[1-9]$/.test(e.key) && +e.key <= q.options.length) {
    e.preventDefault()
    if (isMulti(q)) toggle(q, +e.key - 1)
    else {
      choose(q, +e.key - 1)
      app.querySelectorAll('input[name="opt"]')[+e.key - 1].checked = true
    }
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (state.index < state.attempt.questionIds.length - 1) go(state.index + 1)
    else confirmSubmit()
  }
})

// ---------- Start ----------

function boot() {
  for (const a of history()) registerExtras(a)
  const saved = load(KEYS.attempt, null)
  registerExtras(saved)
  if (saved && !saved.submittedAt && saved.questionIds?.every((id) => QUESTIONS.has(id))) {
    state.attempt = saved
    state.attempt.selfMarks ??= {}
    state.index = 0
    state.view = 'test'
    warmUp()
    if (isTimed(saved) && remaining() <= 0) {
      submit(true)
      return
    }
  }
  render()
}
boot()
