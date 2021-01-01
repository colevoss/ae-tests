# Playlist API
Manages playlists for things

## Version: 0.1.9

### /tracks

#### GET
##### Summary:

Find pets by ID

##### Description:

Returns pets based on ID

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | pet response |

### /playlists

#### GET
##### Summary:

Get all playlists

##### Description:

Returns All Playlists

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Playlists Response |

#### POST
##### Summary:

Create a new playlist

##### Description:

Create a playlist

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Playlists Response |

### /playlists/{id}

#### GET
##### Summary:

Get all playlists

##### Description:

Returns a playlist with the id provided

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Playlists Response |
| 404 | No found |
