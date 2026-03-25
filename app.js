/* ══════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════ */
const state = {
  view: 'home',           // 'home' | 'event'
  events: deepClone(DEMO_EVENTS),
  currentEventId: null,
  currentTab: 'details',  // 'details' | 'vendors' | 'chat'

  // Swipe
  swipeCategory: null,
  swipeQueue: [],

  // Chat
  activeChatId: null,
  chatFilter: '',
  chatCategoryFilter: 'all',

  // Modals
  modalOpen: null,        // null | 'new-event' | 'vendor-profile'
  vendorProfileId: null,
  vendorProfileContext: null, // 'card' | 'chat'

  // New-event form
  newEventStep: 1,
  draft: { type:'Wedding', icon:'💍', name:'', date:'', time:'', location:'Miami, FL', guests:'', budget:'' }
};

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
function uid() { return 'id-' + Math.random().toString(36).substr(2, 9); }
function fmt$(n) { return '$' + Number(n).toLocaleString(); }
function fmtDate(d) {
  if (!d) return 'TBD';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });
}
function initials(name) { return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2); }
function getEvent(id) { return state.events.find(e => e.id === id); }
function getCurrent() { return getEvent(state.currentEventId); }
function randomCode() {
  const ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = 'MIA-';
  for (let i = 0; i < 4; i++) c += ch[Math.floor(Math.random() * ch.length)];
  return c;
}
function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
function getChatStatus(event, vendorId) {
  const isConfirmed = event.confirmedVendors.some(cv => cv.vendorId === vendorId);
  if (isConfirmed) return 'confirmed';
  const opened = event.openedChats && event.openedChats.includes(vendorId);
  const msgs = (event.chats[vendorId] || []);
  if (opened || msgs.length > 0) return 'progress';
  return 'start';
}

/* ══════════════════════════════════════════════════════
   RENDER
══════════════════════════════════════════════════════ */
function render() {
  const app = document.getElementById('app');
  app.innerHTML = buildApp();
  afterRender();
}

function buildApp() {
  return `
    ${buildNavbar()}
    <div class="page-content">
      ${state.view === 'home' ? buildHome() : buildEventPage()}
    </div>
    ${state.modalOpen === 'new-event' ? buildNewEventModal() : ''}
    ${state.modalOpen === 'vendor-profile' ? buildVendorProfileModal() : ''}
  `;
}

/* ── Navbar ── */
function buildNavbar() {
  return `
    <nav class="navbar">
      <div class="logo" data-action="nav-home">event<span>swipe</span></div>
      <div class="nav-city">📍 Miami, FL</div>
      <div class="nav-spacer"></div>
      <div class="nav-user">
        <div class="avatar">S</div>
        <span class="nav-user-name">Sofia M.</span>
      </div>
    </nav>
  `;
}

/* ── Home ── */
function buildHome() {
  const events = state.events;
  return `
    <div class="home-view">
      <div class="home-header">
        <div>
          <div class="home-greeting">Good evening, <em>Sofia</em> ✦</div>
          <div class="home-sub">You have ${events.length} event${events.length !== 1 ? 's' : ''} in progress · Miami, FL</div>
        </div>
        <button class="btn btn-primary-lg" data-action="open-new-event">+ Plan New Event</button>
      </div>
      <div class="events-grid">
        ${events.length === 0 ? buildHomeEmpty() : events.map(buildEventCard).join('')}
      </div>
    </div>
  `;
}

function buildHomeEmpty() {
  return `
    <div class="home-empty">
      <div class="home-empty-icon">🎉</div>
      <div class="home-empty-title">No events yet</div>
      <div class="home-empty-sub">Start planning your first event to discover Miami's top vendors.</div>
      <button class="btn btn-primary-lg" data-action="open-new-event">+ Plan New Event</button>
    </div>
  `;
}

function buildEventCard(ev) {
  const pct = ev.budget > 0 ? Math.min(100, Math.round((ev.budgetUsed / ev.budget) * 100)) : 0;
  const confirmedCount = ev.confirmedVendors.length;
  const chatCount = ev.potentialChats.length;
  return `
    <div class="event-card" data-action="open-event" data-id="${ev.id}">
      <div class="ec-top">
        <div class="ec-icon-wrap">${ev.icon}</div>
        <div class="ec-type">${esc(ev.type)}</div>
      </div>
      <div class="ec-name">${esc(ev.name)}</div>
      <div class="ec-details">
        <div class="ec-detail"><span class="ec-detail-icon">📅</span>${fmtDate(ev.date)}</div>
        <div class="ec-detail"><span class="ec-detail-icon">📍</span>${esc(ev.location)}</div>
        <div class="ec-detail"><span class="ec-detail-icon">👥</span>${ev.guests || '—'} guests</div>
        <div class="ec-detail"><span class="ec-detail-icon">💰</span>${ev.budget ? fmt$(ev.budget) + ' budget' : 'No budget set'}</div>
      </div>
      <div class="ec-footer">
        <div class="ec-budget">${confirmedCount} vendor${confirmedCount !== 1 ? 's' : ''} confirmed</div>
        <div class="ec-vendor-count">${chatCount} chat${chatCount !== 1 ? 's' : ''}</div>
      </div>
      ${ev.budget > 0 ? `<div class="ec-progress-mini"><div class="ec-progress-fill" style="width:${pct}%;background:${pct>80?'#ef4444':pct>60?'#f59e0b':'#f0845a'}"></div></div>` : ''}
    </div>
  `;
}

