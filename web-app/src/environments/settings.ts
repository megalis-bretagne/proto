export class Api {
    url = '';
  }
  export class Keycloak {
    issuer = '';
    realm = '';
    clientId = '';
    urlLogout!: '';
  }

  export class Settings {
    production = false;
    api: Api | undefined;
    keycloak: Keycloak | undefined;
    urlmarqueblanche: string | undefined;
  }