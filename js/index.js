        // Data pengguna yang valid
        const validUsers = {
            'user@example.com': 'password123',
            'Ruu@google.com': 'demo123',
        };

        // Var aplikasi
        let currentUser = null;
        let transactions = [];
        let currentBalance = 0;
        let baseBalance = 0;
        let isFirstLoad = true;

        // DOM Elements
        const loginPage = document.getElementById('login-page');
        const mainApp = document.getElementById('main-app');
        const loginForm = document.getElementById('login-form');
        const userEmailDisplay = document.getElementById('user-email-display');
        const transactionForm = document.getElementById('transaction-form');
        const transactionList = document.getElementById('transaction-list');
        const totalIncomeEl = document.getElementById('total-income');
        const totalExpenseEl = document.getElementById('total-expense');
        const finalBalanceEl = document.getElementById('final-balance');
        const currentBalanceEl = document.getElementById('current-balance');
        const deleteAllBtn = document.getElementById('delete-all');
        const notification = document.getElementById('notification');
        const balanceModal = document.getElementById('balance-modal');
        const newBalanceInput = document.getElementById('new-balance');
        const balanceNoteInput = document.getElementById('balance-note');

        // Check ketika user sudah login
        document.addEventListener('DOMContentLoaded', function() {
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                loginUser(savedUser);
            } else {
                showLoginPage();
            }
        });

        // Login Form 
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (authenticateUser(email, password)) {
                loginUser(email);
                showNotification('✅ Login berhasil!', 'success');
            } else {
                showNotification('❌ Email atau password salah', 'error');
            }
        });

        function authenticateUser(email, password) {
            return validUsers[email] === password;
        }

        function loginUser(email) {
            currentUser = email;
            localStorage.setItem('currentUser', email);
            
            
            loadUserData();
            
            
            userEmailDisplay.textContent = `📧 ${email}`;
            
            // Show main app
            showMainApp();
            
            // Initialize date
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            document.getElementById('date').value = formattedDate;
            
            
            updateUI();
            initSwipeHandlers();
        }

        function logout() {
            if (confirm('Apakah Anda yakin ingin keluar?')) {
                currentUser = null;
                localStorage.removeItem('currentUser');
                showLoginPage();
                showNotification('👋 Sampai jumpa!', 'success');
            }
        }

        function showLoginPage() {
            loginPage.style.display = 'flex';
            mainApp.style.display = 'none';
        }

        function showMainApp() {
            loginPage.style.display = 'none';
            mainApp.style.display = 'block';
        }

        function fillDemoAccount(email, password) {
            document.getElementById('email').value = email;
            document.getElementById('password').value = password;
        }

        let startX = 0;
        let currentX = 0;
        let isSwiping = false;
        let currentSwipedItem = null;

        function initSwipeHandlers() {
            document.addEventListener('touchstart', handleTouchStart, { passive: false });
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);
            document.addEventListener('mousedown', handleMouseDown);
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        function handleTouchStart(e) {
            const item = e.target.closest('.transaction-item');
            if (!item) return;
            
            if (currentSwipedItem && currentSwipedItem !== item) {
                currentSwipedItem.classList.remove('swiped');
            }
            
            startX = e.touches[0].clientX;
            currentX = startX;
            isSwiping = true;
            currentSwipedItem = item;
        }

        function handleTouchMove(e) {
            if (!isSwiping || !currentSwipedItem) return;
            
            e.preventDefault();
            currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            
            if (diff > 0) {
                const translateX = Math.min(diff, 100);
                currentSwipedItem.querySelector('.transaction-item-content').style.transform = `translateX(-${translateX}px)`;
                currentSwipedItem.querySelector('.transaction-actions').style.right = `-${100 - translateX}px`;
            }
        }

        function handleTouchEnd() {
            if (!isSwiping || !currentSwipedItem) return;
            
            const diff = startX - currentX;
            const swipeThreshold = 50;
            
            if (diff > swipeThreshold) {
                currentSwipedItem.classList.add('swiped');
            } else {
                currentSwipedItem.classList.remove('swiped');
                resetSwipePosition();
            }
            
            isSwiping = false;
        }

        function handleMouseDown(e) {
            const item = e.target.closest('.transaction-item');
            if (!item) return;
            
            if (currentSwipedItem && currentSwipedItem !== item) {
                currentSwipedItem.classList.remove('swiped');
                resetSwipePosition();
            }
            
            startX = e.clientX;
            currentX = startX;
            isSwiping = true;
            currentSwipedItem = item;
            e.preventDefault();
        }

        function handleMouseMove(e) {
            if (!isSwiping || !currentSwipedItem) return;
            
            currentX = e.clientX;
            const diff = startX - currentX;
            
            if (diff > 0) {
                const translateX = Math.min(diff, 100);
                currentSwipedItem.querySelector('.transaction-item-content').style.transform = `translateX(-${translateX}px)`;
                currentSwipedItem.querySelector('.transaction-actions').style.right = `-${100 - translateX}px`;
            }
        }

        function handleMouseUp() {
            if (!isSwiping || !currentSwipedItem) return;
            
            const diff = startX - currentX;
            const swipeThreshold = 50;
            
            if (diff > swipeThreshold) {
                currentSwipedItem.classList.add('swiped');
            } else {
                currentSwipedItem.classList.remove('swiped');
                resetSwipePosition();
            }
            
            isSwiping = false;
        }

        function resetSwipePosition() {
            if (!currentSwipedItem) return;
            
            currentSwipedItem.querySelector('.transaction-item-content').style.transform = 'translateX(0)';
            currentSwipedItem.querySelector('.transaction-actions').style.right = '-100px';
        }

        function closeAllSwipes() {
            const swipedItems = document.querySelectorAll('.transaction-item.swiped');
            swipedItems.forEach(item => {
                item.classList.remove('swiped');
                resetSwipePosition();
            });
        }

        document.addEventListener('click', function(e) {
            if (!e.target.closest('.transaction-item') && !e.target.closest('.transaction-actions')) {
                closeAllSwipes();
            }
        });

        // USER DATA MANAGEMENT
        function loadUserData() {
            const userData = localStorage.getItem(`userData_${currentUser}`);
            if (userData) {
                const data = JSON.parse(userData);
                transactions = data.transactions || [];
                baseBalance = data.baseBalance || 0;
                currentBalance = data.currentBalance || 0;
            } else {
                // Databaru untuk user
                transactions = [];
                baseBalance = 0;
                currentBalance = 0;
            }
        }

        function saveUserData() {
            const userData = {
                transactions,
                baseBalance,
                currentBalance
            };
            localStorage.setItem(`userData_${currentUser}`, JSON.stringify(userData));
        }

        
        transactionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const type = document.querySelector('input[name="transaction-type"]:checked').value;
            const date = document.getElementById('date').value;
            const category = document.getElementById('category').value;
            const description = document.getElementById('description').value;
            const amount = parseFloat(document.getElementById('amount').value);
            
            if (isNaN(amount) || amount <= 0) {
                showNotification('⚠️ Jumlah harus lebih dari 0', 'error');
                return;
            }
            
            if (!category) {
                showNotification('⚠️ Pilih kategori terlebih dahulu', 'error');
                return;
            }
            
            const transaction = {
                id: Date.now(),
                type,
                date,
                category,
                description,
                amount
            };
            
            transactions.push(transaction);
            
            saveUserData();
            updateUI();
            
            transactionForm.reset();
            document.getElementById('expense').checked = true;
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            document.getElementById('date').value = formattedDate;
            
            showNotification('✅ Transaksi berhasil ditambahkan', 'success');
        });

        deleteAllBtn.addEventListener('click', function() {
            if (transactions.length === 0) {
                showNotification('⚠️ Tidak ada transaksi untuk dihapus', 'error');
                return;
            }
            
            if (confirm('🗑️ Apakah Anda yakin ingin menghapus semua transaksi?')) {
                transactions = [];
                baseBalance = currentBalance = 0;
                saveUserData();
                updateUI();
                showNotification('✅ Semua transaksi telah dihapus', 'success');
            }
        });

        function deleteTransaction(id) {
            const transaction = transactions.find(t => t.id === id);
            if (!transaction) return;
            
            if (transaction.isAdjustment) {
                showNotification('⚠️ Gunakan fitur ubah saldo untuk memodifikasi transaksi penyesuaian', 'error');
                return;
            }
            
            transactions = transactions.filter(t => t.id !== id);
            
            saveUserData();
            updateUI();
            
            showNotification('✅ Transaksi berhasil dihapus', 'success');
        }

        function updateUI() {
            const normalTransactions = transactions.filter(t => !t.isAdjustment);
            const totalIncome = normalTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
                
            const totalExpense = normalTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            
            currentBalance = baseBalance + totalIncome - totalExpense;
            
            const maxStatAmount = Math.max(totalIncome, totalExpense, Math.abs(currentBalance), 1000);
            
            if (isFirstLoad) {
                totalIncomeEl.textContent = totalIncome.toLocaleString('id-ID');
                totalExpenseEl.textContent = totalExpense.toLocaleString('id-ID');
                finalBalanceEl.textContent = currentBalance.toLocaleString('id-ID');
                currentBalanceEl.textContent = currentBalance.toLocaleString('id-ID');
                isFirstLoad = false;
            } else {
                animateValue(totalIncomeEl, parseInt(totalIncomeEl.textContent.replace(/\D/g, '') || 0), totalIncome, 500);
                animateValue(totalExpenseEl, parseInt(totalExpenseEl.textContent.replace(/\D/g, '') || 0), totalExpense, 500);
                animateValue(finalBalanceEl, parseInt(finalBalanceEl.textContent.replace(/\D/g, '') || 0), currentBalance, 500);
                animateValue(currentBalanceEl, parseInt(currentBalanceEl.textContent.replace(/\D/g, '') || 0), currentBalance, 500);
            }
            
            updateProgressBar('income-progress', totalIncome, maxStatAmount);
            updateProgressBar('expense-progress', totalExpense, maxStatAmount);
            updateProgressBar('balance-progress', Math.abs(currentBalance), maxStatAmount);
            
            if (transactions.length === 0) {
                transactionList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📭</div>
                        <p>Belum ada transaksi</p>
                    </div>
                `;
            } else {
                const sortedTransactions = [...transactions].sort((a, b) => 
                    new Date(b.date) - new Date(a.date)
                );
                
                transactionList.innerHTML = sortedTransactions.map(transaction => `
                    <div class="transaction-item" data-id="${transaction.id}">
                        <div class="transaction-item-content">
                            <div class="transaction-details">
                                <span class="transaction-type-badge ${transaction.type}-badge">
                                    ${transaction.isAdjustment ? '🔄 ' : ''}${transaction.type === 'income' ? '💵 Pemasukan' : '💸 Pengeluaran'}
                                </span>
                                <div class="transaction-description">${transaction.description}</div>
                                <div class="transaction-meta">
                                    🏷️ ${transaction.category} • 📅 ${formatDate(transaction.date)}
                                </div>
                            </div>
                            <div class="transaction-amount ${transaction.type}-color">
                                ${transaction.type === 'income' ? '+' : '-'}Rp ${transaction.amount.toLocaleString('id-ID')}
                            </div>
                        </div>
                        <div class="transaction-actions">
                            ${!transaction.isAdjustment ? `
                                <button class="delete-btn" onclick="deleteTransaction(${transaction.id})" title="Hapus transaksi">
                                    ×
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `).join('');
            }
        }

        function updateProgressBar(id, value, maxValue) {
            const progressBar = document.getElementById(id);
            const percentage = Math.min((value / maxValue) * 100, 100);
            
            setTimeout(() => {
                progressBar.style.width = `${percentage}%`;
            }, 100);
        }

        function animateValue(element, start, end, duration) {
            const range = end - start;
            const increment = range / (duration / 16);
            let current = start;
            
            const timer = setInterval(() => {
                current += increment;
                if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                    element.textContent = end.toLocaleString('id-ID');
                    clearInterval(timer);
                } else {
                    element.textContent = Math.round(current).toLocaleString('id-ID');
                }
            }, 16);
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
            return date.toLocaleDateString('id-ID', options);
        }

        function showNotification(message, type) {
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // Balance Modal Functions
        function openBalanceModal() {
            balanceModal.classList.add('show');
            newBalanceInput.value = currentBalance;
            newBalanceInput.focus();
            newBalanceInput.select();
        }

        function closeBalanceModal() {
            balanceModal.classList.remove('show');
            newBalanceInput.value = '';
            balanceNoteInput.value = '';
        }

        function updateBalance() {
            const newBalance = parseFloat(newBalanceInput.value);
            const note = balanceNoteInput.value.trim();
            
            if (isNaN(newBalance) || newBalance < 0) {
                showNotification('⚠️ Masukkan jumlah saldo yang valid', 'error');
                return;
            }
            
            const oldBalance = currentBalance;
            const difference = newBalance - oldBalance;
            
            baseBalance += difference;
            currentBalance = newBalance;
            
            if (oldBalance !== newBalance) {
                const adjustmentTransaction = {
                    id: Date.now(),
                    type: difference > 0 ? 'income' : 'expense',
                    date: new Date().toISOString().split('T')[0],
                    category: 'Penyesuaian Saldo',
                    description: note || `Penyesuaian saldo dari Rp ${oldBalance.toLocaleString('id-ID')} menjadi Rp ${newBalance.toLocaleString('id-ID')}`,
                    amount: Math.abs(difference),
                    isAdjustment: true
                };
                
                transactions.push(adjustmentTransaction);
            }
            
            saveUserData();
            updateUI();
            closeBalanceModal();
            showNotification('✅ Saldo berhasil diperbarui', 'success');
        }

        window.onclick = function(event) {
            if (event.target === balanceModal) {
                closeBalanceModal();
            }
        }

        newBalanceInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                updateBalance();
            }
        });