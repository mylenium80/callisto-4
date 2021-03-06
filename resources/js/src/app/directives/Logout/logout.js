var ApiService          = require('services/ApiService');
var NotificationService = require('services/NotificationService');

Vue.directive('logout', function()
{

    $(this.el).click(
        function(e)
        {
            ApiService.get("/rest/customer/logout")
                .done(
                    function(response)
                    {
                        NotificationService.success('Sie wurden erfolgreich ausgeloggt').closeAfter(3000);

                        // remove address ids from session after logout
                        ApiService.post('/rest/customer/address_selection/0/?typeId=-1')
                            .fail(function(e)
                            {
                                console.warn(e);
                            });
                    }
                );

            e.preventDefault();

        }.bind(this));

});
