const langBtn = document.getElementById('langBtn');
let lang = 'hi';

function setLang(next) {
    lang = next;
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-hi]').forEach(el => {
        el.textContent = el.dataset[lang];
    });

    langBtn.textContent = lang === 'hi' ? 'English' : 'हिंदी';
}

langBtn.addEventListener('click', () => {
    setLang(lang === 'hi' ? 'en' : 'hi');
});

const input = document.getElementById('noticeInput');
const add = document.getElementById('addNotice');
const list = document.getElementById('noticeList');

function render() {
    const items = JSON.parse(
        localStorage.getItem('jamgaonNotices') || '[]'
    );

    list.innerHTML = '';

    if (!items.length) {
        list.innerHTML =
            '<p class="empty">अभी कोई अतिरिक्त सूचना नहीं है।</p>';
        return;
    }

    items.forEach(t => {
        const el = document.createElement('article');
        el.className = 'notice';

        const d = document.createElement('time');
        d.textContent = 'UPDATE';

        const box = document.createElement('div');
        const b = document.createElement('b');

        b.textContent = t;
        box.append(b);
        el.append(d, box);
        list.append(el);
    });
}

add.addEventListener('click', () => {
    const v = input.value.trim();

    if (!v) return;

    const items = JSON.parse(
        localStorage.getItem('jamgaonNotices') || '[]'
    );

    items.unshift(v);

    localStorage.setItem(
        'jamgaonNotices',
        JSON.stringify(items)
    );

    input.value = '';
    render();
});

render();
