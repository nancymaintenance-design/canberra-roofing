# Local bilingual editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 本机中文编辑、英文待同步管理与真实双语网站预览。
**Architecture:** 原站组件共用文字适配层；本地 Node/Vite 服务管理磁盘草稿，生产只包含已审核内容。
**Tech Stack:** Existing React 19, Vite 8, Node 22, TypeScript; no external service or API credential.
**Spec:** ../specs/2026-10-16-local-bilingual-editor.md

## Global Constraints
- 电话、邮箱和邮件处理保持原样。
- 仅本地交付，不提交推送或部署。
- 保留原图文、服务五章、News 桌面阅读和 FAQ。

## Review Focus
- 草稿跨刷新/重启保存且不进入公共构建。
- 多窗口旧版本保存不能覆盖新版本。
- 中文链接不改变 tel/mailto/form value。
- 新文章和未知路径 SSR/客户端一致。
- 长中文和窄屏编辑操作可用。

### Task 1: 双语适配与目录
Files: src/i18n/*, vite.config.ts, src/entry-*.tsx, src/main.tsx, src/route-meta.tsx, src/document-route.ts.
Interfaces: configureLocale(path), translate(text), localizeProps(tag, props), getCatalog().
- [x] 写双语、链接及联系方式保护测试并观察失败。
- [x] 实现共享适配、语言切换、SSR 元数据和双语路由。
- [x] 生成文字目录，补全中文翻译，验证英文无内容退化。

### Task 2: 本地持久化与编辑器
Files: scripts/local-editor*, editor/*, .gitignore, package.json.
Interfaces: GET /__editor/api/state; POST /__editor/api/save with revision/token; version listing/restore.
- [x] 测试磁盘草稿、版本冲突、来源校验和联系方式锁定。
- [x] 实现原子保存和历史；后台页面搜索、预览选字、对照编辑和历史恢复。
- [x] 实现结构化 News 新增、图片选择和待同步状态。

### Task 3: 验证与交付
Files: tests/bilingual*, docs/local-editor.md, DESIGN.md, UX-CONTRACT.md; reports local-bilingual-editor-2026-10-16.
- [x] 运行新增测试、相关原有测试、类型检查和生产构建。
- [x] 浏览器测试保存刷新/冲突/移动端/双语和保护联系方式。
- [x] 出具本地预览和操作说明；明确未部署。

完成记录：Vitest 876 通过/1 条条件跳过；Node 640 通过；新增浏览器全流程通过；Node 22 构建及 240 个双语页面核验通过。独立复核的问题已修复并回归。源码保持本地未提交，GitHub main 仍为 c67c374。
