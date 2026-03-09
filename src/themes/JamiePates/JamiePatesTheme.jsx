import React, { useEffect, useMemo, useState } from 'react';
import { useCV } from '../../contexts/ConfigContext';
import { ShadowRoot } from '../../ui/ShadowRoot';
import { formatDateRange, formatMonthYear } from '../../utils/cvHelpers';

import rawStyles from './jamiePates.css?raw';

const EXTRA_CSS = `
:host {
  display: block;
  width: 100%;
  background: #000;
}

.jamie-host {
  position: relative;
  min-height: calc(100vh - 56px);
  background: #000;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: hidden;
}

.jamie-root {
  position: relative;
}

.jp-button-reset,
.jp-link-reset {
  background: transparent;
  border: 0;
  color: inherit;
  padding: 0;
  margin: 0;
  font: inherit;
  text-decoration: none;
}

.jp-button-reset {
  width: 100%;
  text-align: left;
}

.jp-button-reset:disabled {
  cursor: default;
}

.jp-placeholder-portrait {
  width: 145px;
  height: 180px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.35), transparent 18%),
    linear-gradient(180deg, rgba(98, 156, 255, 0.4), rgba(21, 31, 74, 0.96)),
    linear-gradient(135deg, rgba(166, 196, 255, 0.15), transparent 50%);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.16);
  font-size: 54px;
  letter-spacing: 0.08em;
}

.jp-project-icon {
  width: 36px;
  height: 36px;
  margin-right: .75rem;
  object-fit: contain;
}

.jp-history-thumb {
  width: 7rem;
  height: 11.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background:
    radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.22), transparent 18%),
    linear-gradient(180deg, rgba(98, 156, 255, 0.4), rgba(21, 31, 74, 0.96));
  font-size: 2rem;
}

.jp-history-link,
.jp-history-button {
  color: inherit;
  text-decoration: none;
  background: transparent;
  border: 0;
  padding: 0;
  width: 100%;
  display: block;
  text-align: left;
}

.jp-empty-save {
  opacity: .7;
}

.jp-inline-gap {
  gap: .5rem;
}

.jp-stack-gap {
  gap: .75rem;
}
`;

const THEME_STYLE_TEXT = rawStyles
  .replaceAll('url(/', 'url(/jamie-pates/')
  .replaceAll('body.crt-effect #root:before', '.jamie-host.crt-effect .jamie-root:before')
  .replaceAll('body.crt-effect *', '.jamie-host.crt-effect *')
  .replaceAll('body.crt-effect:after', '.jamie-host.crt-effect:after')
  .replaceAll('body.crt-effect', '.jamie-host.crt-effect')
  .replaceAll('body *', '.jamie-host *')
  .replaceAll('body{', '.jamie-host{')
  .replaceAll('#root{', '.jamie-root{')
  + EXTRA_CSS;

const DEFAULT_WINDOW_COLOR = {
  topLeft: [2, 34, 186],
  topRight: [2, 24, 145],
  bottomLeft: [0, 15, 105],
  bottomRight: [0, 3, 50],
};

const COLOR_KEYS = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];
const MENU_ORDER = ['projects', 'skills', 'history', 'config'];
const PAGE_TITLES = {
  home: 'Homepage',
  projects: 'Projects',
  skills: 'Skills',
  history: 'History',
  config: 'Config',
};

const AUDIO_FILES = {
  back: 'back.mp3',
  delete: 'delete.mp3',
  error: 'error.mp3',
  heal: 'heal.mp3',
  materia: 'materia.mp3',
  save: 'save.mp3',
  saveSelect: 'saveSelect.mp3',
  select: 'select.mp3',
  slash: 'slash.mp3',
};

function readJsonStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function isPresent(value) {
  return String(value || '').trim().toLowerCase() === 'present';
}

function getInitials(name = '') {
  const parts = String(name).split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CV';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
}

function wrapText(text = '', maxLength = 38, limit = 6) {
  const words = String(text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  if (!words.length) return [];

  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxLength && current) {
      lines.push(current);
      current = word;
      if (lines.length >= limit) break;
    } else {
      current = candidate;
    }
  }

  if (current && lines.length < limit) lines.push(current);
  return lines;
}

