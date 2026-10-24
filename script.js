const dialog = document.querySelector('dialog');
const content = {
  trial: ['Бесплатный пробный урок', '40 минут разговора и полный разбор твоих точек роста. Запись на урок скоро откроется.'],
  contacts: ['Соцсети Teach Ya', 'Ссылки на соцсети школы скоро появятся здесь.']
};
document.querySelectorAll('[data-dialog]').forEach(button => {
  button.addEventListener('click', () => {
    const [title, text] = content[button.dataset.dialog];
    document.querySelector('#dialog-title').textContent = title;
    document.querySelector('#dialog-text').textContent = text;
    dialog.showModal();
  });
});
document.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});
const reasons = [
  {title:'1. Фокус на речь, а не на правила',text:'80% времени — разговоры. Мы закидываем тебя в языковую среду с первого занятия.',box:'288 999 145 145',alt:'Коллаж об английской речи и общении'},
  {title:'2. Учим под твой тип памяти',text:'Мы подберем формат: мемы, песни, сценарии из твоего любимого фильма.',box:'1351 1268 237 237',alt:'Музыка, игры и книги на английском',source:'why'},
  {title:'3. 30 минут в день — это реально',text:'Короткие, но мощные уроки. Живой куратор напомнит, когда ты заленился.',box:'668 715 237 238',alt:'Книги, кофе и 30 минут на английский',source:'why'},
  {title:'4. Группы по интересам',text:'Не «Beginner 4B», а «English для гиков», «Для переезда» или «Бизнес-лексика для переговоров»',box:'23 1267 237 237',alt:'Игры, карьера, общение и работа',source:'why'}
];
let activeReason = 0;
let carouselMoving = false;
const cardWindow = document.querySelector('.card-window');
const cardTemplate = cardWindow.querySelector('.reason-card').cloneNode(true);
cardWindow.replaceChildren();
const reasonCards = reasons.map((reason, index) => {
  const card = cardTemplate.cloneNode(true);
  card.dataset.reason = index;
    card.querySelector('h3').textContent = reason.title;
    let paragraph = card.querySelector('p');
    if (reason.text) {
      if (!paragraph) {paragraph = document.createElement('p'); card.querySelector('h3').after(paragraph);}
      paragraph.textContent = reason.text;
    } else if (paragraph) paragraph.remove();
    const svg = card.querySelector('svg');
    svg.setAttribute('viewBox', reason.box);
    svg.setAttribute('aria-label', reason.alt);
    const image = svg.querySelector('image');
    image.setAttribute('href', reason.source === 'why' ? 'design/Why,s%20desktop.jpg' : 'design/Desktip2.jpg');
    image.setAttribute('width', reason.source === 'why' ? '1619' : '720');
    image.setAttribute('height', reason.source === 'why' ? String(3704 * 1619 / 3906) : '2048.5');
  cardWindow.append(card);
  return card;
});
function positionCard(card, slot) {
  card.style.setProperty('--slot', slot);
  card.classList.toggle('is-active', slot === 0);
  card.classList.toggle('is-side', slot !== 0);
  card.style.opacity = Math.abs(slot) > 1 ? '0' : slot === 0 ? '1' : '.53';
  card.setAttribute('aria-hidden', String(Math.abs(slot) > 1));
  if (slot === 0) card.setAttribute('aria-current', 'true');
  else card.removeAttribute('aria-current');
}
function reasonSlot(index) {
  const offset = (index - activeReason + reasons.length) % reasons.length;
  return offset === reasons.length - 1 ? -1 : offset;
}
reasonCards.forEach((card, index) => positionCard(card, reasonSlot(index)));
const phoneCarouselMedia = window.matchMedia('(max-width: 599px)');
let orbitPosition = 0;
let orbitFrame = 0;
function renderPhoneOrbit(position) {
  // The guide and card centres share one tilted circle in three dimensions.
  const windowElement = document.querySelector('.card-window');
  const radius = windowElement.clientWidth / 2 + 15;
  const inclination = 78 * Math.PI / 180;
  const rise = radius * Math.cos(inclination);
  const reach = radius * Math.sin(inclination);
  windowElement.style.setProperty('--orbit-radius', radius + 'px');
  windowElement.style.setProperty('--orbit-rise', rise + 'px');
  windowElement.style.setProperty('--orbit-reach', reach + 'px');
  reasonCards.forEach((card, index) => {
    const angle = (index - position) * Math.PI / 2;
    const depth = Math.cos(angle);
    const x = Math.sin(angle) * radius;
    const y = (depth - 1) * rise;
    const z = (depth - 1) * reach;
    const scale = .28 + .72 * Math.pow((depth + 1) / 2, 3);
    const tilt = Math.sin(angle) * -9;
    card.style.setProperty('--orbit-transform', `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateY(${tilt}deg) scale(${scale})`);
    card.style.setProperty('--orbit-brightness', '1');
    card.style.opacity = '1';
    card.setAttribute('aria-hidden', String(index !== activeReason));
  });
}
function synchronizeCarouselLayout() {
  cancelAnimationFrame(orbitFrame);
  orbitFrame = 0;
  carouselMoving = false;
  orbitPosition = activeReason;
  reasonCards.forEach((card, index) => positionCard(card, reasonSlot(index)));
  if (phoneCarouselMedia.matches) renderPhoneOrbit(orbitPosition);
}
phoneCarouselMedia.addEventListener('change', synchronizeCarouselLayout);
synchronizeCarouselLayout();
new ResizeObserver(() => {
  if (phoneCarouselMedia.matches) renderPhoneOrbit(orbitPosition);
}).observe(document.querySelector('.card-window'));
function changeReason(direction) {
  if (carouselMoving) return;
  carouselMoving = true;
  if (phoneCarouselMedia.matches) {
    const from = orbitPosition;
    const target = from + direction;
    activeReason = (activeReason + direction + reasons.length) % reasons.length;
    reasonCards.forEach((card, index) => positionCard(card, reasonSlot(index)));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      orbitPosition = target;
      renderPhoneOrbit(target);
      carouselMoving = false;
      return;
    }
    const started = performance.now();
    function moveAlongOrbit(time) {
      const progress = Math.min(1, (time - started) / 800);
      const eased = progress * progress * (3 - 2 * progress);
      orbitPosition = from + direction * eased;
      renderPhoneOrbit(orbitPosition);
      if (progress < 1) orbitFrame = requestAnimationFrame(moveAlongOrbit);
      else { orbitFrame = 0; carouselMoving = false; }
    }
    orbitFrame = requestAnimationFrame(moveAlongOrbit);
    return;
  }
  const hidden = reasonCards[(activeReason + 2) % reasons.length];
  hidden.classList.add('without-motion');
  positionCard(hidden, direction * 2);
  hidden.getBoundingClientRect();
  hidden.classList.remove('without-motion');
  reasonCards.forEach((card, index) => {
    let slot = reasonSlot(index);
    if (slot === 2) slot = direction * 2;
    positionCard(card, slot - direction);
  });
  activeReason = (activeReason + direction + reasons.length) % reasons.length;
  window.setTimeout(() => { carouselMoving = false; }, 650);
}

