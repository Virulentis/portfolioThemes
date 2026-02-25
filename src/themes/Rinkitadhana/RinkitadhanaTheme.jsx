import React, { useMemo, useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

function isPresent(value) {
  return String(value || '').trim().toLowerCase() === 'present';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  if (isPresent(dateStr)) return 'Present';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function pickSocialUrl(socials, networkNames = []) {
  const lowered = networkNames.map((n) => n.toLowerCase());
  const found = socials.find((s) => lowered.includes(String(s.network || '').toLowerCase()));
  return found?.url || null;
}

export function RinkitadhanaTheme() {
  const { cvData, getAboutContent } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);
  const [isDark, setIsDark] = useState(false);
  const [expandedExp, setExpandedExp] = useState({});
  // Inject view transition CSS into document head
  useEffect(() => {
    const styleId = 'rinkitadhana-view-transition-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes slideDown {
          from { clip-path: inset(0 0 100%); }
          to { clip-path: inset(0); }
        }
        ::view-transition-new(root) {
          animation: 0.6s ease-in-out slideDown;
        }
        ::view-transition-old(root) {
          z-index: -1;
          animation: none;
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById(styleId);
      if (style) style.remove();
    };
  }, []);

  const toggleTheme = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setIsDark(!isDark);
      });
    } else {
      // Fallback for browsers that don't support View Transitions
      setIsDark(!isDark);
    }
  };

  const fullName = cv?.name || 'Your Name';
  const email = cv?.email || null;
  const phone = cv?.phone || null;
  const location = cv?.location || null;

  const socials = cv?.social || [];
  const githubUrl = pickSocialUrl(socials, ['github']);
  const linkedinUrl = pickSocialUrl(socials, ['linkedin']);
  const twitterUrl = pickSocialUrl(socials, ['twitter', 'x']);

  const aboutText = getAboutContent()?.markdown || '';

  // Current job title
  const currentTitle = useMemo(() => {
    const experiences = (cv?.sections?.experience || []).filter(e => !isArchived(e));
    if (experiences.length > 0) {
      const first = experiences[0];
      if (Array.isArray(first.positions) && first.positions.length > 0) {
        return first.positions[0]?.title || first.positions[0]?.position || '';
      }
      return first.position || '';
    }
    return '';
  }, [cv]);

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
            startDate: formatDate(pos.start_date),
            endDate: formatDate(pos.end_date),
            summary: pos.summary || exp.summary,
            url: exp.url,
            location: exp.location,
            highlights: pos.highlights || exp.highlights || [],
          });
        }
      } else {
        items.push({
          company: exp.company,
          title: exp.position,
          startDate: formatDate(exp.start_date),
          endDate: formatDate(exp.end_date),
          summary: exp.summary,
          url: exp.url,
          location: exp.location,
          highlights: exp.highlights || [],
        });
      }
    }

    return items.slice(0, 6);
  }, [cv]);

  // Project items
  const projectItems = useMemo(() => {
    return (cv?.sections?.projects || []).filter(e => !isArchived(e)).slice(0, 4);
  }, [cv]);

  // Education items
  const educationItems = useMemo(() => {
    return (cv?.sections?.education || []).filter(e => !isArchived(e));
  }, [cv]);

  const volunteerItems = useMemo(() => {
    return (cv?.sections?.volunteer || []).filter(e => !isArchived(e));
  }, [cv]);

  const awardItems = useMemo(() => {
    return (cv?.sections?.awards || []).filter(e => !isArchived(e));
  }, [cv]);

  const publicationItems = useMemo(() => {
    return (cv?.sections?.publications || []).filter(e => !isArchived(e));
  }, [cv]);

  const presentationItems = useMemo(() => {
    return (cv?.sections?.presentations || []).filter(e => !isArchived(e));
  }, [cv]);

  const professionalDevItems = useMemo(() => {
    return (cv?.sections?.professional_development || []).filter(e => !isArchived(e));
  }, [cv]);

  return (
    <Container $dark={isDark}>
      {/* Top dot grid section */}
      <DotGridSection $dark={isDark}>
        <ContentWrapper $dark={isDark}>
          <DotGrid />
        </ContentWrapper>
      </DotGridSection>
      <DashedLine $dark={isDark} />

      {/* Header section */}
      <Section $dark={isDark}>
        <ContentWrapper $dark={isDark}>
          <HeaderContent>
            <HeaderLeft>
              <ProfileImage $dark={isDark}>
                <ProfileInitials $dark={isDark}>{fullName.charAt(0)}</ProfileInitials>
              </ProfileImage>
              <HeaderInfo>
                <Name $dark={isDark}>{fullName}</Name>
                <JobTitle $dark={isDark}>{currentTitle}</JobTitle>
              </HeaderInfo>
            </HeaderLeft>
            <HeaderRight>
              <ThemeToggle onClick={toggleTheme} $dark={isDark}>
                {isDark ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </ThemeToggle>
            </HeaderRight>
          </HeaderContent>
        </ContentWrapper>
      </Section>
      <DashedLine $dark={isDark} />

      {/* Bio section */}
      <Section $dark={isDark}>
        <ContentWrapper $dark={isDark}>
          {aboutText && (
            <BioText $dark={isDark}>{aboutText}</BioText>
          )}
          <ActionButtons>
            {email && (
              <PrimaryButton href={`mailto:${email}`} $dark={isDark}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                Send an email
              </PrimaryButton>
            )}
          </ActionButtons>
          <SocialsSection>
            <SocialsLabel $dark={isDark}>Here are my <strong>socials</strong></SocialsLabel>
            <SocialsRow>
              {githubUrl && (
                <SocialPill href={githubUrl} target="_blank" rel="noopener" $dark={isDark}>
                  <svg width="14" height="14" viewBox="0 0 496 512" fill="currentColor">
                    <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z" />
                  </svg>
                  GitHub
                </SocialPill>
              )}
              {twitterUrl && (
                <SocialPill href={twitterUrl} target="_blank" rel="noopener" $dark={isDark}>
                  <svg width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                  </svg>
                  Twitter
                </SocialPill>
              )}
              {linkedinUrl && (
                <SocialPill href={linkedinUrl} target="_blank" rel="noopener" $dark={isDark}>
                  <svg width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
                    <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
                  </svg>
                  LinkedIn
                </SocialPill>
              )}
              {email && (
                <SocialPill href={`mailto:${email}`} $dark={isDark}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  Email
                </SocialPill>
              )}
            </SocialsRow>
          </SocialsSection>
        </ContentWrapper>
      </Section>
      <DashedLine $dark={isDark} />

      {/* Experience section */}
      {experienceItems.length > 0 && (
        <>
          <Section $dark={isDark}>
            <ContentWrapper $dark={isDark}>
              <SectionTitle $dark={isDark}>Experiences</SectionTitle>
            </ContentWrapper>
          </Section>
          <DashedLine $dark={isDark} />
          <Section $dark={isDark}>
            <ContentWrapper $dark={isDark} $noPadding>
              {experienceItems.map((exp, idx) => (
                <ExperienceItemWrapper key={idx} $dark={isDark}>
                  <ExperienceItem
                    $dark={isDark}
                    onClick={() => setExpandedExp(prev => ({ ...prev, [idx]: !prev[idx] }))}
                    $hasHighlights={exp.highlights?.length > 0}
                  >
                    <ExperienceLeft>
                      <CompanyIcon $dark={isDark}>
                        {exp.company?.charAt(0) || '?'}
                      </CompanyIcon>
                      <ExperienceInfo>
                        <CompanyName $dark={isDark}>{exp.company}</CompanyName>
                        <RoleTitle $dark={isDark}>{exp.title}</RoleTitle>
                      </ExperienceInfo>
                    </ExperienceLeft>
                    <ExperienceRight>
                      <DateRange $dark={isDark}>
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </DateRange>
                      {exp.location && (
                        <Location $dark={isDark}>{exp.location}</Location>
                      )}
                    </ExperienceRight>
                    {exp.highlights?.length > 0 && (
                      <ChevronIcon $dark={isDark} $expanded={expandedExp[idx]}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </ChevronIcon>
                    )}
                  </ExperienceItem>
                  {exp.highlights?.length > 0 && (
                    <HighlightsWrapper $expanded={expandedExp[idx]} $dark={isDark}>
                      <HighlightsList>
                        {exp.highlights.map((highlight, hIdx) => (
                          <HighlightItem key={hIdx} $dark={isDark}>
                            <HighlightBullet $dark={isDark}>•</HighlightBullet>
                            <HighlightText $dark={isDark}>{highlight}</HighlightText>
                          </HighlightItem>
                        ))}
                      </HighlightsList>
                    </HighlightsWrapper>
                  )}
                </ExperienceItemWrapper>
              ))}
            </ContentWrapper>
          </Section>
          <DashedLine $dark={isDark} />
        </>
      )}

      {/* Projects section */}
      {projectItems.length > 0 && (
        <>
          <Section $dark={isDark}>
            <ContentWrapper $dark={isDark}>
              <SectionTitle $dark={isDark}>Projects</SectionTitle>
            </ContentWrapper>
          </Section>
          <DashedLine $dark={isDark} />
          <Section $dark={isDark}>
            <ContentWrapper $dark={isDark}>
              <ProjectsGrid>
                {projectItems.map((project, idx) => (
                  <ProjectCard key={idx} $dark={isDark} href={project.url} target="_blank" rel="noopener">
                    <ProjectImagePlaceholder $dark={isDark}>
                      <ProjectInitial $dark={isDark}>{project.name?.charAt(0) || '?'}</ProjectInitial>
                    </ProjectImagePlaceholder>
                    <ProjectInfo>
                      <ProjectName $dark={isDark}>{project.name}</ProjectName>
                      {project.summary && (
                        <ProjectSummary $dark={isDark}>{project.summary}</ProjectSummary>
                      )}
                      <ViewProject $dark={isDark}>
                        View Project
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="7" y1="17" x2="17" y2="7" />
                          <polyline points="7 7 17 7 17 17" />
                        </svg>
                      </ViewProject>
                    </ProjectInfo>
                  </ProjectCard>
                ))}
              </ProjectsGrid>
            </ContentWrapper>
          </Section>
          <DashedLine $dark={isDark} />
        </>
      )}

      {/* Education section */}
      {educationItems.length > 0 && (
        <>
          <Section $dark={isDark}>
            <ContentWrapper $dark={isDark}>
              <SectionTitle $dark={isDark}>Education</SectionTitle>
            </ContentWrapper>
          </Section>
          <DashedLine $dark={isDark} />
          <Section $dark={isDark}>
            <ContentWrapper $dark={isDark} $noPadding>
              {educationItems.map((edu, idx) => (
                <ExperienceItem key={idx} $dark={isDark}>
                  <ExperienceLeft>
                    <CompanyIcon $dark={isDark}>
                      {edu.institution?.charAt(0) || '?'}
                    </CompanyIcon>
                    <ExperienceInfo>
                      <CompanyName $dark={isDark}>{edu.institution}</CompanyName>
                      <RoleTitle $dark={isDark}>
                        {edu.degree}{edu.area ? ` in ${edu.area}` : ''}
                      </RoleTitle>
                    </ExperienceInfo>
                  </ExperienceLeft>
                  <ExperienceRight>
                    <DateRange $dark={isDark}>
                      {formatDate(edu.start_date)} - {formatDate(edu.end_date) || 'Present'}
                    </DateRange>
                  </ExperienceRight>
                </ExperienceItem>
              ))}
            </ContentWrapper>
          </Section>
          <DashedLine $dark={isDark} />
        </>
      )}

      {/* Volunteer section */}
      {volunteerItems.length > 0 && (
        <>
          <Section $dark={isDark}>
            <ContentWrapper $dark={isDark}>
              <SectionTitle $dark={isDark}>Volunteer</SectionTitle>
            </ContentWrapper>
          </Section>
          <DashedLine $dark={isDark} />
          <Section $dark={isDark}>
            <ContentWrapper $dark={isDark} $noPadding>
              {volunteerItems.map((vol, idx) => (
                <ExperienceItem key={idx} $dark={isDark}>
                  <ExperienceLeft>
                    <CompanyIcon $dark={isDark}>
                      {vol.organization?.charAt(0) || '?'}
                    </CompanyIcon>
                    <ExperienceInfo>
                      <CompanyName $dark={isDark}>{vol.organization}</CompanyName>
                      <RoleTitle $dark={isDark}>{vol.position || vol.title}</RoleTitle>
                    </ExperienceInfo>
                  </ExperienceLeft>
                  <ExperienceRight>
                    <DateRange $dark={isDark}>
                      {formatDate(vol.start_date)} - {formatDate(vol.end_date) || 'Present'}
                    </DateRange>
                  </ExperienceRight>
                </ExperienceItem>
              ))}
            </ContentWrapper>
          </Section>
          <DashedLine $dark={isDark} />
        </>
      )}

      {/* Awards section */}
      {awardItems.length > 0 && (
        <>
          <Section $dark={isDark}>
            <ContentWrapper $dark={isDark}>
              <SectionTitle $dark={isDark}>Awards</SectionTitle>
            </ContentWrapper>
          </Section>
          <DashedLine $dark={isDark} />
          <Section $dark={isDark}>
            <ContentWrapper $dark={isDark} $noPadding>
              {awardItems.map((award, idx) => (
                <ExperienceItem key={idx} $dark={isDark}>
                  <ExperienceLeft>
                    <CompanyIcon $dark={isDark}>★</CompanyIcon>
                    <ExperienceInfo>
                      <CompanyName $dark={isDark}>{award.name}</CompanyName>
                      {award.summary && <RoleTitle $dark={isDark}>{award.summary}</RoleTitle>}
                    </ExperienceInfo>
                  </ExperienceLeft>
                  <ExperienceRight>
                    <DateRange $dark={isDark}>{award.date}</DateRange>
                  </ExperienceRight>
                </ExperienceItem>
              ))}
            </ContentWrapper>
          </Section>
          <DashedLine $dark={isDark} />
        </>
      )}

      {/* Publications section */}
      {publicationItems.length > 0 && (
        <>
          <Section $dark={isDark}>
            <ContentWrapper $dark={isDark}>
              <SectionTitle $dark={isDark}>Publications</SectionTitle>
            </ContentWrapper>
          </Section>
          <DashedLine $dark={isDark} />
          <Section $dark={isDark}>
            <ContentWrapper $dark={isDark} $noPadding>
              {publicationItems.map((pub, idx) => (
                <ExperienceItem key={idx} $dark={isDark}>
                  <ExperienceLeft>
                    <CompanyIcon $dark={isDark}>
                      {pub.title?.charAt(0) || '?'}
                    </CompanyIcon>
                    <ExperienceInfo>
                      <CompanyName $dark={isDark}>{pub.title}</CompanyName>
                      <RoleTitle $dark={isDark}>{pub.journal}</RoleTitle>
                    </ExperienceInfo>
                  </ExperienceLeft>
                  <ExperienceRight>
                    <DateRange $dark={isDark}>{formatDate(pub.date)}</DateRange>
                  </ExperienceRight>
                </ExperienceItem>
              ))}
            </ContentWrapper>
          </Section>
          <DashedLine $dark={isDark} />
        </>
      )}

      {/* Presentations section */}
      {presentationItems.length > 0 && (
        <>
          <Section $dark={isDark}>
            <ContentWrapper $dark={isDark}>
              <SectionTitle $dark={isDark}>Presentations</SectionTitle>
            </ContentWrapper>
          </Section>
          <DashedLine $dark={isDark} />
          <Section $dark={isDark}>
            <ContentWrapper $dark={isDark} $noPadding>
              {presentationItems.map((pres, idx) => (
                <ExperienceItem key={idx} $dark={isDark}>
                  <ExperienceLeft>
                    <CompanyIcon $dark={isDark}>
                      {pres.name?.charAt(0) || '?'}
                    </CompanyIcon>
                    <ExperienceInfo>
                      <CompanyName $dark={isDark}>{pres.name}</CompanyName>
                      {pres.summary && <RoleTitle $dark={isDark}>{pres.summary}</RoleTitle>}
                    </ExperienceInfo>
                  </ExperienceLeft>
                  <ExperienceRight>
                    <DateRange $dark={isDark}>{formatDate(pres.date)}</DateRange>
                    {pres.location && <Location $dark={isDark}>{pres.location}</Location>}
                  </ExperienceRight>
                </ExperienceItem>
              ))}
            </ContentWrapper>
          </Section>
          <DashedLine $dark={isDark} />
        </>
      )}

      {/* Professional Development section */}
      {professionalDevItems.length > 0 && (
        <>
          <Section $dark={isDark}>
            <ContentWrapper $dark={isDark}>
              <SectionTitle $dark={isDark}>Professional Development</SectionTitle>
            </ContentWrapper>
          </Section>
          <DashedLine $dark={isDark} />
          <Section $dark={isDark}>
            <ContentWrapper $dark={isDark} $noPadding>
              {professionalDevItems.map((item, idx) => (
                <ExperienceItem key={idx} $dark={isDark}>
                  <ExperienceLeft>
                    <CompanyIcon $dark={isDark}>
                      {item.name?.charAt(0) || '?'}
                    </CompanyIcon>
                    <ExperienceInfo>
                      <CompanyName $dark={isDark}>{item.name}</CompanyName>
                      {item.summary && <RoleTitle $dark={isDark}>{item.summary}</RoleTitle>}
                    </ExperienceInfo>
                  </ExperienceLeft>
                  <ExperienceRight>
                    <DateRange $dark={isDark}>{formatDate(item.date)}</DateRange>
                    {item.location && <Location $dark={isDark}>{item.location}</Location>}
                  </ExperienceRight>
                </ExperienceItem>
              ))}
            </ContentWrapper>
          </Section>
          <DashedLine $dark={isDark} />
        </>
      )}

      {/* Footer */}
      <Section $dark={isDark}>
        <ContentWrapper $dark={isDark}>
          <Footer $dark={isDark}>
            {location && <FooterLocation $dark={isDark}>{location}</FooterLocation>}
            {phone && <FooterPhone href={`tel:${phone}`} $dark={isDark}>{phone}</FooterPhone>}
          </Footer>
        </ContentWrapper>
      </Section>
    </Container>
  );
}

