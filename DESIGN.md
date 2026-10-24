---
version: alpha
name: "Ellis Services Group Canberra Roofing"
description: "A bilingual enquiry-led website for Canberra roof repairs, with a local Chinese content editor and calm safety-first guidance."
colors:
  roof-charcoal: "#182328"
  steel: "#33454D"
  warm-white: "#F5F4EF"
  safety-orange: "#E85D2A"
  action-surface: "#B8441C"
  eucalyptus: "#5E7568"
  cloud: "#DDE3E2"
  on-dark: "#FFFFFF"
typography:
  sans:
    fontFamily: "Arial, Helvetica, Segoe UI, system-ui, sans-serif"
  display:
    fontFamily: "Arial Narrow, Arial, Helvetica, Segoe UI, system-ui, sans-serif"
rounded:
  control: "0.25rem"
  card: "0.75rem"
  media: "0.75rem"
spacing:
  section-gap: "clamp(2.5rem, 4vw, 4rem)"
  page-max: "1440px"
components:
  button: {}
  service-card: {}
  enquiry-form: {}
  navigation: {}
---

# Ellis Services Group Canberra Roofing Design System

## Overview

### Creative North Star

A well-organised roof-work site: dark workwear, clear safety-orange markings, legible job notes and the geometric line of a residential roof. The site should feel calm, direct and practical—not like a luxury real-estate brochure or a generic template.

### Product context and register

- **Audience and primary job:** Canberra property owners who need to describe a visible roof concern safely, identify the closest repair pathway and make an enquiry.
- **Target market(s) and evidence:** Canberra, ACT homeowners and local repair enquiries, reflected in site headings, service pages, contact details and service-area content.
- **Locale(s) and language policy:** Owner approved English and Simplified Chinese on 16 October 2026. Existing English URLs remain; Chinese uses `/zh/`. Translate visible copy, metadata, alt text, forms and feedback while preserving form values and contact destinations. Chinese font fallback uses Microsoft YaHei/PingFang SC with 1.35 heading line height. The local editor uses Chinese labels with read-only English comparison.
- **Usage scene:** A mobile-first search journey, often after a visible leak, damaged tile or weather event. Users need reassurance and scannable next steps before detail.
- **Register:** A service-business marketing site with safety-first operational content. Clear and useful language takes priority over sales pressure.
- **Memorable signature:** Deep charcoal image overlays and a sharp safety-orange keyline, finished with the clipped roofline silhouette at the bottom of the hero.
- **Restraint:** Forms, safety guidance, addresses, service comparisons and legal/insurance facts remain plain, high-contrast and familiar.
- **Anti-references:** Avoid glossy property-development imagery, pill-heavy SaaS dashboards, excessive glass effects, oversized empty colour fields and generic stock-photo card grids. Rounded content cards remain part of this site's accepted design.
- **Token ownership/runtime mapping:** This file mirrors the existing canonical CSS custom properties in `src/styles.css`; it does not generate runtime tokens. The `:root` variables in that file are the source of truth.

## Colors

`roof-charcoal` is the primary dark surface and text anchor. `warm-white` is the main page surface, while `cloud` and `eucalyptus` create restrained background, divider and contextual layers. `safety-orange` supplies decorative keylines, selected emphasis and focus visibility. `action-surface` is the deeper orange for ordinary solid actions with white text. Maintain the existing visible focus outline and never rely on colour alone for safety or validation states.

## Typography

Use the `display` stack for H1–H3, brand marks and short service labels; it is condensed, bold and built for large English keyword-led headings. Use `sans` for explanatory copy, forms and navigation. Headings may use sentence case or controlled uppercase labels; body copy should use direct English sentences. Keep line lengths narrow enough for mobile scanning and do not insert multilingual copy.

## Layout

