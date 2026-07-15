#!/usr/bin/env python3
"""从 PDF/EPUB 提取「阅读单元」纯文本，供读书 agent 真读精读。

三种用法：

1) 看结构（先做这一步）——打印 TOC 树 + 每节点汉字数 + 自适应切分建议：
       python3 scripts/extract-book.py <书文件> --plan

2) 按建议/指定层级切：
       python3 scripts/extract-book.py <书文件> [--slug S] [--level N]

3) 按显式单元表切（--plan 存下 plan.json 后手工调整，再喂回来）：
       python3 scripts/extract-book.py <书文件> --spec book-workspace/<slug>/plan.json

切分原则（见 .ai/read-book.md §2）：
    单元目标 5k~15k 汉字；章太厚且有可用的节 → 按节分组成若干单元；
    单元永不跨章边界；部/篇 只是分组，本身不做单元。

输出:
    book-workspace/<slug>/meta.json           单元结构与统计
    book-workspace/<slug>/plan.json           单元表（可手工改后用 --spec 复跑）
    book-workspace/<slug>/chapters/NN-标题.txt  逐单元纯文本（00-front 为前置部分）

注意: book-workspace/ 已 gitignore，原书文本绝不入库。
"""

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    sys.exit("需要 PyMuPDF: pip install pymupdf")

# 单元字数目标（汉字数，非字符数）
TARGET = 10000   # 拆分厚章时每个单元瞄准的字数
MAX = 15000      # 超过这个就考虑按节拆
MIN = 2000       # 小于这个的节尽量往相邻单元合并（仅限同章内）

# 不作为阅读单元的前后置内容（序/前言/导论/绪论/附录/后记 仍然要读，不在此列）
SKIP_RE = re.compile(
    r"^\s*(目\s*录|版权|封面|扉页|作者简介|关于作者|内容简介|推荐语|媒体评论"
    r"|参考文献|参考书目|索引|注释|译名对照"
    r"|Contents|Copyright|COPYRIGHT|About the Author|Bibliography|References|Index|Notes)", re.I)

# 「章」：真正的阅读单元候选。章号后必须跟分隔符或行尾——否则「第3章对数据驱动型模型
# 进行了完美介绍」这种正文句子会被当成章标题。
CHAPTER_RE = re.compile(
    r"^\s*(?:第\s*(?P<cn>[一二三四五六七八九十百零0-9]+)\s*[章讲课回幕]|Chapter\s+(?P<en>\d+))"
    r"\s*(?:[　\s:：.、·—－-]|$)", re.I)
# 「部/篇」：只是分组，本身不做单元。注意同一页上「第二部分」和「第3章」可能并存，
# 切章时必须优先认「章」，否则整章会被并进「部」里。
PART_RE = re.compile(
    r"^\s*(第\s*[一二三四五六七八九十百零0-9]+\s*(部分|部|篇)|PART\s+[IVX\d]+)", re.I)
# 树逻辑里判断「某节点的子节点是不是章级」时，部/篇 也算章级（说明本节点是更上层的分组）
CHAPTER_OR_PART_RE = re.compile(f"({CHAPTER_RE.pattern})|({PART_RE.pattern})", re.I)

CJK_RE = re.compile(r"[一-鿿]")


def cjk(text: str) -> int:
    return len(CJK_RE.findall(text))


