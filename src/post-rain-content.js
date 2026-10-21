// Reviewed rain-related questions adapted to the existing ACT roofing services.
// English/Chinese live together so new copy cannot silently omit its translation.
export const POST_RAIN_ZH = {};
const copy = (en, zh) => { POST_RAIN_ZH[en] = zh; return en; };
copy('Rain entering the house or gutters overflowing?','雨水进入室内，还是檐沟溢水？');
copy('Start with','您可以先选择');
copy('for indoor water after rain, or','处理雨后室内进水，或选择');
copy('gutter and downpipe maintenance','檐沟与落水管维护');
copy('roof inspection','屋顶检查');
copy('for debris and overflow. If the source is unclear, choose a','处理杂物与溢水。湿源不明确时，可以选择');
copy('. Report when water appears; you do not need to choose a repair before we assess it.','。请说明进水时间，无需在我们评估前自行确定维修方案。');

export const POST_RAIN_SERVICE_HEADINGS = {
 'roof-leak-repairs': [copy('Roof leaks in heavy or wind-driven rain','大雨或风雨中的屋顶漏水'),copy('Find the entry path before choosing a repair','先查明进水路径，再确定维修')],
 'tile-roof-repairs': [copy('Cracked, slipped or missing roof tiles','屋瓦开裂、移位或缺失'),copy('Replace damaged tiles and check the adjoining roof','更换损坏屋瓦并检查相邻部位')],
 'chimney-flashing-repairs': [copy('Water stains beside a chimney','烟囱附近出现水渍'),copy('Check chimney flashing, overlaps and adjoining tiles','检查烟囱泛水、搭接与相邻屋瓦')],
 'rebedding-repointing': [copy('Loose ridge caps and cracked pointing','屋脊盖瓦松动与勾缝开裂'),copy('Decide between rebedding and repointing','确定重新铺底还是重新勾缝')],
 'roof-inspections': [copy('Roof checks after leaks, storms or recurring dampness','漏水、风暴或反复潮湿后的屋顶检查'),copy('What we check and what needs further access','我们检查哪些部位，何处需要进一步进入')],
 'metal-roof-repairs': [copy('Metal roof leaks around screws, laps and flashing','螺钉、搭接与泛水处的金属屋顶漏水'),copy('Repair fixings or sheets without assuming a full replacement','评估紧固件或板材维修，而非直接整屋换顶')],
 'roof-renovation': [copy('Roof defects that need more than a surface finish','不能仅靠表面涂装处理的屋顶缺陷'),copy('Separate roof repairs, cleaning and finish work','区分屋顶维修、清洁与涂装')],
 'reroof-replacement': [copy('When local repairs may not resolve the roof condition','局部维修可能不足以解决屋顶问题的情况'),copy('Define the replacement covering and connected work','明确更换屋面与相连部位的施工')],
 'roof-cleaning': [copy('Moss, lichen and debris on tile or metal roofs','瓦片或金属屋顶上的苔藓、地衣与杂物'),copy('Match the cleaning method to the roof surface','按屋面材料选择清洁方法')],
 'gutter-downpipe-maintenance': [copy('Gutters overflowing before or after cleaning','檐沟在清洁前后仍然溢水'),copy('Check gutter runs, outlets and downpipes together','一并检查沟段、出水口与落水管')],
 'gutter-repairs': [copy('Leaking joints, sagging gutters and damaged connections','接头漏水、檐沟下垂与连接处损坏'),copy('Compare clearing, component repair and replacement','比较清理、构件维修与更换')],
 'emergency-roof-repairs': [copy('Active roof leaks and visible storm damage','正在发生的屋顶漏水与可见风暴损坏'),copy('Separate urgent protection from the permanent repair','区分紧急处置与正式维修')],
 'rental-property-roof-repairs': [copy('Tenant leak reports and recurring water stains','租户漏水报告与反复水渍'),copy('Coordinate roof checks and owner approval','协调屋顶检查与业主审批')],
};