Content is contained to `1440px` with a compact responsive section rhythm of `clamp(2.5rem, 4vw, 4rem)`. On 13 October 2026 the owner requested removal of large unused right-hand fields and excessive vertical gaps. Home guidance can pair related topics in two equal desktop columns, collapsing at `760px`. Service detail pages follow the later owner-approved five-theme structure below; that decision supersedes the earlier unrelated two-column advice grid. Keep service paragraphs within a maximum reading measure of `75ch` rather than stretching them to fill a shell. News detail pages follow the later approved desktop reading layout below; privacy retains its `800px` body and following enquiry panel. Non-hero page titles and subsection headings are deliberately smaller than the home hero; long headings must wrap without becoming oversized towers. Standalone home guidance keeps the same bounded container and side gutters as its neighbouring sections. Existing About, Solutions and Areas media retain their editorial split and collapse on mobile. Do not add empty height, invented images or repeated copy to balance a layout; use real related content and compact spacing.

### Topic-led heroes and editorial reading

The owner's 14 October editorial refresh pairs service, case, News index and article header copy with a meaningful existing roof image. `.pairedHero` is the shared layout owner in `src/styles.css`: a 1.08:1 desktop split with a 32–64px gap, bounded 300–400px photograph, 32–56px heading and quiet caption. At 1024px it stacks, with 320px media; at 760px media is 240px and headings are 30.4–44px. Images use existing responsive derivatives and eager loading only in the first screen. Service and case hero captions explain the visible context without turning illustrative service assets into documented project evidence. The distinctive element is the direct pairing of roof material with the relevant repair question; existing charcoal, orange and rounded framing supplies identity. Runtime CSS tokens remain canonical and unchanged.

News cards use equal 240px covers and three columns above 1200px, two above 760px and one on phones (220px covers). Each card leads to one article; the index hero and twelve covers use distinct topic-relevant site images. The owner's later 14 October desktop-reading approval supersedes the centred 800px article-body rule: above 1024px, `.articleLayout` is a centred 1240px grid with a 240px chapter directory, 32–48px gap and flexible wide reading column. The directory sticks 8rem below the viewport top while scrolling, with a viewport-bounded operable overflow for zoom or short screens. It contains only native chapter links, not service promotion. Body paragraphs use 18px type, 1.8 line height and at most 80ch; section headings use the full reading-column width rather than the old narrow heading cap. Do not use newspaper-style parallel prose columns. Continuous prose, four topic sections, sources and all images stay intact. The three documentary case frames share a desktop row; related articles use three columns when exactly three items are present, otherwise two columns (four form two complete rows) at the end of the body. At 1024px and below the directory becomes a natural-flow introductory block above the body in the existing 800px maximum lane; below 760px evidence and related articles stack, with 16.8px body copy. Scoped `.articleSection` scroll margins keep native contents anchors below the header (8rem desktop, 6rem phone). No paragraph-by-paragraph raised cards or service sidebar. Runtime colour, type-family and radius tokens remain canonical and unchanged.

At 1025–1200px the shared site header wraps, so the article directory and native chapter targets use a 10rem top offset; the directory's maximum height reserves 12rem. This is a scoped narrow-desktop geometry exception, not a global header or token change.

The reusable `TileCasePhotos` module shows all three original documentary frames and captions in relevant tile, inspection and leak contexts. On renovation it is explicitly a related local-repair comparison with the weathered surrounding roof retained, never evidence of renovation. Originals remain available through links. Do not bind this evidence to metal, chimney or gutter work, assign a district without evidence, or infer a leak cause from the pictures.

Non-home headings and metadata lead with the material, problem or reader task. City identity remains in the brand, homepage, address and coverage facts; avoid mandatory city suffixes or mechanical “near me” substitutes. District pages stay compact directories with their actual place names.

### Service detail theme contract

Privacy also uses the centered 800px reading lane with its enquiry panel following the policy body, preserving all policy content and contact links.

