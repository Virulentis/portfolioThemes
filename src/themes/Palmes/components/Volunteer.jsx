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

const Organization = styled.p`
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

export default function Volunteer({ volunteer = [] }) {
  const filtered = volunteer.filter(v => !isArchived(v));

  if (filtered.length === 0) {
    return null;
  }

  return (
    <Section id="volunteer">
      <SectionTitle>Volunteer</SectionTitle>
      <List>
        {filtered.map((vol, index) => (
          <Card key={index}>
            <Icon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Icon>
            <Content>
              <Title>{vol.position || vol.title}</Title>
              <Organization>{vol.organization}</Organization>
              <DateText>{formatDate(vol.start_date)} — {formatDate(vol.end_date)}</DateText>
              {vol.summary && <Summary>{vol.summary}</Summary>}
            </Content>
          </Card>
        ))}
      </List>
    </Section>
  );
}
