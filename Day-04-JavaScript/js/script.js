/* ==========================================================================
   Lumio - Day 04: JavaScript Fundamentals & DOM Manipulation
   ApexLark Full Stack Development Internship

   Everything on this page that moves or reacts is written here in plain
   JavaScript (ES6). There are no libraries or frameworks.

   ES6 concepts used in this file
   ------------------------------
   - const and let instead of var
   - Arrow functions:              const add = (a, b) => a + b;
   - Template literals:            `Hello ${name}`
   - Arrays and array methods:     map, filter, forEach, find, join
   - Objects and destructuring:    const { text, author } = quote;
   - Default parameters:           showToast(message, time = 2500)
   - Spread syntax:                [...document.querySelectorAll("a")]
   - Loops:                        for, for...of, forEach
   - Ternary operator and switch
   - Modules of code grouped into small "init" functions

   DOM events handled
   ------------------
   click · dblclick · mouseover · mouseleave · keypress · keydown · input ·
   submit · reset · scroll · resize · mousemove

   File layout
   -----------
   1.  Helpers
   2.  Data (arrays of objects)
   3.  Theme toggle (dark / light)
   4.  Responsive navigation menu
   5.  Header behaviour and scroll progress
   6.  Digital clock and greeting
   7.  Random quote generator
   8.  Keyboard shortcuts (keypress)
   9.  Rendering lists from arrays (logos, stats, services, pricing, FAQ)
   10. Service cards: mouseover, mouseleave, dblclick
   11. Pricing toggle
   12. FAQ show / hide
   13. Character counter
   14. Registration form validation
   15. Typing effect, reveal on scroll, counters
   16. Hero: 3D golden tunnel and warp dust
   17. Start everything
   ========================================================================== */

"use strict";

/* ---------------------------------------------------------------------------
   1. HELPERS
   Small reusable arrow functions used throughout the file.
--------------------------------------------------------------------------- */

// Short names for selecting elements
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

// Keep a number between 0 and 1
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

// Add a leading zero: 7 -> "07"
const pad = (num) => String(num).padStart(2, "0");

// Format a number in the Indian style: 12000 -> "12,000"
const formatNumber = (num) => num.toLocaleString("en-IN");

// Does the visitor prefer less motion?
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// localStorage can throw in private windows, so every read and write is wrapped
const storage = {
    get: (key, fallback = null) => {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : value;
        } catch (error) {
            return fallback;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            /* storage unavailable: the page still works, it just won't remember */
        }
    }
};

// Show a small message in the bottom-right corner
let toastTimer;
const showToast = (message, duration = 2600) => {
    const toast = $("#toast");
    toast.textContent = message;
    toast.hidden = false;                 // show the element
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.hidden = true;              // hide it again
    }, duration);
};

/* ---------------------------------------------------------------------------
   2. DATA
   Content for the page is kept in arrays and objects, then turned into HTML
   by the render functions in section 9.
--------------------------------------------------------------------------- */

