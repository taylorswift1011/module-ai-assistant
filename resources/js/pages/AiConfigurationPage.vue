<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import type { AxiosInstance } from 'axios'
import { AI_API } from '@/api'
import { errorMessage } from '@/composables/useAiChat'
import type { AiConfig, AiDriverOption, AiSuggestedModel, CompanyAiConfig } from '@/types/ai'

const props = defineProps<{
  client: AxiosInstance
  scope: 'admin' | 'company'
  notify: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void
}>()

const defaults: AiConfig = {
  ai_enabled: 'NO', ai_driver: 'openrouter', ai_api_key: '', ai_base_url: '',
  ai_chat_enabled: 'NO', ai_chat_model: 'anthropic/claude-sonnet-4.6',
  ai_text_generation_enabled: 'NO', ai_text_generation_model: 'anthropic/claude-haiku-4.5',
}
const form = reactive<CompanyAiConfig>({ ...defaults, use_custom_ai_config: 'NO' })
const drivers = ref<AiDriverOption[]>([])
const loading = ref(true)
const saving = ref(false)
const testing = ref(false)
const showKey = ref(false)
const loadError = ref('')

const endpoint = computed(() => props.scope === 'admin' ? AI_API.globalConfig : AI_API.companyConfig)
const modelsEndpoint = computed(() => props.scope === 'admin' ? AI_API.globalModels : AI_API.companyModels)
const testEndpoint = computed(() => props.scope === 'admin' ? AI_API.globalTest : AI_API.companyTest)
const isCustom = computed(() => form.use_custom_ai_config === 'YES')
const aiOn = computed(() => form.ai_enabled === 'YES')
const selectedDriver = computed(() => drivers.value.find((driver) => driver.value === form.ai_driver))
const suggestedModels = computed(() => selectedDriver.value?.suggested_models ?? [])
const fields = computed(() => selectedDriver.value?.config_fields ?? [])
const needsKey = computed(() => selectedDriver.value?.requires_api_key ?? true)
const acceptsKey = computed(() => selectedDriver.value?.accepts_api_key === true)
const fetchesModels = computed(() => selectedDriver.value?.fetches_models === true)
const fetchedModels = ref<AiSuggestedModel[]>([])
const fetchingModels = ref(false)
const modelsError = ref('')
/** Only a provider with a Base URL field uses one; for the rest a leftover value must not be sent. */
const usesBaseUrl = computed(() => fields.value.some((field) => field.key === 'base_url'))
const hasMaskedKey = computed(() => /[•*]/.test(form.ai_api_key))
const visibleConfig = computed(() => props.scope === 'admin' || isCustom.value)

watch(() => form.ai_driver, (driver, previous) => {
  const selected = drivers.value.find((item) => item.value === driver)
  const before = drivers.value.find((item) => item.value === previous)
  // Replace an empty URL, or the previous provider's own default, but never one the admin typed.
  const untouched = !form.ai_base_url || form.ai_base_url === before?.default_base_url
  if (untouched) form.ai_base_url = selected?.default_base_url ?? ''
})

onMounted(() => { void load() })

async function load(): Promise<void> {
  loading.value = true
  loadError.value = ''
  try {
    const [{ data: driverData }, { data: configData }] = await Promise.all([
      props.client.get<{ ai_drivers: AiDriverOption[] }>(AI_API.drivers),
      props.client.get<Partial<CompanyAiConfig>>(endpoint.value),
    ])
    drivers.value = driverData.ai_drivers
    Object.assign(form, defaults, configData)
    if (form.ai_enabled === 'YES' && selectedDriver.value?.fetches_models) void fetchModels(false)
  } catch (error: unknown) {
    loadError.value = errorMessage(error, 'Unable to load AI configuration.')
    props.notify('error', loadError.value)
  } finally {
    loading.value = false
  }
}

async function onDriverChange(): Promise<void> {
  fetchedModels.value = []
  modelsError.value = ''
  const models = selectedDriver.value?.suggested_models ?? []
  if (selectedDriver.value?.fetches_models) {
    // The previous provider's model names mean nothing here; the server's own list replaces them.
    form.ai_chat_model = ''
    form.ai_text_generation_model = ''
    await nextTick()
    void fetchModels(true)
    return
  }
  if (models.length === 0) return
  const known = (value: string): boolean => models.some((model) => model.value === value)
  if (!known(form.ai_chat_model)) form.ai_chat_model = models[0].value
  if (!known(form.ai_text_generation_model)) form.ai_text_generation_model = (models[1] ?? models[0]).value
}

