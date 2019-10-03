# backbone.msal
Microsoft Authentication Library (MSAL) for Backbone  
https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki
https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/FAQs

## Install

    $ npm install backbone.msal --save

## Usage

Derive your router from Backbone.MsalRouter instead from Backbone.Router and add your azure ad config.  
For information about the msal config see [https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications)

``` javascript
import Backbone from "backbone";
import  "backone.msal";

let mainRouting = Backbone.MsalRouter.extend({
    msalConfig: {
        auth: {
        	clientId: 'your_client_id'
        }, 
        cache: {
        },
        system: {
        },
        framework: {
        }
    },
    //extra before routing
    before: function (params, next) { return next(); },
    //extra after routing
    after: function () { },
    
    //continue normal setup for a router
    
```


### Calling protected endpoints
https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/README.md

```
framework: {
    protectedResourceMap : [
        [
            ['https://your_api_url',['Scope(s) defined in the azure portal']] 
        ]
    ]
}
```