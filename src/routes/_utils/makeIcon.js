export function makeIcon ({ maskable, ios, fg = '#fff', bg = 'royalblue' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${maskable ? '0 0 100 100' : '6 6 88 88'}">${
    maskable
      ? `<rect width="100" height="100" fill="${bg}"/>`
      : `<rect width="88" height="88" x="6" y="6" fill="${bg}"${
          ios ? '' : ' ry="22"'
        }/>`
  }<path fill="${fg}" d="M79.45 57.01H56.9V20.83c7.36 4.67 19.21 15.23 22.55 36.18zM36.72 33.9a85.57 85.65 0 01-15.11 23.41h15.11zm4.73 50.45H58.56A21.44 21.46 0 0080 62.89H50.36v-43.43a3.68 3.69 0 00-7.35 0v43.43H20a21.44 21.46 0 0021.44 21.46z"/></svg>`
}
