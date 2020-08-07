//抽取mysqlhelper
const { MysqlHelper } = require('./MysqlHelper')
//创建表实例
const test = new MysqlHelper('test', 'testable')
//连接表
test.baseBegin();

//查询所有数据的demo
const findAllDemo = async () => {
    const data = await test.find({})
    console.log(data.data)
}
//查询name为lemon的demo
const findNameDemo = async () => {
    const data = await test.find({ name: 'lemon' })
    console.log(data.data)
}
//查询id为1的demo
const findId = async () => {
    const data = await test.findArrayById(1)
    console.log(data.data.name)
}
//插入name为test的demo
const insertTestDemo = async () => {
    const data = await test.insertOne({ name: 'test' })
    console.log(data.field)
}
//更新name为test的demo
const updateTestDemo = async () => {
    try {
        const findResource = await test.find({ name: "test" });
        console.log(findResource.data);
        // const data = await test.updateOne(findResource[0].id, { name: "newTest" });
        // console.log(data.field)
    }
    catch (e) {
        console.log(e)
    }
}
updateTestDemo()
