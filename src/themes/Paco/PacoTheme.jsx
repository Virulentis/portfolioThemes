import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useCV } from '../../contexts/ConfigContext';

export function PacoTheme({ darkMode }) {
  const cv = useCV();

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
    experience,
    education,
    sectionsRaw,
  } = cv;

  // Get additional sections
  const awards = (sectionsRaw?.awards || []).filter(e => !Array.isArray(e?.tags) || !e.tags.includes('archived'));
  const presentations = (sectionsRaw?.presentations || []).filter(e => !Array.isArray(e?.tags) || !e.tags.includes('archived'));
  const publications = (sectionsRaw?.publications || []).filter(e => !Array.isArray(e?.tags) || !e.tags.includes('archived'));
  const professionalDevelopment = (sectionsRaw?.professional_development || []).filter(e => !Array.isArray(e?.tags) || !e.tags.includes('archived'));
  const volunteerItems = (sectionsRaw?.volunteer || []).filter(e => !Array.isArray(e?.tags) || !e.tags.includes('archived'));

  // Get active projects (limit to 4)
  const activeProjects = projects?.slice(0, 4) || [];

  // Get recent experience (limit to 4)
  const recentExperience = experience?.slice(0, 4) || [];

  return (
    <PageWrapper $darkMode={darkMode}>
      <Container>
        {/* Header */}
        <Header>
          <Title $darkMode={darkMode} style={{ '--stagger': 0 }}>
            {name || 'Your Name'}
          </Title>
          <Tagline $darkMode={darkMode} style={{ '--stagger': 1 }}>
            <Em $darkMode={darkMode}>{currentJobTitle || 'Software Engineer'}</Em> based in {location || 'Earth'}
          </Tagline>
        </Header>

        {/* Main Content */}
        <MainContent>
          {/* Three Column Layout */}
          <ColumnsWrapper>
            {/* Building Column */}
            <Column style={{ '--stagger': 2 }}>
              <ColumnHeader $darkMode={darkMode}>Building</ColumnHeader>
              <ColumnList>
                {activeProjects.map((project, idx) => (
                  <ListItem key={`proj-${idx}`} $darkMode={darkMode}>
                    <ItemHeader>
                      {project.url ? (
                        <ItemLink href={project.url} target="_blank" rel="noreferrer" $darkMode={darkMode}>
                          {project.name}
                          <ArrowIcon $darkMode={darkMode}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                          </ArrowIcon>
                        </ItemLink>
                      ) : (
                        <ItemText $darkMode={darkMode}>{project.name}</ItemText>
                      )}
                    </ItemHeader>
                    {project.summary && (
                      <ItemDescription $darkMode={darkMode}>{project.summary}</ItemDescription>
                    )}
                  </ListItem>
                ))}
              </ColumnList>
            </Column>

            {/* Experience Column */}
            <Column style={{ '--stagger': 3 }}>
              <ColumnHeader $darkMode={darkMode}>Experience</ColumnHeader>
              <ColumnList>
                {recentExperience.map((exp, idx) => (
                  <ListItem key={`exp-${idx}`} $darkMode={darkMode}>
                    <ItemHeader>
                      {exp.url ? (
                        <ItemLink href={exp.url} target="_blank" rel="noreferrer" $darkMode={darkMode}>
                          {exp.company}
                          <ArrowIcon $darkMode={darkMode}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                          </ArrowIcon>
                        </ItemLink>
                      ) : (
                        <ItemText $darkMode={darkMode}>{exp.company}</ItemText>
                      )}
                    </ItemHeader>
                    <ItemDescription $darkMode={darkMode}>
                      {exp.position || exp.positions?.[0]?.title}
                    </ItemDescription>
                  </ListItem>
                ))}
              </ColumnList>
            </Column>

            {/* Connect Column */}
            <Column style={{ '--stagger': 4 }}>
              <ColumnHeader $darkMode={darkMode}>Connect</ColumnHeader>
              <ColumnList>
                {email && (
                  <ListItem $darkMode={darkMode}>
                    <ItemLink href={`mailto:${email}`} $darkMode={darkMode}>
                      Email
                      <ArrowIcon $darkMode={darkMode}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                      </ArrowIcon>
                    </ItemLink>
                  </ListItem>
                )}
                {socialLinks.github && (
                  <ListItem $darkMode={darkMode}>
                    <ItemLink href={socialLinks.github} target="_blank" rel="noreferrer" $darkMode={darkMode}>
                      GitHub
                      <ArrowIcon $darkMode={darkMode}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                      </ArrowIcon>
                    </ItemLink>
                  </ListItem>
                )}
                {socialLinks.linkedin && (
                  <ListItem $darkMode={darkMode}>
                    <ItemLink href={socialLinks.linkedin} target="_blank" rel="noreferrer" $darkMode={darkMode}>
                      LinkedIn
                      <ArrowIcon $darkMode={darkMode}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                      </ArrowIcon>
                    </ItemLink>
                  </ListItem>
                )}
                {socialLinks.twitter && (
                  <ListItem $darkMode={darkMode}>
                    <ItemLink href={socialLinks.twitter} target="_blank" rel="noreferrer" $darkMode={darkMode}>
                      Twitter
                      <ArrowIcon $darkMode={darkMode}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                      </ArrowIcon>
                    </ItemLink>
                  </ListItem>
                )}
                {phone && (
                  <ListItem $darkMode={darkMode}>
                    <ItemLink href={`tel:${phone}`} $darkMode={darkMode}>
                      Phone
                      <ArrowIcon $darkMode={darkMode}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                      </ArrowIcon>
                    </ItemLink>
                  </ListItem>
                )}
              </ColumnList>
            </Column>

            {/* Recognition Column */}
            {(awards.length > 0 || presentations.length > 0) && (
              <Column style={{ '--stagger': 5 }}>
                <ColumnHeader $darkMode={darkMode}>Recognition</ColumnHeader>
                <ColumnList>
                  {awards.slice(0, 2).map((award, idx) => (
                    <ListItem key={`award-${idx}`} $darkMode={darkMode}>
                      <ItemHeader>
                        <ItemText $darkMode={darkMode}>{award.name}</ItemText>
                      </ItemHeader>
                      {award.date && (
                        <ItemDescription $darkMode={darkMode}>{award.date}</ItemDescription>
                      )}
                    </ListItem>
                  ))}
                  {presentations.slice(0, 2).map((pres, idx) => (
                    <ListItem key={`pres-${idx}`} $darkMode={darkMode}>
                      <ItemHeader>
                        <ItemText $darkMode={darkMode}>{pres.name}</ItemText>
                      </ItemHeader>
                      {pres.location && (
                        <ItemDescription $darkMode={darkMode}>{pres.location}</ItemDescription>
                      )}
                    </ListItem>
                  ))}
                </ColumnList>
              </Column>
            )}

            {/* Publications Column */}
            {publications.length > 0 && (
              <Column style={{ '--stagger': 6 }}>
                <ColumnHeader $darkMode={darkMode}>Publications</ColumnHeader>
                <ColumnList>
                  {publications.slice(0, 4).map((pub, idx) => (
                    <ListItem key={`pub-${idx}`} $darkMode={darkMode}>
                      <ItemHeader>
                        {pub.doi ? (
                          <ItemLink href={`https://doi.org/${pub.doi}`} target="_blank" rel="noreferrer" $darkMode={darkMode}>
                            {pub.title || pub.name}
                            <ArrowIcon $darkMode={darkMode}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M7 17L17 7M17 7H7M17 7V17" />
                              </svg>
                            </ArrowIcon>
                          </ItemLink>
                        ) : (
                          <ItemText $darkMode={darkMode}>{pub.title || pub.name}</ItemText>
                        )}
                      </ItemHeader>
                      {pub.journal && (
                        <ItemDescription $darkMode={darkMode}>{pub.journal}</ItemDescription>
                      )}
                    </ListItem>
                  ))}
                </ColumnList>
              </Column>
            )}

            {/* Education Column */}
            {education && education.length > 0 && (
              <Column style={{ '--stagger': 7 }}>
                <ColumnHeader $darkMode={darkMode}>Education</ColumnHeader>
                <ColumnList>
                  {education.slice(0, 4).map((edu, idx) => (
                    <ListItem key={`edu-${idx}`} $darkMode={darkMode}>
                      <ItemHeader>
                        <ItemText $darkMode={darkMode}>{edu.institution}</ItemText>
                      </ItemHeader>
                      <ItemDescription $darkMode={darkMode}>
                        {edu.degree}{edu.area ? ` in ${edu.area}` : ''}
                      </ItemDescription>
                    </ListItem>
                  ))}
                </ColumnList>
              </Column>
            )}

            {/* Volunteer Column */}
            {volunteerItems.length > 0 && (
              <Column style={{ '--stagger': 8 }}>
                <ColumnHeader $darkMode={darkMode}>Volunteer</ColumnHeader>
                <ColumnList>
                  {volunteerItems.slice(0, 4).map((vol, idx) => (
                    <ListItem key={`vol-${idx}`} $darkMode={darkMode}>
                      <ItemHeader>
                        <ItemText $darkMode={darkMode}>{vol.organization}</ItemText>
                      </ItemHeader>
                      <ItemDescription $darkMode={darkMode}>
                        {vol.position || vol.title}
                      </ItemDescription>
                    </ListItem>
                  ))}
                </ColumnList>
              </Column>
            )}

            {/* Professional Development Column */}
            {professionalDevelopment.length > 0 && (
              <Column style={{ '--stagger': 9 }}>
                <ColumnHeader $darkMode={darkMode}>Prof. Development</ColumnHeader>
                <ColumnList>
                  {professionalDevelopment.slice(0, 4).map((item, idx) => (
                    <ListItem key={`pd-${idx}`} $darkMode={darkMode}>
                      <ItemHeader>
                        <ItemText $darkMode={darkMode}>{item.name}</ItemText>
                      </ItemHeader>
                      {item.location && (
                        <ItemDescription $darkMode={darkMode}>{item.location}</ItemDescription>
                      )}
                    </ListItem>
                  ))}
                </ColumnList>
              </Column>
            )}
          </ColumnsWrapper>

          {/* About Section */}
          <AboutSection style={{ '--stagger': 5 }}>
            <SectionTitle $darkMode={darkMode}>Now</SectionTitle>
            <AboutText $darkMode={darkMode}>
              {about || 'Passionate about building great software and solving complex problems.'}
            </AboutText>
          </AboutSection>
        </MainContent>

        {/* Footer */}
        <Footer $darkMode={darkMode}>
          <FooterText $darkMode={darkMode}>Built with care.</FooterText>
          <FooterYear $darkMode={darkMode}>{new Date().getFullYear()}</FooterYear>
        </Footer>
      </Container>
    </PageWrapper>
  );
}

