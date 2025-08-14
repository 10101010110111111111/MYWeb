// Global Navbar Injector
(function(){
  function computeBase(){
    try {
      var parts = window.location.pathname.split('/').filter(Boolean);
      var depth = Math.max(0, parts.length - 1);
      var base = depth ? Array(depth).fill('..').join('/') + '/' : './';
      return base;
    } catch(e){ return './'; }
  }

  var BASE = computeBase();

  var links = [
    { text: 'Dirviewer', href: BASE + 'project13/index.html' },
    { text: 'Dashboard', href: BASE + 'project13/dashboard.html' },
    { text: 'Upload', href: BASE + 'project13/upload.html' },
    { text: 'Packages', href: BASE + 'project13/packages.html' },
    { text: 'Retrieve', href: BASE + 'project13/retrieve.html' },
    { text: 'Admin', href: BASE + 'project13/admin.html', requiresAdmin: true }
  ];

  function ensureStyles(){
    if(document.getElementById('globalNavStyles')) return;
    var css = `
      .navbar{position:sticky;top:0;z-index:100;background:#111827;border-bottom:1px solid #374151}
      .nav-wrap{max-width:72rem;margin:0 auto;padding:.75rem 1rem;display:flex;gap:.75rem;align-items:center;justify-content:space-between}
      .nav-links{display:flex;gap:1rem;list-style:none;align-items:center;flex-wrap:wrap;margin:0;padding:0}
      .nav-link{color:#9ca3af;text-decoration:none;font-family:"JetBrains Mono",monospace;font-size:.875rem}
      .nav-link:hover,.nav-link.active{color:#4ade80}
      .nav-toggle{display:none;border:1px solid #374151;background:#1f2937;color:#9ca3af;border-radius:6px;padding:.375rem .5rem;font-family:"JetBrains Mono",monospace}
      @media (max-width: 768px){
        .nav-wrap{flex-wrap:wrap}
        .nav-toggle{display:inline-flex;align-items:center;gap:.5rem}
        .nav-links{display:none;flex-direction:column;gap:.5rem;width:100%;padding-top:.5rem}
        .nav-links.open{display:flex}
      }
    `;
    var style = document.createElement('style');
    style.id = 'globalNavStyles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function isActive(href){
    try{
      var here = window.location.pathname.replace(/\/+/g,'/');
      var target = new URL(href, window.location.origin).pathname.replace(/\/+/g,'/');
      return here.toLowerCase() === target.toLowerCase();
    }catch(e){return false}
  }

  function isUserAdmin(){
    try {
      var raw = localStorage.getItem('currentUser');
      if(!raw) return false;
      var u = JSON.parse(raw);
      return !!u.isAdmin;
    } catch(e){ return false; }
  }

  function buildNavbar(){
    var nav = document.createElement('nav');
    nav.className = 'navbar';
    var wrap = document.createElement('div');
    wrap.className = 'nav-wrap';
    var ul = document.createElement('ul');
    ul.className = 'nav-links';
    var admin = isUserAdmin();
    links.forEach(function(l){
      if(l.requiresAdmin && !admin) return;
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.className = 'nav-link';
      a.href = l.href;
      a.textContent = l.text;
      if(isActive(l.href)) a.classList.add('active');
      li.appendChild(a);
      ul.appendChild(li);
    });
    var toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label','toggle navigation');
    toggle.innerHTML = 'Menu';
    toggle.addEventListener('click', function(){ ul.classList.toggle('open'); });
    wrap.appendChild(toggle);
    wrap.appendChild(ul);
    nav.appendChild(wrap);
    return nav;
  }

  function inject(){
    ensureStyles();
    var nav = buildNavbar();
    var body = document.body;
    if(body.firstElementChild){
      body.insertBefore(nav, body.children[1] || body.firstElementChild.nextSibling);
    } else {
      body.appendChild(nav);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', inject);
  } else { inject(); }
})();

