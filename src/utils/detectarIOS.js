export function esIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function estaInstaladaIOS() {
  return window.navigator.standalone === true;
}