function splitDetails(details = '') {
  return String(details)
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseProjectTech(project) {
  const techLine = (project?.highlights || []).find((item) => /^technologies\s*-/i.test(item || ''));
  if (!techLine) return [];
  return techLine
    .replace(/^technologies\s*-\s*/i, '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildSummary(cv) {
  if (cv.about) return cv.about;
  if (cv.currentJobTitle && cv.location) {
    return `I'm a ${cv.currentJobTitle} based in ${cv.location}. Welcome to this personal sandbox. I plan to load an ever-growing collection of profile data here, built with PS1 aesthetics in mind.`;
  }
  return 'Welcome to this personal sandbox. Profile, projects, skills, history, and configuration are loaded from CV.yaml.';
}

function buildWindowStyle(windowColor) {
  return {
    backgroundImage: `linear-gradient(135deg, rgb(${windowColor.topLeft.join(',')}) 0%, transparent 50%, rgb(${windowColor.bottomRight.join(',')}) 100%), linear-gradient(45deg, rgb(${windowColor.bottomLeft.join(',')}) 0%, rgb(${windowColor.topRight.join(',')}) 100%)`,
  };
}

function getLevel(cv) {
  return Math.min(
    99,
    15 +
      (cv.experience || []).length * 4 +
      (cv.projects || []).length * 3 +
      (cv.awards || []).length * 2
  );
}

function getMaxHealth(cv) {
  return 900 + (cv.experience || []).length * 110 + (cv.projects || []).length * 45;
}

function getMaxMana(cv, skills) {
  return 240 + skills.length * 22 + (cv.awards || []).length * 14;
}

function getGil(cv) {
  return (
    20000 +
    (cv.projects || []).length * 3400 +
    (cv.awards || []).length * 2600 +
    (cv.publications || []).length * 1800
  );
}

function buildSkills(cv) {
  const records = [];

  for (const section of cv.sectionsRaw?.certifications_skills || []) {
    for (const item of splitDetails(section.details)) {
      records.push({
        name: item,
        description: /cert/i.test(section.label || '')
          ? 'Certification file linked to the profile.'
          : 'Primary skill loaded from the CV inventory.',
      });
    }
  }

  for (const project of cv.projects || []) {
    for (const tech of parseProjectTech(project)) {
      records.push({
        name: tech,
        description: `Observed in project file: ${project.name}.`,
      });
    }
  }

  const colors = ['blue', 'yellow', 'green', 'pink', 'red'];
  const deduped = [];
  const seen = new Set();

  for (const item of records) {
    const key = item.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  return deduped.slice(0, 12).map((item, index) => ({
    id: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: item.name,
    description: item.description,
    color: colors[index % colors.length],
    score: (index % 5) + 1,
  }));
}

function buildHistoryRecords(cv, mode) {
  if (mode === 'education') {
    return (cv.education || []).map((item, index) => ({
      id: `education-${index}`,
      name: item.institution,
      role: item.degree || item.area || 'Education',
      year: formatDateRange(item.start_date || item.startDate, item.end_date || item.endDate),
      summary: item.highlights?.[0] || item.area || '',
      link: item.url || null,
    }));
  }

  return (cv.sectionsRaw?.experience || []).map((item, index) => ({
    id: `experience-${index}`,
    name: item.company,
    role: item.position || item.positions?.[0]?.title || 'Role',
    year: formatDateRange(
      item.start_date || item.positions?.[0]?.start_date,
      item.end_date || item.positions?.[item.positions?.length - 1]?.end_date
    ),
    summary:
      item.highlights?.[0] ||
      item.positions?.[0]?.highlights?.[0] ||
      item.location ||
      '',
    link: item.url || null,
  }));
}

function getProjectIcon(index) {
  return index % 2 === 0 ? '/jamie-pates/xpicon.png' : '/jamie-pates/cardicon.png';
}

function formatClock(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function GlyphText({ text, color = 'white', className = '', resource = false }) {
  if (!text) return null;

  return (
    <span className={`font flex ${className}`.trim()} data-text-color={color} data-label={resource ? 'resourceValue' : undefined}>
      {Array.from(String(text)).map((glyph, index) => (
        <span key={`${glyph}-${index}`} className="font-glyph" data-sprite={glyph}>
          {glyph}
        </span>
      ))}
    </span>
  );
}

function GlyphToken({ sprite, className = '' }) {
  return (
    <span className={`font-glyph ${className}`.trim()} data-sprite={sprite}>
      {sprite}
    </span>
  );
}

function WindowBox({ label, className = '', style, children, ...props }) {
  return (
    <div className={`_contentBox_1iaa9_1 ${className}`.trim()} data-label={label} style={style} {...props}>
      {children}
    </div>
  );
}

export function JamiePatesTheme() {
  const cv = useCV();
  const [page, setPage] = useState('home');
  const [soundEnabled, setSoundEnabled] = useState(() => readJsonStorage('jamie-pates-sound', true));
  const [crtEnabled, setCrtEnabled] = useState(() => readJsonStorage('jamie-pates-crt', true));
  const [windowColor, setWindowColor] = useState(() => readJsonStorage('jamie-pates-windowColor', DEFAULT_WINDOW_COLOR));
  const [seconds, setSeconds] = useState(() => readJsonStorage('jamie-pates-seconds', 648));
  const [scale, setScale] = useState(1);
  const [hoverProjectIndex, setHoverProjectIndex] = useState(0);
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [selectedColorSlot, setSelectedColorSlot] = useState(null);
  const [historyPhase, setHistoryPhase] = useState('select');
  const [historyMode, setHistoryMode] = useState('experience');
  const [historyProgress, setHistoryProgress] = useState(0);
  const [portraitShake, setPortraitShake] = useState(false);
  const [portraitDying, setPortraitDying] = useState(false);
  const [damageValue, setDamageValue] = useState(null);

  const summaryLines = useMemo(() => wrapText(buildSummary(cv || {}), 38, 6), [cv]);
  const skills = useMemo(() => buildSkills(cv || {}), [cv]);
  const selectedSkill = useMemo(() => {
    if (!skills.length) return null;
    return skills.find((item) => item.id === selectedSkillId) || skills[0];
  }, [skills, selectedSkillId]);
  const historyRecords = useMemo(() => buildHistoryRecords(cv || {}, historyMode), [cv, historyMode]);
  const windowStyle = useMemo(() => buildWindowStyle(windowColor), [windowColor]);

  const projects = cv?.projects || [];
  const hoverProject = projects[hoverProjectIndex] || projects[0] || null;
  const hoverProjectLines = useMemo(
    () => wrapText(hoverProject?.summary || 'Open a project file to inspect the mission data.', 28, 6),
    [hoverProject]
  );

  const level = useMemo(() => getLevel(cv || {}), [cv]);
  const maxHealth = useMemo(() => getMaxHealth(cv || {}), [cv]);
  const maxMana = useMemo(() => getMaxMana(cv || {}, skills), [cv, skills]);
  const [currentHealth, setCurrentHealth] = useState(maxHealth);
  const [currentMana, setCurrentMana] = useState(maxMana);
  const gil = useMemo(() => getGil(cv || {}), [cv]);
  const nextLevelProgress = useMemo(() => ((level * 7) % 100) || 2, [level]);
  const limitLevel = useMemo(() => Math.max(1, Math.min(4, 1 + Math.floor(((cv?.awards || []).length + (cv?.projects || []).length) / 3))), [cv]);
  const menuLinks = useMemo(() => {
    if (!cv) return [];
    return [
      cv.website ? { id: 'website', label: 'Website', href: cv.website } : null,
      cv.socialLinks?.github ? { id: 'github', label: 'Github', href: cv.socialLinks.github } : null,
      cv.socialLinks?.linkedin ? { id: 'linkedin', label: 'LinkedIn', href: cv.socialLinks.linkedin } : null,
    ].filter(Boolean);
  }, [cv]);

  useEffect(() => {
    setCurrentHealth(maxHealth);
  }, [maxHealth]);

  useEffect(() => {
    setCurrentMana(maxMana);
  }, [maxMana]);

  useEffect(() => {
    if (skills.length && !selectedSkillId) {
      setSelectedSkillId(skills[0].id);
    }
  }, [skills, selectedSkillId]);

  useEffect(() => {
    function updateScale() {
      const nextScale = Math.min(window.innerWidth / 1250, window.innerHeight / 975);
      setScale(nextScale);
    }

    updateScale();
    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);
    window.visualViewport?.addEventListener('resize', updateScale);
    window.visualViewport?.addEventListener('scroll', updateScale);

    return () => {
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('orientationchange', updateScale);
      window.visualViewport?.removeEventListener('resize', updateScale);
      window.visualViewport?.removeEventListener('scroll', updateScale);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((value) => {
        const next = value >= 35999 ? 0 : value + 1;
        try {
          localStorage.setItem('jamie-pates-seconds', JSON.stringify(next));
        } catch {}
        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('jamie-pates-sound', JSON.stringify(soundEnabled));
      localStorage.setItem('jamie-pates-crt', JSON.stringify(crtEnabled));
      localStorage.setItem('jamie-pates-windowColor', JSON.stringify(windowColor));
    } catch {}
  }, [soundEnabled, crtEnabled, windowColor]);

  useEffect(() => {
    if (historyPhase !== 'loading') return undefined;

    const timer = window.setInterval(() => {
      setHistoryProgress((value) => {
        const next = value + 10;
        if (next >= 100) {
          playSound('save');
          window.setTimeout(() => setHistoryPhase('loaded'), 100);
          return 110;
        }
        return next;
      });
    }, 80);

    return () => window.clearInterval(timer);
  }, [historyPhase, soundEnabled]);

  if (!cv) return null;

  function playSound(type) {
    const file = AUDIO_FILES[type];
    if (!soundEnabled || !file) return;
    const audio = new Audio(`/jamie-pates/audio/${file}`);
    audio.volume = 0.2;
    audio.play().catch(() => {});
  }

  function handleMenuClick(nextPage) {
    if (page === nextPage) return;
    playSound(nextPage === 'home' ? 'back' : 'select');
    setPage(nextPage);
    if (nextPage !== 'history') {
      setHistoryPhase('select');
      setHistoryProgress(0);
    }
  }

  function handleExternalClick(url) {
    if (!url) {
      playSound('error');
      return;
    }
    playSound('saveSelect');
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function handlePortraitClick() {
    if (currentHealth === 0) {
      if (currentMana < 34) {
        playSound('error');
        return;
      }
      playSound('heal');
      setCurrentHealth(maxHealth);
      setCurrentMana((value) => Math.max(0, value - 34));
      setPortraitDying(false);
      setDamageValue('REVIVE');
      window.setTimeout(() => setDamageValue(null), 700);
      return;
    }

    const damage = Math.floor(Math.random() * 21) + 130;
    playSound('slash');
    setPortraitShake(true);
    setDamageValue(String(damage));
    setCurrentHealth((value) => {
      const next = Math.max(0, value - damage);
      if (next === 0) {
        setPortraitDying(true);
      }
      return next;
    });
    window.setTimeout(() => setPortraitShake(false), 300);
    window.setTimeout(() => setDamageValue(null), 420);
    if (currentHealth - damage <= 0) {
      window.setTimeout(() => setPortraitDying(false), 1000);
    }
  }

  function setHistory(type) {
    playSound('select');
    setHistoryMode(type);
    setHistoryPhase('loading');
    setHistoryProgress(0);
  }

  function resetWindowColor() {
    playSound('select');
    setWindowColor(DEFAULT_WINDOW_COLOR);
  }

  function updateColor(channelIndex, value) {
    if (!selectedColorSlot) return;
    playSound('select');
    setWindowColor((current) => ({
      ...current,
      [selectedColorSlot]: current[selectedColorSlot].map((component, index) => (
        index === channelIndex ? Number(value) : component
      )),
    }));
  }

  function renderMenuItem(id, label) {
    const active = page === id;

    if (active) {
      return (
        <button type="button" className="jp-button-reset _active_l1p5s_8 w-100" disabled>
          <span>{GlyphText({ text: label })}</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        className="jp-button-reset w-100"
        onMouseEnter={() => playSound('select')}
        onClick={() => handleMenuClick(id)}
      >
        <span>{GlyphText({ text: label })}</span>
      </button>
    );
  }

  return (
    <ShadowRoot styleText={THEME_STYLE_TEXT}>
      <div className={`jamie-host ${crtEnabled ? 'crt-effect' : ''}`}>
        <div id="root" className="jamie-root" style={{ transform: `scale(${scale})` }}>
          <div className="flex h-screen" data-active="true">
            <div className="w-[1100px] h-[825px] mx-auto my-[5rem] relative">
              {page === 'home' && (
                <>
                  <WindowBox
                    label="party"
                    className="w-[1000px] h-[720px] m-auto absolute top-[44px]"
                    style={windowStyle}
                  >
                    <div className="flex justify-between">
                      <div
                        className="_portrait_15lul_1"
                        data-shake={portraitShake ? 'true' : 'false'}
                        data-dying={portraitDying ? 'true' : 'false'}
                        data-interactive="true"
                        data-health={String(currentHealth)}
                        onMouseEnter={() => currentHealth !== 0 && playSound('select')}
                        onClick={handlePortraitClick}
                      >
                        {damageValue && (
                          <p className="absolute">
                            {GlyphText({ text: damageValue, resource: true, color: currentHealth === 0 ? 'yellow' : 'white' })}
                          </p>
                        )}
                        <div className="self-center relative">
                          <div className="jp-placeholder-portrait">{getInitials(cv.name)}</div>
                        </div>
                        {currentHealth === 0 && (
                          <div className="absolute top-full" onMouseEnter={() => playSound('select')}>
                            <WindowBox label="healButton">
                              {GlyphText({ text: 'Revive', color: currentMana < 34 ? 'grey' : 'white' })}
                            </WindowBox>
                          </div>
                        )}
                      </div>

                      <div className="mt-2 ml-8">
                        <p className="mb-2">{GlyphText({ text: cv.name })}</p>
                        <p className="flex">
                          <GlyphToken sprite="lv" />
                          {GlyphText({ text: String(level), resource: true })}
                        </p>

                        <div className="_resourceCounter_12uml_1 flex">
                          <GlyphToken sprite="hp" className="mr-2" />
                          <div className="flex flex-col">
                            <div className="flex">
                              <span className="w-[92px] flex justify-end">{GlyphText({ text: String(currentHealth), resource: true, color: currentHealth <= Math.floor(maxHealth * 0.35) ? 'yellow' : 'white' })}</span>
                              <span>{GlyphText({ text: '/', resource: true })}</span>
                              <span className="w-[92px] flex justify-end">{GlyphText({ text: String(maxHealth), resource: true })}</span>
                            </div>
                            <div className="_resourceBar_12uml_5">
                              <div style={{ width: `${(currentHealth / maxHealth) * 100}%`, backgroundImage: 'linear-gradient(90deg, rgb(79, 143, 212), rgb(198, 205, 237))' }} />
                            </div>
                          </div>
                        </div>

                        <div className="_resourceCounter_12uml_1 flex">
                          <GlyphToken sprite="mp" className="mr-2" />
                          <div className="flex flex-col">
                            <div className="flex">
                              <span className="w-[92px] flex justify-end">{GlyphText({ text: String(currentMana), resource: true, color: currentMana <= Math.floor(maxMana * 0.35) ? 'yellow' : 'white' })}</span>
                              <span>{GlyphText({ text: '/', resource: true })}</span>
                              <span className="w-[92px] flex justify-end">{GlyphText({ text: String(maxMana), resource: true })}</span>
                            </div>
                            <div className="_resourceBar_12uml_5">
                              <div style={{ width: `${(currentMana / maxMana) * 100}%`, backgroundImage: 'linear-gradient(90deg, rgb(99, 217, 193), rgb(198, 205, 237))' }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-12">
                        <p>{GlyphText({ text: 'next level' })}</p>
                        <div className="ml-7">
                          <div className="_progressBar_1ghf2_1">
                            <div>
                              <div style={{ width: `${nextLevelProgress}%`, backgroundColor: 'rgb(245, 196, 208)' }} />
                            </div>
                          </div>
                        </div>
                        <p>{GlyphText({ text: `Limit level ${limitLevel}` })}</p>
                        <div className="ml-7">
                          <div className="_progressBar_1ghf2_1" data-limit="true">
                            <div>
                              <div data-limit="true" style={{ width: '100%', backgroundColor: 'rgb(223, 189, 221)' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center h-[340px] w-[720px] left-[53px] right-[220px] top-[294px] absolute">
                      <WindowBox label="bio" style={windowStyle}>
                        {summaryLines.map((line, index) => (
                          <p key={`${line}-${index}`} className={index === 1 || index === 2 ? 'mb-6' : 'mb-2'}>
                            {GlyphText({ text: line })}
                          </p>
                        ))}
                      </WindowBox>
                    </div>
                  </WindowBox>

                  <WindowBox
                    label="metaInfo"
                    className="w-[280px] h-[110px] m-auto absolute right-0 bottom-[110px]"
                    style={windowStyle}
                  >
                    <ul className="flex justify-between flex-col h-full">
                      <li className="flex justify-between">
                        <span>{GlyphText({ text: 'Time' })}</span>
                        <span data-label="time">{GlyphText({ text: formatClock(seconds), resource: true })}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>{GlyphText({ text: 'Gil' })}</span>
                        <span>{GlyphText({ text: String(gil), resource: true })}</span>
                      </li>
                    </ul>
                  </WindowBox>
                </>
              )}

              {page === 'projects' && (
                <>
                  <WindowBox label="header" className="h-[84px] absolute" style={windowStyle}>
                    <div className="ml-4">
                      <span>{GlyphText({ text: 'Use' })}</span>
                    </div>
                  </WindowBox>

                  <WindowBox label="description" className="h-[87px] absolute top-[93px]" style={windowStyle}>
                    {GlyphText({ text: hoverProject?.name || 'No project selected.' })}
                  </WindowBox>

                  <WindowBox label="contentLeft" className="absolute top-[190px] bottom-0" style={windowStyle}>
                    <div className="flex justify-between">
                      <div className="_portrait_15lul_1">
                        <div className="self-center relative">
                          <div className="jp-placeholder-portrait">{getInitials(cv.name)}</div>
                        </div>
                      </div>
                      <div className="ml-2 mt-[1.3rem]">
                        <p className="mb-4">{GlyphText({ text: cv.name })}</p>
                        <p className="flex">
                          <GlyphToken sprite="lv" />
                          {GlyphText({ text: String(level), resource: true })}
                        </p>
                      </div>
                    </div>

                    {!!hoverProjectLines.length && (
                      <WindowBox className="absolute bottom-[20px] left-[30px] right-[34px]" label="moreInfo" style={windowStyle}>
                        {hoverProjectLines.map((line, index) => (
                          <div key={`${line}-${index}`} className="mb-2">
                            {GlyphText({ text: line })}
                          </div>
                        ))}
                      </WindowBox>
                    )}
                  </WindowBox>

                  <WindowBox label="contentRight" className="absolute top-[190px] right-0 bottom-0" style={windowStyle}>
                    <ul>
                      {projects.map((project, index) => (
                        <li
                          key={`${project.name}-${index}`}
                          className="_item_1kefc_1 mb-2.5"
                          onMouseEnter={() => {
                            playSound('select');
                            setHoverProjectIndex(index);
                          }}
                          onClick={() => handleExternalClick(project.url)}
                        >
                          <button type="button" className="jp-button-reset flex justify-between items-center">
                            <span className="flex items-center">
                              <img src={getProjectIcon(index)} alt="" className="jp-project-icon" />
                              <span>{GlyphText({ text: project.name })}</span>
                            </span>
                            <span className="flex">
                              <span className="mr-2">{GlyphText({ text: ':' })}</span>
                              <span className="mt-1">{GlyphText({ text: '1', resource: true })}</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </WindowBox>
                </>
              )}

              {page === 'skills' && (
                <>
                  <WindowBox label="skillsHeader" className="h-[261px] absolute top-0" style={windowStyle}>
                    <div className="flex justify-between items-end">
                      <div className="w-[447px] mb-2 ml-2">
                        <div className="flex justify-between">
                          <div className="_portrait_15lul_1">
                            <div className="self-center relative">
                              <div className="jp-placeholder-portrait">{getInitials(cv.name)}</div>
                            </div>
                          </div>
                          <div className="mt-2 ml-8">
                            <p className="mb-2">{GlyphText({ text: cv.name })}</p>
                            <p className="flex">
                              <GlyphToken sprite="lv" />
                              {GlyphText({ text: String(level), resource: true })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-9 mr-2">
                        <p className="flex mt-1">
                          <span className="mr-3">{GlyphText({ text: 'Wpn.', color: 'blue' })}</span>
                          <span>{GlyphText({ text: 'Toolkit' })}</span>
                        </p>
                        <div className="_equipmentContainer_i51mu_1 flex">
                          {skills.slice(0, 5).map((skill) => (
                            <div key={skill.id} className="_materiaSlot_i51mu_14">
                              <div className="_skill_i51mu_49" data-color={skill.color}>
                                {skill.name}
                              </div>
                            </div>
                          ))}
                        </div>

                        <p className="flex mt-1">
                          <span className="mr-3">{GlyphText({ text: 'Arm.', color: 'blue' })}</span>
                          <span>{GlyphText({ text: 'Stack' })}</span>
                        </p>
                        <div className="_equipmentContainer_i51mu_1 flex">
                          {skills.slice(5, 9).map((skill) => (
                            <div key={skill.id} className="_materiaSlot_i51mu_14">
                              <div className="_skill_i51mu_49" data-color={skill.color}>
                                {skill.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </WindowBox>

                  <WindowBox label="skillsDescription" className="h-[79px] absolute top-[270px]" style={windowStyle}>
                    <p>{GlyphText({ text: selectedSkill?.description || 'No skill selected.' })}</p>
                  </WindowBox>

                  <WindowBox label="skillsContentLeft" className="absolute top-[359px] bottom-0" style={windowStyle}>
                    <div className="flex justify-between items-center">
                      <p className="_skill_1cutj_1 flex" data-color={selectedSkill?.color}>
                        {GlyphText({ text: selectedSkill?.name || 'Unknown' })}
                      </p>
                      {!!selectedSkill && (
                        <ul className="flex">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <li
                              key={index}
                              className="_star_1cutj_51"
                              data-color={selectedSkill.color}
                              data-star={index < selectedSkill.score}
                              data-crt={crtEnabled ? 'true' : undefined}
                            />
                          ))}
                        </ul>
                      )}
                    </div>
                  </WindowBox>

                  <WindowBox label="skillsContentRight" className="absolute top-[359px] right-0 bottom-0" style={windowStyle}>
                    <ul>
                      {skills.map((skill) => (
                        <li
                          key={skill.id}
                          className="mb-1.5"
                          onMouseEnter={() => {
                            playSound('select');
                            setSelectedSkillId(skill.id);
                          }}
                          onClick={() => {
                            playSound('materia');
                            setSelectedSkillId(skill.id);
                          }}
                        >
                          <span className="_skill_1cutj_1 flex" data-color={skill.color} data-active={selectedSkill?.id === skill.id ? 'true' : undefined}>
                            {GlyphText({ text: skill.name })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </WindowBox>
                </>
              )}

              {page === 'history' && (
                <WindowBox label="historyWrapper" className="w-[1000px] h-[720px] m-auto absolute top-[44px]" style={windowStyle}>
                  {historyPhase === 'select' && (
                    <>
                      <div className="relative h-[84px] mb-[10px]">
                        <WindowBox label="MemCardHeader" className="h-full absolute top-0 left-0 right-0" style={windowStyle}>
                          {GlyphText({ text: 'Select a Save Data File.' })}
                        </WindowBox>
                      </div>
                      <WindowBox label="memCardSelector" className="absolute z-1 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={windowStyle}>
                        <ul className="_historyOptions_1g8c2_1 flex flex-col items-center gap-1">
                          <li className="w-full flex justify-center mr-1" onMouseEnter={() => playSound('select')}>
                            <button type="button" className="jp-button-reset" onClick={() => setHistory('experience')}>
                              {GlyphText({ text: 'Work' })}
                            </button>
                          </li>
                          <li className="w-full flex justify-center mr-1" onMouseEnter={() => playSound('select')}>
                            <button type="button" className="jp-button-reset" onClick={() => setHistory('education')}>
                              {GlyphText({ text: 'Education' })}
                            </button>
                          </li>
                        </ul>
                      </WindowBox>
                    </>
                  )}

                  {historyPhase === 'loading' && (
                    <>
                      <div className="relative h-[84px] mb-[10px]">
                        <WindowBox label="MemCardHeader" className="h-full absolute top-0 left-0 right-0" style={windowStyle}>
                          {GlyphText({ text: 'Checking Save Data File.' })}
                        </WindowBox>
                      </div>
                      <WindowBox label="memCardLoadingBar" className="w-[27rem] h-[6rem] absolute z-2 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={windowStyle}>
                        <div className="_memCardLoadingBar_1afn4_1 h-[3rem]" data-progress={Math.min(100, historyProgress)} style={{ width: `${historyProgress}%` }} />
                      </WindowBox>
                    </>
                  )}

                  {historyPhase === 'loaded' && (
                    <>
                      <div className="relative h-[84px] mb-[10px]">
                        <WindowBox label="historyHeader" className="h-full absolute top-0 left-0 right-0" style={windowStyle}>
                          {GlyphText({ text: 'Select a file.' })}
                        </WindowBox>
                        <WindowBox label="historyFileLabel" className="h-full w-[225px] absolute top-0 right-[280px] flex" style={windowStyle}>
                          {GlyphText({ text: 'FILE', color: 'yellow' })}
                          {GlyphText({ text: historyMode === 'education' ? ' 02' : ' 01' })}
                        </WindowBox>
                      </div>

                      {historyRecords.slice(0, 3).map((record) => {
                        const ContentTag = record.link ? 'a' : 'button';
                        const contentProps = record.link
                          ? {
                              href: record.link,
                              target: '_blank',
                              rel: 'noreferrer',
                              className: 'jp-history-link',
                            }
                          : {
                              type: 'button',
                              className: 'jp-history-button',
                            };

                        return (
                          <div
                            key={record.id}
                            className="_historySave_pu0b0_1 cursor-pointer"
                            onMouseEnter={() => playSound('select')}
                            onClick={() => {
                              if (record.link) {
                                playSound('saveSelect');
                              } else {
                                playSound('error');
                              }
                            }}
                          >
                            <ContentTag {...contentProps}>
                              <WindowBox label="historySave" className="h-[235px] relative" style={windowStyle}>
                                <div className="mr-[414px] flex gap-5">
                                  <div className="jp-history-thumb">{getInitials(record.name)}</div>
                                  <div className="jp-history-thumb">{getInitials(cv.name)}</div>
                                  <div className="ml-2 mt-[1.3rem]">
                                    <p className="mb-4">{GlyphText({ text: cv.name })}</p>
                                    <p className="flex">
                                      <GlyphToken sprite="lv" />
                                      {GlyphText({ text: String(level), resource: true })}
                                    </p>
                                  </div>
                                </div>

                                <WindowBox label="historySaveMeta" className="absolute w-[27rem] h-[7rem] top-[31px] right-[-2px]" style={windowStyle}>
                                  <ul>
                                    <li className="flex justify-between mb-3">
                                      <span>{GlyphText({ text: 'Role' })}</span>
                                      <span>{GlyphText({ text: record.role })}</span>
                                    </li>
                                    <li className="flex justify-between">
                                      <span>{GlyphText({ text: 'Years' })}</span>
                                      <span>{GlyphText({ text: record.year })}</span>
                                    </li>
                                  </ul>
                                </WindowBox>

                                <WindowBox label="historySave" className="absolute w-[43.8rem] h-[5rem] bottom-[-11px] right-[-2px]" style={windowStyle}>
                                  {GlyphText({ text: record.name })}
                                </WindowBox>
                              </WindowBox>
                            </ContentTag>
                          </div>
                        );
                      })}

                      {Array.from({ length: Math.max(0, 3 - historyRecords.length) }).map((_, index) => (
                        <WindowBox key={`empty-${index}`} label="historySave" className="h-[235px] relative flex items-center jp-empty-save" style={windowStyle}>
                          <span className="pl-32">{GlyphText({ text: 'EMPTY', color: 'yellow' })}</span>
                        </WindowBox>
                      ))}
                    </>
                  )}
                </WindowBox>
              )}

              {page === 'config' && (
                <>
                  <div className="relative h-[84px] mb-[10px]">
                    <WindowBox label="configHeader" className="h-full absolute top-0 left-0 right-0" style={windowStyle}>
                      {GlyphText({ text: selectedColorSlot ? 'Adjust window colour channels' : 'Configure theme options' })}
                    </WindowBox>
                  </div>

                  <WindowBox label="configBody" className="h-[45.1rem] absolute top-[93px] left-0 right-[315px]" style={windowStyle}>
                    <ul>
                      <li className="_optionToggle_1xz4b_1 ml-24 mb-8 flex jp-stack-gap">
                        <div className="w-[24rem] flex items-end pb-1">{GlyphText({ text: 'Window Color', color: 'blue' })}</div>
                        <WindowBox label="configColorPreview" className="_colorPicker_103lp_1 w-[14rem] h-[5rem] relative" style={windowStyle}>
                          <div>
                            <div className="flex justify-between absolute left-0 top-0 right-0 h-1/2">
                              {COLOR_KEYS.slice(0, 2).map((key) => (
                                <button
                                  key={key}
                                  type="button"
                                  className="w-1/2"
                                  data-active={selectedColorSlot === key ? 'true' : undefined}
                                  style={{ backgroundColor: `rgb(${windowColor[key].join(',')})` }}
                                  onMouseEnter={() => playSound('select')}
                                  onClick={() => setSelectedColorSlot(key)}
                                />
                              ))}
                            </div>
                            <div className="flex justify-between absolute left-0 bottom-0 right-0 h-1/2">
                              {COLOR_KEYS.slice(2).map((key) => (
                                <button
                                  key={key}
                                  type="button"
                                  className="w-1/2"
                                  data-active={selectedColorSlot === key ? 'true' : undefined}
                                  style={{ backgroundColor: `rgb(${windowColor[key].join(',')})` }}
                                  onMouseEnter={() => playSound('select')}
                                  onClick={() => setSelectedColorSlot(key)}
                                />
                              ))}
                            </div>
                          </div>

                          {selectedColorSlot && (
                            <>
                              <WindowBox
                                className="_RGBPreview_103lp_15"
                                style={{ backgroundColor: `rgb(${windowColor[selectedColorSlot].join(',')})` }}
                              />
                              <div className="_RGBReset_103lp_23" data-active={JSON.stringify(windowColor[selectedColorSlot]) !== JSON.stringify(DEFAULT_WINDOW_COLOR[selectedColorSlot]) ? 'true' : undefined} onClick={resetWindowColor}>
                                <WindowBox label="reset">
                                  {GlyphText({ text: 'Reset' })}
                                </WindowBox>
                              </div>
                              <WindowBox className="_RGBSliders_103lp_54" style={windowStyle}>
                                {windowColor[selectedColorSlot].map((value, index) => (
                                  <div key={`${selectedColorSlot}-${index}`} className={index === 0 ? '_red_103lp_77' : index === 1 ? '_green_103lp_80' : '_blue_103lp_83'}>
                                    <span className="mr-3">{GlyphText({ text: String(value).padStart(3, '0'), resource: true })}</span>
                                    <input className="_RGBSlider_103lp_54" data-crt={crtEnabled ? 'true' : undefined} type="range" min="0" max="255" value={value} onChange={(event) => updateColor(index, event.target.value)} />
                                  </div>
                                ))}
                              </WindowBox>
                            </>
                          )}
                        </WindowBox>
                      </li>

                      <li className="_optionToggle_1xz4b_1 ml-24 mb-8 flex" onMouseEnter={() => playSound('select')}>
                        <div className="w-[24rem] flex items-end pb-1">{GlyphText({ text: 'Sound', color: 'blue' })}</div>
                        <div className="w-[18rem] flex justify-between">
                          <button type="button" data-disabled={!soundEnabled} className="jp-button-reset" onClick={() => setSoundEnabled(true)}>
                            {GlyphText({ text: 'On' })}
                          </button>
                          <button type="button" data-disabled={soundEnabled} className="jp-button-reset" onClick={() => setSoundEnabled(false)}>
                            {GlyphText({ text: 'Off' })}
                          </button>
                        </div>
                      </li>

                      <li className="_optionToggle_1xz4b_1 ml-24 mb-8 flex" onMouseEnter={() => playSound('select')}>
                        <div className="w-[24rem] flex items-end pb-1">{GlyphText({ text: 'CRT Effect', color: 'blue' })}</div>
                        <div className="w-[18rem] flex justify-between">
                          <button type="button" data-disabled={!crtEnabled} className="jp-button-reset" onClick={() => setCrtEnabled(true)}>
                            {GlyphText({ text: 'On' })}
                          </button>
                          <button type="button" data-disabled={crtEnabled} className="jp-button-reset" onClick={() => setCrtEnabled(false)}>
                            {GlyphText({ text: 'Off' })}
                          </button>
                        </div>
                      </li>
                    </ul>
                  </WindowBox>
                </>
              )}

              <WindowBox
                label="pageInfo"
                className="w-[535px] h-[95px] m-auto absolute right-0 top-0"
                style={windowStyle}
              >
                {GlyphText({ text: PAGE_TITLES[page] || PAGE_TITLES.home })}
              </WindowBox>

              <WindowBox
                label="menu"
                className={`m-auto w-[270px] absolute right-0 ${page !== 'home' ? 'h-[84px]' : 'h-[530px]'}`}
                data-animated={page === 'home' ? 'true' : undefined}
                style={windowStyle}
              >
                <ul className="_menu_l1p5s_1">
                  {MENU_ORDER.map((item, index) => (
                    <li key={item} className={`h-[29px] mb-4 flex justify-between`}>
                      {renderMenuItem(item, item.charAt(0).toUpperCase() + item.slice(1))}
                    </li>
                  ))}

                  {page !== 'home' && (
                    <li className="h-[29px] mb-4 flex justify-between">
                      <button
                        type="button"
                        className="jp-button-reset flex w-100"
                        data-label="close"
                        onMouseEnter={() => playSound('select')}
                        onClick={() => handleMenuClick('home')}
                      >
                        {GlyphText({ text: 'Close' })}
                      </button>
                    </li>
                  )}

                  {page === 'home' && <li className="h-[29px] mb-4 flex justify-between" />}

                  {menuLinks.map((link) => (
                    <li key={link.id} className="h-[29px] mb-4 flex justify-between">
                      <button
                        type="button"
                        className="jp-button-reset flex w-100"
                        title={link.label}
                        onMouseEnter={() => playSound('select')}
                        onClick={() => handleExternalClick(link.href)}
                      >
                        <span>{GlyphText({ text: link.label })}</span>
                        <GlyphToken sprite="external-link-icon" className="ml-2" />
                      </button>
                    </li>
                  ))}

                  {Array.from({ length: Math.max(0, 11 - MENU_ORDER.length - menuLinks.length - (page !== 'home' ? 1 : 0) - 1) }).map((_, index) => (
                    <li key={`blank-${index}`} className="h-[29px] mb-4 flex justify-between" />
                  ))}
                </ul>
              </WindowBox>
            </div>
          </div>
        </div>
      </div>
    </ShadowRoot>
  );
}
