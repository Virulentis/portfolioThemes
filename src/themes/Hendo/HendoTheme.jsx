import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

function pickSocialUrl(socials, networkNames = []) {
  const lowered = networkNames.map((n) => n.toLowerCase());
  const found = socials.find((s) => lowered.includes(String(s.network || '').toLowerCase()));
  return found?.url || null;
}

// Light and dark themes
const lightTheme = {
  background: '#ffffff',
  foreground: '#1a1a2e',
  mutedForeground: '#6b7280',
  border: '#e5e7eb',
  accent: '#2563eb',
};

const darkTheme = {
  background: '#1e1e1e',
  foreground: '#f5f5f5',
  mutedForeground: '#9ca3af',
  border: 'rgba(255, 255, 255, 0.1)',
  accent: '#60a5fa',
};

// Scramble text component
function ScrambleText({ text, className }) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+';
  const iterationRef = useRef(0);

  useEffect(() => {
    let interval;
    if (isHovering) {
      iterationRef.current = 0;
      interval = setInterval(() => {
        setDisplayText(
          text.split('').map((char, i) => {
            if (char === ' ') return ' ';
            return characters[Math.floor(Math.random() * characters.length)];
          }).join('')
        );
        iterationRef.current++;
        if (iterationRef.current >= 10) {
          clearInterval(interval);
          setDisplayText(text);
        }
      }, 50);
    } else {
      setDisplayText(text);
    }
    return () => clearInterval(interval);
  }, [isHovering, text]);

  return (
    <span
      className={className}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{ cursor: 'pointer' }}
    >
      {displayText}
    </span>
  );
}

const NAV_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'volunteer', label: 'Volunteer' },
  { id: 'awards', label: 'Awards' },
  { id: 'presentations', label: 'Presentations' },
  { id: 'publications', label: 'Publications' },
  { id: 'professional-development', label: 'Prof. Dev.' },
];

