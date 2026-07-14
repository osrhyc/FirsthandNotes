#!/usr/bin/env python3
"""从 PDF/EPUB 提取逐章纯文本，供读书 agent 精读。

用法:
    python3 scripts/extract-book.py <书文件.pdf|.epub> [--slug my-book] [--level 1] [--pages-per-chunk 15]

输出:
    book-workspace/<slug>/meta.json          章节结构与统计
    book-workspace/<slug>/chapters/NN-标题.txt  逐章纯文本（含 00-front 前置部分）

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

CHAPTER_RE = re.compile(
    r"^\s*(第\s*[一二三四五六七八九十百零0-9]+\s*[章讲课幕部篇]|Chapter\s+\d+|CHAPTER\s+\d+|PART\s+[IVX\d]+)",
)


def slugify(text: str, fallback: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = re.sub(r"[^A-Za-z0-9]+", "-", text).strip("-").lower()
    return text or fallback


def safe_filename(title: str, limit: int = 40) -> str:
    cleaned = re.sub(r'[\\/:*?"<>|\s]+', "-", title).strip("-")
    return cleaned[:limit] or "untitled"


def page_text(doc, start: int, end: int) -> str:
    """提取 [start, end) 页（0-based）的文本。"""
    parts = []
    for i in range(start, min(end, doc.page_count)):
        parts.append(doc[i].get_text("text"))
    return "\n".join(parts).strip()


def toc_boundaries(doc, level: int):
    """按 TOC 指定层级切章，返回 [(title, start_page0)]。"""
    toc = doc.get_toc(simple=True)  # [ [level, title, page(1-based)], ... ]
    entries = [(t.strip(), max(p - 1, 0)) for lv, t, p in toc if lv == level and p > 0]
    # 去掉页码不递增的脏条目
    cleaned = []
    last = -1
    for title, page in entries:
        if page >= last:
            cleaned.append((title, page))
            last = page
    return cleaned


def heading_boundaries(doc):
    """无 TOC 时：扫描每页开头几行找章标题。"""
    found = []
    for i in range(doc.page_count):
        head = doc[i].get_text("text")[:300]
        for line in head.splitlines()[:6]:
            if CHAPTER_RE.match(line.strip()):
                title = line.strip()[:60]
                if not found or found[-1][1] != i:
                    found.append((title, i))
                break
    return found


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("book", help="PDF/EPUB 文件路径")
    parser.add_argument("--slug", help="工作目录名（默认由文件名生成）")
    parser.add_argument("--level", type=int, default=0, help="按 TOC 第几级切章（0=自动选择）")
    parser.add_argument("--pages-per-chunk", type=int, default=15, help="兜底分块的页数")
    args = parser.parse_args()

    book_path = Path(args.book).expanduser()
    if not book_path.exists():
        sys.exit(f"文件不存在: {book_path}")

    doc = fitz.open(book_path)
    title_guess = (doc.metadata or {}).get("title") or book_path.stem
    slug = args.slug or slugify(book_path.stem, "book")

    out_root = Path(__file__).resolve().parent.parent / "book-workspace" / slug
    chapters_dir = out_root / "chapters"
    chapters_dir.mkdir(parents=True, exist_ok=True)
    for old in chapters_dir.glob("*.txt"):
        old.unlink()

    # ---- 选切章边界 ----
    mode = ""
    boundaries = []
    if args.level:
        boundaries = toc_boundaries(doc, args.level)
        mode = f"toc-level-{args.level}"
    else:
        for level in (1, 2):
            candidate = toc_boundaries(doc, level)
            if len(candidate) >= 3:
                boundaries = candidate
                mode = f"toc-level-{level}"
                break
    if len(boundaries) < 3:
        candidate = heading_boundaries(doc)
        if len(candidate) >= 3:
            boundaries = candidate
            mode = "heading-regex"
    if len(boundaries) < 3:
        step = args.pages_per_chunk
        boundaries = [(f"pp.{i + 1}-{min(i + step, doc.page_count)}", i) for i in range(0, doc.page_count, step)]
        mode = f"page-chunks-{step}"

    # ---- 写章节文本 ----
    chapters = []
    front = page_text(doc, 0, boundaries[0][1])
    if front:
        (chapters_dir / "00-front.txt").write_text(front, encoding="utf-8")
        chapters.append({"n": 0, "title": "(前置: 封面/序/目录)", "file": "00-front.txt",
                        "start_page": 1, "end_page": boundaries[0][1], "chars": len(front)})

    for idx, (title, start) in enumerate(boundaries):
        end = boundaries[idx + 1][1] if idx + 1 < len(boundaries) else doc.page_count
        text = page_text(doc, start, end)
        fname = f"{idx + 1:02d}-{safe_filename(title)}.txt"
        (chapters_dir / fname).write_text(text, encoding="utf-8")
        chapters.append({"n": idx + 1, "title": title, "file": fname,
                        "start_page": start + 1, "end_page": end, "chars": len(text)})

    total_chars = sum(c["chars"] for c in chapters)
    meta = {
        "source": str(book_path),
        "title_guess": title_guess,
        "slug": slug,
        "pages": doc.page_count,
        "split_mode": mode,
        "total_chars": total_chars,
        "chapters": chapters,
    }
    (out_root / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    # ---- 汇报 ----
    print(f"书名(猜测): {title_guess}")
    print(f"页数: {doc.page_count} | 切章方式: {mode} | 总字符: {total_chars}")
    print(f"输出: {out_root}")
    print(f"{'序':>3} {'页码':>9} {'字符':>8}  标题")
    for c in chapters:
        print(f"{c['n']:>3} {str(c['start_page']) + '-' + str(c['end_page']):>9} {c['chars']:>8}  {c['title'][:50]}")
    if total_chars < doc.page_count * 100:
        print("\n⚠️ 平均每页字符过少：可能是扫描版 PDF（图片无文本层），需要 OCR 后再处理。")


if __name__ == "__main__":
    main()
