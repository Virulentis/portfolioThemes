import React from 'react';
import styled from 'styled-components';

const Section = styled.section`
  padding: 6rem 2rem;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 4rem 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #06b6d4;
  margin-bottom: 3rem;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Card = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: #3f3f46;
  }
`;

const Icon = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(6, 182, 212, 0.1);
  border-radius: 8px;
  color: #06b6d4;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.25rem;
`;

const TitleLink = styled.a`
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #06b6d4;
  }
`;

const Journal = styled.p`
  font-size: 0.875rem;
  color: #a855f7;
  margin-bottom: 0.25rem;
`;

const DateText = styled.span`
  font-size: 0.75rem;
  color: #71717a;
`;

const Authors = styled.p`
  margin-top: 0.5rem;
  color: #a1a1aa;
  font-size: 0.875rem;
  line-height: 1.5;
`;

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function Publications({ publications = [] }) {
  const filtered = publications.filter(p => !isArchived(p));

  if (filtered.length === 0) {
    return null;
  }

  return (
    <Section id="publications">
      <SectionTitle>Publications</SectionTitle>
      <List>
        {filtered.map((pub, index) => (
          <Card key={index}>
            <Icon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </Icon>
            <Content>
              {pub.doi ? (
                <TitleLink href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">
                  {pub.title}
                </TitleLink>
              ) : (
                <Title>{pub.title}</Title>
              )}
              {pub.journal && <Journal>{pub.journal}</Journal>}
              {pub.date && <DateText>{formatDate(pub.date)}</DateText>}
              {pub.authors && pub.authors.length > 0 && (
                <Authors>{pub.authors.join(', ')}</Authors>
              )}
            </Content>
          </Card>
        ))}
      </List>
    </Section>
  );
}
