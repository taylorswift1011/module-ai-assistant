<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Application\Host;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Facade;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

/**
 * Calls the host's `/api/v1` routes in-process, as the user already signed in
 * to the current request.
 *
 * The call goes through the route's own middleware (company, Bouncer) and the
 * controller's own policy check, so a user who may not see bills gets the same
 * refusal here as in the app. Only GET is offered: the assistant is read-only.
 */
final class RouterHostApi implements HostApi
{
    public function __construct(private readonly Application $app, private readonly Router $router) {}

    public function get(string $path, array $query, int $companyId): array
    {
        $current = $this->app->make('request');

        $request = Request::create('/api/v1/'.ltrim($path, '/'), 'GET', $query);
        $request->headers->set('company', (string) $companyId);
        $request->headers->set('Accept', 'application/json');
        $request->setUserResolver($current->getUserResolver());

        $route = $this->router->current();

        // Controllers and route-model binding read the request from the
        // container, not the one handed to the router, so the call needs its own
        // for the duration, exactly as the HTTP kernel installs one.
        $this->bind($request);

        try {
            $response = $this->router->dispatch($request);
        } catch (AuthorizationException) {
            throw new HostApiException('You do not have permission to view this.', 403);
        } catch (ModelNotFoundException) {
            throw new HostApiException('Not found.', 404);
        } catch (ValidationException $e) {
            throw new HostApiException('The request was not valid: '.implode(' ', $e->validator->errors()->all()), 422);
        } catch (HttpExceptionInterface $e) {
            throw new HostApiException($e->getStatusCode() === 403 ? 'You do not have permission to view this.' : 'The host refused the request.', $e->getStatusCode());
        } catch (Throwable $e) {
            report($e);

            throw new HostApiException('The host could not answer the request.', 500);
        } finally {
            // The outer request is still being handled; put it and its route back.
            $this->bind($current);
            if ($route !== null) {
                $this->app->instance(Route::class, $route);
            }
        }

        $body = json_decode($response->getContent() ?: '[]', true);

        if ($response->getStatusCode() >= 400 || ! is_array($body)) {
            throw new HostApiException(is_array($body) && isset($body['message']) ? (string) $body['message'] : 'The host refused the request.', $response->getStatusCode());
        }

        return $body;
    }

    private function bind(Request $request): void
    {
        $this->app->instance('request', $request);
        Facade::clearResolvedInstance('request');
    }
}