document.querySelector('.previous').addEventListener('click', () => changeReason(-1));
document.querySelector('.next').addEventListener('click', () => changeReason(1));
document.querySelector('.carousel').addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault(); changeReason(event.key === 'ArrowRight' ? 1 : -1);
  }
});

// Keep vertical page scrolling native; a deliberate horizontal swipe turns the stack.
const carousel = document.querySelector('.carousel');
carousel.tabIndex = 0;
let swipeStart = null;
carousel.addEventListener('pointerdown', event => {
  if (!window.matchMedia('(max-width: 599px)').matches || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
  swipeStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  carousel.setPointerCapture(event.pointerId);
});
carousel.addEventListener('pointerup', event => {
  if (!swipeStart || event.pointerId !== swipeStart.id) return;
  const dx = event.clientX - swipeStart.x;
  const dy = event.clientY - swipeStart.y;
  swipeStart = null;
  if (Math.abs(dx) >= 35 && Math.abs(dx) > Math.abs(dy) * 1.3) changeReason(dx < 0 ? 1 : -1);
});
carousel.addEventListener('pointercancel', () => { swipeStart = null; });
carousel.addEventListener('lostpointercapture', () => { swipeStart = null; });


const reviews = {
  maria: {
    name: 'Мария', rating: 5, portrait: '23 23 79 79',
    text: 'Проходила обучение с целью улучшения разговорных навыков для делового общения. Программа составлена грамотно, сделан акцент на современную лексику, исключены устаревшие грамматические конструкции, редко встречающиеся в живой речи. Отдельно хочу отметить профессионализм преподавателя. Занятия проводились на стабильной образовательной платформе без технических сбоев. Результат: расширение активного словарного запаса и снятие коммуникативного барьера. Рекомендую всем!'
  },
  dmitry: {
    name: 'Дмитрий', rating: 5, portrait: '528 23 79 79',
    text: 'Курс полностью оправдал ожидания. Программа выстроена логично, лексика современная, без устаревших конструкций. Преподаватели компетентны, обратная связь содержательна и своевременна. Материал одинаково хорошо охватывает и разговорную практику, и деловую коммуникацию. Рекомендую специалистам технического профиля.'
  },
  alina: {
    name: 'Алина', rating: 5, portrait: '934 23 79 79',
    text: 'Пришла с начальным уровнем владения языка. Методология школы основана на погружении в языковую среду через актуальный медиаконтент (интервью, фильмы, подкасты). Интерфейс личного кабинета интуитивно понятен, техническая поддержка работает оперативно. Куратор проявил высокий уровень терпения и методической подготовки. Прогресс очевиден: спустя три месяца могу вести простую деловую переписку и понимаю устную речь в среднем темпе. Инвестиция времени и средств полностью себя оправдала.'
  },
  katya: {
    name: 'Екатерина', rating: 5, portrait: '1331 23 79 79',
    text: 'Брала курс как практическое дополнение к университетской теории. Полностью оправдал ожидания: разбор аутентичных материалов помогает освоить контекстуальное использование идиом. Разговорный клуб с носителями эффективно корректирует произношение и интонацию. Программа оптимальна для достижения естественного владения языком. Рекомендую студентам лингвистических направлений.'
  },
  artem: {
    name: 'Артем', rating: 4, portrait: '1834 23 79 79',
    text: 'Курс оправдал ожидания в части актуальности контента. Лексический материал базируется на современных кейсах, а не на архаичных учебных пособиях. Практические вебинары с международной группой позволили преодолеть страх спонтанной речи. Ставлю 4, а не 5, поскольку считаю, что блок академической грамматики мог бы быть представлен в большем объёме. В остальном — достойный продукт'
  }
};
const tabletLayout = window.matchMedia('(min-width: 600px) and (max-width: 1100px)');
const isTabletLayout = () => tabletLayout.matches || document.documentElement.classList.contains('tablet-preview');
const compactHeroLayout = window.matchMedia('(max-width: 1100px)');
const usesAutomaticHeroMotion = () => compactHeroLayout.matches || document.documentElement.classList.contains('tablet-preview');
const phoneLayout = window.matchMedia('(max-width: 599px)');
const phoneFeaturePhotos = [...document.querySelectorAll('.statistics .feature-media svg, .trial .feature-media svg')].map(photo => ({
  photo, originalCrop: photo.getAttribute('viewBox'),
  phoneCrop: photo.closest('.statistics') ? '97 585 184 116' : '97 1204 184 116'
}));
function cropPhoneStatisticsPhoto() {
  phoneFeaturePhotos.forEach(({photo, originalCrop, phoneCrop}) => photo.setAttribute('viewBox', phoneLayout.matches ? phoneCrop : originalCrop));
}
phoneLayout.addEventListener('change', cropPhoneStatisticsPhoto);
cropPhoneStatisticsPhoto();

document.querySelectorAll('[data-review]').forEach(button => {
  const card = button.closest('.review');
  const key = button.dataset.review;
  const preview = document.createElement('div');
  preview.className = 'review-preview';
  while (card.firstChild) preview.append(card.firstChild);
  card.append(preview);
  const details = document.createElement('div');
  details.className = 'review-details';
  details.id = 'review-' + key + '-text';
  details.inert = true;
  const inner = document.createElement('div');
  const text = document.createElement('p');
  text.className = 'full-review-text';
  text.textContent = reviews[key].text;
  inner.append(text);
  details.append(inner);
  card.append(details);
  button.setAttribute('aria-controls', details.id);
  button.setAttribute('aria-expanded', 'false');
  const closedLabel = button.getAttribute('aria-label');
  inner.tabIndex = 0;
  inner.setAttribute('role', 'region');
  inner.setAttribute('aria-label', 'Полный отзыв: ' + reviews[key].name);
  function sizeTabletReview() {
    if (!isTabletLayout()) return;
    const style = getComputedStyle(card);
    const totalHeight = parseFloat(style.getPropertyValue('--review-expanded-height')) || 480;
    const previewHeight = parseFloat(getComputedStyle(preview).height);
    const borders = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    card.style.setProperty('--review-details-open-height', Math.max(0, totalHeight - previewHeight - borders) + 'px');
  }
  function updateScrollHint() {
    details.classList.toggle('has-more', isTabletLayout() && card.classList.contains('is-expanded') && inner.scrollHeight - inner.clientHeight - inner.scrollTop > 2);
  }
  inner.addEventListener('scroll', updateScrollHint, {passive: true});
  new ResizeObserver(sizeTabletReview).observe(preview);
  new ResizeObserver(updateScrollHint).observe(inner);
  function setExpanded(expanded) {
    sizeTabletReview();
    button.setAttribute('aria-expanded', String(expanded));
    button.setAttribute('aria-label', expanded ? 'Свернуть отзыв: ' + reviews[key].name : closedLabel);
    card.classList.toggle('is-expanded', expanded);
    details.inert = !expanded;
    updateScrollHint();
  }
  card.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' && !isTabletLayout()) setExpanded(true);
  });
  card.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse' && !isTabletLayout()) setExpanded(false);
  });
  // Keyboard and touch can still activate the review without pinning mouse hover open.
  button.addEventListener('click', event => {
    if (event.pointerType === 'mouse' && !isTabletLayout()) return;
    setExpanded(button.getAttribute('aria-expanded') !== 'true');
  });
});

