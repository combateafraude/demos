import React, { useState } from 'react'
import './App.css';
import axios from 'axios';
import IdentitySdk from '@combateafraude/identity-sdk'
import logoCaf from './assets/logo_full.png'

axios.defaults.baseURL = 'http://localhost:8081';

function App() {
  const [isAuth, setIsAuth] = useState(false)
  const signIn = async () => {
    const cpf = document.getElementById('cpf');
    const password = document.getElementById('password');

    const credentials = await axios.post('/credentials', { cpf: cpf.value, password: password.value });
    const { identityPolicyId, identityToken, mobileToken } = credentials.data;
    const identityOptions = { mobileToken: mobileToken, throwOnRecall: false };
    const identity = new IdentitySdk(identityToken, identityOptions);
    const response = await identity.verifyPolicy(cpf.value, identityPolicyId);

    if (identity.isSdkError(response)) {
      // Erro ao executar o SDK
    }
    else {
      const { isAuthorized, attestation } = response;

      if (isAuthorized) {
        // Usuário está autorizado
        // Enviar a attestation para seu backend e validá-la lá
        await axios.post('/login', { cpf: cpf.value, password: password.value, attestation: attestation });
        setIsAuth(true)
      }
      else {
        // Usuário não está autorizado
      }
    }

  }
  return (
    <div className="container">
      <div className="box-content">
        <img src={logoCaf} alt="" className="logo-caf" />
        <p className="title">Identity Demo</p>
        <p className="subtitle">Insira o CPF de uma identidade existente para testar a autenticação.</p>
        <div className="content">
          <b>CPF:</b>
          <input id="cpf" className="input-login"></input>
          <b>Senha:</b>
          <input id="password" className="input-login" type="password"></input>
          <span className="subtitle-password">* Senha padrão pra autenticação: password</span>
          <button onClick={signIn} className="button-login">Entrar</button>
          {isAuth ? <div className="div-label">
            <span className="auth-label">Autorizado</span>
          </div> : <div className="no-div-label">
              <span className="no-auth-label">Não autorizado</span>
            </div>}
        </div>
      </div>

    </div>
  );
}

export default App;