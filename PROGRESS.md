# د Responsive DevTool د پرمختګ راپور

## اوسنی حالت

- Phase 4a، 4b او 5a د پخوانیو یادښتونو له مخې بشپړ او تایید شوي دي.
- 3D preview وروسته د کارن په غوښتنه له UI او کوډ څخه په بشپړ ډول لرې شو؛ اوس د 3D تڼۍ، route، کامپوننټونه، Three.js dependency او GLB mapping نشته.
- د Phase 6 اړوند build، اسناد، credits او ZIP بسته‌بندي ترسره شوي. د Firefox runtime ازموینه د روان Firefox profile له امله په دې چاپېریال کې ونه شوه؛ نو د Firefox د اجرا ازموینه نه ده ادعا شوې.

## وروستی بدلون — د 3D برخې لرې کول

- د TopBar د 3D تڼۍ او `/3d-preview` route لرې شول.
- ټول 3D studio او GLB-rendering components حذف شول، او له `LiveFrame` څخه د 3D لپاره ځانګړی `flipContent` اختیار لرې شو.
- Three.js dependency او د پخواني 3D د ZIP-packaging استثناوې حذف شول.
- README، credits او STATE.md د موجوده نسخې سره سم نوي شول.

## په دې دوام کې ترسره شوي بدلونونه

### Phase 4a — Multi View

- د `DraggableFrame` مرکزول اوس د zoom، device اندازه/چوکاټ، mode، د Multi View د کارتونو شمېر/ترتیب، او د workspace د اندازې له بدلون سره بیا محاسبه کېږي.
- د resize پر مهال د workspace او device frame دواړه کتل کېږي، څو rotate/اندازه بدلول زاړه موقعیتونه پرېنږدي.

بدل شوي فایلونه: `src/app/components/devtool/DraggableFrame.jsx`، `src/app/components/devtool/PreviewWorkspace.jsx`.

### Phase 4b — Dialogs، light theme، او custom device

- د dialog عرض په کوچنیو سکرینونو کې خوندي حاشیه لري، backdrop لږ دروند دی، او د بندولو تڼۍ نوم/ډول روښانه شوی.
- د toast د تش wrapper او د toast د متن ساحه نور د پاڼې پر تڼیو کلیک نه بندوي؛ د toast د بندولو تڼۍ لا هم کار کوي.
- د custom device جوړولو/سمولو فورم اوس د نوم، مثبتو بشپړو ابعادو، او مثبت DPR تایید کوي او د تېروتنې پیغام له اړوند input سره نښلوي.
- د custom device orientation د viewport په ابعادو او حالت کې پلي کېږي؛ د Device Frame انتخاب shared setting ته لیکل کېږي.

بدل شوي فایلونه: `src/app/components/ui/dialog.jsx`، `src/app/components/ui/toast.jsx`، `src/app/components/ui/toaster.jsx`، `src/app/components/devtool/CustomDeviceDialog.jsx`، `src/app/lib/DevToolContext.jsx`.

### Phase 5a — د GLB ماډل ښکاره کول

- د Three.js `GLTFLoader` له لارې iPhone 18 Pro/Pro Max او foldable GLB ماډلونه load او render کېږي.
- ماډل د viewport د portrait/landscape نسبت له مخې fit او center کېږي؛ که WebGL یا GLB ناکام شي، موجود CSS device preview د ښکاره خبرتیا سره کار کوي.

بدل شوي فایلونه: `src/app/components/preview3d/GLBDevice.jsx`، `src/app/components/preview3d/deviceModels.js`، `src/app/components/preview3d/Device3D.jsx`.

### A1 — د iPhone 18 Pro ژوندی سکرین

- د iPhone 18 Pro پر GLB ماډل د CSS3D overlay له لارې د فعاله URL پاڼه ښکاره کېږي.
- په landscape حالت کې د وېب‌پاڼې محتوا د موبایل د سکرین له سمت سره سمه ګرځول کېږي؛ portrait حالت بې‌بدلونه پاتې کېږي.
- د محلي same-origin fixture او `https://httpbin.org/html` له لارې portrait او landscape دواړه په Chrome/SwiftShader کې وکتل شول. د هر حالت iframe ابعاد له device viewport سره برابر وو او متن په سکرین کې ښکاره و.
- لنډمهالی fixture د ازموینې وروسته لرې شو.

