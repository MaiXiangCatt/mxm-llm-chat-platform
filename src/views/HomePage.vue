<template>
  <div class="home-page">
    <!-- 头 -->
    <header class="header">
      <div class="header-left">
        <span class="header-title">Mxm AI Chat Platform</span>
      </div>
      <div class="header-right">
        <a
          href="https://github.com/maixiangcatt/mxm-llm-chat-platform"
          class="github-link"
        >
          <img
            src="@/assets/github.png"
            alt="github"
            class="github-icon"
          />
        </a>
      </div>
    </header>

    <!-- 主体 -->
    <main class="main-content">
      <h1 class="title">欢迎使用Mxm AI对话平台</h1>
      <p class="description">一个可以调用各种大模型的AI对话工具</p>
      <router-link
        to="/chat"
        class="start-button"
      >
        <el-button
          color="#63065F"
          round
          size="large"
          >开始使用</el-button
        >
      </router-link>
      <div class="feature-list">
        <div class="feature-item">
          <el-icon class="feature-icon"><ChatRound /></el-icon>
          <h2>智能对话</h2>
          <p>基于先进的大语言模型，提供流畅、智能的实时问答体验，满足您的各种需求。</p>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><Reading /></el-icon>
          <h2>完美格式化</h2>
          <p>全面支持 Markdown 语法, 包括代码高亮、列表和表格, 让AI的回答清晰易读。</p>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><Setting /></el-icon>
          <h2>自定义设置</h2>
          <p>支持自定义 API Key 和调节模型参数, 为您提供量身定制的、更具个性化的AI交互体验。</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ChatRound, Reading, Setting } from '@element-plus/icons-vue'
</script>

<style scoped lang="scss">
.home-page {
  height: 100vh;
  width: 100vw;
  background-color: var(--el-bg-color);

  .header {
    height: 64px;
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--el-border-color);
    background-color: var(--el-bg-color);

    .header-title {
      font-size: 20px;
      font-weight: 600;
      color: #171717;
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }

    .github-icon {
      width: 22px;
      height: 22px;
      cursor: pointer;
      opacity: 1;
    }
  }

  .main-content {
    padding: 80px 64px;
    max-width: 1200px;
    margin: 0 auto;

    .title {
      font-size: 48px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 24px;
    }
    .description {
      font-size: 20px;
      color: #666;
      max-width: 600px;
      margin-bottom: 64px;
      line-height: 1.5;
    }

    .feature-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 40px;
      margin: 64px auto;

      .feature-item {
        padding: 32px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        transition: transform 0.3s ease;

        &:hover {
          transform: translateY(-4px);
        }

        .feature-icon {
          font-size: 32px;
          color: var(--nju-primary-light);
          margin-bottom: 20px;
        }

        h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        p {
          font-size: 16px;
          color: #666;
          line-height: 1.5;
        }
      }
    }
  }
}
</style>
