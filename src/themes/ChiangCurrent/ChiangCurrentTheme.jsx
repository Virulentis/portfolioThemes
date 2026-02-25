import React, { useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';
import tardisGif from './assets/tardis-rotate.gif';

const colors = {
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate300: '#cbd5e1',
  slate200: '#e2e8f0',
  teal300: '#5eead4',
  teal400: '#2dd4bf',
  teal900: '#134e4a',
};

function isPresent(value) {
  return String(value || '').trim().toLowerCase() === 'present';
}

function flattenExperience(experience = []) {
  const items = [];
  for (const entry of experience) {
    if (!entry) continue;
    if (Array.isArray(entry.positions) && entry.positions.length > 0) {
      for (const position of entry.positions) {
        items.push({
          company: entry.company,
          location: entry.location,
          title: position?.title || entry.position,
          startDate: position?.start_date ?? entry.start_date,
          endDate: position?.end_date ?? entry.end_date ?? null,
          highlights: position?.highlights || [],
          url: entry.url,
        });
      }
      continue;
    }
    items.push({
      company: entry.company,
      location: entry.location,
      title: entry.position,
      startDate: entry.start_date,
      endDate: entry.end_date ?? null,
      highlights: entry.highlights || [],
      url: entry.url,
    });
  }
  return items;
}

function formatDateRange(start, end) {
  const formatDate = (d) => {
    if (!d) return '';
    if (isPresent(d)) return 'Present';
    const str = String(d);
    if (str.length === 7) {
      const [year, month] = str.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[parseInt(month, 10) - 1]} ${year}`;
    }
    return str;
  };
  return `${formatDate(start)} — ${formatDate(end)}`;
}

function pickSocialUrl(socials, networkNames = []) {
  const lowered = networkNames.map((n) => n.toLowerCase());
  const found = socials.find((s) => lowered.includes(String(s.network || '').toLowerCase()));
  return found?.url || null;
}

export function ChiangCurrentTheme() {
  const { cvData } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);
  const [activeSection, setActiveSection] = useState('about');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showTimeTravelModal, setShowTimeTravelModal] = useState(false);

  const fullName = cv?.name || 'Your Name';
  const email = cv?.email || null;
  const phone = cv?.phone || null;
  const website = cv?.website || null;
  const location = cv?.location || null;
  const headline = cv?.label || cv?.headline || '';
  const aboutText = cv?.sections?.about || '';

  const awardItems = useMemo(() => {
    return cv?.sections?.awards || [];
  }, [cv]);

  const presentationItems = useMemo(() => {
    return cv?.sections?.presentations || [];
  }, [cv]);

  const publicationItems = useMemo(() => {
    return cv?.sections?.publications || [];
  }, [cv]);

  const professionalDevItems = useMemo(() => {
    return cv?.sections?.professional_development || [];
  }, [cv]);

  const educationItems = useMemo(() => {
    return cv?.sections?.education || [];
  }, [cv]);

  const volunteerItems = useMemo(() => {
    return cv?.sections?.volunteer || [];
  }, [cv]);

  const socials = cv?.social || [];
  const githubUrl = pickSocialUrl(socials, ['github']);
  const linkedinUrl = pickSocialUrl(socials, ['linkedin']);
  const twitterUrl = pickSocialUrl(socials, ['twitter', 'x']);

  // Get current job title from experience
  const currentJobTitle = useMemo(() => {
    const exp = cv?.sections?.experience || [];
    for (const entry of exp) {
      if (Array.isArray(entry.positions) && entry.positions.length > 0) {
        const pos = entry.positions[0];
        if (isPresent(pos.end_date)) return pos.title || entry.position;
      }
      if (isPresent(entry.end_date)) return entry.position;
    }
    // Fallback to first position
    if (exp.length > 0) {
      const first = exp[0];
      if (Array.isArray(first.positions) && first.positions.length > 0) {
        return first.positions[0].title || first.position;
      }
      return first.position;
    }
    return headline || 'Engineer';
  }, [cv, headline]);

  const experienceItems = useMemo(() => {
    return flattenExperience(cv?.sections?.experience || []);
  }, [cv]);

  const projectItems = useMemo(() => {
    return cv?.sections?.projects || [];
  }, [cv]);

  useEffect(() => {
    const handleScroll = (e) => {
      const container = e.target;
      const sections = ['about', 'experience', 'projects', 'education', 'volunteer'];
      for (const id of sections) {
        const el = container.querySelector(`#${id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom > 150) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    const container = document.querySelector('[data-scroll-container]');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Container data-scroll-container>
      <SpotlightGradient
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`,
        }}
      />
      <Layout>
        <LeftColumn>
          <Header>
            <Name>{fullName}</Name>
            <Title>{currentJobTitle}</Title>
            {headline && <Bio>{headline}</Bio>}
          </Header>

          <Nav>
            <NavItem href="#about" $active={activeSection === 'about'}>
              <NavLine $active={activeSection === 'about'} />
              <NavText>About</NavText>
            </NavItem>
            <NavItem href="#experience" $active={activeSection === 'experience'}>
              <NavLine $active={activeSection === 'experience'} />
              <NavText>Experience</NavText>
            </NavItem>
            <NavItem href="#projects" $active={activeSection === 'projects'}>
              <NavLine $active={activeSection === 'projects'} />
              <NavText>Projects</NavText>
            </NavItem>
            {educationItems.length > 0 && (
              <NavItem href="#education" $active={activeSection === 'education'}>
                <NavLine $active={activeSection === 'education'} />
                <NavText>Education</NavText>
              </NavItem>
            )}
            {volunteerItems.length > 0 && (
              <NavItem href="#volunteer" $active={activeSection === 'volunteer'}>
                <NavLine $active={activeSection === 'volunteer'} />
                <NavText>Volunteer</NavText>
              </NavItem>
            )}
            {awardItems.length > 0 && (
              <NavItem href="#awards" $active={activeSection === 'awards'}>
                <NavLine $active={activeSection === 'awards'} />
                <NavText>Awards</NavText>
              </NavItem>
            )}
            {publicationItems.length > 0 && (
              <NavItem href="#publications" $active={activeSection === 'publications'}>
                <NavLine $active={activeSection === 'publications'} />
                <NavText>Publications</NavText>
              </NavItem>
            )}
          </Nav>

          <SocialLinks>
            {githubUrl && (
              <SocialLink href={githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </SocialLink>
            )}
            {linkedinUrl && (
              <SocialLink href={linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </SocialLink>
            )}
            {twitterUrl && (
              <SocialLink href={twitterUrl} target="_blank" rel="noreferrer" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </SocialLink>
            )}
            {email && (
              <SocialLink href={`mailto:${email}`} aria-label="Email">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z"/>
                </svg>
              </SocialLink>
            )}
            {phone && (
              <SocialLink href={`tel:${phone}`} aria-label="Phone">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </SocialLink>
            )}
          </SocialLinks>
        </LeftColumn>

        <RightColumn>
          <Section id="about">
            <MobileSectionHeader>
              <MobileSectionTitle>About</MobileSectionTitle>
            </MobileSectionHeader>
            <SectionContent>
              {aboutText ? (
                aboutText.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))
              ) : (
                <p>Welcome to my portfolio. Here you can learn more about my experience and projects.</p>
              )}
            </SectionContent>
          </Section>

          <Section id="experience">
            <MobileSectionHeader>
              <MobileSectionTitle>Experience</MobileSectionTitle>
            </MobileSectionHeader>
            <ExperienceList>
              {experienceItems.map((item, idx) => (
                <ExperienceCard key={`${item.company}-${item.title}-${idx}`}>
                  <ExperienceDate>{formatDateRange(item.startDate, item.endDate)}</ExperienceDate>
                  <ExperienceContent>
                    <ExperienceTitle>
                      {item.title} · <ExperienceCompany>{item.company}</ExperienceCompany>
                    </ExperienceTitle>
                    {item.highlights.length > 0 && (
                      <ExperienceDescription>
                        {item.highlights[0]}
                      </ExperienceDescription>
                    )}
                    {item.highlights.length > 1 && (
                      <ExperienceHighlights>
                        {item.highlights.slice(1, 3).map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ExperienceHighlights>
                    )}
                  </ExperienceContent>
                </ExperienceCard>
              ))}
            </ExperienceList>
          </Section>

          <Section id="projects">
            <MobileSectionHeader>
              <MobileSectionTitle>Projects</MobileSectionTitle>
            </MobileSectionHeader>
            <ProjectsList>
              {projectItems.map((project, idx) => (
                <ProjectCard
                  key={`${project.name}-${idx}`}
                  href={project.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ProjectImage>
                    <ProjectPlaceholder>{project.name?.charAt(0) || 'P'}</ProjectPlaceholder>
                  </ProjectImage>
                  <ProjectContent>
                    <ProjectTitle>
                      {project.name}
                      <ProjectArrow>↗</ProjectArrow>
                    </ProjectTitle>
                    <ProjectDescription>{project.summary}</ProjectDescription>
                    {project.technologies && (
                      <ProjectTech>
                        {project.technologies.map((tech, i) => (
                          <TechTag key={i}>{tech}</TechTag>
                        ))}
                      </ProjectTech>
                    )}
                  </ProjectContent>
                </ProjectCard>
              ))}
            </ProjectsList>
          </Section>

          {educationItems.length > 0 && (
            <Section id="education">
              <MobileSectionHeader>
                <MobileSectionTitle>Education</MobileSectionTitle>
              </MobileSectionHeader>
              <ExperienceList>
                {educationItems.map((edu, idx) => (
                  <ExperienceCard key={`edu-${idx}`}>
                    <ExperienceDate>{formatDateRange(edu.start_date, edu.end_date)}</ExperienceDate>
                    <ExperienceContent>
                      <ExperienceTitle>
                        {edu.degree} in {edu.area} · <ExperienceCompany>{edu.institution}</ExperienceCompany>
                      </ExperienceTitle>
                    </ExperienceContent>
                  </ExperienceCard>
                ))}
              </ExperienceList>
            </Section>
          )}

          {volunteerItems.length > 0 && (
            <Section id="volunteer">
              <MobileSectionHeader>
                <MobileSectionTitle>Volunteer</MobileSectionTitle>
              </MobileSectionHeader>
              <ExperienceList>
                {volunteerItems.map((vol, idx) => (
                  <ExperienceCard key={`vol-${idx}`}>
                    <ExperienceDate>{formatDateRange(vol.start_date, vol.end_date)}</ExperienceDate>
                    <ExperienceContent>
                      <ExperienceTitle>
                        {vol.position || vol.title} · <ExperienceCompany>{vol.organization}</ExperienceCompany>
                      </ExperienceTitle>
                      {vol.summary && (
                        <ExperienceDescription>{vol.summary}</ExperienceDescription>
                      )}
                    </ExperienceContent>
                  </ExperienceCard>
                ))}
              </ExperienceList>
            </Section>
          )}

          {awardItems.length > 0 && (
            <Section id="awards">
              <MobileSectionHeader>
                <MobileSectionTitle>Awards</MobileSectionTitle>
              </MobileSectionHeader>
              <ExperienceList>
                {awardItems.map((award, idx) => (
                  <ExperienceCard key={`award-${idx}`}>
                    <ExperienceDate>{award.date}</ExperienceDate>
                    <ExperienceContent>
                      <ExperienceTitle>{award.name}</ExperienceTitle>
                      {award.summary && (
                        <ExperienceDescription>{award.summary}</ExperienceDescription>
                      )}
                    </ExperienceContent>
                  </ExperienceCard>
                ))}
              </ExperienceList>
            </Section>
          )}

          {presentationItems.length > 0 && (
            <Section id="presentations">
              <MobileSectionHeader>
                <MobileSectionTitle>Presentations</MobileSectionTitle>
              </MobileSectionHeader>
              <ExperienceList>
                {presentationItems.map((pres, idx) => (
                  <ExperienceCard key={`pres-${idx}`}>
                    <ExperienceDate>{pres.date}</ExperienceDate>
                    <ExperienceContent>
                      <ExperienceTitle>{pres.name}</ExperienceTitle>
                      {pres.summary && (
                        <ExperienceDescription>
                          {pres.summary} {pres.location && `@ ${pres.location}`}
                        </ExperienceDescription>
                      )}
                    </ExperienceContent>
                  </ExperienceCard>
                ))}
              </ExperienceList>
            </Section>
          )}

          {publicationItems.length > 0 && (
            <Section id="publications">
              <MobileSectionHeader>
                <MobileSectionTitle>Publications</MobileSectionTitle>
              </MobileSectionHeader>
              <ProjectsList>
                {publicationItems.map((pub, idx) => (
                  <ProjectCard
                    key={`pub-${idx}`}
                    href={pub.doi ? `https://doi.org/${pub.doi}` : '#'}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ProjectImage>
                      <ProjectPlaceholder>{pub.title?.charAt(0) || 'P'}</ProjectPlaceholder>
                    </ProjectImage>
                    <ProjectContent>
                      <ProjectTitle>
                        {pub.title}
                        {pub.doi && <ProjectArrow>↗</ProjectArrow>}
                      </ProjectTitle>
                      <ProjectDescription>{pub.journal} ({pub.date})</ProjectDescription>
                    </ProjectContent>
                  </ProjectCard>
                ))}
              </ProjectsList>
            </Section>
          )}

          {professionalDevItems.length > 0 && (
            <Section id="professional-development">
              <MobileSectionHeader>
                <MobileSectionTitle>Professional Development</MobileSectionTitle>
              </MobileSectionHeader>
              <ExperienceList>
                {professionalDevItems.map((item, idx) => (
                  <ExperienceCard key={`profdev-${idx}`}>
                    <ExperienceDate>{item.date}</ExperienceDate>
                    <ExperienceContent>
                      <ExperienceTitle>{item.name}</ExperienceTitle>
                      {item.summary && (
                        <ExperienceDescription>
                          {item.summary} {item.location && `@ ${item.location}`}
                        </ExperienceDescription>
                      )}
                    </ExperienceContent>
                  </ExperienceCard>
                ))}
              </ExperienceList>
            </Section>
          )}

          <Footer>
            <FooterText>
              Loosely designed in Figma and coded in VS Code. Built with React and
              styled-components, deployed with Vercel.
            </FooterText>
          </Footer>
        </RightColumn>
      </Layout>

      {/* Time Travel TARDIS Easter Egg */}
      <TardisButton
        onClick={() => setShowTimeTravelModal(true)}
        aria-label="Click to time travel"
      >
        <TardisImage
          src={tardisGif}
          alt="Spinning Tardis from Doctor Who"
        />
      </TardisButton>

      {showTimeTravelModal && (
        <TimeTravelOverlay onClick={() => setShowTimeTravelModal(false)}>
          {/* Portal Animation */}
          <PortalContainer>
            <PortalOrb style={{ '--x': '-53%', '--y': '-53%', '--t': 37 }} />
            <PortalOrb style={{ '--x': '-47%', '--y': '-52%', '--t': 58 }} />
            <PortalOrb style={{ '--x': '-45%', '--y': '-50%', '--t': 46 }} />
            <PortalOrb style={{ '--x': '-53%', '--y': '-45%', '--t': 72 }} />
            <PortalOrb style={{ '--x': '-55%', '--y': '-45%', '--t': 62 }} />
          </PortalContainer>
          <TimeTravelModal onClick={(e) => e.stopPropagation()}>
            <CloseModalButton onClick={() => setShowTimeTravelModal(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </CloseModalButton>
            <ModalContent>
              <ModalTitle>Looking for a different version?</ModalTitle>
              <ModalSubtitle>Go back in time...</ModalSubtitle>
              <VersionGrid>
                <VersionCard href="https://v1.brittanychiang.com" target="_blank" rel="noreferrer">
                  <VersionLabel>v1</VersionLabel>
                  <VersionDesc>The Original</VersionDesc>
                </VersionCard>
                <VersionCard href="https://v2.brittanychiang.com" target="_blank" rel="noreferrer">
                  <VersionLabel>v2</VersionLabel>
                  <VersionDesc>Minimalist</VersionDesc>
                </VersionCard>
                <VersionCard href="https://v3.brittanychiang.com" target="_blank" rel="noreferrer">
                  <VersionLabel>v3</VersionLabel>
                  <VersionDesc>Creative</VersionDesc>
                </VersionCard>
                <VersionCard href="https://v4.brittanychiang.com" target="_blank" rel="noreferrer">
                  <VersionLabel>v4</VersionLabel>
                  <VersionDesc>Developer Dark</VersionDesc>
                </VersionCard>
              </VersionGrid>
            </ModalContent>
            <ModalCredit href="https://brittanychiang.com" target="_blank" rel="noreferrer">
              Inspired by brittanychiang.com
            </ModalCredit>
          </TimeTravelModal>
        </TimeTravelOverlay>
      )}
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  width: 100%;
  background: ${colors.slate900};
  color: ${colors.slate400};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  overflow: auto;
  scroll-behavior: smooth;
  position: relative;

  ::selection {
    background: ${colors.teal300};
    color: ${colors.teal900};
  }
`;

const SpotlightGradient = styled.div`
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 30;
  transition: background 0.3s ease;
`;

const Layout = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  gap: 16px;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const LeftColumn = styled.header`
  width: 48%;
  max-height: 100vh;
  padding: 96px 0;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media (max-width: 1024px) {
    width: 100%;
    position: relative;
    max-height: none;
    padding: 48px 0;
  }
`;

const RightColumn = styled.main`
  width: 52%;
  padding: 96px 0;

  @media (max-width: 1024px) {
    width: 100%;
    padding: 0 0 48px;
  }
`;

const Header = styled.div``;

const Name = styled.h1`
  font-size: 48px;
  font-weight: 700;
  color: ${colors.slate200};
  margin: 0 0 8px;
  letter-spacing: -0.025em;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 500;
  color: ${colors.slate200};
  margin: 0 0 16px;
`;

const Bio = styled.p`
  max-width: 320px;
  color: ${colors.slate400};
  margin: 0;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 64px;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const NavLine = styled.span`
  display: block;
  width: ${props => props.$active ? '64px' : '32px'};
  height: 1px;
  background: ${props => props.$active ? colors.slate200 : colors.slate600};
  transition: all 0.25s ease;
`;

const NavText = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const NavItem = styled.a`
  display: flex;
  align-items: center;
  gap: 16px;
  color: ${props => props.$active ? colors.slate200 : colors.slate500};
  text-decoration: none;
  transition: all 0.25s ease;

  &:hover {
    color: ${colors.slate200};

    ${NavLine} {
      width: 64px;
      background: ${colors.slate200};
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 32px;
`;

const SocialLink = styled.a`
  color: ${colors.slate400};
  transition: color 0.25s ease;

  &:hover {
    color: ${colors.slate200};
  }
`;

const Section = styled.section`
  margin-bottom: 96px;
  scroll-margin-top: 96px;
  position: relative;
`;

const MobileSectionHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 40;
  margin-left: -24px;
  margin-right: -24px;
  margin-bottom: 16px;
  width: calc(100% + 48px);
  background: rgba(15, 23, 42, 0.95);
  padding: 20px 24px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);

  @media (min-width: 1024px) {
    display: none;
  }
`;

const MobileSectionTitle = styled.h2`
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${colors.slate200};
  margin: 0;
`;

const SectionContent = styled.div`
  p {
    margin: 0 0 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const ExperienceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;
`;

const ExperienceCard = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 16px;
  padding: 24px;
  margin: -24px;
  border-radius: 8px;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(30, 41, 59, 0.5);
    box-shadow: inset 0 1px 0 0 rgba(148, 163, 184, 0.1);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ExperienceDate = styled.span`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: ${colors.slate500};
  margin-top: 4px;
`;

const ExperienceContent = styled.div``;

const ExperienceTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: ${colors.slate200};
  margin: 0 0 8px;
`;

const ExperienceCompany = styled.span`
  color: ${colors.slate200};
`;

const ExperienceDescription = styled.p`
  font-size: 14px;
  margin: 0 0 8px;
`;

const ExperienceHighlights = styled.ul`
  padding: 0;
  margin: 8px 0 0;
  list-style: none;
  font-size: 14px;

  li {
    margin-bottom: 4px;
    padding-left: 16px;
    position: relative;

    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: ${colors.slate500};
    }
  }
`;

const ProjectsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ProjectCard = styled.a`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 16px;
  padding: 24px;
  margin: -24px;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(30, 41, 59, 0.5);
    box-shadow: inset 0 1px 0 0 rgba(148, 163, 184, 0.1);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ProjectImage = styled.div`
  width: 120px;
  aspect-ratio: 16/9;
  border-radius: 4px;
  border: 2px solid ${colors.slate700};
  overflow: hidden;
  background: ${colors.slate800};
`;

const ProjectPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: ${colors.teal300};
`;

const ProjectContent = styled.div``;

const ProjectTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: ${colors.slate200};
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ProjectArrow = styled.span`
  font-size: 14px;
  transition: transform 0.25s ease;

  ${ProjectCard}:hover & {
    transform: translate(4px, -4px);
  }
`;

const ProjectDescription = styled.p`
  font-size: 14px;
  margin: 0 0 12px;
`;

const ProjectTech = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TechTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  background: rgba(45, 212, 191, 0.1);
  color: ${colors.teal300};
  font-size: 12px;
  font-weight: 500;
`;

const Footer = styled.footer`
  margin-top: 96px;
`;

const FooterText = styled.p`
  font-size: 14px;
  color: ${colors.slate500};
  max-width: 480px;
`;

// TARDIS Easter Egg Styles
const TardisButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px 16px;
  z-index: 50;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-8px);
  }
`;

const TardisImage = styled.img`
  display: block;
  width: 100px;
  height: 86px;
`;

const PortalContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60vmin;
  height: 60vmin;
  pointer-events: none;
`;

const PortalOrb = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(var(--x, -50%), var(--y, -50%)) rotate(0deg);
  width: 100%;
  height: 100%;
  border-radius: 90% 95% 85% 105%;
  background: #0f0;
  mix-blend-mode: screen;
  filter: hue-rotate(0deg);
  animation: portalWobble calc(150ms * var(--t)) linear infinite;
  transform-origin: calc(-1 * var(--y)) calc(-1 * var(--x));
  box-shadow: 0 0 2em 0.5em #000 inset, 0 0 0.5em 0 #fff;
  opacity: 0.7;

  @keyframes portalWobble {
    to {
      filter: hue-rotate(360deg);
      transform: translate(var(--x), var(--y)) rotate(360deg);
    }
  }
`;

const TimeTravelOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const TimeTravelModal = styled.div`
  position: relative;
  max-width: 600px;
  width: 90%;
  padding: 48px 32px;
  perspective: 400px;
`;

const CloseModalButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  background: transparent;
  border: none;
  color: ${colors.slate400};
  cursor: pointer;
  padding: 8px;
  transition: color 0.2s ease;

  &:hover {
    color: ${colors.slate200};
  }
`;

const ModalContent = styled.div`
  text-align: center;
  transform: rotateX(15deg);
  transform-origin: center top;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
  letter-spacing: -0.025em;

  @media (min-width: 640px) {
    font-size: 24px;
  }
`;

const ModalSubtitle = styled.p`
  font-size: 18px;
  color: ${colors.slate500};
  margin-bottom: 32px;
`;

const VersionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const VersionCard = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: ${colors.slate800};
  border: 2px solid ${colors.slate700};
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.25s ease;

  &:hover {
    border-color: ${colors.teal400};
    transform: translateY(-4px);
    box-shadow: 0 10px 30px -10px rgba(45, 212, 191, 0.3);
  }
`;

const VersionLabel = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: ${colors.teal300};
  margin-bottom: 4px;
`;

const VersionDesc = styled.span`
  font-size: 12px;
  color: ${colors.slate400};
`;

const ModalCredit = styled.a`
  display: block;
  text-align: center;
  margin-top: 32px;
  font-size: 12px;
  color: ${colors.slate500};
  text-decoration: underline;
  transition: color 0.2s ease;

  &:hover {
    color: ${colors.slate300};
  }
`;
