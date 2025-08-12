import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import mdLinkAttributes from 'markdown-it-link-attributes'
import { full as emoji } from 'markdown-it-emoji'
import CopyIcon from '@/assets/copy.png'

const md: MarkdownIt = new MarkdownIt({
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlightedCode = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        return `<div class="code-block"><div class="code-header"><span class="code-lang">${lang}</span><div class="code-actions"><button class="code-action-btn" data-action="copy" data-tooltip="复制"><img src="${CopyIcon}" /></button></div></div><pre class="hljs"><code>${highlightedCode}</code></pre></div>`
      } catch (_) {
        // 忽略错误
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
})

md.use(mdLinkAttributes, {
  attrs: {
    target: '_blank',
    rel: 'noopener noreferrer',
  },
})

md.use(emoji)

export const renderMarkdown = (text: string) => {
  if (!text) return ''
  return md.render(text)
}

export const renderMarkDownInline = (text: string) => {
  if (!text) return ''
  return md.renderInline(text)
}

export { md }
