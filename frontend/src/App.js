import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function App() {
  const [message, setMessage] = useState('');
  const [professionals, setProfessionals] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', profession: '', company: '' });
  const [biometricCaptured, setBiometricCaptured] = useState(false);
  const [credentialId, setCredentialId] = useState(null);
  const [registrationCode, setRegistrationCode] = useState(null);

  useEffect(() => { loadProfessionals(); }, []);

  const showMessage = (msg, type = 'info') => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(''), 5000);
  };

  const loadProfessionals = async () => {
    try {
      const response = await axios.get(`${API}/professionals`);
      setProfessionals(response.data);
    } catch (error) { console.error('Erro:', error); }
  };

  const captureBiometric = async () => {
    try {
      if (!formData.name || !formData.email || !formData.profession || !formData.company) {
        showMessage('❌ Preencha todos os campos!', 'error'); return;
      }
      if (!window.PublicKeyCredential) {
        showMessage('❌ Navegador não suporta biometria', 'error'); return;
      }
      showMessage('👆 COLOQUE SEU DEDO NO LEITOR AGORA!', 'info');
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge, rp: { name: 'Lista Presença', id: window.location.hostname },
          user: { id: window.crypto.getRandomValues(new Uint8Array(16)), name: formData.email, displayName: formData.name },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
          authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
          timeout: 60000
        }
      });
      setCredentialId(arrayBufferToBase64(credential.rawId));
      setBiometricCaptured(true);
      showMessage('✅ Digital capturada!', 'success');
    } catch (error) {
      if (error.name === 'NotAllowedError') showMessage('❌ Cancelado ou sem biometria', 'error');
      else showMessage(`❌ ${error.message}`, 'error');
    }
  };

  const finalizeCadastro = async () => {
    try {
      if (!credentialId) { showMessage('❌ Capture a digital!', 'error'); return; }
      const response = await axios.post(`${API}/professionals`, { code: credentialId, ...formData });
      setRegistrationCode(response.data.registration_code);
      showMessage(`✅ Cadastrado! Código: ${response.data.registration_code}`, 'success');
      setFormData({ name: '', email: '', profession: '', company: '' });
      setBiometricCaptured(false); setCredentialId(null);
      loadProfessionals();
    } catch (error) {
      showMessage(`❌ ${error.response?.data?.detail || 'Erro'}`, 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '28px' }}>📋 Sistema Biométrico</h1>
        {message && (
          <div style={{ padding: '15px', borderRadius: '8px', marginBottom: '20px', background: message.type === 'success' ? '#d4edda' : message.type === 'error' ? '#f8d7da' : '#d1ecf1', color: message.type === 'success' ? '#155724' : message.type === 'error' ? '#721c24' : '#0c5460', fontWeight: '600', textAlign: 'center' }}>
            {message.text}
          </div>
        )}
        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', margin: '20px 0', borderLeft: '4px solid #ffc107' }}>
          <p style={{ margin: 0, color: '#856404', fontSize: '14px' }}><strong>⚠️ USE CELULAR COM LEITOR BIOMÉTRICO!</strong><br/>Chrome ou Safari. A digital será solicitada após preencher os dados.</p>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Nome Completo *" style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', marginBottom: '10px' }} />
          <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Email *" style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', marginBottom: '10px' }} />
          <input type="text" value={formData.profession} onChange={(e) => setFormData({...formData, profession: e.target.value})} placeholder="Função *" style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', marginBottom: '10px' }} />
          <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="Empresa *" style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', marginBottom: '10px' }} />
        </div>
        {!biometricCaptured ? (
          <button onClick={captureBiometric} style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '20px', fontWeight: '700', cursor: 'pointer' }}>🔐 CADASTRAR DIGITAL</button>
        ) : (
          <div style={{ background: '#d4edda', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ color: '#155724', fontWeight: '600', marginBottom: '15px', fontSize: '18px' }}>✅ Digital capturada com sucesso!</p>
            <button onClick={finalizeCadastro} style={{ padding: '15px 30px', background: '#28a745', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: '600', cursor: 'pointer' }}>✅ FINALIZAR CADASTRO</button>
          </div>
        )}
        {registrationCode && (
          <div style={{ marginTop: '20px', background: '#f0f0f0', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: '#667eea' }}>🎉 Cadastro Concluído!</h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '15px 0', fontFamily: 'monospace', color: '#667eea' }}>{registrationCode}</p>
            <p style={{ fontSize: '14px', color: '#666' }}>Guarde este código!</p>
          </div>
        )}
        <div style={{ marginTop: '40px' }}>
          <h3>Cadastrados: {professionals.length}</h3>
          {professionals.slice(0,5).map(p => (
            <div key={p.id} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', margin: '10px 0', borderLeft: '4px solid #667eea' }}>
              <h4 style={{ margin: 0 }}>{p.name}</h4>
              <p style={{ margin: '3px 0', fontSize: '13px', color: '#666' }}>{p.email} | {p.profession} | {p.company}</p>
              {p.registration_code && <p style={{ margin: '3px 0', fontSize: '12px', fontFamily: 'monospace', color: '#999' }}>Código: {p.registration_code}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
