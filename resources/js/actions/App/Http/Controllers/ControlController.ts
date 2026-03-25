import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ControlController::index
* @see app/Http/Controllers/ControlController.php:15
* @route '/control'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/control',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ControlController::index
* @see app/Http/Controllers/ControlController.php:15
* @route '/control'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ControlController::index
* @see app/Http/Controllers/ControlController.php:15
* @route '/control'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ControlController::index
* @see app/Http/Controllers/ControlController.php:15
* @route '/control'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ControlController::index
* @see app/Http/Controllers/ControlController.php:15
* @route '/control'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ControlController::index
* @see app/Http/Controllers/ControlController.php:15
* @route '/control'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ControlController::index
* @see app/Http/Controllers/ControlController.php:15
* @route '/control'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\ControlController::sendCommand
* @see app/Http/Controllers/ControlController.php:43
* @route '/control/command'
*/
export const sendCommand = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendCommand.url(options),
    method: 'post',
})

sendCommand.definition = {
    methods: ["post"],
    url: '/control/command',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ControlController::sendCommand
* @see app/Http/Controllers/ControlController.php:43
* @route '/control/command'
*/
sendCommand.url = (options?: RouteQueryOptions) => {
    return sendCommand.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ControlController::sendCommand
* @see app/Http/Controllers/ControlController.php:43
* @route '/control/command'
*/
sendCommand.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendCommand.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ControlController::sendCommand
* @see app/Http/Controllers/ControlController.php:43
* @route '/control/command'
*/
const sendCommandForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendCommand.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ControlController::sendCommand
* @see app/Http/Controllers/ControlController.php:43
* @route '/control/command'
*/
sendCommandForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendCommand.url(options),
    method: 'post',
})

sendCommand.form = sendCommandForm

const ControlController = { index, sendCommand }

export default ControlController