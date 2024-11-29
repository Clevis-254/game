import mongoose from 'mongoose'

const testSchema = new mongoose.Schema({
    testName: String
});


const testMongoSchema = mongoose.model('testMongoSchemaTEST', testSchema);
export default testMongoSchema;