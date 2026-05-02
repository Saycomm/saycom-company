
        // --- Admin Password Security ---
        (function() {
            const modal = document.getElementById('adminLoginModal');
            const form = document.getElementById('adminLoginForm');
            const input = document.getElementById('adminPassword');
            const toggle = document.getElementById('togglePass');
            const error = document.getElementById('loginError');

            // Session check (10 minutes = 600,000 ms)
            const authTime = sessionStorage.getItem('admin_auth_time');
            if (authTime && (Date.now() - parseInt(authTime)) < 600000) {
                modal.style.display = 'none'; // Bypass login if within 10 mins
            }

            // Toggle Password Visibility
            toggle.onclick = () => {
                const isPass = input.type === 'password';
                input.type = isPass ? 'text' : 'password';
                toggle.classList.toggle('fa-eye');
                toggle.classList.toggle('fa-eye-slash');
            };

            form.onsubmit = async (e) => {
                e.preventDefault();
                try {
                    const res = await fetch('/api/admin/check-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password: input.value })
                    });
                    
                    if (res.ok) {
                        sessionStorage.setItem('admin_auth_time', Date.now().toString()); // Save session time
                        modal.style.opacity = '0';
                        modal.style.transition = '0.3s ease';
                        setTimeout(() => modal.style.display = 'none', 300);
                        // Force immediate update to timer to avoid 1s delay
                        if (typeof updateWidgets === 'function') updateWidgets();
                    } else {
                        throw new Error();
                    }
                } catch (err) {
                    error.style.display = 'block';
                    input.style.borderColor = '#EF4444';
                    input.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.1)';
                    input.value = '';
                    setTimeout(() => {
                        error.style.display = 'none';
                        input.style.borderColor = 'rgba(255,255,255,0.05)';
                        input.style.boxShadow = 'none';
                    }, 3000);
                }
            };
        })();

        // --- Admin Session Timer & Clock ---
        function updateWidgets() {
            const timerEl = document.getElementById('admin-timer');
            const clockEl = document.getElementById('admin-clock');
            const dateEl = document.getElementById('admin-date');
            const modal = document.getElementById('adminLoginModal');

            if (!timerEl || !clockEl || !dateEl) return;

            // Clock Update
            const now = new Date();
            const d = String(now.getDate()).padStart(2, '0');
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const y = now.getFullYear();
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            
            clockEl.innerText = `${hh}:${mm}`;
            dateEl.innerText = `${d}.${m}.${y}`;

            // Timer Update
            const authTime = sessionStorage.getItem('admin_auth_time');
            if (authTime) {
                const elapsed = Date.now() - parseInt(authTime);
                const remaining = 600000 - elapsed; // 10 minutes
                
                if (remaining > 0) {
                    const rMin = Math.floor(remaining / 60000);
                    const rSec = Math.floor((remaining % 60000) / 1000);
                    timerEl.innerText = `${String(rMin).padStart(2, '0')}m:${String(rSec).padStart(2, '0')}s`;
                    
                    // Warning colors based on time left
                    if (remaining < 60000) {
                        timerEl.style.color = '#EF4444'; // Red if < 1 min
                        timerEl.style.textShadow = '0 0 10px rgba(239, 68, 68, 0.4)';
                    } else if (remaining < 180000) {
                        timerEl.style.color = '#F59E0B'; // Orange if < 3 mins
                        timerEl.style.textShadow = '0 0 10px rgba(245, 158, 11, 0.4)';
                    } else {
                        timerEl.style.color = '#10B981'; // Green
                        timerEl.style.textShadow = '0 0 10px rgba(16, 185, 129, 0.3)';
                    }
                } else {
                    timerEl.innerText = `00m:00s`;
                    timerEl.style.color = '#EF4444';
                    // Auto-lock panel when time expires
                    if (modal && modal.style.display === 'none') {
                        modal.style.display = 'flex';
                        setTimeout(() => modal.style.opacity = '1', 10);
                        sessionStorage.removeItem('admin_auth_time'); // Clear expired session
                    }
                }
            } else {
                timerEl.innerText = `--m:--s`;
                timerEl.style.color = '#64748B';
                timerEl.style.textShadow = 'none';
            }
        }
        
        // Init and set interval for widgets
        updateWidgets();
        setInterval(updateWidgets, 1000);


        // --- GLOBAL STATE ---
        const store = {
            products: {},
            spareParts: {},
            projects: {},
            team: {}
        };

        const galleryState = { p: [], sp: [] };

        function handleMainImagePreview(e, previewId) {
            const file = e.target.files[0];
            const previewContainer = document.getElementById(previewId);
            if (file) {
                previewContainer.innerHTML = `
                    <div style="position:relative; width:60px; height:60px; border-radius:6px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); margin-top:10px;">
                        <img src="${URL.createObjectURL(file)}" style="width:100%; height:100%; object-fit:cover; cursor:zoom-in;" onclick="openAdminLightbox(this.src)">
                    </div>
                `;
            } else {
                previewContainer.innerHTML = '';
            }
        }

        function handleGalleryFiles(e, type) {
            const files = Array.from(e.target.files);
            galleryState[type].push(...files);
            renderGalleryPreview(type);
            e.target.value = ''; // clear input so same files can be re-selected
        }

        function renderGalleryPreview(type) {
            const preview = document.getElementById(type + '_gallery_preview');
            const actions = document.getElementById(type + '_gallery_actions');
            if (galleryState[type].length === 0) {
                preview.innerHTML = '';
                actions.style.display = 'none';
                return;
            }
            actions.style.display = 'flex';
            preview.innerHTML = galleryState[type].map((file, i) => `
                <div style="position:relative; width:60px; height:60px; border-radius:6px; overflow:hidden; border:1px solid rgba(255,255,255,0.1);">
                    <input type="checkbox" class="${type}-gal-check" value="${i}" style="position:absolute; top:2px; left:2px; width:12px; height:12px; z-index:2; cursor:pointer;" onclick="event.stopPropagation()">
                    <img src="${URL.createObjectURL(file)}" style="width:100%; height:100%; object-fit:cover; cursor:zoom-in;" onclick="openAdminLightbox(this.src)">
                    <button type="button" onclick="removeGalleryItem('${type}', ${i})" style="position:absolute; top:2px; right:2px; background:rgba(239,68,68,0.9); border:none; border-radius:4px; color:white; width:16px; height:16px; font-size:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:2;"><i class="fa-solid fa-xmark"></i></button>
                </div>
            `).join('');
            document.getElementById(type + '_gal_select_all').checked = false;
        }

        function removeGalleryItem(type, index) {
            galleryState[type].splice(index, 1);
            renderGalleryPreview(type);
        }

        function toggleGallerySelectAll(type, checked) {
            document.querySelectorAll(`.${type}-gal-check`).forEach(c => c.checked = checked);
        }

        function deleteSelectedGallery(type) {
            const checkboxes = Array.from(document.querySelectorAll(`.${type}-gal-check`));
            for (let i = checkboxes.length - 1; i >= 0; i--) {
                if (checkboxes[i].checked) {
                    galleryState[type].splice(i, 1);
                }
            }
            renderGalleryPreview(type);
        }

        function clearGallery(type) {
            galleryState[type] = [];
            renderGalleryPreview(type);
        }

        function openAdminLightbox(src) {
            const existing = document.getElementById('admin-lightbox');
            if (existing) existing.remove();
            const lb = document.createElement('div');
            lb.id = 'admin-lightbox';
            lb.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.92); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); cursor:zoom-out;';
            lb.innerHTML = `
                <img src="${src}" style="max-width:90vw; max-height:90vh; object-fit:contain; border-radius:10px; box-shadow:0 10px 50px rgba(0,0,0,0.8);" onclick="event.stopPropagation()">
                <button style="position:absolute; top:20px; right:20px; background:rgba(255,255,255,0.1); border:none; color:white; font-size:24px; width:44px; height:44px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;"><i class="fa-solid fa-xmark"></i></button>
            `;
            lb.onclick = () => lb.remove();
            lb.querySelector('button').onclick = () => lb.remove();
            document.body.appendChild(lb);
        }

        
        // --- INSTALLATIONS JS ---
        function addInstallOptionRow(name='', price='') {
            const div = document.createElement('div');
            div.style.display = 'flex'; div.style.gap = '15px'; div.style.marginBottom = '15px';
            div.style.alignItems = 'center';
            div.style.background = 'rgba(255,255,255,0.02)';
            div.style.padding = '10px';
            div.style.borderRadius = '8px';
            div.style.border = '1px dashed rgba(255,255,255,0.1)';
            
            div.innerHTML = `
                <input type="text" placeholder="Название (напр: Метр магистрали)" value="${name}" style="flex:2; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: white; padding: 12px; border-radius: 8px; font-family: 'Inter', sans-serif;">
                <div style="flex:1; position: relative;">
                    <input type="number" placeholder="Цена" value="${price}" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: white; padding: 12px 35px 12px 12px; border-radius: 8px; font-family: 'Inter', sans-serif;">
                    <span style="position: absolute; right: 12px; top: 12px; color: var(--text-muted); font-weight: 700;">₸</span>
                </div>
                <button type="button" onclick="this.parentElement.remove()" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: #EF4444; width: 44px; height: 44px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#EF4444'; this.style.color='white'" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'; this.style.color='#EF4444'"><i class="fa-solid fa-trash"></i></button>
            `;
            const container = document.getElementById('inst_options_container');
            if(container) container.appendChild(div);
        }

        async function loadInstallForm(key) {
            document.getElementById('install-form-container').style.display = 'block';
            document.getElementById('inst_key').value = key;
            const titles = {
                'ac': 'Установка кондиционеров',
                'cctv': 'Установка видеонаблюдения',
                'gates': 'Установка автоматических ворот',
                'intercom': 'Установка домофонов'
            };
            document.getElementById('installTitle').innerText = titles[key].toUpperCase();
            
            // Highlight active button
            const items = document.querySelectorAll('#install-nav-items .s-nav-item');
            items.forEach(item => item.classList.remove('active'));
            const activeItem = Array.from(items).find(item => item.getAttribute('onclick').includes(`'${key}'`));
            if (activeItem) {
                activeItem.classList.add('active');
            }
            
            // Clear form
            document.getElementById('inst_desc').value = '';
            document.getElementById('inst_base_price').value = '';
            document.getElementById('inst_options_container').innerHTML = '';
            
            try {
                const res = await fetch('/api/installations');
                const result = await res.json();
                const data = result.data[`install_${key}`] || {};
                
                document.getElementById('inst_desc').value = data.description || '';
                document.getElementById('inst_base_price').value = data.base_price || '';
                if (data.options && Array.isArray(data.options)) {
                    data.options.forEach(opt => addInstallOptionRow(opt.name, opt.price));
                }
            } catch (err) {
                console.error(err);
            }
        }

        async function handleInstallSave(e) {
            e.preventDefault();
            const key = document.getElementById('inst_key').value;
            const description = document.getElementById('inst_desc').value;
            const base_price = document.getElementById('inst_base_price').value;
            
            const options = [];
            document.querySelectorAll('#inst_options_container div').forEach(row => {
                const inputs = row.querySelectorAll('input');
                if(inputs.length >= 2 && inputs[0].value) {
                    options.push({ name: inputs[0].value, price: inputs[1].value });
                }
            });
            
            const payload = { description, base_price, options };
            const btn = document.getElementById('btnInstallSave');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> СОХРАНЕНИЕ...';
            
            try {
                const res = await fetch(`/api/installations/${key}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) alert("Настройки сохранены!");
                else alert("Ошибка сохранения");
            } catch (err) {
                alert("Ошибка соединения");
            } finally {
                btn.innerHTML = 'СОХРАНИТЬ НАСТРОЙКИ';
            }
        }

        // --- TAB SWITCHING LOGIC ---

        function switchTab(tab, el) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            
            const targetTab = document.getElementById(tab + '-tab');
            if (targetTab) targetTab.classList.add('active');
            if (el) el.classList.add('active');
            
            if (tab === 'installations') {
                loadInstallForm('ac');
            }
            
            console.log(`Switching to tab: ${tab}`);

            // Close sidebar on mobile after tab switch
            if (window.innerWidth <= 1024) {
                toggleSidebar();
            }

            switch(tab) {
                case 'products': loadProducts(); break;
                case 'users': loadUsers(); break;
                case 'spare-parts': loadSpareParts(); break;
                case 'vip': loadSubscribers(); break;
                case 'projects': loadAdminProjects(); break;
                case 'search-hints': loadSearchHints(); break;
                case 'faqs': loadAdminFAQs(); break;
                case 'team': loadTeam(); break;
                case 'settings': initSettings(); break;
            }
        }

        function switchSettings(section, el) {
            document.querySelectorAll('.s-section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.s-nav-item').forEach(i => i.classList.remove('active'));
            
            document.getElementById('s-' + section).classList.add('active');
            el.classList.add('active');
        }

        function initSettings() {
            const btnOtp = document.getElementById('btn-send-otp');
            const btnUpdate = document.getElementById('btn-update-pass');
            const otpArea = document.getElementById('otp-area');
            const form = document.getElementById('passwordChangeForm');

            btnOtp.onclick = async () => {
                const oldPass = document.getElementById('s_old_pass').value;
                const newPass = document.getElementById('s_new_pass').value;
                const confirmPass = document.getElementById('s_confirm_pass').value;

                if (!oldPass || !newPass || !confirmPass) return alert("Заполните все поля");
                if (newPass !== confirmPass) return alert("Пароли не совпадают");
                if (newPass.length < 6) return alert("Пароль должен быть не менее 6 символов");

                btnOtp.innerText = "ОТПРАВКА...";
                btnOtp.disabled = true;

                try {
                    const res = await fetch('/api/admin/send-otp', { method: 'POST' });
                    if (res.ok) {
                        alert("8-значный код отправлен на saycomcompaniy@gmail.com");
                        otpArea.style.display = 'block';
                        btnOtp.style.display = 'none';
                        btnUpdate.style.display = 'block';
                    } else {
                        alert("Ошибка отправки кода");
                        btnOtp.disabled = false;
                        btnOtp.innerText = "ОТПРАВИТЬ КОД";
                    }
                } catch (e) {
                    alert("Ошибка сети");
                    btnOtp.disabled = false;
                    btnOtp.innerText = "ОТПРАВИТЬ КОД";
                }
            };

            form.onsubmit = async (e) => {
                e.preventDefault();
                const oldPassword = document.getElementById('s_old_pass').value;
                const newPassword = document.getElementById('s_new_pass').value;
                const otp = document.getElementById('s_otp').value;

                if (otp.length !== 8) return alert("Введите 8-значный код");

                try {
                    const res = await fetch('/api/admin/update-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ oldPassword, newPassword, otp })
                    });
                    
                    const data = await res.json();
                    if (res.ok) {
                        alert("Пароль успешно изменен! Теперь используйте новый пароль при входе.");
                        window.location.reload();
                    } else {
                        alert("Ошибка: " + data.error);
                    }
                } catch (e) {
                    alert("Ошибка сети");
                }
            };
        }

        window.onload = () => {
            loadProducts();
        };

        // --- PRODUCTS LOGIC ---
        async function loadProducts() {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                const table = document.getElementById('productTable');
                if(!table) return;

                const products = data.data || [];
                products.forEach(p => store.products[p.id] = p);

                table.innerHTML = products.map((p, i) => `
                    <tr>
                        <td><input type="checkbox" class="p-check" value="${p.id}"></td>
                        <td style="color:#475569;">${i+1}</td>
                        <td><img src="${p.image_url}" class="prod-thumb" onerror="this.src='/uploads/placeholder.png'"></td>
                        <td>
                            <div class="prod-name">${p.title}</div>
                            ${p.badge ? `<span class="prod-badge">${p.badge}</span>` : ''}
                        </td>
                        <td><span class="cat-badge">${p.category}</span></td>
                        <td><b>₸${(p.price || 0).toLocaleString()}</b></td>
                        <td><span style="color:#FBBF24; font-size:11px;"><i class="fa-solid fa-star"></i> ${(p.rating || 5).toFixed(1)} <small style="color:#64748B;">(${p.reviews || 0})</small></span></td>
                        <td>
                            <div class="action-btns">
                                <a href="/product?id=${p.id}" target="_blank" style="background:#10B981; width:32px; height:32px; border-radius:6px; display:flex; align-items:center; justify-content:center; color:white; text-decoration:none;" title="Посмотреть на сайте"><i class="fa-solid fa-eye"></i></a>
                                <button class="btn-act-yellow" onclick="editProduct(${p.id})"><i class="fa-solid fa-pen"></i></button>
                                <button class="btn-act-red" onclick="deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            } catch (err) { console.error("Load products failed:", err); }
        }

        function editProduct(id) {
            const p = store.products[id];
            if(!p) return;
            document.getElementById('formTitle').innerText = "Редактировать #" + p.id;
            document.getElementById('p_id').value = p.id;
            document.getElementById('p_name').value = p.title;
            document.getElementById('p_category').value = p.category;
            document.getElementById('p_price').value = p.price;
            document.getElementById('p_oldPrice').value = p.oldPrice || '';
            document.getElementById('p_badge').value = p.badge || '';
            document.getElementById('p_tag1').value = p.tag1 || '';
            document.getElementById('p_tag2').value = p.tag2 || '';
            document.getElementById('p_tag3').value = p.tag3 || '';
            document.getElementById('p_desc').value = p.description || '';
            document.getElementById('p_long').value = p.long_description || '';
            document.getElementById('p_inst').value = p.installation_info || '';
            document.getElementById('p_stock').value = p.stock_count || 15;
            document.getElementById('p_sold').value = p.units_sold || 234;
            const container = document.getElementById('spec-container');
            if(container) {
                container.innerHTML = '';
                if(p.specifications) {
                    p.specifications.split(';').forEach(s => {
                        const [k, v] = s.split(':');
                        if(k) addSpecRow(k, v);
                    });
                }
            }
            
            // Show existing main image
            document.getElementById('p_main_preview').innerHTML = p.image_url ? `
                <div style="margin-top:10px; color:#94A3B8; font-size:12px;">Текущее:</div>
                <div style="position:relative; width:60px; height:60px; border-radius:6px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); margin-top:5px;">
                    <img src="${p.image_url}" style="width:100%; height:100%; object-fit:cover; cursor:zoom-in;" onclick="openAdminLightbox(this.src)">
                </div>
            ` : '';
            
            // Show existing gallery images
            clearGallery('p'); // clear unsaved selections
            const existingGal = p.gallery_urls ? p.gallery_urls.split(';').filter(Boolean) : [];
            const exContainer = document.getElementById('p_existing_gallery');
            if(existingGal.length > 0) {
                exContainer.innerHTML = `
                    <div style="width:100%; color:#94A3B8; font-size:12px; margin-bottom:5px;">Текущая галерея на сервере (будут сохранены):</div>
                    ${existingGal.map(url => `
                        <div style="position:relative; width:60px; height:60px; border-radius:6px; overflow:hidden; border:1px solid rgba(255,255,255,0.1);">
                            <img src="${url}" style="width:100%; height:100%; object-fit:cover; cursor:zoom-in;" onclick="openAdminLightbox(this.src)">
                        </div>
                    `).join('')}
                `;
            } else { exContainer.innerHTML = ''; }
        }

        async function handleSave(e) {
            e.preventDefault();
            const id = document.getElementById('p_id').value;
            const specs = [];
            document.querySelectorAll('#spec-container div').forEach(row => {
                const inputs = row.querySelectorAll('input');
                if(inputs.length >= 2 && inputs[0].value) specs.push(`${inputs[0].value}:${inputs[1].value}`);
            });
            const formData = new FormData();
            formData.append('title', document.getElementById('p_name').value);
            formData.append('category', document.getElementById('p_category').value);
            formData.append('price', document.getElementById('p_price').value);
            formData.append('oldPrice', document.getElementById('p_oldPrice').value);
            formData.append('badge', document.getElementById('p_badge').value);
            formData.append('tag1', document.getElementById('p_tag1').value);
            formData.append('tag2', document.getElementById('p_tag2').value);
            formData.append('tag3', document.getElementById('p_tag3').value);
            formData.append('description', document.getElementById('p_desc').value);
            formData.append('long_description', document.getElementById('p_long').value);
            formData.append('installation_info', document.getElementById('p_inst').value);
            formData.append('stock_count', document.getElementById('p_stock').value);
            formData.append('units_sold', document.getElementById('p_sold').value);
            formData.append('specifications', specs.join(';'));
            const file = document.getElementById('p_file').files[0];
            if(file) formData.append('image', file);
            // Append gallery images from state
            galleryState.p.forEach(file => formData.append('gallery', file));
            if (id && galleryState.p.length > 0) formData.append('gallery_append', 'true');
            
            const url = id ? `/api/products/${id}` : '/api/products';
            const method = id ? 'PUT' : 'POST';
            try {
                const res = await fetch(url, { method, body: formData });
                if(res.ok) {
                    alert(id ? "Обновлено!" : "Добавлено!");
                    e.target.reset();
                    document.getElementById('p_id').value = '';
                    document.getElementById('formTitle').innerText = "Добавить новый товар";
                    const sc = document.getElementById('spec-container');
                    if(sc) sc.innerHTML = '';
                    document.getElementById('p_main_preview').innerHTML = ''; // Reset main image preview
                    document.getElementById('p_existing_gallery').innerHTML = ''; // Clear server gallery preview
                    clearGallery('p'); // Reset gallery preview
                    loadProducts();
                } else {
                    const err = await res.json();
                    alert('Ошибка сервера: ' + (err.error || 'Неизвестная ошибка'));
                }
            } catch (err) { 
                alert("Ошибка соединения: " + err.message); 
                console.error("Save Product Error:", err);
            }
        }

        async function deleteProduct(id) { if(!confirm("Удалить товар?")) return; await fetch(`/api/products/${id}`, { method: 'DELETE' }); loadProducts(); }

        function addSpecRow(k='', v='') {
            const div = document.createElement('div');
            div.style.display = 'flex'; div.style.gap = '8px'; div.style.marginBottom = '8px';
            div.innerHTML = `<input type="text" placeholder="Характеристика" value="${k}" style="flex:1;"><input type="text" placeholder="Значение" value="${v}" style="flex:1;"><button type="button" onclick="this.parentElement.remove()" style="background:#EF4444; border:none; border-radius:6px; color:white; width:34px; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>`;
            const container = document.getElementById('spec-container');
            if(container) container.appendChild(div);
        }

        async function loadUsers() {
            try {
                const res = await fetch('/api/admin/users');
                const data = await res.json();
                const table = document.getElementById('userTable');
                if(!table) return;
                table.innerHTML = (data.data || []).map(u => `
                    <tr>
                        <td><div style="display:flex; align-items:center; gap:10px;"><div style="width:30px; height:30px; background:rgba(16,185,129,0.1); color:var(--primary); font-weight:800; display:flex; align-items:center; justify-content:center; border-radius:6px;">${(u.full_name || 'U')[0].toUpperCase()}</div><div>${u.full_name}<br><small style="color:#64748B;">${u.email}</small></div></div></td>
                        <td><code style="color:var(--primary);">${u.password}</code></td>
                        <td>${u.phone || '—'}</td>
                        <td><small style="color:#10B981">● Online</small></td>
                    </tr>
                `).join('');
            } catch (err) { console.error(err); }
        }

        async function loadSubscribers() {
            try {
                const res = await fetch('/api/vip/subscribers');
                const data = await res.json();
                const table = document.getElementById('subscriberTable');
                if(!table) return;
                if(!data || !data.data || data.data.length === 0) {
                    table.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:40px; color:#64748B;">Подписчиков пока нет</td></tr>';
                    return;
                }
                table.innerHTML = data.data.map(s => {
                    const ds = s.subscribed_at ? s.subscribed_at.replace(' ', 'T') : null;
                    const dobj = ds ? new Date(ds) : null;
                    return `<tr><td style="color:#64748B;">${s.id}</td><td><b>${s.email}</b></td><td>${(dobj && !isNaN(dobj)) ? dobj.toLocaleDateString() : '—'}</td><td><span class="prod-badge">Active</span></td></tr>`;
                }).join('');
            } catch (err) { console.error(err); }
        }

        async function handleBroadcast(e) {
            e.preventDefault();
            const subject = document.getElementById('b_subject').value;
            const message = document.getElementById('b_message').value;
            const btn = document.getElementById('broadcastBtn');
            if(!confirm(`Отправить всем VIP?`)) return;
            try {
                if(btn) { btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>...'; btn.disabled = true; }
                const res = await fetch('/api/vip/broadcast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject, message }) });
                if(res.ok) { alert("Отправлено!"); e.target.reset(); }
            } catch (err) { alert("Ошибка"); } finally { if(btn) { btn.innerHTML = 'ОТПРАВИТЬ ВСЕМ (VIP)'; btn.disabled = false; } }
        }

        async function loadSpareParts() {
            try {
                const res = await fetch('/api/spare-parts');
                const data = await res.json();
                const table = document.getElementById('spareTable');
                if(!table) return;
                const parts = data.data || [];
                parts.forEach(p => store.spareParts[p.id] = p);
                table.innerHTML = parts.map((sp, i) => `
                    <tr>
                        <td><input type="checkbox" class="sp-check" value="${sp.id}"></td>
                        <td>${i+1}</td>
                        <td><img src="${sp.image_url}" class="prod-thumb" onerror="this.src='/uploads/parts-placeholder.png'"></td>
                        <td><div class="prod-name">${sp.title}</div></td>
                        <td><span class="cat-badge">${sp.category}</span></td>
                        <td><span class="cat-badge" style="background:rgba(255,255,255,0.02)">${sp.compatibility || '—'}</span></td>
                        <td><b>₸${(sp.price || 0).toLocaleString()}</b></td>
                        <td>${sp.stock_count || 0}</td>
                        <td>
                            <div class="action-btns">
                                <button class="btn-act-yellow" onclick="editSparePart(${sp.id})"><i class="fa-solid fa-pen"></i></button>
                                <button class="btn-act-red" onclick="deleteSparePart(${sp.id})"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            } catch (err) { console.error(err); }
        }

        function editSparePart(id) {
            const sp = store.spareParts[id];
            if(!sp) return;
            document.getElementById('spareFormTitle').innerText = "Редактировать #" + sp.id;
            document.getElementById('sp_id').value = sp.id;
            document.getElementById('sp_title').value = sp.title;
            document.getElementById('sp_category').value = sp.category;
            document.getElementById('sp_compatibility').value = sp.compatibility || '';
            document.getElementById('sp_price').value = sp.price;
            document.getElementById('sp_stock').value = sp.stock_count;
            
            // Show existing main image
            document.getElementById('sp_main_preview').innerHTML = sp.image_url ? `
                <div style="margin-top:10px; color:#94A3B8; font-size:12px;">Текущее:</div>
                <div style="position:relative; width:60px; height:60px; border-radius:6px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); margin-top:5px;">
                    <img src="${sp.image_url}" style="width:100%; height:100%; object-fit:cover; cursor:zoom-in;" onclick="openAdminLightbox(this.src)">
                </div>
            ` : '';
            
            // Show existing gallery images
            clearGallery('sp'); // clear unsaved selections
            const existingGal = sp.gallery_urls ? sp.gallery_urls.split(';').filter(Boolean) : [];
            const exContainer = document.getElementById('sp_existing_gallery');
            if(existingGal.length > 0) {
                exContainer.innerHTML = `
                    <div style="width:100%; color:#94A3B8; font-size:12px; margin-bottom:5px;">Текущая галерея на сервере (будут сохранены):</div>
                    ${existingGal.map(url => `
                        <div style="position:relative; width:60px; height:60px; border-radius:6px; overflow:hidden; border:1px solid rgba(255,255,255,0.1);">
                            <img src="${url}" style="width:100%; height:100%; object-fit:cover; cursor:zoom-in;" onclick="openAdminLightbox(this.src)">
                        </div>
                    `).join('')}
                `;
            } else { exContainer.innerHTML = ''; }
        }

        async function handleSpareSave(e) {
            e.preventDefault();
            const id = document.getElementById('sp_id').value;
            const formData = new FormData(e.target);
            
            // Append gallery images from state
            galleryState.sp.forEach(file => formData.append('gallery', file));
            if (id && galleryState.sp.length > 0) formData.append('gallery_append', 'true');

            const url = id ? `/api/spare-parts/${id}` : '/api/spare-parts';
            const method = id ? 'PUT' : 'POST';
            try {
                const res = await fetch(url, { method, body: formData });
                if(res.ok) { 
                    alert("Сохранено!"); 
                    e.target.reset(); 
                    document.getElementById('sp_id').value = ''; 
                    document.getElementById('sp_main_preview').innerHTML = ''; // Reset main image preview
                    document.getElementById('sp_existing_gallery').innerHTML = ''; // Clear server gallery preview
                    clearGallery('sp'); // Reset gallery preview
                    loadSpareParts(); 
                } else {
                    const err = await res.json();
                    alert('Ошибка сервера: ' + (err.error || 'Неизвестная ошибка'));
                }
            } catch (err) { 
                alert("Ошибка соединения: " + err.message); 
                console.error("Save Spare Part Error:", err);
            }

        }

        async function deleteSparePart(id) { if(!confirm("Удалить?")) return; await fetch(`/api/spare-parts/${id}`, { method: 'DELETE' }); loadSpareParts(); }

        async function loadSearchHints() {
            try {
                const res = await fetch('/api/search-hints-all');
                const data = await res.json();
                const table = document.getElementById('hintTable');
                if(!table) return;
                table.innerHTML = (data.data || []).map(h => `
                    <tr>
                        <td>${h.id}</td>
                        <td><b>${h.text}</b></td>
                        <td><span class="cat-badge">${h.category || '—'}</span></td>
                        <td>
                            <div class="action-btns">
                                <button class="btn-act-yellow" onclick="editHint(${h.id}, '${h.text.replace(/'/g, "\\'")}', '${h.category || ''}')"><i class="fa-solid fa-pen"></i></button>
                                <button class="btn-act-red" onclick="deleteHint(${h.id})"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            } catch (err) { console.error(err); }
        }

        async function handleHintSave(e) {
            e.preventDefault();
            const id = document.getElementById('h_id').value;
            const text = document.getElementById('h_text').value;
            const category = document.getElementById('h_category').value;
            const url = id ? `/api/search-hints/${id}` : '/api/search-hints';
            const method = id ? 'PUT' : 'POST';
            await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, category }) });
            e.target.reset(); document.getElementById('h_id').value = ''; loadSearchHints();
        }

        function editHint(id, text, cat) {
            document.getElementById('h_id').value = id;
            document.getElementById('h_text').value = text;
            document.getElementById('h_category').value = cat || "";
        }

        async function deleteHint(id) { if(!confirm('Удалить?')) return; await fetch(`/api/search-hints/${id}`, { method: 'DELETE' }); loadSearchHints(); }

        async function loadAdminProjects() {
            try {
                const res = await fetch('/api/projects');
                const result = await res.json();
                const table = document.getElementById('adminProjectTable');
                if(!table) return;
                const projects = result.data || [];
                projects.forEach(p => store.projects[p.id] = p);
                table.innerHTML = projects.map(p => `
                    <tr>
                        <td>${p.id}</td>
                        <td>${p.video_url ? `<video src="${p.video_url}" muted style="width:100px; height:60px; object-fit:cover; border-radius:8px;"></video>` : 'No Video'}</td>
                        <td><b>${p.title}</b></td>
                        <td>
                            <div style="display:flex; gap:10px; font-size:12px; color:#94A3B8;">
                                <span title="Likes"><i class="fa-solid fa-heart" style="color:#EF4444;"></i> ${p.likes || 0}</span>
                                <span title="Shares"><i class="fa-solid fa-paper-plane" style="color:#3B82F6;"></i> ${p.shares || 0}</span>
                                <span title="Saves"><i class="fa-solid fa-bookmark" style="color:#F59E0B;"></i> ${p.saves || 0}</span>
                                <span title="Comments"><i class="fa-solid fa-comment" style="color:#10B981;"></i> ${p.comments_count || 0}</span>
                            </div>
                        </td>
                        <td>
                            <div class="action-btns">
                                <button class="btn-act-yellow" onclick="editProjectDetails(${p.id})"><i class="fa-solid fa-pen"></i></button>
                                <button class="btn-act-red" onclick="deleteProject(${p.id})"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            } catch (err) { console.error(err); }
        }

        function editProjectDetails(id) {
            const p = store.projects[id]; if(!p) return;
            document.getElementById('proj_id').value = p.id;
            document.getElementById('proj_title').value = p.title;
            document.getElementById('proj_description').value = p.description;
        }

        async function handleProjectSave(e) {
            e.preventDefault();
            const id = document.getElementById('proj_id').value;
            const formData = new FormData(e.target);
            const url = id ? `/api/projects/${id}` : '/api/projects';
            const method = id ? 'PUT' : 'POST';
            
            const btn = e.target.querySelector('button[type="submit"]');
            const originalBtnText = btn.innerHTML;
            
            try {
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> СОХРАНЯЕМ...';
                
                const res = await fetch(url, { method, body: formData });
                if (res.ok) {
                    alert(id ? "Проект обновлен!" : "Проект добавлен!");
                    e.target.reset();
                    document.getElementById('proj_id').value = '';
                    loadAdminProjects();
                } else {
                    const err = await res.json();
                    alert('Ошибка сервера: ' + (err.error || 'Неизвестная ошибка'));
                }
            } catch (err) {
                alert("Ошибка соединения: " + err.message);
                console.error("Save Project Error:", err);
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalBtnText;
            }
        }

        async function deleteProject(id) { if(!confirm('Удалить?')) return; await fetch(`/api/projects/${id}`, { method: 'DELETE' }); loadAdminProjects(); }

        async function loadAdminFAQs() {
            try {
                const res = await fetch('/api/faqs');
                const result = await res.json();
                const table = document.getElementById('adminFaqTable');
                if(!table) return;
                table.innerHTML = (result.data || []).map(f => `
                    <tr>
                        <td>${f.id}</td>
                        <td style="font-weight:700;">${f.question}</td>
                        <td style="max-width:300px; color:#94A3B8;">${(f.answer || '').substring(0, 100)}...</td>
                        <td>
                            <div class="action-btns">
                                <button class="btn-act-yellow" onclick="editFAQ(${f.id}, '${f.question.replace(/'/g, "\\'")}', '${f.answer.replace(/'/g, "\\'").replace(/\n/g, "\\n")}')"><i class="fa-solid fa-pen"></i></button>
                                <button class="btn-act-red" onclick="deleteFAQ(${f.id})"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            } catch (err) { console.error(err); }
        }

        function editFAQ(id, q, a) {
            document.getElementById('faq_id').value = id;
            document.getElementById('faq_question').value = q;
            document.getElementById('faq_answer').value = a.replace(/\\n/g, '\n');
            document.getElementById('faqFormTitle').innerText = 'Редактировать FAQ #' + id;
            document.getElementById('faqForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('faq_question').focus();
        }

        async function deleteFAQ(id) {
            if (!confirm('Удалить этот FAQ?')) return;
            try {
                const res = await fetch(`/api/faqs/${id}`, { method: 'DELETE' });
                if (res.ok) { loadAdminFAQs(); }
                else { alert('Ошибка при удалении'); }
            } catch (err) { alert('Ошибка соединения'); }
        }

        async function handleFAQSave(e) {
            e.preventDefault();
            const id = document.getElementById('faq_id').value;
            const q = document.getElementById('faq_question').value.trim();
            const a = document.getElementById('faq_answer').value.trim();
            if (!q || !a) return alert('Заполните все поля!');
            const url = id ? `/api/faqs/${id}` : '/api/faqs';
            const method = id ? 'PUT' : 'POST';
            try {
                const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q, answer: a }) });
                if (res.ok) {
                    e.target.reset();
                    document.getElementById('faq_id').value = '';
                    document.getElementById('faqFormTitle').innerText = 'Добавить вопрос (FAQ)';
                    loadAdminFAQs();
                } else { alert('Ошибка сохранения'); }
            } catch (err) { alert('Ошибка соединения'); }
        }

        function toggleSelectAll(s) { document.querySelectorAll('.p-check').forEach(c => c.checked = s.checked); }
        async function deleteSelected() {
            const ids = Array.from(document.querySelectorAll('.p-check:checked')).map(c => parseInt(c.value));
            if(ids.length === 0 || !confirm("Удалить выбранные?")) return;
            await fetch('/api/products/bulk/delete', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) }); loadProducts();
        }
        async function deleteAll() { if(confirm("УДАЛИТЬ ВСЕ?")) await fetch('/api/products-all/delete', { method: 'DELETE' }); loadProducts(); }

        function toggleSelectAllSpares(s) { document.querySelectorAll('.sp-check').forEach(c => c.checked = s.checked); }
        async function deleteSelectedSpares() {
            const ids = Array.from(document.querySelectorAll('.sp-check:checked')).map(c => parseInt(c.value));
            if(ids.length === 0 || !confirm("Удалить выбранные запчасти?")) return;
            await fetch('/api/spare-parts/bulk/delete', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) }); loadSpareParts();
        }
        async function deleteAllSpares() { if(confirm("УДАЛИТЬ ВСЕ ЗАПЧАСТИ?")) await fetch('/api/spare-parts-all/delete', { method: 'DELETE' }); loadSpareParts(); }

        // --- TEAM MANAGEMENT ---
        async function loadTeam() {
            try {
                const res = await fetch('/api/team');
                const data = await res.json();
                const table = document.getElementById('teamTable');
                if(!table) return;
                const members = data.data || [];
                members.forEach(m => store.team[m.id] = m);
                table.innerHTML = members.map(m => `
                    <tr>
                        <td><img src="/${m.image_url}" class="prod-thumb" onerror="this.src='/uploads/team-placeholder.png'"></td>
                        <td><b>${m.name}</b></td>
                        <td>${m.role}</td>
                        <td>${m.experience} лет</td>
                        <td>
                            <div class="action-btns">
                                <button class="btn-act-yellow" onclick="editTeamMember(${m.id})"><i class="fa-solid fa-pen"></i></button>
                                <button class="btn-act-red" onclick="deleteTeamMember(${m.id})"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            } catch (e) { console.error(e); }
        }

        async function handleTeamSave(e) {
            e.preventDefault();
            const id = document.getElementById('t_id').value;
            const formData = new FormData(e.target);
            const url = id ? `/api/team/${id}` : '/api/team';
            const method = id ? 'PUT' : 'POST';
            try {
                const res = await fetch(url, { method, body: formData });
                if(res.ok) {
                    alert("Успешно сохранено!");
                    e.target.reset();
                    document.getElementById('t_id').value = '';
                    document.getElementById('teamFormTitle').innerText = "Добавить сотрудника";
                    loadTeam();
                }
            } catch (e) { alert("Ошибка сохранения"); }
        }

        function editTeamMember(id) {
            const m = store.team[id];
            if(!m) return;
            document.getElementById('teamFormTitle').innerText = "Редактировать: " + m.name;
            document.getElementById('t_id').value = m.id;
            document.getElementById('t_name').value = m.name;
            document.getElementById('t_role').value = m.role;
            document.getElementById('t_experience').value = m.experience;
            document.getElementById('t_specialization').value = m.specialization || '';
            document.getElementById('t_bio').value = m.bio || '';
            document.getElementById('t_linkedin').value = m.linkedin_url || '';
        }

        async function deleteTeamMember(id) {
            if(!confirm("Удалить этого сотрудника?")) return;
            try {
                await fetch(`/api/team/${id}`, { method: 'DELETE' });
                loadTeam();
            } catch (e) { console.error(e); }
        }
    