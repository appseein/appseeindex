(function () {
  var d = document;

  /* ---------- Firebase config ---------- */
  var FB = {
    apiKey: "AIzaSyD_0QOZq26WJHM3JZBGCzC4Ik_rxrwbyTY",
    authDomain: "appseeapp.firebaseapp.com",
    projectId: "appseeapp",
    storageBucket: "appseeapp.firebasestorage.app",
    messagingSenderId: "228305327553",
    appId: "1:228305327553:web:02e051da025846c500cb40",
    measurementId: "G-KQTE2G7VRF"
  };
  var B = "https://www.gstatic.com/firebasejs/10.12.2/";
  function load(src) {
    return new Promise(function (ok, no) {
      var s = d.createElement("script");
      s.src = src; s.onload = ok; s.onerror = no; d.head.appendChild(s);
    });
  }
  var initP, dbP;
  function init() {
    return initP || (initP = load(B + "firebase-app-compat.js").then(function () {
      if (!firebase.apps.length) firebase.initializeApp(FB);
      return load(B + "firebase-analytics-compat.js").then(function () {
        try { firebase.analytics(); } catch (e) {}
      }).catch(function () {});
    }));
  }
  function db() {
    return dbP || (dbP = init().then(function () { return load(B + "firebase-firestore-compat.js"); })
      .then(function () { return firebase.firestore(); }));
  }
  window.addEventListener("load", function () { setTimeout(function () { init().catch(function () {}); if (d.querySelector("[data-lead-form]")) db().catch(function () {}); }, 800); });

  /* ---------- Mobile menu ---------- */
  var mb = d.querySelector(".menu-btn"), nav = d.querySelector("header nav");
  if (mb && nav) {
    var setOpen = function (o) {
      nav.classList.toggle("open", o); mb.setAttribute("aria-expanded", o);
      mb.textContent = o ? "✕" : "☰"; mb.setAttribute("aria-label", o ? "Close menu" : "Open menu");
    };
    mb.addEventListener("click", function (e) { e.stopPropagation(); setOpen(!nav.classList.contains("open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    d.addEventListener("click", function (e) { if (!nav.contains(e.target)) setOpen(false); });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    window.addEventListener("resize", function () { if (innerWidth > 1000) setOpen(false); });
  }

  /* ---------- Reveal on scroll ---------- */
  var rv = d.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("show"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add("show"); });
  setTimeout(function () { rv.forEach(function (el) { el.classList.add("show"); }); }, 4000);

  /* ---------- Counters (final value is already in the HTML, so crawlers never see 0) ---------- */
  var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function count(el) {
    var t = +el.dataset.target, s = performance.now(), D = 1200;
    (function f(n) {
      var p = Math.min((n - s) / D, 1);
      el.textContent = p < 1 ? Math.round(t * (1 - Math.pow(1 - p, 3))) : t;
      if (p < 1) requestAnimationFrame(f);
    })(s);
  }
  var cs = d.querySelectorAll(".count");
  if (cs.length && "IntersectionObserver" in window && !still) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    cs.forEach(function (el) { co.observe(el); });
  }

  /* ---------- App filter ---------- */
  d.querySelectorAll(".chip").forEach(function (c) {
    c.addEventListener("click", function () {
      d.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x === c); });
      d.querySelectorAll(".app").forEach(function (a) {
        a.hidden = c.dataset.f !== "all" && a.dataset.cat !== c.dataset.f;
      });
    });
  });

  /* ---------- Lead form -> Firestore "leads" ---------- */
  var host = d.querySelector("[data-lead-form]");
  if (host) {
    host.innerHTML =
      '<form class="form" novalidate>' +
      '<div><label for="f-name">Your name *</label><input id="f-name" name="name" autocomplete="name" required></div>' +
      '<div><label for="f-phone">Phone *</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" placeholder="+91 98765 43210" required></div>' +
      '<div class="full"><label for="f-email">Email *</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>' +
      '<div class="full"><label for="f-service">What do you need?</label><select id="f-service" name="service">' +
      '<option>Android app development</option><option>Website or admin dashboard</option><option>UI / UX design</option>' +
      '<option>App marketing &amp; ASO</option><option>App maintenance and support</option><option>App in Tamil, Hindi or other languages</option><option>Something else</option></select></div>' +
      '<div class="full"><label for="f-msg">Tell us about your project</label><textarea id="f-msg" name="message"></textarea></div>' +
      '<input class="hp" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<div class="full msg" role="status" aria-live="polite"></div>' +
      '<div class="full"><button class="btn" type="submit">Book now</button>' +
      '<p class="small" style="margin-top:10px">Our executive will reach you soon. Your details are used only to contact you – see our <a href="policy.html">Privacy Policy</a>.</p></div>' +
      '</form>';
    var form = host.querySelector("form"), btn = form.querySelector("button"), box = form.querySelector(".msg");
    var say = function (cls, html) { box.className = "full msg " + cls; box.innerHTML = html; };
    form.addEventListener("focusin", function () { db().catch(function () {}); }, { once: true });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(form), g = function (k) { return (f.get(k) || "").toString().trim(); };
      if (g("company")) return;
      if (!g("name") || !/^\S+@\S+\.\S+$/.test(g("email"))) return say("err", "Please enter your name and a valid email address.");
      if (g("phone").replace(/\D/g, "").length < 10) return say("err", "Please enter a phone number with at least 10 digits.");
      btn.disabled = true; btn.textContent = "Sending…"; say("", "");
      Promise.race([db().then(function (x) {
        return x.collection("leads").add({
          name: g("name"), phone: g("phone"), email: g("email"), service: g("service"),
          message: g("message").slice(0, 2000), page: location.pathname, status: "new",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }), new Promise(function (_, no) { setTimeout(function () { no(new Error("timeout")); }, 15000); })]).then(function () {
        try { firebase.analytics().logEvent("generate_lead"); } catch (e) {}
        form.reset();
        say("ok", "Thank you! Our executive will reach you soon.");
      }).catch(function () {
        say("err", "We could not send your message right now. Please check your connection and try again, or email <a href=\"mailto:appseeapps@gmail.com\">appseeapps@gmail.com</a>.");
      }).then(function () { btn.disabled = false; btn.textContent = "Book now"; });
    });
  }
})();