About FAQ headings precede the questions in a 900px region. The owner's 19 October 2026 contact-page refinement supersedes its single-lane layout: use a 1280px maximum shell, compact heading and instructions, then a 0.9:1.1 desktop split with existing consultation photography/contact details/hours on the left and the unchanged shared ContactForm on the right. Keep the photo bounded to 300–380px; form padding is 20–32px, ordinary fields at least 48px high, paired desktop fields and a 144px message area. The owner's follow-up consolidates duplicated preparation and checklist prose into three compact enquiry notes and contextual guide links in the left column; do not retain a separate long preparation section below the workspace. Preserve safety, fee/scope clarification and existing business details. At 900px and below stack the photograph, form and contact details/notes; at 760px use a 220px photograph, single-column fields and a 160px message area. No fixed-height form, blank balancing panels or new imagery. Scope these layout rules to `.contactWorkspace`, leaving area-page forms unchanged. News retains its approved chapter-directory/wide-body layout above.

The 15 October sitewide density review replaces Home's repeated full service catalogue with twelve compact title-and-symptom links, in three desktop columns, two below 1100px and one below 760px. Services retains every original summary, assessment focus and next step in continuous full-width comparison rows: a title/summary/action group beside two related facts, stacking naturally on phones. The owner's 19 October request consolidates the duplicate Solutions catalogue into Services; remove its navigation entry and static document, and redirect English and Chinese historical URLs directly to the matching Services hub. Text has no fixed heights. The comparison heading uses a normal 38ch measure. Area directory entries keep their information link alongside a direct enquiry link using the exact existing suburb-and-district option; local search has a clear control and a useful no-results state. No business facts or canonical tokens change.

The owner's 19 October service-detail simplification supersedes the former paired advice and booking columns: use a centred 1120px shell, with keyword-led chapter headings followed by continuous full-width paragraphs. Remove decorative 01–04 labels, redundant lead headings, and the generic FAQ eyebrow/subtitle. Keep the five chapter IDs and service-specific H2 headings, all substantive explanations, resources, answers and images. Related services use an H3 containing the service-name link followed by its explanation; related articles use their actual article title, not another generic heading. Longer advice and guide groups align with this same reading region without nested narrow-column caps. Booking information follows in document flow, with no empty balancing column. Existing gallery rows and native FAQ disclosures remain unchanged. This is a marketing/content register, not an admin redesign; existing runtime colours, typography, radii, focus, scrollbar and motion rules stay canonical.

All twelve service detail pages use the same five bounded sections, in order: **What we repair → How we handle it → Real projects & photos → Costs & booking → FAQ**. These describe the chapter roles, not identical visible headings. Following the owner's keyword-map approval, `SERVICE_THEME_HEADINGS` in `src/service-theme-layout.tsx` supplies five service-specific H2 headings per page: use distilled intent terms where the map provides them, and established core service terms otherwise. Keep headings descriptive of the actual section, not strings of keyword variants. These are the only five H2 headings in the service detail content; every repair, material, inspection, booking and gallery subtopic uses H3. Shared content takes an explicit `headingLevel={3}` only on these pages and defaults to H2 elsewhere. Keep the canonical keyword-led H1, original explanations, photographs, gallery anchors, linked resources and FAQ answers.

The chapter navigation retains compact, consistent role labels and stable fragment IDs. Its links use existing `--color-roof-charcoal` backgrounds and `--color-on-dark` text; hover/active use `--color-steel` with a `--color-safety-orange` border. Retain the global keyboard focus outline, 44px minimum height and control radius. Primary booking actions remain orange.

Every service theme retains one white surface, a thin cloud border, the shared 12px radius and `clamp(1.25rem, 3vw, 2rem)` padding. H2 is 30.4–36px, H3 is 19.2–22px. Related guides and services remain contextual native links. The five compact in-page navigation links preserve native anchor/focus behaviour. The 19 October continuous reading layout above replaces the former 1440px, two-column advice treatment.

