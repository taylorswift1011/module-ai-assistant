<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { AxiosInstance } from 'axios'
import { AI_API } from '@/api'
import { errorMessage } from '@/composables/useAiChat'
import type { ScheduledTask, ScheduledTaskInput, ScheduledTaskTemplate } from '@/types/ai'

const props = defineProps<{
  client: AxiosInstance
  notify: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void
}>()

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const FREQUENCIES = [
  { value: 'month_end', label: 'Last day of every month' },
  { value: 'monthly', label: 'Monthly, on a set day' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Every day' },
] as const

const blank = (): ScheduledTaskInput => ({ name: '', prompt: '', frequency: 'month_end', day: null, run_at: '18:00', enabled: true })

const tasks = ref<ScheduledTask[]>([])
const templates = ref<ScheduledTaskTemplate[]>([])
const timezone = ref('UTC')
const loading = ref(true)
const loadError = ref('')
const saving = ref(false)
const busyId = ref<number | null>(null)
const editingId = ref<number | null>(null)
const showForm = ref(false)
const form = reactive<ScheduledTaskInput>(blank())

const needsDay = computed(() => form.frequency === 'weekly' || form.frequency === 'monthly')

onMounted(() => { void load() })

async function load(): Promise<void> {
  loading.value = true
  loadError.value = ''
  try {
    const { data } = await props.client.get<{ tasks: ScheduledTask[]; templates: ScheduledTaskTemplate[]; timezone: string }>(AI_API.scheduledTasks)
    tasks.value = data.tasks
    templates.value = data.templates
    timezone.value = data.timezone
  } catch (error: unknown) {
    loadError.value = errorMessage(error, 'Unable to load the scheduled tasks.')
  } finally {
    loading.value = false
  }
}

function startNew(template?: ScheduledTaskTemplate): void {
  Object.assign(form, blank(), template
    ? { name: template.name, prompt: template.prompt, frequency: template.frequency, day: template.day, run_at: template.run_at }
    : {})
  editingId.value = null
  showForm.value = true
}

function startEdit(task: ScheduledTask): void {
  Object.assign(form, { name: task.name, prompt: task.prompt, frequency: task.frequency, day: task.day, run_at: task.run_at, enabled: task.enabled })
  editingId.value = task.id
  showForm.value = true
}

function onFrequency(): void {
  form.day = form.frequency === 'weekly' ? 1 : form.frequency === 'monthly' ? 1 : null
}

async function save(): Promise<void> {
  if (!form.name.trim() || !form.prompt.trim()) { props.notify('error', 'Give the task a name and a prompt.'); return }
  saving.value = true
  try {
    const body = { ...form, name: form.name.trim(), day: needsDay.value ? form.day : null }
    if (editingId.value === null) await props.client.post(AI_API.scheduledTasks, body)
    else await props.client.put(AI_API.scheduledTask(editingId.value), body)
    props.notify('success', 'Scheduled task saved.')
    showForm.value = false
    await load()
  } catch (error: unknown) {
    props.notify('error', errorMessage(error, 'Unable to save the scheduled task.'))
  } finally {
    saving.value = false
  }
}

async function toggle(task: ScheduledTask): Promise<void> {
  busyId.value = task.id
  try {
    await props.client.put(AI_API.scheduledTask(task.id), { enabled: !task.enabled })
    await load()
  } catch (error: unknown) {
    props.notify('error', errorMessage(error, 'Unable to update the task.'))
  } finally {
    busyId.value = null
  }
}

async function runNow(task: ScheduledTask): Promise<void> {
  busyId.value = task.id
  try {
    const { data } = await props.client.post<{ message?: string }>(AI_API.scheduledTaskRun(task.id))
    props.notify('success', data.message ?? 'Queued.')
    await load()
  } catch (error: unknown) {
    props.notify('error', errorMessage(error, 'Unable to run the task.'))
  } finally {
    busyId.value = null
  }
}

async function remove(task: ScheduledTask): Promise<void> {
  if (!window.confirm(`Delete “${task.name}”? Its past results stay in your conversations.`)) return
  busyId.value = task.id
  try {
    await props.client.delete(AI_API.scheduledTask(task.id))
    await load()
  } catch (error: unknown) {
    props.notify('error', errorMessage(error, 'Unable to delete the task.'))
  } finally {
    busyId.value = null
  }
}

function describe(task: ScheduledTaskInput): string {
  const at = ` at ${task.run_at}`
  if (task.frequency === 'month_end') return `Last day of every month${at}`
  if (task.frequency === 'monthly') return `Day ${task.day} of every month${at}`
  if (task.frequency === 'weekly') return `Every ${WEEKDAYS[(task.day ?? 1) - 1]}${at}`
  return `Every day${at}`
}

function when(value: string | null): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone.value }).format(new Date(value))
}

const statusClass: Record<string, string> = {
  ok: 'bg-alert-success-bg text-alert-success-text',
  failed: 'bg-alert-error-bg text-alert-error-text',
  skipped: 'bg-alert-warning-bg text-alert-warning-text',
}
</script>

