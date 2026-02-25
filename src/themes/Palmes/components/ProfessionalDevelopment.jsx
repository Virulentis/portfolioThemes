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

const Location = styled.p`
  font-size: 0.875rem;
  color: #db2777;
  margin-bottom: 0.25rem;
`;

const DateText = styled.span`
  font-size: 0.75rem;
  color: #71717a;
`;

const Summary = styled.p`
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

export default function ProfessionalDevelopment({ items = [] }) {
  const filtered = items.filter(i => !isArchived(i));

  if (filtered.length === 0) {
    return null;
  }

  return (
    <Section id="professional-development">
      <SectionTitle>Professional Development</SectionTitle>
      <List>
        {filtered.map((item, index) => (
          <Card key={index}>
            <Icon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </Icon>
            <Content>
              <Title>{item.name}</Title>
              {item.location && <Location>{item.location}</Location>}
              {item.date && <DateText>{formatDate(item.date)}</DateText>}
              {item.summary && <Summary>{item.summary}</Summary>}
            </Content>
          </Card>
        ))}
      </List>
    </Section>
  );
}
