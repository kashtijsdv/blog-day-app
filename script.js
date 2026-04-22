$(function () {

  $('.year').text(new Date().getFullYear());

  /* ══════════════════════════════════════════════════
     NAVBAR — reflect session state
  ═════════════════════════════════════════════════ */
  const session = sessionStorage.getItem('bd_session');
  if (session) {
    // Desktop nav: swap Sign In → username chip + Sign Out
    $('#nav-auth-1').html(
      `<span class="nav-user-chip">✦ ${escHtml(session)}</span>`
    );
    $('#nav-auth-2').html(
      `<a href="#" class="nav-cta" id="signOutBtn">Sign Out</a>`
    );
    // Mobile menu
    $('#mob-signin').text(`✦ ${session}`).attr('href', '#');
    $('#mob-join').text('Sign Out').attr('href', '#').attr('id', 'mobSignOut');

    $(document).on('click', '#signOutBtn, #mobSignOut', function (e) {
      e.preventDefault();
      sessionStorage.removeItem('bd_session');
      window.location.href = 'index.html';
    });
  }

  /* ══════════════════════════════════════════════════
     HAMBURGER MENU
  ══════════════════════════════════════════════════ */
  $('#menuToggle').on('click', function () {
    $('#mobileMenu').toggleClass('open');
  });

  /* ══════════════════════════════════════════════════
     AUTH GUARD — change-password requires login
  ══════════════════════════════════════════════════ */
  if ($('#oldPass').length && !sessionStorage.getItem('bd_session')) {
    // Soft warning instead of hard redirect — user may not be "logged in"
    // but still knows their current password (valid use case for client-side)
    // Show informational notice only
    const $notice = $('<div class="alert-error show" style="margin-bottom:1rem;">⚠ You are not currently signed in. You can still change your password if you know your current one.</div>');
    $('.form-card-body').prepend($notice);
  }

  /* ══════════════════════════════════════════════════
     PRE-FILL AUTHOR on Write page
  ══════════════════════════════════════════════════ */
  if ($('#blogAuthor').length && session) {
    $('#blogAuthor').val(session);
  }

  /* ══════════════════════════════════════════════════
     CHARACTER COUNTER on Write page
  ══════════════════════════════════════════════════ */
  $('#blogContent').on('input', function () {
    const len = $(this).val().length;
    $('#charCount').text(len.toLocaleString());
    if (len > 9000) {
      $('#charCount').css('color', 'var(--error)');
    } else {
      $('#charCount').css('color', 'var(--muted)');
    }
  });

  /* ══════════════════════════════════════════════════
     SHOW / HIDE PASSWORD TOGGLES
  ══════════════════════════════════════════════════ */
  function bindEyeToggle(btnId, inputId) {
    $('#' + btnId).on('click', function () {
      const $input = $('#' + inputId);
      const isPass = $input.attr('type') === 'password';
      $input.attr('type', isPass ? 'text' : 'password');
      $(this).text(isPass ? '🙈' : '👁').attr('aria-label', isPass ? 'Hide password' : 'Show password');
    });
  }
  bindEyeToggle('toggleLoginPass',  'loginPass');
  bindEyeToggle('toggleRegPass',    'regPass');
  bindEyeToggle('toggleForgotPass', 'forgotPass');
  bindEyeToggle('toggleOldPass',    'oldPass');
  bindEyeToggle('toggleNewPass',    'newPass');

  /* ══════════════════════════════════════════════════
     READ PAGE — render blogs
  ══════════════════════════════════════════════════ */
  if ($('#blogGrid').length) {
    renderBlogs();
  }

  /* ══════════════════════════════════════════════════
     LIVE SEARCH on Read page
  ══════════════════════════════════════════════════ */
  $('#blogSearch').on('input', function () {
    const q = $.trim($(this).val()).toLowerCase();
    if (!q) {
      $('.blog-card').show();
      $('#noResults').remove();
      return;
    }
    let visible = 0;
    $('.blog-card').each(function () {
      const text = $(this).text().toLowerCase();
      const match = text.includes(q);
      $(this).toggle(match);
      if (match) visible++;
    });
    $('#noResults').remove();
    if (visible === 0) {
      $('#blogGrid').append(
        `<div id="noResults" class="empty-state" style="grid-column:1/-1;">
          <div class="empty-icon">🔍</div>
          <h3>No results for "${escHtml(q)}"</h3>
          <p>Try a different keyword or <a href="write.html" style="color:var(--gold);">write that story yourself</a>.</p>
        </div>`
      );
    }
  });

  /* ══════════════════════════════════════════════════
     DETAIL PANEL — close
  ══════════════════════════════════════════════════ */
  $('#closeDetail').on('click', closeDetail);
  $('#detailOverlay').on('click', function (e) {
    if ($(e.target).is('#detailOverlay')) closeDetail();
  });

  /* ══════════════════════════════════════════════════
     BUTTON EVENT LISTENERS (no more inline onclick)
  ══════════════════════════════════════════════════ */
  $('#loginBtn').on('click', doLogin);
  $('#regBtn').on('click', doRegister);
  $('#forgotBtn').on('click', doForgot);
  $('#changePassBtn').on('click', doChangePass);
  $('#publishBtn').on('click', doPublish);

  /* ══════════════════════════════════════════════════
     ENTER KEY SUBMIT
  ══════════════════════════════════════════════════ */
  $('#loginUser, #loginPass').on('keypress', function (e) {
    if (e.which === 13) doLogin();
  });
  $('#regUser, #regEmail, #regPass').on('keypress', function (e) {
    if (e.which === 13) doRegister();
  });
  $('#forgotUser, #forgotPass').on('keypress', function (e) {
    if (e.which === 13) doForgot();
  });
  $('#oldPass, #newPass').on('keypress', function (e) {
    if (e.which === 13) doChangePass();
  });

  /* clear error styling on input focus */
  $('input, textarea').on('focus', function () {
    $(this).removeClass('is-invalid');
    $(this).siblings('.invalid-feedback').removeClass('show').text('');
    $(this).closest('.input-eye-wrap').siblings('.invalid-feedback').removeClass('show').text('');
  });

});

