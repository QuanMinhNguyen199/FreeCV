import React from 'react';
import { Phone, Calendar, Mail, Globe, MapPin } from 'lucide-react';

// Dictionary for translation
const dict = {
  vi: {
    skills: 'Kỹ năng',
    hobbies: 'Sở thích',
    summary: 'Mục tiêu nghề nghiệp',
    experience: 'Kinh nghiệm làm việc',
    education: 'Học vấn',
    projects: 'Dự án'
  },
  en: {
    skills: 'Skills',
    hobbies: 'Hobbies',
    summary: 'Career Objective',
    experience: 'Work Experience',
    education: 'Education',
    projects: 'Projects'
  }
};

const CVPreview = ({ cvData, theme, language }) => {
  const { personalInfo, experience, education, projects, skills, hobbies } = cvData;
  const t = dict[language] || dict['vi'];

  const SectionTitle = ({ title, colorClass }) => (
    <div className="section-title-wrapper">
      <div className={`section-pill ${colorClass}`}>
        {title}
      </div>
      <div className="section-line"></div>
    </div>
  );

  return (
    <div className={`cv-document ${theme}`}>
      <div className="cv-left">
        <div className="cv-avatar-container">
          {personalInfo.avatar ? (
            <img src={personalInfo.avatar} alt="Avatar" className="cv-avatar" />
          ) : (
            <div className="cv-avatar-placeholder"></div>
          )}
        </div>
        
        <div className="cv-name-title">
          <h1 className="cv-name">{personalInfo.name}</h1>
          <h2 className="cv-title">{personalInfo.title}</h2>
        </div>

        <div className="cv-contact-info">
          {personalInfo.phone && (
            <div className="contact-item">
              <Phone size={14} className="contact-icon" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.dob && (
            <div className="contact-item">
              <Calendar size={14} className="contact-icon" />
              <span>{personalInfo.dob}</span>
            </div>
          )}
          {personalInfo.email && (
            <div className="contact-item">
              <Mail size={14} className="contact-icon" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="contact-item">
              <Globe size={14} className="contact-icon" />
              <span>{personalInfo.linkedin}</span>
            </div>
          )}
          {personalInfo.address && (
            <div className="contact-item">
              <MapPin size={14} className="contact-icon" />
              <span>{personalInfo.address}</span>
            </div>
          )}
        </div>

        {skills && skills.length > 0 && (
          <div className="cv-section-left">
            <SectionTitle title={t.skills} colorClass="pill-light" />
            <div className="skills-list">
              {skills.map((skill) => (
                <div key={skill.id} className="skill-item">
                  <strong>{skill.name}: </strong>
                  <span>{skill.details}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {hobbies && hobbies.length > 0 && (
          <div className="cv-section-left">
            <SectionTitle title={t.hobbies} colorClass="pill-light" />
            <div className="hobbies-list">
              {hobbies.map((hobby) => (
                <div key={hobby.id} className="hobby-item">
                  {hobby.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="cv-right">
        {personalInfo.summary && (
          <div className="cv-section-right">
            <SectionTitle title={t.summary} colorClass="pill-dark" />
            <div className="cv-summary-text">
              {personalInfo.summary}
            </div>
          </div>
        )}

        {experience && experience.length > 0 && (
          <div className="cv-section-right">
            <SectionTitle title={t.experience} colorClass="pill-dark" />
            <div className="timeline">
              {experience.map((exp) => (
                <div key={exp.id} className="timeline-item">
                  <div className="timeline-header">
                    <h3 className="timeline-title">{exp.position}</h3>
                    <span className="timeline-date">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <div className="timeline-subtitle">{exp.company}</div>
                  <div className="timeline-content">
                    {exp.description.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {education && education.length > 0 && (
          <div className="cv-section-right">
            <SectionTitle title={t.education} colorClass="pill-dark" />
            <div className="timeline">
              {education.map((edu) => (
                <div key={edu.id} className="timeline-item">
                  <div className="timeline-header">
                    <h3 className="timeline-title">{edu.degree}</h3>
                    <span className="timeline-date">{edu.startDate} - {edu.endDate}</span>
                  </div>
                  <div className="timeline-subtitle">{edu.school}</div>
                  <div className="timeline-content">
                    {edu.description.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div className="cv-section-right">
            <SectionTitle title={t.projects} colorClass="pill-dark" />
            <div className="timeline">
              {projects.map((proj) => (
                <div key={proj.id} className="timeline-item">
                  <div className="timeline-header">
                    <h3 className="timeline-title">{proj.role}</h3>
                    <span className="timeline-date">{proj.startDate} - {proj.endDate}</span>
                  </div>
                  <div className="timeline-subtitle" style={{ fontWeight: '600', color: 'var(--right-text-color, #111827)' }}>{proj.name}</div>
                  <div className="timeline-content">
                    {proj.description.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVPreview;
