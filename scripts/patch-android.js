// Parchea android/app/build.gradle para:
// 1) firmar siempre con la misma llave (bolsillo.keystore), y así poder actualizar sin desinstalar
// 2) subir el versionCode solo en cada compilación (Android no deja instalar una versión menor)
const fs = require('fs');
const f = 'android/app/build.gradle';
let s = fs.readFileSync(f, 'utf8');
if (s.includes('signingConfigs.bolsillo')) { console.log('build.gradle ya estaba parchado'); process.exit(0); }
if (!/versionCode\s+\d+/.test(s) || !/buildTypes\s*\{/.test(s)) {
  console.error('No pude parchear build.gradle: la plantilla de Capacitor cambió.');
  process.exit(1);
}
s = s.replace(/versionCode\s+\d+/, 'versionCode ((System.currentTimeMillis() / 60000) as int)');
const firma = [
  'signingConfigs {',
  '        bolsillo {',
  '            def ks = file(System.getenv("KEYSTORE_PATH") ?: "$rootDir/../bolsillo.keystore")',
  '            if (ks.exists()) {',
  '                storeFile ks',
  '                storePassword System.getenv("KEYSTORE_PASSWORD") ?: "bolsillo123"',
  '                keyAlias System.getenv("KEY_ALIAS") ?: "bolsillo"',
  '                keyPassword System.getenv("KEYSTORE_PASSWORD") ?: "bolsillo123"',
  '            }',
  '        }',
  '    }',
  '    buildTypes {',
  '        debug {',
  '            if (signingConfigs.bolsillo.storeFile != null) {',
  '                signingConfig signingConfigs.bolsillo',
  '            }',
  '        }'
].join('\n');
s = s.replace(/buildTypes\s*\{/, firma);
fs.writeFileSync(f, s);
console.log('build.gradle parchado');
