# Repository to test different forms
This repository provides simple HTTP server that handles 4 different endpoints for different type of forms.

## Requirements
`node` >= 16.0.0, `npm`

## Usage
```
# install dependencies
npm i

# run server on localhost:3000
npm run server
```

## Server Specifications
`POST` requests only allowed with `Content-Type: application/json`.

## Errors
### 400 / Bad Request
#### Wrong Request Format
Payload:
```
{
    "errors": string[]
}
```
Example:
```
{
    "errors": [ "Content-type 'application/x-www-form-urlencode' is not supported." ]
}
```

#### Validation Errors
Payload:
```
{
    "errors": [field: string, messages: string[]][]
}
```
Example:
```
{
    "errors": [ 
        "Query", 
        [ 
            "Query must contain only letters, numbers and spaces.", "Query must be at least 2 characters long." 
        ]
    ]
}
```

### 404 / Not Found
Payload:
```
{
    errors: [ "Route '{$path}' not found." ]
}
```

### 405 / Not Allowed
Payload:
```
{
    errors: [ "Method '{$method}' is not allowed for route '{$path}'." ]
}
```

### 500 / Server Error
Payload:
```
{}
```
or
```
{
    errors: string[]
}
```

## Endpoints
### GET `/search`
#### Query params schema
| Field | Type | Required | Format |
| ----- | ---- | -------- | ------ |
| `query` | `zod.string` | y | /^([a-z0-9]+(| )){2,}$/i |

#### Success
Status: `200`

Payload:
```
{
    data: string[]
}
```

### POST `/sign-up`
#### Body schema
| Field | Type | Required | Format |
| ----- | ---- | -------- | ------ |
| `email` | `string` | y | `zod.email` |
| `password` | `string` | y | /^(?=.*[a-z])(?=.*\d)[a-z\d]{8,}$/i |
| `confirm` | `string` | y | equals to `password` |

#### Success
Status: `200`

Payload:
```
{
    data: {
        user_id: number
    }
}
```

### POST `/pay`
#### Body schema
| Field | Type | Required | Format |
| ----- | ---- | -------- | ------ |
| `name` | `string` | y | /^([a-z]+(| ))+$/i |
| `number` | `string` | y | /^([\d]{4}(| )){4}$/ |
| `expiry` | `zod.date` | y | at least *tomorrow* |
| `code` | `number` | y | `100 <= x <= 999` |

#### Success
Status: `200`

Payload:
```
{
    data: {
        payment_id: number
    }
}
```

### POST `/deliver`
#### Body schema
| Field | Type | Required | Format |
| ----- | ---- | -------- | ------ |
| `name` | `string` | y | /^([a-z]+(| ))+$/i |
| `address` | `string` | y | /^[a-z0-9\,\.]+$/ |
| `zip` | `string` | y | /[\d]{,6}/ |
| `city` | `string` | y | /^[a-z \-\'\.]+$/i |
| `country` | `string` | y | /^[a-z \-\'\.]+$/i |

#### Success
Status: `200`

Payload:
```
{
    data: {
        delivery_id: number
    }
}
```