/** Ask the configured server which models it offers. */
async function fetchModels(announce: boolean): Promise<void> {
  if (fetchingModels.value || !form.ai_driver) return
  fetchingModels.value = true
  modelsError.value = ''
  try {
    const { data } = await props.client.post<{ models?: AiSuggestedModel[] }>(modelsEndpoint.value, {
      ai_driver: form.ai_driver,
      ai_api_key: hasMaskedKey.value ? undefined : form.ai_api_key,
      ai_base_url: usesBaseUrl.value ? form.ai_base_url : '',
    })
    fetchedModels.value = data.models ?? []
    const first = fetchedModels.value[0]?.value ?? ''
    const known = (value: string): boolean => fetchedModels.value.some((model) => model.value === value)
    if (first && !known(form.ai_chat_model)) form.ai_chat_model = first
    if (first && !known(form.ai_text_generation_model)) form.ai_text_generation_model = first
    if (announce || fetchedModels.value.length === 0) {
      props.notify(fetchedModels.value.length ? 'success' : 'warning', fetchedModels.value.length
        ? `Found ${fetchedModels.value.length} models.` : 'The server did not list any models.')
    }
  } catch (error: unknown) {
    fetchedModels.value = []
    modelsError.value = errorMessage(error, 'Unable to list the models.')
    props.notify('error', modelsError.value)
  } finally {
    fetchingModels.value = false
  }
}

/** The server's models, plus the saved one so a model that vanished is still visible. */
function modelChoices(current: string): AiSuggestedModel[] {
  const list = fetchedModels.value
  return current && !list.some((model) => model.value === current)
    ? [{ value: current, label: `${current} (not offered by the server)` }, ...list]
    : list
}

function payload(): CompanyAiConfig {
  // The backend recognizes the masked placeholder and retains the stored secret.
  return { ...form, ai_base_url: usesBaseUrl.value ? form.ai_base_url : '' }
}

function validate(): string | null {
  if (!aiOn.value) return null
  if (!form.ai_driver) return 'Choose an AI provider.'
  if (needsKey.value && !form.ai_api_key && !hasMaskedKey.value) return 'Enter an API key.'
  if (usesBaseUrl.value && form.ai_base_url) {
    try { new URL(form.ai_base_url) } catch { return 'Enter a valid base URL.' }
  }
  if (form.ai_chat_enabled === 'YES' && !form.ai_chat_model.trim()) return 'Choose a chat model.'
  if (form.ai_text_generation_enabled === 'YES' && !form.ai_text_generation_model.trim()) return 'Choose a text generation model.'
  return null
}

async function save(): Promise<void> {
  const validationError = validate()
  if (validationError) { props.notify('error', validationError); return }
  saving.value = true
  try {
    await props.client.post(endpoint.value, payload())
    props.notify('success', 'AI settings saved.')
  } catch (error: unknown) {
    props.notify('error', errorMessage(error, 'Unable to save AI settings.'))
  } finally {
    saving.value = false
  }
}

async function toggleCustom(event: Event): Promise<void> {
  const enabled = (event.target as HTMLInputElement).checked
  form.use_custom_ai_config = enabled ? 'YES' : 'NO'
  if (!enabled) {
    saving.value = true
    try {
      await props.client.post(endpoint.value, { use_custom_ai_config: 'NO' })
      props.notify('success', 'This company now uses the global AI configuration.')
    } catch (error: unknown) {
      form.use_custom_ai_config = 'YES'
      props.notify('error', errorMessage(error, 'Unable to update the company configuration.'))
    } finally {
      saving.value = false
    }
  }
}