// Move five colors around separate paths inside a stationary envelope.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const rainbow = document.querySelector('.rainbow');
const orbit = rainbow.querySelector('.rainbow-orbit');
const glowPaths = [...orbit.querySelectorAll('.glow')].map((element, index) => ({
  element, index, offset: [2.9, 4.15, 5.4, 1.65, .4][index]
}));
function positionGlows(angle) {
  const phase = angle * Math.PI / 180;
  glowPaths.forEach(({element, index, offset}) => {
    const theta = offset + phase + .16 * (Math.sin(phase * .73 + index) - Math.sin(index));
    const x = 22 * Math.cos(theta) + 1.5 * (Math.sin(phase * .61 + index * 1.8) - Math.sin(index * 1.8));
    const y = 21 * Math.sin(theta) + 1.5 * (Math.sin(phase * 1.13 + index) - Math.sin(index));
    element.style.transform = 'translate(' + (x / .52 - 50) + '%, ' + (y / .6 - 50) + '%)';
  });
}
positionGlows(0);
let spinFrame = 0;
let spinAngle = 0;
let spinSpeed = 60;
let spinLastTime = 0;
let spinIntroEnd = performance.now() + 1000;
let spinHovered = false;
let tabletHeroVisible = true;
function rotateRainbow(time) {
  spinFrame = 0;
  if (motionPreference.matches) return;
  const seconds = spinLastTime ? Math.min((time - spinLastTime) / 1000, .05) : 0;
  spinLastTime = time;
  const targetSpeed = usesAutomaticHeroMotion()
    ? (time < spinIntroEnd ? 32 : tabletHeroVisible ? 12 : 0)
    : (spinHovered ? 72 : time < spinIntroEnd ? 32 : 0);
  const easing = 1 - Math.exp(-seconds / (targetSpeed ? .55 : .9));
  spinSpeed += (targetSpeed - spinSpeed) * easing;
  spinAngle += spinSpeed * seconds;
  positionGlows(spinAngle);
  if (targetSpeed || spinSpeed > .08) spinFrame = requestAnimationFrame(rotateRainbow);
  else { spinSpeed = 0; spinLastTime = 0; }
}
function startRainbow() {
  if (!spinFrame && !motionPreference.matches) {
    spinLastTime = 0;
    spinFrame = requestAnimationFrame(rotateRainbow);
  }
}
rainbow.addEventListener('pointerenter', event => {
  if (event.pointerType !== 'mouse' || usesAutomaticHeroMotion()) return;
  spinHovered = true;
  startRainbow();
});
rainbow.addEventListener('pointerleave', () => {
  if (usesAutomaticHeroMotion()) return;
  spinHovered = false;
  spinIntroEnd = 0;
});
motionPreference.addEventListener('change', () => {
  if (motionPreference.matches) {
    cancelAnimationFrame(spinFrame);
    spinFrame = 0;
    spinSpeed = 0;
    positionGlows(0);
  } else if (spinHovered || (usesAutomaticHeroMotion() && tabletHeroVisible)) startRainbow();
});
startRainbow();

