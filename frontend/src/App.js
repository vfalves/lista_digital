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
  const [activeTab, setActiveTab] = useState('cadastro');
  const [message, setMessage] = useState('');
  const [professionals, setProfessionals] = useState([]);
  const [lists, setLists] = useState([]);
  const [activeList, setActiveList] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  
  const [formData, setFormData] = useState({ name: '', email: '', profession: '', company: '' });
  const [biometricCaptured, setBiometricCaptured] = useState(false);
  const [credentialId, setCredentialId] = useState(null);
  const [registrationCode, setRegistrationCode] = useState(null);

  useEffect(() => {
    loadProfessionals();
    loadLists();
  }, []);

  const showMessage = (msg, type = 'info') => {
    setMessage({ text: msg, type });
    console.log(`[${type.toUpperCase()}] ${msg}`);
    setTimeout(() => setMessage(''), 7000);
  };

  const loadProfessionals = async () => {
    try {
      const response = await axios.get(`${API}/professionals`);
      setProfessionals(response.data);
      console.log(`Carregados ${response.data.length} profissionais`);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    }
  };

  const loadLists = async () => {
    try {
      const response = await axios.get(`${API}/attendance-lists`);
      setLists(response.data);
      const active = response.data.find(l => l.status === 'active');
      setActiveList(active || null);
      if (active) {
        loadAttendanceRecords(active.id);
      }
      console.log(`Carregadas ${response.data.length} listas`);
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
    }
  };

  const loadAttendanceRecords = async (listId) => {
    try {
      const response = await axios.get(`${API}/attendance-records/list/${listId}`);
      setAttendanceRecords(response.data);
      console.log(`Carregados ${response.data.length} registros de presen\u00e7a`);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    }
  };

  const captureBiometric = async () => {
    console.log('===== INICIANDO CAPTURA DE BIOMETRIA =====');
    
    try {
      if (!formData.name || !formData.email || !formData.profession || !formData.company) {
        showMessage('\u274c Preencha todos os campos antes!', 'error');
        console.error('Campos n\u00e3o preenchidos');
        return;
      }
      console.log('\u2713 Campos validados');

      if (window.location.protocol !== 'https:') {
        showMessage('\u274c Sistema requer HTTPS para biometria', 'error');
        console.error('Protocolo n\u00e3o \u00e9 HTTPS');
        return;
      }
      console.log('\u2713 HTTPS confirmado');

      if (!window.PublicKeyCredential) {
        showMessage('\u274c Navegador n\u00e3o suporta biometria. Use Chrome ou Safari no celular.', 'error');
        console.error('PublicKeyCredential n\u00e3o dispon\u00edvel');
        alert('SEU NAVEGADOR N\u00c3O SUPORTA BIOMETRIA!\n\nUse:\n- Chrome (Android/iOS)\n- Safari (iOS)\n- Samsung Internet (Android)');
        return;
      }
      console.log('\u2713 PublicKeyCredential dispon\u00edvel');

      showMessage('\ud83d\udc46 COLOQUE SEU DEDO NO LEITOR BIOM\u00c9TRICO AGORA!', 'info');
      console.log('Solicitando credencial biom\u00e9trica...');
      
      alert('\ud83d\udc46 ATEN\u00c7\u00c3O!\n\nAGORA voc\u00ea ser\u00e1 solicitado a colocar o dedo no leitor biom\u00e9trico do celular.\n\nClique OK e coloque o dedo quando aparecer o sensor.');

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      console.log('Challenge gerado');

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: {
            name: 'Lista de Presen\u00e7a',
            id: window.location.hostname
          },
          user: {
            id: window.crypto.getRandomValues(new Uint8Array(16)),
            name: formData.email,
            displayName: formData.name
          },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required'
          },
          timeout: 60000
        }
      });

      console.log('\u2705 BIOMETRIA CAPTURADA COM SUCESSO!');
      console.log('Credential ID:', credential.id.substring(0, 30) + '...');

      const credId = arrayBufferToBase64(credential.rawId);
      setCredentialId(credId);
      setBiometricCaptured(true);
      showMessage('\u2705 Digital capturada com sucesso!', 'success');
      alert('\u2705 SUCESSO!\n\nSua digital foi capturada!\n\nAgora clique em FINALIZAR CADASTRO.');

    } catch (error) {
      console.error('===== ERRO NA CAPTURA =====');
      console.error('Nome do erro:', error.name);
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);

      let errorMsg = '';
      if (error.name === 'NotAllowedError') {
        errorMsg = '\u274c Opera\u00e7\u00e3o cancelada ou biometria n\u00e3o dispon\u00edvel.\n\nVerifique se:\n- Seu celular tem leitor de digital\n- Biometria est\u00e1 configurada\n- Voc\u00ea deu permiss\u00e3o ao navegador';
        showMessage('\u274c Cancelado ou sem biometria', 'error');
      } else if (error.name === 'InvalidStateError') {
        errorMsg = '\u274c Esta digital j\u00e1 est\u00e1 cadastrada no sistema!';
        showMessage('\u274c Digital j\u00e1 cadastrada', 'error');
      } else if (error.name === 'NotSupportedError') {
        errorMsg = '\u274c Algoritmo n\u00e3o suportado. Seu dispositivo pode n\u00e3o ter biometria compat\u00edvel.';
        showMessage('\u274c Dispositivo incompat\u00edvel', 'error');
      } else {
        errorMsg = `\u274c Erro: ${error.message}`;
        showMessage(`\u274c ${error.message}`, 'error');
      }
      alert(errorMsg);
    }
  };

  const finalizeCadastro = async () => {
    console.log('===== FINALIZANDO CADASTRO =====');
    
    try {
      if (!credentialId) {
        showMessage('\u274c Capture a digital primeiro!', 'error');
        console.error('Credential ID n\u00e3o dispon\u00edvel');
        return;
      }

      console.log('Enviando para API...');
      const response = await axios.post(`${API}/professionals`, {
        code: credentialId,
        name: formData.name,
        email: formData.email,
        profession: formData.profession,
        company: formData.company
      });

      console.log('\u2705 Cadastro salvo no banco!');
      console.log('C\u00f3digo de registro:', response.data.registration_code);

      setRegistrationCode(response.data.registration_code);
      showMessage(`\u2705 Cadastrado! C\u00f3digo: ${response.data.registration_code}`, 'success');
      
      alert(`\ud83c\udf89 CADASTRO CONCLU\u00cdDO!\n\nSeu c\u00f3digo de registro:\n${response.data.registration_code}\n\nGuarde este c\u00f3digo em local seguro!`);

      setFormData({ name: '', email: '', profession: '', company: '' });
      setBiometricCaptured(false);
      setCredentialId(null);
      loadProfessionals();

    } catch (error) {
      console.error('Erro ao finalizar cadastro:', error);
      const errorMsg = error.response?.data?.detail || 'Erro ao cadastrar';
      showMessage(`\u274c ${errorMsg}`, 'error');
      alert(`\u274c ERRO AO CADASTRAR:\n\n${errorMsg}`);
    }
  };

  const scanForAttendance = async () => {
    console.log('===== ESCANEANDO DIGITAL PARA PRESEN\u00c7A =====');
    
    try {
      if (!activeList) {
        showMessage('\u274c Nenhuma lista ativa', 'error');
        console.error('Lista ativa n\u00e3o encontrada');
        return;
      }

      if (!window.PublicKeyCredential) {
        showMessage('\u274c Navegador n\u00e3o suporta biometria', 'error');
        console.error('PublicKeyCredential n\u00e3o dispon\u00edvel');
        return;
      }

      showMessage('\ud83d\udc46 COLOQUE SEU DEDO NO LEITOR!', 'info');
      console.log('Solicitando autentica\u00e7\u00e3o biom\u00e9trica...');
      
      alert('\ud83d\udc46 REGISTRAR PRESEN\u00c7A\n\nColoque seu dedo no leitor quando solicitado.');

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          timeout: 60000,
          userVerification: 'required'
        }
      });

      console.log('\u2705 Digital reconhecida!');
      const credId = arrayBufferToBase64(assertion.rawId);
      console.log('Enviando para API...');

      const response = await axios.post(`${API}/attendance-records`, {
        list_id: activeList.id,
        code: credId
      });

      console.log('\u2705 Presen\u00e7a registrada!');
      showMessage(`\u2705 Presen\u00e7a registrada: ${response.data.professional_name}`, 'success');
      alert(`\u2705 PRESEN\u00c7A REGISTRADA!\n\n${response.data.professional_name}\n${response.data.professional_profession}`);
      loadAttendanceRecords(activeList.id);

    } catch (error) {
      console.error('Erro ao registrar presen\u00e7a:', error);
      
      if (error.name === 'NotAllowedError') {
        showMessage('\u274c Opera\u00e7\u00e3o cancelada', 'error');
      } else if (error.response) {
        const errorMsg = error.response.data.detail;
        showMessage(`\u274c ${errorMsg}`, 'error');
        alert(`\u274c ERRO:\n\n${errorMsg}`);
      } else {
        showMessage(`\u274c ${error.message}`, 'error');
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        
        <h1 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '28px', color: '#333' }}>\ud83d\udccb Sistema Biom\u00e9trico</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '14px' }}>Lista de Presen\u00e7a com Autentica\u00e7\u00e3o Digital</p>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #e0e0e0' }}>
          <button onClick={() => setActiveTab('cadastro')} style={{ flex: 1, padding: '12px', background: activeTab === 'cadastro' ? '#667eea' : 'transparent', color: activeTab === 'cadastro' ? 'white' : '#666', border: 'none', borderBottom: `3px solid ${activeTab === 'cadastro' ? '#667eea' : 'transparent'}`, cursor: 'pointer', fontSize: '16px', fontWeight: '600', borderRadius: '8px 8px 0 0' }}>Cadastro</button>
          <button onClick={() => setActiveTab('lista')} style={{ flex: 1, padding: '12px', background: activeTab === 'lista' ? '#667eea' : 'transparent', color: activeTab === 'lista' ? 'white' : '#666', border: 'none', borderBottom: `3px solid ${activeTab === 'lista' ? '#667eea' : 'transparent'}`, cursor: 'pointer', fontSize: '16px', fontWeight: '600', borderRadius: '8px 8px 0 0' }}>Lista Ativa</button>
        </div>

        {message && (
          <div style={{ padding: '15px', borderRadius: '8px', marginBottom: '20px', background: message.type === 'success' ? '#d4edda' : message.type === 'error' ? '#f8d7da' : '#d1ecf1', color: message.type === 'success' ? '#155724' : message.type === 'error' ? '#721c24' : '#0c5460', fontWeight: '600', textAlign: 'center', fontSize: '15px' }}>
            {message.text}
          </div>
        )}

        {activeTab === 'cadastro' && (
          <div>
            <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #ffc107' }}>
              <p style={{ margin: 0, color: '#856404', fontSize: '14px', lineHeight: '1.6' }}>
                <strong>\u26a0\ufe0f REQUISITOS:</strong><br/>
                \u2022 Use CELULAR com leitor de digital (Samsung S24 \u2705)<br/>
                \u2022 Navegador Chrome ou Safari<br/>
                \u2022 Biometria configurada no aparelho<br/>
                \u2022 A digital ser\u00e1 solicitada ap\u00f3s clicar no bot\u00e3o
              </p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Nome Completo *" style={{ width: '100%', padding: '14px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', marginBottom: '12px' }} />
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Email Corporativo *" style={{ width: '100%', padding: '14px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', marginBottom: '12px' }} />
              <input type="text" value={formData.profession} onChange={(e) => setFormData({...formData, profession: e.target.value})} placeholder="Fun\u00e7\u00e3o *" style={{ width: '100%', padding: '14px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', marginBottom: '12px' }} />
              <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="Empresa *" style={{ width: '100%', padding: '14px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', marginBottom: '12px' }} />
            </div>

            {!biometricCaptured ? (
              <button onClick={captureBiometric} style={{ width: '100%', padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '22px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}>\ud83d\udd10 CADASTRAR DIGITAL</button>
            ) : (
              <div style={{ background: '#d4edda', padding: '25px', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: '#155724', fontWeight: '700', marginBottom: '15px', fontSize: '20px' }}>\u2705 Digital Capturada!</p>
                <p style={{ color: '#155724', marginBottom: '20px' }}>Sua biometria foi vinculada com sucesso.</p>
                <button onClick={finalizeCadastro} style={{ padding: '18px 40px', background: '#28a745', color: 'white', border: 'none', borderRadius: '8px', fontSize: '20px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)' }}>\u2705 FINALIZAR CADASTRO</button>
              </div>
            )}

            {registrationCode && (
              <div style={{ marginTop: '25px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '25px', borderRadius: '12px', textAlign: 'center', border: '2px solid #667eea' }}>
                <h3 style={{ color: '#667eea', marginBottom: '10px' }}>\ud83c\udf89 Cadastro Conclu\u00eddo!</h3>
                <p style={{ fontSize: '14px', color: '#555', marginBottom: '15px' }}>Seu c\u00f3digo de registro \u00fanico:</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '15px 0', fontFamily: 'monospace', color: '#667eea', letterSpacing: '2px' }}>{registrationCode}</p>
                <p style={{ fontSize: '13px', color: '#666', marginTop: '10px' }}>\ud83d\udcdd Guarde este c\u00f3digo com seguran\u00e7a!</p>
              </div>
            )}

            <div style={{ marginTop: '40px', borderTop: '2px solid #e0e0e0', paddingTop: '30px' }}>
              <h3 style={{ marginBottom: '15px', color: '#333' }}>Profissionais Cadastrados: {professionals.length}</h3>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {professionals.slice(0, 10).map(p => (
                  <div key={p.id} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', margin: '10px 0', borderLeft: '4px solid #667eea' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{p.name}</h4>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>\u2709\ufe0f {p.email}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>\ud83d\udcbc {p.profession} | {p.company}</p>
                    {p.registration_code && (
                      <p style={{ margin: '6px 0 0 0', fontSize: '13px', fontFamily: 'monospace', color: '#999', background: '#fff', padding: '5px 8px', borderRadius: '4px', display: 'inline-block' }}>\ud83c\udfab {p.registration_code}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lista' && (
          <div>
            {activeList ? (
              <div>
                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #667eea' }}>
                  <h3 style={{ marginBottom: '10px', color: '#333' }}>{activeList.course_title}</h3>
                  <p style={{ margin: '5px 0', color: '#666' }}>\ud83c\udfdb\ufe0f <strong>Instala\u00e7\u00e3o:</strong> {activeList.installation_name}</p>
                  <p style={{ margin: '5px 0', color: '#666' }}>\ud83d\udcc5 <strong>Data:</strong> {new Date(activeList.meeting_date).toLocaleDateString('pt-BR')} \u00e0s {activeList.meeting_time}</p>
                  <p style={{ margin: '5px 0', color: '#666' }}>\ud83d\udc68\u200d\ud83c\udfeb <strong>Instrutor:</strong> {activeList.instructor_name}</p>
                </div>

                <button onClick={scanForAttendance} style={{ width: '100%', padding: '22px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '20px', fontWeight: '700', cursor: 'pointer', marginBottom: '25px', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}>\ud83d\udd10 REGISTRAR PRESEN\u00c7A (Escanear Digital)</button>

                <h3 style={{ marginBottom: '15px', color: '#333' }}>Participantes Registrados: {attendanceRecords.length}</h3>
                {attendanceRecords.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#667eea', color: 'white' }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>N\u00ba</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Nome</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Fun\u00e7\u00e3o</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Hora</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRecords.map(record => (
                          <tr key={record.id} style={{ borderBottom: '1px solid #ddd', background: record.row_number % 2 === 0 ? '#f8f9fa' : 'white' }}>
                            <td style={{ padding: '12px', fontSize: '14px' }}>{record.row_number}</td>
                            <td style={{ padding: '12px', fontSize: '14px' }}>{record.professional_name}</td>
                            <td style={{ padding: '12px', fontSize: '14px' }}>{record.professional_profession}</td>
                            <td style={{ padding: '12px', fontSize: '14px' }}>{new Date(record.entry_time).toLocaleTimeString('pt-BR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                    <p>Nenhum participante registrado ainda.</p>
                    <p style={{ fontSize: '14px', marginTop: '10px' }}>Use o bot\u00e3o acima para escanear digitais.</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                <h3 style={{ marginBottom: '10px' }}>Nenhuma lista ativa</h3>
                <p>Crie uma nova lista de presen\u00e7a para come\u00e7ar</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;