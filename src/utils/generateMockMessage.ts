import type { Role } from '@/stores/chats/types'

export function generateMockMessages(messageCount = 200) {
  const messages = []
  const sampleUserQueries = [
    '你好，我想用 Vue 3 写一个组件。',
    '好的，我想实现一个简单的计数器按钮组件，包含一个显示数字的区域和一个点击后数字会增加的按钮。',
    '代码看起来不错，能给我加上 TypeScript 类型定义吗？',
    '非常清晰！现在如果我想给这个组件加上一个重置功能，应该怎么做？',
    '太棒了，谢谢你！',
    '最后一个问题，如何通过 props 来给计数器设置一个初始值？',
  ]

  const sampleAssistantResponses = [
    '当然！很乐意帮助你。你想用 Vue 3 实现一个什么样的组件呢？可以具体描述一下它的功能和外观吗？',
    `没问题，这是一个非常好的入门练习。你可以使用 Vue 3 的 Composition API 来实现。这是一个基本的实现：

\`\`\`vue
<template>
  <div class="counter">
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);

const increment = () => {
  count.value++;
};
</script>

<style scoped>
.counter {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center;
}
button {
  margin-left: 1rem;
}
</style>
\`\`\`

这个组件使用了 \`<script setup>\` 语法，这是目前 Vue 3 最推荐的写法。它内部定义了一个响应式变量 \`count\`，以及一个修改它的 \`increment\` 方法。`,
    `当然可以。为 \`<script setup>\` 添加 TypeScript 支持非常简单，只需要给 \`<script>\` 标签加上 \`lang="ts"\` 属性即可。同时我们可以为变量和函数添加类型注解，让代码更健壮：

\`\`\`vue
<template>
  </template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Ref } from 'vue';

const count: Ref<number> = ref(0);

const increment = (): void => {
  count.value++;
};
</script>

<style scoped>
/* style 部分保持不变 */
</style>
\`\`\`

这里我使用了 Vue 提供的 \`Ref\` 类型来注解 \`ref\` 创建的响应式引用。`,
    `添加重置功能也很简单。我们只需要再定义一个 \`reset\` 函数，将 \`count\` 的值恢复为 0，然后在模板中添加一个重置按钮即可。

\`\`\`vue
<template>
  <div class="counter">
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
    <button @click="reset">Reset</button> </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Ref } from 'vue';

const count: Ref<number> = ref(0);

const increment = (): void => {
  count.value++;
};

// 新增 reset 函数
const reset = (): void => {
  count.value = 0;
};
</script>
\`\`\`
`,
    `不客气！很高兴能帮到你。如果你在开发过程中有任何其他问题，随时可以再来问我。祝你编码愉快！`,
    `通过 props 设置初始值是组件封装的关键一步。我们可以使用 \`defineProps\` 来定义组件接收的 props。

\`\`\`vue
<template>
  </template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Ref } from 'vue';

// 1. 定义 props
const props = defineProps<{
  initialValue?: number; // ? 表示这是一个可选的 prop
}>();

// 2. 使用 props 的值来初始化 count
const count: Ref<number> = ref(props.initialValue || 0);

// increment 和 reset 函数保持不变
const increment = (): void => {
  count.value++;
};

const reset = (): void => {
  count.value = props.initialValue || 0; // 重置时也回到初始值
};
</script>
\`\`\`

这样，你在使用这个组件的时候就可以像这样传递一个初始值了：\`<Counter :initialValue="10" />\`。`,
  ]

  for (let i = 0; i < messageCount; i++) {
    const role = i % 2 === 0 ? 'user' : 'assistant'
    const content =
      role === 'user'
        ? sampleUserQueries[Math.floor(i / 2) % sampleUserQueries.length]
        : sampleAssistantResponses[Math.floor(i / 2) % sampleAssistantResponses.length]

    messages.push({
      id: Date.now(),
      role: role as Role,
      content: `${content} (消息 #${i + 1})`, // 添加序号以确保内容唯一
    })
  }

  return messages
}
