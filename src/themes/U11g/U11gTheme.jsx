import React, { useMemo, useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

function pickSocialUrl(socials, networkNames = []) {
  const lowered = networkNames.map((n) => n.toLowerCase());
  const found = socials.find((s) => lowered.includes(String(s.network || '').toLowerCase()));
  return found?.url || null;
}

// Matrix rain effect component
function MatrixRain({ active }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#22c55e';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <MatrixCanvas ref={canvasRef} />
  );
}

// Tile configuration - based on CV sections
const tileConfig = [
  { id: 'projects', number: '01', title: 'Projects', accent: '#f97316', colSpan: 2 },
  { id: 'work', number: '02', title: 'Work', accent: '#22c55e' },
  { id: 'skills', number: '03', title: 'Skills', accent: '#3b82f6' },
  { id: 'about', number: '04', title: 'About', accent: '#a855f7' },
  { id: 'education', number: '05', title: 'Education', accent: '#ec4899' },
  { id: 'awards', number: '06', title: 'Awards', accent: '#eab308' },
  { id: 'more', number: '07', title: 'More', accent: '#14b8a6' },
  { id: 'contact', number: '08', title: 'Contact', accent: '#06b6d4' },
];

export function U11gTheme() {
  const { cvData, getAboutContent } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);
  const [activePage, setActivePage] = useState(null);
  const [hoveredTile, setHoveredTile] = useState(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fullName = cv?.name || 'Your Name';
  const email = cv?.email || null;

  const socials = cv?.social || [];
  const githubUrl = pickSocialUrl(socials, ['github']);
  const linkedinUrl = pickSocialUrl(socials, ['linkedin']);
  const twitterUrl = pickSocialUrl(socials, ['twitter', 'x']);

  const aboutText = getAboutContent()?.markdown || '';

  // Experience items
  const experienceItems = useMemo(() => {
    const items = [];
    const experiences = (cv?.sections?.experience || []).filter(e => !isArchived(e));

    for (const exp of experiences) {
      if (Array.isArray(exp.positions) && exp.positions.length > 0) {
        for (const pos of exp.positions) {
          items.push({
            company: exp.company,
            title: pos.title || pos.position,
            description: pos.description || exp.description || '',
            url: exp.url || '',
          });
        }
      } else {
        items.push({
          company: exp.company,
          title: exp.position,
          description: exp.description || '',
          url: exp.url || '',
        });
      }
    }

    return items;
  }, [cv]);

  // Project items
  const projectItems = useMemo(() => {
    return (cv?.sections?.projects || []).filter(e => !isArchived(e));
  }, [cv]);

  // Skills
  const skills = useMemo(() => {
    return cv?.sections?.skills || [];
  }, [cv]);

  // Education
  const educationItems = useMemo(() => {
    return (cv?.sections?.education || []).filter(e => !isArchived(e));
  }, [cv]);

  // Awards
  const awardItems = useMemo(() => {
    return (cv?.sections?.awards || []).filter(e => !isArchived(e));
  }, [cv]);

  // Volunteer
  const volunteerItems = useMemo(() => {
    return (cv?.sections?.volunteer || []).filter(e => !isArchived(e));
  }, [cv]);

  // Publications
  const publicationItems = useMemo(() => {
    return (cv?.sections?.publications || []).filter(e => !isArchived(e));
  }, [cv]);

  // Presentations
  const presentationItems = useMemo(() => {
    return (cv?.sections?.presentations || []).filter(e => !isArchived(e));
  }, [cv]);

  // Professional Development
  const professionalDevItems = useMemo(() => {
    return (cv?.sections?.professional_development || []).filter(e => !isArchived(e));
  }, [cv]);

  // Command palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
        setSearchQuery('');
      }
      if (e.key === 'Escape') {
        if (showCommandPalette) {
          setShowCommandPalette(false);
        } else if (activePage) {
          setActivePage(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette, activePage]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [
        ...tileConfig.map(t => ({ type: 'NAVIGATE', label: t.title, id: t.id })),
        ...projectItems.slice(0, 5).map(p => ({ type: 'PROJECT', label: p.name, url: p.url })),
      ];
    }
    const q = searchQuery.toLowerCase();
    const results = [];

    tileConfig.forEach(t => {
      if (t.title.toLowerCase().includes(q)) {
        results.push({ type: 'NAVIGATE', label: t.title, id: t.id });
      }
    });

    projectItems.forEach(p => {
      if (p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) {
        results.push({ type: 'PROJECT', label: p.name, url: p.url });
      }
    });

    return results.slice(0, 10);
  }, [searchQuery, projectItems]);

  const handleResultClick = (result) => {
    if (result.type === 'NAVIGATE') {
      setActivePage(result.id);
    } else if (result.url) {
      window.open(result.url, '_blank');
    }
    setShowCommandPalette(false);
  };

  const handleTileClick = (tileId) => {
    setActivePage(tileId);
  };

  const renderSubpage = () => {
    if (!activePage) return null;

    const tile = tileConfig.find(t => t.id === activePage);

    return (
      <SubpageOverlay onClick={() => setActivePage(null)}>
        <SubpageContent onClick={(e) => e.stopPropagation()}>
          <SubpageHeader>
            <SubpageNumber>{tile?.number}</SubpageNumber>
            <SubpageTitle>{tile?.title}</SubpageTitle>
            <CloseButton onClick={() => setActivePage(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </CloseButton>
          </SubpageHeader>
          <SubpageBody>
            {activePage === 'projects' && (
              <SubpageGrid>
                {projectItems.map((project, idx) => (
                  <ProjectCard
                    key={idx}
                    href={project.url}
                    target="_blank"
                    rel="noopener"
                    as={project.url ? 'a' : 'div'}
                  >
                    <ProjectName>{project.name}</ProjectName>
                    {project.description && (
                      <ProjectDesc>{project.description}</ProjectDesc>
                    )}
                  </ProjectCard>
                ))}
              </SubpageGrid>
            )}
            {activePage === 'work' && (
              <WorkList>
                {experienceItems.map((exp, idx) => (
                  <WorkItem key={idx}>
                    <WorkCompany>{exp.company}</WorkCompany>
                    <WorkTitle>{exp.title}</WorkTitle>
                    {exp.description && <WorkDesc>{exp.description}</WorkDesc>}
                  </WorkItem>
                ))}
              </WorkList>
            )}
            {activePage === 'about' && (
              <AboutContent>
                <AboutName>{fullName}</AboutName>
                <AboutBio>{aboutText}</AboutBio>
              </AboutContent>
            )}
            {activePage === 'skills' && (
              <SkillsGrid>
                {skills.map((skill, idx) => (
                  <SkillCard key={idx}>
                    <SkillName>{skill.name || skill}</SkillName>
                    {skill.keywords && (
                      <SkillTags>
                        {skill.keywords.map((kw, i) => (
                          <SkillTag key={i}>{kw}</SkillTag>
                        ))}
                      </SkillTags>
                    )}
                  </SkillCard>
                ))}
              </SkillsGrid>
            )}
            {activePage === 'education' && (
              <WorkList>
                {educationItems.map((edu, idx) => (
                  <WorkItem key={idx}>
                    <WorkCompany>{edu.institution}</WorkCompany>
                    <WorkTitle>{edu.area || edu.studyType}</WorkTitle>
                    {edu.studyType && edu.area && <WorkDesc>{edu.studyType}</WorkDesc>}
                  </WorkItem>
                ))}
              </WorkList>
            )}
            {activePage === 'awards' && (
              <WorkList>
                {awardItems.map((award, idx) => (
                  <WorkItem key={idx}>
                    <WorkCompany>{award.date}</WorkCompany>
                    <WorkTitle>{award.name}</WorkTitle>
                    {award.summary && <WorkDesc>{award.summary}</WorkDesc>}
                  </WorkItem>
                ))}
              </WorkList>
            )}
            {activePage === 'more' && (
              <WorkList>
                {volunteerItems.length > 0 && (
                  <>
                    <SubpageSectionLabel>Volunteer</SubpageSectionLabel>
                    {volunteerItems.map((vol, idx) => (
                      <WorkItem key={`vol-${idx}`}>
                        <WorkCompany>{vol.organization}</WorkCompany>
                        <WorkTitle>{vol.position || vol.title}</WorkTitle>
                        {vol.summary && <WorkDesc>{vol.summary}</WorkDesc>}
                      </WorkItem>
                    ))}
                  </>
                )}
                {publicationItems.length > 0 && (
                  <>
                    <SubpageSectionLabel>Publications</SubpageSectionLabel>
                    {publicationItems.map((pub, idx) => (
                      <WorkItem key={`pub-${idx}`}>
                        <WorkCompany>{pub.journal} ({pub.date})</WorkCompany>
                        <WorkTitle>{pub.title}</WorkTitle>
                      </WorkItem>
                    ))}
                  </>
                )}
                {presentationItems.length > 0 && (
                  <>
                    <SubpageSectionLabel>Presentations</SubpageSectionLabel>
                    {presentationItems.map((pres, idx) => (
                      <WorkItem key={`pres-${idx}`}>
                        <WorkCompany>{pres.date}{pres.location ? ` — ${pres.location}` : ''}</WorkCompany>
                        <WorkTitle>{pres.name}</WorkTitle>
                        {pres.summary && <WorkDesc>{pres.summary}</WorkDesc>}
                      </WorkItem>
                    ))}
                  </>
                )}
                {professionalDevItems.length > 0 && (
                  <>
                    <SubpageSectionLabel>Professional Development</SubpageSectionLabel>
                    {professionalDevItems.map((item, idx) => (
                      <WorkItem key={`pd-${idx}`}>
                        <WorkCompany>{item.date}{item.location ? ` — ${item.location}` : ''}</WorkCompany>
                        <WorkTitle>{item.name}</WorkTitle>
                        {item.summary && <WorkDesc>{item.summary}</WorkDesc>}
                      </WorkItem>
                    ))}
                  </>
                )}
              </WorkList>
            )}
            {activePage === 'contact' && (
              <ContactContent>
                {email && (
                  <ContactItem href={`mailto:${email}`}>
                    <ContactLabel>Email</ContactLabel>
                    <ContactValue>{email}</ContactValue>
                  </ContactItem>
                )}
                {githubUrl && (
                  <ContactItem href={githubUrl} target="_blank" rel="noopener">
                    <ContactLabel>GitHub</ContactLabel>
                    <ContactValue>{githubUrl}</ContactValue>
                  </ContactItem>
                )}
                {linkedinUrl && (
                  <ContactItem href={linkedinUrl} target="_blank" rel="noopener">
                    <ContactLabel>LinkedIn</ContactLabel>
                    <ContactValue>{linkedinUrl}</ContactValue>
                  </ContactItem>
                )}
                {twitterUrl && (
                  <ContactItem href={twitterUrl} target="_blank" rel="noopener">
                    <ContactLabel>X / Twitter</ContactLabel>
                    <ContactValue>{twitterUrl}</ContactValue>
                  </ContactItem>
                )}
              </ContactContent>
            )}
          </SubpageBody>
        </SubpageContent>
      </SubpageOverlay>
    );
  };

  return (
    <Container>
      <Dashboard>
        {/* Render tiles dynamically from config */}
        {tileConfig.map((tile) => (
          <Tile
            key={tile.id}
            $colSpan={tile.colSpan}
            $rowSpan={tile.rowSpan}
            $accent={tile.accent}
            onClick={() => handleTileClick(tile.id)}
            onMouseEnter={() => setHoveredTile(tile.id)}
            onMouseLeave={() => setHoveredTile(null)}
          >
            {tile.id === 'projects' && <MatrixRain active={hoveredTile === 'projects'} />}
            <TileContent>
              <TileNumber>{tile.number}</TileNumber>
              <TileBottom>
                <TileTitle $large={tile.colSpan === 2}>{tile.title}</TileTitle>
                <TileAccent $color={tile.accent} />
              </TileBottom>
            </TileContent>
          </Tile>
        ))}

        {/* Action Menu Tile */}
        <ActionTile>
          <ActionTop>
            <SocialLinks>
              {githubUrl && (
                <SocialIcon href={githubUrl} target="_blank" rel="noopener" aria-label="GitHub">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </SocialIcon>
              )}
              {linkedinUrl && (
                <SocialIcon href={linkedinUrl} target="_blank" rel="noopener" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </SocialIcon>
              )}
              {twitterUrl && (
                <SocialIcon href={twitterUrl} target="_blank" rel="noopener" aria-label="X">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </SocialIcon>
              )}
              {email && (
                <SocialIcon href={`mailto:${email}`} aria-label="Email">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </SocialIcon>
              )}
            </SocialLinks>
          </ActionTop>
          <ActionBottom>
            <CmdKButton onClick={() => setShowCommandPalette(true)}>
              <kbd>⌘</kbd>
              <span>+</span>
              <kbd>K</kbd>
            </CmdKButton>
            <MoreButton>MORE</MoreButton>
          </ActionBottom>
        </ActionTile>
      </Dashboard>

      {/* Subpage */}
      {renderSubpage()}

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPaletteOverlay onClick={() => setShowCommandPalette(false)}>
          <CommandPalette onClick={(e) => e.stopPropagation()}>
            <CommandHeader>
              <CommandCursor>▐</CommandCursor>
              <CommandInput
                type="text"
                placeholder="ENTER COMMAND..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </CommandHeader>
            <CommandResults>
              {searchResults.map((result, idx) => (
                <CommandItem key={idx} onClick={() => handleResultClick(result)}>
                  <CommandItemLabel>{result.label}</CommandItemLabel>
                  <CommandItemType $type={result.type}>{result.type}</CommandItemType>
                </CommandItem>
              ))}
            </CommandResults>
          </CommandPalette>
        </CommandPaletteOverlay>
      )}
    </Container>
  );
}