const quotes = [
    { text: "Great things are done by a series of small things brought together.", author: "Vincent van Gogh" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
    { text: "Talent wins games, but teamwork wins championships.", author: "Michael Jordan" },
    { text: "You can't use up creativity. The more you use, the more you have.", author: "Maya Angelou" },
    { text: "Arise, awake, and stop not till the goal is reached.", author: "Swami Vivekananda" },
    { text: "Dream is not that which you see while sleeping, it is something that does not let you sleep.", author: "A. P. J. Abdul Kalam" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { text: "If you want to go fast, go alone. If you want to go far, go together.", author: "African proverb" }
];

const companies = ["Zentrix", "Orbitly", "Kalpa Labs", "Paywise", "Nimbus HR", "Trekly", "Vayu Cloud", "Saffron Studio"];

const stats = [
    { label: "Teams using Lumio", value: 12000, suffix: "+" },
    { label: "Meetings summarised", value: 24, suffix: " lakh+" },
    { label: "Hours saved this week", value: 86500, suffix: "" },
    { label: "Languages supported", value: 32, suffix: "" }
];

const services = [
    {
        icon: "mic.svg",
        title: "Live recording",
        short: "Joins Zoom, Meet and Teams on its own.",
        detail: "Records clear audio and labels who said what, even with 20 people on the call."
    },
    {
        icon: "summary.svg",
        title: "Smart summaries",
        short: "A one-page summary in seconds.",
        detail: "Key decisions, open questions and next steps, ready before you close the tab."
    },
    {
        icon: "tasks.svg",
        title: "Action items",
        short: "Turns decisions into tasks.",
        detail: "Assigns owners and due dates, then sends them to Jira, Trello or Asana."
    },
    {
        icon: "search.svg",
        title: "Search everything",
        short: "Find any moment in any meeting.",
        detail: "Type \"pricing\" and jump straight to 14:32 in last Tuesday's call."
    }
];

const plans = [
    {
        name: "Starter",
        monthly: 0,
        yearly: 0,
        note: "For trying Lumio out",
        features: ["5 meetings a month", "Basic summaries", "7-day history"],
        popular: false
    },
    {
        name: "Team",
        monthly: 799,
        yearly: 7990,
        note: "Per user, for growing teams",
        features: ["Unlimited meetings", "Action items and owners", "Search across all calls", "Slack and Jira sync"],
        popular: true
    },
    {
        name: "Business",
        monthly: 1499,
        yearly: 14990,
        note: "Per user, for larger companies",
        features: ["Everything in Team", "Admin controls", "Custom vocabulary", "Priority support"],
        popular: false
    }
];

const faqs = [
    {
        question: "Does Lumio work with Google Meet and Microsoft Teams?",
        answer: "Yes. Lumio joins Zoom, Google Meet and Microsoft Teams calls. You add it once from your calendar and it shows up on its own."
    },
    {
        question: "Which languages can Lumio understand?",
        answer: "32 languages, including English, Hindi, Tamil, Telugu, Kannada and Marathi. It also handles calls where people switch between languages."
    },
    {
        question: "Is my meeting data safe?",
        answer: "Recordings are encrypted and stored in India. You choose how long they are kept, and you can delete them at any time."
    },
    {
        question: "Can I cancel any time?",
        answer: "Yes. There is no lock-in. If you cancel a yearly plan, the unused months are refunded."
    }
];

// Words for the typing effect in the hero
const audiences = ["product team.", "agency.", "startup.", "sales team.", "classroom."];

/* ---------------------------------------------------------------------------
   3. THEME TOGGLE (dark / light)
   Changes the data-theme attribute on <html>. All colours in style.css are
   CSS variables, so the whole page switches at once.
--------------------------------------------------------------------------- */

const applyTheme = (theme) => {
    const root = document.documentElement;
    const isDark = theme === "dark";

    root.setAttribute("data-theme", theme);

    // Change the icon and the button label to describe the next action
    $("#themeIcon").src = isDark ? "assets/icons/sun.svg" : "assets/icons/moon.svg";
    $("#themeToggle").setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");

    storage.set("lumio-theme", theme);
};

const toggleTheme = () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    showToast(`${next === "dark" ? "Dark" : "Light"} theme on`);
};

const initTheme = () => {
    // Use the saved theme, or dark by default
    applyTheme(storage.get("lumio-theme", "dark"));
    $("#themeToggle").addEventListener("click", toggleTheme);
};

/* ---------------------------------------------------------------------------
   4. RESPONSIVE NAVIGATION MENU
   On small screens the menu slides in when the hamburger is clicked.
--------------------------------------------------------------------------- */

const initNav = () => {
    const nav = $("#mainNav");
    const button = $("#menuToggle");
    const icon = $("#menuIcon");

    const setMenu = (open) => {
        nav.classList.toggle("open", open);
        button.setAttribute("aria-expanded", String(open));
        button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        icon.src = open ? "assets/icons/close.svg" : "assets/icons/menu.svg";
    };

    // Click the hamburger: open or close
    button.addEventListener("click", () => setMenu(!nav.classList.contains("open")));

    // Click a link: close the menu
    $$(".nav-link", nav).forEach((link) => {
        link.addEventListener("click", () => setMenu(false));
    });

    // Escape key closes the menu
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && nav.classList.contains("open")) {
            setMenu(false);
            button.focus();
        }
    });

    // Clicking outside the menu closes it
    document.addEventListener("click", (event) => {
        const clickedInside = nav.contains(event.target) || button.contains(event.target);
        if (!clickedInside && nav.classList.contains("open")) {
            setMenu(false);
        }
    });

    // If the window grows past the mobile size, reset the menu
    window.addEventListener("resize", () => {
        if (window.innerWidth > 992) {
            setMenu(false);
        }
    });

    // Highlight the link of the section currently on screen
    const sections = $$("main section[id]");
    const links = $$(".nav-link", nav);

    const highlightLink = () => {
        let currentId = "home";
        for (const section of sections) {
            if (section.getBoundingClientRect().top <= window.innerHeight * 0.4) {
                currentId = section.id;
            }
        }
        links.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
        });
    };

    window.addEventListener("scroll", highlightLink, { passive: true });
    highlightLink();
};

/* ---------------------------------------------------------------------------
   5. HEADER BEHAVIOUR AND SCROLL PROGRESS
--------------------------------------------------------------------------- */

