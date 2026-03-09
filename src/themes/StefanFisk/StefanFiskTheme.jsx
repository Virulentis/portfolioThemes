import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';

function formatWebsiteLabel(url) {
  if (!url) return '';

  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function StefanFiskTheme({ darkMode = false }) {
  const { cv } = useConfig();

  const fullName = cv?.name || 'Your Name';
  const email = cv?.email || null;
  const phone = cv?.phone || null;
  const website = cv?.website || null;

  const contactItems = useMemo(() => {
    const items = [];

    if (email) {
      items.push({
        href: `mailto:${email}`,
        label: email,
      });
    }

    if (phone) {
      items.push({
        href: `tel:${phone}`,
        label: phone,
      });
    }

    if (website) {
      items.push({
        href: website,
        label: formatWebsiteLabel(website),
      });
    }

    return items;
  }, [email, phone, website]);

  return (
    <Page $darkMode={darkMode}>
      <Main>
        <Name>{fullName}</Name>
        {contactItems.map((item) => (
          <ContactLink
            key={item.href}
            href={item.href}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel={item.href.startsWith('http') ? 'noreferrer noopener' : undefined}
          >
            {item.label}
          </ContactLink>
        ))}
      </Main>
    </Page>
  );
}

const Page = styled.div`
  position: relative;
  height: 100%;
  margin: 0;
  padding: 0;
  background: ${({ $darkMode }) => ($darkMode ? '#111111' : '#ffffff')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#111111')};
  font-family: Georgia, 'Times New Roman', Times, serif;
`;

const Main = styled.main`
  position: relative;
  top: 40%;
  transform: translateY(-50%);
  text-align: center;
  padding: 24px;
`;

const Name = styled.h1`
  margin: 0 0 8px;
  display: inline;
  font-size: clamp(2rem, 5vw, 3.25rem);
  font-weight: 700;
  line-height: 1.1;
`;

const ContactLink = styled.a`
  display: block;
  width: fit-content;
  margin: 10px auto 0;
  color: inherit;
  text-decoration: none;
  font-size: clamp(1rem, 2vw, 1.1rem);

  &:visited {
    color: inherit;
  }

  &:hover {
    text-decoration: underline;
  }
`;