// Color palette
const colors = {
  appBg: '#27272a',
  surface: '#0a0a0a',
  surfaceHover: '#18181b',
  primary: '#ffffff',
  secondary: '#a1a1aa',
  passive: '#333333',
};

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// Styled Components
const Container = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: ${colors.appBg};
  color: ${colors.primary};
  font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
`;

const Dashboard = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-rows: 1fr;
  gap: 1px;
  background: ${colors.appBg};
  width: 100%;
  height: 100%;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }
`;

const Tile = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  background: ${colors.surface};
  border: none;
  color: ${colors.primary};
  cursor: pointer;
  transition: background 0.2s;
  overflow: hidden;
  text-align: left;

  @media (min-width: 768px) {
    padding: 24px;
    grid-column: ${props => props.$colSpan ? `span ${props.$colSpan}` : 'span 1'};
    grid-row: ${props => props.$rowSpan ? `span ${props.$rowSpan}` : 'span 1'};
  }

  &:hover {
    background: ${colors.surfaceHover};
  }
`;

const MatrixCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.3;
`;

const TileContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const TileNumber = styled.span`
  font-size: 14px;
  color: ${colors.secondary};
  font-family: 'JetBrains Mono', monospace;
`;

const TileBottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TileTitle = styled.h2`
  font-size: ${props => props.$large ? '48px' : '24px'};
  font-weight: normal;
  margin: 0;
  font-family: 'JetBrains Mono', monospace;

  @media (min-width: 768px) {
    font-size: ${props => props.$large ? '64px' : '32px'};
  }
`;