const initScrollEffects = () => {
    const header = $("#siteHeader");
    const bar = $("#scrollBar");

    const onScroll = () => {
        // Solid header background after scrolling a little
        header.classList.toggle("scrolled", window.scrollY > 40);

        // Width of the gold bar at the top = how far down the page we are
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const percent = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
        bar.style.width = `${percent}%`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
};

/* ---------------------------------------------------------------------------
   6. DIGITAL CLOCK AND GREETING
   Updates every second. The greeting changes with the time of day.
--------------------------------------------------------------------------- */

let use24Hour = storage.get("lumio-24h") === "true";

// Pick a greeting with a switch statement
const getGreeting = (hour) => {
    switch (true) {
        case hour < 5:
            return { text: "Working late?", emoji: "\u{1F319}" };
        case hour < 12:
            return { text: "Good morning", emoji: "☀️" };
        case hour < 17:
            return { text: "Good afternoon", emoji: "\u{1F324}️" };
        case hour < 21:
            return { text: "Good evening", emoji: "\u{1F307}" };
        default:
            return { text: "Good night", emoji: "\u{1F319}" };
    }
};

const updateClock = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    // 12-hour or 24-hour display
    const displayHour = use24Hour ? pad(hours) : (hours % 12 || 12);
    const ampm = hours < 12 ? "AM" : "PM";

    $("#clock").innerHTML = use24Hour
        ? `${displayHour}:${minutes}:${seconds}`
        : `${displayHour}:${minutes}:${seconds}<span class="ampm">${ampm}</span>`;

    $("#headerClock").textContent = use24Hour
        ? `${displayHour}:${minutes}`
        : `${displayHour}:${minutes} ${ampm}`;

    // Date line, for example: Thursday, 5 November 2026
    $("#dateLine").textContent = now.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    // Greeting in the widget and in the hero
    const { text, emoji } = getGreeting(hours);
    $("#greeting").textContent = `${text}! ${emoji}`;
    $("#heroGreeting").textContent = `${emoji}  ${text}, welcome to Lumio`;

    // How much of the day has passed
    const secondsToday = hours * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const dayPercent = (secondsToday / 86400) * 100;
    $("#dayProgress").style.width = `${dayPercent.toFixed(1)}%`;
    $("#dayText").textContent = `${dayPercent.toFixed(1)}% of today has passed`;
};

const initClock = () => {
    const button = $("#formatToggle");

    const updateButton = () => {
        button.textContent = use24Hour ? "12-hour" : "24-hour";
        button.setAttribute("aria-pressed", String(use24Hour));
    };

    button.addEventListener("click", () => {
        use24Hour = !use24Hour;
        storage.set("lumio-24h", String(use24Hour));
        updateButton();
        updateClock();
    });

    updateButton();
    updateClock();
    setInterval(updateClock, 1000);
};

/* ---------------------------------------------------------------------------
   7. RANDOM QUOTE GENERATOR
   Picks a different quote each time, with a fade. Click "Like" or
   double-click the quote to save it as a favourite.
--------------------------------------------------------------------------- */

let currentQuote = 0;
const likedQuotes = new Set();

const showQuote = (index) => {
    const box = $("#quoteBox");
    const { text, author } = quotes[index];

    box.classList.add("fade-out");             // fade the old quote out

    setTimeout(() => {
        $("#quoteText").textContent = text;    // change the text
        $("#quoteAuthor").textContent = author;
        box.classList.remove("fade-out");      // fade the new quote in
        updateLikeState();
    }, reduceMotion ? 0 : 300);
};

const newRandomQuote = () => {
    // Keep picking until we get a different quote from the one on screen
    let next;
    do {
        next = Math.floor(Math.random() * quotes.length);
    } while (next === currentQuote && quotes.length > 1);

    currentQuote = next;
    showQuote(currentQuote);
};

const updateLikeState = () => {
    const liked = likedQuotes.has(currentQuote);
    const likeButton = $("#likeQuote");

    likeButton.setAttribute("aria-pressed", String(liked));
    likeButton.lastChild.textContent = liked ? " Liked" : " Like";
    $("#quoteBox").classList.toggle("liked", liked);
    $("#favCount").textContent = `${likedQuotes.size} liked`;
};

const toggleLike = () => {
    if (likedQuotes.has(currentQuote)) {
        likedQuotes.delete(currentQuote);
        showToast("Removed from your favourites");
    } else {
        likedQuotes.add(currentQuote);
        showToast("Added to your favourites ♥");
    }
    storage.set("lumio-liked", JSON.stringify([...likedQuotes]));
    updateLikeState();
};

// A small heart that floats up where the quote was double-clicked
const popHeart = (event) => {
    const box = $("#quoteBox");
    const rect = box.getBoundingClientRect();
    const heart = document.createElement("span");

    heart.className = "heart-pop";
    heart.textContent = "♥";
    heart.style.left = `${event.clientX - rect.left - 12}px`;
    heart.style.top = `${event.clientY - rect.top - 20}px`;

    box.style.position = "relative";
    box.appendChild(heart);
    setTimeout(() => heart.remove(), 900);   // remove the element after the animation
};

