const state = { token: localStorage.getItem('good-measure-token'), profile: null, foods: [], entries: [], totals: null, register: false };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const money = (value) => Math.round(Number(value || 0));

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(path, { ...options, headers });
  const text = await response.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { error: text }; }
  if (!response.ok) throw new Error(body.error || body.message || 'Something went wrong.');
  return body;
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2800);
}

function setAuthMode(register) {
  state.register = register;
  $('#register-fields').classList.toggle('hidden', !register);
  $('#auth-title').textContent = register ? 'Create your measure' : 'Sign in to your log';
  $('#auth-subtitle').textContent = register ? 'A few details help us set a useful daily target.' : 'Your meals, macros, and momentum in one quiet place.';
  $('#auth-submit').innerHTML = register ? 'Create account <span>→</span>' : 'Sign in <span>→</span>';
  $('#auth-toggle').textContent = register ? 'Already have an account? Sign in' : 'New here? Create an account';
  $('#auth-error').textContent = '';
}

function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function handleAuth(event) {
  event.preventDefault();
  const values = formValues(event.target);
  const payload = state.register ? { ...values, weight: Number(values.weight), height: Number(values.height), age: Number(values.age), workoutIntensity: Number(values.workoutIntensity) } : { email: values.email, password: values.password };
  $('#auth-submit').disabled = true;
  $('#auth-error').textContent = '';
  try {
    const result = await api(state.register ? '/user/register' : '/user/login', { method: 'POST', body: JSON.stringify(payload) });
    if (result.error) throw new Error(result.error);
    state.token = result.token;
    localStorage.setItem('good-measure-token', state.token);
    await startApp();
  } catch (error) {
    $('#auth-error').textContent = error.message;
  } finally { $('#auth-submit').disabled = false; }
}

function initials(name = 'A') { return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(); }
function formatDate() { return new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()); }
function setProfile(profile) {
  state.profile = profile;
  const letters = initials(profile.name);
  $('#sidebar-avatar').textContent = letters;
  $('#profile-avatar').textContent = letters;
  $('#sidebar-name').textContent = profile.name;
  $('#sidebar-email').textContent = profile.email;
  $('#profile-display-name').textContent = profile.name;
  $('#profile-display-email').textContent = profile.email;
  $('#profile-tdee').textContent = money(profile.tdee).toLocaleString();
  $('#profile-activity').textContent = Number(profile.workoutIntensity).toFixed(2);
  const form = $('#profile-form');
  form.name.value = profile.name;
  form.weight.value = profile.weight;
  form.height.value = profile.height;
  form.age.value = profile.age;
}

function renderTotals() {
  const totals = state.totals || {};
  const goal = Number(state.profile?.tdee || 0);
  const consumed = money(totals.calories);
  const left = Math.max(goal - consumed, 0);
  $('#calories-left').textContent = left.toLocaleString();
  $('#calories-consumed').textContent = `${consumed.toLocaleString()} consumed`;
  $('#calorie-goal').textContent = `of ${goal.toLocaleString()} goal`;
  $('#calorie-progress').style.width = `${goal ? Math.min((consumed / goal) * 100, 100) : 0}%`;
  const macros = [['protein', totals.protein], ['carb', totals.carb], ['fat', totals.fat], ['fiber', totals.fiber]];
  macros.forEach(([name, value]) => {
    $(`#${name === 'carb' ? 'carb' : name}-value`).textContent = `${money(value)}g`;
    $(`#${name === 'carb' ? 'carb' : name}-bar`).style.width = `${Math.min(money(value) / (name === 'fiber' ? 30 : 100) * 100, 100)}%`;
  });
  $('#macro-total').textContent = `${macros.reduce((sum, [, value]) => sum + money(value), 0)}g total`;
  $('#entry-count').textContent = `${state.entries.length} ${state.entries.length === 1 ? 'entry' : 'entries'}`;
}

function renderMeals() {
  const list = $('#meal-list');
  if (!state.entries.length) {
    list.innerHTML = '<div class="empty-state"><strong>Your log is waiting for its first entry.</strong><span>Use “Log a meal” to add something from your food library.</span></div>';
    return;
  }
  list.innerHTML = state.entries.map((entry) => `<article class="meal-item"><div class="meal-icon">✦</div><div class="meal-main"><strong>${escapeHtml(entry.name)}</strong><small>${entry.totalGrams || 0}g serving</small></div><div class="meal-macro"><b>CAL</b>${money(entry.calories)}</div><div class="meal-macro"><b>PRO</b>${money(entry.protein)}g</div><div class="meal-macro"><b>CARB</b>${money(entry.carb)}g</div><div class="meal-macro"><b>FAT</b>${money(entry.fat)}g</div><button class="delete-button" data-delete-entry="${entry.id}" title="Delete meal">×</button></article>`).join('');
  $$('[data-delete-entry]').forEach((button) => button.addEventListener('click', () => deleteEntry(button.dataset.deleteEntry)));
}

