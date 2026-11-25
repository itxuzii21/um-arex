/* eslint-disable @typescript-eslint/no-require-imports */
// UM-Arex Admin Server — pure Node.js, zero extra dependencies
// Run:  node admin-server.js   (or double-click open-admin.cmd)

const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn, exec } = require("child_process");

const PORT = 3001;
const DATA_PATH = path.join(__dirname, "app", "data", "watches.json");
const PUBLIC_PATH = path.join(__dirname, "public");

// ─── Build state ─────────────────────────────────────────────────────────────
let buildClients = [];
let buildStatus = "idle";

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  buildClients = buildClients.filter((c) => {
    try {
      c.write(payload);
      return true;
    } catch {
      return false;
    }
  });
}

// ─── Data helpers ─────────────────────────────────────────────────────────────
function readProducts() {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}
function writeProducts(list) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(list, null, 2), "utf-8");
}
function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString() || "{}"));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

// ─── Build runner ─────────────────────────────────────────────────────────────
function runBuild() {
  if (buildStatus === "building") return;
  buildStatus = "building";
  broadcast("status", { status: "building" });
  broadcast("log", { line: "▶  npm run build", isInfo: true });

  const proc = spawn("npm", ["run", "build"], {
    cwd: __dirname,
    shell: true,
    env: { ...process.env, FORCE_COLOR: "0" },
  });

  const pipe = (isErr) => (d) =>
    d
      .toString()
      .split("\n")
      .filter((l) => l.trim())
      .forEach((line) =>
        broadcast("log", isErr ? { line, isError: true } : { line }),
      );

  proc.stdout.on("data", pipe(false));
  proc.stderr.on("data", pipe(true));
  proc.on("close", (code) => {
    buildStatus = code === 0 ? "success" : "error";
    broadcast("status", { status: buildStatus });
    broadcast(
      "log",
      code === 0
        ? {
            line: "✓  Build complete — drag the  out/  folder to Netlify!",
            isSuccess: true,
          }
        : { line: `✗  Build failed (exit ${code})`, isError: true },
    );
  });
}

