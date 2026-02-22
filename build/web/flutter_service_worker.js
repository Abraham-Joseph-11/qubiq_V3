'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"flutter_bootstrap.js": "011dd16d2e8fcdb9a90b93bd139a9c66",
"version.json": "70073abd017641a548a16de01bccc9dd",
"index.html": "f6cb5b7ca19fc870843d9a853fb2c025",
"/": "f6cb5b7ca19fc870843d9a853fb2c025",
"main.dart.js": "11d06e47ff5a612a51074b03608b613a",
"flutter.js": "888483df48293866f9f41d3d9274a779",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "cc4cc267db3e13a3ffb9937d25766847",
"assets/AssetManifest.json": "4bfbd53fb935ceeb148b55bd1ece4186",
"assets/NOTICES": "4842b650965fd1adc1a312fd1a374bb8",
"assets/FontManifest.json": "c75f7af11fb9919e042ad2ee704db319",
"assets/AssetManifest.bin.json": "247876884332885a53d2ef26d445ec08",
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
"assets/AssetManifest.bin": "bcd1c102bbba57690a13d73db5954d3d",
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
"assets/assets/web/dist/index.html": "03c55edff3eaafea69f2991204a53eaf",
"assets/assets/web/dist/vite.svg": "8e3a10e157f75ada21ab742c022d5430",
"assets/assets/web/dist/assets/index-BbfzEzEM.js": "be7b0bd387eee74ea95bd2136eef13a9",
"assets/assets/web/dist/assets/index-DDzBPqJa.css": "9743d2234c34801c45f5e140bd9b5bef",
"assets/assets/excel_web/dist/index.html": "b2e90da7874213b68950af3c82e9437f",
"assets/assets/excel_web/dist/vite.svg": "8e3a10e157f75ada21ab742c022d5430",
"assets/assets/excel_web/dist/assets/index-Ee9A-V15.js": "620e5f1067cafa4be1bafa8967ae4b99",
"assets/assets/excel_web/dist/assets/index-uY9H4Hhg.css": "888f7f28dfba39ef84fbb6efda4f1da8",
"assets/assets/qubiq_web/qubiq_audio.html": "c6cd5ea7d0cb879ed28f0c7b9cb03e98",
"assets/assets/qubiq_web/vite.svg": "8e3a10e157f75ada21ab742c022d5430",
"assets/assets/qubiq_web/assets/qubiq_audio_index.css": "b212a5f9d20e59582146c4f79f0c33b8",
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
"assets/assets/teachable/image/teachable.svg": "8e3a10e157f75ada21ab742c022d5430",
"assets/assets/teachable/image/teachable.html": "b4060fa8bda7571e0d49300c954f1f8d",
"assets/assets/teachable/image/assets/teachable-index-BGmzvaFY.css": "bfc93e613cae479d19e5086e6702e363",
"assets/assets/teachable/image/assets/teachable-index-CSoxMe9Y.js": "5e72ce56bc6ad2cd3c9948bfb0b01862",
"assets/assets/teachable/audio/teachable.svg": "8e3a10e157f75ada21ab742c022d5430",
"assets/assets/teachable/audio/teachable.html": "b4060fa8bda7571e0d49300c954f1f8d",
"assets/assets/teachable/audio/assets/teachable-index-BGmzvaFY.css": "bfc93e613cae479d19e5086e6702e363",
"assets/assets/teachable/audio/assets/teachable-index-CSoxMe9Y.js": "5e72ce56bc6ad2cd3c9948bfb0b01862",
"assets/assets/teachable/pose/vite.svg": "8e3a10e157f75ada21ab742c022d5430",
"assets/assets/teachable/pose/teachable.html": "928a9edc258b432c0325146a963d467e",
"assets/assets/teachable/pose/assets/index-ECK0Mmts.css": "e586c8475b5af3378f61029027e9f0df",
"assets/assets/teachable/pose/assets/teachable-index-ECK0Mmts.css": "e586c8475b5af3378f61029027e9f0df",
"assets/assets/teachable/pose/assets/index-XQNdh-LO.js": "0ff33185bc27d6289c206d8124d5e830",
"assets/assets/teachable/pose/assets/teachable-index-XQNdh-LO.js": "0ff33185bc27d6289c206d8124d5e830",
"assets/assets/mobilenet_feature.tflite": "d8065bc96469fdc4f3fdb05b878c6bbc",
"assets/assets/antipython_web/verify_libraries.py": "8ff19fb901014413ac29268a5812e8fa",
"assets/assets/antipython_web/verify_stdlib.py": "80d6f769ffad6c7af0677c296a9dc085",
"assets/assets/antipython_web/index.html": "5d27acae1098c608861109f0941d7436",
"assets/assets/antipython_web/verify_speech.py": "587a8064634898c9696c83becb5f91c6",
"assets/assets/antipython_web/verify_new_libs.py": "a65f96d6011ee571b7d4b88ac7b25af4",
"assets/assets/antipython_web/index.css": "6e82b65434df89e7d584000554f0ce00",
"assets/assets/antipython_web/vite.svg": "8e3a10e157f75ada21ab742c022d5430",
"assets/assets/antipython_web/verify_cv2.py": "e6177acefbac6623679eb198eef2ca7c",
"assets/assets/antipython_web/verify_webcam.py": "06f00693d24a13e58855e6c9b89160b5",
"assets/assets/antipython_web/student_project_simulation.py": "60846775b1276d54c792dc55fe3177e8",
"assets/assets/antipython_web/verify_ds_enhanced.py": "4c9b1781ee70786a47388868b18e3c3d",
"assets/assets/antipython_web/lib/skulpt/skulpt.min.js": "be0f5bfffc12e985fbea2870d1b2b8e8",
"assets/assets/antipython_web/lib/skulpt/chart.min.js": "e6452e2b454b091f857a45cce7624eae",
"assets/assets/antipython_web/lib/skulpt/skulpt-matplotlib.min.js": "8910723c226e403cfd5c58462367f0d7",
"assets/assets/antipython_web/lib/skulpt/ai_ds_mocks.js": "759de6d86a1af24d839c84691b12aef8",
"assets/assets/antipython_web/lib/skulpt/skulpt-stdlib.js": "be285bb759236c932341cf829a9d9016",
"assets/assets/antipython_web/lib/skulpt/mysql_mock.js": "cb113b4f61a78206c70007a27e096f61",
"assets/assets/antipython_web/lib/skulpt/plt_wrapper.js": "b42c6c5f525f7dc2f992a2a762f95b46",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/postiats/postiats.js": "3fb07ed8209b427691b5bf73f296f75a",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/scheme/scheme.js": "81719f0b4f3421656dc3956f538df4fd",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/sb/sb.js": "91d72aa11d232ecc95a23a89a117a1a1",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/mdx/mdx.js": "c39ed1f7a4c33954a5682ce0dcc8c7a2",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/pascal/pascal.js": "8d529f4c69dda2457328f65deb65afb0",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/cameligo/cameligo.js": "6f78745ad016576f9fa6f21a6ab63230",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/razor/razor.js": "96f487a209d824e2b79e1c55eb67f2c2",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/powerquery/powerquery.js": "877a76dd750718e45ad9eb52070320a7",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/apex/apex.js": "25a0191ab9426d77bd7875892648d228",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/go/go.js": "3975b2a16a605243aba6b8f449a9942f",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/systemverilog/systemverilog.js": "31e1a4b2515f38ac81cfd5d501d4f78f",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/sparql/sparql.js": "712cca65487ad06a5eb553d400ab0d08",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/azcli/azcli.js": "aac53c97115c2987a236f4fe4d5b176c",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/python/python.js": "0193753401b7a7847b3a72a0da15ac54",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/css/css.js": "ee6513afdba7c9ec456097c781794a29",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/clojure/clojure.js": "e80a633f5d6a292ca0f364da4470b910",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/less/less.js": "4ccfc1cccabda5ffbc357cd39b09d031",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/elixir/elixir.js": "a6cd47a65fd8140819a5304a353df098",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/redis/redis.js": "c970f999a22bc62949977dc4e2d95ed7",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/lexon/lexon.js": "9ed4eb8e9db22df8ea47b5e7b91be5ee",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/dockerfile/dockerfile.js": "10ef375525be99358d808a5377b8b300",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/dart/dart.js": "b2499616485a746eb1aeb25d565a1222",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/shell/shell.js": "e405eab39e5b4bd351c6db936327684c",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/markdown/markdown.js": "1e6edc48e4b9193d2579a78c08200220",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/scss/scss.js": "cd86765b3734581babfe709e637011aa",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/sophia/sophia.js": "c0ad13e966df4287984a97b29e69562b",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/perl/perl.js": "ac8247cf405a2b5b50eddb95cc9a883b",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/typescript/typescript.js": "8e1517a5e7951050e851b4e429a301f9",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/rust/rust.js": "1b9573ea2223abd08cb5fc6d801ca5f2",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/pug/pug.js": "d03da32987232e8be0dd535f17dad7cc",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/fsharp/fsharp.js": "97fa9e76d3d5a5d3a75f0ee293d8e987",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/r/r.js": "8673a3803205276f99a15b94924ed33a",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/freemarker2/freemarker2.js": "ccd1b5e1d02049f68f2aa3a6981949c9",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/liquid/liquid.js": "c3eded2235449fd3bc68eeb38be93f13",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/java/java.js": "b63a6c59b97d073b9f01d4dea9348de1",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/html/html.js": "1f881cd8fe28e637d19f29f0e0dc947d",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/abap/abap.js": "c72a91c6dceaf8ab28f853321c9f7ab1",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/kotlin/kotlin.js": "af70883275b44b0b15cf0adb8af13952",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/cypher/cypher.js": "47fb2504669af1bba5d4fbfca4ba7679",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/php/php.js": "df1257fbb31cd259b1cc36be2d8cd6f4",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/lua/lua.js": "ad47978e7402076dc16970971b0e808d",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/xml/xml.js": "93abf7c5be241355560f01b1e74163c6",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/pascaligo/pascaligo.js": "9417c7f51ae9ec7c845e245b4102bf17",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/solidity/solidity.js": "1f8425abe4093b04255b755f1c42c527",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/st/st.js": "18588d521aae5f9fa737ed46cce811b4",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/redshift/redshift.js": "b394438852a29b8979556a8be2a15590",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/vb/vb.js": "ea60410274669e79f47f76143b720739",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/powershell/powershell.js": "501c6d3bc3f51aa23fb72a0faebe799d",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/mips/mips.js": "54bce1aa5958a7256fff3dc23b718287",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/pla/pla.js": "89d98bf9920baa2ad9972702aff81ddd",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/tcl/tcl.js": "d11d88296372e6e3337f09be6a0cdc75",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/ini/ini.js": "7e8863b44a2f0091b1fe4bd0afa21d2a",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/handlebars/handlebars.js": "3c1cf057bce7486db3156ea570f5b621",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/scala/scala.js": "a3bad3fe9abdf645e167d53d1c637ee7",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/hcl/hcl.js": "c0ea1741ee72dca3391c51df6680e54b",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/cpp/cpp.js": "c93fbe2fbe3e09642ca39d6190c30696",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/swift/swift.js": "a6d39674255b539e1aae64a03d0f03ab",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/graphql/graphql.js": "efa23fec7d07905e9075ceb3c9ddfdcd",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/qsharp/qsharp.js": "8926abecebbbbbf7b3eb1ae22452d9b9",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/mysql/mysql.js": "1c1f1ab1259fcaf04887e0ed395c8d18",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/coffee/coffee.js": "148530a485b85773da9c561e57459b21",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/csp/csp.js": "8279b078b35079d98b40c04316413c5a",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/pgsql/pgsql.js": "2e4a218a17f8f3739c650ff2dc8faa56",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/m3/m3.js": "92b3a7d7b989e2f72d36f54fbf32b113",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/yaml/yaml.js": "25ba5b3d865e4a11fd2aba98bf094cb6",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/csharp/csharp.js": "0558c2c158f497eefa8ad28426b9cee0",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/julia/julia.js": "4657d5cafb62a00cf7c185b63217283b",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/bat/bat.js": "b6530838abb6021f98aeb6b2d56a0bdc",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/javascript/javascript.js": "9622f271c04fa8b21aa33f8927de7980",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/bicep/bicep.js": "d7deacff8ecd9cea8e11f9eb608b44e6",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/twig/twig.js": "a50d0269d349656a566e19f7ad4d26c7",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/msdax/msdax.js": "d22c9f53a027e63f3602d34c1a1bec3e",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/wgsl/wgsl.js": "bc0e35c2e839d211654829ff2b909f24",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/restructuredtext/restructuredtext.js": "d01b1081ef6f26190b2722e8eb65ed5c",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/objective-c/objective-c.js": "1c919e4c169e0f4f9d8c0c6f2d47f783",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/protobuf/protobuf.js": "28ce947eb9670bb265b0afb6b4796ba7",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/ecl/ecl.js": "796d2e6d6b1ca86d805b657f0b779bc4",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/ruby/ruby.js": "f308c8b852a00df844e63b42c11825dc",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/flow9/flow9.js": "2a44e464437775935a4ea1743c6fa49f",
"assets/assets/antipython_web/lib/monaco/vs/basic-languages/sql/sql.js": "a9900ef2268ea647cb4b93971852c540",
"assets/assets/antipython_web/lib/monaco/vs/language/css/cssMode.js": "754b1f05930135b578453b84626687e6",
"assets/assets/antipython_web/lib/monaco/vs/language/css/cssWorker.js": "27b8f67bdea97daa9056aef94e64733d",
"assets/assets/antipython_web/lib/monaco/vs/language/typescript/tsWorker.js": "93900f7dcf1a7e8119f0867798de5264",
"assets/assets/antipython_web/lib/monaco/vs/language/typescript/tsMode.js": "953f785ff713e606aa104edbed455bdf",
"assets/assets/antipython_web/lib/monaco/vs/language/html/htmlMode.js": "4e00205e7252f91cf4a202f2cf6f9e69",
"assets/assets/antipython_web/lib/monaco/vs/language/html/htmlWorker.js": "fa34447a100ceec658e8661a59753f3d",
"assets/assets/antipython_web/lib/monaco/vs/language/json/jsonWorker.js": "63b112d570811256d0df1874a6bf49ab",
"assets/assets/antipython_web/lib/monaco/vs/language/json/jsonMode.js": "0afab0ab184a029ac0d04dd049203d36",
"assets/assets/antipython_web/lib/monaco/vs/base/browser/ui/codicons/codicon/codicon.ttf": "0f436eae3ed9d22fcc68b461c308c210",
"assets/assets/antipython_web/lib/monaco/vs/base/common/worker/simpleWorker.nls.it.js": "7049b8aa46d7165c7b71b75376b264a0",
"assets/assets/antipython_web/lib/monaco/vs/base/common/worker/simpleWorker.nls.es.js": "824217d2b699783eee33ed1a97c765ee",
"assets/assets/antipython_web/lib/monaco/vs/base/common/worker/simpleWorker.nls.fr.js": "08ebbd6de065447466eff9f284b604c7",
"assets/assets/antipython_web/lib/monaco/vs/base/common/worker/simpleWorker.nls.de.js": "b7f50a746a86a8e36913445417f54c61",
"assets/assets/antipython_web/lib/monaco/vs/base/common/worker/simpleWorker.nls.js": "2db6ac29f4de756fcb8884c8a7db2048",
"assets/assets/antipython_web/lib/monaco/vs/base/common/worker/simpleWorker.nls.ja.js": "1e7d82166fbf8b7c9aadc54307a4da4c",
"assets/assets/antipython_web/lib/monaco/vs/base/common/worker/simpleWorker.nls.ru.js": "96ca5943fdaede7de2aa2b55295f8edf",
"assets/assets/antipython_web/lib/monaco/vs/base/common/worker/simpleWorker.nls.zh-cn.js": "892f0093d3c7213dcab9e2a812343d27",
"assets/assets/antipython_web/lib/monaco/vs/base/common/worker/simpleWorker.nls.zh-tw.js": "2117ba542a7861242d808bc87cd15857",
"assets/assets/antipython_web/lib/monaco/vs/base/common/worker/simpleWorker.nls.ko.js": "ec32b27254b6d07f7f79991a0254af7e",
"assets/assets/antipython_web/lib/monaco/vs/base/worker/workerMain.js": "1571cdad2ca63dc3b9373ad28d90c9d1",
"assets/assets/antipython_web/lib/monaco/vs/editor/editor.main.nls.ru.js": "2763e4268a8fe6126ded2e4aefc0f5f8",
"assets/assets/antipython_web/lib/monaco/vs/editor/editor.main.css": "e05b5327039a44ce500aced6e3cb0bf7",
"assets/assets/antipython_web/lib/monaco/vs/editor/editor.main.nls.ko.js": "583037ed83b50388ad782245374c4075",
"assets/assets/antipython_web/lib/monaco/vs/editor/editor.main.nls.zh-cn.js": "7c52fec73e5abc86a888c6c3deff9217",
"assets/assets/antipython_web/lib/monaco/vs/editor/editor.main.js": "1d3b9a739eb6dbf3fce08ddcdef0ef04",
"assets/assets/antipython_web/lib/monaco/vs/editor/editor.main.nls.ja.js": "3c63be37b98270c3659245cdce368cdd",
"assets/assets/antipython_web/lib/monaco/vs/editor/editor.main.nls.zh-tw.js": "b45c914a867e8a9feaba9b78fd6fd8ec",
"assets/assets/antipython_web/lib/monaco/vs/editor/editor.main.nls.de.js": "3884dead49638abfdd00b90614f92692",
"assets/assets/antipython_web/lib/monaco/vs/editor/editor.main.nls.it.js": "d6eca216f6261119b8f4efe0bfe83804",
"assets/assets/antipython_web/lib/monaco/vs/editor/editor.main.nls.es.js": "b5dde18e1dc8b56678715b04e52bdb39",
"assets/assets/antipython_web/lib/monaco/vs/editor/editor.main.nls.js": "153310e6e5f30b3fe7ddbdad54bc548f",
"assets/assets/antipython_web/lib/monaco/vs/editor/editor.main.nls.fr.js": "15b1326175c88b427e35d33d2eca6edb",
"assets/assets/antipython_web/lib/monaco/vs/loader.js": "e6d6a4dfec90175358cf44afabae29eb",
"assets/assets/antipython_web/lib/lucide/lucide.min.js": "d31b5730f0367db054d9c15a16665aa6",
"assets/assets/antipython_web/lib/fonts/FiraCode-Regular.woff2": "43982c707b76de9b1998d71663bf8211",
"assets/assets/antipython_web/lib/fonts/Inter-Regular.woff2": "68c477c4c76baab3a8d1ef6a55aa986f",
"assets/assets/antipython_web/lib/fonts/fonts.css": "9e794fa8d29af2137e42df619e423223",
"assets/assets/antipython_web/settings.html": "0877373f0ae7c85e5c8509997bbd03d6",
"assets/assets/antipython_web/download_assets.ps1": "9372f5c986bfc5d71273fc924f1c2c2b",
"assets/assets/antipython_web/assets/index-BbfzEzEM.js": "be7b0bd387eee74ea95bd2136eef13a9",
"assets/assets/antipython_web/assets/index-DDzBPqJa.css": "9743d2234c34801c45f5e140bd9b5bef",
"assets/assets/antipython_web/verify_axis.py": "790e424b2673fed8bef9caf9e6fbd74b",
"assets/assets/antipython_web/app.js": "c4779a00d851e8e4fdaedb6230644338",
"assets/assets/antipython_web/verify_tkinter.py": "c14466df24fedeaad406ade7d72f32b8",
"assets/assets/antipython_web/verify_imshow.py": "36cdde3a18becff6e568698fb6f12b50",
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
