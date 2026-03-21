import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useConfig } from './contexts/ConfigContext';
import { PORTFOLIO_THEMES, getPortfolioTheme, getThemeIdFromPath } from './themes';

const getInitialDarkMode = () => {
  try {
    const stored = localStorage.getItem('portfolioThemes-darkMode');
    if (stored !== null) return stored === 'true';
  } catch {}
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
};

const getInitialThemeId = () => {
  const themeIdFromUrl = getThemeIdFromPath(window.location.pathname);
  return themeIdFromUrl || 'ansub-minimal';
};

export default function App() {
  const { loading, error, uploadCV, resetCV, isCustomCV } = useConfig();
  const [currentThemeId, setCurrentThemeId] = useState(getInitialThemeId);
  const [showCatalog, setShowCatalog] = useState(false);
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('portfolioThemes-darkMode', darkMode);
    } catch {}
  }, [darkMode]);

  // Update URL when theme changes
  useEffect(() => {
    const theme = getPortfolioTheme(currentThemeId);
    const newPath = theme.slug === 'minimal' ? '/' : `/${theme.slug}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState({ themeId: currentThemeId }, '', newPath);
    }
  }, [currentThemeId]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.themeId) {
        setCurrentThemeId(event.state.themeId);
      } else {
        const themeId = getThemeIdFromPath(window.location.pathname);
        setCurrentThemeId(themeId || 'ansub-minimal');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const processFile = (file) => {
    if (!file) return;

    // Check file extension
    const validExtensions = ['.yaml', '.yml'];
    const hasValidExtension = validExtensions.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      alert('Please upload a .yaml or .yml file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        const result = uploadCV(content);
        if (!result.success) {
          alert(`Error parsing CV: ${result.error}`);
        }
      }
    };
    reader.onerror = () => {
      alert('Error reading file');
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    processFile(file);
    // Reset input so same file can be uploaded again
    event.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const currentTheme = useMemo(() => getPortfolioTheme(currentThemeId), [currentThemeId]);

  const currentThemeIndex = useMemo(() =>
    PORTFOLIO_THEMES.findIndex(t => t.id === currentThemeId),
    [currentThemeId]
  );

  const goToPrevTheme = () => {
    const prevIndex = currentThemeIndex <= 0 ? PORTFOLIO_THEMES.length - 1 : currentThemeIndex - 1;
    setCurrentThemeId(PORTFOLIO_THEMES[prevIndex].id);
  };

  const goToNextTheme = () => {
    const nextIndex = currentThemeIndex >= PORTFOLIO_THEMES.length - 1 ? 0 : currentThemeIndex + 1;
    setCurrentThemeId(PORTFOLIO_THEMES[nextIndex].id);
  };

  if (loading) {
    return (
      <LoadingScreen>
        <span>Loading resume data...</span>
      </LoadingScreen>
    );
  }

  if (error) {
    return (
      <ErrorScreen>
        <h2>Error loading resume</h2>
        <p>{error}</p>
        <p>Make sure CV.yaml is in the public folder.</p>
      </ErrorScreen>
    );
  }

  if (showCatalog) {
    return (
      <CatalogView $darkMode={darkMode}>
        <CatalogHeader>
          <h1>Resume Themes</h1>
          <HeaderActions>
            <ModeToggle
              $darkMode={darkMode}
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </ModeToggle>
            <CloseButton $darkMode={darkMode} onClick={() => setShowCatalog(false)}>Close</CloseButton>
          </HeaderActions>
        </CatalogHeader>
        <ThemeGrid>
          {PORTFOLIO_THEMES.map((theme) => (
            <ThemeCard
              key={theme.id}
              $active={theme.id === currentThemeId}
              $darkMode={darkMode}
              onClick={() => {
                setCurrentThemeId(theme.id);
                setShowCatalog(false);
              }}
            >
              <ThemeName $darkMode={darkMode}>{theme.name}</ThemeName>
              <ThemeDescription $darkMode={darkMode}>{theme.description}</ThemeDescription>
              {theme.source && (
                <ThemeSource
                  $darkMode={darkMode}
                  href={theme.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Inspired by {new URL(theme.source).hostname.replace('www.', '')}
                </ThemeSource>
              )}
            </ThemeCard>
          ))}
        </ThemeGrid>
      </CatalogView>
    );
  }

  const ThemeComponent = currentTheme?.Component;

  return (
    <AppContainer
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* <TopBar $darkMode={darkMode}>
        <ThemeInfo>
          <ThemeLabel $darkMode={darkMode}>Theme:</ThemeLabel>
          <CurrentThemeName $darkMode={darkMode}>{currentTheme?.name}</CurrentThemeName>
        </ThemeInfo>
        <TopBarActions>
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept=".yaml,.yml"
            onChange={handleFileUpload}
          />
          {isCustomCV ? (
            <ClearButton
              $darkMode={darkMode}
              onClick={resetCV}
              title="Clear uploaded CV"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              <ClearText>Clear CV</ClearText>
            </ClearButton>
          ) : (
            <UploadButton
              $darkMode={darkMode}
              onClick={() => fileInputRef.current?.click()}
              title="Upload CV.yaml"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <UploadText>Upload CV</UploadText>
            </UploadButton>
          )}
          <Separator $darkMode={darkMode} />
          <ThemeNavGroup>
            <NavArrowButton $darkMode={darkMode} onClick={goToPrevTheme} title="Previous theme">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </NavArrowButton>
            <NavArrowButton $darkMode={darkMode} onClick={goToNextTheme} title="Next theme">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </NavArrowButton>
          </ThemeNavGroup>
          <Separator $darkMode={darkMode} />
          <SwitcherButton $darkMode={darkMode} onClick={() => setShowCatalog(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <BrowseText>Browse Themes</BrowseText>
          </SwitcherButton>
          <ModeToggleSmall
            $darkMode={darkMode}
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </ModeToggleSmall>
        </TopBarActions>
      </TopBar> */}
      <ThemeContainer>
        {ThemeComponent ? <ThemeComponent darkMode={darkMode} /> : <div>No theme selected</div>}
      </ThemeContainer>
    </AppContainer>
  );
}

const LoadingScreen = styled.div`
  height: 100%;
  display: grid;
  place-items: center;
  background: #0b0b0b;
  color: #f5f5f5;
  font-size: 14px;
`;

const ErrorScreen = styled.div`
  height: 100%;
  display: grid;
  place-items: center;
  background: #0b0b0b;
  color: #f5f5f5;
  text-align: center;
  padding: 24px;

  h2 {
    color: #ef4444;
    margin-bottom: 8px;
  }

  p {
    color: #a3a3a3;
    margin-bottom: 4px;
  }
`;

const AppContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: ${({ $darkMode }) => ($darkMode ? '#0f0f0f' : '#ffffff')};
  border-bottom: 1px solid ${({ $darkMode }) => ($darkMode ? '#262626' : '#e5e7eb')};
  z-index: 1000;
  flex-shrink: 0;
`;

const ThemeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ThemeLabel = styled.span`
  font-size: 13px;
  color: ${({ $darkMode }) => ($darkMode ? '#737373' : '#6b7280')};
`;

const CurrentThemeName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#111827')};
`;

const ThemeNavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const NavArrowButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#f3f4f6')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#333' : '#d1d5db')};
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#e5e7eb')};
    border-color: ${({ $darkMode }) => ($darkMode ? '#444' : '#9ca3af')};
  }
`;

const Separator = styled.div`
  width: 1px;
  height: 24px;
  background: ${({ $darkMode }) => ($darkMode ? '#333' : '#d1d5db')};
  margin: 0 4px;
`;

const TopBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SwitcherButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#f3f4f6')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#333' : '#d1d5db')};
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  @media (max-width: 640px) {
    width: 36px;
    height: 36px;
    padding: 0;
  }

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#e5e7eb')};
    border-color: ${({ $darkMode }) => ($darkMode ? '#444' : '#9ca3af')};
  }
`;

const BrowseText = styled.span`
  @media (max-width: 640px) {
    display: none;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#f3f4f6')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#333' : '#d1d5db')};
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  @media (max-width: 640px) {
    width: 36px;
    height: 36px;
    padding: 0;
  }

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#e5e7eb')};
    border-color: ${({ $darkMode }) => ($darkMode ? '#444' : '#9ca3af')};
  }
`;

const UploadText = styled.span`
  @media (max-width: 640px) {
    display: none;
  }
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: ${({ $darkMode }) => ($darkMode ? '#7f1d1d' : '#fef2f2')};
  color: ${({ $darkMode }) => ($darkMode ? '#fca5a5' : '#dc2626')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#991b1b' : '#fecaca')};
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  @media (max-width: 640px) {
    width: 36px;
    height: 36px;
    padding: 0;
  }

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#991b1b' : '#fee2e2')};
    border-color: ${({ $darkMode }) => ($darkMode ? '#b91c1c' : '#fca5a5')};
  }
`;

const ClearText = styled.span`
  @media (max-width: 640px) {
    display: none;
  }
`;

const ModeToggleSmall = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $darkMode }) => ($darkMode ? '#1f1f1f' : '#f3f4f6')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#333' : '#d1d5db')};
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#e5e7eb')};
    border-color: ${({ $darkMode }) => ($darkMode ? '#444' : '#9ca3af')};
  }
`;

const ThemeContainer = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const CatalogView = styled.div`
  height: 100%;
  background: ${({ $darkMode }) => ($darkMode ? '#0b0b0b' : '#f9fafb')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#111827')};
  padding: 24px;
  overflow: auto;
  transition: background 0.2s, color 0.2s;
`;

const CatalogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h1 {
    font-size: 24px;
    font-weight: 600;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ModeToggle = styled.button`
  background: ${({ $darkMode }) => ($darkMode ? '#1f2937' : '#ffffff')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#374151' : '#d1d5db')};
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#374151' : '#f3f4f6')};
  }
`;

const CloseButton = styled.button`
  background: ${({ $darkMode }) => ($darkMode ? '#1f2937' : '#ffffff')};
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#374151')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#374151' : '#d1d5db')};
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#374151' : '#f3f4f6')};
  }
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const ThemeCard = styled.button`
  text-align: left;
  background: ${({ $active, $darkMode }) => {
    if ($darkMode) return $active ? '#1f2937' : '#111827';
    return $active ? '#e0e7ff' : '#ffffff';
  }};
  border: 2px solid ${({ $active, $darkMode }) => {
    if ($darkMode) return $active ? '#3b82f6' : '#1f2937';
    return $active ? '#3b82f6' : '#e5e7eb';
  }};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ $active, $darkMode }) => {
      if ($darkMode) return $active ? '#3b82f6' : '#374151';
      return $active ? '#3b82f6' : '#9ca3af';
    }};
  }
`;

const ThemeName = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${({ $darkMode }) => ($darkMode ? '#f5f5f5' : '#111827')};
`;

const ThemeDescription = styled.div`
  font-size: 13px;
  color: ${({ $darkMode }) => ($darkMode ? '#9ca3af' : '#6b7280')};
  line-height: 1.4;
`;

const ThemeSource = styled.a`
  display: inline-block;
  margin-top: 10px;
  font-size: 11px;
  color: ${({ $darkMode }) => ($darkMode ? '#60a5fa' : '#3b82f6')};
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: ${({ $darkMode }) => ($darkMode ? '#93c5fd' : '#2563eb')};
    text-decoration: underline;
  }
`;