/* ══════════════════════════════════════════════════════
   STATE (localStorage) — passwords stored as btoa hash
══════════════════════════════════════════════════════ */
const BD = {
  getUser  : () => localStorage.getItem('bd_user'),
  getPass  : () => localStorage.getItem('bd_pass'),   // stored as btoa
  getEmail : () => localStorage.getItem('bd_email'),
  getBlogs : () => JSON.parse(localStorage.getItem('bd_blogs') || '[]'),
  setUser  : (u) => localStorage.setItem('bd_user', u),
  setPass  : (p) => localStorage.setItem('bd_pass', btoa(p)),  // obfuscate
  setEmail : (e) => localStorage.setItem('bd_email', e),
  setBlogs : (b) => localStorage.setItem('bd_blogs', JSON.stringify(b)),
  checkPass: (p) => btoa(p) === localStorage.getItem('bd_pass'),
};

/* ══════════════════════════════════════════════════════
   VALIDATION HELPERS
══════════════════════════════════════════════════════ */
function clearAll() {
  $('.is-invalid').removeClass('is-invalid');
  $('.invalid-feedback').removeClass('show').text('');
  $('.alert-error, .alert-success').removeClass('show').text('');
}

function fieldErr(inputId, errId, msg) {
  const $inp = $('#' + inputId);
  $inp.addClass('is-invalid');
  // Also mark the input-eye-wrap parent border if inside one
  $inp.closest('.input-eye-wrap').addClass('wrap-invalid');
  $('#' + errId).text(msg).addClass('show');
}

function genErr(id, msg) { $('#' + id).text(msg).addClass('show'); }
function genOk(id, msg)  { $('#' + id).text(msg).addClass('show'); }

function validatePassword(pass) {
  if (!pass || pass.length < 6)   return 'Password must be at least 6 characters.';
  if (!/[A-Z]/.test(pass))        return 'Must contain at least one uppercase letter.';
  if (!/[0-9]/.test(pass))        return 'Must contain at least one number.';
  return null;
}

function escHtml(str) {
  return $('<div>').text(str || '').html();
}

function initials(name) {
  return (name || '?').slice(0, 2).toUpperCase();
}

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

