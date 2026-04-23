const preloader = document.querySelector(".preloader")
const header = document.querySelector(".header")
const iconMenu = document.querySelector('.icon-menu');
const mobMenu = document.querySelector('.header__mob');
const modals = document.querySelectorAll(".modal")
const successModal = document.querySelector("#success-modal")
const errorModal = document.querySelector("#error-modal")
const cookiePopup = document.querySelector("#cookie-popup")
const pageUp = document.querySelector(".page-up")
let animSpd = 400

let bp = {
    largeDesktop: 1450.98,
    desktop: 1250.98,
    laptop: 1100.98,
    tablet: 767.98,
    phone: 575.98,
    phoneSm: 479.98
}
// === Utils ===
const Utils = {
    init() {
        // Сookie
        this.CookieUtils.init();
        // Скролл и header
        this.ScrollUtils.init();
        // Модалки
        this.ModalUtils.init();
        // Формы
        this.FormUtils.init();
    },
    ScrollUtils: {
        init() {
            this.initCustomScroll()
            this.initPageUp()
            this.initHeaderScroll()
        },
        isIOS: (() => {
            const platform = navigator.platform;
            const userAgent = navigator.userAgent;
            return (
                /(iPhone|iPod|iPad)/i.test(platform) ||
                (platform === 'MacIntel' && navigator.maxTouchPoints > 1 && !window.MSStream) ||
                (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream)
            );
        })(),
        initCustomScroll() {
            const customScroll = document.querySelectorAll(".custom-scroll");
            const isFirefox = typeof InstallTrigger !== 'undefined';
            if (!isFirefox || !customScroll.length) return;
            document.documentElement.style.scrollbarWidth = "thin";
            document.documentElement.style.scrollbarColor = "#675caa #faf9ff";
            customScroll.forEach(item => { item.style.scrollbarWidth = "thin"; item.style.scrollbarColor = "#675caa transparent" });
        },
        initPageUp() {
            if (!pageUp) return;
            pageUp.addEventListener("click", () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        },
        initHeaderScroll() {
            if (!header) return;
            let lastScroll = this.scrollPos();
            window.addEventListener("scroll", () => {
                const currentScroll = this.scrollPos();
                if (currentScroll > 1) {
                    header.classList.add("scroll");

                    if (currentScroll > lastScroll && currentScroll > 150 && !header.classList.contains("unshow")) {
                        header.classList.add("unshow");
                    } else if (currentScroll < lastScroll && header.classList.contains("unshow")) {
                        header.classList.remove("unshow");
                    }
                } else {
                    header.classList.remove("scroll");
                    header.classList.remove("unshow");
                }
                lastScroll = currentScroll;
            });
        },
        scrollPos() {
            return window.scrollY || window.pageYOffset || document.documentElement.scrollTop
        },
        disable() {
            if (!document.querySelector(".modal.open")) {
                const paddingValue = window.innerWidth > 350 ? window.innerWidth - document.documentElement.clientWidth + 'px' : '0px';
                document.querySelectorAll(".fixed-block").forEach(block => block.style.paddingRight = paddingValue);
                document.body.style.paddingRight = paddingValue;
                document.body.classList.add("no-scroll");

                if (this.isIOS) {
                    const scrollY = window.scrollY;
                    document.body.style.position = 'fixed';
                    document.body.style.width = '100%';
                    document.body.style.top = `-${scrollY}px`;
                    document.body.dataset.scrollY = scrollY;
                }
            }
        },
        enable() {
            if (!document.querySelector(".modal.open")) {
                document.querySelectorAll(".fixed-block").forEach(block => block.style.paddingRight = '0px');
                document.body.style.paddingRight = '0px';
                document.body.classList.remove("no-scroll");

                if (this.isIOS) {
                    document.body.style.position = '';
                    document.body.style.top = '';
                    document.body.style.width = '';
                    const scrollY = parseInt(document.body.dataset.scrollY || '0');
                    window.scrollTo(0, scrollY);
                }
            }
        },
        smoothScrollTo(dest) {
            let destPos = dest.getBoundingClientRect().top < 0 ? dest.getBoundingClientRect().top - header.clientHeight : dest.getBoundingClientRect().top
            if (iconMenu.classList.contains("active")) {
                iconMenu.click()
                setTimeout(() => {
                    window.scrollTo({ top: Utils.ScrollUtils.scrollPos() + destPos, behavior: 'smooth' })
                }, 300);
            } else {
                window.scrollTo({ top: Utils.ScrollUtils.scrollPos() + destPos, behavior: 'smooth' })
            }
        }
    },
    CookieUtils: {
        COOKIE_NAME: 'site_cookie_consent',
        COOKIE_VALUE: 'accepted',
        COOKIE_DAYS: 365,
        init() {
            if (!cookiePopup) return;
            if (!this.hasCookieAccepted()) {
                this.show();
                const cookieAccept = cookiePopup.querySelector(".cookie__accept");
                if (cookieAccept) {
                    cookieAccept.addEventListener('click', () => {
                        this.setCookie();
                        this.hide();
                    });
                }
            } else {
                this.hide();
            }
        },
        setCookie() {
            const date = new Date();
            date.setTime(date.getTime() + this.COOKIE_DAYS * 24 * 60 * 60 * 1000);
            const expires = "expires=" + date.toUTCString();
            let cookieStr = `${this.COOKIE_NAME}=${encodeURIComponent(this.COOKIE_VALUE)}; ${expires}; path=/; SameSite=Lax`;
            if (location.protocol === 'https:') cookieStr += '; Secure';
            document.cookie = cookieStr;
        },
        hasCookieAccepted() {
            const cookies = document.cookie.split('; ');
            const pref = this.COOKIE_NAME + '=';
            const cookieItem = cookies.find(item => item.startsWith(pref));
            return cookieItem ? decodeURIComponent(cookieItem.substring(pref.length)) === this.COOKIE_VALUE : false;
        },
        show() {
            cookiePopup.classList.add("show");
            cookiePopup.setAttribute('aria-hidden', 'false');
        },
        hide() {
            cookiePopup.classList.remove("show");
            setTimeout(() => {
                cookiePopup.remove();
            }, 300);
        }
    },
    ModalUtils: {
        lastFocusedEl: null,
        _focusHandler: null,
        _escInited: false,
        init() {
            this.initModalClicks()
            this.initEscClose()
            this.modalShowBtns()
            this.modalUnshowBtns()
        },
        initModalClicks() {
            modals.forEach(mod => {
                mod.addEventListener("click", (e) => {
                    if (!mod.querySelector(".modal__content").contains(e.target)) {
                        this.closeModal(mod)
                    }
                })
                // кнопки закрытия внутри модалки
                mod.querySelectorAll(".modal__close").forEach(btn => {
                    btn.addEventListener("click", () => {
                        this.closeModal(mod)
                    })
                })
            })
        },
        initEscClose() {
            if (this._escInited) return
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    const modals = document.querySelectorAll(".modal.open")
                    const topModal = modals[modals.length - 1]
                    if (topModal) {
                        this.closeModal(topModal)
                    }
                }
            })
            this._escInited = true
        },
        modalShowBtns() {
            const modOpenBtn = document.querySelectorAll(".mod-open-btn")
            if (modOpenBtn.length) {
                modOpenBtn.forEach(btn => {
                    btn.addEventListener("click", e => {
                        e.preventDefault()
                        let href = btn.getAttribute("data-modal")
                        this.openModal(document.getElementById(href))
                    })
                })
            }
        },
        modalUnshowBtns() {
            const modCloseBtn = document.querySelectorAll(".mod-close-btn")
            if (modCloseBtn.length) {
                modCloseBtn.forEach(btn => {
                    btn.addEventListener("click", e => {
                        e.preventDefault()
                        let href = btn.getAttribute("data-modal")
                        this.closeModal(document.getElementById(href))
                    })
                })
            }
        },
        openModal(modal, closeActive = true) {
            const activeModal = document.querySelector(".modal.open")
            if (!activeModal) {
                this.lastFocusedEl = document.activeElement
                Utils.ScrollUtils.disable()
            } else {
                if (closeActive) {
                    activeModal.classList.remove("open")
                }
                this.removeFocusTrap()
            }
            modal.classList.add("open")
            this.trapFocus(modal)
        },
        closeModal(modal) {
            if (modal.querySelector("video")) {
                modal.querySelectorAll("video").forEach(v => v.pause())
            }
            modal.classList.remove("open")
            this.removeFocusTrap()
            const activeModal = document.querySelector(".modal.open")

            if (activeModal) {
                this.trapFocus(activeModal)
            } else {
                if (this.lastFocusedEl) {
                    this.lastFocusedEl.focus()
                }
                setTimeout(() => {
                    Utils.ScrollUtils.enable()
                }, animSpd)
            }
        },
        trapFocus(modal) {
            const focusable = modal.querySelectorAll(
                'button:not(.btn-cross):not([disabled]), input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            if (!focusable.length) return
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            setTimeout(() => {
                first.focus()
            }, animSpd);
            this._focusHandler = (e) => {
                if (e.key !== "Tab") return
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault()
                        last.focus()
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault()
                        first.focus()
                    }
                }
            }
            document.addEventListener("keydown", this._focusHandler)
        },
        removeFocusTrap() {
            if (this._focusHandler) {
                document.removeEventListener("keydown", this._focusHandler)
                this._focusHandler = null
            }
        },
        setSuccessTxt(title = false, txt = false, btnTxt = false) {
            successModal.querySelector("h2").innerHTML = title ? title : "Заявка отправлена"
            successModal.querySelector("p").innerHTML = txt ? txt : ""
            successModal.querySelector(".btn span").textContent = btnTxt ? btnTxt : "Закрыть"
        },
        setErrorTxt(title = false, txt = false, btnTxt = false) {
            errorModal.querySelector("h2").innerHTML = title ? title : "Что-то пошло не так"
            errorModal.querySelector("p").innerHTML = txt ? txt : ""
            errorModal.querySelector(".btn span").textContent = btnTxt ? btnTxt : "Закрыть"
        },
        openSuccessMod(title = false, txt = false, btnTxt = false) {
            this.setSuccessTxt(title, txt, btnTxt)
            this.openModal(successModal)
        },
        openErrorMod(title = false, txt = false, btnTxt = false) {
            this.setErrorTxt(title, txt, btnTxt)
            this.openModal(errorModal)
        }
    },
    FormUtils: {
        init() {
            this.initTelMask();
            this.initDisabledForms()
            this.initInputReset()
        },
        initDisabledForms(selector = ".disabled-form") {
            const forms = document.querySelectorAll(selector);
            forms.forEach(form => {
                const requiredInputs = form.querySelectorAll("input[required]");
                if (!requiredInputs.length) return;

                let timeOut;
                this.toggleSubmitBtn(form);
                requiredInputs.forEach(inp => {
                    const eventType = ['text', 'email', 'number'].includes(inp.type) ? 'input' : 'change';
                    inp.addEventListener(eventType, () => {
                        if (this.isInputValid(inp)) {
                            this.removeError(inp)
                        }
                        if (['text', 'email', 'number'].includes(inp.type)) {
                            clearTimeout(timeOut);
                            timeOut = setTimeout(() => this.toggleSubmitBtn(form), 300);
                        } else {
                            this.toggleSubmitBtn(form);
                        }
                    });
                });
            });
        },
        initTelMask(selector = 'input[type=tel]') {
            const self = this;
            document.querySelectorAll(selector).forEach(item => {
                Inputmask(
                    {
                        mask: "+7 999 999-99-99",
                        oncomplete: () => {
                            this.removeError(item)
                            const parentForm = item.closest(".form")
                            if (parentForm && parentForm.classList.contains("disabled-form")) {
                                this.toggleSubmitBtn(parentForm)
                            }
                        },
                    }
                ).mask(item);
            });
        },
        initInputReset() {
            const itemForm = document.querySelectorAll(".ui-input")
            itemForm.forEach(item => {
                const resetBtn = item.querySelector(".ui-input__reset")
                if (resetBtn) {
                    this.showResetBtn(item, resetBtn)
                    item.querySelector("input").addEventListener("input", e => {
                        this.showResetBtn(item, resetBtn)
                    })
                    resetBtn.addEventListener("click", e => {
                        e.preventDefault()
                        item.querySelector("input").value = ""
                        resetBtn.classList.remove("show")
                    })
                }
            })
        },
        showResetBtn(item, resetBtn) {
            if (item.querySelector("input").value.length > 0) {
                resetBtn.classList.add("show")
            } else {
                resetBtn.classList.remove("show")
            }
        },
        isPhone(value) {
            return /^\+7 \d{3} \d{3}-\d{2}-\d{2}$/.test(value);
        },
        isEmail(value) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]{2,8}$/.test(value);
        },
        maskEmail(email) {
            const [username, domain] = email.split('@');
            let maskedUsername = username.length <= 3
                ? username[0] + '***'
                : username.substring(0, 2) + '***' + username.slice(-1);
            return maskedUsername + '@' + domain;
        },
        formReset(form, cleanError = false) {
            form.querySelectorAll(".ui-input").forEach(item => item.classList.remove("error"));
            if (cleanError) form.querySelectorAll("[data-error]").forEach(el => el.textContent = '');
            form.querySelectorAll("input").forEach(inp => {
                if (!["hidden", "checkbox", "radio"].includes(inp.type)) inp.value = "";
                if (["checkbox", "radio"].includes(inp.type) && !inp.required) inp.checked = false;
            });
            if (form.querySelector("textarea")) form.querySelector("textarea").value = "";
            if (form.querySelector(".file-form__items")) form.querySelector(".file-form__items").innerHTML = "";
        },
        toggleSubmitBtn(form) {
            const findItem = Array.from(form.querySelectorAll("input[required]")).find(inp => {
                return !inp.value || (inp.type === 'email' && !this.isEmail(inp.value)) || (inp.type === 'tel' && !this.isPhone(inp.value)) || (['checkbox', 'radio'].includes(inp.type) && !inp.checked);
            });
            const btn = form.querySelector("button[type=submit]");
            if (findItem) btn.setAttribute("disabled", true);
            else btn.removeAttribute("disabled");
        },
        isInputValid(inp) {
            if (inp.type === 'checkbox' || inp.type === 'radio') {
                return inp.checked;
            }
            if (!inp.value) return false;
            if (inp.type === 'email') {
                return this.isEmail(inp.value);
            }
            if (inp.type === 'tel') {
                return inp.inputmask?.isComplete();
            }
            return true;
        },
        addError(inp) {
            inp.closest('.ui-control')?.classList.add('error');
        },
        removeError(inp) {
            inp.closest('.ui-control')?.classList.remove('error');
        },
        formValidate(e, form) {
            e.preventDefault();
            let errors = 0;
            const inpRequired = Array.from(form.querySelectorAll('input[required]'))
            if (inpRequired.length) {
                inpRequired.forEach(inp => {
                    if (!this.isInputValid(inp)) {
                        errors++;
                        this.addError(inp);
                    }
                    const eventType = ['text', 'email', 'number'].includes(inp.type) ? 'input' : 'change';
                    inp.addEventListener(eventType, () => {
                        if (this.isInputValid(inp)) {
                            this.removeError(inp)
                        }
                    });
                });
            }
            if (errors === 0) {
                form.requestSubmit();
            } else {
                let firstErrorEl = form.querySelector('.ui-control.error')
                // Utils.ScrollUtils.smoothScrollTo(firstErrorEl)
            }
        }
    }
}
window.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".wrap").classList.add('loaded')
    Utils.init()
    setTimeout(() => {
        animate()
    }, animSpd);

});

