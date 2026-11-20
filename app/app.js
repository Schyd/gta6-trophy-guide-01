// Leonida Legend — GTA VI trophy guide & tracker.
// Plain JavaScript, no libraries, no network: the page loads its trophy data
// from data/trophies.json on its own server and keeps progress in localStorage.

(function () {
  'use strict';

  var DATA_URL = 'data/trophies.json';
  var PROGRESS_KEY = 'leonida-legend-progress-v1';
  var SPOILER_KEY = 'leonida-legend-spoilers-v1';

  var trophies = [];
  var earned = new Set();
  var previewEarned = new Set();
  var openId = null;
  var state = {
    view: 'checklist',
    filter: 'all',
    grade: 'all',
    query: '',
    spoiler: true
  };

  var KIND_LABELS = {
    story: 'Story',
    stranger: 'Stranger',
    collectibles: 'Collectible',
    activities: 'Activity',
    crime: 'Crime',
    money: 'Money',
    feat: 'Feat',
    completion: '100%',
    platinum: 'Platinum'
  };

  var STAGES = [
    {
      stage: 1,
      title: 'Stage 1 — Play the story',
      hours: '60–80 hours',
      text: 'Finish all five chapters and take the optional missions that appear along the way. Scan vehicles and study animals as you travel, and do the Chapter 1 balcony meditation before Chapter 1 ends — it is the only thing in the game that may not come back.'
    },
    {
      stage: 2,
      title: 'Stage 2 — The 100% checklist',
      hours: 'about 100 hours',
      text: 'After the credits, open Progress, Stats, 100% Completion and work the list: 70 of the 80 challenges, 300 stunts, 200 vehicles scanned, 100 animals studied, plus races, collectibles and the rest. Most of it overlaps the other trophies, so chase this one last.'
    },
    {
      stage: 3,
      title: 'Stage 3 — Strangers & cleanup',
      hours: 'about 10 hours',
      text: 'Finish the 8 stranger strands, the character quests and the one-off feats: the airport departure, the jewelry store, the cocktail on Ocean Beach and the rest. Nothing here is missable, so take them in any order.'
    },
    {
      stage: 4,
      title: 'Stage 4 — The platinum',
      hours: 'the moment it pops',
      text: 'Vice Got a Price! unlocks the moment the other 54 are earned. No extra objective, no final task — just the legend itself.'
    }
  ];

  function $(id) { return document.getElementById(id); }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function loadProgress() {
    try {
      var raw = localStorage.getItem(PROGRESS_KEY);
      if (!raw) return;
      var list = JSON.parse(raw);
      if (Array.isArray(list)) {
        list.forEach(function (id) { earned.add(Number(id)); });
      }
    } catch (e) { /* a corrupt save starts empty rather than breaking the page */ }
  }

  function saveProgress() {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(Array.from(earned).sort(function (a, b) { return a - b; })));
    } catch (e) { /* private mode or full storage: the page still works for the session */ }
  }

  function loadSpoiler() {
    try {
      var raw = localStorage.getItem(SPOILER_KEY);
      if (raw === 'off') state.spoiler = false;
    } catch (e) { /* default stays on */ }
  }

  function saveSpoiler() {
    try {
      localStorage.setItem(SPOILER_KEY, state.spoiler ? 'on' : 'off');
    } catch (e) { /* ignore */ }
  }

  function isEarned(t) { return earned.has(t.id) || previewEarned.has(t.id); }

  function isHidden(t) {
    // A story trophy stays masked until it is earned, while spoilers are on.
    return state.spoiler && t.kind === 'story' && !isEarned(t);
  }

  function visibleName(t) { return isHidden(t) ? 'Hidden trophy — earn it to reveal' : t.name; }
  function visibleDesc(t) { return isHidden(t) ? 'A story trophy. Its name and description stay hidden until you earn it.' : t.description; }

  function toast(message) {
    var box = $('toast');
    box.textContent = message;
    box.hidden = false;
    window.clearTimeout(box._timer);
    box._timer = window.setTimeout(function () { box.hidden = true; }, 3200);
  }

  function updateProgress() {
    var total = trophies.length;
    var done = trophies.filter(isEarned).length;
    $('progressFill').style.width = total ? Math.round((done / total) * 100) + '%' : '0%';
    $('progressText').textContent = done + ' / ' + total + ' earned';
    document.title = done + ' / ' + total + ' — Leonida Legend';
    var counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
    trophies.forEach(function (t) { if (isEarned(t)) counts[t.grade]++; });
    $('gradeCounts').textContent =
      '· ' + counts.platinum + ' platinum · ' + counts.gold + ' gold · ' +
      counts.silver + ' silver · ' + counts.bronze + ' bronze';
  }

  function matchesFilter(t) {
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.query) {
      var hay = (visibleName(t) + ' ' + visibleDesc(t) + ' ' + (isHidden(t) ? '' : t.guide)).toLowerCase();
      if (hay.indexOf(state.query) === -1) return false;
    }
    switch (state.filter) {
      case 'all': return true;
      case 'story': return t.kind === 'story';
      case 'missable': return t.missable === true;
      case 'collectibles': return t.kind === 'collectibles';
      case 'activities': return t.kind === 'activities';
      case 'online': return false;
      case 'earned': return isEarned(t);
      case 'remaining': return !isEarned(t);
      default: return true;
    }
  }

  function tag(text, cls) { return el('span', 'tag ' + cls, text); }

  function renderList() {
    var list = $('trophyList');
    list.innerHTML = '';
    var shown = trophies.filter(matchesFilter);
    $('listCount').textContent = shown.length + ' of ' + trophies.length + ' trophies shown';
    var empty = $('emptyState');
    if (state.filter === 'online') {
      empty.hidden = false;
      empty.textContent = 'There are no online trophies in GTA VI — all 55 are earned offline in story mode. (PowerPyx trophy guide.)';
    } else if (shown.length === 0) {
      empty.hidden = false;
      empty.textContent = 'Nothing matches this filter yet. Try clearing the search or choosing another filter.';
    } else {
      empty.hidden = true;
    }
    shown.forEach(function (t) {
      var item = el('li', 'trophy grade-' + t.grade + (isEarned(t) ? ' is-earned' : '') + (openId === t.id ? ' open' : ''));
      var row = el('div', 'trophy-row');

      var check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'trophy-check';
      check.checked = isEarned(t);
      check.setAttribute('aria-label', 'Mark ' + visibleName(t) + ' as earned');
      check.addEventListener('change', function () {
        if (check.checked) { earned.add(t.id); } else { earned.delete(t.id); previewEarned.delete(t.id); }
        saveProgress();
        updateProgress();
        renderList();
        renderRoadmap();
        renderMissable();
      });
      row.appendChild(check);

      var main = document.createElement('button');
      main.type = 'button';
      main.className = 'trophy-main';
      main.setAttribute('aria-expanded', openId === t.id ? 'true' : 'false');
      var name = el('span', 'trophy-name' + (isHidden(t) ? ' trophy-spoiler' : ''), visibleName(t));
      var desc = el('span', 'trophy-desc', visibleDesc(t));
      main.appendChild(name);
      main.appendChild(document.createElement('br'));
      main.appendChild(desc);
      var tags = el('span', 'trophy-tags');
      tags.appendChild(tag(t.grade, 'grade-' + t.grade));
      if ((KIND_LABELS[t.kind] || t.kind).toLowerCase() !== t.grade) {
        tags.appendChild(tag(KIND_LABELS[t.kind] || t.kind, 'kind'));
      }
      if (t.missable) tags.appendChild(tag('Missable', 'missable'));
      if (t.hidden) tags.appendChild(tag('Hidden', 'hidden-flag'));
      main.appendChild(tags);
      main.addEventListener('click', function () {
        openId = (openId === t.id) ? null : t.id;
        renderList();
      });
      row.appendChild(main);

      row.appendChild(el('span', 'trophy-chevron', openId === t.id ? '▴' : '▾'));
      item.appendChild(row);

      var guide = el('div', 'trophy-guide');
      if (isHidden(t)) {
        guide.appendChild(el('p', null, 'This story trophy is hidden until you earn it. Turn off “Hide story spoilers until earned” above to see its name, description and guide.'));
      } else {
        guide.appendChild(el('p', 'guide-label', 'How to earn it'));
        guide.appendChild(el('p', null, t.guide));
        if (t.missable && t.missableNote) {
          guide.appendChild(el('p', 'missable-note', 'Missable: ' + t.missableNote));
        }
        guide.appendChild(el('p', 'stage-note', 'Roadmap: ' + STAGES[t.stage - 1].title + '.'));
        var sources = el('p', 'sources', 'Sources: ');
        t.sources.forEach(function (s, i) {
          if (i > 0) sources.appendChild(document.createTextNode(' · '));
          if (s.url) {
            var link = document.createElement('a');
            link.href = s.url;
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = s.name;
            sources.appendChild(link);
          } else {
            sources.appendChild(document.createTextNode(s.name));
          }
        });
        guide.appendChild(sources);
      }
      item.appendChild(guide);
      list.appendChild(item);
    });
  }

  function renderRoadmap() {
    var host = $('roadmapStages');
    host.innerHTML = '';
    STAGES.forEach(function (s) {
      var card = el('article', 'stage' + (s.stage === 4 ? ' is-platinum' : ''));
      var h = el('h3', null, s.title + ' ');
      h.appendChild(el('span', 'stage-hours', '· ' + s.hours));
      card.appendChild(h);
      card.appendChild(el('p', null, s.text));
      var list = document.createElement('ul');
      trophies.filter(function (t) { return t.stage === s.stage; }).forEach(function (t) {
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(visibleName(t) + ' '));
        li.appendChild(el('span', 'stage-grade', '(' + t.grade + ')'));
        list.appendChild(li);
      });
      card.appendChild(list);
      host.appendChild(card);
    });
  }

  function renderMissable() {
    var hero = $('missableHero');
    hero.innerHTML = '';
    var t = trophies.find(function (x) { return x.missable; });
    if (!t) return;
    hero.appendChild(el('span', 'missable-flag', 'Potentially missable'));
    hero.appendChild(el('h3', null, t.name + ' — ' + t.description));
    hero.appendChild(el('p', null, t.guide));
    if (t.missableNote) hero.appendChild(el('p', null, t.missableNote));
    var sources = el('p', 'sources', 'Sources: ');
    t.sources.forEach(function (s, i) {
      if (i > 0) sources.appendChild(document.createTextNode(' · '));
      if (s.url) {
        var link = document.createElement('a');
        link.href = s.url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = s.name;
        sources.appendChild(link);
      } else {
        sources.appendChild(document.createTextNode(s.name));
      }
    });
    hero.appendChild(sources);
    var done = el('p', null, isEarned(t) ? '✓ Earned — the missable is behind you.' : 'Not earned yet — do the Chapter 1 meditation before Chapter 1 ends.');
    hero.appendChild(done);
  }

  function setView(view) {
    state.view = view;
    document.querySelectorAll('.view-tab').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-view') === view);
    });
    document.querySelectorAll('.view').forEach(function (v) {
      v.classList.toggle('is-active', v.id === view + 'View');
    });
  }

  function exportProgress() {
    var data = {
      game: 'Grand Theft Auto VI',
      guide: 'Leonida Legend',
      exportedAt: new Date().toISOString(),
      earned: Array.from(earned).sort(function (a, b) { return a - b; })
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'gta6-trophy-progress.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
    toast('Progress exported — ' + data.earned.length + ' of 55 earned.');
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        var list = Array.isArray(data) ? data : data.earned;
        if (!Array.isArray(list)) throw new Error('no earned list');
        var valid = new Set(trophies.map(function (t) { return t.id; }));
        var imported = list.map(Number).filter(function (id) { return valid.has(id); });
        earned = new Set(imported);
        previewEarned = new Set();
        saveProgress();
        updateProgress();
        renderList();
        renderRoadmap();
        renderMissable();
        toast('Progress imported — ' + imported.length + ' of 55 earned.');
      } catch (e) {
        toast('That file is not a Leonida Legend export. Nothing was changed.');
      }
    };
    reader.readAsText(file);
  }

  function readHash() {
    var hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;
    var parts = hash.split('&');
    parts.forEach(function (part) {
      if (part === 'roadmap' || part === 'missable' || part === 'checklist') {
        setView(part);
      } else if (part.indexOf('trophy-') === 0) {
        var id = Number(part.slice(7));
        if (trophies.some(function (t) { return t.id === id; })) {
          openId = id;
          setView('checklist');
        }
      } else if (part.indexOf('earned=') === 0) {
        // Session-only preview (used for share links and screenshots):
        // these ids show as earned without being saved to localStorage.
        part.slice(7).split(',').map(Number).forEach(function (id) {
          if (trophies.some(function (t) { return t.id === id; })) previewEarned.add(id);
        });
      } else if (part === 'spoiler=off') {
        state.spoiler = false;
        $('spoilerToggle').checked = false;
      } else if (part === 'spoiler=on') {
        state.spoiler = true;
        $('spoilerToggle').checked = true;
      }
    });
  }

  function bindControls() {
    document.querySelectorAll('.view-tab').forEach(function (b) {
      b.addEventListener('click', function () { setView(b.getAttribute('data-view')); });
    });
    document.querySelectorAll('.chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        state.filter = chip.getAttribute('data-filter');
        renderList();
      });
    });
    $('search').addEventListener('input', function (e) {
      state.query = e.target.value.trim().toLowerCase();
      renderList();
    });
    $('gradeFilter').addEventListener('change', function (e) {
      state.grade = e.target.value;
      renderList();
    });
    $('spoilerToggle').addEventListener('change', function (e) {
      state.spoiler = e.target.checked;
      saveSpoiler();
      renderList();
      renderRoadmap();
    });
    $('exportBtn').addEventListener('click', exportProgress);
    $('importBtn').addEventListener('click', function () { $('importFile').click(); });
    $('importFile').addEventListener('change', function (e) {
      if (e.target.files.length) importProgress(e.target.files[0]);
      e.target.value = '';
    });
    window.addEventListener('hashchange', function () {
      openId = null;
      readHash();
      updateProgress();
      renderList();
      renderRoadmap();
      renderMissable();
      scrollToOpen();
    });
  }

  function scrollToOpen() {
    // Scroll only enough to bring the open trophy into view, so the
    // masthead, progress bar and filters stay on screen with it.
    if (openId === null) return;
    var row = document.querySelector('.trophy.open');
    if (!row) return;
    var box = row.getBoundingClientRect();
    if (box.top < 0 || box.bottom > window.innerHeight) {
      row.scrollIntoView({ block: 'nearest' });
    }
  }

  function init() {
    loadProgress();
    loadSpoiler();
    $('spoilerToggle').checked = state.spoiler;
    bindControls();
    fetch(DATA_URL)
      .then(function (r) { if (!r.ok) throw new Error('trophies.json not found'); return r.json(); })
      .then(function (data) {
        trophies = data.trophies || data;
        readHash();
        updateProgress();
        renderList();
        renderRoadmap();
        renderMissable();
        scrollToOpen();
      })
      .catch(function () {
        $('trophyList').innerHTML = '';
        var empty = $('emptyState');
        empty.hidden = false;
        empty.textContent = 'The trophy data could not be loaded. Check that data/trophies.json sits beside this page and reload.';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
