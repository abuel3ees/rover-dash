import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\MessageController::store
* @see app/Http/Controllers/MessageController.php:16
* @route '/messaging/conversations/{conversation}/messages'
*/
export const store = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/messaging/conversations/{conversation}/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MessageController::store
* @see app/Http/Controllers/MessageController.php:16
* @route '/messaging/conversations/{conversation}/messages'
*/
store.url = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { conversation: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { conversation: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            conversation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        conversation: typeof args.conversation === 'object'
        ? args.conversation.id
        : args.conversation,
    }

    return store.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessageController::store
* @see app/Http/Controllers/MessageController.php:16
* @route '/messaging/conversations/{conversation}/messages'
*/
store.post = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MessageController::store
* @see app/Http/Controllers/MessageController.php:16
* @route '/messaging/conversations/{conversation}/messages'
*/
const storeForm = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MessageController::store
* @see app/Http/Controllers/MessageController.php:16
* @route '/messaging/conversations/{conversation}/messages'
*/
storeForm.post = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\MessageController::update
* @see app/Http/Controllers/MessageController.php:50
* @route '/messaging/conversations/{conversation}/messages/{message}'
*/
export const update = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/messaging/conversations/{conversation}/messages/{message}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\MessageController::update
* @see app/Http/Controllers/MessageController.php:50
* @route '/messaging/conversations/{conversation}/messages/{message}'
*/
update.url = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{message}', parsedArgs.message.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessageController::update
* @see app/Http/Controllers/MessageController.php:50
* @route '/messaging/conversations/{conversation}/messages/{message}'
*/
update.patch = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\MessageController::update
* @see app/Http/Controllers/MessageController.php:50
* @route '/messaging/conversations/{conversation}/messages/{message}'
*/
const updateForm = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MessageController::update
* @see app/Http/Controllers/MessageController.php:50
* @route '/messaging/conversations/{conversation}/messages/{message}'
*/
updateForm.patch = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\MessageController::destroy
* @see app/Http/Controllers/MessageController.php:74
* @route '/messaging/conversations/{conversation}/messages/{message}'
*/
export const destroy = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/messaging/conversations/{conversation}/messages/{message}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\MessageController::destroy
* @see app/Http/Controllers/MessageController.php:74
* @route '/messaging/conversations/{conversation}/messages/{message}'
*/
destroy.url = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{message}', parsedArgs.message.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessageController::destroy
* @see app/Http/Controllers/MessageController.php:74
* @route '/messaging/conversations/{conversation}/messages/{message}'
*/
destroy.delete = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\MessageController::destroy
* @see app/Http/Controllers/MessageController.php:74
* @route '/messaging/conversations/{conversation}/messages/{message}'
*/
const destroyForm = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MessageController::destroy
* @see app/Http/Controllers/MessageController.php:74
* @route '/messaging/conversations/{conversation}/messages/{message}'
*/
destroyForm.delete = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\MessagePinController::pin
* @see app/Http/Controllers/MessagePinController.php:14
* @route '/messaging/conversations/{conversation}/messages/{message}/pin'
*/
export const pin = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pin.url(args, options),
    method: 'post',
})

pin.definition = {
    methods: ["post"],
    url: '/messaging/conversations/{conversation}/messages/{message}/pin',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MessagePinController::pin
* @see app/Http/Controllers/MessagePinController.php:14
* @route '/messaging/conversations/{conversation}/messages/{message}/pin'
*/
pin.url = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return pin.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{message}', parsedArgs.message.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagePinController::pin
* @see app/Http/Controllers/MessagePinController.php:14
* @route '/messaging/conversations/{conversation}/messages/{message}/pin'
*/
pin.post = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pin.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MessagePinController::pin
* @see app/Http/Controllers/MessagePinController.php:14
* @route '/messaging/conversations/{conversation}/messages/{message}/pin'
*/
const pinForm = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: pin.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MessagePinController::pin
* @see app/Http/Controllers/MessagePinController.php:14
* @route '/messaging/conversations/{conversation}/messages/{message}/pin'
*/
pinForm.post = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: pin.url(args, options),
    method: 'post',
})

pin.form = pinForm

/**
* @see \App\Http\Controllers\MessageSearchController::search
* @see app/Http/Controllers/MessageSearchController.php:11
* @route '/messaging/conversations/{conversation}/search'
*/
export const search = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(args, options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/messaging/conversations/{conversation}/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MessageSearchController::search
* @see app/Http/Controllers/MessageSearchController.php:11
* @route '/messaging/conversations/{conversation}/search'
*/
search.url = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { conversation: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { conversation: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            conversation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        conversation: typeof args.conversation === 'object'
        ? args.conversation.id
        : args.conversation,
    }

    return search.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessageSearchController::search
* @see app/Http/Controllers/MessageSearchController.php:11
* @route '/messaging/conversations/{conversation}/search'
*/
search.get = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MessageSearchController::search
* @see app/Http/Controllers/MessageSearchController.php:11
* @route '/messaging/conversations/{conversation}/search'
*/
search.head = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MessageSearchController::search
* @see app/Http/Controllers/MessageSearchController.php:11
* @route '/messaging/conversations/{conversation}/search'
*/
const searchForm = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MessageSearchController::search
* @see app/Http/Controllers/MessageSearchController.php:11
* @route '/messaging/conversations/{conversation}/search'
*/
searchForm.get = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MessageSearchController::search
* @see app/Http/Controllers/MessageSearchController.php:11
* @route '/messaging/conversations/{conversation}/search'
*/
searchForm.head = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

search.form = searchForm

const messages = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    pin: Object.assign(pin, pin),
    search: Object.assign(search, search),
}

export default messages