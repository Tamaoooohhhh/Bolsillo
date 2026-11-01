# Bolsillo

App móvil minimalista para llevar tus metas de ahorro, tus ingresos y tus gastos del día. Paleta blanco humo y negro onix, con modo claro y oscuro. Hecha con HTML, CSS y JavaScript sin frameworks, y empaquetada como APK de Android con Capacitor.

## Funciones

**Resumen**
- Disponible: toda tu plata libre, sin contar lo que está apartado en metas.
- Recibido y gastado del mes, y total en metas.
- Barras de gasto de los últimos 7 días. Toca una barra para ver los gastos de ese día y toca la misma otra vez para volver a la vista general.
- Gastos por categoría y progreso de tus metas.

**Plan**
- Tabla semanal con lo que vas a recibir, tu presupuesto de gasto, lo que queda cada día y el saldo proyectado.
- Edición día por día, o "Llenar la semana" para aplicar el mismo monto a los 7 días.
- Navegación entre semanas y selector para ir a cualquier fecha.
- Los días que ya pasaron muestran lo real.

**Gastos**
- Registro de gastos e ingresos con monto, concepto, categoría y fecha.
- Restante del día (lo recibido menos lo gastado) y presupuesto de hoy.
- Aviso al llegar al 80% del presupuesto del día y al pasarte.

**Metas**
- Crea metas con un monto objetivo y lo que ya llevas.
- Abona o retira plata. Por defecto se mueve desde y hacia tu disponible.
- Casilla "Sin mover mi disponible" para abonar o retirar sin afectar el disponible.
- Si eliminas una meta, lo que tenía apartado vuelve a tu disponible.

**Configuración (engranaje arriba a la derecha)**
- Cambio entre modo claro y oscuro.
- Ajuste manual del disponible para corregir las cuentas en cualquier momento.
- Copia de seguridad y restauración.

## Cómo se calculan las cuentas

```
disponible = ajuste + ingresos - gastos - (lo apartado en metas)
```

Abonar a una meta baja el disponible y retirar lo sube. Cuando usas "Sin mover mi disponible", ese dinero se registra aparte y no cambia el cálculo. El ajuste manual del configuración suma o resta la diferencia para que el disponible quede en el valor que escribas.

## Datos y privacidad

Todo se guarda en el dispositivo (`localStorage`, clave `bolsillo`). No hay servidor, cuentas ni conexión a internet. Si borras los datos de la app o la desinstalas, se pierde la información, por eso conviene hacer copias de seguridad.

### Copia de seguridad

Desde Configuración, "Guardar" genera un archivo `bolsillo-respaldo-AAAA-MM-DD.json` y "Restaurar" lo carga de vuelta mostrando antes la fecha y cuántas metas, gastos e ingresos trae. Restaurar reemplaza los datos actuales. Si el dispositivo no permite descargar el archivo, la app muestra el texto del respaldo para copiarlo y pegarlo después.

Formato del archivo:

```json
{
  "app": "bolsillo",
  "v": 1,
  "date": "2026-10-23T15:00:00.000Z",
  "data": {
    "goals": [], "exp": [], "inc": [],
    "adj": 0, "plan": {}
  }
}
```

## Estructura del proyecto

```
bolsillo-apk/
  www/index.html              La app completa (HTML, CSS y JS)
  assets/                     Ícono (icon-only, icon-foreground, icon-background) y pantalla de carga (splash, splash-dark)
  capacitor.config.json       Nombre y id de la app
  package.json                Dependencias y scripts
  scripts/patch-android.js    Firma fija y versionCode automático
  .github/workflows/
    build-apk.yml             Compilación automática del APK en GitHub
  keystore/debug.keystore     Llave de firma fija (necesaria para actualizar sin desinstalar)
  scripts/patch-signing.js    Aplica la firma fija y sube el versionCode
  .gitignore
```

La carpeta `android/` no se sube al repositorio: se genera con `npm run setup`.

## Compilar el APK

### Requisitos

- Node.js 20 o más nuevo
- JDK 17
- Android Studio con el SDK instalado

### Con Android Studio

