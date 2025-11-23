        // DOM Elements
        const loginPage = document.getElementById('loginPage');
        const socialFeed = document.getElementById('socialFeed');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const showSignupBtn = document.getElementById('showSignup');
        const showLoginBtn = document.getElementById('showLogin');
        const signupForm = document.getElementById('signupForm');
        const userDisplay = document.getElementById('userDisplay');
        const logoutBtn = document.getElementById('logoutBtn');
        const themeToggle = document.getElementById('themeToggle');
        const postText = document.getElementById('postText');
        const createPostBtn = document.getElementById('createPostBtn');
        const postsContainer = document.getElementById('postsContainer');
        const searchInput = document.getElementById('searchInput');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const emojiBtn = document.getElementById('emojiBtn');
        const emojiPicker = document.getElementById('emojiPicker');
        const imageBtn = document.getElementById('imageBtn');
        const imageModal = document.getElementById('imageModal');
        const closeImageModal = document.getElementById('closeImageModal');
        const addImageBtn = document.getElementById('addImageBtn');
        const imageUrlInput = document.getElementById('imageUrlInput');
        
        // App States
        let currentUser = null;
        let posts = JSON.parse(localStorage.getItem('posts')) || [];
        let currentFilter = 'latest';
        let isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        // Initi App
        function initApp() {
            // Check if user is logged in
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                showSocialFeed();
            }
            
            //theme
            if (isDarkMode) {
                document.body.classList.add('dark-mode');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
            renderPosts();
        }
        
        // Show or Hide Forms
        showSignupBtn.addEventListener('click', () => {
            document.querySelector('.form-container').style.display = 'none';
            signupForm.style.display = 'block';
        });
        
        showLoginBtn.addEventListener('click', () => {
            signupForm.style.display = 'none';
            document.querySelector('.form-container').style.display = 'block';
        });
        
        // Login Function
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                showSocialFeed();
            } else {
                alert('Invalid email or password');
            }
        });
        
        // Signup Function
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            
            // Check user already exists
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const existingUser = users.find(u => u.email === email);
            
            if (existingUser) {
                alert('User with this email already exists');
                return;
            }
            
            // Create new user
            const newUser = { name, email, password };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showSocialFeed();
        });
        
        // Logout Functionality
        logoutBtn.addEventListener('click', () => {
            currentUser = null;
            localStorage.removeItem('currentUser');
            showLoginPage();
        });
        
        
        themeToggle.addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
            
            if (isDarkMode) {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        });
        
        // Create Post
        createPostBtn.addEventListener('click', () => {
            const content = postText.value.trim();
            if (!content) return;
            
            const newPost = {
                id: Date.now(),
                userId: currentUser.email,
                userName: currentUser.name,
                content: content,
                imageUrl: null,
                likes: 0,
                liked: false,
                timestamp: new Date().toISOString()
            };
            
            posts.unshift(newPost);
            savePosts();
            renderPosts();
            postText.value = '';
        });
        
        // Add Image to Post
        imageBtn.addEventListener('click', () => {
            imageModal.style.display = 'flex';
        });
        
        closeImageModal.addEventListener('click', () => {
            imageModal.style.display = 'none';
            imageUrlInput.value = '';
        });
        
        addImageBtn.addEventListener('click', () => {
            const imageUrl = imageUrlInput.value.trim();
            if (imageUrl) {
                postText.value += ` [Image: ${imageUrl}]`;
                imageModal.style.display = 'none';
                imageUrlInput.value = '';
            }
        });
        
        // Emoji 
        emojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = emojiBtn.getBoundingClientRect();
            emojiPicker.style.display = 'block';
            emojiPicker.style.top = `${rect.bottom + 5}px`;
            emojiPicker.style.left = `${rect.left}px`;
        });
        
        document.addEventListener('click', () => {
            emojiPicker.style.display = 'none';
        });
        
        emojiPicker.addEventListener('click', (e) => {
            if (e.target.classList.contains('emoji')) {
                postText.value += e.target.textContent;
            }
        });
        
        // Search Post
        searchInput.addEventListener('input', () => {
            renderPosts();
        });
        
        // Filter Post
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderPosts();
            });
        });
        
        // Like Post
        function likePost(postId) {
            const post = posts.find(p => p.id === postId);
            if (post) {
                if (post.liked) {
                    post.likes--;
                    post.liked = false;
                } else {
                    post.likes++;
                    post.liked = true;
                }
                savePosts();
                renderPosts();
            }
        }
        
        // Delete Post
        function deletePost(postId) {
            if (confirm('Are you sure you want to delete this post?')) {
                posts = posts.filter(p => p.id !== postId);
                savePosts();
                renderPosts();
            }
        }
        
        // Render Posts
        function renderPosts() {
            let filteredPosts = [...posts];
            const searchTerm = searchInput.value.toLowerCase();
            
            // Apply search filter
            if (searchTerm) {
                filteredPosts = filteredPosts.filter(post => 
                    post.content.toLowerCase().includes(searchTerm) ||
                    post.userName.toLowerCase().includes(searchTerm)
                );
            }
            
            // Apply sorting
            switch (currentFilter) {
                case 'latest':
                    filteredPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    break;
                case 'oldest':
                    filteredPosts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                    break;
                case 'most-liked':
                    filteredPosts.sort((a, b) => b.likes - a.likes);
                    break;
            }
            
            // Clear container
            postsContainer.innerHTML = '';
            
            // Render each post
            filteredPosts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'post';
                
                // Extract image URL 
                let content = post.content;
                let imageHtml = '';
                const imageMatch = content.match(/\[Image: (.*?)\]/);
                if (imageMatch) {
                    content = content.replace(imageMatch[0], '');
                    imageHtml = `<img src="${imageMatch[1]}" class="post-image" alt="Post image">`;
                }
                
                postElement.innerHTML = `
                    <div class="post-header">
                        <div class="post-user">${post.userName}</div>
                        <div class="post-time">${formatTime(post.timestamp)}</div>
                    </div>
                    <div class="post-content">${content}</div>
                    ${imageHtml}
                    <div class="post-actions">
                        <button class="like-btn ${post.liked ? 'liked' : ''}" onclick="likePost(${post.id})">
                            <i class="fas fa-heart"></i> <span>${post.likes}</span>
                        </button>
                        ${post.userId === currentUser.email ? 
                            `<button class="delete-btn" onclick="deletePost(${post.id})">
                                <i class="fas fa-trash"></i>
                            </button>` : ''
                        }
                    </div>
                `;
                
                postsContainer.appendChild(postElement);
            });
        }
        

        function showLoginPage() {
            loginPage.style.display = 'flex';
            socialFeed.style.display = 'none';
        }
        
        function showSocialFeed() {
            loginPage.style.display = 'none';
            socialFeed.style.display = 'block';
            userDisplay.textContent = `Welcome, ${currentUser.name}`;
            renderPosts();
        }
        
        function formatTime(timestamp) {
            const now = new Date();
            const postTime = new Date(timestamp);
            const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
            
            if (diffInMinutes < 1) return 'Just now';
            if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
            
            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) return `${diffInHours}h ago`;
            
            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays < 7) return `${diffInDays}d ago`;
            
            return postTime.toLocaleDateString();
        }
        


        //  Year Script 

    document.getElementById("year").textContent = new Date().getFullYear();

        function savePosts() {
            localStorage.setItem('posts', JSON.stringify(posts));
        }
        initApp();
    
