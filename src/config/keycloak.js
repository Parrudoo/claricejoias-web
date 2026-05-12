import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://auth.claricejoiasoficial.com.br',
  // url: 'http://localhost:8083',
  realm: 'claricejoias',
  clientId: 'claricejoias-web'
});


export default keycloak;