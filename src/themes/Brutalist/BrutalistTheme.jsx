import React, { useMemo } from 'react';
import { useConfig } from '../../contexts/ConfigContext';

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

function formatDate(date) {
  if (!date) return '';
  if (isPresent(date)) return 'Present';
  return date;
}

export function BrutalistTheme() {
  const { cvData } = useConfig();
  const cv = useMemo(() => cvData?.cv || {}, [cvData]);

  const fullName = cv?.name || 'Your Name';
  const email = cv?.email || null;
  const website = cv?.website || null;
  const location = cv?.location || null;
  const phone = cv?.phone || null;

  const experienceItems = useMemo(() => {
    return flattenExperience(cv?.sections?.experience || []);
  }, [cv]);

  const projectItems = useMemo(() => {
    return cv?.sections?.projects || [];
  }, [cv]);

  const educationItems = useMemo(() => {
    return cv?.sections?.education || [];
  }, [cv]);

  const skills = useMemo(() => {
    return cv?.sections?.certifications_skills || [];
  }, [cv]);

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

  const volunteerItems = useMemo(() => {
    return cv?.sections?.volunteer || [];
  }, [cv]);

  return (
    <div style={{ height: '100%', width: '100%', overflow: 'auto' }}>
      <div>
        <h1>{fullName}</h1>
        <p>
          {location && <>{location}<br /></>}
          {email && <><a href={`mailto:${email}`}>{email}</a><br /></>}
          {phone && <>{phone}<br /></>}
          {website && <><a href={website}>{website}</a></>}
        </p>

        {experienceItems.length > 0 && (
          <>
            <h2>Experience</h2>
            {experienceItems.map((item, idx) => (
              <div key={`${item.company}-${item.title}-${idx}`}>
                <h3>
                  {item.title}
                  {isPresent(item.endDate) && <> (Current)</>}
                </h3>
                <p>
                  <em>{item.company}</em> — {formatDate(item.startDate)} to {formatDate(item.endDate)}
                </p>
                {item.highlights.length > 0 && (
                  <ul>
                    {item.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        {educationItems.length > 0 && (
          <>
            <h2>Education</h2>
            {educationItems.map((edu, idx) => (
              <div key={`${edu.institution}-${idx}`}>
                <h3>{edu.degree} in {edu.area}</h3>
                <p>
                  <em>{edu.institution}</em> — {formatDate(edu.start_date)} to {formatDate(edu.end_date)}
                </p>
              </div>
            ))}
          </>
        )}

        {projectItems.length > 0 && (
          <>
            <h2>Projects</h2>
            {projectItems.map((project, idx) => (
              <div key={`${project.name}-${idx}`}>
                <h3>
                  {project.name}
                  {project.url && <> — <a href={project.url}>link</a></>}
                </h3>
                {project.summary && <p>{project.summary}</p>}
              </div>
            ))}
          </>
        )}

        {skills.length > 0 && (
          <>
            <h2>Skills</h2>
            <ul>
              {skills.map((skill, idx) => (
                <li key={idx}>
                  <strong>{skill.label}:</strong> {skill.details}
                </li>
              ))}
            </ul>
          </>
        )}

        {awardItems.length > 0 && (
          <>
            <h2>Awards</h2>
            {awardItems.map((award, idx) => (
              <div key={`award-${idx}`}>
                <h3>{award.name}</h3>
                <p>
                  <em>{award.summary}</em> — {award.date}
                </p>
              </div>
            ))}
          </>
        )}

        {presentationItems.length > 0 && (
          <>
            <h2>Presentations</h2>
            {presentationItems.map((pres, idx) => (
              <div key={`pres-${idx}`}>
                <h3>{pres.name}</h3>
                <p>
                  <em>{pres.summary}</em> — {pres.location} ({pres.date})
                </p>
              </div>
            ))}
          </>
        )}

        {publicationItems.length > 0 && (
          <>
            <h2>Publications</h2>
            {publicationItems.map((pub, idx) => (
              <div key={`pub-${idx}`}>
                <h3>
                  {pub.title}
                  {pub.doi && <> — <a href={`https://doi.org/${pub.doi}`}>DOI</a></>}
                </h3>
                <p>
                  <em>{pub.journal}</em> ({pub.date})
                </p>
                {pub.authors && <p><small>Authors: {pub.authors.join(', ')}</small></p>}
              </div>
            ))}
          </>
        )}

        {professionalDevItems.length > 0 && (
          <>
            <h2>Professional Development</h2>
            {professionalDevItems.map((item, idx) => (
              <div key={`profdev-${idx}`}>
                <h3>{item.name}</h3>
                <p>
                  <em>{item.summary}</em> — {item.location} ({item.date})
                </p>
              </div>
            ))}
          </>
        )}

        {volunteerItems.length > 0 && (
          <>
            <h2>Volunteer</h2>
            {volunteerItems.map((vol, idx) => (
              <div key={`vol-${idx}`}>
                <h3>
                  {vol.position || vol.title}
                  {isPresent(vol.end_date) && <> (Current)</>}
                </h3>
                <p>
                  <em>{vol.organization}</em> — {formatDate(vol.start_date)} to {formatDate(vol.end_date)}
                </p>
                {vol.summary && <p>{vol.summary}</p>}
              </div>
            ))}
          </>
        )}

        <hr />
        <p><small>This is a resume. It's lightweight and loads fast.</small></p>
      </div>
    </div>
  );
}
