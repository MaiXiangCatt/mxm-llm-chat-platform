import { computed } from 'vue'
import type { Ref } from 'vue'

const defaultIdInjection = {
  prefix: Math.floor(Math.random() * 10000),
  current: 0,
}

export function addId(): Ref<string> {
  const id = computed(() => {
    return `${defaultIdInjection.prefix}-${defaultIdInjection.current++}`
  })
  return id
}

export default addId
