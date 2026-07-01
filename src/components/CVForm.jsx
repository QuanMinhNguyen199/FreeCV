import React, { useRef, useState } from 'react';
import { Plus, Trash2, Upload, FileJson, FileText, X } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const CVForm = ({ cvData, setCvData, onImport }) => {
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const [extractedPdfText, setExtractedPdfText] = useState('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setCvData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: value,
      },
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCvData((prev) => ({
          ...prev,
          personalInfo: { ...prev.personalInfo, avatar: event.target.result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleArrayItemChange = (section, id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      [section]: prev[section].map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = (section, defaultItem) => {
    setCvData((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), { id: Date.now().toString(), ...defaultItem }],
    }));
  };

  const removeItem = (section, id) => {
    setCvData((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== id),
    }));
  };

  const handleImportJson = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          onImport(json);
        } catch (error) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const extractTextFromPDF = async (pdfData) => {
    try {
      const loadingTask = pdfjsLib.getDocument({ data: pdfData });
      const pdf = await loadingTask.promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
      }
      
      setExtractedPdfText(fullText);
      setIsPdfModalOpen(true);
    } catch (error) {
      console.error('Error reading PDF:', error);
      alert('Error parsing PDF file.');
    }
  };

  const handleImportPdf = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const typedArray = new Uint8Array(event.target.result);
        await extractTextFromPDF(typedArray);
      };
      reader.readAsArrayBuffer(file);
    }
    e.target.value = null;
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cvData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "cv_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="cv-form-container">
      {/* Actions (Import/Export) */}
      <div className="form-section" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>
          <Upload size={18} /> Import JSON
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".json" 
          onChange={handleImportJson} 
        />
        <button className="btn btn-secondary" onClick={handleExportJson}>
          <FileJson size={18} /> Export JSON
        </button>
        <button className="btn btn-secondary" onClick={() => pdfInputRef.current.click()} style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
          <FileText size={18} /> Import PDF Text
        </button>
        <input 
          type="file" 
          ref={pdfInputRef} 
          style={{ display: 'none' }} 
          accept="application/pdf" 
          onChange={handleImportPdf} 
        />
      </div>

      {isPdfModalOpen && (
        <div className="form-section" style={{ marginBottom: '1.5rem', background: '#fffbeb', borderColor: '#fde68a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="form-section-title" style={{ margin: 0, color: '#d97706' }}>📄 PDF Extracted Text</h2>
            <button className="btn btn-icon btn-secondary" onClick={() => setIsPdfModalOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '1rem' }}>
            Dưới đây là văn bản thô được trích xuất từ file PDF cũ của bạn. Hãy copy các phần cần thiết và dán vào form bên dưới.
          </p>
          <textarea 
            className="form-control" 
            style={{ width: '100%', minHeight: '200px', fontSize: '0.9rem', fontFamily: 'monospace', background: 'white' }}
            readOnly
            value={extractedPdfText}
          />
        </div>
      )}

      {/* Personal Info */}
      <div className="form-section" style={{ marginBottom: '1.5rem' }}>
        <h2 className="form-section-title">Thông tin cá nhân</h2>
        
        <div className="form-group">
          <label>Ảnh đại diện (Avatar)</label>
          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="form-control" />
        </div>

        <div className="form-group">
          <label>Họ và Tên</label>
          <input className="form-control" name="name" value={cvData.personalInfo.name} onChange={handlePersonalInfoChange} />
        </div>
        <div className="form-group">
          <label>Vị trí ứng tuyển (Title)</label>
          <input className="form-control" name="title" value={cvData.personalInfo.title} onChange={handlePersonalInfoChange} />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Ngày sinh</label>
            <input className="form-control" name="dob" value={cvData.personalInfo.dob} onChange={handlePersonalInfoChange} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Số điện thoại</label>
            <input className="form-control" name="phone" value={cvData.personalInfo.phone} onChange={handlePersonalInfoChange} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Email</label>
            <input className="form-control" name="email" value={cvData.personalInfo.email} onChange={handlePersonalInfoChange} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>LinkedIn</label>
            <input className="form-control" name="linkedin" value={cvData.personalInfo.linkedin || ''} onChange={handlePersonalInfoChange} />
          </div>
        </div>

        <div className="form-group">
          <label>Địa chỉ</label>
          <input className="form-control" name="address" value={cvData.personalInfo.address} onChange={handlePersonalInfoChange} />
        </div>
        <div className="form-group">
          <label>Mục tiêu nghề nghiệp</label>
          <textarea className="form-control" name="summary" value={cvData.personalInfo.summary} onChange={handlePersonalInfoChange} />
        </div>
      </div>

      {/* Experience */}
      <div className="form-section" style={{ marginBottom: '1.5rem' }}>
        <h2 className="form-section-title">Kinh nghiệm làm việc</h2>
        {(cvData.experience || []).map((exp) => (
          <div className="item-card" key={exp.id}>
            <div className="item-actions">
              <button className="btn btn-icon btn-danger" onClick={() => removeItem('experience', exp.id)}>
                <Trash2 size={16} />
              </button>
            </div>
            <div className="form-group">
              <label>Công ty</label>
              <input className="form-control" value={exp.company} onChange={(e) => handleArrayItemChange('experience', exp.id, 'company', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Vị trí</label>
              <input className="form-control" value={exp.position} onChange={(e) => handleArrayItemChange('experience', exp.id, 'position', e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Bắt đầu</label>
                <input className="form-control" value={exp.startDate} onChange={(e) => handleArrayItemChange('experience', exp.id, 'startDate', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Kết thúc</label>
                <input className="form-control" value={exp.endDate} onChange={(e) => handleArrayItemChange('experience', exp.id, 'endDate', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Mô tả chi tiết</label>
              <textarea className="form-control" value={exp.description} onChange={(e) => handleArrayItemChange('experience', exp.id, 'description', e.target.value)} />
            </div>
          </div>
        ))}
        <button className="btn btn-secondary" onClick={() => addItem('experience', { company: '', position: '', startDate: '', endDate: '', description: '' })}>
          <Plus size={18} /> Thêm Kinh nghiệm
        </button>
      </div>

      {/* Education */}
      <div className="form-section" style={{ marginBottom: '1.5rem' }}>
        <h2 className="form-section-title">Học vấn</h2>
        {(cvData.education || []).map((edu) => (
          <div className="item-card" key={edu.id}>
            <div className="item-actions">
              <button className="btn btn-icon btn-danger" onClick={() => removeItem('education', edu.id)}>
                <Trash2 size={16} />
              </button>
            </div>
            <div className="form-group">
              <label>Trường</label>
              <input className="form-control" value={edu.school} onChange={(e) => handleArrayItemChange('education', edu.id, 'school', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Chuyên ngành / Bằng cấp</label>
              <input className="form-control" value={edu.degree} onChange={(e) => handleArrayItemChange('education', edu.id, 'degree', e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Bắt đầu</label>
                <input className="form-control" value={edu.startDate} onChange={(e) => handleArrayItemChange('education', edu.id, 'startDate', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Kết thúc</label>
                <input className="form-control" value={edu.endDate} onChange={(e) => handleArrayItemChange('education', edu.id, 'endDate', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Mô tả (GPA, thành tích...)</label>
              <textarea className="form-control" value={edu.description} onChange={(e) => handleArrayItemChange('education', edu.id, 'description', e.target.value)} />
            </div>
          </div>
        ))}
        <button className="btn btn-secondary" onClick={() => addItem('education', { school: '', degree: '', startDate: '', endDate: '', description: '' })}>
          <Plus size={18} /> Thêm Học vấn
        </button>
      </div>

      {/* Projects */}
      <div className="form-section" style={{ marginBottom: '1.5rem' }}>
        <h2 className="form-section-title">Dự án</h2>
        {(cvData.projects || []).map((proj) => (
          <div className="item-card" key={proj.id}>
            <div className="item-actions">
              <button className="btn btn-icon btn-danger" onClick={() => removeItem('projects', proj.id)}>
                <Trash2 size={16} />
              </button>
            </div>
            <div className="form-group">
              <label>Tên dự án</label>
              <input className="form-control" value={proj.name} onChange={(e) => handleArrayItemChange('projects', proj.id, 'name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Vai trò</label>
              <input className="form-control" value={proj.role} onChange={(e) => handleArrayItemChange('projects', proj.id, 'role', e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Bắt đầu</label>
                <input className="form-control" value={proj.startDate} onChange={(e) => handleArrayItemChange('projects', proj.id, 'startDate', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Kết thúc</label>
                <input className="form-control" value={proj.endDate} onChange={(e) => handleArrayItemChange('projects', proj.id, 'endDate', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <textarea className="form-control" value={proj.description} onChange={(e) => handleArrayItemChange('projects', proj.id, 'description', e.target.value)} />
            </div>
          </div>
        ))}
        <button className="btn btn-secondary" onClick={() => addItem('projects', { name: '', role: '', startDate: '', endDate: '', description: '' })}>
          <Plus size={18} /> Thêm Dự án
        </button>
      </div>

      {/* Skills */}
      <div className="form-section" style={{ marginBottom: '1.5rem' }}>
        <h2 className="form-section-title">Kỹ năng</h2>
        {(cvData.skills || []).map((skill) => (
          <div className="item-card" key={skill.id}>
            <div className="item-actions">
              <button className="btn btn-icon btn-danger" onClick={() => removeItem('skills', skill.id)}>
                <Trash2 size={16} />
              </button>
            </div>
            <div className="form-group">
              <label>Nhóm kỹ năng (VD: Thiết kế đồ họa)</label>
              <input className="form-control" value={skill.name} onChange={(e) => handleArrayItemChange('skills', skill.id, 'name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Chi tiết (VD: Photoshop, Canva)</label>
              <input className="form-control" value={skill.details || ''} onChange={(e) => handleArrayItemChange('skills', skill.id, 'details', e.target.value)} />
            </div>
          </div>
        ))}
        <button className="btn btn-secondary" onClick={() => addItem('skills', { name: '', details: '' })}>
          <Plus size={18} /> Thêm Kỹ năng
        </button>
      </div>

      {/* Hobbies */}
      <div className="form-section">
        <h2 className="form-section-title">Sở thích</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {(cvData.hobbies || []).map((hobby) => (
            <div key={hobby.id} style={{ display: 'flex', alignItems: 'center', background: '#e5e7eb', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.9rem' }}>
              <span style={{ marginRight: '0.5rem' }}>{hobby.name}</span>
              <Trash2 size={14} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => removeItem('hobbies', hobby.id)} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            className="form-control" 
            placeholder="Thêm sở thích..." 
            id="newHobbyInput"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                addItem('hobbies', { name: e.target.value.trim() });
                e.target.value = '';
              }
            }}
          />
          <button 
            className="btn btn-primary"
            onClick={() => {
              const input = document.getElementById('newHobbyInput');
              if (input.value.trim()) {
                addItem('hobbies', { name: input.value.trim() });
                input.value = '';
              }
            }}
          >
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CVForm;