const TileAccent = styled.div`
  width: 32px;
  height: 4px;
  background: ${props => props.$color};
`;

const ActionTile = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  background: ${colors.surface};

  @media (min-width: 768px) {
    padding: 24px;
  }
`;

const ActionTop = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 8px;
`;

const SocialIcon = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${colors.surfaceHover};
  border-radius: 50%;
  color: ${colors.secondary};
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    color: ${colors.primary};
    background: ${colors.passive};
  }
`;

const ActionBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const CmdKButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: ${colors.surfaceHover};
  border: 1px solid ${colors.passive};
  border-radius: 6px;
  color: ${colors.secondary};
  cursor: pointer;
  transition: all 0.2s;

  kbd {
    font-family: inherit;
    font-size: 12px;
    padding: 2px 6px;
    background: ${colors.surface};
    border: 1px solid ${colors.passive};
    border-radius: 3px;
  }

  span {
    font-size: 10px;
  }

  &:hover {
    color: ${colors.primary};
    border-color: ${colors.secondary};
  }
`;

const MoreButton = styled.button`
  padding: 8px 16px;
  background: transparent;
  border: 1px solid ${colors.passive};
  border-radius: 4px;
  color: ${colors.secondary};
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${colors.primary};
    border-color: ${colors.secondary};
  }
`;

