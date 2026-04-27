const fs = require('fs');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Us - SAYCOM</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

    <!-- Top Bar -->
    <div class="top-bar">
        <div class="container top-bar-container">
            <div><i class="fa-solid fa-truck"></i> <span data-i18n="top_bar_delivery">Free delivery on orders over $500</span></div>
            <div class="top-lang">
                <i class="fa-solid fa-globe"></i> 
                <select class="lang-select" id="lang-switch" onchange="setLanguage(this.value)">
                    <option value="en">English</option>
                    <option value="ru">Русский</option>
                    <option value="kz">Қазақша</option>
                </select>
            </div>
        </div>
    </div>

    <!-- Header -->
    <header class="header">
        <div class="container header-container">
            <div class="logo">
                <div class="logo-icon">ST</div>
                <div class="logo-text">
                    <div class="logo-title">SAYCOM</div>
                    <div class="logo-subtitle" data-i18n="premium_solutions">Premium Solutions</div>
                </div>
            </div>
            
            <div class="search-bar">
                <i class="fa-solid fa-magnifying-glass" style="color: var(--text-muted);"></i>
                <input type="text" data-i18n-placeholder="search_placeholder" placeholder="Search for products, brands...">
            </div>

            <div class="header-actions">
                <div class="action-icon"><i class="fa-regular fa-user"></i></div>
                <div class="action-icon">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <span class="cart-badge">2</span>
                </div>
            </div>
        </div>
    </header>

    <!-- Navigation -->
    <nav class="main-nav">
        <div class="container nav-container">
            <a href="air-conditioners.html" data-i18n="nav_ac">Air Conditioners</a>
            <a href="cctv-systems.html" data-i18n="nav_cctv">CCTV Systems</a>
            <a href="automatic-gates.html" data-i18n="nav_gates">Automatic Gates</a>
            <a href="intercom-systems.html" data-i18n="nav_intercom">Intercom Systems</a>
            <a href="installation-services.html" data-i18n="nav_install">Installation Services</a>
            <a href="about-us.html" data-i18n="nav_about" style="color: var(--primary);">About Us</a>
            <a href="contact.html" data-i18n="nav_contact" >Contact</a>
        </div>
    </nav>

    <!-- Page Content -->
    <main>
        <!-- Sec 1: Header -->
        <div class="container">
            <div class="page-header" style="text-align:center; padding: 60px 0 20px;">
                <h1 class="page-title" data-i18n="nav_about" style="font-size: 40px;">About Us</h1>
                <p class="page-subtitle" data-i18n="about_subtitle" style="font-size: 16px; margin-top: 10px;">We are the leading provider of smart home and security solutions in Central Asia.</p>
            </div>
        </div>

        <!-- Sec 2: About Hero -->
        <section class="section" style="padding-top: 20px;">
            <div class="container" style="display:flex; gap: 50px; align-items:center;">
                <div style="flex: 1; background: #E5E7EB; aspect-ratio: 4/3; border-radius: 20px; display:flex; align-items:center; justify-content:center; color:#9CA3AF; font-size:40px;">
                    <i class="fa-solid fa-building"></i>
                </div>
                <div style="flex: 1;">
                    <h2 data-i18n="about_story_title" style="font-size: 32px; font-weight:700; margin-bottom: 20px;">Our Story</h2>
                    <p data-i18n="about_story_p1" style="color: var(--text-muted); line-height: 1.8; margin-bottom: 20px;">SAYCOM was founded with a single mission: to provide high-quality, reliable, and premium technology setups for modern homes and businesses. What started as a small installation team has grown into Central Asia's premier distributor of smart technology.</p>
                    <p data-i18n="about_story_p2" style="color: var(--text-muted); line-height: 1.8; margin-bottom: 30px;">Today, we pride ourselves on offering not just products, but complete engineering solutions. From advanced CCTV networks to fully automated gates and premium air conditioning systems, we deliver excellence at every step.</p>
                    
                    <div style="display:flex; gap:30px;">
                        <div>
                            <div style="font-size: 32px; font-weight:700; color:var(--primary);">10+</div>
                            <div data-i18n="about_exp_years" style="font-size: 14px; color: var(--text-muted); font-weight: 500;">Years of Experience</div>
                        </div>
                        <div>
                            <div style="font-size: 32px; font-weight:700; color:var(--primary);">5k+</div>
                            <div data-i18n="about_exp_clients" style="font-size: 14px; color: var(--text-muted); font-weight: 500;">Happy Clients</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Sec 3: Core Values -->
        <section style="background: var(--bg-light); padding: 80px 0;">
            <div class="container">
                <h2 data-i18n="about_values_title" style="text-align:center; font-size: 32px; font-weight:700; margin-bottom: 50px;">Core Values</h2>
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 30px;">
                    <div style="background:white; padding:40px; border-radius:12px; border:1px solid var(--border-color); text-align:center;">
                        <div style="width:64px; height:64px; background:#E0F2FE; color:var(--primary); font-size:24px; display:flex; align-items:center; justify-content:center; border-radius:50%; margin: 0 auto 20px;">
                            <i class="fa-solid fa-shield-halved"></i>
                        </div>
                        <h3 data-i18n="val_1_title" style="font-size: 18px; margin-bottom:10px;">Uncompromising Quality</h3>
                        <p data-i18n="val_1_desc" style="color:var(--text-muted); font-size:14px; line-height:1.6;">We only partner with top global brands that guarantee reliability and longevity.</p>
                    </div>
                    <div style="background:white; padding:40px; border-radius:12px; border:1px solid var(--border-color); text-align:center;">
                        <div style="width:64px; height:64px; background:#E0F2FE; color:var(--primary); font-size:24px; display:flex; align-items:center; justify-content:center; border-radius:50%; margin: 0 auto 20px;">
                            <i class="fa-solid fa-user-tie"></i>
                        </div>
                        <h3 data-i18n="val_2_title" style="font-size: 18px; margin-bottom:10px;">Expert Engineering</h3>
                        <p data-i18n="val_2_desc" style="color:var(--text-muted); font-size:14px; line-height:1.6;">Our specialists provide flawless installation, maintaining standard safety protocols.</p>
                    </div>
                    <div style="background:white; padding:40px; border-radius:12px; border:1px solid var(--border-color); text-align:center;">
                        <div style="width:64px; height:64px; background:#E0F2FE; color:var(--primary); font-size:24px; display:flex; align-items:center; justify-content:center; border-radius:50%; margin: 0 auto 20px;">
                            <i class="fa-solid fa-handshake"></i>
                        </div>
                        <h3 data-i18n="val_3_title" style="font-size: 18px; margin-bottom:10px;">Client Commitment</h3>
                        <p data-i18n="val_3_desc" style="color:var(--text-muted); font-size:14px; line-height:1.6;">24/7 support and comprehensive maintenance plans for complete peace of mind.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Sec 4: Mission & Vision -->
        <section class="install-section">
            <div class="container text-center" style="max-width: 800px; text-align:center;">
                <h2 data-i18n="mission_title" style="font-size:36px; font-weight:700; margin-bottom: 20px;">Our Mission & Vision</h2>
                <div style="width: 80px; height: 4px; background: white; margin: 0 auto 30px; opacity: 0.5;"></div>
                <p data-i18n="mission_desc" style="font-size:18px; line-height:1.8; opacity:0.9;">Our vision is to bring the future of living to every doorstep. We are committed to revolutionizing how people interact with their environments by seamlessly integrating cutting-edge technology into homes and businesses, creating smarter, safer, and more comfortable spaces for everyone.</p>
            </div>
        </section>

        <!-- Sec 5: Our Team -->
        <section class="section">
            <div class="container">
                <h2 data-i18n="team_title" class="section-title">Our Leadership Team</h2>
                <p data-i18n="team_subtitle" class="section-subtitle">Experts driving technological excellence</p>
                <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 30px;">
                    <!-- Team Member 1 -->
                    <div style="border: 1px solid var(--border-color); border-radius: 12px; overflow:hidden;">
                        <div style="background:#E5E7EB; width:100%; aspect-ratio:1; display:flex; align-items:center; justify-content:center; font-size:40px; color:#9CA3AF;"><i class="fa-solid fa-user-secret"></i></div>
                        <div style="padding: 20px; text-align:center;">
                            <h4 style="font-size:16px; font-weight:600; margin-bottom:5px;">Aziz Rakhimov</h4>
                            <p style="font-size:13px; color:var(--text-muted);" data-i18n="team_role_ceo">Founder & CEO</p>
                        </div>
                    </div>
                    <!-- Team Member 2 -->
                    <div style="border: 1px solid var(--border-color); border-radius: 12px; overflow:hidden;">
                        <div style="background:#E5E7EB; width:100%; aspect-ratio:1; display:flex; align-items:center; justify-content:center; font-size:40px; color:#9CA3AF;"><i class="fa-solid fa-user-gear"></i></div>
                        <div style="padding: 20px; text-align:center;">
                            <h4 style="font-size:16px; font-weight:600; margin-bottom:5px;">Olzhas Talgat</h4>
                            <p style="font-size:13px; color:var(--text-muted);" data-i18n="team_role_cto">Chief Technical Officer</p>
                        </div>
                    </div>
                    <!-- Team Member 3 -->
                    <div style="border: 1px solid var(--border-color); border-radius: 12px; overflow:hidden;">
                        <div style="background:#E5E7EB; width:100%; aspect-ratio:1; display:flex; align-items:center; justify-content:center; font-size:40px; color:#9CA3AF;"><i class="fa-solid fa-user-pen"></i></div>
                        <div style="padding: 20px; text-align:center;">
                            <h4 style="font-size:16px; font-weight:600; margin-bottom:5px;">Elena Smirnova</h4>
                            <p style="font-size:13px; color:var(--text-muted);" data-i18n="team_role_op">Operations Manager</p>
                        </div>
                    </div>
                    <!-- Team Member 4 -->
                    <div style="border: 1px solid var(--border-color); border-radius: 12px; overflow:hidden;">
                        <div style="background:#E5E7EB; width:100%; aspect-ratio:1; display:flex; align-items:center; justify-content:center; font-size:40px; color:#9CA3AF;"><i class="fa-solid fa-user-ninja"></i></div>
                        <div style="padding: 20px; text-align:center;">
                            <h4 style="font-size:16px; font-weight:600; margin-bottom:5px;">Mansur Alimov</h4>
                            <p style="font-size:13px; color:var(--text-muted);" data-i18n="team_role_lead">Lead Engineer</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Sec 6: Partners -->
        <section class="section" style="background: white; border-top: 1px solid var(--border-color);">
            <div class="container">
                <h2 data-i18n="partner_title" style="text-align:center; font-size: 24px; font-weight:700; margin-bottom: 40px;">Our Trusted Partners</h2>
                <div style="display:flex; justify-content:space-around; align-items:center; opacity:0.5; font-size:30px; gap:40px; flex-wrap:wrap;">
                    <div><i class="fa-brands fa-aws"></i></div>
                    <div><i class="fa-brands fa-microsoft"></i></div>
                    <div><i class="fa-brands fa-google"></i></div>
                    <div><i class="fa-brands fa-apple"></i></div>
                    <div><i class="fa-brands fa-android"></i></div>
                    <div><i class="fa-brands fa-linux"></i></div>
                </div>
            </div>
        </section>

        <!-- Sec 7: CTA -->
        <section class="cta-section" style="background: var(--bg-light);">
            <div class="container">
                <h2 class="section-title" data-i18n="cta_ready">Ready to Upgrade Your Space?</h2>
                <p class="section-subtitle" style="margin-bottom:0;" data-i18n="cta_ready_sub">Let our experts handle your next project.</p>
                <div class="cta-btns">
                    <button class="btn btn-primary" data-i18n="cta_btn_contact">Contact Us</button>
                </div>
            </div>
        </section>

    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col-1">
                    <div class="logo footer-logo">
                        <div class="logo-icon">ST</div>
                        <div class="logo-text">
                            <div class="logo-title" style="color: white; font-size: 18px;">SAYCOM</div>
                            <div class="logo-subtitle" style="color: rgba(255,255,255,0.7);" data-i18n="premium_solutions">Premium Solutions</div>
                        </div>
                    </div>
                    <p class="footer-desc" data-i18n="footer_desc">Leading provider of premium HVAC systems, security solutions, and smart home automation in Central Asia. Quality installation and maintenance services.</p>
                    <div class="social-links">
                        <a href="#"><i class="fa-brands fa-facebook-f"></i></a>
                        <a href="#"><i class="fa-brands fa-instagram"></i></a>
                        <a href="#"><i class="fa-brands fa-twitter"></i></a>
                        <a href="#"><i class="fa-brands fa-youtube"></i></a>
                    </div>
                </div>
                <div class="footer-col">
                    <h4 data-i18n="footer_products">Products</h4>
                    <a href="air-conditioners.html" data-i18n="nav_ac">Air Conditioners</a>
                    <a href="cctv-systems.html" data-i18n="nav_cctv">CCTV Systems</a>
                    <a href="automatic-gates.html" data-i18n="nav_gates">Automatic Gates</a>
                    <a href="intercom-systems.html" data-i18n="nav_intercom">Intercom Systems</a>
                </div>
                <div class="footer-col">
                    <h4 data-i18n="footer_services">Services</h4>
                    <a href="installation-services.html" data-i18n="nav_install">Installation</a>
                    <a href="#" data-i18n="footer_maintenance">Maintenance</a>
                    <a href="#" data-i18n="footer_repair">Repair Services</a>
                    <a href="#" data-i18n="footer_support">Support Center</a>
                </div>
                <div class="footer-col">
                    <h4 data-i18n="footer_company">Company</h4>
                    <a href="about-us.html" data-i18n="nav_about">About Us</a>
                    <a href="#" data-i18n="footer_blog">Blog</a>
                    <a href="#" data-i18n="footer_faq">FAQ</a>
                    <a href="contact.html" data-i18n="nav_contact">Contact</a>
                </div>
            </div>

            <div class="footer-divider"></div>

            <div class="footer-grid">
                <div class="footer-col-1">
                    <div class="footer-info-item">
                        <i class="fa-solid fa-phone"></i>
                        <div>
                            <div class="info-title" data-i18n="footer_phone">Phone</div>
                            <div class="info-value">+998 90 123 45 67</div>
                        </div>
                    </div>
                </div>
                <div class="footer-col">
                    <div class="footer-info-item">
                        <i class="fa-regular fa-envelope"></i>
                        <div>
                            <div class="info-title" data-i18n="footer_email">Email</div>
                            <div class="info-value">info@smarttech.uz</div>
                        </div>
                    </div>
                </div>
                <div class="footer-col">
                    <!-- Empty space to align location to 4th column -->
                </div>
                <div class="footer-col">
                    <div class="footer-info-item">
                        <i class="fa-solid fa-location-dot"></i>
                        <div>
                            <div class="info-title" data-i18n="footer_location">Location</div>
                            <div class="info-value" data-i18n="footer_address">Tashkent, Uzbekistan</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer-newsletter-sec">
                <h4 data-i18n="footer_newsletter">Newsletter</h4>
                <form class="newsletter-form" onsubmit="event.preventDefault()">
                    <input type="email" data-i18n-placeholder="newsletter_placeholder" placeholder="Enter your email" required>
                    <button type="submit" data-i18n="btn_subscribe">Subscribe</button>
                </form>
            </div>

            <div class="footer-bottom">
                <p data-i18n="footer_copyright">&copy; 2026 SAYCOM. All rights reserved.</p>
                <div class="footer-links">
                    <a href="#" data-i18n="footer_privacy">Privacy Policy</a>
                    <a href="#" data-i18n="footer_terms">Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>

    <script src="js/translations.js"></script>
    <script src="js/app.js"></script>
