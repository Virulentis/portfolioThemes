import React, { useEffect, useMemo, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';
import { formatDateRange, formatMonthYear } from '../../utils/cvHelpers';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Departure Mono';
    src: url('/fonts/DepartureMono-Regular.woff') format('woff');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
`;

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'history', label: 'History' },
  { id: 'config', label: 'Config' },
];

const HISTORY_MODES = [
  { id: 'experience', label: 'Work' },
  { id: 'education', label: 'Study' },
  { id: 'awards', label: 'Awards' },
];

function splitDetails(details = '') {
  return details
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseProjectTechnologies(project = {}) {
  const source = (project.highlights || []).find((item) => /^technologies\s*-/i.test(item || ''));
  if (!source) return [];
  return source
    .replace(/^technologies\s*-\s*/i, '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildSkillData(cv) {
  const skillBuckets = {
    certifications: [],
    core: [],
    project: [],
  };

  for (const item of cv.sectionsRaw?.certifications_skills || []) {
    if (!item?.details) continue;
    if (/cert/i.test(item.label || '')) {
      skillBuckets.certifications.push(...splitDetails(item.details));
      continue;
    }
    if (/skill/i.test(item.label || '')) {
      skillBuckets.core.push(...splitDetails(item.details));
    }
  }

  for (const project of cv.projects || []) {
    skillBuckets.project.push(...parseProjectTechnologies(project));
  }

  const dedupe = (items) => [...new Set(items.map((item) => item.trim()).filter(Boolean))];

  return {
    certifications: dedupe(skillBuckets.certifications).slice(0, 8),
    core: dedupe(skillBuckets.core).slice(0, 14),
    project: dedupe(skillBuckets.project).slice(0, 10),
  };
}

function getSummaryText(cv) {
  if (cv.about) return cv.about;
  if (cv.currentJobTitle && cv.location) {
    return `${cv.currentJobTitle} operating from ${cv.location}.`;
  }
  if (cv.currentJobTitle) {
    return `${cv.currentJobTitle} building across research, systems, and product work.`;
  }
  return 'Builder profile loaded. Select a file to inspect background, work history, and side quests.';
}

function getInitials(name = '') {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CV';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
}

function getHistoryEntries(cv, mode) {
  if (mode === 'education') {
    return (cv.education || []).map((item) => ({
      title: item.degree || item.area || item.institution,
      subtitle: item.institution,
      meta: item.location || '',
      date: formatDateRange(item.start_date || item.startDate, item.end_date || item.endDate),
      highlights: item.highlights || [],
      link: item.url || null,
    }));
  }

  if (mode === 'awards') {
    return (cv.awards || []).map((item) => ({
      title: item.name,
      subtitle: item.summary || 'Award',
      meta: item.location || '',
      date: formatMonthYear(item.date),
      highlights: item.highlights || [],
      link: item.url || null,
    }));
  }

  return (cv.experience || []).map((item) => ({
    title: item.title,
    subtitle: item.company,
    meta: item.location || '',
    date: formatDateRange(item.startDate, item.endDate),
    highlights: item.highlights || [],
    link: item.url || null,
  }));
}

function buildContactItems(cv) {
  const items = [
    cv.email ? { label: 'Mail', value: cv.email, href: `mailto:${cv.email}` } : null,
    cv.website ? { label: 'Site', value: cv.website.replace(/^https?:\/\//, ''), href: cv.website } : null,
    cv.socialLinks?.github ? { label: 'GitHub', value: 'Open repo trail', href: cv.socialLinks.github } : null,
    cv.socialLinks?.linkedin ? { label: 'LinkedIn', value: 'Open profile', href: cv.socialLinks.linkedin } : null,
    cv.phone ? { label: 'Phone', value: cv.phone, href: `tel:${cv.phone}` } : null,
  ];

  return items.filter(Boolean);
}

function buildStats(cv) {
  return [
    { label: 'Files', value: String((cv.experience || []).length).padStart(2, '0') },
    { label: 'Quests', value: String((cv.projects || []).length).padStart(2, '0') },
    { label: 'Awards', value: String((cv.awards || []).length).padStart(2, '0') },
    { label: 'Logs', value: String((cv.publications || []).length + (cv.presentations || []).length).padStart(2, '0') },
  ];
}

function ProfileView({ cv, summary }) {
  const spotlight = (cv.experience || []).slice(0, 3);

  return (
    <SectionStack>
      <HeroGrid>
        <WindowPanel>
          <PanelHeading>Overview</PanelHeading>
          <HeroName>{cv.name || 'Unknown Operator'}</HeroName>
          <HeroRole>{cv.currentJobTitle || 'Profile loading...'}</HeroRole>
          <HeroMeta>
            {cv.location && <span>{cv.location}</span>}
            {cv.website && (
              <a href={cv.website} target="_blank" rel="noreferrer">
                {cv.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </HeroMeta>
          <HeroText>{summary}</HeroText>
        </WindowPanel>

        <WindowPanel>
          <PanelHeading>Recent Saves</PanelHeading>
          <MiniTimeline>
            {spotlight.map((item, index) => (
              <MiniTimelineItem key={`${item.company}-${item.title}-${index}`}>
                <MiniTimelineDate>{formatDateRange(item.startDate, item.endDate)}</MiniTimelineDate>
                <MiniTimelineTitle>{item.title}</MiniTimelineTitle>
                <MiniTimelineMeta>{item.company}</MiniTimelineMeta>
              </MiniTimelineItem>
            ))}
          </MiniTimeline>
        </WindowPanel>
      </HeroGrid>

      <WindowPanel>
        <PanelHeading>Current Objectives</PanelHeading>
        <ObjectiveList>
          {(cv.projects || []).slice(0, 4).map((project, index) => (
            <ObjectiveItem key={`${project.name}-${index}`}>
              <ObjectiveName>{project.name}</ObjectiveName>
              <ObjectiveDescription>{project.summary || 'No quest note attached.'}</ObjectiveDescription>
            </ObjectiveItem>
          ))}
        </ObjectiveList>
      </WindowPanel>
    </SectionStack>
  );
}

function SkillsView({ skillData, cv }) {
  return (
    <SectionStack>
      <SkillsGrid>
        <WindowPanel>
          <PanelHeading>Core Skills</PanelHeading>
          <ChipGrid>
            {skillData.core.map((item, index) => (
              <MateriaChip key={`${item}-${index}`} $tone={index % 4}>
                {item}
              </MateriaChip>
            ))}
          </ChipGrid>
        </WindowPanel>

        <WindowPanel>
          <PanelHeading>Certifications</PanelHeading>
          <ChipGrid>
            {skillData.certifications.map((item, index) => (
              <MateriaChip key={`${item}-${index}`} $tone={(index + 1) % 4}>
                {item}
              </MateriaChip>
            ))}
          </ChipGrid>
        </WindowPanel>
      </SkillsGrid>

      <WindowPanel>
        <PanelHeading>Project Stack</PanelHeading>
        <ChipGrid>
          {skillData.project.map((item, index) => (
            <MateriaChip key={`${item}-${index}`} $tone={(index + 2) % 4}>
              {item}
            </MateriaChip>
          ))}
        </ChipGrid>
      </WindowPanel>

      {!!cv.professionalDevelopment?.length && (
        <WindowPanel>
          <PanelHeading>Training Log</PanelHeading>
          <DataList>
            {cv.professionalDevelopment.slice(0, 5).map((item, index) => (
              <DataListItem key={`${item.name}-${index}`}>
                <DataListMain>
                  <strong>{item.name}</strong>
                  <span>{item.summary || item.location}</span>
                </DataListMain>
                <DataListDate>{formatMonthYear(item.date)}</DataListDate>
              </DataListItem>
            ))}
          </DataList>
        </WindowPanel>
      )}
    </SectionStack>
  );
}

function ProjectsView({ projects, selectedProject, setSelectedProject }) {
  const currentProject = projects[selectedProject] || projects[0];
  const projectTags = parseProjectTechnologies(currentProject || {});

  return (
    <ProjectLayout>
      <WindowPanel>
        <PanelHeading>Mission Select</PanelHeading>
        <ProjectMenu>
          {projects.map((project, index) => (
            <ProjectButton
              key={`${project.name}-${index}`}
              type="button"
              $active={index === selectedProject}
              onClick={() => setSelectedProject(index)}
            >
              <span>{project.name}</span>
              <small>{project.date || 'Undated'}</small>
            </ProjectButton>
          ))}
        </ProjectMenu>
      </WindowPanel>

      <WindowPanel>
        <PanelHeading>Mission Data</PanelHeading>
        {currentProject ? (
          <ProjectDetail>
            <ProjectTitle>{currentProject.name}</ProjectTitle>
            <ProjectSummary>{currentProject.summary || 'No mission briefing attached.'}</ProjectSummary>
            {!!projectTags.length && (
              <ChipGrid>
                {projectTags.map((item, index) => (
                  <MateriaChip key={`${item}-${index}`} $tone={index % 4}>
                    {item}
                  </MateriaChip>
                ))}
              </ChipGrid>
            )}
            {!!currentProject.highlights?.length && (
              <BulletList>
                {currentProject.highlights
                  .filter((item) => !/^technologies\s*-/i.test(item || ''))
                  .map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
              </BulletList>
            )}
            <ProjectFooter>
              <span>{currentProject.date || 'No date'}</span>
              {currentProject.url ? (
                <a href={currentProject.url} target="_blank" rel="noreferrer">
                  Open link
                </a>
              ) : (
                <span>Link unavailable</span>
              )}
            </ProjectFooter>
          </ProjectDetail>
        ) : (
          <EmptyState>No project records found.</EmptyState>
        )}
      </WindowPanel>
    </ProjectLayout>
  );
}

function HistoryView({ cv, historyMode, setHistoryMode }) {
  const entries = getHistoryEntries(cv, historyMode);

  return (
    <SectionStack>
      <ToggleRow>
        {HISTORY_MODES.map((mode) => (
          <ModeButton
            key={mode.id}
            type="button"
            $active={mode.id === historyMode}
            onClick={() => setHistoryMode(mode.id)}
          >
            {mode.label}
          </ModeButton>
        ))}
      </ToggleRow>

      <WindowPanel>
        <PanelHeading>Archive</PanelHeading>
        <HistoryList>
          {entries.map((item, index) => (
            <HistoryCard key={`${item.title}-${item.subtitle}-${index}`}>
              <HistoryDate>{item.date || 'Undated'}</HistoryDate>
              <HistoryBody>
                <HistoryTitle>{item.title}</HistoryTitle>
                <HistorySubtitle>{item.subtitle}</HistorySubtitle>
                {item.meta && <HistoryMeta>{item.meta}</HistoryMeta>}
                {!!item.highlights.length && (
                  <BulletList>
                    {item.highlights.slice(0, 3).map((highlight, highlightIndex) => (
                      <li key={`${highlight}-${highlightIndex}`}>{highlight}</li>
                    ))}
                  </BulletList>
                )}
              </HistoryBody>
            </HistoryCard>
          ))}
        </HistoryList>
      </WindowPanel>
    </SectionStack>
  );
}

function ConfigView({ contactItems, cv }) {
  return (
    <SectionStack>
      <ConfigGrid>
        <WindowPanel>
          <PanelHeading>Connections</PanelHeading>
          <DataList>
            {contactItems.map((item) => (
              <DataListItem key={item.label}>
                <DataListMain>
                  <strong>{item.label}</strong>
                  <a href={item.href} target="_blank" rel="noreferrer">
                    {item.value}
                  </a>
                </DataListMain>
              </DataListItem>
            ))}
          </DataList>
        </WindowPanel>

        <WindowPanel>
          <PanelHeading>System Notes</PanelHeading>
          <SystemList>
            <li>CV source file loaded from `CV.yaml`.</li>
            <li>Theme adapted to repo data model, not Jamie Pates' hard-coded content.</li>
            <li>Best viewed wide, but mobile layout remains usable.</li>
          </SystemList>
        </WindowPanel>
      </ConfigGrid>

      {!!cv.publications?.length && (
        <WindowPanel>
          <PanelHeading>Research Log</PanelHeading>
          <DataList>
            {cv.publications.slice(0, 4).map((item, index) => (
              <DataListItem key={`${item.title}-${index}`}>
                <DataListMain>
                  <strong>{item.title}</strong>
                  <span>{item.journal || 'Publication'}</span>
                </DataListMain>
                <DataListDate>{formatMonthYear(item.date)}</DataListDate>
              </DataListItem>
            ))}
          </DataList>
        </WindowPanel>
      )}

      {!!cv.presentations?.length && (
        <WindowPanel>
          <PanelHeading>Event Log</PanelHeading>
          <DataList>
            {cv.presentations.slice(0, 4).map((item, index) => (
              <DataListItem key={`${item.name}-${index}`}>
                <DataListMain>
                  <strong>{item.name}</strong>
                  <span>{item.summary || item.location}</span>
                </DataListMain>
                <DataListDate>{formatMonthYear(item.date)}</DataListDate>
              </DataListItem>
            ))}
          </DataList>
        </WindowPanel>
      )}
    </SectionStack>
  );
}

export function JamiePatesTheme() {
  const cv = useCV();
  const [activeTab, setActiveTab] = useState('profile');
  const [historyMode, setHistoryMode] = useState('experience');
  const [selectedProject, setSelectedProject] = useState(0);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooted(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setSelectedProject(0);
  }, [cv?.projects?.length]);

  const summary = useMemo(() => getSummaryText(cv || {}), [cv]);
  const skillData = useMemo(() => buildSkillData(cv || {}), [cv]);
  const contactItems = useMemo(() => buildContactItems(cv || {}), [cv]);
  const stats = useMemo(() => buildStats(cv || {}), [cv]);

  if (!cv) return null;

  return (
    <>
      <GlobalStyle />
      <Shell>
        <Scanlines />
        <Frame $booted={booted}>
          <Rail>
            <CharacterCard>
              <PortraitOrb>{getInitials(cv.name)}</PortraitOrb>
              <RailTitle>{cv.name || 'Unknown Operator'}</RailTitle>
              <RailSubtitle>{cv.currentJobTitle || 'No role equipped'}</RailSubtitle>
              <LevelBar>
                <span>Limit</span>
                <MeterTrack>
                  <MeterFill $value={Math.min(100, 28 + (cv.projects || []).length * 8)} />
                </MeterTrack>
              </LevelBar>
            </CharacterCard>

            <NavList>
              {TABS.map((tab) => (
                <NavButton
                  key={tab.id}
                  type="button"
                  $active={tab.id === activeTab}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>{tab.label}</span>
                </NavButton>
              ))}
            </NavList>

            <StatsPanel>
              {stats.map((item) => (
                <StatRow key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </StatRow>
              ))}
            </StatsPanel>
          </Rail>

          <MainArea>
            <HeaderPanel>
              <HeaderCopy>
                <PanelHeading>Personal Sandbox</PanelHeading>
                <HeaderTitle>{activeTab}</HeaderTitle>
                <HeaderSubcopy>PS1-inspired portfolio shell rebuilt around live CV data.</HeaderSubcopy>
              </HeaderCopy>
              <HeaderMetaPanel>
                <HeaderMetaRow>
                  <span>Status</span>
                  <strong>Online</strong>
                </HeaderMetaRow>
                <HeaderMetaRow>
                  <span>Location</span>
                  <strong>{cv.location || 'Unknown'}</strong>
                </HeaderMetaRow>
              </HeaderMetaPanel>
            </HeaderPanel>

            <ContentArea>
              <PrimaryColumn>
                {activeTab === 'profile' && <ProfileView cv={cv} summary={summary} />}
                {activeTab === 'skills' && <SkillsView cv={cv} skillData={skillData} />}
                {activeTab === 'projects' && (
                  <ProjectsView
                    projects={cv.projects || []}
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                  />
                )}
                {activeTab === 'history' && (
                  <HistoryView
                    cv={cv}
                    historyMode={historyMode}
                    setHistoryMode={setHistoryMode}
                  />
                )}
                {activeTab === 'config' && <ConfigView contactItems={contactItems} cv={cv} />}
              </PrimaryColumn>

              <SecondaryColumn>
                <WindowPanel>
                  <PanelHeading>Quick Access</PanelHeading>
                  <DataList>
                    {contactItems.slice(0, 4).map((item) => (
                      <DataListItem key={item.label}>
                        <DataListMain>
                          <strong>{item.label}</strong>
                          <a href={item.href} target="_blank" rel="noreferrer">
                            {item.value}
                          </a>
                        </DataListMain>
                      </DataListItem>
                    ))}
                  </DataList>
                </WindowPanel>

                <WindowPanel>
                  <PanelHeading>Highlights</PanelHeading>
                  <DataList>
                    {(cv.awards || []).slice(0, 3).map((item, index) => (
                      <DataListItem key={`${item.name}-${index}`}>
                        <DataListMain>
                          <strong>{item.name}</strong>
                          <span>{item.summary || 'Award'}</span>
                        </DataListMain>
                        <DataListDate>{formatMonthYear(item.date)}</DataListDate>
                      </DataListItem>
                    ))}
                  </DataList>
                </WindowPanel>

                <WindowPanel>
                  <PanelHeading>Signal</PanelHeading>
                  <SignalText>
                    {(cv.projects || []).length
                      ? `${(cv.projects || []).length} active project files loaded.`
                      : 'No active project files found.'}
                  </SignalText>
                  <SignalText>
                    {(cv.experience || []).length
                      ? `${(cv.experience || []).length} work records indexed.`
                      : 'No work history indexed.'}
                  </SignalText>
                </WindowPanel>
              </SecondaryColumn>
            </ContentArea>
          </MainArea>
        </Frame>
      </Shell>
    </>
  );
}

const bootIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const Shell = styled.div`
  position: relative;
  min-height: calc(100vh - 56px);
  padding: 28px;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(48, 88, 180, 0.26), transparent 40%),
    radial-gradient(circle at bottom right, rgba(31, 164, 184, 0.18), transparent 28%),
    linear-gradient(180deg, #07111f 0%, #02060b 58%, #010205 100%);
  color: #f4f7ff;
  font-family: 'Departure Mono', 'Courier New', monospace;

  @media (max-width: 720px) {
    padding: 14px;
    min-height: calc(100vh - 52px);
  }
`;

const Scanlines = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.18;
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.08) 0,
    rgba(255, 255, 255, 0.08) 1px,
    transparent 1px,
    transparent 4px
  );
`;

const Frame = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 276px minmax(0, 1fr);
  gap: 18px;
  max-width: 1440px;
  margin: 0 auto;
  animation: ${bootIn} 320ms ease-out both;
  opacity: ${({ $booted }) => ($booted ? 1 : 0)};

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
`;

const windowSurface = `
  background:
    linear-gradient(180deg, rgba(45, 75, 150, 0.85) 0%, rgba(11, 18, 34, 0.97) 100%);
  border: 2px solid rgba(185, 203, 255, 0.7);
  border-right-color: rgba(33, 50, 96, 0.95);
  border-bottom-color: rgba(33, 50, 96, 0.95);
  box-shadow:
    inset 0 0 0 2px rgba(13, 23, 48, 0.8),
    0 18px 48px rgba(0, 0, 0, 0.34);
  border-radius: 10px;
`;

const Rail = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CharacterCard = styled.div`
  ${windowSurface}
  padding: 20px 18px;
  text-align: center;
`;

const PortraitOrb = styled.div`
  display: grid;
  place-items: center;
  width: 92px;
  height: 92px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.55), transparent 28%),
    linear-gradient(135deg, #77b5ff 0%, #654ef2 48%, #0e1326 100%);
  color: #fff;
  font-size: 28px;
  letter-spacing: 0.08em;
  box-shadow: inset 0 0 0 3px rgba(6, 18, 38, 0.6);
`;

const RailTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  text-transform: uppercase;
`;

const RailSubtitle = styled.p`
  margin: 8px 0 0;
  color: #c0d7ff;
  font-size: 12px;
  line-height: 1.5;
`;

const LevelBar = styled.div`
  margin-top: 18px;
  text-align: left;
  font-size: 11px;
  color: #9fb8eb;
`;

const MeterTrack = styled.div`
  height: 12px;
  margin-top: 8px;
  border-radius: 999px;
  background: rgba(4, 10, 20, 0.8);
  box-shadow: inset 0 0 0 2px rgba(116, 150, 231, 0.18);
  overflow: hidden;
`;

const MeterFill = styled.div`
  width: ${({ $value }) => $value}%;
  height: 100%;
  background: linear-gradient(90deg, #65dcff 0%, #a65dff 42%, #ff7aa2 100%);
`;

const NavList = styled.div`
  ${windowSurface}
  display: grid;
  gap: 8px;
  padding: 12px;

  @media (max-width: 1080px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const NavButton = styled.button`
  position: relative;
  min-height: 48px;
  padding: 12px 14px 12px 28px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(185, 212, 255, 0.9)' : 'rgba(123, 151, 222, 0.3)')};
  border-radius: 8px;
  background: ${({ $active }) =>
    $active
      ? 'linear-gradient(90deg, rgba(76, 117, 222, 0.95), rgba(40, 62, 130, 0.95))'
      : 'rgba(6, 11, 25, 0.48)'};
  color: ${({ $active }) => ($active ? '#fff' : '#bdd3ff')};
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;

  &::before {
    content: '${({ $active }) => ($active ? '>' : '+')}';
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #fff6b8;
  }
`;

const StatsPanel = styled.div`
  ${windowSurface}
  padding: 12px 14px;
  display: grid;
  gap: 10px;
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(132, 160, 235, 0.18);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  strong {
    color: #fff6b8;
    font-size: 16px;
  }
`;

const MainArea = styled.main`
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
`;

const HeaderPanel = styled.div`
  ${windowSurface}
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 20px;

  @media (max-width: 720px) {
    flex-direction: column;
  }
`;

const HeaderCopy = styled.div`
  min-width: 0;
`;

const PanelHeading = styled.div`
  margin-bottom: 12px;
  color: #9dc7ff;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: clamp(26px, 4vw, 42px);
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

const HeaderSubcopy = styled.p`
  margin: 10px 0 0;
  max-width: 56ch;
  color: #c4d7ff;
  font-size: 12px;
  line-height: 1.7;
`;

const HeaderMetaPanel = styled.div`
  min-width: 260px;
  display: grid;
  gap: 10px;
  align-content: center;

  @media (max-width: 720px) {
    min-width: 0;
  }
`;

const HeaderMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 18px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  strong {
    color: #fff6b8;
  }
`;

const ContentArea = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const PrimaryColumn = styled.div`
  min-width: 0;
`;

const SecondaryColumn = styled.div`
  display: grid;
  gap: 18px;
  align-content: start;
`;

const SectionStack = styled.div`
  display: grid;
  gap: 18px;
`;

const WindowPanel = styled.section`
  ${windowSurface}
  padding: 16px 18px;
  min-width: 0;
`;

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 18px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const HeroName = styled.h2`
  margin: 0;
  font-size: clamp(22px, 4vw, 34px);
  line-height: 1.1;
  text-transform: uppercase;
`;

const HeroRole = styled.div`
  margin-top: 10px;
  color: #fff6b8;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const HeroMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin-top: 14px;
  color: #afd0ff;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  a {
    color: inherit;
  }
