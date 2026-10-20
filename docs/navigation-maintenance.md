# 客户导航维护

本站的服务归属与短标签由 `src/navigation-map.ts` 维护，正式域名来自现有首页canonical。可见面包屑与BreadcrumbList共用这份映射；不拆分URL猜层级。服务继续使用 `SERVICE_CATALOG` 中已经确认的地址，指南读取实际服务关系。综合报价和维修范围比较文章保留资讯父级；未来未确认归属的编辑文章也先回到真实资讯目录。

修改父级前先确认内容归属，再在父服务页保留可见子内容入口。`ServiceResources` 自动列出已确认的服务指南和案例；不要为了集中链接将所有文章挂到同一服务。中英文标签可以翻译，URL、canonical和现有索引政策不随之改变。

`translate` 默认仍登记实际渲染的编辑字段。映射枚举使用不登记模式，避免把其他页的标签放进当前页的本地编辑后台。新增调用必须维持这个边界，并运行本轮编辑字段回归测试。

## 验证与记录

使用项目Node22环境运行 `npm run build`、`npm test -- --maxWorkers=1`。本机Codex的默认pnpm包装器固定使用Node24；本轮只在忽略目录 `.local-editor/test-bin` 提供Node22测试包装器，没有修改全局运行时、项目依赖或线上设置。

`tests/breadcrumb-journey.vitest.test.tsx` 检查真实路径、语言、配对、循环、JSON安全、编辑字段隔离、父级资源及地区首段入口。`tests/breadcrumb-analytics.vitest.test.jsx` 检查单次非个人信息事件；原有表单成功、电话与邮件事件测试继续保留。

`scripts/verify-navigation.mjs` 对本地构建进行全量HTTP与可见/schema核对；`scripts/test-navigation-browser.mjs` 检查360、390、768、1440宽度和双语咨询流程，不提交表单。正式绝对链接在测试浏览器中转到本地候选，外部分析请求被阻断，不访问真实客户收件箱。源代码并未改写正式链接。

本轮基线与结果在本站 `reports/breadcrumbs-2026-10-20`；不要重新运行 `navigation-evidence.mjs before` 覆盖已有基线。未来新任务应先改用新的内部报告目录，再采集修改前证据。`export-navigation-review.mjs` 仅整理已有快照，不是新的业务内容源。

## 事件与业务结果

复用现有GA4的单一click监听器发送 `breadcrumb_click`，参数为已去查询和片段的 `source_path`、`target_path`、`locale`、`position`、`owner_id`。不新增分析加载器，不标为获客转化，不采集访客姓名、邮箱、地址、照片或留言。本地和预览环境不发正式分析事件。

正式发布后需有GA4权限的人核对DebugView及自定义维度；本轮没有更改平台配置。`generate_lead`仍只跟随原表单成功回调，`phone_click`与`email_click`仍为点击行为，不等同于接通、收到邮件或有效询盘。

以实际发布日D之前完整28天为基线；D后28天、56天按相同查询组、落地页、语言、设备、地区及品牌/非品牌口径复查。有效询盘需结合实际收到并去重的业务记录。没有数据时记录“未取得”，不能填0或把结构测试当成增长。

## 发布边界

本轮初次交付为本地候选。用户于2026年10月20日在预览后明确确认本轮部署，并要求上线核对中英文面包屑、服务内链和咨询入口；实际提交、部署与验收结果另存本站reports/breadcrumbs-2026-10-20/发布验收报告.md。该次授权不延续到后续任务。任何后续push可能触发Vercel构建，必须重新取得用户明确确认；电话、邮箱、已有SEO/内容/UI成果和训练政策仍按本站AGENTS保留。
