import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';

// Global styles for background
const GlobalStyle = createGlobalStyle`
  html, body {
    background-color: #eeeeee !important;
  }
`;

// Helper to check if archived
const isArchived = (entry) => Array.isArray(entry?.tags) && entry.tags.includes('archived');

// Helper to check if present
const isPresent = (value) => String(value || '').trim().toLowerCase() === 'present';

export function KubreTheme() {
  const cv = useCV();
  const [activeTab, setActiveTab] = useState('profile');

  if (!cv) return null;

  const {
    name,
    email,
    phone,
    location,
    about,
    currentJobTitle,
    socialLinks,
    projects,
    education,
    skills,
    sectionsRaw,
  } = cv;

  // Get raw experience data
  const experienceRaw = (sectionsRaw?.experience || []).filter(e => !isArchived(e));

  // Get additional sections
  const awardItems = (sectionsRaw?.awards || []).filter(e => !isArchived(e));
  const presentationItems = (sectionsRaw?.presentations || []).filter(e => !isArchived(e));
  const publicationItems = (sectionsRaw?.publications || []).filter(e => !isArchived(e));
  const professionalDevItems = (sectionsRaw?.professional_development || []).filter(e => !isArchived(e));
  const volunteerItems = (sectionsRaw?.volunteer || []).filter(e => !isArchived(e));

  // Get first name
  const firstName = name?.split(' ')[0] || 'User';

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (isPresent(dateStr)) return 'Present';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
  };

  // Format date range
  const formatDateRange = (startDate, endDate) => {
    const start = startDate ? String(startDate).split('-')[0] : '';
    const end = isPresent(endDate) ? 'Present' : endDate ? String(endDate).split('-')[0] : '';
    if (start === end) return start;
    return `${start} - ${end}`;
  };

  return (
    <PageWrapper>
      <GlobalStyle />
      <Container>

      {/* Navigation */}
      <Nav>
        <NavHeader>
          <NameTitle>█▓▒░ {name || 'Your Name'}</NameTitle>
          <ProdBadge href="#about">⌥ PROD</ProdBadge>
        </NavHeader>
        <NavLinks>
          <NavItem
            $active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          >
            ✦ PROFILE
          </NavItem>
          <NavItem
            $active={activeTab === 'projects'}
            onClick={() => setActiveTab('projects')}
          >
            ¶ PROJECTS
          </NavItem>
          <NavItem
            $active={activeTab === 'work'}
            onClick={() => setActiveTab('work')}
          >
            ≥ WORK
          </NavItem>
          {(awardItems.length > 0 || presentationItems.length > 0 || publicationItems.length > 0 || professionalDevItems.length > 0 || volunteerItems.length > 0) && (
            <NavItem
              $active={activeTab === 'more'}
              onClick={() => setActiveTab('more')}
            >
              ◆ MORE
            </NavItem>
          )}
        </NavLinks>
      </Nav>

      {/* Main Content */}
      <Main>
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <>
            {/* Profile Section with notebook dots */}
            <ProfileSection>
              <NotebookDots $left>
                {[...Array(5)].map((_, i) => (
                  <Dot key={`left-${i}`} />
                ))}
              </NotebookDots>

              <ProfileContent>
                <ProfileLine>## Profile: {currentJobTitle || 'Software Engineer'}</ProfileLine>
                <br />
                <ProfileLine>## Skills (in their own words):</ProfileLine>
                <ProfileLine>"{about || 'Passionate about building great software.'}"</ProfileLine>
                <br />
                <ProfileLine>## Location:</ProfileLine>
                <ProfileLine>"{location || 'Earth'}"</ProfileLine>
                <br />
                {skills && skills.length > 0 && (
                  <>
                    <ProfileLine>## Technologies:</ProfileLine>
                    <ProfileLine>{skills.slice(0, 10).join(', ')}</ProfileLine>
                  </>
                )}
              </ProfileContent>

              <NotebookDots $right>
                {[...Array(5)].map((_, i) => (
                  <Dot key={`right-${i}`} />
                ))}
              </NotebookDots>
            </ProfileSection>

            {/* Education */}
            {education.length > 0 && (
              <Section>
                <SectionTitle># Education</SectionTitle>
                <EducationList>
                  {education.map((item, idx) => (
                    <EducationItem key={`edu-${idx}`}>
                      <EducationDate>{item.end_date ? String(item.end_date).split('-')[0] : ''}</EducationDate>
                      <EducationDegree>
                        {item.degree} in {item.area}
                      </EducationDegree>
                      <EducationSchool>{item.institution}</EducationSchool>
                    </EducationItem>
                  ))}
                </EducationList>
              </Section>
            )}

            {/* Resume Link */}
            <ResumeLink>
              <ResumeLinkButton onClick={() => setActiveTab('work')}>
                Complete Resume →
              </ResumeLinkButton>
            </ResumeLink>
          </>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <Section>
            <NoteBox>
              <NoteLegend>Note</NoteLegend>
              Here are some projects I've worked on. Click on any project to learn more about it.
            </NoteBox>

            <TimelineContainer>
              <TimelineLine />
              <TimelineItems>
                {projects.map((project, idx) => (
                  <TimelineItem key={`proj-${idx}`}>
                    <TimelineDiamond>♦</TimelineDiamond>
                    <TimelineDate>
                      {project.date ? formatDate(project.date) : `Project ${idx + 1}`}
                    </TimelineDate>
                    <TimelineCard>
                      <TimelineTitle>
                        {project.url ? (
                          <StyledLink href={project.url} target="_blank" rel="noreferrer">
                            {project.name}
                          </StyledLink>
                        ) : (
                          project.name
                        )}
                      </TimelineTitle>
                      {project.summary && (
                        <TimelineDescription>{project.summary}</TimelineDescription>
                      )}
                      <TimelineReadMore>View project ↳</TimelineReadMore>
                    </TimelineCard>
                  </TimelineItem>
                ))}
              </TimelineItems>
            </TimelineContainer>
          </Section>
        )}

        {/* Work Tab */}
        {activeTab === 'work' && (
          <Section>
            <NoteBox>
              <NoteLegend>Note</NoteLegend>
              I worked on several projects and here are details for few of them, although
              called as Design Documents they do not follow any formal structure just
              my thoughts on how projects were finished.
            </NoteBox>

            <TimelineContainer>
              <TimelineLine />
              <TimelineItems>
                {experienceRaw.map((company, idx) => {
                  const positions = company.positions && company.positions.length > 0
                    ? company.positions
                    : [{ title: company.position, start_date: company.start_date, end_date: company.end_date, summary: company.summary, highlights: company.highlights }];

                  const hasMultiplePositions = positions.length > 1;
                  const companyStartDate = positions[positions.length - 1]?.start_date;

                  return (
                    <TimelineItem key={`work-${idx}`}>
                      <TimelineDiamond>♦</TimelineDiamond>
                      <TimelineDate>
                        {formatDate(companyStartDate)}
                      </TimelineDate>
                      <TimelineCard>
                        {/* Company Header */}
                        <TimelineTitle>
                          {company.url ? (
                            <StyledLink href={company.url} target="_blank" rel="noreferrer">
                              {company.company}
                            </StyledLink>
                          ) : (
                            company.company
                          )}
                        </TimelineTitle>
                        {company.location && (
                          <TimelineMeta>{company.location}</TimelineMeta>
                        )}

                        {/* Positions */}
                        <PositionsList $nested={hasMultiplePositions}>
                          {positions.map((pos, posIdx) => (
                            <PositionItem key={`pos-${posIdx}`} $nested={hasMultiplePositions}>
                              <PositionTitle>{pos.title}</PositionTitle>
                              <PositionMeta>
                                {formatDateRange(pos.start_date, pos.end_date)}
                              </PositionMeta>
                              {pos.summary && (
                                <TimelineDescription>{pos.summary}</TimelineDescription>
                              )}
                              {pos.highlights && pos.highlights.length > 0 && (
                                <TimelineHighlights>
                                  {pos.highlights.slice(0, 3).map((h, hIdx) => (
                                    <li key={hIdx}>{h}</li>
                                  ))}
                                </TimelineHighlights>
                              )}
                            </PositionItem>
                          ))}
                        </PositionsList>
                        <TimelineReadMore>Read more ↳</TimelineReadMore>
                      </TimelineCard>
                    </TimelineItem>
                  );
                })}
              </TimelineItems>
            </TimelineContainer>
          </Section>
        )}

        {/* More Tab - Awards, Presentations, Publications, Prof Dev */}
        {activeTab === 'more' && (
          <Section>
            {awardItems.length > 0 && (
              <>
                <SectionTitle># Awards</SectionTitle>
                <EducationList>
                  {awardItems.map((award, idx) => (
                    <EducationItem key={`award-${idx}`}>
                      <EducationDate>{award.date}</EducationDate>
                      <EducationDegree>{award.name}</EducationDegree>
                      {award.summary && <EducationSchool>{award.summary}</EducationSchool>}
                    </EducationItem>
                  ))}
                </EducationList>
              </>
            )}

            {presentationItems.length > 0 && (
              <>
                <SectionTitle># Presentations</SectionTitle>
                <EducationList>
                  {presentationItems.map((pres, idx) => (
                    <EducationItem key={`pres-${idx}`}>
                      <EducationDate>{pres.date}</EducationDate>
                      <EducationDegree>{pres.name}</EducationDegree>
                      {pres.location && <EducationSchool>{pres.location}</EducationSchool>}
                    </EducationItem>
                  ))}
                </EducationList>
              </>
            )}

            {publicationItems.length > 0 && (
              <>
                <SectionTitle># Publications</SectionTitle>
                <EducationList>
                  {publicationItems.map((pub, idx) => (
                    <EducationItem key={`pub-${idx}`}>
                      <EducationDate>{pub.date || pub.releaseDate}</EducationDate>
                      <EducationDegree>
                        {pub.doi ? (
                          <StyledLink href={`https://doi.org/${pub.doi}`} target="_blank" rel="noreferrer">
                            {pub.name || pub.title}
                          </StyledLink>
                        ) : pub.url ? (
                          <StyledLink href={pub.url} target="_blank" rel="noreferrer">
                            {pub.name || pub.title}
                          </StyledLink>
                        ) : (
                          pub.name || pub.title
                        )}
                      </EducationDegree>
                      {pub.authors && <EducationSchool>{pub.authors.join(', ')}</EducationSchool>}
                    </EducationItem>
                  ))}
                </EducationList>
              </>
            )}

            {professionalDevItems.length > 0 && (
              <>
                <SectionTitle># Professional Development</SectionTitle>
                <EducationList>
                  {professionalDevItems.map((item, idx) => (
                    <EducationItem key={`pd-${idx}`}>
                      <EducationDate>{item.date}</EducationDate>
                      <EducationDegree>{item.name}</EducationDegree>
                      {item.location && <EducationSchool>{item.location}</EducationSchool>}
                    </EducationItem>
                  ))}
                </EducationList>
              </>
            )}

            {volunteerItems.length > 0 && (
              <>
                <SectionTitle># Volunteer</SectionTitle>
                <EducationList>
                  {volunteerItems.map((vol, idx) => (
                    <EducationItem key={`vol-${idx}`}>
                      <EducationDate>{isPresent(vol.end_date) ? 'Present' : vol.end_date}</EducationDate>
                      <EducationDegree>{vol.position || vol.title}</EducationDegree>
                      <EducationSchool>{vol.organization}</EducationSchool>
                    </EducationItem>
                  ))}
                </EducationList>
              </>
            )}
          </Section>
        )}
      </Main>

      {/* Footer */}
      <Footer>
        <ContactLinks>
          {email && (
            <ContactLink href={`mailto:${email}`}>Email</ContactLink>
          )}
          {phone && (
            <ContactLink href={`tel:${phone}`}>Phone</ContactLink>
          )}
          {socialLinks.linkedin && (
            <ContactLink href={socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</ContactLink>
          )}
          {socialLinks.github && (
            <ContactLink href={socialLinks.github} target="_blank" rel="noreferrer">GitHub</ContactLink>
          )}
          {socialLinks.twitter && (
            <ContactLink href={socialLinks.twitter} target="_blank" rel="noreferrer">𝕏</ContactLink>
          )}
        </ContactLinks>
        <Copyright>
          © 2018 - {new Date().getFullYear()}, {firstName}. Creative Commons Attribution 4.0 International License.
        </Copyright>
      </Footer>
      </Container>
    </PageWrapper>
  );
}

