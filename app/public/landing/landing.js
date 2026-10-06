const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
const header = document.querySelector('.site-header');
function closeMenu() {
  mobileNav.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  header.dataset.menuOpen = 'false';
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  mobileNav.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  header.dataset.menuOpen = String(open);
});
document.addEventListener('click', (event) => {
  if (!header.contains(event.target) && !mobileNav.hidden) closeMenu();
});
// A desktop resize must not leave the mobile panel expanded or focus hidden.
matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
  if (event.matches) {
    const restoreFocus = mobileNav.contains(document.activeElement) || document.activeElement === menuButton;
    closeMenu();
    if (restoreFocus) header.querySelector('.wordmark').focus({ preventScroll: true });
  }
});
mobileNav.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !mobileNav.hidden) {
    closeMenu();
    menuButton.focus();
  }
});
const goals = {
  travel: { title: 'Feel at home somewhere new', language: 'French', card: 'Order a meal.\nEnjoy the conversation.', description: 'Ask for a recommendation and order a meal in French.', lesson: 'An evening at a French restaurant', phrase: '“Une table pour deux, s’il vous plaît.”', translation: 'A table for two, please.', label: 'Travel' },
  work: { title: 'Share your ideas at work', language: 'English', card: 'Join the meeting.\nShare your ideas.', description: 'Explain your thinking and ask follow-up questions in English.', lesson: 'Sharing your ideas in an English meeting', phrase: '“Could I share a different approach?”', translation: 'A way to introduce your idea in a meeting.', label: 'Work' },
  everyday: { title: 'Get to know someone', language: 'Spanish', card: 'Say hello.\nKeep talking.', description: 'Ask about someone’s interests and share your own in Spanish.', lesson: 'Getting to know someone in Spanish', phrase: '“¿Qué te gusta hacer los fines de semana?”', translation: 'What do you like to do on weekends?', label: 'Everyday life' },
};
function selectGoal(key) {
  const goal = goals[key];
  if (!goal) return;
  document.querySelectorAll('[data-goal]').forEach((item) => item.setAttribute('aria-pressed', String(item.dataset.goal === key)));
  const fields = { 'goal-title': 'title', 'goal-language': 'language', 'goal-card-title': 'card', 'goal-description': 'description', 'goal-lesson': 'lesson', 'goal-phrase': 'phrase', 'goal-translation': 'translation' };
  Object.entries(fields).forEach(([id, field]) => { document.getElementById(id).textContent = goal[field]; });
  document.getElementById('goal-status').textContent = `${goal.label} example selected: ${goal.lesson}.`;
}
document.querySelectorAll('[data-goal]').forEach((button) => {
  button.addEventListener('click', () => selectGoal(button.dataset.goal));
});
document.querySelectorAll('[data-prompt]').forEach((button) => {
  button.addEventListener('click', () => {
    selectGoal(button.dataset.prompt);
    const target = document.querySelector(`[data-goal="${button.dataset.prompt}"]`);
    target.focus({ preventScroll: true });
    document.querySelector('#how-it-works').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
});