const initQuotes = () => {
    // Restore liked quotes from last time
    try {
        const saved = JSON.parse(storage.get("lumio-liked", "[]"));
        saved.forEach((index) => likedQuotes.add(index));
    } catch (error) {
        /* ignore broken data */
    }

    $("#newQuote").addEventListener("click", newRandomQuote);
    $("#likeQuote").addEventListener("click", toggleLike);

    // dblclick event: like the quote and show a heart
    $("#quoteBox").addEventListener("dblclick", (event) => {
        window.getSelection().removeAllRanges();   // stop the double-click from selecting text
        if (!likedQuotes.has(currentQuote)) {
            toggleLike();
        }
        popHeart(event);
    });

    newRandomQuote();
};

/* ---------------------------------------------------------------------------
   8. KEYBOARD SHORTCUTS (keypress event)
   Q = new quote, T = switch theme. Ignored while typing in a form field.
--------------------------------------------------------------------------- */

const initShortcuts = () => {
    document.addEventListener("keypress", (event) => {
        const typingInField = ["INPUT", "TEXTAREA"].includes(event.target.tagName);
        if (typingInField) return;

        const key = event.key.toLowerCase();

        if (key === "q") {
            newRandomQuote();
            showToast("New quote (shortcut Q)", 1500);
        } else if (key === "t") {
            toggleTheme();
        }
    });
};

/* ---------------------------------------------------------------------------
   9. RENDERING LISTS FROM ARRAYS
   Each function turns an array of data into HTML with map() and template
   literals, then puts it on the page with innerHTML.
--------------------------------------------------------------------------- */

const renderLogos = () => {
    // The list is written twice so the scrolling strip loops without a gap
    const items = [...companies, ...companies]
        .map((name, i) => `<li${i >= companies.length ? ' aria-hidden="true"' : ""}>${name}</li>`)
        .join("");
    $("#logoTrack").innerHTML = items;
};

const renderStats = () => {
    $("#statList").innerHTML = stats
        .map(({ label, value, suffix }) => `
            <li>
                <span>${label}</span>
                <strong class="count" data-target="${value}" data-suffix="${suffix}">0</strong>
            </li>`)
        .join("");
};

const renderServices = () => {
    $("#serviceGrid").innerHTML = services
        .map((service, index) => `
            <article class="service-card js-reveal" data-index="${index}" tabindex="0">
                <span class="icon"><img src="assets/icons/${service.icon}" alt="" width="26" height="26"></span>
                <h3>${service.title}</h3>
                <p class="muted">${service.short}</p>
                <p class="more" hidden>${service.detail}</p>
            </article>`)
        .join("");
};

let billing = "monthly";

