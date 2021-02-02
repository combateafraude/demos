import './App.css';
import axios from 'axios';
import IdentitySdk from '@combateafraude/identity-sdk'

axios.defaults.baseURL = 'http://localhost:8081';

function App() {
  const signIn = async () => {
    const cpf = document.getElementById('cpf');
    const password = document.getElementById('password');

    const { identityPolicyId, identityToken, mobileToken } = await axios.post('/credentials', { cpf: cpf.value, password: password.value });

    const identityOptions = { mobileToken: mobileToken, throwOnRecall: true };
    const identity = new IdentitySdk(identityToken, identityOptions);
    const response = await identity.verifyPolicy(cpf, identityPolicyId);

    if (identity.isSdkError(response)) {
      // Erro ao executar o SDK
    }
    else {
      const { isAuthorized, attestation } = response;

      if (isAuthorized) {
        // Usuário está autorizado
        // Enviar a attestation para seu backend e validá-la lá
        await axios.post('/login', { cpf: cpf.value, password: password.value, attestation: attestation });
      }
      else {
        // Usuário não está autorizado
      }
    }

  }
  return (
    <div className="container">
      <div className="content">
        CPF:
        <input id="cpf" className="input-login"></input>
        Senha:
        <input id="password" className="input-login" type="password"></input>
        <button onClick={signIn}>Entrar</button>
      </div>

    </div>
  );
}

export default App;