// Color tokens matching the original
const colors = {
  light: {
    background: '#ffffff',
    foreground: '#424242',
    title: '#333333',
    muted: '#9f9fa9',
    mutedForeground: '#71717b',
    border: '#d1d1d1',
    bgHover: '#f5f5f5',
    mutedBackground: '#f2f2f2',
  },
  dark: {
    background: '#0e0d09',
    foreground: '#d4d4d4',
    title: '#ebebeb',
    muted: '#5d5d5d',
    mutedForeground: '#989898',
    border: '#313131',
    bgHover: '#151515',
    mutedBackground: '#1f1f1f',
  },
};

// Styled Components
const Container = styled.div`
  height: 100%;
  width: 100%;
  background-color: ${props => props.$dark ? colors.dark.background : colors.light.background};
  color: ${props => props.$dark ? colors.dark.foreground : colors.light.foreground};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  overflow-y: auto;
  overflow-x: hidden;
`;

const dashedBorder = css`
  background-image: repeating-linear-gradient(
    to bottom,
    ${props => props.$dark ? '#313131' : '#d1d1d1'} 0px,
    ${props => props.$dark ? '#313131' : '#d1d1d1'} 6px,
    transparent 6px,
    transparent 14px
  ), repeating-linear-gradient(
    to bottom,
    ${props => props.$dark ? '#313131' : '#d1d1d1'} 0px,
    ${props => props.$dark ? '#313131' : '#d1d1d1'} 6px,
    transparent 6px,
    transparent 14px
  );
  background-size: 1px 100%, 1px 100%;
  background-position: left top, right top;
  background-repeat: no-repeat;
`;

