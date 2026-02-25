import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';

import ThreeView from './components/ThreeView';
import Header from './components/Header';
import Welcome from './components/Welcome';
import Bio from './components/Bio';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Technologies from './components/Technologies';
import Education from './components/Education';
import Awards from './components/Awards';
import Publications from './components/Publications';
import Presentations from './components/Presentations';
import ProfessionalDevelopment from './components/ProfessionalDevelopment';
import Volunteer from './components/Volunteer';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    overflow: hidden;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #000000;
    color: #ffffff;
    line-height: 1.6;
  }

  ::selection {
    background: rgba(6, 182, 212, 0.3);
    color: #ffffff;
  }
`;

const DeviconStyle = createGlobalStyle`
  @import url('https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css');
`;

const Wrapper = styled.div`
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const ScrollContainer = styled.div`
  position: relative;
  height: 100vh;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 1;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #18181b;
  }

  &::-webkit-scrollbar-thumb {
    background: #3f3f46;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #52525b;
  }
`;

const Content = styled.main`
  position: relative;
`;

const Footer = styled.footer`
  padding: 4rem 2rem;
  text-align: center;
  color: #52525b;
  font-size: 0.875rem;
  border-top: 1px solid #27272a;
  max-width: 800px;
  margin: 0 auto;
`;

const FooterLink = styled.a`
  color: #06b6d4;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

export function PalmesTheme() {
  const { cvData, getAboutContent } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);

  const scrollContainerRef = useRef(null);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  // Handle scroll events on the container
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight - container.clientHeight;
    const percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

    setScrollPercent(Math.min(100, Math.max(0, percent)));
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set isScrolling to false after scroll stops
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Extract CV data
  const fullName = cv?.name || 'Your Name';
  const email = cv?.email || null;
  const socials = cv?.social || [];
  const aboutText = getAboutContent()?.markdown || '';

  // Get current job title
  const currentTitle = useMemo(() => {
    const experiences = (cv?.sections?.experience || []).filter(e => !isArchived(e));
    if (experiences.length > 0) {
      const first = experiences[0];
      if (Array.isArray(first.positions) && first.positions.length > 0) {
        return first.positions[0]?.title || first.positions[0]?.position || '';
      }
      return first.position || first.title || '';
    }
    return '';
  }, [cv]);

  // Sections data
  const experiences = cv?.sections?.experience || [];
  const projects = cv?.sections?.projects || [];
  const skills = cv?.sections?.skills || cv?.sections?.certifications_skills || [];
  const education = cv?.sections?.education || [];
  const awards = cv?.sections?.awards || [];
  const publications = cv?.sections?.publications || [];
  const presentations = cv?.sections?.presentations || [];
  const professionalDevelopment = cv?.sections?.professional_development || [];
  const volunteer = cv?.sections?.volunteer || [];

  return (
    <>
      <GlobalStyle />
      <DeviconStyle />
      <Wrapper>
        <ThreeView scrollPercent={scrollPercent} isScrolling={isScrolling} />
        <ScrollContainer ref={scrollContainerRef}>
          <Header name={fullName} scrollContainerRef={scrollContainerRef} />
          <Content>
            <Welcome name={fullName} title={currentTitle} />
            <Bio about={aboutText} email={email} socials={socials} />
            <Experience experiences={experiences} />
            <Projects projects={projects} />
            <Technologies skills={skills} />
            <Education education={education} />
            <Awards awards={awards} />
            <Publications publications={publications} />
            <Presentations presentations={presentations} />
            <ProfessionalDevelopment items={professionalDevelopment} />
            <Volunteer volunteer={volunteer} />
            <Footer>
              <p>
                Built with{' '}
                <FooterLink href="https://react.dev" target="_blank" rel="noopener noreferrer">
                  React
                </FooterLink>
                {' & '}
                <FooterLink href="https://threejs.org" target="_blank" rel="noopener noreferrer">
                  Three.js
                </FooterLink>
              </p>
              <p style={{ marginTop: '0.5rem' }}>
                Inspired by{' '}
                <FooterLink href="https://palmes.dev" target="_blank" rel="noopener noreferrer">
                  palmes.dev
                </FooterLink>
              </p>
            </Footer>
          </Content>
        </ScrollContainer>
      </Wrapper>
    </>
  );
}
