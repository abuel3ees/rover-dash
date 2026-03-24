import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\ControlController::command
* @see app/Http/Controllers/ControlController.php:43
* @route '/control/command'
*/
export const command = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: command.url(options),
    method: 'post',
})

command.definition = {
    methods: ["post"],
    url: '/control/command',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ControlController::command
* @see app/Http/Controllers/ControlController.php:43
* @route '/control/command'
*/
command.url = (options?: RouteQueryOptions) => {
    return command.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ControlController::command
* @see app/Http/Controllers/ControlController.php:43
* @route '/control/command'
*/
command.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: command.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ControlController::command
* @see app/Http/Controllers/ControlController.php:43
* @route '/control/command'
*/
const commandForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: command.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ControlController::command
* @see app/Http/Controllers/ControlController.php:43
* @route '/control/command'
*/
commandForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: command.url(options),
    method: 'post',
})

command.form = commandForm

const control = {
    command: Object.assign(command, command),
}

export default control