/* ── Event Page ── */
function buildEventPage() {
  const ev = getCurrent();
  if (!ev) return '<div style="padding:40px;color:rgba(255,255,255,0.4);">Event not found.</div>';
  return `
    <div class="event-view">
      ${buildEventHeader(ev)}
      <div class="tab-content" id="tab-content">
        ${buildTabContent(ev)}
      </div>
    </div>
  `;
}

function buildEventHeader(ev) {
  const chatUnread = ev.potentialChats.filter(vid => !ev.openedChats.includes(vid)).length;
  return `
    <div class="event-page-header">
      <div class="eph-top">
        <div class="back-btn" data-action="nav-home" title="Back to home">←</div>
        <div class="eph-event-icon">${ev.icon}</div>
        <div class="eph-info">
          <div class="eph-name">${esc(ev.name)}</div>
          <div class="eph-meta">
            <span>📅 ${fmtDate(ev.date)}</span>
            <span>📍 ${esc(ev.location)}</span>
            <span>👥 ${ev.guests || '—'} guests</span>
            ${ev.budget ? `<span>💰 ${fmt$(ev.budget)}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="event-tabs">
        <button class="tab-btn ${state.currentTab === 'details' ? 'active' : ''}" data-action="switch-tab" data-tab="details">
          📋 Event Details
        </button>
        <button class="tab-btn ${state.currentTab === 'vendors' ? 'active' : ''}" data-action="switch-tab" data-tab="vendors">
          👆 Find Vendors
        </button>
        <button class="tab-btn ${state.currentTab === 'chat' ? 'active' : ''}" data-action="switch-tab" data-tab="chat">
          💬 Chat with Vendors
          ${chatUnread > 0 ? `<span class="tab-badge">${chatUnread}</span>` : ''}
        </button>
      </div>
    </div>
  `;
}

function buildTabContent(ev) {
  if (state.currentTab === 'details') return buildDetailsTab(ev);
  if (state.currentTab === 'vendors') return buildVendorsTab(ev);
  if (state.currentTab === 'chat') return buildChatTab(ev);
  return '';
}

/* ── Details Tab ── */
function buildDetailsTab(ev) {
  const pct = ev.budget > 0 ? Math.min(100, Math.round((ev.budgetUsed / ev.budget) * 100)) : 0;
  const remaining = (ev.budget || 0) - (ev.budgetUsed || 0);
  const barColor = pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#f0845a';

  return `
    <div class="details-layout">
      <div class="details-left">

        <!-- Budget Widget -->
        <div class="widget">
          <div class="widget-title">Budget Tracker</div>
          <div class="budget-header">
            <div>
              <div class="budget-total-label">Total Budget</div>
              <div class="budget-total">${ev.budget ? fmt$(ev.budget) : 'Not set'}</div>
            </div>
            ${ev.budget ? `
            <div class="budget-remaining">
              <div class="budget-remaining-label">Remaining</div>
              <div class="budget-remaining-val" style="color:${remaining < 0 ? '#ef4444' : '#22c55e'}">${fmt$(Math.max(0, remaining))}</div>
            </div>` : ''}
          </div>
          ${ev.budget ? `
          <div class="budget-track">
            <div class="budget-fill" style="width:${pct}%;background:${barColor}"></div>
          </div>
          <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-bottom:10px;">${pct}% committed · ${fmt$(ev.budgetUsed || 0)} of ${fmt$(ev.budget)}</div>
          ` : ''}
          <div class="budget-breakdown">
            ${ev.confirmedVendors.length === 0
              ? `<div class="empty-state"><div class="empty-state-icon">💸</div><div class="empty-state-text">No vendors confirmed yet</div></div>`
              : ev.confirmedVendors.map(cv => {
                  const v = getVendorById(cv.vendorId);
                  return v ? `
                    <div class="budget-line">
                      <span class="budget-line-label"><span class="budget-line-dot"></span>${esc(v.name)}</span>
                      <span class="budget-line-amount">+${fmt$(cv.cost)}</span>
                    </div>` : '';
                }).join('') +
                `<div class="budget-line budget-total-line">
                  <span style="color:rgba(255,255,255,0.5);font-size:12px;">Total committed</span>
                  <span style="color:var(--accent);font-weight:600;">${fmt$(ev.budgetUsed || 0)}</span>
                </div>`
            }
          </div>
        </div>

        <!-- Confirmed Vendors -->
        <div class="widget">
          <div class="widget-title">Confirmed Vendors</div>
          ${ev.confirmedVendors.length === 0
            ? `<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">No vendors confirmed yet.<br>Head to Find Vendors to get started.</div></div>`
            : `<div class="confirmed-list">
                ${ev.confirmedVendors.map(cv => {
                  const v = getVendorById(cv.vendorId);
                  if (!v) return '';
                  return `
                    <div class="confirmed-item">
                      <div class="confirmed-emoji">${v.emoji}</div>
                      <div class="confirmed-info">
                        <div class="confirmed-name">${esc(v.name)}</div>
                        <div class="confirmed-cat">${esc(v.category)}</div>
                      </div>
                      <div class="confirmed-cost">${fmt$(cv.cost)}</div>
                      <div class="confirmed-check">✓</div>
                    </div>`;
                }).join('')}
              </div>`
          }
        </div>

        <!-- Invite -->
        <div class="widget">
          <div class="widget-title">Invite to Workspace</div>
          <div class="invite-box">
            <div style="font-size:12px;color:rgba(255,255,255,0.35);margin-bottom:4px;">Share this code to collaborate</div>
            <div class="invite-code" id="invite-code-display">${ev.inviteCode}</div>
            <div class="invite-hint">Anyone with this code can view your event board</div>
            <div style="display:flex;gap:10px;margin-top:12px;">
              <button class="btn btn-secondary btn-sm" data-action="copy-invite" style="flex:1">📋 Copy Link</button>
              <button class="btn btn-secondary btn-sm" data-action="new-invite-code" style="flex:1">🔄 New Code</button>
            </div>
          </div>
        </div>

      </div>
      <div class="details-right">

        <!-- Vision Board -->
        <div class="widget">
          <div class="widget-title">Vision Board</div>
          <div style="margin-bottom:10px;font-size:12px;color:rgba(255,255,255,0.3);">Add images to build your event mood board</div>
          <div class="vision-grid">
            ${[0,1,2,3,4,5].map(i => `
              <div class="vision-cell" title="Add image">
                <div class="add-icon">+</div>
                <div>Add photo</div>
              </div>`).join('')}
          </div>
        </div>

        <!-- Core Planners -->
        <div class="widget">
          <div class="widget-title">Core Planners</div>
          <div class="planners-row">
            ${ev.planners.map(p => `
              <div class="planner-chip">
                <div class="avatar-sm">${initials(p)}</div>
                ${esc(p)}
              </div>`).join('')}
            <button class="btn btn-secondary btn-sm" data-action="invite-planner">+ Invite Planner</button>
          </div>
        </div>

      </div>
    </div>
  `;
}

/* ── Find Vendors Tab ── */
function buildVendorsTab(ev) {
  const cat = state.swipeCategory;
  const isLocked = cat && ev.lockedCategories.includes(cat);

  return `
    <div class="vendors-tab">
      <div class="vendor-type-bar">
        <label for="vendor-cat-select">Vendor Type:</label>
        <select class="vendor-category-select" id="vendor-cat-select">
          <option value="">— Select a category —</option>
          ${VENDOR_CATEGORIES.map(c => `
            <option value="${c.key}" ${cat === c.key ? 'selected' : ''}>${c.emoji} ${c.label}</option>
          `).join('')}
        </select>
        ${isLocked ? `
          <div class="vendor-locked-notice">
            ✓ ${esc(cat)} vendor confirmed — category locked
          </div>` : ''}
        ${cat && !isLocked ? `
          <div style="font-size:12px;color:rgba(255,255,255,0.35);margin-left:8px;">
            ${state.swipeQueue.length} vendor${state.swipeQueue.length !== 1 ? 's' : ''} remaining
          </div>` : ''}
      </div>

      ${!cat ? buildSwipePlaceholder() : isLocked ? buildSwipeLocked(ev, cat) : buildSwipeInterface(ev)}
    </div>
  `;
}

function buildSwipePlaceholder() {
  return `
    <div class="swipe-layout" style="justify-content:center;align-items:center;min-height:400px;">
      <div class="swipe-placeholder">
        <div class="swipe-placeholder-icon">👆</div>
        <div style="font-size:16px;color:rgba(255,255,255,0.4);">Select a vendor category above</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.25);">to start swiping through Miami's top vendors</div>
      </div>
    </div>
  `;
}

function buildSwipeLocked(ev, cat) {
  const confirmedVendor = ev.confirmedVendors.find(cv => cv.category === cat);
  const v = confirmedVendor ? getVendorById(confirmedVendor.vendorId) : null;
  return `
    <div class="swipe-layout" style="justify-content:center;align-items:center;min-height:400px;">
      <div style="text-align:center;padding:48px;max-width:400px;">
        <div style="font-size:56px;margin-bottom:16px;">${v ? v.emoji : '✓'}</div>
        <div style="font-family:'Playfair Display',serif;font-size:22px;color:#fff;margin-bottom:8px;">
          ${v ? esc(v.name) : 'Vendor confirmed'}
        </div>
        <div style="font-size:14px;color:rgba(255,255,255,0.45);margin-bottom:20px;">
          You've already confirmed a ${esc(cat)} vendor for this event. Only one vendor per category is allowed.
        </div>
        ${v ? `<div style="background:#13182a;border:1px solid #2a2e3a;border-radius:14px;padding:16px;margin-bottom:20px;">
          <div style="font-size:12px;color:rgba(255,255,255,0.35);margin-bottom:4px;">${esc(cat)} · ${esc(v.location)}</div>
          <div style="font-size:15px;color:#f0845a;font-weight:600;">${fmt$(confirmedVendor.cost)}</div>
        </div>` : ''}
        <button class="btn btn-secondary" data-action="switch-tab" data-tab="chat">View in Chat →</button>
      </div>
    </div>
  `;
}

function buildSwipeInterface(ev) {
  const queue = state.swipeQueue;
  const topVendor = queue[0] || null;

  const cardArea = queue.length === 0
    ? `<div class="swipe-empty">
        <div class="swipe-empty-icon">✓</div>
        <div class="swipe-empty-title">All vendors reviewed!</div>
        <div class="swipe-empty-sub">Change category to see more</div>
       </div>`
    : `<div class="swipe-stack-wrap" id="swipe-stack">
        ${buildSwipeCards(queue)}
       </div>`;

  return `
    <div class="swipe-layout">
      <div class="swipe-col-left">
        ${cardArea}
        ${queue.length > 0 ? `
        <div class="swipe-actions">
          <button class="swipe-btn swipe-btn-nope" data-action="swipe-left" title="Pass">✕</button>
          <button class="swipe-btn swipe-btn-like" data-action="swipe-right" title="Save to chats">♥</button>
          <button class="swipe-btn swipe-btn-info" data-action="open-vendor-profile" data-vendor-id="${topVendor ? topVendor.id : ''}" title="View profile">i</button>
        </div>
        <div class="swipe-progress">${topVendor ? `Viewing ${(VENDOR_DATA[state.swipeCategory] || []).length - queue.length + 1} of ${(VENDOR_DATA[state.swipeCategory] || []).length}` : ''}</div>
        ` : ''}
      </div>

      ${topVendor ? `
      <div class="swipe-col-right">
        <div class="vendor-info-panel">
          <div class="vip-title">Current Vendor</div>
          <div class="vip-name">${esc(topVendor.name)}</div>
          <div class="vip-cat">${esc(topVendor.category)} · ${esc(topVendor.location)}</div>

          <div class="vip-section">
            <div class="vip-section-label">Services</div>
            <div class="vip-services">
              ${topVendor.services.map(s => `<span class="vip-service-tag">${esc(s)}</span>`).join('')}
            </div>
          </div>

          <div class="vip-section">
            <div class="vip-section-label">Price Range</div>
            <div class="vip-price">${esc(topVendor.price)}</div>
          </div>

          <div class="vip-section">
            <div class="vip-section-label">Reviews</div>
            <div class="vip-review">${esc(topVendor.review)}</div>
          </div>

          <div style="margin-top:20px;">
            <button class="btn btn-primary" style="width:100%;margin-bottom:8px;" data-action="confirm-vendor" data-vendor-id="${topVendor.id}">✓ Confirm Vendor for Event</button>
            <button class="btn btn-secondary" style="width:100%;" data-action="open-vendor-profile" data-vendor-id="${topVendor.id}">View Full Profile</button>
          </div>

          <div class="vip-hint">Swipe ♥ to save as a potential chat.<br>Use "Confirm" to lock this vendor for your event.</div>
        </div>
      </div>` : ''}
    </div>
  `;
}

function buildSwipeCards(queue) {
  const count = Math.min(3, queue.length);
  let html = '';
  for (let i = count - 1; i >= 0; i--) {
    const v = queue[i];
    const bg = CARD_BG[v.emoji] || '#13182a';
    const z = count - i;
    const transform = i === 1 ? 'transform:scale(0.95) translateY(12px);opacity:0.7;'
                    : i === 2 ? 'transform:scale(0.90) translateY(24px);opacity:0.4;'
                    : '';
    html += `
      <div class="vendor-swipe-card" style="z-index:${z};${transform}" id="${i === 0 ? 'top-card' : ''}">
        <div class="vendor-img-bg" style="background:${bg}">${v.emoji}</div>
        <div class="vendor-card-bg"></div>
        <div class="card-like-badge" id="${i === 0 ? 'like-badge' : ''}">LIKE</div>
        <div class="card-nope-badge" id="${i === 0 ? 'nope-badge' : ''}">NOPE</div>
        <div class="vendor-card-info">
          <div class="vci-name">${esc(v.name)}</div>
          <div class="vci-cat">${esc(v.category)} · ${esc(v.location)}</div>
          <div class="vci-tags">
            ${v.services.slice(0, 3).map(s => `<span class="vci-tag">${esc(s)}</span>`).join('')}
          </div>
          <div class="vci-meta">
            <span class="vci-price">${esc(v.price)}</span>
            <span class="vci-review">${esc(v.review.split('"')[1] ? '★ ' + v.review.split('★')[1] : '')}</span>
          </div>
          ${i === 0 ? `<div class="vci-confirm-btn" data-action="confirm-vendor" data-vendor-id="${v.id}">✓ Confirm Vendor for Event</div>` : ''}
        </div>
      </div>`;
  }
  return html;
}

/* ── Chat Tab ── */
function buildChatTab(ev) {
  const allChats = ev.potentialChats.map(vid => getVendorById(vid)).filter(Boolean);
  const filtered = allChats.filter(v => {
    const nameMatch = v.name.toLowerCase().includes(state.chatFilter.toLowerCase());
    const catMatch = state.chatCategoryFilter === 'all' || v.category === state.chatCategoryFilter;
    return nameMatch && catMatch;
  });

  return `
    <div class="chat-layout" style="height:calc(100vh - 64px - 138px);">
      <div class="chat-sidebar">
        <div class="chat-sidebar-header">
          <input class="chat-search-input" id="chat-search" placeholder="Search vendors..." value="${esc(state.chatFilter)}" />
          <select class="chat-filter-select" id="chat-cat-filter">
            <option value="all" ${state.chatCategoryFilter === 'all' ? 'selected' : ''}>All Categories</option>
            ${VENDOR_CATEGORIES.map(c => `
              <option value="${c.key}" ${state.chatCategoryFilter === c.key ? 'selected' : ''}>${c.emoji} ${c.label}</option>`).join('')}
          </select>
        </div>

        <div class="chat-list">
          ${filtered.length === 0
            ? `<div class="chat-sidebar-empty">
                <div class="chat-sidebar-empty-icon">💬</div>
                <div style="font-size:13px;color:rgba(255,255,255,0.35);">${allChats.length === 0 ? 'Swipe right on vendors to start chatting' : 'No results'}</div>
               </div>`
            : filtered.map(v => buildChatListItem(ev, v)).join('')}
        </div>
      </div>

      <div class="chat-main">
        ${state.activeChatId ? buildChatThread(ev) : buildChatEmptyMain()}
      </div>
    </div>
  `;
}

function buildChatListItem(ev, v) {
  const status = getChatStatus(ev, v.id);
  const msgs = ev.chats[v.id] || [];
  const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].text : null;
  const isActive = state.activeChatId === v.id;

  const statusBadge = status === 'confirmed'
    ? `<span class="chat-status status-confirmed">✓ Confirmed</span>`
    : status === 'progress'
    ? `<span class="chat-status status-progress">● In Progress</span>`
    : `<span class="chat-status status-start">● Start Chat</span>`;

  return `
    <div class="chat-list-item ${isActive ? 'active' : ''}" data-action="open-chat" data-vendor-id="${v.id}">
      <div class="chat-item-avatar">${v.emoji}</div>
      <div class="chat-item-info">
        <div class="chat-item-name">${esc(v.name)}</div>
        <div class="chat-item-cat">${esc(v.category)}</div>
        ${lastMsg ? `<div class="chat-item-preview">${esc(lastMsg)}</div>` : ''}
      </div>
      ${statusBadge}
    </div>
  `;
}

function buildChatEmptyMain() {
  return `
    <div class="chat-empty-main">
      <div class="chat-empty-main-icon">💬</div>
      <div class="chat-empty-main-title">Select a conversation</div>
      <div class="chat-empty-main-sub">Choose a vendor from the list to view your chat</div>
    </div>
  `;
}

function buildChatThread(ev) {
  const v = getVendorById(state.activeChatId);
  if (!v) return buildChatEmptyMain();
  const msgs = ev.chats[v.id] || [];
  const status = getChatStatus(ev, v.id);
  const isConfirmed = status === 'confirmed';
  const isNewChat = !ev.openedChats.includes(v.id) && msgs.length === 0;

  const templateMsg = `Hi! I'm planning a ${ev.type} in ${ev.location}${ev.date ? ' on ' + fmtDate(ev.date) : ''} with approximately ${ev.guests || '?'} guests${ev.budget ? '. My total budget is ' + fmt$(ev.budget) : ''}. Please let me know your availability and pricing!`;

  return `
    <div class="chat-thread-header">
      <div class="cth-avatar">${v.emoji}</div>
      <div class="cth-info">
        <div class="cth-name">${esc(v.name)}</div>
        <div class="cth-cat">${esc(v.category)} · ${esc(v.location)} · ${esc(v.price)}</div>
      </div>
      ${!isConfirmed
        ? `<button class="btn btn-green btn-sm" data-action="confirm-vendor" data-vendor-id="${v.id}">✓ Confirm Vendor</button>`
        : `<span class="chat-status status-confirmed" style="font-size:12px;padding:6px 12px;">✓ Confirmed</span>`}
    </div>

    <div class="chat-messages" id="chat-messages-area">
      ${isNewChat ? `
        <div class="chat-start-notice">
          <div class="csn-title">Start your conversation with ${esc(v.name)}</div>
          <div class="csn-sub">A pre-filled message is ready for you below. Customize it before sending!</div>
        </div>` : ''}

      ${msgs.map(m => `
        <div>
          <div class="message-row ${m.from === 'me' ? 'mine' : ''}">
            ${m.from !== 'me' ? `<div class="msg-avatar">${v.emoji}</div>` : ''}
            <div class="msg-bubble ${m.from === 'me' ? 'mine' : 'theirs'}">${esc(m.text)}</div>
            ${m.from === 'me' ? `<div class="msg-avatar"><div class="avatar-sm">S</div></div>` : ''}
          </div>
          <div class="msg-time ${m.from === 'me' ? 'mine' : 'theirs'}">${m.time}</div>
        </div>`).join('')}
    </div>

    <div class="chat-input-area">
      <input class="chat-input" id="chat-input-field"
        placeholder="Type a message..."
        value="${isNewChat ? esc(templateMsg) : ''}"
        data-vendor-id="${v.id}" />
      <button class="btn btn-primary" data-action="send-message" data-vendor-id="${v.id}">Send</button>
    </div>
  `;
}

