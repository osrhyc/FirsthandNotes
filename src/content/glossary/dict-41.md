---
term: '未来函数'
aliases: ['前视偏差', 'Look-ahead Bias']
module: 'quant'
category: '研究陷阱'
pubDate: '2026-07-10'
---

决策用了"当时还拿不到"的信息。例：用当天收盘价决定当天开盘买入；代码里出现 `shift(-n)`。后果是回测好得离谱、实盘立刻翻车。**|IC| > 0.1 或 IR 轻松破 1 时，先查未来函数。**
