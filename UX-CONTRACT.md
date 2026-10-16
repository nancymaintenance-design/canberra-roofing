# 本地内容编辑交互约定

依据：用户 2026-10-16 确认的本地双语编辑方案；本站 AGENTS.md 电话、邮箱与部署约定；docs/superpowers/specs/2026-10-16-local-bilingual-editor.md。

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | native select in editor/index.html | DESIGN.md | platform popup | browser keyboard |
| Form | editor/editor.js | this contract | text / article | editor browser test |
| Scrollbar | src/styles.css | DESIGN.md | canvas geometry | computed style |
| Toast | #saveState / #editorError | this contract | saved / pending / error | live region |
| CRUD | local-editor-store.mjs | API revision contract | save / restore / create article | disk and browser tests |

## 状态和保存

- 页面搜索为本地即时过滤，支持清空；选中页面保存在 URL，目录有结果数量和无结果提示。
- 默认中文预览，可切换英文及电脑/手机。选择文字有下拉选择的键盘替代方式。共用文字注明影响页面数量。
- 文字修改保留在工作内存，点击保存后才写入 .local-editor/draft.json；成功后显示本地版本号。未保存切页有应用内提示，刷新/关闭由浏览器退出提示保护。
- 后台英文只读，中文变动标记英文待同步。新中文文章在同步前不进入英文文章列表。
- 保存采用 revision 比较和串行原子写入。409 保留本窗口输入，提示复制文字后重新载入；不覆盖磁盘新版本。网络失败保留输入，可重试。
- 保存期间再次输入的文字保持为未保存，不被较早响应覆盖。重复提交禁用。
- 历史版本恢复为新版本，保留原版本；无硬删除、发布按钮和外部副作用。
- 新文章需完整标题、摘要、导语、站内封面与章节正文；网址不可重复。文章关闭及 Escape 有未保存提醒。
- 电话和邮箱相关文字锁定；所有 tel、mailto、表单 value 和实际 API 路由不由翻译层改变。

## 权限和范围

本地服务仅绑定 127.0.0.1，写操作验证 Host、Origin 和会话 token；无在线账户、云存储、自动翻译接口和部署按钮。草稿、历史及后台不进入公共构建。最终发布始终由用户另行确认。