export function HendoTheme() {
  const { cvData, getAboutContent } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);
  const [activeSection, setActiveSection] = useState('about');
  const [isDark, setIsDark] = useState(false);

  const fullName = cv?.name || 'Your Name';
  const email = cv?.email || null;
  const phone = cv?.phone || null;
  const location = cv?.location || null;

  const socials = cv?.social || [];
  const githubUrl = pickSocialUrl(socials, ['github']);
  const linkedinUrl = pickSocialUrl(socials, ['linkedin']);
  const twitterUrl = pickSocialUrl(socials, ['twitter', 'x']);

  const aboutText = getAboutContent()?.markdown || '';

  const experienceItems = useMemo(() => {
    return (cv?.sections?.experience || []).filter(e => !isArchived(e)).slice(0, 8);
  }, [cv]);

  const projectItems = useMemo(() => {
    return (cv?.sections?.projects || []).filter(e => !isArchived(e)).slice(0, 8);
  }, [cv]);

  const educationItems = useMemo(() => {
    return (cv?.sections?.education || []).filter(e => !isArchived(e));
  }, [cv]);

  const awardItems = useMemo(() => {
    return (cv?.sections?.awards || []).filter(e => !isArchived(e));
  }, [cv]);

  const presentationItems = useMemo(() => {
    return (cv?.sections?.presentations || []).filter(e => !isArchived(e));
  }, [cv]);

  const publicationItems = useMemo(() => {
    return (cv?.sections?.publications || []).filter(e => !isArchived(e));
  }, [cv]);

  const professionalDevItems = useMemo(() => {
    return (cv?.sections?.professional_development || []).filter(e => !isArchived(e));
  }, [cv]);

  const volunteerItems = useMemo(() => {
    return (cv?.sections?.volunteer || []).filter(e => !isArchived(e));
  }, [cv]);

  // Filter nav items based on available content
  const visibleNavItems = NAV_ITEMS.filter(item => {
    if (item.id === 'about') return true;
    if (item.id === 'experience') return experienceItems.length > 0;
    if (item.id === 'projects') return projectItems.length > 0;
    if (item.id === 'education') return educationItems.length > 0;
    if (item.id === 'volunteer') return volunteerItems.length > 0;
    if (item.id === 'awards') return awardItems.length > 0;
    if (item.id === 'presentations') return presentationItems.length > 0;
    if (item.id === 'publications') return publicationItems.length > 0;
    if (item.id === 'professional-development') return professionalDevItems.length > 0;
    return true;
  });

  const theme = isDark ? darkTheme : lightTheme;

  const renderContent = () => {
    switch (activeSection) {
      case 'experience':
        return (
          <ContentArea>
            <PageHeader>Experience</PageHeader>
            <DividedList>
              {experienceItems.map((exp, idx) => (
                <DividedItem key={`exp-${idx}`}>
                  <ItemRow>
                    <ItemTitle>{exp.position} at {exp.company}</ItemTitle>
                    <ItemMeta>{exp.start_date} - {exp.end_date || 'Present'}</ItemMeta>
                  </ItemRow>
                </DividedItem>
              ))}
            </DividedList>
          </ContentArea>
        );

      case 'projects':
        return (
          <ContentArea>
            <PageHeader>Projects</PageHeader>
            <DividedList>
              {projectItems.map((project, idx) => (
                <DividedItem key={`proj-${idx}`}>
                  <ItemRow>
                    {project.url ? (
                      <ItemLink href={project.url} target="_blank" rel="noreferrer">
                        {project.name}
                      </ItemLink>
                    ) : (
                      <ItemTitle>{project.name}</ItemTitle>
                    )}
                  </ItemRow>
                  {project.summary && <ItemDesc>{project.summary}</ItemDesc>}
                </DividedItem>
              ))}
            </DividedList>
          </ContentArea>
        );

      case 'education':
        return (
          <ContentArea>
            <PageHeader>Education</PageHeader>
            <DividedList>
              {educationItems.map((edu, idx) => (
                <DividedItem key={`edu-${idx}`}>
                  <ItemRow>
                    <ItemTitle>{edu.degree} in {edu.area}</ItemTitle>
                    <ItemMeta>{edu.end_date || edu.start_date}</ItemMeta>
                  </ItemRow>
                  <ItemDesc>{edu.institution}</ItemDesc>
                </DividedItem>
              ))}
            </DividedList>
          </ContentArea>
        );

      case 'volunteer':
        return (
          <ContentArea>
            <PageHeader>Volunteer</PageHeader>
            <DividedList>
              {volunteerItems.map((vol, idx) => (
                <DividedItem key={`vol-${idx}`}>
                  <ItemRow>
                    <ItemTitle>{vol.position || vol.title} at {vol.organization}</ItemTitle>
                    <ItemMeta>{vol.start_date} - {vol.end_date || 'Present'}</ItemMeta>
                  </ItemRow>
                  {vol.summary && <ItemDesc>{vol.summary}</ItemDesc>}
                </DividedItem>
              ))}
            </DividedList>
          </ContentArea>
        );

      case 'awards':
        return (
          <ContentArea>
            <PageHeader>Awards</PageHeader>
            <DividedList>
              {awardItems.map((award, idx) => (
                <DividedItem key={`award-${idx}`}>
                  <ItemRow>
                    <ItemTitle>{award.name}</ItemTitle>
                    <ItemMeta>{award.date}</ItemMeta>
                  </ItemRow>
                  {award.summary && <ItemDesc>{award.summary}</ItemDesc>}
                </DividedItem>
              ))}
            </DividedList>
          </ContentArea>
        );

      case 'presentations':
        return (
          <ContentArea>
            <PageHeader>Presentations</PageHeader>
            <DividedList>
              {presentationItems.map((pres, idx) => (
                <DividedItem key={`pres-${idx}`}>
                  <ItemRow>
                    <ItemTitle>{pres.name}</ItemTitle>
                    <ItemMeta>{pres.date}</ItemMeta>
                  </ItemRow>
                  {pres.location && <ItemDesc>{pres.location}</ItemDesc>}
                  {pres.summary && <ItemDesc>{pres.summary}</ItemDesc>}
                </DividedItem>
              ))}
            </DividedList>
          </ContentArea>
        );

      case 'publications':
        return (
          <ContentArea>
            <PageHeader>Publications</PageHeader>
            <DividedList>
              {publicationItems.map((pub, idx) => (
                <DividedItem key={`pub-${idx}`}>
                  <ItemRow>
                    {pub.doi ? (
                      <ItemLink href={`https://doi.org/${pub.doi}`} target="_blank" rel="noreferrer">
                        {pub.name || pub.title}
                      </ItemLink>
                    ) : pub.url ? (
                      <ItemLink href={pub.url} target="_blank" rel="noreferrer">
                        {pub.name || pub.title}
                      </ItemLink>
                    ) : (
                      <ItemTitle>{pub.name || pub.title}</ItemTitle>
                    )}
                    <ItemMeta>{pub.date || pub.releaseDate}</ItemMeta>
                  </ItemRow>
                  {pub.authors && <ItemDesc>{pub.authors}</ItemDesc>}
                  {pub.journal && <ItemDesc>{pub.journal}</ItemDesc>}
                </DividedItem>
              ))}
            </DividedList>
          </ContentArea>
        );

      case 'professional-development':
        return (
          <ContentArea>
            <PageHeader>Professional Development</PageHeader>
            <DividedList>
              {professionalDevItems.map((item, idx) => (
                <DividedItem key={`profdev-${idx}`}>
                  <ItemRow>
                    <ItemTitle>{item.name}</ItemTitle>
                    <ItemMeta>{item.date}</ItemMeta>
                  </ItemRow>
                  {item.location && <ItemDesc>{item.location}</ItemDesc>}
                  {item.summary && <ItemDesc>{item.summary}</ItemDesc>}
                </DividedItem>
              ))}
            </DividedList>
          </ContentArea>
        );

      default: // about
        return (
          <AboutArea>
            <AboutText>
              Hello World, I am <strong>{fullName}</strong>. {aboutText}
            </AboutText>
            {location && (
              <AboutText>Based in {location}.</AboutText>
            )}
            <SocialRow>
              {githubUrl && (
                <SocialIcon href={githubUrl} target="_blank" rel="noreferrer" title="GitHub">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </SocialIcon>
              )}
              {twitterUrl && (
                <SocialIcon href={twitterUrl} target="_blank" rel="noreferrer" title="Twitter">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </SocialIcon>
              )}
              {linkedinUrl && (
                <SocialIcon href={linkedinUrl} target="_blank" rel="noreferrer" title="LinkedIn">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </SocialIcon>
              )}
              {email && (
                <SocialIcon href={`mailto:${email}`} title="Email">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </SocialIcon>
              )}
              {phone && (
                <SocialIcon href={`tel:${phone}`} title="Phone">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </SocialIcon>
              )}
            </SocialRow>
          </AboutArea>
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Container>
        <Navbar>
          <NavLeft>
            <NavBrand
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveSection('about'); }}
            >
              <ScrambleText text={fullName.toLowerCase().replace(/\s+/g, '')} />
            </NavBrand>
          </NavLeft>
          <NavRight>
            {visibleNavItems.slice(1).map(item => (
              <NavLink
                key={item.id}
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveSection(item.id); }}
                $active={activeSection === item.id}
              >
                <ScrambleText text={item.label} />
              </NavLink>
            ))}
            {email && (
              <NavLink href={`mailto:${email}`}>
                <ScrambleText text="Email" />
              </NavLink>
            )}
          </NavRight>
        </Navbar>

        {activeSection !== 'about' && (
          <Breadcrumbs>
            <BreadcrumbList>
              <BreadcrumbLink
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveSection('about'); }}
              >
                Home
              </BreadcrumbLink>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbCurrent>
                {visibleNavItems.find(item => item.id === activeSection)?.label || activeSection}
              </BreadcrumbCurrent>
            </BreadcrumbList>
          </Breadcrumbs>
        )}

        <Main $hasBreakcrumbs={activeSection !== 'about'}>
          {renderContent()}
        </Main>

        <ThemeToggle
          onClick={() => setIsDark(!isDark)}
          $isDark={isDark}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        />
      </Container>
    </ThemeProvider>
  );
}

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
`;

const Container = styled.div`
  height: 100%;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.foreground};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const Navbar = styled.nav`
  flex-shrink: 0;
  z-index: 50;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: ${props => props.theme.background};
  transition: background-color 0.3s ease;
  max-width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 0.5rem 1.5rem;
  }
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
`;

