// config
const SITE = {
    name: "NEGATIVE POSITIVE",
    tagline: "It's music y'all! Come get ya some!",
    // added footer handling just in case, but we don't need it at the moment
    footer: "",

    links: [
        { group: "Watch", title: "Youtube",
            href: "https://www.youtube.com/@negativepositiveband" },

        { group: "Watch", title: "Facebook",
            href: "https://www.facebook.com/negative.positive.band" },

        { group: "Watch", title: "Instagram",
            href: "https://www.instagram.com/negative_positive_band/" },

        { group: "Listen", title: "Bandcamp",
            href: "https://negpos.bandcamp.com/" },

        { group: "Listen", title: "Spotify",
            // not sure if this url will break in the future...
            href: "https://open.spotify.com/artist/4a0xsQZup2a15RQSK1WA95?si=gnkprPsrT26gefXAXB6Gtw" },

        { group: "Listen", title: "Apple Music",
            // same here; no idea how stable IDs are
            href: "https://music.apple.com/gb/artist/negative-positive/1681128066" },

        { group: "Contact", title: "Communicate your desires",
            href: "mailto:negativepositiveband@gmail.com" },
    ],

    embeddedVideos: [
        { src: youtubeEmbedUrl("gnyHd7qu700"), title: "Walking on the Moon" },
        { src: youtubeEmbedUrl("tJz1gMCwtm8", "105"), title: "Fat Robot" },
        { src: youtubeEmbedUrl("mlQSkkYLdpQ"), title: "Cash Me Outside" },
        { src: youtubeEmbedUrl("qkCpuGXvdw4"), title: "Inspector Gadget" },
        { src: youtubeEmbedUrl("5NSiymvJvAc"), title: "Jazznophobia" },
        { src: youtubeEmbedUrl("cNXwSBcl0Fo"), title: "Chameleon" },
        { src: youtubeEmbedUrl("aOCmToZpq7E"), title: "Not Enough Stars" },
        { src: youtubeEmbedUrl("hF_XOiWrNPU"), title: "Sapera" },
    ],

    about: [
        "Since the dawn of time, at the boundary of each celestial epoch...",
        "Three divine beings descend upon the material plane, armed with arcane knowledge and esoteric secrets...",
        "They seek to usher in a new age; a catalyst of cosmic metamorphosis.",
        "BEHOLD!",
        "Embrace their sonorous magicks; allow their divine tunes to envelop your consciousness!",
        "Turn Negative to Positive."
    ]
};
// end config

// easy to extend routes in the future
const routes = {
    "/":      { label: "Links", title: "Links", render: renderLinks },
    "/about": { label: "About", title: "About", render: renderAbout }
};

const $ = (id) => document.getElementById(id);

function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
        if (k === "class") node.className = v;
        else node.setAttribute(k, v);
    }
    for (const c of children) node.append(c);
    return node;
}

function displayHost(href) {
    try {
        const u = new URL(href);
        return u.protocol === "mailto:" ? "via Email" : u.hostname.replace(/^www\./, "");
    } catch { return ""; }
}

function renderLinks() {
    const frag = document.createDocumentFragment();
    const groups = [...new Set(SITE.links.map(l => l.group))];

    for (const g of groups) {
        frag.append(el("h2", { class: "group" }, g));
        const ul = el("ul", { class: "links" });
        for (const l of SITE.links.filter(x => x.group === g)) {
            const external = /^https?:/.test(l.href);
            const a = el("a", { href: l.href },
                el("span", { class: "title" }, l.title),
                el("span", { class: "host" }, displayHost(l.href))
            );
            if (external) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
            ul.append(el("li", {}, a));
        }
        frag.append(ul);
    }
    // random selection of 3 videos on each load.
    // we may determine that a static selection is preferable, but I thought this would be neat.
    const videoSelection = [...SITE.embeddedVideos]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    videoSelection.map(x => frag.append(renderVideo(x)));
    return frag;
}

function youtubeEmbedUrl(id, start = "0") {
    // youtube video id is the string after the 'watch?v=' token.
    // e.g: https://www.youtube.com/watch?v=tJz1gMCwtm8 => tJz1gMCwtm8
    // could parameterize more in the future, but there's not many useful settings exposed for our purposes.
    const params = new URLSearchParams({
        rel: "0", // end-screen suggestions limited our channel
        cc_load_policy: "0",
        playsinline: "1",
        start: start
    });
    return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}

function renderVideo({ src, title }) {
    const iframe = el("iframe", {
        src,
        title,
        loading: "lazy",
        allow: "accelerometer; encrypted-media; picture-in-picture; fullscreen",
        allowfullscreen: "",
        referrerpolicy: "strict-origin-when-cross-origin"
    });
    return el("div", { class: "video" }, iframe);
}

function renderAbout() {
    const wrap = el("div", { class: "prose" });
    SITE.about.forEach(p => wrap.append(el("p", {}, p)));
    return wrap;
}

function renderNotFound() {
    const back = el("a", { href: "#/" }, "Go back to the links");
    const msg = el("p", {},
        "There's nothing at this address. ",
        back,
        "."
    );
    return el("div", { class: "prose" },
        el("h2", {}, "Page not found"),
        msg
    );
}

function currentPath() {
    const path = location.hash.replace(/^#/, "") || "/";
    return path.length > 1 ? path.replace(/\/$/, "") : path;
}

let firstRender = true;
function render() {
    const path = currentPath();
    const route = routes[path];

    // nav
    const nav = $("nav");
    nav.replaceChildren();
    for (const [p, r] of Object.entries(routes)) {
        const a = el("a", { href: "#" + p }, r.label);
        if (p === path) a.setAttribute("aria-current", "page");
        nav.append(a);
    }

    // view
    $("view").replaceChildren(route ? route.render() : renderNotFound());
    document.title = (route ? route.title + " · " : "Not found · ") + SITE.name;

    // move focus on navigation (not on first load) so screen readers notice the change
    if (!firstRender) { $("name").focus({ preventScroll: true }); window.scrollTo(0, 0); }
    firstRender = false;
}

$("name").textContent = SITE.name;
$("tagline").textContent = SITE.tagline;
$("footer").textContent = SITE.footer;
window.addEventListener("hashchange", render);
render();
