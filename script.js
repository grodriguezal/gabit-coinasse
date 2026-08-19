const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('#mobile-menu');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  mobileMenu.hidden = open;
});
mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mobileMenu.hidden = true;
  menuButton?.setAttribute('aria-expanded', 'false');
}));
