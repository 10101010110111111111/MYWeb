(function(){
  const links = document.querySelectorAll('.nav-link');
  const path = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    const href = a.getAttribute('href');
    if(href && href === path){ a.classList.add('active'); }
  });
})();
