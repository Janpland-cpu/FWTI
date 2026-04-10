# FWTI 静态站点（NAS Container 版）

这是一个**纯 HTML + CSS + JavaScript** 的移动端优先人格测试站，数据来自静态 JSON，前端在浏览器里完成题目作答、计分、主/副标签判定、隐藏标签触发与结果页渲染。

## 目录结构

```text
.
├── index.html
├── styles.css
├── app.js
├── data
│   ├── questions.json
│   └── results.json
├── nginx.conf
├── Dockerfile
└── docker-compose.yml
```

## 技术栈

- 前端：纯 HTML + CSS + JavaScript
- 数据：静态 JSON
- 部署：Nginx 静态服务容器
- 无数据库、无 Node 运行时依赖、无后端 API

## 本地预览

任选一种方式：

### 方式 1：Python 临时静态服务

```bash
cd /path/to/fwti_web_static
python3 -m http.server 8080
```

浏览器访问：

```text
http://localhost:8080
```

### 方式 2：直接用 Docker Compose

```bash
docker compose up -d
```

浏览器访问：

```text
http://localhost:8088
```

## NAS Container 部署建议

### Synology / QNAP / 极空间 / Unraid 通用思路

1. 在 NAS 上创建一个项目目录，例如：

```text
/docker/fwti-site
```

2. 把本项目所有文件上传到这个目录。
3. 进入该目录执行：

```bash
docker compose up -d
```

4. 访问：

```text
http://NAS-IP:8088
```

如果你想改端口，只需要改 `docker-compose.yml` 里的左侧端口即可。

## 为什么用静态容器

因为这套测试逻辑全部在浏览器中完成：

- 题目来自 `data/questions.json`
- 标签文案和隐藏标签规则来自 `data/results.json`
- 计分、归类、结果展示全部由 `app.js` 完成

所以它非常适合 NAS：

- 资源占用小
- 好迁移
- 好备份
- 不依赖数据库
- 不依赖外部 API
- 后续只需要替换 JSON 或文案即可更新内容

## 可继续迭代的方向

### 1. 结果分享
- 生成分享图
- 复制结果卡片
- 用 URL hash 存一份只读结果摘要

### 2. 数据埋点
- 接入 Plausible / Umami / 自建统计
- 统计完成率、题目跳出率、标签分布

### 3. 题库迭代
- 扩展到 48 题版本
- 给每个标签增加备用题
- 引入题目随机池

### 4. 结果页增强
- 公开标签 + 副标签双卡展示
- 隐藏标签多触发时显示“复合人格叠层”
- 增加分享海报版结果页

## 注意

这是一套娱乐化的社会适应人格测绘，不是临床诊断系统。