// ─── Static file MIME map ─────────────────────────────────────────────────────
const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// ─── HTML ─────────────────────────────────────────────────────────────────────
const HTML = /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>UM-Arex Admin</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  *{box-sizing:border-box}
  body{background:#030712;color:#f9fafb;font-family:system-ui,sans-serif}
  .card{transition:transform .15s,box-shadow .15s}
  .card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.5)}
  .modal-overlay{backdrop-filter:blur(6px)}
  #buildLog{font-family:'Courier New',monospace;font-size:11px;line-height:1.7}
  .build-panel{transition:transform .3s cubic-bezier(.4,0,.2,1)}
  .slide-in{animation:si .18s ease}
  @keyframes si{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
  .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .field{background:#111827;color:#f9fafb;padding:.5rem .75rem;border-radius:.5rem;border:1px solid #1f2937;font-size:.875rem;transition:border-color .15s;width:100%}
  .field:focus{outline:none;border-color:rgba(245,158,11,.6)}
  .field::placeholder{color:#4b5563}
  select.field{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .6rem center;padding-right:2rem}
</style>
</head>
<body class="min-h-screen">

<!-- ── Header ── -->
<header class="sticky top-0 z-30 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-5 py-3 flex items-center gap-3">
  <div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-black text-sm shrink-0">U</div>
  <div class="leading-none">
    <p class="font-bold text-sm">UM-Arex</p>
    <p class="text-gray-500 text-xs mt-0.5">Admin Panel</p>
  </div>
  <span id="productCount" class="text-xs text-gray-600 ml-1 hidden sm:block"></span>
  <div class="ml-auto flex items-center gap-2">
    <div id="buildBadge" class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-400 select-none">
      <span id="buildDot" class="w-2 h-2 rounded-full bg-gray-600"></span>
      <span id="buildText">Idle</span>
    </div>
    <button onclick="triggerBuild()" class="text-xs bg-amber-500 hover:bg-amber-400 text-black font-bold px-3 py-1.5 rounded-lg transition-colors">🔨 Build</button>
    <button onclick="openAddModal()" class="text-xs bg-white hover:bg-gray-100 text-black font-bold px-3 py-1.5 rounded-lg transition-colors">+ Add Product</button>
  </div>
</header>

<!-- ── Filters ── -->
<div class="px-5 py-3 flex items-center gap-3 border-b border-gray-800/60">
  <input id="searchInput" type="search" placeholder="Search…"
    class="bg-gray-900 text-white placeholder-gray-600 px-3 py-1.5 rounded-lg text-sm border border-gray-800 focus:outline-none focus:border-amber-500/70 w-44"
    oninput="renderProducts()"/>
  <select id="catFilter" class="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm border border-gray-800 focus:outline-none focus:border-amber-500/70 pr-8 appearance-none" onchange="renderProducts()">
    <option value="">All Categories</option>
  </select>
  <span id="filteredCount" class="text-xs text-gray-600 ml-auto"></span>
</div>

<!-- ── Grid ── -->
<div class="p-5">
  <div id="grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"></div>
  <p id="emptyMsg" class="hidden text-center py-24 text-gray-600 text-sm">No products found.</p>
</div>

<!-- ── Build panel ── -->
<div id="buildPanel" class="build-panel fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-20 translate-y-full">
  <div class="flex items-center justify-between px-4 py-2 border-b border-gray-800">
    <span class="text-xs font-semibold text-gray-500 uppercase tracking-widest">Build Output</span>
    <button onclick="closeBuildPanel()" class="text-gray-600 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-gray-800">✕ hide</button>
  </div>
  <div id="buildLog" class="h-52 overflow-y-auto p-3 space-y-px"></div>
</div>

<!-- ── Add / Edit Modal ── -->
<div id="modal" class="hidden fixed inset-0 bg-black/75 modal-overlay z-50 flex items-center justify-center p-4" onclick="handleBdrop(event)">
  <div class="slide-in bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-gray-700 shadow-2xl">
    <div class="p-5">

      <div class="flex items-center justify-between mb-5">
        <h2 id="modalTitle" class="text-lg font-bold">Add New Product</h2>
        <button onclick="closeModal()" class="text-gray-600 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-800 text-xl leading-none">×</button>
      </div>

      <form id="productForm" novalidate class="space-y-4">

        <!-- Name + ID -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Product Name <span class="text-red-400">*</span></label>
            <input id="f_name" type="text" required placeholder="e.g. Rolex Daytona" class="field" oninput="autoId()"/>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">ID <span class="text-gray-600 font-normal">(auto)</span></label>
            <input id="f_id" type="text" required placeholder="rolex-daytona" class="field font-mono text-xs"/>
          </div>
        </div>

        <!-- Category + Price + Old Price -->
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Category <span class="text-red-400">*</span></label>
            <select id="f_cat_sel" class="field" onchange="onCatChange()">
              <option value="">Select…</option>
            </select>
            <input id="f_cat_new" type="text" placeholder="New category name" class="field mt-2 hidden"/>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Price (Rs) <span class="text-red-400">*</span></label>
            <input id="f_price" type="number" min="1" required placeholder="3500" class="field"/>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Old Price <span class="text-gray-600">(optional)</span></label>
            <input id="f_oldPrice" type="number" min="1" placeholder="5000" class="field"/>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs text-gray-400 mb-1">Description <span class="text-red-400">*</span></label>
          <textarea id="f_description" required rows="2" placeholder="Premium edition with leather strap." class="field resize-none"></textarea>
        </div>

        <!-- Main Image -->
        <div>
          <label class="block text-xs text-gray-400 mb-2">Main Image <span class="text-red-400">*</span></label>
          <div class="flex gap-3 items-center">
            <div class="relative w-20 h-20 rounded-xl bg-gray-800 border border-gray-700 overflow-hidden shrink-0">
              <img id="mainImgPrev" src="" alt="" class="w-full h-full object-cover hidden"/>
              <div id="mainImgIcon" class="absolute inset-0 flex items-center justify-center text-gray-600 text-3xl">📷</div>
            </div>
            <div class="flex-1 min-w-0">
              <input type="file" id="mainImgFile" accept="image/*" class="hidden" onchange="pickMain(this)"/>
              <button type="button" onclick="document.getElementById('mainImgFile').click()"
                class="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                <span id="mainImgBtnTxt">📁 Pick from computer</span>
              </button>
              <p id="mainImgHint" class="text-xs text-gray-600 mt-1.5 truncate">No image selected</p>
              <input type="hidden" id="f_image"/>
            </div>
          </div>
        </div>

        <!-- Gallery -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs text-gray-400">Gallery Images</label>
            <button type="button" onclick="addGalleryRow()" class="text-xs text-amber-500 hover:text-amber-400 transition-colors">+ add image</button>
          </div>
          <div id="galleryWrap" class="space-y-2"></div>
        </div>

        <!-- Flags -->
        <div class="flex flex-wrap gap-5 pt-1">
          <label class="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-300">
            <input id="f_isNew" type="checkbox" class="w-4 h-4 accent-amber-500 cursor-pointer"/>New Arrival
          </label>
          <label class="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-300">
            <input id="f_isBestSeller" type="checkbox" class="w-4 h-4 accent-amber-500 cursor-pointer"/>Best Seller
          </label>
          <label class="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-300">
            <input id="f_isFeatured" type="checkbox" class="w-4 h-4 accent-amber-500 cursor-pointer"/>Featured
          </label>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3 pt-4 border-t border-gray-800">
          <button type="button" onclick="closeModal()" class="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">Cancel</button>
          <button type="submit" id="submitBtn" class="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black py-2.5 rounded-xl text-sm font-bold transition-colors">Add Product</button>
        </div>

      </form>
    </div>
  </div>
</div>

<!-- ── Delete modal ── -->
<div id="delModal" class="hidden fixed inset-0 bg-black/75 modal-overlay z-50 flex items-center justify-center p-4">
  <div class="slide-in bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-700 shadow-2xl text-center">
    <div class="text-4xl mb-3">🗑️</div>
    <h3 class="text-base font-bold mb-1">Delete Product?</h3>
    <p id="delName" class="text-gray-400 text-sm mb-6"></p>
    <div class="flex gap-3">
      <button onclick="closeDelModal()" class="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
      <button onclick="confirmDelete()" class="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">Delete</button>
    </div>
  </div>
</div>

<!-- ── Toast ── -->
<div id="toast" class="hidden fixed bottom-4 right-4 z-[60] text-sm px-4 py-3 rounded-xl shadow-xl border max-w-xs"></div>

<script>
// ── State ─────────────────────────────────────────────────────────────────────
let products   = [];
let editingId  = null;
let deletingId = null;

// ── Boot ──────────────────────────────────────────────────────────────────────
async function init() {
  await loadProducts();
  connectStream();
}

// ── Products ──────────────────────────────────────────────────────────────────
async function loadProducts() {
  try {
    const r = await fetch('/api/products');
    if (!r.ok) throw new Error('Server error ' + r.status);
    products = await r.json();
    renderProducts();
    syncCatUI();
    document.getElementById('productCount').textContent = products.length + ' products';
  } catch(e) {
    showToast('❌ Could not load products: ' + e.message, true);
  }
}

function syncCatUI() {
  const cats = [...new Set(products.map(p => p.category))].sort();

  // filter bar dropdown
  const saved = document.getElementById('catFilter').value;
  document.getElementById('catFilter').innerHTML =
    '<option value="">All Categories</option>' +
    cats.map(c => \`<option value="\${esc(c)}" \${saved===c?'selected':''}>\${esc(c)}</option>\`).join('');

  // modal select
  const mSaved = document.getElementById('f_cat_sel').value;
  document.getElementById('f_cat_sel').innerHTML =
    '<option value="">Select…</option>' +
    cats.map(c => \`<option value="\${esc(c)}">\${esc(c)}</option>\`).join('') +
    '<option value="__new__">＋ New category…</option>';
  if (mSaved) document.getElementById('f_cat_sel').value = mSaved;
}

function renderProducts() {
  const q   = document.getElementById('searchInput').value.toLowerCase();
  const cat = document.getElementById('catFilter').value;
  const list = products.filter(p =>
    (!q   || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) &&
    (!cat || p.category === cat)
  );
  document.getElementById('filteredCount').textContent =
    list.length !== products.length ? list.length + ' shown' : '';

  const grid  = document.getElementById('grid');
  const empty = document.getElementById('emptyMsg');
  if (!list.length) { grid.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');

  grid.innerHTML = list.map(p => \`
    <div class="card bg-gray-900 rounded-xl overflow-hidden border border-gray-800/60 hover:border-gray-600/80">
      <div class="relative aspect-square bg-gray-800 overflow-hidden">
        <img src="\${esc(p.image)}" alt="" loading="lazy" class="w-full h-full object-cover"
          onerror="this.style.display='none'"/>
        \${p.isFeatured   ? '<span class="absolute top-2 left-2 bg-amber-500 text-black text-xs px-1.5 py-0.5 rounded font-bold">Featured</span>' : ''}
        \${p.isNew        ? '<span class="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded font-bold">New</span>' : ''}
        \${p.isBestSeller ? '<span class="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded font-bold">Best</span>' : ''}
      </div>
      <div class="p-3">
        <p class="text-xs text-gray-500 mb-0.5">\${esc(p.category)}</p>
        <p class="text-sm font-semibold leading-snug mb-2 line-clamp-2">\${esc(p.name)}</p>
        <div class="flex items-baseline gap-2 mb-3">
          <span class="text-amber-400 font-bold text-sm">Rs \${p.price.toLocaleString()}</span>
          \${p.oldPrice ? \`<span class="text-gray-600 text-xs line-through">Rs \${p.oldPrice.toLocaleString()}</span>\` : ''}
        </div>
        <div class="flex gap-1.5">
          <button onclick="openEditModal('\${esc(p.id)}')"
            class="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-xs py-1.5 rounded-lg transition-colors">✏️ Edit</button>
          <button onclick="openDelModal('\${esc(p.id)}')"
            class="flex-1 bg-red-950/60 hover:bg-red-900/60 text-red-400 hover:text-red-300 text-xs py-1.5 rounded-lg transition-colors">🗑</button>
        </div>
      </div>
    </div>\`).join('');
}

// ── Category dropdown ──────────────────────────────────────────────────────────
function onCatChange() {
  const sel = document.getElementById('f_cat_sel').value;
  const inp = document.getElementById('f_cat_new');
  if (sel === '__new__') {
    inp.classList.remove('hidden');
    inp.required = true;
    inp.focus();
  } else {
    inp.classList.add('hidden');
    inp.required = false;
    inp.value = '';
  }
}

function getCat() {
  const sel = document.getElementById('f_cat_sel').value;
  if (sel === '__new__') return document.getElementById('f_cat_new').value.trim();
  return sel;
}

function setCat(value) {
  const sel = document.getElementById('f_cat_sel');
  // Try to find in existing options
  for (let i = 0; i < sel.options.length; i++) {
    if (sel.options[i].value === value) { sel.value = value; return; }
  }
  // Not found — add a temporary option and select it
  const opt = document.createElement('option');
  opt.value = value; opt.textContent = value;
  sel.insertBefore(opt, sel.options[sel.options.length - 1]); // before "＋ New"
  sel.value = value;
  document.getElementById('f_cat_new').classList.add('hidden');
  document.getElementById('f_cat_new').required = false;
}

// ── Image upload ───────────────────────────────────────────────────────────────
async function uploadFile(file) {
  const folder = (document.getElementById('f_id').value.trim() || 'uploads')
    .replace(/[^a-z0-9_-]/gi, '-').replace(/^-+|-+$/g, '') || 'uploads';

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64 = e.target.result.split(',')[1];
        const resp = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, data: base64, folder }),
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error || 'Upload failed');
        }
        const { path: imgPath } = await resp.json();
        resolve(imgPath);
      } catch(err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

async function pickMain(input) {
  const file = input.files[0];
  if (!file) return;
  document.getElementById('mainImgBtnTxt').textContent = '⏳ Uploading…';
  try {
    const imgPath = await uploadFile(file);
    document.getElementById('f_image').value = imgPath;
    const prev = document.getElementById('mainImgPrev');
    prev.src = imgPath;
    prev.classList.remove('hidden');
    document.getElementById('mainImgIcon').classList.add('hidden');
    document.getElementById('mainImgHint').textContent = file.name + ' ✓';
    document.getElementById('mainImgBtnTxt').textContent = '📁 Change image';
  } catch(err) {
    showToast('❌ Upload failed: ' + err.message, true);
    document.getElementById('mainImgBtnTxt').textContent = '📁 Pick from computer';
  }
}

async function pickGallery(input) {
  const file = input.files[0];
  if (!file) return;
  const row = input.closest('.gRow');
  row.querySelector('.gBtnTxt').textContent = '⏳ Uploading…';
  try {
    const imgPath = await uploadFile(file);
    row.querySelector('.gField').value = imgPath;
    const prev = row.querySelector('.gPrev');
    prev.src = imgPath;
    prev.classList.remove('hidden');
    row.querySelector('.gIcon').classList.add('hidden');
    row.querySelector('.gBtnTxt').textContent = '📁 Change';
  } catch(err) {
    showToast('❌ Upload failed: ' + err.message, true);
    row.querySelector('.gBtnTxt').textContent = '📁 Pick image';
  }
}

// ── Gallery ────────────────────────────────────────────────────────────────────
function addGalleryRow(existingPath) {
  const wrap = document.getElementById('galleryWrap');
  const div  = document.createElement('div');
  div.className = 'gRow flex gap-2 items-center';
  const has = !!existingPath;
  div.innerHTML = \`
    <div class="relative w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden shrink-0 flex items-center justify-center">
      <img class="gPrev w-full h-full object-cover \${has ? '' : 'hidden'}" src="\${has ? esc(existingPath) : ''}"/>
      <span class="gIcon text-gray-600 text-xs \${has ? 'hidden' : ''}">📷</span>
    </div>
    <input type="file" class="hidden" accept="image/*" onchange="pickGallery(this)"/>
    <button type="button" class="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-xs py-2 px-3 rounded-lg transition-colors"
      onclick="this.previousElementSibling.click()">
      <span class="gBtnTxt">📁 \${has ? 'Change' : 'Pick image'}</span>
    </button>
    <input type="hidden" class="gField" value="\${has ? esc(existingPath) : ''}"/>
    <button type="button" onclick="this.closest('.gRow').remove()"
      class="w-8 h-8 rounded-lg bg-gray-800 hover:bg-red-900/50 text-gray-500 hover:text-red-400 text-sm flex items-center justify-center shrink-0 transition-colors">✕</button>\`;
  wrap.appendChild(div);
}

function getGallery() {
  return [...document.querySelectorAll('.gField')]
    .map(i => i.value.trim()).filter(Boolean);
}
function clearGallery() { document.getElementById('galleryWrap').innerHTML = ''; }

// ── ID auto-gen ────────────────────────────────────────────────────────────────
function autoId() {
  if (editingId) return;
  document.getElementById('f_id').value = document.getElementById('f_name').value
    .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

// ── Reset form ─────────────────────────────────────────────────────────────────
function resetForm() {
  document.getElementById('productForm').reset();
  document.getElementById('f_image').value = '';
  document.getElementById('mainImgPrev').src = '';
  document.getElementById('mainImgPrev').classList.add('hidden');
  document.getElementById('mainImgIcon').classList.remove('hidden');
  document.getElementById('mainImgHint').textContent = 'No image selected';
  document.getElementById('mainImgBtnTxt').textContent = '📁 Pick from computer';
  document.getElementById('mainImgFile').value = '';
  document.getElementById('f_cat_new').classList.add('hidden');
  document.getElementById('f_cat_new').required = false;
  clearGallery();
}

// ── Add modal ──────────────────────────────────────────────────────────────────
function openAddModal() {
  editingId = null;
  resetForm();
  syncCatUI();
  document.getElementById('modalTitle').textContent = 'Add New Product';
  document.getElementById('submitBtn').textContent  = 'Add Product';
  addGalleryRow();
  document.getElementById('modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('f_name').focus(), 60);
}

// ── Edit modal ─────────────────────────────────────────────────────────────────
function openEditModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  editingId = id;

  resetForm();
  syncCatUI();

  document.getElementById('modalTitle').textContent = 'Edit Product';
  document.getElementById('submitBtn').textContent  = 'Save Changes';

  document.getElementById('f_name').value        = p.name;
  document.getElementById('f_id').value          = p.id;
  document.getElementById('f_price').value       = p.price;
  document.getElementById('f_oldPrice').value    = p.oldPrice || '';
  document.getElementById('f_description').value = p.description;
  document.getElementById('f_isNew').checked         = !!p.isNew;
  document.getElementById('f_isBestSeller').checked  = !!p.isBestSeller;
  document.getElementById('f_isFeatured').checked    = !!p.isFeatured;

  setCat(p.category);

  // Main image
  if (p.image) {
    document.getElementById('f_image').value = p.image;
    const prev = document.getElementById('mainImgPrev');
    prev.src = p.image;
    prev.classList.remove('hidden');
    document.getElementById('mainImgIcon').classList.add('hidden');
    document.getElementById('mainImgHint').textContent = 'Current image';
    document.getElementById('mainImgBtnTxt').textContent = '📁 Change image';
  }

  // Gallery
  (p.gallery || []).forEach(g => addGalleryRow(g));
  if (!(p.gallery || []).length) addGalleryRow();

  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  editingId = null;
}
function handleBdrop(e) {
  if (e.target === document.getElementById('modal')) closeModal();
}

// ── Delete ─────────────────────────────────────────────────────────────────────
function openDelModal(id) {
  deletingId = id;
  const p = products.find(x => x.id === id);
  document.getElementById('delName').textContent =
    \`"\${p ? p.name : id}" will be permanently removed.\`;
  document.getElementById('delModal').classList.remove('hidden');
}
function closeDelModal() {
  document.getElementById('delModal').classList.add('hidden');
  deletingId = null;
}
async function confirmDelete() {
  if (!deletingId) return;
  try {
    const r = await fetch('/api/products/' + encodeURIComponent(deletingId), { method: 'DELETE' });
    if (!r.ok) throw new Error('Delete failed (' + r.status + ')');
    closeDelModal();
    await loadProducts();
    showToast('🗑️ Deleted — rebuilding site…');
    openBuildPanel(); triggerBuild();
  } catch(e) { showToast('❌ ' + e.message, true); }
}

// ── Form submit ────────────────────────────────────────────────────────────────
document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn  = document.getElementById('submitBtn');
  btn.disabled = true;
  const prev = btn.textContent;
  btn.textContent = 'Saving…';

  const name  = document.getElementById('f_name').value.trim();
  const id    = document.getElementById('f_id').value.trim();
  const cat   = getCat();
  const price = Number(document.getElementById('f_price').value);
  const desc  = document.getElementById('f_description').value.trim();
  const image = document.getElementById('f_image').value.trim();

  if (!name || !id || !cat || !price || !desc || !image) {
    showToast('❌ Fill in all required fields (including main image)', true);
    btn.disabled = false; btn.textContent = prev; return;
  }
  if (!editingId && products.some(p => p.id === id)) {
    showToast('❌ ID already exists — edit the ID field', true);
    btn.disabled = false; btn.textContent = prev; return;
  }

  const product = { id, name, category: cat, price, description: desc, image, gallery: getGallery() };
  const op = Number(document.getElementById('f_oldPrice').value);
  if (op) product.oldPrice = op;
  if (document.getElementById('f_isNew').checked)        product.isNew = true;
  if (document.getElementById('f_isBestSeller').checked) product.isBestSeller = true;
  if (document.getElementById('f_isFeatured').checked)   product.isFeatured = true;

  try {
    const url    = editingId
      ? '/api/products/' + encodeURIComponent(editingId)
      : '/api/products';
    const method = editingId ? 'PUT' : 'POST';
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!r.ok) {
      let msg = 'Request failed (' + r.status + ')';
      try { msg = (await r.json()).error || msg; } catch {}
      throw new Error(msg);
    }
    closeModal();
    await loadProducts();
    showToast(editingId ? '✅ Product updated — building…' : '✅ Product added — building…');
    openBuildPanel(); triggerBuild();
  } catch(err) {
    showToast('❌ ' + err.message, true);
  } finally {
    btn.disabled = false; btn.textContent = prev;
  }
});

// ── Build ──────────────────────────────────────────────────────────────────────
async function triggerBuild() {
  document.getElementById('buildLog').innerHTML = '';
  try { await fetch('/api/build', { method: 'POST' }); } catch {}
}
function openBuildPanel()  { document.getElementById('buildPanel').style.transform = 'translateY(0)'; }
function closeBuildPanel() { document.getElementById('buildPanel').style.transform = 'translateY(100%)'; }

function connectStream() {
  const es = new EventSource('/api/build-stream');
  es.addEventListener('status', (e) => {
    const { status } = JSON.parse(e.data);
    const dot  = document.getElementById('buildDot');
    const text = document.getElementById('buildText');
    const bdg  = document.getElementById('buildBadge');
    const map  = {
      building: ['w-2 h-2 rounded-full animate-ping bg-yellow-400','Building…','flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-300'],
      success:  ['w-2 h-2 rounded-full bg-green-400','Ready ✓',     'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300'],
      error:    ['w-2 h-2 rounded-full bg-red-400','Failed',         'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-300'],
      idle:     ['w-2 h-2 rounded-full bg-gray-600','Idle',          'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-400'],
    };
    const [dc, tc, bc] = map[status] || map.idle;
    dot.className = dc; text.textContent = tc; bdg.className = bc;
  });
  es.addEventListener('log', (e) => {
    const { line, isError, isSuccess, isInfo } = JSON.parse(e.data);
    const el = document.getElementById('buildLog');
    const d  = document.createElement('div');
    d.className = isError ? 'text-red-400' : isSuccess ? 'text-green-400 font-semibold' : isInfo ? 'text-amber-400' : 'text-gray-400';
    d.textContent = line;
    el.appendChild(d);
    el.scrollTop = el.scrollHeight;
  });
  es.onerror = () => { es.close(); setTimeout(connectStream, 4000); };
}

// ── Toast ──────────────────────────────────────────────────────────────────────
let toastT;
function showToast(msg, isErr = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'fixed bottom-4 right-4 z-[60] text-sm px-4 py-3 rounded-xl shadow-xl border max-w-xs '
    + (isErr ? 'bg-red-950 border-red-800 text-red-200' : 'bg-gray-800 border-gray-700 text-white');
  t.classList.remove('hidden');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.add('hidden'), 4000);
}

// ── Escape HTML ────────────────────────────────────────────────────────────────
function esc(s) {
  const d = document.createElement('div');
  d.textContent = String(s ?? '');
  return d.innerHTML;
}

init();
</script>
</body>
</html>`;

// ─── HTTP Router ──────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // log every request
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${pathname}`);

  try {
    // ── Admin UI ────────────────────────────────────────────────────────────
    if (pathname === "/" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(HTML);
      return;
    }

    // ── GET /api/products ────────────────────────────────────────────────────
    if (pathname === "/api/products" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(readProducts()));
      return;
    }

    // ── POST /api/products ───────────────────────────────────────────────────
    if (pathname === "/api/products" && req.method === "POST") {
      const body = await parseBody(req);
      const products = readProducts();
      if (products.find((p) => p.id === body.id)) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "ID already exists" }));
        return;
      }
      products.push(body);
      writeProducts(products);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(body));
      return;
    }

    // ── /api/products/:id — PUT or DELETE ────────────────────────────────────
    const idM = pathname.match(/^\/api\/products\/(.+)$/);
    if (idM) {
      const id = decodeURIComponent(idM[1]);

      if (req.method === "PUT") {
        const body = await parseBody(req);
        const products = readProducts();
        const idx = products.findIndex((p) => p.id === id);
        if (idx === -1) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Product not found" }));
          return;
        }
        products[idx] = body;
        writeProducts(products);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(body));
        return;
      }

      if (req.method === "DELETE") {
        const products = readProducts();
        const next = products.filter((p) => p.id !== id);
        if (next.length === products.length) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Product not found" }));
          return;
        }
        writeProducts(next);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
        return;
      }
    }

    // ── POST /api/upload ─────────────────────────────────────────────────────
    if (pathname === "/api/upload" && req.method === "POST") {
      const { filename, data, folder } = await parseBody(req);
      const safeFolder =
        String(folder || "uploads")
          .replace(/[^a-zA-Z0-9 _-]/g, "")
          .trim() || "uploads";
      const safeFilename = String(filename || "image.jpg").replace(/\s+/g, "_");
      const dir = path.join(PUBLIC_PATH, "watches", safeFolder);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, safeFilename),
        Buffer.from(data, "base64"),
      );
      const imgPath = `/watches/${encodeURIComponent(safeFolder)}/${encodeURIComponent(safeFilename)}`;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ path: imgPath }));
      return;
    }

    // ── POST /api/build ───────────────────────────────────────────────────────
    if (pathname === "/api/build" && req.method === "POST") {
      runBuild();
      res.writeHead(202, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ started: true }));
      return;
    }

    // ── GET /api/build-stream (SSE) ───────────────────────────────────────────
    if (pathname === "/api/build-stream" && req.method === "GET") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      res.write(
        `event: status\ndata: ${JSON.stringify({ status: buildStatus })}\n\n`,
      );
      buildClients.push(res);
      req.on("close", () => {
        buildClients = buildClients.filter((c) => c !== res);
      });
      return;
    }

    // ── Static files from public/ ─────────────────────────────────────────────
    if (req.method === "GET") {
      let decoded = pathname;
      try {
        decoded = decodeURIComponent(pathname);
      } catch {}
      const filePath = path.join(PUBLIC_PATH, decoded.replace(/^\/+/, ""));
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const mime =
          MIME[path.extname(filePath).toLowerCase()] ||
          "application/octet-stream";
        res.writeHead(200, { "Content-Type": mime });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    // ── 404 ───────────────────────────────────────────────────────────────────
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  } catch (err) {
    console.error("Request error:", err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
server.listen(PORT, "127.0.0.1", () => {
  const u = `http://localhost:${PORT}`;
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║       UM-Arex Admin Panel              ║");
  console.log("╠════════════════════════════════════════╣");
  console.log(`║  URL  →  ${u}             ║`);
  console.log("║  Stop →  Ctrl + C                      ║");
  console.log("╚════════════════════════════════════════╝\n");
  exec(`start ${u}`);
});

server.on("error", (e) => {
  if (e.code === "EADDRINUSE")
    console.error(
      `\n❌  Port ${PORT} already in use — close the other process and retry.\n`,
    );
  else console.error(e);
  process.exit(1);
});
