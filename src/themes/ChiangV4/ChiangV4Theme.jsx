import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';

const colors = {
  darkNavy: '#020c1b',
  navy: '#0a192f',
  lightNavy: '#112240',
  lightestNavy: '#233554',
  slate: '#8892b0',
  lightSlate: '#a8b2d1',
  lightestSlate: '#ccd6f6',
  white: '#e6f1ff',
  green: '#64ffda',
  greenTint: 'rgba(100, 255, 218, 0.1)',
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

export function ChiangV4Theme() {
  const { cvData } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);

  const fullName = cv?.name || 'Your Name';
  const email = cv?.email || null;
  const phone = cv?.phone || null;
  const website = cv?.website || null;

  const socials = cv?.social || [];

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

  const githubUrl = pickSocialUrl(socials, ['github']);
  const linkedinUrl = pickSocialUrl(socials, ['linkedin']);
  const twitterUrl = pickSocialUrl(socials, ['twitter', 'x']);

  const experienceItems = useMemo(() => {
    return flattenExperience(cv?.sections?.experience || []).slice(0, 5);
  }, [cv]);

  const projectItems = useMemo(() => {
    return (cv?.sections?.projects || []).slice(0, 6);
  }, [cv]);

  const skills = useMemo(() => {
    return cv?.sections?.certifications_skills || [];
  }, [cv]);

  return (
    <Container>
      <Content>
        <Hero>
          <HeroGreeting>Hi, my name is</HeroGreeting>
          <HeroName>{fullName}</HeroName>
          <HeroTagline>I build things for the web.</HeroTagline>
          <HeroDescription>
            I'm a software engineer specializing in building exceptional digital experiences.
          </HeroDescription>
          {email && (
            <HeroButton href={`mailto:${email}`} target="_blank" rel="noreferrer">
              Get In Touch
            </HeroButton>
          )}
        </Hero>

        <Section id="about">
          <SectionTitle><SectionNumber>01.</SectionNumber> About Me</SectionTitle>
          <AboutContent>
            <p>
              Hello! I enjoy creating things that live on the internet. My interest in development
              started back when I decided to customize my first website.
            </p>
            {skills.length > 0 && (
              <>
                <p>Here are a few technologies I've been working with recently:</p>
                <SkillsList>
                  {skills.slice(0, 2).map((skill, idx) => (
                    <li key={idx}>{skill.details}</li>
                  ))}
                </SkillsList>
              </>
            )}
          </AboutContent>
        </Section>

        <Section id="experience">
          <SectionTitle><SectionNumber>02.</SectionNumber> Where I've Worked</SectionTitle>
          <ExperienceList>
            {experienceItems.map((item, idx) => (
              <ExperienceItem key={`${item.company}-${item.title}-${idx}`}>
                <ExperienceHeader>
                  <ExperienceTitle>
                    {item.title} <ExperienceCompany>@ {item.company}</ExperienceCompany>
                  </ExperienceTitle>
                  <ExperienceDate>{formatDateRange(item.startDate, item.endDate)}</ExperienceDate>
                </ExperienceHeader>
                {item.highlights.length > 0 && (
                  <ExperienceHighlights>
                    {item.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ExperienceHighlights>
                )}
              </ExperienceItem>
            ))}
          </ExperienceList>
        </Section>

        <Section id="projects">
          <SectionTitle><SectionNumber>03.</SectionNumber> Some Things I've Built</SectionTitle>
          <ProjectsGrid>
            {projectItems.map((project, idx) => (
              <ProjectCard key={`${project.name}-${idx}`}>
                <ProjectTop>
                  <FolderIcon>📁</FolderIcon>
                  {project.url && (
                    <ProjectLinks>
                      <a href={project.url} target="_blank" rel="noreferrer">↗</a>
                    </ProjectLinks>
                  )}
                </ProjectTop>
                <ProjectTitle>{project.name}</ProjectTitle>
                <ProjectDescription>{project.summary}</ProjectDescription>
                {project.technologies && (
                  <ProjectTech>
                    {project.technologies.map((tech, i) => (
                      <span key={i}>{tech}</span>
                    ))}
                  </ProjectTech>
                )}
              </ProjectCard>
            ))}
          </ProjectsGrid>
        </Section>

        <Section id="contact">
          <SectionTitle><SectionNumber>04.</SectionNumber> What's Next?</SectionTitle>
          <ContactContent>
            <ContactHeading>Get In Touch</ContactHeading>
            <ContactText>
              I'm currently looking for new opportunities. Whether you have a question or just want to say hi,
              my inbox is always open!
            </ContactText>
            {email && (
              <HeroButton href={`mailto:${email}`} target="_blank" rel="noreferrer">
                Say Hello
              </HeroButton>
            )}
          </ContactContent>
        </Section>

        {educationItems.length > 0 && (
          <Section id="education">
            <SectionTitle><SectionNumber>05.</SectionNumber> Education</SectionTitle>
            <ExperienceList>
              {educationItems.map((edu, idx) => (
                <ExperienceItem key={`edu-${idx}`}>
                  <ExperienceHeader>
                    <ExperienceTitle>
                      {edu.degree} in {edu.area} <ExperienceCompany>@ {edu.institution}</ExperienceCompany>
                    </ExperienceTitle>
                    <ExperienceDate>{formatDateRange(edu.start_date, edu.end_date)}</ExperienceDate>
                  </ExperienceHeader>
                </ExperienceItem>
              ))}
            </ExperienceList>
          </Section>
        )}

        {volunteerItems.length > 0 && (
          <Section id="volunteer">
            <SectionTitle><SectionNumber>06.</SectionNumber> Volunteer</SectionTitle>
            <ExperienceList>
              {volunteerItems.map((vol, idx) => (
                <ExperienceItem key={`vol-${idx}`}>
                  <ExperienceHeader>
                    <ExperienceTitle>
                      {vol.position || vol.title} <ExperienceCompany>@ {vol.organization}</ExperienceCompany>
                    </ExperienceTitle>
                    <ExperienceDate>{formatDateRange(vol.start_date, vol.end_date)}</ExperienceDate>
                  </ExperienceHeader>
                  {vol.summary && (
                    <ExperienceHighlights>
                      <li>{vol.summary}</li>
                    </ExperienceHighlights>
                  )}
                </ExperienceItem>
              ))}
            </ExperienceList>
          </Section>
        )}

        {awardItems.length > 0 && (
          <Section id="awards">
            <SectionTitle><SectionNumber>07.</SectionNumber> Awards & Recognition</SectionTitle>
            <ExperienceList>
              {awardItems.map((award, idx) => (
                <ExperienceItem key={`award-${idx}`}>
                  <ExperienceHeader>
                    <ExperienceTitle>{award.name}</ExperienceTitle>
                    <ExperienceDate>{award.date}</ExperienceDate>
                  </ExperienceHeader>
                  {award.summary && (
                    <ExperienceHighlights>
                      <li>{award.summary}</li>
                    </ExperienceHighlights>
                  )}
                </ExperienceItem>
              ))}
            </ExperienceList>
          </Section>
        )}

        {presentationItems.length > 0 && (
          <Section id="presentations">
            <SectionTitle><SectionNumber>08.</SectionNumber> Presentations</SectionTitle>
            <ExperienceList>
              {presentationItems.map((pres, idx) => (
                <ExperienceItem key={`pres-${idx}`}>
                  <ExperienceHeader>
                    <ExperienceTitle>{pres.name}</ExperienceTitle>
                    <ExperienceDate>{pres.date}</ExperienceDate>
                  </ExperienceHeader>
                  {(pres.summary || pres.location) && (
                    <ExperienceHighlights>
                      {pres.summary && <li>{pres.summary}</li>}
                      {pres.location && <li>Location: {pres.location}</li>}
                    </ExperienceHighlights>
                  )}
                </ExperienceItem>
              ))}
            </ExperienceList>
          </Section>
        )}

        {publicationItems.length > 0 && (
          <Section id="publications">
            <SectionTitle><SectionNumber>09.</SectionNumber> Publications</SectionTitle>
            <ProjectsGrid>
              {publicationItems.map((pub, idx) => (
                <ProjectCard key={`pub-${idx}`}>
                  <ProjectTop>
                    <FolderIcon>📄</FolderIcon>
                    {pub.doi && (
                      <ProjectLinks>
                        <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noreferrer">↗</a>
                      </ProjectLinks>
                    )}
                  </ProjectTop>
                  <ProjectTitle>{pub.title}</ProjectTitle>
                  <ProjectDescription>{pub.journal} ({pub.date})</ProjectDescription>
                </ProjectCard>
              ))}
            </ProjectsGrid>
          </Section>
        )}

        {professionalDevItems.length > 0 && (
          <Section id="professional-development">
            <SectionTitle><SectionNumber>10.</SectionNumber> Professional Development</SectionTitle>
            <ExperienceList>
              {professionalDevItems.map((item, idx) => (
                <ExperienceItem key={`profdev-${idx}`}>
                  <ExperienceHeader>
                    <ExperienceTitle>{item.name}</ExperienceTitle>
                    <ExperienceDate>{item.date}</ExperienceDate>
                  </ExperienceHeader>
                  {(item.summary || item.location) && (
                    <ExperienceHighlights>
                      {item.summary && <li>{item.summary}</li>}
                      {item.location && <li>Location: {item.location}</li>}
                    </ExperienceHighlights>
                  )}
                </ExperienceItem>
              ))}
            </ExperienceList>
          </Section>
        )}

        <Footer>
          <SocialLinks>
            {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer">GitHub</a>}
            {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>}
            {twitterUrl && <a href={twitterUrl} target="_blank" rel="noreferrer">Twitter</a>}
            {phone && <a href={`tel:${phone}`}>Phone</a>}
          </SocialLinks>
          <FooterCredit>
            Built with React & styled-components
          </FooterCredit>
        </Footer>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100%;
  width: 100%;
  background: ${colors.navy};
  color: ${colors.slate};
  font-family: 'Calibre', 'Inter', 'San Francisco', 'SF Pro Text', -apple-system, system-ui, sans-serif;
  font-size: 18px;
  line-height: 1.6;
  overflow: auto;
`;

const Content = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 50px;

  @media (max-width: 768px) {
    padding: 0 25px;
  }
`;

const Hero = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0;
`;

const HeroGreeting = styled.p`
  color: ${colors.green};
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 16px;
  margin-bottom: 20px;
`;

const HeroName = styled.h1`
  color: ${colors.lightestSlate};
  font-size: clamp(40px, 8vw, 80px);
  font-weight: 600;
  margin: 0;
  line-height: 1.1;
`;

const HeroTagline = styled.h2`
  color: ${colors.slate};
  font-size: clamp(40px, 8vw, 80px);
  font-weight: 600;
  margin: 10px 0 0;
  line-height: 1.1;
`;

const HeroDescription = styled.p`
  max-width: 540px;
  margin-top: 20px;
  color: ${colors.slate};
`;

const HeroButton = styled.a`
  display: inline-block;
  margin-top: 40px;
  padding: 18px 28px;
  border: 1px solid ${colors.green};
  border-radius: 4px;
  color: ${colors.green};
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.25s ease;

  &:hover {
    background: ${colors.greenTint};
  }
`;

const Section = styled.section`
  padding: 100px 0;
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  font-size: 28px;
  font-weight: 600;
  color: ${colors.lightestSlate};
  margin-bottom: 40px;

  &::after {
    content: '';
    display: block;
    height: 1px;
    width: 200px;
    background: ${colors.lightestNavy};
    margin-left: 20px;

    @media (max-width: 768px) {
      width: 100px;
    }
  }
`;

const SectionNumber = styled.span`
  color: ${colors.green};
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 20px;
  margin-right: 10px;
`;

const AboutContent = styled.div`
  max-width: 600px;

  p {
    margin-bottom: 15px;
  }
`;

const SkillsList = styled.ul`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 0;
  margin-top: 20px;
  list-style: none;

  li {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 13px;

    &::before {
      content: '▹';
      color: ${colors.green};
      margin-right: 10px;
    }
  }
`;

const ExperienceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const ExperienceItem = styled.div`
  padding-left: 20px;
  border-left: 2px solid ${colors.lightestNavy};
`;

const ExperienceHeader = styled.div`
  margin-bottom: 10px;
`;

const ExperienceTitle = styled.h3`
  font-size: 20px;
  font-weight: 500;
  color: ${colors.lightestSlate};
  margin: 0;
`;

const ExperienceCompany = styled.span`
  color: ${colors.green};
`;

const ExperienceDate = styled.p`
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  color: ${colors.slate};
  margin: 5px 0 0;
`;

const ExperienceHighlights = styled.ul`
  padding: 0;
  margin: 15px 0 0;
  list-style: none;

  li {
    position: relative;
    padding-left: 20px;
    margin-bottom: 10px;
    font-size: 16px;

    &::before {
      content: '▹';
      position: absolute;
      left: 0;
      color: ${colors.green};
    }
  }
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
`;

const ProjectCard = styled.div`
  background: ${colors.lightNavy};
  padding: 30px;
  border-radius: 4px;
  transition: transform 0.25s ease;

  &:hover {
    transform: translateY(-7px);
  }
`;

const ProjectTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const FolderIcon = styled.div`
  font-size: 40px;
`;

const ProjectLinks = styled.div`
  a {
    color: ${colors.lightSlate};
    font-size: 20px;
    text-decoration: none;

    &:hover {
      color: ${colors.green};
    }
  }
`;

const ProjectTitle = styled.h3`
  font-size: 20px;
  color: ${colors.lightestSlate};
  margin: 0 0 10px;
`;

const ProjectDescription = styled.p`
  font-size: 15px;
  color: ${colors.lightSlate};
  margin: 0;
`;

const ProjectTech = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;

  span {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12px;
    color: ${colors.slate};
  }
`;

const ContactContent = styled.div`
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`;

const ContactHeading = styled.h3`
  font-size: 50px;
  color: ${colors.lightestSlate};
  margin-bottom: 20px;
`;

const ContactText = styled.p`
  margin-bottom: 40px;
`;

const Footer = styled.footer`
  padding: 50px 0;
  text-align: center;
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;

  a {
    color: ${colors.lightSlate};
    text-decoration: none;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 13px;

    &:hover {
      color: ${colors.green};
    }
  }
`;

const FooterCredit = styled.p`
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  color: ${colors.slate};
`;
