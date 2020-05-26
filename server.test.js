const { MongoClient } = require('mongodb');

describe('insert', () => {
    let connection;
    let db;

    beforeAll(async () => {
        connection = await MongoClient.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        db = await connection.db();
    });

    afterAll(async () => {
        await connection.close();
    });

    //integration tests to test a user is inserted into the collection
    test('should insert a doc into collection', async () => {
        const users = db.collection('users');

        const mockUser = { _id: '69xD', name: 'Magnus' };
        await users.insertOne(mockUser);

        const insertedUser = await users.findOne({ _id: '69xD' });
        expect(insertedUser).toEqual(mockUser);
    });

    //integration test to see if the database can update variables in the user object
    test('should update a doc from a collection', async () => {
        const users = db.collection('users');
        
        await users.updateOne ({_id: '69xD'}, {$set: {name: 'Hans Erik'}});

        const updatedUser = await users.findOne({_id: '69xD'});
        expect(updatedUser.name).toEqual("Hans Erik");

    });
});