const NavBrand = styled.a`
  color: ${props => props.theme.mutedForeground};
  text-decoration: none;
  font-size: 14px;

  @media (min-width: 768px) {
    font-size: 16px;
  }

  &:hover {
    color: ${props => props.theme.foreground};
  }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (min-width: 768px) {
    gap: 1rem;
    flex-wrap: nowrap;
  }
`;

const NavLink = styled.a`
  color: ${props => props.theme.foreground};
  text-decoration: none;
  font-size: 12px;
  white-space: nowrap;

  @media (min-width: 768px) {
    font-size: 16px;
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  max-width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
`;

const Breadcrumbs = styled.div`
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  width: 100%;
  padding-top: 0.5rem;
`;

const BreadcrumbList = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background-color: ${props => props.theme.background};
  font-family: 'DM Mono', 'SF Mono', monospace;
  font-size: 14px;
  border-radius: 0.25rem;
`;

const BreadcrumbLink = styled.a`
  color: ${props => props.theme.foreground};
  text-decoration: none;

  &:hover {
    opacity: 0.7;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: ${props => props.theme.mutedForeground};
`;

const BreadcrumbCurrent = styled.span`
  color: ${props => props.theme.mutedForeground};
`;

const AboutArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 320px;
  width: 100%;
  text-wrap: balance;
`;

const AboutText = styled.p`
  margin: 0;
  font-size: 14px;

  @media (min-width: 768px) {
    font-size: 16px;
  }

  strong {
    font-weight: 600;
  }
`;

const SocialRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const SocialIcon = styled.a`
  color: ${props => props.theme.mutedForeground};
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.foreground};
  }
`;

const ContentArea = styled.div`
  width: 100%;
  max-width: 100%;
  padding: 1rem;
  box-sizing: border-box;

  @media (min-width: 640px) {
    max-width: 42rem;
    padding: 2rem 1rem;
  }
`;

const PageHeader = styled.h1`
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 1rem;

  @media (min-width: 768px) {
    font-size: 1.125rem;
  }
`;

const DividedList = styled.div`
  display: flex;
  flex-direction: column;
`;

const DividedItem = styled.div`
  padding: 0.5rem 0;
  border-bottom: 1px solid ${props => props.theme.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ItemRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
`;

const ItemTitle = styled.span`
  font-size: 14px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (min-width: 768px) {
    font-size: 16px;
  }
`;

const ItemLink = styled.a`
  font-size: 14px;
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (min-width: 768px) {
    font-size: 16px;
  }

  &:hover {
    color: ${props => props.theme.accent};
    text-decoration: underline;
  }
`;

const ItemMeta = styled.span`
  font-size: 12px;
  color: ${props => props.theme.mutedForeground};
  white-space: nowrap;

  @media (min-width: 768px) {
    font-size: 14px;
  }
`;

const ItemDesc = styled.p`
  margin: 0.25rem 0 0;
  font-size: 12px;
  color: ${props => props.theme.mutedForeground};

  @media (min-width: 768px) {
    font-size: 14px;
  }
`;

const ThemeToggle = styled.button`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 50;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background-color: ${props => props.$isDark ? 'rgba(250, 204, 21, 0.9)' : '#9ca3af'};
  transition: background-color 0.2s ease, transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
    background-color: ${props => props.$isDark ? 'rgba(250, 204, 21, 1)' : '#6b7280'};
  }
`;