export const POST_RAIN_SERVICE_COPY = {
 'roof-leak-repairs': {
  symptoms: copy('Tell us whether water starts during a downpour, only when wind drives rain towards one side, or after several hours of steady rain. Note the room, delay before dripping and any gutter overflow. These differences help us plan the inspection; they do not identify a failed tile or flashing on their own.','请说明进水是在大雨时、风将雨吹向某一侧时，还是持续下雨数小时后发生。记录房间、开始滴水前的间隔，以及是否同时有檐沟溢水。这些差别有助于安排检查，但本身不能确定哪片屋瓦或哪处泛水损坏。'),
  causes: copy('We compare the indoor location with the accessible covering, flashing, valleys, penetrations and drainage. Water can travel before reaching a ceiling stain, so the repair must address the entry path rather than only the point where the drip appears. A leak returning after patching needs the earlier work reviewed alongside the current findings.','我们将室内位置与可安全接近的屋面、泛水、天沟、穿屋面构件及排水部位对照。水可能经过一段路径后才形成天花板水渍，因此维修应针对进水路径，而不只针对滴水位置。修补后再次漏水时，需要结合当前检查结果复核既往施工。'),
 },
 'gutter-downpipe-maintenance': {
  symptoms: copy('Record where the gutter spills, whether it happens only in heavy rain, and whether the overflow continued after leaves were removed. Include the date and area of the last clean. Water at one outlet, along a long run or behind the gutter gives us different parts of the drainage route to check.','请记录檐沟从哪里溢水、是否只在大雨时发生，以及清除树叶后是否仍溢水。补充上次清洁的日期和范围。一个出水口、整段沟槽或檐沟后方出现水迹，对应的检查部位不同。'),
  causes: copy('Clearing leaves does not establish that every outlet and downpipe is open. We check the accessible gutter runs, outlets, downpipes and connections within the agreed scope. Persistent overflow may also need gutter fall, damaged sections or the downstream route assessed; clearing and component repairs are separate items in the quote.','清除树叶不等于每个出水口和落水管都已畅通。我们在约定范围内检查可接近的沟段、出水口、落水管及连接处。持续溢水还可能需要评估檐沟坡度、损坏沟段或下游排水路径；清理与构件维修在报价中分别说明。'),
 },
 'gutter-repairs': {
  symptoms: copy('A joint that drips, a separated connection and a gutter that spills over its edge are different observations. Describe the precise location and whether water appears in light rain as well as downpours. Report any indoor drip separately. Tell us if clearing has already been completed so the assessment can focus on any remaining defect.','接头滴水、连接处分离和水从檐沟边缘溢出，是不同的观察结果。请说明准确位置，以及小雨和大雨时是否都会出现。室内滴水应单独报告。若已完成清理，请告知，以便检查尚未解决的缺陷。'),
  causes: copy('We inspect the affected section, joints, supports and downpipe connections before recommending a component repair or replacement. Debris removal will not restore a damaged joint or correct every drainage arrangement. Water backing up from a below-ground pipe needs a separately defined investigation rather than an assumed gutter repair.','我们检查受影响沟段、接头、支撑及落水管连接处，再建议构件维修或更换。清除杂物不能恢复损坏接头，也无法纠正所有排水布置问题。若水从地下管道回堵，需要另行明确排查范围，不能直接按檐沟维修处理。'),
 },
 'roof-inspections': {
  symptoms: copy('An inspection can start with a leak after rain, tiles moved by wind, recurring ceiling dampness or a maintenance concern without an obvious failed component. Describe what changed and any earlier repairs. If there is a musty smell but no visible mark, include the room and rain timing rather than naming a roof leak as the confirmed cause.','检查可从雨后漏水、风后屋瓦移位、天花板反复潮湿，或尚不清楚损坏构件的养护问题开始。请说明变化及既往维修。若有霉味但看不到水渍，请提供房间和降雨时间，不要将屋顶漏水直接当作已确认原因。'),
  causes: copy('We relate the reported concern to safely accessible roof details and drainage. A roof inspection can identify roofing defects, but odour, an old stain or a dry surface cannot by itself establish the moisture source or the condition of concealed materials. Where the evidence points beyond the roof, the next investigation needs its own scope.','我们把所报告的问题与可安全接近的屋顶部位及排水系统联系起来。屋顶检查可以识别屋面缺陷，但气味、旧水渍或干燥表面都不能单独确定湿源及隐蔽材料状况。若证据指向屋顶之外，下一步排查需另行明确范围。'),
 },
 'roof-cleaning': {
  symptoms: copy('Identify whether the build-up is attached moss or lichen, loose leaves, or dirt on the roof finish. Also report any leak or displaced material before cleaning is planned. A roof can need surface cleaning and a separate repair; visible growth alone does not establish that the covering needs replacing.','请区分堆积物是附着的苔藓或地衣、松散树叶，还是屋面饰层上的污垢。安排清洁前，也请说明漏水或材料移位。屋顶可能同时需要表面清洁与独立维修；仅有可见生长物不能说明必须更换屋面。'),
 },
 'emergency-roof-repairs': {
  symptoms: copy('For an active leak, tell us whether water is still entering, which rooms are affected and whether tiles or roof-edge components have visibly moved. Call rather than wait for an online reply if the situation is urgent. Keep away from wet electrical fittings or a sagging ceiling, and seek emergency help where there is immediate danger.','正在漏水时，请说明是否仍在进水、受影响房间，以及屋瓦或屋顶边缘构件是否有可见移位。情况紧急时请致电，不要等待在线回复。远离受潮电气装置或下垂天花板；有即时危险时寻求紧急援助。'),
 },
 'rental-property-roof-repairs': {
  symptoms: copy('A useful tenant report names the affected room, when water appeared, whether it is still entering and what happened during the rain. Keep dated indoor or ground-level photos if safe, together with previous repair records. A new drip and an unchanged old stain should be described separately.','有用的租户报告应注明受影响房间、进水时间、是否仍在进水，以及降雨期间的情况。安全时保留带日期的室内或地面照片和既往维修记录。新出现的滴水与没有变化的旧水渍，应分开描述。'),
 },
};