function setTabletHeroVisibility(visible) {
  if (!usesAutomaticHeroMotion() || visible === tabletHeroVisible) return;
  tabletHeroVisible = visible;
  if (!visible) {
    cancelAnimationFrame(spinFrame);
    spinFrame = 0;
    spinSpeed = 0;
    spinLastTime = 0;
  } else {
    spinIntroEnd = 0;
    spinSpeed = 12;
    startRainbow();
  }
}
addEventListener('tablet-hero-visibility', event => setTabletHeroVisibility(Boolean(event.detail)));
if (!document.documentElement.classList.contains('tablet-preview') && !document.documentElement.classList.contains('mobile-preview')) {
  const heroObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => setTabletHeroVisibility(entry.isIntersecting && entry.intersectionRatio >= .2));
  }, { threshold: [0, .2] });
  heroObserver.observe(document.querySelector('.hero'));
}

// Re-arm a feature only after it has fully left the viewport.
const featureObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.intersectionRatio >= .18) {
      entry.target.classList.add('is-revealed');
    } else if (!entry.isIntersecting) {
      entry.target.classList.remove('is-revealed');
    }
  });
}, { threshold: [0, .18] });
document.querySelectorAll('.statistics, .trial').forEach(feature => {
  feature.classList.add('feature-reveal');
  if (!document.documentElement.classList.contains('tablet-preview') && !document.documentElement.classList.contains('mobile-preview')) featureObserver.observe(feature);
});
