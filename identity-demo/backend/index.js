const express = require('express');
const { verify: verifyJwt } = require('jsonwebtoken');

const app = express();

/* On production, these consts should be stored as environment variables */
// The network port where the API will be listening
const apiPort = 8081;

// The ID of the policy used in order to verify the user's identity
// Docs: https://docs.combateafraude.com/docs/identity/home/#cria%C3%A7%C3%A3o-de-pol%C3%ADticas-de-acesso
const identityPolicyId = '';

// The token you will send so your clients can use Identity SDK
// Docs: https://docs.combateafraude.com/docs/identity/home/#como-ter-acesso-ao-token-de-integra%C3%A7%C3%A3o
const identityToken = '';

// The token you will send so your clients can use CAF's Faceliveness SDK
// Docs: https://docs.combateafraude.com/docs/mobile/introduction/mobile-token/
const mobileToken = '';

// The secret you will use to verify your client's attestations.
// IMPORTANT: This secret should *never* leave your backend
// Docs: https://docs.combateafraude.com/docs/identity/checking-responses/#como-obter-seu-clientsecret
const identitySecret = '';

app.get('/', (req, res) => {
    res.send('Identity DEMO Backend');
});

// Route used to validate user credentials (cpf and password)
app.post('/credentials', (req, res) => {
    const { cpf, password } = req.body;

    if (!cpf || !password) {
        return res.status(400).send('The parameters "cpf" and "password" are required');
    }

    // You should verify that the pair <cpf, password> is valid
    if (password !== "password") {
        return res.status(401).send('Invalid credentials');
    }

    // If the credentials are correct, send the tokens so the user can authenticate
    // via Identity SDK *before* granting him access to the system. 
    res.send({
        identityPolicyId,
        identityToken,
        mobileToken,
    });
});

// Route used to validate Identity SDK attestation
// Docs: https://docs.combateafraude.com/docs/identity/checking-responses
app.post('/login', (req, res) => {
    const { cpf, password, attestation } = req.body;

    if (!cpf || !password || !attestation) {
        return res.status(400).send('The parameters "cpf", "password" and "attestation" are required');
    }

    // You should verify that the pair <cpf, password> is valid
    if (password !== "password") {
        return res.status(401).send('Invalid credentials');
    }

    let payload;

    try {
        payload = verifyJwt(attestation, identitySecret);
    }
    catch (error) {
        return res.status(401).send('Invalid attestation');
    }

    const { peopleId, policyId, isAuthorized } = payload;

    if (!isAuthorized || peopleId !== cpf || policyId !== identityPolicyId) {
        return res.status(401).send('Invalid attestation');
    }

    // The user is authenticated via Identity SDK, you can log him in
    return res.send('Valid attestation. User is authenticated');
});

app.listen(apiPort, () => {
    console.log(`Identity DEMO Backend running at http://localhost:${apiPort}`)
})