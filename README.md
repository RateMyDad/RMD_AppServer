# RMD_AppServer
To launch: npm run run

##**API Endpoint Descriptions**##

**/user/register**

Creates a user account. Returns the user account on successful creation.

Required body parameters:
```
{
  username: "my_username",
  password: "my_password"
}
```

**/user/login**

Currently just validates the password. Returns the user account on successful creation.

Required body parameters:
```
{
  username: "my_username",
  password: "my_password"
}
```

Sample user profile:
```
{
    "profile": {
        "parent_profile": "5e4c207e34338c6ea74c5480",
        "user_profile": null
    },
    "_id": "5e4c206d34338c6ea74c547f",
    "username": "my_username",
    "password": "$2b$10$L97CleHGzojdcb409Yg.5uo9qwbNoacIpdpt9NgsGmwA65sLbDtnC",
    "__v": 0
}
```

**/dad_profile/create**

Creates a new dad profile. You must have a user account to do this, and you can only create a profile for your dad (not yourself). Links the dad profile to the user account.
Returns the new dad profile upon successful creation.

Required body parameters:
```
{
  "username": "my_username",
	"name" : {

		"first" : "John",
		"last": "Doe"

	}
}
```