async function testConnection(): Promise<void> {
  if (!aiOn.value) return
  testing.value = true
  try {
    const { data } = await props.client.post<{ success?: boolean; message?: string; error?: string }>(testEndpoint.value, {
      ai_driver: form.ai_driver,
      ai_api_key: hasMaskedKey.value ? undefined : form.ai_api_key,
      ai_base_url: usesBaseUrl.value ? form.ai_base_url : '',
    })
    if (data.success) props.notify('success', data.message ?? 'Connection successful.')
    else props.notify('error', data.message ?? data.error ?? 'The connection test failed.')
  } catch (error: unknown) {
    props.notify('error', errorMessage(error, 'The connection test failed.'))
  } finally {
    testing.value = false
  }
}

function setFlag(key: 'ai_enabled' | 'ai_chat_enabled' | 'ai_text_generation_enabled', event: Event): void {
  form[key] = (event.target as HTMLInputElement).checked ? 'YES' : 'NO'
}

function updateExtraField(key: string, event: Event): void {
  ;(form as Record<string, string>)[`ai_${key}`] = (event.target as HTMLInputElement).value
}
</script>

<template>
  <BasePage>
    <BasePageHeader :title="scope === 'admin' ? 'AI Assistant' : 'AI Assistant configuration'" />
    <BaseCard class="max-w-3xl">
      <div v-if="loading" class="p-6 text-sm text-muted">Loading AI configuration…</div>
      <div v-else-if="loadError" class="space-y-3 p-6"><p class="rounded bg-alert-error-bg p-3 text-sm text-alert-error-text">{{ loadError }}</p><button type="button" class="rounded bg-btn-primary px-3 py-2 text-sm text-white" @click="load">Try again</button></div>
      <form v-else class="space-y-6 p-6" @submit.prevent="save">
        <section v-if="scope === 'company'" class="border-b border-line-default pb-6">
          <label class="flex cursor-pointer items-start gap-3"><input type="checkbox" :checked="isCustom" :disabled="saving" @change="toggleCustom"><span><span class="block text-sm font-medium text-heading">Use a company-specific AI configuration</span><span class="mt-1 block text-xs text-muted">Override the global provider and models for this company.</span></span></label>
          <p v-if="!isCustom" class="mt-4 rounded bg-alert-success-bg p-3 text-sm text-alert-success-text">This company is using the global AI configuration.</p>
        </section>

        <div v-if="visibleConfig" class="space-y-6">
          <section>
            <label class="flex cursor-pointer items-start gap-3"><input type="checkbox" :checked="aiOn" @change="setFlag('ai_enabled', $event)"><span><span class="block text-sm font-medium text-heading">Enable AI Assistant</span><span class="mt-1 block text-xs text-muted">Allow this provider to power chat and editor text generation.</span></span></label>
          </section>

          <div v-if="aiOn" class="space-y-5">
            <label class="block text-sm font-medium text-heading">Provider
              <select v-model="form.ai_driver" class="mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2 text-body" @change="onDriverChange"><option v-for="driver in drivers" :key="driver.value" :value="driver.value">{{ driver.label }}</option></select>
            </label>
            <p v-if="acceptsKey" class="-mt-3 text-xs text-muted">Any server that speaks the OpenAI API (Ollama, LM Studio, llama.cpp, vLLM, LiteLLM). A server on a private address must be listed by the operator in the <code>AI_LOCAL_ALLOWED_HOSTS</code> environment variable. Chat tools need a model that supports tool calling.</p>
            <p v-else-if="!needsKey" class="-mt-3 text-xs text-muted">Uses the Claude subscription that the server's <code>claude</code> CLI is logged in with (run <code>claude login</code> as the web server user). No API key is stored.</p>
            <p v-else-if="selectedDriver?.website" class="-mt-3 text-xs text-muted">Get an API key from <a class="text-primary-500 underline" :href="selectedDriver.website" target="_blank" rel="noopener noreferrer">{{ selectedDriver.label }}</a>.</p>
            <label v-if="needsKey || acceptsKey" class="block text-sm font-medium text-heading">API key{{ needsKey ? '' : ' (optional)' }}
              <span class="mt-1 flex gap-2"><input v-model="form.ai_api_key" :type="showKey ? 'text' : 'password'" autocomplete="new-password" class="min-w-0 flex-1 rounded-md border border-line-default bg-surface px-3 py-2 text-body" :placeholder="hasMaskedKey ? 'Stored securely — enter a new key to replace it' : ''"><button type="button" class="rounded border border-line-default px-3 text-xs text-body hover:bg-hover" @click="showKey = !showKey">{{ showKey ? 'Hide' : 'Show' }}</button></span>
              <span class="mt-1 block text-xs font-normal text-muted">Keys are stored securely. Leave the masked value unchanged to keep the current key.</span>
            </label>
            <label v-for="field in fields" :key="field.key" class="block text-sm font-medium text-heading">{{ field.label }}
              <input v-if="field.type === 'text'" :value="(form as Record<string, string>)[`ai_${field.key}`] ?? ''" :placeholder="field.default" class="mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2 text-body" @input="updateExtraField(field.key, $event)">
              <select v-else :value="(form as Record<string, string>)[`ai_${field.key}`] ?? ''" class="mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2 text-body" @change="updateExtraField(field.key, $event)"><option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option></select>
            </label>

            <section class="border-t border-line-default pt-5"><h2 class="text-sm font-semibold text-heading">AI capabilities</h2><p class="mt-1 text-xs text-muted">Enable only the AI tools your team needs, and choose a model for each one.</p>
              <div v-if="fetchesModels" class="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted"><button type="button" class="rounded border border-line-default px-3 py-1.5 text-body hover:bg-hover disabled:opacity-50" :disabled="fetchingModels" @click="fetchModels(true)">{{ fetchingModels ? 'Loading models…' : 'Refresh models' }}</button><span v-if="modelsError" class="text-alert-error-text">{{ modelsError }}</span><span v-else-if="fetchedModels.length">{{ fetchedModels.length }} models available from this server.</span><span v-else-if="!fetchingModels">Models are read from the server; set the URL (and key if needed) first.</span></div>
              <div class="mt-5 space-y-5">
                <div><label class="flex cursor-pointer gap-3"><input type="checkbox" :checked="form.ai_chat_enabled === 'YES'" @change="setFlag('ai_chat_enabled', $event)"><span class="text-sm font-medium text-heading">Assistant chat<span class="mt-1 block text-xs font-normal text-muted">Show the conversational AI drawer in company pages.</span></span></label><label v-if="form.ai_chat_enabled === 'YES'" class="mt-3 block text-sm text-body">Chat model<select v-if="fetchesModels && fetchedModels.length" v-model="form.ai_chat_model" class="mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2"><option v-for="model in modelChoices(form.ai_chat_model)" :key="model.value" :value="model.value">{{ model.label }}</option></select><input v-else v-model="form.ai_chat_model" list="ai-models" class="mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2"></label></div>
                <div><label class="flex cursor-pointer gap-3"><input type="checkbox" :checked="form.ai_text_generation_enabled === 'YES'" @change="setFlag('ai_text_generation_enabled', $event)"><span class="text-sm font-medium text-heading">Editor text generation<span class="mt-1 block text-xs font-normal text-muted">Add AI writing tools to rich-text editors.</span></span></label><label v-if="form.ai_text_generation_enabled === 'YES'" class="mt-3 block text-sm text-body">Text generation model<select v-if="fetchesModels && fetchedModels.length" v-model="form.ai_text_generation_model" class="mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2"><option v-for="model in modelChoices(form.ai_text_generation_model)" :key="model.value" :value="model.value">{{ model.label }}</option></select><input v-else v-model="form.ai_text_generation_model" list="ai-models" class="mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2"></label></div>
              </div>
              <datalist id="ai-models"><option v-for="model in suggestedModels" :key="model.value" :value="model.value">{{ model.label }}</option></datalist>
            </section>
          </div>
        </div>
        <footer v-if="visibleConfig" class="flex flex-wrap items-center gap-3 border-t border-line-default pt-5"><button type="submit" class="rounded bg-btn-primary px-4 py-2 text-sm font-medium text-white hover:bg-btn-primary-hover disabled:opacity-50" :disabled="saving">{{ saving ? 'Saving…' : 'Save settings' }}</button><button v-if="aiOn" type="button" class="rounded border border-line-default px-4 py-2 text-sm text-body hover:bg-hover disabled:opacity-50" :disabled="saving || testing" @click="testConnection">{{ testing ? 'Testing…' : 'Test connection' }}</button></footer>
      </form>
    </BaseCard>
  </BasePage>
</template>