def slugify(text: str, fallback: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = re.sub(r"[^A-Za-z0-9]+", "-", text).strip("-").lower()
    return text or fallback


def safe_filename(title: str, limit: int = 40) -> str:
    cleaned = re.sub(r'[\\/:*?"<>|\s]+', "-", title).strip("-")
    return cleaned[:limit] or "untitled"


def page_text(doc, start: int, end: int) -> str:
    parts = [doc[i].get_text("text") for i in range(start, min(end, doc.page_count))]
    return "\n".join(parts).strip()


def toc_is_usable(doc):
    """很多 EPUB 的 TOC 条目页码全是 0（锚点未解析），这种目录不能用来切分。"""
    raw = doc.get_toc(simple=True)
    if not raw:
        return False
    usable = [e for e in raw if e[2] > 0]
    return len(usable) >= 3 and len(usable) >= 0.4 * len(raw)


CN_NUM = {c: i for i, c in enumerate("零一二三四五六七八九", 0)}


def chapter_no(title: str):
    """从章标题里取出章号，取不到返回 None。"""
    m = CHAPTER_RE.match(title)
    if not m:
        return None
    if m.group("en"):
        return int(m.group("en"))
    s = m.group("cn")
    if s.isdigit():
        return int(s)
    if "十" in s:  # 十/十三/二十/二十一
        a, _, b = s.partition("十")
        return (CN_NUM.get(a, 1) if a else 1) * 10 + (CN_NUM.get(b, 0) if b else 0)
    return CN_NUM.get(s)


def heading_boundaries(doc):
    """TOC 不可用时：扫描每页开头几行找章标题。返回 [(title, start_page0)]。

    只认「章」不认「部」——同页并存时认部会把整章吞掉。
    目录页与前言里也会零散提到「第N章」，靠「章号必须严格递增」把它们滤掉：
    正文的章号一定是 1,2,3… 递增的，取最长递增子序列即为正文。
    """
    cands = []
    for i in range(doc.page_count):
        lines = [ln.strip() for ln in doc[i].get_text("text")[:600].splitlines()[:12]]
        hits = [ln for ln in lines if len(ln) <= 40 and CHAPTER_RE.match(ln)]
        if len(hits) > 2:  # 目录页
            continue
        if hits and (not cands or cands[-1][1] != i):
            no = chapter_no(hits[0])
            if no is not None:
                cands.append((hits[0][:60], i, no))
    if not cands:
        return []
    # 同一章号会出现两次（目录/前言里一次、正文里一次）——取最后一次，即正文那次。
    # 否则 LIS 可能选中以目录页为起点的等长链，把前置内容全并进第 1 章。
    last = {}
    for c in cands:
        last[c[2]] = c
    cands = sorted(last.values(), key=lambda c: c[1])
    # 最长严格递增子序列（按章号），O(n²) 足够
    best = [1] * len(cands)
    prev = [-1] * len(cands)
    for i in range(len(cands)):
        for j in range(i):
            if cands[j][2] < cands[i][2] and best[j] + 1 > best[i]:
                best[i], prev[i] = best[j] + 1, j
    k = best.index(max(best))
    chain = []
    while k != -1:
        chain.append(cands[k])
        k = prev[k]
    return [(t, p) for t, p, _ in reversed(chain)]


def build_tree(doc):
    """TOC → 树。每个节点带 page 区间与汉字数。"""
    toc = [(lv, t.strip(), max(p - 1, 0)) for lv, t, p in doc.get_toc(simple=True) if p > 0]
    if not toc:
        return []
    root, stack = [], []
    for lv, title, page in toc:
        node = {"level": lv, "title": title, "page": page, "children": []}
        while stack and stack[-1]["level"] >= lv:
            stack.pop()
        (stack[-1]["children"] if stack else root).append(node)
        stack.append(node)

    # 结束页 = 下一个「兄弟」的起始页；末个兄弟继承父节点的结束页。
    # 注意不能取「前序遍历里下一个节点」——那是自己的第一个子节点，会把父节点压成 1 页。
    def assign(nodes, parent_end):
        for i, n in enumerate(nodes):
            n["end"] = nodes[i + 1]["page"] if i + 1 < len(nodes) else parent_end
            assign(n["children"], n["end"])
            n["chars"] = cjk(page_text(doc, n["page"], n["end"]))
            # 自身导语（第一个子节点之前的正文），用来判断它是不是纯分组标题
            n["lead"] = cjk(page_text(doc, n["page"], n["children"][0]["page"])) if n["children"] else n["chars"]

    assign(root, doc.page_count)
    return root


def plan_units(nodes, depth=0):
    """自适应切分：返回 [{title, page, end, chars, kind, note}]。

    规则：
      - 跳过目录/版权类；
      - 节点 <= MAX 且不是「纯分组标题」→ 整节点一个单元；
      - 纯分组标题（部/篇：自身导语极少且有子节点）→ 递归进子节点，自己不做单元；
      - 节点 > MAX 且有子节点 → 按子节点分组成 ~TARGET 的若干单元（不跨本节点边界）；
      - 节点 > MAX 且无子节点 → 整节点一个单元，标记 oversized（agent 需拆上/下）。
    """
    out = []
    for n in nodes:
        if SKIP_RE.match(n["title"]):
            continue
        # 够小 或 没有子节点 → 整节点一个单元。放在最前面：这样「部」若整体不厚也会被
        # 原样保留（罕见），而更重要的是厚章不会因为标题页与首节同页就被误拆。
        if n["chars"] <= MAX or not n["children"]:
            note = "oversized-no-subsections" if n["chars"] > MAX else ""
            out.append({"title": n["title"], "page": n["page"], "end": n["end"],
                        "chars": n["chars"], "kind": "chapter" if depth == 0 else "section",
                        "note": note})
            continue
        # 厚 + 有子节点：子节点是「章」→ 递归（本节点是部/篇这类分组）；
        #                子节点是「节」→ 在本节点内分组（绝不跨章）。
        kids = n["children"]
        kids_are_chapters = sum(1 for c in kids if CHAPTER_OR_PART_RE.match(c["title"])) * 2 >= len(kids)
        if kids_are_chapters:
            out.extend(plan_units(kids, depth))
            continue
        # 厚章 → 按子节点分组。
        # 注意必须「加之前判断」：先加再判断 >= TARGET 的话，一个组会冲到接近 2×TARGET
        # ——某章小节各 9~12k 时，两节一凑就 2.3 万，直接破上限。
        runs, cur, cur_sum = [], [], 0
        for c in n["children"]:
            if cur and (cur_sum + c["chars"] > MAX or cur_sum >= TARGET):
                runs.append(cur)
                cur, cur_sum = [], 0
            cur.append(c)
            cur_sum += c["chars"]
        if cur:
            tail = sum(x["chars"] for x in cur)
            prev = sum(x["chars"] for x in runs[-1]) if runs else 0
            # 尾组太薄就并进上一组，但并完不能破上限，否则宁可留一个薄单元
            if runs and tail < TARGET // 2 and prev + tail <= MAX:
                runs[-1].extend(cur)
            else:
                runs.append(cur)
        for i, run in enumerate(runs, 1):
            # 仅仅是占位标签，用来在 --plan 里对齐。落盘成笔记前必须换成
            #「第N章　<从本单元小节里长出来的副标题>」，且不带（上）（下）这类括号标记，
            # 见 .ai/read-book.md §7「Titling units」。
            label = f"{n['title']}［{i}/{len(runs)}］" if len(runs) > 1 else n["title"]
            sub = "｜".join(c["title"] for c in run)
            out.append({"title": label, "page": run[0]["page"], "end": run[-1]["end"],
                        "chars": sum(c["chars"] for c in run), "kind": "section-group",
                        "note": f"含小节：{sub}"})
    return out


def print_tree(nodes, indent=0):
    for n in nodes:
        flag = "  ←纯分组" if n["children"] and n["lead"] < 800 else ""
        print(f"  {'    ' * indent}L{n['level']} {n['chars']:>7}字  p{n['page'] + 1}-{n['end']}  {n['title'][:44]}{flag}")
        print_tree(n["children"], indent + 1)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("book")
    ap.add_argument("--slug")
    ap.add_argument("--level", type=int, default=0, help="强制按 TOC 第 N 级切（跳过自适应）")
    ap.add_argument("--spec", help="显式单元表 json，格式同 plan.json")
    ap.add_argument("--plan", action="store_true", help="只打印结构与建议，不写文件")
    ap.add_argument("--pages-per-chunk", type=int, default=15)
    args = ap.parse_args()

    book_path = Path(args.book).expanduser()
    if not book_path.exists():
        sys.exit(f"文件不存在: {book_path}")

    doc = fitz.open(book_path)
    title_guess = (doc.metadata or {}).get("title") or book_path.stem
    slug = args.slug or slugify(book_path.stem, "book")
    usable = toc_is_usable(doc)
    tree = build_tree(doc) if usable else []
    if not usable:
        print("⚠️ TOC 页码大多为 0（锚点未解析），改用标题正则切章。")

    # ---- 决定单元 ----
    if args.spec:
        units = json.loads(Path(args.spec).read_text(encoding="utf-8"))["units"]
        mode = f"spec:{Path(args.spec).name}"
    elif args.level:
        ents = [(t, p) for lv, t, p in
                [(n["level"], n["title"], n["page"]) for n in _flatten(tree)] if lv == args.level]
        units = []
        for i, (t, p) in enumerate(ents):
            end = ents[i + 1][1] if i + 1 < len(ents) else doc.page_count
            units.append({"title": t, "page": p, "end": end,
                          "chars": cjk(page_text(doc, p, end)), "kind": "chapter", "note": ""})
        mode = f"toc-level-{args.level}"
    elif tree:
        units = plan_units(tree)
        mode = "adaptive"
    elif len(heading_boundaries(doc)) >= 3:
        ents = heading_boundaries(doc)
        units = []
        for i, (t, p) in enumerate(ents):
            end = ents[i + 1][1] if i + 1 < len(ents) else doc.page_count
            chars = cjk(page_text(doc, p, end))
            units.append({"title": t, "page": p, "end": end, "chars": chars, "kind": "chapter",
                          "note": "oversized-no-subsections" if chars > MAX else ""})
        mode = "heading-regex"
    else:
        step = args.pages_per_chunk
        units = [{"title": f"pp.{i + 1}-{min(i + step, doc.page_count)}", "page": i,
                  "end": min(i + step, doc.page_count),
                  "chars": cjk(page_text(doc, i, i + step)), "kind": "chunk", "note": ""}
                 for i in range(0, doc.page_count, step)]
        mode = f"page-chunks-{step}"

    # ---- 汇报 ----
    total = sum(u["chars"] for u in units)
    print(f"书名(猜测): {title_guess}")
    print(f"页数: {doc.page_count} | 切分: {mode} | 单元数: {len(units)} | 正文汉字: {total}")
    if args.plan and tree:
        print("\n── TOC 树 ──")
        print_tree(tree)
    print(f"\n── 阅读单元（目标 {TARGET}±，上限 {MAX}）──")
    print(f"{'序':>3} {'汉字':>7} {'页码':>10}  {'类型':<14} 标题")
    for i, u in enumerate(units, 1):
        warn = " ⚠超长" if u["chars"] > MAX else (" ·薄" if u["chars"] < MIN else "")
        print(f"{i:>3} {u['chars']:>7} {str(u['page'] + 1) + '-' + str(u['end']):>10}  {u['kind']:<14} {u['title'][:40]}{warn}")
        if u.get("note"):
            print(f"       └ {u['note'][:96]}")
    over = [u for u in units if u["chars"] > MAX]
    if over:
        print(f"\n⚠️ {len(over)} 个单元超过 {MAX} 字且无可用小节 → 让 agent 拆成（上）（下）两篇")
    if total < doc.page_count * 60:
        print("\n⚠️ 平均每页汉字过少：可能是扫描版（无文本层），需走看图直读。")
    if args.plan:
        print("\n（--plan 模式，未写文件。确认无误后去掉 --plan 重跑；"
              "或改 plan.json 后用 --spec 精确控制。）")
        return

    # ---- 写文件 ----
    out_root = Path(__file__).resolve().parent.parent / "book-workspace" / slug
    chapters_dir = out_root / "chapters"
    chapters_dir.mkdir(parents=True, exist_ok=True)
    for old in chapters_dir.glob("*.txt"):
        old.unlink()

    records = []
    front = page_text(doc, 0, units[0]["page"])
    if front:
        (chapters_dir / "00-front.txt").write_text(front, encoding="utf-8")
        records.append({"n": 0, "title": "(前置: 封面/序/目录)", "file": "00-front.txt",
                        "start_page": 1, "end_page": units[0]["page"], "chars": cjk(front), "kind": "front"})
    for i, u in enumerate(units, 1):
        text = page_text(doc, u["page"], u["end"])
        fname = f"{i:02d}-{safe_filename(u['title'])}.txt"
        (chapters_dir / fname).write_text(text, encoding="utf-8")
        records.append({"n": i, "title": u["title"], "file": fname, "start_page": u["page"] + 1,
                        "end_page": u["end"], "chars": u["chars"], "kind": u["kind"],
                        "note": u.get("note", "")})

    (out_root / "plan.json").write_text(
        json.dumps({"units": units}, ensure_ascii=False, indent=2), encoding="utf-8")
    (out_root / "meta.json").write_text(json.dumps({
        "source": str(book_path), "title_guess": title_guess, "slug": slug,
        "pages": doc.page_count, "split_mode": mode, "total_chars": total,
        "chapters": records,
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n输出: {out_root}")


def _flatten(nodes):
    for n in nodes:
        yield n
        yield from _flatten(n["children"])


if __name__ == "__main__":
    main()