// === Anchor Links ===
const anchorLinks = document.querySelectorAll(".js-anchor")
if (anchorLinks.length) {
    anchorLinks.forEach(item => {
        item.addEventListener("click", e => {
            let idx = item.getAttribute("href").indexOf("#")
            const href = item.getAttribute("href").substring(idx)
            let dest = document.querySelector(href)
            if (dest) {
                e.preventDefault()
                Utils.ScrollUtils.smoothScrollTo(dest)
            }
        })
    })
}

// === Page Animation ===
function animate() {
    const elements = document.querySelectorAll('[data-animation]');
    elements.forEach(async item => {
        const itemTop = item.getBoundingClientRect().top;
        const itemPoint = Math.abs(window.innerHeight - item.offsetHeight * 0.1);
        const itemScrolled = itemPoint > 100 ? itemPoint : 100;
        if (itemTop - itemScrolled < 0) {
            const animName = item.getAttribute("data-animation");
            if (preloader && !preloader.classList.contains("loaded")) {
                await new Promise(resolve => setTimeout(resolve, preloaderHiddenTimeOut));
            }
            item.classList.add(animName);
            item.removeAttribute("data-animation");
        }
    });
}
window.addEventListener("scroll", animate)

// === BurgerMenu ===
if (iconMenu && mobMenu) {
    iconMenu.addEventListener("click", () => {
        let isActive = iconMenu.classList.toggle("active")
        mobMenu.classList.toggle("open", isActive)
        iconMenu.setAttribute("aria-label", isActive ? "Закрыть меню" : "Открыть меню")
        iconMenu.setAttribute("aria-expanded", isActive)
        Utils.ScrollUtils[isActive ? "disable" : "enable"]()
    })
    window.addEventListener("resize", () => {
        if (window.innerWidth > bp.desktop && iconMenu.classList.contains("active")) {
            iconMenu.click()
        }
    })
}

