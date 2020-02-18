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