// Subpage styles
const SubpageOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const SubpageContent = styled.div`
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  background: ${colors.surface};
  border: 1px solid ${colors.passive};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const SubpageHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid ${colors.passive};
  gap: 16px;
`;

const SubpageNumber = styled.span`
  font-size: 14px;
  color: ${colors.secondary};
`;

const SubpageTitle = styled.h1`
  font-size: 32px;
  font-weight: normal;
  margin: 0;
  flex: 1;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid ${colors.passive};
  color: ${colors.secondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${colors.primary};
    border-color: ${colors.secondary};
  }
`;

const SubpageBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const SubpageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
`;

const ProjectCard = styled.a`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  background: ${colors.surfaceHover};
  border: 1px solid ${colors.passive};
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;

  &:hover {
    border-color: ${colors.secondary};
  }
`;

const ProjectName = styled.h3`
  font-size: 18px;
  font-weight: normal;
  margin: 0;
`;

const ProjectDesc = styled.p`
  font-size: 14px;
  color: ${colors.secondary};
  margin: 0;
  line-height: 1.5;
`;

const SubpageSectionLabel = styled.h2`
  font-size: 14px;
  text-transform: uppercase;
  color: ${colors.secondary};
  margin: 24px 0 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${colors.passive};

  &:first-child {
    margin-top: 0;
  }
