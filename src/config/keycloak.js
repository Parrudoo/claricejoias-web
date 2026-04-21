import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8083',
  realm: 'claricejoias',
  clientId: 'claricejoias-web'
});

export default keycloak;