document.addEventListener("DOMContentLoaded", () => {
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Initial Loading Animation
    const tl = gsap.timeline();
    // Fade in intro title
    tl.fromTo(".hero-title",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power4.out", delay: 0.2 }
    );

    // Fade in subtitle
    tl.fromTo(".hero-subtitle",
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: "power2.out" },
        "-=0.6"
    );

    // Fade in hero image smoothly
    tl.fromTo(".hero-image",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, ease: "power3.out" },
        "-=0.8"
    );

    // Stagger fade in the floating elements
    tl.fromTo(".floating-element",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out" },
        "-=0.8"
    );

    // Fade in Nav
    tl.fromTo(".nav",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power2.out" },
        "-=0.8"
    );

    // Parallax effect on the floating elements on scroll
    gsap.utils.toArray(".floating-element").forEach((el, i) => {
        gsap.to(el, {
            y: (i + 1) * -30,
            ease: "none",
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    });

    // Subtly parallax the portfolio section entry
    gsap.fromTo(".slider-container",
        { opacity: 0, scale: 0.98 },
        {
            opacity: 1,
            scale: 1,
            duration: 1.5,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".portfolio",
                start: "top 80%",
            }
        }
    );

    // Contact Page Entrance Animation
    gsap.fromTo(".contact-content",
        { y: 50, opacity: 0 },
        {
            y: 0, opacity: 1, duration: 1.2, ease: "power3.out",
            scrollTrigger: {
                trigger: ".contact",
                start: "top 75%",
            }
        }
    );

    // ----- VIDEO CARDS HANDLING -----
    const sliderContainer = document.getElementById("slider");
    window.playersMap = new Map();

    window.updateSliderState = function () {
        let isAnyPlaying = false;
        window.playersMap.forEach(p => {
            if (p.isPlaying) isAnyPlaying = true;
        });
        if (isAnyPlaying) {
            sliderContainer.classList.add("is-playing");
        } else {
            sliderContainer.classList.remove("is-playing");
        }
    };

    document.querySelectorAll('.custom-play-overlay').forEach(overlay => {
        overlay.addEventListener("click", function () {
            const card = this.closest('.card');
            const iframe = card.querySelector('iframe');

            // Pause others
            window.playersMap.forEach((p, c) => {
                if (c !== card && p.pause) p.pause();
            });

            // Play this
            card.classList.add('is-active');
            sliderContainer.classList.add('is-playing');

            const p = window.playersMap.get(card);
            if (p && p.play) {
                p.play();
                p.isPlaying = true;
            } else if (iframe.id && iframe.id.startsWith('yt')) {
                // YT fallback: if onReady API failed locally, force autoplay in url
                if (typeof iframe.src === 'string' && !iframe.src.includes('autoplay=1')) {
                    const sep = iframe.src.includes('?') ? '&' : '?';
                    iframe.src = iframe.src + sep + 'autoplay=1';
                }
            }
        });
    });

    // Initialize Vimeo Players
    const vimeoIframes = document.querySelectorAll('.vimeo-player');
    vimeoIframes.forEach(iframe => {
        const card = iframe.closest('.card');
        const player = new Vimeo.Player(iframe);

        window.playersMap.set(card, {
            pause: () => player.pause(),
            play: () => player.play(),
            isPlaying: false
        });

        player.on('play', () => {
            const p = window.playersMap.get(card);
            if (p) p.isPlaying = true;
            card.classList.add('is-active');
            window.updateSliderState();
        });

        player.on('pause', () => {
            const p = window.playersMap.get(card);
            if (p) p.isPlaying = false;
            card.classList.remove('is-active');
            window.updateSliderState();
        });

        player.on('ended', () => {
            const p = window.playersMap.get(card);
            if (p) p.isPlaying = false;
            card.classList.remove('is-active');
            window.updateSliderState();
        });
    });
});

// YouTube API initialization
window.onYouTubeIframeAPIReady = function () {
    const initYT = () => {
        const ytIframes = document.querySelectorAll('iframe[id^="yt-"]');
        ytIframes.forEach(iframe => {
            const card = iframe.closest('.card');
            const player = new YT.Player(iframe.id, {
                events: {
                    'onReady': () => {
                        if (!window.playersMap) window.playersMap = new Map();

                        window.playersMap.set(card, {
                            pause: () => player.pauseVideo(),
                            play: () => player.playVideo(),
                            isPlaying: false
                        });
                    },
                    'onStateChange': (event) => {
                        const p = window.playersMap.get(card);
                        if (!p) return;
                        if (event.data === YT.PlayerState.PLAYING) {
                            p.isPlaying = true;
                            card.classList.add('is-active');
                        } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                            p.isPlaying = false;
                            card.classList.remove('is-active');
                        }
                        if (window.updateSliderState) window.updateSliderState();
                    }
                }
            });
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initYT);
    } else {
        initYT();
    }
};