Following the owner's later 14 October crop approval, service galleries use equal photographic cards: three images form one three-column row, two/four use paired columns, and five use two main cards above three supporting cards. Images use cover sizing at 280–360px desktop and 260px mobile, with no hover scaling. The owner's 17 October request removed original-photo links; do not restore them. Project notes precede media rather than occupying a column beside a tall photograph. The emergency collage uses five authentic photographic extracts without decorative stickers. `scripts/crop-emergency-project.mjs` records the inspected crop rectangles. Preserve source image order, captions and identity; do not synthesize project evidence. Costs and booking follow continuous document flow; no fixed heights or empty sidebars. Below `760px`, all gallery counts stack naturally. Native FAQ disclosures remain single-column, finish the page and retain all answers used in structured data. These service-specific selectors in `src/styles.css` implement the layout; existing colour, radius, type and spacing tokens remain canonical.

## Elevation & Depth

### Local service and enquiry pages

Suburb pages lead with two explicit paths: choose a service or request a local assessment. Featured services form three compact desktop columns (one below 760px), each with a concise symptom/use-case explanation. List remaining services separately without repeating the featured links. Preserve every service destination, location metadata and the preselected suburb; do not fabricate local case studies.

District and suburb enquiry sections use the shared `.suburbContact` single-column white panel, cloud border, orange top rule and card radius, centred at 900px maximum. The heading and short instructions sit above the form, not in an empty left column. Form fields retain their established desktop pairs and mobile stack; the form and intro share a 760px reading width. Local guide and FAQ groups use bounded readable panels rather than unrelated two-column text. CSS tokens in `src/styles.css` remain canonical.

Hierarchy comes from charcoal-versus-warm-white contrast, thin cloud borders, orange edge markers and the existing `--shadow-lift` / `--shadow-hover` shadows. Use modest elevation on interactive service cards and image frames. Do not use shadows on long-form reading content, safety notices or dense form controls where a crisp border is clearer.

## Shapes

Use the control, card and media radii exactly: `0.25rem`, `0.75rem` and `0.75rem`. On 13 October 2026 the owner requested restoration of rounded cards across the site; this supersedes the earlier near-square rule. Content cards, inset information panels, FAQ panels and image frames consume the shared 12px radius; buttons and fields retain their restrained 4px radius. Full-bleed heroes, navigation and table cells are not cards and remain square. Orange rules, border-left signals and roofline geometry retain the trade identity; avoid pill-heavy UI. Decorative card keylines follow the corner shape without clipping keyboard focus.

Runtime mapping: `rounded.control` mirrors `--radius-control`; `rounded.card` mirrors `--radius-card`, consumed by service/news/area cards and inset guidance/contact/FAQ panels; `rounded.media` mirrors `--radius-media`, consumed by gallery and editorial image frames. The CSS variables remain canonical; update this mirror and regression tests in the same change when accepted values change.

## Components

### Foundational visual states

Buttons, links, service cards and form fields must expose a visible `:focus-visible` state. Hover may lift a card or deepen a button to charcoal, but keyboard focus must not depend on hover. Preserve semantic labels, error text and native input support. Reduced-motion preferences must suppress nonessential transforms and transitions.

### Buttons and actions

The orange `.button` is the primary action and should state the next real-world step, such as “Send an enquiry” or “Explore Metal & Colorbond Roof Repairs”. Underlined `.textAction` links are secondary. Keep icons to the trailing edge and retain text labels.

