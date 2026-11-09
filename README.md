# InvoiceShelf AI Assistant

The official, free AI Assistant module for InvoiceShelf 3.x. It adds an in-app assistant and optional writing tools without putting an AI provider dependency in the core application.

The module is `AGPL-3.0-only`. Your administrator supplies and funds the OpenRouter API key; InvoiceShelf does not provide API credits or a shared key.

## Requirements

- InvoiceShelf `>=3.0.0-alpha.2 <4.0.0`
- Module API `^1.2.0`
- PHP `^8.4.0`
- An OpenRouter API key and an account with available provider credit

## Install and configure

1. Sign in as a super administrator and open **Administration → Modules**.
2. Pair the application with the InvoiceShelf marketplace if it is not already paired, then install and enable **AI Assistant**.
3. Open **Administration → Settings → AI Assistant**.
4. Choose OpenRouter, enter the API key, select the models to use, and click **Save settings**.
5. Click **Test connection** to verify the credentials before enabling it for users.
6. Turn on **Enable AI Assistant**, then choose the capabilities your team needs:
   - **Assistant chat** adds the conversational drawer to company pages.
   - **Editor text generation** adds writing assistance to rich-text editors.

The global administrator's configuration is the default for every company. A company owner can open **Company Settings → AI Assistant**, choose **Use a company-specific AI configuration**, and provide a different provider configuration or models for that company.

## Using a Claude subscription (Claude Code driver)

This fork adds a **Claude Code (subscription login)** provider. Instead of an API key, it runs the official `claude` CLI headlessly (`claude -p`) on the server, so inference uses the Claude subscription the CLI is logged in with.

1. Install Claude Code on the server and run `claude login` **as the user the web server runs as**, with `HOME` set to a non-public directory such as `storage/claude-home`.
2. The driver looks for the CLI and its login in `storage/claude-home` (install with `HOME=<app>/storage/claude-home`), or in the directory named by `CLAUDE_CLI_HOME`. `CLAUDE_CLI_PATH` overrides the binary.
3. In **Administration → Settings → AI Assistant**, choose the provider, use model aliases such as `sonnet`, `haiku` or `opus`, and click **Test connection**.

The CLI runs with all of its own tools disabled; InvoiceShelf's read-only tools are offered to it as a JSON protocol in the prompt. The provider can only be selected globally by a super administrator, because it spends the server's login. Use of a subscription is subject to Anthropic's terms; this is intended for your own installation.

## Local AI (OpenAI-compatible)

This fork adds a **Local AI (OpenAI-compatible)** provider for a model you run yourself: Ollama, LM Studio, llama.cpp's server, vLLM, LocalAI, LiteLLM or anything else that serves `/chat/completions` and `/models`. Prompts and the business data the tools return stay on your network.

1. Run the server and note its OpenAI base URL, for example `http://10.1.2.20:11434/v1` for Ollama.
2. Name its host in the web server's environment: `AI_LOCAL_ALLOWED_HOSTS=10.1.2.20` (comma-separated `host` or `host:port` entries, exact matches only). Private addresses are refused unless the operator lists them here, so nothing typed into the settings page can point the server at an internal host. This includes `localhost`.
3. In **Administration → Settings → AI Assistant**, choose the provider, set the Base URL, add an API key only if your server wants one, pick the model name the server uses, and click **Test connection**.

Only a super administrator can select it. Redirects are not followed. The assistant's data tools rely on tool calling, so use a model that supports it; text generation works with any chat model.

## Scheduled tasks and the month-end forecast

A company owner can have the assistant run a prompt on a schedule under **Company Settings → AI scheduled tasks**: daily, weekly, monthly on a set day, on the last day of every month, or on the last weekday (Monday to Friday) of every month, at a time in the company timezone.

- A task runs as the member who created it, with exactly that member's permissions, and each run is a new conversation in their AI chat history. Nothing is sent anywhere else.
- The scheduler is the host's own (`schedule:run` must be running, as it is for recurring invoices). The module adds one command, `ai-assistant:run-scheduled`, that runs every minute and does nothing unless a task is due. `php artisan ai-assistant:run-scheduled --task=ID` runs one task now.
- A run is claimed before it starts, so overlapping runs cannot repeat it. A failed run is recorded on the task and is not retried until the next scheduled time.
- The assistant stays read-only. A scheduled task can report and recommend; it cannot change data.

The **Month-end forecast and salary recommendation** template asks the assistant for next month's expected costs and a suggested shareholder salary. The arithmetic is done by the `get_expense_forecast_data` tool, not by the model: expense and supplier-bill history by category (owner pay kept separate), a three-month average projection, bills and recurring costs already due, unpaid customer invoices, and the average customer receipts. It states its limits: there is no bank balance in InvoiceShelf, receipts include tax charged on invoices, and the figures are an estimate, not tax or accounting advice. The prompt is yours to edit.

## Privacy and access

When someone uses a capability, their prompt and the business data that the selected model requests through the module's read-only tools are sent to OpenRouter and the chosen model provider. The assistant is scoped to the active company and respects the user's InvoiceShelf permissions; it cannot write invoices, expenses, customers, payments, or other business records.

API keys are encrypted at rest and shown as masked values in settings. Enable only the chat and editor features you intend to use, select models appropriate for your privacy requirements, and review OpenRouter's and the selected provider's data practices before enabling the module.

## Disable and uninstall

Disabling the module turns off its UI and routes but retains configuration and conversations. Uninstalling it removes the package. If an administrator also selects **Remove module data**, the module deletes its settings and reverses its migration, removing AI conversations and messages. This data removal is permanent.

## Development

The package ships committed files in `dist/` because InvoiceShelf installs immutable packages without running Composer or a JavaScript package manager. See [CONTRIBUTING.md](CONTRIBUTING.md) for the exact local checks, generated-asset workflow, and release process.

## License

The AI Assistant module is licensed under [AGPL-3.0-only](LICENSE).