const renderPricing = () => {
    $("#priceGrid").innerHTML = plans
        .map((plan) => {
            const price = billing === "monthly" ? plan.monthly : plan.yearly;
            const period = billing === "monthly" ? "/month" : "/year";
            const featureList = plan.features.map((feature) => `<li>${feature}</li>`).join("");

            return `
                <article class="price-card${plan.popular ? " popular" : ""}">
                    ${plan.popular ? '<span class="tag">Most popular</span>' : ""}
                    <h3>${plan.name}</h3>
                    <p class="muted small">${plan.note}</p>
                    <p class="price">${price === 0 ? "Free" : `&#8377;${formatNumber(price)}`}${price === 0 ? "" : `<small>${period}</small>`}</p>
                    <ul>${featureList}</ul>
                    <a href="#register" class="btn ${plan.popular ? "btn-gold" : "btn-outline"}" data-plan="${plan.name}">
                        ${price === 0 ? "Start free" : `Choose ${plan.name}`}
                    </a>
                </article>`;
        })
        .join("");
};

const renderFaq = () => {
    $("#faqList").innerHTML = faqs
        .map(({ question, answer }, index) => `
            <div class="faq-item">
                <button type="button" class="faq-question" aria-expanded="false" aria-controls="faq-answer-${index}">
                    <span>${question}</span>
                    <span class="sign" aria-hidden="true">+</span>
                </button>
                <div class="faq-answer" id="faq-answer-${index}" hidden>
                    <p>${answer}</p>
                </div>
            </div>`)
        .join("");
};

/* ---------------------------------------------------------------------------
   10. SERVICE CARDS: mouseover, mouseleave and dblclick
--------------------------------------------------------------------------- */

const initServiceCards = () => {
    const status = $("#hoverStatus");
    const defaultText = "Hover over a service to learn more.";

    $$(".service-card").forEach((card) => {
        const { title } = services[Number(card.dataset.index)];
        const more = $(".more", card);

        // mouseover: highlight the card and show its details
        card.addEventListener("mouseover", () => {
            card.classList.add("is-hovered");
            more.hidden = false;
            status.innerHTML = `You are looking at <strong>${title}</strong>. Double-click to pin it.`;
        });

        // mouseleave: undo the changes
        card.addEventListener("mouseleave", () => {
            card.classList.remove("is-hovered");
            if (!card.classList.contains("is-pinned")) {
                more.hidden = true;
            }
            status.textContent = defaultText;
        });

        // dblclick: pin or unpin the card
        card.addEventListener("dblclick", () => {
            window.getSelection().removeAllRanges();
            const pinned = card.classList.toggle("is-pinned");

            if (pinned) {
                card.insertAdjacentHTML("afterbegin", '<span class="pin-badge">Pinned</span>');
                more.hidden = false;
                showToast(`${title} pinned`);
            } else {
                $(".pin-badge", card)?.remove();
                showToast(`${title} unpinned`);
            }

            const pinnedCount = $$(".service-card.is-pinned").length;
            status.innerHTML = `<strong>${pinnedCount}</strong> service${pinnedCount === 1 ? "" : "s"} pinned.`;
        });

        // Keyboard users: focus works like hover
        card.addEventListener("focus", () => card.dispatchEvent(new Event("mouseover")));
        card.addEventListener("blur", () => card.dispatchEvent(new Event("mouseleave")));
    });
};

/* ---------------------------------------------------------------------------
   11. PRICING TOGGLE (monthly / yearly)
--------------------------------------------------------------------------- */

const initPricing = () => {
    const buttons = $$(".billing-btn");

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            billing = button.dataset.billing;

            // Move the active class to the clicked button
            buttons.forEach((b) => {
                b.classList.toggle("is-active", b === button);
                b.setAttribute("aria-pressed", String(b === button));
            });

            renderPricing();
        });
    });

    renderPricing();
};

/* ---------------------------------------------------------------------------
   12. FAQ SHOW / HIDE (click event)
   One click listener on the list handles every question (event delegation).
--------------------------------------------------------------------------- */

const initFaq = () => {
    $("#faqList").addEventListener("click", (event) => {
        const button = event.target.closest(".faq-question");
        if (!button) return;

        const item = button.parentElement;
        const answer = $(".faq-answer", item);
        const isOpen = item.classList.toggle("open");

        answer.hidden = !isOpen;                                 // show or hide
        button.setAttribute("aria-expanded", String(isOpen));
    });
};

/* ---------------------------------------------------------------------------
   13. CHARACTER COUNTER (input event)
--------------------------------------------------------------------------- */

const updateCounter = () => {
    const textarea = $("#about");
    const max = Number(textarea.getAttribute("maxlength"));
    const length = textarea.value.length;
    const counter = $("#charCounter");
    const percent = (length / max) * 100;

    counter.textContent = `${length} / ${max}`;
    $("#counterBar").style.width = `${percent}%`;

    // Change the colour as the limit gets closer
    counter.classList.toggle("warn", percent >= 80 && percent < 100);
    counter.classList.toggle("full", percent >= 100);
    $("#counterBar").style.backgroundColor = percent >= 100 ? "var(--error)" : "";
};

const initCounter = () => {
    $("#about").addEventListener("input", updateCounter);
    updateCounter();
};

/* ---------------------------------------------------------------------------
   14. REGISTRATION FORM VALIDATION
   - Required fields, email format, phone format
   - Password at least 8 characters, and both passwords must match
   - Checked live while typing (input event) and again on submit
   - The page never reloads (event.preventDefault())
--------------------------------------------------------------------------- */

const patterns = {
    name: /^[A-Za-z][A-Za-z .'-]{2,}$/,
    email: /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/,
    phone: /^[6-9]\d{9}$/
};

// Each rule returns an error message, or an empty string when the value is fine
const validators = {
    fullName: (value) => {
        if (value === "") return "Please enter your full name.";
        if (!patterns.name.test(value)) return "Use at least 3 letters (letters and spaces only).";
        return "";
    },
    email: (value) => {
        if (value === "") return "Please enter your email address.";
        if (!patterns.email.test(value)) return "That doesn't look like a valid email (e.g. name@example.com).";
        return "";
    },
    phone: (value) => {
        if (value === "") return "Please enter your phone number.";
        if (!/^\d+$/.test(value)) return "Use digits only.";
        if (value.length !== 10) return `Phone number must be 10 digits (you typed ${value.length}).`;
        if (!patterns.phone.test(value)) return "Indian mobile numbers start with 6, 7, 8 or 9.";
        return "";
    },
    password: (value) => {
        if (value === "") return "Please create a password.";
        if (value.length < 8) return `Password must be at least 8 characters (${8 - value.length} more to go).`;
        return "";
    },
    confirmPassword: (value) => {
        if (value === "") return "Please confirm your password.";
        if (value !== $("#password").value) return "Passwords do not match.";
        return "";
    }
};

const fieldIds = Object.keys(validators);

// Check one field, show or clear its message, and return true if valid
const validateField = (id) => {
    const input = $(`#${id}`);
    const message = validators[id](input.value.trim());

    $(`#${id}Error`).textContent = message;
    input.classList.toggle("invalid", message !== "");
    input.classList.toggle("valid", message === "");
    input.setAttribute("aria-invalid", String(message !== ""));

    return message === "";
};

// Password strength: one point for each rule met
const checkStrength = (password) => {
    const rules = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /\d/.test(password),
        /[^A-Za-z0-9]/.test(password)
    ];
    const score = rules.filter(Boolean).length;

    const levels = [
        { text: "Password strength", color: "transparent" },
        { text: "Very weak", color: "#ef4444" },
        { text: "Weak", color: "#f97316" },
        { text: "Okay", color: "#eab308" },
        { text: "Strong", color: "#ffc300" },
        { text: "Very strong", color: "#22c55e" }
    ];
    const level = password === "" ? levels[0] : levels[score];

    $("#strengthBar").style.width = password === "" ? "0" : `${score * 20}%`;
    $("#strengthBar").style.backgroundColor = level.color;
    $("#strengthText").textContent = password === "" ? level.text : `Strength: ${level.text}`;
};

// Tick the checklist next to the form
const updateRules = () => {
    const values = {
        name: $("#fullName").value.trim(),
        email: $("#email").value.trim(),
        phone: $("#phone").value.trim(),
        password: $("#password").value,
        confirm: $("#confirmPassword").value
    };

    const done = {
        name: patterns.name.test(values.name),
        email: patterns.email.test(values.email),
        phone: patterns.phone.test(values.phone),
        length: values.password.length >= 8,
        match: values.confirm !== "" && values.confirm === values.password
    };

    $$("#ruleList li").forEach((li) => {
        li.classList.toggle("done", done[li.dataset.rule]);
    });
};

const clearForm = () => {
    fieldIds.forEach((id) => {
        $(`#${id}`).classList.remove("valid", "invalid");
        $(`#${id}`).removeAttribute("aria-invalid");
        $(`#${id}Error`).textContent = "";
    });
    checkStrength("");
    $$("#ruleList li").forEach((li) => li.classList.remove("done"));
};

const initForm = () => {
    const form = $("#registerForm");
    const successBox = $("#successBox");
    const submitBtn = $("#submitBtn");

    // Remove anything that is not a digit if text is pasted into the phone field
    // (added first so it runs before the phone number is validated)
    $("#phone").addEventListener("input", (event) => {
        event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);
    });

    // input event: check each field while the user types
    fieldIds.forEach((id) => {
        const input = $(`#${id}`);

        input.addEventListener("input", () => {
            input.dataset.touched = "true";
            validateField(id);

            // Re-check the confirm field when the password changes
            if (id === "password") {
                checkStrength(input.value);
                if ($("#confirmPassword").dataset.touched) validateField("confirmPassword");
            }
            updateRules();
        });
    });

    // keypress event: only digits can be typed in the phone field
    $("#phone").addEventListener("keypress", (event) => {
        if (!/[0-9]/.test(event.key)) {
            event.preventDefault();
            $("#phoneError").textContent = "Only numbers are allowed here.";
        }
    });

    // Show / hide password buttons
    $$(".eye-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const input = $(`#${button.dataset.target}`);
            const show = input.type === "password";

            input.type = show ? "text" : "password";
            $("img", button).src = show ? "assets/icons/eye-off.svg" : "assets/icons/eye.svg";
            button.setAttribute("aria-label", show ? "Hide password" : "Show password");
        });
    });

    // submit event: check everything without reloading the page
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const results = fieldIds.map((id) => validateField(id));
        const allValid = results.every(Boolean);
        updateRules();

        if (!allValid) {
            // Focus the first field with an error and shake the card
            const firstInvalid = fieldIds.find((id, i) => !results[i]);
            $(`#${firstInvalid}`).focus();

            const card = $(".form-card");
            card.classList.remove("shake");
            void card.offsetWidth;          // restart the animation
            card.classList.add("shake");

            const errorCount = results.filter((ok) => !ok).length;
            showToast(`Please fix ${errorCount} field${errorCount > 1 ? "s" : ""} before continuing.`);
            return;
        }

        // All good: pretend to send the data, then show the success message
        const user = {
            name: $("#fullName").value.trim(),
            email: $("#email").value.trim(),
            phone: `+91 ${$("#phone").value}`
        };
        const firstName = user.name.split(" ")[0];

        submitBtn.disabled = true;
        submitBtn.textContent = "Creating account...";

        setTimeout(() => {
            form.reset();                 // clears the fields (also fires the reset handler below)
            form.hidden = true;           // hide the form
            successBox.hidden = false;    // show the success message

            $("#successTitle").textContent = `Welcome aboard, ${firstName}!`;
            $("#successText").textContent = `Your account is ready. We sent a confirmation to ${user.email}.`;

            submitBtn.disabled = false;
            submitBtn.textContent = "Create account";
            showToast("Registration successful ✓");
            $("#registerAgain").focus();
        }, reduceMotion ? 0 : 900);
    });

    // reset event: also clear the messages and colours
    form.addEventListener("reset", () => {
        setTimeout(() => {
            clearForm();
            fieldIds.forEach((id) => delete $(`#${id}`).dataset.touched);
            updateCounter();
        }, 0);
    });

    // Show the form again
    $("#registerAgain").addEventListener("click", () => {
        successBox.hidden = true;
        form.hidden = false;
        $("#fullName").focus();
    });

    // Pricing buttons fill in a message in the "About your team" box
    $("#priceGrid").addEventListener("click", (event) => {
        const link = event.target.closest("[data-plan]");
        if (!link) return;
        const about = $("#about");
        if (about.value.trim() === "") {
            about.value = `Interested in the ${link.dataset.plan} plan (${billing}).`;
            updateCounter();
        }
    });
};

