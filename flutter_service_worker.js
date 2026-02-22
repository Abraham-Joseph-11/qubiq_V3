'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"flutter_bootstrap.js": "ac824c099c62f0827ac0785f7db73d09",
"version.json": "70073abd017641a548a16de01bccc9dd",
"index.html": "0003f2010a8a725b05519763b4c4b39c",
"/": "0003f2010a8a725b05519763b4c4b39c",
"main.dart.js": "301d681d0eea781a61de11970ff27808",
"flutter.js": "888483df48293866f9f41d3d9274a779",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "cc4cc267db3e13a3ffb9937d25766847",
"assets/AssetManifest.json": "6f8d01722c628a56d2210e74725d3057",
"assets/NOTICES": "4842b650965fd1adc1a312fd1a374bb8",
"assets/FontManifest.json": "c75f7af11fb9919e042ad2ee704db319",
"assets/AssetManifest.bin.json": "c469cdbd6bb251355dbf7b726d5c9ee7",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "33b7d9392238c04c131b6ce224e13711",
"assets/packages/font_awesome_flutter/lib/fonts/Font-Awesome-7-Free-Regular-400.otf": "b2703f18eee8303425a5342dba6958db",
"assets/packages/font_awesome_flutter/lib/fonts/Font-Awesome-7-Brands-Regular-400.otf": "1fcba7a59e49001aa1b4409a25d425b0",
"assets/packages/font_awesome_flutter/lib/fonts/Font-Awesome-7-Free-Solid-900.otf": "5b8d20acec3e57711717f61417c1be44",
"assets/packages/flutter_inappwebview_web/assets/web/web_support.js": "509ae636cfdd93e49b5a6eaf0f06d79f",
"assets/packages/flutter_inappwebview/assets/t_rex_runner/t-rex.css": "5a8d0222407e388155d7d1395a75d5b9",
"assets/packages/flutter_inappwebview/assets/t_rex_runner/t-rex.html": "16911fcc170c8af1c5457940bd0bf055",
"assets/packages/flutter_chat_ui/assets/icon-seen.png": "b9d597e29ff2802fd7e74c5086dfb106",
"assets/packages/flutter_chat_ui/assets/2.0x/icon-seen.png": "10c256cc3c194125f8fffa25de5d6b8a",
"assets/packages/flutter_chat_ui/assets/2.0x/icon-attachment.png": "9c8f255d58a0a4b634009e19d4f182fa",
"assets/packages/flutter_chat_ui/assets/2.0x/icon-error.png": "5a59dc97f28a33691ff92d0a128c2b7f",
"assets/packages/flutter_chat_ui/assets/2.0x/icon-arrow.png": "8efbd753127a917b4dc02bf856d32a47",
"assets/packages/flutter_chat_ui/assets/2.0x/icon-send.png": "2a7d5341fd021e6b75842f6dadb623dd",
"assets/packages/flutter_chat_ui/assets/2.0x/icon-document.png": "e61ec1c2da405db33bff22f774fb8307",
"assets/packages/flutter_chat_ui/assets/2.0x/icon-delivered.png": "b6b5d85c3270a5cad19b74651d78c507",
"assets/packages/flutter_chat_ui/assets/icon-attachment.png": "17fc0472816ace725b2411c7e1450cdd",
"assets/packages/flutter_chat_ui/assets/icon-error.png": "4fceef32b6b0fd8782c5298ee463ea56",
"assets/packages/flutter_chat_ui/assets/3.0x/icon-seen.png": "684348b596f7960e59e95cff5475b2f8",
"assets/packages/flutter_chat_ui/assets/3.0x/icon-attachment.png": "fcf6bfd600820e85f90a846af94783f4",
"assets/packages/flutter_chat_ui/assets/3.0x/icon-error.png": "872d7d57b8fff12c1a416867d6c1bc02",
"assets/packages/flutter_chat_ui/assets/3.0x/icon-arrow.png": "3ea423a6ae14f8f6cf1e4c39618d3e4b",
"assets/packages/flutter_chat_ui/assets/3.0x/icon-send.png": "8e7e62d5bc4a0e37e3f953fb8af23d97",
"assets/packages/flutter_chat_ui/assets/3.0x/icon-document.png": "4578cb3d3f316ef952cd2cf52f003df2",
"assets/packages/flutter_chat_ui/assets/3.0x/icon-delivered.png": "28f141c87a74838fc20082e9dea44436",
"assets/packages/flutter_chat_ui/assets/icon-arrow.png": "678ebcc99d8f105210139b30755944d6",
"assets/packages/flutter_chat_ui/assets/icon-send.png": "34e43bc8840ecb609e14d622569cda6a",
"assets/packages/flutter_chat_ui/assets/icon-document.png": "b4477562d9152716c062b6018805d10b",
"assets/packages/flutter_chat_ui/assets/icon-delivered.png": "b064b7cf3e436d196193258848eae910",
"assets/packages/model_viewer_plus/assets/model-viewer.min.js": "dd677b435b16f44e4ca08a9f354bac24",
"assets/packages/model_viewer_plus/assets/template.html": "8de94ff19fee64be3edffddb412ab63c",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/lib/Resources/MovementIcons/Down.svg": "07c35685af21a1b5db6b7e174ce28123",
"assets/lib/Resources/MovementIcons/Up.svg": "52c56b22a278277fc22e5864162a6259",
"assets/lib/Resources/MovementIcons/Back.svg": "b4b097fd8fb8ca59661146f17059e523",
"assets/lib/Resources/MovementIcons/Foward.svg": "40639951cf2637cc6cb76c764c83d4f0",
"assets/lib/Resources/loopIcons/Repeat.svg": "f789f09e48ee71778c37cc04742c49f1",
"assets/lib/Resources/loopIcons/repeatblock.png": "cf7e8d958603b49cd76e8e484829b1ad",
"assets/lib/Resources/loopIcons/repeat.png": "ae59a298a7286ade441f71bd1737f28e",
"assets/lib/Resources/loopIcons/repeatsvg.svg": "5b289d6530e201f13609db51b56e1e4e",
"assets/lib/Resources/little_emmi.svg": "487ab1892de482fa27b3402403632c36",
"assets/lib/Resources/BlocksStructure/blueCmd.svg": "e079a89c5b339a89ae8998ccb396d924",
"assets/AssetManifest.bin": "c25a16d7aef6f2ba765a63e6c7b1b51b",
"assets/fonts/MaterialIcons-Regular.otf": "98e79ada1b60849f1b3e6f1e09df48fd",
"assets/assets/word_web/word/index.html": "d5e56ad89cbef2ea3f3d48d257fc1695",
"assets/assets/word_web/word/styles.css": "fdce066064f49b5715b36133d9e90b84",
"assets/assets/word_web/word/app.js": "f9606ee1f57c756ed3052849af7058dd",
"assets/assets/images/emmi_vibe.png": "fd24a5defe2a1ee10826475465510f3a",
"assets/assets/images/pythonide.png": "5b48fc0cf90a1d897acddec340b14ca9",
"assets/assets/images/imgnobgnew.png": "3abe66a270a7204346d081430a0e4a63",
"assets/assets/images/emmi.png": "9b15beca74a167a9cc4273de9177110c",
"assets/assets/images/ar.png": "be3ec0da025680aa77a347ccf52f5202",
"assets/assets/images/edu.jpg": "22cd06fdd98525d6ff0c8403397761c3",
"assets/assets/images/pyflownobg.png": "eb1610f06bda6a18e9f4ce32a5a9a833",
"assets/assets/images/soundmachinenobg.png": "e89cbe6c2b3243d154d192f0ddad8d5d",
"assets/assets/images/python.jpg": "2b4aab3c71d4f5fc332195b9a58f81d4",
"assets/assets/images/soundmachine.png": "16024beba82ccc527a8c2e4ad0354603",
"assets/assets/images/imagegen.png": "f1767f76d2141ec7856293c84a0f2331",
"assets/assets/images/javaflow.png": "79ca447a47a19a3242c0716e977187ce",
"assets/assets/images/java.jpg": "4e49a9b89f4d5a8d6291c7098c084181",
"assets/assets/images/posemodel.png": "a683c01d6bc84494c60f0d1be0068e34",
"assets/assets/images/excel.png": "3edfff6c056d123206f7771445954d9e",
"assets/assets/images/mitnobg.png": "67822bb6e2b64d36a2b24584bce5b546",
"assets/assets/images/pyflow.png": "6fb17368ab10e3f1993d21e3a8c2961f",
"assets/assets/images/javaflownobg.png": "b05537ae3d3e2cb26cafb3997818a616",
"assets/assets/images/suno.png": "d93115ff3b86df4cedf7ca18c66c52e7",
"assets/assets/images/chatai.png": "3c8fbc671fac19490f0685ee13c5053e",
"assets/assets/images/ppt.png": "451a4c3922ac31a9ae1ce4f29d872930",
"assets/assets/images/qubiq_music.png": "170de8c8246d358a671cb17092fd0d69",
"assets/assets/images/qubiq_logo.png": "2c0f09f32aedfcc055efc10262a58b76",
"assets/assets/images/posemodelnobg.png": "438d937560083082b672ee6de7262bba",
"assets/assets/images/word.png": "5b621df54b59b3feb1dba3f9e370f752",
"assets/assets/images/littleemmi.png": "bfabc1de1dc1d095507b97e0fbb2490d",
"assets/assets/images/quiz.png": "f62f3a6f81fa18930e9cf79c1cb82d01",
"assets/assets/images/appdev.png": "6970233870514a771c36ae1a614277c2",
"assets/assets/images/soundgen.png": "45e386008fad83859ec4747d2de6d087",
"assets/assets/images/mit.png": "903e59505a46cdebaf318cdef7754513",
"assets/assets/web.zip": "c805b8ca5fcfabdba49104d225f4a0bf",
"assets/assets/web/dist/index.html": "6e815299fcef5bab2796030b52e1d8f8",
"assets/assets/web/dist/vite.svg": "8e3a10e157f75ada21ab742c022d5430",
"assets/assets/web/dist/assets/index-BbfzEzEM.js": "be7b0bd387eee74ea95bd2136eef13a9",
"assets/assets/web/dist/assets/index-DDzBPqJa.css": "9743d2234c34801c45f5e140bd9b5bef",
"assets/assets/excel_web/dist/index.html": "91b9cfc2723e5a017d0126e0dfe237ba",
"assets/assets/excel_web/dist/vite.svg": "8e3a10e157f75ada21ab742c022d5430",
"assets/assets/excel_web/dist/assets/index-Ee9A-V15.js": "620e5f1067cafa4be1bafa8967ae4b99",
"assets/assets/excel_web/dist/assets/index-uY9H4Hhg.css": "888f7f28dfba39ef84fbb6efda4f1da8",
"assets/assets/qubiq_web/qubiq_audio.html": "c6cd5ea7d0cb879ed28f0c7b9cb03e98",
"assets/assets/qubiq_web/vite.svg": "8e3a10e157f75ada21ab742c022d5430",
"assets/assets/qubiq_web/assets/transformers.web-BIiR3S_u.js": "8efff5d6403a5e9b6936505197abeee2",
"assets/assets/qubiq_web/assets/qubiq_audio_index.css": "b212a5f9d20e59582146c4f79f0c33b8",
"assets/assets/qubiq_web/assets/ort-wasm-simd-threaded.jsep-B0T3yYHD.wasm": "c1b9cb7fc2e70817a4dabd437c7d4ee3",
"assets/assets/qubiq_web/assets/musicWorker-D9ZmZVft.js": "5d31615f1be9e4a3d6beb588c13a38ed",
"assets/assets/qubiq_web/assets/qubiq_audio_index.js": "4a64597805b97fdbc361457b7bf8ba14",
"assets/assets/www/blocks/custom_blocks.js": "74f11a227719857a5b9f59faa95a9341",
"assets/assets/www/blocks/python-blocks.js": "130bc6b9fd6167f252ef8c8f363f519b",
"assets/assets/www/index.html": "589672197c109ede4b7fd0366ca4a8b9",
"assets/assets/www/index.css": "7ef2b3032f48a1b62a02228b581f8c84",
"assets/assets/www/vite.svg": "8e3a10e157f75ada21ab742c022d5430",
"assets/assets/www/index_MIT.html": "ed0e7826e59a535bbbe03f30a16569dd",
"assets/assets/www/lib/codemirror/python.min.js": "79e417cc0d775fc28c736ef58c2c499b",
"assets/assets/www/lib/codemirror/codemirror.min.js": "3b00a21bbc8f3a1fa7df392628c92364",
"assets/assets/www/lib/codemirror/dracula.min.css": "19d0dc0eb99d49abba3a33f0f8af6bec",
"assets/assets/www/lib/codemirror/codemirror.min.css": "c1da630111dc87f804761ecc75f89eac",
"assets/assets/www/lib/skulpt/skulpt.min.js": "be0f5bfffc12e985fbea2870d1b2b8e8",
"assets/assets/www/lib/skulpt/chart.min.js": "e6452e2b454b091f857a45cce7624eae",
"assets/assets/www/lib/skulpt/skulpt-matplotlib.min.js": "8910723c226e403cfd5c58462367f0d7",
"assets/assets/www/lib/skulpt/ai_ds_mocks.js": "1d41b45d95c5b9b3374ddbf7e8cbe8d2",
"assets/assets/www/lib/skulpt/skulpt-stdlib.js": "be285bb759236c932341cf829a9d9016",
"assets/assets/www/lib/skulpt/mysql_mock.js": "6b34fa072edaf5b530e6d769229685bf",
"assets/assets/www/lib/skulpt/plt_wrapper.js": "e30f5b3d81b30cbb912da33da818f88f",
"assets/assets/www/lib/blockly/blocks_compressed.js": "3e55b2fd165638573822ea8fbeba8563",
"assets/assets/www/lib/blockly/blockly_compressed.js": "91b86ffca1735da33b289594f0e5d759",
"assets/assets/www/lib/blockly/en.js": "b74d93a75ae5c2f3aeefb73de7ece67b",
"assets/assets/www/lib/blockly/python_compressed.js": "3e31ba03b3173fbc8fe7fe7d246de504",
"assets/assets/www/assets/index-JKwT_vHL.css": "b2869228b5bd578957755a7390feedb7",
"assets/assets/www/assets/index-xPsAilHw.js": "111e169d61286ada9fdbe08c528dd5b7",
"assets/assets/www/app.js": "882132fbb745aebe2e301e351d14100a",
"assets/assets/teachable/image/index.html": "ad8572b008dc1b2974ea3a1b6ab8a506",
"assets/assets/teachable/image/vite.svg": "8e3a10e157f75ada21ab742c022d5430",
"assets/assets/teachable/image/teachable.svg": "8e3a10e157f75ada21ab742c022d5430",
"assets/assets/teachable/image/teachable.html": "b4060fa8bda7571e0d49300c954f1f8d",
"assets/assets/teachable/image/assets/teachable-index-BGmzvaFY.css": "bfc93e613cae479d19e5086e6702e363",
"assets/assets/teachable/image/assets/index-yVzi-WZm.js": "2e39f8f6bca887922b30b2868116fd0a",
"assets/assets/teachable/image/assets/index-BGmzvaFY.css": "bfc93e613cae479d19e5086e6702e363",
"assets/assets/teachable/image/assets/teachable-index-CSoxMe9Y.js": "5e72ce56bc6ad2cd3c9948bfb0b01862",
"assets/assets/teachable/audio/index.html": "ad8572b008dc1b2974ea3a1b6ab8a506",
"assets/assets/teachable/audio/vite.svg": "8e3a10e157f75ada21ab742c022d5430",
"assets/assets/teachable/audio/teachable.svg": "8e3a10e157f75ada21ab742c022d5430",
"assets/assets/teachable/audio/teachable.html": "b4060fa8bda7571e0d49300c954f1f8d",
"assets/assets/teachable/audio/assets/teachable-index-BGmzvaFY.css": "bfc93e613cae479d19e5086e6702e363",
"assets/assets/teachable/audio/assets/index-yVzi-WZm.js": "2e39f8f6bca887922b30b2868116fd0a",
"assets/assets/teachable/audio/assets/index-BGmzvaFY.css": "bfc93e613cae479d19e5086e6702e363",
"assets/assets/teachable/audio/assets/teachable-index-CSoxMe9Y.js": "5e72ce56bc6ad2cd3c9948bfb0b01862",
"assets/assets/teachable/pose/index.html": "ad8572b008dc1b2974ea3a1b6ab8a506",
"assets/assets/teachable/pose/vite.svg": "8e3a10e157f75ada21ab742c022d5430",
"assets/assets/teachable/pose/assets/index-ECK0Mmts.css": "e586c8475b5af3378f61029027e9f0df",
"assets/assets/teachable/pose/assets/index-yVzi-WZm.js": "2e39f8f6bca887922b30b2868116fd0a",
"assets/assets/teachable/pose/assets/index-XQNdh-LO.js": "0ff33185bc27d6289c206d8124d5e830",
"assets/assets/teachable/pose/assets/index-BGmzvaFY.css": "bfc93e613cae479d19e5086e6702e363",
"assets/assets/mobilenet_feature.tflite": "d8065bc96469fdc4f3fdb05b878c6bbc",
"assets/assets/curriculum.json": "4e42c3cc9056b7909b5ee3a957fe6483",
"canvaskit/skwasm.js": "1ef3ea3a0fec4569e5d531da25f34095",
"canvaskit/skwasm_heavy.js": "413f5b2b2d9345f37de148e2544f584f",
"canvaskit/skwasm.js.symbols": "0088242d10d7e7d6d2649d1fe1bda7c1",
"canvaskit/canvaskit.js.symbols": "58832fbed59e00d2190aa295c4d70360",
"canvaskit/skwasm_heavy.js.symbols": "3c01ec03b5de6d62c34e17014d1decd3",
"canvaskit/skwasm.wasm": "264db41426307cfc7fa44b95a7772109",
"canvaskit/chromium/canvaskit.js.symbols": "193deaca1a1424049326d4a91ad1d88d",
"canvaskit/chromium/canvaskit.js": "5e27aae346eee469027c80af0751d53d",
"canvaskit/chromium/canvaskit.wasm": "24c77e750a7fa6d474198905249ff506",
"canvaskit/canvaskit.js": "140ccb7d34d0a55065fbd422b843add6",
"canvaskit/canvaskit.wasm": "07b9f5853202304d3b0749d9306573cc",
"canvaskit/skwasm_heavy.wasm": "8034ad26ba2485dab2fd49bdd786837b"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
