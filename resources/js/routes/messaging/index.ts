import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import conversations from './conversations'
import messages from './messages'
import reactions from './reactions'
import users from './users'
/**
* @see \App\Http\Controllers\ConversationController::index
* @see app/Http/Controllers/ConversationController.php:14
* @route '/messaging'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/messaging',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConversationController::index
* @see app/Http/Controllers/ConversationController.php:14
* @route '/messaging'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConversationController::index
* @see app/Http/Controllers/ConversationController.php:14
* @route '/messaging'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ConversationController::index
* @see app/Http/Controllers/ConversationController.php:14
* @route '/messaging'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ConversationController::index
* @see app/Http/Controllers/ConversationController.php:14
* @route '/messaging'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ConversationController::index
* @see app/Http/Controllers/ConversationController.php:14
* @route '/messaging'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ConversationController::index
* @see app/Http/Controllers/ConversationController.php:14
* @route '/messaging'
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

const messaging = {
    index: Object.assign(index, index),
    conversations: Object.assign(conversations, conversations),
    messages: Object.assign(messages, messages),
    reactions: Object.assign(reactions, reactions),
    users: Object.assign(users, users),
}

export default messaging