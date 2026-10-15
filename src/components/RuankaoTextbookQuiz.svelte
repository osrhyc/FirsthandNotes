<script lang="ts">
  import type { TextbookQuestion } from "@/data/ruankao-textbook-types";
  export let questions: TextbookQuestion[];
  let choices: Record<number, number> = {};
  const sectionLabels = (ids: string[]) => [...new Set(ids.map(id => id.split("-")[0]))].join("、");
  $: answered = Object.keys(choices).length;
  $: correct = questions.filter((question, index) => choices[index] === question.correct).length;
</script>
<div class="quiz">
  <p class="score" aria-live="polite">已答 {answered} / {questions.length} · 答对 {correct} 题</p>
  {#each questions as question, index}
    <fieldset>
      <legend>{index + 1}. {question.prompt}</legend>
      <div class="options">
        {#each question.options as option, i}
          <button aria-pressed={choices[index] === i} class:chosen={choices[index] === i} class:right={choices[index] !== undefined && i === question.correct} class:wrong={choices[index] === i && i !== question.correct} on:click={() => { choices = { ...choices, [index]: i }; }}><b>{String.fromCharCode(65 + i)}</b><span>{option}</span></button>
        {/each}
      </div>
      {#if choices[index] !== undefined}<div class="feedback" role="status"><strong>{choices[index] === question.correct ? "答对了。" : "再看一下理由。"}</strong><p>{question.explanation}</p><small>对应教材小节：{sectionLabels(question.sourceSections)}</small></div>{/if}
    </fieldset>
  {/each}
  {#if answered}<button class="reset" on:click={() => choices = {}}>重新练习</button>{/if}
  <p class="hint">题目为根据本单元编写的原创练习。选择保留在当前页面；请把错因记入今日学习笔记。</p>
</div>
<style>
.quiz{font-size:15px;line-height:1.8}.score,.hint{font-size:12px;color:var(--study-muted,#637083)}fieldset{margin:24px 0;padding:0}legend{font-weight:650;margin-bottom:12px}.options{display:grid;gap:8px}.options button{display:flex;gap:12px;width:100%;text-align:left;border:1px solid var(--study-line,#deded7);background:var(--study-paper,#fffdf9);padding:12px 16px;border-radius:8px;line-height:1.8;cursor:pointer}.options b{color:#a16b10}.chosen{border-color:#d99a20!important}.right{border-color:#4c8064!important;background:color-mix(in srgb,#4c8064 10%,var(--study-paper,#fffdf9))!important}.wrong{border-color:#b76b4f!important}.feedback{padding:16px;background:var(--study-soft,#f5f1e8);border-radius:8px;margin-top:12px}.feedback p{margin:6px 0}.feedback small{color:var(--study-muted,#637083)}.reset{color:#a16b10;text-decoration:underline;cursor:pointer}.hint{margin-top:18px}button:focus-visible{outline:2px solid #d99a20;outline-offset:3px}
</style>