/* ── New Event Modal ── */
function buildNewEventModal() {
  const d = state.draft;
  return `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal-box" id="modal-box">
        <div class="modal-header">
          <div class="modal-title">What's the occasion?</div>
          <div class="modal-close" data-action="close-new-event">×</div>
        </div>
        <div class="modal-body">
          <div class="event-type-grid">
            ${EVENT_TYPES.map(et => `
              <div class="event-type-card ${d.type === et.type ? 'selected' : ''}"
                   data-action="select-event-type" data-type="${et.type}" data-icon="${et.icon}">
                <span class="etc-icon">${et.icon}</span>
                <div class="etc-label">${et.type}</div>
              </div>`).join('')}
          </div>
          <div class="form-group" style="margin-top:4px;">
            <label class="form-label">Event Name <span style="font-size:10px;opacity:0.4;font-style:italic;text-transform:none;">optional</span></label>
            <input class="form-input" id="ne-name" placeholder="e.g. Sofia &amp; Marco's Wedding" value="${esc(d.name)}" />
          </div>
          <button class="btn btn-primary-lg" style="width:100%;margin-top:4px;" data-action="submit-new-event">
            ${d.icon} Create ${d.type} Event →
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ── Vendor Profile Modal ── */
function buildVendorProfileModal() {
  const v = getVendorById(state.vendorProfileId);
  if (!v) return '';
  const ev = getCurrent();
  const isConfirmed = ev && ev.confirmedVendors.some(cv => cv.vendorId === v.id);
  const isLocked = ev && ev.lockedCategories.includes(v.category) && !isConfirmed;
  const bg = CARD_BG[v.emoji] || '#13182a';

  const templateMsg = ev
    ? `Hi! I'm planning a ${ev.type} in ${ev.location}${ev.date ? ' on ' + fmtDate(ev.date) : ''} with approximately ${ev.guests || '?'} guests${ev.budget ? '. My total budget is ' + fmt$(ev.budget) : ''}. Please let me know your availability and pricing!`
    : 'Hi! I\'m interested in your services. Please share your availability and pricing.';

  return `
    <div class="modal-overlay" data-action="close-modal-overlay">
      <div class="modal-box modal-box-wide" id="modal-box">
        <div class="vp-header-img" style="background:${bg}">${v.emoji}</div>
        <div class="modal-header" style="border-radius:0;">
          <div>
            <div class="modal-title">${esc(v.name)}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.4);margin-top:3px;">${esc(v.category)} · ${esc(v.location)}</div>
          </div>
          <div class="modal-close" data-action="close-vendor-profile">×</div>
        </div>
        <div class="modal-body">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <div style="font-size:22px;color:var(--accent);font-weight:700;">${esc(v.price)}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.5);">${esc(v.review)}</div>
          </div>

          <div class="vp-section-title">Services Offered</div>
          <div class="vp-services">
            ${v.services.map(s => `<span class="vp-service-tag">${esc(s)}</span>`).join('')}
          </div>

          <div class="vp-section-title">Connect</div>
          <div class="vp-links">
            <div class="vp-link-btn">🌐 Website</div>
            <div class="vp-link-btn">📷 Instagram</div>
          </div>

          <div class="msg-template-box">
            <div class="vp-section-title" style="margin-top:0">Pre-filled Message</div>
            <div class="msg-template-text">"${esc(templateMsg)}"</div>
            ${ev ? `
              ${isConfirmed
                ? `<div class="btn btn-green" style="width:100%;justify-content:center;pointer-events:none;">✓ Already Confirmed for This Event</div>`
                : isLocked
                ? `<div style="font-size:12px;color:rgba(255,255,255,0.35);text-align:center;padding:10px;">Another ${esc(v.category)} vendor is already confirmed</div>`
                : `<button class="btn btn-primary" style="width:100%;" data-action="confirm-vendor" data-vendor-id="${v.id}">✓ Confirm Vendor for Event</button>`
              }` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ══════════════════════════════════════════════════════
   AFTER RENDER
══════════════════════════════════════════════════════ */
function afterRender() {
  if (state.view === 'event' && state.currentTab === 'vendors' && state.swipeQueue.length > 0) {
    bindSwipeDrag();
  }
  // Scroll chat to bottom
  const chatArea = document.getElementById('chat-messages-area');
  if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
}

/* ══════════════════════════════════════════════════════
   SWIPE DRAG
══════════════════════════════════════════════════════ */
const drag = { active: false, startX: 0, currentX: 0 };

function bindSwipeDrag() {
  const topCard = document.getElementById('top-card');
  if (!topCard) return;

  topCard.addEventListener('mousedown', e => {
    drag.active = true;
    drag.startX = e.clientX;
    drag.currentX = 0;
    topCard.style.transition = 'none';
    e.preventDefault();
  });

  topCard.addEventListener('touchstart', e => {
    drag.active = true;
    drag.startX = e.touches[0].clientX;
    drag.currentX = 0;
    topCard.style.transition = 'none';
  }, { passive: true });
}

document.addEventListener('mousemove', e => {
  if (!drag.active) return;
  const topCard = document.getElementById('top-card');
  if (!topCard) { drag.active = false; return; }
  drag.currentX = e.clientX - drag.startX;
  updateCardVisual(topCard, drag.currentX);
});

document.addEventListener('touchmove', e => {
  if (!drag.active) return;
  const topCard = document.getElementById('top-card');
  if (!topCard) { drag.active = false; return; }
  drag.currentX = e.touches[0].clientX - drag.startX;
  updateCardVisual(topCard, drag.currentX);
}, { passive: true });

document.addEventListener('mouseup', endDrag);
document.addEventListener('touchend', endDrag);

function updateCardVisual(card, x) {
  card.style.transform = `translateX(${x}px) rotate(${x * 0.04}deg)`;
  const like = document.getElementById('like-badge');
  const nope = document.getElementById('nope-badge');
  if (like) like.style.opacity = x > 20 ? Math.min((x - 20) / 60, 1) : 0;
  if (nope) nope.style.opacity = x < -20 ? Math.min((-x - 20) / 60, 1) : 0;
}

function endDrag() {
  if (!drag.active) return;
  drag.active = false;
  const topCard = document.getElementById('top-card');
  if (!topCard) return;

  if (drag.currentX > 80) {
    animateCardOff(topCard, 'right', () => doSwipeRight());
  } else if (drag.currentX < -80) {
    animateCardOff(topCard, 'left', () => doSwipeLeft());
  } else {
    topCard.style.transition = 'transform 0.3s';
    topCard.style.transform = '';
    const like = document.getElementById('like-badge');
    const nope = document.getElementById('nope-badge');
    if (like) like.style.opacity = 0;
    if (nope) nope.style.opacity = 0;
  }
  drag.currentX = 0;
}

function animateCardOff(card, dir, callback) {
  card.style.transition = 'transform 0.35s ease, opacity 0.35s';
  card.style.transform = `translateX(${dir === 'right' ? 600 : -600}px) rotate(${dir === 'right' ? 20 : -20}deg)`;
  card.style.opacity = '0';
  setTimeout(callback, 350);
}

/* ══════════════════════════════════════════════════════
   ACTIONS
══════════════════════════════════════════════════════ */
function doSwipeLeft() {
  if (state.swipeQueue.length === 0) return;
  const v = state.swipeQueue[0];
  const ev = getCurrent();
  if (ev && !ev.swipedIds.includes(v.id)) ev.swipedIds.push(v.id);
  state.swipeQueue.shift();
  render();
}

function doSwipeRight() {
  if (state.swipeQueue.length === 0) return;
  const v = state.swipeQueue[0];
  const ev = getCurrent();
  if (!ev) return;
  // Add to potential chats if not already there
  if (!ev.potentialChats.includes(v.id)) {
    ev.potentialChats.push(v.id);
    if (!ev.chats[v.id]) ev.chats[v.id] = [];
  }
  if (!ev.swipedIds.includes(v.id)) ev.swipedIds.push(v.id);
  state.swipeQueue.shift();
  render();
}

function doConfirmVendor(vendorId) {
  const v = getVendorById(vendorId);
  if (!v) return;
  const ev = getCurrent();
  if (!ev) return;

  // Check if category already locked
  if (ev.lockedCategories.includes(v.category)) {
    const existing = ev.confirmedVendors.find(cv => cv.category === v.category);
    const name = existing ? (getVendorById(existing.vendorId) || {}).name || 'another vendor' : 'a vendor';
    showToast(`${v.category} is locked — ${name} is already confirmed.`);
    return;
  }

  // Add to potential chats if not already there (swiping right is not required to confirm)
  if (!ev.potentialChats.includes(v.id)) {
    ev.potentialChats.push(v.id);
    if (!ev.chats[v.id]) ev.chats[v.id] = [];
  }

  // Confirm
  ev.confirmedVendors.push({ vendorId: v.id, category: v.category, cost: v.priceNum });
  ev.budgetUsed = (ev.budgetUsed || 0) + v.priceNum;
  ev.lockedCategories.push(v.category);

  // Close profile modal if open
  if (state.modalOpen === 'vendor-profile') state.modalOpen = null;

  showToast(`${v.name} confirmed! ✓`);
  render();
}

function doOpenChat(vendorId) {
  const ev = getCurrent();
  if (!ev) return;
  if (!ev.openedChats.includes(vendorId)) {
    ev.openedChats.push(vendorId);
  }
  state.activeChatId = vendorId;
  state.currentTab = 'chat';
  render();
}

function doSendMessage(vendorId) {
  const input = document.getElementById('chat-input-field');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  const ev = getCurrent();
  if (!ev) return;
  if (!ev.chats[vendorId]) ev.chats[vendorId] = [];
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  ev.chats[vendorId].push({ from: 'me', text, time: timeStr });
  // Simulate vendor reply after 1s
  setTimeout(() => {
    const ev2 = getCurrent();
    if (!ev2 || !ev2.chats[vendorId]) return;
    const replies = [
      "Thanks for reaching out! We'd love to be part of your event. Let me check our calendar and get back to you shortly.",
      "What a wonderful event! We have availability on that date. Shall we schedule a consultation?",
      "Thank you! We'd be happy to assist. Our team specializes in exactly what you're describing. Can we set up a call?",
      "Great timing! We just had an opening for that date. I'll send over our packages so you can take a look.",
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    const now2 = new Date();
    const timeStr2 = now2.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    ev2.chats[vendorId].push({ from: 'them', text: reply, time: timeStr2 });
    if (state.view === 'event' && state.currentTab === 'chat' && state.activeChatId === vendorId) {
      // Partial re-render just messages area
      renderChatMessages(ev2, vendorId);
    }
  }, 1000 + Math.random() * 1000);
  render();
}

function renderChatMessages(ev, vendorId) {
  const area = document.getElementById('chat-messages-area');
  if (!area) return;
  const v = getVendorById(vendorId);
  if (!v) return;
  const msgs = ev.chats[vendorId] || [];
  area.innerHTML = msgs.map(m => `
    <div>
      <div class="message-row ${m.from === 'me' ? 'mine' : ''}">
        ${m.from !== 'me' ? `<div class="msg-avatar">${v.emoji}</div>` : ''}
        <div class="msg-bubble ${m.from === 'me' ? 'mine' : 'theirs'}">${esc(m.text)}</div>
        ${m.from === 'me' ? `<div class="msg-avatar"><div class="avatar-sm">S</div></div>` : ''}
      </div>
      <div class="msg-time ${m.from === 'me' ? 'mine' : 'theirs'}">${m.time}</div>
    </div>`).join('');
  area.scrollTop = area.scrollHeight;
}

/* ══════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════ */
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position:fixed;bottom:32px;left:50%;transform:translateX(-50%);
      background:#0a0e1a;border:1px solid #f0845a;color:#fff;
      padding:12px 24px;border-radius:12px;font-size:14px;font-weight:500;
      z-index:2000;pointer-events:none;
      animation: slideUpFade 0.25s ease;
      box-shadow:0 8px 32px rgba(0,0,0,0.6);
    `;
    document.head.insertAdjacentHTML('beforeend', `<style>@keyframes slideUpFade{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}</style>`);
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

/* ══════════════════════════════════════════════════════
   EVENT DELEGATION
══════════════════════════════════════════════════════ */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  const evId = el.dataset.id;
  const vendorId = el.dataset.vendorId;
  const tab = el.dataset.tab;

  switch (action) {
    case 'nav-home':
      state.view = 'home';
      state.currentEventId = null;
      state.currentTab = 'details';
      state.activeChatId = null;
      render();
      break;

    case 'open-event':
      state.view = 'event';
      state.currentEventId = evId;
      state.currentTab = 'details';
      state.activeChatId = null;
      state.swipeCategory = null;
      state.swipeQueue = [];
      render();
      break;

    case 'switch-tab':
      state.currentTab = tab;
      if (tab === 'vendors' && !state.swipeCategory) {
        // Reset swipe queue when changing to vendors
      }
      if (tab !== 'chat') state.activeChatId = null;
      render();
      break;

    case 'open-new-event':
      state.modalOpen = 'new-event';
      state.newEventStep = 1;
      state.draft = { type:'Wedding', icon:'💍', name:'', date:'', time:'', location:'Miami, FL', guests:'', budget:'' };
      render();
      break;

    case 'close-new-event':
      state.modalOpen = null;
      render();
      break;

    case 'select-event-type':
      state.draft.type = el.dataset.type;
      state.draft.icon = el.dataset.icon;
      // Update cards in-place without re-rendering (preserves typed name)
      document.querySelectorAll('.event-type-card').forEach(c => {
        c.classList.toggle('selected', c.dataset.type === state.draft.type);
        c.querySelector('.etc-label').style.color = c.dataset.type === state.draft.type ? 'var(--accent)' : '';
      });
      const submitBtn = document.querySelector('[data-action="submit-new-event"]');
      if (submitBtn) submitBtn.textContent = `${state.draft.icon} Create ${state.draft.type} Event →`;
      break;

    case 'submit-new-event': {
      const nameInput = document.getElementById('ne-name');
      const name = nameInput ? nameInput.value.trim() : '';
      const newEvent = {
        id: uid(),
        name: name || `My ${state.draft.type}`,
        type: state.draft.type,
        icon: state.draft.icon,
        date: '', time: '',
        location: 'Miami, FL',
        guests: 0, budget: 0,
        confirmedVendors: [],
        potentialChats: [],
        chats: {},
        openedChats: [],
        lockedCategories: [],
        swipedIds: [],
        budgetUsed: 0,
        inviteCode: randomCode(),
        planners: ['Sofia M.']
      };
      state.events.push(newEvent);
      state.modalOpen = null;
      state.view = 'event';
      state.currentEventId = newEvent.id;
      state.currentTab = 'details';
      state.swipeCategory = null;
      state.swipeQueue = [];
      render();
      break;
    }

    case 'swipe-left':
      doSwipeLeft();
      break;

    case 'swipe-right':
      doSwipeRight();
      break;

    case 'confirm-vendor':
      doConfirmVendor(vendorId);
      break;

    case 'open-vendor-profile': {
      const queueVendorId = el.dataset.vendorId;
      if (!queueVendorId) break;
      state.vendorProfileId = queueVendorId;
      state.modalOpen = 'vendor-profile';
      render();
      break;
    }

    case 'close-vendor-profile':
      state.modalOpen = null;
      render();
      break;

    case 'open-chat':
      doOpenChat(vendorId);
      break;

    case 'send-message': {
      const vid = el.dataset.vendorId;
      doSendMessage(vid);
      break;
    }

    case 'new-invite-code': {
      const ev2 = getCurrent();
      if (ev2) {
        ev2.inviteCode = randomCode();
        const display = document.getElementById('invite-code-display');
        if (display) display.textContent = ev2.inviteCode;
      }
      break;
    }

    case 'copy-invite': {
      const ev2 = getCurrent();
      if (ev2) {
        navigator.clipboard.writeText(`eventswipe.app/join/${ev2.inviteCode}`).catch(() => {});
        showToast('Invite link copied!');
      }
      break;
    }

    case 'invite-planner':
      showToast('Invite link copied to clipboard!');
      break;
  }
});