function renderFoods(filter = '') {
  const foods = state.foods.filter((food) => food.name.toLowerCase().includes(filter.toLowerCase()));
  $('#food-list').innerHTML = foods.length ? foods.map((food) => `<article class="food-card"><header><div><h3>${escapeHtml(food.name)}</h3><small>${money(food.grams)}g serving</small></div><button class="delete-button" data-delete-food="${food.id}" title="Delete food">×</button></header><div class="food-stats"><span><b>${money(food.protein)}g</b> pro</span><span><b>${money(food.carb)}g</b> carb</span><span><b>${money(food.fat)}g</b> fat</span></div><footer><strong>${money(food.calories)} <small>kcal</small></strong><span class="mono">${money(food.fiber)}g fiber</span></footer></article>`).join('') : '<div class="empty-state"><strong>No foods found.</strong><span>Add a saved food to make meal logging quick.</span></div>';
  $$('[data-delete-food]').forEach((button) => button.addEventListener('click', () => deleteFood(button.dataset.deleteFood)));
}

function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
async function refreshDashboard() {
  const [totals, entries, foods] = await Promise.all([api('/entry/totals'), api('/entry/breakdown'), api('/food/all')]);
  state.totals = totals.totals || {};
  state.entries = Array.isArray(entries) ? entries : [];
  state.foods = Array.isArray(foods) ? foods : [];
  renderTotals(); renderMeals(); renderFoods($('#food-search').value); populateMealFoods();
}
function populateMealFoods() { $('#meal-food-select').innerHTML = state.foods.length ? state.foods.map((food) => `<option value="${food.id}">${escapeHtml(food.name)} · ${money(food.grams)}g</option>`).join('') : '<option value="">Add a food first</option>'; }
async function deleteEntry(id) { try { await api(`/entry/${id}`, { method: 'DELETE' }); await refreshDashboard(); showToast('Meal removed from your day.'); } catch (error) { showToast(error.message); } }
async function deleteFood(id) { if (!window.confirm('Delete this food from your library?')) return; try { await api(`/food/${id}`, { method: 'DELETE' }); await refreshDashboard(); showToast('Food removed.'); } catch (error) { showToast(error.message); } }

function switchView(view) {
  $$('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.view === view));
  $$('.view-panel').forEach((panel) => panel.classList.toggle('hidden', panel.id !== `${view}-view`));
  $('#page-title').textContent = view === 'today' ? 'Your day, in balance.' : view === 'foods' ? 'Everything you eat, remembered.' : 'Make the numbers work for you.';
  $('#date-label').textContent = view === 'today' ? formatDate() : view === 'foods' ? 'Library' : 'Personal';
}

async function startApp() {
  $('#auth-view').classList.add('hidden'); $('#app-view').classList.remove('hidden'); $('#date-label').textContent = formatDate();
  try { setProfile(await api('/user/getprofile')); await refreshDashboard(); } catch (error) { localStorage.removeItem('good-measure-token'); state.token = null; $('#app-view').classList.add('hidden'); $('#auth-view').classList.remove('hidden'); showToast('Your session expired. Please sign in again.'); }
}

$('#auth-form').addEventListener('submit', handleAuth);
$('#auth-toggle').addEventListener('click', () => setAuthMode(!state.register));
$('#logout-button').addEventListener('click', () => { localStorage.removeItem('good-measure-token'); state.token = null; $('#app-view').classList.add('hidden'); $('#auth-view').classList.remove('hidden'); setAuthMode(false); });
$$('.nav-item').forEach((item) => item.addEventListener('click', () => switchView(item.dataset.view)));
$('#food-search').addEventListener('input', (event) => renderFoods(event.target.value));
['#add-food-button', '#add-food-button-secondary'].forEach((selector) => $(selector).addEventListener('click', () => $('#food-dialog').showModal()));
$('#log-meal-button').addEventListener('click', () => { populateMealFoods(); $('#meal-dialog').showModal(); });
$('#food-form').addEventListener('submit', async (event) => { event.preventDefault(); const values = formValues(event.target); try { await api('/food/create', { method: 'POST', body: JSON.stringify({ name: values.name, protein: Number(values.protein), carb: Number(values.carb), fat: Number(values.fat), fiber: Number(values.fiber), quantity: Number(values.quantity) }) }); event.target.reset(); $('#food-dialog').close(); await refreshDashboard(); showToast('Food saved to your library.'); } catch (error) { showToast(error.message); } });
$('#meal-form').addEventListener('submit', async (event) => { event.preventDefault(); const values = formValues(event.target); try { await api('/entry/create', { method: 'POST', body: JSON.stringify({ foodId: Number(values.foodId), quantity: Number(values.quantity) }) }); $('#meal-dialog').close(); await refreshDashboard(); showToast('Meal added to your day.'); } catch (error) { showToast(error.message); } });
$('#profile-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const values = formValues(event.target);
  try {
    const profile = await api('/user/update', {
      method: 'PATCH',
      body: JSON.stringify({
        name: values.name,
        weight: Number(values.weight),
        height: Number(values.height),
        age: Number(values.age),
      }),
    });
    setProfile(profile);
    await refreshDashboard();
    showToast('Profile and daily target updated.');
  } catch (error) {
    showToast(error.message);
  }
});
if (state.token) startApp();