const Section = styled.div`
  position: relative;
  background-color: ${props => props.$dark ? '#0e0d09' : '#ffffff'};
`;

const ContentWrapper = styled.div`
  max-width: 690px;
  margin: 0 auto;
  padding: ${props => props.$noPadding ? '0' : '12px'};
  position: relative;
  ${dashedBorder}

  @media (max-width: 768px) {
    margin: 0 8px;
  }

  @media (max-width: 480px) {
    margin: 0 8px;
  }
`;

const DashedLine = styled.div`
  width: 100%;
  height: 1px;
  background-image: repeating-linear-gradient(
    to right,
    ${props => props.$dark ? '#313131' : '#d1d1d1'} 0px,
    ${props => props.$dark ? '#313131' : '#d1d1d1'} 6px,
    transparent 6px,
    transparent 14px
  );
  background-size: 100% 1px;
  background-repeat: no-repeat;
`;

const DotGridSection = styled.div`
  position: relative;
  background-color: ${props => props.$dark ? '#0e0d09' : '#ffffff'};
`;

const DotGrid = styled.div`
  width: 100%;
  height: 120px;
  background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
  background-size: 16px 16px;
  opacity: 0.15;

  @media (min-width: 640px) {
    height: 180px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
`;

const ProfileImage = styled.div`
  width: 90px;
  height: 90px;
  border-radius: 12px;
  border: 1px solid ${props => props.$dark ? '#313131' : '#d1d1d1'};
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.$dark ? '#18181b' : '#fafafa'};
`;