`;

const WorkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const WorkItem = styled.div`
  padding: 20px;
  background: ${colors.surfaceHover};
  border: 1px solid ${colors.passive};
`;

const WorkCompany = styled.div`
  font-size: 12px;
  color: ${colors.secondary};
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const WorkTitle = styled.h3`
  font-size: 18px;
  font-weight: normal;
  margin: 0 0 8px;
`;

const WorkDesc = styled.p`
  font-size: 14px;
  color: ${colors.secondary};
  margin: 0;
  line-height: 1.5;
`;

const AboutContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const AboutName = styled.h2`
  font-size: 32px;
  font-weight: normal;
  margin: 0;
`;

const AboutBio = styled.p`
  font-size: 16px;
  color: ${colors.secondary};
  line-height: 1.8;
  margin: 0;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

const SkillCard = styled.div`
  padding: 20px;
  background: ${colors.surfaceHover};
  border: 1px solid ${colors.passive};
`;

const SkillName = styled.h3`
  font-size: 16px;
  font-weight: normal;
  margin: 0 0 12px;
  color: ${colors.primary};
`;

const SkillTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const SkillTag = styled.span`
  font-size: 11px;
  padding: 4px 8px;
  background: ${colors.surface};
  border: 1px solid ${colors.passive};
  color: ${colors.secondary};
`;

const ContactContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ContactItem = styled.a`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 20px;
  background: ${colors.surfaceHover};
  border: 1px solid ${colors.passive};
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;

  &:hover {
    border-color: ${colors.secondary};
  }
`;

const ContactLabel = styled.span`
  font-size: 12px;
  color: ${colors.secondary};
  text-transform: uppercase;
`;

const ContactValue = styled.span`
  font-size: 16px;
  color: ${colors.primary};
`;

// Command Palette
const CommandPaletteOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: flex-end;
`;

const CommandPalette = styled.div`
  width: 100%;
  max-height: 75vh;
  background: ${colors.surface};
  border-top: 1px solid ${colors.passive};
  display: flex;
  flex-direction: column;
  padding: 32px;
`;

const CommandHeader = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${colors.passive};
  padding-bottom: 24px;
  margin-bottom: 24px;
`;

const CommandCursor = styled.span`
  color: #f97316;
  font-size: 32px;
  margin-right: 24px;
  animation: ${pulse} 1s infinite;
`;

const CommandInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 32px;
  font-family: inherit;
  color: ${colors.primary};
  text-transform: uppercase;
  letter-spacing: -0.02em;

  &::placeholder {
    color: ${colors.passive};
  }

  @media (min-width: 768px) {
    font-size: 48px;
  }
`;

const CommandResults = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: ${colors.passive}50;
  border: 1px solid ${colors.passive}50;
`;

const CommandItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: ${colors.surface};
  border: none;
  color: ${colors.secondary};
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: ${colors.surfaceHover};
    color: ${colors.primary};
  }
`;

const CommandItemLabel = styled.span`
  font-size: 18px;
  font-family: inherit;

  @media (min-width: 768px) {
    font-size: 24px;
  }
`;

const CommandItemType = styled.span`
  font-size: 10px;
  padding: 4px 8px;
  text-transform: uppercase;
  font-weight: bold;
  color: ${colors.surface};
  background: ${props => {
    switch (props.$type) {
      case 'NAVIGATE': return '#a855f7';
      case 'PROJECT': return '#f97316';
      default: return colors.secondary;
    }
  }};
`;
