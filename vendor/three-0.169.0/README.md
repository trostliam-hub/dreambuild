# three.js 0.169.0 (lokal)

Fuer den 3D-Betrachter des Beispielrads (BEVEL-002). Die App laedt diese Dateien
erst, wenn jemand „In 3D ansehen“ tippt -- nie beim Start, nie von fremden
Servern.

Quelle: npm-Paket `three@0.169.0` (MIT, siehe LICENSE). Unveraendert bis auf die
Import-Pfade: `from 'three'` und `../utils/BufferGeometryUtils.js` zeigen auf die
Dateien in diesem Ordner, damit kein Import-Map noetig ist.

| Datei | aus dem Paket |
|---|---|
| three.module.min.js | build/three.module.min.js |
| GLTFLoader.js | examples/jsm/loaders/GLTFLoader.js |
| DRACOLoader.js | examples/jsm/loaders/DRACOLoader.js |
| OrbitControls.js | examples/jsm/controls/OrbitControls.js |
| BufferGeometryUtils.js | examples/jsm/utils/BufferGeometryUtils.js |
| RoomEnvironment.js | examples/jsm/environments/RoomEnvironment.js |
| draco/draco_decoder.wasm, draco/draco_wasm_wrapper.js | examples/jsm/libs/draco/gltf/ |