const ProfileInitials = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: linear-gradient(135deg, ${props => props.$dark ? '#313131' : '#d1d1d1'}, ${props => props.$dark ? '#313131' : '#d1d1d1'});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.$dark ? '#fafafa' : '#18181b'};
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 4px;
`;

const Name = styled.h1`
  font-size: 1.55rem;
  font-weight: 700;
  line-height: 1.08;
  margin: 0 0 4px;
  color: ${props => props.$dark ? '#fafafa' : '#0e0d09'};
`;

const JobTitle = styled.p`
  font-size: 14px;
  color: ${props => props.$dark ? '#a1a1aa' : '#71717b'};
  margin: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
`;

const ThemeToggle = styled.button`
  padding: 6px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  color: ${props => props.$dark ? '#71717b' : '#a1a1aa'};
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.$dark ? '#18181b' : '#f4f4f5'};
    border-color: ${props => props.$dark ? '#313131' : '#d1d1d1'};
    color: ${props => props.$dark ? '#a1a1aa' : '#71717b'};
  }
`;

const BioText = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${props => props.$dark ? '#fafafa' : '#0e0d09'};
  margin: 0 0 16px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 8px;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  background-color: ${props => props.$dark ? '#fafafa' : '#18181b'};
  color: ${props => props.$dark ? '#18181b' : '#fafafa'};
  border-radius: 9px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const SocialsSection = styled.div`
  padding-top: 18px;