// === Author Video ===
const authorVideo = document.querySelector('.author__video .media-cover');
if (authorVideo) {
    const playBtn = authorVideo.querySelector('.play-btn');
    const iframe = authorVideo.querySelector('iframe ');
    const video = authorVideo.querySelector('video ');
    let isPlaying = false;
    function playVideo() {
        authorVideo.classList.add('is-playing');
        isPlaying = true;
        playBtn.setAttribute('aria-pressed', 'true');
        playBtn.setAttribute('aria-label', 'Поставить на паузу');
        if (iframe) {
            let src = iframe.src;
            iframe.src = src + (src.includes('?') ? '&' : '?') + 'autoplay=1';
        } else if (video) {
            if (!video.dataset.loaded) {
                video.querySelectorAll("[data-src]").forEach(s => { s.src = s.dataset.src; s.removeAttribute("data-src") })
                video.load()
                video.dataset.loaded = "true"
            }
            video.play()
        }

    }
    function stopVideo() {
        authorVideo.classList.remove('is-playing');
        isPlaying = false;
        playBtn.setAttribute('aria-pressed', 'false');
        playBtn.setAttribute('aria-label', 'Воспроизвести видео');
        if (iframe) {
            iframe.src = iframe.src.replace('&autoplay=1', '').replace('?autoplay=1', '');
        } else if (video) {
            video.pause()
        }

    }
    if (playBtn && (iframe || video)) {
        playBtn.addEventListener('click', () => {
            if (!isPlaying) {
                playVideo();
            } else {
                stopVideo();
            }
        });
    }
}