const faq = (id,slug,group,question,answer,path,label) => ({id,intent:id,slug,group,heading:question,body:answer,question,answer,links:[{path,label}]});
export const POST_RAIN_FAQS = [
 faq('rain-gutter-after-clean','gutter-downpipe-maintenance','Maintenance',
  copy('Why do my gutters still overflow after cleaning?','为什么檐沟清洁后仍然溢水？'),
  copy('The gutter channel may be clear while an outlet or downpipe remains restricted, or the gutter may have a defect or fall problem. Keep the cleaning date, areas included and the location of the remaining overflow. We assess the accessible drainage route and explain whether the next work is further clearing, component repair or a separately scoped investigation.','沟槽可能已清洁，但出水口或落水管仍受阻，也可能存在沟槽缺陷或坡度问题。请保留清洁日期、包含部位及仍然溢水的位置。我们评估可接近的排水路径，并说明下一步是进一步清理、构件维修，还是另行明确范围的排查。'),
  '/news/gutters-overflowing-heavy-rain-canberra',copy('Gutter overflow after debris removal','清除杂物后的檐沟溢水')),
 faq('rain-downstream-boundary','gutter-repairs','Maintenance',
  copy('Does gutter maintenance include a blocked underground stormwater pipe?','檐沟维护是否包括堵塞的地下雨水管？'),
  copy('Do not assume it does. Ask which gutter runs, outlets and downpipes are included and where that scope ends. If water backs up from a ground-level drain or below-ground connection, describe it separately. Underground pipe investigation or redesign needs the appropriate specialist and its own agreed scope; it is not automatically part of our roof or gutter quotation.','不能默认包括。请确认报价包含哪些沟段、出水口与落水管，以及范围到何处结束。若地面排水口或地下连接处回堵，请单独说明。地下管道排查或重新设计需由适当的专业人员按独立约定范围处理，不自动包含在我们的屋顶或檐沟报价中。'),
  '/news/gutters-overflowing-heavy-rain-canberra',copy('Gutters, downpipes and the downstream route','檐沟、落水管与下游排水路径')),
 faq('rain-ceiling-sequence','roof-leak-repairs','Roof leaks',
  copy('The roof leak is repaired. Can I paint over the ceiling stain now?','屋顶漏水修好后，可以马上粉刷天花板水渍吗？'),
  copy('Not on the stain alone. First distinguish a remaining old mark from new moisture, then have affected ceiling materials and their drying condition assessed before lining or paint repairs. Our roofing work addresses the agreed roof defect; plasterboard, drying and decoration are separate scopes. Keep clear of sagging or wet electrical areas and report any new dripping.','不能只凭水渍决定。应先区分残留旧痕与新潮湿，再评估受影响天花板材料及干燥状况，之后才安排板材或涂装修复。我们的屋顶施工处理约定屋面缺陷；石膏板、干燥和装饰属于独立范围。远离下垂天花板或受潮电气区域，出现新滴水时及时报告。'),
  '/news/after-rain-roof-leak-check-canberra',copy('What to check after a roof leak repair','屋顶止漏后还需检查什么')),
 faq('rain-musty-source','roof-inspections','Inspections',
  copy('There is a musty smell after rain but no visible leak. Should the roof be checked?','雨后有霉味但看不到漏水，需要检查屋顶吗？'),
  copy('A roof check may be useful where the timing or location suggests rain entry, but smell alone does not confirm the source or mould type. Record the room, rain timing and any ceiling, window or floor changes. We assess relevant accessible roof details; persistent odour or concealed dampness may need a broader moisture investigation. A roofing visit is not a mould-removal or carpet-drying service.','若发生时间或位置提示雨水进入，屋顶检查可能有帮助，但气味本身不能确认湿源或霉菌种类。请记录房间、降雨时间，以及天花板、窗户或地面变化。我们检查相关且可接近的屋顶部位；持续异味或隐蔽潮湿可能需要更全面的湿源排查。屋顶检查不等于除霉或地毯干燥服务。'),
  '/news/roof-leak-vs-condensation-canberra',copy('Rain-related dampness and other moisture sources','雨后潮湿与其他湿源')),
 faq('rain-records-insurer','roof-inspections','Costs',
  copy('What roof-leak records should I keep for an insurance enquiry?','向保险公司咨询屋顶漏水时，应保留哪些记录？'),
  copy('Keep dated safe photos, the affected rooms, weather and symptom timeline, previous maintenance invoices, inspection findings and itemised repair quotations. Ask your insurer what it needs and what repair authorisation applies before committing to non-urgent work. We can discuss the roofing records agreed for your visit; we do not decide cover, claim acceptance or payment.','请保留安全拍摄且带日期的照片、受影响房间、天气与症状时间线、既往养护发票、检查结果及分项维修报价。在批准非紧急施工前，向保险公司确认所需资料及维修授权要求。我们可讨论上门时约定提供的屋顶记录，但不决定承保、理赔是否获批或赔付款项。'),
  '/news/roof-repair-cost-canberra',copy('Compare repair scopes and retain the records','比较维修范围并保存记录')),
];

