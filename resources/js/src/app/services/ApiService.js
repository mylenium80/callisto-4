var NotificationService = require('services/NotificationService');
var WaitScreenService   = require('services/WaitScreenService');

module.exports = (function($)
{

    var _token;
    var _eventListeners = {};

    return {
        get     : _get,
        put     : _put,
        post    : _post,
        delete  : _delete,
        send    : _send,
        setToken: _setToken,
        getToken: _getToken,
        listen  : _listen
    };

    function _listen(event, handler)
    {
        _eventListeners[event] = _eventListeners[event] || [];
        _eventListeners[event].push(handler);
    }

    function _triggerEvent(event, payload)
    {
        if (!!_eventListeners[event])
        {
            for (var i = 0; i < _eventListeners[event].length; i++)
            {
                var listener = _eventListeners[event][i];
                if (typeof listener != "function")
                {
                    continue;
                }
                listener.call(null, payload);
            }
        }
    }

    function _get(url, data, config)
    {
        config        = config || {};
        config.method = 'GET';
        return _send(url, data, config);
    }

    function _put(url, data, config)
    {
        config        = config || {};
        config.method = 'PUT';
        return _send(url, data, config);
    }

    function _post(url, data, config)
    {
        config        = config || {};
        config.method = 'POST';
        return _send(url, data, config);
    }

    function _delete(url, data, config)
    {
        config        = config || {};
        config.method = 'DELETE';
        return _send(url, data, config);
    }

    function _send(url, data, config)
    {
        var deferred = $.Deferred();

        config                      = config || {};
        config.data                 = !!data ? JSON.stringify(data) : null;
        config.dataType             = config.dataType || 'json';
        config.contentType          = config.contentType || 'application/json';
        config.doInBackground       = !!config.doInBackground;
        config.supressNotifications = !!config.supressNotifications;

        if (!config.doInBackground)
        {
            WaitScreenService.showWaitScreen();
        }
        $.ajax(url, config)
            .done(function(response)
            {
                if (!config.supressNotifications)
                {
                    printMessages(response);
                }
                for (event in response.events)
                {
                    _triggerEvent(event, response.events[event]);
                }
                deferred.resolve(response.data || response);
            })
            .fail(function(jqXHR)
            {
                var response = !!jqXHR.responseText ? $.parseJSON(jqXHR.responseText) : {};
                if (!config.supressNotifications)
                {
                    printMessages(response);
                }
                deferred.reject(response.error);
            })
            .always(function()
            {
                if (!config.doInBackground)
                {
                    WaitScreenService.hideWaitScreen();
                }
            });

        return deferred;
    }

    function printMessages(response)
    {
        var notification;
        if (!!response.error && response.error.message.length > 0)
        {
            notification = NotificationService.error(response.error);
        }

        if (!!response.success && response.success.message.length > 0)
        {
            notification = NotificationService.success(response.success);
        }

        if (!!response.warning && response.warning.message.length > 0)
        {
            notification = NotificationService.warning(response.warning);
        }

        if (!!response.info && response.info.message.length > 0)
        {
            notification = NotificationService.info(response.info);
        }

        if (!!response.debug && response.debug.class.length > 0)
        {
            notification.trace(response.debug.file + '(' + response.debug.line + '): ' + response.debug.class);
            for (var i = 0; i < response.debug.trace.length; i++)
            {
                notification.trace(response.debug.trace[i]);
            }
        }
    }

    function _setToken(token)
    {
        this._token = token;
    }

    function _getToken()
    {
        return this._token;
    }

})(jQuery);
