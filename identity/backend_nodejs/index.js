const express = require('express');
const { verify: verifyJwt } = require('jsonwebtoken');

const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');

/* Em produção, essas constantes devem ser armazenadas como variáveis de ambiente */
// A porta em que a API vai estar escutando
const apiPort = 8081;

// O ID da política que será usada para verificar a identidade do usuário
// Docs: https://docs.combateafraude.com/docs/identity/home/#cria%C3%A7%C3%A3o-de-pol%C3%ADticas-de-acesso
const identityPolicyId = '';

// O token enviado para que os clientes possam usar o Identity SDK
// Docs: https://docs.combateafraude.com/docs/identity/home/#como-ter-acesso-ao-token-de-integra%C3%A7%C3%A3o
const identityToken = '';

// O token enviado para que os clientes possam usar o SDK de prova de vida passiva
// Docs: https://docs.combateafraude.com/docs/mobile/introduction/mobile-token/
const mobileToken = '';

// O segredo usado para verificar as attestations vindas do Identity SDK
// IMPORTANTE: Esse segredo *nunca* deve sair do seu backend
// Docs: https://docs.combateafraude.com/docs/identity/checking-responses/#como-obter-seu-clientsecret
const identitySecret = '';

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(logger('dev'));

app.get('/', (req, res) => {
    res.send('Identity DEMO Backend');
});

// Rota usada para verificar as credenciais do usuário (CPF e senha)
app.post('/credentials', (req, res) => {
    const { cpf, password } = req.body;

    if (!cpf || !password) {
        return res.status(400).send('The parameters "cpf" and "password" are required');
    }

    // Verificar se o par <cpf, senha> é válido
    if (password !== "password") {
        return res.status(401).send('Invalid credentials');
    }

    // Se as credenciais estão corretas, enviar os tokens para que o usuário
    // possa se autenticar usando o Identity SDK. É importante que você faça isso
    // *antes* de liberar ao usuário qualquer acesso ao seu sistema. 
    res.send({
        identityPolicyId,
        identityToken,
        mobileToken,
    });
});

// Rota usada para verificar a attestation retornada pelo Identity SDK
// Docs: https://docs.combateafraude.com/docs/identity/checking-responses
app.post('/login', (req, res) => {
    const { cpf, password, attestation } = req.body;

    if (!cpf || !password || !attestation) {
        return res.status(400).send('The parameters "cpf", "password" and "attestation" are required');
    }

    // Verificar se o par <cpf, senha> é válido
    if (password !== "password") {
        return res.status(401).send('Invalid credentials');
    }

    let payload;

    try {
        // Verificar se o attestation foi assinado usando seu secret
        payload = verifyJwt(attestation, identitySecret);
    }
    catch (error) {
        return res.status(401).send('Invalid attestation');
    }

    const { peopleId, policyId, isAuthorized } = payload;

    // Verificar se o usuário foi autorizado e o CPF e a política usados na
    // autenticação via SDK do Identity são os esperados
    if (!isAuthorized || peopleId !== cpf || policyId !== identityPolicyId) {
        return res.status(401).send('Invalid attestation');
    }

    // O usuário foi autenticado via Identity SDK, liberar acesso ao sistema
    return res.send('Valid attestation. User is authenticated');
});

app.listen(apiPort, () => {
    console.log(`Identity DEMO Backend running at http://localhost:${apiPort}`)
})