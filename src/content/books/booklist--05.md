---
book: 'booklist'
bookTitle: '量化必读 50 本 · 总书单'
author: 'AlphaForge 书屋'
note: '经典 + 新书全景书单：每本一句话定位与阅读建议，标注已有精读'
bookCategory: '总书单'
seq: '0'
chapter: '5'
title: '机器学习（5 本）'
---

> 量化最热的方向，也是坑最深的方向。这一组的共同主题其实是：**如何在金融数据上用 ML 而不自欺**。

## 23.《金融机器学习》/ *Advances in Financial Machine Learning*

Marcos López de Prado，2018｜中译：中信出版社，2021——**中译警告：豆瓣仅 6.2，翻译口碑差（术语混乱、代码缩进错误），强烈建议读英文原版**

金融 ML 方法论"圣经"：三重障碍标注、样本权重、purged CV、回测过拟合检测。社区共识评价很准确：**读它学的是纪律，不是 Alpha**——期待策略食谱的人会失望，但每个想在金融数据上跑模型的人都该先挨它一顿打。〔硬核〕

## 24. *Machine Learning for Asset Managers*（无中译）

Marcos López de Prado，2020｜剑桥大学出版社，Goodreads 4.19

AFML 的 150 页浓缩姊妹篇：去噪协方差、最优聚类、HRP、过拟合检验，七个问题七把刀，附代码。**预算一本先读这本**，再决定要不要啃 AFML。〔进阶〕

## 25. *Machine Learning for Algorithmic Trading*（第 2 版）

Stefan Jansen，2020｜中译：《机器学习在算法交易中的应用》中国水利水电出版社 2023；英文版豆瓣 8.8

800+ 页端到端工程手册：数据 → 特征 → LightGBM/深度学习/RL → 回测，配套 GitHub 万星代码库。**五本里与 AlphaForge 定位最契合的一本**——想给平台加 ML 因子，从它开始。批评也如实说：广而不深，更像参考手册。〔进阶〕

## 26.《机器学习与资产定价》/ *Machine Learning in Asset Pricing*

Stefan Nagel，2021｜中译：电子工业出版社 2022，王熙、石川译，豆瓣 8.0——**中译质量高（大量译者注），放心买**

芝加哥 Booth 教授从经济学第一性原理审视 ML：收缩与正则化的经济学含义、可预测性的界限。薄而密、全是公式无代码——**回答"为什么 ML 在金融里不能照搬"的最佳理论读物**。〔硬核〕

## 27. *Financial Machine Learning*（免费）

Bryan Kelly & Dacheng Xiu（修大成），2023｜Foundations and Trends in Finance 长篇综述（注意：不是 Princeton 出版的书），**SSRN/NBER 可免费下载**

资产定价 × ML 的学术文献地图：收益预测、因子模型、组合优化中的 ML 全景。无代码、需要计量基础，研究型选手的文献入口。〔硬核〕

---

**落选说明**：Dixon 等《Machine Learning in Finance》（Springer 2020）覆盖广但口碑明显弱于以上五本（约 3.7 星，时序方法论被公开批评），走衍生品/强化学习方向再考虑。

**这一页的正确用法**：先读 24 或 23 学"纪律"，再用 25 动手，26/27 补理论。记住 AFML 的核心告诫，它和量化学堂案例一讲的是同一件事：**在金融数据上，防自欺比找信号难，也比找信号重要。**
