// ===== Config =====
const WHATSAPP_NUMBER = '966500000000';

function waLink(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

// ===== Mobile menu toggle =====
const header = document.getElementById('header');
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

function setMenu(open) {
  mainNav.classList.toggle('open', open);
  menuToggle.classList.toggle('active', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
}

menuToggle.addEventListener('click', () => {
  setMenu(!mainNav.classList.contains('open'));
});

// Close mobile menu on link click, outside click, or Escape
mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('click', (e) => {
  if (mainNav.classList.contains('open') && !header.contains(e.target)) setMenu(false);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mainNav.classList.contains('open')) {
    setMenu(false);
    menuToggle.focus();
  }
});

// ===== Active nav link on scroll =====
const navLinks = mainNav.querySelectorAll('a');

function setActiveLink(id) {
  navLinks.forEach(link => {
    const isActive = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && mainNav.querySelector(`a[href="#${entry.target.id}"]`)) {
      setActiveLink(entry.target.id);
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));

// ===== Header shadow + back to top button =====
const backToTop = document.getElementById('backToTop');
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 10);
  const showTop = y > 600;
  backToTop.classList.toggle('show', showTop);
  backToTop.tabIndex = showTop ? 0 : -1;
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });
onScroll();

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0 });
  document.querySelector('.logo').focus({ preventScroll: true });
});

// ===== Hero video: load only on larger screens without reduced motion =====
const heroVideo = document.getElementById('heroVideo');
const canPlayVideo = window.matchMedia('(min-width: 481px)').matches
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroVideo && canPlayVideo) {
  heroVideo.src = heroVideo.dataset.src;
  heroVideo.play().catch(() => { /* autoplay blocked: poster stays visible */ });
}

// ===== Open-now status (office hours in Riyadh time) =====
const OPEN_MIN = 9 * 60;
const CLOSE_MIN = 21 * 60;

function getOpenStatus(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Riyadh', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
  }).formatToParts(date);
  const get = type => parts.find(p => p.type === type).value;
  const day = get('weekday');
  const mins = Number(get('hour')) * 60 + Number(get('minute'));
  const isWorkday = day !== 'Fri';

  if (isWorkday && mins >= OPEN_MIN && mins < CLOSE_MIN) {
    return { open: true, text: 'مفتوح الآن · يغلق 9 مساءً' };
  }
  if (isWorkday && mins < OPEN_MIN) {
    return { open: false, text: 'مغلق الآن · يفتح اليوم 9 صباحاً' };
  }
  const when = day === 'Thu' ? 'السبت' : 'غداً';
  return { open: false, text: `مغلق الآن · يفتح ${when} 9 صباحاً` };
}

function renderOpenStatus() {
  const status = getOpenStatus();
  document.querySelectorAll('[data-open-status]').forEach(el => {
    el.classList.toggle('is-open', status.open);
    el.classList.toggle('is-closed', !status.open);
    el.querySelector('.open-text').textContent = status.text;
  });
}
renderOpenStatus();
setInterval(renderOpenStatus, 60 * 1000);

// ===== WhatsApp links =====
document.querySelectorAll('[data-wa]').forEach(link => {
  link.href = waLink(link.dataset.wa);
});

// Hero intent cards: preselect the matching request type in the form
document.querySelectorAll('[data-request]').forEach(link => {
  link.addEventListener('click', () => {
    const radio = document.querySelector(`input[name="request"][value="${link.dataset.request}"]`);
    if (radio) radio.checked = true;
  });
});

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Contact form → WhatsApp =====
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const waFallback = document.getElementById('waFallback');

// Convert Arabic-Indic digits (٠-٩ and ۰-۹) to Latin and strip spaces/dashes
function normalizePhone(value) {
  return value
    .replace(/[٠-٩]/g, d => d.charCodeAt(0) - 0x0660)
    .replace(/[۰-۹]/g, d => d.charCodeAt(0) - 0x06F0)
    .replace(/[\s\-()]/g, '')
    .replace(/^(\+?966|00966)5/, '05');
}

const requestLabels = {
  rent: 'أبحث عن عقار للإيجار',
  buy: 'أرغب بشراء عقار',
  owner: 'أرغب بعرض عقاري للبيع أو الإيجار',
  other: 'استفسار عام'
};

const validators = {
  request: () => Boolean(form.querySelector('input[name="request"]:checked')),
  name: value => value.trim().length >= 2,
  phone: value => /^05[0-9]{8}$/.test(normalizePhone(value))
};

const errorMessages = {
  request: 'الرجاء اختيار نوع الطلب',
  name: 'الرجاء إدخال الاسم',
  phone: 'الرجاء إدخال رقم جوال سعودي صحيح (مثال: 0512345678)'
};

function validateField(name) {
  const field = form.elements[name];
  const input = field instanceof RadioNodeList ? field[0] : field;
  const group = input.closest('.form-group');
  const isValid = validators[name](field.value || '');

  group.classList.toggle('invalid', !isValid);
  if (!(field instanceof RadioNodeList)) field.setAttribute('aria-invalid', String(!isValid));
  document.getElementById(`${name}Error`).textContent = isValid ? '' : errorMessages[name];
  return isValid;
}

['name', 'phone'].forEach(name => {
  const field = form.elements[name];
  field.addEventListener('blur', () => { if (field.value) validateField(name); });
  field.addEventListener('input', () => {
    if (field.closest('.form-group').classList.contains('invalid')) validateField(name);
  });
});

form.querySelectorAll('input[name="request"]').forEach(radio => {
  radio.addEventListener('change', () => validateField('request'));
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  formSuccess.hidden = true;

  const invalid = Object.keys(validators).filter(name => !validateField(name));
  if (invalid.length) {
    const first = form.elements[invalid[0]];
    const target = first instanceof RadioNodeList ? first[0] : first;
    target.focus({ preventScroll: true });
    target.closest('.form-group').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const data = new FormData(form);
  const lines = [
    'مرحباً، طلب جديد من الموقع:',
    `نوع الطلب: ${requestLabels[data.get('request')]}`,
    `الاسم: ${data.get('name').trim()}`,
    `الجوال: ${normalizePhone(data.get('phone'))}`
  ];
  if (data.get('city')) lines.push(`المدينة: ${data.get('city')}`);
  if (data.get('budget').trim()) lines.push(`الميزانية: ${data.get('budget').trim()}`);
  if (data.get('message').trim()) lines.push(`التفاصيل: ${data.get('message').trim()}`);

  const url = waLink(lines.join('\n'));
  waFallback.href = url;
  formSuccess.hidden = false;
  window.open(url, '_blank', 'noopener');
});
