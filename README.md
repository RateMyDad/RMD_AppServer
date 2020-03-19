# RMD_AppServer

To launch (UNIX): npm run run
To launch (Windows): npm run runwindows

##**Dad Profile Schema **##

```{

  name: {
    first: String,
    last: String
  },

  skills: {
    grilling: Number,
    cooking: Number,
    bags: Number,
    golf: Number,
    softball: Number,
    coaching: Number,
    generosity: Number,
    looks: Number,
    dad_factor: Number,
    fantasy_football: Number,
    humor: Number,
    emotional_stability: Number,
    handiness: Number,
    kids: Number,
    stealth_food_preparation: Number,
    tech: Number,
    furniture_assembly: Number,
    photography: Number
  },

  location: {
    country: String,
    region: String
  },

  meta: {
    rating: Number,
    skillScore: Number
  }
}
```


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
    "_id": "5e4c206d34338c6ea7  4c547f",
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

	},

	"skills" : {
    "grilling": 3,
    "cooking": 3,
    "bags": 3,
    "softball": 3,
    "coaching": 3,
    "generosity": 3,
    "looks": 3,
    "dad_factor": 3,
    "fantasy_football": 3,
    "humor": 3,
    "emotional_stability": 3,
    "handiness": 3,
    "kids": 3,
    "stealth_food_preparation": 3,
    "tech": 3,
    "furniture_assembly": 3,
    "photography": 3
	}

}
```
