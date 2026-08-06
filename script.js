// ===== Mobile menu toggle =====
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

menuToggle.addEventListener('click', () => {
  mainNav.classList.toggle('open');
  menuToggle.classList.toggle('active');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
  });
});

// ===== Active nav link on scroll =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.main-nav a');

function setActiveLink() {
  const scrollY = window.pageYOffset;
  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 120;
    const sectionId = section.getAttribute('id');
    const link = document.querySelector(`.main-nav a[href="#${sectionId}"]`);
    if (!link) return;
    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}
window.addEventListener('scroll', setActiveLink);

// ===== Back to top button =====
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 400) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Contact form validation =====
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

const validators = {
  name: value => value.trim().length >= 3,
  phone: value => /^(05)[0-9]{8}$/.test(value.trim()),
  email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
  subject: value => value.trim().length > 0,
  message: value => value.trim().length >= 10
};

const errorMessages = {
  name: 'الرجاء إدخال الاسم الكامل (3 أحرف على الأقل)',
  phone: 'الرجاء إدخال رقم جوال سعودي صحيح (يبدأ بـ 05)',
  email: 'الرجاء إدخال بريد إلكتروني صحيح',
  subject: 'الرجاء اختيار نوع الخدمة',
  message: 'الرجاء كتابة رسالة لا تقل عن 10 أحرف'
};

function validateField(field) {
  const name = field.name;
  const value = field.value;
  const formGroup = field.closest('.form-group');
  const errorEl = document.getElementById(`${name}Error`);
  const isValid = validators[name] ? validators[name](value) : true;

  if (!isValid) {
    formGroup.classList.add('invalid');
    if (errorEl) errorEl.textContent = errorMessages[name];
  } else {
    formGroup.classList.remove('invalid');
    if (errorEl) errorEl.textContent = '';
  }
  return isValid;
}

form.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.closest('.form-group').classList.contains('invalid')) {
      validateField(field);
    }
  });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  formSuccess.classList.remove('show');

  const fields = form.querySelectorAll('input, select, textarea');
  let allValid = true;

  fields.forEach(field => {
    const valid = validateField(field);
    if (!valid) allValid = false;
  });

  if (allValid) {
    formSuccess.classList.add('show');
    form.reset();

    setTimeout(() => {
      formSuccess.classList.remove('show');
    }, 6000);
  } else {
    const firstInvalid = form.querySelector('.form-group.invalid');
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
});