/* ---------------------------------------------------------------------------
   15. TYPING EFFECT, REVEAL ON SCROLL, COUNTERS
--------------------------------------------------------------------------- */

const initTyping = () => {
    const element = $("#typing");
    if (reduceMotion) return;

    let wordIndex = 0;
    let charIndex = audiences[0].length;
    let deleting = true;

    const type = () => {
        const word = audiences[wordIndex];
        element.textContent = word.slice(0, charIndex);

        if (deleting) {
            charIndex--;
            if (charIndex < 0) {
                deleting = false;
                wordIndex = (wordIndex + 1) % audiences.length;
                charIndex = 0;
            }
        } else {
            charIndex++;
            if (charIndex > audiences[wordIndex].length) {
                deleting = true;
                setTimeout(type, 1600);   // pause on the full word
                return;
            }
        }
        setTimeout(type, deleting ? 45 : 85);
    };

    setTimeout(type, 2200);
};

// Count a number up from 0 to its target
const countUp = (element) => {
    const target = Number(element.dataset.target);
    const suffix = element.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
        const progress = clamp((now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);          // slow down at the end
        element.textContent = formatNumber(Math.round(target * eased)) + suffix;
        if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
};

const initReveal = () => {
    // Add the reveal class to the main blocks of each section
    $$(".section-head, .widget, .price-card, .faq-item, .form-card, .register-intro, .hover-status")
        .forEach((el) => el.classList.add("js-reveal"));

    const targets = $$(".js-reveal");
    const counters = $$(".count");

    // Older browsers or reduced motion: show everything straight away
    if (!("IntersectionObserver" in window) || reduceMotion) {
        targets.forEach((el) => el.classList.add("is-visible"));
        counters.forEach((el) => {
            el.textContent = formatNumber(Number(el.dataset.target)) + (el.dataset.suffix || "");
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;

            if (el.classList.contains("count")) {
                countUp(el);
            } else {
                el.classList.add("is-visible");
            }
            observer.unobserve(el);
        });
    }, { threshold: 0.15 });

    [...targets, ...counters].forEach((el) => observer.observe(el));
};