// Animations
const enter = keyframes`
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: none;
  }
`;

const animateIn = css`
  animation: 0.6s both ${enter};
  animation-delay: calc(var(--stagger, 0) * 0.12s);
`;

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${({ $darkMode }) => ($darkMode ? '#1c1c1c' : '#ffffff')};
  transition: background 0.3s ease;
`;

const Container = styled.div`
  max-width: 1072px;
  margin: 0 auto;
  padding: 128px 24px 48px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 64px 20px 32px;
  }
`;

const Header = styled.header`
  margin-bottom: 72px;

  @media (max-width: 768px) {
    margin-bottom: 48px;
  }
`;

const Title = styled.h1`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 30px;
  font-weight: 500;
  letter-spacing: -0.5px;
  color: ${({ $darkMode }) => ($darkMode ? '#ededed' : '#202020')};
  margin: 0 0 8px 0;
  line-height: 1.4;
  ${animateIn}
`;

const Tagline = styled.p`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  color: ${({ $darkMode }) => ($darkMode ? '#a0a0a0' : '#666666')};
  margin: 0;
  line-height: 1.75;
  ${animateIn}
`;

const Em = styled.em`
  font-family: 'Georgia', 'Times New Roman', serif;
  font-style: italic;
  color: ${({ $darkMode }) => ($darkMode ? '#ededed' : '#202020')};
