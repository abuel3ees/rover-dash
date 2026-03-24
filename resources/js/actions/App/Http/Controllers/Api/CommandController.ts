import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\CommandController::pending
* @see app/Http/Controllers/Api/CommandController.php:14
* @route '/api/commands/pending'
*/
export const pending = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(options),
    method: 'get',
})

pending.definition = {
    methods: ["get","head"],
    url: '/api/commands/pending',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CommandController::pending
* @see app/Http/Controllers/Api/CommandController.php:14
* @route '/api/commands/pending'
*/
pending.url = (options?: RouteQueryOptions) => {
    return pending.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CommandController::pending
* @see app/Http/Controllers/Api/CommandController.php:14
* @route '/api/commands/pending'
*/
pending.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\CommandController::pending
* @see app/Http/Controllers/Api/CommandController.php:14
* @route '/api/commands/pending'
*/
pending.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pending.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\CommandController::pending
* @see app/Http/Controllers/Api/CommandController.php:14
* @route '/api/commands/pending'
*/
const pendingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: pending.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\CommandController::pending
* @see app/Http/Controllers/Api/CommandController.php:14
* @route '/api/commands/pending'
*/
pendingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: pending.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\CommandController::pending
* @see app/Http/Controllers/Api/CommandController.php:14
* @route '/api/commands/pending'
*/
pendingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: pending.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

pending.form = pendingForm

/**
* @see \App\Http\Controllers\Api\CommandController::complete
* @see app/Http/Controllers/Api/CommandController.php:39
* @route '/api/commands/{command}/complete'
*/
export const complete = (args: { command: number | { id: number } } | [command: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: complete.url(args, options),
    method: 'patch',
})

complete.definition = {
    methods: ["patch"],
    url: '/api/commands/{command}/complete',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Api\CommandController::complete
* @see app/Http/Controllers/Api/CommandController.php:39
* @route '/api/commands/{command}/complete'
*/
complete.url = (args: { command: number | { id: number } } | [command: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { command: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { command: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            command: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        command: typeof args.command === 'object'
        ? args.command.id
        : args.command,
    }

    return complete.definition.url
            .replace('{command}', parsedArgs.command.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CommandController::complete
* @see app/Http/Controllers/Api/CommandController.php:39
* @route '/api/commands/{command}/complete'
*/
complete.patch = (args: { command: number | { id: number } } | [command: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: complete.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Api\CommandController::complete
* @see app/Http/Controllers/Api/CommandController.php:39
* @route '/api/commands/{command}/complete'
*/
const completeForm = (args: { command: number | { id: number } } | [command: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: complete.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\CommandController::complete
* @see app/Http/Controllers/Api/CommandController.php:39
* @route '/api/commands/{command}/complete'
*/
completeForm.patch = (args: { command: number | { id: number } } | [command: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: complete.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

complete.form = completeForm

const CommandController = { pending, complete }

export default CommandController