بدل شوي فایلونه: `src/app/components/preview3d/GLBDevice.jsx`، `src/app/components/devtool/LiveFrame.jsx`.

### د 3D سټوډیو محدود کنټرولونه

- د لاندې انتخاب یوازې iPhone 18 Pro او iPhone 18 Pro Max لري؛ Pro Max د Silver GLB کاروي.
- د رنګ نقطې، recording، resize او zoom کنټرولونه د کارن د غوښتنې له مخې نه ښودل کېږي.
- د CSS fallback پر مخ د ویب‌پاڼې واقعي iframe ښکاري؛ د دریم‌ګړي سایټ په سکرین کې scroll تایید شو.

بدل شوي فایلونه: `src/app/components/preview3d/deviceModels.js`، `src/app/components/preview3d/StudioToolbar.jsx`، `src/app/components/preview3d/Device3D.jsx`، `src/app/pages/Preview3D.jsx`، `src/app/components/preview3d/DeviceBody.jsx`.

## تایید

- `npm --prefix rdt-ext run build` بریالی شو؛ د Chrome او Firefox دواړه buildونه تولید شول.
- A1: `https://httpbin.org/html` په GLB د iPhone 18 Pro پر سکرین په portrait او landscape کې ښکاره او سم‌جهت تایید شو؛ iframe اندازه په دواړو حالتونو د device viewport سره برابره وه.
- وروستی build: د Chrome او Firefox دواړه buildونه بریالي شول.
- د جوړ شوي Chrome viewer په browser کې `https://httpbin.org/html` د 3D CSS fallback د iPhone پر سکرین ښکاره شو؛ په iframe کې scrollTop تر 313px ورسېد. د همدې browser چاپېریال WebGL غیرفعال دی، نو GLB ماډل د دې live check پر مهال ونه render شو.
- د سکرین څخه بهر drag د fallback وسیله په رښتیا وڅرخوله؛ د X/Y transform بدل شو.
- د 3D model selector کې یوازې iPhone 18 Pro او iPhone 18 Pro Max ښکاره شول؛ د Record او finish انتخابونه نه وو.
- د Chrome build په browser کې: درې Multi View وسیلې د zoom او workspace resize وروسته بیا موقعیت نیسي.
- په browser کې شپږ dialogونه پرانیستل او وتړل شول؛ Settings په 390px viewport کې دننه پاتې شو او light theme پلي شو.
- ناسم ابعاد د فورم خطا ښکاره کوي؛ د landscape custom device اندازه 844×390 شوه او د Device Frame سویچ shared حالت بدل کړ.
- Toast ښکاره وي هم، Settings تڼۍ بیا کلیک کېدای شي.
- د GLB د ملاتړ mapping او د درې کارېدونکو GLB فایلونو نسخه/سرلیکونه تایید شول.
- د local software-WebGL Chrome له لارې د iPhone 18 Pro GLB واقعی render تایید شو: ماډل ښکاره او مرکز و، fallback ونه چلېد، او console errors نه وو.
- د integrated browser WebGL بند و؛ د fallback حالت هلته جلا تایید شو.
- د پخواني E2E فایل `t4-test.mjs` د خپل اصلي harness د نشتوالي له امله په دې چاپېریال کې ونه چلېد؛ د `/home/claude/e2e` dependencies او fixture نشته.

## Phase 6 — جوړول، اسناد، او د خپرونې ZIP

- د `npm --prefix rdt-ext run package` له لارې د Chrome او Firefox buildونه جوړ او بیا د `releases/` په فولډر کې versioned ZIPونه تولید شول.
- دواړه ZIPونه د `unzip -t` له لارې تایید شول؛ Manifest V3، اړین viewer/background/content فایلونه، icons، README او credits پکې شته.
- د Sketchfab Standard د ماډلونو د جلا فایل په توګه د وېش محدودیت له امله GLB فایلونه له نصب ZIPونو ایستل شوي. د CSS fallback موجود دی؛ د 3D کارونه د غوښتنې له مخې ځنډول شوي.
- د model او library اړوند انتسابونه په `CREDITS.md` کې لیکل شوي. د `public/mockups/` د انځورونو د جواز/سرچینې معلومات په سرچینه کې نه وو؛ د خپرونې مخکې باید د حقونو تایید وشي.
- Chrome-based browser کې `https://httpbin.org/html` د device preview دننه خلاص او محتوا، iframe او Connected حالت تایید شول. Kali Linux د `X-Frame-Options: sameorigin` له کبله iframe ته اجازه نه ورکوي.
- د Firefox build او manifest تایید شول، خو د روان Firefox پروفایل له امله جلا headless/runtime ازموینه ونه شوه. د Firefox د runtime بشپړ تایید نه ادعا کېږي.

