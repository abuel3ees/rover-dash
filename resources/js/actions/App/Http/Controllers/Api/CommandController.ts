import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
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

const CommandController = { complete }

export default CommandController