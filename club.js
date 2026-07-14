const clubClient = window.doreSupabase;
const clubState = { user: null, profile: null, purchases: 0, reward: null };

const $ = selector => document.querySelector(selector);
const setText = (selector, value) => {
  const node = $(selector);
  if (node) node.textContent = value;
};

function clubPercent(value) {
  return `${Math.min(100, Math.max(0, value / 5 * 100))}%`;
}

function setClubMessage(message, isError = false) {
  const node = $('[data-club-message]');
  if (!node) return;
  node.textContent = message || '';
  node.classList.toggle('is-error', isError);
}

function openClub() {
  $('[data-club-modal]')?.showModal();
}

function closeClub() {
  $('[data-club-modal]')?.close();
}

function renderClubLoggedOut() {
  setText('[data-club-title]', 'Ingresá para ver tu progreso');
  setText('[data-club-copy]', 'Guardamos tus compras confirmadas y te avisamos cuando llegás a 5.');
  $('[data-club-bar]')?.style.setProperty('width', '0%');
  $('[data-club-auth-view]')?.removeAttribute('hidden');
  $('[data-club-profile-view]')?.setAttribute('hidden', '');
  $('[data-club-reward]')?.setAttribute('hidden', '');
}

function renderClubLoggedIn() {
  const name = clubState.profile?.full_name || clubState.user?.email || 'Cliente Doré Lab';
  const hasReward = Boolean(clubState.reward);
  const progress = hasReward ? 5 : clubState.purchases % 5;
  const remaining = Math.max(0, 5 - progress);
  const progressText = hasReward
    ? '¡Premio desbloqueado! Tenés una Box X3 clásica disponible.'
    : remaining === 0
      ? 'Tu próxima recompensa está lista para validar.'
      : `Te faltan ${remaining} compra${remaining === 1 ? '' : 's'} confirmada${remaining === 1 ? '' : 's'} para desbloquear tu Box X3 clásica.`;

  setText('[data-club-title]', `${progress} / 5 experimentos aprobados`);
  setText('[data-club-copy]', progressText);
  setText('[data-club-profile-name]', name);
  setText('[data-club-profile-progress]', `${progress} / 5 compras`);
  setText('[data-club-profile-copy]', progressText);
  $('[data-club-bar]')?.style.setProperty('width', clubPercent(progress));
  $('[data-club-modal-bar]')?.style.setProperty('width', clubPercent(progress));
  $('[data-club-auth-view]')?.setAttribute('hidden', '');
  $('[data-club-profile-view]')?.removeAttribute('hidden');
  if (hasReward) $('[data-club-reward]')?.removeAttribute('hidden');
  else $('[data-club-reward]')?.setAttribute('hidden', '');
}

function renderClub() {
  if (!clubClient || !clubState.user) renderClubLoggedOut();
  else renderClubLoggedIn();
}

async function loadClub() {
  if (!clubClient) {
    setText('[data-club-copy]', 'No pudimos conectar con Supabase. Revisá la configuración del proyecto.');
    return;
  }
  const { data: sessionData } = await clubClient.auth.getSession();
  clubState.user = sessionData?.session?.user || null;
  if (!clubState.user) {
    renderClub();
    return;
  }

  const [{ data: profile }, { count }, { data: rewards }] = await Promise.all([
    clubClient.from('profiles').select('*').eq('id', clubState.user.id).maybeSingle(),
    clubClient.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', clubState.user.id).eq('status', 'confirmed'),
    clubClient.from('rewards').select('*').eq('user_id', clubState.user.id).eq('status', 'available').order('created_at', { ascending: false }).limit(1)
  ]);

  clubState.profile = profile || null;
  clubState.purchases = count || 0;
  clubState.reward = rewards?.[0] || null;
  renderClub();
}

async function signUpClub(form) {
  const data = new FormData(form);
  setClubMessage('Creando tu pasaporte...');
  const { error } = await clubClient.auth.signUp({
    email: data.get('email'),
    password: data.get('password'),
    options: {
      data: {
        full_name: data.get('name'),
        whatsapp: data.get('whatsapp')
      }
    }
  });
  if (error) {
    setClubMessage(error.message, true);
    return;
  }
  setClubMessage('Cuenta creada. Si Supabase pide confirmar email, revisá tu correo. Si no, ya podés ingresar.');
  await loadClub();
}

async function loginClub(form) {
  const data = new FormData(form);
  setClubMessage('Validando fórmula...');
  const { error } = await clubClient.auth.signInWithPassword({
    email: data.get('email'),
    password: data.get('password')
  });
  if (error) {
    setClubMessage('No pudimos ingresar. Revisá email y contraseña.', true);
    return;
  }
  setClubMessage('');
  await loadClub();
}

async function logoutClub() {
  await clubClient?.auth.signOut();
  clubState.user = null;
  clubState.profile = null;
  clubState.purchases = 0;
  clubState.reward = null;
  renderClub();
}

window.DoreClub = {
  async recordPendingOrder(order) {
    if (!clubClient || !clubState.user) return;
    await clubClient.from('orders').insert({
      user_id: clubState.user.id,
      status: 'pending',
      subtotal: order.subtotal,
      shipping_cost: order.shippingCost,
      total: order.total,
      delivery_method: order.delivery,
      postal_code: order.postalCode || null,
      items: order.items,
      promo: order.promo || null
    });
  }
};

document.addEventListener('click', event => {
  if (event.target.closest('[data-open-club]')) openClub();
  if (event.target.closest('[data-close-club]')) closeClub();
  if (event.target.closest('[data-club-login]')) loginClub($('[data-club-form]'));
  if (event.target.closest('[data-club-logout]')) logoutClub();
});

$('[data-club-form]')?.addEventListener('submit', event => {
  event.preventDefault();
  signUpClub(event.currentTarget);
});

clubClient?.auth.onAuthStateChange(() => loadClub());
loadClub();
