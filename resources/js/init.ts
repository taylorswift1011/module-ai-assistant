import { defineComponent, h, ref } from 'vue'
import type { InvoiceShelfExtensionApi } from '@invoiceshelf/modules/frontend'
import '../css/module.css'
import { AI_API } from './api'
import AiChatOverlay from './components/AiChatOverlay.vue'
import AiHeaderAction from './components/AiHeaderAction.vue'
import AiTextAction from './components/AiTextAction.vue'
import AiConfigurationPage from './pages/AiConfigurationPage.vue'
import AiScheduledTasksPage from './pages/AiScheduledTasksPage.vue'
import type { AiCapabilities } from './types/ai'

window.InvoiceShelf.booting((_app, _router, extensions) => {
  const chatEnabled = ref(false)
  const textGenerationEnabled = ref(false)
  const canManageCompany = ref(false)
  const canManageGlobal = ref(false)
  const chatOpen = ref(false)
  const companySession = ref(0)

  const notify = (type: 'success' | 'error' | 'warning' | 'info', message: string): void => {
    extensions.notify(type, message)
  }

  const refreshCapabilities = async (adminMode = false): Promise<void> => {
    try {
      const endpoint = adminMode ? AI_API.adminCapabilities : AI_API.capabilities
      const { data } = await extensions.client.get<AiCapabilities>(endpoint)
      chatEnabled.value = Boolean(data.chat)
      textGenerationEnabled.value = Boolean(data.text_generation)
      canManageCompany.value = Boolean(data.can_manage_company)
      canManageGlobal.value = Boolean(data.can_manage_global)
    } catch {
      chatEnabled.value = false
      textGenerationEnabled.value = false
      canManageCompany.value = false
      canManageGlobal.value = false
    }
  }

  extensions.addMessages({
    en: {
      ai_assistant: {
        title: 'AI Assistant',
        chat: { new_conversation: 'New conversation', empty: 'No conversations yet.', thinking: 'Thinking…' },
        settings: { saved: 'AI settings saved.', connection_success: 'Connection successful.' },
      },
    },
  })

  extensions.on('bootstrap:completed', ({ adminMode }) => { void refreshCapabilities(adminMode) })
  extensions.on('company:changing', () => {
    chatOpen.value = false
    companySession.value += 1
    chatEnabled.value = false
    textGenerationEnabled.value = false
  })
  extensions.on('company:changed', ({ companyId }) => { void refreshCapabilities(companyId === null) })

  extensions.registerHeaderAction({
    id: 'ai-assistant.header', priority: 20, visible: () => chatEnabled.value,
    component: defineComponent({ setup: () => () => h(AiHeaderAction, { onOpen: () => { chatOpen.value = true } }) }),
  })
  extensions.registerCompanyLayoutOverlay({
    id: 'ai-assistant.overlay',
    component: defineComponent({ setup: () => () => h(AiChatOverlay, {
      key: companySession.value, open: chatOpen.value, enabled: chatEnabled.value, client: extensions.client, notify,
      'onUpdate:open': (value: boolean) => { chatOpen.value = value },
    }) }),
  })
  extensions.registerRichEditorToolbarAction({
    id: 'ai-assistant.editor', visible: () => textGenerationEnabled.value,
    component: defineComponent({
      props: { context: { type: Object, required: true } },
      setup: (props) => () => h(AiTextAction, { context: props.context, enabled: textGenerationEnabled.value, client: extensions.client, notify }),
    }),
  })
  registerSettings(extensions, 'admin', canManageGlobal, notify)
  registerSettings(extensions, 'company', canManageCompany, notify)
  extensions.registerCompanySettingsPage({
    id: 'ai-assistant.company-schedules', title: 'AI scheduled tasks', icon: 'ClockIcon', path: 'ai-scheduled-tasks',
    priority: 81, visible: () => canManageCompany.value && chatEnabled.value,
    component: defineComponent({ setup: () => () => h(AiScheduledTasksPage, { client: extensions.client, notify }) }),
  })
})

function registerSettings(
  extensions: InvoiceShelfExtensionApi,
  scope: 'admin' | 'company',
  visible: { value: boolean },
  notify: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void,
): void {
  const contribution = {
    id: `ai-assistant.${scope}-settings`, title: 'AI Assistant', icon: 'SparklesIcon', path: 'ai-assistant',
    priority: 80, visible: () => visible.value,
    component: defineComponent({ setup: () => () => h(AiConfigurationPage, { client: extensions.client, scope, notify }) }),
  }
  if (scope === 'admin') extensions.registerAdminSettingsPage(contribution)
  else extensions.registerCompanySettingsPage(contribution)
}
