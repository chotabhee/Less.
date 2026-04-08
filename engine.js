/* =========================================
   LIQUID GLASS ENGINE & INFINITE SCROLL
   ========================================= */

const shortsOnly = window.processedData.filter(v => v.category === 'shorts');
shortsOnly.sort(() => Math.random() - 0.5); 

const feed = document.getElementById('mainFeed');
const state = {}; 
let currentCategory = 'all';
let searchQuery = '';
let globalObserver; 

function renderFeed() {
    feed.innerHTML = '';
    appendShortsBatch(); 
    startObserving();
    
    feed.addEventListener('scroll', () => {
        if (feed.scrollTop + feed.clientHeight >= feed.scrollHeight - 200) appendShortsBatch(); 
    });
}

function appendShortsBatch() {
    const shuffledShorts = [...shortsOnly].sort(() => Math.random() - 0.5);
    shuffledShorts.forEach((vid) => {
        const uniqueId = vid.id + '_' + Math.random().toString(36).substr(2, 5); 
        state[uniqueId] = { adWatched: false, timerRunning: false }; 
        
        const reel = document.createElement('div');
        reel.className = `reel`;
        reel.dataset.id = uniqueId;
        reel.dataset.originalId = vid.id; 
        
        reel.innerHTML = `
            <div class="layer active-layer" id="ad-layer-${uniqueId}">
                <iframe id="yt-frame-${uniqueId}" src="" frameborder="0" style="width:100%; height:100%; pointer-events:none;"></iframe>
            </div>
            <div class="layer" id="main-layer-${uniqueId}">
                <video id="player-${uniqueId}" class="native-video" playsinline loop muted autoplay><source src="${vid.originalUrl}" type="video/mp4"></video>
            </div>
            <div class="ad-timer" id="timer-${uniqueId}" style="display:none;">Ad: ${vid.adTime}s</div>
            
            <div class="info-bar liquid-glass">
                <h2 class="movie-title">${vid.title}</h2>
                <p class="desc">${vid.desc}</p>
            </div>
            <div class="side-actions liquid-glass">
                <div class="actor-profile-btn" onclick="openActorModal('${vid.actorPic}', '${vid.title.split(' ')[0]}')"><img src="${vid.actorPic}"></div>
                <div class="action-item" onclick="likeVideo('${uniqueId}')"><i class="fa-solid fa-heart action-icon" id="like-${uniqueId}"></i><span class="action-text" id="like-count-${uniqueId}">${Math.floor(Math.random() * 50 + 10)}K</span></div>
                <div class="action-item" onclick="shareVideo('${uniqueId}')"><i class="fa-solid fa-share action-icon"></i><span class="action-text">Share</span></div>
            </div>
        `;
        feed.appendChild(reel);
        if(globalObserver) globalObserver.observe(reel); 
    });
}

window.likeVideo = function(uniqueId) {
    const likeIcon = document.getElementById(`like-${uniqueId}`);
    if (likeIcon.classList.contains('liked')) { likeIcon.classList.remove('liked'); likeIcon.style.color = ''; } 
    else { likeIcon.classList.add('liked'); likeIcon.style.color = '#E50914'; likeIcon.classList.add('fa-bounce'); setTimeout(() => likeIcon.classList.remove('fa-bounce'), 1000); }
};

window.shareVideo = function(uniqueId) {
    if (navigator.share) { navigator.share({ title: 'Check out this video on less.', url: window.location.href }); } 
    else { alert('Link copied to clipboard!'); }
};

function startObserving() {
    globalObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const uniqueId = entry.target.dataset.id;
            const origId = entry.target.dataset.originalId;
            const data = shortsOnly.find(v => v.id == origId);
            const timerEl = document.getElementById(`timer-${uniqueId}`);
            const ytFrame = document.getElementById(`yt-frame-${uniqueId}`);
            const video = document.getElementById(`player-${uniqueId}`);

            if (entry.isIntersecting) {
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                document.querySelectorAll('.nav-item')[0].classList.add('active');

                if (!state[uniqueId].adWatched && !state[uniqueId].timerRunning) {
                    state[uniqueId].timerRunning = true;
                    feed.classList.add('no-scroll'); 
                    let timeLeft = parseInt(data.adTime);
                    timerEl.style.display = 'block';
                    ytFrame.src = `https://www.youtube.com/embed/${data.ytAdId}?autoplay=1&controls=0&mute=1&modestbranding=1`;
                    
                    const countdown = setInterval(() => {
                        timeLeft--;
                        if(timerEl) timerEl.innerText = `Ad: ${timeLeft}s`;
                        if (timeLeft <= 0) {
                            clearInterval(countdown);
                            state[uniqueId].adWatched = true;
                            timerEl.style.display = 'none';
                            ytFrame.src = ""; 
                            feed.classList.remove('no-scroll'); 
                            document.getElementById(`ad-layer-${uniqueId}`).classList.remove('active-layer');
                            document.getElementById(`main-layer-${uniqueId}`).classList.add('active-layer');
                            if(video) { video.play(); video.muted = false; }
                        }
                    }, 1000);
                    state[uniqueId].interval = countdown;
                } else if (state[uniqueId].adWatched) { if(video) video.play(); }
            } else {
                if (state[uniqueId].interval) clearInterval(state[uniqueId].interval);
                if (video) { video.pause(); video.currentTime = 0; }
                if (!state[uniqueId].adWatched) { ytFrame.src = ""; feed.classList.remove('no-scroll'); }
            }
        });
    }, { threshold: 0.8 });
    document.querySelectorAll('.reel').forEach(r => globalObserver.observe(r));
}

function toggleLeftMenu() { 
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.nav-item')[2].classList.add('active');
    document.getElementById('leftSidebar').classList.add('open'); 
    document.getElementById('sidebarOverlay').style.display = 'block'; 
}

function closeSidebars() { 
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.nav-item')[0].classList.add('active');
    document.getElementById('leftSidebar').classList.remove('open'); 
    document.getElementById('rightMoviesSidebar').classList.remove('open'); 
    document.getElementById('sidebarOverlay').style.display = 'none'; 
}

function openMoviesList() { 
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.nav-item')[1].classList.add('active');
    renderMoviesGrid();
    document.getElementById('rightMoviesSidebar').classList.add('open'); 
    document.getElementById('sidebarOverlay').style.display = 'block'; 
}

function renderMoviesGrid() {
    const grid = document.getElementById('moviesCatalogueGrid');
    let movies = window.processedData.filter(v => v.category === 'movie');
    
    if (currentCategory !== 'all') movies = movies.filter(v => v.genre.includes(currentCategory));
    if (searchQuery) movies = movies.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (movies.length === 0) {
        grid.innerHTML = `<div class="no-results" style="grid-column: 1/-1; color: #888; text-align: center; padding: 30px;"><i class="fa-solid fa-film"></i><p>No movies found</p></div>`;
        return;
    }
    
    grid.innerHTML = movies.map(v => `<div class="grid-item" onclick="openMovieDetails('${v.id}')"><img src="${v.thumbnail}"></div>`).join('');
}

window.searchMovies = function() { searchQuery = document.getElementById('movieSearch').value; renderMoviesGrid(); };
window.filterCategory = function(category) {
    currentCategory = category;
    document.querySelectorAll('.cat-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    renderMoviesGrid();
};

renderFeed();

