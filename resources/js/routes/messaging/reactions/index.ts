import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\MessageReactionController::store
* @see app/Http/Controllers/MessageReactionController.php:15
* @route '/messaging/conversations/{conversation}/messages/{message}/reactions'
*/
export const store = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/messaging/conversations/{conversation}/messages/{message}/reactions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MessageReactionController::store
* @see app/Http/Controllers/MessageReactionController.php:15
* @route '/messaging/conversations/{conversation}/messages/{message}/reactions'
*/
store.url = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            conversation: args[0],
            message: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        conversation: typeof args.conversation === 'object'
        ? args.conversation.id
        : args.conversation,
        message: typeof args.message === 'object'
        ? args.message.id
        : args.message,
    }

    return store.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{message}', parsedArgs.message.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessageReactionController::store
* @see app/Http/Controllers/MessageReactionController.php:15
* @route '/messaging/conversations/{conversation}/messages/{message}/reactions'
*/
store.post = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MessageReactionController::store
* @see app/Http/Controllers/MessageReactionController.php:15
* @route '/messaging/conversations/{conversation}/messages/{message}/reactions'
*/
const storeForm = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MessageReactionController::store
* @see app/Http/Controllers/MessageReactionController.php:15
* @route '/messaging/conversations/{conversation}/messages/{message}/reactions'
*/
storeForm.post = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

const reactions = {
    store: Object.assign(store, store),
}

export default reactions