`;

const SocialsLabel = styled.p`
  font-size: 14px;
  color: ${props => props.$dark ? '#fafafa' : '#0e0d09'};
  margin: 0 0 8px;

  strong {
    font-weight: 500;
  }
`;

const SocialsRow = styled.div`
  display: flex;
  gap: 7px;
  align-items: center;
  flex-wrap: wrap;
`;

const SocialPill = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background-color: ${props => props.$dark ? '#18181b' : '#fafafa'};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  color: ${props => props.$dark ? '#fafafa' : '#0e0d09'};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.$dark ? '#313131' : '#d1d1d1'};
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  color: ${props => props.$dark ? '#fafafa' : '#0e0d09'};
`;

const ExperienceItemWrapper = styled.div`
  &:not(:last-child) {
    border-bottom: 1px dashed ${props => props.$dark ? '#313131' : '#d1d1d1'};
  }
`;

const ExperienceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px;
  transition: background-color 0.3s ease;
  cursor: ${props => props.$hasHighlights ? 'pointer' : 'default'};
  position: relative;

  &:hover {
    background-color: ${props => props.$dark ? '#18181b' : '#fafafa'};
  }
`;

const ChevronIcon = styled.div`
  color: ${props => props.$dark ? '#52525b' : '#a1a1aa'};
  transition: transform 0.3s ease, color 0.3s ease;
  transform: ${props => props.$expanded ? 'rotate(180deg)' : 'rotate(0)'};
  display: none;

  @media (min-width: 640px) {
    display: block;
  }

  ${ExperienceItem}:hover & {
    color: ${props => props.$dark ? '#fafafa' : '#0e0d09'};
  }
