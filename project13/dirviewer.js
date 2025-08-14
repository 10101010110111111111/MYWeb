(function(){
  const dropZone = document.getElementById('dropZone');
  const folderInput = document.getElementById('folderInput');
  const browseBtn = document.getElementById('browseBtn');
  const pickFolderBtn = document.getElementById('pickFolderBtn');
  const treeEl = document.getElementById('tree');
  const summaryEl = document.getElementById('summary');
  const rootPathEl = document.getElementById('rootPath');
  const expandAllBtn = document.getElementById('expandAllBtn');
  const collapseAllBtn = document.getElementById('collapseAllBtn');

  function groupByPath(files){
    const root = { type:'dir', name:'/', children:{} };
    for(const file of files){
      const webkitPath = file.webkitRelativePath || file.name;
      const parts = webkitPath.split('/').filter(Boolean);
      let node = root;
      for(let i=0;i<parts.length;i++){
        const part = parts[i];
        const isFile = (i === parts.length-1) && !webkitPath.endsWith('/');
        if(isFile){
          node.children[part] = { type:'file', name: part, size: file.size };
        } else {
          node.children[part] = node.children[part] || { type:'dir', name: part, children:{} };
          node = node.children[part];
        }
      }
    }
    return root;
  }

  function bytesToNice(n){
    if(n == null) return '';
    const units = ['B','KB','MB','GB','TB'];
    let i=0, s=n;
    while(s>=1024 && i<units.length-1){ s/=1024; i++; }
    return `${s.toFixed(s<10?1:0)} ${units[i]}`;
  }

  function renderTree(node){
    function renderNode(n){
      if(n.type === 'file'){
        return `<li class="file"><div class="row"><span class="muted">└─</span><span>${n.name}</span><span class="badge">${bytesToNice(n.size)}</span></div></li>`;
      }
      const keys = Object.keys(n.children).sort((a,b)=>a.localeCompare(b));
      const items = keys.map(k=>renderNode(n.children[k])).join('');
      const count = keys.length;
      return `<li class="dir">
        <div class="row" onclick="this.parentElement.classList.toggle('open')">
          <span class="toggle">+</span>
          <span>📁 ${n.name}</span>
          <span class="badge">${count} položek</span>
        </div>
        <ul>${items}</ul>
      </li>`;
    }
    treeEl.innerHTML = `<ul class="root">${renderNode(node)}</ul>`;
    // default expand first level
    const firstDir = treeEl.querySelector('.dir');
    if(firstDir){ firstDir.classList.add('open'); }
    // Toggle icon update
    treeEl.addEventListener('click', (e)=>{
      const row = e.target.closest('.row');
      if(!row) return;
      const dir = row.parentElement;
      const t = row.querySelector('.toggle');
      if(t){ t.textContent = dir.classList.contains('open')? '–' : '+'; }
    });
  }

  function updateSummary(files){
    const total = files.length;
    const totalSize = files.reduce((a,f)=>a+f.size,0);
    summaryEl.textContent = `soubory: ${total} | velikost: ${bytesToNice(totalSize)}`;
  }

  async function handleFileList(fileList){
    const files = Array.from(fileList).filter(f=>f.type !== ''); // include directories’ files
    if(files.length === 0){ treeEl.innerHTML = ''; summaryEl.textContent = ''; return; }
    const grouped = groupByPath(files);
    renderTree(grouped);
    updateSummary(files);
    const first = files[0];
    rootPathEl.textContent = first.webkitRelativePath ? first.webkitRelativePath.split('/')[0] : '(zvolené soubory)';
  }

  // Drag & drop
  dropZone.addEventListener('dragover', (e)=>{ e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', ()=> dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', async (e)=>{
    e.preventDefault(); dropZone.classList.remove('dragover');
    if(e.dataTransfer.items){
      const entries = [];
      for(const item of e.dataTransfer.items){
        const entry = item.webkitGetAsEntry && item.webkitGetAsEntry();
        if(entry){ entries.push(entry); }
      }
      // Fallback to files
      await handleFileList(e.dataTransfer.files);
    } else {
      await handleFileList(e.dataTransfer.files);
    }
  });

  // Input (webkitdirectory)
  browseBtn.addEventListener('click', ()=> folderInput.click());
  folderInput.addEventListener('change', ()=> handleFileList(folderInput.files));

  // File System Access API directory picker (if supported)
  pickFolderBtn.addEventListener('click', async ()=>{
    if(window.showDirectoryPicker){
      try {
        const dirHandle = await window.showDirectoryPicker();
        const files = [];
        async function walk(handle, pathPrefix=""){
          for await (const [name, child] of handle.entries()){
            if(child.kind === 'file'){
              const file = await child.getFile();
              Object.defineProperty(file, 'webkitRelativePath', { value: pathPrefix + name });
              files.push(file);
            } else if(child.kind === 'directory'){
              await walk(child, pathPrefix + name + '/');
            }
          }
        }
        await walk(dirHandle);
        handleFileList(files);
      } catch(err){
        console.warn('Directory pick cancelled or failed', err);
      }
    } else {
      folderInput.click();
    }
  });

  // Expand/collapse controls
  expandAllBtn.addEventListener('click', ()=>{
    document.querySelectorAll('#tree .dir').forEach(d=>{
      d.classList.add('open');
      const row = d.querySelector('.row .toggle');
      if(row) row.textContent = '–';
    });
  });
  collapseAllBtn.addEventListener('click', ()=>{
    document.querySelectorAll('#tree .dir').forEach(d=>{
      d.classList.remove('open');
      const row = d.querySelector('.row .toggle');
      if(row) row.textContent = '+';
    });
  });
})();
