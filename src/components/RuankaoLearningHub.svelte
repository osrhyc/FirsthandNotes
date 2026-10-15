<script lang="ts">
  import { onMount, tick } from "svelte";
  import RuankaoFoundationLesson from "./RuankaoFoundationLesson.svelte";
  import { FOUNDATION_LESSONS } from "@/data/ruankao-foundations";
  import { TEXTBOOK_CHAPTERS, CATALOG_URL } from "@/data/ruankao-chapters";
  import { TEXTBOOK_UNIT_INDEX, TEXTBOOK_COVERAGE, textbookUnitUrl, unitsForSection } from "@/data/ruankao-textbook-index";
  import { STUDY_WEEKS } from "@/data/ruankao-plan";
  import { STUDY_RESOURCES, EXAM_FACTS, VERIFIED_ON } from "@/data/ruankao-resources";
  import { STORAGE_KEY, TOTAL_DAYS, TASK_MINUTES, emptyRecord, initialProgress, isComplete, nextStudyDay, parseProgress, reviewDate, localDate, type StudyProgress, type Mastery } from "@/utils/ruankao-progress";

  let progress = initialProgress();
  let ready = false;
  let selectedDay = 1;
  let tab = "chapters";
  let message = "";
  let storageError = "";
  let pendingImport: StudyProgress | null = null;
  let importInput: HTMLInputElement;
  let today = localDate();
  let foundationIndex = 0;
  let dayHeading: HTMLHeadingElement | undefined;
  const weekChapters: number[][] = [[2, 6], [2], [2], [2, 17], [6], [6], [5], [2, 5], [5, 9], [1, 2, 7], [7, 13, 15], [8], [6, 15, 19], [13, 14, 15], [11, 14], [4, 18], [3, 11, 16], [2], [6, 8, 13], [12, 15, 18], [20], [20], [2, 5, 6], [7, 8, 9, 10], [20], [20], [20], [20]];
  $: relatedUnits = TEXTBOOK_UNIT_INDEX.filter(unit => weekChapters[week.week - 1].includes(unit.chapter));
  const firstWeekSections = [["2.1", "2.2", "2.3.1"], [], ["2.3.2"], ["2.2.2", "2.2.3"], ["2.3.5", "2.5.4"], ["2.3.3", "6.1", "6.2"], ["2.1", "2.3.2", "2.3.3"]];
  $: suggestedUnits = selectedDay <= 7 ? [...new Map(firstWeekSections[selectedDay - 1].flatMap(unitsForSection).map(unit => [unit.id, unit])).values()] : relatedUnits;
  $: coveredChapters = new Set(TEXTBOOK_UNIT_INDEX.map(unit => unit.chapter)).size;

  const tabs = [{ id: "chapters", label: "章节学习" }, { id: "today", label: "日计划与笔记" }, { id: "plan", label: "28 周参考路线" }, { id: "resources", label: "资料与考试" }, { id: "records", label: "学习记录" }];
  const masteryLabels: Record<Mastery, string> = { "": "未自评", weak: "还不熟 · 明天复习", okay: "基本理解 · 3 天后", good: "能独立解释 · 7 天后" };
  $: week = STUDY_WEEKS[Math.floor((selectedDay - 1) / 7)];
  $: focus = week.days[(selectedDay - 1) % 7];
  $: minutes = focus.taskMinutes || TASK_MINUTES;
  $: storedRecord = progress.records[selectedDay] || emptyRecord();
  $: record = { ...storedRecord, tasks: storedRecord.tasks.map((done, index) => minutes[index] === 0 || done) };
  $: taskCount = minutes.filter(value => value > 0).length;
  $: doneTasks = record.tasks.filter((done, index) => done && minutes[index] > 0).length;
  $: completedDays = Object.values(progress.records).filter(isComplete).length;
  $: nextDay = nextStudyDay(progress);
  $: percent = Math.round(completedDays / TOTAL_DAYS * 100);
  $: dueDays = Object.entries(progress.records).filter(([, r]) => r.mastery && r.reviewOn && r.reviewOn <= today).map(([day]) => Number(day)).sort((a, b) => a - b);
  $: historyDays = Object.keys(progress.records).map(Number).sort((a, b) => b - a);
  $: tasks = focus.taskMinutes ? [
    { title: "回忆与口述", detail: "按下方学习卡中的回忆、口述和检查安排执行；将无法独立解释的概念记入笔记。" },
    { title: "主题学习与准备", detail: "按本日学习卡定位材料、准备提纲或核对要求。具体时间细分见下方知识要点。" },
    { title: "计时题目训练", detail: `按本日学习卡准备题组并连续作答 ${minutes[2]} 分钟，到点保留原稿和未完成项。自测题用来检查理解，正式计时题组使用正版试题资料。` },
    { title: "完成本日作品", detail: focus.output },
    { title: "订正与复盘", detail: "按本日要点分配评改、订正和回测的时间，记录具体错因与改进方法，再完成掌握度自评。" },
  ] : [
    { title: "回忆与复习", detail: selectedDay === 1 ? "先不查资料：画出你理解的计算机组成，并写下目前最陌生的 3 个基础概念。" : "闭卷回忆上一学习日的 3 个要点，再从到期复习中选最多 2 项口述；答不出的记到下方笔记。" },
    { title: "学习今天的主题", detail: `按“${focus.title}”查阅 ${week.material.replace(/[。；]$/, "")}。围绕下方要点精读；用自己的话解释，遇到陌生词先标记。` },
    { title: "自测与题目训练", detail: "先独立回答下方原创自测，再对照解析。剩余时间从正版试题书中选 3–5 道相关题；暂未购书时，把要点各改写为一道问答并作答。" },
    { title: "留下可检查的产出", detail: focus.output },
    { title: "复盘与安排复习", detail: "记录一个错误或疑问、一个适用条件，再完成掌握度自评。五项都勾选且已自评，才算完成这一天。" },
  ];

  onMount(() => {
    const requestedTab = new URLSearchParams(window.location.search).get("tab");
    if (tabs.some(item => item.id === requestedTab)) tab = requestedTab!;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) progress = parseProgress(JSON.parse(saved));
    } catch {
      storageError = "原学习记录暂时无法读取。已显示空白计划；修改后会写入新的记录，请先导出原始备份以保留旧数据。";
    }
    selectedDay = nextStudyDay(progress);
    ready = true;
    const refreshDate = () => { today = localDate(); };
    const syncProgress = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        progress = parseProgress(JSON.parse(event.newValue));
        message = "已同步另一标签页的学习记录。";
      } catch {
        storageError = "另一标签页写入了无法识别的记录，当前学习内容已保留，请先导出备份。";
      }
    };
    window.addEventListener("focus", refreshDate);
    window.addEventListener("storage", syncProgress);
    const clock = window.setInterval(refreshDate, 60000);
    return () => { window.removeEventListener("focus", refreshDate); window.removeEventListener("storage", syncProgress); window.clearInterval(clock); };
  });

  function persist() {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      storageError = "";
    } catch {
      storageError = "浏览器未能保存本次修改。当前页面仍保留记录，请先导出备份，避免关闭后丢失。";
    }
  }
  function updateRecord(update: Partial<typeof record>) {
    progress = { ...progress, records: { ...progress.records, [selectedDay]: { ...record, ...update } } };
    persist();
  }
  function toggleTask(index: number) {
    const nextTasks = [...record.tasks];
    nextTasks[index] = !nextTasks[index];
    updateRecord({ tasks: nextTasks });
    message = isComplete(progress.records[selectedDay]) ? `第 ${selectedDay} 天已完成。可以继续下一学习日，也可以先休息。` : "";
  }
  function rate(mastery: Mastery) {
    today = localDate();
    updateRecord({ mastery, reviewOn: reviewDate(mastery, today) });
    message = `已安排复习：${reviewDate(mastery, today)}。`;
  }
  async function selectDay(day: number) {
    selectedDay = Math.max(1, Math.min(TOTAL_DAYS, day));
    tab = "today";
    message = "";
    await tick();
    dayHeading?.focus({ preventScroll: true });
    dayHeading?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function download(content: string, filename: string, type = "application/json") {
    const objectUrl = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = objectUrl; link.download = filename; link.click();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }
  function exportProgress() {
    download(JSON.stringify(progress, null, 2), `ruankao-progress-${localDate()}.json`);
    message = "已导出学习记录备份。";
  }
  function exportRaw() {
    try { download(localStorage.getItem(STORAGE_KEY) || "{}", `ruankao-original-${localDate()}.json`); }
    catch { message = "浏览器不允许读取存储，无法导出原始数据。"; }
  }
  async function importProgress(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    pendingImport = null;
    if (!file) return;
    try {
      if (file.size > 32_000_000) throw new Error("备份文件过大，请选择本模块导出的 JSON 文件。");
      pendingImport = parseProgress(JSON.parse(await file.text()));
      message = "备份校验通过。确认后将替换本浏览器的软考记录。";
    } catch (error) { message = error instanceof Error ? error.message : "备份读取失败。"; }
    input.value = "";
  }
  function confirmImport() {
    if (!pendingImport) return;
    progress = pendingImport;
    pendingImport = null;
    persist();
    selectDay(nextStudyDay(progress));
    message = "已导入学习记录。";
  }
  function exportFeedback() {
    const text = `软考学习反馈｜第 ${selectedDay} 天：${focus.title}\n完成：${doneTasks}/${taskCount} 项\n自评：${masteryLabels[record.mastery]}\n\n我的回答、产出与疑问：\n${record.note || "（还未填写）"}\n\n请根据我的回答纠错，并引导下一步学习；不要直接跳过我不理解的部分。`;
    download(text, `ruankao-day-${selectedDay}-feedback.txt`, "text/plain;charset=utf-8");
    message = "已导出本日反馈，可将文字发回当前对话继续辅导。";
  }
</script>

<div class="rk-hub" data-pagefind-body>
  <header class="rk-hero">
    <div class="rk-hero-copy">
      <p class="rk-eyebrow">2027 备考计划 · 高级资格</p>
      <h1>系统架构设计师</h1>
      <p class="rk-hero-desc">每天两小时，把开发经验练成架构能力。</p>
      <div class="rk-hero-tags"><span>第一轮 · 按章学全</span><span>第二轮 · 补弱抓重点</span></div>
      <p class="rk-policy">目标：2027 上半年，如开考则参加。日期与报名安排待官方确认。</p>
    </div>
    <div class="rk-progress-summary">
      <span class="rk-label">当前主线 · 第一轮章节学习</span>
      <div class="rk-progress-number">20<span> 章 · 按小节推进</span></div>
      <div class="rk-progress-caption"><span>每天 2 小时</span><span>先理解，再练习</span></div>
      {#if TEXTBOOK_UNIT_INDEX.length}<a class="rk-gold-button" href={textbookUnitUrl(TEXTBOOK_UNIT_INDEX[0].id)} data-no-swup>从第 1 章开始<span aria-hidden="true"> →</span></a>{/if}
    </div>
  </header>

  <nav class="rk-tabs" aria-label="软考模块栏目" data-pagefind-ignore>
    {#each tabs as item}<button class:active={tab === item.id} aria-pressed={tab === item.id} on:click={() => { tab = item.id; message = ""; }}>{item.label}</button>{/each}
  </nav>
  {#if !ready}<p class="rk-notice">正在载入本地进度。课程可直接阅读；启用 JavaScript 后可打卡和保存笔记。</p>{/if}
  {#if storageError}<div class="rk-notice" role="alert">{storageError} <button class="rk-inline-button" on:click={exportRaw}>导出原始备份</button></div>{/if}
  <p class="rk-message" role="status" aria-live="polite">{message}</p>

  {#if tab === "today"}
    <section class="rk-card"><p class="rk-kicker">补充工具 · 按需使用</p><h2>日计划与学习笔记</h2><p class="rk-muted">当前主线是按教材章节通读。这里保留原 28 周专题计划和笔记，供查漏、记录错因与后续训练使用，不需要与章节学习同时完成两套任务。</p><p class="rk-small">专题计划已完成 {completedDays} / {TOTAL_DAYS} 天（{percent}%）。这不是教材阅读进度。</p><button class="rk-inline-button" on:click={() => tab = "chapters"}>返回章节学习 →</button></section>
    <div class="rk-learning-grid">
      <div class="rk-main-column">
        <section class="rk-card">
          <div class="rk-section-top"><p class="rk-kicker">第 {week.week} 周 · {week.phase}</p><span class="rk-pill">{isComplete(record) ? "本日已完成" : "计划 120 分钟"}</span></div>
          <h2 bind:this={dayHeading} tabindex="-1">Day {String(selectedDay).padStart(2, "0")} <span class="rk-title-separator">/</span> {focus.title}</h2>
          <p class="rk-muted">{week.goal}</p>
          <div class="rk-day-nav" data-pagefind-ignore>
            <button disabled={selectedDay === 1} on:click={() => selectDay(selectedDay - 1)}>← 前一天</button>
            <span>第 {selectedDay} / {TOTAL_DAYS} 学习日</span>
            <button disabled={selectedDay === TOTAL_DAYS} on:click={() => selectDay(selectedDay + 1)}>后一天 →</button>
          </div>
          <p class="rk-small">学习日按完成情况推进。中断后接着学，不会因日期变化跳过内容。</p>
        </section>

        <section class="rk-card">
          <div class="rk-section-top"><h3>{focus.taskMinutes ? "本日计时安排" : "今天的五件事"}</h3><span class="rk-small">{doneTasks} / {taskCount} 完成</span></div>
          {#if focus.taskMinutes}<p class="rk-small">本日用专题计时安排替换日常五步，总计 120 分钟。长篇作答的详细评改安排在后续学习日；完成后仍需自评。</p>{/if}
          <div class="rk-task-list">
            {#each tasks as task, i}
              {#if minutes[i] > 0}
              <label class="rk-task" class:checked={record.tasks[i]}>
                <input type="checkbox" checked={record.tasks[i]} disabled={!ready} on:change={() => toggleTask(i)} />
                <span class="rk-task-content"><span class="rk-task-title">{task.title}<small>{minutes[i]} 分钟</small></span><span class="rk-task-detail">{task.detail}</span></span>
              </label>
              {/if}
            {/each}
          </div>
          {#if isComplete(record) && completedDays < TOTAL_DAYS}<button class="rk-primary-button" on:click={() => selectDay(nextDay)}>进入下一待学日 →</button>{/if}
        </section>

        <section class="rk-card">
          <p class="rk-kicker">理解 → 自测 → 输出</p><h3>本日学习卡</h3>
          <ul class="rk-point-list">{#each focus.points as point}<li>{point}</li>{/each}</ul>
          {#if suggestedUnits.length}<div class="rk-textbook-suggestions"><span class="rk-kicker">{selectedDay <= 7 ? "今日关联教材" : "本周关联教材"} · 原 PDF 精读</span><p class="rk-small">从下列单元选择与今天主题相关的一组小节，纳入学习时段；练习题随单元提供。长单元可以分天读。</p><details class="rk-details" open={selectedDay <= 7}><summary>查看 {suggestedUnits.length} 个关联教材单元</summary>{#each suggestedUnits as unit}<a href={textbookUnitUrl(unit.id)} data-no-swup><strong>{unit.title}</strong><span>教材 {unit.sectionIds.join("、")} · 书内 {unit.printedStart}—{unit.printedEnd} 页 ↗</span></a>{/each}</details></div>{/if}
          {#if selectedDay <= FOUNDATION_LESSONS.length}
            {#key selectedDay}<RuankaoFoundationLesson lesson={FOUNDATION_LESSONS[selectedDay - 1]} />{/key}
          {/if}
          {#key selectedDay}
            <div class="rk-question"><span class="rk-kicker">原创自测 · 非历年真题</span><p>{focus.question}</p><details class="rk-details"><summary>先自己作答，再查看参考解析</summary><p class="rk-answer">{focus.answer}</p></details></div>
          {/key}
          <div class="rk-output"><strong>今天要留下的成果</strong><p>{focus.output}</p></div>
          <p class="rk-small">学习卡是原创导学，不代替完整教材。后续主题按资料栏中的教材与官方文档扩展。</p>
        </section>

        <section class="rk-card" data-pagefind-ignore>
          <h3>写下你的回答与疑问</h3>
          <p class="rk-muted">记录题目来源、错误原因、案例要点或论文片段。真实项目与练习设定请分开标注。</p>
          <label class="rk-sr-only" for="rk-note">第 {selectedDay} 天学习笔记</label>
          <textarea id="rk-note" rows="7" maxlength="20000" disabled={!ready} value={record.note} on:input={(event) => updateRecord({ note: event.currentTarget.value })} placeholder="我的回答：&#10;今天的产出：&#10;还不理解的地方："></textarea>
          <p class="rk-small">本地自动保存 · {record.note.length} / 20000 字符</p>
          <fieldset class="rk-rating" disabled={!ready}><legend>离开前，诚实评估掌握程度</legend><div class="rk-rating-options">{#each ["weak", "okay", "good"] as value}<button class:selected={record.mastery === value} aria-pressed={record.mastery === value} on:click={() => rate(value as Mastery)}>{masteryLabels[value as Mastery]}</button>{/each}</div></fieldset>
          {#if record.reviewOn}<p class="rk-small">下次复习：{record.reviewOn}。复习后重新自评即可安排下一次。</p>{/if}
          <button class="rk-secondary-button" disabled={!ready} on:click={exportFeedback}>导出本日反馈，继续对话辅导 ↗</button>
        </section>
      </div>
      <aside class="rk-aside">
        <section class="rk-card rk-week-card"><p class="rk-kicker">本周路线</p><h3>{week.title}</h3><ol class="rk-week-days">{#each week.days as day, i}{@const number = (week.week - 1) * 7 + i + 1}<li><button class:current={number === selectedDay} on:click={() => selectDay(number)} aria-current={number === selectedDay ? "step" : undefined}><span class="rk-day-number">{isComplete(progress.records[number]) ? "✓" : String(number).padStart(2, "0")}</span><span>{day.title}</span></button></li>{/each}</ol><button class="rk-inline-button" on:click={() => tab = "plan"}>查看完整 28 周 →</button></section>
        <section class="rk-card"><div class="rk-section-top"><h3>到期复习</h3><span class="rk-pill">{dueDays.length} 项</span></div><p class="rk-small">每天先选 1–2 项回忆，重新自评后安排下一次复习。</p>{#if dueDays.length}<ul class="rk-review-list">{#each dueDays.slice(0, 5) as day}<li><button on:click={() => selectDay(day)}>Day {day} · {STUDY_WEEKS[Math.floor((day - 1) / 7)].days[(day - 1) % 7].title}<span>复习 →</span></button></li>{/each}</ul>{:else}<p class="rk-muted rk-empty">暂时没有到期内容。完成自评后，复习会出现在这里。</p>{/if}{#if dueDays.length > 5}<button class="rk-inline-button" on:click={() => tab = "records"}>查看全部 {dueDays.length} 项 →</button>{/if}</section>
        <section class="rk-card rk-reading-card"><p class="rk-kicker">本周材料</p><p>{week.material}</p><p class="rk-small">优先大纲和教程，再做对应试题。免费技术文档用于理解具体问题。</p><button class="rk-inline-button" on:click={() => tab = "resources"}>打开资料清单 ↗</button></section>
      </aside>
    </div>
  {:else if tab === "chapters"}
    <section class="rk-card"><p class="rk-kicker">第一轮 · 当前学习主线</p><h2>按章节，把知识点完整过一遍</h2><p class="rk-muted">从第 1 章开始，依次学习每章、每小节：先看概念和例子，再闭卷复述，最后做随堂题。先建立完整的知识框架，不按考点热度跳过章节；遇到难点先写清疑问，保留到第二轮深入练习。</p><div class="rk-first-pass"><div><strong>15 分钟 · 回忆</strong><p>复述昨天的 3 个知识点，回看一道错题。</p></div><div><strong>70 分钟 · 章节学习</strong><p>顺着目录读一组小节，标出概念、区别和适用条件。</p></div><div><strong>25 分钟 · 随堂练习</strong><p>选做对应单元的 3–5 道题或一项实践，对照解析说明依据。</p></div><div><strong>10 分钟 · 留下记录</strong><p>记下读到的小节、错因和疑问，作为第二轮依据。</p></div></div><p class="rk-small">合计 120 分钟。长单元可以分天读，每天都保留练习；已会的内容仍快速复述确认。第一轮完成标准是全书知识点均已接触，并能区分“已理解”和“待加强”。</p><p class="rk-small">教材目录对照<a href={CATALOG_URL} target="_blank" rel="noopener noreferrer">出版社公开目录 ↗</a>；正文依据用户提供的原 PDF 页面整理，弃用损坏的 OCR。目前已整理 {TEXTBOOK_UNIT_INDEX.length} / {TEXTBOOK_COVERAGE.totalUnits} 个精读单元，涉及 {coveredChapters} 章。这是资料整理进度，不是你的阅读完成度。{#if TEXTBOOK_UNIT_INDEX.length === TEXTBOOK_COVERAGE.totalUnits}全书单元均已开放，可从第 1 章依次学习。{:else}其余单元仍待整理。{/if}</p></section>
    <details class="rk-card rk-details"><summary>第二轮怎么练 · 首轮通读后再开始</summary><div class="rk-plan-notes"><p><strong>先补薄弱点</strong><br />按错题和闭卷复述结果，优先处理反复出错、解释不清的概念；回看对应小节，再换题验证。</p><p><strong>再练高频与高分值主题</strong><br />依据可核验的历年试题、题目分值和当年大纲安排训练。先补“薄弱且常考”的交集，不凭经验编造占比。</p><p><strong>最后做综合训练</strong><br />把知识迁移到案例、论文与计时模拟中。只做对原题不算掌握，要能解释理由和换情境应用。</p></div><p class="rk-small">具体考点权重待按科目、年份和试题来源统计后确定；当前不提供未经核验的占比分配。现有练习不会自动汇总薄弱点，请保留错因与自评记录。</p></details>
    <section class="rk-card rk-catalog"><h3>教程第 2 版 · 章与二级小节目录</h3><p class="rk-muted">这里列出 20 章、119 个二级小节。精读单元内继续展开三级知识点；长小节拆为多个单元。点击课程进入讲解与练习，按小节顺序继续学习。</p><div class="rk-roadmap">{#each TEXTBOOK_CHAPTERS as chapter}<details class="rk-details"><summary>第 {chapter.number} 章 · {chapter.title}</summary><ul class="rk-catalog-sections">{#each chapter.sections as section}{@const sectionUnits = unitsForSection(section.id)}{@const coverage = TEXTBOOK_COVERAGE.sections.find(item => item.id === section.id)}<li><div><span>{section.id}</span> {section.title} <small class="rk-coverage">{coverage?.completed || 0}/{coverage?.total || 0} 单元</small></div>{#if sectionUnits.length}<div class="rk-unit-links">{#each sectionUnits as unit}<a href={textbookUnitUrl(unit.id)} data-no-swup>{unit.title}<small>书内 {unit.printedStart}—{unit.printedEnd} 页 · {unit.questionCount} 道练习 →</small></a>{/each}</div>{:else}<small class="rk-pending">原 PDF 待逐页整理</small>{/if}</li>{/each}</ul></details>{/each}</div></section>
    <details class="rk-card rk-details rk-supplement"><summary>课前基础补充 · 7 篇原创入门课</summary>
    <div class="rk-learning-grid">
      <section class="rk-card">{#key foundationIndex}<RuankaoFoundationLesson lesson={FOUNDATION_LESSONS[foundationIndex]} />{/key}<button class="rk-primary-button" on:click={() => selectDay(foundationIndex + 1)}>进入对应学习日，记录答案 →</button></section>
      <aside class="rk-aside"><section class="rk-card"><h3>课前基础补充（原创）</h3><ol class="rk-week-days">{#each FOUNDATION_LESSONS as lesson, i}<li><button class:current={foundationIndex === i} aria-current={foundationIndex === i ? "step" : undefined} on:click={() => foundationIndex = i}><span class="rk-day-number">{String(i + 1).padStart(2, "0")}</span><span>{lesson.title}</span></button></li>{/each}</ol></section></aside>
    </div>
    </details>
  {:else if tab === "plan"}
    <section class="rk-card"><p class="rk-kicker">参考任务库 · 配合两轮学习使用</p><h2>通读后，按弱项选择专题训练</h2><p class="rk-muted">当前优先按教材章节学全知识点。以下保留原 28 周专题路线：第一轮仅按需补充解释与练习，第二轮再根据错题和重点选择任务，不要求另起一套 196 天计划。周次不等于官方考期倒计时。</p><div class="rk-plan-notes"><p><strong>每天仍以 2 小时为限</strong><br />章节阅读与专题任务共用当天时间，不叠加两份任务量。</p><p><strong>通读后补弱抓重点</strong><br />先补薄弱概念，再依据有来源的试题统计强化高频与高分值主题，穿插案例与论文。</p><p><strong>考前安排完整机考模拟</strong><br />日常 2 小时只能分段训练。考前建议另留整块 4 小时连考，再按当次安排练 2 小时论文。</p></div></section>
    <div class="rk-roadmap">{#each STUDY_WEEKS as item}<section class="rk-card"><div class="rk-section-top"><span class="rk-kicker">W{String(item.week).padStart(2, "0")} · {item.phase}</span><span class="rk-small">{item.days.filter((_, i) => isComplete(progress.records[(item.week - 1) * 7 + i + 1])).length}/7 天</span></div><h3>{item.title}</h3><p class="rk-muted">{item.goal}</p><details class="rk-details"><summary>展开 7 天任务</summary><ol class="rk-plan-days">{#each item.days as day, i}{@const number = (item.week - 1) * 7 + i + 1}<li><button on:click={() => selectDay(number)}><span>Day {number}</span>{day.title}<span aria-hidden="true"> →</span></button></li>{/each}</ol></details></section>{/each}</div>
  {:else if tab === "resources"}
    <section class="rk-card"><p class="rk-kicker">资料核验：{VERIFIED_ON}</p><h2>先有一条主线，再按需补充</h2><p class="rk-muted">先准备考试大纲、教程与官方试题解析。尚未购书，也可以从今日学习卡和出版社公开样章开始。</p><p class="rk-small">以下为本次能核实的版本。2027 如有新大纲、新教材或新考务通知，应据此调整；再印不等于改版。</p></section>
    <section class="rk-card"><h3>资料来源与核验范围</h3><div class="rk-facts"><article><h4>考试规则与书目信息</h4><p>依据考试主管部门公告与出版社页面整理，每条附原始链接。现有考试规则用于备考参考，2027 年安排仍需当次官方通知确认。</p></article><article><h4>讲解、计划与题目</h4><p>28 周路线、课前基础补充与每日自测为原创导学。教材精读单元另以原 PDF 逐页阅读，附章节与页码；单元中的辅助例子和题目仍为原创，不是官方真题或官方答案。</p></article><article><h4>2026-10-14 内容复核</h4><p>原有 7 篇基础课、16 道选择题与 196 条每日自测已作初步复核。新增教材精读根据原 PDF 整理，图表与公式回看原页；教材中的版本差异或疑问另作校注。AI 整理不等于考试机构审定。</p></article></div><p class="rk-small">功能检查与构建通过只验证页面和数据结构，不证明知识全部正确。学习以正版教材、大纲和官方试题解析为主线，原创内容用于辅助理解与练习。</p></section>
    {#each ["主线资料", "免费补充", "官方入口"] as kind}<section class="rk-card"><h3>{kind}</h3><div class="rk-resource-list">{#each STUDY_RESOURCES.filter(item => item.kind === kind) as resource}<article class="rk-resource"><a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.title}<span aria-hidden="true"> ↗</span></a><p>{resource.detail}</p>{#if resource.isbn}<p class="rk-small">ISBN {resource.isbn}</p>{/if}<p class="rk-resource-use">怎么用：{resource.usage}</p></article>{/each}</div></section>{/each}
    <section class="rk-card"><p class="rk-kicker">现行规则作参考，2027 以当次通知为准</p><h3>先读清考试要求</h3><div class="rk-facts">{#each EXAM_FACTS as fact}<article><h4>{fact.title}</h4><p>{fact.detail}</p><a href={fact.url} target="_blank" rel="noopener noreferrer">{fact.source} ↗</a></article>{/each}</div><p class="rk-small">报名省市尚未确定，属地要求、费用和报名窗口需按本人报考地的通知核验。官方机考模拟平台的开放时间和资格以当次公告为准。</p></section>
  {:else}
    <section class="rk-card" data-pagefind-ignore><p class="rk-kicker">把学习成果留在自己手里</p><h2>学习记录与备份</h2><p class="rk-muted">进度和笔记仅保存在当前浏览器，换设备、清理浏览器或切换站点地址不会自动同步。定期导出备份，可在另一台设备导入继续学。</p><div class="rk-backup-actions"><button class="rk-primary-button" disabled={!ready} on:click={exportProgress}>导出学习记录</button><button class="rk-secondary-button" disabled={!ready} on:click={() => importInput.click()}>导入备份</button><input class="rk-sr-only" type="file" accept="application/json,.json" bind:this={importInput} on:change={importProgress} aria-label="选择学习记录备份" /></div>{#if pendingImport}<div class="rk-import-confirm"><p>即将替换为备份中的 {Object.keys(pendingImport.records).length} 天记录。建议先导出当前记录。</p><button class="rk-primary-button" on:click={confirmImport}>确认导入并替换</button><button class="rk-secondary-button" on:click={() => { pendingImport = null; message = "已取消导入。"; }}>取消</button></div>{/if}</section>
    {#if dueDays.length}<section class="rk-card"><h3>全部到期复习 · {dueDays.length} 项</h3><div class="rk-record-list">{#each dueDays as day}<button on:click={() => selectDay(day)}><span>Day {day} · {STUDY_WEEKS[Math.floor((day - 1) / 7)].days[(day - 1) % 7].title}</span><small>{progress.records[day].reviewOn} 到期 →</small></button>{/each}</div></section>{/if}
    <section class="rk-card"><h3>已开始的学习日</h3>{#if historyDays.length}<div class="rk-record-list">{#each historyDays as day}<button on:click={() => selectDay(day)}><span>Day {day} · {STUDY_WEEKS[Math.floor((day - 1) / 7)].days[(day - 1) % 7].title}</span><small>{isComplete(progress.records[day]) ? "已完成" : "学习中"} · {masteryLabels[progress.records[day].mastery]} →</small></button>{/each}</div>{:else}<p class="rk-muted rk-empty">还没有学习记录。从第 1 天写下第一份答案开始。</p><button class="rk-inline-button" on:click={() => selectDay(1)}>进入第 1 天 →</button>{/if}</section>
  {/if}
  <footer class="rk-footer">每天知道学什么，学完留下自己的答案。<span>本模块提供静态导学与自评；对话辅导请将本日反馈发回当前任务。</span></footer>
</div>

<style>
  .rk-first-pass{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin:22px 0}.rk-first-pass>div{padding:16px;border:1px solid var(--line-divider);border-top:2px solid #d99a20;border-radius:8px;background:var(--btn-plain-bg-hover)}.rk-first-pass strong{font-size:13px;color:var(--text-90)}.rk-first-pass p{font-size:12px;color:var(--text-50);margin-top:8px}.rk-progress-summary a{display:block;text-align:center}@media(max-width:850px){.rk-first-pass{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:450px){.rk-first-pass{grid-template-columns:1fr}}
  .rk-textbook-suggestions{border:1px solid #dfc995;background:var(--btn-plain-bg-hover);padding:20px;border-radius:10px;margin:20px 0}.rk-textbook-suggestions a{display:block;border-top:1px solid var(--line-divider);padding:12px 0;color:var(--text-90)}.rk-textbook-suggestions a span{display:block;font-size:12px;color:var(--btn-content);margin-top:4px}.rk-unit-links{display:grid;gap:7px;padding:7px 0 12px 32px}.rk-unit-links a{display:block;background:var(--btn-plain-bg-hover);padding:10px 14px;border-radius:7px;color:var(--text-90);font-size:13px}.rk-unit-links small{display:block;color:var(--btn-content);font-size:11px;margin-top:4px}.rk-pending{display:block;color:var(--text-50);font-size:11px;padding:3px 0 10px 32px}
  .rk-hub{--btn-content:#8b6116;--btn-regular-bg:#f6efdf;--btn-plain-bg-hover:#f5f1e8;--page-bg:#f5f4f1;background:var(--page-bg);--text-90:#263342;--text-75:#536171;--text-50:#66717d;--rk-ink:var(--brand-navy,#111d2d);--rk-gold:#d99a20;--rk-muted:var(--text-50,#66717d);color:var(--text-90,#263342);font-size:15px;line-height:1.7}
  :global(.dark) .rk-hub{--btn-content:#dfaf54;--btn-regular-bg:#2c2b25;--btn-plain-bg-hover:#202c39;--page-bg:#111d2d;background:var(--page-bg);--text-90:#e4e9ee;--text-75:#c4cdd6;--text-50:#a6b1bc}
  .rk-coverage{font-size:11px;color:var(--text-50);white-space:nowrap;margin-left:8px}.rk-catalog{margin-top:18px}.rk-supplement{margin-top:18px}.rk-supplement>.rk-learning-grid{margin-top:20px}.rk-catalog-sections{list-style:none;font-size:13px;margin-top:16px}.rk-catalog-sections li{padding:6px 0}.rk-catalog-sections span{color:var(--btn-content);margin-right:8px}.rk-small a{color:var(--btn-content)}
  .rk-hero{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:40px;background:#111d2d;color:#f5f4f1;padding:40px;border-radius:16px;border-top:3px solid #d99a20}
  .rk-eyebrow,.rk-kicker{font-size:12px;font-weight:700;letter-spacing:.09em;color:var(--btn-content);margin:0 0 10px}
  .rk-eyebrow{color:#e9b85c}.rk-hero h1{font-size:clamp(26px,3vw,36px);font-weight:800;letter-spacing:.03em;line-height:1.35;margin:0 0 12px;color:#f5f4f1}
  .rk-hero-desc{font-size:16px;color:#d1d8df;margin:0 0 20px}.rk-hero-tags{display:flex;gap:8px;flex-wrap:wrap}.rk-hero-tags span{border:1px solid #405063;color:#d5dce5;font-size:12px;padding:4px 10px;border-radius:4px}.rk-policy{margin-top:18px;font-size:12px;color:#aebbc9;max-width:480px}
  .rk-progress-summary{align-self:center;border-left:1px solid #405063;padding-left:28px}.rk-label{font-size:12px;color:#b4bfca}.rk-progress-number{font-size:46px;font-weight:700;line-height:1.5}.rk-progress-number span{font-size:13px;font-weight:400;color:#b4bfca}
  .rk-progress-caption{display:flex;justify-content:space-between;font-size:11px;color:#b4bfca;margin:8px 0 20px}
  button,a,input,textarea,summary{touch-action:manipulation}button{cursor:pointer}button:disabled{cursor:default;opacity:.45}button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible,summary:focus-visible{outline:2px solid #d99a20;outline-offset:4px}
  .rk-gold-button,.rk-primary-button,.rk-secondary-button{border-radius:7px;padding:10px 16px;font-size:13px;font-weight:600;line-height:1.5;transition:background .2s}.rk-gold-button{background:#d99a20;color:#111d2d;width:100%;display:flex;justify-content:space-between}.rk-gold-button:hover{background:#e7ad3b}.rk-primary-button{background:var(--btn-regular-bg);color:var(--btn-content);margin-top:12px}.rk-secondary-button{border:1px solid var(--line-divider);color:var(--text-75,#536171);margin-top:12px}.rk-inline-button{color:var(--btn-content);font-weight:600;font-size:13px;text-align:left}.rk-inline-button:hover{text-decoration:underline}
  .rk-tabs{display:flex;gap:26px;border-bottom:1px solid var(--line-divider);padding:0 8px;margin-top:16px;overflow:auto}.rk-tabs button{font-size:14px;white-space:nowrap;padding:16px 2px 13px;color:var(--text-50,#6c747d);border-bottom:3px solid transparent}.rk-tabs button.active{color:var(--text-90,#111d2d);font-weight:700;border-color:#d99a20}.rk-message{font-size:13px;color:var(--btn-content);margin:10px 8px;min-height:0}.rk-message:empty{margin:14px 0}.rk-notice{border:1px solid #d99a20;padding:12px 16px;border-radius:8px;font-size:13px;margin-top:12px}
  .rk-learning-grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:18px;align-items:start}.rk-main-column,.rk-aside{display:grid;gap:18px;min-width:0}.rk-card{background:var(--card-bg);border:1px solid var(--line-divider);border-radius:12px;padding:26px;min-width:0}.rk-hub>.rk-card{margin-bottom:18px}.rk-aside .rk-card{padding:22px}.rk-section-top{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:8px}.rk-section-top .rk-kicker,.rk-section-top h3{margin:0}
  h2{font-size:23px;font-weight:700;line-height:1.45;margin:0 0 10px;color:var(--text-90,#1e2a37)}h3{font-size:17px;font-weight:700;margin:0 0 12px;color:var(--text-90,#1e2a37)}h4{font-size:15px;font-weight:700}.rk-title-separator{font-weight:300;color:#b5bec8;padding:0 4px}.rk-muted{font-size:13px;color:var(--text-50,#6a737d);line-height:1.85;margin:8px 0}.rk-small{font-size:12px;color:var(--text-50,#6a737d);line-height:1.8;margin:8px 0 0}.rk-pill{font-size:11px;white-space:nowrap;background:var(--btn-regular-bg);color:var(--btn-content);padding:3px 8px;border-radius:4px}
  .rk-day-nav{display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line-divider);padding-top:16px;margin-top:18px;font-size:12px;gap:8px}.rk-day-nav button{color:var(--btn-content);padding:4px}.rk-day-nav span{color:var(--text-50,#6a737d)}.rk-task{display:flex;align-items:flex-start;gap:13px;padding:17px 0;border-bottom:1px solid var(--line-divider);cursor:pointer}.rk-task:last-child{border-bottom:0;padding-bottom:2px}.rk-task input{width:18px;height:18px;flex-shrink:0;margin-top:4px;accent-color:#b77f12}.rk-task-content{min-width:0}.rk-task-title{display:flex;gap:12px;align-items:baseline;font-size:14px;font-weight:600}.rk-task-title small{font-weight:400;color:var(--btn-content);font-size:11px;white-space:nowrap}.rk-task-detail{display:block;font-size:12px;line-height:1.85;color:var(--text-50,#6a737d);margin-top:6px}.rk-task.checked .rk-task-title{color:var(--btn-content)}
  .rk-point-list{padding-left:19px;list-style:disc;font-size:14px;margin:16px 0 20px}.rk-point-list li{margin:10px 0;padding-left:4px}.rk-details{border-top:1px solid var(--line-divider);padding-top:14px;margin-top:15px}.rk-details summary{cursor:pointer;font-size:13px;color:var(--btn-content);font-weight:600;list-style:revert}.rk-answer{font-size:14px;line-height:1.95;margin:16px 0;white-space:pre-line}.rk-question{background:var(--btn-plain-bg-hover);border-radius:8px;padding:18px;margin:20px 0}.rk-question>p{font-size:14px;margin-top:10px;white-space:pre-line}.rk-output{border-left:3px solid #d99a20;padding:3px 0 3px 16px;margin:18px 0;font-size:13px}.rk-output p{margin-top:6px;white-space:pre-line}
  textarea{width:100%;margin-top:14px;padding:14px;border:1px solid var(--line-divider);border-radius:8px;resize:vertical;background:var(--page-bg);color:var(--text-90,#263342);font:inherit;font-size:13px;line-height:1.8}.rk-rating{margin-top:24px}.rk-rating legend{font-size:13px;font-weight:600;margin-bottom:10px}.rk-rating-options{display:flex;gap:8px;flex-wrap:wrap}.rk-rating button{font-size:11px;padding:7px 9px;border:1px solid var(--line-divider);border-radius:6px;color:var(--text-50,#6a737d)}.rk-rating button.selected{border-color:#d99a20;color:var(--btn-content);background:var(--btn-regular-bg)}
  .rk-week-days{list-style:none;margin:18px 0}.rk-week-days button{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:10px 8px;border-radius:6px;font-size:12px;line-height:1.6}.rk-week-days button.current{background:var(--btn-regular-bg);color:var(--btn-content);font-weight:700}.rk-day-number{font-size:11px;min-width:24px;color:var(--text-50,#74808b);font-variant-numeric:tabular-nums}.rk-review-list{list-style:none;margin-top:10px}.rk-review-list button{font-size:12px;text-align:left;padding:9px 0;border-bottom:1px solid var(--line-divider);width:100%}.rk-review-list button span{display:block;color:var(--btn-content);font-size:11px}.rk-empty{padding:14px 0}.rk-reading-card>p:not(.rk-small):not(.rk-kicker){font-size:14px;line-height:1.9}.rk-reading-card .rk-inline-button{margin-top:18px}
  .rk-roadmap{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.rk-plan-notes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;margin-top:20px;border-top:1px solid var(--line-divider);padding-top:20px}.rk-plan-notes p{font-size:12px;color:var(--text-50,#6a737d)}.rk-plan-notes strong{font-size:14px;display:inline-block;margin-bottom:8px;color:var(--text-90,#263342)}.rk-plan-days{list-style:none;margin-top:12px}.rk-plan-days button{font-size:12px;text-align:left;width:100%;padding:8px 0;border-bottom:1px solid var(--line-divider)}.rk-plan-days button span:first-child{color:var(--btn-content);display:inline-block;min-width:65px}
  .rk-resource{padding:20px 0;border-top:1px solid var(--line-divider)}.rk-resource:first-child{border:0;padding-top:4px}.rk-resource>a{font-size:16px;font-weight:600;color:var(--btn-content)}.rk-resource p{font-size:13px;margin-top:8px;color:var(--text-50,#6a737d);line-height:1.9}.rk-resource .rk-resource-use{color:var(--text-75,#4c5966);padding-left:12px;border-left:2px solid #d99a20;margin-top:12px}.rk-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin:20px 0}.rk-facts article{padding-top:16px;border-top:1px solid var(--line-divider)}.rk-facts p{font-size:13px;color:var(--text-50,#6a737d);margin:8px 0}.rk-facts a{color:var(--btn-content);font-size:12px}
  .rk-backup-actions{display:flex;gap:12px;flex-wrap:wrap}.rk-import-confirm{border:1px solid #d99a20;padding:16px;border-radius:8px;margin-top:18px;font-size:13px}.rk-import-confirm button{margin-right:12px}.rk-record-list{margin-top:12px}.rk-record-list button{display:flex;justify-content:space-between;text-align:left;align-items:baseline;gap:18px;width:100%;font-size:14px;padding:16px 0;border-top:1px solid var(--line-divider)}.rk-record-list small{color:var(--btn-content);font-size:11px;flex-shrink:0}.rk-footer{padding:30px 16px;text-align:center;color:var(--text-50,#6a737d);font-size:12px}.rk-footer span{display:block;font-size:11px;margin-top:7px}.rk-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
  @media(min-width:1100px){.rk-aside{position:sticky;top:18px}}
  @media(max-width:850px){.rk-learning-grid{grid-template-columns:minmax(0,1fr) 250px}.rk-hero{padding:30px;gap:20px;grid-template-columns:minmax(0,1fr) 235px}.rk-card{padding:22px}.rk-aside .rk-card{padding:18px}}
  @media(max-width:680px){.rk-hero{grid-template-columns:1fr;padding:26px 22px;gap:24px;border-radius:12px}.rk-progress-summary{border-left:0;border-top:1px solid #405063;padding:18px 0 0}.rk-progress-number{font-size:36px}.rk-progress-caption{margin-bottom:14px}.rk-hero-desc{font-size:14px}.rk-policy{margin-top:14px}.rk-hero-tags span{font-size:11px}.rk-learning-grid{grid-template-columns:1fr}.rk-aside{grid-row:2}.rk-tabs{gap:22px;padding:0 16px}.rk-tabs button{font-size:13px}.rk-card{padding:22px 18px}.rk-roadmap,.rk-plan-notes,.rk-facts{grid-template-columns:1fr}.rk-plan-notes{gap:16px}.rk-roadmap{gap:12px}h2{font-size:20px}.rk-record-list button{display:block}.rk-record-list small{display:block;margin-top:6px}.rk-message{padding:0 8px}}
</style>
