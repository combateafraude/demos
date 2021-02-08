const pathToApi = 'http://localhost:8081';

function setAuthenticatedStatus(status) {
    const labelContainer = document.getElementById('status-container');

    if (status) {
        labelContainer.classList = "div-label";
        labelContainer.children[0].innerHTML = "Autorizado";
    }
    else {
        labelContainer.classList = "no-div-label";
        labelContainer.children[0].innerHTML = "Não Autorizado";
    }
}

async function signIn() {
    const cpf = document.getElementById('cpf');
    const password = document.getElementById('password');

    const credentials = await fetch(`${pathToApi}/credentials`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            cpf: cpf.value,
            password: password.value
        })
    });

    if(credentials.status !== 200) {
        setAuthenticatedStatus(false);
        return;
    }

    const { identityPolicyId, identityToken, mobileToken } = await credentials.json();
    const identityOptions = { mobileToken: mobileToken, throwOnRecall: false };

    const identity = new this['@combateafraude/identity-sdk'].Sdk(identityToken, identityOptions);
    const response = await identity.verifyPolicy(cpf.value, identityPolicyId);

    if (identity.isSdkError(response)) {
        // Erro ao executar o SDK
    }
    else {
        const { isAuthorized, attestation } = response;

        if (isAuthorized) {
            // Usuário está autorizado
            // Enviar a attestation para seu backend e validá-la lá
            await fetch(`${pathToApi}/login`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    cpf: cpf.value, 
                    password: password.value, 
                    attestation: attestation,
                })
            });
            
            setAuthenticatedStatus(fetch.status === 200);
        }
        else {
            setAuthenticatedStatus(false);
        }
    }
}

window.onload = function () {
    setAuthenticatedStatus(false);

    const cpf = document.getElementById('cpf');
    const password = document.getElementById('password');

    cpf.value = '03893271074';
    password.value = 'password';
};