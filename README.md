# 無人機操作證學科題庫

台灣遙控無人機（普通／專業）操作證學科測驗題庫練習與模擬考試。

**線上使用：[https://drone-quiz.tw/](https://drone-quiz.tw/)**

題庫來源：[交通部民用航空局](https://www.caa.gov.tw/Article.aspx?a=3833&lang=1)

## 功能

- **題庫練習** — 瀏覽完整題庫，每題顯示正確答案
- **模擬測驗** — 依照正式考試規則進行模擬測驗（計時、隨機抽題、自動計分）
- **考試紀錄** — 查看歷次模擬測驗成績
- **題目收藏** — 收藏重要題目方便複習
- **深色模式** — 支援淺色／深色／跟隨系統三種主題
- **自動更新** — GitHub Actions 每週自動更新題庫

## 題庫類型

| 類別               | 題數 | 測驗抽題 | 測驗時間 | 及格分數 |
| ------------------ | ---- | -------- | -------- | -------- |
| 普通操作證         | 388  | 40       | 30 分鐘  | 70       |
| 專業操作證         | 587  | 80       | 60 分鐘  | 70       |
| 專業操作證屆期換證 | 317  | 40       | 30 分鐘  | 70       |

## 開發

```bash
npm install          # 安裝依賴
npm run dev          # 啟動開發伺服器
npm run build        # 建置
npm run lint         # ESLint 檢查
npm run format       # Prettier 格式化
npm run parse-pdf    # 解析 PDF 題庫為 JSON
```

## 技術棧

- React 19 + TypeScript
- TailwindCSS v4
- Vite 8
- react-router-dom (HashRouter)
- GitHub Pages

## 授權

MIT License