`;

const HeroText = styled.p`
  margin: 18px 0 0;
  color: #e5eeff;
  font-size: 13px;
  line-height: 1.8;
`;

const MiniTimeline = styled.div`
  display: grid;
  gap: 12px;
`;

const MiniTimelineItem = styled.div`
  padding: 12px;
  border-radius: 8px;
  background: rgba(5, 10, 24, 0.5);
  border: 1px solid rgba(132, 160, 235, 0.18);
`;

const MiniTimelineDate = styled.div`
  color: #fff6b8;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const MiniTimelineTitle = styled.div`
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.5;
`;

const MiniTimelineMeta = styled.div`
  margin-top: 4px;
  color: #b8d0ff;
  font-size: 11px;
`;

const ObjectiveList = styled.div`
  display: grid;
  gap: 12px;
`;

const ObjectiveItem = styled.div`
  display: grid;
  gap: 6px;
  padding: 14px;
  border-radius: 8px;
  background: rgba(5, 10, 24, 0.5);
  border: 1px solid rgba(132, 160, 235, 0.18);
`;

const ObjectiveName = styled.div`
  color: #fff6b8;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const ObjectiveDescription = styled.div`
  color: #d7e5ff;
  font-size: 12px;
  line-height: 1.7;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ChipGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const chipTone = [
  'linear-gradient(135deg, #3ad7ff 0%, #2358ff 100%)',
  'linear-gradient(135deg, #ff74d4 0%, #7a48ff 100%)',
  'linear-gradient(135deg, #7dffae 0%, #0c8e4a 100%)',
  'linear-gradient(135deg, #ffd36e 0%, #ff6b47 100%)',
];

const MateriaChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(5, 10, 24, 0.5);
  border: 1px solid rgba(132, 160, 235, 0.18);
  font-size: 11px;
  line-height: 1.3;
  color: #f1f5ff;

  &::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${({ $tone }) => chipTone[$tone] || chipTone[0]};
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.22);
  }
`;

const DataList = styled.div`
  display: grid;
  gap: 10px;
`;

const DataListItem = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(5, 10, 24, 0.5);
  border: 1px solid rgba(132, 160, 235, 0.18);

  @media (max-width: 720px) {
    flex-direction: column;
  }
`;

const DataListMain = styled.div`
  min-width: 0;
  display: grid;
  gap: 4px;

  strong {
    font-size: 12px;
    line-height: 1.5;
  }

  span,
  a {
    color: #b9cff8;
    font-size: 11px;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }
`;

const DataListDate = styled.span`
  color: #fff6b8;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
`;

const ProjectLayout = styled.div`
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 18px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ProjectMenu = styled.div`
  display: grid;
  gap: 10px;
`;

const ProjectButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(185, 212, 255, 0.9)' : 'rgba(132, 160, 235, 0.18)')};
  background: ${({ $active }) =>
    $active
      ? 'linear-gradient(90deg, rgba(76, 117, 222, 0.95), rgba(40, 62, 130, 0.95))'
      : 'rgba(5, 10, 24, 0.5)'};
  color: #f4f7ff;
  cursor: pointer;
  text-align: left;

  span {
    font-size: 12px;
    line-height: 1.5;
  }

  small {
    color: ${({ $active }) => ($active ? '#fff6b8' : '#9dbfff')};
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
`;

