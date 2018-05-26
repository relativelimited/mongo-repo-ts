# A Repository Implementation in TypeScript for MongoDB

# Installation
```
npm install mongo-repo-ts --save
```

## Getting Started
#### Configuration
If you're going to use the built-in sequential IDs, you'll need to create a collection in your MongoDB database called 
`ids`.

### Defining a Document Type
You can extend the existing `RepositoryDocument` type, which looks like:
```
_id: string;
created: string; // ISO date/time
``` 
For example, might extend this into a `BlogPostDocument` like this:
```typescript
interface BlogPostDocument extends RepositoryDocument {
    title: string;
    body: string;
    author: string;
    comments: Array<BlogPostComment>;
}
```
### Extending the Repository
Next step is to extend the `Repository`, this is the best way to reuse the repo without having to specify the 
Collection name and Document Type each time.
```typescript
class BlogPostRepository extends Repository<BlogPostDocument>
{
    constructor()
    {
        super({
            collectionName: 'blogposts',
            modelRef: 'com.example.blog.post',
            mongoDBConnectionURI: 'mongodb://localhost:27017/my_db',
            mongoDBDatabase: 'my_db',
            increments: true,
        });
    }
}
```
Note the parameters passed in the options to the parent constructor are:
- Collection Name - the name of the MongoDB collection where your documents are stored
- Model Reference - a unique namespace for this type of document
- Mongo DB connection string
- Mongo DB database name
- Whether or not to use sequential model IDs instead of Mongo's built-in ObjectID

I highly recommend you set your connection URI using environment variables to ensure your password is not stored in 
code.

The repository will automatically generate sequential IDs for you when you create documents without an ID. If you'd 
rather use MongoDB's built-in ObjectIDs then set this to false;

## Using your Repository
In your code:
```typescript
const repo = new BlogPostRepository();
```

## List all Documents
```typescript
repo.getAll().then( items => {
   // Do something with all the items 
}).catch (error => {
    // handle error
});
```
## Get a Document by ID
```typescript
repo.getByID('123').then( document => {
    // Do something with the document
}).catch(error => {
    // handle error
});
```

## Update a Document
```typescript
repo.save(document).then( document => {
    // The document that was saved is returned
}).catch( error => {
    // handle error
});
```
## Delete a Document
```typescript
repo.delete('123').then( result => {
    // Result is true if found & deleted
}).catch( error => {
    // Record was not found
});
```
