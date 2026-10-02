'use strict'
// Practice test app: start page, timed test, grading, results and review. Everything is stored in
// localStorage, so a refresh keeps an attempt in progress and past attempts stay reviewable.

const SECTIONS = [
  { key: 'sqlint', name: 'SQL (Intermediate)', count: 1, kind: 'Write a query' },
  { key: 'stats', name: 'Statistics', count: 4, kind: 'Multiple choice' },
  { key: 'sqlbasic', name: 'SQL (Basic)', count: 3, kind: 'Multiple choice' },
  { key: 'python', name: 'Python (Basic)', count: 1, kind: 'Write code' },
  { key: 'math', name: 'Applied Math', count: 5, kind: 'Multiple choice' },
]
const SECTION = Object.fromEntries(SECTIONS.map((s) => [s.key, s]))
const DURATION_MS = 75 * 60 * 1000
const CODE_POINTS = 5
const MCQ_POINTS = 1
const KEYS = { attempt: 'dsp.attempt', seen: 'dsp.seen', history: 'dsp.history', theme: 'dsp.theme' }
const HISTORY_LIMIT = 30

const BANK = window.BANK || []
const QUESTIONS = new Map(BANK.map((q) => [q.id, q]))

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
  return `<div class="table-wrap"><table class="data"><thead><tr>${cells(head).map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${
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

function isAnswered(q, a = answerOf(q)) {
  if (!isCode(q)) return Number.isInteger(a)
  return typeof a === 'string' && a.trim() !== '' && a.trim() !== text(q.starter).trim()
}

function sectionOf(q) {
  return SECTION[q.section]
}

// Full tests are timed; drills and missed-question retries are untimed practice
const MODES = { test: 'Full test', drill: 'Section drill', missed: 'Missed questions' }
const DRILL_MCQ = 10
const isTimed = (a) => (a?.mode ?? 'test') === 'test'

// Prefer the questions seen least; break ties randomly. plan is a list of {key, count}.
function draw(plan) {
  const seen = load(KEYS.seen, {})
  const ids = []
  for (const sec of plan) {
    const pool = shuffle(BANK.filter((q) => q.section === sec.key)).sort((a, b) => (seen[a.id] || 0) - (seen[b.id] || 0))
    ids.push(...pool.slice(0, sec.count).map((q) => q.id))
  }
  for (const id of ids) seen[id] = (seen[id] || 0) + 1
  save(KEYS.seen, seen)
  return ids
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

function startAttempt(mode = 'test', section = null) {
  let ids
  if (mode === 'drill') ids = draw([{ key: section, count: SECTION[section].kind === 'Multiple choice' ? DRILL_MCQ : 1 }])
  else if (mode === 'missed') ids = missedIds().slice(0, 14)
  else ids = draw(SECTIONS)
  if (!ids.length) return
  state.attempt = { id: Date.now().toString(36), mode, section, startedAt: Date.now(), questionIds: ids, answers: {}, selfMarks: {} }
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
  a.submittedAt = isTimed(a) ? Math.min(Date.now(), a.startedAt + DURATION_MS) : Date.now()
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

function remaining() {
  return state.attempt ? state.attempt.startedAt + DURATION_MS - Date.now() : DURATION_MS
}
setInterval(() => {
  if (state.view !== 'test' || !state.attempt || state.attempt.submittedAt || !isTimed(state.attempt)) return
  const left = remaining()
  const el = document.getElementById('timer')
  if (el) {
    el.querySelector('.time').textContent = clock(left)
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
  const bankCounts = Object.fromEntries(SECTIONS.map((s) => [s.key, BANK.filter((q) => q.section === s.key).length]))
  app.innerHTML = `
    <header class="topbar"><div class="brand">DS <span>Practice</span> <small>· Data Science Intern assessment</small></div><div class="spacer"></div>${themeButton()}</header>
    <main class="page">
      <section class="card">
        <h1>Practice test</h1>
        <p class="lede">A timed simulation of the HackerRank screen: 14 questions in 75 minutes. No calculator: every number works out with pen and paper.</p>
        <table class="plain">
          <thead><tr><th>#</th><th>Section</th><th>Format</th><th class="num">Questions</th><th class="num">Points each</th><th class="num">In bank</th></tr></thead>
          <tbody>${SECTIONS.map((s, i) => `<tr><td>${i + 1}</td><td>${esc(s.name)}</td><td>${s.kind}</td><td class="num">${s.count}</td>
            <td class="num">${s.kind === 'Multiple choice' ? MCQ_POINTS : CODE_POINTS}</td><td class="num">${bankCounts[s.key]}</td></tr>`).join('')}</tbody>
        </table>
        <ul class="rules">
          <li>One timer for the whole test. It submits on its own when time runs out.</li>
          <li>Move between questions freely with the numbers on the left. Answers save as you go, so a refresh won't lose them.</li>
          <li>Coding questions have <strong>Run code</strong> (or Ctrl/Cmd + Enter) to check your answer against the sample data.</li>
          <li>Total: 22 points. Each coding question is worth 5, each multiple choice 1.</li>
        </ul>
        <div class="actions"><button class="btn btn-primary btn-lg" id="start">Start test</button></div>
      </section>
      <section class="card">
        <h2>Untimed practice</h2>
        <p class="lede">Drill one section (${DRILL_MCQ} multiple choice questions, or one coding question), or retry every question you've missed before.</p>
        <div class="actions">${SECTIONS.map((s) => `<button class="btn" data-drill="${s.key}">${esc(s.name)}</button>`).join('')}</div>
        <div class="actions" style="margin-top:0.75rem"><button class="btn" id="missed"${missed.length ? '' : ' disabled'}>Retry missed questions (${missed.length})</button></div>
      </section>
      ${weakAreasHtml(past)}
      ${past.length ? `<section class="card"><h2>Past attempts</h2>
        <table class="plain"><thead><tr><th>Date</th><th>Type</th><th class="num">Score</th><th class="num">Time used</th><th></th></tr></thead>
        <tbody>${past.map((a) => {
          const t = totals(a)
          return `<tr class="clickable" data-attempt="${esc(a.id)}"><td>${new Date(a.startedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td>
            <td>${esc(MODES[a.mode ?? 'test'])}${a.section ? `: ${esc(SECTION[a.section].name)}` : ''}</td><td class="num">${fmtPoints(t.score)} / ${t.max}</td><td class="num">${clock(a.submittedAt - a.startedAt)}</td><td class="num"><button class="btn-link">Review</button></td></tr>`
        }).join('')}</tbody></table></section>` : ''}
    </main>`
  $('#start').addEventListener('click', () => startAttempt('test'))
  app.querySelectorAll('[data-drill]').forEach((b) => b.addEventListener('click', () => startAttempt('drill', b.dataset.drill)))
  $('#missed')?.addEventListener('click', () => startAttempt('missed'))
  app.querySelectorAll('[data-attempt]').forEach((row) => row.addEventListener('click', () => {
    state.attempt = past.find((a) => a.id === row.dataset.attempt)
    state.runs = {}
    state.view = 'results'
    render()
  }))
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
    <table class="plain"><thead><tr><th>Section</th><th class="num">Points</th><th style="width:40%"></th><th></th></tr></thead><tbody>${SECTIONS.map((s) => {
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

function sidebarHtml(reviewing) {
  let html = ''
  let last = null
  state.attempt.questionIds.forEach((id, i) => {
    const q = QUESTIONS.get(id)
    if (last && q.section !== last) html += '<span class="sec-gap"></span>'
    last = q.section
    let cls = ''
    if (reviewing) {
      const p = pointsFor(state.attempt, q)
      cls = p >= maxPoints(q) ? 'right' : p > 0 ? 'partial' : 'wrong'
    } else if (isAnswered(q)) cls = 'answered'
    html += `<button class="qdot ${cls}${i === state.index ? ' current' : ''}" data-go="${i}" title="Question ${i + 1}: ${esc(sectionOf(q).name)}" aria-label="Question ${i + 1}">${i + 1}</button>`
  })
  return html
}

function problemHtml(q, reviewing) {
  const sec = sectionOf(q)
  let extra = ''
  if (q.type === 'sql') {
    extra += q.tables.map((t) => `<h4>Table: <code>${esc(t.name)}</code></h4>${dataTable(t.columns.map((c) => c[0]), t.rows, t.columns.map((c) => c[1]))}`).join('')
    extra += '<h4>Expected output for this sample data</h4><div id="expected-sample"><p class="null">Loading…</p></div>'
  }
  if (q.type === 'python') {
    extra += `<h4>Sample tests</h4><ul class="sample-tests">${q.tests.map((t) => `<li><strong>${esc(t.name)}</strong>: ${
      t.setup ? `<code>${esc(text(t.setup)).replace(/\n/g, '; ')}</code>, then ` : ''}<code>${esc(t.expr)}</code> ${
      t.raises ? `raises <code>${esc(t.raises)}</code>` : `returns <code>${esc(t.expect)}</code>`}</li>`).join('')}</ul>`
  }
  let review = ''
  if (reviewing) {
    review += `<div class="approach"><h4>How to approach it</h4><ol>${(q.approach || []).map((s) => `<li>${inline(s)}</li>`).join('')}</ol></div>`
    if (isCode(q)) {
      review += `<h4>Reference solution</h4><pre class="solution">${esc(text(q.solution))}</pre>`
      if (q.mistakes?.length) review += `<div class="approach mistakes"><h4>Common mistakes</h4><ul>${q.mistakes.map((m) => `<li>${inline(m)}</li>`).join('')}</ul></div>`
    }
  }
  return `<div class="panel-head"><span class="eyebrow">Question ${state.index + 1} of ${state.attempt.questionIds.length} · ${esc(sec.name)}</span>
      <span class="points">${plural(maxPoints(q), 'point')}</span></div>
    <div class="panel-body problem"><h2>${esc(q.title)}</h2>${md(q.prompt)}${extra}${review}</div>`
}

function optionsHtml(q, reviewing) {
  const picked = answerOf(q)
  if (!reviewing) {
    return `<div class="options" role="radiogroup" aria-label="Answer choices">${q.options.map((o, i) => `
      <label class="option${picked === i ? ' selected' : ''}"><input type="radio" name="opt" value="${i}"${picked === i ? ' checked' : ''}>
      <span class="opt-text">${inline(o)}</span></label>`).join('')}</div>
      ${Number.isInteger(picked) ? '<button class="btn-link clear-choice" id="clear">Clear my choice</button>' : ''}`
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
  const lang = q.type === 'sql' ? 'MySQL (runs on SQLite)' : 'Python 3'
  let selfMark = ''
  if (reviewing) {
    const r = state.attempt.results?.[q.id]
    const self = state.attempt.selfMarks?.[q.id]
    selfMark = `<div class="output" style="margin-bottom:0.9rem">
      <h4>Automatic grade: ${fmtPoints(r?.points ?? 0)} / ${CODE_POINTS}</h4><p style="margin:0">${esc(r?.detail || '')}</p>
      <div class="self-mark"><span>Mark yourself:</span>
        <button class="btn${self === CODE_POINTS ? ' on' : ''}" data-mark="${CODE_POINTS}">Correct (${CODE_POINTS})</button>
        <button class="btn${self === 0 ? ' on' : ''}" data-mark="0">Incorrect (0)</button>
        <button class="btn${self === undefined || self === null ? ' on' : ''}" data-mark="auto">Use automatic grade</button></div></div>`
  }
  return `${selfMark}<div class="editor-wrap">
      <div class="editor-bar"><span class="lang">${lang}</span><span style="flex:1"></span>
        <button class="btn-link" id="reset">Reset to starter</button></div>
      <div class="editor"><pre class="gutter" aria-hidden="true">${lineNumbers(code)}</pre>
        <textarea id="code" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Code editor">${esc(code)}</textarea></div>
      <div class="run-row"><button class="btn btn-primary" id="run">Run code</button><span class="hint">Ctrl/Cmd + Enter</span></div>
      <div id="output">${outputHtml(q)}</div></div>`
}

function outputHtml(q) {
  const run = state.runs[q.id]
  if (!run) return ''
  if (run.status === 'running') {
    const note = q.type === 'python' && Runner.pythonState() !== 'ready' ? ' The first Python run downloads the interpreter (about 10 MB), so it can take a few seconds.' : ''
    return `<div class="output"><div class="verdict"><span class="badge wait">Running</span><span>Running your code…${note}</span></div></div>`
  }
  if (run.status === 'error') {
    return `<div class="output"><div class="verdict"><span class="badge fail">Error</span><span>Could not run.</span></div><div class="errbox">${esc(run.message)}</div></div>`
  }
  const r = run.result
  if (q.type === 'sql') {
    return `<div class="output">
      <div class="verdict"><span class="badge ${r.pass ? 'pass' : 'fail'}">${r.pass ? 'Pass' : 'Fail'}</span><span>${esc(r.reason)}</span></div>
      ${r.error ? `<div class="errbox">${esc(r.error)}</div>` : ''}
      ${r.got ? `<h4>Your output</h4>${dataTable(r.got.columns, r.got.rows)}` : ''}
      ${r.expected ? `<h4>Expected output</h4>${dataTable(r.expected.columns, r.expected.rows)}` : ''}</div>`
  }
  const passed = r.tests.filter((t) => t.pass).length
  const all = passed === r.tests.length
  return `<div class="output">
    <div class="verdict"><span class="badge ${all ? 'pass' : 'fail'}">${all ? 'Pass' : 'Fail'}</span><span>${passed} of ${r.tests.length} sample tests passed.</span></div>
    ${r.error ? `<div class="errbox">Your code raised an error before any test ran:\n${esc(r.error)}</div>` : ''}
    <h4>Sample tests</h4><ul class="tests">${r.tests.map((t) => `<li class="${t.pass ? 'ok' : 'bad'}"><span class="mark">${t.pass ? '✓' : '✗'}</span><span class="t-name">${esc(t.name)}</span>
      ${t.pass ? '' : `<span class="t-msg">${esc(t.message)}</span>`}</li>`).join('')}</ul>
    ${r.stdout ? `<h4>What you printed</h4><pre class="stdout">${esc(r.stdout)}</pre>` : ''}</div>`
}

function renderTest() {
  const reviewing = state.view === 'review'
  const a = state.attempt
  const q = current()
  const answered = a.questionIds.filter((id) => isAnswered(QUESTIONS.get(id))).length
  const last = state.index === a.questionIds.length - 1
  const t = reviewing ? totals(a) : null
  const left = remaining()

  app.innerHTML = `
    <header class="topbar">
      <div class="brand">DS <span>Practice</span></div>
      <div class="section-name">${esc(sectionOf(q).name)}</div>
      <div class="spacer"></div>
      ${reviewing
        ? `<span class="timer"><small>Score</small>${fmtPoints(t.score)} / ${t.max}</span>${themeButton()}<button class="btn" id="to-results">Back to results</button>`
        : `${isTimed(a)
            ? `<span class="timer${left < 5 * 60 * 1000 ? ' low' : ''}" id="timer"><small>Time left</small><span class="time">${clock(left)}</span></span>`
            : `<span class="timer"><small>Untimed</small>${esc(MODES[a.mode])}</span>`}${themeButton()}
           <button class="btn btn-primary" id="submit">Submit test</button>`}
    </header>
    <div class="shell">
      <nav class="sidebar" aria-label="Questions">${sidebarHtml(reviewing)}</nav>
      <div class="main">
        <div class="workspace">
          <section class="panel" aria-label="Problem">${problemHtml(q, reviewing)}</section>
          <section class="panel" aria-label="Your answer">
            <div class="panel-head"><span class="eyebrow">${reviewing ? 'Your answer and the explanation' : 'Your answer'}</span></div>
            <div class="panel-body">${isCode(q) ? codeHtml(q, reviewing) : optionsHtml(q, reviewing)}</div>
          </section>
        </div>
        <footer class="bottombar">
          <button class="btn" id="prev"${state.index === 0 ? ' disabled' : ''}>← Previous</button>
          <span class="progress">${reviewing ? `Question ${state.index + 1} of ${a.questionIds.length}` : `${answered} of ${a.questionIds.length} answered`}</span>
          ${reviewing ? '' : '<span class="keys-hint">Keys: 1 to 4 choose, Enter for next</span>'}
          <span class="spacer"></span>
          ${last
            ? reviewing ? '<button class="btn btn-primary" id="to-results-2">Back to results</button>' : '<button class="btn btn-primary" id="submit-2">Submit test</button>'
            : '<button class="btn btn-primary" id="next">Next →</button>'}
        </footer>
      </div>
    </div>`

  app.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => go(+b.dataset.go)))
  $('#prev')?.addEventListener('click', () => go(state.index - 1))
  $('#next')?.addEventListener('click', () => go(state.index + 1))
  $('#submit')?.addEventListener('click', confirmSubmit)
  $('#submit-2')?.addEventListener('click', confirmSubmit)
  for (const id of ['#to-results', '#to-results-2']) $(id)?.addEventListener('click', () => { state.view = 'results'; render() })

  if (!isCode(q) && !reviewing) {
    app.querySelectorAll('input[name="opt"]').forEach((input) => input.addEventListener('change', () => choose(q, +input.value)))
    $('#clear')?.addEventListener('click', () => { delete a.answers[q.id]; saveAttempt(); render() })
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
  app.querySelector('.qdot.current')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

async function showSampleOutput(q) {
  try {
    const r = await Runner.expectedSql(q)
    const box = document.getElementById('expected-sample')
    if (box && current() === q) box.innerHTML = dataTable(r.columns, r.rows)
  } catch (e) {
    const box = document.getElementById('expected-sample')
    if (box) box.innerHTML = `<p class="null">Could not load the SQL engine (${esc(e.message)}).</p>`
  }
}

function go(i) {
  if (i < 0 || i >= state.attempt.questionIds.length) return
  state.index = i
  render()
  app.querySelector('.workspace')?.scrollTo?.(0, 0)
  window.scrollTo(0, 0)
}

function choose(q, i) {
  state.attempt.answers[q.id] = i
  saveAttempt()
  app.querySelectorAll('.option').forEach((el, k) => el.classList.toggle('selected', k === i))
  const dot = app.querySelector(`.qdot[data-go="${state.index}"]`)
  dot?.classList.add('answered')
  updateProgress()
  if (!$('#clear')) render()
}

function updateProgress() {
  const a = state.attempt
  const el = app.querySelector('.bottombar .progress')
  if (el && state.view === 'test') el.textContent = `${a.questionIds.filter((id) => isAnswered(QUESTIONS.get(id))).length} of ${a.questionIds.length} answered`
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
    if (state.view === 'test') {
      app.querySelector(`.qdot[data-go="${state.index}"]`)?.classList.toggle('answered', isAnswered(q))
      updateProgress()
    }
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

function showOutput(q) {
  const box = document.getElementById('output')
  if (box) box.innerHTML = outputHtml(q)
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
  const used = a.submittedAt - a.startedAt
  app.innerHTML = `
    <header class="topbar"><div class="brand">DS <span>Practice</span></div><div class="spacer"></div>${themeButton()}
      <button class="btn" id="home">Home</button></header>
    <main class="page">
      <section class="card">
        <h1>Results${isTimed(a) ? '' : `: ${esc(MODES[a.mode])}${a.section ? `, ${esc(SECTION[a.section].name)}` : ''}`}</h1>
        <p class="lede">${a.autoSubmitted ? 'Time ran out, so the test was submitted automatically. ' : ''}${new Date(a.startedAt).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>
        <div class="score-row">
          <div><div class="stat-label">Score</div><div class="score-big">${fmtPoints(t.score)} <span style="font-size:1.2rem;color:var(--text-soft)">/ ${t.max}</span></div></div>
          <div><div class="stat-label">Percent</div><div class="stat-value">${Math.round((100 * t.score) / t.max)}%</div></div>
          <div><div class="stat-label">Time used</div><div class="stat-value">${clock(used)}${isTimed(a) ? ' <span style="font-size:0.9rem;color:var(--text-soft)">of 75:00</span>' : ''}</div></div>
        </div>
        <div class="actions"><button class="btn btn-primary" id="new">Start a new test</button><button class="btn" id="review">Review answers</button>
          ${a.mode === 'drill' ? `<button class="btn" id="again">Drill ${esc(SECTION[a.section].name)} again</button>` : ''}</div>
      </section>
      <section class="card">
        <h2>By section</h2>
        <table class="plain"><thead><tr><th>Section</th><th class="num">Score</th><th style="width:40%"></th></tr></thead>
        <tbody>${SECTIONS.map((s) => {
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
  $('#again')?.addEventListener('click', () => startAttempt('drill', a.section))
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
  if ((state.view !== 'test' && state.view !== 'review') || dialog.open) return
  const q = current()
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isCode(q) && e.target.id !== 'code') {
    e.preventDefault()
    runCode(q)
    return
  }
  // Plain-key shortcuts only when focus isn't in an editor or on a control that uses the key itself
  if (state.view !== 'test' || e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('textarea, input:not([type="radio"]), select, button')) return
  if (!isCode(q) && /^[1-4]$/.test(e.key) && +e.key <= q.options.length) {
    e.preventDefault()
    choose(q, +e.key - 1)
    app.querySelectorAll('input[name="opt"]')[+e.key - 1].checked = true
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (state.index < state.attempt.questionIds.length - 1) go(state.index + 1)
    else confirmSubmit()
  }
})

// ---------- Start ----------

function boot() {
  const saved = load(KEYS.attempt, null)
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
