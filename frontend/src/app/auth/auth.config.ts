import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  issuer: 'http://localhost:8080/realms/productcatalog',
  redirectUri: window.location.origin + '/',
  postLogoutRedirectUri: window.location.origin + '/',
  clientId: 'productcatalog-spa',
  responseType: 'code',
  scope: 'openid profile email',
  requireHttps: false
};