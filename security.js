/* =========================================
   SECURITY & ANTI-PIRACY MODULE
   ========================================= */
document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        alert("Security Lock Active.");
    }
});

setInterval(() => {
    document.querySelectorAll('video').forEach(vid => {
        vid.setAttribute('controlsList', 'nodownload noplaybackrate');
        vid.setAttribute('disablePictureInPicture', 'true');
    });
}, 2000);