`;

const HighlightsWrapper = styled.div`
  overflow: hidden;
  max-height: ${props => props.$expanded ? '500px' : '0'};
  opacity: ${props => props.$expanded ? '1' : '0'};
  transition: max-height 0.3s ease, opacity 0.3s ease;
  margin-left: 16px;
  margin-top: ${props => props.$expanded ? '4px' : '0'};
  padding-bottom: ${props => props.$expanded ? '12px' : '0'};
`;

const HighlightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HighlightItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const HighlightBullet = styled.span`
  color: ${props => props.$dark ? '#52525b' : '#a1a1aa'};
  flex-shrink: 0;
`;

const HighlightText = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${props => props.$dark ? '#fafafa' : '#0e0d09'};
  margin: 0;
`;

const ExperienceLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
`;

const CompanyIcon = styled.div`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 10px;
  border: 1px solid ${props => props.$dark ? '#313131' : '#d1d1d1'};
  padding: 2px;
  background-color: ${props => props.$dark ? '#18181b' : '#fafafa'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.$dark ? '#a1a1aa' : '#71717b'};

  @media (min-width: 640px) {
    width: 48px;
    height: 48px;
  }
`;

const ExperienceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const CompanyName = styled.h3`
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 0.9;
  margin: 0;
  color: ${props => props.$dark ? '#fafafa' : '#0e0d09'};

  @media (min-width: 640px) {
    font-size: 1.2rem;
  }
