import React, { useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';

function isPresent(value) {
  return String(value || '').trim().toLowerCase() === 'present';
}

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  if (isPresent(dateStr)) return 'Present';
  const str = String(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parts = str.split('-');
  const year = parts[0] || '';
  const month = parts[1] ? months[parseInt(parts[1], 10) - 1] : '';
  if (month && year) return `${month} ${year}`;
  return year;
}

function pickSocialUrl(socials, networkNames = []) {
  const lowered = networkNames.map((n) => n.toLowerCase());
  const found = socials.find((s) => lowered.includes(String(s.network || '').toLowerCase()));
  return found?.url || null;
}

// Group experience by company, keeping positions together
function groupExperience(experience = []) {
  const groups = [];
  for (const entry of experience) {
    if (!entry || isArchived(entry)) continue;
    if (Array.isArray(entry.positions) && entry.positions.length > 0) {
      // Company with multiple positions
      groups.push({
        company: entry.company,
        positions: entry.positions.map(pos => ({
          title: pos?.title || entry.position,
          startDate: pos?.start_date ?? entry.start_date,
          endDate: pos?.end_date ?? entry.end_date ?? null,
        })),
      });
    } else {
      // Single position
      groups.push({
        company: entry.company,
        positions: [{
          title: entry.position,
          startDate: entry.start_date,
          endDate: entry.end_date ?? null,
        }],
      });
    }
  }
  return groups;
}

const NAV_ITEMS = [
  { id: 'about', label: 'about' },
  { id: 'experience', label: 'experience' },
  { id: 'projects', label: 'projects' },
  { id: 'education', label: 'education' },
  { id: 'volunteer', label: 'volunteer' },
  { id: 'awards', label: 'awards' },
  { id: 'publications', label: 'publications' },
  { id: 'prof-dev', label: 'prof. dev.' },
];

export function JoshBradleyTheme() {
  const { cvData, getAboutContent } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);
  const [activeSection, setActiveSection] = useState('about');

  const fullName = cv?.name || 'Your Name';
  const email = cv?.email || null;
  const phone = cv?.phone || null;
  const location = cv?.location || null;

  const socials = cv?.social || [];
  const githubUrl = pickSocialUrl(socials, ['github']);
  const linkedinUrl = pickSocialUrl(socials, ['linkedin']);
  const twitterUrl = pickSocialUrl(socials, ['twitter', 'x']);

  const aboutText = getAboutContent()?.markdown || '';

  const experienceGroups = useMemo(() => {
    return groupExperience(cv?.sections?.experience || []).slice(0, 8);
  }, [cv]);

  const projectItems = useMemo(() => {
    return (cv?.sections?.projects || []).filter(e => !isArchived(e)).slice(0, 8);
  }, [cv]);

  const educationItems = useMemo(() => {
    return (cv?.sections?.education || []).filter(e => !isArchived(e));
  }, [cv]);

  const awardItems = useMemo(() => {
    return (cv?.sections?.awards || []).filter(e => !isArchived(e)).slice(0, 8);
  }, [cv]);

  const presentationItems = useMemo(() => {
    return (cv?.sections?.presentations || []).filter(e => !isArchived(e)).slice(0, 8);
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
    if (item.id === 'experience') return experienceGroups.length > 0;
    if (item.id === 'projects') return projectItems.length > 0;
    if (item.id === 'education') return educationItems.length > 0;
    if (item.id === 'volunteer') return volunteerItems.length > 0;
    if (item.id === 'awards') return awardItems.length > 0 || presentationItems.length > 0;
    if (item.id === 'publications') return publicationItems.length > 0;
    if (item.id === 'prof-dev') return professionalDevItems.length > 0;
    return true;
  });

  const renderContent = () => {
    switch (activeSection) {
      case 'experience':
        return (
          <Article>
            <PageTitle>Experience</PageTitle>
            <ExperienceList>
              {experienceGroups.map((group, groupIdx) => (
                <ExperienceGroup key={`exp-group-${groupIdx}`}>
                  <CompanyName>{group.company}</CompanyName>
                  <PositionsList>
                    {group.positions.map((pos, posIdx) => (
                      <PositionItem key={`pos-${posIdx}`} $indented={group.positions.length > 1}>
                        <LeaderTitle>{pos.title}</LeaderTitle>
                        <LeaderDots />
                        <LeaderDate>{formatDate(pos.endDate) || formatDate(pos.startDate)}</LeaderDate>
                      </PositionItem>
                    ))}
                  </PositionsList>
                </ExperienceGroup>
              ))}
            </ExperienceList>
          </Article>
        );

      case 'projects':
        return (
          <Article>
            <PageTitle>Projects</PageTitle>
            <Prose>
              <p>A collection of projects I've worked on over the years.</p>
            </Prose>
            <ProjectsList>
              {projectItems.map((project, idx) => (
                <ProjectItem key={`proj-${idx}`}>
                  <ProjectTitle>
                    {project.url ? (
                      <ProjectLink href={project.url} target="_blank" rel="noreferrer">
                        {project.name}
                      </ProjectLink>
                    ) : (
                      project.name
                    )}
                  </ProjectTitle>
                  {project.summary && <ProjectDesc>{project.summary}</ProjectDesc>}
                </ProjectItem>
              ))}
            </ProjectsList>
          </Article>
        );

      case 'education':
        return (
          <Article>
            <PageTitle>Education</PageTitle>
            <LeaderList>
              {educationItems.map((edu, idx) => (
                <LeaderItem key={`edu-${idx}`}>
                  <LeaderTitle>{edu.degree} in {edu.area}, {edu.institution}</LeaderTitle>
                  <LeaderDots />
                  <LeaderDate>{formatDate(edu.end_date) || formatDate(edu.start_date)}</LeaderDate>
                </LeaderItem>
              ))}
            </LeaderList>
          </Article>
        );

      case 'volunteer':
        return (
          <Article>
            <PageTitle>Volunteer</PageTitle>
            <LeaderList>
              {volunteerItems.map((vol, idx) => (
                <LeaderItem key={`vol-${idx}`}>
                  <LeaderTitle>{vol.position || vol.title}, {vol.organization}</LeaderTitle>
                  <LeaderDots />
                  <LeaderDate>{formatDate(vol.end_date) || formatDate(vol.start_date)}</LeaderDate>
                </LeaderItem>
              ))}
            </LeaderList>
          </Article>
        );

      case 'awards':
        return (
          <Article>
            <PageTitle>Recognition</PageTitle>
            {awardItems.length > 0 && (
              <LeaderList>
                {awardItems.map((award, idx) => (
                  <LeaderItem key={`award-${idx}`}>
                    <LeaderTitle>{award.name}</LeaderTitle>
                    <LeaderDots />
                    <LeaderDate>{award.date}</LeaderDate>
                  </LeaderItem>
                ))}
              </LeaderList>
            )}
            {presentationItems.length > 0 && (
              <>
                <SubTitle>Presentations</SubTitle>
                <LeaderList>
                  {presentationItems.map((pres, idx) => (
                    <LeaderItem key={`pres-${idx}`}>
                      <LeaderTitle>{pres.name}</LeaderTitle>
                      <LeaderDots />
                      <LeaderDate>{pres.date}</LeaderDate>
                    </LeaderItem>
                  ))}
                </LeaderList>
              </>
            )}
          </Article>
        );

      case 'publications':
        return (
          <Article>
            <PageTitle>Publications</PageTitle>
            <LeaderList>
              {publicationItems.map((pub, idx) => (
                <LeaderItem key={`pub-${idx}`}>
                  <LeaderTitle>
                    {pub.doi ? (
                      <ProjectLink href={`https://doi.org/${pub.doi}`} target="_blank" rel="noreferrer">
                        {pub.name || pub.title}
                      </ProjectLink>
                    ) : pub.url ? (
                      <ProjectLink href={pub.url} target="_blank" rel="noreferrer">
                        {pub.name || pub.title}
                      </ProjectLink>
                    ) : (
                      pub.name || pub.title
                    )}
                  </LeaderTitle>
                  <LeaderDots />
                  <LeaderDate>{pub.date || pub.releaseDate}</LeaderDate>
                </LeaderItem>
              ))}
            </LeaderList>
          </Article>
        );

      case 'prof-dev':
        return (
          <Article>
            <PageTitle>Professional Development</PageTitle>
            <LeaderList>
              {professionalDevItems.map((item, idx) => (
                <LeaderItem key={`pd-${idx}`}>
                  <LeaderTitle>{item.name}</LeaderTitle>
                  <LeaderDots />
                  <LeaderDate>{item.date}</LeaderDate>
                </LeaderItem>
              ))}
            </LeaderList>
          </Article>
        );

      default: // about
        return (
          <Article>
            <SectionTitle>{fullName}</SectionTitle>
            {aboutText && (
              <Prose>
                <p>{aboutText}</p>
              </Prose>
            )}
            {location && (
              <Prose>
                <p>Based in {location}.</p>
              </Prose>
            )}
            <Divider />
            <SocialLinks>
              {twitterUrl && (
                <SocialLink href={twitterUrl} target="_blank" rel="noreferrer">Twitter</SocialLink>
              )}
              {githubUrl && (
                <SocialLink href={githubUrl} target="_blank" rel="noreferrer">GitHub</SocialLink>
              )}
              {linkedinUrl && (
                <SocialLink href={linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</SocialLink>
              )}
              {email && (
                <SocialLink href={`mailto:${email}`}>Email</SocialLink>
              )}
              {phone && (
                <SocialLink href={`tel:${phone}`}>Phone</SocialLink>
              )}
            </SocialLinks>
          </Article>
        );
    }
  };

  return (
    <Container>
      <Layout>
        <Nav>
          <NavMenu>
            {visibleNavItems.map(item => (
              <NavItem key={item.id}>
                <NavLink
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveSection(item.id); }}
                  $active={activeSection === item.id}
                >
                  <em>{item.label}</em>
                </NavLink>
              </NavItem>
            ))}
          </NavMenu>
        </Nav>
        <Main>
          <VerticalLine />
          <ArticleWrapper key={activeSection}>
            {renderContent()}
          </ArticleWrapper>
        </Main>
      </Layout>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  width: 100%;
  background-color: #faf9f5;
  color: #3e3d3b;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  overflow: auto;
  overscroll-behavior: none;
  -webkit-font-smoothing: antialiased;
`;

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  padding-bottom: 3rem;

  @media (min-width: 480px) {
    flex-direction: row;
    padding: 1.5rem;
  }

  @media (min-width: 640px) {
    padding: 3rem;
  }

  @media (min-width: 768px) {
    padding: 6rem;
  }
`;

const Nav = styled.nav`
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e8e6dc;
  font-size: 1rem;
  line-height: 1.25;

  @media (min-width: 480px) {
    margin-right: 1.5rem;
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  @media (min-width: 640px) {
    margin-right: 2rem;
  }

  @media (min-width: 768px) {
    margin-right: 3rem;
  }
`;

const NavMenu = styled.menu`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;

  @media (min-width: 480px) {
    flex-direction: column;
    justify-content: flex-start;
    gap: 0.25rem;
    text-align: right;
    position: sticky;
    top: 1.5rem;
  }

  @media (min-width: 640px) {
    top: 3rem;
  }

  @media (min-width: 768px) {
    top: 6rem;
  }
`;

const NavItem = styled.li``;

const NavLink = styled.a`
  color: ${props => props.$active ? '#1f1e1d' : '#adaba2'};
  text-decoration: none;
  transition: color 0.2s ease;
  font-style: italic;
  font-family: 'Lora', Georgia, 'Times New Roman', serif;

  &:hover {
    color: #1f1e1d;
  }
`;

const Main = styled.main`
  position: relative;
  width: 100%;
  min-width: 0;
  text-align: justify;
  hyphens: auto;
  max-width: 42rem;

  @media (min-width: 480px) {
    padding-left: 1.5rem;
  }

  @media (min-width: 640px) {
    padding-left: 2rem;
  }

  @media (min-width: 768px) {
    padding-left: 3rem;
  }
`;

const VerticalLine = styled.div`
  display: none;

  @media (min-width: 480px) {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    border-left: 1px solid #e8e6dc;
  }
`;

const Article = styled.article`
  position: relative;
`;

const SectionTitle = styled.h1`
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f1e1d;
  margin: 0 0 2rem;
  text-align: left;
`;

const PageTitle = styled.h1`
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f1e1d;
  margin: 0 0 1.5rem;
  text-align: left;
`;

const SubTitle = styled.h2`
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f1e1d;
  margin: 2rem 0 1rem;
  text-align: left;
`;

const Prose = styled.div`
  margin-bottom: 1rem;

  p {
    margin: 0 0 1rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  a {
    color: inherit;
    text-decoration: underline;
    transition: color 0.2s ease;

    &:hover {
      color: #000;
    }
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e8e6dc;
  margin: 2rem 0;
`;

const SocialLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.75rem;
`;

const SocialLink = styled.a`
  color: inherit;
  text-decoration: underline;
  transition: color 0.2s ease;

  &:hover {
    color: #000;
  }
`;

const LeaderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const LeaderItem = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
`;

const LeaderTitle = styled.span`
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
  min-width: 0;
`;

const LeaderDots = styled.span`
  flex: 1;
  border-bottom: 1px dotted #d4d2c9;
  min-width: 1rem;
  margin-bottom: 0.25rem;
`;

const LeaderDate = styled.span`
  color: #adaba2;
  white-space: nowrap;
  flex-shrink: 0;
`;

const ProjectsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProjectItem = styled.div`
  margin-top: 4rem;
  margin-bottom: 2rem;

  &:first-child {
    margin-top: 2rem;
  }
`;

const ProjectTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 1rem;
  text-align: left;
  color: #1f1e1d;
`;

const ProjectLink = styled.a`
  color: inherit;
  text-decoration: underline;
  transition: color 0.2s ease;

  &:hover {
    color: #000;
  }
`;

const ProjectDesc = styled.p`
  margin: 0;
  color: #5e5d59;
  text-align: justify;
  hyphens: auto;
`;

// Page transition animation with blur (like joshbradley.me)
const fadeInBlur = keyframes`
  0% {
    opacity: 0;
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    filter: blur(0);
  }
`;

const ArticleWrapper = styled.div`
  animation: ${fadeInBlur} 0.5s ease-out;
`;

// Experience grouped styles
const ExperienceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ExperienceGroup = styled.div``;

const CompanyName = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 0.5rem;
  text-align: left;
  color: #1f1e1d;
`;

const PositionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const PositionItem = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding-left: ${props => props.$indented ? '1rem' : '0'};
`;