<template>
  <BasePage>
    <BasePageHeader title="AI scheduled tasks" />
    <BaseCard class="max-w-3xl">
      <div v-if="loading" class="p-6 text-sm text-muted">Loading scheduled tasks…</div>
      <div v-else-if="loadError" class="space-y-3 p-6"><p class="rounded bg-alert-error-bg p-3 text-sm text-alert-error-text">{{ loadError }}</p><button type="button" class="rounded bg-btn-primary px-3 py-2 text-sm text-white" @click="load">Try again</button></div>
      <div v-else class="space-y-6 p-6">
        <p class="text-sm text-muted">The assistant runs each task’s prompt on its schedule, as the person who created it, so it can read only what that person may read. Each run appears as a new conversation in that person’s AI chat history. Times are in <strong>{{ timezone }}</strong>.</p>

        <div v-if="!tasks.length && !showForm" class="rounded border border-line-default p-4">
          <p class="text-sm text-heading">No scheduled tasks yet.</p>
          <div v-for="template in templates" :key="template.key" class="mt-3">
            <p class="text-sm font-medium text-heading">{{ template.name }}</p>
            <p class="mt-1 text-xs text-muted">{{ template.description }}</p>
            <button type="button" class="mt-2 rounded bg-btn-primary px-3 py-2 text-sm text-white hover:bg-btn-primary-hover" @click="startNew(template)">Set this up</button>
          </div>
        </div>

        <ul v-if="tasks.length" class="space-y-3">
          <li v-for="task in tasks" :key="task.id" class="rounded border border-line-default p-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-medium text-heading">{{ task.name }}</p>
                <p class="mt-1 text-xs text-muted">{{ describe(task) }}<span v-if="!task.runs_as_you"> · runs as another member</span></p>
              </div>
              <label class="flex cursor-pointer items-center gap-2 text-xs text-body"><input type="checkbox" :checked="task.enabled" :disabled="busyId === task.id" @change="toggle(task)">{{ task.enabled ? 'On' : 'Off' }}</label>
            </div>
            <dl class="mt-3 grid gap-x-6 gap-y-1 text-xs text-muted sm:grid-cols-2">
              <div><dt class="inline">Next run: </dt><dd class="inline text-body">{{ task.enabled ? when(task.next_run_at) : 'switched off' }}</dd></div>
              <div><dt class="inline">Last run: </dt><dd class="inline text-body">{{ when(task.last_run_at) }}</dd> <span v-if="task.last_status" class="ml-1 rounded px-1.5 py-0.5" :class="statusClass[task.last_status]">{{ task.last_status }}</span></div>
            </dl>
            <p v-if="task.last_error" class="mt-2 rounded bg-alert-warning-bg p-2 text-xs text-alert-warning-text">{{ task.last_error }}</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <button type="button" class="rounded border border-line-default px-3 py-1.5 text-xs text-body hover:bg-hover disabled:opacity-50" :disabled="busyId === task.id || !task.enabled" @click="runNow(task)">Run now</button>
              <button type="button" class="rounded border border-line-default px-3 py-1.5 text-xs text-body hover:bg-hover" @click="startEdit(task)">Edit</button>
              <button type="button" class="rounded border border-line-default px-3 py-1.5 text-xs text-alert-error-text hover:bg-hover disabled:opacity-50" :disabled="busyId === task.id" @click="remove(task)">Delete</button>
            </div>
          </li>
        </ul>

        <div v-if="!showForm" class="flex flex-wrap gap-2">
          <button type="button" class="rounded bg-btn-primary px-3 py-2 text-sm text-white hover:bg-btn-primary-hover" @click="startNew()">New scheduled task</button>
          <button v-for="template in templates" v-show="tasks.length" :key="template.key" type="button" class="rounded border border-line-default px-3 py-2 text-sm text-body hover:bg-hover" @click="startNew(template)">Add “{{ template.name }}”</button>
        </div>

        <form v-if="showForm" class="space-y-4 border-t border-line-default pt-5" @submit.prevent="save">
          <h2 class="text-sm font-semibold text-heading">{{ editingId === null ? 'New scheduled task' : 'Edit scheduled task' }}</h2>
          <label class="block text-sm font-medium text-heading">Name
            <input v-model="form.name" maxlength="120" class="mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2 text-body">
          </label>
          <label class="block text-sm font-medium text-heading">What should the assistant do?
            <textarea v-model="form.prompt" rows="12" maxlength="4000" class="mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2 text-sm text-body" />
            <span class="mt-1 block text-xs font-normal text-muted">Write it as you would type it to the assistant. It can use the same tools, including the forecast figures. {{ form.prompt.length }}/4000</span>
          </label>
          <div class="grid gap-4 sm:grid-cols-3">
            <label class="block text-sm font-medium text-heading">Repeat
              <select v-model="form.frequency" class="mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2 text-body" @change="onFrequency"><option v-for="option in FREQUENCIES" :key="option.value" :value="option.value">{{ option.label }}</option></select>
            </label>
            <label v-if="form.frequency === 'weekly'" class="block text-sm font-medium text-heading">On
              <select v-model.number="form.day" class="mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2 text-body"><option v-for="(name, index) in WEEKDAYS" :key="name" :value="index + 1">{{ name }}</option></select>
            </label>
            <label v-else-if="form.frequency === 'monthly'" class="block text-sm font-medium text-heading">Day of the month
              <input v-model.number="form.day" type="number" min="1" max="31" class="mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2 text-body">
              <span class="mt-1 block text-xs font-normal text-muted">31 means the last day of shorter months.</span>
            </label>
            <label class="block text-sm font-medium text-heading">At ({{ timezone }})
              <input v-model="form.run_at" type="time" required class="mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2 text-body">
            </label>
          </div>
          <label class="flex cursor-pointer items-center gap-2 text-sm text-heading"><input v-model="form.enabled" type="checkbox">Switched on</label>
          <div class="flex gap-3">
            <button type="submit" class="rounded bg-btn-primary px-4 py-2 text-sm font-medium text-white hover:bg-btn-primary-hover disabled:opacity-50" :disabled="saving">{{ saving ? 'Saving…' : 'Save task' }}</button>
            <button type="button" class="rounded border border-line-default px-4 py-2 text-sm text-body hover:bg-hover" @click="showForm = false">Cancel</button>
          </div>
        </form>
      </div>
    </BaseCard>
  </BasePage>
</template>