// Styled Components
const PageWrapper = styled.div`
  height: 100%;
  width: 100%;
  background: #eeeeee;
  overflow-y: auto;
  overflow-x: hidden;
`;

const Container = styled.div`
  width: 100%;
  background: #eeeeee;
  color: #222222;
  font-family: 'Departure Mono', 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  padding: 0 1rem;
  padding-bottom: 2rem;
  max-width: 64rem;
  margin: 0 auto;

  @media (min-width: 1024px) {
    padding: 0 2rem;
  }

  ::selection {
    background: #facc15;
    color: #000;
  }

  a {
    color: inherit;
    text-decoration-color: #666666;
  }

  a:hover {
    background: #facc15;
    color: #000;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
  padding-top: 2rem;
  max-width: 100%;

  @media (min-width: 1024px) {
    padding-top: 2rem;
  }
`;

const NavHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  text-transform: uppercase;
  position: relative;
`;

const NameTitle = styled.span`
  font-weight: 900;
  font-size: 1.5rem;

  @media (min-width: 768px) {
    font-size: 3.75rem;
  }
`;

const ProdBadge = styled.a`
  color: #222222;
  margin-left: auto;
  padding: 0 0.5rem;
  font-size: 0.75rem;
  transform: rotate(-90deg);
  background: #eeeeee;
  position: absolute;
  right: -1.25rem;
  top: 1.5rem;
  text-decoration: none;

  @media (min-width: 768px) {
    position: relative;
    top: auto;
    right: auto;
    font-size: 0.875rem;
  }

  &:hover {
    background: #222222;
    color: #eeeeee;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 0.5rem;
  padding-top: 2rem;
`;

const NavItem = styled.button`
  text-transform: capitalize;
  padding: 1px 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
  background: ${({ $active }) => $active ? '#facc15' : 'transparent'};
  color: ${({ $active }) => $active ? '#000' : '#222222'};
  border: none;
  font-family: inherit;

  &:hover {
    background: #facc15;
    color: #000;
  }
`;

const Main = styled.main`
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 3rem;

  @media (min-width: 768px) {
    padding: 3rem 0;
  }
`;

const ProfileSection = styled.div`
  position: relative;
  background: white;
  max-width: 48rem;
`;

const NotebookDots = styled.div`
  position: absolute;
  top: -0.75rem;
  bottom: 0;
  ${({ $left }) => $left ? 'left: 0;' : ''}
  ${({ $right }) => $right ? 'right: 0;' : ''}
  padding: 0 0.75rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  z-index: 10;

  @media (min-width: 768px) {
    padding: 0 1rem;
  }
`;

const Dot = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  background: #eeeeee;
  border-radius: 50%;
`;

const ProfileContent = styled.div`
  margin: 0 3rem;
  padding: 3rem 1rem;
  border-left: 1px solid #eeeeee;
  border-right: 1px solid #eeeeee;
  font-size: 0.75rem;
  line-height: 1.5rem;

  @media (min-width: 768px) {
    margin: 0 3.5rem;
    font-size: 0.875rem;
    line-height: 1.5rem;
  }
`;

const ProfileLine = styled.span`
  display: block;
`;

const Section = styled.section`
  padding: 0;
  width: 100%;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 2rem;
  padding: 0.25rem 0;
`;

const NoteBox = styled.fieldset`
  background: white;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  margin: 1rem 0 2rem;
  border: 1px solid #999999;
  max-width: 48rem;
`;

const NoteLegend = styled.legend`
  margin-left: auto;
  padding: 0 0.5rem;
  background: #999999;
  color: white;
  font-size: 0.75rem;
`;

const TimelineContainer = styled.div`
  position: relative;
  margin-top: 3rem;
  margin-left: 0;

  @media (min-width: 1024px) {
    margin-left: 12.5rem;
  }
`;

const TimelineLine = styled.div`
  display: none;
  position: absolute;
  top: 0.75rem;
  bottom: 0;
  right: 100%;
  margin-right: 1.75rem;
  width: 1px;
  background: #666666;

  @media (min-width: 640px) {
    display: block;
  }

  @media (min-width: 768px) {
    margin-right: 3.25rem;
  }
`;

const TimelineItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
`;

const TimelineItem = styled.article`
  position: relative;
`;

const TimelineDiamond = styled.span`
  display: none;
  position: absolute;
  right: 100%;
  margin-right: 1.5rem;
  top: 0;
  color: #666666;
  font-size: 0.75rem;

  @media (min-width: 640px) {
    display: block;
  }

  @media (min-width: 768px) {
    margin-right: 3rem;
  }
`;

const TimelineDate = styled.dl`
  position: absolute;
  left: 0;
  top: 0;
  white-space: nowrap;
  font-size: 0.75rem;
  line-height: 1.5;
  color: #666666;

  @media (min-width: 1024px) {
    left: auto;
    right: 100%;
    margin-right: calc(6.5rem + 1px);
  }
`;

const TimelineCard = styled.div`
  padding: 0 0.5rem;

  @media (min-width: 768px) {
    padding: 0;
  }
`;

const TimelineTitle = styled.h3`
  font-size: 1.125rem;
  letter-spacing: -0.025em;
  color: #222222;
  padding-top: 2rem;

  @media (min-width: 1024px) {
    padding-top: 0;
  }
`;

const TimelineMeta = styled.div`
  font-size: 0.75rem;
  color: #666666;
  margin-top: 0.25rem;
`;

const TimelineDescription = styled.p`
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  color: #444444;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TimelineHighlights = styled.ul`
  list-style: disc;
  list-style-position: inside;
  color: #444444;
  margin-bottom: 1rem;

  li {
    margin-bottom: 0.25rem;
  }
`;

const TimelineReadMore = styled.span`
  font-size: 0.875rem;
  color: #666666;
`;

const PositionsList = styled.div`
  margin-top: ${({ $nested }) => $nested ? '1rem' : '0.5rem'};
  ${({ $nested }) => $nested && `
    border-left: 1px solid #cccccc;
    padding-left: 1rem;
    margin-left: 0.25rem;
  `}
`;

const PositionItem = styled.div`
  ${({ $nested }) => $nested && `
    padding: 0.75rem 0;
    &:not(:last-child) {
      border-bottom: 1px dashed #dddddd;
    }
  `}
`;

const PositionTitle = styled.h4`
  font-size: 1rem;
  font-weight: 500;
  color: #222222;
`;

const PositionMeta = styled.div`
  font-size: 0.75rem;
  color: #666666;
  margin-top: 0.125rem;
  margin-bottom: 0.5rem;
`;

const StyledLink = styled.a`
  text-decoration: underline;
  text-decoration-color: #666666;
  color: #222222;

  &:hover {
    background: #facc15;
    color: #000;
  }
`;

const EducationList = styled.ul`
  list-style: disc;
  list-style-position: inside;
`;

const EducationItem = styled.li`
  margin-bottom: 0.5rem;
  position: relative;
`;

const EducationDate = styled.span`
  float: right;
  font-size: 0.875rem;
  color: rgba(34, 34, 34, 0.8);
  padding-top: 0.25rem;
`;

const EducationDegree = styled.span`
  font-weight: 500;
`;

const EducationSchool = styled.div`
  margin-left: 1.25rem;
  color: #222222;
`;

const ResumeLink = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ResumeLinkButton = styled.button`
  margin-left: auto;
  padding: 0 0.5rem;
  background: #fef08a;
  text-decoration: underline;
  text-decoration-color: #666666;
  color: #222222;
  border: none;
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;

  &:hover {
    background: #facc15;
    color: #000;
  }
`;

const Footer = styled.footer`
  padding: 2rem 0;
`;

const ContactLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
`;

const ContactLink = styled.a`
  text-decoration: underline;
  text-decoration-color: #666666;
  color: #222222;
  padding: 0 0.5rem;

  &:hover {
    background: #facc15;
    color: #000;
  }
`;

const Copyright = styled.div`
  padding: 2rem 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  color: #222222;
`;