export const POST_RAIN_ARTICLE_UPDATES = {
 'after-rain-roof-leak-check-canberra': {section:'investigation',heading:copy('Leak investigation, repair and the ceiling afterwards','漏点排查、屋面维修与后续天花板处理'),paragraphs:[
  copy('For a leak that starts only when wind and rain arrive together, ask whether the visit is an investigation or an agreed repair. The written scope should name the junction or component to be worked on, materials, access and what happens if the water path remains uncertain. Do not compare an inspection-only price with a quotation that already includes component replacement.','若漏水只在风雨同时出现时发生，请确认此次上门是排查还是已约定的维修。书面范围应注明拟施工的交接处或构件、材料、进入条件，以及进水路径仍不明确时的处理方式。不要把仅检查的价格与已包含构件更换的报价直接比较。'),
  copy('Once the roof work is complete, an old ceiling stain may remain. New dripping or a growing damp patch needs follow-up; the old mark alone cannot establish whether the roof still leaks. Have the affected ceiling and its drying condition checked before plasterboard or paint repairs. We address the agreed roof defect, not an automatic package of internal drying and reinstatement.','屋顶施工完成后，旧天花板水渍可能仍然保留。出现新滴水或扩大的湿斑需要跟进；仅凭旧痕不能确定屋顶是否仍漏水。修复石膏板或粉刷前，应检查受影响天花板及干燥状况。我们处理约定屋面缺陷，不默认提供包含室内干燥与恢复的整套施工。'),
 ]},
 'gutters-overflowing-heavy-rain-canberra': {section:'clean-or-repair',heading:copy('Why gutters can still overflow after cleaning','为什么檐沟清洁后仍可能溢水'),paragraphs:[
  copy('If the leaves have gone but overflow remains, establish what the clean included. A cleared gutter run is not proof that its outlet, downpipe and downstream connection are clear. Ask the assessment to distinguish residual obstruction from joint damage, gutter fall and the ability of the arrangement to carry the arriving runoff. A capacity change needs an assessment, not a guess based on one downpour.','树叶已清除但仍溢水时，先确认上次清洁包含哪些部位。一段沟槽已清洁，不能证明其出水口、落水管及下游连接处都畅通。检查应区分残留堵塞、接头损坏、檐沟坡度，以及现有布置能否排走流入的雨水。是否调整容量需要评估，不能只凭一次大雨猜测。'),
  copy('For example, a joint can still leak after a nearby outlet is cleared. That calls for a component decision as well as a cleaning record. If water is instead backing up at a ground-level drain, keep that observation separate: underground stormwater investigation is not automatically included in roof drainage maintenance. Ask for the included sections and exclusions before comparing quotations.','例如，附近出水口清理后，接头仍可能漏水；此时除清洁记录外，还需要确定构件处理方案。若水从地面排水口回堵，应单独记录：地下雨水系统排查不自动包含在屋顶排水维护中。比较报价前，请确认所含沟段及不包含项目。'),
 ]},
 'roof-leak-vs-condensation-canberra': {section:'response',heading:copy('Musty smells, recurring marks and repairs after drying','霉味、反复水痕与干燥后的维修'),paragraphs:[
  copy('A musty smell after rain without visible mould is a reason to describe the moisture pattern, not to name a mould species or assume the roof is responsible. Note whether the smell is strongest near a window, ceiling or floor and whether it changes on dry days. Persistent odour can need a wider moisture assessment even when the accessible roof has no obvious defect.','雨后有霉味却看不到霉斑时，应描述潮湿规律，而非判断霉菌种类或直接归因于屋顶。请记录气味是否集中在窗边、天花板或地面附近，以及干燥天气时是否变化。即使可接近的屋顶没有明显缺陷，持续异味也可能需要更广泛的湿源评估。'),
  copy('If a ceiling mark returns after cleaning or painting, revisit the moisture source rather than repeatedly covering it. After the source is addressed, the affected materials and drying condition still need checking before finishes are renewed. Our roof assessment concerns the roofing contribution; specialist mould treatment, carpet drying and internal lining repairs are not implied by that appointment. Keep clear of wet electrical fittings or a ceiling that looks unsafe.','若天花板痕迹在清洁或粉刷后再次出现，应重新排查湿源，而非反复遮盖。湿源处理后，在恢复饰面前仍需检查受影响材料及干燥状况。我们的屋顶评估针对屋面是否相关，不意味着上门会包含专业除霉、地毯干燥或室内板材修复。请远离受潮电气装置或看起来不安全的天花板。'),
 ]},
 'when-to-arrange-roof-inspection-canberra': {section:'next-step',heading:copy('Plan the inspection, repair decision and follow-up','安排检查、维修决定与后续跟进'),paragraphs:[
  copy('For a rain-related visit, put the observations in sequence: rain begins, overflow or indoor moisture appears, rain stops, then the drip eases or continues. Include whether the wind came from a particular side and which parts of earlier repair work are known. This lets us compare the actual sequence with accessible roof details without requiring you to diagnose it.','针对雨后问题上门时，请按顺序整理观察：开始下雨、出现溢水或室内潮湿、雨停，以及滴水随后减弱还是持续。补充风是否来自某一侧，以及已知的既往维修部位。这有助于我们将实际过程与可接近的屋顶部位对照，无需您自行诊断。'),
  copy('Ask the findings to separate a confirmed visible defect, a suspected water route and an area that could not be inspected. The next step may be a defined repair or further investigation rather than an open-ended patching visit. Agree any later repair scope and quote separately, and keep the original notes so a returning symptom can be compared with the work completed.','请让检查结果区分已确认的可见缺陷、推测的进水路径，以及无法检查的区域。下一步可能是明确的维修，也可能是进一步排查，而不是范围不清的修补上门。后续维修范围与报价应另行约定；保留最初记录，以便将复发症状与已完成施工对照。'),
 ]},
 'roof-repair-cost-canberra': {section:'comparison',heading:copy('Compare the roof work and keep insurance records separate','比较屋顶施工，并单独整理保险资料'),paragraphs:[
  copy('Compare the components and areas, not just the total. One quotation may include inspection only, another a temporary measure, and another replacement flashing or tiles with access and removal included. Ask how uncertain or concealed defects will be handled. Internal drying, plasterboard and painting should be named separately if proposed rather than assumed to come with stopping the roof leak.','比较时应看构件与区域，不只看总价。一份报价可能仅含检查，另一份含临时处置，还有一份包含泛水或屋瓦更换、进入安排及清运。请确认未确定或隐蔽缺陷将如何处理。若涉及室内干燥、石膏板或粉刷，应分别列明，不应默认包含在屋顶止漏中。'),
  copy('If you are also asking an insurer about the damage, retain dated safe photographs, inspection findings, earlier maintenance invoices and the itemised quotation. Ask the insurer what information and authorisation it requires before committing to non-urgent repairs. A roofing quotation describes proposed work; it is not confirmation that a policy covers the damage or that an insurer will pay it.','若同时向保险公司咨询损坏情况，请保留安全拍摄且带日期的照片、检查结果、既往养护发票及分项报价。在批准非紧急维修前，向保险公司确认所需资料和授权。屋顶报价说明拟进行的施工，不代表保险已承保该损坏或保险公司将付款。'),
 ]},
 'roof-leak-information-for-tenants-canberra': {section:'handover',heading:copy('Keep the tenant report, roof findings and internal repairs distinct','区分租户报告、屋顶检查结果与室内修复'),paragraphs:[
  copy('Update the owner or manager if water is still entering, a patch grows or a ceiling changes shape. Add the date, room and rain conditions to the same report rather than sending an unexplained new close-up. After roof work, distinguish an old stain that remains from fresh moisture so the follow-up is about the current condition.','若仍在进水、湿斑扩大或天花板形状变化，请更新业主或物业经理。在同一份报告中补充日期、房间和降雨情况，而非只发送没有说明的新特写照片。屋顶施工后，应区分残留旧痕与新潮湿，让后续跟进针对当前状况。'),
  copy('Roof repair approval does not automatically authorise plasterboard replacement, drying or decoration. The person coordinating the property should confirm those separate scopes and access arrangements. Tenants can report what they observe without deciding the cause, authorising roof work or entering the roof space to collect evidence.','批准屋顶维修不等于自动批准石膏板更换、干燥或装饰施工。负责协调房屋的人员应确认这些独立范围及进入安排。租户可以报告观察情况，无需判断原因、批准屋顶施工，也不应为取证进入屋顶空间。'),
 ]},
};