The canonical runtime owner is `src/styles.css`: `--color-action-surface` (#B8441C) and `--color-action-on-surface` (the white `--color-on-dark`) supply `.button` and `.contactTop`; hover uses `--color-action-hover` (charcoal) and pressed uses `--color-action-active` (steel). These enabled states maintain at least 4.5:1 text contrast without changing dimensions or control radius. Keyboard focus retains the 3px orange outline and 3px offset. Decorative `--color-action` continues to alias the original safety orange.

### Navigation and data display

The 20 October customer-journey refinement uses `src/navigation-map.ts` for one stable bilingual breadcrumb hierarchy. Core services sit directly under Home; single-service guides and the documented tile case sit under their real service, while broad quote/scope comparisons remain under the journal. District/suburb hierarchy uses actual coverage records. Ancestors are absolute canonical links and the current item is plain text; separators are aria-hidden. Labels wrap naturally, using existing type, colours and focus tokens. Service resources use continuous lists inside the existing theme, not new empty card grids. A compact `.contentNextStep` strip between article/case introduction and detail pairs the relevant service with the existing assessment form; it stacks below 760px. Service heroes retain existing images and gain the same scoped assessment link plus the unchanged telephone. No fixed-height balancing panels, palette changes, new imagery, or customer-facing SEO labels.

The `/faq` hub uses one categorised question browser. The owner-approved professional refinement replaces the earlier heavy charcoal directory and nested question cards. Use a compact 32–44px page title and a thin intro divider inside a 1240px shell. On desktop a 240px white, cloud-bordered directory stays sticky below the site header; only the current category has a quiet surface highlight and orange marker. The right column uses rounded white category panels, with plain question rows separated by thin rules rather than individual raised cards. Questions use 16px body type at weight 600, category headings use 22.4–28px display type, and answers use a restrained steel tone with 1.75 line height. Decorative plus/minus indicators sit at the trailing edge; native disclosure semantics and visible focus remain intact. Category links are native anchors and the current section receives `aria-current="location"` as the document scrolls. Mobile uses a compact, horizontally scrollable sticky category strip above the questions, automatically keeping the active category visible. Support guides and operating hours form a separate, compact two-part panel. Preserve all question answers, contextual links and existing SEO data; changes here must not alter service-page or suburb-page FAQs.

The sticky charcoal navigation uses a thin orange base rule and a service popover for the full set of repair pathways. Service cards use a small sequence label, concise title, practical description and a clear route link. On small screens, the navigation must collapse without hiding telephone or contact access.

`LayoutV2` owns the responsive navigation behavior at the existing 1180px breakpoint. Menu opens the drawer and focuses Close; Tab and Shift+Tab loop through its currently visible links and buttons, including an expanded Services submenu. The brand, Menu trigger, header actions, main and footer become inert while open, the backdrop stays outside tab order, and document scrolling pauses. Escape first closes Services and returns to its trigger, then closes the drawer and returns to Menu; Close and backdrop also restore Menu. Crossing the breakpoint clears both open states, releases isolation and scroll locking, and restores focus to the visible navigation trigger. The desktop Services popover retains its established entry point.

### Forms and overlays

Use conventional labelled controls, inline validation and explicit consent wording. File upload remains accessible through a visible button paired with the native input. Do not introduce decorative overlays that obscure field labels or safety text.

Paired enquiry fields use natural inline label text (including “optional”) above block controls. Labels and errors may wrap freely; the neighbouring control must not stretch to fill an extra label or error row. The shared `.formGrid` owns this behavior on Contact, district and suburb forms.

The enquiry area and service fields intentionally use native selects: the operating system owns the opened popup, including its geometry and keyboard interaction. `premium-ui.json` records this ownership; the site owns the labelled trigger, options, validation and surrounding layout. An authored listbox is not required by this marketing-site design.

### Iconography

Use Lucide icons with their default outlined stroke style. Icons support—not replace—English labels. Maintain consistent sizing with the existing 16–18px action icons.

### Motion

Motion is brief and functional: service/image hover feedback and navigation state changes. Existing hover depth uses approximately 0.45 seconds; no autoplaying, parallax or attention-seeking motion. Honour `prefers-reduced-motion`.

### Content and data visualization

Use plain English, safety-first wording, specific service names and verified business facts. Do not imply an inspection result, repair scope, product affiliation or guaranteed outcome before assessment. If numerical data is shown, pair it with plain-language context and an accessible text alternative.

## Do's and Don'ts

- **Do:** Lead each page with a precise English material, roof-repair or reader-task term that matches its content; retain the homepage's core Canberra positioning.
- **Do:** Pair visual distinction with concrete, safe next-step guidance.
- **Don't:** Mix untranslated prose into a Chinese page. Brand names, suburb names, technical trademarks and unchanged contact details may retain their original spelling.
- **Don't:** Fill pages with repetitive keywords, oversized decorative areas or unverified claims.

## Public-page readability, approved 21 October 2026

District directories retain their semantic table and both suburb/enquiry destinations on desktop. At 760px and below, each row becomes a labelled card, with both actions visible without horizontal scrolling. Do not hide the enquiry column.

Keep each service photograph once per page, including its hero. Preserve the original assets and useful captions. The tile case owns the complete three-photo sequence; related services and guides use a concise contextual link rather than repeating that gallery. The case introduction is compact and does not repeat its after photograph as a hero.

The owner-supplied roof-edge and gutter clearing photos added on 22 October 2026 use prepared 4:3 crops, the existing 12px media radius and responsive WebP variants. `.serviceSitePhotos` preserves each crop and places a short factual caption below it. Before/after clearing photos do not establish component repair, pressure washing, a property location or a measured drainage outcome. Existing confirmed project sequences remain separate and intact.

The later approved clearing-case extension uses eight selected photographs grouped by visible build-up, outlet/collection-box clearing and cleared runs. `.clearingPhotoGrid` and the documentary service galleries use two desktop columns and one below 760px, retaining complete prepared 4:3 crops. The homepage replaces its two illustrative context frames with one real clearing photo and a compact case link. Two existing guides place two relevant photos inside their drainage chapter. Reuse the shared photo data and captions across these entry points; do not repeat a photo within a page or turn this selection into a full album of near-identical views. The new clearing case belongs to gutter maintenance; existing page owners and indexing decisions remain intact.

Inspection, cleaning, rental, urgent and leak pages retain their distinct technical explanation. Agreeing access, records, fees and approval is explained once in the relevant booking section rather than echoed across every section. District pages remain useful directories; never invent local conditions or projects to make their text appear unique. Existing contact details and indexing policies stay unchanged.

The 23 October local content candidate extends the service hub with a repair / renovation / replacement scope comparison inside its existing guidance region. Compare the same dimensions for each option: when to discuss it and what the quote should include. Reuse plain definition-list rows, existing type and divider tokens; stack each row below 760px. Home and the hub introduction link to the comparison. The inspection enquiry link has a complete, minimum 44px click area even when its text wraps. Existing guide destinations stay available beneath the comparison. Documentary case links describe only the work supported by those photographs.

Service detail pages keep their five established themes. `ServiceQuotePreparation` owns a three-item, service-specific preparation list inside the existing booking section, followed by the shared optional-photo wording and existing assessment action. Urgent enquiries retain their call-first prompt. Do not add mandatory form fields, repeat generic preparation throughout the page, change contact targets, or infer a diagnosis from the enquiry questions.

## Service areas hub, option 3 selected 24 October 2026

The `/areas` and `/zh/areas` hub uses a dark identity column and a warm-white directory column in an approximately 36:64 desktop split. The identity column contains the existing breadcrumb, two-part page title, concise introduction, existing Canberra roofscape, phone and preparation guidance. The directory owns the orange search accent, two-column district selector and active suburb list. Preserve the existing brand, fonts and semantic heading text.

Search spans all nine districts and 77 suburbs; district selection clears search. Keep every canonical suburb destination and exact enquiry query value, and retain inactive district links in the server-rendered markup. Suburb names open their existing detail pages; the separate enquiry action preselects the location. Enter focuses results; clearing search returns focus to the input. Do not introduce image links or new mandatory form fields.

Below 900px the main columns stack. Below 600px omit the supporting photograph and sidebar preparation block while retaining the phone, search and full directory. Suburb rows become one column; district choices remain two columns. The complete preparation guides remain available in a native disclosure beneath results. District detail pages retain their existing table/card layout; this contract changes only the hub.

This is a local candidate, not a deployed release. Evidence: `../reports/areas-redesign-2026-10-24/`.

## Local content editor, approved 16 October 2026

The editor is a content workbench: a 224px searchable page directory, a flexible real-page preview and a 340px Chinese inspector. At 1190px the inspector follows the preview in document flow; at 700px all regions stack. Desktop preview retains a true 1440px page viewport scaled within its canvas, with a separate 390px phone option and a full-size preview link. This prevents a desktop editor from accidentally presenting only the website's mobile layout.

Reuse the canonical runtime colors, radii, focus and scrollbar rules in `src/styles.css`; `editor/editor.css` consumes the same CSS variables. No new palette or duplicate token source. A small orange page marker indicates selection; page content supplies the visual interest. Chinese textareas grow to 480px before scrolling. Save status and inline errors remain visible; native selects own their popup geometry. Native HTML dialogs supply focus trapping and Escape semantics for unsaved work/history/new articles.

Only the loopback service serves editor assets and write APIs. Open the editor directly by its local URL; neither English nor Chinese website navigation, including local previews, exposes an editor entry. Saving is explicitly a disk draft with revision history, not a publish action. Public production output contains neither editor controls nor draft APIs. See `UX-CONTRACT.md` for behavior and `docs/local-editor.md` for owner instructions.

## 全站方案 3 延伸：2026-10-24

本次用户要求将选定的服务地区方案延伸至全站并减少无效留白；以下约定优先于上文关于白色 FAQ 导航、较宽页框和装饰性 CTA 的旧说明。`src/site-design.css` 在基础样式后载入，负责本次视觉系统。

- 标准内容最大宽度 1280px，章节间距 32–48px；保留地区查询桌的独立 1440px 外框。深炭色用于介绍、导航和行动区，橙色仅作重点边线与行动色，正文背景为暖白。
- 图文介绍使用连续分区，照片高度有上限；禁止用巨大图片和垂直居中的短文案制造空白。首页案例照片维持既有 4:3 比例，桌面最大列宽 460px，手机放在说明下方。
- 首页说明为三列短内容，服务总览为双列比较；服务详情继续使用五主题结构，预约区分成说明和行动两列。手机堆叠，长标题自然换行。
- FAQ 与文章目录使用深色导航栏，原有锚点、折叠、焦点和手机横向分类保持。没有隐藏 FAQ 或删减 SEO 内容来缩短页面。
- 联系、地区及城区表单保留原字段和参数；深色说明与白色表单形成清楚的分区。所有现有照片、图注、联系号码和路径保持，不新增原图链接。
- 覆盖样式采用静态 CSS，未增加前端依赖、网络字体或运行时脚本。后续优先在这层调整，避免再次叠加相互冲突的全局视觉规则。

## 关于页精简补充：2026-10-24

用户要求取消长 FAQ 侧栏留白，并补齐图库。关于页保留紧凑 FAQ 入口，链接到主 FAQ 的预约分类；四条独有问答移至预约与检查分类，照片、安全、费用和咨询资料沿用已有主问答。图库六张均为站内现有图片，桌面三列两行、手机两列三行，统一 4:3，移除首图特殊尺寸，不增加原图链接。

### 关于页入口合并：2026-10-24

按用户最新反馈，移除关于页瓦屋顶案例栏（瓦屋顶维修服务已包含同一案例入口）。FAQ入口并入底部咨询栏，主按钮发送咨询、次链接查看全部常见问题，只保留一个结束区块。此前关于独立FAQ入口的说明由本条替代。

## 屋面材质视觉延伸：2026-10-24

用户选定第一版屋面材质页头，适用于全站相似的大面积纯色介绍区。沿用既有内容框、导航、原有配图及中英文内容。

- 使用 `public/assets/design/roof-editorial-texture.webp`（1600×900，67,100 bytes）作为装饰背景，深色文字区以白色标题及短橙线建立层级。
- 图文页头采用连续背景及橙色斜向接缝；照片、图注仍为独立语义元素。手机改成上下堆叠，以水平橙线衔接，避免斜切挤压文字。
- 覆盖资讯、文章、服务、关于、FAQ、联系、隐私、案例、地区介绍，以及首页和城区页的对应深色行动区。导航栏、页脚及小型交互控件保持现有视觉。
- 不增加原图链接或图片交互；未改变联系方式、表单和页面内容。仅本地预览，未发布。
