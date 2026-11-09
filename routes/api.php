<?php

use Illuminate\Support\Facades\Route;
use Modules\AiAssistant\Http\Admin\AiConfigurationController;
use Modules\AiAssistant\Http\Admin\CapabilitiesController as AdminCapabilitiesController;
use Modules\AiAssistant\Http\Company\CapabilitiesController;
use Modules\AiAssistant\Http\Company\ChatController;
use Modules\AiAssistant\Http\Company\CompanyAiConfigurationController;
use Modules\AiAssistant\Http\Company\ConversationController;
use Modules\AiAssistant\Http\Company\GenerationController;
use Modules\AiAssistant\Http\Company\ScheduledTaskController;

Route::prefix('api/v1')->middleware(['api', 'auth:sanctum'])->group(function (): void {
    Route::get('ai/admin-capabilities', AdminCapabilitiesController::class);
    Route::get('ai/drivers', [AiConfigurationController::class, 'getDrivers']);
    Route::get('ai/config', [AiConfigurationController::class, 'getConfig']);
    Route::post('ai/config', [AiConfigurationController::class, 'saveConfig']);
    Route::post('ai/test', [AiConfigurationController::class, 'testConnection']);
    Route::post('ai/models', [AiConfigurationController::class, 'models']);
});

Route::prefix('api/v1')->middleware(['api', 'auth:sanctum', 'company', 'bouncer'])->group(function (): void {
    Route::get('company/ai/config', [CompanyAiConfigurationController::class, 'getConfig']);
    Route::post('company/ai/config', [CompanyAiConfigurationController::class, 'saveConfig']);
    Route::post('company/ai/test', [CompanyAiConfigurationController::class, 'testConnection']);
    Route::post('company/ai/models', [CompanyAiConfigurationController::class, 'models']);
    Route::get('company/ai/scheduled-tasks', [ScheduledTaskController::class, 'index']);
    Route::post('company/ai/scheduled-tasks', [ScheduledTaskController::class, 'store']);
    Route::put('company/ai/scheduled-tasks/{id}', [ScheduledTaskController::class, 'update']);
    Route::delete('company/ai/scheduled-tasks/{id}', [ScheduledTaskController::class, 'destroy']);
    Route::post('company/ai/scheduled-tasks/{id}/run', [ScheduledTaskController::class, 'runNow']);
    Route::get('ai/capabilities', CapabilitiesController::class);
    Route::middleware('throttle:ai-assistant')->group(function (): void {
        Route::post('ai/chat', ChatController::class);
        Route::get('ai/conversations', [ConversationController::class, 'index']);
        Route::get('ai/conversations/{id}', [ConversationController::class, 'show']);
        Route::patch('ai/conversations/{id}', [ConversationController::class, 'update']);
        Route::delete('ai/conversations/{id}', [ConversationController::class, 'destroy']);
        Route::post('ai/generate', GenerationController::class);
    });
});