`;

const RoleTitle = styled.p`
  font-size: 12px;
  color: ${props => props.$dark ? '#a1a1aa' : '#71717b'};
  margin: 0;

  @media (min-width: 640px) {
    font-size: 14px;
  }
`;

const ExperienceRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
`;

const DateRange = styled.p`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.$dark ? '#fafafa' : '#0e0d09'};
  margin: 0;

  @media (min-width: 640px) {
    font-size: 14px;
  }
`;

const Location = styled.p`
  font-size: 12px;
  color: ${props => props.$dark ? '#a1a1aa' : '#71717b'};
  margin: 0;

  @media (min-width: 640px) {
    font-size: 14px;
  }
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 0;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ProjectCard = styled.a`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.$dark ? '#18181b' : '#fafafa'};
  }
`;

const ProjectImagePlaceholder = styled.div`
  width: 100%;
  height: 170px;
  border-radius: 12px;
  border: 1px solid ${props => props.$dark ? '#313131' : '#d1d1d1'};
  background-color: ${props => props.$dark ? '#18181b' : '#fafafa'};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  @media (min-width: 768px) {
    height: 200px;
  }
`;

const ProjectInitial = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: ${props => props.$dark ? '#313131' : '#d1d1d1'};
`;

const ProjectInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 8px;
`;

const ProjectName = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.1;
  margin: 0;
  color: ${props => props.$dark ? '#fafafa' : '#0e0d09'};
`;

const ProjectSummary = styled.p`
  font-size: 14px;
  color: ${props => props.$dark ? '#a1a1aa' : '#71717b'};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ViewProject = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: ${props => props.$dark ? '#a1a1aa' : '#71717b'};
  transition: color 0.3s ease;

  svg {
    transition: transform 0.3s ease;
  }

  ${ProjectCard}:hover & {
    color: ${props => props.$dark ? '#fafafa' : '#0e0d09'};

    svg {
      transform: rotate(45deg);
    }
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
`;

const FooterLocation = styled.p`
  font-size: 14px;
  color: ${props => props.$dark ? '#a1a1aa' : '#71717b'};
  margin: 0;
`;

const FooterPhone = styled.a`
  font-size: 14px;
  color: ${props => props.$dark ? '#a1a1aa' : '#71717b'};
  text-decoration: none;

  &:hover {
    color: ${props => props.$dark ? '#fafafa' : '#0e0d09'};
  }
`;
