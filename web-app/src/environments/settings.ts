export class Keycloak {
  issuer = '';
  realm = '';
  clientId = '';
  urlLogout!: '';
}

export class Settings {
  production = false;
  keycloak: Keycloak | undefined;
  urlmarqueblanche = "";
  apiUrl = "" ;
  opendataToolUrl = "";
}