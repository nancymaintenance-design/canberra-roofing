# 双语 llms.txt 维护说明

本站的 llms.txt 是精选内容导航，不控制Google收录或排名，也不保证AI引用。目标站点为 `https://www.canberraroofkind.com.au`，品牌Ellis Services Group。本文件不授权推送或部署。

## 内容来源

`scripts/llms-curation.mjs` 只保存人工审核过的英文Owner路径、页面角色、摘要选择器和阅读意图，不复制一套品牌资料或服务正文。`scripts/generate-llms.mjs` 从本站已构建的HTML读取品牌名称、H1、摘要正文与真实hreflang配对。正式origin来自 `src/route-meta.json` 的首页canonical，不采用请求Host或预览域名。

服务摘要取各自 `.directAnswer`，案例及具体指南取 `.articleLead`。关于页面跳过开头的生活背景段，使用后面的实际业务说明。其他总览取首个非空、非eyebrow正文段。摘要通常保留原段前两个完整句子；加急服务保留第三句，以免丢失非正常时段加急费用说明。不补写事实；这是导航长度选择，不是搜索排名的字数要求。

所有选入页面须存在于已发布路由和sitemap中，提供正文、自指canonical与互相对应的中英文hreflang。显式noindex、语言误配、缺少正文、缺少sitemap条目或Owner不一致会使生成失败；不要为了通过生成而擅自修改这些网站配置。

## 更新步骤

1. 修改真实页面内容或新增已获准发布的页面后，先完成中英文正文和语言对应核对。
2. 如确有必要调整精选范围，在 `scripts/llms-curation.mjs` 增减已确认的Owner路径。新服务不会仅因加入全站目录就自动加入此清单。
3. 在Node 22环境运行 `npm run build`。顺序为页面预渲染完成后生成 `public/llms.txt` 和 `dist/llms.txt`；不要只手改生成文本，否则下次构建会覆盖。
4. 运行 `node --test tests/llms-navigation.test.mjs tests/llms-generator.test.mjs`，再运行全量项目测试。
5. 运行 `node scripts/verify-llms.mjs`，用本地HTTP校验候选版本。检查报告默认存于本站 `reports/llms-2026-10-20/local`；后续任务可通过 `--output=../reports/本次目录/local` 指定新目录。
6. 运行 `node scripts/verify-llms.mjs --origin=https://www.canberraroofkind.com.au --output=../reports/本次目录/production-read-only`，低并发只读核对正式页面。未部署时，报告中的 `matchesCandidate:false` 表示线上文件尚不是当前候选，不等于站点错误。

验证脚本不提交表单、不发送邮件、不修改远端配置。常规构建和访问llms.txt不调用模型、不联网抓站。在线检查属于独立人工运行的维护步骤；每次网络失败只有限重试，失败应列为未验证，不能当作404。

## 发布与回退

本任务初次交付仅本地预览；用户于2026年10月20日另行明确授权发布该候选版本。仓库main关联Vercel自动生产构建，其他分支推送也可能触发预览；今后任何push、合并、预览或生产发布仍须取得用户当次明确授权。本次授权不构成持续发布许可。

获准发布后，除逐链接检查外，还要确认正式 `/llms.txt` 的GET正文与候选文件一致、UTF-8文本类型正确，且不同Accept-Language不跳去语言HTML页面。模拟User-Agent不证明真实机器人来访。真实访问、身份、收录或引用需另有相应日志和平台证据。

如需回退，应同时恢复本次生成器接入和文本输出，不能仅改生成文件后又被新构建重写。回退也须单独获准；不执行强制push，不删除其他成果，不变更robots、WAF、训练政策或联系方式。
