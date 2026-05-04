import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://auth.claricejoiasoficial.com.br',
  realm: 'claricejoias',
  clientId: 'claricejoias-web'
});


export default keycloak;