## ځنډول شوي کارونه

- A3–A5: د foldable، monitor/simple-screen، او بې‌ماډله وسیلو ملاتړ؛ د اوسني محدود 3D ماډل scope له امله ځنډول شوي.
- A6–A7: د ماډل کنټرولونه، تعامل، recording او د 3D studio dark mode.
- B1–B5: د GLB د وېش د جواز بیاکتنه، bundle size، اسناد/credits، د لاسي ازموینې لېست، وروستي build/ZIP.
- C1: Hover او Keyboard interaction.

---

## مرورگر داخل قاب دستگاه‌ها (P1 تا P5)

صفحه‌ی زنده حالا داخل یک نوار مرورگر واقعی‌نما نمایش داده می‌شه، مثل نسخه‌ی Chrome و Safari واقعی. صفحه فقط فضای زیر نوارها رو می‌گیره، پس ارتفاع دیدنی آن کمتر از ارتفاع دستگاهه، درست مثل مرورگر واقعی.

- **P1 — زیرساخت + Chrome اندروید:** `src/app/lib/browserUi.js` (تعیین نوع مرورگر و ارتفاع نوارها برای هر دستگاه)، `src/app/components/devtool/browser/AndroidChrome.jsx`، و `LiveFrame` که صفحه را بین نوارها قرار می‌دهد.
- **P2 — Safari آیفون:** نوار وضعیت iOS (با اندازه‌ی متناسب با جزیره‌ی دینامیک، ناچ یا دکمه‌ی Home) و نوار پایین Safari. `IOSSafari.jsx`.
- **P3 — دسکتاپ:** ویندوز (Chrome + نوار وظیفه‌ی Windows 11) برای دستگاه‌های معمولی، و macOS (نوار منو + Chrome + Dock) برای MacBook. روی صفحه‌های بزرگ (2K، 4K، Ultrawide) مقیاس نوارها با بُعد کوچک‌تر صفحه تنظیم می‌شه. `WindowsChrome.jsx`، `MacChrome.jsx`.
- **P4 — تبلت‌ها و حالت عرضی:** iPad (Safari)، تبلت‌های اندروید و تاشوهای بازشده (Chrome تبلت)، و آیفون/اندروید در حالت عرضی (نوار وضعیت iOS مخفی و یک ردیف فشرده‌ی Safari). چرخش دستگاه مرورگر مناسب جهت جدید را انتخاب می‌کند.
- **P5 — داده‌ی زنده:** عنوان و فاویکون واقعی صفحه روی تب، آدرس و قفل مخصوص هر دستگاه (در Multi هر کدام صفحه‌ی خودش)، و دکمه‌های برگشت، جلو و reload که واقعاً صفحه‌ی همان دستگاه را کنترل می‌کنند. اگر URL لود نشده باشد، نوارها فقط تزئینی هستند.

### محدودیت‌های شناخته‌شده
- نوار مرورگر فقط نمای بصری است: آدرس را نمی‌شود تایپ کرد. برای تغییر صفحه از فیلد آدرس بالای برنامه استفاده کنید.
- Firefox به API دیباگر دسترسی ندارد، پس throttling، لمس واقعی و full-page همچنان فقط در Chrome هستند (همان محدودیت قبلی).
- عنوان و فاویکون در اکستنشن واقعی از خود صفحه خوانده می‌شوند؛ در حالت توسعه‌ی مستقل (بدون اکستنشن) آدرس جایگزین عنوان می‌شود.

### تست‌ها
- بیلد Chrome و Firefox موفق؛ لینت رسمی `web-ext` برای Firefox: صفر خطا (فقط دو هشدار `innerHTML` از داخل React).
- ارتفاع صفحه برای ۱۲ دستگاه در دو جهت و ۱۰ دستگاه دسکتاپ دقیق مطابق انتظار.
- تست داده‌ی زنده (عنوان، فاویکون، دکمه‌های Reload و Back واقعی، آدرس هر دستگاه): ۱۴ از ۱۴.
- تست ۲D رگرسیون: ۲۷ از ۲۷، بدون خطای کنسول.