const ProjectDetail = styled.div`
  display: grid;
  gap: 16px;
`;

const ProjectTitle = styled.h2`
  margin: 0;
  font-size: clamp(22px, 3vw, 32px);
  text-transform: uppercase;
  line-height: 1.15;
`;

const ProjectSummary = styled.p`
  margin: 0;
  color: #e5eeff;
  font-size: 13px;
  line-height: 1.8;
`;

const BulletList = styled.ul`
  display: grid;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;

  li {
    position: relative;
    padding-left: 18px;
    color: #d6e4ff;
    font-size: 12px;
    line-height: 1.7;
  }

  li::before {
    content: '>';
    position: absolute;
    left: 0;
    color: #fff6b8;
  }
`;

const ProjectFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 8px;
  border-top: 1px solid rgba(132, 160, 235, 0.18);
  color: #9dbfff;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  a {
    color: #fff6b8;
  }

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const EmptyState = styled.div`
  color: #b9cff8;
  font-size: 12px;
`;

const ToggleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const ModeButton = styled.button`
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(185, 212, 255, 0.9)' : 'rgba(132, 160, 235, 0.18)')};
  background: ${({ $active }) =>
    $active
      ? 'linear-gradient(90deg, rgba(76, 117, 222, 0.95), rgba(40, 62, 130, 0.95))'
      : 'rgba(5, 10, 24, 0.5)'};
  color: #f4f7ff;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
`;

const HistoryList = styled.div`
  display: grid;
  gap: 14px;
`;

const HistoryCard = styled.article`
  display: grid;
  grid-template-columns: 124px minmax(0, 1fr);
  gap: 16px;
  padding: 14px;
  border-radius: 8px;
  background: rgba(5, 10, 24, 0.5);
  border: 1px solid rgba(132, 160, 235, 0.18);

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const HistoryDate = styled.div`
  color: #fff6b8;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const HistoryBody = styled.div`
  min-width: 0;
`;

const HistoryTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
`;

const HistorySubtitle = styled.div`
  margin-top: 4px;
  color: #b7d0ff;
  font-size: 12px;
`;

const HistoryMeta = styled.div`
  margin-top: 4px;
  color: #92aad8;
  font-size: 11px;
`;

const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const SystemList = styled.ul`
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    position: relative;
    padding-left: 18px;
    color: #d7e5ff;
    font-size: 12px;
    line-height: 1.7;
  }

  li::before {
    content: '+';
    position: absolute;
    left: 0;
    color: #fff6b8;
  }
`;

const SignalText = styled.p`
  margin: 0;
  color: #d7e5ff;
  font-size: 12px;
  line-height: 1.8;
`;
