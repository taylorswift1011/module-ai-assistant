<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Application\Tools;

use Modules\AiAssistant\Application\Forecast\ExpenseForecast;

final class GetExpenseForecastDataTool extends AiTool
{
    public function __construct(private readonly ExpenseForecast $forecast) {}

    public function name(): string
    {
        return 'get_expense_forecast_data';
    }

    public function description(): string
    {
        return 'Get the figures for forecasting next month\'s expenses and suggesting owner pay (shareholder salary): monthly expense history by category, a projected running-cost total (owner pay kept separate), customer receipts and invoicing averages, bills and recurring costs already due in the target month, and unpaid customer invoices. The arithmetic is done for you; explain it and state your assumptions.';
    }

    public function parameterSchema(): array
    {
        return ['type' => 'object', 'properties' => [
            'target_month' => ['type' => 'string', 'description' => 'The month to forecast as YYYY-MM. Defaults to next month.'],
            'history_months' => ['type' => 'integer', 'minimum' => 3, 'maximum' => 12, 'description' => 'How many past months of history to include (default 6).'],
        ], 'required' => []];
    }

    /** The figures come from several records, each checked by the host, and the host decides what this member may see. */
    public function requiredAbility(): ?array
    {
        return ['view-expense', 'expense'];
    }

    public function execute(array $arguments, int $companyId, int $userId): mixed
    {
        return $this->forecast->build(
            $companyId,
            isset($arguments['target_month']) ? (string) $arguments['target_month'] : null,
            (int) ($arguments['history_months'] ?? 6),
        );
    }
}