/* Dropdown change handler */
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'vendor-cat-select') {
    const ev = getCurrent();
    const cat = t.value;
    state.swipeCategory = cat || null;
    if (cat && ev) {
      const all = VENDOR_DATA[cat] || [];
      state.swipeQueue = all.filter(v => !ev.swipedIds.includes(v.id));
    } else {
      state.swipeQueue = [];
    }
    // Partial re-render of tab content
    const tc = document.getElementById('tab-content');
    if (tc) {
      const ev2 = getCurrent();
      tc.innerHTML = buildTabContent(ev2);
      afterRender();
    }
  }

  if (t.id === 'chat-cat-filter') {
    state.chatCategoryFilter = t.value;
    const tc = document.getElementById('tab-content');
    if (tc) {
      const ev2 = getCurrent();
      tc.innerHTML = buildTabContent(ev2);
      afterRender();
    }
  }
});

/* Chat search */
document.addEventListener('input', e => {
  if (e.target.id === 'chat-search') {
    state.chatFilter = e.target.value;
    const list = document.querySelector('.chat-list');
    if (list) {
      const ev = getCurrent();
      const allChats = ev.potentialChats.map(vid => getVendorById(vid)).filter(Boolean);
      const filtered = allChats.filter(v => {
        const nameMatch = v.name.toLowerCase().includes(state.chatFilter.toLowerCase());
        const catMatch = state.chatCategoryFilter === 'all' || v.category === state.chatCategoryFilter;
        return nameMatch && catMatch;
      });
      list.innerHTML = filtered.length === 0
        ? `<div class="chat-sidebar-empty"><div class="chat-sidebar-empty-icon">🔍</div><div style="font-size:13px;color:rgba(255,255,255,0.35);">No results</div></div>`
        : filtered.map(v => buildChatListItem(ev, v)).join('');
    }
  }
});

/* Enter to send chat */
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'chat-input-field' && !e.shiftKey) {
    e.preventDefault();
    const vendorId = e.target.dataset.vendorId;
    if (vendorId) doSendMessage(vendorId);
  }
});

/* Close modal when clicking overlay background */
document.addEventListener('click', e => {
  if (state.modalOpen && e.target.id === 'modal-overlay') {
    state.modalOpen = null;
    render();
  }
});

/* ══════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════ */
render();
