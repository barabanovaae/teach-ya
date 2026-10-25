// Mobile composition has its own order; wide layouts retain the original sequence.
const mobileRefreshMedia = matchMedia('(max-width: 599px)');
const pageMain = document.querySelector('body > main');
const originalSections = [...pageMain.children];
const mobileSectionOrder = ['.hero', '.benefits', '.program', '.statistics', '.reviews', '.trial'].map(selector => pageMain.querySelector(selector));
function arrangeMobileSections() {
  const order = mobileRefreshMedia.matches ? mobileSectionOrder : originalSections;
  order.forEach(section => pageMain.append(section));
}
mobileRefreshMedia.addEventListener('change', arrangeMobileSections);
arrangeMobileSections();

const orbitGuide = document.createElement('div');
orbitGuide.classList.add('orbit-guide');
orbitGuide.setAttribute('aria-hidden','true');
document.querySelector('.card-window').prepend(orbitGuide);

document.querySelectorAll('.statistics, .trial').forEach(section => {
  section.classList.add('mobile-promo');
  const title = document.createElement('h2');
  title.className = 'promo-word';
  title.textContent = section.classList.contains('statistics') ? 'Speak freely.' : 'Start today.';
  section.querySelector('.feature-copy').prepend(title);
});

const collage = document.createElement('div');
collage.className = 'review-collage';
collage.setAttribute('aria-label', 'Отзывы учеников — выбери карточку, чтобы прочитать');
document.querySelector('.reviews').append(collage);
const collageAuthors = ['maria', 'dmitry', 'alina', 'artem', 'katya'];
const collagePlaces = [
  {x:2,y:8,w:36,h:194,photo:112,angle:-2},
  {x:53,y:70,w:45,h:236,photo:145,angle:2},
  {x:8,y:267,w:40,h:216,photo:126,angle:-1},
  {x:65,y:368,w:32,h:174,photo:90,angle:2},
  {x:20,y:506,w:44,h:208,photo:120,angle:-2}
];
const wideCollagePlaces = [
  {x:3,y:12,w:20,h:270,photo:175,angle:-2},
  {x:37,y:65,w:28,h:340,photo:235,angle:1},
  {x:78,y:0,w:19,h:250,photo:155,angle:2},
  {x:8,y:407,w:18,h:240,photo:145,angle:1},
  {x:69,y:375,w:25,h:315,photo:210,angle:-2}
];
let selectedCollageReview = null;
const desktopReviewHover = matchMedia('(min-width: 1101px) and (hover: hover) and (pointer: fine)');
let hoveredCollageReview = null;
const collageEntries = [];
function updateCollageFade(entry) {
  const viewport = entry.reading.clientHeight;
  const range = Math.max(0, entry.reading.scrollHeight - viewport);
  const more = range - entry.reading.scrollTop > 2;
  entry.card.classList.toggle('has-more', more);
  entry.card.classList.toggle('has-scrollable-review', range > 2);
  // This track stays visible even when the phone hides its system scrollbar.
  const thumbHeight = Math.min(viewport, Math.max(36, viewport * viewport / Math.max(1, entry.reading.scrollHeight)));
  const progress = range ? Math.max(0, Math.min(1, entry.reading.scrollTop / range)) : 0;
  entry.card.style.setProperty('--review-scroll-top', entry.reading.offsetTop + 'px');
  entry.card.style.setProperty('--review-scroll-height', viewport + 'px');
  entry.card.style.setProperty('--review-thumb-height', thumbHeight + 'px');
  entry.card.style.setProperty('--review-thumb-top', progress * (viewport - thumbHeight) + 'px');
}
function chooseCollageReview(key, fromHover = false) {
  const origin = collageEntries.find(entry => entry.key === key)?.card.getBoundingClientRect();
  selectedCollageReview = selectedCollageReview === key ? null : key;
  collage.classList.toggle('has-selection', selectedCollageReview !== null);
  if (selectedCollageReview) {
    let viewportCenter = innerHeight / 2;
    if (window.frameElement) {
      const frameBox = window.frameElement.getBoundingClientRect();
      const scale = frameBox.width / innerWidth;
      viewportCenter = (parent.innerHeight / 2 - frameBox.top) / scale;
    }
    const scene = collage.getBoundingClientRect();
    // Keep a hovered card beneath the pointer as it grows, avoiding enter/leave loops.
    const top = fromHover ? Math.max(0, origin.top - scene.top) : Math.max(16, viewportCenter - scene.top - 215);
    const left = fromHover ? Math.max(240, Math.min(scene.width - 240, origin.left - scene.left + origin.width / 2)) + 'px' : '50%';
    collage.style.setProperty('--selection-left', left);
    collage.style.setProperty('--selection-top', top + 'px');
    collage.style.height = Math.max(735, top + 450) + 'px';
  } else {
    collage.style.height = '';
  }
  const selectionIndex = collageAuthors.indexOf(selectedCollageReview);
  collageEntries.forEach((entry,index) => {
    const selected = entry.key === selectedCollageReview;
    entry.card.classList.toggle('is-selected', selected);
    entry.pick.setAttribute('aria-expanded', String(selected));
    entry.pick.setAttribute('aria-label', (selected ? 'Свернуть отзыв: ' : 'Читать отзыв: ') + reviews[entry.key].name);
    entry.reading.tabIndex = selected ? 0 : -1;
    entry.reading.setAttribute('aria-hidden', String(!selected));
    entry.reading.scrollTop = 0;
    entry.close.hidden = !selected;
    const shifted = selectedCollageReview !== null && !selected;
    const horizontal = mobileRefreshMedia.matches ? (index % 2 ? -11 : 9) : (index === 1 ? -collage.clientWidth * .32 : (index % 2 ? -20 : 20));
    const vertical = ((index * 13 + selectionIndex * 7) % 29) - 14;
    entry.card.style.setProperty('--drift-x', shifted ? horizontal + 'px' : '0px');
    entry.card.style.setProperty('--drift-y', shifted ? vertical + 'px' : '0px');
    const place = (mobileRefreshMedia.matches ? collagePlaces : wideCollagePlaces)[index];
    entry.card.style.setProperty('--card-angle', (shifted ? place.angle + (selectionIndex % 2 ? 2 : -2) : place.angle) + 'deg');
    updateCollageFade(entry);
  });
}
collageAuthors.forEach((key,index) => {
  const data = reviews[key];
  const place = collagePlaces[index];
  const card = document.createElement('article');
  card.className = 'collage-card';
  card.dataset.author = key;
  card.setAttribute('aria-label', data.name + ': ' + data.rating + ' из 5');
  card.style.setProperty('--card-x', place.x + '%');
  card.style.setProperty('--card-y', place.y + 'px');
  card.style.setProperty('--card-width', place.w + '%');
  card.style.setProperty('--card-height', place.h + 'px');
  card.style.setProperty('--card-photo-height', place.photo + 'px');
  card.style.setProperty('--card-angle', place.angle + 'deg');
  const header = document.createElement('header');
  header.className = 'collage-heading';
  const portrait = document.createElement('img');
  portrait.src = 'assets/portrait-' + key + '.webp';
  portrait.alt = '';
  portrait.width = 320;
  portrait.height = 320;
  portrait.loading = 'lazy';
  portrait.decoding = 'async';
  portrait.classList.add('collage-photo');
  const byline = document.createElement('div');
  byline.className = 'collage-byline';
  const name = document.createElement('h3');
  name.textContent = data.name;
  const stars = document.createElement('span');
  stars.className = 'collage-stars';
  stars.textContent = '★'.repeat(data.rating) + '☆'.repeat(5-data.rating);
  stars.setAttribute('aria-label', data.rating + ' из 5');
  byline.append(name,stars);
  header.append(portrait,byline);
  const reading = document.createElement('div');
  reading.className = 'collage-reading';
  reading.id = 'collage-text-' + key;
  reading.setAttribute('role','region');
  reading.setAttribute('aria-label','Полный отзыв: ' + data.name);
  reading.setAttribute('aria-hidden','true');
  reading.tabIndex = -1;
  const paragraph = document.createElement('p');
  paragraph.textContent = data.text;
  reading.append(paragraph);
  const scrollIndicator = document.createElement('div');
  scrollIndicator.className = 'collage-scroll-indicator';
  scrollIndicator.setAttribute('aria-hidden', 'true');
  scrollIndicator.append(document.createElement('span'));
  const pick = document.createElement('button');
  pick.className = 'collage-pick';
  pick.type = 'button';
  pick.setAttribute('aria-label','Читать отзыв: ' + data.name);
  pick.setAttribute('aria-expanded','false');
  pick.setAttribute('aria-controls',reading.id);
  pick.addEventListener('click',event => {
    if (desktopReviewHover.matches && event.detail > 0) return;
    hoveredCollageReview = null;
    chooseCollageReview(key);
  });
  card.addEventListener('pointerenter',event => {
    if (!desktopReviewHover.matches || event.pointerType !== 'mouse') return;
    hoveredCollageReview = key;
    if (selectedCollageReview !== key) chooseCollageReview(key, true);
  });
  card.addEventListener('pointerleave',event => {
    if (event.pointerType !== 'mouse' || hoveredCollageReview !== key) return;
    hoveredCollageReview = null;
    if (selectedCollageReview === key) chooseCollageReview(key);
  });
  const close = document.createElement('button');
  close.className = 'collage-close';
  close.type = 'button';
  close.textContent = '×';
  close.setAttribute('aria-label','Закрыть отзыв: ' + data.name);
  close.hidden = true;
  close.addEventListener('click',() => {chooseCollageReview(key); pick.focus({preventScroll:true});});
  card.append(header,reading,scrollIndicator,pick,close);
  collage.append(card);
  const entry = {key,card,pick,close,reading};
  collageEntries.push(entry);
  reading.addEventListener('scroll',() => updateCollageFade(entry),{passive:true});
  const readingObserver = new ResizeObserver(() => updateCollageFade(entry));
  readingObserver.observe(reading);
  readingObserver.observe(paragraph);
});
function arrangeReviewCollage() {
  const places = mobileRefreshMedia.matches ? collagePlaces : wideCollagePlaces;
  collageEntries.forEach((entry,index) => {
    const place = places[index];
    entry.card.style.setProperty('--card-x', place.x + '%');
    entry.card.style.setProperty('--card-y', place.y + 'px');
    entry.card.style.setProperty('--card-width', place.w + '%');
    entry.card.style.setProperty('--card-height', place.h + 'px');
    entry.card.style.setProperty('--card-photo-height', place.photo + 'px');
    entry.card.style.setProperty('--card-angle', place.angle + 'deg');
  });
}
mobileRefreshMedia.addEventListener('change', arrangeReviewCollage);
arrangeReviewCollage();
collage.addEventListener('click',event => {
  if (event.target === collage && selectedCollageReview) chooseCollageReview(selectedCollageReview);
});
collage.addEventListener('keydown',event => {
  if (event.key === 'Escape' && selectedCollageReview) {
    const previous = collageEntries.find(entry => entry.key === selectedCollageReview);
    chooseCollageReview(selectedCollageReview);
    previous.pick.focus();
  }
});
