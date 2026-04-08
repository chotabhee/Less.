/* =========================================
   🧠 AI AUTO-MANAGER
   ========================================= */
window.actorDatabase = {}; 
window.processedData = []; 

rawUploads.forEach((raw, index) => {
    let titleLower = raw.title.toLowerCase();
    let isMovie = titleLower.includes('movie') || titleLower.includes('film') || titleLower.includes('full');
    let category = isMovie ? 'movie' : 'shorts';

    let genre = [];
    if (titleLower.includes('action')) genre.push('action');
    if (titleLower.includes('horror') || titleLower.includes('dark')) genre.push('horror');
    if (titleLower.includes('romance') || titleLower.includes('love')) genre.push('romance');
    if (genre.length === 0) genre.push('all');

    let safeActorName = raw.actorName ? raw.actorName.trim() : "Unknown Creator";
    let actorId = safeActorName.toLowerCase().replace(/[^a-z0-9]/g, '_');

    if (!window.actorDatabase[actorId]) {
        window.actorDatabase[actorId] = {
            id: actorId, name: safeActorName, pic: raw.actorPic || "https://i.pravatar.cc/150", 
            followers: Math.floor(Math.random() * 5000 + 100) + 'K'
        };
    } else if (raw.actorPic) {
        window.actorDatabase[actorId].pic = raw.actorPic;
    }

    let videoData = {
        id: "vid_" + index + "_" + Math.random().toString(36).substr(2, 5),
        category: category, title: raw.title, desc: raw.desc || "",
        ytAdId: raw.ytAdId || "T0VyWKXz0Ow", adTime: raw.adTime || 5,
        originalUrl: raw.videoLink, actorId: actorId,
        actorName: window.actorDatabase[actorId].name, actorPic: window.actorDatabase[actorId].pic,
        thumbnail: raw.thumbnail || "https://via.placeholder.com/300", genre: genre
    };
    window.processedData.push(videoData);
});