/* ---------------------------------------------------------------------------
   16. HERO: 3D GOLDEN TUNNEL AND WARP DUST
   Scrolling moves every ring and card towards the viewer along the Z axis.
   The mouse gently tilts the whole tunnel. A canvas draws golden dust
   flying past like stars at warp speed.
--------------------------------------------------------------------------- */

const tilt = { x: 0, y: 0, targetX: 0, targetY: 0 };

const initHero = () => {
    const hero = $(".hero");
    const world = $("#world");
    const heroUI = $("#heroUI");
    const meterFill = $("#meterFill");
    const TRAVEL = 3000;               // how far (in px) the tunnel moves while scrolling

    // Read the position of every 3D item from its data- attributes
    const items = $$("[data-z]", world).map((el) => ({
        el,
        x: Number(el.dataset.x || 0),
        y: Number(el.dataset.y || 0),
        z: Number(el.dataset.z),
        spin: Number(el.dataset.spin || 0),
        isCard: el.classList.contains("fcard"),
        seed: Math.random() * 6.28
    }));

    let heroProgress = 0;
    let time = 0;
    let lastNow = performance.now();

    // mousemove: remember where the pointer is (-1 to 1)
    window.addEventListener("mousemove", (event) => {
        tilt.targetX = (event.clientX / window.innerWidth) * 2 - 1;
        tilt.targetY = (event.clientY / window.innerHeight) * 2 - 1;
    });

    // 0 at the top of the hero, 1 when the hero has been scrolled through
    const getProgress = () => {
        const rect = hero.getBoundingClientRect();
        const distance = rect.height - window.innerHeight;
        return distance > 0 ? clamp(-rect.top / distance) : 0;
    };

    const frame = (now) => {
        const dt = Math.min(now - lastNow, 50);
        lastNow = now;
        if (!reduceMotion) time += dt;

        // Ease towards the real values for a smooth feel
        heroProgress += (getProgress() - heroProgress) * (reduceMotion ? 1 : 0.08);
        tilt.x += ((reduceMotion ? 0 : tilt.targetX) - tilt.x) * 0.06;
        tilt.y += ((reduceMotion ? 0 : tilt.targetY) - tilt.y) * 0.06;

        // Only do the work while the hero is on screen
        if (hero.getBoundingClientRect().bottom > 0) {
            world.style.transform = `rotateX(${-tilt.y * 6}deg) rotateY(${tilt.x * 9}deg)`;

            const vw = window.innerWidth / 100;
            const vh = window.innerHeight / 100;

            for (const item of items) {
                const z = item.z + heroProgress * TRAVEL;
                const bob = item.isCard ? Math.sin(time / 900 + item.seed) * 10 : 0;
                const rotation = item.spin
                    ? item.spin * (time / 60 + heroProgress * 120)
                    : (item.isCard ? Math.sin(time / 1300 + item.seed) * 3 : 0);

                // Fade in from far away, fade out just before reaching the viewer
                const opacity = clamp((z + 3400) / 900) * clamp(1 - (z - 250) / 450);

                item.el.style.opacity = opacity;
                item.el.style.visibility = opacity <= 0.01 ? "hidden" : "visible";
                item.el.style.transform =
                    `translate(-50%, -50%) translate3d(${item.x * vw}px, ${item.y * vh + bob}px, ${z}px) rotateZ(${rotation}deg)`;
            }

            // Fade the buttons and text away as the visitor dives in
            heroUI.style.opacity = clamp(1 - heroProgress * 5);
            heroUI.style.visibility = heroProgress > 0.22 ? "hidden" : "visible";
            meterFill.style.strokeDashoffset = 163.4 * (1 - heroProgress);
        }

        requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
};

const initDust = () => {
    const hero = $(".hero");
    const canvas = $("#dust");
    const ctx = canvas.getContext("2d");

    let particles = [];
    let dpr = 1;
    let lastScroll = window.scrollY;
    let speedBoost = 0;

    // One particle = a position in 3D space (z = 1 far away, z = 0 at the screen)
    const createParticle = (anywhere) => ({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: anywhere ? Math.random() * 0.95 + 0.05 : 1,
        gold: Math.random() < 0.7
    });

    const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;

        const count = window.innerWidth < 576 ? 110 : 220;
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(createParticle(true));
        }
    };

    const draw = () => {
        const W = window.innerWidth;
        const H = window.innerHeight;
        const centerX = W / 2 - tilt.x * 40;
        const centerY = H / 2 - tilt.y * 30;
        const isLight = document.documentElement.getAttribute("data-theme") === "light";

        // Scrolling faster makes the dust fly faster
        const scrollY = window.scrollY;
        speedBoost += (Math.min(Math.abs(scrollY - lastScroll), 120) * 0.00012 - speedBoost) * 0.1;
        lastScroll = scrollY;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

        if (hero.getBoundingClientRect().bottom > 0) {
            particles.forEach((p, i) => {
                const previousZ = p.z;
                if (!reduceMotion) p.z -= 0.0025 + speedBoost;
                if (p.z <= 0.02) {
                    particles[i] = createParticle(false);
                    return;
                }

                // Project the 3D point onto the 2D screen
                const k = 0.5 * Math.max(W, H);
                const x = centerX + (p.x / p.z) * k;
                const y = centerY + (p.y / p.z) * k;
                const px = centerX + (p.x / previousZ) * k;
                const py = centerY + (p.y / previousZ) * k;
                const alpha = Math.min(1, (1 - p.z) * 1.4);

                // Gold streaks, plus white ones (dark theme) or black ones (light theme)
                const otherColour = isLight ? `rgba(11, 11, 15, ${alpha * 0.55})` : `rgba(255, 255, 255, ${alpha * 0.8})`;
                ctx.strokeStyle = p.gold ? `rgba(255, 195, 0, ${alpha})` : otherColour;
                ctx.lineWidth = (1 - p.z) * 2.6 + 0.3;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(x + (x - px) * 2, y + (y - py) * 2);
                ctx.stroke();
            });
        }

        requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(draw);
};

/* ---------------------------------------------------------------------------
   17. START EVERYTHING
   The script tag uses "defer", so the HTML is ready when this runs.
--------------------------------------------------------------------------- */

const init = () => {
    // Build the parts of the page that come from arrays
    renderLogos();
    renderStats();
    renderServices();
    renderFaq();

    // Turn on each feature
    initTheme();
    initNav();
    initScrollEffects();
    initClock();
    initQuotes();
    initShortcuts();
    initServiceCards();
    initPricing();
    initFaq();
    initCounter();
    initForm();
    initTyping();
    initReveal();
    initHero();
    initDust();

    // Footer year
    $("#year").textContent = new Date().getFullYear();
};

init();
