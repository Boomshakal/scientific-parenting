# 科学育儿记录 (Scientific Parenting Tracker)

一个专业的宝宝成长记录应用，帮助父母科学地记录和追踪宝宝的饮食、睡眠、生长发育、里程碑等重要成长数据。

## ✨ 功能特点

- **全面记录**：饮食、睡眠、生长发育、里程碑、健康、情绪、早教等多维度记录
- **数据可视化**：图表展示宝宝的成长趋势和规律
- **快速操作**：首页一键记录常用功能
- **里程碑追踪**：根据宝宝月龄智能提示发展里程碑
- **数据导出**：支持数据备份和导出（待实现）
- **多用户支持**：家庭成员共同记录和查看

## 🛠️ 技术栈

- **框架**：[Next.js](https://nextjs.org) 16.2.0 (App Router)
- **语言**：TypeScript
- **状态管理**：[Zustand](https://zustand-demo.pmndrs.org)
- **数据库**：[Prisma ORM](https://www.prisma.io) + SQLite
- **认证**：[NextAuth.js](https://next-auth.js.org) v5 (Beta)
- **样式**：Tailwind CSS + [DaisyUI](https://daisyui.com)
- **图表**：[Recharts](https://recharts.org)
- **日期处理**：[date-fns](https://date-fns.org)
- **唯一标识**：[uuid](https://www.npmjs.com/package/uuid)
- **密码处理**：[bcryptjs](https://www.npmjs.com/package/bcryptjs)

## 📁 项目结构

```
scientific-parenting/
├── src/
│   ├── app/                 # Next.js 应用路由
│   │   ├── api/             # API 路由
│   │   ├── (modules)/       # 功能模块 (feeding, sleep, growth, etc.)
│   │   └── layout.tsx       # 根布局
│   ├── components/          # 可复用组件
│   │   ├── layout/          # 布局组件 (Header, BottomNav)
│   │   └── ui/              # UI 组件 (Button, Card, Input, etc.)
│   ├── lib/                 # 工具和库配置
│   │   └── prisma.ts        # Prisma 客户端单例
│   ├── stores/              # Zustand 状态管理
│   │   ├── index.ts         # store 导出
│   │   ├── createRecordStore.ts # 通用记录 store
│   │   └── toastStore.ts    # Toast 通知 store
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts         # 所有接口和常量
│   └── globals.css          # 全局样式
├── prisma/                  # Prisma 数据库模式
│   ├── schema.prisma        # 数据模型定义
│   └── dev.db               # 开发数据库
├── public/                  # 静态资源
├── next.config.ts           # Next.js 配置
├── tailwind.config.ts       # Tailwind 配置 (由 Tailwind CSS v4 自动处理)
├── postcss.config.mjs       # PostCSS 配置
└── eslint.config.mjs        # ESLint 配置
```

## 🚀 快速开始

### 前提条件

- Node.js 18+
- npm, yarn, pnpm 或 bun

### 安装依赖

```bash
npm install
# 或
yarn
# 或
pnpm install
# 或
bun install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 数据库初始化

首次运行时会自动创建 SQLite 数据库文件 (`prisma/dev.db`) 并执行迁移。

## 📦 功能模块

### 1. 宝宝信息管理
- 创建和编辑宝宝基本信息（姓名、生日、性别、头像）
- 自动计算宝宝月龄/天数

### 2. 饮食记录 🍼
- 记录喂养类型（母乳、配方奶、辅食）
- 记录喂养时间、时长和摄入量
- 添加备注说明

### 3. 睡眠记录 😴
- 记录睡眠开始和结束时间
- 自动计算睡眠时长
- 评估睡眠质量（好/一般/差）
- 添加备注

### 4. 生长发育 📏
- 记录身高、体重、头围
- 添加测量备注
- 查看生长趋势图表

### 5. 里程碑记录 🎉
- 基于宝宝月龄智能匹配发展里程碑
- 记录里程碑达成时间
- 添加照片和备注
- 查看里程碑时间线

### 6. 健康观察 🏥
- 记录体检、疫苗接种和用药
- 设置下次复诊/用药提醒
- 查看健康记录列表

### 7. 情绪记录 😊
- 记录宝宝情绪状态（开心/平静/烦躁/哭闹）
- 记录时间和备注
- 分析情绪规律

### 8. 早教记录 📚
- 记录早教活动类型（阅读/游戏/户外/音乐/美术）
- 记录活动时长
- 添加活动描述
- 查看早教统计

## 🔧 配置说明

### 环境变量

创建 `.env.local` 文件并配置以下变量：

```env
# NextAuth 配置
AUTH_SECRET=your_super_secret_here
AUTH_TRUST_HOST=true

# 数据库连接（Prisma 自动处理 SQLite）
# DATABASE_URL="file:./dev.db"
```

### Prisma 数据模式

查看 `prisma/schema.prisma` 了解详细的数据模型定义。

## 🧪 测试

目前项目尚未配置测试框架。建议后续添加：

- 单元测试：Vitest 或 Jest
- 集成测试：React Testing Library
- E2E 测试：Playwright

## 📱 响应式设计

应用采用移动优先的响应式设计，完美支持：
- 移动手机（首要目标）
- 平板电脑
- 桌面电脑

## 🚀 部署

### Vercel 推荐部署

1. 将项目推送到 GitHub 仓库
2. 在 [Vercel](https://vercel.com) 导入仓库
3. 配置环境变量
4. 一键部署

### 其他平台

该项目可以部署到任何支持 Node.js 的平台：
- Netlify
- Railway
- Render
- Docker

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 鸣谢

- [Next.js 团队](https://nextjs.org/) 提供优秀的 React 框架
- [Prisma团队](https://www.prisma.io/) 提供强大的 ORM 工具
- [Zustand团队](https://zustand-demo.pmndrs.org/) 提供简洁的状态管理方案
- 所有开源贡献者

---

*由科学育儿爱好者开发与维护*