`;

const MainContent = styled.main`
  flex: 1;
`;

const ColumnsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px;
  margin-bottom: 72px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const Column = styled.div`
  ${animateIn}
`;

const ColumnHeader = styled.h2`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ $darkMode }) => ($darkMode ? '#666666' : '#999999')};
  margin: 0 0 16px 0;
`;

const ColumnList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ListItem = styled.div`
  min-height: 56px;
`;

const ItemHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
`;

const ItemLink = styled.a`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  color: ${({ $darkMode }) => ($darkMode ? '#ededed' : '#202020')};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ $darkMode }) => ($darkMode ? '#5e5ce6' : '#5856d6')};
  }
`;

const ItemText = styled.span`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  color: ${({ $darkMode }) => ($darkMode ? '#ededed' : '#202020')};
`;

const ArrowIcon = styled.span`
  color: ${({ $darkMode }) => ($darkMode ? '#666666' : '#999999')};
  display: inline-flex;
  transition: color 0.2s ease, transform 0.2s ease;

  ${ItemLink}:hover & {
    color: ${({ $darkMode }) => ($darkMode ? '#5e5ce6' : '#5856d6')};
    transform: translate(2px, -2px);
  }
`;

const ItemDescription = styled.p`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  color: ${({ $darkMode }) => ($darkMode ? '#666666' : '#999999')};
  margin: 0;
  line-height: 1.5;
`;

const AboutSection = styled.section`
  max-width: 640px;
  ${animateIn}
`;

const SectionTitle = styled.h2`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: ${({ $darkMode }) => ($darkMode ? '#ededed' : '#202020')};
  margin: 0 0 16px 0;
`;

const AboutText = styled.p`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  color: ${({ $darkMode }) => ($darkMode ? '#a0a0a0' : '#666666')};
  margin: 0;
  line-height: 1.75;
`;

const Footer = styled.footer`
  margin-top: auto;
  padding-top: 72px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FooterText = styled.span`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 12px;
  color: ${({ $darkMode }) => ($darkMode ? '#666666' : '#999999')};
`;

const FooterYear = styled.span`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 12px;
  color: ${({ $darkMode }) => ($darkMode ? '#666666' : '#999999')};
  font-variant-numeric: tabular-nums;
`;
