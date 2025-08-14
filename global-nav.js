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
    { text: 'Home', href: BASE + 'index.html' },
    { text: 'Project 1', href: BASE + 'project1/index.html' },
    { text: 'Project 2', href: BASE + 'project2/index.html' },
    { text: 'Project 3', href: BASE + 'project3/index.html' },
    { text: 'Project 4', href: BASE + 'project4/index.html' },
    { text: 'Project 5', href: BASE + 'project5/index.html' },
    { text: 'Project 6', href: BASE + 'project6/index.html' },
    { text: 'Project 7', href: BASE + 'project7/index.html' },
    { text: 'Project 8', href: BASE + 'project8/index.html' },
    { text: 'Project 9', href: BASE + 'project9/index.html' },
    { text: 'Project 10', href: BASE + 'project10/index.html' },
    { text: 'Project 11', href: BASE + 'project11/index.html' },
    { text: 'Project 12', href: BASE + 'project12/index.html' },
    { text: 'Project 13', href: BASE + 'project13/index.html' },
    { text: 'Sender: Dashboard', href: BASE + 'project13/dashboard.html' },
    { text: 'Sender: Upload', href: BASE + 'project13/upload.html' },
    { text: 'Sender: Packages', href: BASE + 'project13/packages.html' },
    { text: 'Sender: Retrieve', href: BASE + 'project13/retrieve.html' },
    { text: 'Sender: Admin', href: BASE + 'project13/admin.html' }
  ];

  function ensureStyles(){
    if(document.getElementById('globalNavStyles')) return;
    var css = `
      .navbar{position:sticky;top:0;z-index:100;background:#111827;border-bottom:1px solid #374151}
      .nav-links{display:flex;gap:1rem;list-style:none;align-items:center;flex-wrap:wrap;margin:0;padding:0}
      .nav-link{color:#9ca3af;text-decoration:none;font-family:"JetBrains Mono",monospace;font-size:.875rem}
      .nav-link:hover,.nav-link.active{color:#4ade80}
      .nav-wrap{max-width:72rem;margin:0 auto;padding:.75rem 1rem}
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

  function buildNavbar(){
    var nav = document.createElement('nav');
    nav.className = 'navbar';
    var wrap = document.createElement('div');
    wrap.className = 'nav-wrap';
    var ul = document.createElement('ul');
    ul.className = 'nav-links';
    links.forEach(function(l){
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.className = 'nav-link';
      a.href = l.href;
      a.textContent = l.text;
      if(isActive(l.href)) a.classList.add('active');
      li.appendChild(a);
      ul.appendChild(li);
    });
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

