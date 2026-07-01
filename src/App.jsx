import { useState, useEffect } from 'react';
import CVForm from './components/CVForm';
import CVPreview from './components/CVPreview';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Sparkles, Download, Settings, X } from 'lucide-react';

function App() {
  const [theme, setTheme] = useState('topcv-style');
  const [language, setLanguage] = useState('vi'); 
  const [isTranslating, setIsTranslating] = useState(false);
  
  // AI Settings State
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [aiProvider, setAiProvider] = useState('gemini'); // 'gemini' or 'openai'
  const [geminiKey, setGeminiKey] = useState('');
  const [openAiKey, setOpenAiKey] = useState('');

  // Load keys from localStorage on mount
  useEffect(() => {
    const savedProvider = localStorage.getItem('ai_provider') || 'gemini';
    const savedGemini = localStorage.getItem('gemini_api_key') || '';
    const savedOpenAi = localStorage.getItem('openai_api_key') || '';
    
    setAiProvider(savedProvider);
    setGeminiKey(savedGemini);
    setOpenAiKey(savedOpenAi);
  }, []);

  const saveAiSettings = () => {
    localStorage.setItem('ai_provider', aiProvider);
    localStorage.setItem('gemini_api_key', geminiKey);
    localStorage.setItem('openai_api_key', openAiKey);
    setIsAiSettingsOpen(false);
    alert('Đã lưu cấu hình AI!');
  };

  const [cvData, setCvData] = useState({
    personalInfo: {
      avatar: '',
      name: 'QUAN MINH NGUYEN',
      title: 'TECHNICAL DEVELOPER',
      phone: '0866 117 420',
      dob: '07-11-1999',
      email: 'minhquanpro65@gmail.com',
      linkedin: 'linkedin.com/in/quan-nguyen',
      address: 'Số nhà 157, phố Dương Văn Bé, Hà Nội',
      summary: 'Là một Technical Designer với nền tảng Kỹ sư Khoa học Máy tính và 3 năm kinh nghiệm thiết kế UI/UX đồ họa. Tôi có đam mê mãnh liệt trong việc ứng dụng Trí tuệ Nhân tạo (Gen-AI) để cách mạng hóa trải nghiệm tương tác của người chơi...',
    },
    experience: [
      {
        id: '1',
        company: 'Công ty thời trang Royal Fashion',
        position: 'Graphic Designer',
        startDate: '2022',
        endDate: '2025',
        description: '• Thiết kế giao diện, hình ảnh sản phẩm và nội dung marketing giúp tăng doanh số trung bình 20% mỗi năm.\n• Xây dựng visual identity, UI và layout cho website, landing page.\n• Ứng dụng AI, prompt engineering để tăng tốc độ sản xuất nội dung.',
      }
    ],
    education: [
      {
        id: '1',
        school: 'Vistula University (Poland)',
        degree: 'Computer Science/ Computer Games Engineering',
        startDate: '2019',
        endDate: '2022',
        description: "Engineer's Degree in Computer Science\nGPA: 4.0/5.0",
      }
    ],
    projects: [
      {
        id: '1',
        name: 'Traffic Cross (Unity)',
        role: 'Fullstack Game Developer',
        startDate: '2026',
        endDate: '2026',
        description: 'Một game casual điều khiển nhân vật băng qua các làn giao thông, ghi điểm mỗi khi vượt qua một checkpoint.',
      },
      {
        id: '2',
        name: 'OpenUp – AI-Powered RPG EQ Simulator',
        role: 'Lead Backend Developer',
        startDate: '2026',
        endDate: '2026',
        description: 'Một trình giả lập Trí tuệ Cảm xúc (EQ Simulator) dưới dạng game nhập vai (RPG).',
      }
    ],
    skills: [
      { id: '1', name: 'Game Development', details: 'Unity (C#), Unreal Engine 5' },
      { id: '2', name: 'Thiết kế đồ họa', details: 'Photoshop, Capture One, Canva' },
      { id: '3', name: 'AI & Generative Tech', details: 'Prompt Engineering, LLM Integration' },
      { id: '4', name: 'Backend & Architecture', details: 'Python, System Design, RESTful API' }
    ],
    hobbies: [
      { id: '1', name: 'Chơi và khám phá trong game' },
      { id: '2', name: 'Thể thao' },
      { id: '3', name: 'Du lịch' }
    ]
  });

  const handlePrint = () => window.print();
  const handleImport = (importedData) => setCvData(importedData);

  const translateWithGemini = async (promptText) => {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(promptText);
    return result.response.text();
  };

  const translateWithOpenAI = async (promptText) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: promptText }],
        temperature: 0.3
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
  };

  const handleAITranslate = async () => {
    if (aiProvider === 'gemini' && !geminiKey) {
      setIsAiSettingsOpen(true);
      return;
    }
    if (aiProvider === 'openai' && !openAiKey) {
      setIsAiSettingsOpen(true);
      return;
    }

    setIsTranslating(true);
    try {
      const dataToTranslate = JSON.parse(JSON.stringify(cvData));
      const savedAvatar = dataToTranslate.personalInfo.avatar;
      if (savedAvatar) dataToTranslate.personalInfo.avatar = "[AVATAR_PLACEHOLDER]";

      const prompt = `You are an expert international HR professional and translator. 
      I will provide you with a JSON object representing a Vietnamese Curriculum Vitae.
      Please translate all Vietnamese text values into highly professional English suitable for a global tech company.
      Use strong action verbs and industry-standard terminology. 
      DO NOT change the structure or keys of the JSON. 
      DO NOT translate the "avatar" field. 
      Return ONLY the raw JSON string, without any markdown formatting like \`\`\`json.
      
      JSON Data:
      ${JSON.stringify(dataToTranslate, null, 2)}`;

      let textResult = '';
      if (aiProvider === 'gemini') {
        textResult = await translateWithGemini(prompt);
      } else {
        textResult = await translateWithOpenAI(prompt);
      }

      const cleanText = textResult.replace(/```json/gi, '').replace(/```/g, '').trim();
      const translatedData = JSON.parse(cleanText);
      
      if (savedAvatar) translatedData.personalInfo.avatar = savedAvatar;

      setCvData(translatedData);
      setLanguage('en');
      alert(`🎉 Dịch thuật hoàn tất bằng ${aiProvider === 'gemini' ? 'Google Gemini' : 'OpenAI'}!`);
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi dịch thuật: " + error.message + "\nVui lòng kiểm tra lại API Key trong phần Cài đặt (Settings).");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="app-container">
      {/* Loading Overlay */}
      {isTranslating && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.9)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <Sparkles size={48} color="#4F46E5" className="animate-spin" />
          <h2 style={{ marginTop: '20px', color: '#4F46E5' }}>AI đang viết lại CV của bạn...</h2>
          <p>Quá trình này có thể mất 5-10 giây, vui lòng đợi.</p>
        </div>
      )}

      {/* Settings Modal */}
      {isAiSettingsOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '500px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>⚙️ Cài đặt AI Translation</h2>
              <button className="btn btn-icon" onClick={() => setIsAiSettingsOpen(false)}><X size={20} /></button>
            </div>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Chọn Mô hình AI (Provider)</label>
              <select className="form-control" value={aiProvider} onChange={e => setAiProvider(e.target.value)}>
                <option value="gemini">Google Gemini (Miễn phí)</option>
                <option value="openai">OpenAI (ChatGPT)</option>
              </select>
            </div>

            {aiProvider === 'gemini' && (
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Google Gemini API Key</label>
                <input type="password" className="form-control" value={geminiKey} onChange={e => setGeminiKey(e.target.value)} placeholder="AIzaSy..." />
                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '5px' }}>Lấy mã miễn phí tại <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">aistudio.google.com</a></p>
              </div>
            )}

            {aiProvider === 'openai' && (
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>OpenAI API Key</label>
                <input type="password" className="form-control" value={openAiKey} onChange={e => setOpenAiKey(e.target.value)} placeholder="sk-..." />
                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '5px' }}>Lấy mã tại <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">platform.openai.com</a></p>
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={saveAiSettings}>
              Lưu cấu hình
            </button>
          </div>
        </div>
      )}

      <div className="editor-sidebar no-print">
        <div className="editor-header" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h1>📝 CV Builder</h1>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setIsAiSettingsOpen(true)} title="Cài đặt AI">
                <Settings size={18} />
              </button>
              <button className="btn" style={{ background: '#ec4899', color: 'white', border: 'none' }} onClick={handleAITranslate} disabled={isTranslating}>
                <Sparkles size={16} /> Dịch AI
              </button>
              <button className="btn btn-primary" onClick={handlePrint}>
                <Download size={16} /> Download
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', background: '#f3f4f6', padding: '0.75rem', borderRadius: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Giao diện (Theme)</label>
              <select 
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="topcv-style">TopCV Maroon (Đỏ đô)</option>
                <option value="minimalist-style">Minimalist Standard (Tối giản)</option>
                <option value="navy-style">Modern Navy (Xanh Navy)</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Chế độ xem Tiêu đề</label>
              <select 
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">Tiếng Anh</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="editor-content">
          <CVForm 
            cvData={cvData} 
            setCvData={setCvData} 
            onImport={handleImport}
          />
        </div>
      </div>
      
      <div className="preview-area">
        <CVPreview cvData={cvData} theme={theme} language={language} />
      </div>
    </div>
  );
}

export default App;
