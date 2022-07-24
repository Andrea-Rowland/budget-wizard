const APP_PREFIX = 'BudgetWiz-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

// I don't know if I included the right files and if I used the correct path (absolute vs. relative)
const FILES_TO_CACHE = [
    "./index.html",
    "./css/styles.css",
    "../routes/api.js",
    "../server.js"
]

self.addEventListener('install', function (e) {
    e.waitUntil(
        cahces.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeepList = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeepList.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function(key, i) {
                    if (cacheKeepList.indexOf(key) === -1) {
                        console.log('deleting cache : ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});