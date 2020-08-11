//抽取mysqlhelper
const { MysqlHelper } = require('./MysqlHelper')
//创建表实例
const test = new MysqlHelper('test', 'testable')
//连接表
test.baseBegin();

//查询所有数据的demo
const findAllDemo = async () => {
    try {
        const data = await test.find({})
        console.log(data.data)
    }
    catch (e) {
        console.log(e)
    }
}
//查询name为lemon的demo
const findNameDemo = async () => {
    try {
        const data = await test.find({ name: 'lemon' })
        console.log(data.data)
    }
    catch (e) {
        console.log(e)
    }
}
//查询id为1的demo
const findId = async () => {
    try {
        const data = await test.findArrayById(1)
        console.log(data.data.name)
    }
    catch (e) {
        console.log(e)
    }
}
//插入name为test的demo
const insertTestDemo = async () => {
    try {
        const data = await test.insertOne({ name: 'test' })
        console.log(data.field)
    }
    catch (e) {
        console.log(e)
    }
}
//更新name为test的demo
const updateTestDemo = async () => {
    try {
        const findResource = await test.find({ name: "test" });
        console.log(findResource.data[0].id);
        const data = await test.updateOne(findResource.data[0].id, { name: "newTest" });
        console.log(data)
    }
    catch (e) {
        console.log(e)
    }
}
const deleteTestDemo = async () => {
    try {
        const findResource = await test.find({ name: "test" });
        console.log(findResource.data[0].id);
        const data = await test.deleteOne(findResource.data[0].id);
        console.log(data)
    }

    catch (e) {
        console.log(e)
    }
}
insertTestDemo()