1. `npm install`
2. `npm run setup` (crea `android/`, genera los íconos y sincroniza la app)
3. `npx cap open android`
4. Espera a que termine el Gradle Sync.
5. Build > Build Bundle(s) / APK(s) > Build APK(s)
6. El APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`

### Solo con la terminal

```bash
npm install
npm run setup
cd android
./gradlew assembleDebug      # en Windows: gradlew.bat assembleDebug
```

### Con GitHub Actions

Al hacer push a `main` se ejecuta el flujo "Build APK". Cuando termina, descarga el artifact `Bolsillo-apk` desde la pestaña Actions. También puede lanzarse a mano con "Run workflow".

### Después de cambiar la app

Edita `www/index.html`, corre `npm run sync` y vuelve a compilar.

## Actualizar la app sin desinstalar

Android solo deja actualizar una app si el APK nuevo está firmado con la misma llave que el instalado. Por eso el proyecto incluye `keystore/debug.keystore`, una llave fija que usan todas las compilaciones, tanto las de GitHub Actions como las locales. El script `scripts/patch-signing.js` la aplica en `android/app/build.gradle` y además sube el `versionCode` en cada compilación.

- `npm run setup` y `npm run sync` ya ejecutan el script solo. En GitHub Actions corre como un paso del flujo.
- No borres ni cambies `keystore/debug.keystore`. Si lo haces, la siguiente instalación vuelve a exigir desinstalar.
- Es una llave de depuración pensada para uso personal. No sirve para publicar en Play Store.
- La primera vez que cambias a esta llave hay que desinstalar la versión anterior una sola vez. Haz antes una copia de seguridad desde Configuración.

## Actualizar la app sin desinstalar

Android solo deja instalar una actualización encima si el APK nuevo está firmado con la misma llave que el instalado, y si su versionCode es mayor. Los APK de depuración se firman con una llave que se crea sola en cada computador (y en cada ejecución de GitHub), por eso aparece el conflicto de paquete. Este proyecto lo resuelve con una llave propia, `bolsillo.keystore`, y con un versionCode que sube solo en cada compilación (`scripts/patch-android.js`, que corre dentro de `npm run setup` y del workflow).

Se hace una sola vez:

1. Crea la llave: `npm run llave`. Genera `bolsillo.keystore` en la raíz del proyecto (alias `bolsillo`, contraseña `bolsillo123`). Si `keytool` no se reconoce, usa el de Android Studio: `C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe` en Windows. Guarda una copia en un lugar seguro: si la pierdes, tendrás que desinstalar otra vez. Está en `.gitignore`, no se sube al repositorio.
2. En tu computador: borra la carpeta `android`, corre `npm run setup` y compila como siempre.
3. En GitHub: convierte la llave a base64 y guárdala como secret.
   - Windows (PowerShell): `[Convert]::ToBase64String([IO.File]::ReadAllBytes("bolsillo.keystore")) | Set-Clipboard`
   - Mac: `base64 -i bolsillo.keystore | pbcopy`
   - Linux: `base64 -w0 bolsillo.keystore`
   - En el repositorio: Settings > Secrets and variables > Actions > New repository secret, con el nombre `KEYSTORE_BASE64` y ese texto como valor.
4. La primera vez con la llave nueva hay que desinstalar la app vieja (haz antes una copia desde Configuración) e instalar el APK nuevo. Desde ahí, cada APK se instala encima y conserva tus datos.

Usa siempre esta misma llave, tanto en GitHub como en tu computador. Si mezclas APK firmados con otra llave, vuelve el conflicto.

## Personalizar

- **Ícono y pantalla de carga:** los archivos están en `assets/`. `icon-foreground.png` (dibujo con fondo transparente) e `icon-background.png` (fondo liso) forman el ícono adaptativo que usa Android moderno, y `icon-only.png` es el ícono clásico. Todos son PNG de 1024x1024, y los `splash` de 2732x2732. Reemplázalos y corre `npx capacitor-assets generate --android`. Si falta `icon-foreground` o `icon-background`, Android puede mostrar el ícono por defecto de Capacitor.
- **Nombre e id:** edita `appName` y `appId` en `capacitor.config.json` antes de correr `npm run setup`.
- **Categorías de gasto:** busca la constante `CATS` en `www/index.html`.

## Notas

- El APK que sale de `assembleDebug` está firmado con la llave de depuración. Sirve para instalar en tus propios dispositivos. Para publicar en Play Store hay que generar un build de release firmado con tu propia llave.
- Al correr `npm install` pueden aparecer avisos de vulnerabilidades en dependencias de desarrollo como `@capacitor/assets`. No viajan dentro del APK. No uses `npm audit fix --force`, porque puede romper la compilación.
- Si el Gradle Sync marca un error de Java en Android Studio, en Settings > Build Tools > Gradle elige JDK 17.
