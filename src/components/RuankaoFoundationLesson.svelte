<script lang="ts">
  import type { FoundationLesson } from "@/data/ruankao-foundations";
  export let lesson: FoundationLesson;
  let choices: Record<number, number> = {};
  $: answered = Object.keys(choices).length;
  $: correct = lesson.questions.filter((question, index) => choices[index] === question.correct).length;
</script>
<section class="foundation">
  <p class="eyebrow">原创基础讲解 · {lesson.section}</p>
  <h3>{lesson.title}</h3>
  <div class="explanation">{#each lesson.explanation as paragraph}<p>{paragraph}</p>{/each}</div>
  <div class="example"><strong>用一个例子想明白</strong><p>{lesson.example}</p></div>
  <div class="exercise-header"><h4>马上练一练</h4><span>{answered}/{lesson.questions.length} 已答 · {correct} 题正确</span></div>
  {#each lesson.questions as question, index}
    <fieldset class="question"><legend>{index + 1}. {question.prompt}</legend><div class="options">{#each question.options as option, i}<button class:chosen={choices[index] === i} class:right={choices[index] !== undefined && question.correct === i} class:wrong={choices[index] === i && i !== question.correct} aria-pressed={choices[index] === i} on:click={() => { choices = { ...choices, [index]: i }; }}><span>{String.fromCharCode(65 + i)}</span>{option}</button>{/each}</div>{#if choices[index] !== undefined}<p class="feedback" role="status"><strong>{choices[index] === question.correct ? "答对了。" : "再看一下原因。"}</strong>{question.explanation}</p>{/if}</fieldset>
  {/each}
  {#if answered}<button class="retry" on:click={() => choices = {}}>清空选择，重新作答</button>{/if}
  <div class="practice"><h4>把概念用起来</h4><p>{lesson.practice}</p><details><summary>完成后查看参考思路</summary><p>{lesson.practiceAnswer}</p></details></div>
  <p class="source">相关原始资料：<a href={lesson.sourceUrl} target="_blank" rel="noopener noreferrer">技术文档 ↗</a>{#each lesson.additionalSources ?? [] as source} · <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a>{/each}。链接用于核对相关概念，不是整课逐句出处。以上题目为原创练习，答题选择仅保留在当前学习卡；重要错题请记入本日笔记。</p>
</section>
<style>
  .foundation{font-size:14px;line-height:1.95}.eyebrow{font-size:11px;color:var(--btn-content);margin-bottom:8px}h3{font-size:20px;font-weight:700;margin-bottom:20px;color:var(--text-90,#263342)}h4{font-size:15px;font-weight:700}p{white-space:pre-line}.explanation p{margin:14px 0}.example{border-left:3px solid #d99a20;padding:14px 18px;background:var(--btn-plain-bg-hover);border-radius:0 8px 8px 0;margin:22px 0}.example p{margin-top:8px}.exercise-header{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:12px}.exercise-header span{font-size:11px;color:var(--btn-content)}.question{margin:20px 0;padding:0}.question legend{font-size:14px;font-weight:600;margin-bottom:10px}.options{display:grid;gap:8px}.options button{display:flex;align-items:baseline;gap:12px;padding:10px 14px;border:1px solid var(--line-divider);border-radius:7px;text-align:left;font-size:13px;line-height:1.7;cursor:pointer;background:var(--card-bg)}.options button span{font-weight:700;color:var(--btn-content)}.options button.chosen{border-color:#d99a20}.options button.right{border-color:#578368;background:color-mix(in srgb,#578368 12%,var(--card-bg))}.options button.wrong{border-color:#b77851}.feedback{font-size:13px;padding:12px 14px;background:var(--btn-plain-bg-hover);margin-top:10px;border-radius:7px}.retry{font-size:12px;color:var(--btn-content);text-decoration:underline;cursor:pointer}.practice{margin-top:24px;border-top:1px solid var(--line-divider);padding-top:18px}.practice p{margin-top:10px}summary{font-size:13px;color:var(--btn-content);cursor:pointer;list-style:revert;margin-top:14px}.source{font-size:11px;line-height:1.8;color:var(--text-50,#66717d);margin-top:24px}.source a{color:var(--btn-content)}button:focus-visible,summary:focus-visible,a:focus-visible{outline:2px solid #d99a20;outline-offset:3px}
</style>