</body>
</html>`;

fs.writeFileSync('about-us.html', htmlContent);

// Add translation values to translations.js
const missingEN = {
    about_subtitle: "We are the leading provider of smart home and security solutions in Central Asia.",
    about_story_title: "Our Story",
    about_story_p1: "SAYCOM was founded with a single mission: to provide high-quality, reliable, and premium technology setups for modern homes and businesses. What started as a small installation team has grown into Central Asia's premier distributor of smart technology.",
    about_story_p2: "Today, we pride ourselves on offering not just products, but complete engineering solutions. From advanced CCTV networks to fully automated gates and premium air conditioning systems, we deliver excellence at every step.",
    about_exp_years: "Years of Experience",
    about_exp_clients: "Happy Clients",
    about_values_title: "Core Values",
    val_1_title: "Uncompromising Quality",
    val_1_desc: "We only partner with top global brands that guarantee reliability and longevity.",
    val_2_title: "Expert Engineering",
    val_2_desc: "Our specialists provide flawless installation, maintaining standard safety protocols.",
    val_3_title: "Client Commitment",
    val_3_desc: "24/7 support and comprehensive maintenance plans for complete peace of mind.",
    mission_title: "Mission & Vision",
    mission_desc: "Our vision is to bring the future of living to every doorstep. We are committed to revolutionizing how people interact with their environments by seamlessly integrating cutting-edge technology into homes and businesses, creating smarter, safer, and more comfortable spaces for everyone.",
    team_title: "Our Leadership Team",
    team_subtitle: "Experts driving technological excellence",
    team_role_ceo: "Founder & CEO",
    team_role_cto: "Chief Technical Officer",
    team_role_op: "Operations Manager",
    team_role_lead: "Lead Engineer",
    partner_title: "Our Trusted Partners",
    cta_ready: "Ready to Upgrade Your Space?",
    cta_ready_sub: "Let our experts handle your next project."
};

const missingRU = {
    about_subtitle: "Мы являемся ведущим поставщиком систем «умный дом» и решений для безопасности в Центральной Азии.",
    about_story_title: "Наша история",
    about_story_p1: "Компания SAYCOM была основана с единственной целью: предоставлять высококачественные, надежные и премиальные технологические решения для современных домов и предприятий. То, что началось как небольшая команда по установке, переросло в ведущего дистрибьютора умных технологий в Центральной Азии.",
    about_story_p2: "Сегодня мы гордимся тем, что предлагаем не просто продукты, а комплексные инженерные решения: от передовых сетей видеонаблюдения до автоматических ворот и кондиционеров.",
    about_exp_years: "Лет опыта",
    about_exp_clients: "Счастливых клиентов",
    about_values_title: "Основные ценности",
    val_1_title: "Безупречное качество",
    val_1_desc: "Мы сотрудничаем только с мировыми брендами, которые гарантируют надежность.",
    val_2_title: "Экспертная инженерия",
    val_2_desc: "Наши специалисты обеспечивают безупречную установку с соблюдением стандартов.",
    val_3_title: "Отношение к клиентам",
    val_3_desc: "Круглосуточная поддержка и техническое обслуживание для вашего спокойствия.",
    mission_title: "Миссия и Видение",
    mission_desc: "Наше видение — привнести будущее в каждый дом. Мы стремимся революционизировать способы взаимодействия людей со своей средой, органично внедряя передовые технологии в дома и офисы.",
    team_title: "Наша команда руководителей",
    team_subtitle: "Эксперты, способствующие технологическому совершенству",
    team_role_ceo: "Основатель и CEO",
    team_role_cto: "Технический директор",
    team_role_op: "Операционный менеджер",
    team_role_lead: "Ведущий инженер",
    partner_title: "Наши надежные партнеры",
    cta_ready: "Готовы обновить свое пространство?",
    cta_ready_sub: "Доверьте свой следующий проект нашим специалистам."
};

const missingKZ = {
    about_subtitle: "Біз Орталық Азиядағы «ақылды үй» және қауіпсіздік шешімдерінің жетекші жеткізушісіміз.",
    about_story_title: "Біздің тарихымыз",
    about_story_p1: "SAYCOM заманауи үйлер мен кәсіпорындар үшін жоғары сапалы, сенімді және премиум технологиялық шешімдерді ұсыну үшін құрылған. Шағын орнату тобы ретінде басталған іс Орталық Азиядағы ақылды технологиялардың жетекші дистрибьюторына айналды.",
    about_story_p2: "Бүгінде біз тек өнімдерді ғана емес, кешенді инженерлік шешімдерді ұсынатынымызды мақтан тұтамыз. Дамыған бейнебақылау желілерінен бастап автоматты қақпалар мен премиум кондиционерлерге дейін.",
    about_exp_years: "Жыл тәжірибе",
    about_exp_clients: "Риза тұтынушылар",
    about_values_title: "Негізгі құндылықтар",
    val_1_title: "Мінсіз сапа",
    val_1_desc: "Біз тек сенімділікті кепілдейтін әлемдік брендтермен жұмыс істейміз.",
    val_2_title: "Сарапшы инженерия",
    val_2_desc: "Біздің мамандар стандарттарды сақтай отырып мінсіз орнатуды қамтамасыз етеді.",
    val_3_title: "Тұтынушыларға адалдық",
    val_3_desc: "Сіздің тыныштығыңыз үшін тәулік бойы қолдау және техникалық қызмет көрсету.",
    mission_title: "Миссия жэне Болашақ",
    mission_desc: "Біздің көзқарасымыз - болашақты әрбір үйге жеткізу. Біз озық технологияларды үйлер мен кеңселерге енгізу арқылы адамдардың өз ортасымен өзара әрекеттесуін түбегейлі өзгертуге ұмтыламыз.",
    team_title: "Біздің көшбасшылар тобы",
    team_subtitle: "Технологиялық жетістіктерді басқаратын сарапшылар",
    team_role_ceo: "Құрылтайшы және CEO",
    team_role_cto: "Техникалық директор",
    team_role_op: "Операциялық менеджер",
    team_role_lead: "Жетекші инженер",
    partner_title: "Біздің сенімді серіктестеріміз",
    cta_ready: "Кеңістігіңізді жаңартуға дайынсыз ба?",
    cta_ready_sub: "Келесі жобаңызды біздің мамандарға тапсырыңыз."
};

let transStr = fs.readFileSync('js/translations.js', 'utf8');

// A simple way to inject keys into translations.js without breaking it is to use eval to parse, merge, and reserialize.
// But we can also just regex replace into the objects.

function injectToLang(str, lang, obj) {
    let keysStr = '';
    for (let k in obj) {
        keysStr += \`        "\${k}": "\${obj[k]}",\\n\`;
    }
    const target = new RegExp(\`(^\s*\${lang}:\s*\\{[\\s\\S]*?)(^\\s*\\},?$)\`, 'm');
    const match = str.match(target);
    if (!match) return str;
    
    return str.replace(target, \`$1\\n\` + keysStr + \`$2\`);
}

transStr = injectToLang(transStr, 'en', missingEN);
transStr = injectToLang(transStr, 'ru', missingRU);
transStr = injectToLang(transStr, 'kz', missingKZ);

fs.writeFileSync('js/translations.js', transStr);
console.log('Translations and About Us updated completely!');