function readTime(text) {
  const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
  const mins  = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

/* ══════════════════════════════════════════════════════
   BUTTON LOADING STATE HELPERS
══════════════════════════════════════════════════════ */
function btnLoading($btn, text) {
  $btn.prop('disabled', true).data('orig', $btn.text()).text(text || 'Please wait…');
}
function btnReset($btn) {
  $btn.prop('disabled', false).text($btn.data('orig'));
}

/* ══════════════════════════════════════════════════════
   ① REGISTER
══════════════════════════════════════════════════════ */
function doRegister() {
  clearAll();
  let valid = true;
  const $btn = $('#regBtn');

  const user  = $.trim($('#regUser').val());
  const email = $.trim($('#regEmail').val());
  const pass  = $('#regPass').val(); // don't trim passwords

  if (user.length < 3) {
    fieldErr('regUser', 'regUserErr', 'Username must be at least 3 characters.');
    valid = false;
  } else if (!/^[a-zA-Z0-9_]+$/.test(user)) {
    fieldErr('regUser', 'regUserErr', 'Only letters, numbers, and underscores allowed.');
    valid = false;
  }

  if (!email) {
    fieldErr('regEmail', 'regEmailErr', 'Email address is required.');
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErr('regEmail', 'regEmailErr', 'Please enter a valid email address.');
    valid = false;
  }

  const passErr = validatePassword(pass);
  if (passErr) { fieldErr('regPass', 'regPassErr', passErr); valid = false; }

  if (!valid) return;

  btnLoading($btn, 'Creating account…');

  BD.setUser(user);
  BD.setEmail(email);
  BD.setPass(pass);  // stored as btoa

  genOk('regSuccess', '✓ Account created! Redirecting to login…');
  setTimeout(() => { window.location.href = 'login.html'; }, 1800);
}

/* ══════════════════════════════════════════════════════
   ② LOGIN
══════════════════════════════════════════════════════ */
function doLogin() {
  clearAll();
  let valid = true;
  const $btn = $('#loginBtn');

  const user = $.trim($('#loginUser').val());
  const pass = $('#loginPass').val();

  if (!user) { fieldErr('loginUser', 'loginUserErr', 'Username is required.'); valid = false; }
  if (!pass) { fieldErr('loginPass', 'loginPassErr', 'Password is required.'); valid = false; }
  if (!valid) return;

  btnLoading($btn, 'Signing in…');

  if (user === BD.getUser() && BD.checkPass(pass)) {
    sessionStorage.setItem('bd_session', user);
    genOk('loginSuccess', '✓ Login successful! Redirecting…');
    setTimeout(() => { window.location.href = 'index.html'; }, 1500);
  } else {
    btnReset($btn);
    genErr('loginGenErr', '✕ Invalid username or password. Please try again.');
    $('#loginPass').addClass('is-invalid');
  }
}

/* ══════════════════════════════════════════════════════
   ③ FORGOT / RESET PASSWORD
══════════════════════════════════════════════════════ */
function doForgot() {
  clearAll();
  let valid = true;
  const $btn = $('#forgotBtn');

  const user = $.trim($('#forgotUser').val());
  const pass = $('#forgotPass').val();

  if (!user) { fieldErr('forgotUser', 'forgotUserErr', 'Username is required.'); valid = false; }

  const passErr = validatePassword(pass);
  if (passErr) { fieldErr('forgotPass', 'forgotPassErr', passErr); valid = false; }

  if (!valid) return;

  if (user !== BD.getUser()) {
    fieldErr('forgotUser', 'forgotUserErr', '✕ No account found with that username.');
    return;
  }

  btnLoading($btn, 'Resetting…');
  BD.setPass(pass);
  genOk('forgotSuccess', '✓ Password reset successfully! You can now log in.');
  setTimeout(() => { window.location.href = 'login.html'; }, 2000);
}

/* ══════════════════════════════════════════════════════
   ④ CHANGE PASSWORD
══════════════════════════════════════════════════════ */
function doChangePass() {
  clearAll();
  let valid = true;
  const $btn = $('#changePassBtn');

  const oldPass = $('#oldPass').val();
  const newPass = $('#newPass').val();

  if (!oldPass) { fieldErr('oldPass', 'oldPassErr', 'Current password is required.'); valid = false; }

  const passErr = validatePassword(newPass);
  if (passErr) {
    fieldErr('newPass', 'newPassErr', passErr);
    valid = false;
  } else if (oldPass && oldPass === newPass) {
    fieldErr('newPass', 'newPassErr', 'New password must be different from your current password.');
    valid = false;
  }

  if (!valid) return;

  if (!BD.checkPass(oldPass)) {
    fieldErr('oldPass', 'oldPassErr', '✕ Current password is incorrect.');
    return;
  }

  btnLoading($btn, 'Updating…');
  BD.setPass(newPass);
  genOk('changeSuccess', '✓ Password updated successfully!');
  $('#oldPass, #newPass').val('');
  setTimeout(() => btnReset($btn), 2000);
}

/* ══════════════════════════════════════════════════════
   ⑤ PUBLISH BLOG
══════════════════════════════════════════════════════ */
function doPublish() {
  clearAll();
  let valid = true;
  const $btn = $('#publishBtn');

  const title   = $.trim($('#blogTitle').val());
  const author  = $.trim($('#blogAuthor').val());
  const content = $.trim($('#blogContent').val());

  if (!title) {
    fieldErr('blogTitle', 'blogTitleErr', 'A title is required for your blog post.');
    valid = false;
  } else if (title.length < 5) {
    fieldErr('blogTitle', 'blogTitleErr', 'Title must be at least 5 characters.');
    valid = false;
  }

  if (!author) {
    fieldErr('blogAuthor', 'blogAuthorErr', 'Author name is required.');
    valid = false;
  }

  if (!content) {
    fieldErr('blogContent', 'blogContentErr', 'Content is required.');
    valid = false;
  } else if (content.length < 20) {
    fieldErr('blogContent', 'blogContentErr', 'Content must be at least 20 characters.');
    valid = false;
  }

  if (!valid) return;

  btnLoading($btn, 'Publishing…');

  const blogs = BD.getBlogs();
  blogs.unshift({ id: Date.now(), title, author, content, date: Date.now() });
  BD.setBlogs(blogs);

  genOk('writeSuccess', '✓ Your story has been published!');
  $('#blogTitle, #blogAuthor, #blogContent').val('');
  $('#charCount').text('0');
  setTimeout(() => { window.location.href = 'read.html'; }, 1800);
}

/* ══════════════════════════════════════════════════════
   RENDER BLOG GRID
══════════════════════════════════════════════════════ */
function renderBlogs() {
  const blogs = BD.getBlogs();
  const $grid = $('#blogGrid');
  $grid.empty();

  if (!blogs.length) {
    $grid.html(`
      <div class="empty-state">
        <div class="empty-icon">✦</div>
        <h3>No stories yet</h3>
        <p>Be the first to share something worth reading.</p>
        <a href="write.html" class="btn btn-gold" style="margin-top:1.5rem;">Write the First Post</a>
      </div>
    `);
    return;
  }

  $.each(blogs, function (i, blog) {
    const rt = readTime(blog.content);
    const card = $(`
      <article class="blog-card" style="animation-delay:${i * 0.07}s" tabindex="0" role="button" aria-label="Read: ${escHtml(blog.title)}">
        <div class="blog-card-top"></div>
        <div class="blog-card-body">
          <div class="blog-meta">
            <span class="blog-tag">Story</span>
            <span class="blog-date">${escHtml(fmtDate(blog.date))}</span>
            <span class="blog-date" style="color:var(--gold);margin-left:auto;">⏱ ${escHtml(rt)}</span>
          </div>
          <h3 class="blog-card-title">${escHtml(blog.title)}</h3>
          <p class="blog-excerpt">${escHtml(blog.content)}</p>
          <div class="blog-card-foot">
            <div class="author-chip">
              <div class="author-av">${escHtml(initials(blog.author))}</div>
              <span class="author-name">${escHtml(blog.author)}</span>
            </div>
            <span class="read-more">Read →</span>
          </div>
        </div>
      </article>
    `);

    card.on('click keypress', function (e) {
      if (e.type === 'keypress' && e.which !== 13) return;
      openDetail(blog);
    });
    $grid.append(card);
  });
}

/* ══════════════════════════════════════════════════════
   BLOG DETAIL PANEL
══════════════════════════════════════════════════════ */
function openDetail(blog) {
  $('#detailTitle').text(blog.title);
  $('#detailAuthor').text(blog.author);
  $('#detailDate').text(fmtDate(blog.date));
  $('#detailReadTime').text('⏱ ' + readTime(blog.content));
  $('#detailContent').text(blog.content);
  $('#detailAvatar').text(initials(blog.author));

  const $actions = $('#detailActions');
  $actions.empty();

  if (BD.getUser() === blog.author) {
    const $del = $('<button class="btn btn-danger">🗑 Delete Post</button>');
    $del.on('click', function () {
      if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
      const updated = BD.getBlogs().filter(b => b.id !== blog.id);
      BD.setBlogs(updated);
      closeDetail();
      renderBlogs();
    });
    $actions.append($del);
  }

  $('#detailOverlay').addClass('open');
  $('body').css('overflow', 'hidden');
}

function closeDetail() {
  $('#detailOverlay').removeClass('open');
  $('body').css('overflow', '');
}

/* ESC key closes detail panel */
$(document).on('keydown', function (e) {
  if (e.key === 'Escape') closeDetail();
});
